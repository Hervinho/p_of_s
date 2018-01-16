var connection = require('../config/connection');

function Shift() {
    //get all shifts.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM shift';

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
                            shifts: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No shifts found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single shift.
    this.getOne = function (shiftId, res) {
        var output = {},
            query = 'SELECT * FROM shift WHERE shift_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [shiftId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            shift: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such shift found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get details of a specific shift. Same as getOne, but this one returns a callback.
    this.getFiltered = function (shiftId, callback) {
        var output = {},
            query = 'SELECT * FROM shift WHERE shift_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [shiftId], function (err, result) {
                con.release();
                if (err) {
                    callback(null, err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            shift: result[0]
                        };

                        callback(null, output);
                    } else {
                        output = {
                            status: 0,
                            message: 'No such shift found'
                        };
                        
                        callback(null, output);
                    }
                }
            });
        });
    };

    //create new shift.
    this.create = function (shiftObj, res) {
        var feedback, output = {},
            query = "INSERT INTO shift (shift_name, shift_start_time, shift_end_time) VALUES (?,?,?)";
        var shift_name = shiftObj.shift_name,
            shift_start_time = shiftObj.shift_start_time,
            shift_end_time = shiftObj.shift_end_time;
        console.log(shift_end_time);
        if ((undefined !== shift_name && shift_name != '') && (undefined !== shift_start_time && shift_start_time != '') &&
            (undefined !== shift_end_time && shift_end_time != '')) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [shift_name, shift_start_time, shift_end_time], function (err, result) {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        feedback = 'Shift successfully created';
                        output = {
                            status: 1,
                            message: feedback,
                            createdShiftId: result.insertId
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Customer order Status data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //update shift.
    this.update = function (shiftObj, res) {
        var feedback, output = {},
            query = "UPDATE shift SET shift_name=?, shift_start_time=?, shift_end_time=? WHERE shift_id=?";
        var shift_name = shiftObj.shift_name,
            shift_start_time = shiftObj.shift_start_time,
            shift_end_time = shiftObj.shift_end_time,
            shift_id = shiftObj.shift_id;

        if ((undefined !== shift_name && shift_name != '') && (undefined !== shift_start_time && shift_start_time != '') &&
            (undefined !== shift_end_time && shift_end_time != '') && (undefined !== shift_id && shift_id != '')) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [shift_name, shift_start_time, shift_end_time, shift_id], function (err, result) {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        feedback = 'Shift successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedatedShiftId: shift_name
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Customer Status data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }

    };

    //delete shift.
    this.delete = function (shiftId, res) {
        var feedback, output = {}, query = "DELETE FROM shift WHERE shift_id=?";

        connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [shiftId], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error deleting shift',
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Shift successfully deleted';
                        output = {
                            status: 1,
                            message: feedback,
                            deletedShiftId: shiftId
                        };

                        res.json(output);
                    }
                });
        });       

    };
}

module.exports = new Shift();