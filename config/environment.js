var path = require('path');
process.env.NODE_ENV = (typeof(process.env.NODE_ENV) !== 'undefined') ? process.env.NODE_ENV : 'development';
var config = require(path.resolve("config/", "environments/" + process.env.NODE_ENV));
module.exports = config;

console.log( ("Starting in " + process.env.NODE_ENV + " mode on port " + config.app.port).underline.grey );
