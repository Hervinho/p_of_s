var connection = require('../config/connection');

function BaseType() {
  //get all base_types.
  this.getAll = function (res) {
    var output = {}, query = 'SELECT * FROM base_type';

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
            output = {status: 1, base_types: result};
        }
        else{
            output = {status: 0, message:'No base types found'};
        }
        res.json(output);
        }
      });
    });
  };

  //get a single base_type.
  this.getOne = function (id, res) {
    var output = {}, query = 'SELECT * FROM base_type WHERE base_type_id = ?';

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
          output = {status: 1, base_type: result[0]};
      }
      else{
          output = {status: 0, message:'No such base type found'};
      }
      res.json(output);
      }
      });
    });
  };

  //create base_type.
  this.create = function (baseTypeObj, res) {
    var output = {},
      query = "INSERT iNTO base_type(base_type_name, base_type_desc) VALUES(?,?)";
    var feedback, base_type_name = baseTypeObj.base_type_name, base_type_desc = baseTypeObj.base_type_desc;

    if ((undefined !== base_type_name && base_type_name != '') && (undefined !== base_type_desc && base_type_desc != '')) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(query, [base_type_name, base_type_desc], function (err, result) {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'BaseType successfully created';
            output = {
              status: 1,
              message: feedback,
              createdBaseTypeId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid Base Type data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update base_type.
  this.update = function (baseTypeObj, res) {
    var output = {},
      queryFind = 'SELECT * FROM base_type WHERE base_type_id = ?',
      query = "UPDATE base_type SET base_type_name = ?, base_type_desc = ? WHERE base_type_id = ?";
    var feedback, base_type_name = baseTypeObj.base_type_name, base_type_desc = baseTypeObj.base_type_desc, base_type_id = baseTypeObj.base_type_id;

    if ((undefined !== base_type_name && base_type_name != '') && (undefined !== base_type_desc && base_type_desc != '') && 
        (undefined !== base_type_id && base_type_id != '')
    ) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(queryFind, base_type_id, function (err, result) {
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

                con.query(query, [base_type_name, base_type_desc, base_type_id], function (err, result) {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'BaseType successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedBaseTypeName: base_type_name
                    };
                    res.json(output);
                  }
                });
              });
            } else {
              output = {
                status: 0,
                message: 'No BaseType with such Id found'
              };
              res.json(output);
            }

          }
        });
      });

    } else {
      feedback = 'Invalid BaseType data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };
}

module.exports = new BaseType();