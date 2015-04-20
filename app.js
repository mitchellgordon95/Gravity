var express = require('express');
var app = express();
var server = require('http').Server(app);
app.use(express.static(__dirname + '/www'));
var io = require('socket.io')(server);

server.listen(80);

// Assign ID's linearly
var nextID = 0;

io.hosts = new Array();
// When the host joins, save it for later
io.sockets.on('connection', function(socket) {
	//console.log('connection');

	// This socket is a host.
	socket.on('startup_host', function (keyword, callback) {
		if (keyword) {
			//console.log('Host connected with "' + keyword + '"');
			
			// If a host is already using this keyword, return no success
			if (io.hosts[keyword]) {
				callback({ });
				return;
			}
			
			io.hosts[keyword] = socket;
			callback({success: true});

			// When the host disconnects,
			socket.on('disconnect', function () {
				//console.log('Host disconnected.');
				io.hosts[keyword] = 0;
			});
		}
	});

	// When a client joins, assign it an ID
	socket.on('client_join', function (keyword, callback) {
		//console.log('Client trys to join with "' + keyword + '"');
		if (io.hosts[keyword]) {
			//console.log('Client added to host with "' + keyword + '" and ID '+nextID);
			// TODO - Move this somewhere better
			// Generate a random color
			var color = Math.floor(Math.random() * 12000000 + 4000000);
			io.hosts[keyword].emit('add_planet', nextID, color);

			socket.clientID = nextID;
			callback(nextID, color);
			++nextID;
		}
		else {
			callback(-1);
		}

		// When a client leaves, tell the host
		socket.on('disconnect', function() {
			//console.log('Client leaves "' + keyword + '" and ID ' + socket.clientID);
			if (io.hosts[keyword])
				io.hosts[keyword].emit('remove_planet', socket.clientID);
		});
	});
	// When a client moves, tell the host to update its position.
	socket.on('input_event', function(clientID, keyword, input) {
		//console.log(input);
		if (io.hosts[keyword])
			io.hosts[keyword].emit('move_planet', clientID, input);
	});

});
