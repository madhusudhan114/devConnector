const mongoose = require('mongoose');
const config = require('config');

const url = config.get('mogoURI');

const connectDatabase = async () => {
    try {
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useUnifiedTopology', true);
        mongoose.set('useCreateIndex', true);

        await mongoose.connect(url);
        console.log('mongo connecte successfully...');
    } catch (e) {
        console.error(e.message);
        // exit process as mongo connection faled
        process.exit(1);
    }
}

module.exports = connectDatabase;