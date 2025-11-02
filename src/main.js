/* *************** */
/*   Game actors   */
/* *************** */
var platforms;
var player;
var cursors;
var coins;
var slimes;
var isDead = false;
var score = 0;
var scoreText;
var tilemapGroup;
var tiles;
var playerHp = 3;
var playerIFrame = false;

function preload() {
  this.load.image("platform_green_lg", "assets/sprites/platform_green_lg.png");
  this.load.image("platform_green_sm", "assets/sprites/platform_green_sm.png");
  this.load.spritesheet("coin", "assets/sprites/coin.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.spritesheet("knight", "assets/sprites/knight.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
  this.load.spritesheet("slime", "assets/sprites/slime_green.png", {
    frameWidth: 24,
    frameHeight: 24,
  });
  this.load.spritesheet("tileset", "assets/sprites/world_tileset.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
}

function create() {
  // Reset runtime flags when (re)entering the Game scene
  isDead = false;
  playerIFrame = false;
  /* ********* */
  /* Platforms */
  /* ********* */
  platforms = this.physics.add.staticGroup();

  platforms.create(200, 284, "platform_green_lg").refreshBody();

  platforms.create(300, 200, "platform_green_lg").refreshBody();
  platforms.create(25, 125, "platform_green_sm").refreshBody();
  platforms.create(375, 110, "platform_green_sm").refreshBody();

  // Extra platforms for smoother, reachable jumps
  platforms.create(100, 260, "platform_green_sm").refreshBody();
  platforms.create(165, 245, "platform_green_sm").refreshBody();
  platforms.create(250, 220, "platform_green_sm").refreshBody();
  platforms.create(325, 180, "platform_green_sm").refreshBody();
  platforms.create(360, 150, "platform_green_sm").refreshBody();
  // Left path towards the high left platform
  platforms.create(60, 175, "platform_green_lg").refreshBody();

  /* ****** */
  /* Player */
  /* ****** */
  player = this.physics.add.sprite(200, 220, "knight").refreshBody();

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  // Hitbox aligned dynamically to sprite feet (works with zoom)
  const bodyW = 6;
  const bodyH = 10;
  player.body.setSize(bodyW, bodyH, true);
  const offsetX = 11;
  const offsetY = 17;
  player.body.setOffset(offsetX, offsetY);
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

  // Slime animations
  this.anims.create({
    key: "slime_walk",
    frames: this.anims.generateFrameNumbers("slime", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1,
  });
  this.anims.create({
    key: "slime_hit",
    frames: this.anims.generateFrameNumbers("slime", { start: 4, end: 7 }),
    frameRate: 8,
    repeat: 0,
  });
  this.anims.create({
    key: "slime_death",
    frames: this.anims.generateFrameNumbers("slime", { start: 8, end: 11 }),
    frameRate: 8,
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

  /* ***** */
  /* Tiles */
  /* ***** */
  // 16x16 sheet indexing helper based on row/col
  function idx(r, c) {
    return r * 16 + c;
  }
  // Best-guess mapping; adjust if any looks off
  tiles = {
    empty: -1,
    grass: idx(0, 0),
    rock: idx(0, 1),
    swamp: idx(0, 2),
    sand_stone: idx(0, 3),
    sand: idx(0, 4),
    red_stone: idx(0, 5),
    iced_rock: idx(0, 6),
    iced_stone: idx(0, 7),
    grey_stone: idx(0, 8),
    bridge_left: idx(0, 9),
    bridge_middle: idx(0, 10),
    bridge_right: idx(0, 11),
    /* second row */
    dirt: idx(1, 0),
    rock2: idx(1, 1),
    swamp2: idx(1, 2),
    sand_stone2: idx(1, 3),
    clay: idx(1, 4),
    red_stone2: idx(1, 5),
    granite: idx(1, 6),
    iced_granite: idx(1, 7),
    grey_stone2: idx(1, 8),
    bridge_left2: idx(1, 9),
    bridge_middle2: idx(1, 10),
    bridge_right2: idx(1, 11),
    /* third row */
    dirt_question_mark: idx(2, 0),
    rock_exclamation: idx(2, 1),
    swamp3: idx(2, 2),
    sand_stone_question_mark: idx(2, 3),
    clay_question_mark: idx(2, 4),
    red_stone2_exclamation: idx(2, 5),
    ice_block: idx(2, 6),
    iced_granite_question_mark: idx(2, 7),
    grey_stone2_exclamation: idx(2, 8),
    bridge_left3: idx(2, 9),
    bridge_middle3: idx(2, 10),
    bridge_right3: idx(2, 11),
    /* fourth row */
    tree_top: idx(3, 0),
    bush_large: idx(3, 1),
    clay_exclamation: idx(3, 2),
    tree_top_yellow: idx(3, 5),
    tree_top_curvy: idx(3, 6),
    chest: idx(3, 7),
    board: idx(3, 8),
    fence: idx(3, 9),
    /* fifth row */
    tree_middle: idx(4, 0),
    bush_middle: idx(4, 1),
    tree_middle_yellow: idx(4, 5),
    tree_middle_curvy: idx(4, 6),
    chest2: idx(4, 7),
    board2: idx(4, 8),
    fence2: idx(4, 9),
    /* sixth row */
    tree_bottom: idx(5, 0),
    bush_small: idx(5, 1),
    palm_top_left: idx(5, 2),
    palm_top_middle: idx(5, 3),
    palm_top_right: idx(5, 4),
    tree_bottom_yellow: idx(5, 5),
    tree_bottom_curvy: idx(5, 6),
    mushroom_large_red: idx(5, 7),
    mushroom_small_red: idx(5, 8),
    /* seventh row */
    bush_blooms: idx(6, 1),
    palm_middle: idx(6, 3),
    bush_large_yellow: idx(6, 5),
    bush_large_curvy: idx(6, 6),
    mushroom_large_yellow: idx(6, 7),
    mushroom_small_yellow: idx(6, 8),
    /* eighth row */
    bottle: idx(7, 0),
    bottle_yellow: idx(7, 1),
    palm_middle2: idx(7, 3),
    bush_middle_yellow: idx(7, 5),
    bush_middle_curvy: idx(7, 6),
    mushroom_large_purple: idx(7, 7),
    mushroom_small_purple: idx(7, 8),
    /* ninth row */
    bottle_blue: idx(8, 0),
    bottle_purple: idx(8, 1),
    palm_middle3: idx(8, 2),
    pumpkin: idx(8, 3),
    bush_small_yellow: idx(8, 4),
    bush_small_curvy: idx(8, 5),
    mushroom_large_green: idx(8, 6),
    mushroom_small_green: idx(8, 7),
    /* tenth row */
    water_large: idx(9, 4),
    water_small: idx(9, 5),
    /* eleventh row */
    water_full: idx(10, 4),
  };

  // Demo line of ground using tiles.grass
  const level1 = [
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
      tiles.empty,
    ],
    [
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.water_small,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.empty,
      tiles.empty,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.water_large,
      tiles.water_large,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.empty,
      tiles.empty,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
      tiles.grass,
    ],
    [
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.water_full,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.empty,
      tiles.empty,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.water_full,
      tiles.water_full,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.empty,
      tiles.empty,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
      tiles.rock,
    ],
  ];

  tilemapGroup = buildLevel.call(this, level1, 0, 260, 16);
  this.physics.add.collider(player, tilemapGroup);

  /* *********** */
  /* Cursor keys */
  /* *********** */
  cursors = this.input.keyboard.createCursorKeys();

  /* ****** */
  /* Slimes */
  /* ****** */
  slimes = this.physics.add.group();
  const slime = slimes.create(300, 180, "slime");
  slime.body.setSize(18, 14, true);
  slime.body.setOffset(3, 10);
  slime.setCollideWorldBounds(true);
  // keep dynamic so Arcade can separate it from static platforms
  // slime.setImmovable(true);
  slime.body.allowGravity = true;
  slime.setVelocityX(-40);
  slime.flipX = true;
  slime.anims.play("slime_walk");
  slime.hp = 2;
  slime.isDying = false;

  this.physics.add.collider(slimes, platforms);
  this.physics.add.collider(slimes, tilemapGroup);
  this.physics.add.collider(player, slimes, onPlayerHit, null, this);

  /* ********* */
  /*   Coins   */
  /* ********* */
  const coinsW = 8;
  const coinsH = 8;
  const coinsX = 4;
  const coinsY = 4;

  coins = this.physics.add.group({
    key: "coin",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  this.anims.create({
    key: "spinning",
    frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 12 }),
    frameRate: 12,
    repeat: -1,
  });

  this.physics.add.collider(coins, platforms);
  this.physics.add.collider(coins, tilemapGroup);
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  coins.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.setSize(coinsW, coinsH, true);
    child.setOffset(coinsX, coinsY);
  });

  /* ********* */
  /* Dashboard */
  /* ********* */
  score = 0; // reset score on scene start
  playerHp = 3; // reset player HP
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });
}

