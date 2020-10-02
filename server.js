const express = require('express');
const PORT = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
    res.send('Hello DevConnector');
});

app.listen(PORT, () => {
    console.log(`App started and listening on port ${PORT}`);
});
