var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    message: String,
    ups: Number,
    downs: Number,
    date: {type: Date, default: Date.now},
    rank: {type: Number, default: 0},
    loc: [Number, Number]
});

PostSchema.virtual('score').get(function() {
    return this.ups - this.downs;
});

PostSchema.path('message').validate(function(v) {
    return v != null;
});

module.exports = mongoose.model('Post', PostSchema);
