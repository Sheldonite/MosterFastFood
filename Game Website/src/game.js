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
let player = createPlayer();
let boss = createBoss();
let hazards = [];
let particles = [];
let camera = { x: 0, y: 0 };
let selectedBoss = false;
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
    room: "starter",
    dead: false,
    won: false,
    gear: { weapon: "ironBlade", armor: "duelistCoat" },
    stats: { damage: 26, range: 54, speed: 250, armor: 2 },
  };
}

function createBoss() {
  return {
    name: "Big Burger",
    x: 1180,
    y: 450,
    radius: 58,
    hp: 600,
    maxHp: 600,
    phase: 1,
    attackTimer: 1.8,
    swingTimer: 1.2,
    enraged: false,
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
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  if (keepPosition) {
    player.x = 705;
    player.y = 455;
  }
  boss = createBoss();
  hazards = [];
  particles = [];
  selectedBoss = false;
  fightStartedAt = 0;
  logLines = ["Fight reset. Cross the gate when ready."];
  showFloat("Fight reset");
}

function startFight() {
  if (fightStartedAt) return;
  fightStartedAt = performance.now();
  log("Boss awakened.");
  ui.status.textContent = "Boss awakened. Click Big Burger to attack.";
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
  if (Math.hypot(boss.x - x, boss.y - y) < boss.radius + 12 && player.room === "arena") {
    selectedBoss = true;
    startFight();
    ui.status.textContent = "Attacking Big Burger.";
    return;
  }
  selectedBoss = false;
  player.destination = constrainToRoom(x, y);
  ui.status.textContent = player.room === "starter" ? "Moving." : "Repositioning.";
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
  if (!player.destination) return;
  const dx = player.destination.x - player.x;
  const dy = player.destination.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) {
    player.destination = null;
    return;
  }
  const step = Math.min(dist, player.stats.speed * dt);
  player.x += (dx / dist) * step;
  player.y += (dy / dist) * step;
}

function updateRoom() {
  if (player.room === "starter" && pointInRect(player.x, player.y, world.gate)) {
    player.room = "arena";
    player.x = world.arena.x + 95;
    player.y = world.arena.y + world.arena.h / 2;
    player.destination = null;
    startFight();
  }
  if (player.room === "arena" && player.x < world.arena.x + 24) {
    player.room = "starter";
    player.x = world.starter.x + world.starter.w - 80;
    player.y = world.starter.y + world.starter.h / 2;
    player.destination = null;
    selectedBoss = false;
    ui.status.textContent = "Back in the starter room.";
  }
}

function updateCombat(dt) {
  if (player.room !== "arena" || player.dead || player.won) return;
  startFight();
  player.attackCooldown -= dt;
  boss.swingTimer -= dt;
  boss.attackTimer -= dt;

  if (boss.hp <= boss.maxHp * 0.55 && boss.phase === 1) {
    boss.phase = 2;
    log("Phase 2: furnace vents opened.");
  }
  if (boss.hp <= boss.maxHp * 0.25 && !boss.enraged) {
    boss.enraged = true;
    log("Big Burger is enraged.");
  }

  if (selectedBoss) autoAttack();
  if (boss.swingTimer <= 0 && distance(player, boss) < boss.radius + 46) {
    damagePlayer(boss.enraged ? 18 : 13, "Crushing swing");
    boss.swingTimer = boss.enraged ? 0.9 : 1.25;
  }
  if (boss.attackTimer <= 0) {
    spawnBossPattern();
    boss.attackTimer = boss.enraged ? 1.25 : boss.phase === 2 ? 1.65 : 2.1;
  }
}

