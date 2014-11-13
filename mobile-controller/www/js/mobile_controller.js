
var server;
var clientID;
var keyword = 'default_keyword';

server = io.connect("http://10.66.216.101");
// When we connect to the server
server.on('connect', function() {
console.log('Connected to server.');
server.emit('client_join', keyword, function(ID, color) {
  clientID = ID;
  document.body.style.backgroundColor = "#" + color.toString(16);
});
});

window.addEventListener('deviceorientation', function(data){
var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
if (data.beta < -5)
	cursors.up.isDown = true;
if (data.gamma < -5)
	cursors.left.isDown = true;
if (data.beta > 5)
	cursors.down.isDown = true;
if (data.gamma > 5)
	cursors.right.isDown = true;
server.emit('input_event', clientID, keyword, cursors);
});
