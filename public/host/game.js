var planetList;
var usersConnected = 0;
var planetCount = 0;
var server;
var spacebar;
var gameProgress;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var asteroidGroup, asteroidSpawnCounter = 0, asteroidRand;
var keyword = 'default_keyword';
var startRadius = 32;

var Progress = {
	WAITING: 0,
	RUNNING: 1,
	FINISHED: 2
}
var waitText, endText;
var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'gravity-game', GameState);

var Planet = function (radius, imgName, tint, x, y, id) {
	this.input = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};

	this.id = id;
	this.tint = tint;
	this.exists = true;
	this.radius = radius;
	this.spriteAndPhysics(imgName, x, y);

	this.resize();

	// Wrap the sprite around the world.
	game.world.wrap(this.sprite);

}

Planet.prototype.spriteAndPhysics = function (imgName, x, y) {
	this.sprite = game.add.sprite(x, y, imgName);
	this.sprite.tint = this.tint;

	// Setup physics for the planet
	game.physics.p2.enableBody(this.sprite);

	// This is used in collision detection.
	this.sprite.body.planet = this;

	// Maps planet index to the number of frames we've been siphoning off them. -1 if we're not.
	this.siphoning = new Array();

	this.sprite.body.onBeginContact.add(this.onBeginContact, this);
	this.sprite.body.onEndContact.add(this.onEndContact, this);
}

Planet.prototype.onBeginContact = function(body, shapeA, shapeB, equation) {
	// We are touching another planet
	if (body && body.planet && body.planet.radius < this.radius)
		this.siphoning[body.planet.id] = 0;
	// We are touching an asteroid
	if (body && body.asteroid) {
		this.grow(15);
		body.asteroid.kill();
	}
}

Planet.prototype.onEndContact = function(body, shapeA, shapeB, equation) {
	// We are no longer touching another planet
	if (body && body.planet)
		this.siphoning[body.planet.id] = -1;
}

Planet.prototype.kill = function() {
	this.exists = false;
	--planetCount;
	this.sprite.kill();
}

Planet.prototype.grow = function (amount) {
	this.radius += amount;
	this.resize();
}

Planet.prototype.ressurect = function() {
	this.exists = true;
	++planetCount;
	// Kill the sprite if we haven't.
	if (this.sprite)
		this.sprite.kill();
	this.radius = startRadius;
	this.spriteAndPhysics('planet', randomX(), randomY());
}

var siphonConstant = 0.3;


// Resets the sprite and body to match the radius.
Planet.prototype.resize = function() {
	this.sprite.scale.setTo(2 * this.radius / 100, 2 * this.radius / 100);
	this.sprite.body.setCircle(this.radius, 0, 0, 0);
}

Planet.prototype.siphon = function(other) {
	// Grow us
	this.radius = Math.sqrt(Math.pow(this.radius, 2) + siphonConstant * Math.pow(other.radius, 2));
	// Shrink them
	other.radius = Math.sqrt(Math.pow(other.radius, 2) * siphonConstant);
	
	// If they're small enough, kill them.
	if (other.radius <= 15)
		other.kill();
	else {
		other.resize();
	}
	
	// Resize us
	this.resize();
}

// Manages game state
function GameState() {}

GameState.prototype.preload = function(){
	game.load.image('stars', 'assets/starfield.png');
	game.load.image('asteroid', 'assets/asteroid.png');
	game.load.image('planet', 'assets/planet.png');
}

GameState.prototype.create = function(){
  game.physics.startSystem(Phaser.Physics.P2JS);

  game.add.tileSprite(0,0, windowWidth, windowHeight,'stars');

  setupGame();

  // Get the spacebar, which the user presses to start the game.
  spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  //player.body.collideWorldBounds = true;

  server = io.connect('http://localhost');

  // When we connect to the server
  server.on('connect', function() {
	console.log('Connected to server.');
	server.emit('startup_host', keyword);
  });

	// If a client connects, add a planet to the screen.
	server.on('add_planet', function (clientID, color) {
		console.log('New Client');
		if (gameProgress == Progress.WAITING) {
			planetList[clientID] = new Planet(startRadius, 'planet', color, randomX(), randomY(), clientID);
			++planetCount;
			++usersConnected;
		}
	});

	// If we get an input event, move the planet accordingly.
	server.on('move_planet', function (clientID, input) {
		//console.log('input event');
		if (planetList[clientID])
			planetList[clientID].input = input;
	});

	server.on('remove_planet', function (clientID) {
		console.log('remove client');
		if (planetList[clientID]) {
			planetList[clientID].kill();
			planetList[clientID] = 0;
			--usersConnected;
			--planetCount;
		}

	});
}

GameState.prototype.update = function(){

	// If the game hasn't started, wait for the space bar to start
	if (gameProgress == Progress.WAITING && spacebar.isDown && planetCount > 1)
		startGame();
	// If the game is running.
	if (gameProgress == Progress.RUNNING) {
		// Check if the game is over yet.
		if (isGameOver())
			endGame();
		// If asteroid count is 0, spawn an asteroid
		if (asteroidSpawnCounter == 0) {
			asteroidRand = game.rnd.between(60, 360);
			var asteroid = game.add.sprite(randomX(), randomY(), 'asteroid');
			// Setup physics for the planet
			game.physics.p2.enableBody(asteroid);
			asteroid.body.angularVelocity = 2;
			// This is used in collision detection.
			asteroid.body.asteroid = asteroid;
		}
		// Increment it until it reaches a random value
		asteroidSpawnCounter = (asteroidSpawnCounter + 1) % asteroidRand;
	}
	// If the game has ended, wait for the space bar to restart
	if (gameProgress == Progress.FINISHED && spacebar.isDown)
		resetGame();

	planetList.forEach(function(planet) {
		if (planet) {
			// Move this planet.
			movePlanet(planet);
			// For each planet we may/may not be siphoning off of
			for (var id in planet.siphoning) {
				if (id === 'length' || !planet.siphoning.hasOwnProperty(id)) continue;

				if (planet.siphoning[id] == 0) {
					planet.siphon(planetList[id]);
				}
				else if (planet.siphoning[id] < 0) {
					// Do nothing.
				}
				else {
					++planet.siphoning[id];
				}
			}
		}
	});
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

function setupGame() {
	gameProgress = Progress.WAITING;
	planetList = new Array();
	planetCount = usersConnected;
	// Put up the "Wait to start" text
	var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
	waitText = game.add.text(game.world.centerX, game.world.centerY, "Waiting for players...\nPress SPACE to start", style);
	waitText.anchor.set(0.5);
}

function startGame() {
	console.log("Game Started.");
	gameProgress = Progress.RUNNING;
	// Remove the "Wait to start" text
	waitText.destroy();
}

function isGameOver() {
	return planetCount <= 1;
}

function endGame() {
	console.log("Game Ended.");
	gameProgress = Progress.FINISHED;

	// Put up the "Game over" text
	var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
	endText = game.add.text(game.world.centerX, game.world.centerY, "Game Over. Player X wins.\nPress SPACE to restart", style);
	endText.anchor.set(0.5);
}

function resetGame() {
	console.log("Game Reset.");
	// Remove the "Game over" text
	endText.destroy();

	// Ressurect everyone.
	planetList.forEach(function (planet) {
		if (planet)
			planet.ressurect();
	});

	// Setup the game again.
	setupGame();
}

function randomX() {
	return game.rnd.between(startRadius, windowWidth - startRadius);
}

function randomY() {
	return game.rnd.between(startRadius, windowHeight - startRadius);
}
