const connection = require('../config/connection');
const Audit = require('./Audit');

function Product() {
    //get all products.
    this.getAll = (res) => {
        let output = {},
            query = 'SELECT * FROM product LEFT JOIN employee ON product.added_by = employee.employee_id';

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
    this.getByType = (productTypeId, res) => {
        let output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_type_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productTypeId], (err, result) => {
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
    this.getByStatus = (productStatusId, res) => {
        let output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_status_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productStatusId], (err, result) => {
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
    this.getOne = (productId, res) => {
        let output = {},
            query = 'SELECT * FROM product  LEFT JOIN employee ON product.added_by = employee.employee_id WHERE product_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [productId], (err, result) => {
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
    this.create = (productObj, res) => {
        let output = {},
            feedback, query = "INSERT INTO product VALUES(?,?,?,?,?,?,?)";
        let product_type_id = productObj.product_type_id,
            product_status_id = 2,
            product_name = productObj.product_name,
            product_price = productObj.product_price,
            product_desc = productObj.product_desc,
            added_by = productObj.employee_id;
        let auditObj;

        if ((undefined !== product_type_id && product_type_id != '') && (undefined !== product_name && product_name != '') &&
            (undefined !== product_price && product_price != '') && (undefined !== product_desc && product_desc != '') &&
            (undefined !== added_by && added_by != '')
        ) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, product_type_id, product_status_id, product_name, product_desc, product_price, added_by], (err, result) => {
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

                        /* Insert to audit table. */
                        auditObj = {
                            employee_id: added_by,
                            action_id: 1,//create
                            description: 'Created new product: ' + product_name
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
            output = {
                status: 0,
                message: 'Invalid product data submitted'
            };

            res.json(output);
        }
    };

    //update product.
    this.update = (productObj, res) => {
        let output = {},
            feedback, query = "UPDATE product SET product_type_id=?, product_status_id=?,product_name=?, product_desc=?, product_price=? WHERE product_id=?";
        let product_type_id = productObj.product_type_id,
            product_status_id = productObj.product_status_id,
            product_name = productObj.product_name,
            product_price = productObj.product_price,
            product_desc = productObj.product_desc,
            product_id = productObj.product_id;
        let auditObj, added_by = productObj.employee_id;

        if ((undefined !== product_type_id && product_type_id != '') && (undefined !== product_name && product_name != '') &&
            (undefined !== product_price && product_price != '') && (undefined !== product_desc && product_desc != '') &&
            (undefined !== product_id && product_id != '') && (undefined !== product_status_id && product_status_id != '')
        ) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [product_type_id, product_status_id, product_name, product_desc, product_price, product_id], (err, result) => {
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

                        /* Insert to audit table. */
                        auditObj = {
                            employee_id: added_by,
                            action_id: 2,//update
                            description: 'Updated product: ' + product_name
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
            output = {
                status: 0,
                message: 'Invalid product data submitted'
            };

            res.json(output);
        }
    };
}

module.exports = new Product();