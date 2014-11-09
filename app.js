var express = require('express');
var app = express();
var server = require('http').Server(app);
app.use(express.static(__dirname + '/public'));
var io = require('socket.io')(server);

server.listen(4000);

// Assign ID's linearly
var nextID = 0;

io.hosts = new Array();
// When the host joins, save it for later
io.sockets.on('connection', function(socket) {
	console.log('connection');

	// This socket is a host.
	socket.on('startup_host', function (keyword) {
		if (keyword) {
			console.log('Host connected with "' + keyword + '"');
			io.hosts[keyword] = socket;

			// When the host disconnects,
			socket.on('disconnect', function () {
				console.log('Host disconnected.');
				io.hosts[keyword] = 0;
			});
		}
	});

	// When a client joins, assign it an ID
	socket.on('client_join', function (keyword, callback) {
		console.log('Client trys to join with "' + keyword + '"');
		if (io.hosts[keyword]) {
			console.log('Client added to host with "' + keyword + '" and ID '+nextID);
			io.hosts[keyword].emit('add_planet', nextID);
			socket.clientID = nextID;
			callback(nextID);
			++nextID;
		}
		else {
			callback(-1);
		}

		// When a client leaves, tell the host
		socket.on('disconnect', function() {
			console.log('Client leaves "' + keyword + '" and ID ' + socket.clientID);
			if (io.hosts[keyword])
				io.hosts[keyword].emit('remove_planet', socket.clientID);
		});
	});
	// When a client moves, tell the host to update its position.
	socket.on('input_event', function(clientID, keyword, input) {
		console.log(input);
		if (io.hosts[keyword])
			io.hosts[keyword].emit('move_planet', clientID, input);
	});

});
