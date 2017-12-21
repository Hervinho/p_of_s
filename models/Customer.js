var connection = require('../config/connection');
var moment = require('moment');

function Customer() {
    //get all customers.
    this.getAll = function (res) {
        var output = {},
            query = "SELECT * FROM customer";

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
                            customers: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No customers found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific customer.
    this.getOne = function (customerId, res) {
        var output = {},
            query = "SELECT * FROM customer WHERE customer_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, customerId, function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such customer found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //create customer.
    this.create = function (customerObj, res) {
        var output = {},
            feedback, query = "INSERT INTO customer VALUES(?,?,?,?,?)",
            date_added = moment().format("YYYY-MM-DD HH:mm:ss");
        var customer_name = customerObj.customer_name,
            customer_gender_id = customerObj.customer_gender_id,
            customer_phone = customerObj.customer_phone;

        if ((undefined !== customer_name && customer_name != '') && (undefined !== customer_gender_id && customer_gender_id != '') &&
            (undefined !== customer_phone && customer_phone != '')) {

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, customer_name, customer_gender_id, date_added, customer_phone], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error adding new customer';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);

                    } else {
                        feedback = 'Customer successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            insertedCustomerId: result.inserId
                        };

                        res.json(output);

                    }
                });
            });
        } else {
            feedback = 'Invalid Customer data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }

    };

    //update customer.
    this.update = function (customerObj, res) {
        var output = {},
            feedback, query = "UPDATE customer SET customer_name=?, customer_gender_id=?, customer_phone=? WHERE customer_id=?";
        var customer_name = customerObj.customer_name,
            customer_gender_id = customerObj.customer_gender_id,
            customer_phone = customerObj.customer_phone,
            customer_id = customerObj.customer_id;

        if ((undefined !== customer_name && customer_name != '') && (undefined !== customer_gender_id && customer_gender_id != '') &&
            (undefined !== customer_phone && customer_phone != '') && (undefined !== customer_id && customer_id != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [customer_name, customer_gender_id, customer_phone, customer_id], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error updating customer';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);

                    } else {
                        feedback = 'Customer successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedCustomerName: customer_name
                        };

                        res.json(output);

                    }
                });
            });
        } else {
            feedback = 'Invalid Customer data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }

    };
}

module.exports = new Customer();