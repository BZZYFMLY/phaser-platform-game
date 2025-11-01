function preload() {
      this.load.image("background", "assets/bg.jpg");
      this.load.image(
        "platform_green_lg",
        "assets/sprites/platform_green_lg.png",
      );
      this.load.image("platform_green_sm", "assets/sprites/platform_green_sm.png");
      this.load.spritesheet("coin", "assets/sprites/platforms.png", {
        frameWidth: 9,
        frameHeight: 48,
      });
      this.load.spritesheet("knight", "assets/sprites/knight.png", {
        frameWidth: 32,
        frameHeight: 32,
      });
}

var platforms;
var player;
var cursors;
var isDead = false;

function create() {
  // this.background = this.add.image(0, 0, "background").setScrollFactor(0);
  // this.background.setTint(204, 204, 255, 255);

  /* Platforms */
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "platform_green_lg").setScale(2).refreshBody();

  platforms.create(600, 400, "platform_green_lg").setScale(2).refreshBody();
  platforms.create(50, 250, "platform_green_sm").setScale(2).refreshBody();
  platforms.create(750, 220, "platform_green_sm").setScale(2).refreshBody();

  // Extra platforms for smoother, reachable jumps
  platforms.create(200, 520, "platform_green_sm").setScale(2).refreshBody();
  platforms.create(330, 490, "platform_green_sm").setScale(2).refreshBody();
  platforms.create(500, 440, "platform_green_sm").setScale(2).refreshBody();
  platforms.create(650, 360, "platform_green_sm").setScale(2).refreshBody();
  platforms.create(720, 300, "platform_green_sm").setScale(2).refreshBody();
  // Left path towards the high left platform
  platforms.create(120, 350, "platform_green_lg").setScale(2).refreshBody();

  /* Player */
  player = this.physics.add.sprite(400, 450, "knight").setScale(2).refreshBody();

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  // Shrink hitbox and align bottom closer to the feet
  player.body.setSize(9, 16, true);
  player.body.setOffset(11, 12);
  // Enable world-bounds events so we can detect bottom hit (death)
  player.body.onWorldBounds = true;

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("knight", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "run",
    frames: this.anims.generateFrameNumbers("knight", { start: 16, end: 23 }),
    frameRate: 10,
    repeat: -1,
  });

  // Extra animations (frame ranges assumed by 32x32 grid)
  this.anims.create({
    key: "roll",
    frames: this.anims.generateFrameNumbers("knight", { start: 24, end: 31 }),
    frameRate: 12,
    repeat: 0,
  });
  this.anims.create({
    key: "hit",
    frames: this.anims.generateFrameNumbers("knight", { start: 40, end: 47 }),
    frameRate: 12,
    repeat: 0,
  });
  this.anims.create({
    key: "death",
    frames: this.anims.generateFrameNumbers("knight", { start: 56, end: 59 }),
    frameRate: 10,
    repeat: 0,
  });

  player.body.setGravityY(300);
  this.physics.add.collider(player, platforms);

  // Death when hitting the bottom world bound
  this.physics.world.on("worldbounds", (body, up, down, left, right) => {
    if (body.gameObject === player && down) {
      killPlayer.call(this);
    }
  });

  // Cursor keys
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (isDead) {
    // Disable controls after death
    player.setVelocityX(0);
    return;
  }
  if (cursors.left.isDown) {
    //Balra mozgás
    player.setVelocityX(-160);
    player.flipX = true;

    player.anims.play("run", true);
  } else if (cursors.right.isDown) {
    // Jobbra mozgás
    player.setVelocityX(160);
    player.flipX = false;

    player.anims.play("run", true);

  } else {
    // semmi sem történik
    player.setVelocityX(0);

    player.anims.play("idle");
  }

  if (cursors.up.isDown && (player.body.touching.down || player.body.blocked.down)) {
    // ugrás
    player.setVelocityY(-330);
  }
}

function killPlayer() {
  if (isDead) return;
  isDead = true;
  player.setVelocity(0, 0);
  player.anims.play("death", true);
  // Prevent further collisions and let the animation play
  player.body.checkCollision.none = true;
  // Restart scene after a short delay
  this.time.delayedCall(900, () => {
    this.scene.restart();
    isDead = false;
  });
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#ADD8E6",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

var game = new Phaser.Game(config);
