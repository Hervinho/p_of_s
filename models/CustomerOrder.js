const connection = require('../config/connection');
const moment = require('moment');
const Shift = require('./Shift');
const Audit = require('./Audit');

//Function to build query string for order details.
let buildOrderDetailsQuery = (productsArray, customerOrderId) => {
    let string = '';
    for (let index = 0; index < productsArray.length; index++) {
        if (index == productsArray.length - 1) {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_size_id + ", " +
                productsArray[index].topping_id + ", " +
                productsArray[index].base_type_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + ")";
        } else {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_size_id + ", " +
                productsArray[index].topping_id + ", " +
                productsArray[index].base_type_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + "),";
        }
    }

    return string;
};

//Function to insert card payment details.
let saveBankCardDetails = (orderId, cardObj, callback) => {
    let feedback, output = {}, query = "INSERT INTO card_payment VALUES(?,?,?,?,?,?)";
    let accTypeId = cardObj.account_type_id, cardNumber = cardObj.card_number, cardHolder = cardObj.card_holder, 
        validity = cardObj.validity;

    connection.acquire((err, con) => {
        if (err) {
            output = { status: 100, message: "Error in connection database" };
            callback(null, output);
        }

        con.query(query, [null, orderId, accTypeId, cardNumber, cardHolder, validity], (err, result) => {
          con.release();
          if (err) {
            feedback = 'Error inserting card ingo';
            output = {
                status: 0,
                message: feedback,
                error: err
              };
              callback(null, output);
          } else {
            feedback = 'Card successfully inserted';
            output = {
              status: 1,
              message: feedback
            };
            callback(null, output);
          }
        });
      });
};

//Function to  insert product order.
let createCustomerOrder = (customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId,
    addedBy, collectionStatusId, insertOrder, insertOrderDetails, productsArray, bankCardObj, callback) => {
    let feedback, output = {}, saveCardDetails;

    connection.acquire((err, con) => {
        con.query(insertOrder, [customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId, addedBy, collectionStatusId], (err, result) => {
            con.release();
            if (!!err) {
                console.log(err);
                feedback = 'Error creating order.';
                output = {
                    status: 0,
                    message: feedback
                };
                callback(null, output);
            } else {
                insertedOrderID = result.insertId;
                console.log('OrderID: ', insertedOrderID);

                //card details will be handled here. if payment type = card.
                console.log('bankCardObj: ', bankCardObj);
                if(undefined != bankCardObj || bankCardObj != null){
                    saveCardDetails = saveBankCardDetails(insertedOrderID, bankCardObj, (error, results) => {
                        console.log(error || results.message);
                    });
                }

                //Building order details query that will be excuted once.
                let builtQueryString = buildOrderDetailsQuery(productsArray, insertedOrderID);
                insertOrderDetails += builtQueryString;
                //console.log('Order details query: ', insertOrderDetails);

                //Now insert order details in DB.
                connection.acquire((err, con) => {
                    con.query(insertOrderDetails, (err, result) => {
                        con.release();
                        if (err) {
                            console.log(err);
                            feedback = 'Error while submitting customer order.';
                            output = {
                                status: 0,
                                message: feedback
                            };
                            callback(null, output);
                        } else {
                            feedback = 'Customer order successfully inserted.';
                            output = {
                                status: 1,
                                message: feedback,
                                order_id: insertedOrderID
                            };
                            callback(null, output);
                        }
                    });
                });
            }

        });
    });

};

//Function to Get grand total amount of all orders (where payment_status_id = 1) in previous shift.
//Can also be used to get total from any given shift, providing start end time.
let getPreviousShiftTotal = (start, end, callback) => {
    let feedback, output = {};
    let query = "SELECT SUM(total_amount) AS grand_total FROM customer_order WHERE customer_order_timestamp BETWEEN '" + 
        start + "' AND '" + end + "' AND payment_status_id = 1";

        connection.acquire((err, con) => {
            if (err) {
                output = {
                    status: 100,
                    message: "Error connecting to database"
                };
                
                callback(null, output);
            }

            con.query(query, (err, result) => {
                con.release();
                
                if (err) {
                    output = {
                        status: 0,
                        message: "total cash amount of all orders in previous shift",
                        error: err
                    };
                    
                    callback(null, output);
                } else {
                    console.log('Total cash from previous shift successfully retrieved');
                    output = {
                        status: 1,
                        message: "Total cash successfully retrieved",
                        total: result[0].grand_total
                    };
                    //console.log('getPreviousShiftTotal: ', result[0].grand_total);
                    callback(null, output);
                }
            });
        });
};

