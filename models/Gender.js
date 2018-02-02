const connection = require('../config/connection');

function Gender() {
  //get all statuses.
  this.getAll = (res) => {
    let output = {},
      query = 'SELECT * FROM gender';

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
              genders: result
            };
          } else {
            output = {
              status: 0,
              message: 'No genders found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //get a single gender.
  this.getOne = (id, res) => {
    let output = {},
      query = 'SELECT * FROM gender WHERE gender_id = ?';

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
              gender: result[0]
            };
          } else {
            output = {
              status: 0,
              message: 'No such gender found'
            };
          }
          res.json(output);
        }
      });
    });
  };

  //create gender.
  this.create = (genderObj, res) => {
    let output = {},
      query = "INSERT iNTO gender(gender_name) VALUES(?)";
    let feedback, gender_name = genderObj.gender_name;

    if (undefined !== gender_name && gender_name != '') {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(query, [gender_name], (err, result) => {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'gender successfully created';
            output = {
              status: 1,
              message: feedback,
              createdGenderId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid gender data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update gender.
  this.update = (genderObj, res) => {
    let output = {},
      queryFind = 'SELECT * FROM gender WHERE gender_id = ?',
      query = "UPDATE gender SET gender_name = ? WHERE gender_id = ?";
    let feedback, gender_name = genderObj.gender_name,
      gender_id = genderObj.gender_id;

    if (undefined !== gender_name && gender_name != '' && undefined !== gender_id && gender_id != '') {
      connection.acquire((err, con) => {
        if (err) {
          res.json({
            status: 100,
            message: "Error in connection database"
          });
          return;
        }

        con.query(queryFind, gender_id, (err, result) => {
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

                con.query(query, [gender_name, gender_id], (err, result) => {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'gender successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedGenderName: gender_name
                    };
                    res.json(output);
                  }
                });
              });
            } else {
              output = {
                status: 0,
                message: 'No gender with such Id found'
              };
              res.json(output);
            }

          }
        });
      });

    } else {
      feedback = 'Invalid gender data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };
}

module.exports = new Gender();