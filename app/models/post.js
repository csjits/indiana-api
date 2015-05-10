var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    message: String,
    score: {type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    loc: {lat: Number, long: Number}
});

PostSchema.path('message').validate(function(v) {
    return v != null;
});

PostSchema.path('loc.lat').validate(function(v) {
    return v != null;
})

module.exports = mongoose.model('Post', PostSchema);
