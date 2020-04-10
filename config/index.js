if(process.env.MODE == 'dev') {
    console.log("DEV MODE")
    module.exports = require('./dev');
} else {
    module.exports = require('./prod');
}