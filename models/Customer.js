var connection = require('../config/connection');
var moment = require('moment');
var Audit = require('./Audit');

function Customer() {
    //get customer email list.
    this.getEmailList = function (callback) {
        var output = {},
            query = "SELECT customer_email FROM customer";

        connection.acquire(function (err, con) {
            if (err) {
                output = {
                    status: 100,
                    message: "Error in connection database"
                };
                return;
            }

            con.query(query, function (err, result) {
                con.release();
                if (err) {
                    callback(null, err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            emails: result
                        };
                        callback(null, output);
                    } else {
                        output = {
                            status: 0,
                            message: 'No emails found'
                        };
                        callback(null, output);
                    }
                    //console.log(output);
                }
            });
        });
    };

    //get all customers.
    this.getAll = function (res) {
        var output = {},
            query = "SELECT * FROM customer LEFT JOIN employee ON customer.added_by = employee.employee_id";

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

    //get all customers of a specific gender.
    this.getPerGender = function (genderId, res) {
        var output = {},
            query = "SELECT * FROM customer LEFT JOIN employee ON customer.added_by = employee.employee_id WHERE customer_gender_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [genderId], function (err, result) {
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
                            message: 'No such customers found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific customer.
    this.getOne = function (customerId, res, callback) {
        var output = {},
            query = "SELECT * FROM customer LEFT JOIN employee ON customer.added_by = employee.employee_id WHERE customer_id = ?";

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
                        callback(output);
                    } else {
                        output = {
                            status: 0,
                            message: 'No such customer found'
                        };

                        res.json(output);
                    }

                }
            });
        });
    };

    //get specific customer, no callback.
    this.getFiltered = function (id, res) {
        var output = {},
            query = "SELECT * FROM customer LEFT JOIN employee ON customer.added_by = employee.employee_id WHERE customer_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [id], function (err, result) {
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
            feedback, query = "INSERT INTO customer VALUES(?,?,?,?,?,?,?)",
            date_added = moment().format("YYYY-MM-DD HH:mm:ss");
        var customer_name = customerObj.customer_name,
            customer_gender_id = customerObj.customer_gender_id,
            customer_email = customerObj.customer_email,
            customer_phone = customerObj.customer_phone,
            added_by = customerObj.employee_id;

        if ((undefined !== customer_name && customer_name != '') && (undefined !== customer_gender_id && customer_gender_id != '') &&
            (undefined !== customer_phone && customer_phone != '') && (undefined !== customer_email && customer_email != '') &&
            (undefined !== added_by && added_by != '')
        ) {

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, customer_name, customer_gender_id, date_added, customer_phone, customer_email, added_by], function (err, result) {
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

                         /* Insert to audit table. */
                         auditObj = {
                            employee_id: added_by,
                            action_id: 1,//create
                            description: 'Inserted customer: ' + customer_name
                        };

                        Audit.create(auditObj, function(errAudit, resultAudit){
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */

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
            feedback, query = "UPDATE customer SET customer_name=?, customer_gender_id=?, customer_phone=?,customer_email=? " +
                " WHERE customer_id=?";
        var customer_name = customerObj.customer_name,
            customer_gender_id = customerObj.customer_gender_id,
            customer_phone = customerObj.customer_phone,
            customer_email = customerObj.customer_email,
            customer_id = customerObj.customer_id,
            added_by = customerObj.employee_id;

        if ((undefined !== customer_name && customer_name != '') && (undefined !== customer_gender_id && customer_gender_id != '') &&
            (undefined !== customer_phone && customer_phone != '') && (undefined !== customer_id && customer_id != '') &&
            (undefined !== customer_email && customer_email != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [customer_name, customer_gender_id, customer_phone, customer_email, customer_id], function (err, result) {
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

                        /* Insert to audit table. */
                        var auditObj = {
                            employee_id: added_by,
                            action_id: 2,//update
                            description: 'Updated customer: ' + customer_name
                        };

                        Audit.create(auditObj, function(errAudit, resultAudit){
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */

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