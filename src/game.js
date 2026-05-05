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
  menuOverlay: document.querySelector("#menuOverlay"),
  mainMenu: document.querySelector("#mainMenu"),
  multiplayerMenu: document.querySelector("#multiplayerMenu"),
  roomLobby: document.querySelector("#roomLobby"),
  devMenu: document.querySelector("#devMenu"),
  singlePlayerButton: document.querySelector("#singlePlayerButton"),
  multiplayerButton: document.querySelector("#multiplayerButton"),
  devTestButton: document.querySelector("#devTestButton"),
  backFromDevButton: document.querySelector("#backFromDevButton"),
  devPasswordInput: document.querySelector("#devPasswordInput"),
  startDevButton: document.querySelector("#startDevButton"),
  devStatus: document.querySelector("#devStatus"),
  backToMainButton: document.querySelector("#backToMainButton"),
  playerNameInput: document.querySelector("#playerNameInput"),
  roomNameInput: document.querySelector("#roomNameInput"),
  createRoomButton: document.querySelector("#createRoomButton"),
  refreshRoomsButton: document.querySelector("#refreshRoomsButton"),
  roomList: document.querySelector("#roomList"),
  multiplayerStatus: document.querySelector("#multiplayerStatus"),
  lobbyTitle: document.querySelector("#lobbyTitle"),
  lobbyPlayers: document.querySelector("#lobbyPlayers"),
  lobbyBossSelector: document.querySelector("#lobbyBossSelector"),
  readyButton: document.querySelector("#readyButton"),
  startRoomButton: document.querySelector("#startRoomButton"),
  leaveRoomButton: document.querySelector("#leaveRoomButton"),
  lobbyStatus: document.querySelector("#lobbyStatus"),
  armory: document.querySelector("#armory"),
  classSelector: document.querySelector("#classSelector"),
  classMenuButton: document.querySelector("#classMenuButton"),
  classMenuOverlay: document.querySelector("#classMenuOverlay"),
  classMenuClose: document.querySelector("#classMenuClose"),
  armorSelector: document.querySelector("#armorSelector"),
  armorMenuButton: document.querySelector("#armorMenuButton"),
  armorMenuOverlay: document.querySelector("#armorMenuOverlay"),
  armorMenuClose: document.querySelector("#armorMenuClose"),
  skillsButton: document.querySelector("#skillsButton"),
  talentMenuOverlay: document.querySelector("#talentMenuOverlay"),
  talentMenuClose: document.querySelector("#talentMenuClose"),
  talentMenuTitle: document.querySelector("#talentMenuTitle"),
  talentMenuPoints: document.querySelector("#talentMenuPoints"),
  talentTree: document.querySelector("#talentTree"),
  bossSelector: document.querySelector("#bossSelector"),
  bossTestPanel: document.querySelector("#bossTestPanel"),
  bossMenuButton: document.querySelector("#bossMenuButton"),
  bossMenuOverlay: document.querySelector("#bossMenuOverlay"),
  bossMenuClose: document.querySelector("#bossMenuClose"),
  floatText: document.querySelector("#floatText"),
  potionButton: document.querySelector("#potionButton"),
  resetButton: document.querySelector("#resetButton"),
  deathScreen: document.querySelector("#deathScreen"),
  deathResetButton: document.querySelector("#deathResetButton"),
  mazeRewardOverlay: document.querySelector("#mazeRewardOverlay"),
  mazeRewardTitle: document.querySelector("#mazeRewardTitle"),
  mazeRewardCards: document.querySelector("#mazeRewardCards"),
};

const lockedBosses = new Set();

const world = {
  width: 1680,
  height: 900,
  wall: 36,
  starter: { x: 80, y: 120, w: 560, h: 660 },
  arena: { x: 760, y: 90, w: 820, h: 720 },
  maze: { x: 760, y: 90, w: 820, h: 720 },
  gate: { x: 610, y: 390, w: 150, h: 130 },
};

const gear = {
  weapon: {
    ironBlade: { slot: "weapon", name: "Sword", tag: "Warrior", damage: 46, range: 54, speed: 1.05, moveSpeedBonus: 30, color: "#d8d1c4" },
    emberBow: { slot: "weapon", name: "Bow", tag: "Ranged", damage: 27, range: 230, speed: 0.78, color: "#e0a14e" },
    pulseStaff: { slot: "weapon", name: "Staff", tag: "Magic", damage: 46, range: 170, speed: 1.55, color: "#8ec7ff" },
    shadowDaggers: { slot: "weapon", name: "Daggers", tag: "Rogue", damage: 32, range: 82, speed: 0.62, moveSpeedBonus: 36, color: "#9be06f" },
    dawnHammer: { slot: "weapon", name: "Dawn Hammer", tag: "Paladin", damage: 38, range: 74, speed: 1.08, moveSpeedBonus: 10, color: "#f0d47c" },
  },
  armor: {
    duelistCoat: { slot: "armor", name: "Light Armor", tag: "Light", armor: 2, maxHp: 115, speed: 250, color: "#557d61" },
    bulwarkPlate: { slot: "armor", name: "Heavy Armor", tag: "Tank", armor: 8, maxHp: 160, speed: 195, color: "#8d8f92" },
    channelerRobe: { slot: "armor", name: "Mage Armor", tag: "Glass", armor: 0, maxHp: 75, speed: 270, damageMultiplier: 1.5, color: "#6f75b8" },
  },
};

const classOptions = [
  { id: "warrior", name: "Warrior", weapon: "ironBlade", tag: "Melee", note: "Close control" },
  { id: "ranger", name: "Ranger", weapon: "emberBow", tag: "Ranged", note: "Safe pressure" },
  { id: "mage", name: "Mage", weapon: "pulseStaff", tag: "Magic", note: "Burst spells" },
  { id: "rogue", name: "Rogue", weapon: "shadowDaggers", tag: "Rogue", note: "Fast poison" },
  { id: "paladin", name: "Paladin", weapon: "dawnHammer", tag: "Holy", note: "Wards and AoE" },
  { id: "priest", name: "Priest", tag: "Soon", note: "Locked", locked: true },
  { id: "warlock", name: "Warlock", tag: "Soon", note: "Locked", locked: true },
  { id: "druid", name: "Druid", tag: "Soon", note: "Locked", locked: true },
  { id: "gunslinger", name: "Gunslinger", tag: "Soon", note: "Locked", locked: true },
  { id: "amazon", name: "Amazon", tag: "Soon", note: "Locked", locked: true },
];

const bossTestOptions = [
  { id: "cola", name: "Big Cola" },
  { id: "burger", name: "Big Burger" },
  { id: "fries", name: "Curly Fries" },
  { id: "trio", name: "Condiment Trio" },
  { id: "sauce", name: "Special Sauce" },
  { id: "shake", name: "Peanut Buster Shake" },
  { id: "nacho", name: "Nacho Libre" },
  { id: "pizza", name: "Pizza Phantom" },
  { id: "taco", name: "Taco Titan" },
  { id: "donut", name: "Donut Donald" },
  { id: "sushi", name: "Sushi Serpent" },
];

const progressionBosses = ["cola", "burger", "fries", "trio", "shake", "nacho", "pizza", "donut", "taco", "sushi"];

const mazeThemes = {
  cola: { name: "Fizzworks", floor: "#18313a", wall: "#2f5260", trim: "#b9f4ff", enemy: "#7ed8ef", mini: "#b9f4ff", decor: "#5fc5e6" },
  burger: { name: "Grill Pit", floor: "#30251f", wall: "#65402b", trim: "#e0a14e", enemy: "#a76e3e", mini: "#e0a14e", decor: "#ff7044" },
  fries: { name: "Fryer Lanes", floor: "#342e1c", wall: "#725b24", trim: "#f0c95d", enemy: "#d9aa4f", mini: "#ffd76a", decor: "#f0c95d" },
  trio: { name: "Condiment Pantry", floor: "#2f2528", wall: "#5e3334", trim: "#f7efd9", enemy: "#cf3b2f", mini: "#e3bf34", decor: "#f3ead2" },
  sauce: { name: "Sauce Cellar", floor: "#2c1e24", wall: "#67343b", trim: "#f0d47c", enemy: "#cf3b2f", mini: "#f3ead2", decor: "#e3bf34" },
  shake: { name: "Freezer Lab", floor: "#1e2b36", wall: "#35546a", trim: "#bafcff", enemy: "#8ec7ff", mini: "#ffd7e8", decor: "#f7efd9" },
  nacho: { name: "Nacho Arena", floor: "#332613", wall: "#73521d", trim: "#ffda6b", enemy: "#d9aa4f", mini: "#f0c35b", decor: "#6fbf55" },
  pizza: { name: "Pizza Parlor", floor: "#301f1c", wall: "#6b351f", trim: "#ffd76a", enemy: "#b93a2f", mini: "#ff7044", decor: "#f7e28b" },
  donut: { name: "Donut Bakery", floor: "#332334", wall: "#6b3c57", trim: "#ff9fc8", enemy: "#ff79aa", mini: "#ffd7e8", decor: "#8ec7ff" },
  taco: { name: "Taco Foundry", floor: "#2d2418", wall: "#75572b", trim: "#f0d47c", enemy: "#6fbf55", mini: "#ff7044", decor: "#e3bf34" },
  sushi: { name: "Sushi Canal", floor: "#17292a", wall: "#30504c", trim: "#b7e7d9", enemy: "#7ab9a8", mini: "#f7efd9", decor: "#563a2f" },
};

const mazeRewardPool = [
  { id: "damage", name: "Sharper Strikes", description: "+8% damage for this run.", values: { damageMultiplier: 0.08 } },
  { id: "speed", name: "Quick Feet", description: "+10% move speed for this run.", values: { speedMultiplier: 0.1 } },
  { id: "hp", name: "Heartier Build", description: "+15 maximum health for this run.", values: { maxHp: 15 } },
  { id: "armor", name: "Extra Plating", description: "+1 armor for this run.", values: { armor: 1 } },
  { id: "attackSpeed", name: "Fast Hands", description: "+8% basic attack speed for this run.", values: { attackSpeed: 0.08 } },
  { id: "potion", name: "Spare Flask", description: "+1 potion now, up to 4.", values: { potion: 1 } },
  { id: "cooldown", name: "Clear Focus", description: "+10% ability cooldown recovery for this run.", values: { cooldownRecovery: 0.1 } },
];

const mazeWallThickness = 8;
const mazePlayerWallPadding = 8;

const combatTuning = {
  incomingDamageMultiplier: 1.74,
  overlapDamageWindowMs: 360,
  overlapDamageMultiplier: 0.62,
  bossAttackIntervalMultiplier: 0.92,
  globalBossHealthMultiplier: 3,
  bossHealthMultipliers: {
    cola: 1.5,
    burger: 1.55,
    fries: 1.5,
    trio: 1.5,
    sauce: 1.65,
    shake: 1.7,
    nacho: 1.58,
    pizza: 1.62,
    donut: 1.9,
    taco: 5.8,
    sushi: 1.58,
  },
  attackIntervals: {
    burger: { base: 2.08, phase2: 1.66, enraged: 1.3 },
    fries: { base: 1.58, phase2: 1.3, enraged: 1.2 },
    cola: { base: 1.62, phase2: 1.3, enraged: 1.06 },
    shake: { base: 1.34, phase2: 1.16, phase3: 0.98, enraged: 0.84 },
    pizza: { base: 1.78, phase2: 1.46, phase3: 1.26, enraged: 1.06 },
    donut: { base: 1.5, holes: 1.18, enraged: 0.98 },
  },
  phaseDelay: {
    short: 0.85,
    medium: 1.15,
  },
  donut: {
    gauntletDuration: 30,
    gauntletEarlySpawn: 2.25,
    gauntletLateSpawn: 1.62,
    glazeFinalStagger: 0.96,
    glazeNormalStagger: 0.56,
  },
};

const abilityLoadouts = {
  melee: [
    { key: "Q", name: "Shield Bash", cooldown: 4.5 },
    { key: "E", name: "Groundbreaker", cooldown: 10 },
    { key: "Space", name: "Whirlwind Dash", cooldown: 8 },
    { key: "R", name: "Shield Wall", cooldown: 15 },
  ],
  ranger: [
    { key: "Q", name: "Marked Shot", cooldown: 7 },
    { key: "E", name: "Arrow Storm", cooldown: 12 },
    { key: "Space", name: "Tumble Shot", cooldown: 9 },
    { key: "R", name: "Volley Trap", cooldown: 16 },
  ],
  mage: [
    { key: "Q", name: "Fire Blast", cooldown: 6 },
    { key: "E", name: "Meteor Field", cooldown: 13 },
    { key: "Space", name: "Blink Step", cooldown: 10 },
    { key: "R", name: "Time Warp", cooldown: 18 },
  ],
  rogue: [
    { key: "Q", name: "Backstab", cooldown: 6 },
    { key: "E", name: "Poison Cloud", cooldown: 11 },
    { key: "Space", name: "Shadow Step", cooldown: 8 },
    { key: "R", name: "Smoke Bomb", cooldown: 16 },
  ],
  paladin: [
    { key: "Q", name: "Radiant Smite", cooldown: 5.5 },
    { key: "E", name: "Consecration", cooldown: 12 },
    { key: "Space", name: "Aegis Step", cooldown: 9 },
    { key: "R", name: "Divine Bulwark", cooldown: 16 },
  ],
};

const talentClassNames = {
  melee: "Warrior",
  ranger: "Ranger",
  mage: "Mage",
  rogue: "Rogue",
  paladin: "Paladin",
};

function buildTalentBranch(classKey, branch, column, nodes) {
  return nodes.map((node, row) => ({
    id: node.id,
    classKey,
    branch,
    row,
    column,
    name: node.name,
    description: node.description,
    type: node.type || (row === nodes.length - 1 ? "capstone" : row === 0 ? "minor" : "major"),
    parents: row === 0 ? [] : [nodes[row - 1].id],
    effect: node.effect,
  }));
}

const talentDefinitions = [
  ...buildTalentBranch("melee", "Iron Wall", 0, [
    { id: "melee_iron_hp", name: "Iron Stomach", description: "+25 maximum health.", effect: "+25 HP" },
    { id: "melee_iron_wall", name: "Reinforced Guard", description: "Shield Wall lasts longer and blocks more damage.", effect: "Better Shield Wall" },
    { id: "melee_iron_heal", name: "Deflecting Bite", description: "Shield Bash heals when it blocks projectiles.", effect: "Block heal" },
    { id: "melee_iron_last", name: "Last Stand", description: "Once per fight, survive lethal damage and gain Shield Wall.", type: "capstone", effect: "Cheat death" },
  ]),
  ...buildTalentBranch("melee", "Bloodblade", 1, [
    { id: "melee_blood_bleed", name: "Serrated Edge", description: "Basic attacks apply bleed.", effect: "Bleed basics" },
    { id: "melee_blood_deep", name: "Deep Cuts", description: "Bleeds last longer and tick harder.", effect: "Stronger bleed" },
    { id: "melee_blood_whirl", name: "Red Whirl", description: "Whirlwind Dash applies bleed.", effect: "Dash bleed" },
    { id: "melee_blood_hemo", name: "Hemorrhage", description: "Groundbreaker bursts bleeding targets for bonus damage.", type: "capstone", effect: "Bleed burst" },
  ]),
  ...buildTalentBranch("melee", "Earthbreaker", 2, [
    { id: "melee_earth_radius", name: "Wider Quake", description: "Groundbreaker radius is larger.", effect: "+Radius" },
    { id: "melee_earth_after", name: "Aftershock", description: "Groundbreaker hits a second time after a short delay.", effect: "Aftershock" },
    { id: "melee_earth_bash", name: "Shock Bash", description: "Shield Bash reaches farther and hits harder.", effect: "Bigger bash" },
    { id: "melee_earth_cap", name: "Earthsplitter", description: "Groundbreaker destroys nearby small projectiles.", type: "capstone", effect: "Projectile clear" },
  ]),
  ...buildTalentBranch("ranger", "Deadeye", 0, [
    { id: "ranger_deadeye_mark", name: "Long Mark", description: "Marked Shot grants more marked hits.", effect: "+Marked hits" },
    { id: "ranger_deadeye_damage", name: "Clean Angle", description: "Marked basic shots deal more damage.", effect: "+Marked damage" },
    { id: "ranger_deadeye_tumble", name: "Snap Aim", description: "Tumble Shot empowers your next basic attack.", effect: "Tumble buff" },
    { id: "ranger_deadeye_cap", name: "Perfect Mark", description: "Marked Shot marks longer and enables bigger damage windows.", type: "capstone", effect: "Longer mark" },
  ]),
  ...buildTalentBranch("ranger", "Trapmaster", 1, [
    { id: "ranger_trap_size", name: "Wide Net", description: "Volley Trap trigger radius is larger.", effect: "+Trap size" },
    { id: "ranger_trap_tumble", name: "Pocket Trap", description: "Tumble Shot drops a short-lived mini trap.", effect: "Tumble trap" },
    { id: "ranger_trap_damage", name: "Barbed Springs", description: "Volley Trap shots hit harder.", effect: "+Trap damage" },
    { id: "ranger_trap_cap", name: "Kill Zone", description: "Volley Trap fires more shots and refreshes faster.", type: "capstone", effect: "More trap shots" },
  ]),
  ...buildTalentBranch("ranger", "Arrow Storm", 2, [
    { id: "ranger_storm_radius", name: "Broad Storm", description: "Arrow Storm radius is larger.", effect: "+Storm size" },
    { id: "ranger_storm_pulses", name: "Rapid Rain", description: "Arrow Storm pulses more often.", effect: "Faster pulses" },
    { id: "ranger_storm_duration", name: "Lingering Clouds", description: "Arrow Storm lasts longer.", effect: "+Duration" },
    { id: "ranger_storm_cap", name: "Skyfall", description: "Arrow Storm hits much harder.", type: "capstone", effect: "+Storm damage" },
  ]),
  ...buildTalentBranch("mage", "Pyromancer", 0, [
    { id: "mage_pyro_radius", name: "Hotter Blast", description: "Fire Blast explosion radius is larger.", effect: "+Blast size" },
    { id: "mage_pyro_burn", name: "Scorch", description: "Fire Blast burns enemies over time.", effect: "Burn" },
    { id: "mage_pyro_damage", name: "Combustion", description: "Fire Blast deals more damage.", effect: "+Blast damage" },
    { id: "mage_pyro_cap", name: "Inferno Core", description: "Fire Blast becomes a huge, high-damage explosion.", type: "capstone", effect: "Huge blast" },
  ]),
  ...buildTalentBranch("mage", "Meteor Savant", 1, [
    { id: "mage_meteor_radius", name: "Wide Field", description: "Meteor Field radius is larger.", effect: "+Meteor size" },
    { id: "mage_meteor_speed", name: "Falling Stars", description: "Meteor Field impacts more often.", effect: "Faster meteors" },
    { id: "mage_meteor_duration", name: "Molten Sky", description: "Meteor Field lasts longer.", effect: "+Duration" },
    { id: "mage_meteor_cap", name: "Cataclysm", description: "Meteor impacts are larger and hit harder.", type: "capstone", effect: "Big meteors" },
  ]),
  ...buildTalentBranch("mage", "Chronomancer", 2, [
    { id: "mage_chrono_duration", name: "Long Warp", description: "Time Warp lasts longer.", effect: "+Warp time" },
    { id: "mage_chrono_radius", name: "Wide Warp", description: "Time Warp radius is larger.", effect: "+Warp size" },
    { id: "mage_chrono_blink", name: "Echo Rune", description: "Blink Rune is larger and stronger.", effect: "+Blink rune" },
    { id: "mage_chrono_cap", name: "Time Loop", description: "Once per fight, lethal damage rewinds into a heal.", type: "capstone", effect: "Cheat death" },
  ]),
  ...buildTalentBranch("rogue", "Venomancer", 0, [
    { id: "rogue_venom_stacks", name: "Toxic Edge", description: "Poison can stack higher.", effect: "+Poison stacks" },
    { id: "rogue_venom_damage", name: "Vile Dose", description: "Poison ticks harder.", effect: "+Poison damage" },
    { id: "rogue_venom_cloud", name: "Spreading Cloud", description: "Poison Cloud is larger and lasts longer.", effect: "+Cloud" },
    { id: "rogue_venom_cap", name: "Venom Nova", description: "Max poison stacks burst for bonus damage.", type: "capstone", effect: "Poison burst" },
  ]),
  ...buildTalentBranch("rogue", "Shadow Duelist", 1, [
    { id: "rogue_shadow_backstab", name: "Dirty Knife", description: "Backstab hits harder.", effect: "+Backstab" },
    { id: "rogue_shadow_exposed", name: "Deep Expose", description: "Exposed stacks last longer.", effect: "+Expose time" },
    { id: "rogue_shadow_step", name: "Long Shadow", description: "Shadow Step keeps Backstab ready longer.", effect: "+Backstab window" },
    { id: "rogue_shadow_cap", name: "Deathblow", description: "Empowered Backstab consumes Exposed for bonus damage.", type: "capstone", effect: "Execute burst" },
  ]),
  ...buildTalentBranch("rogue", "Smoke Trickster", 2, [
    { id: "rogue_smoke_size", name: "Heavy Smoke", description: "Smoke Bomb radius is larger.", effect: "+Smoke size" },
    { id: "rogue_smoke_duration", name: "Lingering Cover", description: "Smoke Bomb lasts longer.", effect: "+Duration" },
    { id: "rogue_smoke_poison", name: "Noxious Cover", description: "Smoke Bomb poisons enemies inside it.", effect: "Poison smoke" },
    { id: "rogue_smoke_cap", name: "Blackout", description: "Smoke Bomb clears small projectiles when dropped.", type: "capstone", effect: "Projectile clear" },
  ]),
  ...buildTalentBranch("paladin", "Consecrated Ground", 0, [
    { id: "paladin_consecrate_size", name: "Wider Light", description: "Consecration radius is larger.", effect: "+Consecration size" },
    { id: "paladin_consecrate_duration", name: "Lasting Prayer", description: "Consecration lasts longer.", effect: "+Duration" },
    { id: "paladin_consecrate_damage", name: "Holy Burn", description: "Consecration deals more damage.", effect: "+Holy damage" },
    { id: "paladin_consecrate_cap", name: "Divine Domain", description: "Abilities recover faster while you stand in Consecration.", type: "capstone", effect: "Cooldown haste" },
  ]),
  ...buildTalentBranch("paladin", "Guardian", 1, [
    { id: "paladin_guard_heal", name: "Mercy Ward", description: "Divine Bulwark heals more.", effect: "+Bulwark heal" },
    { id: "paladin_guard_mitigation", name: "Blessed Plate", description: "Shield Wall and Bulwark reduce more damage.", effect: "+Mitigation" },
    { id: "paladin_guard_projectiles", name: "Projectile Ward", description: "Divine Bulwark clears nearby projectiles.", effect: "Projectile clear" },
    { id: "paladin_guard_cap", name: "Unfallen", description: "Once per fight, survive lethal damage and gain Bulwark.", type: "capstone", effect: "Cheat death" },
  ]),
  ...buildTalentBranch("paladin", "Judgment", 2, [
    { id: "paladin_judgment_damage", name: "Sharp Judgment", description: "Radiant Smite hits harder.", effect: "+Smite damage" },
    { id: "paladin_judgment_radius", name: "Wide Verdict", description: "Radiant Smite radius is larger.", effect: "+Smite size" },
    { id: "paladin_judgment_mark", name: "Marked Guilty", description: "Radiant Smite marks enemies to take more damage.", effect: "Judgment mark" },
    { id: "paladin_judgment_cap", name: "Final Judgment", description: "Radiant Smite bursts marked enemies for bonus damage.", type: "capstone", effect: "Judgment burst" },
  ]),
];

const talentById = new Map(talentDefinitions.map((talent) => [talent.id, talent]));

const stands = [
  { x: 165, y: 270, type: "weapon", id: "ironBlade" },
  { x: 285, y: 270, type: "weapon", id: "emberBow" },
  { x: 405, y: 270, type: "weapon", id: "pulseStaff" },
  { x: 525, y: 270, type: "weapon", id: "shadowDaggers" },
  { x: 585, y: 395, type: "weapon", id: "dawnHammer" },
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
let trainingDummy = createTrainingDummy();
let condimentBosses = [];
let mazeState = null;
let hazards = [];
let playerProjectiles = [];
let remoteProjectiles = [];
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
let screenBanner = null;
let fightStartedAt = 0;
let lastTime = performance.now();
let logLines = ["Choose gear, use WASD to cross the gate, click to shoot."];
let classSelectorSignature = "";
let armorSelectorSignature = "";
let bossSelectorSignature = "";
let talentTreeSignature = "";
let lastCanvasPointerAttackAt = 0;
const multiplayer = {
  socket: null,
  id: null,
  mode: "menu",
  connected: false,
  everConnected: false,
  enabled: false,
  count: 1,
  rooms: [],
  room: null,
  ready: false,
  pendingStart: null,
  startAt: 0,
  assignedSpawn: null,
  partyPhase: "starter",
  phaseSeq: 0,
  localPartyReady: null,
  partyReady: new Map(),
  gauntletSyncSeq: 0,
  lastGauntletSyncSeq: 0,
  gauntletSyncTimer: 0,
  sendTimer: 0,
  reconnectTimer: 0,
  reconnectDelay: 3,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
  attackSeq: 0,
  bossSyncSeq: 0,
  hazardSyncSeq: 0,
  particleSyncSeq: 0,
  lastBossSyncSeq: 0,
  peers: new Map(),
};

const runState = {
  mode: "menu",
  active: false,
  buildLocked: false,
  devUnlocked: false,
  talentPoints: 0,
  learnedTalents: new Set(),
  lockedTalentClass: null,
  mazeCount: 0,
  mazeBuffs: {},
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
    abilityCooldowns: [0, 0, 0, 0],
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
    deadeyeTimer: 0,
    smokeSpeedGranted: false,
    tumbleTimer: 0,
    invulnerableTimer: 0,
    shieldWallTimer: 0,
    consecrationTimer: 0,
    guardSpeedTimer: 0,
    tacoGreaseTimer: 0,
    gateCooldown: 0,
    room: "starter",
    dead: false,
    won: false,
    freezeTimer: 0,
    lastDamageAt: 0,
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
    talentSaves: {},
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
    taco: {
      kind: "taco",
      name: "Taco Titan",
      radius: 76,
      maxHp: 1850,
      color: "#d29a38",
      enrageColor: "#f05b32",
      attackTimer: 1.2,
      swingTimer: 1.05,
    },
    donut: {
      kind: "donut",
      name: "Donut Donald",
      radius: 70,
      maxHp: 1650,
      color: "#d88a55",
      enrageColor: "#ff79aa",
      attackTimer: 1.15,
      swingTimer: 1.2,
    },
    sushi: {
      kind: "sushi",
      name: "Sushi Serpent",
      radius: 58,
      maxHp: 1900,
      color: "#f1ead7",
      enrageColor: "#7ac46d",
      attackTimer: 1.25,
      swingTimer: 1.2,
    },
  };
  const template = bosses[kind];
  const scaledMaxHp = scaledBossHp(kind, template.maxHp);
  const createdBoss = {
    ...template,
    maxHp: scaledMaxHp,
    x: 1180,
    y: 450,
    hp: scaledMaxHp,
    phase: 1,
    totalPhases: kind === "donut" ? 6 : kind === "shake" || kind === "nacho" || kind === "pizza" || kind === "taco" || kind === "sushi" ? 3 : 1,
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
    donutHoles: [],
    donutMinions: [],
    donutGauntletActive: false,
    donutGauntletCompleted: false,
    donutGauntletTimer: 0,
    donutGauntletSpawnTimer: 0,
    glazeRingLockTimer: 0,
    napkinZone: null,
    napkinCooldownTimer: 0,
    napkinUses: 0,
    shellGuardActive: kind === "taco",
    shellCrackStacks: 0,
    exposedFillingTimer: 0,
    tacoPuzzleStep: 0,
    tacoPuzzleTimer: 0,
    tacoPuzzleResolveTimer: 0,
    tacoPuzzleActive: false,
    tacoPuzzleFailed: false,
    tacoPuzzleProgress: false,
    tacoIngredientQueue: [],
    tacoCurrentIngredient: null,
    tacoComboSolved: false,
    tacoFloodCountdown: 0,
    tacoCycleCount: 0,
    tacoObjectiveText: "",
    tacoFinalFeastAnnounced: false,
    serpentAngle: 0,
    serpentHeading: 0,
    serpentTrail: [],
    serpentBody: [],
    serpentWeakIndex: 2,
    serpentWeakTimer: 3.2,
    whirlpoolTimer: 0,
    sugarRushTimer: 0,
    napkinTimer: 0,
  };
  if (kind === "sushi") initializeSushiTrail(createdBoss);
  return createdBoss;
}

function scaledBossHp(kind, baseHp) {
  const multiplier = combatTuning.bossHealthMultipliers[kind] || 1;
  return Math.round(baseHp * multiplier * combatTuning.globalBossHealthMultiplier);
}

function createTrainingDummy() {
  return {
    kind: "trainingDummy",
    name: "Training Dummy",
    x: world.starter.x + world.starter.w - 255,
    y: world.starter.y + world.starter.h - 96,
    radius: 34,
    hp: 1200,
    maxHp: 1200,
    shieldTimer: 0,
    markedTimer: 0,
    markedShots: 0,
    poisonStacks: 0,
    poisonTimer: 0,
    poisonTickTimer: 0,
    exposedStacks: 0,
    exposedTimer: 0,
    damageTotal: 0,
    dpsWindowStart: 0,
    lastHitAt: 0,
    lastDamage: 0,
  };
}

function initializeSushiTrail(targetBoss) {
  targetBoss.serpentHeading = Math.PI;
  targetBoss.serpentAngle = Math.PI;
  const count = targetBoss.phase >= 3 ? 9 : targetBoss.phase >= 2 ? 7 : 6;
  const spacing = sushiSegmentSpacing();
  targetBoss.serpentBody = [];
  for (let i = 0; i < count; i += 1) {
    targetBoss.serpentBody.push({
      x: targetBoss.x - Math.cos(targetBoss.serpentHeading) * i * spacing,
      y: targetBoss.y - Math.sin(targetBoss.serpentHeading) * i * spacing + Math.sin(i * 0.75) * 10,
      heading: targetBoss.serpentHeading,
    });
  }
  const maxTrail = count * 12 + 20;
  targetBoss.serpentTrail = [];
  for (let i = 0; i < maxTrail; i += 1) {
    const wiggle = Math.sin(i * 0.24) * 18;
    targetBoss.serpentTrail.push({
      x: targetBoss.x - i * 7,
      y: targetBoss.y + wiggle,
      heading: Math.PI,
    });
  }
}

function createCondimentBosses() {
  return [
    createCondiment("ketchup", "Ketchup", 1045, 330, "#cf3b2f", 260, 1.55),
    createCondiment("mustard", "Mustard", 1305, 450, "#e3bf34", 230, 1.1),
    createCondiment("mayo", "Mayo", 1055, 610, "#f3ead2", 220, 3.7),
  ];
}

