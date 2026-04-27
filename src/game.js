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
  armory: document.querySelector("#armory"),
  bossSelector: document.querySelector("#bossSelector"),
  floatText: document.querySelector("#floatText"),
  potionButton: document.querySelector("#potionButton"),
  resetButton: document.querySelector("#resetButton"),
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
    ironBlade: { slot: "weapon", name: "Sword", tag: "Melee", damage: 26, range: 54, speed: 1.05, color: "#d8d1c4" },
    emberBow: { slot: "weapon", name: "Bow", tag: "Ranged", damage: 18, range: 230, speed: 0.78, color: "#e0a14e" },
    pulseStaff: { slot: "weapon", name: "Staff", tag: "Magic", damage: 34, range: 170, speed: 1.55, color: "#8ec7ff" },
  },
  armor: {
    duelistCoat: { slot: "armor", name: "Light Armor", tag: "Fast", armor: 2, maxHp: 115, speed: 250, color: "#557d61" },
    bulwarkPlate: { slot: "armor", name: "Heavy Armor", tag: "Tank", armor: 8, maxHp: 160, speed: 195, color: "#8d8f92" },
    channelerRobe: { slot: "armor", name: "Mage Armor", tag: "Glass", armor: 0, maxHp: 95, speed: 270, color: "#6f75b8" },
  },
};

const stands = [
  { x: 205, y: 270, type: "weapon", id: "ironBlade" },
  { x: 340, y: 270, type: "weapon", id: "emberBow" },
  { x: 475, y: 270, type: "weapon", id: "pulseStaff" },
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
const curlyFriesSprite = new Image();
let cleanedCurlyFriesSprite = null;
curlyFriesSprite.src = "./assets/curly-fries-spritesheet.png";
curlyFriesSprite.addEventListener("load", () => {
  cleanedCurlyFriesSprite = createTransparentSprite(curlyFriesSprite);
});

let player = createPlayer();
let boss = createBoss("burger");
let condimentBosses = [];
let hazards = [];
let playerProjectiles = [];
let particles = [];
let camera = { x: 0, y: 0 };
let selectedBoss = null;
let floatTimer = 0;
let fightStartedAt = 0;
let lastTime = performance.now();
let logLines = ["Choose gear, cross the gate, click the boss."];

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
    gateCooldown: 0,
    room: "starter",
    dead: false,
    won: false,
    facing: "down",
    animationTime: 0,
    moving: false,
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
      maxHp: 720,
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
  };
  const template = bosses[kind];
  return {
    ...template,
    x: 1180,
    y: 450,
    hp: template.maxHp,
    phase: 1,
    enraged: false,
    animation: "idle",
    animationTime: 0,
    mode: "red",
    modeTimer: 3,
    shieldTimer: 0,
    state: "moving",
    stateTimer: 0,
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
  player.stats = {
    damage: weapon.damage,
    range: weapon.range,
    speed: armor.speed,
    armor: armor.armor,
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
  boss = createBoss(bossKind);
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  hazards = [];
  playerProjectiles = [];
  particles = [];
  selectedBoss = null;
  fightStartedAt = 0;
  logLines = ["Fight reset. Cross the gate when ready."];
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
  player.gateCooldown = 1.2;
  boss = createBoss(kind);
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  hazards = [];
  playerProjectiles = [];
  particles = [];
  selectedBoss = null;
  fightStartedAt = 0;
  ui.status.textContent = `${boss.name} selected for testing.`;
  showFloat(boss.name);
}

function startFight() {
  if (fightStartedAt) return;
  fightStartedAt = performance.now();
  log("Boss awakened.");
  ui.status.textContent = `Boss awakened. Click ${boss.name} to attack.`;
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

function currentBounds() {
  return player.room === "arena" ? world.arena : world.starter;
}

function setDestination(x, y) {
  if (player.dead || player.won) return;
  const stand = stands.find((item) => Math.hypot(item.x - x, item.y - y) < 48);
  if (stand && player.room === "starter") {
    equipFromStand(stand);
    return;
  }
  const clickedBoss = findClickedBoss(x, y);
  if (clickedBoss && player.room === "arena") {
    selectedBoss = clickedBoss;
    startFight();
    ui.status.textContent = `Attacking ${clickedBoss.name}.`;
    return;
  }
  selectedBoss = null;
  player.destination = constrainToRoom(x, y);
  ui.status.textContent = player.room === "starter" ? "Moving." : "Repositioning.";
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
  const bounds = currentBounds();
  return {
    x: clamp(x, bounds.x + player.radius, bounds.x + bounds.w - player.radius),
    y: clamp(y, bounds.y + player.radius, bounds.y + bounds.h - player.radius),
  };
}

function equipFromStand(stand) {
  player.gear[stand.type] = stand.id;
  applyGear();
  player.hp = player.maxHp;
  saveGear();
  const item = gear[stand.type][stand.id];
  log(`Equipped ${item.name}.`);
  showFloat(item.name);
}

function movePlayer(dt) {
  player.moving = false;
  player.greaseCooldown = Math.max(0, player.greaseCooldown - dt);
  if (player.slide) {
    moveSlidingPlayer(dt);
    return;
  }
  if (!player.destination) return;
  const dx = player.destination.x - player.x;
  const dy = player.destination.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) {
    player.destination = null;
    return;
  }
  player.facing = getFacing(dx, dy);
  player.moving = true;
  player.animationTime += dt;
  const step = Math.min(dist, player.stats.speed * dt);
  player.x += (dx / dist) * step;
  player.y += (dy / dist) * step;
}

function moveSlidingPlayer(dt) {
  player.moving = true;
  player.animationTime += dt * 1.8;
  player.slide.timer -= dt;
  player.x += player.slide.vx * dt;
  player.y += player.slide.vy * dt;
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
  }
  if (player.slide.timer <= 0) {
    player.slide = null;
  }
}

