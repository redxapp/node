const mysql = require('mysql');

const conn = mysql.createConnection({
  host: "sql12.freemysqlhosting.net",
  user: "sql12673035",
  password: "3vALFxvnM2",
  database: "sql12673035"
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