//count number of orders in current shift.
let countOrdersInCurrentShift = (start, end, callback) => {
    let feedback, output = {};
    let query = "SELECT * FROM customer_order WHERE customer_order_timestamp BETWEEN ? AND ?";
    console.log(start + ' - ' + end);
        connection.acquire((err, con) => {
            if (err) {
                output = {
                    status: 100,
                    message: "Error in connection database"
                };
                
                callback(null, output);
            }

            con.query(query, [start, end], (err, result) => {
                con.release();
                
                if (err) {
                    output = {
                        status: 0,
                        message: "Error getting all orders in current shift",
                        error: err
                    };
                    
                    callback(null, output);
                } else {
                    console.log('Orders in current shift: ', result.length);
                    output = {
                        status: 1,
                        message: 'Total number of orders in current shift retrieved',
                        count: result.length
                    };
                    //console.log('getPreviousShiftTotal: ', result[0].grand_total);
                    callback(null, output);
                }
            });
        });
};

function CustomerOrder() {
    //get all customer orders.
    this.getAll = (res) => {
        let output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_orders: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No orders found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all customer orders that are new. Will be sent to the kitchen.
    this.getAllNewToBePrepared = (res) => {
        let output = {}, today = moment().format("YYYY-MM-DD"),
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN customer_order_status ON customer_order.order_status_id = customer_order_status.customer_order_status_id ' +
            'WHERE (customer_order.order_status_id = 1 OR customer_order.order_status_id = 2) AND customer_order_timestamp LIKE ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            today = '%' + today + '%';

            con.query(query, [today], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_orders: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No new orders found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all customer orders that are ready for collection.
    this.getAllReadyForCollection = (res) => {
        let output = {}, today = moment().format("YYYY-MM-DD"),
            query = 'SELECT * FROM customer_order ' +
            'LEFT JOIN customer_order_status ON customer_order.order_status_id = customer_order_status.customer_order_status_id ' +
            'WHERE customer_order.order_status_id = 3 AND customer_order_timestamp LIKE ? ' +
            'AND customer_order.collection_status_id = 2 ' +
            'ORDER BY customer_order_timestamp DESC';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            today = '%' + today + '%';

            con.query(query, [today], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            ready_orders: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No orders ready for collection was found.'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all orders of a specific customer.
    this.getAllPerCustomer = (customerId, res) => {
        let output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
                'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +    
                'WHERE customer_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [customerId], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_orders: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No orders found for this customer'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };


    //count all orders of a specific payment type.
    this.countAllByPaymentType = (paymentTypeId, res) => {
        let output = {},
            query = 'SELECT COUNT(*) AS ordersCountPaymentType FROM customer_order WHERE payment_type_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [paymentTypeId], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders captured by a certain employee.
    this.countAllPerEmployee = (employeeId, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountEmployee FROM customer_order WHERE added_by = ?';
        let shiftCallback, shiftTimes;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [employeeId], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders per specific product AND date.
    this.countAllPerProductAndDate = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProduct FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'WHERE customer_order_details.product_id = ? AND customer_order.customer_order_timestamp LIKE ?';
        let productId = orderObj.product_id, date = orderObj.date;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            date = '%' + date + '%';

            con.query(query, [productId, date], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders per specific product AND date range. From - to
    this.countAllPerProductAndDateRange = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProduct FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'WHERE customer_order_details.product_id = ? AND customer_order.customer_order_timestamp BETWEEN ? AND ?';
        let productId = orderObj.product_id, date_from = orderObj.date_from, date_to = orderObj.date_to;
        
        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            date_from = moment(date_from + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
            date_to = moment(date_to + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");
            //console.log(date_from, date_to);

            con.query(query, [productId, date_from, date_to], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders per specific product TYPE and date.
    this.countAllPerProductTypeAndDate = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProductType FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'LEFT JOIN product ON product.product_id = customer_order_details.product_id ' +
            'WHERE product.product_type_id = ? AND customer_order.customer_order_timestamp LIKE ?';
        let productTypeId = orderObj.product_type_id, date = orderObj.date;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            date = '%' + date + '%';

            con.query(query, [productTypeId, date], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders per specific product TYPE and date range. From - to.
    this.countAllPerProductTypeAndDateRange = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProductType FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'LEFT JOIN product ON product.product_id = customer_order_details.product_id ' +
            'WHERE product.product_type_id = ? AND customer_order.customer_order_timestamp BETWEEN ? AND ?';
        let productTypeId = orderObj.product_type_id, date_from = orderObj.date_from, date_to = orderObj.date_to;
        
        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            date_from = moment(date_from + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
            date_to = moment(date_to + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");
            //console.log(date_from, date_to);

            con.query(query, [productTypeId, date_from, date_to], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //count all orders per specific product AND date AND shift. WILL NOT BE NEEDED
    this.countAllPerProductAndDateWithShift = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProduct FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'WHERE customer_order_details.product_id = ? AND customer_order.customer_order_timestamp BETWEEN ? AND ?',
            queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?';
        let productId = orderObj.product_id, date = orderObj.date, shiftId = orderObj.shift_id;
        let start, end;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(queryFindShift, [shiftId], (errShift, resultShift) => {
                con.release();
                if (errShift) {
                    res.json(errShift);
                } else {
                    console.log(resultShift.length);
                    if(resultShift.length > 0){
                        let start = moment(date + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                        let end = moment(date + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                        console.log(start, end);

                        connection.acquire((err, con) => {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error in connection database"
                                });
                                return;
                            }
                
                            con.query(query, [productId, start, end], (errCount, resultCount) => {
                                con.release();
                                if (errCount) {
                                    res.json(errCount);
                                    return;
                                } else {
                                    console.log(resultCount);
                                    res.json(resultCount);
                                    return;
                                }
                            });
                        });
                    }
                    else{
                        output = {
                            status: 0,
                            message: 'No such shift found'
                        };

                        res.json(output);
                        return;
                    }
                }
            });
        });
    };

    //count all orders per specific product TYPE and date AND shift. WILL NOT BE NEEDED
    this.countAllPerProductTypeAndDateWithShift = (orderObj, res) => {
        let output = {}, query = 'SELECT COUNT(*) AS orderCountProductType FROM customer_order ' +
            'LEFT JOIN customer_order_details ON customer_order.customer_order_id = customer_order_details.customer_order_id ' +
            'LEFT JOIN product ON product.product_id = customer_order_details.product_id ' +
            'WHERE product.product_type_id = ? AND customer_order.customer_order_timestamp BETWEEN ? AND ?',
            queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?';
        let productTypeId = orderObj.product_type_id, date = orderObj.date, shiftId = orderObj.shift_id;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(queryFindShift, [shiftId], (errShift, resultShift) => {
                con.release();
                if (errShift) {
                    res.json(errShift);
                    return;
                } else {
                    //res.json(result);
                    if(resultShift.length > 0){
                        let start = moment(date + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                        let end = moment(date + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                        console.log(start, end);

                        connection.acquire((err, con) => {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error in connection database"
                                });
                                return;
                            }
                
                            con.query(query, [productTypeId, start, end], (errCount, resultCount) => {
                                con.release();
                                if (errCount) {
                                    res.json(errCount);
                                    return;
                                } else {
                                    console.log(resultCount);
                                    res.json(resultCount);
                                    return;
                                }
                            });
                        });
                    }
                    else{
                        output = {
                            status: 0,
                            message: 'No such shift found'
                        };

                        res.json(output);
                        return;
                    }
                }
            });
        });
    };

    //get a specific order.
    this.getOne = (orderId, res) => {
        let output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
                'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +
                'WHERE customer_order_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [orderId], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_order: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such order found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific order, along with its items and employee who placed it.
    this.getOneWithDetails = (id, res) => {
        let output = {},
            orderDetails = [];
        let query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +
            'WHERE customer_order_id = ?',
            queryDetails = 'SELECT * FROM customer_order_details ' +
            'LEFT JOIN product ON customer_order_details.product_id = product.product_id ' +
            'LEFT JOIN product_size ON customer_order_details.product_size_id = product_size.product_size_id ' +
            'LEFT JOIN topping ON customer_order_details.topping_id = topping.topping_id ' +
            'LEFT JOIN base_type ON customer_order_details.base_type_id = base_type.base_type_id ' +
            'WHERE customer_order_id = ?'

        connection.acquire((err, con) => {
            if (err) {
                output = {
                    status: 100,
                    message: "Error connecting to database"
                };

                res.json(output);
                return;
            }

            con.query(query, [id], (err, result) => {
                con.release();
                if (err) {
                    output = {
                        status: 0,
                        message: 'Error getting customer order.',
                        error,
                        err
                    };

                    res.json(output);
                    return;
                } else {
                    if (result.length > 0) {

                        connection.acquire((err, con) => {
                            if (err) {
                                output = {
                                    status: 100,
                                    message: "Error connecting to database"
                                };

                                res.json(output);
                                return;
                            }

                            con.query(queryDetails, [id], (errDetails, resultDetails) => {
                                con.release();
                                if (errDetails) {
                                    output = {
                                        status: 0,
                                        message: 'Error getting promotion products',
                                        customer_order: result[0],
                                        customer_order_details: null,
                                        error: errDetails
                                    };

                                    res.json(output);
                                    return;

                                } else {
                                    //console.log('Res: ', resultDetails);
                                    if (resultDetails.length > 0) {
                                        output = {
                                            status: 1,
                                            customer_order: result[0],
                                            customer_order_details: resultDetails
                                        };
                                    } else {
                                        output = {
                                            status: 1,
                                            customer_order: result[0],
                                            customer_order_details: null
                                        };
                                    }

                                    res.json(output);
                                    return;
                                }
                            });
                        });

                    } else {
                        output = {
                            status: 0,
                            message: 'No such customer order found'
                        };

                        res.json(output);
                        return;
                    }

                }
            });
        });
    };

    //get total amount from orders in a previous shift (from current datetime)
    this.getTotalAmountFromPreviousShift = (res) => {
        let current_time = moment().format("HH:mm:ss");
        let queryGetShift = "SELECT * FROM shift WHERE shift_start_time < '" + current_time + "' AND shift_end_time < '" + 
            current_time + "'";
        let previous_shift, base_date, base_start_time, base_end_time;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(queryGetShift, (err, resultShift) => {
                con.release();
                if (err) {
                    output = {
                        status: 0,
                        message: "Error getting shift",
                        error: err
                    };

                    res.json(output);
                    return;
                } else {
                    let shiftArraySize = resultShift.length;

                    if (shiftArraySize > 0) {
                        if(shiftArraySize == 1){
                            previous_shift = resultShift[0];
                        }
                        else{
                            //take the latest shift.
                            previous_shift = resultShift[shiftArraySize - 1];
                        }
                        
                        //If previous shift is Night shift (16h-23h), employee starting at/after midnight.
                        //Then use previous date as base_date (because before 12.00 AM is yesterday), else today.
                        if(previous_shift.shift_id == 3){
                            base_date = moment().add(-1, 'day').format('YYYY-MM-DD');
                        }
                        else{
                            base_date = moment().format("YYYY-MM-DD");
                        }

                        base_start_time = moment(base_date + " " + previous_shift.shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                        base_end_time = moment(base_date + " " + previous_shift.shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                        console.log(base_start_time, base_end_time);

                        //Get grand total cash amount of all orders in previous shift.
                        getPreviousShiftTotal(base_start_time, base_end_time, (error, resultTotal) => {
                            
                            if(error){
                                res.json({
                                    status: 0,
                                    message: error.message,
                                    err: error.error
                                });
                                return;
                            }
                            else{
                                if(resultTotal.total === null){
                                    output = {
                                        status: 0,
                                        message: "No orders were placed in previous shift",
                                        shift_name: previous_shift.shift_name,
                                        shift_start: base_start_time,
                                        shift_end: base_end_time
                                    };
                                }
                                else{
                                    output = {
                                        status: 1,
                                        message: resultTotal.message,
                                        total: resultTotal.total,
                                        shift_name: previous_shift.shift_name,
                                        shift_start: base_start_time,
                                        shift_end: base_end_time
                                    };
                                }
                                
                                res.json(output);
                                return;
                            }
                        });
                        
                    } else {
                        output = {
                            status: 0,
                            message: 'No such shift found found'
                        };
                        res.json(output);
                        return;
                    }
                    
                }
            });
        });
    };

    //get total amount from orders of a specific date AND shift. For End of day report
    this.getTotalAmountFromDateAndShift = (orderObj, res) => {
        let output = {}, date_from, date_to, queryShift = 'SELECT * FROM shift WHERE shift_id = ?';
        let shift_id = orderObj.shift_id;
        let date = orderObj.date;
        //let today = moment().format("YYYY-MM-DD");//in case only getting stuff from current date.

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(queryShift, [shift_id], (errShift, resultShift) => {
                con.release();
                if (errShift) {
                    output = {
                        status: 0,
                        message: 'Error getting shift data',
                        message: errShift
                    };

                    res.json(output);
                    return;
                } else {
                    
                    date_from = moment(date + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                    date_to = moment(date + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");

                    //in case only getting stuff from current date.
                    /*date_from = moment(today + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                    date_to = moment(today + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");*/

                    console.log('From: ' + date_from, 'To: ' + date_to);
                    //Get grand total cash amount of all orders in previous shift.
                    getPreviousShiftTotal(date_from, date_to, (errorTotal, resultTotal) => {

                        if (errorTotal) {
                            res.json({
                                status: 0,
                                message: errorTotal.message,
                                err: errorTotal.error
                            });
                            return;
                        } else {
                            if (resultTotal.total === null) {
                                output = {
                                    status: 0,
                                    message: "No orders were placed on this day",
                                    total: resultTotal.total
                                };
                            } else {
                                output = {
                                    status: 1,
                                    message: resultTotal.message,
                                    total: resultTotal.total
                                };
                            }

                            res.json(output);
                            return;
                        }
                    });
                }
            });
        });
    };

    //get total amount from orders of a specific date. For End of day report
    this.getTotalAmountFromDate = (date, res) => {
        let output = {},
            date_from, date_to;
        //let today = moment().format("YYYY-MM-DD");//in case only getting stuff from current date.

        date_from = moment(date + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
        date_to = moment(date + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");

        //in case only getting stuff from current date.
        /*date_from = moment(today + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
        date_to = moment(today + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");*/

        //Get grand total cash amount of all orders in previous shift.
        getPreviousShiftTotal(date_from, date_to, (errorTotal, resultTotal) => {

            if (errorTotal) {
                res.json({
                    status: 0,
                    message: errorTotal.message,
                    err: errorTotal.error
                });
                return;
            } else {
                if (resultTotal.total === null) {
                    output = {
                        status: 0,
                        message: "No orders were placed on this day",
                        total: resultTotal.total
                    };
                } else {
                    output = {
                        status: 1,
                        message: resultTotal.message,
                        total: resultTotal.total
                    };
                }

                res.json(output);
                return;
            }
        });
    };

    //get all orders of a specific date. End of day report.
    this.getAllPerDate = (date, res) => {
        let output = {}, date_from, date_to, 
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +    
            'WHERE customer_order_timestamp BETWEEN ? AND ?';
        //let today = moment().format("YYYY-MM-DD");//in case only getting stuff from current date.

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            date_from = moment(date + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
            date_to = moment(date + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");

            //in case only getting stuff from current date.
            /*date_from = moment(today + ' ' + '00:00:00').format("YYYY-MM-DD HH:mm:ss");
            date_to = moment(today + ' ' + '23:59:59').format("YYYY-MM-DD HH:mm:ss");*/

            con.query(query, [date_from, date_to], (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_orders: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No orders found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all orders for shift on a specific day.
    this.getPerDayAndShift = (orderObj, res) => {
        let output = {}, queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?',
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +    
            'WHERE customer_order_timestamp BETWEEN ? AND ?';
        let shift_id = orderObj.shift_id, date = orderObj.date;
        let start_date_time, end_date_time;

        if((undefined !== shift_id && shift_id != '') && (undefined !== date && date != '')){
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(queryFindShift, [shift_id], (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            start_date_time = moment(date + ' ' + result[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                            end_date_time = moment(date + ' ' + result[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                            //console.log(start_date_time, end_date_time);
    
                            //Now get all orders during the date + shift that was provided.
                            connection.acquire((err, con) => {
                                if (err) {
                                    res.json({
                                        status: 100,
                                        message: "Error connecting to database"
                                    });
                                    return;
                                }
                    
                                con.query(query, [start_date_time, end_date_time], (err, resultOrders) => {
                                    con.release();
                                    if (err) {
                                        res.json(err);
                                        return;
                                    } else {
                                        if (resultOrders.length > 0) {
                                            output = {
                                                status: 1,
                                                customer_orders: resultOrders
                                            };
    
                                            res.json(output);
                                            return;
                                        } else {
                                            output = {
                                                status: 0,
                                                message: 'No orders found for the date and shift provided'
                                            };
    
                                            res.json(output);
                                            return;
                                        }
                                        
                                    }
                                });
                            });
                        } else {
                            output = {
                                status: 0,
                                message: 'No such shift was found'
                            };
    
                            res.json(output);
                            return;
                        }
                    }
                });
            });
        }
        else{
            feedback = 'Invalid data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
            return;
        }

    };

    //get number of orders in current shift. Used to check for PETTY CASH
    this.checkPreviousOrdersInShift = (res) => {
        let today = moment().format("YYYY-MM-DD"), current_time = moment().format("HH:mm:ss");
        let output ={}, queryGetShift = "SELECT * FROM shift WHERE shift_start_time < '" + current_time + "' AND shift_end_time > '" + 
        current_time + "'";
        let start, end;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(queryGetShift, (errShift, resultShift) => {
                con.release();
                if (errShift) {
                    output = {
                        status: 0,
                        message: 'Error getting shift',
                        error: errShift
                    };
                    
                    res.json(output);
                    return;
                } else {
                    if (resultShift.length > 0) {
                        //console.log('resultShift: ', resultShift);
                        start = moment(today + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                        end = moment(today + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");

                        countOrdersInCurrentShift(start, end, (errCount, resultCount) => {
                            if(errCount){
                                res.json(errCount);
                                return;
                            }
                            else{
                                console.log('resultCount: ', resultCount);
                                if(resultCount.count == 0){
                                    output = {
                                        status: 1,
                                        message: 'No order placed during this shift yet. Please capture petty cash.',
                                        count: resultCount.count
                                    };
                                }
                                else{
                                    output = {
                                        status: 0,
                                        message: 'Cannot capture petty cash. Orders have already been placed during this shift.',
                                        count: resultCount.count
                                    };
                                }

                                res.json(output);
                                return;
                            }

                        });

                    } else {
                        output = {
                            status: 0,
                            message: 'No such shift found'
                        };

                        res.json(output);
                        return;
                    }
                    
                }
            });
        });
        
    };

    //count number of orders in current shift. Same as the on above but this guy can be used ni other models.
    //used for PETTY CASH
    this.countOrdersInCurrentShiftV2 = (start, end, callback) => {
        let feedback, output = {};
        let query = "SELECT * FROM customer_order WHERE customer_order_timestamp BETWEEN ? AND ?";
        console.log(start + ' - ' + end);
            connection.acquire((err, con) => {
                if (err) {
                    output = {
                        status: 100,
                        message: "Error in connection database"
                    };
                    
                    callback(null, output);
                }
    
                con.query(query, [start, end], (err, result) => {
                    con.release();
                    
                    if (err) {
                        output = {
                            status: 0,
                            message: "Error getting all orders in current shift",
                            error: err
                        };
                        
                        callback(null, output);
                    } else {
                        console.log('Orders in current shift: ', result.length);
                        output = {
                            status: 1,
                            message: 'Total number of orders in current shift retrieved',
                            count: result.length
                        };
                        //console.log('getPreviousShiftTotal: ', result[0].grand_total);
                        callback(null, output);
                    }
                });
            });
    };

    //submit customer order.
    this.create = (orderObj, res) => {
        let insertedOrderID, feedback, output = {};
        let products = orderObj.orderItems; //array of items.
        let date_ordered = moment().format('YYYY-MM-DD HH:mm:ss');
        let queryInsertOrder = "INSERT INTO customer_order VALUES('',?,?,?,?,?,?,?,?)";
        let queryInsertOrderDetails = "INSERT INTO customer_order_details (customer_order_id,product_id,product_size_id,topping_id,base_type_id,product_quantity,amount) VALUES ";
        //console.log(orderObj);
        let customer_id = orderObj.customer_id;
        let total_amount = orderObj.total_amount;//sum of products amount, will be calculated in UI.
        let payment_type_id = orderObj.payment_type_id;
        let payment_status_id = orderObj.payment_status_id;//order is only submitted when payment has been received.
        //let payment_status_id = orderObj.payment_status_id;//order can be submitted withut payment (phone orders)
        let collection_status_id = 2;//order not yet collected
        let order_status_id = 1;//new order (for kitchen)
        let added_by = orderObj.added_by;
        let bankCardObj = orderObj.bankCardObj, auditObj;

        if(total_amount == '' || total_amount == null || payment_type_id == '' || payment_type_id == null || payment_status_id == '' || payment_status_id == null ||
            products.length <= 0){
            if(total_amount == '' || total_amount == null){
                feedback = 'Total amount due cannot be null';
            }

            else if(payment_type_id == '' || payment_type_id == null){
                feedback = 'Payment type not selected';
            }
            else if(products.length <= 0){
                feedback = 'Products array cannot be empty';
            }

            output = {status: 0, message: feedback};
            res.json(output);
            return;
        }
        else{
            if(customer_id == '' || customer_id == null){
                customer_id = 0;
            }
            console.log('CustomerId: ', customer_id);
            
            //submit customer order.
            createCustomerOrder(customer_id, date_ordered, total_amount, payment_type_id, payment_status_id, order_status_id,
                added_by, collection_status_id, queryInsertOrder, queryInsertOrderDetails, products, bankCardObj, (err, result) => {
                    
                    if (result) {
                        /* Insert to audit table. */
                        auditObj = {
                            employee_id: added_by,
                            action_id: 1, //create
                            description: 'Placed an order. Timestamp: ' + date_ordered
                        };

                        Audit.create(auditObj, (errAudit, resultAudit) => {
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */
                    }

                    res.json(err || result);
           });
        }

    };

    //update order status for kitchen (Ready, preparing).
    this.updateStatus = (orderObj, res) => {
        let output = {}, feedback, queryUpdate = 'UPDATE customer_order SET order_status_id = ? WHERE customer_order_id = ?';
        let customrOrderId = orderObj.customer_order_id, orderStatusId = orderObj.order_status_id;

        if((undefined !== customrOrderId && customrOrderId != '') && (undefined !== orderStatusId && orderStatusId != '')){
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }
    
                con.query(queryUpdate, [orderStatusId, customrOrderId], (err, result) => {
                    con.release();
                    if (err) {
                        //console.log(err);
                        output = {
                            status: 0,
                            message: "Error updating order status",
                            error: err
                        };
                        res.json(output);
                    } else {
                        if(orderStatusId == 2){
                            feedback = 'Customer Order is being prepared in the kitchen.';
                        }
                        else if(orderStatusId == 3){
                            feedback = 'Customer Order is ready for collection.';
                        }
                        
                        output = {
                            status: 1,
                            message: feedback,
                            status_id: orderStatusId
                        };
                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Customer Order data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //update collection status for order.
    this.updateCollectionStatus = (orderId, res) => {
        let output = {},
            feedback, queryFind = 'SELECT * FROM customer_order WHERE customer_order_id = ?',
            queryUpdate = 'UPDATE customer_order SET collection_status_id = 1 WHERE customer_order_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(queryFind, [orderId], (errOrder, resultOrder) => {
                con.release();
                if (errOrder) {
                    output = {
                        status: 0,
                        message: "Error getting order",
                        error: errOrder
                    };

                    res.json(output);
                    return;
                } else {
                    //check if order was already paid.
                    if (resultOrder[0].payment_status_id == 1) {

                        //update collection status.
                        connection.acquire((err, con) => {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error in connection database"
                                });
                                return;
                            }

                            con.query(queryUpdate, [orderId], (errUpdate, resultUpdate) => {
                                con.release();
                                if (errUpdate) {
                                    output = {
                                        status: 0,
                                        message: "Error updating collection status for order",
                                        error: errUpdate
                                    };

                                    res.json(output);
                                    return;
                                } else {
                                    output = {
                                        status: 1,
                                        message: "Customer order has been collected.",
                                        order_id: orderId
                                    };

                                    res.json(output);
                                    return;
                                }
                            });
                        });
                    } else {
                        output = {
                            status: 0,
                            message: 'No payment was received for this order. Please capture payment first!!',
                            order_id: orderId
                        };

                        res.json(output);
                        return;
                    }
                }
            });
        });
    };

    //Update payment and collection status for order. Happens when order has been processed and ready for collection
    //but needs to be paid for first, before being collected.
    this.updatePaymentAndCollectionStatus = (orderObj, res) => {
        let output = {},
            feedback, queryFind = 'SELECT * FROM customer_order WHERE customer_order_id = ?',
            queryUpdate = 'UPDATE customer_order SET payment_status_id = 1, collection_status_id = 1 ' +
            'WHERE customer_order_id = ?';
        let orderId = orderObj.order_id, bankCardObj = orderObj.bankCardObj, added_by = orderObj.added_by;

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(queryFind, [orderId], (errOrder, resultOrder) => {
                con.release();
                if (errOrder) {
                    output = {
                        status: 0,
                        message: "Error getting order",
                        error: errOrder
                    };

                    res.json(output);
                    return;
                } else {
                    /* check if order was not paid. */
                    //if order was not yet paid for.
                    if (resultOrder[0].payment_status_id != 1) {
                        
                        //Handle payment. If card is used, save card details.
                        console.log('bankCardObj: ', bankCardObj);
                        if(undefined != bankCardObj || bankCardObj != null){
                            saveCardDetails = saveBankCardDetails(orderId, bankCardObj, (errorCard, resultCard) => {
                                console.log(errorCard || resultCard.message);
                            });
                        }

                        //update collection status.
                        connection.acquire((err, con) => {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error in connection database"
                                });
                                return;
                            }

                            con.query(queryUpdate, [orderId], (err, result) => {
                                con.release();
                                if (err) {
                                    output = {
                                        status: 0,
                                        message: "Error updating payment status for order",
                                        error: err
                                    };

                                    res.json(output);
                                    return;
                                } else {
                                    output = {
                                        status: 1,
                                        message: "Payment successfully received. Order can now be collected.",
                                        message_collection: "Order has been collected",
                                        order_id: orderId
                                    };

                                    /* Insert to audit table. */
                                    let auditObj = {
                                        employee_id: added_by,
                                        action_id: 2,//update
                                        description: 'Received payment and handled collection for order #: ' + orderId
                                    };

                                    Audit.create(auditObj, (errAudit, resultAudit) => {
                                        console.log('Audit: ', errAudit || resultAudit);
                                    });
                                    /* ------------------------- */

                                    res.json(output);
                                    return;
                                }
                            });
                        });
                    } else {
                        output = {
                            status: 0,
                            message: 'Payment was already received for this order.',
                            order_id: orderId
                        };

                        res.json(output);
                        return;
                    }
                }
            });
        });
    };

}

module.exports = new CustomerOrder();