const mogoose = require('mongoose');
const config = require('config');

const url = config.get('mogoURI');

const connectDatabase = async () => {
    try {
        await mogoose.connect(url, { useNewUrlParser: true });
        console.log('mongo connecte successfully...');
    } catch (e) {
        console.error(e.message);
        // exit process as mongo connection faled
        process.exit(1);
    }
}

module.exports = connectDatabase;