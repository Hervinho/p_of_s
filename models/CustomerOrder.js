var connection = require('../config/connection');
var moment = require('moment');

//Function to build query string for order details.
var buildOrderDetailsQuery = function (productsArray, customerOrderId) {
    var string = '';
    for (var index = 0; index < productsArray.length; index++) {
        if (index == productsArray.length - 1) {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + ")";
        } else {
            string += "(" + customerOrderId + ", " + 
                productsArray[index].product_id + ", " +
                productsArray[index].product_quantity + ", " +
                productsArray[index].amount + "),";
        }
    }

    return string;
};

//Function to  insert product order.
var createCustomerOrder = function (customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId,
        insertOrder, insertOrderDetails, productsArray, callback) {
    var feedback, output = {};
    connection.acquire(function (err, con) {
        con.query(insertOrder, [customerId, date, totalAmount, paymentTypeId, paymentStatusId, orderStatusId], function (err, result) {
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

                //Building order details query that will be excuted once.
                var builtQueryString = buildOrderDetailsQuery(productsArray, insertedOrderID);
                insertOrderDetails += builtQueryString;
                console.log('Order details query: ', insertOrderDetails);

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

function CustomerOrder() {
    //get all customer orders.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM customer_order';

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

    //get all orders of a specific customer.
    this.getAllPerCustomer = function (customerId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order WHERE customer_id = ?';

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

    //get a specific order.
    this.getOne = function (orderId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order WHERE customer_order_id = ?';

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

    //submit customer order.
    this.create = function(orderObj, res){
        var insertedOrderID, feedback, output = {};
        var products = orderObj.orderItems; //array of items.
        var date_ordered = moment().format('YYYY-MM-DD HH:mm:ss');
        var queryInsertOrder = "INSERT INTO customer_order VALUES('',?,?,?,?,?,?)";
        var queryInsertOrderDetails = "INSERT INTO customer_order_details (customer_order_id, product_id, product_quantity, amount) VALUES ";
        var customer_id = orderObj.customer_id;
        var total_amount = orderObj.total_amount;//sum of products amount, will be calculated in UI.
        var payment_type_id = orderObj.payment_type_id;
        var payment_status_id = 1;//order is only submitted when payment has been received.
        var order_status_id = 1;

        if(total_amount == '' || total_amount == null || payment_type_id == '' || payment_type_id == null || payment_status_id == '' || payment_status_id == null){
            if(total_amount == '' || total_amount == null){
                feedback = 'Total amount due cannot be null';
            }

            else if(payment_type_id == '' || payment_type_id == null){
                feedback = 'Payment type not selected';
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
                queryInsertOrder, queryInsertOrderDetails, products, function(err, result){
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
    
                con.query(queryUpdate, [customrOrderId, orderStatusId], function (err, result) {
                    con.release();
                    if (err) {
                        res.json({status: 0, message: err});
                    } else {
                        feedback = 'Customer Order status successfully updated';
                        output = {
                            status: 1,
                            message: feedback
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
}

module.exports = new CustomerOrder();