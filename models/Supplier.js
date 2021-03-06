const connection = require('../config/connection');

function Supplier() {
    //get all suppliers.
    this.getAll = (res) => {
        let output = {},
            query = 'SELECT * FROM supplier';

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
    this.getOne = (supplierId, res) => {
        let output = {},
            query = 'SELECT * FROM supplier WHERE supplier_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, supplierId, (err, result) => {
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
    this.create = (supplierObj, res) => {
        let output = {},
            feedback, query = "INSERT iNTO supplier VALUES(?,?,?,?,?)";
        let supplier_name = supplierObj.supplier_name,
            supplier_location = supplierObj.supplier_location,
            supplier_phone = supplierObj.supplier_phone,
            supplier_email = supplierObj.supplier_email;

        if ((undefined !== supplier_name && supplier_name != '') && (undefined !== supplier_location && supplier_location != '') &&
            (undefined !== supplier_phone && supplier_phone != '') && (undefined !== supplier_email && supplier_email != '')
        ) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [null, supplier_name, supplier_location, supplier_phone, supplier_email], (err, result) => {
                    con.release();
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            output = {
                                status: 0,
                                message: 'Supplier with such name/phone/email already exists',
                                error: err
                            };
                        }
                        else{
                            output = {
                                status: 0,
                                message: 'Error adding supplier',
                                error: err
                            };
                        }
                        
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
    this.update = (supplierObj, res) => {
        let output = {},
            feedback, query = "UPDATE supplier SET supplier_name=?, supplier_location=?, supplier_phone=?, supplier_email=? WHERE supplier_id=?";
        let supplier_name = supplierObj.supplier_name,
            supplier_location = supplierObj.supplier_location,
            supplier_phone = supplierObj.supplier_phone,
            supplier_email = supplierObj.supplier_email,
            supplier_id = supplierObj.supplier_id;

        if ((undefined !== supplier_name && supplier_name != '') && (undefined !== supplier_location && supplier_location != '') &&
            (undefined !== supplier_phone && supplier_phone != '') && (undefined !== supplier_email && supplier_email != '') &&
            (undefined !== supplier_id && supplier_id != '')
        ) {
            connection.acquire((err, con) => {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error in connection database"
                    });
                    return;
                }

                con.query(query, [supplier_name, supplier_location, supplier_phone, supplier_email, supplier_id], (err, result) => {
                    con.release();
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            output = {
                                status: 0,
                                message: 'Supplier with such name/phone/email already exists',
                                error: err
                            };
                        }
                        else{
                            output = {
                                status: 0,
                                message: 'Error updating supplier',
                                error: err
                            };
                        }

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