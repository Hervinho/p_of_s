var connection = require('../config/connection');

function EmployeeStatus(){
    //get all employee statuses.
    this.getAll = function (res) {
        var output = {},
            query = "SELECT * FROM employee_status";

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
                            employee_statuses: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No employee statuses found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };
}

module.exports = new EmployeeStatus();