var connection = require('../config/connection');
var moment = require('moment'),
    request = require('request');
var emailAPI = "http://54.210.132.91:6060/notifications/email";
var Customer = require('./Customer');

//Function to build query string for order details.
var buildQuery = function (array, promotionId) {
    var string = '';
    for (var index = 0; index < array.length; index++) {
        if (index == array.length - 1) {
            string += "(" + promotionId + ", " + 
                array[index].product_id + ")";
        } else {
            string += "(" + promotionId + ", " + 
                array[index].product_id + "),";
        }
    }

    return string;
};

//function to update promo products.
var updatePromotionProducts = function (array, promotionId, callback) {
    var output = {},
        queryDelete = "DELETE FROM promotion_product WHERE promotion_id = ?",
        queryInsert = "INSERT INTO promotion_product (promotion_id,product_id) VALUES";
    console.log('array: ', array);//TEST here when shit goes funny.
    connection.acquire(function (err, con) {
        if (err) {
            output = {
                status: 100,
                message: "Error connecting to database"
            };

            callback(null, output);
        }

        con.query(queryDelete, [promotionId], function (errDelete, resultDelete) {
            con.release();
            if (err) {
                output = {
                    status: 0,
                    message: "Error deleting promotion products",
                    error: errDelete
                };

                callback(null, output);
            } else {
                console.log('Promo products successfully deleted.');

                //Now insert new products for this promo.
                var builtQueryString = buildQuery(array, promotionId);
                queryInsert += builtQueryString;
                console.log(queryInsert);

                connection.acquire(function (err, con) {
                    if (err) {
                        output = {
                            status: 100,
                            message: "Error connecting to database"
                        };
            
                        callback(null, output);
                    }
            
                    con.query(queryInsert, function (errInsert, resultInsert) {
                        con.release();
                        if (err) {
                            console.log(err.code);
                            output = {
                                status: 0,
                                message: "Error updating promotion products",
                                error: errInsert
                            };
            
                            callback(null, output);
                        } else {
                            console.log('Promo products successfully updated.');
                            console.log('resultInsert: ', resultInsert);
                            output = {
                                status: 1,
                                message: 'Promo products successfully updated.'
                            };

                            callback(null, output);
                        }
                    });
                });
            }
        });
    });
};

