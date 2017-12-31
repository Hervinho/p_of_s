var connection = require('../config/connection');

function CustomerOrderDetails() {
    //get details (products, amount) of a specific order.
    this.getOne = function (orderId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order_details ' +
                'LEFT JOIN product ON customer_order_details.product_id = product.product_id ' +
                'WHERE customer_order_id = ?';

        connection.acquire(function (err, con) {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, orderId, function (err, result) {
                con.release();
                if (err) {
                    res.json(err);
                } else {
                    if (result.length > 0) {
                        output = {
                            status: 1,
                            customer_order_details: result
                        };
                    } else {
                        output = {
                            status: 0,
                            message: 'No data found'
                        };
                    }
                    //console.log(output);
                    res.json(output);
                }
            });
        });
    };
}

module.exports = new CustomerOrderDetails();