var connection = require('../config/connection');

function Gender() {
  //get all statuses.
  this.getAll = function (res) {
    var output = {}, query = 'SELECT * FROM gender';

    connection.acquire(function (err, con) {
      if (err) {
        res.json({ status: 100, message: "Error in connection database" });
        return;
      }
      
      con.query(query, function (err, result) {
        con.release();
        if(err){
            res.json(err);
        }
        else{
          if(result.length > 0){
            output = {status: 1, Genders: result};
        }
        else{
            output = {status: 0, message:'No genders found'};
        }
        res.json(output);
        }
      });
    });
  };

  //get a single gender.
  this.getOne = function (id, res) {
    var output = {}, query = 'SELECT * FROM gender WHERE gender_id = ?';

    connection.acquire(function (err, con) {
      if (err) {
        res.json({ status: 100, message: "Error in connection database" });
        return;
      }

      con.query(query, id, function (err, result) {
        con.release();
        if(err){
          res.json(err);
      }
      else{
        if(result.length > 0){
          output = {status: 1, Gender: result[0]};
      }
      else{
          output = {status: 0, message:'No such gender found'};
      }
      res.json(output);
      }
      });
    });
  };

  //create gender.
  this.create = function (genderObj, res) {
    var output = {},
      query = "INSERT iNTO gender(gender_name) VALUES(?)";
    var feedback, gender_name = genderObj.gender_name;

    if (undefined !== gender_name && gender_name != '') {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(query, [gender_name], function (err, result) {
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
  this.update = function (genderObj, res) {
    var output = {},
      queryFind = 'SELECT * FROM gender WHERE gender_id = ?',
      query = "UPDATE gender SET gender_name = ? WHERE gender_id = ?";
    var feedback, gender_name = genderObj.gender_name,
      gender_id = genderObj.gender_id;

    if (undefined !== gender_name && gender_name != '' && undefined !== gender_id && gender_id != '') {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(queryFind, gender_id, function (err, result) {
          con.release();
          if (err) {
            res.json(err);
          } else {
            if (result.length > 0) {
              //Update.
              connection.acquire(function (err, con) {
                if (err) {
                  res.json({ status: 100, message: "Error in connection database" });
                  return;
                }

                con.query(query, [gender_name, gender_id], function (err, result) {
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