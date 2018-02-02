const connection = require('../config/connection');

function Topping() {
    //get all toppings.
    this.getAll = (res) => {
        let output = {},
            query = 'SELECT * FROM topping';

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
                            toppings: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No toppings found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single topping.
    this.getOne = (id, res) => {
        let output = {},
            query = 'SELECT * FROM topping WHERE topping_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, id, (err, result) => {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            topping: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such topping found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //create topping.
    this.create = (toppingObj, res) => {
        let output = {},
            query = "INSERT INTO topping VALUES(?,?)";
        let feedback, topping_name = toppingObj.topping_name;

        if ((undefined !== topping_name && topping_name != '')) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, topping_name], (err, result) => {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error creating topping',
                            error: err
                        };
                        res.json(err);
                    } else {
                        feedback = 'Topping successfully created';
                        output = {
                            status: 1,
                            message: feedback,
                            createdToppingId: result.insertId
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid topping data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }


    };

    //update topping.
    this.update = (toppingObj, res) => {
        let output = {},
            queryFind = 'SELECT * FROM topping WHERE topping_id = ?',
            query = "UPDATE topping SET topping_name = ? WHERE topping_id = ?";
        let feedback, topping_name = toppingObj.topping_name,
            topping_desc = toppingObj.topping_desc,
            topping_id = toppingObj.topping_id;

        if ((undefined !== topping_name && topping_name != '') && (undefined !== topping_id && topping_id != '')) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(queryFind, topping_id, (err, result) => {
                    con.release();
                    if (err) {
                        res.json(err);
                    } else {
                        if (result.length > 0) {
                            //Update.
                            connection.acquire((err, con) => {
                                if (err) {
                                    res.json({
                                        status: 100,
                                        message: "Error in connection database"
                                    });
                                    return;
                                }

                                con.query(query, [topping_name, topping_id], (err, result) => {
                                    con.release();
                                    if (err) {
                                        res.json(err);
                                    } else {
                                        feedback = 'Topping successfully updated';
                                        output = {
                                            status: 1,
                                            message: feedback,
                                            updatedToppingName: topping_name
                                        };
                                        res.json(output);
                                    }
                                });
                            });
                        } else {
                            output = {
                                status: 0,
                                message: 'No Topping with such Id found'
                            };
                            res.json(output);
                        }

                    }
                });
            });

        } else {
            feedback = 'Invalid Topping data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }


    };
}

module.exports = new Topping();