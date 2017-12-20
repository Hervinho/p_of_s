var connection = require('../config/connection');
var crypto = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var moment = require('moment');

var recordLogin = function(employeeId, callback){
    var output ={}, now = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = "INSERT INTO login_record VALUES(?,?)";

    connection.acquire(function (err, con) {
        if (err) {
            output = {
                status: 100,
                message: "Error in connection database"
            };
            
            callback(null, output);
        }
        
        
        con.query(query, [employeeId, now], function (err, result) {
            con.release();
            if (err) {
                output = {
                    status: 0,
                    message: "Error inserting login record",
                    error: err
                };               
            } else {
                output = {
                    status: 1,
                    message: "Login record successfully inserted"
                };               
            }

            callback(null, output);
        });
    });
};

function Employee() {
    //get all employees
    this.getAll = function (res) {
        var output = {},
            query = "SELECT * FROM employee";

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
                            employees: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No employees found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single employee.
    this.getOne = function (employeeId, res) {
        var output = {},
            query = "SELECT * FROM employee WHERE employee_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
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
                            employee: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such employee found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //Employee login
    this.login = function(req, res){
        var employeeObj = req.body;
        //console.log(employeeObj);
        var output = {}, feedback, query = "SELECT * FROM employee WHERE employee_code = ? AND employee_password = ?";
        var employee_code = employeeObj.employee_code, employee_password = String(employeeObj.employee_password);

        if((undefined !== employee_code && employee_code != '') && (undefined !== employee_password && employee_password != '')){
            
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }
                
                employee_password = SHA256(employee_password).toString();
                console.log(employee_password);
                con.query(query, [employee_code, employee_password], function (err, result) {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            var user = result[0];
                            feedback = "Login success";

                            //Record login attempt into login_record table.
                            recordLogin(user.employee_id, function(err, result){
                                if(err){
                                    output = {
                                        status: 1,
                                        message: feedback,
                                        recordlogin: 0
                                    };
                                }
                                else{
                                    output = {
                                        status: 1,
                                        message: feedback,
                                        recordlogin: 1
                                    };
                                }

                                res.json(output);
                                //sets a cookie with the user's info
                                /*req.ganiAgilePMSession.user = user;
                                res.send({
                                    redirect: '/dashboard'
                                });*/
                            });

                           
                        } else {
                            output = {
                                status: 0,
                                message: 'No employee with such credentials found'
                            };
                            res.json(output);
                        }
                        
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Employee login details submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //create employee.
    this.create = function (employeeObj, res) {
        var output = {},
            feedback, query = "INSERT INTO employee VALUES(?,?,?,?,?,?,?,?,?,?)";
        var employee_id_number = employeeObj.employee_id_number,
            employee_name = employeeObj.employee_name,
            employee_gender_id = employeeObj.employee_gender_id,
            employee_role_id = employeeObj.employee_role_id,
            employee_code = employeeObj.employee_code,
            employee_shift_id = employeeObj.employee_shift_id,
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email,
            employee_password = String(employeeObj.employee_password);
        
        if ((undefined !== employee_id_number && employee_id_number != '') && (undefined !== employee_name && employee_name != '') &&
            (undefined !== employee_gender_id && employee_gender_id != '') && (undefined !== employee_role_id && employee_role_id != '') &&
            (undefined !== employee_code && employee_code != '') && (undefined !== employee_phone && employee_phone != '') && 
            (undefined !== employee_email && employee_email != '') && (undefined !== employee_password && employee_password != '')
        ) {
            if(undefined === employee_shift_id || employee_shift_id == ''){employee_shift_id = 0;}
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                employee_password = SHA256(employee_password).toString();
                
                con.query(query, [null, employee_id_number, employee_name, employee_gender_id, employee_role_id, employee_code, employee_phone, employee_email, employee_password, employee_shift_id], function (err, result) {
                    con.release();
                    if (err) {
                        //console.log(err);
                        if(err.code == 'ER_DUP_ENTRY'){
                            output = {
                                status: 0,
                                message: 'Same IDnumber/Code/email/phone number already exists',
                                error: err
                            };
                        }
                        else{
                            output = err;
                        }
                        res.json(output);
                    } else {
                        feedback = 'Employee successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            createdEmployeeId: result.insertId
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Employee data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //update employee.
    this.update = function (employeeObj, res) {
        var output = {},
            feedback, query = "UPDATE employee SET employee_name=?, employee_gender_id=?, employee_role_id=?, employee_code=?, " +
            "employee_phone=?, employee_email=?, shift_id=? WHERE employee_id=?";
        var employee_name = employeeObj.employee_name,
            employee_gender_id = employeeObj.employee_gender_id,
            employee_role_id = employeeObj.employee_role_id,
            employee_code = employeeObj.employee_code,
            employee_id = employeeObj.employee_id,
            employee_shift_id = employeeObj.employee_shift_id,
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email;

        if ((undefined !== employee_name && employee_name != '') && (undefined !== employee_gender_id && employee_gender_id != '') && (undefined !== employee_role_id && employee_role_id != '') &&
            (undefined !== employee_code && employee_code != '') && (undefined !== employee_id && employee_id != '') &&
            (undefined !== employee_phone && employee_phone != '') && (undefined !== employee_email && employee_email != '')
        ) {
            if(undefined === employee_shift_id || employee_shift_id == ''){employee_shift_id = 0;}
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }
                console.log(employee_shift_id);
                con.query(query, [employee_name, employee_gender_id, employee_role_id, employee_code, employee_phone, employee_email, employee_shift_id, employee_id], function (err, result) {
                    con.release();
                    if (err) {
                        //console.log(err);
                        if(err.code == 'ER_DUP_ENTRY'){
                            output = {
                                status: 0,
                                message: 'Same IDnumber/Code/email/phone number already exists',
                                error: err
                            };
                        }
                        else{
                            output = err;
                        }
                        res.json(output);
                        
                    } else {
                        //console.log(result);
                        feedback = 'Employee successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedEmployeeId: employee_id
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Employee data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    }
}

module.exports = new Employee();