exports.getAge = function(date) {
    var now = new Date();
    var age = new Date() - date;
    if (age > 86400e3) return Math.floor(age / 86400e3) + 'd';
    if (age > 3600e3) return Math.floor(age / 3600e3) + 'h';
    if (age > 60e3) return Math.floor(age / 60e3) + 'min';
    return Math.floor(age / 1e3)  + 's';
};

exports.hot = function(ups, downs, date, multi) {
    var score = ups - downs;
    var order = Math.log(Math.max(Math.abs(score), 1)) / Math.LN10;
    var sign = score > 0 ? 1: score < 0 ? -1 : 0;
    var seconds = (date - new Date(2015, 1, 1)) / 1000;
    var product = (multi || 1) * sign * order + seconds / 45000;
    return Math.round(product * 10e6) / 10e6;
};
