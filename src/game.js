const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  status: document.querySelector("#statusText"),
  hpText: document.querySelector("#hpText"),
  hpBar: document.querySelector("#hpBar"),
  bossHpText: document.querySelector("#bossHpText"),
  bossHpBar: document.querySelector("#bossHpBar"),
  roomText: document.querySelector("#roomText"),
  buildPanel: document.querySelector("#buildPanel"),
  coopStatus: document.querySelector("#coopStatus"),
  coopCount: document.querySelector("#coopCount"),
  armory: document.querySelector("#armory"),
  bossSelector: document.querySelector("#bossSelector"),
  floatText: document.querySelector("#floatText"),
  potionButton: document.querySelector("#potionButton"),
  resetButton: document.querySelector("#resetButton"),
  deathScreen: document.querySelector("#deathScreen"),
  deathResetButton: document.querySelector("#deathResetButton"),
};

const world = {
  width: 1680,
  height: 900,
  wall: 36,
  starter: { x: 80, y: 120, w: 560, h: 660 },
  arena: { x: 760, y: 90, w: 820, h: 720 },
  gate: { x: 610, y: 390, w: 150, h: 130 },
};

const gear = {
  weapon: {
    ironBlade: { slot: "weapon", name: "Sword", tag: "Warrior", damage: 46, range: 54, speed: 1.05, moveSpeedBonus: 30, color: "#d8d1c4" },
    emberBow: { slot: "weapon", name: "Bow", tag: "Ranged", damage: 27, range: 230, speed: 0.78, color: "#e0a14e" },
    pulseStaff: { slot: "weapon", name: "Staff", tag: "Magic", damage: 46, range: 170, speed: 1.55, color: "#8ec7ff" },
    shadowDaggers: { slot: "weapon", name: "Daggers", tag: "Rogue", damage: 32, range: 82, speed: 0.62, moveSpeedBonus: 36, color: "#9be06f" },
  },
  armor: {
    duelistCoat: { slot: "armor", name: "Light Armor", tag: "Light", armor: 2, maxHp: 115, speed: 250, color: "#557d61" },
    bulwarkPlate: { slot: "armor", name: "Heavy Armor", tag: "Tank", armor: 8, maxHp: 160, speed: 195, color: "#8d8f92" },
    channelerRobe: { slot: "armor", name: "Mage Armor", tag: "Glass", armor: 0, maxHp: 75, speed: 270, damageMultiplier: 1.5, color: "#6f75b8" },
  },
};

const combatTuning = {
  incomingDamageMultiplier: 1.8975,
};

const abilityLoadouts = {
  melee: [
    { key: "Q", name: "Shield Bash", cooldown: 4.5 },
    { key: "Space", name: "Whirlwind Dash", cooldown: 8 },
    { key: "R", name: "Shield Wall", cooldown: 15 },
  ],
  ranger: [
    { key: "Q", name: "Marked Shot", cooldown: 7 },
    { key: "Space", name: "Tumble Shot", cooldown: 9 },
    { key: "R", name: "Volley Trap", cooldown: 16 },
  ],
  mage: [
    { key: "Q", name: "Fire Blast", cooldown: 6 },
    { key: "Space", name: "Blink Step", cooldown: 10 },
    { key: "R", name: "Time Warp", cooldown: 18 },
  ],
  rogue: [
    { key: "Space", name: "Shadow Step", cooldown: 8 },
    { key: "E", name: "Backstab", cooldown: 6 },
    { key: "R", name: "Smoke Bomb", cooldown: 16 },
  ],
};

const stands = [
  { x: 165, y: 270, type: "weapon", id: "ironBlade" },
  { x: 285, y: 270, type: "weapon", id: "emberBow" },
  { x: 405, y: 270, type: "weapon", id: "pulseStaff" },
  { x: 525, y: 270, type: "weapon", id: "shadowDaggers" },
  { x: 205, y: 520, type: "armor", id: "duelistCoat" },
  { x: 340, y: 520, type: "armor", id: "bulwarkPlate" },
  { x: 475, y: 520, type: "armor", id: "channelerRobe" },
];

const saveKey = "boss-fight-save-v1";
const playerSprite = new Image();
let cleanedPlayerSprite = null;
playerSprite.src = "./assets/player-spritesheet.png";
playerSprite.addEventListener("load", () => {
  cleanedPlayerSprite = createTransparentSprite(playerSprite);
});
const glassMageSprite = new Image();
let cleanedGlassMageSprite = null;
glassMageSprite.src = "./assets/glass-mage-spritesheet.png";
glassMageSprite.addEventListener("load", () => {
  cleanedGlassMageSprite = createTransparentSprite(glassMageSprite);
});
const rangedSprite = new Image();
let cleanedRangedSprite = null;
rangedSprite.src = "./assets/ranged-spritesheet.png";
rangedSprite.addEventListener("load", () => {
  cleanedRangedSprite = createTransparentSprite(rangedSprite);
});
const meleeSprite = new Image();
let cleanedMeleeSprite = null;
meleeSprite.src = "./assets/melee-spritesheet.png";
meleeSprite.addEventListener("load", () => {
  cleanedMeleeSprite = createTransparentSprite(meleeSprite);
});
const rogueSprite = new Image();
let cleanedRogueSprite = null;
rogueSprite.src = "./assets/rogue-spritesheet.png";
rogueSprite.addEventListener("load", () => {
  cleanedRogueSprite = createTransparentSprite(rogueSprite);
});
const curlyFriesSprite = new Image();
let cleanedCurlyFriesSprite = null;
curlyFriesSprite.src = "./assets/curly-fries-spritesheet.png";
curlyFriesSprite.addEventListener("load", () => {
  cleanedCurlyFriesSprite = createTransparentSprite(curlyFriesSprite);
});

let player = createPlayer();
let boss = createBoss("cola");
let condimentBosses = [];
let hazards = [];
let playerProjectiles = [];
let abilityEffects = [];
let particles = [];
let camera = { x: 0, y: 0 };
let mouseWorld = { x: 300, y: 685 };
const movementKeys = { up: false, down: false, left: false, right: false };
const keyDirections = {
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};
let selectedBoss = null;
let floatTimer = 0;
let fightStartedAt = 0;
let lastTime = performance.now();
let logLines = ["Choose gear, use WASD to cross the gate, click to shoot."];
const multiplayer = {
  socket: null,
  id: null,
  connected: false,
  count: 1,
  sendTimer: 0,
  reconnectTimer: 0,
  reconnectDelay: 3,
  peers: new Map(),
};

function createPlayer() {
  return {
    x: 300,
    y: 685,
    radius: 18,
    destination: null,
    hp: 115,
    maxHp: 115,
    potions: 3,
    attackCooldown: 0,
    abilityCooldowns: [0, 0, 0],
    castTimer: 0,
    castMoveLockTimer: 0,
    castAngle: 0,
    pendingAbilityCast: null,
    rangerAttackTimer: 0,
    rangerAttackAngle: 0,
    meleeAttackTimer: 0,
    meleeAttackAngle: 0,
    rogueAttackTimer: 0,
    rogueAttackAngle: 0,
    backstabTimer: 0,
    smokeSpeedGranted: false,
    tumbleTimer: 0,
    invulnerableTimer: 0,
    shieldWallTimer: 0,
    guardSpeedTimer: 0,
    gateCooldown: 0,
    room: "starter",
    dead: false,
    won: false,
    freezeTimer: 0,
    chillStacks: 0,
    chillTimer: 0,
    facing: "down",
    animationTime: 0,
    moving: false,
    lastMoveX: 0,
    lastMoveY: 1,
    greaseCooldown: 0,
    slide: null,
    gear: { weapon: "ironBlade", armor: "duelistCoat" },
    stats: { damage: 26, range: 54, speed: 250, armor: 2 },
  };
}

function createBoss(kind = "burger") {
  const bosses = {
    burger: {
      kind: "burger",
      name: "Big Burger",
      radius: 58,
      maxHp: 600,
      color: "#a76e3e",
      enrageColor: "#b94835",
      attackTimer: 1.8,
      swingTimer: 1.2,
    },
    fries: {
      kind: "fries",
      name: "Curly Fries",
      radius: 48,
      maxHp: 1440,
      color: "#d9aa4f",
      enrageColor: "#f0c95d",
      attackTimer: 1.2,
      swingTimer: 1.1,
    },
    trio: {
      kind: "trio",
      name: "Condiment Trio",
      radius: 1,
      maxHp: 840,
      color: "#f2d087",
      enrageColor: "#f2d087",
      attackTimer: 1,
      swingTimer: 1,
    },
    sauce: {
      kind: "sauce",
      name: "Special Sauce",
      radius: 66,
      maxHp: 650,
      color: "#df6f3f",
      enrageColor: "#f0c95d",
      attackTimer: 1.15,
      swingTimer: 1.15,
    },
    cola: {
      kind: "cola",
      name: "Big Cola",
      radius: 62,
      maxHp: 1400,
      color: "#3d2419",
      enrageColor: "#6f2f22",
      attackTimer: 1.2,
      swingTimer: 1.2,
    },
    shake: {
      kind: "shake",
      name: "Peanut Buster Shake",
      radius: 72,
      maxHp: 560,
      color: "#f1e2c9",
      enrageColor: "#d18b43",
      attackTimer: 1.2,
      swingTimer: 1.2,
    },
    nacho: {
      kind: "nacho",
      name: "Nacho Libre",
      radius: 70,
      maxHp: 1800,
      color: "#d8a231",
      enrageColor: "#ffb12f",
      attackTimer: 1.2,
      swingTimer: 1.2,
    },
    pizza: {
      kind: "pizza",
      name: "Pizza Phantom",
      radius: 66,
      maxHp: 1500,
      color: "#d84f37",
      enrageColor: "#f0bd4b",
      attackTimer: 1.1,
      swingTimer: 1.2,
    },
  };
  const template = bosses[kind];
  return {
    ...template,
    x: 1180,
    y: 450,
    hp: template.maxHp,
    phase: 1,
    totalPhases: kind === "shake" || kind === "nacho" || kind === "pizza" ? 3 : 1,
    enraged: false,
    animation: "idle",
    animationTime: 0,
    mode: "red",
    modeTimer: 3,
    pressureTimer: 7,
    shieldTimer: 0,
    state: "moving",
    stateTimer: 0,
    quadrantMode: "idle",
    quadrantTimer: 0,
    quadrantDuration: 10,
    nextWallTimer: 3.2,
    cheeseDropTimer: 0,
    playerQuadrant: null,
    chipTimer: 4.8,
    picoTimer: 0.15,
    picoIndex: 0,
    cheeseWaveActive: false,
    finalEnrageStarted: false,
    invulnerableTimer: 0,
    enrageTextTimer: 0,
    cloneTimer: 2.6,
    clones: [],
    ovenTimer: 2.2,
    deliveryCooldown: 8,
    deliveryActive: false,
    deliveryTimer: 0,
    deliveryGoalHp: 0,
    deliveryTextTimer: 0,
    deliveryUsed: false,
  };
}

function createCondimentBosses() {
  return [
    createCondiment("ketchup", "Ketchup", 1045, 330, "#cf3b2f", 260, 1.55),
    createCondiment("mustard", "Mustard", 1305, 450, "#e3bf34", 230, 1.1),
    createCondiment("mayo", "Mayo", 1055, 610, "#f3ead2", 220, 3.7),
  ];
}

function createCondiment(kind, name, x, y, color, maxHp, attackTimer) {
  return {
    kind,
    name,
    x,
    y,
    radius: 34,
    hp: maxHp,
    maxHp,
    color,
    attackTimer,
    baseAttackTimer: attackTimer,
    shieldTimer: 0,
    moveTimer: 0,
    destination: null,
    state: "moving",
    stateTimer: 0,
  };
}

function applyGear() {
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  const rogueArmorBonus = weapon.tag === "Rogue" ? 2 : 0;
  const warriorArmorBonus = isWarriorTag(weapon.tag) ? 4 : 0;
  player.stats = {
    damage: Math.round(weapon.damage * (armor.damageMultiplier || 1)),
    range: weapon.range,
    speed: armor.speed + (weapon.moveSpeedBonus || 0),
    armor: armor.armor + rogueArmorBonus + warriorArmorBonus,
  };
  const hpPercent = player.hp / player.maxHp || 1;
  player.maxHp = armor.maxHp;
  player.hp = Math.min(player.maxHp, Math.max(1, Math.round(player.maxHp * hpPercent)));
}

function loadGame() {
  const raw = localStorage.getItem(saveKey);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    player.gear = saved.gear || player.gear;
    applyGear();
  } catch {
    localStorage.removeItem(saveKey);
  }
}

function saveGear() {
  localStorage.setItem(saveKey, JSON.stringify({ gear: player.gear }));
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resetFight(keepPosition = false) {
  const gearState = { ...player.gear };
  const bossKind = boss.kind;
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  if (keepPosition) {
    player.x = 705;
    player.y = 455;
  }
  mouseWorld = { x: player.x + player.lastMoveX * 120, y: player.y + player.lastMoveY * 120 };
  boss = createBoss(bossKind);
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  hazards = [];
  playerProjectiles = [];
  abilityEffects = [];
  particles = [];
  selectedBoss = null;
  fightStartedAt = 0;
  logLines = ["Fight reset. Use WASD to cross the gate when ready."];
  showFloat("Fight reset");
}

function selectBoss(kind) {
  const gearState = { ...player.gear };
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  player.room = "arena";
  player.x = world.arena.x + 130;
  player.y = world.arena.y + world.arena.h / 2;
  mouseWorld = { x: player.x + 120, y: player.y };
  player.gateCooldown = 1.2;
  boss = createBoss(kind);
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  hazards = [];
  playerProjectiles = [];
  abilityEffects = [];
  particles = [];
  selectedBoss = null;
  fightStartedAt = 0;
  ui.status.textContent = `${boss.name} selected for testing. WASD to dodge, click to shoot.`;
  showFloat(boss.name);
  sendMultiplayerState(true);
}

function startFight() {
  if (fightStartedAt) return;
  fightStartedAt = performance.now();
  log("Boss awakened.");
  ui.status.textContent = "Boss awakened. Use WASD to dodge and click to shoot.";
}

function log(text) {
  logLines = [text, ...logLines].slice(0, 5);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function isTypingTarget(element) {
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element?.tagName) || element?.isContentEditable;
}

function currentBounds() {
  return player.room === "arena" ? world.arena : world.starter;
}

function currentClassKey() {
  const weaponTag = gear.weapon[player.gear.weapon].tag;
  if (weaponTag === "Ranged") return "ranger";
  if (weaponTag === "Magic") return "mage";
  if (weaponTag === "Rogue") return "rogue";
  return "melee";
}

function isWarriorTag(tag) {
  return tag === "Warrior" || tag === "Melee";
}

function currentAbilities() {
  return abilityLoadouts[currentClassKey()];
}

function aimAngle() {
  const dx = mouseWorld.x - player.x;
  const dy = mouseWorld.y - player.y;
  if (Math.hypot(dx, dy) > 8) return Math.atan2(dy, dx);
  return Math.atan2(player.lastMoveY || 1, player.lastMoveX || 0);
}

function movementOrAimAngle() {
  const dx = (movementKeys.right ? 1 : 0) - (movementKeys.left ? 1 : 0);
  const dy = (movementKeys.down ? 1 : 0) - (movementKeys.up ? 1 : 0);
  if (Math.hypot(dx, dy) > 0.1) return Math.atan2(dy, dx);
  return aimAngle();
}

function angleDifference(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function pointFromAngle(x, y, angle, distanceValue) {
  return {
    x: x + Math.cos(angle) * distanceValue,
    y: y + Math.sin(angle) * distanceValue,
  };
}

function nachoQuadrantBounds() {
  if (player.room !== "arena" || boss.kind !== "nacho" || boss.quadrantMode !== "active" || !boss.playerQuadrant) return null;
  const centerX = world.arena.x + world.arena.w / 2;
  const centerY = world.arena.y + world.arena.h / 2;
  const wallGap = 24;
  const left = world.arena.x;
  const right = world.arena.x + world.arena.w;
  const top = world.arena.y;
  const bottom = world.arena.y + world.arena.h;
  return {
    x: boss.playerQuadrant.includes("left") ? left : centerX + wallGap,
    y: boss.playerQuadrant.includes("top") ? top : centerY + wallGap,
    w: boss.playerQuadrant.includes("left") ? centerX - wallGap - left : right - centerX - wallGap,
    h: boss.playerQuadrant.includes("top") ? centerY - wallGap - top : bottom - centerY - wallGap,
  };
}

function handleCanvasClick(x, y) {
  if (player.dead || player.won) return;
  const stand = stands.find((item) => Math.hypot(item.x - x, item.y - y) < 48);
  if (stand && player.room === "starter") {
    equipFromStand(stand);
    return;
  }
  if (player.room !== "arena") {
    ui.status.textContent = "Use WASD to move through the gate.";
    return;
  }
  selectedBoss = null;
  shootAt(x, y);
}

function findClickedBoss(x, y) {
  return activeBosses().find((target) => target.hp > 0 && Math.hypot(target.x - x, target.y - y) < target.radius + 14);
}

function activeBosses() {
  return boss.kind === "trio" ? condimentBosses : [boss];
}

function livingBosses() {
  return activeBosses().filter((target) => target.hp > 0);
}

function constrainToRoom(x, y) {
  const bounds = nachoQuadrantBounds() || currentBounds();
  return {
    x: clamp(x, bounds.x + player.radius, bounds.x + bounds.w - player.radius),
    y: clamp(y, bounds.y + player.radius, bounds.y + bounds.h - player.radius),
  };
}

function equipFromStand(stand) {
  player.gear[stand.type] = stand.id;
  player.abilityCooldowns = [0, 0, 0];
  player.pendingAbilityCast = null;
  applyGear();
  player.hp = player.maxHp;
  saveGear();
  const item = gear[stand.type][stand.id];
  log(`Equipped ${item.name}.`);
  showFloat(item.name);
}

function movePlayer(dt) {
  if (player.dead || player.won) {
    player.destination = null;
    player.slide = null;
    player.moving = false;
    return;
  }
  player.moving = false;
  player.castMoveLockTimer = Math.max(0, player.castMoveLockTimer - dt);
  player.freezeTimer = Math.max(0, player.freezeTimer - dt);
  player.chillTimer = Math.max(0, player.chillTimer - dt);
  if (player.chillTimer <= 0) player.chillStacks = 0;
  if (player.castMoveLockTimer > 0) {
    player.destination = null;
    player.slide = null;
    return;
  }
  if (player.freezeTimer > 0) {
    player.destination = null;
    player.slide = null;
    return;
  }
  player.greaseCooldown = Math.max(0, player.greaseCooldown - dt);
  if (player.slide) {
    moveSlidingPlayer(dt);
    return;
  }
  const dx = (movementKeys.right ? 1 : 0) - (movementKeys.left ? 1 : 0);
  const dy = (movementKeys.down ? 1 : 0) - (movementKeys.up ? 1 : 0);
  const dist = Math.hypot(dx, dy);
  if (dist < 0.1) return;
  player.facing = getFacing(dx, dy);
  player.moving = true;
  player.animationTime += dt;
  player.lastMoveX = dx / dist;
  player.lastMoveY = dy / dist;
  player.x += player.lastMoveX * playerSpeed() * dt;
  player.y += player.lastMoveY * playerSpeed() * dt;
  const point = constrainToRoom(player.x, player.y);
  player.x = point.x;
  player.y = point.y;
}

function playerSpeed() {
  return player.stats.speed * (player.guardSpeedTimer > 0 ? 1.45 : 1);
}

function moveSlidingPlayer(dt) {
  player.moving = true;
  player.animationTime += dt * 1.8;
  player.slide.timer -= dt;
  player.x += player.slide.vx * dt;
  player.y += player.slide.vy * dt;
  if (player.slide.whirlwind) {
    player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.08);
    player.slide.damageTimer -= dt;
    if (player.slide.damageTimer <= 0) {
      player.slide.damageTimer = 0.06;
      const hit = damageTargetsInRadius(player.x, player.y, 92, Math.round(player.stats.damage * 0.28), "Whirlwind Dash");
      if (hit.length > 0 && !player.slide.reducedShieldCooldown) {
        player.abilityCooldowns[0] = Math.max(0, player.abilityCooldowns[0] - 2);
        player.slide.reducedShieldCooldown = true;
      }
      abilityEffects.push({ type: "whirlwindDash", x: player.x, y: player.y, r: 92, ttl: 0.16, maxTtl: 0.16 });
    }
  }
  player.slide.vx *= Math.pow(0.82, dt * 6);
  player.slide.vy *= Math.pow(0.82, dt * 6);

  const bounds = currentBounds();
  const clampedX = clamp(player.x, bounds.x + player.radius, bounds.x + bounds.w - player.radius);
  const clampedY = clamp(player.y, bounds.y + player.radius, bounds.y + bounds.h - player.radius);
  if (clampedX !== player.x || clampedY !== player.y) {
    player.slide = null;
    player.x = clampedX;
    player.y = clampedY;
    return;
  }
  player.x = clampedX;
  player.y = clampedY;

  if (Math.hypot(player.slide.vx, player.slide.vy) > 20) {
    player.facing = getFacing(player.slide.vx, player.slide.vy);
    const slideSpeed = Math.hypot(player.slide.vx, player.slide.vy);
    player.lastMoveX = player.slide.vx / slideSpeed;
    player.lastMoveY = player.slide.vy / slideSpeed;
  }
  if (player.slide.timer <= 0) {
    player.slide = null;
  }
}

function startGreaseSlide(puddle) {
  if (player.greaseCooldown > 0 || player.room !== "arena" || player.dead || player.won) return;
  let dx = player.lastMoveX;
  let dy = player.lastMoveY;
  if (Math.hypot(dx, dy) < 0.1) {
    dx = player.x - puddle.x;
    dy = player.y - puddle.y;
  }
  if (Math.hypot(dx, dy) < 0.1) dx = 1;
  const angle = Math.atan2(dy, dx);
  const speed = player.stats.speed * 2.15;
  player.slide = {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    timer: 0.68,
  };
  player.destination = null;
  player.greaseCooldown = 0.85;
  showFloat("Grease boost");
}

function getFacing(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

function updateRoom(dt) {
  player.gateCooldown = Math.max(0, player.gateCooldown - dt);
  if (player.room === "starter" && pointInRect(player.x, player.y, world.gate)) {
    player.room = "arena";
    player.x = world.arena.x + 130;
    player.y = world.arena.y + world.arena.h / 2;
    mouseWorld = { x: player.x + 120, y: player.y };
    player.destination = null;
    player.slide = null;
    player.gateCooldown = 1.2;
    startFight();
  }
  if (player.room === "arena" && player.x < world.arena.x + player.radius) {
    player.x = world.arena.x + player.radius;
    player.destination = null;
    player.slide = null;
  }
}

function updateCombat(dt) {
  if (player.room !== "arena" || player.dead || player.won) return;
  startFight();
  if (boss.kind === "trio") {
    updateTrioCombat(dt);
    return;
  }
  if (boss.kind === "sauce") {
    updateSpecialSauce(dt);
    return;
  }
  if (boss.kind === "cola") {
    updateBigCola(dt);
    return;
  }
  if (boss.kind === "shake") {
    updatePeanutBusterShake(dt);
    return;
  }
  if (boss.kind === "nacho") {
    updateNachoLibre(dt);
    return;
  }
  if (boss.kind === "pizza") {
    updatePizzaPhantom(dt);
    return;
  }
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.swingTimer -= dt;
  boss.attackTimer -= dt;

  const phaseThreshold = boss.kind === "fries" ? 0.6 : 0.55;
  if (boss.hp <= boss.maxHp * phaseThreshold && boss.phase === 1) {
    boss.phase = 2;
    log(boss.kind === "fries" ? "Phase 2: grease storm." : "Phase 2: furnace vents opened.");
  }
  if (boss.hp <= boss.maxHp * 0.25 && !boss.enraged) {
    boss.enraged = true;
    log(`${boss.name} is enraged.`);
  }

  if (boss.swingTimer <= 0 && distance(player, boss) < boss.radius + 46) {
    damagePlayer(boss.enraged ? 18 : 13, "Crushing swing");
    boss.swingTimer = boss.enraged ? 0.9 : 1.25;
  }
  if (boss.attackTimer <= 0) {
    spawnBossPattern();
    if (boss.kind === "fries") {
      boss.attackTimer = boss.enraged ? 1.2 : boss.phase === 2 ? 1.25 : 1.55;
    } else {
      boss.attackTimer = boss.enraged ? 1.25 : boss.phase === 2 ? 1.65 : 2.1;
    }
  }
}

function updatePeanutBusterShake(dt) {
  boss.animationTime += dt;
  boss.shieldTimer = Math.max(0, boss.shieldTimer - dt);
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  if (boss.phase === 3 && boss.hp <= boss.maxHp * 0.28 && !boss.enraged) {
    boss.enraged = true;
    log("Peanut Buster Shake enters final shake barrage.");
  }
  if (boss.attackTimer <= 0) {
    spawnShakePattern();
    boss.attackTimer = boss.enraged ? 0.75 : boss.phase === 3 ? 0.95 : boss.phase === 2 ? 1.12 : 1.3;
  }
}

function updateNachoLibre(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.invulnerableTimer = Math.max(0, boss.invulnerableTimer - dt);
  boss.enrageTextTimer = Math.max(0, boss.enrageTextTimer - dt);
  updateNachoPhase();
  updateNachoPico(dt);
  if (boss.phase >= 2) ensureNachoCheeseWave();
  updateNachoQuadrant(dt);

  if (boss.phase === 1) {
    if (boss.quadrantMode === "idle") {
      boss.nextWallTimer -= dt;
      if (boss.nextWallTimer <= 0) startNachoQuadrants(1.35, 10);
    }
    return;
  }

  if (boss.phase === 2) {
    boss.chipTimer -= dt;
    if (boss.chipTimer <= 0) {
      spawnNachoChips();
      boss.chipTimer = 5;
    }
    return;
  }

  if (boss.enraged) {
    boss.cheeseDropTimer -= dt;
    while (boss.cheeseDropTimer <= 0) {
      spawnNachoCheeseMortar(randomNachoArenaPoint());
      boss.cheeseDropTimer += 0.375;
    }
    boss.chipTimer -= dt;
    if (boss.chipTimer <= 0) {
      spawnNachoChips();
      boss.chipTimer = 4.2;
    }
  }
}

function updateNachoPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.66 && boss.phase === 1) {
    boss.phase = 2;
    clearNachoQuadrants();
    boss.chipTimer = 1.1;
    ensureNachoCheeseWave();
    log("Phase 2: tortilla chip shatter.");
    ui.status.textContent = "Nacho Libre starts shattering chips.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    clearNachoChipHazards();
    boss.nextWallTimer = 0.6;
    boss.chipTimer = 999;
    ensureNachoCheeseWave();
    log("Phase 3: cheese maze.");
    ui.status.textContent = "Nacho Libre drops the cheese maze.";
  }
  if (hpPercent <= 0.1 && !boss.finalEnrageStarted) {
    boss.finalEnrageStarted = true;
    boss.enraged = true;
    boss.hp = Math.ceil(boss.maxHp * 0.4);
    boss.invulnerableTimer = 2;
    boss.enrageTextTimer = 2.2;
    boss.cheeseDropTimer = 0.1;
    boss.chipTimer = 0.8;
    clearNachoQuadrants();
    log("Now I'm angry.");
    ui.status.textContent = "Now I'm angry.";
    showFloat("Now I'm angry.");
  }
}

