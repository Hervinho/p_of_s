var connection = require('../config/connection');

function CardPayment() {

    //get all details of all bank cards used for orders.
    this.getAll = function (res) {
        var output = {},
            query = 'SELECT * FROM card_payment ' +
            'LEFT JOIN customer_order ON card_payment.order_id = customer_order.customer_order_id';

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
                            card_payments: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No card payments found'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

    //get all details of all bank cards used for a certain order.
    this.getOnePerOrder = function (orderId, res) {
        var output = {},
            query = 'SELECT * FROM card_payment WHERE order_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, [orderId], function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            card_payments: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No card payments for the given order was found.'
                        };
                    }
                    res.json(output);
                }
            });
        });
    };

}

module.exports = new CardPayment();