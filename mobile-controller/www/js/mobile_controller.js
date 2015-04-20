
var server = io.connect("http://gravity.mitchgordon.me");

var clientID;
var tilt_output = document.getElementById("tilt_output");
var keyword;
var connected = false;
		
document.getElementById('join_game').onclick = function () {
	if(document.getElementById('keyword').value == "") {
		alert("Please enter a keyword.");
	}
	else {
		keyword = document.getElementById('keyword').value;
		
		if ( connected ) {
			server.emit('client_join', keyword, function(ID, color) {
			  // If we failed, it's probably because the keyword isn't being used
			  if (ID == -1) {
				navigator.notification.alert("Sorry, no games with that keyword exist.", function(){});
				return;
			  }
				
			  clientID = ID;
			  document.getElementById("content").style.display = "none";
			  document.getElementById("controller").style.display = "block";
			  document.getElementsByTagName("BODY")[0].style.backgroundImage = "none";
			  document.body.style.backgroundColor = "#" + color.toString(16);
			  document.getElementById("clientID").innerHTML = "You are Player " + clientID;
			  console.log('Joined game with ID ' + ID + ' and color ' + color.toString(16));
			
			    // For tilt support
				window.addEventListener('deviceorientation', function(data){
					
					var cursors = {type: 'tilt', beta: data.beta, gamma: data.gamma};
						
					server.emit('input_event', clientID, keyword, cursors);
				}, true);
		  });
		}
		else {
			navigator.notification.alert("Not yet connected to server. Please wait.", function(){});
		}

	}
}

//When we connect to the server
server.on('connect', function() {
	connected = true;
  console.log('Connected to server.');
  
});

// If we can't connect to the server
server.on('connect_error', function () {
	navigator.notification.alert("Server connection error. Please try again later.", function(){});
});
