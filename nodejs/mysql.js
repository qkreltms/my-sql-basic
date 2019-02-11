var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database : 'workbench'
});
 
connection.connect();
 
connection.query('select * from topic', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});
 
connection.end();