function Promotion() {
    //get all promotions.
    this.getAll = function (res) {
        var output = {},
            query = "SELECT * FROM promotion LEFT JOIN employee ON promotion.added_by = employee.employee_id";

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
    this.getPerStatus = function (statusId, res) {
        var output = {},
            query;

        if (statusId == 1) {
            query = "SELECT * FROM promotion LEFT JOIN employee ON promotion.added_by = employee.employee_id WHERE promotion_status_id = 1 AND valid_to_date > CURDATE()";
        } else if (statusId == 2) {
            query = "SELECT * FROM promotion LEFT JOIN employee ON promotion.added_by = employee.employee_id WHERE promotion_status_id = 2";
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

    //get all promotions of a certain type.
    this.getPerProduct = function(productId, res){
        var output = {}, query = "SELECT * FROM promotion " +
            "LEFT JOIN promotion_product ON promotion.promotion_id = promotion_product.promotion_id " +
            "LEFT JOIN employee ON promotion.added_by = employee.employee_id " +
            "WHERE promotion_product.product_id = ?";

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error connecting to database"
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
                            promotions: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No such promotions of such product found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get a specific promotion.
    this.getOne = function (id, res) {
        var output = {}, promoProducts = [];
            query = "SELECT * FROM promotion LEFT JOIN employee ON promotion.added_by = employee.employee_id WHERE promotion_id = ?",
            queryDetails = "SELECT * FROM promotion_product LEFT JOIN product ON promotion_product.product_id = product.product_id " +
                "WHERE promotion_product.promotion_id = ?";

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

                        connection.acquire(function (err, con) {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error connecting to database"
                                });
                                return;
                            }
                
                            con.query(queryDetails, [id], function (err, resultDetails) {
                                con.release();
                                if (err) {
                                    output = {
                                        status: 0,
                                        message: "Error getting promotion products",
                                        error:err
                                    };

                                    res.json(output);
                                    return;

                                } else {
                                    //console.log('Res: ', resultDetails);
                                    if(resultDetails.length > 0){
                                        output = {
                                            status: 1,
                                            promotion: result[0],
                                            products:resultDetails
                                        };
                                    }
                                    else{
                                        output = {
                                            status: 1,
                                            promotion: result[0],
                                            products:null
                                        };
                                    }

                                    res.json(output);
                                    return;
                                }
                            });
                        });

                    } else {
                        output = {
                            status: 0,
                            message: 'No such promotion found'
                        };

                        res.json(output);
                        return;
                    }
                    
                }
            });
        });
    };

    //create promotion.
    this.create = function (promotionObj, res) {
        var output = {},
            query = "INSERT INTO promotion VALUES(?,?,?,?,?,?,?,?)",
            queryInsert = "INSERT INTO promotion_product (promotion_id,product_id) VALUES",
            today = moment().format('YYYY-MM-DD'), insertedPromotionId;
        var promotion_name = promotionObj.promotion_name,
            promotion_desc = promotionObj.promotion_desc,
            promotion_status_id = 2,
            products = promotionObj.products,
            valid_from_date = promotionObj.valid_from_date,
            valid_to_date = promotionObj.valid_to_date,
            promotion_price = promotionObj.promotion_price,
            added_by = promotionObj.employee_id;

        if ((undefined !== promotion_name && promotion_name != '') && (undefined !== promotion_desc && promotion_desc != '') &&
            (undefined !== valid_from_date && valid_from_date != '') && (undefined !== valid_to_date && valid_to_date != '') &&
            (undefined !== promotion_price && promotion_price != '') && (undefined !== added_by && added_by != '')
        ) {
            //Convert dates to moment formats.
            valid_from_date = moment(valid_from_date).format('YYYY-MM-DD');
            valid_to_date = moment(valid_to_date).format('YYYY-MM-DD');

            if (valid_from_date < today || valid_to_date < today) {
                feedback = "Dates must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            } else if (valid_from_date > valid_to_date) {
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
                    valid_to_date, promotion_price, added_by
                ], function (err, result) {
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
                        insertedPromotionId = result.insertId;
                        
                        //insert into promotion_product bridge table.
                        var builtQueryString = buildQuery(products, insertedPromotionId);
                        queryInsert += builtQueryString;
                        console.log(queryInsert);
                        
                        connection.acquire(function (err, con) {
                            if (err) {
                                res.json({
                                    status: 100,
                                    message: "Error connecting to database"
                                });
                                return;
                            }
                
                            con.query(queryInsert, function (err, result) {
                                con.release();
                                if (err) {
                                    console.log('Error: ', err.code);
                                } else {
                                    console.log('Promo products Successfully inserted.');
                                }
                            });
                        });
                        
                        feedback = 'Promotion successfully added';
                        output = {
                            status: 1,
                            message: feedback,
                            id: insertedPromotionId
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Promotion data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }

    };

    //update promotion.
    this.update = function (promotionObj, res) {
        var output = {},
            today = moment().format('YYYY-MM-DD'),
            query = "UPDATE promotion SET promotion_name=?, promotion_desc=?, " +
            "valid_from_date=?, valid_to_date=?, promotion_price=? WHERE promotion_id=?";
        var promotion_name = promotionObj.promotion_name,
            promotion_desc = promotionObj.promotion_desc,
            products = promotionObj.products,
            promotion_id = promotionObj.promotion_id,
            valid_from_date = promotionObj.valid_from_date,
            valid_to_date = promotionObj.valid_to_date,
            promotion_price = promotionObj.promotion_price;

        if ((undefined !== promotion_name && promotion_name != '') && (undefined !== promotion_desc && promotion_desc != '') &&
            (undefined !== valid_from_date && valid_from_date != '') && (undefined !== valid_to_date && valid_to_date != '') &&
            (undefined !== promotion_price && promotion_price != '') && (undefined !== promotion_id && promotion_id != '')
        ) {
            //Convert dates to moment formats.
            valid_from_date = moment(valid_from_date).format('YYYY-MM-DD');
            valid_to_date = moment(valid_to_date).format('YYYY-MM-DD');

            if (valid_from_date < today || valid_to_date < today) {
                feedback = "Dates must not be prior to current date";
                res.json({
                    status: 0,
                    message: feedback
                });
                return;
            } else if (valid_from_date > valid_to_date) {
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
                    promotion_id
                ], function (err, result) {
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

                        //Delete current promo products first, then update with the new ones.
                        updatePromotionProducts(products, promotion_id, function(errUpdate, resultUpdate){
                            console.log(errUpdate || resultUpdate);
                        });

                        output = {
                            status: 1,
                            message: feedback,
                            updatedPromotionId: promotion_id
                        };

                        res.json(output);
                    }
                });
            });
        } else {
            feedback = 'Invalid Promotion data submitted';
            output = {
                status: 0,
                message: feedback
            };

            res.json(output);
        }

    };

    //change promotion status.
    this.updateStatus = function (promotionObj, res) {
        var promotion_id = promotionObj.promotion_id,
            operation_value = promotionObj.operation_value,
            promotion_name = promotionObj.promotion_name,
            promotion_price = promotionObj.promotion_price,
            keyword, promotion_status_id,
            query = "UPDATE promotion SET promotion_status_id=? WHERE promotion_id=?";
        var emailList;
        //console.log(promotionObj);
        
        if ((undefined !== promotion_id && promotion_id != '') && (undefined !== operation_value && operation_value != '') &&
            (undefined !== promotion_name && promotion_name != '')
        ) {
            if (operation_value == 1) {
                keyword = 'Activation';
                promotion_status_id = 1;
            } else if (operation_value == 2) {
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

                        //Only email if promotion is activated
                        if (operation_value == 1) {
                            //Get email list.
                            emailList = Customer.getEmailList(function (err, result) {
                                //console.log(result.emails);
                                var emailArray = result.emails;
                                var messageObj = {
                                    subject: 'New promo',
                                    content: ['Product Name : ' + promotion_name, 'Price: R' + promotion_price]
                                };

                                //Send to each email in the customer emails array.
                                emailArray.forEach(function (email) {
                                    messageObj.destination = email.customer_email;
                                    request.post(emailAPI, {
                                        body: JSON.stringify(messageObj),
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                    }, function (error, response, body) {
                                        if (error) {
                                            console.log(err);

                                        } else if (response && response.statusCode == 200) {
                                            console.log('Email successfully sent to: ', email.customer_email);
                                        }

                                    });
                                });
                            });
                        }
                        else{
                            console.log(feedback);
                        }

                        res.json(output);
                    }
                });
            });
        } else {
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