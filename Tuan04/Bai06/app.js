const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello từ Multi-stage Build!'));
app.listen(3000, () => console.log('Chạy trên cổng 3000'));
