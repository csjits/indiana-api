var productionMongodbPath = require('./config-production');

var config= {};

config.compName = process.env.COMPUTERNAME || process.env.COMPUTER_NAME || '';

config.mongodbPath = productionMongodbPath;
if (config.compName === 'DENKBOX' || config.compName === 'ULTRABRETT') {
    config.mongodbPath = 'mongodb://localhost/indiana';
}

config.port = 61017;

config.maxDistance = 20000;
config.distanceMultiplier = 1/6371;

module.exports = config;
