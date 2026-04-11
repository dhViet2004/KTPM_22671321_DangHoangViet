const express = require('express');
const mysql = require('mysql2');
const app = express();

// Cấu hình kết nối - Lưu ý host là 'db' (tên service trong compose)
const connection = mysql.createConnection({
  host: 'db',
  user: 'user',
  password: 'password',
  database: 'mydb'
});

app.get('/', (req, res) => {
  connection.query('SELECT "Kết nối thành công!" AS message', (err, results) => {
    if (err) {
      res.status(500).send("Lỗi kết nối DB: " + err.message);
    } else {
      res.send(`<h1>${results[0].message}</h1>`);
    }
  });
});

app.listen(3000, () => console.log('App chạy ở cổng 3000'));