function update() {
  /* ****** */
  /* Player */
  /* ****** */
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

    player.anims.play("idle", true);
  }

  if (
    cursors.up.isDown &&
    (player.body.touching.down || player.body.blocked.down)
  ) {
    // ugrás
    player.setVelocityY(-330);
  }

  /* ********* */
  /*   Coins   */
  /* ********* */
  coins.children.iterate(function (child) {
    child.anims.play("spinning", true);
  });

  /* ****** */
  /* Slimes */
  /* ****** */
  slimes.children.iterate(function (s) {
    // Turn around on edge or wall
    if (s.body.blocked.left) {
      s.setVelocityX(40);
      s.flipX = false;
      s.anims.play("slime_walk", true);
    } else if (s.body.blocked.right) {
      s.setVelocityX(-40);
      s.flipX = true;
      s.anims.play("slime_walk", true);
    }
  });
}

function collectCoin(player, coin) {
  coin.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);
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
    isDead = false;
    this.scene.start("GameOver");
  });
}

function onPlayerHit(playerRef, slimeRef) {
  if (isDead || !slimeRef || slimeRef.isDying) return;

  // Use Arcade Physics touching flags to detect stomps reliably
  const stomp = playerRef.body.touching.down && slimeRef.body.touching.up;

  if (stomp) {
    // Bounce the player up a bit
    playerRef.setVelocityY(-220);

    // Damage the slime
    slimeRef.hp = (slimeRef.hp || 1) - 1;
    if (slimeRef.hp <= 0) {
      slimeRef.isDying = true;
      if (!slimeRef.scored) {
        slimeRef.scored = true;
        score += 50;
        if (scoreText) scoreText.setText("Score: " + score);
      }
      slimeRef.setVelocity(0, 0);
      slimeRef.body.checkCollision.none = true;
      slimeRef.anims.play("slime_death", true);
      this.time.delayedCall(500, () => {
        if (slimeRef && slimeRef.destroy) slimeRef.destroy();
      });
    } else {
      slimeRef.anims.play("slime_hit", true);
    }
    return;
  }

  // Otherwise player takes damage (3 HP per hit)
  if (playerIFrame) return; // avoid multi-hit in same contact
  playerHp -= 3;
  playerIFrame = true;
  playerRef.setTint(0xff5555);
  this.time.delayedCall(300, () => {
    playerIFrame = false;
    if (playerRef && playerRef.clearTint) playerRef.clearTint();
  });
  if (playerHp <= 0) {
    killPlayer.call(this);
  }
}

