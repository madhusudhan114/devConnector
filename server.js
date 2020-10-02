const express = require('express');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 3000;

const app = express();
connectDatabase();

app.get('/', (req, res) => {
    res.send('Hello DevConnector');
});

app.listen(PORT, () => {
    console.log(`App started and listening on port ${PORT}`);
});
