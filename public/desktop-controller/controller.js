  server = io.connect("http://127.0.0.1");
  var clientID;
  var keyword = 'default_keyword';
  // When we connect to the server
  server.on('connect', function() {
	  console.log('Connected to server.');
	  server.emit('client_join', keyword, function(ID, color) {
		  clientID = ID;
		  document.body.style.backgroundColor = "#" + color.toString(16);
		  console.log('Joined game with ID ' + ID + ' and color ' + color.toString(16);
	  });
  });

window.onkeydown = function(e) {
	var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
	var keynum;

	if(window.event){ // IE
		keynum = e.keyCode;
	}else
		if(e.which){ // Netscape/Firefox/Opera
			keynum = e.which;
		 }

	if (keynum == 'W'.charCodeAt(0))
		cursors.up.isDown = true;
	if (keynum == 'A'.charCodeAt(0))
		cursors.left.isDown = true;
	if (keynum == 'S'.charCodeAt(0))
		cursors.down.isDown = true;
	if (keynum == 'D'.charCodeAt(0))
		cursors.right.isDown = true;

	server.emit('input_event', clientID, keyword, cursors);
}


window.onkeyup = function(e) {
	var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
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
