var helmet = require('helmet');
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose');
    users={};
    app.use(helmet());
var Chat = require('./models/chat');
const exhbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
server.listen(3000, function(){
    console.log("Server is running on http://localhost:3000/!");
});

mongoose.connect('mongodb://localhost/chat', function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Connected to mongodb");
    }
});

/*var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    created: {type: Date, default: Date.now}    
});

var Chat = mongoose.model('Message', chatSchema); */

 app.get('/', function(req,res){
     res.sendFile(__dirname + '/index.html');
 });


 //Set View Engine
/*app.set("views",path.join(__dirname,"views"));
app.engine("handlebars",exhbs({defaultLayout : "main"}));
app.set("view engine","handlebars");*/

 io.sockets.on('connection', function(socket){
     var query = Chat.find({});
     query.sort('-created').limit(5).exec(function(err, docs){
         if(err) throw err;
         socket.emit('load old msgs', docs);
     });

     socket.on('new user', function(data,callback){
         if(data in users){
            callback(false);
        }else{
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
        }
     });

function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
}

     socket.on('disconnect', function(data){
        console.log("Disconnected");
        if(!socket.nickname) return;
        //nicknames.splice(nicknames.indexOf(socket.nickname), 1);
        delete users[socket.nickname];
        updateNicknames();
    });

     socket.on('send message', function(data, callback){
         
         var msg = data.trim();
         if(msg.substr(0,3) === '/w '){
             
             msg = msg.substr(3);
             var ind = msg.indexOf(' ');
             if(ind !== -1){
                
                 var name = msg.substring(0, ind);
                 var msg = msg.substring(ind + 1);
                 if(name in users){
                     
                     users[name].emit('whisper', {msg:msg, nick: socket.nickname});
                     console.log('whisper!');
                 }else{
                     callback('Enter a valid user');

                 }

             }else{
                 callback('Enter a message for the whisper');
             }

         }else{
            var newMsg = new Chat({msg: msg, nick: socket.nickname});
            newMsg.save(function(err){
                if(err) throw err;
                io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
            })
         
     } 
     });
 });