function updateNachoPico(dt) {
  boss.picoTimer -= dt;
  while (boss.picoTimer <= 0) {
    if (boss.phase >= 3) {
      spawnPicoStormPiece();
      boss.picoTimer += boss.enraged ? 0.12 : 0.18;
    } else {
      spawnPicoPiece();
      boss.picoTimer += 0.11 + Math.random() * 0.14;
    }
  }
}

function updateNachoQuadrant(dt) {
  if (boss.quadrantMode === "warning") {
    boss.quadrantTimer -= dt;
    if (boss.quadrantTimer <= 0) {
      boss.quadrantMode = "active";
      boss.quadrantTimer = boss.quadrantDuration;
      boss.playerQuadrant = quadrantForPoint(player.x, player.y);
      boss.cheeseDropTimer = 0.15;
      log("Nacho walls locked the arena.");
    }
    return;
  }
  if (boss.quadrantMode !== "active") return;
  boss.quadrantTimer -= dt;
  boss.cheeseDropTimer -= dt;
  while (boss.cheeseDropTimer <= 0 && boss.quadrantTimer > 0) {
    spawnNachoCheesePuddle(player.x, player.y, boss.quadrantTimer + 0.6);
    boss.cheeseDropTimer += boss.enraged ? 0.52 : boss.phase === 3 ? 0.65 : 0.75;
  }
  if (boss.quadrantTimer <= 0) {
    clearNachoQuadrants();
    boss.nextWallTimer = boss.phase === 1 ? 5.8 : boss.enraged ? 3.6 : 5.2;
    log("Nacho walls crumble.");
  }
}

function updatePizzaPhantom(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  boss.cloneTimer -= dt;
  boss.ovenTimer -= dt;
  boss.deliveryTextTimer = Math.max(0, boss.deliveryTextTimer - dt);

  updatePizzaPhase();
  updatePizzaDelivery(dt);
  if (boss.phase >= 3) updatePizzaClones(dt);

  if (boss.phase >= 3 && boss.cloneTimer <= 0) {
    spawnPizzaClones();
    boss.cloneTimer = boss.enraged ? 5.2 : 6.4;
  }
  if (boss.phase >= 3 && boss.ovenTimer <= 0) {
    spawnOvenZones(boss.enraged ? 4 : 3);
    boss.ovenTimer = boss.enraged ? 3.2 : 4.2;
  }
  if (boss.attackTimer <= 0) {
    spawnPizzaPattern();
    boss.attackTimer = boss.enraged ? 1.05 : boss.phase === 3 ? 1.25 : boss.phase === 2 ? 1.45 : 1.75;
  }
}

function updatePizzaPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.66 && boss.phase === 1) {
    boss.phase = 2;
    boss.attackTimer = 0.4;
    log("Phase 2: slice split.");
    ui.status.textContent = "Pizza Phantom starts splitting slices.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.attackTimer = 0.5;
    boss.cloneTimer = 0.2;
    boss.ovenTimer = 1.2;
    boss.deliveryCooldown = 4.5;
    log("Phase 3: stuffed crust possession.");
    ui.status.textContent = "Pizza Phantom summons decoys.";
  }
  if (hpPercent <= 0.18 && !boss.enraged) {
    boss.enraged = true;
    boss.attackTimer = Math.min(boss.attackTimer, 0.45);
    log("Pizza Phantom haunts the oven.");
  }
}

function updatePizzaDelivery(dt) {
  if (boss.phase < 3 || boss.deliveryUsed) return;
  if (boss.deliveryActive) {
    boss.deliveryTimer -= dt;
    if (boss.hp <= boss.deliveryGoalHp) {
      boss.deliveryActive = false;
      boss.deliveryUsed = true;
      boss.deliveryTextTimer = 0;
      log("Delivery timer broken.");
      showFloat("Timer broken");
      return;
    }
    if (boss.deliveryTimer <= 0) {
      boss.deliveryActive = false;
      boss.deliveryUsed = true;
      boss.deliveryTextTimer = 0;
      spawnPizzaBoxSlam();
      log("Pizza box slam incoming.");
    }
    return;
  }
  boss.deliveryCooldown -= dt;
  if (boss.deliveryCooldown <= 0) startPizzaDeliveryCheck();
}

function updatePizzaClones(dt) {
  boss.clones = boss.clones.filter((clone) => {
    clone.ttl -= dt;
    clone.fireTimer -= dt;
    if (clone.fireTimer <= 0) {
      spawnPizzaCloneBolt(clone);
      clone.fireTimer = boss.enraged ? 1.05 : 1.35;
    }
    return clone.ttl > 0;
  });
}

function updateBigCola(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  boss.pressureTimer -= dt;
  if (boss.hp <= boss.maxHp * 0.6 && boss.phase === 1) {
    boss.phase = 2;
    log("Big Cola starts fizzing harder.");
  }
  if (boss.hp <= boss.maxHp * 0.25 && !boss.enraged) {
    boss.enraged = true;
    log("Big Cola is over-carbonated.");
  }
  if (boss.pressureTimer <= 0) {
    spawnFizzBurst();
    boss.pressureTimer = boss.enraged ? 5.2 : boss.phase === 2 ? 6.4 : 8;
  }
  if (boss.attackTimer <= 0) {
    spawnBigColaPattern();
    boss.attackTimer = boss.enraged ? 1.0 : boss.phase === 2 ? 1.25 : 1.55;
  }
}

function updateSpecialSauce(dt) {
  boss.animationTime += dt;
  boss.modeTimer -= dt;
  boss.shieldTimer = Math.max(0, boss.shieldTimer - dt);
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  updateSpecialSauceState(dt);
  if (boss.hp <= boss.maxHp * 0.3 && !boss.enraged) {
    boss.enraged = true;
    log("Special Sauce is fully mixed.");
  }
  if (boss.modeTimer <= 0) {
    cycleSauceMode();
  }
  if (boss.attackTimer <= 0) {
    spawnSpecialSaucePattern();
  }
}

function updateSpecialSauceState(dt) {
  boss.stateTimer = Math.max(0, boss.stateTimer - dt);
  if (boss.state === "winding" && boss.stateTimer <= 0) {
    spawnSauceRicochet();
    boss.state = "recovering";
    boss.stateTimer = 0.35;
    boss.attackTimer = boss.enraged ? 1.05 : 1.35;
    log("Special Sauce fires ricochet seeds.");
    return;
  }
  if (boss.state === "recovering" && boss.stateTimer <= 0) {
    boss.state = "moving";
  }
}

function cycleSauceMode() {
  const modes = ["red", "yellow", "white"];
  const index = modes.indexOf(boss.mode);
  boss.mode = modes[(index + 1) % modes.length];
  boss.modeTimer = boss.enraged ? 2.2 : 3;
  log(`Special Sauce shifts to ${boss.mode} mode.`);
}

function updateTrioCombat(dt) {
  player.attackCooldown -= dt;
  moveCondimentBosses(dt);
  condimentBosses.forEach((target) => {
    if (target.hp <= 0) return;
    target.attackTimer -= dt;
    target.shieldTimer = Math.max(0, target.shieldTimer - dt);
    if (target.kind === "mustard") {
      updateMustardAttackState(target, dt);
      return;
    }
    if (target.attackTimer > 0) return;
    if (target.kind === "ketchup") spawnKetchupAttack(target);
    if (target.kind === "mayo") spawnMayoHeal(target);
    const deadCount = condimentBosses.filter((item) => item.hp <= 0).length;
    target.attackTimer = Math.max(0.55, target.baseAttackTimer - deadCount * 0.18);
  });
}

function updateMustardAttackState(target, dt) {
  target.stateTimer = Math.max(0, target.stateTimer - dt);
  if (target.state === "winding" && target.stateTimer <= 0) {
    spawnMustardAttack(target);
    target.state = "recovering";
    target.destination = null;
    target.stateTimer = 0.4;
    return;
  }
  if (target.state === "recovering" && target.stateTimer <= 0) {
    target.state = "moving";
    const deadCount = condimentBosses.filter((item) => item.hp <= 0).length;
    target.attackTimer = Math.max(0.7, target.baseAttackTimer - deadCount * 0.18);
    return;
  }
  if (target.state === "moving" && target.attackTimer <= 0) {
    target.destination = null;
    target.state = "winding";
    target.stateTimer = 0.5;
    log("Mustard is aiming.");
  }
}

function moveCondimentBosses(dt) {
  const mayo = condimentBosses.find((target) => target.kind === "mayo" && target.hp > 0);
  condimentBosses.forEach((target) => {
    if (target.hp <= 0) return;
    if (target.kind === "mustard" && target.state !== "moving") return;
    target.moveTimer -= dt;
    if (target.kind === "mayo") updateMayoMovement(target);
    if (target.kind === "mustard") updateMustardMovement(target, mayo);
    if (target.kind === "ketchup") updateKetchupMovement(target);
    if (target.destination) moveCondimentToward(target, target.destination, condimentSpeed(target), dt);
  });
}

function updateMayoMovement(target) {
  if (target.moveTimer > 0 && target.destination) return;
  const awayAngle = Math.atan2(target.y - player.y, target.x - player.x);
  const erraticTurn = (Math.random() - 0.5) * 2.4;
  const badPanicTurn = Math.random() < 0.22 ? Math.PI * (Math.random() > 0.5 ? 0.55 : -0.55) : 0;
  const angle = awayAngle + erraticTurn + badPanicTurn;
  const distanceRoll = 130 + Math.random() * 160;
  target.destination = clampArenaPoint(target.x + Math.cos(angle) * distanceRoll, target.y + Math.sin(angle) * distanceRoll, target.radius);
  target.moveTimer = 0.28 + Math.random() * 0.34;
}

function updateMustardMovement(target, mayo) {
  if (target.moveTimer > 0 && target.destination) return;
  const defendTarget = mayo || player;
  const toPlayer = Math.atan2(player.y - defendTarget.y, player.x - defendTarget.x);
  const guardDistance = mayo ? 74 : 105;
  const sideStep = mayo ? (Math.random() - 0.5) * 36 : 0;
  target.destination = clampArenaPoint(
    defendTarget.x + Math.cos(toPlayer) * guardDistance + Math.cos(toPlayer + Math.PI / 2) * sideStep,
    defendTarget.y + Math.sin(toPlayer) * guardDistance + Math.sin(toPlayer + Math.PI / 2) * sideStep,
    target.radius,
  );
  target.moveTimer = mayo ? 0.25 : 0.55;
}

function updateKetchupMovement(target) {
  if (target.moveTimer > 0 && target.destination) return;
  if (distance(target, player) < 220) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    target.destination = clampArenaPoint(target.x + Math.cos(angle) * 150, target.y + Math.sin(angle) * 150, target.radius);
  } else {
    target.destination = clampArenaPoint(target.x + (Math.random() - 0.5) * 150, target.y + (Math.random() - 0.5) * 150, target.radius);
  }
  target.moveTimer = 1.1;
}

function moveCondimentToward(target, destination, speed, dt) {
  const dx = destination.x - target.x;
  const dy = destination.y - target.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) {
    target.destination = null;
    return;
  }
  const step = Math.min(dist, speed * dt);
  target.x += (dx / dist) * step;
  target.y += (dy / dist) * step;
}

function condimentSpeed(target) {
  if (target.kind === "mayo") return 175;
  if (target.kind === "mustard") return 150;
  return 100;
}

function clampArenaPoint(x, y, radius) {
  return {
    x: clamp(x, world.arena.x + radius + 24, world.arena.x + world.arena.w - radius - 24),
    y: clamp(y, world.arena.y + radius + 24, world.arena.y + world.arena.h - radius - 24),
  };
}

function shootAt(x, y) {
  if (player.attackCooldown > 0) return;
  const dx = x - player.x;
  const dy = y - player.y;
  if (Math.hypot(dx, dy) < 6) return;
  startFight();
  player.facing = getFacing(dx, dy);
  firePlayerProjectile(Math.atan2(dy, dx));
}

function firePlayerProjectile(angle) {
  if (player.attackCooldown > 0) return;
  const weapon = gear.weapon[player.gear.weapon];
  const speed = projectileSpeedForWeapon(weapon.tag);
  const magicAttack = weapon.tag === "Magic";
  const rangedAttack = weapon.tag === "Ranged";
  const meleeAttack = isWarriorTag(weapon.tag);
  const rogueAttack = weapon.tag === "Rogue";
  playerProjectiles.push({
    x: player.x + Math.cos(angle) * 24,
    y: player.y + Math.sin(angle) * 24,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: magicAttack ? 11 : meleeAttack ? 12 : rogueAttack ? 8 : 6,
    damage: Math.round(player.stats.damage * (0.78 + Math.random() * 0.44)),
    color: magicAttack ? "#48efe4" : weapon.color,
    ttl: projectileTravelTime(weapon, speed),
    age: 0,
    heavy: magicAttack,
    tag: weapon.tag,
  });
  if (magicAttack) {
    player.castTimer = 0.36;
    player.castMoveLockTimer = 0.3;
    player.castAngle = angle;
    player.slide = null;
  }
  if (rangedAttack) {
    player.rangerAttackTimer = 0.28;
    player.rangerAttackAngle = angle;
  }
  if (meleeAttack) {
    player.meleeAttackTimer = 0.34;
    player.meleeAttackAngle = angle;
  }
  if (rogueAttack) {
    player.rogueAttackTimer = 0.24;
    player.rogueAttackAngle = angle;
  }
  player.attackCooldown = weapon.speed;
  ui.status.textContent = meleeAttack || rogueAttack ? `Slashing ${weapon.name}.` : `Firing ${weapon.name}.`;
}

function projectileSpeedForWeapon(tag) {
  if (tag === "Ranged") return 620;
  if (tag === "Magic") return 480;
  if (tag === "Rogue") return 720;
  return 760;
}

function projectileTravelTime(weapon, speed) {
  const rangeBonus = isWarriorTag(weapon.tag) ? 150 : weapon.tag === "Rogue" ? 62 : 210;
  return (player.stats.range + rangeBonus) / speed;
}

function useAbility(index) {
  if (player.dead || player.won || player.room !== "arena") return;
  const ability = currentAbilities()[index];
  if (!ability || player.abilityCooldowns[index] > 0) return;
  startFight();
  if (currentClassKey() === "melee") useMeleeAbility(index, ability);
  if (currentClassKey() === "ranger") useRangerAbility(index, ability);
  if (currentClassKey() === "mage") useMageAbility(index, ability);
  if (currentClassKey() === "rogue") useRogueAbility(index, ability);
}

function abilityIndexForKey(event) {
  const pressed = event.code === "Space" ? "space" : event.key.toLowerCase();
  return currentAbilities().findIndex((ability) => ability.key.toLowerCase() === pressed);
}

function spendAbility(index, ability) {
  player.abilityCooldowns[index] = ability.cooldown * (playerInTimeWarp() ? 0.5 : 1);
  ui.status.textContent = `${ability.name}.`;
  showFloat(ability.name);
}

function useMeleeAbility(index, ability) {
  if (index === 0) {
    spendAbility(index, ability);
    shieldBash();
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    whirlwindDash();
    return;
  }
  spendAbility(index, ability);
  player.shieldWallTimer = 10;
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "shieldWall");
  abilityEffects.push({ type: "shieldWall", x: player.x, y: player.y, r: 52, ttl: 10, maxTtl: 10 });
}

function shieldBash() {
  const angle = aimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.meleeAttackTimer = 0.3;
  player.meleeAttackAngle = angle;
  const range = 138;
  const halfAngle = Math.PI * 0.36;
  const hit = damageTargetsInCone(player.x, player.y, angle, range, halfAngle, Math.round(player.stats.damage * 0.72), "Shield Bash");
  hit.forEach((target) => {
    interruptTarget(target);
    shoveTarget(target, player.x, player.y, 54);
  });
  const blocked = destroyProjectilesInCone(player.x, player.y, angle, range + 22, halfAngle + 0.08);
  if (blocked > 0) particles.push({ x: player.x, y: player.y - 48, text: `blocked ${blocked}`, color: "#f0d47c", ttl: 0.7 });
  abilityEffects.push({ type: "shieldBash", x: player.x, y: player.y, angle, range, ttl: 0.24, maxTtl: 0.24 });
}

function whirlwindDash() {
  const angle = movementOrAimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.meleeAttackTimer = 0.34;
  player.meleeAttackAngle = angle;
  player.slide = {
    vx: Math.cos(angle) * player.stats.speed * 2.75,
    vy: Math.sin(angle) * player.stats.speed * 2.75,
    timer: 0.3,
    whirlwind: true,
    damageTimer: 0,
    reducedShieldCooldown: false,
  };
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.32);
  abilityEffects.push({ type: "whirlwindDash", x: player.x, y: player.y, r: 92, ttl: 0.2, maxTtl: 0.2 });
}

function useRangerAbility(index, ability) {
  const angle = aimAngle();
  if (index === 0) {
    spendAbility(index, ability);
    fireAbilityArrow(angle, {
      damage: Math.round(player.stats.damage * 0.72),
      speed: 860,
      color: "#ffd782",
      markedShot: true,
      ttl: 0.75,
    });
    player.rangerAttackTimer = 0.28;
    player.rangerAttackAngle = angle;
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    tumbleShot(angle);
    return;
  }
  spendAbility(index, ability);
  abilityEffects.push({
    type: "volleyTrap",
    x: player.x,
    y: player.y,
    r: 36,
    ttl: 4,
    maxTtl: 4,
    triggerTimer: 0.6,
    shotTimer: 0,
    shotsRemaining: 5,
  });
}

function tumbleShot(angle) {
  const rollAngle = movementOrAimAngle();
  player.facing = getFacing(Math.cos(rollAngle), Math.sin(rollAngle));
  player.slide = {
    vx: Math.cos(rollAngle) * player.stats.speed * 3.0,
    vy: Math.sin(rollAngle) * player.stats.speed * 3.0,
    timer: 0.24,
  };
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.22);
  player.tumbleTimer = 0.28;
  fireAbilityArrow(angle, {
    damage: Math.round(player.stats.damage * 0.66),
    speed: 760,
    color: "#f6c46d",
    ttl: 0.65,
  });
  abilityEffects.push({ type: "tumbleShot", x: player.x, y: player.y, angle: rollAngle, ttl: 0.32, maxTtl: 0.32 });
}

function fireAbilityArrow(angle, options) {
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  playerProjectiles.push({
    x: player.x + Math.cos(angle) * 28,
    y: player.y + Math.sin(angle) * 28,
    vx: Math.cos(angle) * options.speed,
    vy: Math.sin(angle) * options.speed,
    r: 7,
    damage: options.damage,
    color: options.color,
    ttl: options.ttl,
    age: 0,
    tag: "Ranged",
    ability: true,
    markedShot: Boolean(options.markedShot),
  });
}

function useMageAbility(index, ability) {
  const angle = aimAngle();
  if (index === 0) {
    spendAbility(index, ability);
    player.pendingAbilityCast = { type: "fireBlast", timer: 0.28, angle };
    player.castTimer = 0.36;
    player.castMoveLockTimer = 0.28;
    player.castAngle = angle;
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    blinkStep(angle);
    return;
  }
  spendAbility(index, ability);
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "timeWarp");
  abilityEffects.push({ type: "timeWarp", x: player.x, y: player.y, r: 132, ttl: 7.5, maxTtl: 7.5 });
}

function useRogueAbility(index, ability) {
  if (index === 0) {
    spendAbility(index, ability);
    shadowStep();
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    backstabStrike();
    return;
  }
  spendAbility(index, ability);
  abilityEffects.push({ type: "smokeBomb", x: player.x, y: player.y, r: 92, ttl: 4.2, maxTtl: 4.2, wasInside: true });
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.35);
  player.smokeSpeedGranted = false;
}