function startGreaseSlide(puddle) {
  if (player.greaseCooldown > 0 || player.room !== "arena" || player.dead || player.won) return;
  let dx = 0;
  let dy = 0;
  if (player.destination) {
    dx = player.destination.x - player.x;
    dy = player.destination.y - player.y;
  }
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

  if (selectedBoss?.hp > 0) autoAttack(selectedBoss);
  if (boss.swingTimer <= 0 && distance(player, boss) < boss.radius + 46) {
    damagePlayer(boss.enraged ? 18 : 13, "Crushing swing");
    boss.swingTimer = boss.enraged ? 0.9 : 1.25;
  }
  if (boss.attackTimer <= 0) {
    spawnBossPattern();
    if (boss.kind === "fries") {
      boss.attackTimer = boss.enraged ? 0.95 : boss.phase === 2 ? 1.25 : 1.55;
    } else {
      boss.attackTimer = boss.enraged ? 1.25 : boss.phase === 2 ? 1.65 : 2.1;
    }
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
  if (selectedBoss?.hp > 0) autoAttack(selectedBoss);
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
  if (selectedBoss?.hp > 0) autoAttack(selectedBoss);
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

function autoAttack(target = boss) {
  const range = player.radius + target.radius + player.stats.range;
  if (distance(player, target) > range) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const desiredDistance = target.radius + player.stats.range + player.radius - 4;
    player.destination = {
      x: target.x - Math.cos(angle) * desiredDistance,
      y: target.y - Math.sin(angle) * desiredDistance,
    };
    player.destination = constrainToRoom(player.destination.x, player.destination.y);
    return;
  }
  if (player.attackCooldown > 0) return;
  const weapon = gear.weapon[player.gear.weapon];
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  playerProjectiles.push({
    x: player.x + Math.cos(angle) * 24,
    y: player.y + Math.sin(angle) * 24,
    vx: Math.cos(angle) * projectileSpeedForWeapon(weapon.tag),
    vy: Math.sin(angle) * projectileSpeedForWeapon(weapon.tag),
    r: weapon.tag === "Magic" ? 8 : 6,
    damage: Math.round(player.stats.damage * (0.78 + Math.random() * 0.44)),
    color: weapon.color,
    ttl: 1.35,
    tag: weapon.tag,
    target,
  });
  player.attackCooldown = weapon.speed;
}

function projectileSpeedForWeapon(tag) {
  if (tag === "Ranged") return 620;
  if (tag === "Magic") return 480;
  return 760;
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
  if (Math.random() < (boss.enraged ? 0.75 : boss.phase === 2 ? 0.55 : 0.35)) {
    spawnGreasePuddles(boss.enraged ? 2 : 1);
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
      ttl: boss.enraged ? 7.5 : 6.2,
    });
  }
  log("Grease puddles splashed down.");
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
    sweepSpeed: (Math.random() > 0.5 ? 1 : -1) * (boss.enraged ? 0.72 : 0.48),
    warn: 0.65,
    ttl: boss.enraged ? 2.8 : 2.35,
    fireTimer: 0,
    damageTimer: 0,
    damage: 13,
  });
  setBossAnimation("machineGun");
  log("French fry machine gun charging.");
}

