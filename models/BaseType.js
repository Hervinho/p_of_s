const connection = require('../config/connection');

function BaseType() {
  //get all base_types.
  this.getAll = (res) => {
    let output = {}, query = 'SELECT * FROM base_type';

    connection.acquire((err, con) => {
      if (err) {
        res.json({ status: 100, message: "Error in connection database" });
        return;
      }
      
      con.query(query, (err, result) => {
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
  this.getOne = (id, res) => {
    let output = {}, query = 'SELECT * FROM base_type WHERE base_type_id = ?';

    connection.acquire((err, con) => {
      if (err) {
        res.json({ status: 100, message: "Error in connection database" });
        return;
      }

      con.query(query, id, (err, result) => {
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
  this.create = (baseTypeObj, res) => {
    let output = {},
      query = "INSERT iNTO base_type(base_type_name, base_type_desc) VALUES(?,?)";
    let feedback, base_type_name = baseTypeObj.base_type_name, base_type_desc = baseTypeObj.base_type_desc;

    if ((undefined !== base_type_name && base_type_name != '') && (undefined !== base_type_desc && base_type_desc != '')) {
      connection.acquire((err, con) => {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(query, [base_type_name, base_type_desc], (err, result) => {
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
  this.update = (baseTypeObj, res) => {
    let output = {},
      queryFind = 'SELECT * FROM base_type WHERE base_type_id = ?',
      query = "UPDATE base_type SET base_type_name = ?, base_type_desc = ? WHERE base_type_id = ?";
    let feedback, base_type_name = baseTypeObj.base_type_name, base_type_desc = baseTypeObj.base_type_desc, base_type_id = baseTypeObj.base_type_id;

    if ((undefined !== base_type_name && base_type_name != '') && (undefined !== base_type_desc && base_type_desc != '') && 
        (undefined !== base_type_id && base_type_id != '')
    ) {
      connection.acquire((err, con) => {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(queryFind, base_type_id, (err, result) => {
          con.release();
          if (err) {
            res.json(err);
          } else {
            if (result.length > 0) {
              //Update.
              connection.acquire((err, con) => {
                if (err) {
                  res.json({ status: 100, message: "Error in connection database" });
                  return;
                }

                con.query(query, [base_type_name, base_type_desc, base_type_id], (err, result) => {
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