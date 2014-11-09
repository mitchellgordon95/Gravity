var express = require('express');
var app = express();
var server = require('http').Server(app); 
app.use(express.static(__dirname + '/public'));
var io = require('socket.io')(server);

server.listen(80);

// Assign ID's linearly
var nextID = 0;

// When the host joins, save it for later
io.sockets.on('connection', function(socket) {
	console.log('connection');
	socket.on('startup_host', function () {
		console.log('Host connected.');
		io.host = socket;
	});
	// When a client joins, assign it an ID
	socket.on('client_join', function (callback) {
		console.log('Client joins.');
		if (io.host) {
			io.host.emit('add_planet', nextID);
			callback(nextID);
			++nextID;
		}
	});
	// When a client moves, tell the host to update its position.
	socket.on('input_event', function(clientID, input) {
		console.log('input_event');
		io.host.emit('move_planet', clientID, input);
	});
});