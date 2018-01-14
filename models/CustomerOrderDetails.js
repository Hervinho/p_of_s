var connection = require('../config/connection');

function CustomerOrderDetails() {
    //get details (products, amount) of a specific order.
    this.getOne = function (orderId, res) {
        var output = {},
            query = 'SELECT * FROM customer_order_details ' +
                'LEFT JOIN product ON customer_order_details.product_id = product.product_id ' +
<<<<<<< HEAD
=======
                'LEFT JOIN product_size ON customer_order_details.product_size_id = product_size.product_size_id ' +
>>>>>>> 2ba520d84b4ac6fea911785348698e542ba016bb
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
<<<<<<< HEAD
                    //console.log(output);
=======
                    
>>>>>>> 2ba520d84b4ac6fea911785348698e542ba016bb
                    res.json(output);
                }
            });
        });
    };
}

module.exports = new CustomerOrderDetails();