// Build a level from a 2D array of tile indices
function buildLevel(levelArr, startX, startY, tileSize) {
  const group = this.physics.add.staticGroup();
  for (let r = 0; r < levelArr.length; r++) {
    for (let c = 0; c < levelArr[r].length; c++) {
      const code = levelArr[r][c];
      if (code == null || code === -1) continue;
      const x = startX + c * tileSize + tileSize / 2;
      const y = startY + r * tileSize + tileSize / 2;
      group.create(x, y, "tileset", code).refreshBody();
    }
  }
  return group;
}

// Build positioned at the bottom of the scene
function buildLevelAtBottom(levelArr, tileSize) {
  const height =
    this.scale && this.scale.gameSize
      ? this.scale.gameSize.height
      : this.sys.game.config.height;
  const startY = height - levelArr.length * tileSize;
  return buildLevel.call(this, levelArr, 0, startY, tileSize);
}

// Create a 2-row level where the last two rows repeat given patterns across columns
function createBottomPatternLevel(patternTop, patternBottom, cols) {
  const fillRow = (pattern) =>
    Array.from({ length: cols }, (_, i) => pattern[i % pattern.length] ?? -1);
  return [fillRow(patternTop), fillRow(patternBottom)];
}

var config = {
  type: Phaser.AUTO,
  width: 1920 / 2,
  height: 1080 / 2,
  backgroundColor: "#ADD8E6",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
    zoom: 2,
  },
  scene: [],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
};

// Menu Scene
const MenuScene = new (class extends Phaser.Scene {
  constructor() {
    super("Menu");
    this.menuIndex = 0;
  }
  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.add.text(centerX, centerY - 80, "Start", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5, 0.5).setName("item0");
    this.add.text(centerX, centerY - 40, "Settings", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5, 0.5).setName("item1");
    this.pointer = this.add.text(centerX - 80, centerY - 80, ">", { fontSize: "32px", fill: "#ff0" }).setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  update() {
    const count = 2;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.menuIndex = (this.menuIndex + 1) % count;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.menuIndex = (this.menuIndex - 1 + count) % count;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.pointer.setPosition(centerX - 80, centerY - 80 + 40 * this.menuIndex);

    if (
      Phaser.Input.Keyboard.JustDown(this.enterKey) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    ) {
      if (this.menuIndex === 0) {
        this.scene.start("Game");
      } else {
        // Settings not implemented yet
      }
    }
  }
})();

// Game Over Scene
const GameOverScene = new (class extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }
  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.add.text(centerX, centerY - 20, "Game Over", { fontSize: "48px", fill: "#ff4444" }).setOrigin(0.5, 0.5);
    this.add.text(centerX, centerY + 20, "Press Space to return to Menu", { fontSize: "20px", fill: "#fff" }).setOrigin(0.5, 0.5);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start("Menu");
    }
  }
})();

// Game Scene adapter using existing functions
const GameScene = { key: "Game", preload, create, update };

config.scene = [MenuScene, GameScene, GameOverScene];

var game = new Phaser.Game(config);
