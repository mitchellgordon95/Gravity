var player;
var planetList;
var planetGroup;
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', GameState);

var Planet = function (radius, imgName, x, y) {
	// TODO - figure out circular physics/drawing.

	this.sprite = game.add.sprite(x, y, imgName);
	
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
}

GameState.prototype.create = function(){
  game.physics.startSystem(Phaser.Physics.P2JS);
  
  player = new Planet(32, 'sun', game.world.centerX, game.world.centerY);

  //player.body.collideWorldBounds = true;
  //player.body.gravity.y = 900;

  // Create a group for all the planets
  planetGroup = game.add.group();
  
  planetGroup.add(player.sprite);
  
  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  
}

GameState.prototype.update = function(){
  movePlayer();
}
function movePlayer(){
  if (cursors.left.isDown) {player.sprite.body.force.x = -100;}   //player.sprite movement
  else if (cursors.right.isDown){player.sprite.body.force.x = 100;}
  else {player.sprite.body.force.x = 0;}
  
  if (cursors.up.isDown){player.sprite.body.force.y = -100;}
  else if (cursors.down.isDown){player.sprite.body.force.y = 100;}
  else {player.sprite.body.force.y = 0;}
}

GameState.prototype.render = function(){}

