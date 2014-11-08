var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload(){}

var Planet = function (radius, speed, direction, rotation) {
	this.radius = radius;
	this.speed = speed;
	this.direction = direction;
	this.rotation = rotation;
}

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);

  var playerbmd = game.add.bitmapData(32, 32);
  playerbmd.ctx.rect(0, 0, 32, 32);
  playerbmd.ctx.fillStyle = "#0f0";
  playerbmd.ctx.fill();

  var enemybmd = game.add.bitmapData(32, 32);
  enemybmd.ctx.rect(0, 0, 32, 32);
  enemybmd.ctx.fillStyle = "#ada";
  enemybmd.ctx.fill();

  var enemy2bmd = game.add.bitmapData(32, 32);
  enemy2bmd.ctx.rect(0, 0, 32, 32);
  enemy2bmd.ctx.fillStyle = "#fd2";
  enemy2bmd.ctx.fill();

  var platformbmd = game.add.bitmapData(80, 16);
  platformbmd.ctx.rect(0, 0, 80, 16);
  platformbmd.ctx.fillStyle = "#f8a34b";
  platformbmd.ctx.fill();

  player = game.add.sprite(game.world.centerX, game.world.centerY, playerbmd);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.anchor.set(0.5, 0.5);
  //player.body.collideWorldBounds = true;
  //player.body.gravity.y = 900;
  game.world.wrap(player);
  platforms = game.add.group();
  platforms.enableBody = true;
  platforms.physicsBodyType = Phaser.Physics.ARCADE;
  platforms.createMultiple(7, platformbmd);
  platforms.forEach(function(p){
    var x = Math.floor(Math.random()*720) + 1;
    var y = Math.floor(Math.random()*504) + 96;
    p.reset(x, y);
    p.body.immovable = true;
  }, this);
  ground = platforms.create(0, game.world.height - 64, platformbmd);
  ground.scale.setTo(12, 4);
  ground.body.immovable = true;
  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.createMultiple(6, enemybmd);
  enemies.forEach(function(e){
    var x = Math.floor(Math.random()*720) + 1;
    var y = Math.floor(Math.random()*472) + 128;
    e.reset(x, y);
    e.body.gravity.y = 900;
  }, this);
  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.time.events.loop(1000, function(){
    enemies.forEachAlive(function(e){
      e.body.velocity.x = 115 * Phaser.Math.randomSign();
    }, this);
  }, this);
}

function update(){
  game.physics.arcade.collide(player, ground);
  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(enemies, ground);
  game.physics.arcade.collide(enemies, platforms);
  movePlayer();
}
function movePlayer(){
  if(player.x > 800){
    player.x = 16;
  }else if(player.x < 0){
    player.x = 784;
  }
  player.body.velocity.x = 0;
  if(cursors.left.isDown){
    player.body.velocity.x = -150;
    if(cursors.up.isDown){
      player.body.velocity.y = -150;
    }
    if(cursors.down.isDown){
      player.body.velocity.y = 150;
    }
  }else if(cursors.right.isDown){
    player.body.velocity.x = 150;
    if(cursors.up.isDown){
      player.body.velocity.y = -150;
    }
    if(cursors.down.isDown){
      player.body.velocity.y = 150;
    }
  }else if(cursors.up.isDown){
    player.body.velocity.y = -150;
  }else if(cursors.down.isDown){
    player.body.velocity.y = 150;
  }
}
function render(){}
