exports.getAge = function(date) {
    var now = new Date();
    var age = new Date() - date;
    if (age > 86400e3) return Math.floor(age / 86400e3) + 'd';
    if (age > 3600e3) return Math.floor(age / 3600e3) + 'h';
    if (age > 60e3) return Math.floor(age / 60e3) + 'min';
    return Math.floor(age / 1e3)  + 's';
};

exports.getDistance = function(locFirst, locSecond) {
    return 5;
}
