const express = require('express');
const connectDatabase = require('./config/db');


const PORT = process.env.PORT || 3000;

const app = express();
connectDatabase();

app.use(express.json({extended: false}));

app.get('/', (req, res) => {
    res.send('Hello DevConnector');
});

// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => {
    console.log(`App started and listening on port ${PORT}`);
});
