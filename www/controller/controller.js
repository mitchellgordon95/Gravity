  server = io.connect(window.location.host);
  var clientID;
  var keyword = window.location.hash.substring(1);
  var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
  // When we connect to the server
  server.on('connect', function() {
	  console.log('Connected to server.');
	  server.emit('client_join', keyword, function(ID, color) {
		  clientID = ID;
		  document.body.style.backgroundColor = "#" + color.toString(16);
		  document.getElementById("clientID").innerHTML = "You are Player " + clientID;
		  console.log('Joined game with ID ' + ID + ' and color ' + color.toString(16));
	  });
  });

window.onkeydown = function(e) {
	var keynum;

	if(window.event){ // IE
		keynum = e.keyCode;
	}
	else if(e.which){ // Netscape/Firefox/Opera
			keynum = e.which;
		 }
		 
	var changed = false;
	// Setup cursors properly based on which key was pressed 
	if (keynum == 'W'.charCodeAt(0)) {
		changed = changed || !cursors.up.isDown;
		cursors.up.isDown = true;
	}
	if (keynum == 'A'.charCodeAt(0)) {
		changed = changed || !cursors.left.isDown;
		cursors.left.isDown = true;
	}
	if (keynum == 'S'.charCodeAt(0)) {
		changed = changed || !cursors.down.isDown;
		cursors.down.isDown = true;
	}
	if (keynum == 'D'.charCodeAt(0)) {
		changed = changed || !cursors.right.isDown;
		cursors.right.isDown = true;
	}

	if (!changed)
		return;
	
	server.emit('input_event', clientID, keyword, cursors);
}


window.onkeyup = function(e) {
	var keynum;

	if(window.event){ // IE
		keynum = e.keyCode;
	}else
		if(e.which){ // Netscape/Firefox/Opera
			keynum = e.which;
		 }

	if (keynum == 'W'.charCodeAt(0))
		cursors.up.isDown = false;
	if (keynum == 'A'.charCodeAt(0))
		cursors.left.isDown = false;
	if (keynum == 'S'.charCodeAt(0))
		cursors.down.isDown = false;
	if (keynum == 'D'.charCodeAt(0))
		cursors.right.isDown = false;

	server.emit('input_event', clientID, keyword, cursors);
}

// For tilt support
window.addEventListener('deviceorientation', function(data){

	var changed = false;
	if (data.beta < -5) {
		changed = changed || !cursors.up.isDown;
		cursors.up.isDown = true;
	}
	else {	
		changed = changed || cursors.up.isDown;
		cursors.up.isDown = false;	
	}
	if (data.gamma < -5) {
		changed = changed || !cursors.left.isDown;
		cursors.left.isDown = true;
	}
	else {	
		changed = changed || cursors.left.isDown;
		cursors.left.isDown = false;	
	}
	if (data.beta > 5) {
		changed = changed || !cursors.down.isDown;
		cursors.down.isDown = true;
	}
	else {	
		changed = changed || cursors.down.isDown;
		cursors.down.isDown = false;	
	}
	if (data.gamma > 5) {
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
});
