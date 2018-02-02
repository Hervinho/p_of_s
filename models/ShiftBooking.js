const connection = require('../config/connection');
const moment = require('moment');
const Shift = require('./Shift');
const Promise = require('bluebird');
const Audit = require('./Audit');

function ShiftBooking(){
    //get all shift bookings.
    this.getAll = (res) => {
        let output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id";
        
        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, (err, result) => {
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
    this.getPerShift = (shiftId, res) => {
        let output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking.shift_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [shiftId], (err, result) => {
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

    //get all shifts of a certain status. (booked/cancelled)
    this.getPerStatus = (statusId, res) => {
        let output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking.booking_status_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [statusId], (err, result) => {
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
    this.getPerEmployee = (employeeId, res) => {
        let output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking.employee_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [employeeId], (err, result) => {
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
    this.getOne = (bookingId, res) => {
        let output = {}, query = "SELECT * FROM shift_booking " +
            "LEFT JOIN employee ON shift_booking.employee_id = employee.employee_id " +
            "WHERE shift_booking_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [bookingId], (err, result) => {
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

    //check if employee has booked for shift on a specific day.
    //Used to allow/deny employee from placing orders.
    this.checkShiftForEmployee = (employeeId) => {//with Bluebird promise
        let output = {}, query = "SELECT * FROM shift_booking WHERE employee_id = ? AND booking_date = ?", shift_id;
        let shiftDetails, shift_start_time, shift_end_time;
        let today = moment().format("YYYY-MM-DD"), today_datetime = moment().format("YYYY-MM-DD HH:mm:ss");
        
        /*
        //just for testing...
        let today = moment("2018-01-08").format("YYYY-MM-DD"), curent_time = moment().format("HH:mm:ss"), 
            today_datetime = moment("2018-01-08" + " " + curent_time).format("YYYY-MM-DD HH:mm:ss");
        */
        
        return new Promise((resolve, reject) => {
            connection.acquire((err, con) => {
                if (err) {
                    output = {
                        status: 100,
                        message: "Error connecting to database"
                    };
                    reject(output);
                }
                
                //check first if employee has booked for today.
                con.query(query, [employeeId, today], (err, result) => {
                    con.release();
                    if (err) {
                        reject(err);
                    } else {
                        if (result.length > 0) {
                            //get start and end times of employee's shift booking.
                            //Then check if current datetime is between the booked shift start and end times.
                            shift_id = result[0].shift_id;
                            shiftDetails = Shift.getFiltered(shift_id, (err, resultShift) => {
                                let start = resultShift.shift.shift_start_time, end = resultShift.shift.shift_end_time;
                                shift_start_time = moment(today + ' ' + start).format("YYYY-MM-DD HH:mm:ss");
                                shift_end_time = moment(today + ' ' + end).format("YYYY-MM-DD HH:mm:ss");
                                
                                console.log('Start: ' + shift_start_time, 'End: ', shift_end_time);
                                console.log('Current: ', today_datetime);
                                
                                //Check if current datetime is between today's shift start/end time.
                                if (today_datetime > shift_start_time && today_datetime < shift_end_time) {
                                    console.log("Yay");
                                    output = {
                                        status: 1,
                                        message: 'You can place orders because you booked for today current shift: ' + resultShift.shift.shift_name,
                                        shift_id: resultShift.shift.shift_id
                                    };
                                    resolve(output);
                                } else {
                                    console.log("Nay");
                                    output = {
                                        status: 0,
                                        message: 'You cannot place orders because you booked a shift for today but ' + resultShift.shift.shift_name + ' instead.',
                                        shift_id: resultShift.shift.shift_id
                                    };
                                    resolve(output);
                                }
                            });

                        } else {
                            output = {
                                status: 2,
                                message: 'You cannot place orders because you did not book a shift for today'
                            };

                            resolve(output);
                        }
                        
                    }
                });
            });
        });
    };

    //book a shift.
    this.create = (bookingObj, res) => {
        let output = {}, feedback, query = "INSERT INTO shift_booking VALUES(?,?,?,?,?,?)";
        let employee_id = bookingObj.employee_id, shift_id = bookingObj.shift_id, booking_date = bookingObj.booking_date, 
        booking_status_id = 1, timestamp = moment().format("YYYY-MM-DD HH:mm:ss"), today = moment().format('YYYY-MM-DD');
        let shiftObj, shift_start_time, shift_end_time;

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

            //Get booked shift details. Then compare times.
            shiftDetails = Shift.getFiltered(shift_id, (err, resultShift) => {
                let start = resultShift.shift.shift_start_time, end = resultShift.shift.shift_end_time;
                    shift_start_time = moment(booking_date + ' ' + start).format("YYYY-MM-DD HH:mm:ss");
                    shift_end_time = moment(booking_date + ' ' + end).format("YYYY-MM-DD HH:mm:ss");
                    
                    console.log('Start: ' + shift_start_time, 'End: ', shift_end_time);
                    console.log('Current: ', timestamp);
                    
                    //Book before and during shift for demo purposes.
                    if ((timestamp < shift_start_time) || (timestamp > shift_start_time && timestamp < shift_end_time)) {
                        console.log('Can book during the shift');
                        connection.acquire((err, con) => {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error connecting to database"
                                });
                                return;
                            }
                
                            con.query(query, [null, employee_id, shift_id, booking_date, timestamp, booking_status_id], (err, result) => {
                                con.release();
                                if (err) {
                                    if(err.code == 'ER_DUP_ENTRY'){
                                        feedback = 'Error. You already booked for this shift';
                                    }
                                    else{
                                        feedback = 'Error booking shift';
                                    }
                                    
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

                                    /* Insert to audit table. */
                                    let auditObj = {
                                        employee_id: employee_id,
                                        action_id: 1,//create
                                        description: 'Booked a shift: ' + resultShift.shift.shift_name
                                    };

                                    Audit.create(auditObj, (errAudit, resultAudit) => {
                                        console.log('Audit: ', errAudit || resultAudit);
                                    });
                                    /* ------------------------- */
            
                                    res.json(output);
                                }
                            });
                        });
                    }
                    else if(timestamp > shift_end_time){
                        //console.log('Cannot book after the shift');
                        feedback = 'Cannot book after the shift';
                        output = {
                            status: 0,
                            message: feedback
                        };

                        res.json(output);
                        return;
                    }
            });

            /*connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [null, employee_id, shift_id, booking_date, timestamp, booking_status_id], function (err, result) {
                    con.release();
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            feedback = 'Error. You already booked for this shift';
                        }
                        else{
                            feedback = 'Error booking shift';
                        }
                        
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
            });*/
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
    this.update = (bookingObj, res) => {
        let output = {}, feedback, query = "UPDATE shift_booking SET shift_id=?, booking_date=?, booking_status_id=? " +
            "WHERE employee_id=? AND shift_booking_id=?";
        let employee_id = bookingObj.employee_id, shift_id = bookingObj.shift_id, booking_date = bookingObj.booking_date, 
            booking_status_id = bookingObj.booking_status_id, shift_booking_id = bookingObj.shift_booking_id, today = moment().format('YYYY-MM-DD');

        if((undefined !== employee_id && employee_id != '') && (undefined !== shift_id && shift_id != '') && 
            (undefined !== booking_date && booking_date != '') && (undefined !== shift_booking_id && shift_booking_id != '') &&
            (undefined !== booking_status_id && booking_status_id != '')
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

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [shift_id, booking_date, booking_status_id, employee_id, shift_booking_id], (err, result) => {
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

                        /* Insert to audit table. */
                        let auditObj = {
                            employee_id: employee_id,
                            action_id: 2,//update
                            description: 'Updated shift booking ID: ' + shift_booking_id
                        };

                        Audit.create(auditObj, (errAudit, resultAudit) => {
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */

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