function autoAttack() {
  const range = player.radius + boss.radius + player.stats.range;
  if (distance(player, boss) > range) {
    const angle = Math.atan2(boss.y - player.y, boss.x - player.x);
    player.destination = {
      x: boss.x - Math.cos(angle) * (boss.radius + player.stats.range * 0.7),
      y: boss.y - Math.sin(angle) * (boss.radius + player.stats.range * 0.7),
    };
    player.destination = constrainToRoom(player.destination.x, player.destination.y);
    return;
  }
  if (player.attackCooldown > 0) return;
  const weapon = gear.weapon[player.gear.weapon];
  const variance = 0.78 + Math.random() * 0.44;
  const hit = Math.round(player.stats.damage * variance);
  boss.hp = Math.max(0, boss.hp - hit);
  player.attackCooldown = weapon.speed;
  particles.push({ x: boss.x, y: boss.y - 40, text: `-${hit}`, color: "#ffe08a", ttl: 0.8 });
  if (boss.hp <= 0) winFight();
}

function spawnBossPattern() {
  spawnFloorSlam();
  const pattern = boss.phase === 1 ? Math.random() : Math.random() * 1.2;
  if (pattern < 0.72) {
    const count = boss.enraged ? 14 : boss.phase === 2 ? 11 : 8;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.18;
      hazards.push({
        type: "bolt",
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * (boss.enraged ? 330 : 285),
        vy: Math.sin(angle) * (boss.enraged ? 330 : 285),
        r: 12,
        ttl: 3,
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
    hazard.ttl -= dt;
    if (hazard.type === "bolt") {
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayer(hazard.damage, "Arc bolt");
        hazard.ttl = 0;
      }
    } else {
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && distance(player, hazard) < player.radius + hazard.r) {
        hazard.hit = true;
        damagePlayer(hazard.damage, hazard.type === "slam" ? "Ground slam" : "Furnace vent");
      }
    }
    return hazard.ttl > 0 && pointInRect(hazard.x, hazard.y, world.arena);
  });
}

function damagePlayer(amount, source) {
  const hit = Math.max(1, amount - player.stats.armor);
  player.hp = Math.max(0, player.hp - hit);
  particles.push({ x: player.x, y: player.y - 35, text: `-${hit}`, color: "#ff8f7e", ttl: 0.8 });
  if (player.hp <= 0) {
    player.dead = true;
    selectedBoss = false;
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
  player.won = true;
  selectedBoss = false;
  hazards = [];
  const seconds = fightStartedAt ? Math.max(1, Math.round((performance.now() - fightStartedAt) / 1000)) : 0;
  log(`Victory in ${seconds}s.`);
  ui.status.textContent = "Victory. Reset to test another build.";
  showFloat("Boss defeated");
}

function update(dt) {
  movePlayer(dt);
  updateRoom();
  updateCombat(dt);
  updateHazards(dt);
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

function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawRooms();
  drawStands();
  drawBoss();
  drawHazards();
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
  if (boss.hp <= 0) return;
  if (selectedBoss) drawRing(boss.x, boss.y, boss.radius + 12, "#ffe082");
  ctx.fillStyle = boss.enraged ? "#b94835" : "#a76e3e";
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#312923";
  ctx.fillRect(boss.x - 42, boss.y - 20, 84, 60);
  ctx.fillStyle = "#f2d087";
  ctx.fillRect(boss.x - 58, boss.y - boss.radius - 24, 116 * (boss.hp / boss.maxHp), 9);
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(boss.name, boss.x, boss.y - boss.radius - 38);
  ctx.textAlign = "left";
}

function drawHazards() {
  hazards.forEach((hazard) => {
    if (hazard.type === "bolt") {
      ctx.fillStyle = "#8ad8ff";
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
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

function drawPlayer() {
  drawRing(player.x, player.y, player.radius + 7, player.dead ? "#c7443b" : "#92d4ff");
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
  if (player.destination) drawRing(player.destination.x, player.destination.y, 11, "#e9f6df");
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
  ui.bossHpText.textContent = `${Math.ceil(boss.hp)}/${boss.maxHp}`;
  ui.bossHpBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
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

ui.potionButton.addEventListener("click", drinkPotion);
ui.resetButton.addEventListener("click", () => resetFight(false));
window.addEventListener("resize", resizeCanvas);

loadGame();
applyGear();
resizeCanvas();
renderUi();
requestAnimationFrame(gameLoop);
