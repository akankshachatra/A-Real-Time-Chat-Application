var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    created: {type: Date, default: Date.now}    
});

module.exports = mongoose.model('ChatRoom', chatSchema);