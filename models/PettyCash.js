var connection = require('../config/connection');
var moment = require('moment');
var Audit = require('./Audit');

function PettyCash() {
    //get all pety cash captured.
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

    //get petty cash captured in a shift.
    this.getPerDayAndShift = function (pettyCashObj, res) {
        var output = {}, queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?',
            query = 'SELECT * FROM petty_cash LEFT JOIN employee ON petty_cash.employee_id = employee.employee_id ' +
            'WHERE petty_cash.timestamp BETWEEN ? AND ?';
        var shift_id = pettyCashObj.shift_id, date = pettyCashObj.date;
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
    
                con.query(queryFindShift, [shift_id], function (errShift, resultShift) {
                    con.release();
                    if (errShift) {
                        output = {
                            status: 100,
                            message: 'Error getting shift',
                            error: errShift
                        }
                        
                        res.json(errShift);
                    } else {
                        if (resultShift.length > 0) {
                            
                            start_date_time = moment(date + ' ' + resultShift[0].shift_start_time).format("YYYY-MM-DD HH:mm:ss");
                            end_date_time = moment(date + ' ' + resultShift[0].shift_end_time).format("YYYY-MM-DD HH:mm:ss");
                            console.log(start_date_time, end_date_time);
    
                            //Now get all petty cah captures during the date + shift that was provided.
                            connection.acquire(function (err, con) {
                                if (err) {
                                    res.json({
                                        status: 100,
                                        message: "Error connecting to database"
                                    });
                                    return;
                                }
                    
                                con.query(query, [start_date_time, end_date_time], function (err, result) {
                                    con.release();
                                    if (err) {
                                        output = {
                                            status: 100,
                                            message: 'Error getting petty cash captured during shift',
                                            error: errShift
                                        }
                                        
                                        res.json(errShift);
                                        return;
                                    } else {
                                        if (result.length > 0) {
                                            output = {
                                                status: 1,
                                                petty_cash: result
                                            };
    
                                            res.json(output);
                                            return;
                                        } else {
                                            output = {
                                                status: 0,
                                                message: 'No pety cash was captured during date and shift provided'
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

    //capture petty cash.
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