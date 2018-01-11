var connection = require('../config/connection');

function Product() {
    //get all products.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM product LEFT JOIN employee ON product.added_by = employee.employee_id';

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
                            products: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No products found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all products of a specific type.
    this.getByType = function (productTypeId, res) {
        var output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_type_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productTypeId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            products: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No products found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all products of specific satus.
    this.getByStatus = function (productStatusId, res) {
        var output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_status_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productStatusId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            products: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No products found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific product.
    this.getOne = function (productId, res) {
        var output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            product: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such product found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //add new product.
    this.create = function (productObj, res) {
        var output = {},
            feedback, query = "INSERT INTO product VALUES(?,?,?,?,?,?,?)";
        var product_type_id = productObj.product_type_id,
            product_status_id = 2,
            product_name = productObj.product_name,
            product_price = productObj.product_price,
            product_desc = productObj.product_desc,
            added_by = productObj.employee_id;

        if ((undefined !== product_type_id && product_type_id != '') && (undefined !== product_name && product_name != '') &&
            (undefined !== product_price && product_price != '') && (undefined !== product_desc && product_desc != '') &&
            (undefined !== added_by && added_by != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, product_type_id, product_status_id, product_name, product_desc, product_price, added_by], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error adding new product',
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Product successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            createdProductId: result.insertId
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            output = {
                status: 0,
                message: 'Invalid product data submitted'
            };

            res.json(output);
        }
    };

    //update product.
    this.update = function (productObj, res) {
        var output = {},
            feedback, query = "UPDATE product SET product_type_id=?, product_name=?, product_desc=?, product_price=? WHERE product_id=?";
        var product_type_id = productObj.product_type_id,
            product_name = productObj.product_name,
            product_price = productObj.product_price,
            product_desc = productObj.product_desc,
            product_id = productObj.product_id;

        if ((undefined !== product_type_id && product_type_id != '') && (undefined !== product_name && product_name != '') &&
            (undefined !== product_price && product_price != '') && (undefined !== product_desc && product_desc != '') &&
            (undefined !== product_id && product_id != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [product_type_id, product_name, product_desc, product_price, product_id], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error updating new product',
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Product successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedProductName: product_name
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            output = {
                status: 0,
                message: 'Invalid product data submitted'
            };

            res.json(output);
        }
    };

    //change product status.
    this.updateStatus = function (productObj, res) {
        var product_id = productObj.product_id,
            operation_value = productObj.operation_value,
            keyword, product_status_id,
            query = "UPDATE product SET product_status_id=? WHERE product_id=?";
        //console.log(productObj);
        
        if ((undefined !== product_id && product_id != '') && (undefined !== operation_value && operation_value != '')
        ) {
            if (operation_value == 1) {
                keyword = 'Activation';
                product_status_id = 1;
            } else if (operation_value == 2) {
                keyword = 'Deactivation';
                product_status_id = 2;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }

                con.query(query, [product_status_id, product_id], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error with product ' + keyword;
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Product ' + keyword + ' successful';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedProductId: product_id
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Product data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }
    };
}

module.exports = new Product();