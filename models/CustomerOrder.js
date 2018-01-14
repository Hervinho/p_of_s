var connection = require('../config/connection');
var moment = require('moment');
var Shift = require('./Shift');

//Function to build query string for order details.
var buildOrderDetailsQuery = function (productsArray, customerOrderId) {
    var string = '';
    for (var index = 0; index < productsArray.length; index++) {
        if (index == productsArray.length - 1) {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_size_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + ")";
        } else {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_size_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + "),";
        }
    }

    return string;
};

//Function to  insert product order.
var createCustomerOrder = function (customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId,
    addedBy, collectionStatusId, insertOrder, insertOrderDetails, productsArray, callback) {
    var feedback, output = {};
    connection.acquire(function (err, con) {
        con.query(insertOrder, [customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId, addedBy, collectionStatusId], function (err, result) {
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
                //console.log('OrderID: ', insertedOrderID);

                //Building order details query that will be excuted once.
                var builtQueryString = buildOrderDetailsQuery(productsArray, insertedOrderID);
                insertOrderDetails += builtQueryString;
                //console.log('Order details query: ', insertOrderDetails);

                //Now insert order details in DB.
                connection.acquire(function (err, con) {
                    con.query(insertOrderDetails, function (err, result) {
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
                                message: feedback
                            };
                            callback(null, output);
                        }
                    });
                });
            }

        });
    });

};

//Function to Get grand total cash amount of all orders in previous shift.
var getPreviousShiftTotal = function(start, end, callback){
    var feedback, output = {};
    var query = "SELECT SUM(total_amount) AS grand_total FROM customer_order WHERE customer_order_timestamp BETWEEN '" + 
        start + "' AND '" + end + "'";

        connection.acquire(function (err, con) {
            if (err) {
                output = {
                    status: 100,
                    message: "Error in connection database"
                };
                
                callback(null, output);
            }

            con.query(query, function (err, result) {
                con.release();
                
                if (err) {
                    output = {
                        status: 0,
                        message: "total cash amount of all orders in previous shift",
                        error: err
                    };
                    
                    callback(null, output);
                } else {
                    output = {
                        status: 1,
                        message: "Total cash from previous shift successfully retrieved",
                        total: result[0].grand_total
                    };
                    //console.log('getPreviousShiftTotal: ', result[0].grand_total);
                    callback(null, output);
                }
            });
        });
};

