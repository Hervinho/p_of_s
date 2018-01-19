var connection = require('../config/connection');
var moment = require('moment');

function Audit() {
    //get all audits.
    this.getAll = function (res) {
        var output = {}, query = 'SELECT * FROM audit ' + 
            'LEFT JOIN employee ON audit.employee_id = audit.employee_id';

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
                            audits: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No audits found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single audit.
    this.getOne = function (id, res) {
        var output = {},
            query = 'SELECT * FROM audit WHERE audit_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, id, function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            audit: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such audit found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //create audit.
    this.create = function (auditObj, callback) {
        var output = {}, query = "INSERT iNTO audit VALUES(?,?,?,?,?)";
        var employee_id = auditObj.employee_id, action_id = auditObj.action_id, desc = auditObj.description;
        var now = moment().format("YYYY-MM-DD HH:mm:ss");

        if ((undefined !== employee_id && employee_id != '') && (undefined !== action_id && action_id != '') && 
            (undefined !== desc && desc != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    output = {
                        status: 100,
                        message: "Error in connection database"
                    };
                    callback(null, output);
                }

                con.query(query, [null, employee_id, action_id, now, desc], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: "Error inserting audit data",
                            error: err
                        };
                        //res.json(output);
                        callback(null, output);
                    } else {
                        output = {
                            status: 1,
                            message: "Audit successfully created",
                            createdAuditId: result.insertId
                        };
                        //res.json(output);
                        callback(null, output);
                    }
                });
            });
        } else {
            feedback = 'Invalid audit data submitted';
            output = {
                status: 0,
                message: feedback
            };
            //res.json(output);
            callback(null, output);
        }

    };
}

module.exports = new Audit();