function createCondiment(kind, name, x, y, color, maxHp, attackTimer) {
  const scaledMaxHp = scaledBossHp("trio", maxHp);
  return {
    kind,
    name,
    x,
    y,
    radius: 34,
    hp: scaledMaxHp,
    maxHp: scaledMaxHp,
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

function resetRunTalents() {
  runState.talentPoints = 0;
  runState.learnedTalents = new Set();
  runState.lockedTalentClass = null;
  runState.mazeCount = 0;
  runState.mazeBuffs = {};
  talentTreeSignature = "";
}

function activeTalentClass() {
  return runState.lockedTalentClass || currentClassKey();
}

function talentsForActiveClass() {
  return talentDefinitions.filter((talent) => talent.classKey === activeTalentClass());
}

function hasTalent(talentId) {
  return runState.learnedTalents?.has(talentId);
}

function canLearnTalent(talentId) {
  const talent = talentById.get(talentId);
  if (!talent || talent.classKey !== activeTalentClass()) return false;
  if (hasTalent(talentId) || runState.talentPoints <= 0) return false;
  return talent.parents.every((parentId) => hasTalent(parentId));
}

function learnTalent(talentId) {
  if (!canLearnTalent(talentId)) return false;
  const oldMaxHp = player.maxHp;
  runState.learnedTalents.add(talentId);
  runState.talentPoints -= 1;
  applyTalentEffects(oldMaxHp);
  talentTreeSignature = "";
  const talent = talentById.get(talentId);
  showFloat(talent ? talent.name : "Talent learned");
  return true;
}

function grantTalentPoints(amount, sourceBossName = "Boss") {
  if (!runState.active) return;
  runState.talentPoints += amount;
  talentTreeSignature = "";
  ui.status.textContent = `${sourceBossName} defeated. +${amount} Talent Points.`;
  showFloat(`+${amount} Talent Points`);
}

function applyTalentEffects(oldMaxHp = player.maxHp) {
  applyGear();
  if (player.maxHp > oldMaxHp) {
    player.hp = Math.min(player.maxHp, player.hp + player.maxHp - oldMaxHp);
  }
}

function talentMaxHpBonus() {
  return hasTalent("melee_iron_hp") ? 25 : 0;
}

function talentAbilityCooldownMultiplier(index) {
  let multiplier = playerInTimeWarp() ? 0.5 : 1;
  if (hasTalent("ranger_trap_cap") && index === 3) multiplier *= 0.8;
  if (hasTalent("paladin_consecrate_cap") && player.consecrationTimer > 0) multiplier *= 0.85;
  multiplier *= 1 - (runState.mazeBuffs.cooldownRecovery || 0);
  return multiplier;
}

function destroyProjectilesInRadius(x, y, radius) {
  let cleared = 0;
  hazards = hazards.filter((hazard) => {
    if (!hazard.r || hazard.r > 14 || !Number.isFinite(hazard.ttl)) return true;
    if (distance({ x, y }, hazard) > radius + hazard.r) return true;
    cleared += 1;
    particles.push({ x: hazard.x, y: hazard.y - 10, text: "cleared", color: "#fff4c4", ttl: 0.45 });
    return false;
  });
  return cleared;
}

function applyGear() {
  if (!gear.weapon[player.gear.weapon]) player.gear.weapon = "ironBlade";
  if (!gear.armor[player.gear.armor]) player.gear.armor = "duelistCoat";
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  const rogueArmorBonus = weapon.tag === "Rogue" ? 2 : 0;
  const warriorArmorBonus = isWarriorTag(weapon.tag) ? 4 : 0;
  player.stats = {
    damage: Math.round(weapon.damage * (armor.damageMultiplier || 1) * (1 + (runState.mazeBuffs.damageMultiplier || 0))),
    range: weapon.range,
    speed: Math.round((armor.speed + (weapon.moveSpeedBonus || 0)) * (1 + (runState.mazeBuffs.speedMultiplier || 0))),
    armor: armor.armor + rogueArmorBonus + warriorArmorBonus + (runState.mazeBuffs.armor || 0),
  };
  const hpPercent = player.hp / player.maxHp || 1;
  player.maxHp = armor.maxHp + talentMaxHpBonus() + (runState.mazeBuffs.maxHp || 0);
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
  const bossKind = lockedBosses.has(boss.kind) ? "cola" : boss.kind;
  resetRunTalents();
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  resetTrainingDummy();
  if (keepPosition) {
    player.x = 705;
    player.y = 455;
  }
  mouseWorld = { x: player.x + player.lastMoveX * 120, y: player.y + player.lastMoveY * 120 };
  boss = createBoss(bossKind);
  if (boss.kind === "taco" || boss.kind === "donut" || boss.kind === "sushi") boss.attackTimer = 2.4;
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  hazards = [];
  playerProjectiles = [];
  remoteProjectiles = [];
  abilityEffects = [];
  particles = [];
  selectedBoss = null;
  clearMazeState();
  fightStartedAt = 0;
  screenBanner = null;
  logLines = ["Fight reset. Use WASD to cross the gate when ready."];
  showFloat("Fight reset");
}

function clearEncounterState() {
  hazards = [];
  playerProjectiles = [];
  remoteProjectiles = [];
  abilityEffects = [];
  particles = [];
  selectedBoss = null;
  fightStartedAt = 0;
}

function clearMazeState() {
  mazeState = null;
  if (ui.mazeRewardOverlay) ui.mazeRewardOverlay.hidden = true;
}

function showScreenBanner(title, subtitle = "", tone = "neutral", duration = 2.4) {
  screenBanner = {
    title,
    subtitle,
    tone,
    timer: duration,
    duration,
  };
}

function resetTrainingDummy() {
  trainingDummy = createTrainingDummy();
}

function clearPlayerTransientState() {
  player.destination = null;
  player.slide = null;
  player.attackCooldown = 0;
  player.abilityCooldowns = [0, 0, 0, 0];
  player.castTimer = 0;
  player.castMoveLockTimer = 0;
  player.pendingAbilityCast = null;
  player.rangerAttackTimer = 0;
  player.meleeAttackTimer = 0;
  player.rogueAttackTimer = 0;
  player.tumbleTimer = 0;
  player.invulnerableTimer = 0;
  player.shieldWallTimer = 0;
  player.consecrationTimer = 0;
  player.guardSpeedTimer = 0;
  player.tacoGreaseTimer = 0;
  player.backstabTimer = 0;
  player.deadeyeTimer = 0;
  player.talentSaves = {};
  player.lastDamageAt = 0;
  Object.keys(movementKeys).forEach((direction) => {
    movementKeys[direction] = false;
  });
}

function lockBuildForRun() {
  if (!runState.active || runState.buildLocked) return;
  runState.buildLocked = true;
  runState.lockedTalentClass = currentClassKey();
  talentTreeSignature = "";
  showFloat("Build locked");
}

function loadBoss(kind) {
  const safeKind = lockedBosses.has(kind) ? "cola" : kind;
  boss = createBoss(safeKind);
  if (boss.kind === "taco" || boss.kind === "donut" || boss.kind === "sushi") boss.attackTimer = 2.4;
  condimentBosses = boss.kind === "trio" ? createCondimentBosses() : [];
  clearEncounterState();
  clearMazeState();
}

function sendPlayerToStarterRoom() {
  player.room = "starter";
  player.x = 300;
  player.y = 685;
  clearPlayerTransientState();
  resetTrainingDummy();
  player.gateCooldown = 0.8;
  player.dead = false;
  player.won = false;
  mouseWorld = { x: player.x + player.lastMoveX * 120, y: player.y + player.lastMoveY * 120 };
}

function startMazeForBoss(kind, options = {}) {
  if (isPartySyncActive() && !options.fromParty) {
    lockBuildForRun();
    markPartyReady("starter");
    return;
  }
  lockBuildForRun();
  clearEncounterState();
  if (Number.isFinite(options.sequence)) runState.mazeCount = options.sequence;
  else runState.mazeCount += 1;
  mazeState = generateMazeForBoss(kind, runState.mazeCount);
  const start = mazeState.playerStart || mazeCellCenter(mazeState, mazeState.entranceCell.x, mazeState.entranceCell.y);
  player.room = "maze";
  player.x = start.x;
  player.y = start.y;
  player.destination = null;
  player.slide = null;
  player.gateCooldown = 1.2;
  mouseWorld = { x: player.x + 120, y: player.y };
  ui.status.textContent = `${mazeState.theme.name}: clear the gauntlet before ${boss.name}.`;
  showScreenBanner(mazeState.theme.name, `Survive the room before ${boss.name}`, "neutral", 2.4);
  log(`${mazeState.theme.name} generated.`);
  sendMultiplayerState(true);
}

function enterBossArena(options = {}) {
  if (isPartySyncActive() && !options.fromParty) {
    markPartyReady("reward");
    return;
  }
  clearEncounterState();
  clearMazeState();
  player.room = "arena";
  const spawn = multiplayer.mode === "multiplayer" ? multiplayer.assignedSpawn : null;
  player.x = spawn?.x || world.arena.x + 130;
  player.y = spawn?.y || world.arena.y + world.arena.h / 2;
  mouseWorld = { x: player.x + 120, y: player.y };
  player.destination = null;
  player.slide = null;
  player.gateCooldown = 1.2;
  ui.status.textContent = `${boss.name} arena reached.`;
  startFight();
  sendMultiplayerState(true);
}

function beginRun(mode, firstBoss = "cola") {
  const gearState = { ...player.gear };
  runState.mode = mode;
  runState.active = true;
  runState.buildLocked = false;
  resetRunTalents();
  runState.mode = mode;
  runState.active = true;
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  player.hp = player.maxHp;
  player.potions = 3;
  sendPlayerToStarterRoom();
  loadBoss(firstBoss);
  hideMenus();
  setCoopStatus(mode === "multiplayer" ? "In Room" : mode === "dev" ? "Dev Test" : "Solo", mode === "multiplayer" ? multiplayer.room?.players?.length || 1 : 1);
  ui.status.textContent = `Choose class and armor, then cross the gate for ${boss.name}.`;
  showFloat(`${boss.name} ready`);
  sendMultiplayerState(true);
}

function returnToMainMenu(message = "Choose a mode.") {
  closeMultiplayerSocket();
  closeClassMenu();
  closeArmorMenu();
  closeTalentMenu();
  closeBossMenu();
  runState.mode = "menu";
  runState.active = false;
  runState.buildLocked = false;
  resetRunTalents();
  screenBanner = null;
  const gearState = { ...player.gear };
  player = createPlayer();
  player.gear = gearState;
  applyGear();
  resetTrainingDummy();
  loadBoss("cola");
  setCoopStatus("Solo", 1);
  ui.status.textContent = message;
  showMenuScreen("main");
}

function startSinglePlayer() {
  multiplayer.mode = "single";
  multiplayer.enabled = false;
  closeMultiplayerSocket();
  multiplayer.peers.clear();
  beginRun("single", "cola");
}

function startMultiplayerFlow() {
  multiplayer.mode = "multiplayer";
  showMenuScreen("multiplayer");
  setMenuStatus("Connecting...");
  setupMultiplayer();
}

function startMultiplayerFight(bossKind, spawn, startAt = 0, serverTime = 0) {
  multiplayer.assignedSpawn = spawn && Number.isFinite(spawn.x) && Number.isFinite(spawn.y)
    ? { x: spawn.x, y: spawn.y }
    : null;
  const rawStartAt = Number(startAt) || 0;
  const rawServerTime = Number(serverTime) || Date.now();
  const startDelay = rawStartAt ? Math.max(0, rawStartAt - rawServerTime) : 0;
  multiplayer.startAt = Date.now() + startDelay;
  multiplayer.bossSyncSeq = 0;
  multiplayer.hazardSyncSeq = 0;
  multiplayer.particleSyncSeq = 0;
  multiplayer.lastBossSyncSeq = 0;
  resetPartySyncState();
  const safeBossKind = lockedBosses.has(bossKind) ? "cola" : bossKind || "cola";
  if (startDelay > 60) {
    multiplayer.pendingStart = { bossKind: safeBossKind, startAt: multiplayer.startAt };
    setMenuStatus("Co-op run starting...");
    setLobbyStatus("Co-op run starting...");
    return;
  }
  beginMultiplayerFightNow(safeBossKind);
}

function beginMultiplayerFightNow(bossKind) {
  multiplayer.pendingStart = null;
  beginRun("multiplayer", bossKind);
}

function selectBoss(kind, options = {}) {
  if (runState.mode !== "dev") {
    ui.status.textContent = "Boss Test is only available in Dev Test mode.";
    showFloat("Dev Test only");
    return;
  }
  if (lockedBosses.has(kind)) {
    ui.status.textContent = "That boss is locked for now.";
    showFloat("Locked");
    return;
  }
  loadBoss(kind);
  player.hp = player.maxHp;
  player.potions = 3;
  sendPlayerToStarterRoom();
  ui.status.textContent = `${boss.name} selected for testing. Cross the gate when ready.`;
  showFloat(boss.name);
  if (!options.fromLobby) sendMultiplayerState(true);
}

function startFight() {
  if (fightStartedAt) return;
  fightStartedAt = performance.now();
  log("Boss awakened.");
  ui.status.textContent = `${boss.name} awakened. Dodge, attack, and use Q/E/Space/R.`;
  showScreenBanner(boss.name, "Boss fight begins", "danger", 2.2);
}

function log(text) {
  logLines = [text, ...logLines].slice(0, 5);
}

function attackInterval(kind, phase = boss.phase, enraged = boss.enraged) {
  const tuning = combatTuning.attackIntervals[kind];
  const pressure = combatTuning.bossAttackIntervalMultiplier || 1;
  if (!tuning) return (enraged ? 1.35 : phase >= 2 ? 1.7 : 2.05) * pressure;
  if (enraged && tuning.enraged) return tuning.enraged * pressure;
  if (phase >= 3 && tuning.phase3) return tuning.phase3 * pressure;
  if (phase >= 2 && tuning.phase2) return tuning.phase2 * pressure;
  return tuning.base * pressure;
}

function isMultiplayerGame() {
  return multiplayer.mode === "multiplayer" && Boolean(multiplayer.room);
}

function isMultiplayerHost() {
  return isMultiplayerGame() && multiplayer.room?.hostId === multiplayer.id;
}

function isHostPeer(peerId) {
  return isMultiplayerGame() && multiplayer.room?.hostId === peerId;
}

function shouldSimulateBossAI() {
  return !isMultiplayerGame() || isMultiplayerHost();
}

function shouldBroadcastBossSync() {
  return isMultiplayerHost() && multiplayer.room?.state === "inGame" && player.room === "arena";
}

function isRemoteBossHazard(hazard) {
  return Boolean(hazard?.remoteBossHazard) && isMultiplayerGame() && !isMultiplayerHost();
}

function isPartySyncActive() {
  return isMultiplayerGame() && runState.mode === "multiplayer";
}

function resetPartySyncState() {
  multiplayer.partyPhase = "starter";
  multiplayer.phaseSeq = 0;
  multiplayer.localPartyReady = null;
  multiplayer.partyReady.clear();
  multiplayer.gauntletSyncSeq = 0;
  multiplayer.lastGauntletSyncSeq = 0;
  multiplayer.gauntletSyncTimer = 0;
}

function localPartyReadyMatches(phase) {
  return multiplayer.localPartyReady?.phase === phase && multiplayer.localPartyReady?.phaseSeq === multiplayer.phaseSeq;
}

function markPartyReady(phase) {
  if (!isPartySyncActive()) return false;
  if (phase !== multiplayer.partyPhase) {
    ui.status.textContent = `Waiting for party phase: ${multiplayer.partyPhase}.`;
    showFloat("Waiting for party");
    return true;
  }
  if (localPartyReadyMatches(phase)) {
    showFloat("Waiting for party");
    return true;
  }
  multiplayer.localPartyReady = { phase, phaseSeq: multiplayer.phaseSeq };
  sendMultiplayerEvent({
    kind: "party-ready",
    phase,
    bossKind: boss.kind,
    phaseSeq: multiplayer.phaseSeq,
  });
  ui.status.textContent = phase === "starter" ? "Ready. Waiting for everyone to enter the gauntlet." : "Reward chosen. Waiting for everyone.";
  showFloat("Waiting for party");
  if (isMultiplayerHost()) maybeAdvancePartyPhase();
  return true;
}

function partyPlayerIds() {
  const roomIds = (multiplayer.room?.players || []).map((peer) => peer.id).filter(Boolean);
  if (roomIds.length) return roomIds;
  const ids = [multiplayer.id].filter(Boolean);
  multiplayer.peers.forEach((_, id) => ids.push(id));
  return ids;
}

function isPartyPlayerWaitingRequired(peerId, phase) {
  if (phase !== "reward") return true;
  if (peerId === multiplayer.id) return !player.dead;
  const peer = multiplayer.peers.get(peerId);
  return !peer?.dead;
}

function partyPlayerReady(peerId, phase) {
  if (!isPartyPlayerWaitingRequired(peerId, phase)) return true;
  if (peerId === multiplayer.id) return localPartyReadyMatches(phase);
  const ready = multiplayer.partyReady.get(peerId);
  return ready?.phase === phase && ready?.phaseSeq === multiplayer.phaseSeq;
}

function allPartyPlayersReady(phase) {
  const ids = partyPlayerIds();
  if (!ids.length) return false;
  return ids.every((peerId) => partyPlayerReady(peerId, phase));
}

function handlePartyReadyEvent(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind) return;
  if (event.phase !== multiplayer.partyPhase || event.phaseSeq !== multiplayer.phaseSeq) return;
  multiplayer.partyReady.set(peerId, { phase: event.phase, phaseSeq: event.phaseSeq });
  maybeAdvancePartyPhase();
}

function maybeAdvancePartyPhase() {
  if (!isMultiplayerHost() || !isPartySyncActive()) return;
  if (multiplayer.partyPhase === "starter" && allPartyPlayersReady("starter")) {
    broadcastPartyPhase("gauntlet", {
      bossKind: boss.kind,
      mazeSequence: runState.mazeCount + 1,
    });
    return;
  }
  if (multiplayer.partyPhase === "reward" && allPartyPlayersReady("reward")) {
    broadcastPartyPhase("arena", {
      bossKind: boss.kind,
      spawns: multiplayerArenaSpawns(),
    });
  }
}

function multiplayerArenaSpawns() {
  const points = [
    { x: 890, y: 450 },
    { x: 880, y: 555 },
    { x: 880, y: 345 },
    { x: 990, y: 450 },
  ];
  return partyPlayerIds().map((id, index) => ({ id, ...points[index % points.length] }));
}

function broadcastPartyPhase(phase, options = {}) {
  if (!isMultiplayerHost() || !isPartySyncActive()) return;
  multiplayer.phaseSeq += 1;
  const event = {
    kind: "party-phase",
    phase,
    bossKind: options.bossKind || boss.kind,
    phaseSeq: multiplayer.phaseSeq,
    mazeSequence: options.mazeSequence || runState.mazeCount,
    startAt: Date.now() + (options.delay || 0),
    spawns: options.spawns || multiplayerArenaSpawns(),
    defeatedName: options.defeatedName || "",
    talentPoints: options.talentPoints || 0,
  };
  sendMultiplayerEvent(event);
  if (options.applyLocal === false) {
    multiplayer.partyPhase = phase;
    multiplayer.localPartyReady = null;
    multiplayer.partyReady.clear();
  } else {
    applyPartyPhase(event, true);
  }
}

function applyPartyPhase(event, local = false) {
  if (!event || event.bossKind && lockedBosses.has(event.bossKind)) return;
  if (!local && Number.isFinite(event.phaseSeq) && event.phaseSeq <= multiplayer.phaseSeq) return;
  if (Number.isFinite(event.phaseSeq)) multiplayer.phaseSeq = event.phaseSeq;
  multiplayer.partyPhase = event.phase || multiplayer.partyPhase;
  multiplayer.localPartyReady = null;
  multiplayer.partyReady.clear();
  const phaseBossKind = event.bossKind || boss.kind;
  if (event.spawns?.length) {
    const spawn = event.spawns.find((item) => item.id === multiplayer.id);
    multiplayer.assignedSpawn = spawn && Number.isFinite(spawn.x) && Number.isFinite(spawn.y) ? { x: spawn.x, y: spawn.y } : multiplayer.assignedSpawn;
  }
  if (event.phase === "gauntlet") {
    if (boss.kind !== phaseBossKind) loadBoss(phaseBossKind);
    startMazeForBoss(phaseBossKind, { fromParty: true, sequence: event.mazeSequence || runState.mazeCount + 1 });
    return;
  }
  if (event.phase === "reward") {
    if (!mazeState || mazeState.kind !== phaseBossKind) startMazeForBoss(phaseBossKind, { fromParty: true, sequence: event.mazeSequence || runState.mazeCount || 1 });
    mazeState.cleared = true;
    mazeState.rewardPending = !mazeState.rewardChosen;
    mazeState.exitOpen = false;
    selectedBoss = null;
    playerProjectiles = [];
    hazards = hazards.filter((hazard) => !hazard.mazeHazard);
    if (!mazeState.rewardChosen) showMazeRewardChoices();
    return;
  }
  if (event.phase === "arena") {
    if (boss.kind !== phaseBossKind) loadBoss(phaseBossKind);
    if (ui.mazeRewardOverlay) ui.mazeRewardOverlay.hidden = true;
    enterBossArena({ fromParty: true });
    return;
  }
  if (event.phase === "starter") {
    if (event.talentPoints) grantTalentPoints(event.talentPoints, event.defeatedName || "Boss");
    loadBoss(phaseBossKind);
    player.hp = player.maxHp;
    player.potions = 3;
    sendPlayerToStarterRoom();
    ui.status.textContent = `${event.defeatedName || "Boss"} defeated. Next Boss: ${boss.name}.`;
    showScreenBanner(`${event.defeatedName || "Boss"} Defeated`, `Next Boss: ${boss.name}`, "victory", 2.8);
    showFloat(`Next boss: ${boss.name}`);
    return;
  }
  if (event.phase === "victory") {
    if (event.talentPoints) grantTalentPoints(event.talentPoints, event.defeatedName || "Boss");
    clearEncounterState();
    clearMazeState();
    player.won = true;
    runState.active = false;
    runState.buildLocked = false;
    player.destination = null;
    player.slide = null;
    ui.status.textContent = "Victory. You cleared the full boss run.";
    showScreenBanner("Run Cleared", "All bosses defeated", "victory", 4);
    showFloat("Run complete");
  }
}

function applyRemotePartyPhase(peerId, event) {
  if (!isHostPeer(peerId) || isMultiplayerHost()) return;
  applyPartyPhase(event, false);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgba(hex, alpha) {
  const clean = String(hex || "#ffffff").replace("#", "");
  const value = Number.parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  if (!Number.isFinite(value)) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isTypingTarget(element) {
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element?.tagName) || element?.isContentEditable;
}

function currentBounds() {
  if (player.room === "maze") return world.maze;
  return player.room === "arena" ? world.arena : world.starter;
}

function currentClassKey() {
  const weaponTag = gear.weapon[player.gear.weapon].tag;
  if (weaponTag === "Ranged") return "ranger";
  if (weaponTag === "Magic") return "mage";
  if (weaponTag === "Rogue") return "rogue";
  if (weaponTag === "Paladin") return "paladin";
  return "melee";
}

function currentClassOption() {
  return classOptions.find((option) => option.weapon === player.gear.weapon) || classOptions[0];
}

function isWarriorTag(tag) {
  return tag === "Warrior" || tag === "Melee" || tag === "Paladin";
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
  selectedBoss = null;
  shootAt(x, y);
}

function findClickedBoss(x, y) {
  return activeBosses().find((target) => target.hp > 0 && Math.hypot(target.x - x, target.y - y) < target.radius + 14);
}

function activeBosses() {
  if (player.room === "starter") return [trainingDummy];
  if (player.room === "maze" && mazeState) return mazeState.enemies;
  return boss.kind === "trio" ? condimentBosses : [boss];
}

function livingBosses() {
  return activeBosses().filter((target) => target.hp > 0);
}

function constrainToRoom(x, y, fromX = player.x, fromY = player.y) {
  if (player.room === "maze" && mazeState) return constrainToMaze(x, y, mazePlayerCollisionRadius(), fromX, fromY);
  const bounds = nachoQuadrantBounds() || currentBounds();
  return {
    x: clamp(x, bounds.x + player.radius, bounds.x + bounds.w - player.radius),
    y: clamp(y, bounds.y + player.radius, bounds.y + bounds.h - player.radius),
  };
}

function mazePlayerCollisionRadius() {
  return player.radius + mazePlayerWallPadding;
}

function generateMazeForBoss(kind, sequence) {
  const theme = mazeThemes[kind] || mazeThemes.burger;
  const seed = hashString(`${multiplayer.room?.id || "solo"}:${kind}:${sequence}`);
  const rng = createRng(seed);
  const cols = 13;
  const rows = 11;
  const bounds = createGauntletBounds();
  const entrance = {
    x: bounds.x + 18,
    y: bounds.y + bounds.h - 92,
    w: 72,
    h: 72,
  };
  const exit = {
    x: bounds.x + bounds.w - 92,
    y: bounds.y + 20,
    w: 72,
    h: 72,
  };
  const playerStart = {
    x: entrance.x + entrance.w / 2,
    y: entrance.y + entrance.h / 2,
  };
  const obstacles = createGauntletObstacles(kind, bounds, rng, theme);
  const waves = [
    createGauntletWave(kind, 0, bounds, obstacles, rng),
    createGauntletWave(kind, 1, bounds, obstacles, rng),
  ];
  const miniBossEnemy = createGauntletMiniBoss(kind, sequence, bounds, obstacles, rng);
  return {
    active: true,
    encounterType: "gauntlet",
    kind,
    sequence,
    seed,
    theme,
    cols,
    rows,
    grid: Array.from({ length: rows }, () => Array.from({ length: cols }, () => false)),
    bounds,
    cellSize: 1,
    entranceCell: { x: 0, y: 0 },
    exitCell: { x: 0, y: 0 },
    miniBossCell: null,
    miniRoomCells: new Set(),
    entrance,
    exit,
    playerStart,
    obstacles,
    waves,
    waveIndex: -1,
    waveTimer: 0.75,
    miniBossSpawned: false,
    miniBossEnemy,
    pickupDrops: [],
    claimedPickupIds: new Set(),
    spawnMarkers: waves.flatMap((wave) => wave.spawnMarkers),
    enemies: [],
    rewardOptions: chooseMazeRewards(seed),
    rewardPending: false,
    rewardChosen: false,
    exitOpen: false,
    cleared: false,
  };
}

function createGauntletBounds() {
  return {
    x: world.maze.x + 76,
    y: world.maze.y + 82,
    w: world.maze.w - 152,
    h: world.maze.h - 164,
  };
}

function gauntletPoint(bounds, nx, ny) {
  return {
    x: bounds.x + bounds.w * nx,
    y: bounds.y + bounds.h * ny,
  };
}

function createGauntletObstacles(kind, bounds, rng, theme) {
  const labels = {
    cola: ["fountain", "carbonator", "syrup", "cooler"],
    burger: ["grill", "prep", "vent", "counter"],
    fries: ["fryer", "oil", "basket", "warmer"],
    trio: ["ketchup", "mustard", "mayo", "crate"],
    sauce: ["ketchup", "mustard", "mayo", "crate"],
    shake: ["freezer", "ice", "mixer", "crate"],
    nacho: ["cheese", "chips", "warmer", "crate"],
    pizza: ["oven", "counter", "dough", "rack"],
    donut: ["oven", "glaze", "rack", "tray"],
    taco: ["plancha", "salsa", "crate", "counter"],
    sushi: ["bar", "rice", "cooler", "crate"],
  };
  const palette = labels[kind] || labels.cola;
  const templates = [
    { type: "rect", nx: 0.28, ny: 0.26, w: 104, h: 40 },
    { type: "circle", nx: 0.53, ny: 0.24, r: 28 },
    { type: "rect", nx: 0.72, ny: 0.38, w: 46, h: 104 },
    { type: "circle", nx: 0.34, ny: 0.55, r: 32 },
    { type: "rect", nx: 0.56, ny: 0.68, w: 126, h: 38 },
    { type: "rect", nx: 0.79, ny: 0.74, w: 82, h: 46 },
    { type: "circle", nx: 0.18, ny: 0.40, r: 24 },
  ];
  const count = 5 + Math.floor(rng() * 3);
  return templates.slice(0, count).map((template, index) => {
    const point = gauntletPoint(bounds, template.nx, template.ny);
    const jitterX = (rng() - 0.5) * 28;
    const jitterY = (rng() - 0.5) * 24;
    const base = {
      id: `obstacle-${index}`,
      label: palette[index % palette.length],
      color: theme.wall,
      outline: theme.trim,
    };
    if (template.type === "circle") {
      return {
        ...base,
        type: "circle",
        x: point.x + jitterX,
        y: point.y + jitterY,
        r: template.r,
      };
    }
    return {
      ...base,
      type: "rect",
      x: point.x - template.w / 2 + jitterX,
      y: point.y - template.h / 2 + jitterY,
      w: template.w,
      h: template.h,
    };
  });
}

function createGauntletWave(kind, waveIndex, bounds, obstacles, rng) {
  const waveSpawns = [
    [
      { nx: 0.25, ny: 0.72 },
      { nx: 0.39, ny: 0.58 },
      { nx: 0.58, ny: 0.74 },
      { nx: 0.73, ny: 0.57 },
    ],
    [
      { nx: 0.78, ny: 0.31 },
      { nx: 0.61, ny: 0.36 },
      { nx: 0.43, ny: 0.30 },
      { nx: 0.76, ny: 0.70 },
      { nx: 0.49, ny: 0.55 },
    ],
  ];
  const spawnMarkers = waveSpawns[waveIndex].map((spawn) => gauntletPoint(bounds, spawn.nx, spawn.ny));
  const enemies = spawnMarkers.map((spawn, index) => {
    const point = findGauntletOpenPoint(
      { x: spawn.x + (rng() - 0.5) * 34, y: spawn.y + (rng() - 0.5) * 30 },
      22,
      bounds,
      obstacles,
      rng,
    );
    const enemy = createMazeEnemy(kind, point.x, point.y, waveIndex * 10 + index, false, rng);
    const hpScale = waveIndex === 0 ? 0.88 : 1.02;
    enemy.maxHp = Math.round(enemy.maxHp * hpScale);
    enemy.hp = enemy.maxHp;
    enemy.waveIndex = waveIndex;
    return enemy;
  });
  return {
    index: waveIndex,
    spawned: false,
    cleared: false,
    enemies,
    spawnMarkers,
  };
}

function createGauntletMiniBoss(kind, sequence, bounds, obstacles, rng) {
  const point = gauntletPoint(bounds, 0.76, 0.30);
  const spawn = findGauntletOpenPoint(
    { x: point.x + (rng() - 0.5) * 20, y: point.y + (rng() - 0.5) * 18 },
    38,
    bounds,
    obstacles,
    rng,
  );
  const enemy = createMazeEnemy(kind, spawn.x, spawn.y, 99, true, rng);
  enemy.maxHp = 500 + Math.min(150, sequence * 18);
  enemy.hp = enemy.maxHp;
  enemy.attackTimer = 1.1;
  enemy.speed = 86;
  enemy.damage = 18;
  enemy.spawnX = enemy.x;
  enemy.spawnY = enemy.y;
  return enemy;
}

function findGauntletOpenPoint(point, radius, bounds, obstacles, rng) {
  let candidate = {
    x: clamp(point.x, bounds.x + radius, bounds.x + bounds.w - radius),
    y: clamp(point.y, bounds.y + radius, bounds.y + bounds.h - radius),
  };
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (isGauntletCircleClear(candidate.x, candidate.y, radius, bounds, obstacles)) return candidate;
    const angle = rng() * Math.PI * 2;
    const distance = 34 + attempt * 11;
    candidate = {
      x: clamp(point.x + Math.cos(angle) * distance, bounds.x + radius, bounds.x + bounds.w - radius),
      y: clamp(point.y + Math.sin(angle) * distance, bounds.y + radius, bounds.y + bounds.h - radius),
    };
  }
  return candidate;
}

function isGauntletCircleClear(x, y, radius, bounds, obstacles) {
  if (x - radius < bounds.x || x + radius > bounds.x + bounds.w) return false;
  if (y - radius < bounds.y || y + radius > bounds.y + bounds.h) return false;
  return !obstacles.some((obstacle) => circleIntersectsGauntletObstacle(x, y, radius, obstacle));
}

function cellsAround(center, radius, cols, rows) {
  const cells = [];
  for (let y = center.y - radius; y <= center.y + radius; y += 1) {
    for (let x = center.x - radius; x <= center.x + radius; x += 1) {
      if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) cells.push({ x, y });
    }
  }
  return cells;
}

function carveMiniBossRoom(grid, center) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  cellsAround(center, 1, cols, rows).forEach((cell) => {
    grid[cell.y][cell.x] = false;
  });
  grid[center.y][center.x + 2] = false;
  grid[center.y - 1][center.x + 2] = false;
}

function mazeCellCenter(state, x, y) {
  return {
    x: state.bounds.x + x * state.cellSize + state.cellSize / 2,
    y: state.bounds.y + y * state.cellSize + state.cellSize / 2,
  };
}

function mazeCellRect(state, x, y) {
  return {
    x: state.bounds.x + x * state.cellSize,
    y: state.bounds.y + y * state.cellSize,
    w: state.cellSize,
    h: state.cellSize,
  };
}

function mazeCellAt(x, y) {
  if (!mazeState) return null;
  const col = Math.floor((x - mazeState.bounds.x) / mazeState.cellSize);
  const row = Math.floor((y - mazeState.bounds.y) / mazeState.cellSize);
  if (col < 0 || row < 0 || col >= mazeState.cols || row >= mazeState.rows) return null;
  return { x: col, y: row };
}

function isMazePointWalkable(x, y) {
  if (mazeState?.encounterType === "gauntlet") return isGauntletPointWalkable(x, y);
  const cell = mazeCellAt(x, y);
  if (!cell || !mazeState) return false;
  if (!mazeState.grid[cell.y][cell.x]) return true;
  return !isPointInsideMazeWallLine(x, y, cell);
}

function isMazeSegmentWalkable(startX, startY, endX, endY, radius = 0) {
  const length = Math.hypot(endX - startX, endY - startY);
  const steps = Math.max(1, Math.ceil(length / Math.max(2, mazeWallThickness / 2)));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    if (radius > 0 ? !isMazeCircleWalkable(x, y, radius) : !isMazePointWalkable(x, y)) return false;
  }
  return true;
}

function isMazeCircleWalkable(x, y, radius) {
  if (!mazeState) return false;
  if (mazeState.encounterType === "gauntlet") return isGauntletCircleWalkable(x, y, radius);
  if (x - radius < mazeState.bounds.x || x + radius > mazeState.bounds.x + mazeState.bounds.w) return false;
  if (y - radius < mazeState.bounds.y || y + radius > mazeState.bounds.y + mazeState.bounds.h) return false;
  const minCell = mazeCellAt(x - radius - mazeWallThickness, y - radius - mazeWallThickness);
  const maxCell = mazeCellAt(x + radius + mazeWallThickness, y + radius + mazeWallThickness);
  if (!minCell || !maxCell) return false;
  for (let row = minCell.y; row <= maxCell.y; row += 1) {
    for (let col = minCell.x; col <= maxCell.x; col += 1) {
      if (!mazeState.grid[row][col]) continue;
      if (mazeWallLineRects({ x: col, y: row }).some((wall) => circleIntersectsRect(x, y, radius, wall))) return false;
    }
  }
  return true;
}

function isGauntletPointWalkable(x, y) {
  if (!mazeState?.bounds) return false;
  const bounds = mazeState.bounds;
  if (x < bounds.x || x > bounds.x + bounds.w || y < bounds.y || y > bounds.y + bounds.h) return false;
  return !mazeState.obstacles?.some((obstacle) => pointInGauntletObstacle(x, y, obstacle));
}

function isGauntletCircleWalkable(x, y, radius) {
  if (!mazeState?.bounds) return false;
  const bounds = mazeState.bounds;
  if (x - radius < bounds.x || x + radius > bounds.x + bounds.w) return false;
  if (y - radius < bounds.y || y + radius > bounds.y + bounds.h) return false;
  return !mazeState.obstacles?.some((obstacle) => circleIntersectsGauntletObstacle(x, y, radius, obstacle));
}

function pointInGauntletObstacle(x, y, obstacle) {
  if (obstacle.type === "circle") return Math.hypot(x - obstacle.x, y - obstacle.y) <= obstacle.r;
  return pointInRect(x, y, obstacle);
}

function circleIntersectsGauntletObstacle(x, y, radius, obstacle) {
  if (obstacle.type === "circle") return Math.hypot(x - obstacle.x, y - obstacle.y) <= radius + obstacle.r;
  return circleIntersectsRect(x, y, radius, obstacle);
}

function mazeWallLineRects(cell) {
  const rect = mazeCellRect(mazeState, cell.x, cell.y);
  const thickness = mazeWallThickness;
  const midX = rect.x + rect.w / 2;
  const midY = rect.y + rect.h / 2;
  if (cell.x % 2 === 0 && cell.y % 2 === 1) {
    return [{ x: midX - thickness / 2, y: rect.y, w: thickness, h: rect.h }];
  }
  if (cell.x % 2 === 1 && cell.y % 2 === 0) {
    return [{ x: rect.x, y: midY - thickness / 2, w: rect.w, h: thickness }];
  }
  const walls = [];
  const connectsVertical = cell.x % 2 === 0 && (hasMazeWallCell(cell.x, cell.y - 1) || hasMazeWallCell(cell.x, cell.y + 1));
  const connectsHorizontal = cell.y % 2 === 0 && (hasMazeWallCell(cell.x - 1, cell.y) || hasMazeWallCell(cell.x + 1, cell.y));
  if (connectsVertical) {
    walls.push({ x: midX - thickness / 2, y: rect.y, w: thickness, h: rect.h });
  }
  if (connectsHorizontal) {
    walls.push({ x: rect.x, y: midY - thickness / 2, w: rect.w, h: thickness });
  }
  return walls;
}

function hasMazeWallCell(x, y) {
  return Boolean(mazeState && y >= 0 && y < mazeState.rows && x >= 0 && x < mazeState.cols && mazeState.grid[y][x]);
}

function mazeWallVisualRects(cell) {
  const rect = mazeCellRect(mazeState, cell.x, cell.y);
  const thickness = mazeWallThickness;
  const midX = rect.x + rect.w / 2;
  const midY = rect.y + rect.h / 2;
  if (cell.x % 2 === 0 && cell.y % 2 === 1) {
    return [{ x: midX - thickness / 2, y: rect.y + rect.h * 0.18, w: thickness, h: rect.h * 0.64 }];
  }
  if (cell.x % 2 === 1 && cell.y % 2 === 0) {
    return [{ x: rect.x + rect.w * 0.18, y: midY - thickness / 2, w: rect.w * 0.64, h: thickness }];
  }
  return [{ x: midX - thickness / 2, y: midY - thickness / 2, w: thickness, h: thickness }];
}

function isPointInsideMazeWallLine(x, y, cell) {
  return mazeWallLineRects(cell).some((wall) => x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h);
}

function circleIntersectsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  return Math.hypot(cx - nearestX, cy - nearestY) <= radius;
}

function constrainToMaze(x, y, radius, fromX = player.x, fromY = player.y) {
  const bounds = mazeState.bounds;
  const clamped = {
    x: clamp(x, bounds.x + radius, bounds.x + bounds.w - radius),
    y: clamp(y, bounds.y + radius, bounds.y + bounds.h - radius),
  };
  if (isMazeCircleWalkable(clamped.x, clamped.y, radius) && isMazeSegmentWalkable(fromX, fromY, clamped.x, clamped.y, radius)) return clamped;
  if (isMazeCircleWalkable(clamped.x, fromY, radius) && isMazeSegmentWalkable(fromX, fromY, clamped.x, fromY, radius)) return { x: clamped.x, y: fromY };
  if (isMazeCircleWalkable(fromX, clamped.y, radius) && isMazeSegmentWalkable(fromX, fromY, fromX, clamped.y, radius)) return { x: fromX, y: clamped.y };
  return { x: fromX, y: fromY };
}

function chooseMazeRewards(seed) {
  const rng = createRng(seed ^ 0x9e3779b9);
  const pool = mazeRewardPool.slice();
  const rewards = [];
  while (rewards.length < 3 && pool.length) {
    rewards.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return rewards;
}

function createMazeEnemy(kind, x, y, index, miniBoss, rng) {
  const theme = mazeThemes[kind] || mazeThemes.burger;
  const ranged = !miniBoss && index % 4 === 1;
  return {
    id: miniBoss ? "warden" : `mob-${index}`,
    kind: miniBoss ? "mazeMiniBoss" : "mazeMob",
    name: miniBoss ? `${theme.name} Warden` : themedMobName(kind, ranged),
    mazeEnemy: true,
    miniBoss,
    x,
    y,
    spawnX: x,
    spawnY: y,
    radius: miniBoss ? 34 : ranged ? 17 : 19,
    maxHp: miniBoss ? 360 : ranged ? 80 : 95,
    hp: miniBoss ? 360 : ranged ? 80 : 95,
    color: miniBoss ? theme.mini : theme.enemy,
    attackTimer: miniBoss ? 1.15 : 0.75 + rng() * 0.7,
    patternIndex: 0,
    moveTimer: rng() * Math.PI * 2,
    ranged,
    speed: miniBoss ? 82 : ranged ? 70 : 106,
    damage: miniBoss ? 16 : ranged ? 8 : 10,
    state: "roaming",
  };
}

function themedMobName(kind, ranged) {
  const names = {
    cola: ranged ? "Fizz Spitter" : "Soda Scrapper",
    burger: ranged ? "Sesame Slinger" : "Grill Grunt",
    fries: ranged ? "Salt Sniper" : "Fry Runner",
    trio: ranged ? "Bottle Popper" : "Pantry Brawler",
    sauce: ranged ? "Sauce Lobber" : "Cellar Bruiser",
    shake: ranged ? "Frost Flinger" : "Freezer Shambler",
    nacho: ranged ? "Chip Tosser" : "Cheese Charger",
    pizza: ranged ? "Pepperoni Pitcher" : "Crust Cutter",
    donut: ranged ? "Glaze Sprayer" : "Dough Roller",
  };
  return names[kind] || (ranged ? "Maze Spitter" : "Maze Grunt");
}

function equipFromStand(stand) {
  player.gear[stand.type] = stand.id;
  player.abilityCooldowns = [0, 0, 0, 0];
  player.pendingAbilityCast = null;
  applyGear();
  player.hp = player.maxHp;
  saveGear();
  const item = gear[stand.type][stand.id];
  log(`Equipped ${item.name}.`);
  showFloat(item.name);
}

function equipClass(classId) {
  if (runState.buildLocked) {
    showFloat("Build locked");
    return;
  }
  const option = classOptions.find((entry) => entry.id === classId);
  if (!option || option.locked || !option.weapon) {
    showFloat("Locked");
    return;
  }
  equipGear("weapon", option.weapon);
}

function equipGear(slot, id) {
  if (runState.buildLocked && (slot === "weapon" || slot === "armor")) {
    showFloat("Build locked");
    return;
  }
  if (!gear[slot]?.[id]) return;
  player.gear[slot] = id;
  player.abilityCooldowns = [0, 0, 0, 0];
  player.pendingAbilityCast = null;
  applyGear();
  player.hp = player.maxHp;
  saveGear();
  const item = gear[slot][id];
  log(`Equipped ${item.name}.`);
  showFloat(item.name);
}

function movePlayer(dt) {
  if (mazeState?.rewardPending) {
    player.destination = null;
    player.slide = null;
    player.moving = false;
    return;
  }
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
  const nextX = player.x + player.lastMoveX * playerSpeed() * dt;
  const nextY = player.y + player.lastMoveY * playerSpeed() * dt;
  const point = constrainToRoom(nextX, nextY, player.x, player.y);
  player.x = point.x;
  player.y = point.y;
}

function playerSpeed() {
  const haste = player.guardSpeedTimer > 0 ? 1.45 : 1;
  const greaseSlow = player.tacoGreaseTimer > 0 ? 0.58 : 1;
  return player.stats.speed * haste * greaseSlow;
}

function moveSlidingPlayer(dt) {
  const previousX = player.x;
  const previousY = player.y;
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
      const hit = damageEnemiesInRadius(player.x, player.y, 92, Math.round(player.stats.damage * 0.28), "Whirlwind Dash");
      if (hasTalent("melee_blood_whirl")) hit.forEach((target) => applyBleed(target));
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
  const collisionRadius = player.room === "maze" && mazeState ? mazePlayerCollisionRadius() : player.radius;
  const clampedX = clamp(player.x, bounds.x + collisionRadius, bounds.x + bounds.w - collisionRadius);
  const clampedY = clamp(player.y, bounds.y + collisionRadius, bounds.y + bounds.h - collisionRadius);
  if (player.room === "maze" && mazeState && !isMazeSegmentWalkable(previousX, previousY, clampedX, clampedY, collisionRadius)) {
    player.slide = null;
    player.x = previousX;
    player.y = previousY;
    return;
  }
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
    startMazeForBoss(boss.kind);
  }
  if (player.room === "maze" && mazeState?.exitOpen && pointInRect(player.x, player.y, mazeState.exit)) {
    enterBossArena();
  }
  if (player.room === "arena" && player.x < world.arena.x + player.radius) {
    player.x = world.arena.x + player.radius;
    player.destination = null;
    player.slide = null;
  }
}

