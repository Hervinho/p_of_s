var mysql = require('mysql');

function Connection() {
    
    this.pool = null;
    this.init = function () {
        this.pool = mysql.createPool({
            connectionLimit: 1500,
            host: '127.0.0.1',
            user: 'root',
<<<<<<< HEAD
            password: '',
=======
            password: 'aXWSIWFePYs9',
>>>>>>> 2ba520d84b4ac6fea911785348698e542ba016bb
            dateStrings: 'date',
            database: 'pheme'
        });
    };

    this.acquire = function (callback) {
        this.pool.getConnection(function (err, connection) {
            callback(err, connection);
        });
    };
}

module.exports = new Connection();
