const connection = require('../config/connection');

function ProductType() {
  //get all product ype.
  this.getAll = (res) => {
    let output = {},
      query = 'SELECT * FROM product_type';

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
              product_types: result
            };
          } else {
            output = {
              status: 0,
              message: 'No product type found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //get a single product type.
  this.getOne = (id, res) => {
    let output = {},
      query = 'SELECT * FROM product_type WHERE product_type_id = ?';

    connection.acquire((err, con) => {
      if (err) {
        res.json({
          status: 100,
          message: "Error in connection database"
        });
        return;
      }

      con.query(query, id, (err, result) => {
        con.release();
        if (err) {
          res.json(err);
        } else {
          if (result.length > 0) {
            output = {
              status: 1,
              product_type: result[0]
            };
          } else {
            output = {
              status: 0,
              message: 'No such product type found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //create product type.
  this.create = (productTypeObj, res) => {
    let output = {},
      query = "INSERT iNTO product_type(product_type_name, product_type_desc) VALUES(?,?)";
    let feedback, product_type_name = productTypeObj.product_type_name,
      product_type_desc = productTypeObj.product_type_desc;

    if ((undefined !== product_type_name && product_type_name != '') && (undefined !== product_type_desc && product_type_desc != '')) {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(query, [product_type_name, product_type_desc], (err, result) => {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'Product type successfully created';
            output = {
              status: 1,
              message: feedback,
              createdProductTypeId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid Product type data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update payment method.
  this.update = (productTypeObj, res) => {
    let output = {},
      queryFind = 'SELECT * FROM product_type WHERE product_type_id = ?',
      query = "UPDATE product_type SET product_type_name = ?, product_type_desc = ? WHERE product_type_id = ?";
    let feedback, product_type_name = productTypeObj.product_type_name,
      product_type_desc = productTypeObj.product_type_desc,
      product_type_id = productTypeObj.product_type_id;

    if ((undefined !== product_type_name && product_type_name != '') && (undefined !== product_type_desc && product_type_desc != '') && (undefined !== product_type_id && product_type_id != '')) {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(queryFind, product_type_id, (err, result) => {
          con.release();
          if (err) {
            res.json(err);
          } else {
            if (result.length > 0) {
              //Update.
              connection.acquire((err, con) => {
                if (err) {
                  res.json({
                    status: 100,
                    message: "Error in connection database"
                  });
                  return;
                }

                con.query(query, [product_type_name, product_type_desc, product_type_id], (err, result) => {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'Payment Method successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedproductTypeName: product_type_name
                    };
                    res.json(output);
                  }
                });
              });
            } else {
              output = {
                status: 0,
                message: 'No Payment Type with such Id found'
              };
              res.json(output);
            }

          }
        });
      });

    } else {
      feedback = 'Invalid Payment Type data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };
}

module.exports = new ProductType();