function updateGauntletProgress(dt) {
  if (!mazeState || mazeState.encounterType !== "gauntlet" || mazeState.rewardPending) return;
  mazeState.waveTimer = Math.max(0, (mazeState.waveTimer || 0) - dt);
  updateGauntletPickups(dt);
  if (mazeState.waveIndex < 0 && mazeState.waveTimer <= 0) {
    spawnGauntletWave(0);
    return;
  }
  const activeTrash = mazeState.enemies.some((enemy) => enemy.hp > 0 && !enemy.miniBoss);
  const currentWave = mazeState.waves?.[mazeState.waveIndex];
  if (currentWave?.spawned && !currentWave.cleared && !activeTrash) {
    currentWave.cleared = true;
    mazeState.waveTimer = 1.1;
    dropGauntletPickup(currentWave.index);
    sendGauntletSync(true);
    ui.status.textContent = currentWave.index === 0 ? "Wave cleared. Next wave incoming." : "Trash cleared. The warden is coming.";
    showFloat(currentWave.index === 0 ? "Wave cleared" : "Warden incoming");
    return;
  }
  if (activeTrash || mazeState.waveTimer > 0) return;
  if (mazeState.waveIndex < mazeState.waves.length - 1) {
    spawnGauntletWave(mazeState.waveIndex + 1);
    return;
  }
  if (!mazeState.miniBossSpawned) spawnGauntletMiniBoss();
}

function spawnGauntletWave(index) {
  if (!mazeState?.waves?.[index]) return;
  const wave = mazeState.waves[index];
  if (wave.spawned) return;
  wave.spawned = true;
  wave.cleared = false;
  mazeState.waveIndex = index;
  mazeState.enemies.push(...wave.enemies);
  ui.status.textContent = `${mazeState.theme.name}: clear wave ${index + 1} of ${mazeState.waves.length}.`;
  showScreenBanner(`Wave ${index + 1}`, "Keep moving and clear the room", "neutral", 1.6);
  sendMultiplayerState(true);
  sendGauntletSync(true);
}

function spawnGauntletMiniBoss() {
  if (!mazeState || mazeState.miniBossSpawned || !mazeState.miniBossEnemy) return;
  mazeState.miniBossSpawned = true;
  mazeState.enemies.push(mazeState.miniBossEnemy);
  ui.status.textContent = `${mazeState.theme.name}: defeat the warden.`;
  showScreenBanner("Warden", `${mazeState.miniBossEnemy.name} blocks the boss gate`, "neutral", 2.1);
  showFloat("Warden spawned");
  sendMultiplayerState(true);
  sendGauntletSync(true);
}

function dropGauntletPickup(waveIndex) {
  if (!mazeState?.bounds) return;
  const point = gauntletPoint(mazeState.bounds, waveIndex === 0 ? 0.38 : 0.61, waveIndex === 0 ? 0.80 : 0.50);
  const potionDrop = waveIndex === 1 && player.potions < 4;
  mazeState.pickupDrops.push({
    id: `pickup-${waveIndex}`,
    type: potionDrop ? "potion" : "heal",
    x: point.x,
    y: point.y,
    r: potionDrop ? 15 : 18,
    amount: potionDrop ? 1 : 28,
    ttl: 22,
  });
}

function updateGauntletPickups(dt) {
  if (!mazeState?.pickupDrops?.length) return;
  mazeState.pickupDrops = mazeState.pickupDrops.filter((pickup) => {
    pickup.ttl -= dt;
    if (pickup.ttl <= 0) return false;
    if (Math.hypot(player.x - pickup.x, player.y - pickup.y) > player.radius + pickup.r + 8) return true;
    if (pickup.type === "potion") {
      player.potions = Math.min(4, player.potions + pickup.amount);
      showFloat("Potion shard");
      log("A potion shard drops from the gauntlet wave.");
    } else {
      player.hp = Math.min(player.maxHp, player.hp + pickup.amount);
      showFloat(`+${pickup.amount} HP`);
      log("A snack pickup restores health.");
    }
    particles.push({ x: pickup.x, y: pickup.y - 28, text: pickup.type === "potion" ? "+potion" : "+hp", color: "#9be06f", ttl: 0.85 });
    if (pickup.id) mazeState.claimedPickupIds?.add(pickup.id);
    return false;
  });
}

function updateMazeCombat(dt) {
  if (player.room !== "maze" || !mazeState || player.dead || player.won || mazeState.rewardPending) return;
  if (isPartySyncActive() && !isMultiplayerHost()) {
    updateGauntletPickups(dt);
    return;
  }
  if (mazeState.encounterType === "gauntlet") updateGauntletProgress(dt);
  const living = mazeState.enemies.filter((enemy) => enemy.hp > 0);
  living.forEach((enemy) => {
    enemy.moveTimer += dt;
    enemy.attackTimer -= dt;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const activeRange = enemy.miniBoss ? 520 : 340;
    if (dist < activeRange) {
      enemy.state = "fighting";
      if (!enemy.ranged || dist < 130) {
        const speed = enemy.speed * (enemy.miniBoss && dist > 110 ? 1 : 0.82);
        moveMazeEnemy(enemy, (dx / dist) * speed * dt, (dy / dist) * speed * dt);
      }
      if (!enemy.miniBoss && enemy.ranged && enemy.attackTimer <= 0 && dist < 420) {
        spawnMazeProjectile(enemy);
        enemy.attackTimer = 1.45;
      }
      if (!enemy.miniBoss && !enemy.ranged && dist < enemy.radius + player.radius + 8 && enemy.attackTimer <= 0) {
        damagePlayer(enemy.damage, enemy.name);
        enemy.attackTimer = 1.05;
      }
    } else if (!enemy.miniBoss) {
      const wobbleX = Math.cos(enemy.moveTimer * 0.8 + enemy.spawnX * 0.01);
      const wobbleY = Math.sin(enemy.moveTimer * 0.7 + enemy.spawnY * 0.01);
      moveMazeEnemy(enemy, wobbleX * enemy.speed * 0.18 * dt, wobbleY * enemy.speed * 0.18 * dt);
    }
    if (enemy.miniBoss && enemy.attackTimer <= 0) {
      spawnMazeMiniBossPattern(enemy);
      enemy.attackTimer = mazeState.encounterType === "gauntlet" ? 1.1 : 1.18;
    }
  });
}

function moveMazeEnemy(enemy, dx, dy) {
  const nextX = enemy.x + dx;
  const nextY = enemy.y + dy;
  if (isMazeCircleWalkable(nextX, nextY, enemy.radius)) {
    enemy.x = nextX;
    enemy.y = nextY;
    return;
  }
  if (isMazeCircleWalkable(nextX, enemy.y, enemy.radius)) enemy.x = nextX;
  if (isMazeCircleWalkable(enemy.x, nextY, enemy.radius)) enemy.y = nextY;
}

function spawnMazeProjectile(enemy) {
  const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
  hazards.push({
    type: "mazeShot",
    mazeHazard: true,
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * (enemy.miniBoss ? 330 : 250),
    vy: Math.sin(angle) * (enemy.miniBoss ? 330 : 250),
    r: enemy.miniBoss ? 13 : 9,
    ttl: enemy.miniBoss ? 2.8 : 2.2,
    damage: enemy.miniBoss ? 12 : 8,
    color: enemy.color,
  });
}

function spawnMazeMiniBossPattern(enemy) {
  enemy.patternIndex = (enemy.patternIndex || 0) + 1;
  const kind = mazeState?.kind || boss.kind;
  if (kind === "cola") {
    spawnMazeCircle(player.x, player.y, 34, 0.55, 1.2, 10, "#b9f4ff", "Fizz pop");
    spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x) + 0.22, { speed: 220, r: 16, ttl: 2.5, damage: 8, color: "#7ed8ef", source: "Fizz bubble" });
    spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x) - 0.22, { speed: 220, r: 16, ttl: 2.5, damage: 8, color: "#7ed8ef", source: "Fizz bubble" });
    return;
  }
  if (kind === "burger") {
    spawnMazeCircle(player.x, player.y, 48, 0.65, 1.05, 15, "#ff7044", "Grill slam");
    return;
  }
  if (kind === "fries") {
    spawnMazeCircle(enemy.x + Math.cos(enemy.moveTimer) * 44, enemy.y + Math.sin(enemy.moveTimer) * 44, 34, 0.3, 3.2, 5, "#f0c95d", "Hot grease", { lingering: true });
    for (let i = -1; i <= 1; i += 1) {
      spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x) + i * 0.22, { speed: 260, r: 10, ttl: 2.2, damage: 9, turn: i * 0.55, color: "#ffd76a", source: "Curly fry" });
    }
    return;
  }
  if (kind === "trio" || kind === "sauce") {
    const colors = ["#cf3b2f", "#e3bf34", "#f3ead2"];
    const color = colors[enemy.patternIndex % colors.length];
    const base = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    for (let i = -1; i <= 1; i += 1) {
      spawnMazeShot(enemy, base + i * 0.24, { speed: 285, r: 10, ttl: 2.4, damage: 9, color, source: "Condiment burst" });
    }
    return;
  }
  if (kind === "shake") {
    spawnMazeCircle(player.x, player.y, 44, 0.7, 1.25, 11, "#bafcff", "Frost scoop", { chill: true });
    return;
  }
  if (kind === "nacho") {
    spawnMazeCircle(player.x, player.y, 42, 0.45, 2.4, 7, "#ffda6b", "Cheese puddle", { lingering: true });
    for (let i = 0; i < 6; i += 1) {
      spawnMazeShot(enemy, (Math.PI * 2 * i) / 6 + enemy.moveTimer * 0.2, { speed: 225, r: 8, ttl: 1.8, damage: 7, color: "#f0c35b", source: "Chip burst" });
    }
    return;
  }
  if (kind === "pizza") {
    const vertical = enemy.patternIndex % 2 === 0;
    spawnMazeWall(vertical ? player.x : enemy.x, vertical ? enemy.y : player.y, vertical, 0.68, 1.25, 12, "#ff7044");
    for (let i = -2; i <= 2; i += 1) {
      spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x) + i * 0.16, { speed: 275, r: 9, ttl: 2.1, damage: 7, color: "#b93a2f", source: "Pepperoni" });
    }
    return;
  }
  if (kind === "donut") {
    for (let i = 0; i < 10; i += 1) {
      spawnMazeShot(enemy, (Math.PI * 2 * i) / 10 + enemy.patternIndex * 0.19, { speed: 185, r: 7, ttl: 2.4, damage: 6, color: i % 2 ? "#ff79aa" : "#8ec7ff", source: "Sprinkle ring" });
    }
    spawnMazeCircle(player.x, player.y, 32, 0.55, 1.6, 9, "#ffd7e8", "Donut hole");
    return;
  }
  if (kind === "sushi") {
    spawnMazeWall(player.x, enemy.y, true, 0.7, 1.35, 12, "#b7e7d9");
    spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x), { speed: 310, r: 11, ttl: 2.4, damage: 9, color: "#7ab9a8", source: "Wasabi shot" });
    return;
  }
  spawnMazeCircle(player.x, player.y, 42, 0.62, 1.15, 12, "#f0d47c", "Taco quake");
  spawnMazeShot(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x), { speed: 300, r: 11, ttl: 2.2, damage: 9, color: "#6fbf55", source: "Taco shard" });
}

function spawnMazeShot(enemy, angle, options = {}) {
  hazards.push({
    type: "mazeShot",
    mazeHazard: true,
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * (options.speed || 280),
    vy: Math.sin(angle) * (options.speed || 280),
    r: options.r || 10,
    ttl: options.ttl || 2.2,
    damage: options.damage || 8,
    color: options.color || enemy.color,
    turn: options.turn || 0,
    source: options.source || "Maze shot",
  });
}

function spawnMazeCircle(x, y, r, warn, ttl, damage, color, source, options = {}) {
  const point = clampMazeHazardPoint(x, y, r);
  hazards.push({
    type: "mazeCircle",
    mazeHazard: true,
    x: point.x,
    y: point.y,
    r,
    warn,
    ttl,
    damage,
    color,
    source,
    lingering: Boolean(options.lingering),
    chill: Boolean(options.chill),
    damageTimer: 0,
    hit: false,
  });
}

function spawnMazeWall(x, y, vertical, warn, ttl, damage, color) {
  const point = clampMazeHazardPoint(x, y, 24);
  hazards.push({
    type: "mazeWall",
    mazeHazard: true,
    x: point.x,
    y: point.y,
    vertical,
    warn,
    ttl,
    damage,
    color,
    length: mazeState ? mazeState.cellSize * 2.45 : 110,
    width: 24,
    hit: false,
  });
}

function clampMazeHazardPoint(x, y, radius) {
  if (!mazeState) return { x, y };
  return {
    x: clamp(x, mazeState.bounds.x + radius, mazeState.bounds.x + mazeState.bounds.w - radius),
    y: clamp(y, mazeState.bounds.y + radius, mazeState.bounds.y + mazeState.bounds.h - radius),
  };
}

function updateCombat(dt) {
  if (player.room !== "arena" || player.won) return;
  if (player.dead && !isMultiplayerHost()) return;
  startFight();
  if (!shouldSimulateBossAI()) {
    updateRemoteBossPassive(dt);
    return;
  }
  const sync = beginBossSyncCapture("boss-ai");
  updateBossCombatLocal(dt);
  finishBossSyncCapture(sync);
}

function updateBossCombatLocal(dt) {
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
  if (boss.kind === "taco") {
    updateTacoTitan(dt);
    return;
  }
  if (boss.kind === "donut") {
    updateDonutDonald(dt);
    return;
  }
  if (boss.kind === "sushi") {
    updateSushiSerpent(dt);
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
      boss.attackTimer = attackInterval("fries");
    } else {
      boss.attackTimer = attackInterval("burger");
    }
  }
}

function updateRemoteBossPassive(dt) {
  boss.animationTime = (boss.animationTime || 0) + dt;
  if (boss.shieldTimer) boss.shieldTimer = Math.max(0, boss.shieldTimer - dt);
  if (boss.invulnerableTimer) boss.invulnerableTimer = Math.max(0, boss.invulnerableTimer - dt);
  if (boss.enrageTextTimer) boss.enrageTextTimer = Math.max(0, boss.enrageTextTimer - dt);
  condimentBosses.forEach((target) => {
    target.moveTimer = (target.moveTimer || 0) + dt;
    if (target.shieldTimer) target.shieldTimer = Math.max(0, target.shieldTimer - dt);
  });
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
    boss.attackTimer = attackInterval("shake");
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
    boss.attackTimer = attackInterval("pizza");
  }
}

function updatePizzaPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.66 && boss.phase === 1) {
    boss.phase = 2;
    boss.attackTimer = Math.max(boss.attackTimer, combatTuning.phaseDelay.medium);
    log("Phase 2: slice split.");
    ui.status.textContent = "Pizza Phantom starts splitting slices.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.attackTimer = Math.max(boss.attackTimer, combatTuning.phaseDelay.medium);
    boss.cloneTimer = 1.1;
    boss.ovenTimer = 1.65;
    boss.deliveryCooldown = 4.5;
    log("Phase 3: stuffed crust possession.");
    ui.status.textContent = "Pizza Phantom summons decoys.";
  }
  if (hpPercent <= 0.18 && !boss.enraged) {
    boss.enraged = true;
    boss.attackTimer = Math.max(boss.attackTimer, combatTuning.phaseDelay.short);
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
    boss.attackTimer = attackInterval("cola");
  }
}

function updateTacoTitan(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  boss.tacoPuzzleTimer = Math.max(0, (boss.tacoPuzzleTimer || 0) - dt);
  boss.tacoPuzzleResolveTimer = Math.max(0, (boss.tacoPuzzleResolveTimer || 0) - dt);
  boss.exposedFillingTimer = Math.max(0, (boss.exposedFillingTimer || 0) - dt);
  boss.tacoFloodCountdown = Math.max(0, (boss.tacoFloodCountdown || 0) - dt);
  boss.shellGuardActive = boss.exposedFillingTimer <= 0 && boss.hp > 0;
  if (boss.napkinCooldownTimer > 0) {
    boss.napkinCooldownTimer -= dt;
  }
  updateTacoPhase();
  updateTacoPuzzle(dt);
  if (boss.napkinTimer > 0) {
    boss.napkinTimer -= dt;
    boss.attackTimer = Math.max(boss.attackTimer, 0.65);
  } else {
    boss.napkinZone = null;
  }
  if (boss.swingTimer <= 0 && distance(player, boss) < boss.radius + 42) {
    addStuffedStack();
    damagePlayer(boss.enraged ? 14 : 11, "Taco Titan crunch");
    boss.swingTimer = boss.enraged ? 0.82 : 1.05;
  }
  boss.swingTimer -= dt;
  if (boss.attackTimer <= 0 && !boss.tacoPuzzleActive && boss.tacoPuzzleTimer <= 0) {
    spawnTacoPattern();
    boss.attackTimer = boss.enraged ? 1.35 : boss.phase === 3 ? 1.55 : boss.phase === 2 ? 1.75 : 2.05;
  }
}

function updateTacoPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.66 && boss.phase === 1) {
    boss.phase = 2;
    boss.attackTimer = 0.35;
    boss.tacoPuzzleTimer = 0.2;
    boss.tacoPuzzleActive = false;
    log("Phase 2: Taco Titan's shell cracks open.");
    ui.status.textContent = "Taco Titan starts spilling ingredients.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.enraged = true;
    boss.attackTimer = 0.25;
    boss.tacoPuzzleTimer = 0.2;
    boss.tacoPuzzleActive = false;
    if (!boss.tacoFinalFeastAnnounced) {
      boss.tacoFinalFeastAnnounced = true;
      log("Phase 3: Final Feast.");
      showFloat("Final Feast");
    }
  }
}

function spawnTacoPattern() {
  startTacoPuzzleCycle();
}

function updateTacoPuzzle(dt) {
  if (!boss.tacoPuzzleActive) {
    if (boss.tacoPuzzleTimer <= 0 && boss.napkinTimer <= 0) startTacoPuzzleCycle();
    return;
  }
  const current = boss.tacoCurrentIngredient;
  if (current === "lettuce") updateTacoLettuceProgress();
  if (current === "shell") updateTacoShellProgress();
  if (current === "salsa") updateTacoSalsaProgress(dt);
  if (boss.tacoPuzzleResolveTimer <= 0) resolveTacoIngredientStep();
}

function startTacoPuzzleCycle() {
  if (boss.tacoPuzzleActive || boss.napkinTimer > 0) return;
  boss.tacoCycleCount += 1;
  boss.tacoPuzzleStep = 0;
  boss.tacoComboSolved = true;
  boss.tacoIngredientQueue = tacoPuzzleQueueForPhase();
  boss.tacoPuzzleActive = true;
  startTacoIngredientStep();
}

function tacoPuzzleQueueForPhase() {
  if (boss.phase >= 3) {
    const finalCombos = [
      ["shell", "beef", "lettuce"],
      ["cheese", "lettuce", "salsa"],
      ["shell", "cheese", "salsa"],
    ];
    return finalCombos[boss.tacoCycleCount % finalCombos.length].slice();
  }
  if (boss.phase >= 2) {
    const combos = [
      ["beef", "lettuce"],
      ["cheese", "lettuce"],
      ["shell", "salsa"],
    ];
    return combos[boss.tacoCycleCount % combos.length].slice();
  }
  return [["shell"], ["beef"], ["cheese"], ["lettuce"], ["salsa"]][boss.tacoCycleCount % 5].slice();
}

function startTacoIngredientStep() {
  boss.tacoCurrentIngredient = boss.tacoIngredientQueue[boss.tacoPuzzleStep] || null;
  boss.tacoPuzzleFailed = false;
  boss.tacoPuzzleProgress = false;
  if (!boss.tacoCurrentIngredient) {
    finishTacoPuzzleCycle();
    return;
  }
  const duration = boss.phase >= 3 ? 3.2 : boss.phase >= 2 ? 3.6 : 4.0;
  boss.tacoPuzzleResolveTimer = duration;
  boss.tacoObjectiveText = tacoIngredientObjective(boss.tacoCurrentIngredient);
  spawnTacoIngredientMechanic(boss.tacoCurrentIngredient);
  showFloat(tacoIngredientName(boss.tacoCurrentIngredient));
  ui.status.textContent = boss.tacoObjectiveText;
}

function tacoIngredientName(ingredient) {
  return {
    shell: "Shell",
    beef: "Beef",
    cheese: "Cheese",
    lettuce: "Lettuce",
    salsa: "Salsa",
  }[ingredient] || "Ingredient";
}

function tacoIngredientObjective(ingredient) {
  return {
    shell: "Shell: stand in the slam gap to prime a crack.",
    beef: "Beef: bait heavy drops away and dodge the impact.",
    cheese: "Cheese: survive the sticky drop, then look for lettuce.",
    lettuce: "Lettuce: step into the green cleanse lane.",
    salsa: "Salsa: keep moving out of spreading pools.",
  }[ingredient] || "Solve the ingredient mechanic.";
}

function spawnTacoIngredientMechanic(ingredient) {
  if (ingredient === "shell") {
    spawnTacoShellSlam({ puzzle: true });
    spawnTacoCrunchCharge({ allowNapkin: false, puzzle: true });
    return;
  }
  if (ingredient === "beef") {
    spawnIngredientAvalanche(boss.phase >= 3 ? 5 : 3, "beef", { puzzle: true });
    return;
  }
  if (ingredient === "cheese") {
    spawnIngredientAvalanche(boss.phase >= 2 ? 4 : 3, "cheese", { puzzle: true });
    spawnTacoLettuceCleanseZone(1.4);
    return;
  }
  if (ingredient === "lettuce") {
    spawnLettuceFan({ puzzle: true });
    spawnTacoLettuceCleanseZone(0.2);
    return;
  }
  if (ingredient === "salsa") {
    boss.tacoSalsaSafeTimer = 1.4;
    spawnTacoSalsaPools(boss.phase >= 3 ? 4 : 3, { puzzle: true });
    return;
  }
}

function resolveTacoIngredientStep() {
  const ingredient = boss.tacoCurrentIngredient;
  const solved = tacoIngredientSolved(ingredient);
  if (!solved) {
    boss.tacoComboSolved = false;
    addStuffedStack();
    particles.push({ x: player.x, y: player.y - 45, text: "messy", color: "#ffb0a4", ttl: 0.85 });
  } else {
    particles.push({ x: boss.x, y: boss.y - boss.radius - 58, text: `${tacoIngredientName(ingredient)} solved`, color: "#fff4c4", ttl: 0.85 });
  }
  boss.tacoPuzzleStep += 1;
  startTacoIngredientStep();
}

function tacoIngredientSolved(ingredient) {
  if (ingredient === "shell" || ingredient === "lettuce") return Boolean(boss.tacoPuzzleProgress);
  return !boss.tacoPuzzleFailed;
}

function finishTacoPuzzleCycle() {
  boss.tacoPuzzleActive = false;
  boss.tacoCurrentIngredient = null;
  boss.tacoPuzzleResolveTimer = 0;
  if (boss.tacoComboSolved) {
    const chunk = boss.phase >= 3 ? 0.105 : boss.phase >= 2 ? 0.08 : 0.055;
    const duration = boss.phase >= 3 ? 7.5 : boss.phase >= 2 ? 6.5 : 5.5;
    crackTacoShell(chunk, duration);
    if (boss.phase >= 2 || boss.tacoCycleCount % 2 === 0) spawnTacoNapkinFloodNearPlayer();
  } else {
    boss.tacoPuzzleTimer = boss.phase >= 3 ? 2.0 : 2.7;
    ui.status.textContent = "Taco Titan keeps Shell Guard up. Solve the next combo to crack it.";
    showFloat("Shell Guard holds");
  }
}

function crackTacoShell(percent, duration) {
  const chunkDamage = Math.max(1, Math.round(boss.maxHp * percent));
  boss.shellCrackStacks = (boss.shellCrackStacks || 0) + 1;
  boss.shellGuardActive = false;
  boss.hp = Math.max(1, boss.hp - chunkDamage);
  particles.push({ x: boss.x, y: boss.y - boss.radius - 62, text: `Shell Cracked -${chunkDamage}`, color: "#fff4c4", ttl: 1.2 });
  showFloat("Shell Cracked");
  startTacoExposedWindow(duration);
  if (boss.hp <= 1 && boss.shellCrackStacks >= 3) damageBossTarget(boss, boss.hp + 1, "Shell Cracked", { tacoBypassGuard: true });
}

function startTacoExposedWindow(duration) {
  boss.exposedFillingTimer = Math.max(boss.exposedFillingTimer || 0, duration);
  boss.tacoPuzzleTimer = duration + 1.2;
  ui.status.textContent = "Exposed Filling! Burst Taco Titan before Shell Guard returns.";
  showFloat("Exposed Filling");
}

function spawnTacoCrunchCharge(options = {}) {
  const target = bossAimTarget(boss);
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const length = 820;
  const targetPoint = clampArenaPoint(boss.x + Math.cos(angle) * length, boss.y + Math.sin(angle) * length, boss.radius);
  hazards.push({
    type: "tacoCharge",
    x: boss.x,
    y: boss.y,
    targetX: targetPoint.x,
    targetY: targetPoint.y,
    angle,
    length,
    width: boss.phase >= 3 ? 76 : 62,
    warn: boss.enraged ? 0.72 : 0.92,
    ttl: boss.enraged ? 1.08 : 1.32,
    damage: boss.enraged ? 16 : 13,
    hit: false,
    tacoPuzzleIngredient: options.puzzle ? "shell" : null,
  });
  if (options.allowNapkin !== false && canSpawnTacoNapkinFlood()) spawnTacoNapkinFlood(targetPoint.x - Math.cos(angle) * 150, targetPoint.y - Math.sin(angle) * 150);
  log("Crunch Charge lane.");
}

function spawnTacoNapkinFloodNearPlayer() {
  const offset = pointFromAngle(player.x, player.y, movementOrAimAngle() + Math.PI, 135);
  spawnTacoNapkinFlood(offset.x, offset.y);
}

function spawnTacoNapkinFlood(x, y) {
  if (!canSpawnTacoNapkinFlood()) return;
  const size = tacoNapkinSize();
  const safeX = clamp(x, world.arena.x + size.w / 2 + 24, world.arena.x + world.arena.w - size.w / 2 - 24);
  const safeY = clamp(y, world.arena.y + size.h / 2 + 24, world.arena.y + world.arena.h - size.h / 2 - 24);
  const delay = boss.enraged ? 3.35 : boss.phase >= 2 ? 3.75 : 4.1;
  boss.napkinTimer = delay + 1.5;
  boss.tacoFloodCountdown = delay;
  boss.napkinCooldownTimer = boss.enraged ? 13.5 : boss.phase >= 2 ? 15.5 : 17.5;
  boss.napkinUses += 1;
  boss.napkinZone = { x: safeX, y: safeY, w: size.w, h: size.h };
  hazards.push({
    type: "tacoIngredientFlood",
    x: world.arena.x + world.arena.w / 2,
    y: world.arena.y + world.arena.h / 2,
    warn: delay,
    warningDuration: delay,
    ttl: delay + 1.5,
    safeX,
    safeY,
    safeW: size.w,
    safeH: size.h,
    cleared: false,
    hit: false,
  });
  log("Napkin safe spot.");
}

function canSpawnTacoNapkinFlood() {
  return boss.napkinTimer <= 0 && boss.napkinCooldownTimer <= 0 && !hazards.some((hazard) => hazard.type === "tacoIngredientFlood");
}

function tacoNapkinSize() {
  const shrink = Math.max(0, boss.napkinUses || 0);
  return {
    w: Math.max(142, 216 - shrink * 24),
    h: Math.max(96, 148 - shrink * 16),
  };
}

function isPlayerOnTacoNapkin(zone) {
  if (!zone) return false;
  const halfW = (zone.w || zone.safeW || 120) / 2;
  const halfH = (zone.h || zone.safeH || 80) / 2;
  return Math.abs(player.x - (zone.x ?? zone.safeX)) <= halfW && Math.abs(player.y - (zone.y ?? zone.safeY)) <= halfH;
}

function clearTacoHazardsForNapkinFlood(floodHazard) {
  const clearedTypes = new Set(["tacoCharge", "tacoShellShard", "ingredientDrop", "tacoSalsa", "tacoSlam", "lettuceLeaf", "tacoGrease", "tacoCheese", "lettuceCleanseZone"]);
  hazards.forEach((hazard) => {
    if (hazard === floodHazard || !clearedTypes.has(hazard.type)) return;
    hazard.ttl = 0;
    hazard.warn = 0;
  });
  particles.push({ x: floodHazard.safeX, y: floodHazard.safeY - 44, text: "clear", color: "#f5f5e6", ttl: 0.6 });
}

function spawnIngredientAvalanche(count, forcedIngredient = null, options = {}) {
  const ingredients = ["cheese", "lettuce", "beef", "salsa"];
  for (let i = 0; i < count; i += 1) {
    const point = randomArenaPointNearThreat(260, 70);
    hazards.push({
      type: "ingredientDrop",
      ingredient: forcedIngredient || ingredients[(i + Math.floor(Math.random() * ingredients.length)) % ingredients.length],
      x: point.x,
      y: point.y,
      r: 24 + Math.random() * 12,
      warn: 0.78 + i * 0.1,
      ttl: 1.32 + i * 0.1,
      damage: 8,
      hit: false,
      tacoPuzzleIngredient: options.puzzle ? forcedIngredient : null,
    });
  }
  log("Ingredient avalanche.");
}

function spawnTacoShellSlam(options = {}) {
  const target = bossAimTarget(boss);
  hazards.push({
    type: "tacoSlam",
    x: target.x,
    y: target.y,
    r: boss.phase >= 3 ? 124 : 106,
    inner: 44,
    gapAngle: Math.atan2(player.y - boss.y, player.x - boss.x) + Math.PI,
    warn: 0.95,
    ttl: 1.35,
    damage: boss.phase >= 2 ? 14 : 12,
    hit: false,
    tacoPuzzleIngredient: options.puzzle ? "shell" : null,
  });
}

function spawnLettuceFan(options = {}) {
  const target = bossAimTarget(boss);
  const baseAngle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const count = boss.phase >= 3 ? 13 : boss.phase >= 2 ? 10 : 7;
  for (let i = 0; i < count; i += 1) {
    const spread = -0.72 + (1.44 * i) / Math.max(1, count - 1);
    const angle = baseAngle + spread;
    hazards.push({
      type: "lettuceLeaf",
      x: boss.x + Math.cos(angle) * 72,
      y: boss.y + Math.sin(angle) * 72,
      vx: Math.cos(angle) * 185,
      vy: Math.sin(angle) * 185,
      wobble: Math.random() * Math.PI * 2,
      r: 13,
      ttl: 3.1,
      damage: 8,
      tacoPuzzleIngredient: options.puzzle ? "lettuce" : null,
    });
  }
}

function spawnTacoSalsaPools(count, options = {}) {
  for (let i = 0; i < count; i += 1) {
    const point = randomArenaPointNearThreat(220, 80);
    hazards.push({ type: "tacoSalsa", x: point.x, y: point.y, r: 48, warn: 0.55, ttl: 5.2, damage: 10, damageTimer: 0, tacoPuzzleIngredient: options.puzzle ? "salsa" : null });
  }
}

function spawnTacoLettuceCleanseZone(delay = 0.2) {
  const point = randomArenaPointNearThreat(190, 90);
  hazards.push({
    type: "lettuceCleanseZone",
    x: point.x,
    y: point.y,
    r: 58,
    warn: delay,
    ttl: 4.8,
    pulse: 0,
  });
}

function markTacoPuzzleFailure(ingredient) {
  if (boss.kind !== "taco" || !boss.tacoPuzzleActive) return;
  if (boss.tacoCurrentIngredient !== ingredient) return;
  boss.tacoPuzzleFailed = true;
}

function markTacoPuzzleProgress(ingredient) {
  if (boss.kind !== "taco" || !boss.tacoPuzzleActive) return;
  if (boss.tacoCurrentIngredient !== ingredient) return;
  boss.tacoPuzzleProgress = true;
}

function updateTacoLettuceProgress() {
  const zone = hazards.find((hazard) => hazard.type === "lettuceCleanseZone" && hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r);
  if (zone) markTacoPuzzleProgress("lettuce");
}

function updateTacoShellProgress() {
  const slam = hazards.find((hazard) => hazard.type === "tacoSlam" && hazard.tacoPuzzleIngredient === "shell");
  if (!slam || slam.warn > 0) return;
  const dist = distance(player, slam);
  const angleToPlayer = Math.atan2(player.y - slam.y, player.x - slam.x);
  const inGap = Math.abs(angleDifference(angleToPlayer, slam.gapAngle)) < 0.46;
  if ((dist < slam.r && dist > slam.inner && inGap) || dist <= slam.inner) markTacoPuzzleProgress("shell");
}

function updateTacoSalsaProgress(dt) {
  boss.tacoSalsaSafeTimer = Math.max(0, (boss.tacoSalsaSafeTimer || 0) - dt);
  if (boss.tacoSalsaSafeTimer <= 0 && !boss.tacoPuzzleFailed) boss.tacoPuzzleProgress = true;
}

function addStuffedStack() {
  player.stuffedStacks = Math.min(7, (player.stuffedStacks || 0) + 1);
  showFloat(`Stuffed ${player.stuffedStacks}/7`);
  if (player.stuffedStacks >= 7) {
    player.stuffedStacks = 0;
    player.freezeTimer = Math.max(player.freezeTimer, 0.55);
    damagePlayer(12, "Too stuffed", { fixed: true });
  }
}

function updateDonutDonald(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  if (boss.glazeRingLockTimer > 0) {
    boss.glazeRingLockTimer -= dt;
  }
  updateDonutPhase();
  updateDonutGauntlet(dt);
  updateDonutMinions(dt);
  if (boss.donutGauntletActive) return;
  updateDonutHoles(dt);
  if (boss.sugarRushTimer > 0) {
    boss.sugarRushTimer -= dt;
    player.guardSpeedTimer = Math.max(player.guardSpeedTimer, 0.12);
  }
  if (boss.attackTimer <= 0) {
    spawnDonutPattern();
    boss.attackTimer = boss.enraged ? attackInterval("donut") : isDonutHolePhase() ? combatTuning.attackIntervals.donut.holes : attackInterval("donut");
  }
}

function updateDonutPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.84 && boss.phase === 1) {
    boss.phase = 2;
    boss.donutHoles = createDonutHoles(2);
    boss.attackTimer = combatTuning.phaseDelay.medium;
    log("Phase 2: Donut Donald calls the donut holes.");
  }
  if (hpPercent <= 0.67 && boss.phase === 2 && !boss.donutGauntletCompleted) {
    boss.phase = 3;
    startDonutGauntlet();
  }
  if (hpPercent <= 0.42 && boss.phase === 4) {
    boss.phase = 5;
    boss.donutHoles = createDonutHoles(2);
    boss.attackTimer = combatTuning.phaseDelay.medium;
    log("Phase 5: Donut Donald repeats the donut hole pressure.");
    showFloat("Phase 5");
  }
  if (hpPercent <= 0.21 && boss.phase === 5) {
    boss.phase = 6;
    boss.enraged = true;
    boss.donutHoles = createDonutHoles(4);
    boss.attackTimer = combatTuning.phaseDelay.medium;
    log("Phase 6: Grand Finale.");
    showFloat("Grand Finale");
  }
}

function startDonutGauntlet() {
  boss.donutGauntletActive = true;
  boss.donutGauntletTimer = combatTuning.donut.gauntletDuration;
  boss.donutGauntletSpawnTimer = 0.75;
  boss.donutHoles = [];
  boss.donutMinions = [];
  boss.attackTimer = 99;
  boss.glazeRingLockTimer = 0;
  boss.x = world.arena.x + world.arena.w / 2;
  boss.y = world.arena.y - 180;
  boss.invulnerableTimer = combatTuning.donut.gauntletDuration + 0.5;
  log("Phase 3: Donut onslaught.");
  ui.status.textContent = "Donut Donald leaps away. Survive the donut onslaught!";
  showFloat(`Survive ${combatTuning.donut.gauntletDuration} seconds`);
}

function updateDonutGauntlet(dt) {
  if (!boss.donutGauntletActive) return;
  boss.donutGauntletTimer -= dt;
  boss.donutGauntletSpawnTimer -= dt;
  if (boss.donutGauntletSpawnTimer <= 0) {
    spawnDonutMinionWave();
    boss.donutGauntletSpawnTimer = boss.donutGauntletTimer > combatTuning.donut.gauntletDuration / 2 ? combatTuning.donut.gauntletEarlySpawn : combatTuning.donut.gauntletLateSpawn;
  }
  if (boss.donutGauntletTimer <= 0) {
    finishDonutGauntlet();
  }
}

function finishDonutGauntlet() {
  boss.donutGauntletActive = false;
  boss.donutGauntletCompleted = true;
  boss.phase = 4;
  boss.enraged = false;
  boss.invulnerableTimer = 0;
  boss.donutMinions = [];
  boss.donutHoles = [];
  boss.x = world.arena.x + world.arena.w - 230;
  boss.y = world.arena.y + world.arena.h / 2;
  boss.attackTimer = combatTuning.phaseDelay.medium;
  hazards = hazards.filter((hazard) => !hazard.donutMinionHazard);
  log("Phase 4: Donut Donald returns.");
  showFloat("Donald returns");
}

function isDonutHolePhase() {
  return boss.phase === 2 || boss.phase === 5 || boss.phase === 6;
}

function isDonutFinalPhase() {
  return boss.phase === 6;
}

function createDonutHoles(count) {
  const holeHp = Math.round((isDonutFinalPhase() ? 58 : 78) * 1.35);
  return Array.from({ length: count }, (_, index) => ({
    angle: (Math.PI * 2 * index) / count,
    r: 18,
    fireTimer: 0.95 + index * 0.22,
    hp: holeHp,
    maxHp: holeHp,
  }));
}

