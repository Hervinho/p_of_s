var connection = require('../config/connection');
var moment = require('moment');

function Promotion(){
    //get all promotions.
    this.getAll = function(res){
        var output = {},
            query = "SELECT * FROM promotion";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
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
                            promotions: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No promotions found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all promotions of a certain status.
    this.getPerStatus = function(statusId, res){
        var output = {}, query;

        if(statusId == 1){
            query = "SELECT * FROM promotion WHERE promotion_status_id = 1 AND valid_to_date > CURDATE()";
        }
        else if(statusId == 2){
            query = "SELECT * FROM promotion WHERE promotion_status_id = 2";
        }

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
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
                            promotions: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such promotions found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific promotion.
    this.getOne = function(id, res){
        var output = {},
            query = "SELECT * FROM promotion WHERE promotion_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
                });
                return;
            }

            con.query(query, [id], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            promotion: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such promotion found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //create promotion.
    this.create = function(promotionObj, res){
        var output = {}, query = "INSERT INTO promotion VALUES(?,?,?,?,?,?,?)", today = moment().format('YYYY-MM-DD');
        var promotion_name = promotionObj.promotion_name, promotion_desc = promotionObj.promotion_desc, 
            promotion_status_id = 2, valid_from_date = promotionObj.valid_from_date, 
            valid_to_date = promotionObj.valid_to_date, promotion_price = promotionObj.promotion_price;

        if((undefined !== promotion_name && promotion_name != '') && (undefined !== promotion_desc && promotion_desc != '') &&
            (undefined !== valid_from_date && valid_from_date != '') && (undefined !== valid_to_date && valid_to_date != '') && 
            (undefined !== promotion_price && promotion_price != '')
        ){
            //Convert dates to moment formats.
            valid_from_date = moment(valid_from_date).format('YYYY-MM-DD');
            valid_to_date = moment(valid_to_date).format('YYYY-MM-DD');

            if(valid_from_date < today || valid_to_date < today){
                feedback = "Dates must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }
            else if(valid_from_date > valid_to_date){
                feedback = "Valid from Date must not be greater than valid to Date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [null, promotion_name, promotion_desc, promotion_status_id, valid_from_date, 
                    valid_to_date, promotion_price], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error adding new promotion';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Promotion successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            insertedPromotionId: result.insertId
                        };

                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Promotion data submitted';
            output = {
                status: 0,
                message: feedback
            };
    
            res.json(output);
        }
        
    };

    //update promotion.
    this.update = function(promotionObj, res){
        var output = {}, today = moment().format('YYYY-MM-DD'), query = "UPDATE promotion SET promotion_name=?, " + 
            "promotion_desc=?, valid_from_date=?, valid_to_date=?, promotion_price=? WHERE promotion_id=?";
        var promotion_name = promotionObj.promotion_name, promotion_desc = promotionObj.promotion_desc, 
            promotion_id = promotionObj.promotion_id, valid_from_date = promotionObj.valid_from_date, 
            valid_to_date = promotionObj.valid_to_date, promotion_price = promotionObj.promotion_price;

        if((undefined !== promotion_name && promotion_name != '') && (undefined !== promotion_desc && promotion_desc != '') &&
            (undefined !== valid_from_date && valid_from_date != '') && (undefined !== valid_to_date && valid_to_date != '') && 
            (undefined !== promotion_price && promotion_price != '') && (undefined !== promotion_id && promotion_id != '')
        ){
            //Convert dates to moment formats.
            valid_from_date = moment(valid_from_date).format('YYYY-MM-DD');
            valid_to_date = moment(valid_to_date).format('YYYY-MM-DD');

            if(valid_from_date < today || valid_to_date < today){
                feedback = "Dates must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }
            else if(valid_from_date > valid_to_date){
                feedback = "Valid from Date must not be greater than valid to Date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [promotion_name, promotion_desc, valid_from_date, valid_to_date, promotion_price, 
                    promotion_id], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error updating promotion';
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Promotion successfully updated';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedPromotionId: result.insertId
                        };

                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Promotion data submitted';
            output = {
                status: 0,
                message: feedback
            };
    
            res.json(output);
        }
        
    };

    //change promotion status.
    this.updateStatus = function(promotionObj, res){
        var promotion_id = promotionObj.promotion_id, op_value = promotionObj.operation_value,
            keyword, promotion_status_id, query = "UPDATE promotion SET promotion_status_id=? WHERE promotion_id=?";
        
        if((undefined !== promotion_id && promotion_id != '') && (undefined !== op_value && op_value != '')){
            if (op_value == 1) {
                keyword = 'Activation';
                promotion_status_id = 1;
            } else if (op_value == 0) {
                keyword = 'Deactivation';
                promotion_status_id = 2;
            }

            connection.acquire(function (err, con) {
                if (err) {
                    res.json({
                        status: 100,
                        message: "Error connecting to database"
                    });
                    return;
                }
    
                con.query(query, [promotion_status_id, promotion_id], function (err, result) {
                    con.release();
                    if (err) {
                        feedback = 'Error with promotion ' + keyword;
                        output = {
                            status: 0,
                            message: feedback,
                            error: err
                        };

                        res.json(output);
                    } else {
                        feedback = 'Promotion ' + keyword + ' successful';
                        output = {
                            status: 1,
                            message: feedback,
                            updatedPromotionId: promotion_id
                        };

                        res.json(output);
                    }
                });
            });
        }
        else{
            feedback = 'Invalid Promotion data submitted';
            output = {
                status: 0,
                message: feedback
            };
    
            res.json(output);
        }
    };
}

module.exports = new Promotion();