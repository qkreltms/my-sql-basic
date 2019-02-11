var mysql = require('mysql');
var db_info = require('./db.template')

var db = mysql.createConnection({
  host     : db_info.host,
  user     : db_info.user,
  password : db_info.password,
  database : db_info.database
});

db.connect();

module.exports = {
    db
}