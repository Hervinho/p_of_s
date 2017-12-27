var connection = require('../config/connection');

function Product() {
    //get all products.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM product';

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

    //get a specific product.
    this.getOne = function (productId, res) {
        var output = {},
            query = 'SELECT * FROM product WHERE product_id = ?';

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
            feedback, query = "INSERT INTO product VALUES(?,?,?,?,?)";
        var product_type_id = productObj.product_type_id,
            product_name = productObj.product_name,
            product_price = productObj.product_price,
            product_desc = productObj.product_desc;

        if ((undefined !== product_type_id && product_type_id != '') && (undefined !== product_name && product_name != '') &&
            (undefined !== product_price && product_price != '') && (undefined !== product_desc && product_desc != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, product_type_id, product_name, product_desc, product_price], function (err, result) {
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
}

module.exports = new Product();