function shadowStep() {
  const angle = aimAngle();
  const origin = { x: player.x, y: player.y };
  const destination = constrainToRoom(player.x + Math.cos(angle) * 185, player.y + Math.sin(angle) * 185);
  player.x = destination.x;
  player.y = destination.y;
  player.slide = null;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.32);
  player.backstabTimer = 2;
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  abilityEffects.push({ type: "shadowStep", x: origin.x, y: origin.y, x2: player.x, y2: player.y, ttl: 0.42, maxTtl: 0.42 });
  particles.push({ x: player.x, y: player.y - 36, text: "backstab ready", color: "#c8ff9a", ttl: 0.85 });
}

function backstabStrike() {
  const angle = aimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  const empowered = player.backstabTimer > 0;
  const targets = damageTargetsInCone(player.x, player.y, angle, 122, Math.PI * 0.52, Math.round(player.stats.damage * (empowered ? 1.85 : 1.05)), empowered ? "Backstab" : "Twin Cut");
  targets.forEach((target) => {
    applyBleed(target);
    if (target.poisonStacks > 0) player.abilityCooldowns[0] = Math.max(0, player.abilityCooldowns[0] - 2);
    if (empowered) consumeExposed(target);
  });
  player.backstabTimer = 0;
  player.rogueAttackTimer = 0.3;
  player.rogueAttackAngle = angle;
  abilityEffects.push({ type: "backstab", x: player.x, y: player.y, angle, range: 126, empowered, ttl: 0.28, maxTtl: 0.28 });
}

function blinkStep(angle) {
  const origin = { x: player.x, y: player.y };
  const target = constrainToRoom(player.x + Math.cos(angle) * 165, player.y + Math.sin(angle) * 165);
  player.x = target.x;
  player.y = target.y;
  player.slide = null;
  player.castTimer = 0.22;
  player.castAngle = angle;
  abilityEffects.push({ type: "blinkRune", x: origin.x, y: origin.y, r: 72, ttl: 1.15, maxTtl: 1.15, pulseTimer: 0 });
  particles.push({ x: player.x, y: player.y - 35, text: "blink", color: "#bafcff", ttl: 0.65 });
}

function fireFireBlast(angle) {
  playerProjectiles.push({
    x: player.x + Math.cos(angle) * 30,
    y: player.y + Math.sin(angle) * 30,
    vx: Math.cos(angle) * 520,
    vy: Math.sin(angle) * 520,
    r: 18,
    damage: Math.round(player.stats.damage * 3),
    color: "#ff8a32",
    ttl: 1.05,
    age: 0,
    heavy: true,
    tag: "Magic",
    ability: true,
    fireBlast: true,
    explosionRadius: 132,
  });
  abilityEffects.push({ type: "fireBlastCast", x: player.x, y: player.y - 12, angle, ttl: 0.28, maxTtl: 0.28 });
}

function damageTargetsInCone(x, y, angle, range, halfAngle, amount, source) {
  return livingBosses().filter((target) => {
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist > range + target.radius) return false;
    if (Math.abs(angleDifference(Math.atan2(dy, dx), angle)) > halfAngle) return false;
    return damageBossTarget(target, amount, source);
  });
}

function damageTargetsInRadius(x, y, radius, amount, source, hitTargets = []) {
  return livingBosses().filter((target) => {
    if (hitTargets.includes(target)) return false;
    if (distance({ x, y }, target) > radius + target.radius) return false;
    const hit = damageBossTarget(target, amount, source);
    if (hit) hitTargets.push(target);
    return hit;
  });
}

function destroyProjectilesInCone(x, y, angle, range, halfAngle) {
  let blocked = 0;
  hazards = hazards.filter((hazard) => {
    if (!isDestroyableProjectile(hazard)) return true;
    const dx = hazard.x - x;
    const dy = hazard.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist > range + (hazard.r || 0)) return true;
    if (Math.abs(angleDifference(Math.atan2(dy, dx), angle)) > halfAngle) return true;
    blocked += 1;
    abilityEffects.push({ type: "projectileBlock", x: hazard.x, y: hazard.y, r: (hazard.r || 10) + 10, ttl: 0.22, maxTtl: 0.22 });
    return false;
  });
  return blocked;
}

function isDestroyableProjectile(hazard) {
  return Number.isFinite(hazard.vx) && Number.isFinite(hazard.vy) && hazard.damage > 0;
}

function shoveTarget(target, x, y, amount) {
  if (target.kind !== "ketchup" && target.kind !== "mayo" && target.kind !== "mustard") return;
  const angle = Math.atan2(target.y - y, target.x - x);
  const point = clampArenaPoint(target.x + Math.cos(angle) * amount, target.y + Math.sin(angle) * amount, target.radius);
  target.x = point.x;
  target.y = point.y;
  target.destination = null;
}

function interruptTarget(target) {
  if (target.state !== "winding") return;
  target.state = "recovering";
  target.stateTimer = 0.45;
  target.attackTimer = Math.min(target.attackTimer || 1, 1.0);
  particles.push({ x: target.x, y: target.y - target.radius - 32, text: "interrupted", color: "#fff08a", ttl: 0.8 });
}

function spawnBossPattern() {
  if (boss.kind === "fries") {
    spawnCurlyFriesPattern();
    return;
  }
  spawnFloorSlam();
  const pattern = boss.phase === 1 ? Math.random() : Math.random() * 1.2;
  if (pattern < 0.72) {
    const count = boss.enraged ? 14 : boss.phase === 2 ? 11 : 8;
    const volleyOffset = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i += 1) {
      const lane = (Math.PI * 2 * i) / count;
      const angle = volleyOffset + lane + (Math.random() - 0.5) * 0.55;
      const speed = (boss.enraged ? 300 : 255) + Math.random() * 85;
      hazards.push({
        type: "bolt",
        x: boss.x + (Math.random() - 0.5) * 28,
        y: boss.y + (Math.random() - 0.5) * 28,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 12,
        ttl: 2.75 + Math.random() * 0.55,
        damage: 14,
      });
    }
    log("Floor slam and arc bolts incoming.");
  } else {
    for (let i = 0; i < 7; i += 1) {
      hazards.push({
        type: "vent",
        x: world.arena.x + 140 + Math.random() * (world.arena.w - 280),
        y: world.arena.y + 110 + Math.random() * (world.arena.h - 220),
        r: 28,
        warn: 0.75 + i * 0.04,
        ttl: 1.3 + i * 0.04,
        damage: 17,
      });
    }
    log("Floor slam and furnace vents primed.");
  }
}

function spawnPizzaPattern() {
  const roll = Math.random();
  if (boss.phase === 1) {
    if (roll < 0.56) spawnPizzaDash();
    else spawnPepperoniVolley(7, 0.5);
    return;
  }
  if (boss.phase === 2) {
    if (roll < 0.46) spawnPizzaSlices(6);
    else if (roll < 0.72) spawnPizzaDash();
    else spawnPizzaCrustWalls(2);
    return;
  }
  if (roll < 0.3) spawnPizzaSlices(boss.enraged ? 9 : 8);
  else if (roll < 0.52) spawnPepperoniVolley(boss.enraged ? 12 : 10, 0.85);
  else if (roll < 0.76) spawnPizzaDash();
  else spawnOvenZones(boss.enraged ? 5 : 4);
}

function spawnPizzaDash() {
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const travel = distanceToArenaWall(boss.x, boss.y, angle) - boss.radius - 34;
  const dashDistance = clamp(travel, 180, 760);
  const target = clampArenaPoint(
    boss.x + Math.cos(angle) * dashDistance,
    boss.y + Math.sin(angle) * dashDistance,
    boss.radius,
  );
  hazards.push({
    type: "pizzaDash",
    x: boss.x,
    y: boss.y,
    targetX: target.x,
    targetY: target.y,
    angle,
    length: Math.hypot(target.x - boss.x, target.y - boss.y),
    width: boss.phase >= 2 ? 48 : 40,
    warn: boss.enraged ? 0.55 : 0.72,
    ttl: boss.enraged ? 0.95 : 1.15,
    damage: boss.enraged ? 36 : 30,
    hit: false,
    dashed: false,
  });
  log("Delivery dash lined up.");
}

function spawnPepperoniVolley(count, spread) {
  const base = Math.atan2(player.y - boss.y, player.x - boss.x);
  const reducedCount = Math.max(1, Math.round(count * 0.8));
  for (let i = 0; i < reducedCount; i += 1) {
    const angle = base + (i - (reducedCount - 1) / 2) * (spread / Math.max(1, reducedCount - 1)) + (Math.random() - 0.5) * 0.08;
    const speed = (boss.enraged ? 285 : 245) + Math.random() * 45;
    hazards.push({
      type: "pepperoni",
      x: boss.x + Math.cos(angle) * (boss.radius + 8),
      y: boss.y + Math.sin(angle) * (boss.radius + 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 11,
      ttl: 3,
      damage: boss.enraged ? 13 : 10,
      color: "#b93a2f",
    });
  }
  log("Pepperoni volley fired.");
}

function spawnPizzaSlices(count) {
  const offset = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / count;
    const speed = boss.enraged ? 300 : 260;
    hazards.push({
      type: "pizzaSlice",
      x: boss.x + Math.cos(angle) * (boss.radius + 18),
      y: boss.y + Math.sin(angle) * (boss.radius + 18),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      r: 24,
      ttl: 2.6,
      damage: boss.enraged ? 22 : 18,
    });
  }
  log("Pizza slices split outward.");
}

function spawnPizzaCrustWalls(count) {
  for (let i = 0; i < count; i += 1) {
    const vertical = Math.random() > 0.5;
    const position = vertical
      ? world.arena.x + 145 + Math.random() * (world.arena.w - 290)
      : world.arena.y + 125 + Math.random() * (world.arena.h - 250);
    hazards.push({
      type: "pizzaCrustWall",
      orientation: vertical ? "vertical" : "horizontal",
      position,
      x: vertical ? position : world.arena.x + world.arena.w / 2,
      y: vertical ? world.arena.y + world.arena.h / 2 : position,
      width: 34,
      warn: 0.82,
      ttl: boss.enraged ? 3.2 : 3.6,
      damage: 12,
      damageTimer: 0,
    });
  }
  log("Stuffed crust walls forming.");
}

function spawnPizzaClones() {
  boss.clones = [];
  for (let i = 0; i < 3; i += 1) {
    const point = randomPizzaArenaPoint(95);
    boss.clones.push({
      x: point.x,
      y: point.y,
      ttl: boss.enraged ? 4.3 : 5.1,
      fireTimer: 0.55 + i * 0.28,
      phaseOffset: i * 1.8 + Math.random(),
    });
  }
  log("Pizza Phantom splits into decoys.");
}

function spawnPizzaCloneBolt(clone) {
  const angle = Math.atan2(player.y - clone.y, player.x - clone.x);
  hazards.push({
    type: "cheeseBolt",
    x: clone.x,
    y: clone.y,
    vx: Math.cos(angle) * (boss.enraged ? 330 : 290),
    vy: Math.sin(angle) * (boss.enraged ? 330 : 290),
    r: 7,
    ttl: 2.4,
    damage: boss.enraged ? 10 : 8,
    color: "#f4d36b",
  });
}

function spawnOvenZones(count) {
  for (let i = 0; i < count; i += 1) {
    const point = i === 0 ? randomArenaPointNearPlayer(80) : randomPizzaArenaPoint(75);
    hazards.push({
      type: "ovenZone",
      x: point.x,
      y: point.y,
      r: boss.enraged ? 62 : 54,
      warn: boss.enraged ? 0.82 : 1.05,
      ttl: boss.enraged ? 1.22 : 1.45,
      damage: boss.enraged ? 38 : 32,
      hit: false,
    });
  }
  log("Oven zones are heating up.");
}

function startPizzaDeliveryCheck() {
  boss.deliveryActive = true;
  boss.deliveryTimer = boss.enraged ? 4.4 : 5.2;
  boss.deliveryGoalHp = Math.max(0, boss.hp - (boss.enraged ? 150 : 115));
  boss.deliveryTextTimer = boss.deliveryTimer;
  log("30 minutes or less!");
  showFloat("30 minutes or less!");
}

function spawnPizzaBoxSlam() {
  hazards.push({
    type: "pizzaBoxSlam",
    x: world.arena.x + world.arena.w / 2,
    y: world.arena.y + world.arena.h / 2,
    warn: 0.9,
    ttl: 1.18,
    damage: boss.enraged ? 82 : 68,
    hit: false,
  });
}

function spawnPizzaCheeseTrail(dash, targetList = hazards) {
  const length = Math.max(1, dash.length);
  const steps = Math.max(3, Math.floor(length / 95));
  for (let i = 1; i <= steps; i += 1) {
    const progress = i / (steps + 1);
    targetList.push({
      type: "pizzaCheeseTrail",
      x: dash.x + Math.cos(dash.angle) * length * progress,
      y: dash.y + Math.sin(dash.angle) * length * progress,
      r: 34,
      ttl: boss.enraged ? 4.4 : 3.8,
      damage: boss.enraged ? 10 : 8,
      damageTimer: 0,
    });
  }
}

function spawnSpecialSaucePattern() {
  if (boss.mode === "red") {
    const count = boss.enraged ? 3 : 2;
    for (let i = 0; i < count; i += 1) spawnSauceMortar();
    boss.attackTimer = boss.enraged ? 0.95 : 1.25;
    log("Special Sauce launches splatter mortars.");
    return;
  }
  if (boss.mode === "yellow") {
    if (boss.state === "moving") {
      boss.state = "winding";
      boss.stateTimer = 0.55;
      boss.attackTimer = 999;
      log("Special Sauce is aiming.");
    }
    return;
  }
  boss.shieldTimer = 1.8;
  spawnSauceSpiral();
  boss.attackTimer = boss.enraged ? 0.95 : 1.25;
  log("Special Sauce shields and spirals.");
}

function spawnBigColaPattern() {
  const roll = Math.random();
  if (roll < 0.38) {
    spawnColaBubbles(boss.enraged ? 7 : boss.phase === 2 ? 6 : 5);
    log("Big Cola releases bubbles.");
  } else if (roll < 0.7) {
    spawnStrawSnipe();
    log("Big Cola lines up a straw snipe.");
  } else {
    spawnSodaSpill();
    log("Big Cola spills soda.");
  }
}

function spawnColaBubbles(count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 55 + Math.random() * 55;
    hazards.push({
      type: "colaBubble",
      x: boss.x + Math.cos(angle) * (boss.radius + 20),
      y: boss.y + Math.sin(angle) * (boss.radius + 20),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 15 + Math.random() * 8,
      ttl: 4,
      damage: boss.enraged ? 36 : 27,
    });
  }
}

function spawnStrawSnipe() {
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  hazards.push({
    type: "strawSnipe",
    x: boss.x,
    y: boss.y,
    angle,
    warn: boss.enraged ? 0.45 : 0.65,
    ttl: boss.enraged ? 0.8 : 1,
    damage: boss.enraged ? 84 : 66,
    hit: false,
  });
}

function spawnFizzBurst() {
  hazards.push({
    type: "fizzBurst",
    x: boss.x,
    y: boss.y,
    r: boss.enraged ? 225 : boss.phase === 2 ? 205 : 185,
    warn: 1,
    ttl: 1.25,
    damage: boss.enraged ? 72 : 54,
    hit: false,
  });
  log("Big Cola pressure is about to burst.");
}

function spawnSodaSpill() {
  const point = randomArenaPointNearPlayer(180);
  hazards.push({
    type: "sodaDrop",
    x: point.x,
    y: point.y,
    r: 47,
    warn: boss.enraged ? 0.65 : 0.85,
    warnDuration: boss.enraged ? 0.65 : 0.85,
    ttl: boss.enraged ? 0.95 : 1.15,
    fallHeight: 155,
    hit: false,
    damage: 12,
  });
}

function startNachoQuadrants(warn = 1.25, duration = 10, force = false) {
  if (!force && boss.quadrantMode !== "idle") return;
  clearNachoQuadrantPuddles();
  boss.quadrantMode = "warning";
  boss.quadrantTimer = warn;
  boss.quadrantDuration = duration;
  boss.playerQuadrant = null;
  boss.cheeseDropTimer = warn + 0.2;
  log("Nacho walls are forming.");
}

function clearNachoQuadrants() {
  boss.quadrantMode = "idle";
  boss.quadrantTimer = 0;
  boss.playerQuadrant = null;
  clearNachoQuadrantPuddles();
}

function clearNachoQuadrantPuddles() {
  hazards = hazards.filter((hazard) => !hazard.quadrantCheese);
}

function clearNachoChipHazards() {
  hazards = hazards.filter((hazard) => hazard.type !== "nachoChip" && hazard.type !== "nachoCrumb");
}

function quadrantForPoint(x, y) {
  const centerX = world.arena.x + world.arena.w / 2;
  const centerY = world.arena.y + world.arena.h / 2;
  return `${x < centerX ? "left" : "right"}-${y < centerY ? "top" : "bottom"}`;
}

function ensureNachoCheeseWave() {
  if (hazards.some((hazard) => hazard.type === "cheeseWave")) return;
  const fromLeft = player.x > world.arena.x + world.arena.w / 2;
  hazards.push({
    type: "cheeseWave",
    x: fromLeft ? world.arena.x + 80 : world.arena.x + world.arena.w - 80,
    y: clamp(player.y, world.arena.y + 100, world.arena.y + world.arena.h - 100),
    r: 76,
    ttl: Number.POSITIVE_INFINITY,
    damage: 1000,
    damageTimer: 0,
  });
  boss.cheeseWaveActive = true;
}

function spawnPicoPiece() {
  const colors = ["#f7f3e8", "#cf3b2f", "#3ca45e"];
  const angle = boss.picoIndex * 2.399963 + Math.sin(boss.animationTime * 2.2) * 0.18;
  const speed = 90 + (boss.picoIndex % 5) * 18 + Math.random() * 28;
  hazards.push({
    type: "pico",
    x: boss.x + Math.cos(angle) * (boss.radius * 0.65),
    y: boss.y + Math.sin(angle) * (boss.radius * 0.45),
    vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 45,
    vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 45,
    r: 4 + Math.random() * 2.5,
    ttl: 1.15 + Math.random() * 0.55,
    color: colors[boss.picoIndex % colors.length],
  });
  boss.picoIndex += 1;
}

function spawnPicoStormPiece() {
  const colors = ["#f7f3e8", "#cf3b2f", "#3ca45e"];
  const laneCount = boss.enraged ? 7 : 6;
  const lane = boss.picoIndex % laneCount;
  const fromVerticalEdge = Math.floor(boss.picoIndex / laneCount) % 2 === 0;
  const direction = Math.floor(boss.picoIndex / (laneCount * 2)) % 2 === 0 ? 1 : -1;
  const laneWobble = Math.sin(boss.animationTime * 1.7 + boss.picoIndex) * 22;
  const edgeInset = 12;
  const verticalLaneY = clamp(
    world.arena.y + 75 + lane * ((world.arena.h - 150) / Math.max(1, laneCount - 1)) + laneWobble,
    world.arena.y + 44,
    world.arena.y + world.arena.h - 44,
  );
  const horizontalLaneX = clamp(
    world.arena.x + 85 + lane * ((world.arena.w - 170) / Math.max(1, laneCount - 1)) + laneWobble,
    world.arena.x + 44,
    world.arena.x + world.arena.w - 44,
  );
  const start = fromVerticalEdge
    ? {
        x: direction > 0 ? world.arena.x + edgeInset : world.arena.x + world.arena.w - edgeInset,
        y: verticalLaneY,
      }
    : {
        x: horizontalLaneX,
        y: direction > 0 ? world.arena.y + edgeInset : world.arena.y + world.arena.h - edgeInset,
      };
  const base = fromVerticalEdge ? (direction > 0 ? 0 : Math.PI) : (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
  const angle = base + Math.sin(boss.picoIndex * 0.73) * 0.22;
  const swirlDirection = boss.picoIndex % 2 === 0 ? 1 : -1;
  const speed = (boss.enraged ? 250 : 220) + (boss.picoIndex % 4) * 18;
  const outward = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const tangent = {
    x: Math.cos(angle + Math.PI / 2) * swirlDirection,
    y: Math.sin(angle + Math.PI / 2) * swirlDirection,
  };
  hazards.push({
    type: "pico",
    x: start.x,
    y: start.y,
    vx: (outward.x * 0.92 + tangent.x * 0.18) * speed,
    vy: (outward.y * 0.92 + tangent.y * 0.18) * speed,
    r: 8,
    ttl: boss.enraged ? 4.4 : 4,
    color: colors[boss.picoIndex % colors.length],
    damage: boss.enraged ? 10 : 8,
    turn: swirlDirection * (boss.enraged ? 0.55 : 0.42),
    storm: true,
  });
  boss.picoIndex += 1;
}

function spawnNachoCheesePuddle(x, y, ttl, options = {}) {
  hazards.push({
    type: "nachoCheesePuddle",
    x: clamp(x, world.arena.x + 70, world.arena.x + world.arena.w - 70),
    y: clamp(y, world.arena.y + 70, world.arena.y + world.arena.h - 70),
    r: boss.enraged ? 68 : 62,
    warn: 0.62,
    ttl,
    damage: boss.enraged ? 8 : 6,
    damageTimer: 0,
    quadrantCheese: options.quadrantCheese ?? true,
  });
}

function spawnNachoCheeseCluster(x, y, ttl, options = {}) {
  const moveAngle = Math.atan2(player.lastMoveY || 1, player.lastMoveX || 0);
  const sideAngle = moveAngle + Math.PI / 2;
  const spacing = boss.enraged ? 70 : 64;
  spawnNachoCheesePuddle(x, y, ttl, options);
  spawnNachoCheesePuddle(x + Math.cos(sideAngle) * spacing, y + Math.sin(sideAngle) * spacing, ttl, options);
  spawnNachoCheesePuddle(x - Math.cos(sideAngle) * spacing, y - Math.sin(sideAngle) * spacing, ttl, options);
}

function spawnNachoCheeseMortar(point) {
  hazards.push({
    type: "nachoCheeseMortar",
    x: point.x,
    y: point.y,
    r: 64,
    warn: 0.7,
    warnDuration: 0.7,
    ttl: 1.7,
    damage: 8,
    damageTimer: 0,
  });
}

function randomNachoArenaPoint() {
  return {
    x: world.arena.x + 80 + Math.random() * (world.arena.w - 160),
    y: world.arena.y + 80 + Math.random() * (world.arena.h - 160),
  };
}

function spawnNachoChips() {
  const count = 6;
  const offset = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / count;
    const speed = boss.enraged ? 265 : 235;
    const x = boss.x + Math.cos(angle) * (boss.radius + 18);
    const y = boss.y + Math.sin(angle) * (boss.radius + 18);
    hazards.push({
      type: "nachoChip",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      r: 24,
      ttl: 2.4,
      traveled: 0,
      shatterDistance: distanceToArenaWall(x, y, angle) * 0.5,
      damage: 15,
    });
  }
  log("Tortilla chips fly out.");
}

function distanceToArenaWall(x, y, angle) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const distances = [];
  if (dx > 0) distances.push((world.arena.x + world.arena.w - x) / dx);
  if (dx < 0) distances.push((world.arena.x - x) / dx);
  if (dy > 0) distances.push((world.arena.y + world.arena.h - y) / dy);
  if (dy < 0) distances.push((world.arena.y - y) / dy);
  return Math.max(120, Math.min(...distances.filter((distanceValue) => distanceValue > 0)));
}

