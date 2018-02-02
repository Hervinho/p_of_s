var mysql = require('mysql');

function Connection() {

    this.pool = null;
    this.init = () => {
        this.pool = mysql.createPool({
            connectionLimit: 1500,
            host: '127.0.0.1',
            user: 'root',
            password: 'aXWSIWFePYs9',
            //password: '',
            dateStrings: 'date',
            database: 'pheme'
        });
    };

    this.acquire = (callback) => {
        this.pool.getConnection((err, connection) => {
            callback(err, connection);
        });
    };
}

module.exports = new Connection();