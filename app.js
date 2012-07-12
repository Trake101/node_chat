//load required node modules;installed in /node
var app = require('/node/node_modules/express').createServer()
var io = require('/node/node_modules/socket.io').listen(app);
var curl = require('/node/node_modules/curl');

//load global node modules
var http = require('http');
var fs = require('fs');

//load mongoose and connect to the mongo database
var mongoose = require('/node/node_modules/mongoose'),
db = mongoose.connect('mongodb://localhost/chatlog');
Schema = mongoose.Schema,
Log = new Schema({
	users	: String,
	room 	: String,
	message : String,
	time	: Number
});
LogModel = mongoose.model('Log', Log);

//set port for chat to run over	
app.listen(8080);

//routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/chat.html');
});

//usernames which are currently connected to the chat
var usernames = {};

//rooms which are currently available in chat
var rooms = ['test','test2'];
var inroom = {};

io.sockets.on('connection', function (socket) {
	
	//api callback to authenticate users	
	socket.on('auth',function(user,room,authkey){
		options = {
			host	: '', //address for callback host
			port	: 80, //most apis run over port 80, change if needed
			path	: '', //path to api on callback host
			method	: 'POST'  //method for posting callback data
		}
		
		//send request to api to authenticate
		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log(chunk);
				//if user is verified pass back to client to process login
				if(chunk!='false'){
					socket.emit('authvalid',chunk);
				}
			});
		});
		
		//log errors
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		
		// write data to request body
		req.write('data\n');
		req.write('data\n');
		req.end();
	});
	
	//add user to global list;no longer used;but may be useful later
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		
		// add the client's username to the global list
		usernames[username] = username;
	});
	
	//log in user
	socket.on('loginuser', function(username,roomname){
		// store the username in the socket session for this client
		socket.username = username;
		
		// add the client's username to the global list
		usernames[username] = username;
		
		//join room socket
		socket.join(roomname);
		socket.emit('updatechat', 'SERVER', 'you have successfully logged in');
		
		//add room to session socket and alert users in room of new user login
		socket.room=roomname;
		socket.broadcast.to(roomname).emit('updatechat', 'SERVER', socket.username+' has joined');
		var users = io.of('/'+roomname).clients();
		for(var i in users){
			inroom[i]=io.sockets.in(socket.room).sockets[users[i].id].username;	
		}
		
		//get user list in current room and list of rooms
		io.sockets.in(socket.room).emit('updateusers', inroom);
		io.sockets.in(socket.room).emit('updaterooms',rooms);
		
		//log log in to the data collection
		var timestamp = Math.round((new Date()).getTime() / 1000);
		var Message = new LogModel({
		  user		: socket.username,
		  room		: socket.room,
		  message	: 'enter',
		  time		: timestamp
		});
		
		//log error if data cannot be written
		Message.save(function(err){
			if (err) { console.log(err); }
		});
	});
	
	//update chat room with sent message
	socket.on('sendchat', function (data) {
		//send message to all user clients in the room
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
		
		//log message to the data collection
		var timestamp = Math.round((new Date()).getTime() / 1000);
		var Message = new LogModel({
		  user		: socket.username,
		  room		: socket.room,
		  message	: data,
		  time		: timestamp
		});
		
		//log error if data cannot be written
		Message.save(function(err){
			if (err) { console.log(err); }
		});
	});
	
	
	//switch rooms
	socket.on('switchRoom', function(newroom){
		//check to see if new room is, in fact, a new room
		if(socket.room!=newroom){
			//store old room, then leave it
			var oldroom=socket.room;
			socket.leave(oldroom);
			
			//join new room
			socket.join(newroom);
			socket.room = newroom;
			
			//inform old room that user left the room
			socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username+' has left');
			socket.broadcast.to(oldroom).emit('removeuser', socket.username);
						
			//let the new room know about the new user
			socket.emit('updatechat', 'SERVER', 'you have joined '+newroom);
			socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined');
			
			//get list of users in new room
			var users=new Array();
			var inroom=new Array();
			users = io.sockets.clients(newroom);
			var i=0;
			while(i<users.length){
				inroom[i]=users[i].username;
				i++;
			}
			io.sockets.in(newroom).emit('updateusers', inroom);
			
			//update list of users in old room
			var users2=new Array();
			var inroom=new Array();
			users2 = io.sockets.clients(oldroom);
			var i=0;
			while(i<users2.length){
				inroom[i]=users2[i].username;
				i++;
			}
			io.sockets.in(oldroom).emit('updateusers', inroom);
			
			
			//log the room switch to the data collection
			var timestamp = Math.round((new Date()).getTime() / 1000);
			var Message = new LogModel({
			  user		: socket.username,
			  room		: socket.room,
			  message	: 'enter',
			  time		: timestamp
			});
			
			//logs error if data cannot be written
			Message.save(function(err){
				if (err) { console.log(err); }
			});
		}
	});
	
	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		
		//update list of users in chat
		var users=new Array();
		var inroom=new Array();
		users = io.sockets.clients(socket.room);
		var i=0;
		while(i<users.length){
			inroom[i]=users[i].username;
			i++;
		}
		io.sockets.in(socket.room).emit('updateusers', inroom);
		
		//alert room that user left
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		var timestamp = Math.round((new Date()).getTime() / 1000);
		var Message = new LogModel({
		  user		: socket.username,
		  room		: socket.room,
		  message	: 'exit',
		  time		: timestamp
		});
		
		//log error if data cannot be written
		Message.save(function(err){
			if (err) { console.log(err); }
		});
		
		//remove user from the room
		socket.leave(socket.room);
	});
});
