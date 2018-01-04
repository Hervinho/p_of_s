var connection = require('../config/connection');
var moment = require('moment');
var Shift = require('./Shift');

function ShiftBooking(){
    //get all shift bookings.
    this.getAll = function(res){
        var output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id";
        
        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
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
                            bookings: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No bookings found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all bookings of specific shift.
    this.getPerShift = function(shiftId, res){
        var output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking.shift_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
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
                            bookings: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No bookings for such shift found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all bookings of a specific employee.
    this.getPerEmployee = function(employeeId, res){
        var output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking.employee_id = ?";

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
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            bookings: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No bookings for such employee found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific booking.
    this.getOne = function(bookingId, res){
        var output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [bookingId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            booking: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such booking found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //book a shift.
    this.create = function(bookingObj, res){
        var output = {}, feedback, query = "INSERT INTO shift_booking VALUES(?,?,?,?,?)";
        var employee_id = bookingObj.employee_id, shift_id = bookingObj.shift_id, booking_date = bookingObj.booking_date, 
            timestamp = moment().format("YYYY-MM-DD HH:mm:ss"), today = moment().format('YYYY-MM-DD');
        var shiftObj, shift_start_time, shift_end_time;

        if((undefined !== employee_id && employee_id != '') && (undefined !== shift_id && shift_id != '') && 
            (undefined !== booking_date && booking_date != '')
        ){
            //Convert dates to moment formats.
            booking_date = moment(booking_date).format('YYYY-MM-DD');

            if (booking_date < today) {
                feedback = "Date must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }
            
            //Only make bookings at least one day in advance.
            if(booking_date == today){
                feedback = "Only make bookings at least a day in advance";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [null, employee_id, shift_id, booking_date, timestamp], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error booking shift';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Shift successfully booked';
                        output = {
                            status: 1,
                            message: feedback,
                            insertedBookingId: result.insertId
                        };

                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Booking data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }
    };

    //update a booking.
    this.update = function(bookingObj, res){
        var output = {}, feedback, query = "UPDATE shift_booking SET shift_id=?, booking_date=? WHERE employee_id=? " +
            "AND shift_booking_id=?";
        var employee_id = bookingObj.employee_id, shift_id = bookingObj.shift_id, booking_date = bookingObj.booking_date, 
            shift_booking_id = bookingObj.shift_booking_id, today = moment().format('YYYY-MM-DD');

        if((undefined !== employee_id && employee_id != '') && (undefined !== shift_id && shift_id != '') && 
            (undefined !== booking_date && booking_date != '') && (undefined !== shift_booking_id && shift_booking_id != '')
        ){
            //Convert dates to moment formats.
            booking_date = moment(booking_date).format('YYYY-MM-DD');

            if (booking_date < today) {
                feedback = "Date must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [shift_id, booking_date, employee_id, shift_booking_id], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error updating shift booking';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Booking successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedBookingId: shift_booking_id
                        };

                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Booking data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }
    };
}

module.exports = new ShiftBooking();