function updateDonutHoles(dt) {
  boss.donutHoles = boss.donutHoles.filter((hole) => hole.hp > 0);
  boss.donutHoles.forEach((hole, index) => {
    hole.angle += (boss.enraged ? 1.16 : 0.92) * dt;
    const orbit = isDonutFinalPhase() ? 128 : 112;
    hole.x = boss.x + Math.cos(hole.angle) * orbit;
    hole.y = boss.y + Math.sin(hole.angle) * orbit * 0.72;
    hole.fireTimer -= dt;
    if (hole.fireTimer <= 0) {
      spawnDonutHoleSprinkles(hole);
      hole.fireTimer = boss.enraged ? 1.2 + index * 0.08 : 1.48 + index * 0.1;
    }
  });
}

function updateDonutMinions(dt) {
  boss.donutMinions = (boss.donutMinions || []).filter((minion) => minion.hp > 0 && minion.ttl > 0);
  boss.donutMinions.forEach((minion) => {
    minion.ttl -= dt;
    minion.fireTimer -= dt;
    minion.animationTime = (minion.animationTime || 0) + dt;
    const targetAngle = Math.atan2(player.y - minion.y, player.x - minion.x);
    if (minion.kind === "crawler") {
      minion.x += Math.cos(targetAngle) * minion.speed * dt;
      minion.y += Math.sin(targetAngle) * minion.speed * dt;
      if (distance(player, minion) < player.radius + minion.r) {
        damagePlayer(13, "Donut crawler");
        knockPlayerFrom(minion.x, minion.y, 190);
        minion.ttl = 0;
      }
    } else if (minion.kind === "shooter") {
      minion.x += Math.cos(minion.driftAngle) * minion.speed * dt;
      minion.y += Math.sin(minion.driftAngle) * minion.speed * dt;
      if (minion.fireTimer <= 0) {
        spawnDonutMinionShot(minion, targetAngle);
        minion.fireTimer = 1.1;
      }
    } else if (minion.kind === "glazer") {
      minion.x += Math.cos(minion.driftAngle) * minion.speed * dt;
      minion.y += Math.sin(minion.driftAngle) * minion.speed * dt;
      if (minion.fireTimer <= 0) {
        spawnMiniGlazeBurst(minion);
        minion.fireTimer = 2.4;
      }
    }
    minion.x = clamp(minion.x, world.arena.x + minion.r, world.arena.x + world.arena.w - minion.r);
    minion.y = clamp(minion.y, world.arena.y + minion.r, world.arena.y + world.arena.h - minion.r);
  });
}

function spawnDonutMinionWave() {
  const elapsed = combatTuning.donut.gauntletDuration - boss.donutGauntletTimer;
  const count = elapsed > 20 ? 4 : elapsed > 10 ? 3 : 2;
  for (let i = 0; i < count; i += 1) {
    spawnDonutMinion(i, elapsed);
  }
  log("Donut onslaught wave.");
}

function spawnDonutMinion(index, elapsed) {
  const spawn = randomArenaEdgePoint();
  const types = elapsed > 16 ? ["crawler", "shooter", "glazer"] : elapsed > 8 ? ["crawler", "crawler", "shooter"] : ["crawler", "shooter"];
  const kind = types[(index + Math.floor(Math.random() * types.length)) % types.length];
  const stats = {
    crawler: { r: 22, hp: 64, speed: 106, color: "#c7834f" },
    shooter: { r: 20, hp: 58, speed: 44, color: "#f7b7d3" },
    glazer: { r: 24, hp: 78, speed: 36, color: "#ffe36e" },
  }[kind];
  boss.donutMinions.push({
    kind,
    x: spawn.x,
    y: spawn.y,
    r: stats.r,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    color: stats.color,
    driftAngle: Math.random() * Math.PI * 2,
    fireTimer: 0.45 + index * 0.28,
    ttl: 18,
    animationTime: 0,
  });
}

function spawnDonutMinionShot(minion, angle) {
  for (let i = -0.5; i <= 0.5; i += 1) {
    const shotAngle = angle + i * 0.16;
    hazards.push({
      type: "sprinkle",
      donutMinionHazard: true,
      x: minion.x,
      y: minion.y,
      vx: Math.cos(shotAngle) * 205,
      vy: Math.sin(shotAngle) * 205,
      r: 6,
      ttl: 2.6,
      damage: 7,
      color: "#ffb6d1",
    });
  }
}

function spawnMiniGlazeBurst(minion) {
  const count = 8;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    hazards.push({
      type: "sprinkle",
      donutMinionHazard: true,
      x: minion.x,
      y: minion.y,
      vx: Math.cos(angle) * 165,
      vy: Math.sin(angle) * 165,
      r: 7,
      ttl: 2.4,
      damage: 8,
      color: "#ffe36e",
    });
  }
  particles.push({ x: minion.x, y: minion.y - 26, text: "glaze", color: "#ffe36e", ttl: 0.55 });
}

function spawnDonutPattern() {
  const roll = Math.random();
  if (roll < 0.3 && boss.glazeRingLockTimer <= 0) {
    spawnGlazeRing(isDonutFinalPhase() ? 4 : 1);
  } else if (roll < 0.55) {
    spawnSprinkleSpiral();
  } else if (roll < 0.76) {
    spawnFrostingRibbon();
  } else {
    spawnRoyalRoll();
    if (isDonutHolePhase()) spawnSugarRushZone();
  }
}

function spawnGlazeRing(count) {
  if (boss.glazeRingLockTimer > 0) return;
  const playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
  const baseOffset = (Math.random() > 0.5 ? 1 : -1) * (isDonutFinalPhase() ? 0.72 : 0.62);
  const stagger = isDonutFinalPhase() ? combatTuning.donut.glazeFinalStagger : combatTuning.donut.glazeNormalStagger;
  boss.glazeRingLockTimer = 0.46 + (count - 1) * stagger + 0.7;
  for (let i = 0; i < count; i += 1) {
    const alternatingOffset = baseOffset * (i % 2 === 0 ? 1 : -1);
    const drift = (i - (count - 1) / 2) * 0.16;
    hazards.push({
      type: "glazeRing",
      x: boss.x,
      y: boss.y,
      radiusNow: 34,
      maxRadius: 520,
      gapAngle: playerAngle + alternatingOffset + drift,
      gapWidth: isDonutFinalPhase() ? 0.94 : 1.08,
      speed: boss.enraged ? 226 : 198,
      spinSpeed: boss.enraged ? 0.5 : 0.34,
      delay: i * stagger,
      warn: 0.46 + i * stagger,
      ttl: 3.35 + i * stagger,
      damage: boss.enraged ? 26 : 21,
      hit: false,
    });
  }
  log("Glaze rings expanding.");
}

function spawnSprinkleSpiral() {
  const count = boss.enraged ? 18 : isDonutHolePhase() ? 15 : 13;
  const twist = Math.random() > 0.5 ? 1 : -1;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + boss.animationTime * 0.8;
    hazards.push({
      type: "sprinkle",
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 190,
      vy: Math.sin(angle) * 190,
      turn: twist * 0.24,
      r: 7,
      ttl: 3.2,
      damage: boss.enraged ? 9 : 8,
      color: i % 3 === 0 ? "#ff79aa" : i % 3 === 1 ? "#8ec7ff" : "#ffe36e",
    });
  }
}

function spawnDonutHoleSprinkles(hole) {
  const target = bossAimTarget(hole);
  const angle = Math.atan2(target.y - hole.y, target.x - hole.x);
  for (let i = -0.5; i <= 0.5; i += 1) {
    const shotAngle = angle + i * 0.18;
    hazards.push({
      type: "sprinkle",
      x: hole.x,
      y: hole.y,
      vx: Math.cos(shotAngle) * 225,
      vy: Math.sin(shotAngle) * 225,
      r: 6,
      ttl: 2.3,
      damage: 7,
      color: "#ffb6d1",
    });
  }
}

function spawnFrostingRibbon() {
  const target = bossAimTarget(boss);
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  hazards.push({
    type: "frostingRibbon",
    x: boss.x,
    y: boss.y,
    angle,
    length: 740,
    width: isDonutFinalPhase() ? 54 : 42,
    warn: 0.76,
    ttl: 3.2,
    damageTimer: 0,
    damage: 12,
  });
}

function spawnRoyalRoll() {
  const target = bossAimTarget(boss);
  const startX = boss.x;
  const startY = boss.y;
  const angle = Math.atan2(target.y - startY, target.x - startX);
  const rollDistance = isDonutFinalPhase() ? 680 : 600;
  const end = clampArenaPoint(startX + Math.cos(angle) * rollDistance, startY + Math.sin(angle) * rollDistance, boss.radius);
  const actualLength = Math.hypot(end.x - startX, end.y - startY);
  hazards.push({
    type: "royalRoll",
    x: startX,
    y: startY,
    startX,
    startY,
    endX: end.x,
    endY: end.y,
    prevX: startX,
    prevY: startY,
    angle,
    length: actualLength,
    width: isDonutFinalPhase() ? 86 : 70,
    warn: boss.enraged ? 0.9 : 1.05,
    ttl: boss.enraged ? 1.82 : 2.06,
    rollAge: 0,
    rollDuration: boss.enraged ? 0.82 : 0.96,
    damage: boss.enraged ? 29 : 24,
    hit: false,
  });
  boss.animation = "royalRollWindup";
  log("Royal Roll windup.");
}

function spawnSugarRushZone() {
  const point = randomArenaPointNearThreat(260, 120);
  hazards.push({ type: "sugarZone", x: point.x, y: point.y, r: 42, warn: 0, ttl: 4.4, damage: 0 });
}

function randomArenaEdgePoint() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: world.arena.x + 40, y: world.arena.y + Math.random() * world.arena.h };
  if (side === 1) return { x: world.arena.x + world.arena.w - 40, y: world.arena.y + Math.random() * world.arena.h };
  if (side === 2) return { x: world.arena.x + Math.random() * world.arena.w, y: world.arena.y + 40 };
  return { x: world.arena.x + Math.random() * world.arena.w, y: world.arena.y + world.arena.h - 40 };
}

function updateSushiSerpent(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.attackTimer -= dt;
  boss.serpentAngle += dt * (boss.enraged ? 1.25 : 0.86);
  boss.serpentWeakTimer -= dt;
  updateSushiPhase();
  updateSushiMovement(dt);
  if (boss.serpentWeakTimer <= 0) {
    boss.serpentWeakIndex = 1 + Math.floor(Math.random() * (sushiSegmentCount() - 2));
    boss.serpentWeakTimer = boss.enraged ? 1.9 : 2.7;
  }
  if (boss.whirlpoolTimer > 0) {
    boss.whirlpoolTimer -= dt;
    pullPlayerToward(world.arena.x + world.arena.w / 2, world.arena.y + world.arena.h / 2, 34 * dt);
  }
  if (boss.attackTimer <= 0) {
    spawnSushiPattern();
    boss.attackTimer = boss.enraged ? 1.18 : boss.phase === 3 ? 1.34 : boss.phase === 2 ? 1.56 : 1.85;
  }
}

function updateSushiPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.66 && boss.phase === 1) {
    boss.phase = 2;
    boss.attackTimer = 0.35;
    log("Phase 2: Split Roll.");
    ui.status.textContent = "Sushi Serpent splits into faster patterns.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.enraged = true;
    boss.attackTimer = 0.25;
    log("Phase 3: Dragon Roll.");
    showFloat("Dragon Roll");
  }
}

function updateSushiMovement(dt) {
  const target = bossAimTarget(boss);
  const orbit = 210 + Math.sin(boss.animationTime * 1.25) * 70;
  const preferred = pointFromAngle(target.x, target.y, boss.serpentAngle, orbit);
  const point = clampArenaPoint(preferred.x, preferred.y, boss.radius);
  const dx = point.x - boss.x;
  const dy = point.y - boss.y;
  const desiredHeading = Math.atan2(dy, dx);
  boss.serpentHeading += angleDifference(desiredHeading, boss.serpentHeading) * Math.min(1, dt * 3.2);
  const speed = boss.enraged ? 185 : boss.phase >= 2 ? 160 : 140;
  const distanceToTarget = Math.hypot(dx, dy);
  const step = Math.min(distanceToTarget, speed * dt);
  boss.x += Math.cos(boss.serpentHeading) * step;
  boss.y += Math.sin(boss.serpentHeading) * step;
  const clamped = clampArenaPoint(boss.x, boss.y, boss.radius);
  boss.x = clamped.x;
  boss.y = clamped.y;
  updateSushiBodyChain();
}

function sushiSegmentCount() {
  return boss.phase >= 3 ? 9 : boss.phase >= 2 ? 7 : 6;
}

function sushiSegmentSpacing() {
  return 58;
}

function updateSushiBodyChain() {
  const count = sushiSegmentCount();
  const spacing = sushiSegmentSpacing();
  if (!boss.serpentBody || boss.serpentBody.length !== count) {
    initializeSushiTrail(boss);
  }

  const body = boss.serpentBody;
  body[0].x = boss.x;
  body[0].y = boss.y;
  body[0].heading = boss.serpentHeading;

  for (let i = 1; i < body.length; i += 1) {
    const leader = body[i - 1];
    const segment = body[i];
    const dx = segment.x - leader.x;
    const dy = segment.y - leader.y;
    const dist = Math.hypot(dx, dy) || spacing;
    const angleFromLeader = Math.atan2(dy, dx);
    const targetX = leader.x + Math.cos(angleFromLeader) * spacing;
    const targetY = leader.y + Math.sin(angleFromLeader) * spacing;
    const follow = 0.36;
    segment.x += (targetX - segment.x) * follow;
    segment.y += (targetY - segment.y) * follow;
    segment.heading = Math.atan2(leader.y - segment.y, leader.x - segment.x);
    if (dist > spacing * 1.45) {
      segment.x = targetX;
      segment.y = targetY;
    }
  }
}

function sushiSegments() {
  const count = sushiSegmentCount();
  if (!boss.serpentBody || boss.serpentBody.length !== count) initializeSushiTrail(boss);
  updateSushiBodyChain();
  const segments = [];
  for (let i = 0; i < count; i += 1) {
    const bodySegment = boss.serpentBody[i];
    const angle = bodySegment.heading ?? boss.serpentHeading;
    const wave = Math.sin(boss.animationTime * 4.2 - i * 0.68) * (i === 0 ? 0 : 8);
    const sway = Math.min(1, i / 3);
    const baseX = bodySegment.x;
    const baseY = bodySegment.y;
    segments.push({
      x: baseX + Math.cos(angle + Math.PI / 2) * wave * sway,
      y: baseY + Math.sin(angle + Math.PI / 2) * wave * sway,
      heading: angle,
      r: Math.max(24, 52 - i * 2.15),
      index: i,
      weak: i === boss.serpentWeakIndex || (boss.phase >= 3 && i === boss.serpentWeakIndex + 2),
    });
  }
  return segments;
}

function spawnSushiPattern() {
  const roll = Math.random();
  if (roll < 0.28) {
    spawnWasabiWave();
  } else if (roll < 0.5) {
    spawnChopstickPins(boss.phase >= 3 ? 3 : boss.phase >= 2 ? 2 : 1);
  } else if (roll < 0.72) {
    spawnSoySplash(boss.phase >= 3 ? 3 : 2);
  } else {
    spawnSerpentSweep();
    if (boss.phase >= 3 && Math.random() < 0.45) startSoyWhirlpool();
  }
}

function spawnWasabiWave() {
  const vertical = Math.random() > 0.5;
  const fromHighSide = Math.random() > 0.5;
  const width = boss.phase >= 3 ? 32 : 28;
  hazards.push({
    type: "wasabiWave",
    x: vertical ? (fromHighSide ? world.arena.x + world.arena.w + width : world.arena.x - width) : world.arena.x,
    y: vertical ? world.arena.y : (fromHighSide ? world.arena.y + world.arena.h + width : world.arena.y - width),
    axis: vertical ? "vertical" : "horizontal",
    direction: fromHighSide ? -1 : 1,
    warn: boss.enraged ? 0.9 : 1.08,
    ttl: boss.enraged ? 3.65 : 4.25,
    speed: boss.enraged ? 235 : 195,
    width,
    damage: boss.enraged ? 7 : 5,
    hit: false,
  });
}

function spawnChopstickPins(count) {
  for (let i = 0; i < count; i += 1) {
    const target = bossAimTarget(boss);
    const vertical = i % 2 === 0;
    hazards.push({
      type: "chopstickPin",
      x: clamp(target.x + (Math.random() - 0.5) * 260, world.arena.x + 70, world.arena.x + world.arena.w - 70),
      y: clamp(target.y + (Math.random() - 0.5) * 220, world.arena.y + 70, world.arena.y + world.arena.h - 70),
      vertical,
      warn: 0.9 + i * 0.12,
      ttl: 1.68 + i * 0.12,
      damage: 6,
      hit: false,
    });
  }
}

function spawnSoySplash(count) {
  for (let i = 0; i < count; i += 1) {
    const point = randomArenaPointNearThreat(260, 90);
    hazards.push({ type: "soyPuddle", x: point.x, y: point.y, r: 38, warn: 0.58 + i * 0.08, ttl: 3.4, damage: 3, damageTimer: 0 });
  }
}

function spawnSerpentSweep() {
  const target = bossAimTarget(boss);
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  hazards.push({
    type: "serpentSweep",
    x: boss.x,
    y: boss.y,
    angle,
    length: 560,
    width: boss.phase >= 3 ? 68 : 56,
    warn: 0.95,
    ttl: 1.55,
    damage: 8,
    hit: false,
  });
}

function startSoyWhirlpool() {
  boss.whirlpoolTimer = boss.phase >= 3 ? 1.9 : 1.4;
  particles.push({ x: world.arena.x + world.arena.w / 2, y: world.arena.y + world.arena.h / 2 - 40, text: "whirlpool", color: "#5a3a2f", ttl: 0.9 });
}

function pullPlayerToward(x, y, amount) {
  if (player.dead || player.won) return;
  const angle = Math.atan2(y - player.y, x - player.x);
  const nextX = player.x + Math.cos(angle) * amount;
  const nextY = player.y + Math.sin(angle) * amount;
  const point = constrainToRoom(nextX, nextY, player.x, player.y);
  player.x = point.x;
  player.y = point.y;
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

function clampCombatPoint(x, y, radius) {
  const bounds = currentBounds();
  return {
    x: clamp(x, bounds.x + radius + 24, bounds.x + bounds.w - radius - 24),
    y: clamp(y, bounds.y + radius + 24, bounds.y + bounds.h - radius - 24),
  };
}

function coopThreatTargets() {
  const targets = [];
  if (player.room === "arena" && !player.dead) {
    targets.push({ x: player.x, y: player.y, radius: player.radius, local: true });
  }
  multiplayer.peers.forEach((peer) => {
    if (peer.room !== "arena" || peer.dead || peer.bossKind !== boss.kind) return;
    targets.push({ x: peer.x, y: peer.y, radius: 18, local: false });
  });
  return targets.filter((target) => Number.isFinite(target.x) && Number.isFinite(target.y));
}

function bossAimTarget(origin = boss) {
  const targets = coopThreatTargets();
  if (!targets.length) return player;
  if (targets.length === 1) return targets[0];
  const nearest = targets.slice().sort((a, b) => distance(origin, a) - distance(origin, b))[0];
  return Math.random() < 0.58 ? nearest : targets[Math.floor(Math.random() * targets.length)];
}

function randomArenaPointNearThreat(spread, minDistance = 0) {
  const target = bossAimTarget();
  let point = null;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    point = {
      x: clamp(target.x + (Math.random() - 0.5) * spread * 2, world.arena.x + 110, world.arena.x + world.arena.w - 110),
      y: clamp(target.y + (Math.random() - 0.5) * spread * 2, world.arena.y + 95, world.arena.y + world.arena.h - 95),
    };
    if (!minDistance || distance(point, target) >= minDistance) return point;
  }
  return point || randomPizzaArenaPoint(95);
}

function shootAt(x, y) {
  if (mazeState?.rewardPending) return;
  if (player.attackCooldown > 0) return;
  const targetPoint = player.room === "starter" ? trainingDummy : { x, y };
  const dx = targetPoint.x - player.x;
  const dy = targetPoint.y - player.y;
  if (Math.hypot(dx, dy) < 6) return;
  if (player.room === "arena") startFight();
  player.facing = getFacing(dx, dy);
  const projectile = firePlayerProjectile(Math.atan2(dy, dx));
  if (player.room === "starter" && projectile) {
    projectile.hitTargets = [trainingDummy];
    damageTrainingDummy(trainingDummy, projectile.damage, "Training Hit");
  }
}

function firePlayerProjectile(angle) {
  if (player.attackCooldown > 0) return null;
  const weapon = gear.weapon[player.gear.weapon];
  const speed = projectileSpeedForWeapon(weapon.tag);
  const magicAttack = weapon.tag === "Magic";
  const rangedAttack = weapon.tag === "Ranged";
  const meleeAttack = isWarriorTag(weapon.tag);
  const rogueAttack = weapon.tag === "Rogue";
  const projectile = {
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
    room: player.room,
  };
  playerProjectiles.push(projectile);
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
  player.attackCooldown = basicAttackCooldown(weapon);
  ui.status.textContent = meleeAttack || rogueAttack ? `Slashing ${weapon.name}.` : `Firing ${weapon.name}.`;
  multiplayer.attackSeq += 1;
  sendMultiplayerEvent({
    kind: "attack",
    seq: multiplayer.attackSeq,
    x: player.x,
    y: player.y,
    angle,
    weaponTag: weapon.tag,
    color: magicAttack ? "#48efe4" : weapon.color,
    heavy: magicAttack,
  });
  return projectile;
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

function basicAttackCooldown(weapon) {
  return weapon.speed * (1 - (runState.mazeBuffs.attackSpeed || 0));
}

function useAbility(index) {
  if (mazeState?.rewardPending) return;
  if (player.dead || player.won || (player.room !== "arena" && player.room !== "starter" && player.room !== "maze")) return;
  const ability = currentAbilities()[index];
  if (!ability || player.abilityCooldowns[index] > 0) return;
  if (player.room === "arena") startFight();
  if (currentClassKey() === "melee") useMeleeAbility(index, ability);
  if (currentClassKey() === "ranger") useRangerAbility(index, ability);
  if (currentClassKey() === "mage") useMageAbility(index, ability);
  if (currentClassKey() === "rogue") useRogueAbility(index, ability);
  if (currentClassKey() === "paladin") usePaladinAbility(index, ability);
}

function abilityIndexForKey(event) {
  const pressed = event.code === "Space" ? "space" : event.key.toLowerCase();
  return currentAbilities().findIndex((ability) => ability.key.toLowerCase() === pressed);
}

function spendAbility(index, ability) {
  player.abilityCooldowns[index] = ability.cooldown * talentAbilityCooldownMultiplier(index);
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
    groundbreaker();
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    whirlwindDash();
    return;
  }
  spendAbility(index, ability);
  player.shieldWallTimer = 10;
  if (hasTalent("melee_iron_wall")) player.shieldWallTimer += 3;
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "shieldWall");
  abilityEffects.push({ type: "shieldWall", x: player.x, y: player.y, r: 52, ttl: player.shieldWallTimer, maxTtl: player.shieldWallTimer });
}

function shieldBash() {
  const angle = aimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.meleeAttackTimer = 0.3;
  player.meleeAttackAngle = angle;
  const range = hasTalent("melee_earth_bash") ? 176 : 138;
  const halfAngle = Math.PI * 0.36;
  const hit = damageEnemiesInCone(player.x, player.y, angle, range, halfAngle, Math.round(player.stats.damage * (hasTalent("melee_earth_bash") ? 0.92 : 0.72)), "Shield Bash");
  hit.forEach((target) => {
    interruptTarget(target);
    shoveTarget(target, player.x, player.y, 54);
  });
  const blocked = destroyProjectilesInCone(player.x, player.y, angle, range + 22, halfAngle + 0.08);
  if (blocked > 0 && hasTalent("melee_iron_heal")) player.hp = Math.min(player.maxHp, player.hp + blocked * 2);
  if (blocked > 0) particles.push({ x: player.x, y: player.y - 48, text: `blocked ${blocked}`, color: "#f0d47c", ttl: 0.7 });
  abilityEffects.push({ type: "shieldBash", x: player.x, y: player.y, angle, range, ttl: 0.24, maxTtl: 0.24 });
}

function groundbreaker() {
  player.meleeAttackTimer = 0.4;
  player.meleeAttackAngle = movementOrAimAngle();
  const radius = 142 + (hasTalent("melee_earth_radius") ? 28 : 0);
  const hits = damageEnemiesInRadius(player.x, player.y, radius, Math.round(player.stats.damage * 1.18), "Groundbreaker");
  hits.forEach((target) => {
    interruptTarget(target);
    shoveTarget(target, player.x, player.y, 42);
    if (hasTalent("melee_blood_hemo") && target.bleedTimer > 0) damageBossTarget(target, Math.round(player.stats.damage * 0.38), "Hemorrhage");
  });
  if (hasTalent("melee_earth_after")) {
    abilityEffects.push({ type: "aftershock", x: player.x, y: player.y, r: radius * 0.8, ttl: 0.42, maxTtl: 0.42, pulseTimer: 0.28 });
  }
  if (hasTalent("melee_earth_cap")) destroyProjectilesInRadius(player.x, player.y, radius + 24);
  abilityEffects.push({ type: "groundbreaker", x: player.x, y: player.y, r: radius, ttl: 0.48, maxTtl: 0.48 });
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
    arrowStorm();
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    tumbleShot(angle);
    return;
  }
  spendAbility(index, ability);
  abilityEffects.push({
    type: "volleyTrap",
    x: player.x,
    y: player.y,
    r: 36 + (hasTalent("ranger_trap_size") ? 20 : 0),
    ttl: 4,
    maxTtl: 4,
    triggerTimer: 0.6,
    shotTimer: 0,
    shotsRemaining: 5 + (hasTalent("ranger_trap_cap") ? 4 : 0),
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
  if (hasTalent("ranger_deadeye_tumble")) player.deadeyeTimer = 4;
  if (hasTalent("ranger_trap_tumble")) {
    abilityEffects.push({
      type: "volleyTrap",
      x: player.x,
      y: player.y,
      r: 28,
      ttl: 2.4,
      maxTtl: 2.4,
      triggerTimer: 0.2,
      shotTimer: 0,
      shotsRemaining: 3,
    });
  }
  abilityEffects.push({ type: "tumbleShot", x: player.x, y: player.y, angle: rollAngle, ttl: 0.32, maxTtl: 0.32 });
}

function arrowStorm() {
  const target = clampCombatPoint(mouseWorld.x, mouseWorld.y, 72);
  abilityEffects.push({
    type: "arrowStorm",
    x: target.x,
    y: target.y,
    r: 128 + (hasTalent("ranger_storm_radius") ? 30 : 0),
    ttl: 3.2 + (hasTalent("ranger_storm_duration") ? 1.2 : 0),
    maxTtl: 3.2 + (hasTalent("ranger_storm_duration") ? 1.2 : 0),
    pulseTimer: 0.15,
    shotTimer: 0.08,
    pulseInterval: hasTalent("ranger_storm_pulses") ? 0.32 : 0.45,
    damageMultiplier: hasTalent("ranger_storm_cap") ? 0.57 : 0.42,
  });
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
    meteorField();
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    blinkStep(angle);
    return;
  }
  spendAbility(index, ability);
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "timeWarp");
  const ttl = 7.5 + (hasTalent("mage_chrono_duration") ? 2 : 0);
  abilityEffects.push({ type: "timeWarp", x: player.x, y: player.y, r: 132 + (hasTalent("mage_chrono_radius") ? 35 : 0), ttl, maxTtl: ttl });
}

function meteorField() {
  const target = clampCombatPoint(mouseWorld.x, mouseWorld.y, 96);
  player.castTimer = 0.36;
  player.castMoveLockTimer = 0.28;
  player.castAngle = aimAngle();
  abilityEffects.push({
    type: "meteorField",
    x: target.x,
    y: target.y,
    r: 150 + (hasTalent("mage_meteor_radius") ? 30 : 0),
    ttl: 3.1 + (hasTalent("mage_meteor_duration") ? 1.2 : 0),
    maxTtl: 3.1 + (hasTalent("mage_meteor_duration") ? 1.2 : 0),
    impactTimer: 0.12,
    impactInterval: hasTalent("mage_meteor_speed") ? 0.24 : 0.32,
  });
}

function useRogueAbility(index, ability) {
  if (index === 0) {
    spendAbility(index, ability);
    backstabStrike();
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    poisonCloud();
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    shadowStep();
    return;
  }
  spendAbility(index, ability);
  const smokeTtl = 4.2 + (hasTalent("rogue_smoke_duration") ? 1.5 : 0);
  abilityEffects.push({ type: "smokeBomb", x: player.x, y: player.y, r: 92 + (hasTalent("rogue_smoke_size") ? 30 : 0), ttl: smokeTtl, maxTtl: smokeTtl, wasInside: true, pulseTimer: 0 });
  if (hasTalent("rogue_smoke_cap")) destroyProjectilesInRadius(player.x, player.y, 132);
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.35);
  player.smokeSpeedGranted = false;
}

function usePaladinAbility(index, ability) {
  if (index === 0) {
    spendAbility(index, ability);
    radiantSmite();
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    consecration();
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    aegisStep();
    return;
  }
  spendAbility(index, ability);
  divineBulwark();
}

function shadowStep() {
  const angle = aimAngle();
  const origin = { x: player.x, y: player.y };
  const destination = constrainToRoom(player.x + Math.cos(angle) * 185, player.y + Math.sin(angle) * 185);
  player.x = destination.x;
  player.y = destination.y;
  player.slide = null;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.32);
  player.backstabTimer = 2 + (hasTalent("rogue_shadow_step") ? 1.5 : 0);
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  abilityEffects.push({ type: "shadowStep", x: origin.x, y: origin.y, x2: player.x, y2: player.y, ttl: 0.42, maxTtl: 0.42 });
  particles.push({ x: player.x, y: player.y - 36, text: "backstab ready", color: "#c8ff9a", ttl: 0.85 });
}

function backstabStrike() {
  const angle = aimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  const empowered = player.backstabTimer > 0;
  const targets = damageEnemiesInCone(player.x, player.y, angle, 122, Math.PI * 0.52, Math.round(player.stats.damage * (empowered ? (hasTalent("rogue_shadow_backstab") ? 2.22 : 1.85) : 1.05)), empowered ? "Backstab" : "Twin Cut");
  targets.forEach((target) => {
    applyBleed(target);
    if (target.poisonStacks > 0) player.abilityCooldowns[0] = Math.max(0, player.abilityCooldowns[0] - 2);
    if (empowered && hasTalent("rogue_shadow_cap") && target.exposedStacks > 0) damageBossTarget(target, target.exposedStacks * 12, "Deathblow");
    if (empowered) consumeExposed(target);
  });
  player.backstabTimer = 0;
  player.rogueAttackTimer = 0.3;
  player.rogueAttackAngle = angle;
  abilityEffects.push({ type: "backstab", x: player.x, y: player.y, angle, range: 126, empowered, ttl: 0.28, maxTtl: 0.28 });
}

function poisonCloud() {
  const target = clampCombatPoint(mouseWorld.x, mouseWorld.y, 90);
  abilityEffects.push({
    type: "poisonCloud",
    x: target.x,
    y: target.y,
    r: 118 + (hasTalent("rogue_venom_cloud") ? 28 : 0),
    ttl: 5.2 + (hasTalent("rogue_venom_cloud") ? 1.2 : 0),
    maxTtl: 5.2 + (hasTalent("rogue_venom_cloud") ? 1.2 : 0),
    pulseTimer: 0,
  });
}

function radiantSmite() {
  const angle = aimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.meleeAttackTimer = 0.34;
  player.meleeAttackAngle = angle;
  const target = pointFromAngle(player.x, player.y, angle, 98);
  const radius = 96 + (hasTalent("paladin_judgment_radius") ? 24 : 0);
  const hits = damageEnemiesInRadius(target.x, target.y, radius, Math.round(player.stats.damage * (hasTalent("paladin_judgment_damage") ? 1.34 : 1.12)), "Radiant Smite");
  hits.forEach((enemy) => {
    interruptTarget(enemy);
    if (hasTalent("paladin_judgment_cap") && enemy.judgmentTimer > 0) damageBossTarget(enemy, Math.round(player.stats.damage * 0.7), "Final Judgment");
    if (hasTalent("paladin_judgment_mark")) {
      enemy.judgmentTimer = 5;
      particles.push({ x: enemy.x, y: enemy.y - enemy.radius - 42, text: "judged", color: "#fff0bf", ttl: 0.7 });
    }
  });
  abilityEffects.push({ type: "radiantSmite", x: target.x, y: target.y, r: radius, ttl: 0.42, maxTtl: 0.42 });
}

function consecration() {
  const ttl = 6 + (hasTalent("paladin_consecrate_duration") ? 2 : 0);
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "consecration");
  abilityEffects.push({
    type: "consecration",
    x: player.x,
    y: player.y,
    r: 128 + (hasTalent("paladin_consecrate_size") ? 28 : 0),
    ttl,
    maxTtl: ttl,
    pulseTimer: 0,
    healTimer: 0,
  });
  player.consecrationTimer = ttl;
}

function aegisStep() {
  const angle = movementOrAimAngle();
  const origin = { x: player.x, y: player.y };
  const target = constrainToRoom(player.x + Math.cos(angle) * 150, player.y + Math.sin(angle) * 150);
  player.x = target.x;
  player.y = target.y;
  player.slide = null;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.38);
  player.guardSpeedTimer = Math.max(player.guardSpeedTimer, 0.7);
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  abilityEffects.push({ type: "aegisStep", x: origin.x, y: origin.y, x2: player.x, y2: player.y, ttl: 0.42, maxTtl: 0.42 });
}

function divineBulwark() {
  player.shieldWallTimer = 8;
  player.consecrationTimer = Math.max(player.consecrationTimer, 2.5);
  player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * (hasTalent("paladin_guard_heal") ? 0.33 : 0.18)));
  abilityEffects = abilityEffects.filter((effect) => effect.type !== "divineBulwark");
  abilityEffects.push({ type: "divineBulwark", x: player.x, y: player.y, r: 92, ttl: 8, maxTtl: 8 });
  if (hasTalent("paladin_guard_projectiles")) destroyProjectilesInRadius(player.x, player.y, 148);
  particles.push({ x: player.x, y: player.y - 42, text: "warded", color: "#fff0bf", ttl: 0.8 });
}

function blinkStep(angle) {
  const origin = { x: player.x, y: player.y };
  const target = constrainToRoom(player.x + Math.cos(angle) * 165, player.y + Math.sin(angle) * 165);
  player.x = target.x;
  player.y = target.y;
  player.slide = null;
  player.castTimer = 0.22;
  player.castAngle = angle;
  abilityEffects.push({ type: "blinkRune", x: origin.x, y: origin.y, r: 72 + (hasTalent("mage_chrono_blink") ? 28 : 0), ttl: 1.15, maxTtl: 1.15, pulseTimer: 0 });
  particles.push({ x: player.x, y: player.y - 35, text: "blink", color: "#bafcff", ttl: 0.65 });
}

function fireFireBlast(angle) {
  const blastMultiplier = 3 + (hasTalent("mage_pyro_damage") ? 0.6 : 0) + (hasTalent("mage_pyro_cap") ? 0.9 : 0);
  playerProjectiles.push({
    x: player.x + Math.cos(angle) * 30,
    y: player.y + Math.sin(angle) * 30,
    vx: Math.cos(angle) * 520,
    vy: Math.sin(angle) * 520,
    r: 18,
    damage: Math.round(player.stats.damage * blastMultiplier),
    color: "#ff8a32",
    ttl: 1.05,
    age: 0,
    heavy: true,
    tag: "Magic",
    ability: true,
    fireBlast: true,
    explosionRadius: 132 + (hasTalent("mage_pyro_radius") ? 28 : 0) + (hasTalent("mage_pyro_cap") ? 50 : 0),
    room: player.room,
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

function damageDonutMinionsInRadius(x, y, radius, amount, source, hitTargets = []) {
  if (boss.kind !== "donut" || !boss.donutMinions?.length) return [];
  return boss.donutMinions.filter((minion) => {
    if (minion.hp <= 0 || hitTargets.includes(minion)) return false;
    if (distance({ x, y }, minion) > radius + minion.r) return false;
    damageDonutMinion(minion, amount, source);
    hitTargets.push(minion);
    return true;
  });
}

function damageEnemiesInRadius(x, y, radius, amount, source, hitTargets = []) {
  const bossHits = damageTargetsInRadius(x, y, radius, amount, source, hitTargets);
  const donutHits = damageDonutMinionsInRadius(x, y, radius, amount, source, hitTargets);
  return bossHits.concat(donutHits);
}

function damageEnemiesInCone(x, y, angle, range, halfAngle, amount, source) {
  const hits = damageTargetsInCone(x, y, angle, range, halfAngle, amount, source);
  if (boss.kind === "donut" && boss.donutMinions?.length) {
    boss.donutMinions.forEach((minion) => {
      if (minion.hp <= 0) return;
      const dx = minion.x - x;
      const dy = minion.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + minion.r) return;
      if (Math.abs(angleDifference(Math.atan2(dy, dx), angle)) > halfAngle) return;
      if (damageDonutMinion(minion, amount, source)) hits.push(minion);
    });
  }
  return hits;
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
  if (!target.mazeEnemy && target.kind !== "ketchup" && target.kind !== "mayo" && target.kind !== "mustard") return;
  const angle = Math.atan2(target.y - y, target.x - x);
  const rawPoint = { x: target.x + Math.cos(angle) * amount, y: target.y + Math.sin(angle) * amount };
  if (target.mazeEnemy) {
    if (!mazeState || !isMazeCircleWalkable(rawPoint.x, rawPoint.y, target.radius)) return;
    target.x = rawPoint.x;
    target.y = rawPoint.y;
    return;
  }
  const point = clampArenaPoint(rawPoint.x, rawPoint.y, target.radius);
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
    const count = boss.enraged ? 12 : boss.phase === 2 ? 10 : 8;
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
        damage: 12,
      });
    }
    log("Floor slam and arc bolts incoming.");
  } else {
    for (let i = 0; i < 6; i += 1) {
      hazards.push({
        type: "vent",
        x: world.arena.x + 140 + Math.random() * (world.arena.w - 280),
        y: world.arena.y + 110 + Math.random() * (world.arena.h - 220),
        r: 28,
        warn: 0.75 + i * 0.04,
        ttl: 1.3 + i * 0.04,
        damage: 14,
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
  const targetPlayer = bossAimTarget(boss);
  const angle = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
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
    damage: boss.enraged ? 32 : 26,
    hit: false,
    dashed: false,
  });
  log("Delivery dash lined up.");
}

function spawnPepperoniVolley(count, spread) {
  const targetPlayer = bossAimTarget(boss);
  const base = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
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
      damage: boss.enraged ? 12 : 9,
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
  const targetPlayer = bossAimTarget(clone);
  const angle = Math.atan2(targetPlayer.y - clone.y, targetPlayer.x - clone.x);
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
      damage: boss.enraged ? 30 : 24,
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
    damage: boss.enraged ? 54 : 44,
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
      damage: boss.enraged ? 30 : 24,
    });
  }
}