function shatterNachoChip(chip, targetList = hazards) {
  const points = [
    { distance: 26, angle: chip.angle },
    { distance: 20, angle: chip.angle + 2.32 },
    { distance: 20, angle: chip.angle - 2.32 },
  ];
  points.forEach((point, pointIndex) => {
    const x = chip.x + Math.cos(point.angle) * point.distance;
    const y = chip.y + Math.sin(point.angle) * point.distance;
    for (let i = 0; i < 3; i += 1) {
      const angle = point.angle + (i - 1) * 0.42;
      const speed = 220 + Math.random() * 95;
      targetList.push({
        type: "nachoCrumb",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 6,
        ttl: 1.45,
        damage: 8,
        color: "#e8bd50",
      });
    }
  });
  particles.push({ x: chip.x, y: chip.y - 16, text: "crunch", color: "#ffd76a", ttl: 0.55 });
}

function spawnShakePattern() {
  const roll = Math.random();
  if (boss.phase === 1) {
    if (roll < 0.42) spawnPeanutFan(false);
    else if (roll < 0.74) spawnChocolateLines(roll < 0.58 ? "vertical" : "horizontal");
    else spawnScoopDrop(player.x, player.y, 0);
    return;
  }
  if (boss.phase === 2) {
    if (roll < 0.36) spawnPeanutFan(true);
    else if (roll < 0.62) spawnScoopDrop(player.x, player.y, 0);
    else if (roll < 0.82) spawnWhippedShield();
    else spawnChocolateLines(Math.random() > 0.5 ? "vertical" : "horizontal");
    return;
  }
  if (roll < 0.28) spawnCherryBombs();
  else if (roll < 0.52) spawnTripleScoopCombo();
  else if (roll < 0.76) spawnPeanutFan(true);
  else spawnChocolateLines(Math.random() > 0.5 ? "vertical" : "horizontal");
}

function spawnPeanutFan(canBounce) {
  const count = boss.phase === 3 ? 7 : 5;
  const base = Math.atan2(player.y - boss.y, player.x - boss.x);
  for (let i = 0; i < count; i += 1) {
    const angle = base + (i - (count - 1) / 2) * 0.12;
    hazards.push({
      type: "peanut",
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * (boss.phase === 3 ? 390 : 340),
      vy: Math.sin(angle) * (boss.phase === 3 ? 390 : 340),
      r: 8,
      ttl: canBounce ? 3.2 : 2.35,
      damage: 12,
      bounces: canBounce ? 1 : 0,
    });
  }
  log(canBounce ? "Ricochet peanuts fired." : "Peanut spread fired.");
}

function spawnChocolateLines(orientation) {
  const lines = boss.phase === 3 ? 4 : 3;
  for (let i = 0; i < lines; i += 1) {
    const position = orientation === "vertical"
      ? world.arena.x + 130 + Math.random() * (world.arena.w - 260)
      : world.arena.y + 115 + Math.random() * (world.arena.h - 230);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const speed = boss.phase === 3 ? 470 : 410;
    const length = 118;
    const width = 34;
    hazards.push({
      type: "chocolateBar",
      orientation,
      position,
      x: orientation === "vertical"
        ? position
        : direction > 0 ? world.arena.x - length : world.arena.x + world.arena.w + length,
      y: orientation === "vertical"
        ? direction > 0 ? world.arena.y - length : world.arena.y + world.arena.h + length
        : position,
      vx: orientation === "vertical" ? 0 : direction * speed,
      vy: orientation === "vertical" ? direction * speed : 0,
      warn: 1.15,
      ttl: 3.7,
      width,
      length,
      damage: 30,
      fixedDamage: true,
      hit: false,
    });
  }
  log("Chocolate bars incoming.");
}

function spawnScoopDrop(x, y, delay) {
  hazards.push({
    type: "scoopDrop",
    x: clamp(x + (Math.random() - 0.5) * 90, world.arena.x + 90, world.arena.x + world.arena.w - 90),
    y: clamp(y + (Math.random() - 0.5) * 90, world.arena.y + 80, world.arena.y + world.arena.h - 80),
    delay,
    warn: 0.85 + delay,
    ttl: 1.1 + delay,
    r: 46,
    damage: boss.phase >= 2 ? 19 : 16,
    hit: false,
  });
  log("Ice cream scoop incoming.");
}

function spawnWhippedShield() {
  boss.shieldTimer = 2.1;
  spawnChocolateLines(Math.random() > 0.5 ? "vertical" : "horizontal");
  log("Whipped cream shield raised.");
}

function spawnCherryBombs() {
  for (let i = 0; i < 4; i += 1) {
    const edge = Math.floor(Math.random() * 4);
    const x = edge === 0 ? world.arena.x + 75 : edge === 1 ? world.arena.x + world.arena.w - 75 : world.arena.x + 130 + Math.random() * (world.arena.w - 260);
    const y = edge === 2 ? world.arena.y + 75 : edge === 3 ? world.arena.y + world.arena.h - 75 : world.arena.y + 100 + Math.random() * (world.arena.h - 200);
    hazards.push({
      type: "cherryBomb",
      x,
      y,
      warn: 1.25,
      ttl: 2.1,
      r: 26,
      damage: 20,
      hit: false,
      burstShots: 3,
      burstTimer: 0,
      burstDelay: 0.16,
    });
  }
  log("Cherry bombs armed.");
}

function spawnTripleScoopCombo() {
  spawnScoopDrop(player.x, player.y, 0);
  spawnScoopDrop(player.x, player.y, 0.38);
  spawnScoopDrop(player.x, player.y, 0.76);
  log("Triple scoop combo.");
}

function spawnSauceMortar() {
  const point = randomArenaPointNearPlayer(210);
  hazards.push({
    type: "ketchupMortar",
    x: boss.x,
    y: boss.y,
    startX: boss.x,
    startY: boss.y,
    targetX: point.x,
    targetY: point.y,
    age: 0,
    flightTime: 0.8,
    r: 38,
    ttl: 0.8,
    damage: boss.enraged ? 8 : 6,
  });
}

function spawnSauceRicochet() {
  const count = boss.enraged ? 6 : 5;
  const base = Math.atan2(player.y - boss.y, player.x - boss.x);
  for (let i = 0; i < count; i += 1) {
    const angle = base + (i - (count - 1) / 2) * 0.22;
    hazards.push({
      type: "mustardSeed",
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 390,
      vy: Math.sin(angle) * 390,
      r: 8,
      ttl: boss.enraged ? 3.5 : 2.8,
      damage: 11,
      bounces: boss.enraged ? 2 : 1,
    });
  }
}

function spawnSauceSpiral() {
  const colors = ["#cf3b2f", "#e3bf34", "#f3ead2"];
  const count = boss.enraged ? 15 : 10;
  const offset = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / count;
    hazards.push({
      type: "sauceBlob",
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 235,
      vy: Math.sin(angle) * 235,
      r: 10,
      ttl: 2.4,
      damage: 10,
      color: colors[i % colors.length],
    });
  }
}

function spawnCurlyFriesPattern() {
  if (Math.random() < (boss.enraged ? 0.55 : boss.phase === 2 ? 0.55 : 0.35)) {
    spawnGreasePuddles(1);
  }
  if (Math.random() < 0.68) {
    spawnFryMachineGun();
  } else {
    spawnCurlySpiral();
  }
}

function spawnGreasePuddles(count) {
  for (let i = 0; i < count; i += 1) {
    const point = randomArenaPointAwayFromPlayer(170);
    hazards.push({
      type: "grease",
      x: point.x,
      y: point.y,
      r: 46,
      ttl: boss.enraged ? 6.6 : 6.2,
      explodeTimer: 1 + i * 0.15,
      exploded: false,
      burstCount: boss.enraged ? 14 : boss.phase === 2 ? 14 : 10,
    });
  }
  log("Grease circles are about to burst.");
}

function randomArenaPointAwayFromPlayer(minDistance) {
  let point = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    point = {
      x: world.arena.x + 130 + Math.random() * (world.arena.w - 260),
      y: world.arena.y + 120 + Math.random() * (world.arena.h - 240),
    };
    if (distance(point, player) >= minDistance) return point;
  }
  const angle = Math.random() * Math.PI * 2;
  return {
    x: clamp(player.x + Math.cos(angle) * minDistance, world.arena.x + 130, world.arena.x + world.arena.w - 130),
    y: clamp(player.y + Math.sin(angle) * minDistance, world.arena.y + 120, world.arena.y + world.arena.h - 120),
  };
}

function spawnFryMachineGun() {
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  hazards.push({
    type: "machineGun",
    x: boss.x,
    y: boss.y,
    angle,
    sweepSpeed: (Math.random() > 0.5 ? 1 : -1) * (boss.enraged ? 0.55 : 0.48),
    warn: 0.65,
    ttl: boss.enraged ? 2.45 : 2.35,
    fireTimer: 0,
    damageTimer: 0,
    damage: 13,
  });
  setBossAnimation("machineGun");
  log("French fry machine gun charging.");
}

function spawnCurlySpiral() {
  const count = boss.enraged ? 15 : boss.phase === 2 ? 14 : 10;
  const twist = Math.random() > 0.5 ? 1 : -1;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    hazards.push({
      type: "fry",
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 185,
      vy: Math.sin(angle) * 185,
      turn: twist * 1.25,
      r: 10,
      ttl: 4.2,
      damage: 12,
    });
  }
  setBossAnimation("spiral");
  log("Curly spiral fired.");
}

function spawnKetchupAttack(source) {
  const point = randomArenaPointNearPlayer(140);
  const mayoDead = isCondimentDead("mayo");
  hazards.push({
    type: "ketchupMortar",
    x: source.x,
    y: source.y,
    startX: source.x,
    startY: source.y,
    targetX: point.x,
    targetY: point.y,
    age: 0,
    flightTime: 0.95,
    r: 42,
    ttl: 0.95,
    damage: 7,
    permanentAfterLanding: mayoDead,
  });
  log("Ketchup mortar launched.");
}

function spawnMustardAttack(source) {
  const count = condimentBosses.filter((item) => item.hp <= 0).length > 0 ? 5 : 3;
  const mayoDead = condimentBosses.some((item) => item.kind === "mayo" && item.hp <= 0);
  const bounces = mayoDead ? (condimentBosses.filter((item) => item.hp > 0).length === 1 ? 2 : 1) : 0;
  const base = Math.atan2(player.y - source.y, player.x - source.x);
  for (let i = 0; i < count; i += 1) {
    const angle = base + (i - (count - 1) / 2) * 0.18;
    hazards.push({
      type: "mustardSeed",
      x: source.x,
      y: source.y,
      vx: Math.cos(angle) * 320,
      vy: Math.sin(angle) * 320,
      r: 8,
      ttl: bounces > 0 ? 3.2 : 2.1,
      damage: 10,
      bounces,
    });
  }
  log(bounces > 0 ? "Bouncing mustard seeds fired." : "Mustard seeds fired.");
}

function spawnMayoHeal(source) {
  const wounded = livingBosses()
    .filter((target) => target !== source && target.hp < target.maxHp)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (!wounded) {
    source.shieldTimer = 1.8;
    log("Mayo shields itself.");
    return;
  }
  const heal = condimentBosses.filter((item) => item.hp <= 0).length > 0 ? 42 : 30;
  wounded.hp = Math.min(wounded.maxHp, wounded.hp + heal);
  wounded.shieldTimer = 2.2;
  particles.push({ x: wounded.x, y: wounded.y - 38, text: `+${heal}`, color: "#f7efd9", ttl: 0.9 });
  log(`Mayo healed ${wounded.name}.`);
}

function randomArenaPointNearPlayer(spread) {
  return {
    x: clamp(player.x + (Math.random() - 0.5) * spread * 2, world.arena.x + 110, world.arena.x + world.arena.w - 110),
    y: clamp(player.y + (Math.random() - 0.5) * spread * 2, world.arena.y + 95, world.arena.y + world.arena.h - 95),
  };
}

function randomPizzaArenaPoint(padding = 80) {
  return {
    x: world.arena.x + padding + Math.random() * (world.arena.w - padding * 2),
    y: world.arena.y + padding + Math.random() * (world.arena.h - padding * 2),
  };
}

function setBossAnimation(animation) {
  boss.animation = animation;
  boss.animationTime = 0;
}

function spawnFloorSlam() {
  hazards.push({
    type: "slam",
    x: player.x,
    y: player.y,
    r: boss.enraged ? 42 : 36,
    warn: boss.enraged ? 0.68 : 0.82,
    ttl: boss.enraged ? 1.05 : 1.2,
    damage: boss.enraged ? 29 : 24,
  });
}

function updateHazards(dt) {
  const spawnedHazards = [];
  hazards = hazards.filter((hazard) => {
    if (hazard.type === "grease") {
      hazard.ttl -= dt;
      hazard.explodeTimer = Math.max(0, (hazard.explodeTimer ?? 0) - dt);
      if (!hazard.exploded && hazard.explodeTimer <= 0) {
        hazard.exploded = true;
        spawnGreaseExplosion(hazard, spawnedHazards);
      }
      if (distance(player, hazard) < player.radius + hazard.r * 0.72) startGreaseSlide(hazard);
    } else if (hazard.type === "machineGun") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        hazard.angle += hazard.sweepSpeed * dt;
        hazard.fireTimer -= dt;
        hazard.damageTimer -= dt;
        while (hazard.fireTimer <= 0) {
          spawnFryShot(hazard, spawnedHazards);
          hazard.fireTimer += boss.enraged ? 0.045 : 0.048;
        }
        if (isPlayerInMachineGun(hazard) && hazard.damageTimer <= 0) {
          damagePlayer(boss.enraged ? 16 : 14, "French fry machine gun");
          hazard.damageTimer = boss.enraged ? 0.14 : 0.12;
        }
      }
    } else if (hazard.type === "pico") {
      hazard.ttl -= dt;
      if (hazard.turn) {
        const speed = Math.hypot(hazard.vx, hazard.vy);
        const angle = Math.atan2(hazard.vy, hazard.vx) + hazard.turn * dt;
        hazard.vx = Math.cos(angle) * speed;
        hazard.vy = Math.sin(angle) * speed;
      }
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (hazard.storm) {
        if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
          damagePlayer(hazard.damage, "Pico de gallo storm");
          hazard.ttl = 0;
        }
      } else {
        hazard.vx *= Math.pow(0.84, dt * 4);
        hazard.vy *= Math.pow(0.84, dt * 4);
      }
    } else if (hazard.type === "nachoCheesePuddle") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Melted cheese");
          hazard.damageTimer = 0.45;
        }
      }
    } else if (hazard.type === "nachoCheeseMortar") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Cheese mortar");
          hazard.damageTimer = 0.35;
        }
      }
    } else if (hazard.type === "cheeseWave") {
      const slow = hazards.some((item) => (item.type === "nachoCheesePuddle" || item.type === "nachoCheeseMortar") && item.warn <= 0 && distance(item, hazard) < item.r + hazard.r * 0.7);
      const speed = (slow ? 46 : 78) + (boss.enraged ? 12 : 0);
      const angle = Math.atan2(player.y - hazard.y, player.x - hazard.x);
      hazard.x += Math.cos(angle) * speed * dt;
      hazard.y += Math.sin(angle) * speed * dt;
      hazard.damageTimer -= dt;
      if (distance(player, hazard) < player.radius + hazard.r && hazard.damageTimer <= 0) {
        damagePlayer(hazard.damage, "Nacho cheese wave");
        hazard.damageTimer = 0.38;
      }
    } else if (hazard.type === "nachoChip") {
      hazard.ttl -= dt;
      const dx = hazard.vx * dt;
      const dy = hazard.vy * dt;
      hazard.x += dx;
      hazard.y += dy;
      hazard.traveled += Math.hypot(dx, dy);
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayer(hazard.damage, "Tortilla chip");
        hazard.ttl = 0;
      } else if (hazard.traveled >= hazard.shatterDistance) {
        shatterNachoChip(hazard, spawnedHazards);
        hazard.ttl = 0;
      }
    } else if (hazard.type === "pizzaDash") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.dashed) {
        hazard.dashed = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
          damagePlayer(hazard.damage, "Delivery dash");
        }
        spawnPizzaCheeseTrail(hazard, spawnedHazards);
        boss.x = hazard.targetX;
        boss.y = hazard.targetY;
        particles.push({ x: boss.x, y: boss.y - 48, text: "dash", color: "#ffd76a", ttl: 0.55 });
      }
    } else if (hazard.type === "pizzaCheeseTrail") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Hot cheese trail");
          hazard.damageTimer = 0.45;
        }
      }
    } else if (hazard.type === "pizzaSlice") {
      hazard.ttl -= dt;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayer(hazard.damage, "Pizza slice");
        hazard.ttl = 0;
      } else if (
        hazard.x <= world.arena.x + hazard.r ||
        hazard.x >= world.arena.x + world.arena.w - hazard.r ||
        hazard.y <= world.arena.y + hazard.r ||
        hazard.y >= world.arena.y + world.arena.h - hazard.r ||
        hazard.ttl <= 0
      ) {
        preparePizzaSliceReturn(hazard);
      }
    } else if (hazard.type === "pizzaSliceReturn") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        if (!hazard.active) {
          hazard.active = true;
          hazard.vx = Math.cos(hazard.angle) * (boss.enraged ? 450 : 390);
          hazard.vy = Math.sin(hazard.angle) * (boss.enraged ? 450 : 390);
        }
        hazard.x += hazard.vx * dt;
        hazard.y += hazard.vy * dt;
        if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
          damagePlayer(hazard.damage, "Returning pizza slice");
          hazard.ttl = 0;
        }
      }
    } else if (hazard.type === "pizzaCrustWall") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && isPlayerInPizzaCrustWall(hazard)) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Stuffed crust wall");
          knockPlayerFrom(hazard.x, hazard.y, 180);
          hazard.damageTimer = 0.55;
        }
      }
    } else if (hazard.type === "ovenZone") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && distance(player, hazard) < player.radius + hazard.r) {
        hazard.hit = true;
        damagePlayer(hazard.damage, "Oven zone");
      }
    } else if (hazard.type === "pizzaBoxSlam") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        damagePlayer(hazard.damage, "Pizza box slam");
      }
    } else if (hazard.type === "colaBubble") {
      hazard.ttl -= dt;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.vx += (Math.random() - 0.5) * 22 * dt;
      hazard.vy += (Math.random() - 0.5) * 22 * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        popColaBubble(hazard);
        hazard.ttl = 0;
      } else if (hazard.ttl <= 0) {
        popColaBubble(hazard);
      }
    } else if (hazard.type === "strawSnipe") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, 780, player.radius + 11)) {
          damagePlayer(hazard.damage, "Straw snipe");
        }
      }
    } else if (hazard.type === "fizzBurst") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (distance(player, hazard) < hazard.r) {
          damagePlayer(hazard.damage, "Fizz burst");
          knockPlayerFrom(hazard.x, hazard.y, boss.enraged ? 360 : 285);
        }
      }
    } else if (hazard.type === "sodaDrop") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        hazard.type = "sodaPuddle";
        hazard.ttl = boss.enraged ? 6 : 5;
        hazard.warn = 0;
        hazard.damageTimer = 0;
        particles.push({ x: hazard.x, y: hazard.y - 18, text: "splash", color: "#b9f4ff", ttl: 0.55 });
      }
    } else if (hazard.type === "sodaPuddle") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Soda spill");
          hazard.damageTimer = 0.5;
        }
      }
    } else if (hazard.type === "chocolateBar") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        hazard.x += hazard.vx * dt;
        hazard.y += hazard.vy * dt;
        if (!hazard.hit && isPlayerInChocolateBar(hazard)) {
          hazard.hit = true;
          damagePlayer(hazard.damage, "Chocolate bar", { fixed: hazard.fixedDamage });
        }
      }
    } else if (hazard.type === "scoopDrop") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (distance(player, hazard) < player.radius + hazard.r) {
          damagePlayer(hazard.damage, "Ice cream scoop");
          addChillStack();
        }
        hazard.type = "frozenPuddle";
        hazard.ttl = 4.8;
        hazard.damageTimer = 0;
      }
    } else if (hazard.type === "frozenPuddle") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          addChillStack();
          hazard.damageTimer = 0.85;
        }
      }
    } else if (hazard.type === "cherryBomb") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        if (!hazard.hit) {
          hazard.hit = true;
          hazard.burstTimer = 0;
          particles.push({ x: hazard.x, y: hazard.y - 18, text: "burst", color: "#ff5d73", ttl: 0.6 });
        }
        hazard.burstTimer -= dt;
        while (hazard.burstShots > 0 && hazard.burstTimer <= 0) {
          spawnCherryBurst(hazard, spawnedHazards);
          hazard.burstShots -= 1;
          hazard.burstTimer += hazard.burstDelay;
        }
        if (hazard.burstShots <= 0 && hazard.burstTimer <= 0) hazard.ttl = 0;
      }
    } else if (hazard.type === "ketchupMortar") {
      hazard.age += dt;
      const progress = clamp(hazard.age / hazard.flightTime, 0, 1);
      hazard.x = hazard.startX + (hazard.targetX - hazard.startX) * progress;
      hazard.y = hazard.startY + (hazard.targetY - hazard.startY) * progress;
      if (progress >= 1) {
        hazard.type = "ketchupPuddle";
        hazard.x = hazard.targetX;
        hazard.y = hazard.targetY;
        hazard.ttl = hazard.permanentAfterLanding ? Number.POSITIVE_INFINITY : 5.2;
        hazard.warn = 0;
        hazard.damageTimer = 0;
      }
    } else if (hazard.type === "ketchupPuddle") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Ketchup puddle");
          hazard.damageTimer = 0.35;
        }
      }
    } else if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob" || hazard.type === "peanut" || hazard.type === "cherryShot" || hazard.type === "nachoCrumb" || hazard.type === "pepperoni" || hazard.type === "cheeseBolt") {
      hazard.ttl -= dt;
      if (hazard.turn) {
        const speed = Math.hypot(hazard.vx, hazard.vy);
        const angle = Math.atan2(hazard.vy, hazard.vx) + hazard.turn * dt;
        hazard.vx = Math.cos(angle) * speed;
        hazard.vy = Math.sin(angle) * speed;
      }
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if ((hazard.type === "mustardSeed" || hazard.type === "peanut") && hazard.bounces > 0) {
        bounceProjectileInArena(hazard);
      }
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        const source = hazard.type === "fry" ? "French fry" : hazard.type === "mustardSeed" ? "Mustard seed" : hazard.type === "sauceBlob" ? "Special sauce" : hazard.type === "peanut" ? "Peanut" : hazard.type === "cherryShot" ? "Cherry shot" : hazard.type === "nachoCrumb" ? "Nacho crumb" : hazard.type === "pepperoni" ? "Pepperoni" : hazard.type === "cheeseBolt" ? "Ghost cheese" : "Arc bolt";
        damagePlayer(hazard.damage, source, { fixed: hazard.fixedDamage });
        if (hazard.type === "peanut" && boss.kind === "shake" && boss.phase >= 2) addChillStack();
        hazard.ttl = 0;
      }
    } else {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && distance(player, hazard) < player.radius + hazard.r) {
        hazard.hit = true;
        damagePlayer(hazard.damage, hazard.type === "slam" ? "Ground slam" : "Furnace vent");
      }
    }
    if (hazard.type === "chocolateBar") return hazard.ttl > 0 && (hazard.warn > 0 || chocolateBarTouchesArena(hazard));
    return hazard.ttl > 0 && pointInRect(hazard.x, hazard.y, world.arena);
  });
  hazards.push(...spawnedHazards);
}