function CustomerOrder() {
    //get all customer orders.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, function (err, result) {
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
    this.getAllNewToBePrepared = function (res) {
        var output = {}, today = moment().format("YYYY-MM-DD"),
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN customer_order_status ON customer_order.order_status_id = customer_order_status.customer_order_status_id ' +
            'WHERE (customer_order.order_status_id = 1 OR customer_order.order_status_id = 2) AND customer_order_timestamp LIKE ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            today = '%' + today + '%';

            con.query(query, [today], function (err, result) {
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
    this.getAllReadyForCollection = function (res) {
        var output = {}, today = moment().format("YYYY-MM-DD"),
            query = 'SELECT * FROM customer_order ' +
            'LEFT JOIN customer_order_status ON customer_order.order_status_id = customer_order_status.customer_order_status_id ' +
            'WHERE customer_order.order_status_id = 3 AND customer_order_timestamp LIKE ? ' +
            'AND customer_order.collection_status_id = 2 ' +
            'ORDER BY customer_order_timestamp DESC';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            today = '%' + today + '%';

            con.query(query, [today], function (err, result) {
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
    this.getAllPerCustomer = function (customerId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
                'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +    
                'WHERE customer_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [customerId], function (err, result) {
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
    this.countAllByPaymentType = function (paymentTypeId, res) {
        var output = {},
            query = 'SELECT COUNT(*) AS ordersCountPaymentType FROM customer_order WHERE payment_type_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [paymentTypeId], function (err, result) {
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
    this.countAllPerEmployee = function(employeeId, res){
        var output = {}, query = 'SELECT COUNT(*) AS orderCountEmployee FROM customer_order WHERE added_by = ?';
        var shiftCallback, shiftTimes;

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [employeeId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
            });
        });
    };

    //get a specific order.
    this.getOne = function (orderId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
                'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +
                'WHERE customer_order_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [orderId], function (err, result) {
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

    //get total amount from orders in a previous shift (from current datetime)
    this.getTotalAmountFromPreviousShift = function(res){
        var current_time = moment().format("HH:mm:ss");
        var queryGetShift = "SELECT * FROM shift WHERE shift_start_time < '" + current_time + "' AND shift_end_time < '" + 
            current_time + "'";
        var previous_shift, base_date, base_start_time, base_end_time;

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(queryGetShift, function (err, resultShift) {
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
                    var shiftArraySize = resultShift.length;

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
                        getPreviousShiftTotal(base_start_time, base_end_time, function(error, resultTotal){
                            
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

    //get all orders for shift on a specific day.
    this.getPerDayAndShift = function (orderObj, res) {
        var output = {}, queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?',
            query = 'SELECT * FROM customer_order LEFT JOIN employee ON customer_order.added_by = employee.employee_id ' +
            'LEFT JOIN payment_type ON customer_order.payment_type_id = payment_type.payment_type_id ' +    
            'WHERE customer_order_timestamp BETWEEN ? AND ?';
        var shift_id = orderObj.shift_id, date = orderObj.date;
        var start_date_time, end_date_time;

        if((undefined !== shift_id && shift_id != '') && (undefined !== date && date != '')){
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(queryFindShift, [shift_id], function (err, result) {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            start_date_time = moment(date + ' ' + result[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                            end_date_time = moment(date + ' ' + result[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                            //console.log(start_date_time, end_date_time);
    
                            //Now get all orders during the date + shift that was provided.
                            connection.acquire(function (err, con) {
                                if (err) {
                                    res.json({
                                        status: 100,
                                        message: "Error connecting to database"
                                    });
                                    return;
                                }
                    
                                con.query(query, [start_date_time, end_date_time], function (err, resultOrders) {
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

    //submit customer order.
    this.create = function(orderObj, res){
        var insertedOrderID, feedback, output = {};
        var products = orderObj.orderItems; //array of items.
        var date_ordered = moment().format('YYYY-MM-DD HH:mm:ss');
        var queryInsertOrder = "INSERT INTO customer_order VALUES('',?,?,?,?,?,?,?,?)";
        var queryInsertOrderDetails = "INSERT INTO customer_order_details (customer_order_id,product_id,product_size_id,product_quantity,amount) VALUES ";

        var customer_id = orderObj.customer_id;
        var total_amount = orderObj.total_amount;//sum of products amount, will be calculated in UI.
        var payment_type_id = orderObj.payment_type_id;
        var payment_status_id = 1;//order is only submitted when payment has been received.
        var collection_status_id = 2;//order not yet collected
        var order_status_id = 1, added_by = orderObj.added_by;

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
        }
        else{
            if(customer_id == '' || customer_id == null){
                customer_id = 0;
            }
            console.log('CustomerId: ', customer_id);
            
            //submit customer order.
            createCustomerOrder(customer_id, date_ordered, total_amount, payment_type_id, payment_status_id, order_status_id,
                added_by, collection_status_id, queryInsertOrder, queryInsertOrderDetails, products, function(err, result){
                res.json(err || result);
           });
        }

    };

    //update order status.
    this.updateStatus = function(orderObj, res){
        var output = {}, feedback, queryUpdate = 'UPDATE customer_order SET order_status_id = ? WHERE customer_order_id = ?';
        var customrOrderId = orderObj.customer_order_id, orderStatusId = orderObj.order_status_id;

        if((undefined !== customrOrderId && customrOrderId != '') && (undefined !== orderStatusId && orderStatusId != '')){
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }
    
                con.query(queryUpdate, [orderStatusId, customrOrderId], function (err, result) {
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
    this.updateCollectionStatus = function(orderId, res){
        var output = {}, feedback, queryUpdate = 'UPDATE customer_order SET collection_status_id = 1 WHERE customer_order_id = ?';

        //if((undefined !== customrOrderId && customrOrderId != '')){
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }
    
                con.query(queryUpdate, [orderId], function (err, result) {
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
                        
                        output = {
                            status: 1,
                            message: "Customer order has been collected."
                        };
                        res.json(output);
                    }
                });
            });
        //}
    };
}

module.exports = new CustomerOrder();