var connection = require('../config/connection');
var moment = require('moment');
var Audit = require('./Audit');
var CustomerOrder = require('./CustomerOrder');

var capturePettyCash = function (pettyCashObj, callback) {
    var now = moment().format("YYYY-MM-DD HH:mm:ss");
    var output = {}, query = "INSERT INTO petty_cash VALUES(?,?,?,?)";
    var employee_id = pettyCashObj.employee_id,
        amount = pettyCashObj.amount;

    if ((undefined !== employee_id && employee_id != '') && (undefined !== amount && amount != '')) {
        
        connection.acquire(function (err, con) {
            if (err) {
                output = {
                    status: 100,
                    message: "Error in connection database"
                }
                
                callback(null, output);
            }

            con.query(query, [null, employee_id, amount, now], function (err, result) {
                con.release();
                if (err) {
                    output = {
                        status: 0,
                        message: 'Error capturing petty cash',
                        error: err
                    };
                    
                    callback(null, output);
                } else {
                    output = {
                        status: 1,
                        message: 'Petty cash successfully captured',
                        capturedPettyCashId: result.inserId
                    };

                    /* Insert to audit table. */
                    var auditObj = {
                        employee_id: employee_id,
                        action_id: 1,//create
                        description: 'Captured petty cash at beginning of shift. Amount: ' + amount
                    };

                    Audit.create(auditObj, function(errAudit, resultAudit){
                        console.log('Audit: ', errAudit || resultAudit);
                    });
                    /* ------------------------- */

                    callback(null, output);
                }
            });
        });
    } else {
        feedback = 'Invalid petty cash data submitted';
        output = {
            status: 0,
            message: feedback
        };
        
        callback(null, output);
    }
};

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
        var output = {},
            queryFindShift = 'SELECT * FROM shift WHERE shift_id = ?',
            query = 'SELECT * FROM petty_cash LEFT JOIN employee ON petty_cash.employee_id = employee.employee_id ' +
            'WHERE petty_cash.timestamp BETWEEN ? AND ?';
        var shift_id = pettyCashObj.shift_id,
            date = pettyCashObj.date;
        var start_date_time, end_date_time;

        if ((undefined !== shift_id && shift_id != '') && (undefined !== date && date != '')) {
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
        } else {
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
        var today = moment().format("YYYY-MM-DD"),
            current_time = moment().format("HH:mm:ss");
        var output = {},
            queryGetShift = "SELECT * FROM shift WHERE shift_start_time < '" + current_time +
            "' AND shift_end_time > '" + current_time + "'";
        var start, end;

        //First check if any orders were already placed during this shift.
        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            //get current shift.
            con.query(queryGetShift, function (errShift, resultShift) {
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

                        //Now check if any orders were placed during this shift.
                        CustomerOrder.countOrdersInCurrentShiftV2(start, end, function (errCount, resultCount) {
                            if (errCount) {
                                
                                res.json(errCount);
                                return;
                            } else {
                                console.log('resultCount: ', resultCount);

                                //if no orders have been placed yet, you can capture petty cash.
                                if (resultCount.count == 0) {
                                    console.log('No order placed during this shift yet. You can capture petty cash.');
                                    
                                    //capture petty cash here.
                                    capturePettyCash(pettyCashObj, function(errPetty, resultPetty){
                                        if(errPetty){
                                            res.json(errPetty);
                                            return;
                                        }
                                        else{
                                            res.json(resultPetty);
                                            return;
                                        }
                                    });

                                } else { //cannot capture petty cash. Only possible if no orders found in current shift.
                                    output = {
                                        status: 0,
                                        message: 'Cannot capture petty cash because Orders have already been placed during this shift.'
                                    };

                                    res.json(output);
                                    return;
                                }

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
}

module.exports = new PettyCash();