function spawnStrawSnipe() {
  const targetPlayer = bossAimTarget(boss);
  const angle = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
  hazards.push({
    type: "strawSnipe",
    x: boss.x,
    y: boss.y,
    angle,
    warn: boss.enraged ? 0.58 : 0.78,
    ttl: boss.enraged ? 0.94 : 1.14,
    damage: boss.enraged ? 58 : 46,
    hit: false,
  });
}

function spawnFizzBurst() {
  hazards.push({
    type: "fizzBurst",
    x: boss.x,
    y: boss.y,
    r: boss.enraged ? 225 : boss.phase === 2 ? 205 : 185,
    warn: boss.enraged ? 1.05 : 1.15,
    ttl: boss.enraged ? 1.32 : 1.42,
    damage: boss.enraged ? 54 : 42,
    hit: false,
  });
  log("Big Cola pressure is about to burst.");
}

function spawnSodaSpill() {
  const point = randomArenaPointNearThreat(180);
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
  const targetPlayer = bossAimTarget(boss);
  const fromLeft = targetPlayer.x > world.arena.x + world.arena.w / 2;
  hazards.push({
    type: "cheeseWave",
    x: fromLeft ? world.arena.x + 80 : world.arena.x + world.arena.w - 80,
    y: clamp(targetPlayer.y, world.arena.y + 100, world.arena.y + world.arena.h - 100),
    r: 76,
    ttl: Number.POSITIVE_INFINITY,
    damage: boss.enraged ? 36 : 28,
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
  const targetPlayer = bossAimTarget(boss);
  let point = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    point = {
      x: world.arena.x + 130 + Math.random() * (world.arena.w - 260),
      y: world.arena.y + 120 + Math.random() * (world.arena.h - 240),
    };
    if (distance(point, targetPlayer) >= minDistance) return point;
  }
  const angle = Math.random() * Math.PI * 2;
  return {
    x: clamp(targetPlayer.x + Math.cos(angle) * minDistance, world.arena.x + 130, world.arena.x + world.arena.w - 130),
    y: clamp(targetPlayer.y + Math.sin(angle) * minDistance, world.arena.y + 120, world.arena.y + world.arena.h - 120),
  };
}

function spawnFryMachineGun() {
  const targetPlayer = bossAimTarget(boss);
  const angle = Math.atan2(targetPlayer.y - boss.y, targetPlayer.x - boss.x);
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
  const point = randomArenaPointNearThreat(140);
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
  const targetPlayer = bossAimTarget(source);
  const base = Math.atan2(targetPlayer.y - source.y, targetPlayer.x - source.x);
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
  return randomArenaPointNearThreat(spread);
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
  const targetPlayer = bossAimTarget(boss);
  hazards.push({
    type: "slam",
    x: targetPlayer.x,
    y: targetPlayer.y,
    r: boss.enraged ? 42 : 36,
    warn: boss.enraged ? 0.68 : 0.82,
    ttl: boss.enraged ? 1.05 : 1.2,
    damage: boss.enraged ? 29 : 24,
  });
}

function isPlayerInMazeWall(hazard) {
  const halfLong = hazard.length / 2;
  const halfShort = hazard.width / 2 + player.radius;
  const dx = Math.abs(player.x - hazard.x);
  const dy = Math.abs(player.y - hazard.y);
  if (hazard.vertical) return dx < halfShort && dy < halfLong + player.radius;
  return dy < halfShort && dx < halfLong + player.radius;
}

function updateHazards(dt) {
  const spawnedHazards = [];
  hazards = hazards.filter((hazard) => {
    if (hazard.mazeHazard && player.room !== "maze") {
      return false;
    }
    const remoteBossHazard = isRemoteBossHazard(hazard);
    if (hazard.type === "mazeShot") {
      hazard.ttl -= dt;
      const previousX = hazard.x;
      const previousY = hazard.y;
      if (hazard.turn) {
        const speed = Math.hypot(hazard.vx, hazard.vy);
        const angle = Math.atan2(hazard.vy, hazard.vx) + hazard.turn * dt;
        hazard.vx = Math.cos(angle) * speed;
        hazard.vy = Math.sin(angle) * speed;
      }
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (!mazeState || !isMazeSegmentWalkable(previousX, previousY, hazard.x, hazard.y, hazard.r || 0)) return false;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayer(hazard.damage, hazard.source || "Maze shot");
        hazard.ttl = 0;
      }
    } else if (hazard.type === "mazeCircle") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        if (hazard.lingering) {
          hazard.damageTimer -= dt;
          if (hazard.damageTimer <= 0) {
            damagePlayer(hazard.damage, hazard.source || "Maze hazard");
            hazard.damageTimer = 0.48;
          }
        } else if (!hazard.hit) {
          hazard.hit = true;
          damagePlayer(hazard.damage, hazard.source || "Maze hazard");
          if (hazard.chill) addChillStack();
        }
      }
    } else if (hazard.type === "mazeWall") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && isPlayerInMazeWall(hazard)) {
        hazard.hit = true;
        damagePlayer(hazard.damage, "Maze wall");
      }
    } else if (hazard.type === "grease") {
      hazard.ttl -= dt;
      hazard.explodeTimer = Math.max(0, (hazard.explodeTimer ?? 0) - dt);
      if (!hazard.exploded && hazard.explodeTimer <= 0) {
        hazard.exploded = true;
        if (!remoteBossHazard) spawnGreaseExplosion(hazard, spawnedHazards);
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
          if (!remoteBossHazard) spawnFryShot(hazard, spawnedHazards);
          hazard.fireTimer += boss.enraged ? 0.045 : 0.048;
        }
        if (isPlayerInMachineGun(hazard) && hazard.damageTimer <= 0) {
          damagePlayer(boss.enraged ? 13 : 11, "French fry machine gun");
          hazard.damageTimer = boss.enraged ? 0.18 : 0.2;
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
        if (!remoteBossHazard) shatterNachoChip(hazard, spawnedHazards);
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
        if (!remoteBossHazard) spawnPizzaCheeseTrail(hazard, spawnedHazards);
        boss.x = hazard.targetX;
        boss.y = hazard.targetY;
        if (!remoteBossHazard) particles.push({ x: boss.x, y: boss.y - 48, text: "dash", color: "#ffd76a", ttl: 0.55 });
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
        if (remoteBossHazard) hazard.ttl = 0;
        else preparePizzaSliceReturn(hazard);
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
        if (!remoteBossHazard) particles.push({ x: hazard.x, y: hazard.y - 18, text: "splash", color: "#b9f4ff", ttl: 0.55 });
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
          if (!remoteBossHazard) particles.push({ x: hazard.x, y: hazard.y - 18, text: "burst", color: "#ff5d73", ttl: 0.6 });
        }
        hazard.burstTimer -= dt;
        while (hazard.burstShots > 0 && hazard.burstTimer <= 0) {
          if (!remoteBossHazard) spawnCherryBurst(hazard, spawnedHazards);
          hazard.burstShots -= 1;
          hazard.burstTimer += hazard.burstDelay;
        }
        if (hazard.burstShots <= 0 && hazard.burstTimer <= 0) hazard.ttl = 0;
      }
    } else if (hazard.type === "tacoCharge") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
          if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
          addStuffedStack();
          damagePlayer(hazard.damage, "Crunch Charge");
          knockPlayerFrom(hazard.x, hazard.y, 260);
        }
        boss.x = hazard.targetX;
        boss.y = hazard.targetY;
        if (!remoteBossHazard) spawnTacoShellShards(hazard, spawnedHazards);
      }
    } else if (hazard.type === "tacoShellShard") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
          damagePlayer(hazard.damage, "Shell shard");
          hazard.damageTimer = 0.55;
        }
      }
    } else if (hazard.type === "ingredientDrop") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (distance(player, hazard) < player.radius + hazard.r) {
          if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
          if (hazard.ingredient === "cheese") player.freezeTimer = Math.max(player.freezeTimer, 0.35);
          if (hazard.ingredient === "lettuce") knockPlayerFrom(hazard.x, hazard.y, 220);
          addStuffedStack();
          damagePlayer(hazard.ingredient === "beef" ? 18 : 12, `${hazard.ingredient} drop`);
        }
        if (hazard.ingredient === "beef") {
          hazard.type = "tacoGrease";
          hazard.r = Math.max(46, hazard.r + 14);
          hazard.ttl = 4.4;
          hazard.damageTimer = 0;
        }
        if (hazard.ingredient === "cheese") {
          hazard.type = "tacoCheese";
          hazard.r = Math.max(44, hazard.r + 12);
          hazard.ttl = 4.0;
          hazard.damageTimer = 0;
        }
        if (hazard.ingredient === "salsa") {
          hazard.type = "tacoSalsa";
          hazard.r = 48;
          hazard.ttl = 4.8;
          hazard.damageTimer = 0;
        }
      }
    } else if (hazard.type === "tacoSalsa") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
          addStuffedStack();
          damagePlayer(hazard.damage, "Salsa pool");
          hazard.damageTimer = 0.45;
        }
      }
    } else if (hazard.type === "tacoSlam") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        const dist = distance(player, hazard);
        const angleToPlayer = Math.atan2(player.y - hazard.y, player.x - hazard.x);
        const inGap = Math.abs(angleDifference(angleToPlayer, hazard.gapAngle)) < 0.42;
        if (dist < hazard.r && dist > hazard.inner && !inGap) {
          if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
          addStuffedStack();
          damagePlayer(hazard.damage, "Shell Slam");
        }
      }
    } else if (hazard.type === "lettuceLeaf") {
      hazard.ttl -= dt;
      hazard.wobble += dt * 6;
      const side = Math.sin(hazard.wobble) * 72;
      const angle = Math.atan2(hazard.vy, hazard.vx) + Math.PI / 2;
      hazard.x += (hazard.vx + Math.cos(angle) * side) * dt;
      hazard.y += (hazard.vy + Math.sin(angle) * side) * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        if (hazard.tacoPuzzleIngredient) markTacoPuzzleFailure(hazard.tacoPuzzleIngredient);
        addStuffedStack();
        damagePlayer(hazard.damage, "Lettuce fan");
        hazard.ttl = 0;
      }
    } else if (hazard.type === "lettuceCleanseZone") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      hazard.pulse = (hazard.pulse || 0) + dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        player.freezeTimer = 0;
        player.stuffedStacks = Math.max(0, (player.stuffedStacks || 0) - 1);
        markTacoPuzzleProgress("lettuce");
      }
    } else if (hazard.type === "tacoGrease" || hazard.type === "tacoCheese") {
      hazard.ttl -= dt;
      hazard.warn = Math.max(0, (hazard.warn || 0) - dt);
      if (distance(player, hazard) < player.radius + hazard.r) {
        if (hazard.type === "tacoGrease") player.tacoGreaseTimer = Math.max(player.tacoGreaseTimer || 0, 0.1);
        if (hazard.type === "tacoCheese") player.freezeTimer = Math.max(player.freezeTimer, 0.08);
      }
    } else if (hazard.type === "tacoIngredientFlood") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      const safeZone = { x: hazard.safeX, y: hazard.safeY, w: hazard.safeW, h: hazard.safeH };
      if (hazard.warn <= 0.65 && !hazard.cleared) {
        hazard.cleared = true;
        clearTacoHazardsForNapkinFlood(hazard);
        boss.attackTimer = Math.max(boss.attackTimer, 0.9);
        boss.swingTimer = Math.max(boss.swingTimer, 0.9);
      }
      if (hazard.warn <= 0) {
        if (!isPlayerOnTacoNapkin(safeZone) && !player.dead) {
          enterDeathState("Ingredient flood");
        } else if (!hazard.hit) {
          hazard.hit = true;
          player.stuffedStacks = 0;
          showFloat("Napkin saved you");
        }
      }
    } else if (hazard.type === "glazeRing") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        hazard.radiusNow += hazard.speed * dt;
        const radiusProgress = clamp((hazard.radiusNow - 34) / Math.max(1, hazard.maxRadius - 34), 0, 1);
        const spinFalloff = 1 - radiusProgress * 0.55;
        hazard.gapAngle += (hazard.spinSpeed || (boss.enraged ? 0.58 : 0.36)) * spinFalloff * dt;
        const dist = distance(player, hazard);
        const inBand = Math.abs(dist - hazard.radiusNow) < 15 + player.radius;
        const angleToPlayer = Math.atan2(player.y - hazard.y, player.x - hazard.x);
        const inGap = Math.abs(angleDifference(angleToPlayer, hazard.gapAngle)) < hazard.gapWidth;
        if (inBand && !inGap && !hazard.hit) {
          hazard.hit = true;
          damagePlayer(hazard.damage, "Glaze ring");
        }
      }
    } else if (hazard.type === "frostingRibbon") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          player.freezeTimer = Math.max(player.freezeTimer, 0.18);
          damagePlayer(hazard.damage, "Frosting ribbon");
          hazard.damageTimer = 0.55;
        }
      }
    } else if (hazard.type === "royalRoll") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      boss.attackTimer = Math.max(boss.attackTimer, 0.65);
      if (hazard.warn <= 0) {
        boss.animation = "royalRoll";
        hazard.rollAge += dt;
        const progress = clamp(hazard.rollAge / hazard.rollDuration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        hazard.prevX = hazard.x;
        hazard.prevY = hazard.y;
        hazard.x = hazard.startX + (hazard.endX - hazard.startX) * eased;
        hazard.y = hazard.startY + (hazard.endY - hazard.startY) * eased;
        boss.x = hazard.x;
        boss.y = hazard.y;
        const traveled = Math.hypot(hazard.x - hazard.prevX, hazard.y - hazard.prevY);
        const sweptHit = traveled > 1 && isPlayerInLine(hazard.prevX, hazard.prevY, Math.atan2(hazard.y - hazard.prevY, hazard.x - hazard.prevX), traveled, hazard.width / 2 + player.radius);
        if (!hazard.hit && (distance(player, boss) < hazard.width / 2 + player.radius || sweptHit)) {
          hazard.hit = true;
          damagePlayer(hazard.damage, "Royal Roll");
          knockPlayerFrom(hazard.prevX, hazard.prevY, 320);
        }
        if (progress >= 1) {
          boss.animation = "idle";
          hazard.ttl = Math.min(hazard.ttl, 0.12);
        }
      }
    } else if (hazard.type === "sugarZone") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r) {
        boss.sugarRushTimer = 1.15;
        hazard.ttl = 0;
        showFloat("Sugar Rush");
      }
    } else if (hazard.type === "wasabiWave") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0) {
        if (hazard.axis === "vertical") {
          hazard.x += hazard.speed * hazard.direction * dt;
          hazard.lane = hazard.x;
          if (!hazard.hit && Math.abs(player.x - hazard.x) < hazard.width + player.radius) {
            hazard.hit = true;
            damagePlayer(hazard.damage, "Wasabi wave");
          }
        } else {
          hazard.y += hazard.speed * hazard.direction * dt;
          hazard.lane = hazard.y;
          if (!hazard.hit && Math.abs(player.y - hazard.y) < hazard.width + player.radius) {
            hazard.hit = true;
            damagePlayer(hazard.damage, "Wasabi wave");
          }
        }
      }
    } else if (hazard.type === "soyPuddle") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && distance(player, hazard) < player.radius + hazard.r) {
        player.freezeTimer = Math.max(player.freezeTimer, 0.07);
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Soy splash");
          hazard.damageTimer = 0.58;
        }
      }
    } else if (hazard.type === "chopstickPin") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        const hit = hazard.vertical
          ? Math.abs(player.x - hazard.x) < 18 + player.radius
          : Math.abs(player.y - hazard.y) < 18 + player.radius;
        if (hit) damagePlayer(hazard.damage, "Chopstick pin");
      }
    } else if (hazard.type === "serpentSweep") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
          damagePlayer(hazard.damage, "Segment sweep");
          knockPlayerFrom(hazard.x, hazard.y, 280);
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
    } else if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob" || hazard.type === "peanut" || hazard.type === "cherryShot" || hazard.type === "nachoCrumb" || hazard.type === "pepperoni" || hazard.type === "cheeseBolt" || hazard.type === "sprinkle") {
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
        const source = hazard.type === "fry" ? "French fry" : hazard.type === "mustardSeed" ? "Mustard seed" : hazard.type === "sauceBlob" ? "Special sauce" : hazard.type === "peanut" ? "Peanut" : hazard.type === "cherryShot" ? "Cherry shot" : hazard.type === "nachoCrumb" ? "Nacho crumb" : hazard.type === "pepperoni" ? "Pepperoni" : hazard.type === "cheeseBolt" ? "Ghost cheese" : hazard.type === "sprinkle" ? "Sprinkle barrage" : "Arc bolt";
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
    if (hazard.type === "wasabiWave") return hazard.ttl > 0 && wasabiWaveTouchesArena(hazard);
    if (hazard.type === "tacoIngredientFlood") return hazard.ttl > 0;
      if (hazard.mazeHazard) {
        if (hazard.type === "mazeShot") return hazard.ttl > 0 && Boolean(mazeState);
        return hazard.ttl > 0 && Boolean(mazeState);
      }
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

function wasabiWaveTouchesArena(hazard) {
  if (hazard.warn > 0) return true;
  const margin = hazard.width + 20;
  if (hazard.axis === "vertical") {
    return hazard.x > world.arena.x - margin && hazard.x < world.arena.x + world.arena.w + margin;
  }
  return hazard.y > world.arena.y - margin && hazard.y < world.arena.y + world.arena.h + margin;
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

function spawnTacoShellShards(source, targetList = hazards) {
  const count = boss.phase >= 3 ? 5 : 3;
  for (let i = 0; i < count; i += 1) {
    const t = (i + 1) / (count + 1);
    targetList.push({
      type: "tacoShellShard",
      x: source.x + Math.cos(source.angle) * source.length * t,
      y: source.y + Math.sin(source.angle) * source.length * t,
      r: 20,
      warn: 0.18,
      ttl: boss.phase >= 2 ? 3.2 : 2.6,
      damage: 8,
      damageTimer: 0,
    });
  }
}

function hitDonutHole(projectile) {
  const hole = boss.donutHoles?.find((candidate) => candidate.hp > 0 && distance(projectile, candidate) < candidate.r + projectile.r);
  if (!hole) return false;
  const damage = Math.ceil(projectile.damage * 0.9);
  hole.hp = Math.max(0, hole.hp - damage);
  particles.push({ x: hole.x, y: hole.y - 24, text: `-${damage}`, color: "#ffb6d1", ttl: 0.65 });
  if (hole.hp <= 0) {
    boss.shieldTimer = 0;
    damageBossTarget(boss, Math.round(player.stats.damage * 1.4), "Donut hole pop");
    particles.push({ x: hole.x, y: hole.y - 36, text: "pop", color: "#ffd7e8", ttl: 0.8 });
  }
  return true;
}

function hitDonutMinion(projectile) {
  const minion = boss.donutMinions?.find((candidate) => candidate.hp > 0 && distance(projectile, candidate) < candidate.r + projectile.r);
  if (!minion) return false;
  damageDonutMinion(minion, projectile.damage, "Shot");
  return true;
}

function damageDonutMinion(minion, amount, source) {
  if (!minion || minion.hp <= 0) return false;
  const damage = Math.ceil(amount);
  minion.hp = Math.max(0, minion.hp - damage);
  particles.push({ x: minion.x, y: minion.y - 24, text: `-${damage}`, color: "#ffd7e8", ttl: 0.65 });
  if (minion.hp <= 0) {
    particles.push({ x: minion.x, y: minion.y - 34, text: "pop", color: "#ffb6d1", ttl: 0.75 });
    if (minion.kind === "glazer") spawnMiniGlazeBurst(minion);
  }
  return true;
}

function hitSushiSegment(projectile) {
  const segment = sushiSegments().find((candidate) => distance(projectile, candidate) < candidate.r + projectile.r);
  if (!segment) return false;
  const damage = segment.weak ? Math.ceil(projectile.damage * 1.8) : Math.ceil(projectile.damage * 0.82);
  damageBossTarget(boss, damage, segment.weak ? "Weak segment" : "Sushi segment");
  if (segment.weak) {
    boss.serpentWeakIndex = 1 + ((segment.index + 2) % Math.max(2, sushiSegmentCount() - 2));
    boss.serpentWeakTimer = boss.enraged ? 1.5 : 2.15;
    particles.push({ x: segment.x, y: segment.y - 34, text: "weak", color: "#9ff089", ttl: 0.75 });
  }
  return true;
}

function damagePlayer(amount, source, options = {}) {
  if (player.invulnerableTimer > 0) {
    particles.push({ x: player.x, y: player.y - 35, text: "evade", color: "#ffd782", ttl: 0.55 });
    return;
  }
  let hit = options.fixed ? amount : Math.max(1, Math.ceil(amount * combatTuning.incomingDamageMultiplier - player.stats.armor));
  const now = performance.now();
  if (player.lastDamageAt && now - player.lastDamageAt < combatTuning.overlapDamageWindowMs && !options.ignoreOverlapGrace) {
    hit = Math.max(1, Math.ceil(hit * combatTuning.overlapDamageMultiplier));
  }
  if (player.shieldWallTimer > 0) hit = Math.max(1, Math.ceil(hit * (hasTalent("melee_iron_wall") || hasTalent("paladin_guard_mitigation") ? 0.4 : 0.5)));
  if (player.consecrationTimer > 0) hit = Math.max(1, Math.ceil(hit * 0.78));
  if (hit >= player.hp && triggerTalentLethalSave(source)) return;
  player.hp = Math.max(0, player.hp - hit);
  player.lastDamageAt = now;
  particles.push({ x: player.x, y: player.y - 35, text: `-${hit}`, color: "#ff8f7e", ttl: 0.8 });
  if (player.hp <= 0) {
    enterDeathState(source);
  }
}

function triggerTalentLethalSave(source) {
  player.talentSaves = player.talentSaves || {};
  if (hasTalent("melee_iron_last") && currentClassKey() === "melee" && !player.talentSaves.lastStand) {
    player.talentSaves.lastStand = true;
    player.hp = Math.max(1, Math.ceil(player.maxHp * 0.25));
    player.shieldWallTimer = Math.max(player.shieldWallTimer, 2.5);
    particles.push({ x: player.x, y: player.y - 45, text: "Last Stand", color: "#f0d47c", ttl: 1 });
    log(`Last Stand saved you from ${source}.`);
    return true;
  }
  if (hasTalent("mage_chrono_cap") && currentClassKey() === "mage" && !player.talentSaves.timeLoop) {
    player.talentSaves.timeLoop = true;
    player.hp = Math.max(1, Math.ceil(player.maxHp * 0.35));
    player.invulnerableTimer = Math.max(player.invulnerableTimer, 1.1);
    particles.push({ x: player.x, y: player.y - 45, text: "Time Loop", color: "#bafcff", ttl: 1 });
    log(`Time Loop rewound ${source}.`);
    return true;
  }
  if (hasTalent("paladin_guard_cap") && currentClassKey() === "paladin" && !player.talentSaves.unfallen) {
    player.talentSaves.unfallen = true;
    player.hp = Math.max(1, Math.ceil(player.maxHp * 0.3));
    player.shieldWallTimer = Math.max(player.shieldWallTimer, 3);
    particles.push({ x: player.x, y: player.y - 45, text: "Unfallen", color: "#fff0bf", ttl: 1 });
    log(`Unfallen saved you from ${source}.`);
    return true;
  }
  return false;
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
  remoteProjectiles = [];
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

function nextProgressionBoss(kind) {
  if (kind === "sauce") return "shake";
  const index = progressionBosses.indexOf(kind);
  if (index < 0 || index >= progressionBosses.length - 1) return null;
  return progressionBosses[index + 1];
}

function prepareNextBoss(kind, defeatedName) {
  grantTalentPoints(2, defeatedName);
  loadBoss(kind);
  player.hp = player.maxHp;
  player.potions = 3;
  sendPlayerToStarterRoom();
  ui.status.textContent = `${defeatedName} defeated. +2 Talent Points. Next Boss: ${boss.name}.`;
  showScreenBanner(`${defeatedName} Defeated`, `Next Boss: ${boss.name}`, "victory", 2.8);
  showFloat(`Next boss: ${boss.name}`);
  if (isMultiplayerHost()) {
    broadcastPartyPhase("starter", {
      bossKind: kind,
      defeatedName,
      talentPoints: 2,
      applyLocal: false,
    });
  }
  sendMultiplayerState(true);
}

function winFight() {
  selectedBoss = null;
  hazards = [];
  playerProjectiles = [];
  remoteProjectiles = [];
  abilityEffects = [];
  const seconds = fightStartedAt ? Math.max(1, Math.round((performance.now() - fightStartedAt) / 1000)) : 0;
  if (boss.kind === "shake" && boss.phase < boss.totalPhases) {
    boss.phase += 1;
    boss.maxHp = scaledBossHp("shake", boss.phase === 2 ? 650 : 750);
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
  const defeatedName = boss.name;
  const nextBoss = nextProgressionBoss(boss.kind);
  if (nextBoss) {
    prepareNextBoss(nextBoss, defeatedName);
    return;
  }
  grantTalentPoints(2, defeatedName);
  clearEncounterState();
  player.won = true;
  runState.active = false;
  runState.buildLocked = false;
  player.destination = null;
  player.slide = null;
  ui.status.textContent = "Victory. You cleared the full boss run.";
  showScreenBanner("Run Cleared", "All bosses defeated", "victory", 4);
  showFloat("Run complete");
  if (isMultiplayerHost()) {
    broadcastPartyPhase("victory", {
      bossKind: boss.kind,
      defeatedName,
      talentPoints: 2,
      applyLocal: false,
    });
  }
}

function updateAbilities(dt) {
  player.abilityCooldowns = player.abilityCooldowns.map((cooldown) => Math.max(0, cooldown - dt));
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  player.tumbleTimer = Math.max(0, player.tumbleTimer - dt);
  player.shieldWallTimer = Math.max(0, player.shieldWallTimer - dt);
  player.consecrationTimer = Math.max(0, player.consecrationTimer - dt);
  player.guardSpeedTimer = Math.max(0, player.guardSpeedTimer - dt);
  player.tacoGreaseTimer = Math.max(0, (player.tacoGreaseTimer || 0) - dt);
  player.backstabTimer = Math.max(0, player.backstabTimer - dt);
  player.deadeyeTimer = Math.max(0, (player.deadeyeTimer || 0) - dt);

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
    if (effect.type === "arrowStorm") updateArrowStorm(effect, dt);
    if (effect.type === "meteorField") updateMeteorField(effect, dt);
    if (effect.type === "poisonCloud") updatePoisonCloud(effect, dt);
    if (effect.type === "consecration") updateConsecration(effect, dt);
    if (effect.type === "aftershock") updateAftershock(effect, dt);
    if (effect.type === "divineBulwark") {
      effect.x = player.x;
      effect.y = player.y;
    }
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
      damageBossTarget(target, hasTalent("melee_blood_deep") ? 6 : 4, "Bleed");
    }
  }
  target.burnTimer = Math.max(0, (target.burnTimer || 0) - dt);
  if (target.burnTimer > 0) {
    target.burnTickTimer = (target.burnTickTimer || 0.5) - dt;
    if (target.burnTickTimer <= 0) {
      target.burnTickTimer += 0.5;
      damageBossTarget(target, Math.round(player.stats.damage * 0.12), "Burn");
    }
  }
  target.exposedTimer = Math.max(0, (target.exposedTimer || 0) - dt);
  if (target.exposedTimer <= 0) target.exposedStacks = 0;
  target.judgmentTimer = Math.max(0, (target.judgmentTimer || 0) - dt);
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
    damage: Math.round(player.stats.damage * (hasTalent("ranger_trap_damage") ? 0.68 : 0.5)),
    color: "#ffd782",
    ttl: 0.8,
    age: 0,
    tag: "Ranged",
    ability: true,
  });
  effect.shotsRemaining -= 1;
  effect.shotTimer = 0.13;
}

function updateArrowStorm(effect, dt) {
  effect.pulseTimer -= dt;
  effect.shotTimer -= dt;
  while (effect.shotTimer <= 0) {
    effect.shotTimer += 0.12;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * effect.r;
    particles.push({ x: effect.x + Math.cos(angle) * radius, y: effect.y + Math.sin(angle) * radius - 20, text: "arrow", color: "#ffd782", ttl: 0.35 });
  }
  if (effect.pulseTimer > 0) return;
  effect.pulseTimer = effect.pulseInterval || 0.45;
  damageEnemiesInRadius(effect.x, effect.y, effect.r, Math.round(player.stats.damage * (effect.damageMultiplier || 0.42)), "Arrow Storm");
}

function updateMeteorField(effect, dt) {
  effect.impactTimer -= dt;
  if (effect.impactTimer > 0) return;
  effect.impactTimer = effect.impactInterval || 0.32;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * effect.r;
  const x = effect.x + Math.cos(angle) * radius;
  const y = effect.y + Math.sin(angle) * radius;
  damageEnemiesInRadius(x, y, 58 + (hasTalent("mage_meteor_cap") ? 20 : 0), Math.round(player.stats.damage * (hasTalent("mage_meteor_cap") ? 0.98 : 0.75)), "Meteor Field");
  particles.push({ x, y: y - 20, text: "meteor", color: "#ff8a32", ttl: 0.4 });
}

function updatePoisonCloud(effect, dt) {
  effect.pulseTimer -= dt;
  hazards.forEach((hazard) => {
    if (!Number.isFinite(hazard.vx) || !Number.isFinite(hazard.vy)) return;
    if (distance(effect, hazard) < effect.r + (hazard.r || 0)) {
      hazard.vx *= Math.pow(0.68, dt);
      hazard.vy *= Math.pow(0.68, dt);
    }
  });
  if (effect.pulseTimer > 0) return;
  effect.pulseTimer = 0.55;
  const hits = damageEnemiesInRadius(effect.x, effect.y, effect.r, Math.round(player.stats.damage * 0.34), "Poison Cloud");
  hits.forEach((target) => {
    if (target.kind) applyPoisonStack(target);
  });
}

function updateConsecration(effect, dt) {
  effect.x = player.x;
  effect.y = player.y;
  player.consecrationTimer = Math.max(player.consecrationTimer, 0.08);
  effect.pulseTimer -= dt;
  effect.healTimer -= dt;
  if (effect.pulseTimer <= 0) {
    effect.pulseTimer = 0.5;
    damageEnemiesInRadius(effect.x, effect.y, effect.r, Math.round(player.stats.damage * (hasTalent("paladin_consecrate_damage") ? 0.5 : 0.38)), "Consecration");
  }
  if (effect.healTimer <= 0) {
    effect.healTimer = 1;
    player.hp = Math.min(player.maxHp, player.hp + 3);
  }
}

function updateAftershock(effect, dt) {
  effect.pulseTimer -= dt;
  if (effect.pulseTimer > 0) return;
  effect.pulseTimer = 999;
  const hits = damageEnemiesInRadius(effect.x, effect.y, effect.r, Math.round(player.stats.damage * 0.7), "Aftershock");
  hits.forEach((target) => shoveTarget(target, effect.x, effect.y, 24));
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
    if (distance(effect, target) < effect.r + target.radius) damageBossTarget(target, hasTalent("mage_chrono_blink") ? 14 : 8, "Blink Rune");
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
  if (hasTalent("rogue_smoke_poison")) {
    effect.pulseTimer = (effect.pulseTimer || 0) - dt;
    if (effect.pulseTimer <= 0) {
      effect.pulseTimer = 0.7;
      damageEnemiesInRadius(effect.x, effect.y, effect.r, Math.round(player.stats.damage * 0.18), "Noxious Smoke").forEach((target) => applyPoisonStack(target));
    }
  }
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
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.castTimer = Math.max(0, player.castTimer - dt);
  player.rangerAttackTimer = Math.max(0, player.rangerAttackTimer - dt);
  player.meleeAttackTimer = Math.max(0, player.meleeAttackTimer - dt);
  player.rogueAttackTimer = Math.max(0, player.rogueAttackTimer - dt);
  updateAbilities(dt);
  updateTrainingDummy(dt);
  updateRoom(dt);
  updateMazeCombat(dt);
  updateCombat(dt);
  const hazardSync = beginBossSyncCapture("hazards");
  updateHazards(dt);
  finishBossSyncCapture(hazardSync);
  updatePlayerProjectiles(dt);
  updateRemoteProjectiles(dt);
  particles = particles.filter((particle) => {
    particle.ttl -= dt;
    particle.y -= 28 * dt;
    return particle.ttl > 0;
  });
  floatTimer -= dt;
  if (floatTimer <= 0) ui.floatText.textContent = "";
  if (screenBanner) {
    screenBanner.timer -= dt;
    if (screenBanner.timer <= 0) screenBanner = null;
  }
  updateMultiplayer(dt);
  camera.x = clamp(player.x - canvas.clientWidth / 2, 0, world.width - canvas.clientWidth);
  camera.y = clamp(player.y - canvas.clientHeight / 2, 0, world.height - canvas.clientHeight);
}

function updateTrainingDummy(dt) {
  if (!trainingDummy) return;
  if (trainingDummy.hp <= 0 || (trainingDummy.lastHitAt && performance.now() - trainingDummy.lastHitAt > 4500)) {
    const oldTotal = trainingDummy.damageTotal || 0;
    trainingDummy = createTrainingDummy();
    if (oldTotal > 0 && player.room === "starter") showFloat("Dummy reset");
    return;
  }
}

function updateRemoteProjectiles(dt) {
  remoteProjectiles = remoteProjectiles.filter((projectile) => {
    projectile.ttl -= dt;
    projectile.age = (projectile.age || 0) + dt;
    const previousX = projectile.x;
    const previousY = projectile.y;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    if (projectile.room === "maze") return projectile.ttl > 0 && mazeState && isMazeSegmentWalkable(previousX, previousY, projectile.x, projectile.y, projectile.r || 0);
    const bounds = projectile.room === "starter" ? world.starter : world.arena;
    return projectile.ttl > 0 && pointInRect(projectile.x, projectile.y, bounds);
  });
}

