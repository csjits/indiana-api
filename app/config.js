var configProduction = require('./config-production');

var config= {};

config.compName = process.env.COMPUTERNAME || process.env.COMPUTER_NAME || '';

config.mongodbPath = configProduction.mongodbPath;
config.salts = configProduction.salts;
if (config.compName === 'DENKBOX' || config.compName === 'ULTRABRETT') {
    config.mongodbPath = 'mongodb://localhost/indiana';
    config.salt = 'ABC123';
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

// Block IPs on frequent token requests
config.limiter = {
    windowMs: 1440e3,
    delayMs: 0,
    max: 5,
    global: false
};

module.exports = config;
