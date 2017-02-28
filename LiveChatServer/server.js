
 express = require('express');
 app = express();
 //wrap our express app in a http server
 server = require('http').createServer(app);
 //import modules socket-io
 io = require('socket.io')(server);
 path = require('path');
 mongoose = require('mongoose');
 var userID = 1;

//connect to the mongo service to the database 'chat' stored on the mongodb servicem on my private device
 mongoose.connect('192.168.1.193:8080/chat');

//set the path for where the views are
 app.set('views',path.join(__dirname,"views"));
 //set rendering view engine in this case ejs
 app.set('view engine','ejs');
 //set static files path
 app.use(express.static(__dirname+"/public"));

//open connection to mongodb and have db be our connection variable
 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));

 //connected to db set up schema
 //the chatSchema stores two values
 var chatSchema = mongoose.Schema({
   user:String,
   message:String
 });

 //set up model
 var Message = mongoose.model('Message',chatSchema);

 //open database
 db.once('open',()=>{
   console.log("Connected to db!");
 });

 app.get('/',(req,res)=>{
   res.render('index');
 });

 //set up sockets stuff
 io.on('connection',(client)=>{
   console.log("Client connected");
   //assign a newly connected client a unique id
   client.emit('user-assign',{userID:"User"+userID});
   userID++;
   //send messages to each Client
   Message.find((err,messages)=>{
     messages.forEach((message)=>{
       client.emit('receive-message',{user:message.user,
         message:message.message});
     });
   });

   client.on('send-message',(data)=>{
     console.log("New message received!");
     //creating a new mongoose model object with the json data
     var newMessage = new Message(data);
     //saving that data to the database
     newMessage.save((err)=>{
       if(err) console.log(err);
     });
     //emit the data on the receive-message channel to all sockets
     io.sockets.emit('receive-message',data);
   });
 });

//make the server listen since the express app is wrapped in the server
server.listen(8090,()=>{
  console.log("Server running...");
});
