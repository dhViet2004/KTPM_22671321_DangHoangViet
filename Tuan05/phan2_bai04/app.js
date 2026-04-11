const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Chào mừng bạn đến với ứng dụng Node.js chạy bằng Docker!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});