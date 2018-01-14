var connection = require('../config/connection');

function Role() {
  //get all roles.
  this.getAll = function (res) {
    var output = {}, query = 'SELECT * FROM role';

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
            output = {status: 1, roles: result};
        }
        else{
            output = {status: 0, message:'No roles found'};
        }
        res.json(output);
        }
      });
    });
  };

  //get a single role.
  this.getOne = function (id, res) {
    var output = {}, query = 'SELECT * FROM role WHERE Role_id = ?';

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
          output = {status: 1, role: result[0]};
      }
      else{
          output = {status: 0, message:'No such role found'};
      }
      res.json(output);
      }
      });
    });
  };

  //create role.
  this.create = function (roleObj, res) {
    var output = {},
      query = "INSERT iNTO role(role_name, role_desc) VALUES(?,?)";
    var feedback, role_name = roleObj.role_name, role_desc = roleObj.role_desc;

    if ((undefined !== role_name && role_name != '') && (undefined !== role_desc && role_desc != '')) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(query, [role_name, role_desc], function (err, result) {
          con.release();
          if (err) {
            res.json(err);
          } else {
            feedback = 'Role successfully created';
            output = {
              status: 1,
              message: feedback,
              createdRoleId: result.insertId
            };
            res.json(output);
          }
        });
      });
    } else {
      feedback = 'Invalid Role data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };

  //update role.
  this.update = function (roleObj, res) {
    var output = {},
      queryFind = 'SELECT * FROM role WHERE role_id = ?',
      query = "UPDATE role SET role_name = ?, role_desc = ? WHERE role_id = ?";
    var feedback, role_name = roleObj.role_name, role_desc = roleObj.role_desc, role_id = roleObj.role_id;

    if ((undefined !== role_name && role_name != '') && (undefined !== role_desc && role_desc != '') && (undefined !== role_id && role_id != '')) {
      connection.acquire(function (err, con) {
        if (err) {
          res.json({ status: 100, message: "Error in connection database" });
          return;
        }

        con.query(queryFind, role_id, function (err, result) {
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

                con.query(query, [role_name, role_desc, role_id], function (err, result) {
                  con.release();
                  if (err) {
                    res.json(err);
                  } else {
                    feedback = 'Role successfully updated';
                    output = {
                      status: 1,
                      message: feedback,
                      updatedRoleName: role_name
                    };
                    res.json(output);
                  }
                });
              });
            } else {
              output = {
                status: 0,
                message: 'No Role with such Id found'
              };
              res.json(output);
            }

          }
        });
      });

    } else {
      feedback = 'Invalid Role data submitted';
      output = {
        status: 0,
        message: feedback
      };
      res.json(output);
    }


  };
}

module.exports = new Role();