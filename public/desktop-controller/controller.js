  server = io.connect(window.location.host);
  var clientID;
  var keyword = window.location.hash.substring(1);
  var lastCursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
  // When we connect to the server
  server.on('connect', function() {
	  console.log('Connected to server.');
	  server.emit('client_join', keyword, function(ID, color) {
		  clientID = ID;
		  document.body.style.backgroundColor = "#" + color.toString(16);
		  console.log('Joined game with ID ' + ID + ' and color ' + color.toString(16));
	  });
  });

window.onkeydown = function(e) {
	var cursors = lastCursors;
	var keynum;

	if(window.event){ // IE
		keynum = e.keyCode;
	}
	else if(e.which){ // Netscape/Firefox/Opera
			keynum = e.which;
		 }
		 
	// If the key is already down, just bail out.
	// Otherwise, setup cursors properly and send it.
	if (keynum == 'W'.charCodeAt(0)) {
		if (cursors.up.isDown)
			return;
		cursors.up.isDown = true;
	}
	if (keynum == 'A'.charCodeAt(0)) {
		if (cursors.left.isDown)
			return;
		cursors.left.isDown = true;
	}
	if (keynum == 'S'.charCodeAt(0)) {
		if (cursors.down.isDown)
			return;
		cursors.down.isDown = true;
	}
	if (keynum == 'D'.charCodeAt(0)) {
		if (cursors.right.isDown)
			return;
		cursors.right.isDown = true;
	}

	lastCursors = cursors;
	server.emit('input_event', clientID, keyword, cursors);
}


window.onkeyup = function(e) {
	var cursors = lastCursors;
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

	lastCursors = cursors;
	server.emit('input_event', clientID, keyword, cursors);
}