function spawnCurlySpiral() {
  const count = boss.enraged ? 18 : boss.phase === 2 ? 14 : 10;
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
  hazards = hazards.filter((hazard) => {
    if (hazard.type === "grease") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r * 0.72) startGreaseSlide(hazard);
    } else if (hazard.type === "machineGun") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        hazard.angle += hazard.sweepSpeed * dt;
        hazard.fireTimer -= dt;
        hazard.damageTimer -= dt;
        while (hazard.fireTimer <= 0) {
          spawnFryShot(hazard);
          hazard.fireTimer += boss.enraged ? 0.035 : 0.048;
        }
        if (isPlayerInMachineGun(hazard) && hazard.damageTimer <= 0) {
          damagePlayer(boss.enraged ? 18 : 14, "French fry machine gun");
          hazard.damageTimer = 0.12;
        }
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
    } else if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob") {
      hazard.ttl -= dt;
      if (hazard.turn) {
        const speed = Math.hypot(hazard.vx, hazard.vy);
        const angle = Math.atan2(hazard.vy, hazard.vx) + hazard.turn * dt;
        hazard.vx = Math.cos(angle) * speed;
        hazard.vy = Math.sin(angle) * speed;
      }
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (hazard.type === "mustardSeed" && hazard.bounces > 0) {
        bounceProjectileInArena(hazard);
      }
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        const source = hazard.type === "fry" ? "French fry" : hazard.type === "mustardSeed" ? "Mustard seed" : hazard.type === "sauceBlob" ? "Special sauce" : "Arc bolt";
        damagePlayer(hazard.damage, source);
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
    return hazard.ttl > 0 && pointInRect(hazard.x, hazard.y, world.arena);
  });
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

