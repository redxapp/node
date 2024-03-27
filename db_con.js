const mysql = require('mysql');


const conn = mysql.createConnection({
  host: "sql6.freemysqlhosting.net",
  user: "sql6694590",
  password: "ceWWHdwiXL",
  database: "sql6694590"
});

conn.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    if (err.code === 'ETIMEDOUT') {
      console.error('Connection timeout. Check your network and MySQL server.');
    }
    process.exit(1); // Exit the application in case of connection failure
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = conn;