function updatePlayerProjectiles(dt) {
  playerProjectiles = playerProjectiles.filter((projectile) => {
    projectile.ttl -= dt;
    projectile.age = (projectile.age || 0) + dt;
    const previousX = projectile.x;
    const previousY = projectile.y;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.hitTargets = projectile.hitTargets || [];
    if (projectile.room === "maze") {
      if (!mazeState || !isMazeSegmentWalkable(previousX, previousY, projectile.x, projectile.y, projectile.r || 0)) return false;
      const hitMazeEnemy = mazeState.enemies.find((target) => target.hp > 0 && !projectile.hitTargets.includes(target) && distance(projectile, target) < target.radius + projectile.r);
      if (hitMazeEnemy) {
        projectile.hitTargets.push(hitMazeEnemy);
        if (projectile.fireBlast) {
          explodeFireBlast(projectile);
          return false;
        }
        if (projectile.markedShot) {
          markBossTarget(hitMazeEnemy);
          damageBossTarget(hitMazeEnemy, projectile.damage, "Marked Shot");
        } else {
          const markedBonus = projectile.tag === "Ranged" && !projectile.ability && hitMazeEnemy.markedTimer > 0 && hitMazeEnemy.markedShots > 0;
          const damage = markedBonus ? Math.ceil(projectile.damage * 1.45) : projectile.damage;
          if (markedBonus) hitMazeEnemy.markedShots -= 1;
          damageBossTarget(hitMazeEnemy, damage, projectile.ability ? "Ability" : "Shot");
          if (projectile.tag === "Rogue" && !projectile.ability) {
            applyPoisonStack(hitMazeEnemy);
            applyExposedStack(hitMazeEnemy, projectile);
          }
        }
        return projectile.piercing && projectile.ttl > 0;
      }
      return projectile.ttl > 0;
    }
    if (boss.kind === "donut" && hitDonutMinion(projectile)) {
      if (projectile.fireBlast) {
        explodeFireBlast(projectile);
        return false;
      }
      return projectile.piercing && projectile.ttl > 0;
    }
    if (boss.kind === "donut" && hitDonutHole(projectile)) {
      return projectile.piercing && projectile.ttl > 0;
    }
    if (boss.kind === "sushi" && hitSushiSegment(projectile)) {
      return projectile.piercing && projectile.ttl > 0;
    }
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
        const damage = markedBonus ? Math.ceil(projectile.damage * (hasTalent("ranger_deadeye_damage") ? 1.7 : 1.45)) : projectile.damage;
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
  const hitTargets = [];
  damageEnemiesInRadius(projectile.x, projectile.y, radius, projectile.damage, "Fire Blast", hitTargets);
  if (hasTalent("mage_pyro_burn")) {
    livingBosses().forEach((target) => {
      if (distance(projectile, target) < radius + target.radius) applyBurn(target);
    });
  }
  abilityEffects.push({ type: "fireBlastExplosion", x: projectile.x, y: projectile.y, r: radius, ttl: 0.42, maxTtl: 0.42 });
  particles.push({ x: projectile.x, y: projectile.y - 24, text: "boom", color: "#ffb14a", ttl: 0.55 });
}

function markBossTarget(target) {
  target.markedTimer = 5 + (hasTalent("ranger_deadeye_cap") ? 8 : 0);
  target.markedShots = 4 + (hasTalent("ranger_deadeye_mark") ? 2 : 0) + (hasTalent("ranger_deadeye_cap") ? 4 : 0);
  selectedBoss = target;
  particles.push({ x: target.x, y: target.y - target.radius - 36, text: "marked", color: "#ffd782", ttl: 0.95 });
}

function damageBossTarget(target, amount, source, options = {}) {
  if (!target || target.hp <= 0) return false;
  if (target.kind === "trainingDummy") return damageTrainingDummy(target, amount, source);
  if (target.kind === "donut" && target.donutGauntletActive) {
    particles.push({ x: world.arena.x + world.arena.w / 2, y: world.arena.y + 70, text: "offscreen", color: "#ffd7e8", ttl: 0.7 });
    return false;
  }
  if (target.kind === "nacho" && target.invulnerableTimer > 0) {
    particles.push({ x: target.x, y: target.y - 44, text: "immune", color: "#fff2c6", ttl: 0.75 });
    return false;
  }
  let tunedAmount = amount;
  if (!options.poison && source === "Shot" && hasTalent("melee_blood_bleed") && currentClassKey() === "melee") applyBleed(target);
  if (!options.poison && target.judgmentTimer > 0) tunedAmount = Math.ceil(tunedAmount * 1.12);
  if (!options.poison && source === "Shot" && player.deadeyeTimer > 0) {
    tunedAmount = Math.ceil(tunedAmount * 1.4);
    player.deadeyeTimer = 0;
    particles.push({ x: target.x, y: target.y - 60, text: "deadeye", color: "#ffd782", ttl: 0.7 });
  }
  let damage = target.shieldTimer > 0 ? Math.ceil(tunedAmount * 0.5) : tunedAmount;
  if (target.kind === "taco" && !options.tacoBypassGuard) {
    if (target.shellGuardActive && target.exposedFillingTimer <= 0) damage = Math.max(1, Math.ceil(damage * 0.32));
    if (target.exposedFillingTimer > 0) damage = Math.ceil(damage * 2.35);
  }
  if (target.mazeEnemy && isPartySyncActive() && !isMultiplayerHost() && !options.remote) {
    sendGauntletDamage(target, damage, source);
    particles.push({ x: target.x, y: target.y - 40, text: "hit", color: "#ffe08a", ttl: 0.45 });
    return true;
  }
  target.hp = Math.max(0, target.hp - damage);
  if (!target.mazeEnemy && source !== "Co-op" && !options.remote) {
    sendMultiplayerEvent({
      kind: "damage",
      encounter: "arena",
      phaseSeq: multiplayer.phaseSeq,
      bossKind: boss.kind,
      targetKind: target.kind,
      amount: damage,
    });
  }
  const color = options.poison ? "#9be06f" : source === "Bleed" || source === "Backstab" ? "#ff6e7f" : "#ffe08a";
  particles.push({ x: target.x, y: target.y - 40, text: `-${damage}`, color, ttl: 0.8 });
  if (target.hp <= 0) handleBossDefeated(target);
  return true;
}

function damageTrainingDummy(target, amount, source) {
  const now = performance.now();
  if (!target.lastHitAt || now - target.lastHitAt > 4500) {
    target.damageTotal = 0;
    target.dpsWindowStart = now;
    target.hp = target.maxHp;
  }
  const damage = Math.max(1, Math.round(amount));
  target.hp = Math.max(0, target.hp - damage);
  target.damageTotal += damage;
  target.lastHitAt = now;
  target.lastDamage = damage;
  const seconds = Math.max(1, (now - target.dpsWindowStart) / 1000);
  const dps = Math.round(target.damageTotal / seconds);
  particles.push({ x: target.x, y: target.y - 44, text: `-${damage}`, color: "#ffe08a", ttl: 0.8 });
  particles.push({ x: target.x, y: target.y - 66, text: `${dps} dps`, color: "#92d4ff", ttl: 0.7 });
  ui.status.textContent = `${source}: ${damage} damage. Dummy DPS ${dps}.`;
  if (target.hp <= 0) {
    particles.push({ x: target.x, y: target.y - 86, text: "reset", color: "#f0d47c", ttl: 0.9 });
  }
  return true;
}

function applyPoisonStack(target) {
  const maxStacks = hasTalent("rogue_venom_stacks") ? 7 : 5;
  const oldStacks = target.poisonStacks || 0;
  target.poisonStacks = Math.min(maxStacks, oldStacks + 1);
  target.poisonTimer = 5;
  if (!target.poisonTickTimer || target.poisonTickTimer <= 0) target.poisonTickTimer = 1;
  if (hasTalent("rogue_venom_cap") && oldStacks < maxStacks && target.poisonStacks >= maxStacks) {
    damageBossTarget(target, Math.round(player.stats.damage * 0.65), "Venom Nova");
  }
  particles.push({ x: target.x, y: target.y - target.radius - 26, text: `poison ${target.poisonStacks}`, color: "#9be06f", ttl: 0.65 });
}

function roguePoisonDamagePerStack() {
  return (isRogueBuild() && player.gear.armor === "channelerRobe" ? 2 : 1) + (hasTalent("rogue_venom_damage") ? 1 : 0);
}

function applyBleed(target) {
  target.bleedTimer = 4 + (hasTalent("melee_blood_deep") ? 2 : 0);
  target.bleedTickTimer = 0.5;
  particles.push({ x: target.x, y: target.y - target.radius - 44, text: "bleed", color: "#ff6e7f", ttl: 0.65 });
}

function applyBurn(target) {
  target.burnTimer = 3.5;
  target.burnTickTimer = 0.5;
  particles.push({ x: target.x, y: target.y - target.radius - 50, text: "burn", color: "#ff8a32", ttl: 0.65 });
}

function applyExposedStack(target, projectile) {
  const targetToPlayer = Math.atan2(player.y - target.y, player.x - target.x);
  const strikeAngle = Math.atan2(projectile.vy, projectile.vx);
  const angledHit = Math.abs(angleDifference(strikeAngle, targetToPlayer)) < Math.PI * 0.62;
  if (!angledHit && player.backstabTimer <= 0) return;
  target.exposedStacks = Math.min(3, (target.exposedStacks || 0) + 1);
  target.exposedTimer = 4 + (hasTalent("rogue_shadow_exposed") ? 2 : 0);
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
  if (target.mazeEnemy) {
    handleMazeEnemyDefeated(target);
    return;
  }
  particles.push({ x: target.x, y: target.y - 62, text: `${target.name} down`, color: "#ffd27a", ttl: 1.2 });
  if (target === selectedBoss) selectedBoss = null;
  if (target.kind === "ketchup") clearKetchupHazards();
  if (target.kind === "mayo") makeKetchupPuddlesPermanent();
  if (livingBosses().length === 0) {
    if (isPartySyncActive() && !isMultiplayerHost()) {
      ui.status.textContent = "Boss defeated. Waiting for host progression.";
      showFloat("Waiting for host");
      return;
    }
    if (boss.kind === "trio") prepareNextBoss("sauce", "Condiment Trio");
    else winFight();
  }
}

function handleMazeEnemyDefeated(target) {
  particles.push({ x: target.x, y: target.y - 42, text: target.miniBoss ? "warden down" : "cleared", color: "#ffd27a", ttl: 1.0 });
  if (!target.miniBoss || !mazeState) return;
  mazeState.cleared = true;
  mazeState.rewardPending = true;
  selectedBoss = null;
  playerProjectiles = [];
  hazards = hazards.filter((hazard) => !hazard.mazeHazard);
  if (isPartySyncActive()) {
    if (isMultiplayerHost()) {
      broadcastPartyPhase("reward", {
        bossKind: boss.kind,
        mazeSequence: mazeState.sequence,
      });
      sendGauntletSync(true);
    }
    return;
  }
  showMazeRewardChoices();
}

function showMazeRewardChoices() {
  if (!ui.mazeRewardOverlay || !ui.mazeRewardCards || !mazeState) return;
  ui.mazeRewardTitle.textContent = `${mazeState.theme.name} Reward`;
  ui.mazeRewardCards.innerHTML = mazeState.rewardOptions.map((reward) => `
    <button class="reward-card" type="button" data-reward="${reward.id}">
      <strong>${escapeHtml(reward.name)}</strong>
      <span>${escapeHtml(reward.description)}</span>
    </button>
  `).join("");
  ui.mazeRewardOverlay.hidden = false;
  ui.status.textContent = "Choose one gauntlet reward to open the boss gate.";
  showFloat("Choose a reward");
}

function chooseMazeReward(rewardId) {
  if (!mazeState || !mazeState.rewardPending || mazeState.rewardChosen) return;
  const reward = mazeState.rewardOptions.find((option) => option.id === rewardId);
  if (!reward) return;
  const oldMaxHp = player.maxHp;
  Object.entries(reward.values).forEach(([key, value]) => {
    if (key === "potion") {
      player.potions = Math.min(4, player.potions + value);
      return;
    }
    runState.mazeBuffs[key] = (runState.mazeBuffs[key] || 0) + value;
  });
  applyGear();
  if (player.maxHp > oldMaxHp) player.hp = Math.min(player.maxHp, player.hp + player.maxHp - oldMaxHp);
  mazeState.rewardPending = false;
  mazeState.rewardChosen = true;
  mazeState.exitOpen = !isPartySyncActive();
  if (ui.mazeRewardOverlay) ui.mazeRewardOverlay.hidden = true;
  if (isPartySyncActive()) {
    ui.status.textContent = `${reward.name} gained. Waiting for the party.`;
    showScreenBanner(reward.name, "Waiting for everyone", "victory", 2.2);
    showFloat("Waiting for party");
    markPartyReady("reward");
    sendGauntletSync(true);
    sendMultiplayerState(true);
    return;
  }
  ui.status.textContent = `${reward.name} gained. The boss gate is open.`;
  showScreenBanner(reward.name, "Gauntlet exit unlocked", "victory", 2.2);
  showFloat("Exit open");
  sendMultiplayerState(true);
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
  remoteProjectiles = [];
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
  drawTrainingDummy();
  drawMazeEnemies();
  drawBoss();
  drawHazards();
  drawAbilityEffects();
  drawPlayerProjectiles();
  drawRemoteProjectiles();
  drawPlayer();
  drawRemotePlayers();
  drawParticles();
  ctx.restore();
  drawTacoObjectiveText();
  drawAbilityBar();
  drawRunCompleteOverlay();
  drawScreenBanner();
}

function drawRooms() {
  ctx.fillStyle = "#141917";
  ctx.fillRect(0, 0, world.width, world.height);
  drawRoom(world.starter, "#27362f", "#a6b9a2");
  if (player.room === "maze" && mazeState) drawMaze();
  else drawRoom(world.arena, "#30292b", "#c89b62");
  const gateLocked = runState.buildLocked;
  ctx.fillStyle = gateLocked ? "#4a3422" : "#80623a";
  ctx.fillRect(world.gate.x, world.gate.y, world.gate.w, world.gate.h);
  ctx.strokeStyle = gateLocked ? "#ff6f61" : "#f0d47c";
  ctx.lineWidth = 4;
  ctx.strokeRect(world.gate.x + 3, world.gate.y + 3, world.gate.w - 6, world.gate.h - 6);
  ctx.fillStyle = "#d8c693";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(gateLocked ? "BUILD" : "READY", world.gate.x + world.gate.w / 2, world.gate.y + 58);
  ctx.fillText(gateLocked ? "LOCKED" : "GATE", world.gate.x + world.gate.w / 2, world.gate.y + 82);
  ctx.textAlign = "left";
  drawStarterRoomLabels();

  if (player.room !== "maze") {
    ctx.fillStyle = "rgba(238, 228, 188, 0.1)";
    for (let x = world.arena.x + 70; x < world.arena.x + world.arena.w; x += 92) {
      ctx.fillRect(x, world.arena.y + 30, 2, world.arena.h - 60);
    }
    for (let y = world.arena.y + 70; y < world.arena.y + world.arena.h; y += 92) {
      ctx.fillRect(world.arena.x + 30, y, world.arena.w - 60, 2);
    }
  }
}

function drawMaze() {
  if (mazeState.encounterType === "gauntlet") {
    drawGauntletRoom();
    return;
  }
  const theme = mazeState.theme;
  drawRoom(world.maze, theme.floor, theme.trim);
  ctx.save();
  ctx.fillStyle = theme.floor;
  ctx.fillRect(mazeState.bounds.x, mazeState.bounds.y, mazeState.bounds.w, mazeState.bounds.h);
  for (let y = 0; y < mazeState.rows; y += 1) {
    for (let x = 0; x < mazeState.cols; x += 1) {
      const rect = mazeCellRect(mazeState, x, y);
      if (mazeState.grid[y][x]) {
        ctx.fillStyle = "#050505";
        mazeWallVisualRects({ x, y }).forEach((wall) => {
          ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        });
      } else if ((x + y) % 5 === 0) {
        ctx.fillStyle = "rgba(244, 232, 203, 0.06)";
        ctx.fillRect(rect.x + rect.w * 0.35, rect.y + rect.h * 0.35, rect.w * 0.3, rect.h * 0.3);
      }
    }
  }
  if (mazeState.miniBossCell) {
    const room = mazeCellRect(mazeState, mazeState.miniBossCell.x - 1, mazeState.miniBossCell.y - 1);
    ctx.strokeStyle = "rgba(240, 212, 124, 0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(room.x + 4, room.y + 4, mazeState.cellSize * 3 - 8, mazeState.cellSize * 3 - 8);
  }
  ctx.fillStyle = "rgba(155, 224, 111, 0.32)";
  ctx.strokeStyle = "#9be06f";
  ctx.lineWidth = 3;
  ctx.fillRect(mazeState.entrance.x + 5, mazeState.entrance.y + 5, mazeState.entrance.w - 10, mazeState.entrance.h - 10);
  ctx.strokeRect(mazeState.entrance.x + 5, mazeState.entrance.y + 5, mazeState.entrance.w - 10, mazeState.entrance.h - 10);
  ctx.fillStyle = mazeState.exitOpen ? "rgba(240, 212, 124, 0.36)" : "rgba(255, 111, 97, 0.28)";
  ctx.strokeStyle = mazeState.exitOpen ? "#f0d47c" : "#ff6f61";
  ctx.fillRect(mazeState.exit.x + 5, mazeState.exit.y + 5, mazeState.exit.w - 10, mazeState.exit.h - 10);
  ctx.strokeRect(mazeState.exit.x + 5, mazeState.exit.y + 5, mazeState.exit.w - 10, mazeState.exit.h - 10);
  ctx.fillStyle = theme.trim;
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(theme.name, world.maze.x + world.maze.w / 2, world.maze.y + 42);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "13px sans-serif";
  ctx.fillText(mazeState.exitOpen ? "Exit open" : "Defeat the warden", world.maze.x + world.maze.w / 2, world.maze.y + 64);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawGauntletRoom() {
  const theme = mazeState.theme;
  const bounds = mazeState.bounds;
  drawRoom(world.maze, theme.floor, theme.trim);
  ctx.save();
  ctx.fillStyle = theme.floor;
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.strokeStyle = "rgba(247, 239, 217, 0.10)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i += 1) {
    const y = bounds.y + (bounds.h / 6) * i;
    ctx.beginPath();
    ctx.moveTo(bounds.x + 16, y);
    ctx.lineTo(bounds.x + bounds.w - 16, y);
    ctx.stroke();
  }
  ctx.fillStyle = `${theme.decor}22`;
  for (let i = 0; i < 5; i += 1) {
    const x = bounds.x + 70 + i * 128;
    ctx.fillRect(x, bounds.y + 18 + (i % 2) * 32, 42, bounds.h - 58);
  }
  ctx.strokeStyle = theme.trim;
  ctx.lineWidth = 3;
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.fillStyle = "rgba(155, 224, 111, 0.28)";
  ctx.strokeStyle = "#9be06f";
  ctx.fillRect(mazeState.entrance.x, mazeState.entrance.y, mazeState.entrance.w, mazeState.entrance.h);
  ctx.strokeRect(mazeState.entrance.x, mazeState.entrance.y, mazeState.entrance.w, mazeState.entrance.h);
  ctx.fillStyle = mazeState.exitOpen ? "rgba(240, 212, 124, 0.36)" : "rgba(255, 111, 97, 0.24)";
  ctx.strokeStyle = mazeState.exitOpen ? "#f0d47c" : "#ff6f61";
  ctx.fillRect(mazeState.exit.x, mazeState.exit.y, mazeState.exit.w, mazeState.exit.h);
  ctx.strokeRect(mazeState.exit.x, mazeState.exit.y, mazeState.exit.w, mazeState.exit.h);
  mazeState.spawnMarkers?.forEach((marker, index) => {
    ctx.strokeStyle = index < 4 ? "rgba(247, 239, 217, 0.18)" : "rgba(240, 212, 124, 0.20)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  });
  if (mazeState.miniBossEnemy) {
    ctx.strokeStyle = "rgba(240, 212, 124, 0.38)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mazeState.miniBossEnemy.spawnX, mazeState.miniBossEnemy.spawnY, 78, 0, Math.PI * 2);
    ctx.stroke();
  }
  mazeState.obstacles?.forEach(drawGauntletObstacle);
  drawGauntletPickups();
  ctx.fillStyle = theme.trim;
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(theme.name, world.maze.x + world.maze.w / 2, world.maze.y + 42);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "13px sans-serif";
  ctx.fillText(gauntletObjectiveText(), world.maze.x + world.maze.w / 2, world.maze.y + 64);
  ctx.textAlign = "left";
  ctx.restore();
}

function gauntletObjectiveText() {
  if (!mazeState) return "";
  if (mazeState.exitOpen) return "Exit open";
  if (mazeState.rewardPending) return "Choose a reward";
  if (mazeState.miniBossSpawned) return "Defeat the warden";
  if (mazeState.waveIndex < 0) return "Wave 1 incoming";
  return `Clear wave ${mazeState.waveIndex + 1}/${mazeState.waves?.length || 2}`;
}

function drawGauntletObstacle(obstacle) {
  ctx.save();
  ctx.fillStyle = obstacle.color;
  ctx.strokeStyle = obstacle.outline;
  ctx.lineWidth = 3;
  if (obstacle.type === "circle") {
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 239, 217, 0.18)";
    ctx.beginPath();
    ctx.arc(obstacle.x - obstacle.r * 0.25, obstacle.y - obstacle.r * 0.25, obstacle.r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 239, 217, 0.14)";
    ctx.fillRect(obstacle.x + 10, obstacle.y + 8, Math.max(12, obstacle.w - 20), 5);
  }
  ctx.fillStyle = "#f7efd9";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  const labelX = obstacle.type === "circle" ? obstacle.x : obstacle.x + obstacle.w / 2;
  const labelY = obstacle.type === "circle" ? obstacle.y + 4 : obstacle.y + obstacle.h / 2 + 4;
  ctx.fillText(obstacle.label.toUpperCase(), labelX, labelY);
  ctx.restore();
}

function drawGauntletPickups() {
  if (!mazeState?.pickupDrops?.length) return;
  mazeState.pickupDrops.forEach((pickup) => {
    const pulse = Math.sin(performance.now() / 180) * 2;
    ctx.fillStyle = pickup.type === "potion" ? "#77c6ff" : "#9be06f";
    ctx.strokeStyle = "#f7efd9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.r + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#173018";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pickup.type === "potion" ? "P" : "+", pickup.x, pickup.y + 5);
    ctx.textAlign = "left";
  });
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
  ctx.fillText(runState.buildLocked ? "Build locked for this run" : "Choose class and armor", centerX, world.starter.y + 72);
  ctx.font = "15px sans-serif";
  ctx.fillText(starterObjectiveText(), centerX, world.starter.y + 104);
  ctx.shadowBlur = 0;
  const panelW = 292;
  const panelX = world.gate.x - panelW - 22;
  ctx.fillStyle = "rgba(9, 12, 10, 0.72)";
  ctx.strokeStyle = runState.buildLocked ? "rgba(255, 111, 97, 0.8)" : "rgba(240, 212, 124, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(panelX, world.gate.y - 78, panelW, 58, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = runState.buildLocked ? "#ffb4aa" : "#f0d47c";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText(runState.buildLocked ? "Build Locked" : "Starter Objective", panelX + panelW / 2, world.gate.y - 54);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "13px sans-serif";
  ctx.fillText(runState.buildLocked ? `Defeat ${boss.name}` : "Test dummy, then cross gate", panelX + panelW / 2, world.gate.y - 32);
  ctx.restore();
}

function starterObjectiveText() {
  if (player.won) return "Run cleared. Reset when you want to start over.";
  if (!runState.active) return "Pick a mode to begin a run.";
  if (runState.mode === "dev") return `Boss Test: ${boss.name}. Cross the gate when ready.`;
  if (runState.buildLocked) return `${boss.name} is active. Fight until it falls.`;
  return `Next Boss: ${boss.name}. Test damage, then cross the gate.`;
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

function drawMazeEnemies() {
  if (player.room !== "maze" || !mazeState) return;
  mazeState.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;
    const pulse = Math.sin(enemy.moveTimer * 6) * (enemy.miniBoss ? 3 : 1.5);
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (selectedBoss === enemy) drawRing(0, 0, enemy.radius + 8, "#ffe082");
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 8, enemy.radius * 0.9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = enemy.miniBoss ? mazeState.theme.trim : "#171313";
    ctx.lineWidth = enemy.miniBoss ? 4 : 3;
    ctx.beginPath();
    if (enemy.ranged) ctx.roundRect(-enemy.radius, -enemy.radius - pulse, enemy.radius * 2, enemy.radius * 2.1, 8);
    else ctx.arc(0, 0, enemy.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#171313";
    ctx.beginPath();
    ctx.arc(-enemy.radius * 0.32, -enemy.radius * 0.18, 3.5, 0, Math.PI * 2);
    ctx.arc(enemy.radius * 0.32, -enemy.radius * 0.18, 3.5, 0, Math.PI * 2);
    ctx.fill();
    const hpWidth = enemy.miniBoss ? 92 : 48;
    ctx.fillStyle = "rgba(10, 12, 11, 0.82)";
    ctx.fillRect(-hpWidth / 2, -enemy.radius - 20, hpWidth, 6);
    ctx.fillStyle = enemy.miniBoss ? "#f0d47c" : "#9be06f";
    ctx.fillRect(-hpWidth / 2, -enemy.radius - 20, hpWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), 6);
    if (enemy.miniBoss) {
      ctx.fillStyle = "#f7efd9";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(enemy.name, 0, -enemy.radius - 30);
      ctx.textAlign = "left";
    }
    ctx.restore();
  });
}

function drawBoss() {
  if (player.room !== "arena") return;
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
  } else if (boss.kind === "taco") {
    drawTacoTitanBoss();
  } else if (boss.kind === "donut") {
    drawDonutDonaldBoss();
  } else if (boss.kind === "sushi") {
    drawSushiSerpentBoss();
  } else {
    drawBurgerBoss();
  }
  ctx.fillStyle = "#f2d087";
  ctx.fillRect(boss.x - 58, boss.y - boss.radius - 24, 116 * (boss.hp / boss.maxHp), 9);
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  const phaseText = boss.kind === "shake" ? ` ${boss.phase}/3` : boss.kind === "nacho" || boss.kind === "pizza" || boss.kind === "taco" || boss.kind === "donut" || boss.kind === "sushi" ? ` Phase ${boss.phase}` : "";
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
  if (target.kind === "ketchup") drawKetchupBoss(target);
  else if (target.kind === "mustard") drawMustardBoss(target);
  else drawMayoBoss(target);
  drawCondimentHealth(target);
  if (target.shieldTimer > 0) drawRing(target.x, target.y, target.radius + 16, "#f6f0df");
  ctx.textAlign = "left";
}