function spawnFryShot(emitter) {
  const spread = (Math.random() - 0.5) * 0.16;
  const angle = emitter.angle + spread;
  const speed = (boss.enraged ? 850 : 760) + Math.random() * 90;
  hazards.push({
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

function damagePlayer(amount, source) {
  const hit = Math.max(1, amount - player.stats.armor);
  player.hp = Math.max(0, player.hp - hit);
  particles.push({ x: player.x, y: player.y - 35, text: `-${hit}`, color: "#ff8f7e", ttl: 0.8 });
  if (player.hp <= 0) {
    player.dead = true;
    selectedBoss = null;
    log(`${source} defeated you.`);
    ui.status.textContent = "Defeated. Reset the fight or tweak your gear.";
  }
}

function drinkPotion() {
  if (player.potions <= 0 || player.hp >= player.maxHp || player.dead || player.won) return;
  player.potions -= 1;
  player.hp = Math.min(player.maxHp, player.hp + 55);
  showFloat("Potion used");
  log("Potion restored health.");
}

function winFight() {
  selectedBoss = null;
  hazards = [];
  playerProjectiles = [];
  const seconds = fightStartedAt ? Math.max(1, Math.round((performance.now() - fightStartedAt) / 1000)) : 0;
  log(`Victory in ${seconds}s.`);
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
  player.won = true;
  ui.status.textContent = "Victory. Reset to test another build.";
  showFloat("Condiment Trio defeated");
}

function update(dt) {
  movePlayer(dt);
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
  camera.x = clamp(player.x - canvas.clientWidth / 2, 0, world.width - canvas.clientWidth);
  camera.y = clamp(player.y - canvas.clientHeight / 2, 0, world.height - canvas.clientHeight);
}

function updatePlayerProjectiles(dt) {
  playerProjectiles = playerProjectiles.filter((projectile) => {
    projectile.ttl -= dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    const hitBoss = livingBosses().find((target) => distance(projectile, target) < target.radius + projectile.r);
    if (hitBoss) {
      const damage = hitBoss.shieldTimer > 0 ? Math.ceil(projectile.damage * 0.5) : projectile.damage;
      hitBoss.hp = Math.max(0, hitBoss.hp - damage);
      particles.push({ x: hitBoss.x, y: hitBoss.y - 40, text: `-${damage}`, color: "#ffe08a", ttl: 0.8 });
      if (hitBoss.hp <= 0) {
        particles.push({ x: hitBoss.x, y: hitBoss.y - 62, text: `${hitBoss.name} down`, color: "#ffd27a", ttl: 1.2 });
        if (hitBoss === selectedBoss) selectedBoss = null;
        if (hitBoss.kind === "ketchup") clearKetchupHazards();
        if (hitBoss.kind === "mayo") makeKetchupPuddlesPermanent();
        if (livingBosses().length === 0) {
          if (boss.kind === "trio") spawnSpecialSauce();
          else winFight();
        }
      }
      return false;
    }
    return projectile.ttl > 0 && pointInRect(projectile.x, projectile.y, world.arena);
  });
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
  drawPlayerProjectiles();
  drawPlayer();
  drawParticles();
  ctx.restore();
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
  } else {
    drawBurgerBoss();
  }
  ctx.fillStyle = "#f2d087";
  ctx.fillRect(boss.x - 58, boss.y - boss.radius - 24, 116 * (boss.hp / boss.maxHp), 9);
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(boss.name, boss.x, boss.y - boss.radius - 38);
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
    if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob") {
      ctx.fillStyle = hazard.color || (hazard.type === "fry" ? "#f1c15d" : hazard.type === "mustardSeed" ? "#e3bf34" : "#8ad8ff");
      ctx.beginPath();
      if (hazard.type === "fry") {
        ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.8, hazard.r * 0.75, Math.atan2(hazard.vy, hazard.vx), 0, Math.PI * 2);
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
}

function drawPlayerProjectiles() {
  playerProjectiles.forEach((projectile) => {
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    if (projectile.tag === "Magic") {
      ctx.fillStyle = projectile.color;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, projectile.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (projectile.tag === "Ranged") {
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
    } else {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawPlayer() {
  drawRing(player.x, player.y, player.radius + 7, player.dead ? "#c7443b" : "#92d4ff");
  if (playerSprite.complete && playerSprite.naturalWidth > 0) {
    drawPlayerSprite();
  } else {
    drawFallbackPlayer();
  }
  if (player.destination) drawRing(player.destination.x, player.destination.y, 11, "#e9f6df");
}

function drawPlayerSprite() {
  const sprite = cleanedPlayerSprite || playerSprite;
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const frameWidth = sprite.width / 4;
  const frameHeight = sprite.height / 4;
  const frame = player.moving ? Math.floor(player.animationTime * 8) % 4 : 1;
  const row = rows[player.facing] ?? 0;
  const topCrop = player.facing === "up" ? 0.04 : 0.1;
  const crop = {
    x: frameWidth * 0.2,
    y: frameHeight * topCrop,
    w: frameWidth * 0.56,
    h: frameHeight * (0.86 - topCrop),
  };
  const drawWidth = 58;
  const drawHeight = 74;
  ctx.drawImage(
    sprite,
    frame * frameWidth + crop.x,
    row * frameHeight + crop.y,
    crop.w,
    crop.h,
    player.x - drawWidth / 2,
    player.y - drawHeight * 0.66,
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

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const isLightBackground = red > 218 && green > 208 && blue > 190;
    const isGridLine = Math.abs(red - green) < 18 && Math.abs(green - blue) < 18 && red > 180;
    if (isLightBackground || isGridLine) data[i + 3] = 0;
  }

  bufferCtx.putImageData(pixels, 0, 0);
  return buffer;
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

function renderUi() {
  ui.roomText.textContent = player.room === "starter" ? "Starter Room" : player.won ? "Victory" : "Boss Arena";
  ui.hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  ui.hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
  const bossHp = bossHealthSummary();
  ui.bossHpText.textContent = `${Math.ceil(bossHp.hp)}/${bossHp.maxHp}`;
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
  ui.armory.innerHTML = [...Object.values(gear.weapon), ...Object.values(gear.armor)].map((item) => {
    const selected = player.gear[item.slot] && gear[item.slot][player.gear[item.slot]].name === item.name;
    return `<button class="choice ${selected ? "selected" : ""}" data-slot="${item.slot}" data-name="${item.name}"><span>${item.name}</span><small>${item.tag}</small></button>`;
  }).join("");
  ui.bossSelector.querySelectorAll("[data-boss]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.boss === boss.kind);
  });
}

function bossHealthSummary() {
  if (boss.kind !== "trio") return { hp: boss.hp, maxHp: boss.maxHp };
  return {
    hp: condimentBosses.reduce((total, target) => total + Math.max(0, target.hp), 0),
    maxHp: condimentBosses.reduce((total, target) => total + target.maxHp, 0),
  };
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
  setDestination(event.clientX - rect.left + camera.x, event.clientY - rect.top + camera.y);
});

ui.armory.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slot]");
  if (!button) return;
  const slot = button.dataset.slot;
  const entry = Object.entries(gear[slot]).find(([, item]) => item.name === button.dataset.name);
  if (!entry) return;
  equipFromStand({ type: slot, id: entry[0] });
});

ui.bossSelector.addEventListener("click", (event) => {
  const button = event.target.closest("[data-boss]");
  if (!button) return;
  event.preventDefault();
  selectBoss(button.dataset.boss);
});

ui.potionButton.addEventListener("click", drinkPotion);
ui.resetButton.addEventListener("click", () => resetFight(false));
window.addEventListener("resize", resizeCanvas);

loadGame();
applyGear();
resizeCanvas();
renderUi();
requestAnimationFrame(gameLoop);
