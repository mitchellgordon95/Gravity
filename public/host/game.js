var planetList;
var planetGroup;
var server;
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', GameState);

var Planet = function (radius, imgName, x, y) {
	this.input = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};	
	
	this.sprite = game.add.sprite(x, y, imgName);
	this.sprite.scale.setTo(2 * radius / 100, 2 * radius / 100);
	
	// Setup physics for the planet
	game.physics.p2.enableBody(this.sprite);
	this.sprite.body.setCircle(radius, 0, 0, 0);
	
	// Wrap the sprite around the world.
	game.world.wrap(this.sprite);
	
}

// Manages game state
function GameState() {}

GameState.prototype.preload = function(){
	game.load.image('sun', 'assets/SunSprite.png');
	game.load.image('planet', 'assets/PlanetsTexture.png');
}

GameState.prototype.create = function(){
  game.physics.startSystem(Phaser.Physics.P2JS);
  
  planetList = new Array();

  //player.body.collideWorldBounds = true;

  // Create a group for all the planets
  planetGroup = game.add.group();
  
  for (var i = 0; i < planetList.length; ++i)
	planetGroup.add(planetList[i].sprite);
  
  server = io.connect('http://localhost');
  
  // When we connect to the server
  server.on('connect', function() {
	console.log('Connected to server.');
	server.emit('startup_host');
  });
  	  
	// If a client connects, add a planet to the screen.
	server.on('add_planet', function (clientID) {
		console.log('New Client');
		planetList[clientID] = new Planet(32, 'planet', game.world.centerX, game.world.centerY);
	});
	
	// If we get an input event, move the planet accordingly.
	server.on('move_planet', function (clientID, input) {
		console.log('Input Event');
		planetList[clientID].input = input;
	});
}

GameState.prototype.update = function(){
	for (var i = 0; i < planetList.length; ++i)
		if (planetList[i])
			movePlanet(planetList[i]);
}

function movePlanet(planet){
  if (planet.input.type == "cursors") {
	  var cursors = planet.input;
	  if (cursors.left.isDown) {planet.sprite.body.force.x = -400;}  
	  else if (cursors.right.isDown){planet.sprite.body.force.x = 400;}
	  else {planet.sprite.body.force.x = 0;}
	  
	  if (cursors.up.isDown){planet.sprite.body.force.y = -400;}
	  else if (cursors.down.isDown){planet.sprite.body.force.y = 400;}
	  else {planet.sprite.body.force.y = 0;}
	}
	else if (planet.input.type == "tilt") {
		
	}
}

GameState.prototype.render = function(){}

