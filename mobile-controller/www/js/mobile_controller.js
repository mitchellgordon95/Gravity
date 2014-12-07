
server = io.connect("http://mitchellgordon.net:8080");

var clientID;
var tilt_output = document.getElementById("tilt_output");
var keyword = window.location.hash.substring(1);
var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
// When we connect to the server
server.on('connect', function() {
  console.log('Connected to server.');
  server.emit('client_join', keyword, function(ID, color) {
	  // If we failed, it's probably because the keyword isn't being used
	  if (ID == -1) {
		alert("Sorry, no games with that keyword exist.");
		window.location.href = "/";
	  }
		
	  clientID = ID;
	  document.body.style.backgroundColor = "#" + color.toString(16);
	  document.getElementById("clientID").innerHTML = "You are Player " + clientID;
	  console.log('Joined game with ID ' + ID + ' and color ' + color.toString(16));
  });
});
// When we connect to the server
server.on('connect', function() {
console.log('Connected to server.');
server.emit('client_join', keyword, function(ID, color) {
  clientID = ID;
  document.body.style.backgroundColor = "#" + color.toString(16);
});
});

// For tilt support
window.addEventListener('deviceorientation', function(data){

	var changed = false;
	if (data.beta < -10) {
		changed = changed || !cursors.up.isDown;
		cursors.up.isDown = true;
	}
	else {	
		changed = changed || cursors.up.isDown;
		cursors.up.isDown = false;	
	}
	if (data.gamma < -10) {
		changed = changed || !cursors.left.isDown;
		cursors.left.isDown = true;
	}
	else {	
		changed = changed || cursors.left.isDown;
		cursors.left.isDown = false;	
	}
	if (data.beta > 10) {
		changed = changed || !cursors.down.isDown;
		cursors.down.isDown = true;
	}
	else {	
		changed = changed || cursors.down.isDown;
		cursors.down.isDown = false;	
	}
	if (data.gamma > 10) {
		changed = changed || !cursors.right.isDown;
		cursors.right.isDown = true;
	}
	else {	
		changed = changed || cursors.right.isDown;
		cursors.right.isDown = false;	
	}

	if (!changed)
		return;
		
	server.emit('input_event', clientID, keyword, cursors);
}, true);
