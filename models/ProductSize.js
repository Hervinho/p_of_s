var connection = require('../config/connection');

function ProductSize() {
  //get all product sizes.
  this.getAll = function (res) {
    var output = {},
      query = 'SELECT * FROM product_size';

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
              product_sizees: result
            };
          } else {
            output = {
              status: 0,
              message: 'No product size found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //get a single product size.
  this.getOne = function (id, res) {
    var output = {},
      query = 'SELECT * FROM product_size WHERE product_size_id = ?';

    connection.acquire(function (err, con) {
      if (err) {
        res.json({
          status: 100,
          message: "Error in connection database"
        });
        return;
      }

      con.query(query, id, function (err, result) {
        con.release();
        if (err) {
          res.json(err);
        } else {
          if (result.length > 0) {
            output = {
              status: 1,
              product_size: result[0]
            };
          } else {
            output = {
              status: 0,
              message: 'No such product size found'
            };
          }
          res.json(output);
        }
      });
    });
  };
}

module.exports = new ProductSize();