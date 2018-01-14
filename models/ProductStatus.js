var connection = require('../config/connection');

function ProductStatus() {
  //get all product statuses.
  this.getAll = function (res) {
    var output = {},
      query = 'SELECT * FROM product_status';

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
              product_statuses: result
            };
          } else {
            output = {
              status: 0,
              message: 'No product status found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //get a single product status.
  this.getOne = function (id, res) {
    var output = {},
      query = 'SELECT * FROM product_status WHERE product_status_id = ?';

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
              product_status: result[0]
            };
          } else {
            output = {
              status: 0,
              message: 'No such product status found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //create product status.
  this.create = function (productTypeObj, res) {
    var output = {},
      query = "INSERT iNTO product_status(product_status_name, product_status_desc) VALUES(?,?)";
    var feedback, product_status_name = productTypeObj.product_status_name, product_status_desc = productTypeObj.product_status_desc;

    if ((undefined !== product_status_name && product_status_name != '') && (undefined !== product_status_desc && product_status_desc != '')) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(query, [product_status_name, product_status_desc], function (err, result) {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'Product status successfully created';
            output = {
              status: 1,
              message: feedback,
              createdProductStatusId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid Product status data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update product status.
  this.update = function (productTypeObj, res) {
    var output = {},
      queryFind = 'SELECT * FROM product_status WHERE product_status_id = ?',
      query = "UPDATE product_status SET product_status_name = ?, product_status_desc = ? WHERE product_status_id = ?";
    var feedback, product_status_name = productTypeObj.product_status_name, product_status_desc = productTypeObj.product_status_desc, 
      product_status_id = productTypeObj.product_status_id;

    if ((undefined !== product_status_name && product_status_name != '') && (undefined !== product_status_desc && product_status_desc != '') && (undefined !== product_status_id && product_status_id != '')) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(queryFind, product_status_id, function (err, result) {
          con.release();
          if (err) {
            res.json(err);
          } else {
            if (result.length > 0) {
              //Update.
              connection.acquire(function (err, con) {
                if (err) {
                  res.json({
                    status: 100,
                    message: "Error in connection database"
                  });
                  return;
                }

                con.query(query, [product_status_name, product_status_desc, product_status_id], function (err, result) {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'Product status successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedproductTypeName: product_status_name
                    };
                    res.json(output);
                  }
                });
              });
            } else {
              output = {
                status: 0,
                message: 'No Product status with such Id found'
              };
              res.json(output);
            }

          }
        });
      });

    } else {
      feedback = 'Invalid Product status data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };
}

module.exports = new ProductStatus();