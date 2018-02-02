const connection = require('../config/connection');
const crypto = require("crypto-js");
const SHA256 = require("crypto-js/sha256");
const moment = require('moment');
const request = require('request');
const emailAPI = "";
const Audit = require('./Audit');

let recordLogin = (employeeId, callback) => {
    let output = {},
        now = moment().format('YYYY-MM-DD HH:mm:ss');
    let query = "INSERT INTO login_record VALUES(?,?)";

    connection.acquire((err, con) => {
        if (err) {
            output = {
                status: 100,
                message: "Error in connection database"
            };

            callback(null, output);
        }


        con.query(query, [employeeId, now], (err, result) => {
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
    //Count total number of active male/females employees.
    this.countAllByGender = (genderId, res) => {
        let query = 'SELECT COUNT(*) AS empGenderCount FROM employee WHERE employee_status_id = 1 ' +
        'AND employee_gender_id = ?';

        connection.acquire((err, con) => {
        con.query(query, genderId, (err, result) => {
            con.release();
            res.json(result);
        });
        });
    };

    //Count total number of active employees of a certain role.
    this.countAllByRole = (roleId, res) => {
        let query = 'SELECT COUNT(*) AS empRoleCount FROM employee WHERE employee_status_id = 1 ' +
        'AND employee_role_id = ?';

        connection.acquire((err, con) => {
        con.query(query, roleId, (err, result) => {
            con.release();
            res.json(result);
        });
        });
    };

    //get all employees
    this.getAll = (res) => {
        let output = {},
            query = "SELECT * FROM employee";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
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

    //get all employees of a certain status (active/inactive)
    this.getByStatus = (statusId, res) => {
        let output = {},
            query = "SELECT * FROM employee WHERE employee_status_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
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
                            employees: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No employee with such status was found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all employees of a certain role
    this.getByRole = (roleId, res) => {
        let output = {},
            query = "SELECT * FROM employee WHERE employee_role_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [roleId], (err, result) => {
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
                            message: 'No employee with such role was found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single employee.
    this.getOne = (employeeId, res) => {
        let output = {},
            query = "SELECT * FROM employee WHERE employee_id = ?";

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
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
    this.login = (req, res) => {
        let employeeObj = req.body;
        console.log(employeeObj);
        let output = {},
            feedback, query = "SELECT * FROM employee WHERE employee_code = ? AND employee_password = ?";
            //"AND employee_status_id = 1";
        let employee_code = employeeObj.employee_code,
            employee_password = String(employeeObj.employee_password);

        if ((undefined !== employee_code && employee_code != '') && (undefined !== employee_password && employee_password != '')) {

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                employee_password = SHA256(employee_password).toString();
                //console.log('Password: ', employee_password);
                
                con.query(query, [employee_code, employee_password], (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            let employee = result[0];
                            
                            if(employee.employee_status_id != 1){
                                output = {
                                    status: 0,
                                    message: 'You no longer have access to the system.'
                                };
                                
                                res.json(output);
                                return;
                            }

                            feedback = "Login success";

                            //Record login attempt into login_record table.
                            recordLogin(employee.employee_id, (err, result) => {
                                if (err) {
                                    output = {
                                        status: 1,
                                        message: feedback,
                                        recordlogin: 0
                                    };
                                } else {
                                    output = {
                                        status: 1,
                                        message: feedback,
                                        recordlogin: 1
                                    };
                                }

                                console.log(output);
                                //res.json(output);
                                
                                //sets a cookie with the employee's info
                                req.PhemePointOfSaleProjectSession.employee = employee;
                                res.send({
                                    status: 1,
                                    redirect: '/page/home'
                                });
                            });


                        } else {
                            feedback = "Wrong code and/or password";
                            output = {
                                status: 0,
                                message: feedback
                            };
                            res.json(output);
                        }

                    }
                });
            });
        } else {
            feedback = 'Invalid Employee login details submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //Employee logout.
	this.logout = (req, res) => {
		//clear session content
		req.PhemePointOfSaleProjectSession.reset();

		res.redirect('/');
	};

    //create employee.
    this.create = (employeeObj, res) => {
        let output = {},
            feedback, query = "INSERT INTO employee VALUES(?,?,?,?,?,?,?,?,?,?,?)";
        let employee_id_number = employeeObj.employee_id_number,
            employee_dob = employeeObj.employee_dob
            employee_name = employeeObj.employee_name,
            employee_gender_id = employeeObj.employee_gender_id,
            employee_role_id = employeeObj.employee_role_id,
            employee_code = "POS" + employee_id_number.substr(employee_id_number.length - 2, employee_id_number.length) + 
                employee_name.substr(0,3).toUpperCase(),
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email,
            added_by = employeeObj.added_by,
            employee_password = "",
            employee_status_id = 1;
        
        if ((undefined !== employee_id_number && employee_id_number != '') && (undefined !== employee_name && employee_name != '') &&
            (undefined !== employee_gender_id && employee_gender_id != '') && (undefined !== employee_role_id && employee_role_id != '') &&
            (undefined !== employee_code && employee_code != '') && (undefined !== employee_phone && employee_phone != '') &&
            (undefined !== employee_email && employee_email != '') && (undefined !== employee_dob && employee_dob != '')
        ) {
            //employee_dob = moment(employee_dob).format('YYYY-MM-DD');

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, employee_id_number, employee_dob, employee_name, employee_gender_id, employee_role_id, employee_code, employee_phone, employee_email, employee_password, employee_status_id], (err, result) => {
                    con.release();
                    if (err) {
                        if (err.code == 'ER_DUP_ENTRY') {
                            output = {
                                status: 0,
                                message: 'Same ID_number/Code/email/phone number already exists',
                                error: err
                            };
                        } else {
                            output = {
                                status: 0,
                                message: 'Error adding employee',
                                error: err
                            };
                        }

                        res.json(output);
                    } else {
                        feedback = 'Employee successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            createdEmployeeId: result.insertId
                        };

                        /* Insert to audit table. */
                        let auditObj = {
                            employee_id: added_by,
                            action_id: 1,//create
                            description: 'Created new Employee. Code: ' + employee_code
                        };
                        
                        Audit.create(auditObj, (errAudit, resultAudit) => {
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */

                        //send email to new employee with his/her employee code.
                        let messageObj = {
                            subject: 'Welcome To the Point Of Sale staff',
                            destination: employee_email,
                            content: [
                                'Your Employee Code is : ' + employee_code, 
                                'Go to the system to set up your password'
                            ]
                        };

                        request.post(emailAPI, {
                            body: JSON.stringify(messageObj),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        }, function (error, response, body) {
                            if (error) {
                                console.log(err);

                            } else if (response && response.statusCode == 200) {
                                console.log('Email successfully sent to: ', employee_name);
                            }

                        });

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

    //update employee by admin. Can only change role and/or status.
    this.update = (employeeObj, res) => {
        let output = {},
            feedback, query = "UPDATE employee SET employee_role_id=?, employee_status_id=? " +
            "WHERE employee_id=?";
        let employee_role_id = employeeObj.employee_role_id,
            employee_id = employeeObj.employee_id,
            employee_status_id = employeeObj.employee_status_id,
            added_by = employeeObj.added_by;

        if ((undefined !== employee_id && employee_id != '') && (undefined !== employee_status_id && employee_status_id != '') &&
            (undefined !== employee_role_id && employee_role_id != '')
        ) {
            
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [employee_role_id, employee_status_id, employee_id], (err, result) => {
                    con.release();
                    if (err) {
                        //console.log(err);
                        output = {
                            status: 0,
                            message: 'Error updating employee',
                            error: err
                        };
                        res.json(output);

                    } else {
                        //console.log(result);
                        feedback = 'Employee successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedEmployeeId: employee_id
                        };

                        /* Insert to audit table. */
                        let auditObj = {
                            employee_id: added_by,
                            action_id: 2,//update
                            description: 'Updated Employee ID: ' + employee_id
                        };

                        Audit.create(auditObj, (errAudit, resultAudit) => {
                            console.log('Audit: ', errAudit || resultAudit);
                        });
                        /* ------------------------- */

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

    //update employee info/profile. Done by employee him/herself.
    this.updateProfile = (employeeObj, res) => {
        let output = {}, feedback, 
            query = "UPDATE employee SET employee_phone=?, employee_email=? WHERE employee_id=?";
        let employee_id = employeeObj.employee_id,
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email;

        if ((undefined !== employee_phone && employee_phone != '') && (undefined !== employee_email && employee_email != '') && 
            (undefined !== employee_id && employee_id != '')
        ) {
            
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [employee_phone, employee_email, employee_id], (err, result) => {
                    con.release();
                    if (err) {
                        
                        if (err.code == 'ER_DUP_ENTRY') {
                            output = {
                                status: 0,
                                message: 'Same email or phone number already exists',
                                error: err
                            };
                        } else {
                            output = err;
                        }
                        res.json(output);

                    } else {
                        //console.log(result);
                        feedback = 'Employee profile successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedEmployeeId: employee_id,
                            employee_phone: employee_phone,
                            employee_email: employee_email
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

    //Reset Password.
    this.resetPassword = (passwordObj, res) => {
        let output = {},
            feedback, queryFind = "SELECT employee_password FROM employee WHERE employee_id=?",
            queryUpdate = "UPDATE employee SET employee_password=? WHERE employee_id=?";
        let employee_id = passwordObj.employee_id,
            new_password = String(passwordObj.new_password),
            current_password = String(passwordObj.current_password);

        if ((undefined !== employee_id && employee_id != '') && (undefined !== new_password && new_password != '') &&
            (undefined !== current_password && current_password != '')
        ) {
            //Encrypt passwords.
            new_password = SHA256(new_password).toString();
            current_password = SHA256(current_password).toString();

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                //First check that current password provided is legit.
                con.query(queryFind, [employee_id], (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            let currentPasswordInDB = result[0].employee_password;
                            
                            if(current_password == currentPasswordInDB){
                                console.log('Current password provided matches the one in DB');

                                //Ensure that new_password is different than current password in DB.
                                if(new_password == currentPasswordInDB){
                                    res.json({
                                        status: 0,
                                        message: "New password cannot be the same as current/previous one."
                                    });
                                    return;
                                }
                                
                                //update new password here.
                                connection.acquire((err, con) => {
                                    if (err) {
                                        res.json({
                                            status: 100,
                                            message: "Error in connection database"
                                        });
                                        return;
                                    }

                                    con.query(queryUpdate, [new_password, employee_id], (err, result) => {
                                        con.release();
                                        if (err) {
                                            output = {
                                                status: 0,
                                                message: 'Error resetting password',
                                                error: err
                                            };
    
                                            res.json(output);
                                            return;
                                        } else {
                                            output = {
                                                status: 1,
                                                message: 'Password successfully reset'
                                            };
                                            
                                            res.json(output);
                                            return;
                                        }
                                    });
                                });
                                
                            }
                            else{
                                output = {
                                    status: 0,
                                    message: 'Current password does not match with the one in database'
                                };
                                
                                res.json(output);
                                return;
                            }
                            
                        } else {
                            output = {
                                status: 0,
                                message: 'No password was found for such employee.'
                            };

                            res.json(output);
                            return;
                        }

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
            return;
        }
    };

    //Forgot Password.
    this.ForgotPassword = (employeeObj, res) => {
        let output = {},
            feedback, queryFind = "SELECT * FROM employee WHERE employee_id_number=? AND employee_code=? AND employee_status_id = 1",
            queryUpdate = "UPDATE employee SET employee_password=? WHERE employee_id_number=? AND employee_code=? " +
            "AND employee_status_id = 1";
        let employee_id_number = employeeObj.employee_id_number,
            new_password = String(employeeObj.new_password),
            employee_code = employeeObj.employee_code;

        if ((undefined !== employee_id_number && employee_id_number != '') && (undefined !== new_password && new_password != '') &&
            (undefined !== employee_code && employee_code != '')
        ) {
            //Encrypt password.
            new_password = SHA256(new_password).toString();

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                //First check employee with such ID number and Code exists in the DB.
                con.query(queryFind, [employee_id_number, employee_code], (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            console.log('Such employee exists.');

                            let currentPasswordInDB = result[0].employee_password;
                            
                            //Ensure that new_password is different than current password in DB.
                            if(new_password == currentPasswordInDB){
                                res.json({
                                    status: 0,
                                    message: "New password cannot be the same as current/previous one."
                                });
                                return;
                            }

                            //update new password here.
                            connection.acquire((err, con) => {
                                    if (err) {
                                        res.json({
                                            status: 100,
                                            message: "Error in connection database"
                                        });
                                        return;
                                    }

                                    con.query(queryUpdate, [new_password, employee_id_number, employee_code], (err, result) => {
                                        con.release();
                                        if (err) {
                                            output = {
                                                status: 0,
                                                message: 'Error updating password',
                                                error: err
                                            };
                                            console.log(output);
                                            res.json(output);
                                            return;
                                        } else {
                                            output = {
                                                status: 1,
                                                message: 'Password successfully updated'
                                            };
                                            console.log(output);
                                            res.json(output);
                                            return;
                                        }
                                    });
                            });
                            
                        } else {
                            output = {
                                status: 0,
                                message: 'No active employee with such ID Number and Employee Code was found.'
                            };

                            res.json(output);
                            return;
                        }

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
            return;
        }
    };

    //Set up new password by new employee.
    this.SetUpNewPassword = (employeeObj, res) => {
        let output = {},
            feedback, queryFind = "SELECT * FROM employee WHERE employee_id_number=? AND employee_code=? AND employee_status_id = 1",
            queryUpdate = "UPDATE employee SET employee_password=? WHERE employee_id_number=? AND employee_code=? " +
            "AND employee_status_id = 1";
        let employee_id_number = employeeObj.employee_id_number,
            new_password = String(employeeObj.new_password),
            employee_code = employeeObj.employee_code;

        if ((undefined !== employee_id_number && employee_id_number != '') && (undefined !== new_password && new_password != '') &&
            (undefined !== employee_code && employee_code != '')
        ) {
            //Encrypt password.
            new_password = SHA256(new_password).toString();

            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                //First check employee with such ID number and Code exists in the DB.
                con.query(queryFind, [employee_id_number, employee_code], (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            console.log('Such employee indeed exists.');

                            //update new password here.
                            connection.acquire((err, con) => {
                                    if (err) {
                                        res.json({
                                            status: 100,
                                            message: "Error in connection database"
                                        });
                                        return;
                                    }

                                    con.query(queryUpdate, [new_password, employee_id_number, employee_code], (err, result) => {
                                        con.release();
                                        if (err) {
                                            output = {
                                                status: 0,
                                                message: 'Error setting up new password',
                                                error: err
                                            };
                                            console.log(output);
                                            res.json(output);
                                            return;
                                        } else {
                                            output = {
                                                status: 1,
                                                message: 'New password successfully set up'
                                            };
                                            
                                            res.json(output);
                                            return;
                                        }
                                    });
                            });
                            
                        } else {
                            output = {
                                status: 0,
                                message: 'No active employee with such ID Number and Employee Code was found.'
                            };

                            res.json(output);
                            return;
                        }

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
            return;
        }
    };
}

module.exports = new Employee();