function popColaBubble(hazard) {
  particles.push({ x: hazard.x, y: hazard.y - 16, text: "pop", color: "#b9f4ff", ttl: 0.55 });
  if (distance(player, hazard) < player.radius + hazard.r + 22 && !player.dead) {
    damagePlayer(hazard.damage, "Bubble pop");
  }
}

function isPlayerInChocolateBar(hazard) {
  const halfWidth = hazard.width / 2 + player.radius;
  const halfLength = hazard.length / 2 + player.radius;
  if (hazard.orientation === "vertical") {
    return Math.abs(player.x - hazard.x) < halfWidth && Math.abs(player.y - hazard.y) < halfLength;
  }
  return Math.abs(player.x - hazard.x) < halfLength && Math.abs(player.y - hazard.y) < halfWidth;
}

function chocolateBarTouchesArena(hazard) {
  if (hazard.orientation === "vertical") {
    return hazard.y + hazard.length / 2 > world.arena.y && hazard.y - hazard.length / 2 < world.arena.y + world.arena.h;
  }
  return hazard.x + hazard.length / 2 > world.arena.x && hazard.x - hazard.length / 2 < world.arena.x + world.arena.w;
}

function isPlayerInCherryCross(hazard) {
  const inVertical = Math.abs(player.x - hazard.x) < 18 && Math.abs(player.y - hazard.y) < 360;
  const inHorizontal = Math.abs(player.y - hazard.y) < 18 && Math.abs(player.x - hazard.x) < 360;
  return distance(player, hazard) < hazard.r + player.radius || inVertical || inHorizontal;
}

function addChillStack() {
  if (player.freezeTimer > 0) return;
  player.chillStacks = Math.min(3, player.chillStacks + 1);
  player.chillTimer = 4;
  if (player.chillStacks >= 3) {
    player.freezeTimer = 0.7;
    player.chillStacks = 0;
    player.chillTimer = 0;
    showFloat("Brain freeze");
  } else {
    showFloat(`Chill ${player.chillStacks}/3`);
  }
}

function isPlayerInLine(x, y, angle, length, width) {
  const dx = player.x - x;
  const dy = player.y - y;
  const forward = Math.cos(angle) * dx + Math.sin(angle) * dy;
  if (forward < 0 || forward > length) return false;
  const side = Math.abs(-Math.sin(angle) * dx + Math.cos(angle) * dy);
  return side < width;
}

function preparePizzaSliceReturn(hazard) {
  hazard.x = clamp(hazard.x, world.arena.x + hazard.r + 2, world.arena.x + world.arena.w - hazard.r - 2);
  hazard.y = clamp(hazard.y, world.arena.y + hazard.r + 2, world.arena.y + world.arena.h - hazard.r - 2);
  hazard.type = "pizzaSliceReturn";
  hazard.angle = Math.atan2(player.y - hazard.y, player.x - hazard.x);
  hazard.warn = boss.enraged ? 0.48 : 0.68;
  hazard.ttl = boss.enraged ? 2.2 : 2.55;
  hazard.vx = 0;
  hazard.vy = 0;
  hazard.active = false;
  particles.push({ x: hazard.x, y: hazard.y - 16, text: "return", color: "#ffd76a", ttl: 0.45 });
}

function isPlayerInPizzaCrustWall(hazard) {
  const halfLong = hazard.orientation === "vertical" ? world.arena.h / 2 - 42 : world.arena.w / 2 - 42;
  const halfShort = hazard.width / 2 + player.radius;
  const dx = Math.abs(player.x - hazard.x);
  const dy = Math.abs(player.y - hazard.y);
  if (hazard.orientation === "vertical") return dx < halfShort && dy < halfLong;
  return dy < halfShort && dx < halfLong;
}

function knockPlayerFrom(x, y, speed) {
  const angle = Math.atan2(player.y - y, player.x - x);
  player.slide = {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    timer: 0.42,
  };
  player.destination = null;
}

function bounceProjectileInArena(hazard) {
  const left = world.arena.x + hazard.r;
  const right = world.arena.x + world.arena.w - hazard.r;
  const top = world.arena.y + hazard.r;
  const bottom = world.arena.y + world.arena.h - hazard.r;
  let bounced = false;
  if (hazard.x <= left || hazard.x >= right) {
    hazard.x = clamp(hazard.x, left, right);
    hazard.vx *= -1;
    bounced = true;
  }
  if (hazard.y <= top || hazard.y >= bottom) {
    hazard.y = clamp(hazard.y, top, bottom);
    hazard.vy *= -1;
    bounced = true;
  }
  if (bounced) {
    hazard.bounces -= 1;
    particles.push({ x: hazard.x, y: hazard.y - 8, text: "bounce", color: "#e3bf34", ttl: 0.45 });
  }
}

function isPlayerInMachineGun(emitter) {
  const dx = player.x - emitter.x;
  const dy = player.y - emitter.y;
  const forward = Math.cos(emitter.angle) * dx + Math.sin(emitter.angle) * dy;
  if (forward < 0 || forward > 820) return false;
  const side = Math.abs(-Math.sin(emitter.angle) * dx + Math.cos(emitter.angle) * dy);
  return side < player.radius + (boss.enraged ? 34 : 26);
}

function spawnFryShot(emitter, targetList = hazards) {
  const spread = (Math.random() - 0.5) * 0.16;
  const angle = emitter.angle + spread;
  const speed = (boss.enraged ? 850 : 760) + Math.random() * 90;
  targetList.push({
    type: "fry",
    x: emitter.x + Math.cos(angle) * (boss.radius + 10),
    y: emitter.y + Math.sin(angle) * (boss.radius + 10),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 8,
    ttl: 1.25,
    damage: emitter.damage,
  });
}

function spawnGreaseExplosion(source, targetList = hazards) {
  const count = source.burstCount || 12;
  const offset = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / count;
    const speed = (boss.enraged ? 320 : 305) + Math.random() * 70;
    targetList.push({
      type: "fry",
      x: source.x + Math.cos(angle) * (source.r * 0.45),
      y: source.y + Math.sin(angle) * (source.r * 0.45),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 8,
      ttl: boss.enraged ? 1.75 : 1.7,
      damage: boss.enraged ? 15 : 14,
      color: "#ffd15f",
    });
  }
  particles.push({ x: source.x, y: source.y - 20, text: "burst", color: "#ffd15f", ttl: 0.65 });
}

function spawnCherryBurst(source, targetList = hazards) {
  const directions = 8;
  const offset = (source.burstShots % 2) * 0.06;
  for (let i = 0; i < directions; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / directions;
    targetList.push({
      type: "cherryShot",
      x: source.x + Math.cos(angle) * (source.r + 8),
      y: source.y + Math.sin(angle) * (source.r + 8),
      vx: Math.cos(angle) * 355,
      vy: Math.sin(angle) * 355,
      r: 7,
      ttl: 2.1,
      damage: 20,
      fixedDamage: true,
      color: "#ff3f5f",
    });
  }
}

function damagePlayer(amount, source, options = {}) {
  if (player.invulnerableTimer > 0) {
    particles.push({ x: player.x, y: player.y - 35, text: "evade", color: "#ffd782", ttl: 0.55 });
    return;
  }
  let hit = options.fixed ? amount : Math.max(1, Math.ceil(amount * combatTuning.incomingDamageMultiplier - player.stats.armor));
  if (player.shieldWallTimer > 0) hit = Math.max(1, Math.ceil(hit * 0.5));
  player.hp = Math.max(0, player.hp - hit);
  particles.push({ x: player.x, y: player.y - 35, text: `-${hit}`, color: "#ff8f7e", ttl: 0.8 });
  if (player.hp <= 0) {
    enterDeathState(source);
  }
}

function enterDeathState(source) {
  if (player.dead) return;
  player.dead = true;
  player.hp = 0;
  player.destination = null;
  player.slide = null;
  player.moving = false;
  selectedBoss = null;
  hazards = [];
  playerProjectiles = [];
  abilityEffects = [];
  Object.keys(movementKeys).forEach((direction) => {
    movementKeys[direction] = false;
  });
  log(`${source} stuffed you.`);
  ui.status.textContent = "You're Stuffed. Reset to try again.";
  showFloat("You're Stuffed");
}

function drinkPotion() {
  if (player.potions <= 0 || player.hp >= player.maxHp || player.dead || player.won) return;
  player.potions -= 1;
  player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * 0.6));
  showFloat("Potion used");
  log("Potion restored health.");
}

function winFight() {
  selectedBoss = null;
  hazards = [];
  playerProjectiles = [];
  abilityEffects = [];
  const seconds = fightStartedAt ? Math.max(1, Math.round((performance.now() - fightStartedAt) / 1000)) : 0;
  if (boss.kind === "shake" && boss.phase < boss.totalPhases) {
    boss.phase += 1;
    boss.maxHp = boss.phase === 2 ? 650 : 750;
    boss.hp = boss.maxHp;
    boss.enraged = false;
    boss.attackTimer = 1.2;
    boss.shieldTimer = 0;
    boss.state = "moving";
    boss.stateTimer = 0;
    player.hp = Math.min(player.maxHp, player.hp + 30);
    player.destination = null;
    player.slide = null;
    const phaseName = boss.phase === 2 ? "Brain Freeze" : "The Buster Cup";
    ui.status.textContent = `${phaseName}: Peanut Buster Shake refills.`;
    showFloat(phaseName);
    log(`${phaseName} begins.`);
    return;
  }
  log(`Victory in ${seconds}s.`);
  if (boss.kind === "cola") {
    boss = createBoss("burger");
    condimentBosses = [];
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Big Cola defeated. Big Burger enters next.";
    showFloat("Next boss: Big Burger");
    return;
  }
  if (boss.kind === "burger") {
    boss = createBoss("fries");
    condimentBosses = [];
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Big Burger defeated. Curly Fries enters next.";
    showFloat("Next boss: Curly Fries");
    return;
  }
  if (boss.kind === "fries") {
    boss = createBoss("trio");
    condimentBosses = createCondimentBosses();
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Curly Fries defeated. Condiment Trio enters next.";
    showFloat("Next boss: Condiment Trio");
    return;
  }
  if (boss.kind === "sauce") {
    boss = createBoss("shake");
    condimentBosses = [];
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Special Sauce defeated. Peanut Buster Shake enters next.";
    showFloat("Next boss: Peanut Buster Shake");
    return;
  }
  if (boss.kind === "shake") {
    boss = createBoss("nacho");
    condimentBosses = [];
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Peanut Buster Shake defeated. Nacho Libre enters next.";
    showFloat("Next boss: Nacho Libre");
    return;
  }
  if (boss.kind === "nacho") {
    boss = createBoss("pizza");
    condimentBosses = [];
    fightStartedAt = 0;
    player.hp = player.maxHp;
    player.potions = 3;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Nacho Libre defeated. Pizza Phantom enters next.";
    showFloat("Next boss: Pizza Phantom");
    return;
  }
  player.won = true;
  ui.status.textContent = "Victory. Reset to test another build.";
  showFloat(boss.kind === "pizza" ? "Pizza Phantom defeated" : "Boss defeated");
}

function updateAbilities(dt) {
  player.abilityCooldowns = player.abilityCooldowns.map((cooldown) => Math.max(0, cooldown - dt));
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  player.tumbleTimer = Math.max(0, player.tumbleTimer - dt);
  player.shieldWallTimer = Math.max(0, player.shieldWallTimer - dt);
  player.guardSpeedTimer = Math.max(0, player.guardSpeedTimer - dt);
  player.backstabTimer = Math.max(0, player.backstabTimer - dt);

  livingBosses().forEach((target) => {
    target.markedTimer = Math.max(0, (target.markedTimer || 0) - dt);
    if (target.markedTimer <= 0) target.markedShots = 0;
    updateRogueDebuffs(target, dt);
  });

  if (player.pendingAbilityCast) {
    player.pendingAbilityCast.timer -= dt;
    if (player.pendingAbilityCast.timer <= 0) {
      if (player.pendingAbilityCast.type === "fireBlast") fireFireBlast(player.pendingAbilityCast.angle);
      player.pendingAbilityCast = null;
    }
  }

  abilityEffects = abilityEffects.filter((effect) => {
    effect.ttl -= dt;
    effect.age = (effect.age || 0) + dt;
    if (effect.type === "shieldWall") {
      effect.x = player.x;
      effect.y = player.y;
    }
    if (effect.type === "volleyTrap") updateVolleyTrap(effect, dt);
    if (effect.type === "blinkRune") updateBlinkRune(effect, dt);
    if (effect.type === "smokeBomb") updateSmokeBomb(effect, dt);
    return effect.ttl > 0;
  });
  applyTimeWarpSlow(dt);
}

function updateRogueDebuffs(target, dt) {
  target.poisonTimer = Math.max(0, (target.poisonTimer || 0) - dt);
  if (target.poisonTimer <= 0) {
    target.poisonStacks = 0;
    target.poisonTickTimer = 0;
  }
  if (target.poisonStacks > 0) {
    target.poisonTickTimer = (target.poisonTickTimer || 1) - dt;
    if (target.poisonTickTimer <= 0) {
      target.poisonTickTimer += 1;
      damageBossTarget(target, target.poisonStacks * roguePoisonDamagePerStack(), "Poison", { poison: true });
    }
  }
  target.bleedTimer = Math.max(0, (target.bleedTimer || 0) - dt);
  if (target.bleedTimer > 0) {
    target.bleedTickTimer = (target.bleedTickTimer || 0.5) - dt;
    if (target.bleedTickTimer <= 0) {
      target.bleedTickTimer += 0.5;
      damageBossTarget(target, 4, "Bleed");
    }
  }
  target.exposedTimer = Math.max(0, (target.exposedTimer || 0) - dt);
  if (target.exposedTimer <= 0) target.exposedStacks = 0;
}

function updateVolleyTrap(effect, dt) {
  effect.triggerTimer -= dt;
  if (effect.triggerTimer > 0) return;
  effect.shotTimer -= dt;
  if (effect.shotsRemaining <= 0) {
    effect.ttl = Math.min(effect.ttl, 0.35);
    return;
  }
  if (effect.shotTimer > 0) return;
  const target = volleyTrapTarget(effect);
  if (!target) return;
  const angle = Math.atan2(target.y - effect.y, target.x - effect.x);
  playerProjectiles.push({
    x: effect.x + Math.cos(angle) * 20,
    y: effect.y + Math.sin(angle) * 20,
    vx: Math.cos(angle) * 710,
    vy: Math.sin(angle) * 710,
    r: 6,
    damage: Math.round(player.stats.damage * 0.5),
    color: "#ffd782",
    ttl: 0.8,
    age: 0,
    tag: "Ranged",
    ability: true,
  });
  effect.shotsRemaining -= 1;
  effect.shotTimer = 0.13;
}

function volleyTrapTarget(effect) {
  const marked = livingBosses().find((target) => target.markedTimer > 0);
  if (marked) return marked;
  return livingBosses().slice().sort((a, b) => distance(effect, a) - distance(effect, b))[0] || null;
}

function updateBlinkRune(effect, dt) {
  effect.pulseTimer -= dt;
  if (effect.pulseTimer > 0) return;
  effect.pulseTimer = 0.35;
  livingBosses().forEach((target) => {
    if (distance(effect, target) < effect.r + target.radius) damageBossTarget(target, 8, "Blink Rune");
  });
  hazards.forEach((hazard) => {
    if (!hazard.r || hazard.r > 11 || !Number.isFinite(hazard.ttl)) return;
    if (distance(effect, hazard) < effect.r + hazard.r) {
      hazard.ttl = 0;
      particles.push({ x: hazard.x, y: hazard.y - 10, text: "cleared", color: "#bafcff", ttl: 0.45 });
    }
  });
}

function updateSmokeBomb(effect, dt) {
  const inside = distance(player, effect) < effect.r + player.radius;
  if (inside) {
    player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.08);
    effect.wasInside = true;
    player.smokeSpeedGranted = false;
  } else if (effect.wasInside && !player.smokeSpeedGranted) {
    player.guardSpeedTimer = Math.max(player.guardSpeedTimer, 1.25);
    player.backstabTimer = Math.max(player.backstabTimer, 1.5);
    player.smokeSpeedGranted = true;
    particles.push({ x: player.x, y: player.y - 36, text: "ambush", color: "#c8ff9a", ttl: 0.65 });
  }
  hazards.forEach((hazard) => {
    if (!Number.isFinite(hazard.vx) || !Number.isFinite(hazard.vy)) return;
    if (distance(effect, hazard) < effect.r + (hazard.r || 0)) {
      hazard.vx *= Math.pow(0.5, dt);
      hazard.vy *= Math.pow(0.5, dt);
      if (!hazard.smokeWeakened && Number.isFinite(hazard.damage)) {
        hazard.damage = Math.max(1, Math.ceil(hazard.damage * 0.75));
        hazard.smokeWeakened = true;
      }
    }
  });
}

function applyTimeWarpSlow(dt) {
  const timeWarp = activeTimeWarp();
  if (!timeWarp) return;
  const decay = Math.pow(0.1, dt);
  hazards.forEach((hazard) => {
    if (!Number.isFinite(hazard.vx) || !Number.isFinite(hazard.vy)) return;
    if (distance(timeWarp, hazard) < timeWarp.r + (hazard.r || 0)) {
      hazard.vx *= decay;
      hazard.vy *= decay;
    }
  });
}

function activeTimeWarp() {
  return abilityEffects.find((effect) => effect.type === "timeWarp" && effect.ttl > 0) || null;
}

function playerInTimeWarp() {
  const timeWarp = activeTimeWarp();
  return Boolean(timeWarp && distance(player, timeWarp) < timeWarp.r + player.radius);
}

function update(dt) {
  movePlayer(dt);
  player.castTimer = Math.max(0, player.castTimer - dt);
  player.rangerAttackTimer = Math.max(0, player.rangerAttackTimer - dt);
  player.meleeAttackTimer = Math.max(0, player.meleeAttackTimer - dt);
  player.rogueAttackTimer = Math.max(0, player.rogueAttackTimer - dt);
  updateAbilities(dt);
  updateRoom(dt);
  updateCombat(dt);
  updateHazards(dt);
  updatePlayerProjectiles(dt);
  particles = particles.filter((particle) => {
    particle.ttl -= dt;
    particle.y -= 28 * dt;
    return particle.ttl > 0;
  });
  floatTimer -= dt;
  if (floatTimer <= 0) ui.floatText.textContent = "";
  updateMultiplayer(dt);
  camera.x = clamp(player.x - canvas.clientWidth / 2, 0, world.width - canvas.clientWidth);
  camera.y = clamp(player.y - canvas.clientHeight / 2, 0, world.height - canvas.clientHeight);
}

function updatePlayerProjectiles(dt) {
  playerProjectiles = playerProjectiles.filter((projectile) => {
    projectile.ttl -= dt;
    projectile.age = (projectile.age || 0) + dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.hitTargets = projectile.hitTargets || [];
    const hitBoss = livingBosses().find((target) => !projectile.hitTargets.includes(target) && distance(projectile, target) < target.radius + projectile.r);
    if (hitBoss) {
      projectile.hitTargets.push(hitBoss);
      if (projectile.fireBlast) {
        explodeFireBlast(projectile);
        return false;
      }
      if (projectile.markedShot) {
        markBossTarget(hitBoss);
        damageBossTarget(hitBoss, projectile.damage, "Marked Shot");
      } else {
        const markedBonus = projectile.tag === "Ranged" && !projectile.ability && hitBoss.markedTimer > 0 && hitBoss.markedShots > 0;
        const damage = markedBonus ? Math.ceil(projectile.damage * 1.45) : projectile.damage;
        if (markedBonus) {
          hitBoss.markedShots -= 1;
          particles.push({ x: hitBoss.x, y: hitBoss.y - 58, text: "mark", color: "#ffd782", ttl: 0.65 });
        }
        damageBossTarget(hitBoss, damage, projectile.ability ? "Ability" : "Shot");
        if (projectile.tag === "Rogue" && !projectile.ability) {
          applyPoisonStack(hitBoss);
          applyExposedStack(hitBoss, projectile);
        }
      }
      return projectile.piercing && projectile.ttl > 0;
    }
    return projectile.ttl > 0 && pointInRect(projectile.x, projectile.y, world.arena);
  });
}

function explodeFireBlast(projectile) {
  const radius = projectile.explosionRadius || 132;
  damageTargetsInRadius(projectile.x, projectile.y, radius, projectile.damage, "Fire Blast");
  abilityEffects.push({ type: "fireBlastExplosion", x: projectile.x, y: projectile.y, r: radius, ttl: 0.42, maxTtl: 0.42 });
  particles.push({ x: projectile.x, y: projectile.y - 24, text: "boom", color: "#ffb14a", ttl: 0.55 });
}

function markBossTarget(target) {
  target.markedTimer = 5;
  target.markedShots = 4;
  selectedBoss = target;
  particles.push({ x: target.x, y: target.y - target.radius - 36, text: "marked", color: "#ffd782", ttl: 0.95 });
}

function damageBossTarget(target, amount, source, options = {}) {
  if (!target || target.hp <= 0) return false;
  if (target.kind === "nacho" && target.invulnerableTimer > 0) {
    particles.push({ x: target.x, y: target.y - 44, text: "immune", color: "#fff2c6", ttl: 0.75 });
    return false;
  }
  const damage = target.shieldTimer > 0 ? Math.ceil(amount * 0.5) : amount;
  target.hp = Math.max(0, target.hp - damage);
  const color = options.poison ? "#9be06f" : source === "Bleed" || source === "Backstab" ? "#ff6e7f" : "#ffe08a";
  particles.push({ x: target.x, y: target.y - 40, text: `-${damage}`, color, ttl: 0.8 });
  if (target.hp <= 0) handleBossDefeated(target);
  return true;
}

function applyPoisonStack(target) {
  target.poisonStacks = Math.min(5, (target.poisonStacks || 0) + 1);
  target.poisonTimer = 5;
  if (!target.poisonTickTimer || target.poisonTickTimer <= 0) target.poisonTickTimer = 1;
  particles.push({ x: target.x, y: target.y - target.radius - 26, text: `poison ${target.poisonStacks}`, color: "#9be06f", ttl: 0.65 });
}

function roguePoisonDamagePerStack() {
  return isRogueBuild() && player.gear.armor === "channelerRobe" ? 2 : 1;
}

function applyBleed(target) {
  target.bleedTimer = 4;
  target.bleedTickTimer = 0.5;
  particles.push({ x: target.x, y: target.y - target.radius - 44, text: "bleed", color: "#ff6e7f", ttl: 0.65 });
}

function applyExposedStack(target, projectile) {
  const targetToPlayer = Math.atan2(player.y - target.y, player.x - target.x);
  const strikeAngle = Math.atan2(projectile.vy, projectile.vx);
  const angledHit = Math.abs(angleDifference(strikeAngle, targetToPlayer)) < Math.PI * 0.62;
  if (!angledHit && player.backstabTimer <= 0) return;
  target.exposedStacks = Math.min(3, (target.exposedStacks || 0) + 1);
  target.exposedTimer = 4;
  particles.push({ x: target.x, y: target.y - target.radius - 58, text: `exposed ${target.exposedStacks}`, color: "#c8ff9a", ttl: 0.65 });
}

function consumeExposed(target) {
  if ((target.exposedStacks || 0) < 3) return;
  target.exposedStacks = 0;
  target.exposedTimer = 0;
  damageBossTarget(target, Math.round(player.stats.damage * 0.8), "Expose");
  particles.push({ x: target.x, y: target.y - target.radius - 60, text: "exploit", color: "#c8ff9a", ttl: 0.75 });
}

