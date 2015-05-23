var productionMongodbPath = require('./config-production');

var config= {};

config.compName = process.env.COMPUTERNAME || process.env.COMPUTER_NAME || '';

config.mongodbPath = productionMongodbPath;
if (config.compName === 'DENKBOX' || config.compName === 'ULTRABRETT') {
    config.mongodbPath = 'mongodb://localhost/indiana';
}

// HTTP port
config.port = 61017;

// Multiplier to put more weight on votes compared to Reddit's algorithm
config.voteMultiplier = 10;

// Maximum radius in meters around user to select posts in
config.maxDistance = 20000;

// Convert result distance
config.distanceMultiplier = 1/1000;

// Precision of distance (decimals)
config.distancePrecision = 1;

module.exports = config;
