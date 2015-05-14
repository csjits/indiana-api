var configProduction = require('./config-production');

var config= {};

config.compName = process.env.COMPUTERNAME || process.env.COMPUTER_NAME || '';

config.mongodbPath = configProduction.mongodbPath;
if (config.compName === 'DENKBOX' || config.compName === 'ULTRABRETT') {
    config.mongodbPath = 'mongodb://localhost/indiana';
}

config.port = 61017;

module.exports = config;
