var connection = require('../config/connection');
var moment = require('moment');
var Audit = require('./Audit');

function PettyCash() {
    //get all statuses.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM petty_cash LEFT JOIN employee ON petty_cash.employee_id = employee.employee_id';

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
                            petty_cash: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No petty cash capture was found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //create petty_cash.
    this.create = function (pettyCashObj, res) {
        var output = {},
            feedback,
            query = "INSERT INTO petty_cash VALUES(?,?,?,?)";
        var employee_id = pettyCashObj.employee_id,
            amount = pettyCashObj.amount;
        var now = moment().format("YYYY-MM-DD HH:mm:ss");

        if ((undefined !== employee_id && employee_id != '') && (undefined !== amount && amount != '')) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, employee_id, amount, now], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error capturing petty cash',
                            error: err
                        };

                        res.json(output);
                        return;
                    } else {
                        feedback = 'Petty cash successfully captured';
                        output = {
                            status: 1,
                            message: feedback,
                            createdPettyCashId: result.insertId
                        };

                        /* Insert to audit table. */
                        var auditObj = {
                            employee_id: employee_id,
                            action_id: 1,//create
                            description: 'Captured petty cash from counter. Amount: R' + amount
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
            feedback = 'Invalid petty cash data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }


    };
}

module.exports = new PettyCash();