function handleBossDefeated(target) {
  particles.push({ x: target.x, y: target.y - 62, text: `${target.name} down`, color: "#ffd27a", ttl: 1.2 });
  if (target === selectedBoss) selectedBoss = null;
  if (target.kind === "ketchup") clearKetchupHazards();
  if (target.kind === "mayo") makeKetchupPuddlesPermanent();
  if (livingBosses().length === 0) {
    if (boss.kind === "trio") spawnSpecialSauce();
    else winFight();
  }
}

function clearKetchupHazards() {
  hazards = hazards.filter((hazard) => hazard.type !== "ketchupMortar" && hazard.type !== "ketchupPuddle");
}

function makeKetchupPuddlesPermanent() {
  hazards.forEach((hazard) => {
    if (hazard.type === "ketchupPuddle") hazard.ttl = Number.POSITIVE_INFINITY;
    if (hazard.type === "ketchupMortar") hazard.permanentAfterLanding = true;
  });
  log("Mayo is down. Ketchup puddles now linger.");
}

function isCondimentDead(kind) {
  return condimentBosses.some((target) => target.kind === kind && target.hp <= 0);
}

function spawnSpecialSauce() {
  selectedBoss = null;
  hazards = [];
  playerProjectiles = [];
  abilityEffects = [];
  condimentBosses = [];
  boss = createBoss("sauce");
  fightStartedAt = performance.now();
  player.hp = Math.min(player.maxHp, player.hp + 25);
  ui.status.textContent = "The trio combines into Special Sauce.";
  showFloat("Special Sauce appears");
}

function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawRooms();
  drawStands();
  drawBoss();
  drawHazards();
  drawAbilityEffects();
  drawPlayerProjectiles();
  drawPlayer();
  drawRemotePlayers();
  drawParticles();
  ctx.restore();
  drawAbilityBar();
}

function drawRooms() {
  ctx.fillStyle = "#141917";
  ctx.fillRect(0, 0, world.width, world.height);
  drawRoom(world.starter, "#27362f", "#a6b9a2");
  drawRoom(world.arena, "#30292b", "#c89b62");
  ctx.fillStyle = "#755b36";
  ctx.fillRect(world.gate.x, world.gate.y, world.gate.w, world.gate.h);
  ctx.fillStyle = "#d8c693";
  ctx.font = "16px sans-serif";
  ctx.fillText("GATE", world.gate.x + 24, world.gate.y + 72);
  drawStarterRoomLabels();

  ctx.fillStyle = "rgba(238, 228, 188, 0.1)";
  for (let x = world.arena.x + 70; x < world.arena.x + world.arena.w; x += 92) {
    ctx.fillRect(x, world.arena.y + 30, 2, world.arena.h - 60);
  }
  for (let y = world.arena.y + 70; y < world.arena.y + world.arena.h; y += 92) {
    ctx.fillRect(world.arena.x + 30, y, world.arena.w - 60, 2);
  }
}

