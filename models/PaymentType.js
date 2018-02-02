const connection = require('../config/connection');

function PaymentType() {
  //get all payment method.
  this.getAll = (res) => {
    let output = {},
      query = 'SELECT * FROM payment_type';

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
              payment_types: result
            };
          } else {
            output = {
              status: 0,
              message: 'No payment type found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //get a single payment method.
  this.getOne = (id, res) => {
    let output = {},
      query = 'SELECT * FROM payment_type WHERE payment_type_id = ?';

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
              payment_type: result[0]
            };
          } else {
            output = {
              status: 0,
              message: 'No such payment type found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //create payment_type.
  this.create = (paymentTypeObj, res) => {
    let output = {},
      query = "INSERT iNTO payment_type(payment_type_name) VALUES(?)";
    let feedback, payment_type_name = paymentTypeObj.payment_type_name;

    if (undefined !== payment_type_name && payment_type_name != '') {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(query, [payment_type_name], (err, result) => {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'Payment type successfully created';
            output = {
              status: 1,
              message: feedback,
              createdPaymentTypeId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid Payment type data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update payment method.
  this.update = (paymentTypeObj, res) => {
    let output = {},
      queryFind = 'SELECT * FROM payment_type WHERE payment_type_id = ?',
      query = "UPDATE payment_type SET payment_type_name = ? WHERE payment_type_id = ?";
    let feedback, payment_type_name = paymentTypeObj.payment_type_name,
      payment_type_id = paymentTypeObj.payment_type_id;

    if ((undefined !== payment_type_name && payment_type_name != '') && (undefined !== payment_type_id && payment_type_id != '')) {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(queryFind, payment_type_id, (err, result) => {
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

                con.query(query, [payment_type_name, payment_type_id], (err, result) => {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'Payment Method successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedPaymentTypeName: payment_type_name
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

module.exports = new PaymentType();