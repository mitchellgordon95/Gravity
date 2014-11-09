var player;
var planetList;
var planetGroup;
var server;
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', GameState);

var Planet = function (radius, imgName, x, y) {
	// TODO - figure out circular physics/drawing.

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
  
  player = new Planet(32, 'sun', game.world.centerX, game.world.centerY);
  
  planetList = new Array();
  
  planetList.push(player);

  //player.body.collideWorldBounds = true;

  // Create a group for all the planets
  planetGroup = game.add.group();
  
  for (var i = 0; i < planetList.length; ++i)
	planetGroup.add(planetList[i].sprite);
  
  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  
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
	server.on('input_event', function (clientID, input) {
		console.log('Input Event');
		if (!typeof planetList[clientID] === 'undefined')
			movePlanet(planetList[clientID], input);
	});
}

GameState.prototype.update = function(){
  movePlanet(player, cursors);
}

function movePlanet(planet, cursors){
  if (cursors.left.isDown) {planet.sprite.body.force.x = -100;}   //player.sprite movement
  else if (cursors.right.isDown){planet.sprite.body.force.x = 100;}
  else {planet.sprite.body.force.x = 0;}
  
  if (cursors.up.isDown){planet.sprite.body.force.y = -100;}
  else if (cursors.down.isDown){planet.sprite.body.force.y = 100;}
  else {planet.sprite.body.force.y = 0;}
}

GameState.prototype.render = function(){}