function drawRoom(rect, fill, trim) {
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = trim;
  ctx.lineWidth = world.wall;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawStarterRoomLabels() {
  const centerX = world.starter.x + world.starter.w / 2;
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f1e6";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 4;
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("Choose a class", centerX, world.starter.y + 72);
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("Choose your armor", centerX, world.starter.y + 332);
  ctx.restore();
}

function drawStands() {
  stands.forEach((stand) => {
    const item = gear[stand.type][stand.id];
    const selected = player.gear[stand.type] === stand.id;
    ctx.fillStyle = selected ? "#f0d47c" : "#1b211e";
    ctx.fillRect(stand.x - 42, stand.y - 42, 84, 84);
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(stand.x, stand.y - 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1e6";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.tag, stand.x, stand.y + 28);
    ctx.textAlign = "left";
  });
}

function drawBoss() {
  if (boss.kind === "trio") {
    condimentBosses.forEach(drawCondimentBoss);
    return;
  }
  if (boss.hp <= 0) return;
  if (selectedBoss === boss) drawRing(boss.x, boss.y, boss.radius + 12, "#ffe082");
  if (boss.kind === "fries") {
    drawCurlyFriesBoss();
  } else if (boss.kind === "sauce") {
    drawSpecialSauceBoss();
  } else if (boss.kind === "cola") {
    drawBigColaBoss();
  } else if (boss.kind === "shake") {
    drawPeanutBusterShakeBoss();
  } else if (boss.kind === "nacho") {
    drawNachoLibreBoss();
  } else if (boss.kind === "pizza") {
    drawPizzaPhantomBoss();
  } else {
    drawBurgerBoss();
  }
  ctx.fillStyle = "#f2d087";
  ctx.fillRect(boss.x - 58, boss.y - boss.radius - 24, 116 * (boss.hp / boss.maxHp), 9);
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  const phaseText = boss.kind === "shake" ? ` ${boss.phase}/3` : boss.kind === "nacho" || boss.kind === "pizza" ? ` Phase ${boss.phase}` : "";
  ctx.fillText(`${boss.name}${phaseText}`, boss.x, boss.y - boss.radius - 38);
  if (boss.kind === "nacho" && boss.enrageTextTimer > 0) {
    ctx.fillStyle = "#ffda6b";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Now I'm angry.", boss.x, boss.y + boss.radius + 30);
  }
  if (boss.kind === "pizza" && boss.deliveryTextTimer > 0) {
    ctx.fillStyle = "#fff4c4";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`${Math.ceil(boss.deliveryTimer)}s delivery`, boss.x, boss.y + boss.radius + 30);
  }
  ctx.textAlign = "left";
}

function drawCondimentBoss(target) {
  if (target.hp <= 0) return;
  if (selectedBoss === target) drawRing(target.x, target.y, target.radius + 10, "#ffe082");
  if (target.kind === "mustard" && target.state === "winding") drawRing(target.x, target.y, target.radius + 18, "#fff08a");
  ctx.fillStyle = target.color;
  ctx.beginPath();
  ctx.roundRect(target.x - target.radius * 0.7, target.y - target.radius, target.radius * 1.4, target.radius * 2, 12);
  ctx.fill();
  ctx.fillStyle = target.kind === "mayo" ? "#443b31" : "#fff2c6";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(target.name, target.x, target.y - target.radius - 28);
  if (target.kind === "mustard" && target.state === "winding") {
    ctx.fillStyle = "#fff08a";
    ctx.fillText("Aiming", target.x, target.y + target.radius + 22);
  }
  ctx.fillStyle = "#141414";
  ctx.fillRect(target.x - 38, target.y - target.radius - 18, 76, 7);
  ctx.fillStyle = target.shieldTimer > 0 ? "#f6f0df" : "#f2d087";
  ctx.fillRect(target.x - 38, target.y - target.radius - 18, 76 * (target.hp / target.maxHp), 7);
  if (target.shieldTimer > 0) drawRing(target.x, target.y, target.radius + 16, "#f6f0df");
  ctx.textAlign = "left";
}

function drawBurgerBoss() {
  ctx.fillStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#312923";
  ctx.fillRect(boss.x - 42, boss.y - 20, 84, 60);
}

function drawSpecialSauceBoss() {
  const colors = ["#cf3b2f", "#e3bf34", "#f3ead2"];
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(
      boss.x + Math.cos(boss.animationTime * 2 + i * 2.09) * 18,
      boss.y + Math.sin(boss.animationTime * 2 + i * 2.09) * 14,
      boss.radius - i * 9,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(40, 24, 18, 0.72)";
  ctx.beginPath();
  ctx.arc(boss.x, boss.y + 8, 28, 0, Math.PI * 2);
  ctx.fill();
  if (boss.shieldTimer > 0) drawRing(boss.x, boss.y, boss.radius + 16, "#f6f0df");
  if (boss.state === "winding") {
    drawRing(boss.x, boss.y, boss.radius + 24, "#fff08a");
    ctx.fillStyle = "#fff08a";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Aiming", boss.x, boss.y + boss.radius + 24);
    ctx.textAlign = "left";
  }
}

function drawBigColaBoss() {
  ctx.fillStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.beginPath();
  ctx.roundRect(boss.x - 46, boss.y - 62, 92, 124, 16);
  ctx.fill();
  ctx.fillStyle = "#f4f1e6";
  ctx.fillRect(boss.x - 48, boss.y - 66, 96, 16);
  ctx.fillStyle = "#d64235";
  ctx.fillRect(boss.x - 35, boss.y - 44, 70, 30);
  ctx.fillStyle = "#f7f3e8";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("COLA", boss.x, boss.y - 24);
  ctx.strokeStyle = "#f7f3e8";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(boss.x + 24, boss.y - 68);
  ctx.lineTo(boss.x + 54, boss.y - 108);
  ctx.stroke();
  ctx.fillStyle = "rgba(185, 244, 255, 0.72)";
  for (let i = 0; i < 5; i += 1) {
    const angle = boss.animationTime * 1.4 + i * 1.25;
    ctx.beginPath();
    ctx.arc(boss.x + Math.cos(angle) * 58, boss.y - 55 + Math.sin(angle * 1.7) * 18, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = "left";
}

function drawPeanutBusterShakeBoss() {
  ctx.fillStyle = "#b65a34";
  ctx.beginPath();
  ctx.roundRect(boss.x - 52, boss.y - 36, 104, 96, 18);
  ctx.fill();
  ctx.fillStyle = boss.shieldTimer > 0 ? "#fff6df" : "#f1e2c9";
  ctx.beginPath();
  ctx.arc(boss.x, boss.y - 32, boss.radius * 0.86, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#7b3f23";
  for (let i = 0; i < 6; i += 1) {
    const angle = boss.animationTime * 1.2 + i * 1.05;
    ctx.beginPath();
    ctx.arc(boss.x + Math.cos(angle) * 42, boss.y - 28 + Math.sin(angle) * 24, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#c0182f";
  ctx.beginPath();
  ctx.arc(boss.x + 18, boss.y - 92, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6d2f1b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(boss.x - 38, boss.y - 62);
  ctx.bezierCurveTo(boss.x - 10, boss.y - 42, boss.x + 16, boss.y - 76, boss.x + 48, boss.y - 54);
  ctx.stroke();
  if (boss.shieldTimer > 0) drawRing(boss.x, boss.y - 10, boss.radius + 12, "#fff6df");
}

function drawNachoLibreBoss() {
  const pulse = Math.sin(boss.animationTime * 5) * 3;
  ctx.fillStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2c95f";
  for (let i = 0; i < 10; i += 1) {
    const angle = boss.animationTime * 0.8 + (Math.PI * 2 * i) / 10;
    ctx.beginPath();
    ctx.moveTo(boss.x + Math.cos(angle) * 16, boss.y + Math.sin(angle) * 12);
    ctx.lineTo(boss.x + Math.cos(angle + 0.22) * 64, boss.y + Math.sin(angle + 0.22) * 52);
    ctx.lineTo(boss.x + Math.cos(angle - 0.22) * 64, boss.y + Math.sin(angle - 0.22) * 52);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#4b2b1a";
  ctx.beginPath();
  ctx.arc(boss.x - 22, boss.y - 7, 7, 0, Math.PI * 2);
  ctx.arc(boss.x + 22, boss.y - 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1f1712";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(boss.x - 42, boss.y - 22);
  ctx.lineTo(boss.x - 8, boss.y - 4);
  ctx.moveTo(boss.x + 42, boss.y - 22);
  ctx.lineTo(boss.x + 8, boss.y - 4);
  ctx.stroke();
  ctx.strokeStyle = "#e64635";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y - 4, boss.radius * 0.78, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  if (boss.invulnerableTimer > 0) drawRing(boss.x, boss.y, boss.radius + 18, "#fff2c6");
}

function drawPizzaPhantomBoss() {
  boss.clones.forEach((clone) => {
    ctx.save();
    ctx.globalAlpha = 0.36 + Math.sin(boss.animationTime * 5 + clone.phaseOffset) * 0.08;
    drawPizzaShape(clone.x, clone.y, boss.radius * 0.86, "#d84f37", "#f0bd4b", true);
    ctx.restore();
  });
  const bob = Math.sin(boss.animationTime * 3.5) * 5;
  drawPizzaShape(boss.x, boss.y + bob, boss.radius, boss.enraged ? boss.enrageColor : boss.color, "#f0bd4b", false);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.arc(boss.x - 18, boss.y - 18 + bob, 10, 0, Math.PI * 2);
  ctx.arc(boss.x + 18, boss.y - 18 + bob, 10, 0, Math.PI * 2);
  ctx.fill();
  if (boss.deliveryActive) drawRing(boss.x, boss.y + bob, boss.radius + 18, "#fff4c4");
}

function drawPizzaShape(x, y, radius, sauceColor, crustColor, ghost) {
  ctx.fillStyle = crustColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ghost ? "rgba(255, 234, 157, 0.82)" : "#ffd76a";
  ctx.beginPath();
  ctx.arc(x, y, radius - 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = sauceColor;
  ctx.beginPath();
  ctx.arc(x, y, radius - 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b93a2f";
  for (let i = 0; i < 7; i += 1) {
    const angle = boss.animationTime * 0.35 + i * 0.9;
    const ring = i % 2 === 0 ? radius * 0.34 : radius * 0.52;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * ring, y + Math.sin(angle) * ring * 0.78, ghost ? 6 : 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = ghost ? "#fff4c4" : "#2d1710";
  ctx.beginPath();
  ctx.arc(x - radius * 0.28, y - radius * 0.15, 7, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.28, y - radius * 0.15, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ghost ? "rgba(255, 244, 196, 0.65)" : "#2d1710";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.02, radius * 0.32, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.strokeStyle = ghost ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 244, 196, 0.36)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    const angle = boss.animationTime * 1.2 + i * 1.57;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius * 0.35), y + Math.sin(angle) * (radius * 0.22));
    ctx.lineTo(x + Math.cos(angle) * (radius * 0.78), y + Math.sin(angle) * (radius * 0.52));
    ctx.stroke();
  }
}

function drawCurlyFriesBoss() {
  if (curlyFriesSprite.complete && curlyFriesSprite.naturalWidth > 0) {
    drawCurlyFriesSprite();
    return;
  }
  ctx.strokeStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i += 1) {
    const offset = (i - 2) * 13;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 1.7; t += 0.18) {
      const r = 12 + t * 12;
      const x = boss.x + offset + Math.cos(t + i * 0.7) * r;
      const y = boss.y + Math.sin(t + i * 0.7) * r * 0.62;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  ctx.fillStyle = "#6b4226";
  ctx.beginPath();
  ctx.arc(boss.x, boss.y + 8, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawCurlyFriesSprite() {
  const sprite = cleanedCurlyFriesSprite || curlyFriesSprite;
  const frameWidth = sprite.width / 4;
  const frameHeight = sprite.height / 3;
  const rows = { idle: 0, machineGun: 1, spiral: 2 };
  const animationDuration = boss.animation === "idle" ? 999 : boss.animation === "machineGun" ? 1.15 : 1.0;
  if (boss.animation !== "idle" && boss.animationTime > animationDuration) boss.animation = "idle";
  const row = rows[boss.animation] ?? 0;
  const frame = Math.floor(boss.animationTime * 8) % 4;
  const crop = {
    x: frameWidth * 0.08,
    y: frameHeight * 0.08,
    w: frameWidth * 0.84,
    h: frameHeight * 0.82,
  };
  const drawWidth = 156;
  const drawHeight = 128;
  ctx.drawImage(
    sprite,
    frame * frameWidth + crop.x,
    row * frameHeight + crop.y,
    crop.w,
    crop.h,
    boss.x - drawWidth / 2,
    boss.y - drawHeight * 0.58,
    drawWidth,
    drawHeight,
  );
}

function drawNachoWalls() {
  if (boss.kind !== "nacho" || boss.quadrantMode === "idle") return;
  const centerX = world.arena.x + world.arena.w / 2;
  const centerY = world.arena.y + world.arena.h / 2;
  const warning = boss.quadrantMode === "warning";
  ctx.fillStyle = warning ? "rgba(255, 242, 182, 0.22)" : "rgba(95, 57, 22, 0.88)";
  ctx.strokeStyle = warning ? "rgba(255, 242, 182, 0.82)" : "#f0c35b";
  ctx.lineWidth = warning ? 3 : 4;
  ctx.fillRect(centerX - 18, world.arena.y + 18, 36, world.arena.h - 36);
  ctx.fillRect(world.arena.x + 18, centerY - 18, world.arena.w - 36, 36);
  ctx.strokeRect(centerX - 18, world.arena.y + 18, 36, world.arena.h - 36);
  ctx.strokeRect(world.arena.x + 18, centerY - 18, world.arena.w - 36, 36);
}

function drawHazards() {
  hazards.forEach((hazard) => {
    if (hazard.type === "grease") {
      ctx.fillStyle = "rgba(219, 174, 72, 0.24)";
      ctx.strokeStyle = "rgba(255, 226, 118, 0.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (!hazard.exploded) {
        const pulse = 1 - clamp(hazard.explodeTimer ?? 0, 0, 1);
        ctx.strokeStyle = "rgba(255, 241, 150, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, hazard.r * (0.52 + pulse * 0.52), 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }
    if (hazard.type === "pico") {
      ctx.fillStyle = hazard.color;
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.ttl * (hazard.storm ? 12 : 8));
      if (hazard.storm) {
        ctx.strokeStyle = "rgba(255, 242, 188, 0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, hazard.r + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -hazard.r);
        ctx.lineTo(hazard.r, 0);
        ctx.lineTo(0, hazard.r);
        ctx.lineTo(-hazard.r, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-hazard.r, -hazard.r, hazard.r * 2, hazard.r * 2);
      }
      ctx.restore();
      return;
    }
    if (hazard.type === "nachoCheesePuddle") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 210, 73, 0.12)" : "rgba(255, 190, 35, 0.42)";
      ctx.strokeStyle = warning ? "#ffe7a0" : "#f2a91f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.72, Math.sin(hazard.x) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "nachoCheeseMortar") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 210, 73, 0.12)" : "rgba(255, 190, 35, 0.42)";
      ctx.strokeStyle = warning ? "#ffe7a0" : "#f2a91f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.72, Math.sin(hazard.y) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (warning) {
        const progress = clamp(1 - hazard.warn / hazard.warnDuration, 0, 1);
        ctx.fillStyle = "#ffd046";
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y - 95 + progress * 95, 15 + progress * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (hazard.type === "cheeseWave") {
      ctx.fillStyle = "rgba(255, 189, 39, 0.5)";
      ctx.strokeStyle = "#ffd66b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.25, hazard.r * 0.82, Math.sin(boss.animationTime) * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 235, 145, 0.5)";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(hazard.x + Math.cos(boss.animationTime * 2 + i) * 42, hazard.y + Math.sin(boss.animationTime * 1.7 + i) * 26, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (hazard.type === "nachoChip") {
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.angle);
      ctx.fillStyle = "#e7bd56";
      ctx.strokeStyle = "#8f5f20";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(27, 0);
      ctx.lineTo(-18, -20);
      ctx.lineTo(-18, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (hazard.type === "pizzaDash") {
      const active = hazard.warn <= 0;
      ctx.strokeStyle = active ? "rgba(255, 107, 72, 0.72)" : "rgba(255, 244, 196, 0.5)";
      ctx.lineWidth = active ? hazard.width : 6;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.targetX, hazard.targetY);
      ctx.stroke();
      ctx.strokeStyle = active ? "#ffd76a" : "#fff4c4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.targetX, hazard.targetY);
      ctx.stroke();
      return;
    }
    if (hazard.type === "pizzaCheeseTrail") {
      ctx.fillStyle = "rgba(255, 204, 70, 0.34)";
      ctx.strokeStyle = "rgba(255, 236, 140, 0.62)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.15, hazard.r * 0.65, Math.sin(hazard.x) * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "pizzaSlice" || hazard.type === "pizzaSliceReturn") {
      if (hazard.type === "pizzaSliceReturn" && hazard.warn > 0) {
        const arrowX = hazard.x + Math.cos(hazard.angle) * 46;
        const arrowY = hazard.y + Math.sin(hazard.angle) * 46;
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(hazard.angle);
        ctx.fillStyle = "rgba(255, 244, 196, 0.76)";
        ctx.strokeStyle = "rgba(140, 70, 38, 0.78)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-8, -10);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.angle);
      ctx.fillStyle = hazard.type === "pizzaSliceReturn" && hazard.warn > 0 ? "rgba(241, 190, 79, 0.5)" : "#e9bc54";
      ctx.strokeStyle = "#8c4626";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(-20, -22);
      ctx.lineTo(-16, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#b93a2f";
      ctx.beginPath();
      ctx.arc(-3, -5, 5, 0, Math.PI * 2);
      ctx.arc(7, 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (hazard.type === "pizzaCrustWall") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 244, 196, 0.16)" : "rgba(186, 111, 52, 0.68)";
      ctx.strokeStyle = warning ? "#fff4c4" : "#f0bd4b";
      ctx.lineWidth = warning ? 3 : 4;
      if (hazard.orientation === "vertical") {
        ctx.fillRect(hazard.position - hazard.width / 2, world.arena.y + 42, hazard.width, world.arena.h - 84);
        ctx.strokeRect(hazard.position - hazard.width / 2, world.arena.y + 42, hazard.width, world.arena.h - 84);
      } else {
        ctx.fillRect(world.arena.x + 42, hazard.position - hazard.width / 2, world.arena.w - 84, hazard.width);
        ctx.strokeRect(world.arena.x + 42, hazard.position - hazard.width / 2, world.arena.w - 84, hazard.width);
      }
      return;
    }
    if (hazard.type === "ovenZone") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 112, 68, 0.12)" : "rgba(255, 112, 68, 0.34)";
      ctx.strokeStyle = warning ? "#fff4c4" : "#ff7044";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = warning ? "rgba(255, 244, 196, 0.45)" : "rgba(255, 226, 105, 0.58)";
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(hazard.x + Math.cos(boss.animationTime * 2.4 + i * 2.1) * 22, hazard.y + Math.sin(boss.animationTime * 2 + i * 2.1) * 18, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (hazard.type === "pizzaBoxSlam") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 244, 196, 0.12)" : "rgba(255, 107, 72, 0.3)";
      ctx.strokeStyle = warning ? "#fff4c4" : "#ff7044";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(world.arena.x + 56, world.arena.y + 56, world.arena.w - 112, world.arena.h - 112, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = warning ? "#fff4c4" : "#ffd76a";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("30 MINUTES OR LESS", world.arena.x + world.arena.w / 2, world.arena.y + world.arena.h / 2);
      ctx.textAlign = "left";
      return;
    }
    if (hazard.type === "colaBubble") {
      ctx.fillStyle = "rgba(185, 244, 255, 0.32)";
      ctx.strokeStyle = "#b9f4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "strawSnipe") {
      const active = hazard.warn <= 0;
      ctx.strokeStyle = active ? "rgba(120, 55, 34, 0.85)" : "rgba(255, 245, 176, 0.45)";
      ctx.lineWidth = active ? 9 : 4;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + Math.cos(hazard.angle) * 780, hazard.y + Math.sin(hazard.angle) * 780);
      ctx.stroke();
      return;
    }
    if (hazard.type === "fizzBurst") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(185, 244, 255, 0.08)" : "rgba(185, 244, 255, 0.24)";
      ctx.strokeStyle = warning ? "#b9f4ff" : "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "sodaDrop") {
      const progress = clamp(1 - hazard.warn / Math.max(0.1, hazard.warnDuration || 0.85), 0, 1);
      const dropY = hazard.y - (hazard.fallHeight || 155) + progress * (hazard.fallHeight || 155);
      const pulse = 0.45 + Math.sin(boss.animationTime * 16) * 0.12;
      ctx.fillStyle = `rgba(185, 244, 255, ${0.08 + pulse * 0.08})`;
      ctx.strokeStyle = "rgba(185, 244, 255, 0.82)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.3 + progress * 0.35;
      ctx.strokeStyle = "rgba(185, 244, 255, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y - (hazard.fallHeight || 155));
      ctx.lineTo(hazard.x, dropY - 12);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#5c3320";
      ctx.strokeStyle = "#b9f4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hazard.x, dropY, 11, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(hazard.x - 4, dropY - 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (hazard.type === "sodaPuddle") {
      ctx.fillStyle = "rgba(86, 45, 24, 0.34)";
      ctx.strokeStyle = "rgba(185, 244, 255, 0.42)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "chocolateBar") {
      const active = hazard.warn <= 0;
      if (!active) {
        ctx.fillStyle = "rgba(255, 248, 232, 0.38)";
        if (hazard.orientation === "vertical") {
          ctx.fillRect(hazard.position - hazard.width / 2, world.arena.y + 40, hazard.width, world.arena.h - 80);
        } else {
          ctx.fillRect(world.arena.x + 40, hazard.position - hazard.width / 2, world.arena.w - 80, hazard.width);
        }
        return;
      }
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      if (hazard.orientation === "vertical") ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#6b351f";
      ctx.strokeStyle = "#2d1710";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-hazard.length / 2, -hazard.width / 2, hazard.length, hazard.width, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 221, 176, 0.26)";
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.roundRect(i * 32 - 12, -hazard.width / 2 + 6, 24, hazard.width - 12, 5);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (hazard.type === "scoopDrop" || hazard.type === "frozenPuddle") {
      const active = hazard.type === "frozenPuddle";
      ctx.fillStyle = active ? "rgba(170, 225, 255, 0.28)" : "rgba(170, 225, 255, 0.11)";
      ctx.strokeStyle = active ? "#aae1ff" : "#e8f8ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (hazard.type === "scoopDrop") {
        const progress = clamp(1 - hazard.warn / Math.max(0.1, 0.85 + hazard.delay), 0, 1);
        ctx.fillStyle = "#f1e2c9";
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y - 90 + progress * 90, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    if (hazard.type === "cherryBomb") {
      const active = hazard.warn <= 0;
      ctx.fillStyle = active ? "rgba(192, 24, 47, 0.32)" : "rgba(192, 24, 47, 0.12)";
      ctx.strokeStyle = "#ff5d73";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (active) {
        ctx.strokeStyle = "rgba(255, 214, 220, 0.75)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(hazard.x + Math.cos(angle) * 12, hazard.y + Math.sin(angle) * 12);
          ctx.lineTo(hazard.x + Math.cos(angle) * 44, hazard.y + Math.sin(angle) * 44);
          ctx.stroke();
        }
      }
      return;
    }
    if (hazard.type === "ketchupPuddle") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(210, 55, 45, 0.14)" : "rgba(210, 55, 45, 0.34)";
      ctx.strokeStyle = warning ? "#ff9b8d" : "#cf3b2f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "ketchupMortar") {
      const progress = clamp(hazard.age / hazard.flightTime, 0, 1);
      const arc = Math.sin(progress * Math.PI) * 72;
      ctx.fillStyle = "rgba(210, 55, 45, 0.12)";
      ctx.strokeStyle = "#ff9b8d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hazard.targetX, hazard.targetY, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#cf3b2f";
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y - arc, 12 + progress * 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (hazard.type === "machineGun") {
      const active = hazard.warn <= 0;
      const length = 760;
      ctx.strokeStyle = active ? "rgba(255, 203, 85, 0.52)" : "rgba(255, 245, 176, 0.42)";
      ctx.lineWidth = active ? 14 : 8;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + Math.cos(hazard.angle) * length, hazard.y + Math.sin(hazard.angle) * length);
      ctx.stroke();
      return;
    }
    if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob" || hazard.type === "peanut" || hazard.type === "cherryShot" || hazard.type === "nachoCrumb" || hazard.type === "pepperoni" || hazard.type === "cheeseBolt") {
      ctx.fillStyle = hazard.color || (hazard.type === "fry" ? "#f1c15d" : hazard.type === "mustardSeed" ? "#e3bf34" : hazard.type === "peanut" ? "#8b552f" : hazard.type === "cherryShot" ? "#ff3f5f" : hazard.type === "nachoCrumb" ? "#e8bd50" : hazard.type === "pepperoni" ? "#b93a2f" : hazard.type === "cheeseBolt" ? "#f4d36b" : "#8ad8ff");
      ctx.beginPath();
      if (hazard.type === "fry") {
        ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.8, hazard.r * 0.75, Math.atan2(hazard.vy, hazard.vx), 0, Math.PI * 2);
      } else if (hazard.type === "peanut") {
        ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.35, hazard.r * 0.82, Math.atan2(hazard.vy, hazard.vx), 0, Math.PI * 2);
      } else if (hazard.type === "nachoCrumb") {
        ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.3, hazard.r * 0.8, Math.atan2(hazard.vy, hazard.vx), 0, Math.PI * 2);
      } else if (hazard.type === "pepperoni") {
        ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 222, 164, 0.45)";
        ctx.beginPath();
        ctx.arc(hazard.x - 3, hazard.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(hazard.x + 4, hazard.y + 2, 2, 0, Math.PI * 2);
      } else {
        ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      }
      ctx.fill();
      return;
    }
    const warning = hazard.warn > 0;
    ctx.strokeStyle = warning ? "#ffda6b" : "#f06a4f";
    ctx.fillStyle = warning ? "rgba(255, 218, 107, 0.12)" : "rgba(240, 106, 79, 0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  drawNachoWalls();
}

function drawAbilityEffects() {
  abilityEffects.forEach((effect) => {
    const progress = 1 - effect.ttl / effect.maxTtl;
    const alpha = clamp(effect.ttl / effect.maxTtl, 0, 1);
    ctx.save();
    if (effect.type === "shieldBash" || effect.type === "ironCounter") {
      const color = effect.type === "shieldBash" ? "rgba(240, 212, 124," : "rgba(255, 238, 178,";
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `${color} 0.22)`;
      ctx.strokeStyle = `${color} 0.82)`;
      ctx.lineWidth = effect.type === "shieldBash" ? 4 : 5;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.arc(0, 0, effect.range * (0.65 + progress * 0.35), -0.62, 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === "whirlwindDash") {
      const spin = (effect.age || 0) * 18;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(240, 212, 124, 0.14)";
      ctx.strokeStyle = "rgba(255, 238, 178, 0.86)";
      ctx.shadowColor = "#f0d47c";
      ctx.shadowBlur = 14;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r * (0.72 + progress * 0.28), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 5;
      for (let i = 0; i < 2; i += 1) {
        const start = spin + i * Math.PI;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.r * (0.48 + i * 0.22), start, start + Math.PI * 0.72);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (effect.type === "projectileBlock") {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(255, 238, 178, 0.88)";
      ctx.fillStyle = "rgba(240, 212, 124, 0.18)";
      ctx.shadowColor = "#f0d47c";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r * (0.55 + progress * 0.75), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === "shieldWall") {
      const spin = (effect.age || 0) * 2.8;
      const radius = effect.r + Math.sin((effect.age || 0) * 5) * 3;
      ctx.globalAlpha = effect.ttl < 1 ? alpha : 1;
      ctx.strokeStyle = "rgba(240, 212, 124, 0.78)";
      ctx.fillStyle = "rgba(240, 212, 124, 0.08)";
      ctx.shadowColor = "#f0d47c";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i += 1) {
        const angle = spin + i * Math.PI * 0.5;
        drawOrbitingShield(
          effect.x + Math.cos(angle) * radius,
          effect.y + Math.sin(angle) * radius * 0.82,
          angle + Math.PI / 2,
          0.82 + Math.sin((effect.age || 0) * 6 + i) * 0.08,
        );
      }
      ctx.restore();
      return;
    }
    if (effect.type === "tumbleShot") {
      ctx.globalAlpha = alpha * 0.65;
      ctx.strokeStyle = "#ffd782";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x - Math.cos(effect.angle) * (42 + progress * 50), effect.y - Math.sin(effect.angle) * (42 + progress * 50));
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === "volleyTrap") {
      const armed = effect.triggerTimer <= 0;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = armed ? "#ffd782" : "rgba(255, 215, 130, 0.52)";
      ctx.fillStyle = armed ? "rgba(255, 215, 130, 0.18)" : "rgba(255, 215, 130, 0.08)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r + Math.sin((effect.age || 0) * 10) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === "shadowStep") {
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = "rgba(155, 224, 111, 0.75)";
      ctx.lineWidth = 9;
      ctx.shadowColor = "#9be06f";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y - 18);
      ctx.lineTo(effect.x2, effect.y2 - 18);
      ctx.stroke();
      ctx.fillStyle = "rgba(24, 19, 32, 0.55)";
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 24 + progress * 18, 0, Math.PI * 2);
      ctx.arc(effect.x2, effect.y2, 18 + progress * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (effect.type === "backstab") {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = effect.empowered ? "#ff6e7f" : "#c8ff9a";
      ctx.shadowColor = effect.empowered ? "#ff6e7f" : "#9be06f";
      ctx.shadowBlur = 14;
      ctx.lineWidth = effect.empowered ? 6 : 4;
      ctx.beginPath();
      ctx.arc(0, 0, effect.range * (0.5 + progress * 0.5), -0.48, 0.48);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === "smokeBomb") {
      ctx.globalAlpha = Math.min(0.72, alpha + 0.18);
      ctx.fillStyle = "rgba(25, 23, 30, 0.58)";
      ctx.strokeStyle = "rgba(155, 224, 111, 0.34)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r + Math.sin((effect.age || 0) * 5) * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 5; i += 1) {
        const angle = (effect.age || 0) * 0.8 + i * 1.26;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * 34, effect.y + Math.sin(angle) * 22, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (effect.type === "blinkRune" || effect.type === "timeWarp") {
      const timeWarp = effect.type === "timeWarp";
      ctx.globalAlpha = timeWarp ? 0.82 : alpha;
      ctx.strokeStyle = timeWarp ? "rgba(186, 252, 255, 0.78)" : "rgba(186, 252, 255, 0.72)";
      ctx.fillStyle = timeWarp ? "rgba(120, 255, 244, 0.1)" : "rgba(120, 255, 244, 0.1)";
      ctx.shadowColor = "#8cf8ff";
      ctx.shadowBlur = timeWarp ? 18 : 18;
      ctx.lineWidth = timeWarp ? 4 : 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r * (timeWarp ? 1 : 0.45 + progress * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (timeWarp) {
        ctx.strokeStyle = "rgba(235, 255, 255, 0.42)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i += 1) {
          const angle = (effect.age || 0) * -1.1 + i * 1.05;
          ctx.beginPath();
          ctx.arc(effect.x + Math.cos(angle) * 46, effect.y + Math.sin(angle) * 32, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(186, 252, 255, 0.52)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const tickAngle = (effect.age || 0) * 1.6 + i * Math.PI * 0.5;
          const inner = effect.r - 18;
          const outer = effect.r - 6;
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(tickAngle) * inner, effect.y + Math.sin(tickAngle) * inner);
          ctx.lineTo(effect.x + Math.cos(tickAngle) * outer, effect.y + Math.sin(tickAngle) * outer);
          ctx.stroke();
        }
      }
      ctx.restore();
      return;
    }
    if (effect.type === "fireBlastCast") {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#ff8a32";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "rgba(255, 122, 43, 0.42)";
      ctx.beginPath();
      ctx.moveTo(54 + progress * 24, 0);
      ctx.lineTo(-8, -18 - progress * 6);
      ctx.lineTo(4, 0);
      ctx.lineTo(-8, 18 + progress * 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff1b8";
      ctx.beginPath();
      ctx.arc(0, 0, 11 + progress * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (effect.type === "fireBlastExplosion") {
      const ring = effect.r * (0.28 + progress * 0.72);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#ff8a32";
      ctx.shadowBlur = 26;
      ctx.fillStyle = "rgba(255, 108, 31, 0.22)";
      ctx.strokeStyle = "rgba(255, 230, 151, 0.9)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, ring, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 241, 184, 0.68)";
      for (let i = 0; i < 8; i += 1) {
        const angle = i * Math.PI * 0.25 + progress * 0.8;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * ring * 0.55, effect.y + Math.sin(angle) * ring * 0.55, 8 + progress * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (effect.type === "arcaneLance") {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#8cf8ff";
      ctx.shadowBlur = 24;
      ctx.strokeStyle = "rgba(186, 252, 255, 0.9)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(160 + progress * 120, 0);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.restore();
  });
  livingBosses().forEach((target) => {
    if (!target.markedTimer || target.markedTimer <= 0) return;
    const pulse = Math.sin(performance.now() / 120) * 4;
    drawRing(target.x, target.y, target.radius + 18 + pulse, "#ffd782");
  });
  livingBosses().forEach((target) => {
    if (target.poisonStacks > 0) drawStackPips(target, target.poisonStacks, "#9be06f", 0);
    if (target.exposedStacks > 0) drawStackPips(target, target.exposedStacks, "#c8ff9a", 12);
  });
}

function drawStackPips(target, count, color, yOffset) {
  ctx.save();
  ctx.fillStyle = color;
  const startX = target.x - (count - 1) * 5;
  for (let i = 0; i < count; i += 1) {
    ctx.beginPath();
    ctx.arc(startX + i * 10, target.y - target.radius - 20 - yOffset, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawOrbitingShield(x, y, angle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(255, 238, 178, 0.92)";
  ctx.strokeStyle = "#8f7140";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.quadraticCurveTo(13, -8, 11, 5);
  ctx.quadraticCurveTo(6, 15, 0, 19);
  ctx.quadraticCurveTo(-6, 15, -11, 5);
  ctx.quadraticCurveTo(-13, -8, 0, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(0, 13);
  ctx.moveTo(-7, -1);
  ctx.lineTo(7, -1);
  ctx.stroke();
  ctx.restore();
}

function drawPlayerProjectiles() {
  playerProjectiles.forEach((projectile) => {
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    if (projectile.tag === "Magic") {
      if (projectile.fireBlast) {
        const pulse = Math.sin((projectile.age || 0) * 18) * 0.5 + 0.5;
        ctx.shadowColor = "#ff8a32";
        ctx.shadowBlur = 26 + pulse * 16;
        ctx.fillStyle = "rgba(255, 111, 35, 0.26)";
        ctx.beginPath();
        ctx.ellipse(-18, 0, 44, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff7a2b";
        ctx.beginPath();
        ctx.arc(0, 0, projectile.r + pulse * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff1b8";
        ctx.beginPath();
        ctx.arc(4, -4, projectile.r * 0.46, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 230, 151, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, projectile.r + 7, -0.7, 1.25);
        ctx.stroke();
        ctx.restore();
        return;
      }
      const pulse = Math.sin((projectile.age || 0) * 24) * 0.5 + 0.5;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 20 + pulse * 10;
      ctx.fillStyle = "rgba(72, 239, 228, 0.2)";
      ctx.beginPath();
      ctx.ellipse(-18, 0, 26, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#dffffc";
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, projectile.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, -6);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-30, 6);
      ctx.stroke();
    } else if (projectile.tag === "Ranged") {
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
    } else if (isWarriorTag(projectile.tag)) {
      drawMeleeProjectile(projectile);
    } else {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawMeleeProjectile(projectile) {
  const age = projectile.age || 0;
  const pulse = Math.sin(age * 22) * 0.5 + 0.5;
  ctx.save();
  ctx.shadowColor = "#fff0bf";
  ctx.shadowBlur = 16 + pulse * 10;
  ctx.fillStyle = "rgba(255, 235, 188, 0.16)";
  ctx.beginPath();
  ctx.ellipse(-18, 0, 44, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(255, 244, 210, 0.78)";
  ctx.strokeStyle = "#d8d1c4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.quadraticCurveTo(-4, -28, -34, -10);
  ctx.quadraticCurveTo(-16, 0, -34, 10);
  ctx.quadraticCurveTo(-4, 28, 30, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-3, 0, 23 + pulse * 3, -0.88, 0.88);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer() {
  drawRing(player.x, player.y, player.radius + 7, player.dead ? "#c7443b" : "#92d4ff");
  if (player.meleeAttackTimer > 0 && isMeleeBuild()) drawMeleeAttackWindup();
  if (player.castTimer > 0) drawMageCastAura();
  if (player.rangerAttackTimer > 0 && isRangedBuild()) drawRangerAttackWindup();
  const outfit = playerOutfitSprite();
  if (outfit || (playerSprite.complete && playerSprite.naturalWidth > 0)) {
    drawPlayerSprite();
  } else {
    drawFallbackPlayer();
  }
  if (isGlassMageBuild() && !outfit) drawGlassMageOutfit();
  if (player.meleeAttackTimer > 0 && isMeleeBuild()) drawMeleeAttackSlash();
  if (player.castTimer > 0) drawMageCastBurst();
  if (player.rangerAttackTimer > 0 && isRangedBuild()) drawRangerAttackRelease();
  drawPlayerHealthBar();
  if (player.destination) drawRing(player.destination.x, player.destination.y, 11, "#e9f6df");
}

function drawRemotePlayers() {
  multiplayer.peers.forEach((peer, id) => {
    if (!Number.isFinite(peer.x) || !Number.isFinite(peer.y)) return;
    const alpha = peer.dead ? 0.36 : 0.78;
    const color = remotePlayerColor(peer.weaponTag);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawRing(peer.x, peer.y, 25, color);
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(peer.x, peer.y + 19, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(peer.x, peer.y - 10, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(peer.x - 13, peer.y - 2, 26, 27);
    ctx.fillStyle = "#f1bd7d";
    ctx.beginPath();
    ctx.arc(peer.x, peer.y - 18, 9, 0, Math.PI * 2);
    ctx.fill();
    const hpPercent = clamp((peer.hp || 0) / Math.max(1, peer.maxHp || 1), 0, 1);
    ctx.fillStyle = "rgba(15, 12, 10, 0.82)";
    ctx.fillRect(peer.x - 25, peer.y - 47, 50, 6);
    ctx.fillStyle = peer.dead ? "#5f5f5f" : "#67d987";
    ctx.fillRect(peer.x - 24, peer.y - 46, 48 * hpPercent, 4);
    ctx.fillStyle = "#f5ebd5";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(id.slice(0, 4).toUpperCase(), peer.x, peer.y - 54);
    ctx.restore();
  });
}

function remotePlayerColor(tag) {
  if (tag === "Magic") return "#8ec7ff";
  if (tag === "Ranged") return "#9bd07b";
  if (tag === "Rogue") return "#9be06f";
  if (tag === "Warrior") return "#f0c36a";
  return "#d8d1c4";
}

function drawPlayerHealthBar() {
  if (player.hp >= player.maxHp && player.room === "starter" && !player.dead) return;
  const width = 58;
  const height = 7;
  const x = player.x - width / 2;
  const y = player.y - 72;
  const healthPercent = clamp(player.hp / player.maxHp, 0, 1);
  ctx.save();
  ctx.fillStyle = "rgba(10, 12, 11, 0.78)";
  ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
  ctx.fillStyle = "#2c1412";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = healthPercent > 0.45 ? "#69d06e" : healthPercent > 0.22 ? "#f0c35b" : "#df5a4c";
  ctx.fillRect(x, y, width * healthPercent, height);
  ctx.strokeStyle = "rgba(244, 241, 230, 0.82)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

function isGlassMageBuild() {
  return player.gear.weapon === "pulseStaff" && player.gear.armor === "channelerRobe";
}

function isMagicBuild() {
  return player.gear.weapon === "pulseStaff";
}

function isRangedBuild() {
  return player.gear.weapon === "emberBow";
}

function isMeleeBuild() {
  return player.gear.weapon === "ironBlade";
}

function isRogueBuild() {
  return player.gear.weapon === "shadowDaggers";
}

function playerOutfitSprite() {
  if (isRangedBuild() && rangedSprite.complete && rangedSprite.naturalWidth > 0) {
    return {
      sprite: cleanedRangedSprite || rangedSprite,
      sideCrop: 0.06,
      cropWidth: 0.88,
      cropBottom: 0.94,
      drawWidth: 84,
      drawHeight: 96,
      topCrop: 0.01,
    };
  }
  if (isRogueBuild() && rogueSprite.complete && rogueSprite.naturalWidth > 0) {
    return {
      sprite: cleanedRogueSprite || rogueSprite,
      sideCrop: 0.08,
      cropWidth: 0.84,
      cropBottom: 0.94,
      drawWidth: 82,
      drawHeight: 94,
      topCrop: 0.01,
    };
  }
  if (isMeleeBuild() && meleeSprite.complete && meleeSprite.naturalWidth > 0) {
    return {
      sprite: cleanedMeleeSprite || meleeSprite,
      sideCrop: 0.07,
      cropWidth: 0.86,
      cropBottom: 0.94,
      drawWidth: 84,
      drawHeight: 96,
      topCrop: 0.01,
    };
  }
  if (isMagicBuild() && glassMageSprite.complete && glassMageSprite.naturalWidth > 0) {
    return {
      sprite: cleanedGlassMageSprite || glassMageSprite,
      sideCrop: 0.13,
      cropWidth: 0.72,
      cropBottom: 0.93,
      drawWidth: 72,
      drawHeight: 88,
      topCrop: 0.02,
    };
  }
  return null;
}

function drawPlayerSprite() {
  const outfit = playerOutfitSprite();
  const sprite = outfit?.sprite || cleanedPlayerSprite || playerSprite;
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const frameWidth = sprite.width / 4;
  const frameHeight = sprite.height / 4;
  const rangerAttacking = player.rangerAttackTimer > 0 && isRangedBuild();
  const meleeAttacking = player.meleeAttackTimer > 0 && isMeleeBuild();
  const rogueAttacking = player.rogueAttackTimer > 0 && isRogueBuild();
  const frame = rangerAttacking
    ? (player.rangerAttackTimer > 0.14 ? 2 : 3)
    : rogueAttacking
      ? (player.rogueAttackTimer > 0.12 ? 2 : 3)
    : meleeAttacking
      ? (player.meleeAttackTimer > 0.17 ? 2 : 3)
      : player.moving
        ? Math.floor(player.animationTime * 8) % 4
        : 1;
  const row = rows[player.facing] ?? 0;
  const topCrop = outfit?.topCrop ?? (player.facing === "up" ? 0.04 : 0.1);
  const sideCrop = outfit?.sideCrop ?? 0.2;
  const cropWidth = outfit?.cropWidth ?? 0.56;
  const cropBottom = outfit?.cropBottom ?? 0.86;
  const crop = {
    x: frameWidth * sideCrop,
    y: frameHeight * topCrop,
    w: frameWidth * cropWidth,
    h: frameHeight * (cropBottom - topCrop),
  };
  const drawWidth = outfit?.drawWidth ?? 58;
  const drawHeight = outfit?.drawHeight ?? 74;
  const rangedPulse = rangerAttacking ? Math.sin((1 - player.rangerAttackTimer / 0.28) * Math.PI) : 0;
  const meleePulse = meleeAttacking ? Math.sin((1 - player.meleeAttackTimer / 0.34) * Math.PI) : 0;
  const roguePulse = rogueAttacking ? Math.sin((1 - player.rogueAttackTimer / 0.24) * Math.PI) : 0;
  const recoilX = rangerAttacking
    ? -Math.cos(player.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.cos(player.rogueAttackAngle) * roguePulse * 7
    : meleeAttacking
      ? Math.cos(player.meleeAttackAngle) * meleePulse * 8
      : 0;
  const recoilY = rangerAttacking
    ? -Math.sin(player.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.sin(player.rogueAttackAngle) * roguePulse * 7
    : meleeAttacking
      ? Math.sin(player.meleeAttackAngle) * meleePulse * 8
      : 0;
  ctx.drawImage(
    sprite,
    frame * frameWidth + crop.x,
    row * frameHeight + crop.y,
    crop.w,
    crop.h,
    player.x - drawWidth / 2 + recoilX,
    player.y - drawHeight * 0.66 + recoilY,
    drawWidth,
    drawHeight,
  );
}

function createTransparentSprite(image) {
  const buffer = document.createElement("canvas");
  buffer.width = image.naturalWidth;
  buffer.height = image.naturalHeight;
  const bufferCtx = buffer.getContext("2d");
  bufferCtx.drawImage(image, 0, 0);
  const pixels = bufferCtx.getImageData(0, 0, buffer.width, buffer.height);
  const data = pixels.data;

  removeSpriteSheetBackground(data, buffer.width, buffer.height);
  featherSpriteEdges(data, buffer.width, buffer.height, 3);
  bufferCtx.putImageData(pixels, 0, 0);
  return buffer;
}

function removeSpriteSheetBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const enqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    const i = p * 4;
    if (!isSpriteSheetBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    queue.push(p);
    data[i + 3] = 0;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let head = 0; head < queue.length; head += 1) {
    const p = queue[head];
    const x = p % width;
    const y = Math.floor(p / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
}

function isSpriteSheetBackground(red, green, blue, alpha) {
  if (alpha === 0) return true;
  const veryLight = red > 232 && green > 228 && blue > 220;
  const warmPaper = red > 212 && green > 202 && blue > 184 && red > blue + 6 && green > blue + 2;
  const paleGridLine = Math.abs(red - green) < 18 && Math.abs(green - blue) < 18 && red > 205;
  return veryLight || warmPaper || paleGridLine;
}

function featherSpriteEdges(data, width, height, radius) {
  const alpha = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    alpha[p] = data[i + 3];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (alpha[p] === 0) continue;

      let nearestTransparent = radius + 1;
      for (let oy = -radius; oy <= radius; oy += 1) {
        const sampleY = y + oy;
        if (sampleY < 0 || sampleY >= height) continue;
        for (let ox = -radius; ox <= radius; ox += 1) {
          const sampleX = x + ox;
          if (sampleX < 0 || sampleX >= width) continue;
          if (alpha[sampleY * width + sampleX] !== 0) continue;
          nearestTransparent = Math.min(nearestTransparent, Math.hypot(ox, oy));
        }
      }

      if (nearestTransparent <= radius) {
        const softness = clamp(nearestTransparent / radius, 0.35, 1);
        data[p * 4 + 3] = Math.round(alpha[p] * softness);
      }
    }
  }
}

function drawFallbackPlayer() {
  const armor = gear.armor[player.gear.armor];
  const weapon = gear.weapon[player.gear.weapon];
  ctx.fillStyle = "#d8a36f";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = armor.color;
  ctx.fillRect(player.x - 14, player.y, 28, 30);
  ctx.strokeStyle = weapon.color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(player.x + 12, player.y + 4);
  ctx.lineTo(player.x + 34, player.y - 8);
  ctx.stroke();
}

function drawMeleeAttackWindup() {
  const progress = 1 - player.meleeAttackTimer / 0.34;
  const angle = player.meleeAttackAngle || 0;
  const pull = clamp(progress / 0.42, 0, 1);
  ctx.save();
  ctx.translate(player.x, player.y - 24);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(0.85 - progress * 0.45, 0, 0.85);
  ctx.strokeStyle = "rgba(255, 230, 170, 0.72)";
  ctx.lineWidth = 2 + pull * 2;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(-4, 0, 34 + pull * 15, -2.45, -0.35);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowColor = "#fff0bf";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(255, 244, 210, 0.58)";
  ctx.beginPath();
  ctx.arc(-24 - pull * 10, -18, 4 + pull * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMeleeAttackSlash() {
  const progress = 1 - player.meleeAttackTimer / 0.34;
  const swing = clamp((progress - 0.14) / 0.7, 0, 1);
  if (swing <= 0) return;
  const angle = player.meleeAttackAngle || 0;
  const alpha = Math.sin(swing * Math.PI);
  const reach = 43 + swing * 16;
  ctx.save();
  ctx.translate(player.x, player.y - 24);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "#fff0bf";
  ctx.shadowBlur = 24;
  ctx.lineCap = "round";

  ctx.strokeStyle = "rgba(255, 244, 210, 0.9)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(16, 0, reach, -1.05 + swing * 0.32, 0.95 + swing * 0.32);
  ctx.stroke();

  ctx.strokeStyle = "rgba(216, 209, 196, 0.82)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(20, 0, reach + 10, -0.86 + swing * 0.25, 0.72 + swing * 0.25);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const offset = -14 + i * 14;
    ctx.beginPath();
    ctx.moveTo(34 + swing * 20, offset);
    ctx.lineTo(62 + swing * 24, offset * 0.42);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMageCastAura() {
  const progress = 1 - player.castTimer / 0.36;
  const alpha = clamp(1 - progress, 0, 1);
  const pulse = Math.sin(progress * Math.PI);
  ctx.save();
  ctx.globalAlpha = 0.45 * alpha;
  ctx.strokeStyle = "#48efe4";
  ctx.fillStyle = "rgba(72, 239, 228, 0.08)";
  ctx.shadowColor = "#48efe4";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x, player.y - 16, 20 + pulse * 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(220, 255, 252, 0.45)";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 16, 12 + pulse * 12, Math.PI * 0.15, Math.PI * 1.65);
  ctx.stroke();
  ctx.restore();
}

function drawMageCastBurst() {
  const progress = 1 - player.castTimer / 0.36;
  const alpha = clamp(1 - progress, 0, 1);
  const angle = player.castAngle || 0;
  const muzzleX = player.x + Math.cos(angle) * 32;
  const muzzleY = player.y - 18 + Math.sin(angle) * 32;
  ctx.save();
  ctx.translate(muzzleX, muzzleY);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "#48efe4";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "rgba(72, 239, 228, 0.5)";
  ctx.beginPath();
  ctx.moveTo(34 + progress * 18, 0);
  ctx.lineTo(-8, -13 - progress * 7);
  ctx.lineTo(2, 0);
  ctx.lineTo(-8, 13 + progress * 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e8fffc";
  ctx.beginPath();
  ctx.arc(0, 0, 9 + progress * 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#48efe4";
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-8, i * 8);
    ctx.lineTo(30 + progress * 22, i * 14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRangerAttackWindup() {
  const progress = 1 - player.rangerAttackTimer / 0.28;
  const draw = Math.sin(progress * Math.PI);
  const angle = player.rangerAttackAngle || 0;
  const bowX = player.x + Math.cos(angle) * 18;
  const bowY = player.y - 30 + Math.sin(angle) * 18;
  ctx.save();
  ctx.translate(bowX, bowY);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.35 + draw * 0.45;
  ctx.shadowColor = "#e0a14e";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "#ffe4a7";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 23, -1.2, 1.2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 244, 204, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -21);
  ctx.lineTo(-18 - draw * 10, 0);
  ctx.lineTo(0, 21);
  ctx.stroke();
  ctx.strokeStyle = "rgba(224, 161, 78, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22 - draw * 8, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  ctx.restore();
}

function drawRangerAttackRelease() {
  const progress = 1 - player.rangerAttackTimer / 0.28;
  const alpha = clamp(1 - progress * 0.75, 0, 1);
  const angle = player.rangerAttackAngle || 0;
  const startX = player.x + Math.cos(angle) * 30;
  const startY = player.y - 28 + Math.sin(angle) * 30;
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "#ffd782";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "rgba(255, 236, 180, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6 - progress * 10, 0);
  ctx.lineTo(42 + progress * 28, 0);
  ctx.stroke();
  ctx.fillStyle = "#fff5c7";
  ctx.beginPath();
  ctx.arc(10 + progress * 18, 0, 5 - progress * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGlassMageOutfit() {
  const x = player.x;
  const y = player.y;
  const bob = player.moving ? Math.sin(player.animationTime * 8) * 1.6 : 0;
  const side = player.facing === "left" ? -1 : player.facing === "right" ? 1 : 0;
  const backFacing = player.facing === "up";
  const sideFacing = player.facing === "left" || player.facing === "right";
  const robeX = x - (sideFacing ? 14 : 18) + side * 2;
  const robeY = y - 31 + bob;
  const robeW = sideFacing ? 29 : 36;
  const robeH = 45;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = "#3f236d";
  ctx.strokeStyle = "#151019";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(robeX, robeY, robeW, robeH, 11);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#d99a36";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(robeX + 4, robeY + robeH - 9);
  ctx.lineTo(robeX + robeW - 4, robeY + robeH - 9);
  ctx.moveTo(robeX + 5, robeY + 24);
  ctx.lineTo(robeX + robeW - 5, robeY + 24);
  ctx.stroke();

  if (!backFacing) {
    ctx.fillStyle = "#d99a36";
    ctx.fillRect(x - 7 + side * 2, robeY + 22, 14, 5);
    ctx.fillStyle = "#19121d";
    ctx.fillRect(x - 4 + side * 2, robeY + 23, 8, 3);
  }

  ctx.strokeStyle = "#25143b";
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (sideFacing) {
    ctx.moveTo(x - side * 7, robeY + 7);
    ctx.lineTo(x + side * 16, robeY + 24);
  } else {
    ctx.moveTo(x - 18, robeY + 8);
    ctx.lineTo(x - 23, robeY + 25);
    ctx.moveTo(x + 18, robeY + 8);
    ctx.lineTo(x + 23, robeY + 25);
  }
  ctx.stroke();

  ctx.strokeStyle = "#d99a36";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (sideFacing) {
    ctx.moveTo(x + side * 13, robeY + 20);
    ctx.lineTo(x + side * 20, robeY + 26);
  } else {
    ctx.moveTo(x - 22, robeY + 22);
    ctx.lineTo(x - 25, robeY + 29);
    ctx.moveTo(x + 22, robeY + 22);
    ctx.lineTo(x + 25, robeY + 29);
  }
  ctx.stroke();

  drawWizardHat(x + side * 4, y - 51 + bob, side, backFacing);
  ctx.restore();
}

function drawWizardHat(x, y, side, backFacing) {
  const lean = side || (backFacing ? -0.3 : 0.45);
  ctx.fillStyle = "#4b2880";
  ctx.strokeStyle = "#151019";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y + 22, 29, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 18, y + 18);
  ctx.quadraticCurveTo(x - 4, y - 25, x + lean * 30, y - 31);
  ctx.quadraticCurveTo(x + 24 + lean * 7, y - 28, x + 12 + lean * 11, y - 18);
  ctx.quadraticCurveTo(x + 22, y - 4, x + 17, y + 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#d99a36";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y + 15, 22, 0.16, Math.PI - 0.16, true);
  ctx.stroke();

  ctx.fillStyle = "#f0b94a";
  ctx.beginPath();
  ctx.arc(x - 3, y - 2, 7, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.arc(x + 1, y - 2, 5, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.fill();
  drawTinyStar(x - 13, y - 14, 4);
  drawTinyStar(x + 13, y + 3, 3.5);
  if (!backFacing) drawTinyStar(x + 4, y - 21, 3.2);
}

function drawTinyStar(x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
    const pointRadius = i % 2 === 0 ? radius : radius * 0.42;
    const px = x + Math.cos(angle) * pointRadius;
    const py = y + Math.sin(angle) * pointRadius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.fillStyle = particle.color;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(particle.text, particle.x, particle.y);
    ctx.textAlign = "left";
  });
}

function drawRing(x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawAbilityBar() {
  const abilities = currentAbilities();
  const slotW = 164;
  const slotH = 56;
  const gap = 8;
  const totalW = abilities.length * slotW + (abilities.length - 1) * gap;
  const startX = canvas.clientWidth / 2 - totalW / 2;
  const y = canvas.clientHeight - slotH - 18;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  abilities.forEach((ability, index) => {
    const x = startX + index * (slotW + gap);
    const cooldown = player.abilityCooldowns[index] || 0;
    const ready = cooldown <= 0 && player.room === "arena" && !player.dead && !player.won;
    ctx.fillStyle = ready ? "rgba(25, 24, 22, 0.88)" : "rgba(15, 15, 14, 0.82)";
    ctx.strokeStyle = ready ? "rgba(226, 189, 114, 0.82)" : "rgba(244, 232, 203, 0.22)";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, slotW, slotH);
    ctx.strokeRect(x, y, slotW, slotH);
    if (cooldown > 0) {
      const fill = clamp(cooldown / ability.cooldown, 0, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
      ctx.fillRect(x, y + slotH * (1 - fill), slotW, slotH * fill);
    }
    const keyW = ability.key.length > 1 ? 56 : 30;
    ctx.fillStyle = ready ? "rgba(240, 212, 124, 0.16)" : "rgba(244, 232, 203, 0.08)";
    ctx.strokeStyle = ready ? "rgba(240, 212, 124, 0.62)" : "rgba(244, 232, 203, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 11, keyW, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ready ? "#f0d47c" : "#9e9588";
    ctx.font = ability.key.length > 1 ? "bold 13px sans-serif" : "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ability.key, x + 10 + keyW / 2, y + 23);
    ctx.textAlign = "left";
    ctx.fillStyle = "#f7efd9";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(ability.name, x + keyW + 20, y + 18);
    ctx.fillStyle = cooldown > 0 ? "#d0c6b4" : "#9be06f";
    ctx.font = "11px sans-serif";
    ctx.fillText(cooldown > 0 ? `${cooldown.toFixed(1)}s` : "Ready", x + keyW + 20, y + 38);
  });
  const potionX = startX + totalW + gap;
  ctx.fillStyle = "rgba(25, 24, 22, 0.88)";
  ctx.strokeStyle = player.potions > 0 ? "rgba(142, 199, 255, 0.62)" : "rgba(244, 232, 203, 0.22)";
  ctx.fillRect(potionX, y, 96, slotH);
  ctx.strokeRect(potionX, y, 96, slotH);
  ctx.fillStyle = "#8ec7ff";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("F", potionX + 12, y + 18);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("Potion", potionX + 38, y + 18);
  ctx.fillStyle = "#d0c6b4";
  ctx.font = "11px sans-serif";
  ctx.fillText(`${player.potions} left`, potionX + 38, y + 38);
  ctx.restore();
}

function renderUi() {
  ui.roomText.textContent = player.dead ? "You're Stuffed" : player.room === "starter" ? "Starter Room" : player.won ? "Victory" : "Boss Arena";
  ui.hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  ui.hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
  const bossHp = bossHealthSummary();
  ui.bossHpText.textContent = boss.kind === "shake"
    ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} Bar ${boss.phase}/3`
    : boss.kind === "nacho" || boss.kind === "pizza"
      ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} Phase ${boss.phase}/3`
      : `${Math.ceil(bossHp.hp)}/${bossHp.maxHp}`;
  ui.bossHpBar.style.width = `${(bossHp.hp / bossHp.maxHp) * 100}%`;
  ui.potionButton.textContent = `Potion (${player.potions})`;
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  ui.buildPanel.innerHTML = `
    <div><span>Weapon</span><strong>${weapon.name}</strong></div>
    <div><span>Armor</span><strong>${armor.name}</strong></div>
    <div><span>Damage</span><strong>${player.stats.damage}</strong></div>
    <div><span>Range</span><strong>${player.stats.range}</strong></div>
    <div><span>Armor</span><strong>${player.stats.armor}</strong></div>
    <div><span>Speed</span><strong>${player.stats.speed}</strong></div>
  `;
  if (ui.armory) {
    ui.armory.innerHTML = [...Object.values(gear.weapon), ...Object.values(gear.armor)].map((item) => {
      const selected = player.gear[item.slot] && gear[item.slot][player.gear[item.slot]].name === item.name;
      return `<button class="choice ${selected ? "selected" : ""}" data-slot="${item.slot}" data-name="${item.name}"><span>${item.name}</span><small>${item.tag}</small></button>`;
    }).join("");
  }
  ui.bossSelector.querySelectorAll("[data-boss]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.boss === boss.kind);
  });
  if (ui.deathScreen) {
    ui.deathScreen.hidden = !player.dead;
  }
}

function bossHealthSummary() {
  if (boss.kind !== "trio") return { hp: boss.hp, maxHp: boss.maxHp };
  return {
    hp: condimentBosses.reduce((total, target) => total + Math.max(0, target.hp), 0),
    maxHp: condimentBosses.reduce((total, target) => total + target.maxHp, 0),
  };
}

function setupMultiplayer() {
  if (!("WebSocket" in window) || location.protocol === "file:") {
    setCoopStatus(location.protocol === "file:" ? "Start server for co-op" : "Solo", 1);
    return;
  }
  connectMultiplayer();
}

function connectMultiplayer() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}/coop`);
  multiplayer.socket = socket;
  setCoopStatus("Connecting", multiplayer.count);

  socket.addEventListener("open", () => {
    multiplayer.connected = true;
    multiplayer.reconnectTimer = 0;
    setCoopStatus("Online", multiplayer.count);
    sendMultiplayerState(true);
  });

  socket.addEventListener("message", (event) => {
    try {
      handleMultiplayerMessage(JSON.parse(event.data));
    } catch {
      // Ignore malformed co-op packets from old tabs or interrupted connections.
    }
  });

  socket.addEventListener("close", () => {
    multiplayer.connected = false;
    multiplayer.socket = null;
    multiplayer.peers.clear();
    multiplayer.reconnectTimer = multiplayer.reconnectDelay;
    setCoopStatus("Reconnecting", 1);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

function handleMultiplayerMessage(message) {
  if (message.type === "welcome") {
    multiplayer.id = message.id;
    multiplayer.peers.clear();
    (message.peers || []).forEach((peer) => {
      if (peer.state) multiplayer.peers.set(peer.id, peer.state);
    });
    multiplayer.count = multiplayer.peers.size + 1;
    setCoopStatus("Online", multiplayer.count);
    sendMultiplayerState(true);
    return;
  }
  if (message.type === "peer-state" && message.id && message.state) {
    multiplayer.peers.set(message.id, message.state);
    multiplayer.count = multiplayer.peers.size + 1;
    setCoopStatus("Online", multiplayer.count);
    applyRemoteBossProgress(message.state);
    return;
  }
  if (message.type === "peer-left" && message.id) {
    multiplayer.peers.delete(message.id);
    multiplayer.count = multiplayer.peers.size + 1;
    setCoopStatus(multiplayer.connected ? "Online" : "Solo", multiplayer.count);
    return;
  }
  if (message.type === "peer-count") {
    multiplayer.count = Math.max(1, Number(message.count) || 1);
    setCoopStatus(multiplayer.connected ? "Online" : "Solo", multiplayer.count);
  }
}

function updateMultiplayer(dt) {
  multiplayer.peers.forEach((peer, id) => {
    if (Date.now() - (peer.updatedAt || 0) > 12000) multiplayer.peers.delete(id);
  });
  if (!multiplayer.connected && multiplayer.reconnectTimer > 0) {
    multiplayer.reconnectTimer -= dt;
    if (multiplayer.reconnectTimer <= 0) connectMultiplayer();
    return;
  }
  multiplayer.sendTimer -= dt;
  if (multiplayer.sendTimer <= 0) {
    multiplayer.sendTimer = 0.08;
    sendMultiplayerState(false);
  }
}

function sendMultiplayerState(force) {
  if (!multiplayer.connected || !multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  if (!force && document.hidden) return;
  multiplayer.socket.send(JSON.stringify({ type: "state", state: multiplayerSnapshot() }));
}

function multiplayerSnapshot() {
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  return {
    x: Math.round(player.x),
    y: Math.round(player.y),
    hp: Math.ceil(player.hp),
    maxHp: player.maxHp,
    room: player.room,
    dead: player.dead,
    won: player.won,
    facing: player.facing,
    moving: player.moving,
    weapon: player.gear.weapon,
    armor: player.gear.armor,
    weaponTag: weapon.tag,
    armorTag: armor.tag,
    bossKind: boss.kind,
    bossHp: Math.max(0, Math.ceil(bossHealthSummary().hp)),
    bossMaxHp: bossHealthSummary().maxHp,
    bossPhase: boss.phase || 1,
    bossTargets: bossTargetSnapshot(),
  };
}

function bossTargetSnapshot() {
  return activeBosses().map((target) => ({
    kind: target.kind,
    hp: Math.max(0, Math.ceil(target.hp)),
    maxHp: target.maxHp,
  }));
}

function applyRemoteBossProgress(state) {
  if (!state || state.bossKind !== boss.kind || player.room !== "arena") return;
  if (boss.kind === "trio") {
    (state.bossTargets || []).forEach((remoteTarget) => {
      const localTarget = condimentBosses.find((target) => target.kind === remoteTarget.kind);
      if (!localTarget || localTarget.hp <= 0) return;
      if (remoteTarget.hp <= 0) damageBossTarget(localTarget, localTarget.hp + 1, "Co-op");
      else localTarget.hp = Math.min(localTarget.hp, remoteTarget.hp);
    });
    return;
  }
  if (boss.hp > 0 && Number.isFinite(state.bossHp)) {
    if (state.bossHp <= 0) damageBossTarget(boss, boss.hp + 1, "Co-op");
    else boss.hp = Math.min(boss.hp, state.bossHp);
  }
}

function setCoopStatus(text, count) {
  if (ui.coopStatus) ui.coopStatus.textContent = text;
  if (ui.coopCount) ui.coopCount.textContent = String(count);
}

function showFloat(text) {
  ui.floatText.textContent = text;
  floatTimer = 1.7;
}

function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  renderUi();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseWorld = { x: event.clientX - rect.left + camera.x, y: event.clientY - rect.top + camera.y };
  handleCanvasClick(mouseWorld.x, mouseWorld.y);
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseWorld = { x: event.clientX - rect.left + camera.x, y: event.clientY - rect.top + camera.y };
});

if (ui.armory) {
  ui.armory.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slot]");
    if (!button) return;
    const slot = button.dataset.slot;
    const entry = Object.entries(gear[slot]).find(([, item]) => item.name === button.dataset.name);
    if (!entry) return;
    equipFromStand({ type: slot, id: entry[0] });
  });
}

ui.bossSelector.addEventListener("click", (event) => {
  const button = event.target.closest("[data-boss]");
  if (!button) return;
  event.preventDefault();
  selectBoss(button.dataset.boss);
});

ui.potionButton.addEventListener("click", drinkPotion);
ui.resetButton.addEventListener("click", () => resetFight(false));
ui.deathResetButton?.addEventListener("click", () => resetFight(false));
window.addEventListener("keydown", (event) => {
  if (isTypingTarget(document.activeElement)) return;
  const key = event.key.toLowerCase();
  const direction = keyDirections[key];
  if (direction) {
    event.preventDefault();
    movementKeys[direction] = true;
    return;
  }
  const abilityIndex = abilityIndexForKey(event);
  if (abilityIndex >= 0) {
    event.preventDefault();
    if (!event.repeat) useAbility(abilityIndex);
    return;
  }
  if (key !== "f") return;
  event.preventDefault();
  drinkPotion();
});
window.addEventListener("keyup", (event) => {
  const direction = keyDirections[event.key.toLowerCase()];
  if (!direction) return;
  event.preventDefault();
  movementKeys[direction] = false;
});
window.addEventListener("blur", () => {
  Object.keys(movementKeys).forEach((direction) => {
    movementKeys[direction] = false;
  });
});
window.addEventListener("resize", resizeCanvas);

loadGame();
applyGear();
resizeCanvas();
renderUi();
setupMultiplayer();
requestAnimationFrame(gameLoop);
