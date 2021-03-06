const connection = require('../config/connection');

function CustomerOrderDetails() {
    //get details (products, amount) of a specific order.
    this.getOne = (orderId, res) => {
        let output = {},
            query = 'SELECT * FROM customer_order_details ' +
                'LEFT JOIN product ON customer_order_details.product_id = product.product_id ' +
                'LEFT JOIN product_size ON customer_order_details.product_size_id = product_size.product_size_id ' +
                'LEFT JOIN topping ON customer_order_details.topping_id = topping.topping_id ' +
                'LEFT JOIN base_type ON customer_order_details.base_type_id = base_type.base_type_id ' +
                'WHERE customer_order_id = ?';

        connection.acquire((err, con) => {
            if (err) {
                res.json({
                    status: 100,
                    message: "Error in connection database"
                });
                return;
            }

            con.query(query, orderId, (err, result) => {
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