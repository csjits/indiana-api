var md5 = require('MD5');

exports.getAge = function(date) {
    var now = new Date();
    var age = new Date() - date;
    if (age > 86400e3) return Math.floor(age / 86400e3) + 'd';
    if (age > 3600e3) return Math.floor(age / 3600e3) + 'h';
    if (age > 60e3) return Math.floor(age / 60e3) + 'min';
    return Math.floor(age / 1e3)  + 's';
};

exports.getDistance = function(distance, precision) {
    var multiplier = Math.pow(10, precision)
    return Math.ceil((distance || 1e-6) * multiplier) / multiplier;
};

exports.hot = function(ups, downs, date, multi) {
    var score = ups - downs;
    var order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
    var sign = score > 0 ? 1: score < 0 ? -1 : 0;
    var seconds = (date - new Date(2015, 1, 1)) / 1000;
    var product = (multi || 1) * sign * order + seconds / 45000;
    return Math.round(product * 10e6) / 10e6;
};

exports.token = function(user, salt) {
    return md5(user + salt);
};

exports.isValidLocation = function(long, lat) {
    if (!long || !lat) return false;
    if (isNaN(parseFloat(long)) || isNaN(parseFloat(lat))) return false;
    return true;
}
