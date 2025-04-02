const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql
    .createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    })
    .promise();

console.log("MySQL 연결 설정 완료 (promise 기반)");

module.exports = connection;
