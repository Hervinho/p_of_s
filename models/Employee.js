var connection = require('../config/connection');
var SHA256 = require("crypto-js/sha256");

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
    this.login = function(employeeObj, res){
        var output = {},
        feedback, query = "SELECT * FROM employee WHERE";
    };

    //create employee.
    this.create = function (employeeObj, res) {
        var output = {},
            feedback, query = "INSERT INTO employee VALUES(?,?,?,?,?,?,?,?,?)";
        var employee_id_number = employeeObj.employee_id_number,
            employee_name = employeeObj.employee_name,
            employee_gender_id = employeeObj.employee_gender_id,
            employee_role_id = employeeObj.employee_role_id,
            employee_code = employeeObj.employee_code,
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email,
            employee_password = String(employeeObj.employee_password);

        if ((undefined !== employee_id_number && employee_id_number != '') && (undefined !== employee_name && employee_name != '') &&
            (undefined !== employee_gender_id && employee_gender_id != '') && (undefined !== employee_role_id && employee_role_id != '') &&
            (undefined !== employee_code && employee_code != '') && (undefined !== employee_phone && employee_phone != '') && 
            (undefined !== employee_email && employee_email != '') && (undefined !== employee_password && employee_password != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                employee_password = SHA256(employee_password).toString();

                con.query(query, [null, employee_id_number, employee_name, employee_gender_id, employee_role_id, employee_code, employee_phone, employee_email, employee_password], function (err, result) {
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
            "employee_phone=?, employee_email=? WHERE employee_id=?";
        var employee_name = employeeObj.employee_name,
            employee_gender_id = employeeObj.employee_gender_id,
            employee_role_id = employeeObj.employee_role_id,
            employee_code = employeeObj.employee_code,
            employee_id = employeeObj.employee_id,
            employee_phone = employeeObj.employee_phone,
            employee_email = employeeObj.employee_email;

        if ((undefined !== employee_name && employee_name != '') && (undefined !== employee_gender_id && employee_gender_id != '') && (undefined !== employee_role_id && employee_role_id != '') &&
            (undefined !== employee_code && employee_code != '') && (undefined !== employee_id && employee_id != '') &&
            (undefined !== employee_phone && employee_phone != '') && (undefined !== employee_email && employee_email != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [employee_name, employee_gender_id, employee_role_id, employee_code, employee_phone, employee_email, employee_id], function (err, result) {
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