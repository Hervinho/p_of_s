var connection = require('../config/connection');

function Supplier() {
    //get all suppliers.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM supplier';

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
                            suppliers: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No suppliers found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a single supplier.
    this.getOne = function (supplierId, res) {
        var output = {},
            query = 'SELECT * FROM supplier WHERE supplier_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, supplierId, function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            supplier: result[0]
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such supplier found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //add new supplier.
    this.create = function (supplierObj, res) {
        var output = {},
            feedback, query = "INSERT iNTO supplier VALUES(?,?,?,?,?)";
        var supplier_name = supplierObj.supplier_name,
            supplier_location = supplierObj.supplier_location,
            supplier_phone = supplierObj.supplier_phone,
            supplier_email = supplierObj.supplier_email;

        if ((undefined !== supplier_name && supplier_name != '') && (undefined !== supplier_location && supplier_location != '') &&
            (undefined !== supplier_phone && supplier_phone != '') && (undefined !== supplier_email && supplier_email != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, supplier_name, supplier_location, supplier_phone, supplier_email], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error adding supplier',
                            error: err
                        };
                        res.json(output);
                    } else {
                        feedback = 'Supplier successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            createdSupplierId: result.insertId
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Supplier data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };

    //update supplier.
    this.update = function (supplierObj, res) {
        var output = {},
            feedback, query = "UPDATE supplier SET supplier_name=?, supplier_location=?, supplier_phone=?, supplier_email=? WHERE supplier_id=?";
        var supplier_name = supplierObj.supplier_name,
            supplier_location = supplierObj.supplier_location,
            supplier_phone = supplierObj.supplier_phone,
            supplier_email = supplierObj.supplier_email,
            supplier_id = supplierObj.supplier_id;

        if ((undefined !== supplier_name && supplier_name != '') && (undefined !== supplier_location && supplier_location != '') &&
            (undefined !== supplier_phone && supplier_phone != '') && (undefined !== supplier_email && supplier_email != '') &&
            (undefined !== supplier_id && supplier_id != '')
        ) {
            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [supplier_name, supplier_location, supplier_phone, supplier_email, supplier_id], function (err, result) {
                    con.release();
                    if (err) {
                        output = {
                            status: 0,
                            message: 'Error updating supplier',
                            error: err
                        };
                        res.json(output);
                    } else {
                        feedback = 'Supplier successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedSupplierName: supplier_name
                        };
                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Supplier data submitted';
            output = {
                status: 0,
                message: feedback
            };
            res.json(output);
        }
    };
}

module.exports = new Supplier();