function drawKetchupBoss(target) {
  const bob = Math.sin(target.moveTimer * 8 + performance.now() / 220) * 2;
  ctx.save();
  ctx.translate(target.x, target.y + bob);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 35, 34, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b92d28";
  ctx.strokeStyle = "#461413";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-27, -32, 54, 74, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ef4a3e";
  ctx.beginPath();
  ctx.roundRect(-18, -25, 18, 58, 8);
  ctx.fill();

  ctx.fillStyle = "#f4ead7";
  ctx.strokeStyle = "#461413";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-18, -8, 36, 25, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b92d28";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("K", 0, 8);

  ctx.fillStyle = "#f2d087";
  ctx.strokeStyle = "#461413";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-18, -50, 36, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#cf3b2f";
  ctx.beginPath();
  ctx.moveTo(-10, -50);
  ctx.lineTo(10, -50);
  ctx.lineTo(0, -66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawCondimentFace(0, -9, "#2c1715", "#fff2c6", true);
  ctx.restore();
}

function drawMustardBoss(target) {
  const winding = target.state === "winding";
  const pulse = winding ? Math.sin(performance.now() / 70) * 2 : 0;
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 35, 35, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = winding ? "#f4d45a" : "#e3bf34";
  ctx.strokeStyle = "#5e4818";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-25 - pulse, -28 - pulse, 50 + pulse * 2, 70 + pulse * 2, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff08a";
  ctx.beginPath();
  ctx.roundRect(-15, -20, 14, 54, 6);
  ctx.fill();

  ctx.strokeStyle = "#7b5d19";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-34, -2);
  ctx.quadraticCurveTo(-48, 12, -35, 30);
  ctx.moveTo(34, -2);
  ctx.quadraticCurveTo(48, 12, 35, 30);
  ctx.stroke();

  ctx.fillStyle = "#f4ead7";
  ctx.strokeStyle = "#5e4818";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-17, -47, 34, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e3bf34";
  ctx.beginPath();
  ctx.moveTo(-7, -47);
  ctx.lineTo(7, -47);
  ctx.lineTo(0, -66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (winding) {
    ctx.strokeStyle = "rgba(255, 240, 138, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 3, 44 + pulse * 2, -0.45, 0.45);
    ctx.stroke();
  }
  drawCondimentFace(0, -7, "#33260c", "#fff9c7", false);
  ctx.restore();
}

function drawMayoBoss(target) {
  const panic = target.hp / target.maxHp < 0.45;
  const wobble = Math.sin(performance.now() / 95) * (panic ? 4 : 2);
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3ead2";
  ctx.strokeStyle = "#4c4030";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-30, -23 + wobble * 0.2, 60, 66, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  ctx.beginPath();
  ctx.roundRect(-20, -14, 18, 48, 8);
  ctx.fill();

  ctx.fillStyle = "#d9d0bd";
  ctx.strokeStyle = "#4c4030";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-26, -42, 52, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ebe1cc";
  ctx.beginPath();
  ctx.ellipse(0, -27, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = panic ? "#cf3b2f" : "#4c4030";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-35, 0);
  ctx.quadraticCurveTo(-49, 12 + wobble, -31, 25);
  ctx.moveTo(35, 0);
  ctx.quadraticCurveTo(49, 12 - wobble, 31, 25);
  ctx.stroke();

  drawCondimentFace(0, -4, "#443b31", "#fff7e8", false, panic);
  ctx.restore();
}

function drawCondimentFace(x, y, dark, light, grin, worried = false) {
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(x - 10, y - 4, 5, 6, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + 10, y - 4, 5, 6, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(x - 8, y - 6, 1.6, 0, Math.PI * 2);
  ctx.arc(x + 12, y - 6, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (worried) {
    ctx.arc(x, y + 13, 10, Math.PI * 1.12, Math.PI * 1.88);
  } else if (grin) {
    ctx.arc(x, y + 4, 13, 0.15, Math.PI - 0.15);
  } else {
    ctx.moveTo(x - 10, y + 9);
    ctx.quadraticCurveTo(x, y + 15, x + 10, y + 9);
  }
  ctx.stroke();
}

function drawCondimentHealth(target) {
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(target.name, target.x, target.y - target.radius - 34);
  ctx.fillStyle = "#141414";
  ctx.fillRect(target.x - 38, target.y - target.radius - 22, 76, 7);
  ctx.fillStyle = target.shieldTimer > 0 ? "#f6f0df" : "#f2d087";
  ctx.fillRect(target.x - 38, target.y - target.radius - 22, 76 * (target.hp / target.maxHp), 7);
}

function drawBurgerBoss() {
  ctx.fillStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#312923";
  ctx.fillRect(boss.x - 42, boss.y - 20, 84, 60);
}

function drawTacoTitanBoss() {
  const crack = boss.phase >= 2 ? Math.sin(boss.animationTime * 12) * 3 : 0;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.fillStyle = boss.exposedFillingTimer > 0 ? "#ffb15a" : boss.enraged ? boss.enrageColor : boss.color;
  ctx.strokeStyle = "#4f2d16";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius, Math.PI * 1.05, Math.PI * 1.95);
  ctx.quadraticCurveTo(0, -boss.radius * 1.2, boss.radius * 0.92, 0);
  ctx.quadraticCurveTo(0, boss.radius * 0.56, -boss.radius * 0.92, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (boss.shellGuardActive) {
    ctx.strokeStyle = "rgba(255, 244, 196, 0.78)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -6, boss.radius + 14 + Math.sin(boss.animationTime * 5) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (boss.exposedFillingTimer > 0) {
    ctx.shadowColor = "#ff8a32";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#fff4c4";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -4, boss.radius + 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = "#6d3a1f";
  ctx.fillRect(-44, -10, 88, 22);
  ctx.fillStyle = "#6fbf55";
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(i * 16, -34 + Math.sin(boss.animationTime * 4 + i) * 4, 14, 7, i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#fff1a8";
  ctx.lineWidth = 4;
  if (boss.phase >= 2) {
    ctx.beginPath();
    ctx.moveTo(-14 + crack, -66);
    ctx.lineTo(4 - crack, -30);
    ctx.lineTo(-8 + crack, 6);
    ctx.lineTo(18 - crack, 42);
    ctx.stroke();
  }
  if (boss.napkinTimer > 0 && boss.napkinZone) {
    ctx.restore();
    const napkinW = boss.napkinZone.w || 136;
    const napkinH = boss.napkinZone.h || 92;
    ctx.fillStyle = "rgba(245, 245, 230, 0.26)";
    ctx.strokeStyle = "#f5f5e6";
    ctx.lineWidth = 4;
    ctx.fillRect(boss.napkinZone.x - napkinW / 2, boss.napkinZone.y - napkinH / 2, napkinW, napkinH);
    ctx.strokeRect(boss.napkinZone.x - napkinW / 2, boss.napkinZone.y - napkinH / 2, napkinW, napkinH);
    ctx.strokeStyle = "rgba(255, 244, 196, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(boss.napkinZone.x - napkinW / 2 + 10, boss.napkinZone.y - napkinH / 2 + 10, napkinW - 20, napkinH - 20);
    ctx.fillStyle = "#f5f5e6";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SAFE NAPKIN", boss.napkinZone.x, boss.napkinZone.y - 4);
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`${Math.ceil(Math.max(0, boss.tacoFloodCountdown || boss.napkinTimer || 0))}s`, boss.napkinZone.x, boss.napkinZone.y + 14);
    ctx.textAlign = "left";
    return;
  }
  ctx.restore();
}

function drawTacoObjectiveText() {
  if (boss.kind !== "taco" || player.room !== "arena" || player.dead || player.won) return;
  const x = canvas.clientWidth / 2;
  const y = 92;
  const current = boss.tacoCurrentIngredient ? tacoIngredientName(boss.tacoCurrentIngredient) : "Ready";
  const progress = boss.tacoIngredientQueue?.length ? `${Math.min((boss.tacoPuzzleStep || 0) + 1, boss.tacoIngredientQueue.length)}/${boss.tacoIngredientQueue.length}` : "-";
  const state = boss.exposedFillingTimer > 0
    ? `Exposed Filling ${Math.ceil(boss.exposedFillingTimer)}s`
    : boss.shellGuardActive
      ? "Shell Guard"
      : "Shell Cracked";
  ctx.save();
  ctx.fillStyle = "rgba(16, 12, 8, 0.78)";
  ctx.strokeStyle = boss.exposedFillingTimer > 0 ? "#ffb15a" : "#f0d47c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 230, y - 38, 460, 72, 8);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = boss.exposedFillingTimer > 0 ? "#ffd782" : "#fff4c4";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`${state} | ${current} ${progress}`, x, y - 12);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "13px sans-serif";
  ctx.fillText(boss.tacoObjectiveText || "Solve ingredient combos to crack the shell.", x, y + 12);
  ctx.restore();
}

function drawDonutDonaldBoss() {
  if (boss.donutGauntletActive) {
    drawDonutGauntletBanner();
    boss.donutMinions?.forEach(drawDonutMinion);
    return;
  }
  ctx.save();
  ctx.translate(boss.x, boss.y);
  const rolling = boss.animation === "royalRoll" || boss.animation === "royalRollWindup";
  const pulse = rolling ? Math.sin(boss.animationTime * 16) * 7 : Math.sin(boss.animationTime * 5) * 4;
  if (rolling) {
    ctx.rotate(boss.animationTime * (boss.enraged ? 13 : 10));
  }
  ctx.fillStyle = boss.enraged ? "#ff79aa" : "#c7834f";
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius + pulse, 0, Math.PI * 2);
  ctx.fill();
  if (rolling) {
    ctx.strokeStyle = "rgba(255, 244, 196, 0.72)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#f7b7d3";
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius * 0.76 + pulse * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#181817";
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius * 0.34, 0, Math.PI * 2);
  ctx.fill();
  const sprinkleColors = ["#fff08a", "#8ec7ff", "#ff5d73", "#9be06f"];
  for (let i = 0; i < 14; i += 1) {
    const angle = i * 1.7 + boss.animationTime;
    const r = boss.radius * (0.48 + (i % 3) * 0.1);
    ctx.strokeStyle = sprinkleColors[i % sprinkleColors.length];
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r - 5, Math.sin(angle) * r);
    ctx.lineTo(Math.cos(angle) * r + 5, Math.sin(angle) * r + 3);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffd66b";
  ctx.fillRect(-34, -boss.radius - 20, 68, 16);
  ctx.restore();
  boss.donutHoles?.forEach(drawDonutHole);
  boss.donutMinions?.forEach(drawDonutMinion);
}

function drawDonutGauntletBanner() {
  const centerX = world.arena.x + world.arena.w / 2;
  ctx.save();
  ctx.fillStyle = "rgba(255, 121, 170, 0.16)";
  ctx.strokeStyle = "#ff79aa";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(centerX - 170, world.arena.y + 18, 340, 54, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd7e8";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`DONUT ONSLAUGHT ${Math.ceil(Math.max(0, boss.donutGauntletTimer))}s`, centerX, world.arena.y + 52);
  ctx.restore();
}

function drawDonutMinion(minion) {
  if (minion.hp <= 0) return;
  const pulse = Math.sin((minion.animationTime || 0) * 8) * 2;
  ctx.save();
  ctx.translate(minion.x, minion.y);
  ctx.rotate((minion.animationTime || 0) * (minion.kind === "crawler" ? 5 : 2));
  ctx.fillStyle = minion.color;
  ctx.strokeStyle = minion.kind === "glazer" ? "#fff08a" : "#5a2d21";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, minion.r + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = minion.kind === "shooter" ? "#8ec7ff" : "#f7b7d3";
  ctx.beginPath();
  ctx.arc(0, 0, minion.r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#181817";
  ctx.beginPath();
  ctx.arc(0, 0, minion.r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#ffd7e8";
  ctx.fillRect(minion.x - 22, minion.y - minion.r - 14, 44 * (minion.hp / minion.maxHp), 5);
}

function drawDonutHole(hole) {
  if (hole.hp <= 0) return;
  ctx.fillStyle = "#b96f42";
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7b7d3";
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r * 0.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#181817";
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd7e8";
  ctx.fillRect(hole.x - 20, hole.y - hole.r - 14, 40 * (hole.hp / hole.maxHp), 5);
}

function drawWasabiArrow(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(217, 255, 209, 0.78)";
  ctx.strokeStyle = "rgba(31, 80, 38, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(-12, -16);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-12, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSushiSerpentBoss() {
  const segments = sushiSegments();
  if (segments.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(26, 49, 38, 0.94)";
  ctx.lineWidth = 58;
  strokeSmoothSushiPath(segments);

  ctx.strokeStyle = boss.enraged ? "rgba(122, 196, 109, 0.96)" : "rgba(241, 234, 215, 0.96)";
  ctx.lineWidth = 42;
  strokeSmoothSushiPath(segments);

  ctx.strokeStyle = "rgba(36, 55, 41, 0.9)";
  ctx.lineWidth = 15;
  strokeSmoothSushiPath(segments);

  for (let i = segments.length - 1; i >= 1; i -= 1) {
    const segment = segments[i];
    const side = i % 2 === 0 ? 1 : -1;
    const finAngle = segment.heading + side * Math.PI * 0.72;
    ctx.fillStyle = segment.weak ? "rgba(159, 240, 137, 0.9)" : "rgba(240, 154, 130, 0.76)";
    ctx.strokeStyle = segment.weak ? "#eaff9f" : "rgba(54, 32, 28, 0.75)";
    ctx.lineWidth = segment.weak ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(segment.x + Math.cos(segment.heading + Math.PI / 2) * side * 18, segment.y + Math.sin(segment.heading + Math.PI / 2) * side * 18);
    ctx.lineTo(segment.x + Math.cos(finAngle) * 42, segment.y + Math.sin(finAngle) * 42);
    ctx.lineTo(segment.x + Math.cos(segment.heading - Math.PI / 2) * side * 10, segment.y + Math.sin(segment.heading - Math.PI / 2) * side * 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (segment.weak) {
      ctx.shadowColor = "#9ff089";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#eaff9f";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.r * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.save();
    ctx.translate(segment.x, segment.y);
    ctx.rotate(segment.heading);
    ctx.fillStyle = i % 2 === 0 ? "rgba(240, 154, 130, 0.82)" : "rgba(255, 244, 230, 0.78)";
    ctx.beginPath();
    ctx.roundRect(-segment.r * 0.7, -7, segment.r * 1.4, 14, 6);
    ctx.fill();
    ctx.restore();
  }

  const head = segments[0];
  const neck = segments[1];
  const headAngle = neck ? Math.atan2(head.y - neck.y, head.x - neck.x) : head.heading ?? boss.serpentHeading;
  ctx.translate(head.x, head.y);
  ctx.rotate(headAngle);
  ctx.fillStyle = "#1a3126";
  ctx.beginPath();
  ctx.ellipse(0, 0, boss.radius * 1.22, boss.radius * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = boss.enraged ? "#8fe070" : "#fff4db";
  ctx.beginPath();
  ctx.ellipse(10, 0, boss.radius * 1.0, boss.radius * 0.68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f09a82";
  ctx.beginPath();
  ctx.ellipse(8, 0, boss.radius * 0.58, boss.radius * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#eaff9f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(42, -8);
  ctx.lineTo(70, -22);
  ctx.moveTo(42, 8);
  ctx.lineTo(70, 22);
  ctx.stroke();
  ctx.fillStyle = "#10120f";
  ctx.beginPath();
  ctx.arc(38, -20, 6, 0, Math.PI * 2);
  ctx.arc(38, 20, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#eaff9f";
  ctx.beginPath();
  ctx.arc(40, -22, 2, 0, Math.PI * 2);
  ctx.arc(40, 18, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(234, 255, 159, 0.9)";
  ctx.lineWidth = 2;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(62, side * 12);
    ctx.quadraticCurveTo(94, side * (18 + Math.sin(boss.animationTime * 5) * 8), 118, side * 5);
    ctx.stroke();
  }
  ctx.restore();

  if (boss.whirlpoolTimer > 0) {
    const cx = world.arena.x + world.arena.w / 2;
    const cy = world.arena.y + world.arena.h / 2;
    ctx.strokeStyle = "rgba(80, 48, 38, 0.72)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 38 + i * 34 + Math.sin(boss.animationTime * 6) * 4, boss.animationTime + i, boss.animationTime + i + Math.PI * 1.3);
      ctx.stroke();
    }
  }
}

function drawTrainingDummy() {
  if (player.room !== "starter") return;
  if (!trainingDummy) return;
  const target = trainingDummy;
  ctx.save();
  drawRing(target.x, target.y, target.radius + 9, "#f0d47c");
  ctx.fillStyle = "#8b5a35";
  ctx.strokeStyle = "#f0d47c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(target.x - 24, target.y - 46, 48, 78, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2a1c15";
  ctx.fillRect(target.x - 30, target.y + 32, 60, 11);
  ctx.fillStyle = "#d8c693";
  ctx.beginPath();
  ctx.arc(target.x, target.y - 18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a1c15";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(target.x - 14, target.y - 2);
  ctx.lineTo(target.x + 14, target.y - 2);
  ctx.moveTo(target.x, target.y - 30);
  ctx.lineTo(target.x, target.y + 18);
  ctx.stroke();
  const width = 92;
  const hpPercent = clamp(target.hp / target.maxHp, 0, 1);
  ctx.fillStyle = "rgba(10, 12, 11, 0.8)";
  ctx.fillRect(target.x - width / 2 - 2, target.y - 74, width + 4, 10);
  ctx.fillStyle = "#4a241c";
  ctx.fillRect(target.x - width / 2, target.y - 72, width, 6);
  ctx.fillStyle = "#f0d47c";
  ctx.fillRect(target.x - width / 2, target.y - 72, width * hpPercent, 6);
  const seconds = target.dpsWindowStart ? Math.max(1, (performance.now() - target.dpsWindowStart) / 1000) : 1;
  const dps = target.damageTotal ? Math.round(target.damageTotal / seconds) : 0;
  ctx.fillStyle = "#fff2c6";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Training Dummy", target.x, target.y - 88);
  ctx.fillStyle = "rgba(10, 12, 11, 0.74)";
  ctx.beginPath();
  ctx.roundRect(target.x - 76, target.y + 52, 152, 46, 8);
  ctx.fill();
  ctx.fillStyle = "#f7efd9";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(target.lastDamage ? `Last Hit: ${target.lastDamage}` : "Click to test damage", target.x, target.y + 69);
  ctx.fillStyle = dps ? "#92d4ff" : "#d0c6b4";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(dps ? `Dummy DPS: ${dps}` : "Dummy DPS: --", target.x, target.y + 87);
  ctx.restore();
}

function strokeSmoothSushiPath(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const previous = points[i - 1] || current;
    const after = points[i + 2] || next;
    const tension = 0.32;
    const cp1x = current.x + (next.x - previous.x) * tension;
    const cp1y = current.y + (next.y - previous.y) * tension;
    const cp2x = next.x - (after.x - current.x) * tension;
    const cp2y = next.y - (after.y - current.y) * tension;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
  }
  ctx.stroke();
}

function drawSpecialSauceBoss() {
  const colors = ["#cf3b2f", "#e3bf34", "#f3ead2"];
  const wobble = Math.sin(boss.animationTime * 5) * 4;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 54, 58, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#4a241b";
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    const angle = boss.animationTime * 2 + i * 2.09;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(angle) * 18,
      Math.sin(angle) * 14 + wobble * 0.25,
      boss.radius - i * 7,
      boss.radius * 0.72 - i * 5,
      angle * 0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (i === 0) ctx.stroke();
  }

  for (let i = 0; i < 9; i += 1) {
    const angle = boss.animationTime * 1.7 + i * 0.7;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * (48 + (i % 3) * 5), Math.sin(angle) * 34, 5 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(40, 24, 18, 0.78)";
  ctx.beginPath();
  ctx.arc(0, 8, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff2c6";
  ctx.beginPath();
  ctx.arc(-10, 0, 4, 0, Math.PI * 2);
  ctx.arc(10, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff2c6";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 9, 13, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();
  if (boss.shieldTimer > 0) drawRing(boss.x, boss.y, boss.radius + 16, "#f6f0df");
  if (boss.state === "winding") {
    drawRing(boss.x, boss.y, boss.radius + 24, "#fff08a");
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
    if (hazard.type === "mazeShot") {
      ctx.fillStyle = hazard.color || "#f0d47c";
      ctx.shadowColor = hazard.color || "#f0d47c";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      return;
    }
    if (hazard.type === "mazeCircle") {
      const warning = hazard.warn > 0;
      const progress = warning ? 1 - clamp(hazard.warn / 0.75, 0, 1) : 1;
      ctx.fillStyle = warning ? "rgba(255, 255, 255, 0.07)" : `${hexToRgba(hazard.color || "#f0d47c", hazard.lingering ? 0.28 : 0.2)}`;
      ctx.strokeStyle = hazard.color || "#f0d47c";
      ctx.lineWidth = warning ? 3 : 2;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r * (warning ? 0.55 + progress * 0.45 : 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "mazeWall") {
      const active = hazard.warn <= 0;
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      if (!hazard.vertical) ctx.rotate(Math.PI / 2);
      ctx.fillStyle = active ? hexToRgba(hazard.color || "#f0d47c", 0.42) : "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = hazard.color || "#f0d47c";
      ctx.lineWidth = active ? 4 : 2;
      ctx.fillRect(-hazard.width / 2, -hazard.length / 2, hazard.width, hazard.length);
      ctx.strokeRect(-hazard.width / 2, -hazard.length / 2, hazard.width, hazard.length);
      ctx.restore();
      return;
    }
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
    if (hazard.type === "royalRoll") {
      const active = hazard.warn <= 0;
      const pulse = Math.sin(boss.animationTime * 12) * 0.5 + 0.5;
      ctx.save();
      ctx.strokeStyle = active ? "rgba(255, 121, 170, 0.76)" : `rgba(255, 244, 196, ${0.38 + pulse * 0.26})`;
      ctx.lineWidth = active ? hazard.width : 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hazard.startX, hazard.startY);
      ctx.lineTo(hazard.endX, hazard.endY);
      ctx.stroke();
      ctx.strokeStyle = active ? "rgba(255, 255, 255, 0.72)" : "rgba(255, 121, 170, 0.72)";
      ctx.lineWidth = active ? 4 : 3;
      ctx.setLineDash(active ? [] : [18, 12]);
      ctx.beginPath();
      ctx.moveTo(hazard.startX, hazard.startY);
      ctx.lineTo(hazard.endX, hazard.endY);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0.25; i < 1; i += 0.25) {
        const arrowX = hazard.startX + (hazard.endX - hazard.startX) * i;
        const arrowY = hazard.startY + (hazard.endY - hazard.startY) * i;
        drawWasabiArrow(arrowX, arrowY, hazard.angle);
      }
      if (!active) {
        ctx.fillStyle = "rgba(255, 121, 170, 0.22)";
        ctx.strokeStyle = "#ff79aa";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hazard.startX, hazard.startY, boss.radius + 12 + pulse * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (hazard.type === "tacoCharge" || hazard.type === "serpentSweep") {
      const active = hazard.warn <= 0;
      const color = hazard.type === "serpentSweep" ? "122, 196, 109" : "240, 91, 50";
      ctx.strokeStyle = active ? `rgba(${color}, 0.72)` : "rgba(255, 244, 196, 0.48)";
      ctx.lineWidth = active ? hazard.width : 6;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + Math.cos(hazard.angle) * hazard.length, hazard.y + Math.sin(hazard.angle) * hazard.length);
      ctx.stroke();
      return;
    }
    if (hazard.type === "tacoShellShard") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 228, 154, 0.16)" : "rgba(210, 154, 56, 0.6)";
      ctx.strokeStyle = warning ? "#fff4c4" : "#6f3d18";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y - hazard.r);
      ctx.lineTo(hazard.x + hazard.r * 0.85, hazard.y + hazard.r * 0.55);
      ctx.lineTo(hazard.x - hazard.r * 0.85, hazard.y + hazard.r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "tacoIngredientFlood") {
      const warning = hazard.warn > 0;
      const progress = warning ? clamp(1 - hazard.warn / Math.max(0.1, hazard.warningDuration || 3.25), 0, 1) : 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(world.arena.x, world.arena.y, world.arena.w, world.arena.h);
      ctx.clip();
      ctx.fillStyle = warning ? `rgba(240, 91, 50, ${0.08 + progress * 0.18})` : "rgba(207, 59, 47, 0.5)";
      ctx.fillRect(world.arena.x, world.arena.y, world.arena.w, world.arena.h);
      const bits = [
        ["#ffd85a", 0.2, 0.22],
        ["#6fbf55", 0.44, 0.38],
        ["#7a3f24", 0.68, 0.28],
        ["#cf3b2f", 0.82, 0.62],
        ["#f7e28b", 0.28, 0.72],
        ["#6fbf55", 0.58, 0.78],
      ];
      bits.forEach(([color, px, py], index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(
          world.arena.x + world.arena.w * px + Math.sin(boss.animationTime * 2 + index) * 34,
          world.arena.y + world.arena.h * py + Math.cos(boss.animationTime * 2.4 + index) * 24,
          warning ? 18 + progress * 18 : 34,
          warning ? 10 + progress * 10 : 20,
          index * 0.6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
      ctx.fillStyle = "rgba(245, 245, 230, 0.9)";
      ctx.fillRect(hazard.safeX - hazard.safeW / 2, hazard.safeY - hazard.safeH / 2, hazard.safeW, hazard.safeH);
      ctx.strokeStyle = warning ? "#fff4c4" : "#f5f5e6";
      ctx.lineWidth = warning ? 4 : 6;
      ctx.strokeRect(hazard.safeX - hazard.safeW / 2, hazard.safeY - hazard.safeH / 2, hazard.safeW, hazard.safeH);
      ctx.restore();
      return;
    }
    if (hazard.type === "ingredientDrop") {
      const colors = { cheese: "#ffd85a", lettuce: "#6fbf55", beef: "#7a3f24", salsa: "#cf3b2f" };
      const progress = clamp(1 - hazard.warn / 0.8, 0, 1);
      ctx.fillStyle = hazard.warn > 0 ? "rgba(255, 244, 196, 0.12)" : `${colors[hazard.ingredient]}88`;
      ctx.strokeStyle = colors[hazard.ingredient] || "#fff4c4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors[hazard.ingredient] || "#fff4c4";
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y - 115 + progress * 115, hazard.r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (hazard.type === "tacoSalsa") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(207, 59, 47, 0.13)" : "rgba(207, 59, 47, 0.36)";
      ctx.strokeStyle = warning ? "#ffb0a4" : "#cf3b2f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.68, Math.sin(hazard.x) * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "tacoGrease" || hazard.type === "tacoCheese" || hazard.type === "lettuceCleanseZone") {
      const warning = hazard.warn > 0;
      const isGrease = hazard.type === "tacoGrease";
      const isCheese = hazard.type === "tacoCheese";
      ctx.fillStyle = warning
        ? "rgba(255, 244, 196, 0.12)"
        : isGrease
          ? "rgba(122, 63, 36, 0.34)"
          : isCheese
            ? "rgba(255, 216, 90, 0.36)"
            : "rgba(111, 191, 85, 0.3)";
      ctx.strokeStyle = isGrease ? "#7a3f24" : isCheese ? "#ffd85a" : "#aaff96";
      ctx.lineWidth = hazard.type === "lettuceCleanseZone" ? 4 : 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.68, Math.sin((hazard.pulse || hazard.x) * 2) * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (hazard.type === "lettuceCleanseZone") {
        ctx.fillStyle = "#d8ffd0";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CLEANSE", hazard.x, hazard.y + 4);
        ctx.textAlign = "left";
      }
      return;
    }
    if (hazard.type === "tacoSlam") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(255, 218, 107, 0.1)" : "rgba(240, 91, 50, 0.25)";
      ctx.strokeStyle = warning ? "#ffda6b" : "#f05b32";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, hazard.gapAngle + 0.42, hazard.gapAngle + Math.PI * 2 - 0.42);
      ctx.arc(hazard.x, hazard.y, hazard.inner, hazard.gapAngle + Math.PI * 2 - 0.42, hazard.gapAngle + 0.42, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "lettuceLeaf") {
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(Math.atan2(hazard.vy, hazard.vx) + Math.sin(hazard.wobble) * 0.8);
      ctx.fillStyle = "#6fbf55";
      ctx.strokeStyle = "#d8ffd0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, hazard.r * 1.45, hazard.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (hazard.type === "glazeRing") {
      if (hazard.warn > 0) return;
      ctx.strokeStyle = "rgba(255, 182, 209, 0.72)";
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radiusNow, hazard.gapAngle + hazard.gapWidth, hazard.gapAngle + Math.PI * 2 - hazard.gapWidth);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.66)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radiusNow, hazard.gapAngle + hazard.gapWidth, hazard.gapAngle + Math.PI * 2 - hazard.gapWidth);
      ctx.stroke();
      return;
    }
    if (hazard.type === "frostingRibbon") {
      const active = hazard.warn <= 0;
      ctx.strokeStyle = active ? "rgba(255, 182, 209, 0.58)" : "rgba(255, 244, 196, 0.42)";
      ctx.lineWidth = active ? hazard.width : 5;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + Math.cos(hazard.angle) * hazard.length, hazard.y + Math.sin(hazard.angle) * hazard.length);
      ctx.stroke();
      return;
    }
    if (hazard.type === "sugarZone") {
      ctx.fillStyle = "rgba(255, 121, 170, 0.2)";
      ctx.strokeStyle = "#ff79aa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r + Math.sin(boss.animationTime * 8) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "wasabiWave") {
      const active = hazard.warn <= 0;
      ctx.fillStyle = active ? "rgba(122, 196, 109, 0.38)" : "rgba(122, 196, 109, 0.12)";
      ctx.strokeStyle = active ? "#9ff089" : "#d9ffd1";
      ctx.lineWidth = 3;
      if (hazard.axis === "vertical") {
        const drawX = active ? hazard.x : hazard.direction > 0 ? world.arena.x + 18 : world.arena.x + world.arena.w - 18;
        ctx.fillRect(drawX - hazard.width / 2, world.arena.y + 36, hazard.width, world.arena.h - 72);
        ctx.strokeRect(drawX - hazard.width / 2, world.arena.y + 36, hazard.width, world.arena.h - 72);
        drawWasabiArrow(drawX, world.arena.y + world.arena.h / 2, hazard.direction > 0 ? 0 : Math.PI);
      } else {
        const drawY = active ? hazard.y : hazard.direction > 0 ? world.arena.y + 18 : world.arena.y + world.arena.h - 18;
        ctx.fillRect(world.arena.x + 36, drawY - hazard.width / 2, world.arena.w - 72, hazard.width);
        ctx.strokeRect(world.arena.x + 36, drawY - hazard.width / 2, world.arena.w - 72, hazard.width);
        drawWasabiArrow(world.arena.x + world.arena.w / 2, drawY, hazard.direction > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
      return;
    }
    if (hazard.type === "soyPuddle") {
      const warning = hazard.warn > 0;
      ctx.fillStyle = warning ? "rgba(52, 35, 28, 0.14)" : "rgba(52, 35, 28, 0.44)";
      ctx.strokeStyle = warning ? "#a98268" : "#563a2f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.12, hazard.r * 0.68, Math.sin(hazard.y) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "chopstickPin") {
      const active = hazard.warn <= 0;
      ctx.strokeStyle = active ? "#e7d5a3" : "rgba(231, 213, 163, 0.42)";
      ctx.lineWidth = active ? 14 : 4;
      ctx.beginPath();
      if (hazard.vertical) {
        ctx.moveTo(hazard.x, world.arena.y + 36);
        ctx.lineTo(hazard.x, world.arena.y + world.arena.h - 36);
      } else {
        ctx.moveTo(world.arena.x + 36, hazard.y);
        ctx.lineTo(world.arena.x + world.arena.w - 36, hazard.y);
      }
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
    if (hazard.type === "bolt" || hazard.type === "fry" || hazard.type === "mustardSeed" || hazard.type === "sauceBlob" || hazard.type === "peanut" || hazard.type === "cherryShot" || hazard.type === "nachoCrumb" || hazard.type === "pepperoni" || hazard.type === "cheeseBolt" || hazard.type === "sprinkle") {
      ctx.fillStyle = hazard.color || (hazard.type === "fry" ? "#f1c15d" : hazard.type === "mustardSeed" ? "#e3bf34" : hazard.type === "peanut" ? "#8b552f" : hazard.type === "cherryShot" ? "#ff3f5f" : hazard.type === "nachoCrumb" ? "#e8bd50" : hazard.type === "pepperoni" ? "#b93a2f" : hazard.type === "cheeseBolt" ? "#f4d36b" : hazard.type === "sprinkle" ? "#ff79aa" : "#8ad8ff");
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
      } else if (hazard.type === "sprinkle") {
        ctx.save();
        ctx.translate(hazard.x, hazard.y);
        ctx.rotate(Math.atan2(hazard.vy, hazard.vx));
        ctx.roundRect(-hazard.r * 1.6, -hazard.r * 0.45, hazard.r * 3.2, hazard.r * 0.9, 3);
        ctx.fill();
        ctx.restore();
        return;
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
    if (effect.type === "groundbreaker" || effect.type === "radiantSmite") {
      const holy = effect.type === "radiantSmite";
      const ring = effect.r * (0.35 + progress * 0.75);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = holy ? "rgba(255, 240, 191, 0.18)" : "rgba(240, 212, 124, 0.16)";
      ctx.strokeStyle = holy ? "rgba(255, 244, 210, 0.92)" : "rgba(255, 238, 178, 0.86)";
      ctx.shadowColor = holy ? "#fff0bf" : "#f0d47c";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, ring, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = 0; i < (holy ? 8 : 6); i += 1) {
        const angle = i * Math.PI * 2 / (holy ? 8 : 6);
        ctx.beginPath();
        ctx.moveTo(effect.x + Math.cos(angle) * ring * 0.25, effect.y + Math.sin(angle) * ring * 0.25);
        ctx.lineTo(effect.x + Math.cos(angle) * ring, effect.y + Math.sin(angle) * ring);
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
    if (effect.type === "arrowStorm" || effect.type === "meteorField" || effect.type === "poisonCloud" || effect.type === "consecration" || effect.type === "divineBulwark") {
      const configs = {
        arrowStorm: ["rgba(255, 215, 130, 0.12)", "rgba(255, 215, 130, 0.72)", "#ffd782"],
        meteorField: ["rgba(255, 122, 43, 0.13)", "rgba(255, 138, 50, 0.78)", "#ff8a32"],
        poisonCloud: ["rgba(112, 210, 90, 0.16)", "rgba(155, 224, 111, 0.62)", "#9be06f"],
        consecration: ["rgba(255, 240, 191, 0.14)", "rgba(255, 240, 191, 0.82)", "#fff0bf"],
        divineBulwark: ["rgba(255, 240, 191, 0.09)", "rgba(255, 240, 191, 0.62)", "#fff0bf"],
      };
      const [fill, stroke, glow] = configs[effect.type];
      const spin = (effect.age || 0) * (effect.type === "poisonCloud" ? 0.8 : 1.6);
      ctx.globalAlpha = effect.ttl < 0.7 ? alpha : 1;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;
      ctx.lineWidth = effect.type === "divineBulwark" ? 4 : 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash(effect.type === "poisonCloud" ? [10, 12] : []);
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.r * (0.38 + i * 0.18), spin + i, spin + i + Math.PI * 1.2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    if (effect.type === "aegisStep") {
      ctx.globalAlpha = alpha * 0.78;
      ctx.strokeStyle = "#fff0bf";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 240, 191, 0.24)";
      ctx.beginPath();
      ctx.arc(effect.x2, effect.y2, 48 * (0.5 + progress), 0, Math.PI * 2);
      ctx.fill();
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

function drawRemoteProjectiles() {
  remoteProjectiles.forEach((projectile) => {
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.72;
    ctx.shadowColor = projectile.color;
    ctx.shadowBlur = projectile.heavy ? 18 : 8;
    if (projectile.tag === "Ranged") {
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(3, -5);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fillStyle = projectile.color;
      ctx.fill();
    } else if (projectile.heavy) {
      const pulse = Math.sin((projectile.age || 0) * 24) * 0.5 + 0.5;
      ctx.fillStyle = "rgba(72, 239, 228, 0.26)";
      ctx.beginPath();
      ctx.arc(0, 0, projectile.r + 8 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(0, 0, projectile.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (isWarriorTag(projectile.tag)) {
      ctx.fillStyle = "rgba(255, 244, 210, 0.8)";
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.quadraticCurveTo(-5, -18, -24, -3);
      ctx.quadraticCurveTo(-5, 18, 20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(0, 0, projectile.r, 0, Math.PI * 2);
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
    const renderPeer = smoothedPeer(peer);
    if (!Number.isFinite(renderPeer.x) || !Number.isFinite(renderPeer.y)) return;
    const alpha = renderPeer.dead ? 0.36 : 0.78;
    const color = remotePlayerColor(renderPeer.weaponTag);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawRing(renderPeer.x, renderPeer.y, 25, color);
    const outfit = outfitSpriteForGear(renderPeer.weapon, renderPeer.armor);
    const sprite = outfit?.sprite || cleanedPlayerSprite || playerSprite;
    if (outfit || (sprite.complete && sprite.naturalWidth > 0)) {
      drawCharacterSprite({
        x: renderPeer.x,
        y: renderPeer.y,
        facing: renderPeer.facing || "down",
        moving: renderPeer.moving,
        animationTime: renderPeer.animationTime || performance.now() / 1000,
        rangerAttackTimer: 0,
        rangerAttackAngle: 0,
        meleeAttackTimer: 0,
        meleeAttackAngle: 0,
        rogueAttackTimer: 0,
        rogueAttackAngle: 0,
        weapon: renderPeer.weapon,
      }, outfit, sprite);
    } else {
      drawRemoteFallbackPlayer(renderPeer, color);
    }
    const hpPercent = clamp((renderPeer.hp || 0) / Math.max(1, renderPeer.maxHp || 1), 0, 1);
    ctx.fillStyle = "rgba(15, 12, 10, 0.82)";
    ctx.fillRect(renderPeer.x - 25, renderPeer.y - 47, 50, 6);
    ctx.fillStyle = renderPeer.dead ? "#5f5f5f" : "#67d987";
    ctx.fillRect(renderPeer.x - 24, renderPeer.y - 46, 48 * hpPercent, 4);
    ctx.fillStyle = "#f5ebd5";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(id.slice(0, 4).toUpperCase(), renderPeer.x, renderPeer.y - 54);
    ctx.restore();
  });
}

function smoothedPeer(peer) {
  const snapshots = peer.snapshots || [];
  if (snapshots.length < 2) return peer;
  const renderAt = performance.now() - 130;
  let older = snapshots[0];
  let newer = snapshots[snapshots.length - 1];
  for (let i = 0; i < snapshots.length - 1; i += 1) {
    if (snapshots[i].receivedAt <= renderAt && snapshots[i + 1].receivedAt >= renderAt) {
      older = snapshots[i];
      newer = snapshots[i + 1];
      break;
    }
  }
  const span = Math.max(1, newer.receivedAt - older.receivedAt);
  const t = clamp((renderAt - older.receivedAt) / span, 0, 1);
  return {
    ...newer,
    x: older.x + (newer.x - older.x) * t,
    y: older.y + (newer.y - older.y) * t,
    hp: older.hp + ((newer.hp || older.hp) - older.hp) * t,
  };
}

function drawRemoteFallbackPlayer(peer, color) {
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
}

function remotePlayerColor(tag) {
  if (tag === "Magic") return "#8ec7ff";
  if (tag === "Ranged") return "#9bd07b";
  if (tag === "Rogue") return "#9be06f";
  if (tag === "Paladin") return "#f0d47c";
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
  return player.gear.weapon === "ironBlade" || player.gear.weapon === "dawnHammer";
}

function isRogueBuild() {
  return player.gear.weapon === "shadowDaggers";
}

function isPaladinBuild() {
  return player.gear.weapon === "dawnHammer";
}

function playerOutfitSprite() {
  return outfitSpriteForGear(player.gear.weapon, player.gear.armor);
}

function outfitSpriteForGear(weaponId, armorId) {
  if (weaponId === "emberBow" && rangedSprite.complete && rangedSprite.naturalWidth > 0) {
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
  if (weaponId === "shadowDaggers" && rogueSprite.complete && rogueSprite.naturalWidth > 0) {
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
  if (weaponId === "ironBlade" && meleeSprite.complete && meleeSprite.naturalWidth > 0) {
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
  if (weaponId === "pulseStaff" && armorId === "channelerRobe" && glassMageSprite.complete && glassMageSprite.naturalWidth > 0) {
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
  drawCharacterSprite({
    x: player.x,
    y: player.y,
    facing: player.facing,
    moving: player.moving,
    animationTime: player.animationTime,
    rangerAttackTimer: player.rangerAttackTimer,
    rangerAttackAngle: player.rangerAttackAngle,
    meleeAttackTimer: player.meleeAttackTimer,
    meleeAttackAngle: player.meleeAttackAngle,
    rogueAttackTimer: player.rogueAttackTimer,
    rogueAttackAngle: player.rogueAttackAngle,
    weapon: player.gear.weapon,
  }, outfit, sprite);
}

function drawCharacterSprite(character, outfit, sprite) {
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const frameWidth = sprite.width / 4;
  const frameHeight = sprite.height / 4;
  const rangerAttacking = character.rangerAttackTimer > 0 && character.weapon === "emberBow";
  const meleeAttacking = character.meleeAttackTimer > 0 && character.weapon === "ironBlade";
  const rogueAttacking = character.rogueAttackTimer > 0 && character.weapon === "shadowDaggers";
  const frame = rangerAttacking
    ? (character.rangerAttackTimer > 0.14 ? 2 : 3)
    : rogueAttacking
      ? (character.rogueAttackTimer > 0.12 ? 2 : 3)
    : meleeAttacking
      ? (character.meleeAttackTimer > 0.17 ? 2 : 3)
      : character.moving
        ? Math.floor(character.animationTime * 8) % 4
        : 1;
  const row = rows[character.facing] ?? 0;
  const topCrop = outfit?.topCrop ?? (character.facing === "up" ? 0.04 : 0.1);
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
  const rangedPulse = rangerAttacking ? Math.sin((1 - character.rangerAttackTimer / 0.28) * Math.PI) : 0;
  const meleePulse = meleeAttacking ? Math.sin((1 - character.meleeAttackTimer / 0.34) * Math.PI) : 0;
  const roguePulse = rogueAttacking ? Math.sin((1 - character.rogueAttackTimer / 0.24) * Math.PI) : 0;
  const recoilX = rangerAttacking
    ? -Math.cos(character.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.cos(character.rogueAttackAngle) * roguePulse * 7
    : meleeAttacking
      ? Math.cos(character.meleeAttackAngle) * meleePulse * 8
      : 0;
  const recoilY = rangerAttacking
    ? -Math.sin(character.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.sin(character.rogueAttackAngle) * roguePulse * 7
    : meleeAttacking
      ? Math.sin(character.meleeAttackAngle) * meleePulse * 8
      : 0;
  ctx.drawImage(
    sprite,
    frame * frameWidth + crop.x,
    row * frameHeight + crop.y,
    crop.w,
    crop.h,
    character.x - drawWidth / 2 + recoilX,
    character.y - drawHeight * 0.66 + recoilY,
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
    const ready = cooldown <= 0 && (player.room === "arena" || player.room === "starter" || player.room === "maze") && !player.dead && !player.won && ui.menuOverlay?.classList.contains("hidden");
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

function drawScreenBanner() {
  if (!screenBanner) return;
  const progress = clamp(screenBanner.timer / screenBanner.duration, 0, 1);
  const alpha = clamp(Math.min(progress * 2.4, 1), 0, 1);
  const y = 96 - (1 - alpha) * 18;
  const w = Math.min(canvas.clientWidth - 44, 620);
  const x = canvas.clientWidth / 2 - w / 2;
  const accent = screenBanner.tone === "victory" ? "#9be06f" : screenBanner.tone === "danger" ? "#ff6f61" : "#f0d47c";
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(12, 10, 9, 0.88)";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 108, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(screenBanner.title, canvas.clientWidth / 2, y + 43);
  if (screenBanner.subtitle) {
    ctx.fillStyle = "#f7efd9";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(screenBanner.subtitle, canvas.clientWidth / 2, y + 76);
  }
  ctx.restore();
}

function drawRunCompleteOverlay() {
  if (!player.won) return;
  ctx.save();
  ctx.fillStyle = "rgba(5, 9, 7, 0.72)";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#9be06f";
  ctx.font = "bold 66px sans-serif";
  ctx.fillText("Run Cleared", canvas.clientWidth / 2, canvas.clientHeight / 2 - 34);
  ctx.fillStyle = "#f7efd9";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("All bosses defeated", canvas.clientWidth / 2, canvas.clientHeight / 2 + 24);
  ctx.fillStyle = "#d0c6b4";
  ctx.font = "15px sans-serif";
  ctx.fillText("Use Reset Fight to return to a clean run state.", canvas.clientWidth / 2, canvas.clientHeight / 2 + 58);
  ctx.restore();
}

function renderUi() {
  ui.roomText.textContent = player.dead ? "You're Stuffed" : player.room === "starter" ? "Starter Room" : player.room === "maze" ? (mazeState?.theme.name || "Maze") : player.won ? "Victory" : "Boss Arena";
  ui.hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  ui.hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
  const bossHp = bossHealthSummary();
  const mazeHpLabel = mazeState?.miniBossSpawned ? "Warden" : "Wave";
  ui.bossHpText.textContent = player.room === "maze"
    ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} ${mazeHpLabel}`
    : boss.kind === "shake"
    ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} Bar ${boss.phase}/3`
    : boss.kind === "donut"
      ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} Phase ${boss.phase}/6`
    : boss.kind === "nacho" || boss.kind === "pizza" || boss.kind === "taco" || boss.kind === "sushi"
      ? `${Math.ceil(bossHp.hp)}/${bossHp.maxHp} Phase ${boss.phase}/3`
      : `${Math.ceil(bossHp.hp)}/${bossHp.maxHp}`;
  ui.bossHpBar.style.width = `${(bossHp.hp / bossHp.maxHp) * 100}%`;
  ui.potionButton.textContent = `Potion (${player.potions})`;
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  const activeBuffs = Object.values(runState.mazeBuffs).filter((value) => value > 0).length;
  ui.buildPanel.innerHTML = `
    <div><span>Class</span><strong>${currentClassOption().name}</strong></div>
    <div><span>Weapon</span><strong>${weapon.name}</strong></div>
    <div><span>Armor</span><strong>${armor.name}</strong></div>
    <div><span>Damage</span><strong>${player.stats.damage}</strong></div>
    <div><span>Range</span><strong>${player.stats.range}</strong></div>
    <div><span>Armor</span><strong>${player.stats.armor}</strong></div>
    <div><span>Speed</span><strong>${player.stats.speed}</strong></div>
    <div><span>Run Buffs</span><strong>${activeBuffs}</strong></div>
  `;
  if (ui.classMenuButton) {
    const label = runState.buildLocked ? `${currentClassOption().name} - Locked for this run` : `${currentClassOption().name} - Select Class`;
    if (ui.classMenuButton.textContent !== label) ui.classMenuButton.textContent = label;
    ui.classMenuButton.disabled = runState.buildLocked;
    ui.classMenuButton.title = runState.buildLocked ? "Class is locked for this run" : "Select class";
  }
  if (ui.armorMenuButton) {
    const label = runState.buildLocked ? `${armor.name} - Locked for this run` : `${armor.name} - Select Armor`;
    if (ui.armorMenuButton.textContent !== label) ui.armorMenuButton.textContent = label;
    ui.armorMenuButton.disabled = runState.buildLocked;
    ui.armorMenuButton.title = runState.buildLocked ? "Armor is locked for this run" : "Select armor";
  }
  if (ui.skillsButton) {
    const label = `Skills (${runState.talentPoints})`;
    if (ui.skillsButton.textContent !== label) ui.skillsButton.textContent = label;
    ui.skillsButton.classList.toggle("has-points", runState.talentPoints > 0);
    ui.skillsButton.title = runState.buildLocked
      ? `${talentClassNames[activeTalentClass()] || "Class"} talents`
      : "Talents lock to your class when the run starts";
  }
  if (ui.bossMenuButton) {
    const label = `${boss.name} - Select Boss`;
    if (ui.bossMenuButton.textContent !== label) ui.bossMenuButton.textContent = label;
    ui.bossMenuButton.disabled = runState.mode !== "dev";
  }
  if (ui.bossTestPanel) {
    ui.bossTestPanel.hidden = runState.mode !== "dev";
  }
  if (ui.classSelector) {
    const signature = `${player.gear.weapon}:${classOptions.map((option) => `${option.id}:${option.locked ? 1 : 0}`).join("|")}`;
    if (signature !== classSelectorSignature) {
      classSelectorSignature = signature;
      ui.classSelector.innerHTML = classOptions.map((option) => {
        const selected = option.weapon === player.gear.weapon;
        const locked = Boolean(option.locked);
        return `<button class="choice ${selected ? "selected" : ""} ${locked ? "locked" : ""}" type="button" data-class="${option.id}" ${locked ? "disabled aria-disabled=\"true\"" : ""}><span>${option.name}</span><small>${locked ? "Locked" : option.note}</small></button>`;
      }).join("");
    }
  }
  if (ui.armorSelector) {
    const signature = player.gear.armor;
    if (signature !== armorSelectorSignature) {
      armorSelectorSignature = signature;
      ui.armorSelector.innerHTML = Object.entries(gear.armor).map(([id, item]) => {
        const selected = player.gear.armor === id;
        return `<button class="choice ${selected ? "selected" : ""}" type="button" data-armor="${id}"><span>${item.name}</span><small>${item.tag}</small></button>`;
      }).join("");
    }
  }
  if (ui.armory) {
    ui.armory.innerHTML = [...Object.values(gear.weapon), ...Object.values(gear.armor)].map((item) => {
      const selected = player.gear[item.slot] && gear[item.slot][player.gear[item.slot]].name === item.name;
      return `<button class="choice ${selected ? "selected" : ""}" data-slot="${item.slot}" data-name="${item.name}"><span>${item.name}</span><small>${item.tag}</small></button>`;
    }).join("");
  }
  if (ui.bossSelector) {
    const signature = `${boss.kind}:${bossTestOptions.map((option) => `${option.id}:${lockedBosses.has(option.id) ? 1 : 0}`).join("|")}`;
    if (signature !== bossSelectorSignature) {
      bossSelectorSignature = signature;
      ui.bossSelector.innerHTML = bossTestOptions.map((option) => {
        const selected = option.id === boss.kind;
        const locked = lockedBosses.has(option.id);
        return `<button class="choice ${selected ? "selected" : ""} ${locked ? "locked" : ""}" type="button" data-boss="${option.id}" ${locked ? "disabled aria-disabled=\"true\"" : ""}><span>${option.name}</span><small>${locked ? "Locked" : "Test"}</small></button>`;
      }).join("");
    }
  }
  if (ui.talentMenuOverlay && !ui.talentMenuOverlay.hidden) renderTalentTree();
  if (ui.deathScreen) {
    ui.deathScreen.hidden = !player.dead;
  }
}

function bossHealthSummary() {
  if (player.room === "maze" && mazeState) {
    const mini = mazeState.enemies.find((enemy) => enemy.miniBoss) || mazeState.miniBossEnemy;
    if (mini && (mazeState.miniBossSpawned || mazeState.encounterType !== "gauntlet")) {
      return { hp: Math.max(0, mini.hp), maxHp: mini.maxHp };
    }
    if (mazeState.encounterType === "gauntlet" && mazeState.waveIndex < 0) {
      return { hp: 0, maxHp: mazeState.waves?.[0]?.enemies.length || 1 };
    }
    const trashAlive = mazeState.enemies.filter((enemy) => enemy.hp > 0 && !enemy.miniBoss).length;
    return { hp: trashAlive, maxHp: Math.max(1, mazeState.waves?.[mazeState.waveIndex]?.enemies.length || trashAlive || 1) };
  }
  if (boss.kind !== "trio") return { hp: boss.hp, maxHp: boss.maxHp };
  return {
    hp: condimentBosses.reduce((total, target) => total + Math.max(0, target.hp), 0),
    maxHp: condimentBosses.reduce((total, target) => total + target.maxHp, 0),
  };
}

function setupMultiplayer() {
  if (!("WebSocket" in window) || location.protocol === "file:") {
    setCoopStatus(location.protocol === "file:" ? "Start server for co-op" : "Solo", 1);
    setMenuStatus("Start the Node server to use multiplayer.");
    return;
  }
  if (multiplayer.socket) return;
  multiplayer.enabled = true;
  connectMultiplayer();
}

function connectMultiplayer() {
  if (!multiplayer.enabled) return;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}/coop`);
  multiplayer.socket = socket;
  setCoopStatus("Connecting", multiplayer.count);
  setMenuStatus("Connecting to server...");

  socket.addEventListener("open", () => {
    multiplayer.connected = true;
    multiplayer.everConnected = true;
    multiplayer.reconnectAttempts = 0;
    multiplayer.reconnectTimer = 0;
    setCoopStatus("Online", multiplayer.count);
    setMenuStatus("Connected.");
    sendServer({ type: "set-name", name: playerName() });
    sendServer({ type: "list-rooms" });
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
    if (!multiplayer.everConnected) {
      multiplayer.enabled = false;
      setCoopStatus("Co-op offline", 1);
      setMenuStatus("Could not connect. Run npm start or use the hosted server.");
      return;
    }
    multiplayer.reconnectAttempts += 1;
    if (multiplayer.reconnectAttempts > multiplayer.maxReconnectAttempts) {
      multiplayer.enabled = false;
      setCoopStatus("Co-op offline", 1);
      setMenuStatus("Connection lost.");
      return;
    }
    multiplayer.reconnectTimer = multiplayer.reconnectDelay;
    setCoopStatus(`Retry ${multiplayer.reconnectAttempts}`, 1);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

function handleMultiplayerMessage(message) {
  if (message.type === "welcome") {
    multiplayer.id = message.id;
    multiplayer.rooms = message.rooms || [];
    renderRoomList();
    setCoopStatus("Online", multiplayer.count);
    sendServer({ type: "set-name", name: playerName() });
    setMenuStatus("Connected.");
    return;
  }
  if (message.type === "room-list") {
    multiplayer.rooms = message.rooms || [];
    renderRoomList();
    return;
  }
  if (message.type === "joined-room" || message.type === "room-update") {
    const previousHostId = multiplayer.room?.hostId;
    multiplayer.room = message.room;
    if (previousHostId && previousHostId !== multiplayer.room?.hostId) {
      multiplayer.lastBossSyncSeq = 0;
      multiplayer.lastGauntletSyncSeq = 0;
      if (runState.mode === "multiplayer" && message.room?.state === "inGame") {
        returnToMultiplayerLobby("Host left. The co-op run was stopped.");
      }
    }
    multiplayer.ready = Boolean(message.room?.players?.find((peer) => peer.id === multiplayer.id)?.ready);
    multiplayer.count = message.room?.players?.length || 1;
    setCoopStatus(message.room?.state === "inGame" ? "In Room" : "Lobby", multiplayer.count);
    renderLobby();
    if (isMultiplayerHost()) maybeAdvancePartyPhase();
    if (message.type === "joined-room") showMenuScreen("lobby");
    return;
  }
  if (message.type === "run-ended") {
    multiplayer.room = message.room || multiplayer.room;
    returnToMultiplayerLobby(message.message || "The co-op run ended.");
    renderLobby();
    return;
  }
  if (message.type === "game-start") {
    const previousHostId = multiplayer.room?.hostId;
    multiplayer.room = message.room;
    if (previousHostId && previousHostId !== multiplayer.room?.hostId) multiplayer.lastBossSyncSeq = 0;
    multiplayer.peers.clear();
    const spawn = (message.spawns || []).find((item) => item.id === multiplayer.id);
    startMultiplayerFight(message.bossKind, spawn, message.startAt, message.serverTime);
    return;
  }
  if (message.type === "error") {
    setMenuStatus(message.message || "Server error.");
    setLobbyStatus(message.message || "Server error.");
    return;
  }
  if (message.type === "peer-state" && message.id && message.state) {
    recordPeerSnapshot(message.id, message.state);
    multiplayer.count = multiplayer.peers.size + 1;
    setCoopStatus("In Room", multiplayer.room?.players?.length || multiplayer.count);
    applyRemoteBossProgress(message.state, message.id);
    if (isMultiplayerHost()) maybeAdvancePartyPhase();
    return;
  }
  if (message.type === "peer-event" && message.id && message.event) {
    handleMultiplayerEvent(message.id, message.event);
    return;
  }
}

function updateMultiplayer(dt) {
  if (!multiplayer.enabled) return;
  multiplayer.peers.forEach((peer, id) => {
    if (Date.now() - (peer.updatedAt || 0) > 12000) multiplayer.peers.delete(id);
  });
  if (!multiplayer.connected && multiplayer.reconnectTimer > 0) {
    multiplayer.reconnectTimer -= dt;
    if (multiplayer.reconnectTimer <= 0) connectMultiplayer();
    return;
  }
  if (multiplayer.pendingStart && Date.now() >= multiplayer.pendingStart.startAt) {
    const pending = multiplayer.pendingStart;
    beginMultiplayerFightNow(pending.bossKind);
  }
  if (multiplayer.gauntletSyncTimer > 0) multiplayer.gauntletSyncTimer -= dt;
  if (shouldBroadcastGauntletSync()) sendGauntletSync(false);
  multiplayer.sendTimer -= dt;
  if (multiplayer.sendTimer <= 0) {
    multiplayer.sendTimer = 0.08;
    sendMultiplayerState(false);
  }
}

function sendMultiplayerState(force) {
  if (!multiplayer.connected || !multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  if (multiplayer.mode !== "multiplayer" || !multiplayer.room || multiplayer.room.state !== "inGame") return;
  if (multiplayer.pendingStart) return;
  if (!force && document.hidden) return;
  sendServer({ type: "state", state: multiplayerSnapshot() });
}

function sendMultiplayerEvent(event) {
  if (!multiplayer.connected || !multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  if (multiplayer.mode !== "multiplayer" || !multiplayer.room || multiplayer.room.state !== "inGame") return;
  sendServer({ type: "event", event });
}

function sendServer(payload) {
  if (!multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  multiplayer.socket.send(JSON.stringify(payload));
}

function beginBossSyncCapture(source) {
  if (!shouldBroadcastBossSync()) return null;
  return {
    source,
    hazardRefs: new Set(hazards),
    particleRefs: new Set(particles),
  };
}

function finishBossSyncCapture(capture) {
  if (!capture || !shouldBroadcastBossSync()) return;
  const newHazards = hazards
    .filter((hazard) => !capture.hazardRefs.has(hazard) && isSyncableBossHazard(hazard))
    .map(serializeBossHazard);
  const newParticles = particles
    .filter((particle) => !capture.particleRefs.has(particle) && isSyncableBossParticle(particle))
    .slice(-18)
    .map(serializeBossParticle);
  if (!newHazards.length && !newParticles.length) return;
  multiplayer.bossSyncSeq += 1;
  sendMultiplayerEvent({
    kind: "boss-sync",
    seq: multiplayer.bossSyncSeq,
    source: capture.source,
    bossKind: boss.kind,
    bossState: bossStateSnapshot(),
    hazards: newHazards,
    particles: newParticles,
  });
}

function isSyncableBossHazard(hazard) {
  return player.room === "arena" && hazard && !hazard.mazeHazard && typeof hazard.type === "string";
}

function isSyncableBossParticle(particle) {
  if (player.room !== "arena" || !particle) return false;
  return !String(particle.text || "").startsWith("-");
}

function serializeBossHazard(hazard) {
  if (!hazard.syncId) {
    multiplayer.hazardSyncSeq += 1;
    hazard.syncId = `${multiplayer.id || "host"}-h${multiplayer.hazardSyncSeq}`;
  }
  return cloneSyncObject(hazard);
}

function serializeBossParticle(particle) {
  if (!particle.syncId) {
    multiplayer.particleSyncSeq += 1;
    particle.syncId = `${multiplayer.id || "host"}-p${multiplayer.particleSyncSeq}`;
  }
  return cloneSyncObject(particle);
}

function bossHazardSnapshot() {
  return hazards.filter(isSyncableBossHazard).map(serializeBossHazard);
}

function bossStateSnapshot() {
  const state = cloneSyncObject(boss) || {};
  state.kind = boss.kind;
  if (boss.kind === "trio") {
    state.condiments = condimentBosses.map((target) => cloneSyncObject(target));
  }
  return state;
}

function cloneSyncObject(value) {
  return cloneSyncValue(value, 0);
}

function cloneSyncValue(value, depth) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : 999999;
  if (typeof value === "undefined" || typeof value === "function") return undefined;
  if (depth > 4) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => cloneSyncValue(item, depth + 1))
      .filter((item) => typeof item !== "undefined");
  }
  if (typeof value === "object") {
    const output = {};
    Object.entries(value).forEach(([key, item]) => {
      const cloned = cloneSyncValue(item, depth + 1);
      if (typeof cloned !== "undefined") output[key] = cloned;
    });
    return output;
  }
  return undefined;
}

function handleMultiplayerEvent(peerId, event) {
  if (event.kind === "party-ready") {
    handlePartyReadyEvent(peerId, event);
    return;
  }
  if (event.kind === "party-phase") {
    applyRemotePartyPhase(peerId, event);
    return;
  }
  if (event.kind === "gauntlet-damage") {
    applyRemoteGauntletDamage(peerId, event);
    return;
  }
  if (event.kind === "gauntlet-sync") {
    applyRemoteGauntletSync(peerId, event);
    return;
  }
  if (event.kind === "boss-sync") {
    applyRemoteBossSyncEvent(peerId, event);
    return;
  }
  if (event.kind === "attack") {
    spawnRemoteAttackVisual(peerId, event);
    return;
  }
  if (event.kind === "damage") {
    applyRemoteDamage(event);
  }
}

function applyRemoteBossSyncEvent(peerId, event) {
  if (!isHostPeer(peerId) || isMultiplayerHost() || event.bossKind !== boss.kind || player.room !== "arena") return;
  if (Number.isFinite(event.seq) && event.seq <= multiplayer.lastBossSyncSeq) return;
  if (Number.isFinite(event.seq)) multiplayer.lastBossSyncSeq = event.seq;
  if (event.bossState) applyBossStateSnapshot(event.bossState);
  (event.hazards || []).forEach((remoteHazard) => {
    if (!remoteHazard?.syncId || hazards.some((hazard) => hazard.syncId === remoteHazard.syncId)) return;
    hazards.push(normalizeRemoteBossHazard(remoteHazard, event.serverTime));
  });
  (event.particles || []).forEach((remoteParticle) => {
    if (!remoteParticle?.syncId || particles.some((particle) => particle.syncId === remoteParticle.syncId)) return;
    particles.push(normalizeRemoteBossParticle(remoteParticle, event.serverTime));
  });
}

function normalizeRemoteBossHazard(remoteHazard, serverTime = 0) {
  const hazard = cloneSyncObject(remoteHazard) || {};
  hazard.remoteBossHazard = true;
  const lag = multiplayerLagSeconds(serverTime);
  if (Number.isFinite(hazard.x) && Number.isFinite(hazard.y) && Number.isFinite(hazard.vx) && Number.isFinite(hazard.vy)) {
    hazard.x += hazard.vx * lag;
    hazard.y += hazard.vy * lag;
  }
  ["ttl", "warn", "delay", "fireTimer", "explodeTimer", "damageTimer"].forEach((key) => {
    if (Number.isFinite(hazard[key])) hazard[key] = Math.max(0, hazard[key] - lag);
  });
  hazard.age = (hazard.age || 0) + lag;
  return hazard;
}

function normalizeRemoteBossParticle(remoteParticle, serverTime = 0) {
  const particle = cloneSyncObject(remoteParticle) || {};
  particle.remoteBossParticle = true;
  const lag = multiplayerLagSeconds(serverTime);
  if (Number.isFinite(particle.ttl)) particle.ttl = Math.max(0.05, particle.ttl - lag);
  if (Number.isFinite(particle.y)) particle.y -= 28 * lag;
  return particle;
}

function multiplayerLagSeconds(serverTime = 0) {
  if (!serverTime) return 0;
  return clamp((Date.now() - serverTime) / 1000, 0, 0.32);
}

function syncBossHazardsSnapshot(remoteHazards, serverTime = 0) {
  if (!Array.isArray(remoteHazards) || isMultiplayerHost() || player.room !== "arena") return;
  const keepLocal = hazards.filter((hazard) => !isSyncableBossHazard(hazard));
  const synced = remoteHazards.map((hazard) => normalizeRemoteBossHazard(hazard, serverTime));
  hazards = keepLocal.concat(synced);
}

function shouldBroadcastGauntletSync() {
  return isMultiplayerHost() && player.room === "maze" && Boolean(mazeState) && (multiplayer.partyPhase === "gauntlet" || multiplayer.partyPhase === "reward");
}

function sendGauntletSync(force = false) {
  if (!shouldBroadcastGauntletSync()) return;
  if (!force && multiplayer.gauntletSyncTimer > 0) return;
  multiplayer.gauntletSyncTimer = 0.12;
  multiplayer.gauntletSyncSeq += 1;
  sendMultiplayerEvent({
    kind: "gauntlet-sync",
    seq: multiplayer.gauntletSyncSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    mazeSequence: mazeState.sequence,
    waveIndex: mazeState.waveIndex,
    waveTimer: mazeState.waveTimer,
    waves: mazeState.waves?.map((wave) => ({ index: wave.index, spawned: Boolean(wave.spawned), cleared: Boolean(wave.cleared) })) || [],
    miniBossSpawned: Boolean(mazeState.miniBossSpawned),
    rewardPending: Boolean(mazeState.rewardPending),
    rewardChosen: Boolean(mazeState.rewardChosen),
    exitOpen: Boolean(mazeState.exitOpen),
    cleared: Boolean(mazeState.cleared),
    enemies: mazeState.enemies.map(serializeGauntletEnemy),
    pickupDrops: cloneSyncObject(mazeState.pickupDrops || []),
    hazards: hazards.filter((hazard) => hazard.mazeHazard).map(serializeGauntletHazard),
  });
}

function serializeGauntletEnemy(enemy) {
  if (!enemy.id) enemy.id = enemy.miniBoss ? "warden" : `mob-${Math.round(enemy.spawnX)}-${Math.round(enemy.spawnY)}`;
  return cloneSyncObject(enemy);
}

function serializeGauntletHazard(hazard) {
  if (!hazard.syncId) {
    multiplayer.hazardSyncSeq += 1;
    hazard.syncId = `${multiplayer.id || "host"}-g${multiplayer.hazardSyncSeq}`;
  }
  return cloneSyncObject(hazard);
}

function normalizeGauntletEnemy(remoteEnemy) {
  const enemy = cloneSyncObject(remoteEnemy) || {};
  enemy.mazeEnemy = true;
  enemy.remoteGauntletEnemy = true;
  return enemy;
}

function normalizeGauntletHazard(remoteHazard, serverTime = 0) {
  const hazard = cloneSyncObject(remoteHazard) || {};
  hazard.mazeHazard = true;
  hazard.remoteGauntletHazard = true;
  const lag = multiplayerLagSeconds(serverTime);
  if (Number.isFinite(hazard.x) && Number.isFinite(hazard.y) && Number.isFinite(hazard.vx) && Number.isFinite(hazard.vy)) {
    hazard.x += hazard.vx * lag;
    hazard.y += hazard.vy * lag;
  }
  ["ttl", "warn", "delay", "fireTimer", "damageTimer"].forEach((key) => {
    if (Number.isFinite(hazard[key])) hazard[key] = Math.max(0, hazard[key] - lag);
  });
  return hazard;
}

function applyRemoteGauntletSync(peerId, event) {
  if (!isHostPeer(peerId) || isMultiplayerHost() || !event || event.bossKind !== boss.kind) return;
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq < multiplayer.phaseSeq) return;
  if (Number.isFinite(event.seq) && event.seq <= multiplayer.lastGauntletSyncSeq) return;
  if (Number.isFinite(event.seq)) multiplayer.lastGauntletSyncSeq = event.seq;
  if (!mazeState || mazeState.sequence !== event.mazeSequence) {
    startMazeForBoss(event.bossKind, { fromParty: true, sequence: event.mazeSequence || runState.mazeCount + 1 });
  }
  if (!mazeState) return;
  mazeState.waveIndex = Number.isFinite(event.waveIndex) ? event.waveIndex : mazeState.waveIndex;
  mazeState.waveTimer = Number.isFinite(event.waveTimer) ? event.waveTimer : mazeState.waveTimer;
  mazeState.miniBossSpawned = Boolean(event.miniBossSpawned);
  mazeState.rewardPending = Boolean(event.rewardPending) && !mazeState.rewardChosen;
  mazeState.exitOpen = Boolean(event.exitOpen);
  mazeState.cleared = Boolean(event.cleared);
  (event.waves || []).forEach((remoteWave) => {
    const wave = mazeState.waves?.find((item) => item.index === remoteWave.index);
    if (!wave) return;
    wave.spawned = Boolean(remoteWave.spawned);
    wave.cleared = Boolean(remoteWave.cleared);
  });
  mazeState.enemies = (event.enemies || []).map(normalizeGauntletEnemy);
  const claimed = mazeState.claimedPickupIds || new Set();
  mazeState.claimedPickupIds = claimed;
  mazeState.pickupDrops = (cloneSyncObject(event.pickupDrops || []) || []).filter((pickup) => !pickup.id || !claimed.has(pickup.id));
  const keepLocalHazards = hazards.filter((hazard) => !hazard.mazeHazard);
  hazards = keepLocalHazards.concat((event.hazards || []).map((hazard) => normalizeGauntletHazard(hazard, event.serverTime)));
  if (mazeState.rewardPending && !mazeState.rewardChosen) showMazeRewardChoices();
}

function sendGauntletDamage(target, amount, source) {
  if (!target?.id || !isPartySyncActive()) return;
  sendMultiplayerEvent({
    kind: "gauntlet-damage",
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    targetId: target.id,
    amount,
    source,
  });
}

function applyRemoteGauntletDamage(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq) return;
  if (player.room !== "maze" || !mazeState) return;
  const amount = Math.max(0, Number(event.amount) || 0);
  if (!amount) return;
  const target = mazeState.enemies.find((enemy) => enemy.id === event.targetId && enemy.hp > 0);
  if (!target) return;
  damageBossTarget(target, amount, event.source || "Co-op", { remote: true });
  sendGauntletSync(true);
}

function applyBossStateSnapshot(state) {
  if (!state || state.kind !== boss.kind) return;
  Object.entries(state).forEach(([key, value]) => {
    if (key === "condiments" || key === "kind") return;
    boss[key] = cloneSyncObject(value);
  });
  if (boss.kind === "trio" && Array.isArray(state.condiments)) {
    state.condiments.forEach((remoteTarget) => {
      const localTarget = condimentBosses.find((target) => target.kind === remoteTarget.kind);
      if (!localTarget) return;
      Object.entries(remoteTarget).forEach(([key, value]) => {
        localTarget[key] = cloneSyncObject(value);
      });
    });
  }
}

function spawnRemoteAttackVisual(peerId, event) {
  const angle = Number(event.angle);
  if (!Number.isFinite(event.x) || !Number.isFinite(event.y) || !Number.isFinite(angle)) return;
  const tag = event.weaponTag || "Warrior";
  const speed = projectileSpeedForWeapon(tag) * 0.94;
  remoteProjectiles.push({
    peerId,
    x: event.x + Math.cos(angle) * (24 + remoteProjectileLagDistance(event, speed)),
    y: event.y + Math.sin(angle) * (24 + remoteProjectileLagDistance(event, speed)),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: tag === "Magic" ? 11 : isWarriorTag(tag) ? 12 : tag === "Rogue" ? 8 : 6,
    color: event.color || remotePlayerColor(tag),
    ttl: tag === "Ranged" ? 0.9 : tag === "Magic" ? 0.75 : 0.42,
    age: 0,
    heavy: Boolean(event.heavy),
    tag,
  });
}

function remoteProjectileLagDistance(event, speed) {
  if (!event.serverTime) return 0;
  const lagSeconds = clamp((Date.now() - event.serverTime) / 1000, 0, 0.28);
  return speed * lagSeconds;
}

function applyRemoteDamage(event) {
  if ((event.encounter !== "arena" && event.room !== "arena") || event.bossKind !== boss.kind || player.room !== "arena") return;
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq !== multiplayer.phaseSeq) return;
  const amount = Math.max(0, Number(event.amount) || 0);
  if (!amount) return;
  const target = activeBosses().find((candidate) => candidate.kind === event.targetKind && candidate.hp > 0);
  if (target) damageBossTarget(target, amount, "Co-op", { remote: true });
}

function recordPeerSnapshot(peerId, state) {
  const now = performance.now();
  const previous = multiplayer.peers.get(peerId) || { snapshots: [] };
  const snapshots = (previous.snapshots || []).concat([{ ...state, receivedAt: now }]).slice(-8);
  multiplayer.peers.set(peerId, { ...state, snapshots, updatedAt: Date.now() });
}

function multiplayerSnapshot() {
  const weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor];
  const snapshot = {
    x: Math.round(player.x),
    y: Math.round(player.y),
    hp: Math.ceil(player.hp),
    maxHp: player.maxHp,
    room: player.room,
    dead: player.dead,
    won: player.won,
    facing: player.facing,
    moving: player.moving,
    animationTime: player.animationTime,
    weapon: player.gear.weapon,
    armor: player.gear.armor,
    weaponTag: weapon.tag,
    armorTag: armor.tag,
    bossKind: boss.kind,
    partyPhase: multiplayer.partyPhase,
    phaseSeq: multiplayer.phaseSeq,
  };
  if (player.room === "arena") {
    snapshot.bossHp = Math.max(0, Math.ceil(bossHealthSummary().hp));
    snapshot.bossMaxHp = bossHealthSummary().maxHp;
    snapshot.bossPhase = boss.phase || 1;
    snapshot.bossTargets = bossTargetSnapshot();
  } else if (player.room === "maze" && mazeState) {
    const gauntletHp = bossHealthSummary();
    snapshot.gauntletHp = Math.max(0, Math.ceil(gauntletHp.hp));
    snapshot.gauntletMaxHp = gauntletHp.maxHp;
    snapshot.gauntletPhase = mazeState.miniBossSpawned ? "warden" : `wave-${mazeState.waveIndex + 1}`;
  }
  if (shouldBroadcastBossSync()) {
    snapshot.bossState = bossStateSnapshot();
    snapshot.bossHazards = bossHazardSnapshot();
    snapshot.bossSyncSeq = multiplayer.bossSyncSeq;
  }
  return snapshot;
}

function bossTargetSnapshot() {
  return activeBosses().map((target) => ({
    kind: target.kind,
    hp: Math.max(0, Math.ceil(target.hp)),
    maxHp: target.maxHp,
  }));
}

function applyRemoteBossProgress(state, peerId) {
  if (!state || state.room !== "arena" || state.bossKind !== boss.kind || player.room !== "arena") return;
  if (isMultiplayerGame() && !isHostPeer(peerId)) return;
  if (state.bossState) applyBossStateSnapshot(state.bossState);
  if (Array.isArray(state.bossHazards)) syncBossHazardsSnapshot(state.bossHazards, state.serverTime);
  if (state.bossState || Array.isArray(state.bossHazards)) return;
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

function showMenuScreen(screen) {
  ui.menuOverlay?.classList.remove("hidden");
  [ui.mainMenu, ui.multiplayerMenu, ui.roomLobby, ui.devMenu].forEach((panel) => panel?.classList.remove("active"));
  if (screen === "main") ui.mainMenu?.classList.add("active");
  if (screen === "multiplayer") ui.multiplayerMenu?.classList.add("active");
  if (screen === "lobby") ui.roomLobby?.classList.add("active");
  if (screen === "dev") ui.devMenu?.classList.add("active");
}

function hideMenus() {
  ui.menuOverlay?.classList.add("hidden");
}

function playerName() {
  return (ui.playerNameInput?.value || "Player").trim().slice(0, 18) || "Player";
}

function roomName() {
  return (ui.roomNameInput?.value || "Boss Room").trim().slice(0, 26) || "Boss Room";
}

function setMenuStatus(text) {
  if (ui.multiplayerStatus) ui.multiplayerStatus.textContent = text;
}

function setLobbyStatus(text) {
  if (ui.lobbyStatus) ui.lobbyStatus.textContent = text;
}

function showDevPasswordScreen() {
  showMenuScreen("dev");
  if (ui.devPasswordInput) {
    ui.devPasswordInput.value = "";
    ui.devPasswordInput.focus();
  }
  if (ui.devStatus) ui.devStatus.textContent = "Enter the dev password.";
}

function startDevTestFromPassword() {
  if ((ui.devPasswordInput?.value || "") !== "a") {
    if (ui.devStatus) ui.devStatus.textContent = "Wrong password.";
    showFloat("Wrong password");
    return;
  }
  runState.devUnlocked = true;
  multiplayer.mode = "dev";
  closeMultiplayerSocket();
  beginRun("dev", boss.kind || "cola");
}

function renderRoomList() {
  if (!ui.roomList) return;
  if (!multiplayer.rooms.length) {
    ui.roomList.innerHTML = `<div class="room-card"><div><strong>No Rooms</strong><span>Create one to start co-op.</span></div></div>`;
    return;
  }
  ui.roomList.innerHTML = multiplayer.rooms.map((room) => `
    <button class="room-card" type="button" data-room="${room.id}">
      <div>
        <strong>${escapeHtml(room.name)}</strong>
        <span>${escapeHtml(room.bossName)} - ${room.playerCount}/${room.maxPlayers} - ${room.state}</span>
      </div>
      <span>${room.id}</span>
    </button>
  `).join("");
}

function renderLobby() {
  const room = multiplayer.room;
  if (!room) return;
  const isHost = room.hostId === multiplayer.id;
  if (ui.lobbyTitle) ui.lobbyTitle.textContent = `${room.name} (${room.id})`;
  if (ui.lobbyPlayers) {
    ui.lobbyPlayers.innerHTML = room.players.map((peer) => `
      <div class="lobby-player">
        <div>
          <strong>${escapeHtml(peer.name)}${peer.host ? " - Host" : ""}</strong>
          <span>${peer.ready ? "Ready" : peer.host ? "Host" : "Not ready"}</span>
        </div>
        <span>${peer.id === multiplayer.id ? "You" : ""}</span>
      </div>
    `).join("");
  }
  ui.lobbyBossSelector?.querySelectorAll("[data-boss]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.boss === room.bossKind);
    const locked = lockedBosses.has(button.dataset.boss);
    button.disabled = !isHost || locked;
    button.classList.toggle("locked", locked);
    button.setAttribute("aria-disabled", String(locked));
  });
  if (ui.readyButton) {
    ui.readyButton.disabled = isHost;
    ui.readyButton.textContent = multiplayer.ready ? "Unready" : "Ready";
  }
  if (ui.startRoomButton) {
    ui.startRoomButton.disabled = !isHost;
  }
  setLobbyStatus(isHost ? "Start when everyone is ready. The run begins at Big Cola." : "Ready up when your build is set.");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function closeMultiplayerSocket() {
  multiplayer.enabled = false;
  multiplayer.connected = false;
  multiplayer.room = null;
  multiplayer.rooms = [];
  multiplayer.ready = false;
  multiplayer.pendingStart = null;
  multiplayer.startAt = 0;
  multiplayer.assignedSpawn = null;
  resetPartySyncState();
  if (multiplayer.socket) {
    multiplayer.socket.close();
    multiplayer.socket = null;
  }
}

function returnToMultiplayerLobby(message) {
  clearEncounterState();
  clearMazeState();
  resetPartySyncState();
  runState.mode = "menu";
  runState.active = false;
  runState.buildLocked = false;
  resetRunTalents();
  player.dead = false;
  player.won = false;
  player.destination = null;
  player.slide = null;
  multiplayer.peers.clear();
  showMenuScreen("lobby");
  setLobbyStatus(message);
  setMenuStatus(message);
  setCoopStatus("Lobby", multiplayer.room?.players?.length || 1);
}

function showFloat(text) {
  ui.floatText.textContent = text;
  floatTimer = 1.7;
}

function openClassMenu() {
  if (runState.buildLocked) {
    showFloat("Build locked");
    return;
  }
  if (ui.classMenuOverlay) ui.classMenuOverlay.hidden = false;
}

function closeClassMenu() {
  if (ui.classMenuOverlay) ui.classMenuOverlay.hidden = true;
}

function openArmorMenu() {
  if (runState.buildLocked) {
    showFloat("Build locked");
    return;
  }
  if (ui.armorMenuOverlay) ui.armorMenuOverlay.hidden = false;
}

function closeArmorMenu() {
  if (ui.armorMenuOverlay) ui.armorMenuOverlay.hidden = true;
}

function openTalentMenu() {
  if (ui.talentMenuOverlay) ui.talentMenuOverlay.hidden = false;
  renderTalentTree(true);
}

function closeTalentMenu() {
  if (ui.talentMenuOverlay) ui.talentMenuOverlay.hidden = true;
}

function openBossMenu() {
  if (runState.mode !== "dev") {
    showFloat("Dev Test only");
    return;
  }
  if (ui.bossMenuOverlay) ui.bossMenuOverlay.hidden = false;
}

function closeBossMenu() {
  if (ui.bossMenuOverlay) ui.bossMenuOverlay.hidden = true;
}

function renderTalentTree(force = false) {
  if (!ui.talentTree) return;
  const classKey = activeTalentClass();
  const learned = Array.from(runState.learnedTalents || []).sort().join(",");
  const signature = `${classKey}:${runState.talentPoints}:${learned}`;
  if (!force && signature === talentTreeSignature) return;
  talentTreeSignature = signature;
  if (ui.talentMenuTitle) ui.talentMenuTitle.textContent = `${talentClassNames[classKey] || "Class"} Talents`;
  if (ui.talentMenuPoints) ui.talentMenuPoints.textContent = `Talent Points: ${runState.talentPoints}`;
  const branches = [...new Set(talentsForActiveClass().map((talent) => talent.branch))];
  ui.talentTree.innerHTML = branches.map((branch) => {
    const nodes = talentsForActiveClass()
      .filter((talent) => talent.branch === branch)
      .sort((a, b) => a.row - b.row);
    return `
      <section class="talent-branch">
        <h2>${branch}</h2>
        ${nodes.map((talent) => {
          const learnedNode = hasTalent(talent.id);
          const available = canLearnTalent(talent.id);
          const parentNames = talent.parents.map((parentId) => talentById.get(parentId)?.name || parentId).join(", ");
          const state = learnedNode ? "learned" : available ? "available" : "locked";
          const req = learnedNode ? "Learned" : available ? "Click to learn" : talent.parents.length ? `Requires ${parentNames}` : runState.talentPoints > 0 ? "Available" : "Need Talent Points";
          return `<button class="talent-node ${state} ${talent.type} ${talent.row === 0 ? "root" : ""}" type="button" data-talent="${talent.id}" ${available ? "" : "disabled aria-disabled=\"true\""}><strong>${talent.name}</strong><span>${talent.description}</span><small>${talent.type} - ${req}</small></button>`;
        }).join("")}
      </section>
    `;
  }).join("");
}

function closestElementTarget(event, selector) {
  const target = event.target?.nodeType === Node.ELEMENT_NODE ? event.target : event.target?.parentElement;
  return target?.closest?.(selector) || null;
}

function handleSelectorPointer(event) {
  const classMenuButton = closestElementTarget(event, "#classMenuButton");
  if (classMenuButton) {
    event.preventDefault();
    openClassMenu();
    return true;
  }
  const armorMenuButton = closestElementTarget(event, "#armorMenuButton");
  if (armorMenuButton) {
    event.preventDefault();
    openArmorMenu();
    return true;
  }
  const bossMenuButton = closestElementTarget(event, "#bossMenuButton");
  if (bossMenuButton) {
    event.preventDefault();
    openBossMenu();
    return true;
  }
  const skillsButton = closestElementTarget(event, "#skillsButton");
  if (skillsButton) {
    event.preventDefault();
    openTalentMenu();
    return true;
  }

  const classButton = closestElementTarget(event, "[data-class]");
  if (classButton && ui.classMenuOverlay && !ui.classMenuOverlay.hidden) {
    event.preventDefault();
    if (!classButton.disabled) {
      equipClass(classButton.dataset.class);
      closeClassMenu();
    }
    return true;
  }
  const armorButton = closestElementTarget(event, "[data-armor]");
  if (armorButton && ui.armorMenuOverlay && !ui.armorMenuOverlay.hidden) {
    event.preventDefault();
    equipGear("armor", armorButton.dataset.armor);
    closeArmorMenu();
    return true;
  }
  const bossButton = closestElementTarget(event, "[data-boss]");
  if (bossButton && ui.bossMenuOverlay && !ui.bossMenuOverlay.hidden) {
    event.preventDefault();
    if (!bossButton.disabled && !lockedBosses.has(bossButton.dataset.boss)) {
      selectBoss(bossButton.dataset.boss);
      closeBossMenu();
    }
    return true;
  }
  const talentButton = closestElementTarget(event, "[data-talent]");
  if (talentButton && ui.talentMenuOverlay && !ui.talentMenuOverlay.hidden) {
    event.preventDefault();
    learnTalent(talentButton.dataset.talent);
    renderTalentTree(true);
    return true;
  }

  const classCloseButton = closestElementTarget(event, "#classMenuClose");
  if (classCloseButton) {
    event.preventDefault();
    closeClassMenu();
    return true;
  }
  const armorCloseButton = closestElementTarget(event, "#armorMenuClose");
  if (armorCloseButton) {
    event.preventDefault();
    closeArmorMenu();
    return true;
  }
  const bossCloseButton = closestElementTarget(event, "#bossMenuClose");
  if (bossCloseButton) {
    event.preventDefault();
    closeBossMenu();
    return true;
  }
  const talentCloseButton = closestElementTarget(event, "#talentMenuClose");
  if (talentCloseButton) {
    event.preventDefault();
    closeTalentMenu();
    return true;
  }
  return false;
}

function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  renderUi();
  requestAnimationFrame(gameLoop);
}

function handleCanvasPointerAttack(event) {
  const rect = canvas.getBoundingClientRect();
  mouseWorld = { x: event.clientX - rect.left + camera.x, y: event.clientY - rect.top + camera.y };
  handleCanvasClick(mouseWorld.x, mouseWorld.y);
}

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  lastCanvasPointerAttackAt = performance.now();
  handleCanvasPointerAttack(event);
});

canvas.addEventListener("click", (event) => {
  if (performance.now() - lastCanvasPointerAttackAt < 350) {
    return;
  }
  handleCanvasPointerAttack(event);
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

ui.classSelector?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-class]");
  if (!button || button.disabled) return;
  equipClass(button.dataset.class);
  closeClassMenu();
});

ui.classMenuButton?.addEventListener("click", openClassMenu);

ui.classMenuClose?.addEventListener("click", closeClassMenu);

ui.classMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === ui.classMenuOverlay) closeClassMenu();
});

document.addEventListener("click", (event) => {
  handleSelectorPointer(event);
}, true);

ui.armorSelector?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-armor]");
  if (!button) return;
  equipGear("armor", button.dataset.armor);
  closeArmorMenu();
});

ui.armorMenuButton?.addEventListener("click", openArmorMenu);
ui.armorMenuClose?.addEventListener("click", closeArmorMenu);
ui.armorMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === ui.armorMenuOverlay) closeArmorMenu();
});

ui.skillsButton?.addEventListener("click", openTalentMenu);
ui.talentMenuClose?.addEventListener("click", closeTalentMenu);
ui.talentMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === ui.talentMenuOverlay) closeTalentMenu();
});
ui.talentTree?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-talent]");
  if (!button || button.disabled) return;
  learnTalent(button.dataset.talent);
  renderTalentTree(true);
});

ui.bossSelector?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-boss]");
  if (!button || button.disabled || lockedBosses.has(button.dataset.boss)) return;
  event.preventDefault();
  selectBoss(button.dataset.boss);
  closeBossMenu();
});

ui.bossMenuButton?.addEventListener("click", openBossMenu);
ui.bossMenuClose?.addEventListener("click", closeBossMenu);
ui.bossMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === ui.bossMenuOverlay) closeBossMenu();
});

ui.singlePlayerButton?.addEventListener("click", startSinglePlayer);
ui.multiplayerButton?.addEventListener("click", startMultiplayerFlow);
ui.devTestButton?.addEventListener("click", showDevPasswordScreen);
ui.backFromDevButton?.addEventListener("click", () => showMenuScreen("main"));
ui.startDevButton?.addEventListener("click", startDevTestFromPassword);
ui.devPasswordInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  startDevTestFromPassword();
});
ui.backToMainButton?.addEventListener("click", () => {
  closeMultiplayerSocket();
  showMenuScreen("main");
  setCoopStatus("Solo", 1);
});
ui.createRoomButton?.addEventListener("click", () => {
  sendServer({ type: "set-name", name: playerName() });
  sendServer({ type: "create-room", name: roomName(), bossKind: boss.kind });
});
ui.refreshRoomsButton?.addEventListener("click", () => sendServer({ type: "list-rooms" }));
ui.roomList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-room]");
  if (!button) return;
  sendServer({ type: "set-name", name: playerName() });
  sendServer({ type: "join-room", roomId: button.dataset.room });
});
ui.leaveRoomButton?.addEventListener("click", () => {
  sendServer({ type: "leave-room" });
  multiplayer.room = null;
  multiplayer.ready = false;
  multiplayer.peers.clear();
  showMenuScreen("multiplayer");
  sendServer({ type: "list-rooms" });
});
ui.readyButton?.addEventListener("click", () => {
  multiplayer.ready = !multiplayer.ready;
  sendServer({ type: "set-ready", ready: multiplayer.ready });
});
ui.startRoomButton?.addEventListener("click", () => sendServer({ type: "start-game" }));
ui.lobbyBossSelector?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-boss]");
  if (!button || button.disabled) return;
  sendServer({ type: "select-boss", bossKind: button.dataset.boss });
});

ui.potionButton.addEventListener("click", drinkPotion);
ui.mazeRewardCards?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-reward]");
  if (!button) return;
  chooseMazeReward(button.dataset.reward);
});
ui.resetButton.addEventListener("click", () => resetFight(false));
ui.deathResetButton?.addEventListener("click", () => returnToMainMenu("Choose a mode to start a new run."));
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
showMenuScreen("main");
requestAnimationFrame(gameLoop);
