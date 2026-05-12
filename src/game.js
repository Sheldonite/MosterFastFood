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
  desktopUpdateButton: document.querySelector("#desktopUpdateButton"),
  devTestButton: document.querySelector("#devTestButton"),
  backFromDevButton: document.querySelector("#backFromDevButton"),
  devPasswordInput: document.querySelector("#devPasswordInput"),
  startDevButton: document.querySelector("#startDevButton"),
  devStatus: document.querySelector("#devStatus"),
  backToMainButton: document.querySelector("#backToMainButton"),
  playerNameInput: document.querySelector("#playerNameInput"),
  roomNameInput: document.querySelector("#roomNameInput"),
  serverUrlInput: document.querySelector("#serverUrlInput"),
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
  multiplayerDebugHud: document.querySelector("#multiplayerDebugHud"),
  debugReportOverlay: document.querySelector("#debugReportOverlay"),
  debugReportText: document.querySelector("#debugReportText"),
  debugReportCopy: document.querySelector("#debugReportCopy"),
  debugReportDismiss: document.querySelector("#debugReportDismiss"),
  debugReportButton: document.querySelector("#debugReportButton"),
};

const lockedBosses = new Set();
const gauntletTestDebugEnabled = new URLSearchParams(location.search).has("gauntlet-test");
const desktopConfig = window.BossFightConfig || {};
const desktopUpdater = window.BossFightUpdater || null;

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
    oakLute: { slot: "weapon", name: "Oak Lute", tag: "Bard", damage: 34, range: 190, speed: 0.88, moveSpeedBonus: 20, color: "#f6c46d" },
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
  { id: "bard", name: "Bard", weapon: "oakLute", tag: "Support", note: "Songs and chords" },
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

const mazeRewardVisuals = {
  damage: { tone: "gold", category: "Damage", icon: "damage" },
  speed: { tone: "blue", category: "Speed", icon: "speed" },
  hp: { tone: "green", category: "Health", icon: "hp" },
  armor: { tone: "blue", category: "Defense", icon: "armor" },
  attackSpeed: { tone: "blue", category: "Speed", icon: "attackSpeed" },
  potion: { tone: "green", category: "Utility", icon: "potion" },
  cooldown: { tone: "purple", category: "Cooldown", icon: "cooldown" },
};

const playerBaseHealthMultiplier = 3;
const playerArmorHealthOffsets = {
  channelerRobe: 0,
  duelistCoat: 25,
  bulwarkPlate: 50,
};
const mazeWallThickness = 8;
const mazePlayerWallPadding = 8;
const gauntletPlayerObstaclePadding = 3;

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
    { key: "Q", name: "Shield Bash", cooldown: 4.5, description: "Strike in a cone, interrupt and shove enemies, and block incoming projectiles." },
    { key: "E", name: "Groundbreaker", cooldown: 10, description: "Slam the ground around you, damaging, interrupting, and knocking enemies back." },
    { key: "Space", name: "Whirlwind Dash", cooldown: 8, description: "Dash forward while briefly invulnerable, damaging enemies you pass through." },
    { key: "R", name: "Shield Wall", cooldown: 15, description: "Raise your guard for several seconds, greatly reducing incoming damage." },
  ],
  ranger: [
    { key: "Q", name: "Marked Shot", cooldown: 7, description: "Fire a fast arrow that marks the target for bonus follow-up ranged hits." },
    { key: "E", name: "Arrow Storm", cooldown: 12, description: "Call down repeated arrow strikes in a targeted area." },
    { key: "Space", name: "Tumble Shot", cooldown: 9, description: "Dodge in your movement direction and fire a quick shot while evading." },
    { key: "R", name: "Volley Trap", cooldown: 16, description: "Drop a trap that locks onto enemies, favoring marked targets, and fires a burst of arrows." },
  ],
  mage: [
    { key: "Q", name: "Fire Blast", cooldown: 6, description: "Cast a heavy fire projectile that explodes for high area damage." },
    { key: "E", name: "Meteor Field", cooldown: 13, description: "Create a targeted zone where meteors repeatedly fall and damage enemies." },
    { key: "Space", name: "Blink Step", cooldown: 10, description: "Teleport forward and leave a rune that damages enemies and clears small hazards." },
    { key: "R", name: "Time Warp", cooldown: 18, description: "Create a slowing field that drags down moving hazards and supports cooldown talents." },
  ],
  rogue: [
    { key: "Q", name: "Backstab", cooldown: 6, description: "Slash in front of you; after Shadow Step, it becomes a much stronger empowered strike." },
    { key: "E", name: "Poison Cloud", cooldown: 11, description: "Create a poison zone that damages enemies, stacks poison, and slows hazards." },
    { key: "Space", name: "Shadow Step", cooldown: 8, description: "Teleport toward your aim direction, briefly evade, and ready an empowered Backstab." },
    { key: "R", name: "Smoke Bomb", cooldown: 16, description: "Drop a smoke zone that grants evasion, weakens hazards, and sets up an ambush when you leave." },
  ],
  paladin: [
    { key: "Q", name: "Radiant Smite", cooldown: 5.5, description: "Blast a holy area in front of you, damaging and interrupting enemies." },
    { key: "E", name: "Consecration", cooldown: 12, description: "Create a holy aura around yourself that pulses damage, heals you, and reduces incoming damage." },
    { key: "Space", name: "Aegis Step", cooldown: 9, description: "Teleport a short distance, briefly evade, and gain a burst of speed." },
    { key: "R", name: "Divine Bulwark", cooldown: 16, description: "Heal yourself and gain a strong defensive barrier for several seconds." },
  ],
  bard: [
    { key: "Q", name: "Power Chord", cooldown: 5.2, description: "Fire a cone-shaped sonic attack that gets stronger for each active song." },
    { key: "E", name: "Battle Hymn", cooldown: 12, description: "Play a song that boosts damage and attack speed for you and nearby allies." },
    { key: "Space", name: "Quickstep Verse", cooldown: 9, description: "Dash with brief invulnerability and start a song that boosts movement speed." },
    { key: "R", name: "Healing Ballad", cooldown: 15, description: "Play a healing song that restores health over time for you and nearby allies." },
  ],
};

const talentClassNames = {
  melee: "Warrior",
  ranger: "Ranger",
  mage: "Mage",
  rogue: "Rogue",
  paladin: "Paladin",
  bard: "Bard",
};

function buildTalentPath(classKey, path, pathIndex, nodes) {
  const layout = talentPathBranchLayout(nodes.length);
  return nodes.map((node, index) => {
    const slot = layout[index] || { row: index + 1, column: 3 };
    const defaultParents = slot.parents?.map((parentIndex) => nodes[parentIndex]?.id).filter(Boolean) || [];
    const defaultParentsAny = slot.parentsAny?.map((parentIndex) => nodes[parentIndex]?.id).filter(Boolean) || [];
    return ({
    id: node.id,
    classKey,
    branch: path,
    path,
    pathIndex,
    row: slot.row,
    column: slot.column,
    name: node.name,
    rarity: node.rarity || (index === nodes.length - 1 ? "legendary" : index >= nodes.length - 3 ? "epic" : index >= 2 ? "rare" : "common"),
    description: node.description,
    synergy: node.synergy || "",
    type: node.type || (index === nodes.length - 1 ? "capstone" : index === 0 ? "minor" : "major"),
    parents: node.parents || defaultParents,
    parentsAny: node.parentsAny || defaultParentsAny,
    effect: node.effect || node.description,
    effectKey: node.effectKey || node.id,
  });
  });
}

function talentPathBranchLayout(count) {
  if (count >= 9) {
    return [
      { row: 1, column: 3 },
      { row: 2, column: 2, parents: [0] },
      { row: 2, column: 4, parents: [0] },
      { row: 3, column: 1, parents: [1] },
      { row: 3, column: 3, parentsAny: [1, 2] },
      { row: 3, column: 5, parents: [2] },
      { row: 4, column: 2, parentsAny: [3, 4] },
      { row: 4, column: 4, parentsAny: [4, 5] },
      { row: 5, column: 3, parentsAny: [6, 7] },
    ];
  }
  return [
    { row: 1, column: 3 },
    { row: 2, column: 2, parents: [0] },
    { row: 2, column: 4, parents: [0] },
    { row: 3, column: 2, parents: [1] },
    { row: 3, column: 4, parents: [2] },
    { row: 4, column: 2, parents: [3] },
    { row: 4, column: 4, parents: [4] },
    { row: 5, column: 3, parentsAny: [5, 6] },
  ];
}

const talentDefinitions = [
  ...buildTalentPath("melee", "Iron Vanguard", 0, [
    { id: "melee_iron_hp", name: "Iron Stomach", rarity: "common", description: "+25 maximum health.", synergy: "Gives Warrior room to stand close during boss patterns." },
    { id: "warrior_vanguard_shield_hook", name: "Shield Hook", rarity: "common", description: "Shield Bash pulls small enemies and slightly drags bosses toward you.", synergy: "Improves melee uptime before Groundbreaker." },
    { id: "warrior_vanguard_brace", name: "Brace And Break", rarity: "rare", description: "Standing still briefly empowers your next Shield Bash into a wider cone.", synergy: "Rewards tank timing during safe windows." },
    { id: "melee_iron_wall", name: "Reinforced Guard", rarity: "rare", description: "Shield Wall lasts longer and blocks more damage.", synergy: "Combines with projectile-heavy boss phases." },
    { id: "melee_iron_heal", name: "Deflecting Bite", rarity: "rare", description: "Shield Bash heals when it blocks projectiles.", synergy: "Turns defense into sustain." },
    { id: "warrior_vanguard_counterquake", name: "Counterquake", rarity: "epic", description: "Blocking or reducing damage charges Groundbreaker.", synergy: "Feeds tank play into AoE pressure." },
    { id: "warrior_vanguard_bulwark_echo", name: "Bulwark Echo", rarity: "epic", description: "The next ability after Shield Wall repeats at reduced power.", synergy: "Creates Shield Wall into Groundbreaker burst lines." },
    { id: "melee_iron_last", name: "Unmoving Mountain", rarity: "legendary", description: "Once per fight, survive lethal damage and gain Shield Wall.", synergy: "Lets Warrior recover during final boss chaos." },
  ]),
  ...buildTalentPath("melee", "Blood Reaver", 1, [
    { id: "melee_blood_bleed", name: "Serrated Opening", rarity: "common", description: "Basic attacks apply Bleed.", synergy: "Starts the Warrior bleed engine." },
    { id: "melee_blood_whirl", name: "Red Sweep", rarity: "common", description: "Whirlwind Dash applies Bleed to all targets hit.", synergy: "Strong in gauntlets and add phases." },
    { id: "melee_blood_deep", name: "Deep Cuts", rarity: "rare", description: "Bleeds last longer and tick harder.", synergy: "Improves every Reaver payoff." },
    { id: "warrior_blood_price", name: "Blood Price", rarity: "rare", description: "Spend a little HP to cast Groundbreaker if its cooldown is almost ready.", synergy: "Risky burst during exposed windows." },
    { id: "melee_blood_hemo", name: "Hemorrhage Pulse", rarity: "rare", description: "Groundbreaker bursts bleeding targets for bonus damage.", synergy: "Core Q/E/Space bleed combo payoff." },
    { id: "warrior_blood_crimson_trail", name: "Crimson Trail", rarity: "epic", description: "Whirlwind leaves a blood trail that damages bleeding enemies more.", synergy: "Turns movement into a DoT lane." },
    { id: "warrior_blood_reaver_rhythm", name: "Reaver Rhythm", rarity: "epic", description: "Alternating basic attacks and abilities extends Bleed duration.", synergy: "Rewards clean rotations." },
    { id: "warrior_blood_bloodstorm", name: "Bloodstorm", rarity: "legendary", description: "Whirlwind consumes long Bleeds for a huge spinning burst.", synergy: "Big setup payoff for boss burn windows." },
  ]),
  ...buildTalentPath("melee", "Earthbreaker", 2, [
    { id: "melee_earth_radius", name: "Wider Quake", rarity: "common", description: "Groundbreaker radius is larger.", synergy: "Makes Warrior AoE more forgiving." },
    { id: "warrior_earth_stonefist", name: "Stonefist", rarity: "common", description: "Basic attacks after Groundbreaker create tiny aftershocks.", synergy: "Adds sustained melee splash." },
    { id: "warrior_earth_fault_line", name: "Fault Line", rarity: "rare", description: "Groundbreaker travels forward in a short line.", synergy: "Lets melee threaten from safer spacing." },
    { id: "melee_earth_after", name: "Aftershock", rarity: "rare", description: "Groundbreaker hits a second time after a short delay.", synergy: "Excellent on bosses held in place." },
    { id: "melee_earth_bash", name: "Shock Bash", rarity: "rare", description: "Shield Bash reaches farther and hits harder.", synergy: "Gives Earthbreaker a ranged opener." },
    { id: "warrior_earth_rubble_guard", name: "Rubble Guard", rarity: "epic", description: "Groundbreaker creates a brief projectile-blocking rubble ring.", synergy: "Adds survival to AoE timing." },
    { id: "melee_earth_cap", name: "Earth Battery", rarity: "epic", description: "Groundbreaker destroys nearby small projectiles.", synergy: "Projectile clears feed safer melee windows." },
    { id: "warrior_earth_worldsplitter", name: "Worldsplitter", rarity: "legendary", description: "Every third Groundbreaker creates three branching shockwaves.", synergy: "Huge arena pressure against large bosses." },
    { id: "warrior_earth_titan_stance", name: "Titan Stance", rarity: "legendary", description: "Groundbreaker radius grows near the boss, but movement speed drops briefly.", synergy: "High-risk close-range mastery." },
  ]),
  ...buildTalentPath("ranger", "Deadeye", 0, [
    { id: "ranger_deadeye_mark", name: "Long Mark", rarity: "common", description: "Marked Shot lasts longer and stores more marked hits.", synergy: "Core boss DPS setup." },
    { id: "ranger_deadeye_damage", name: "Clean Angle", rarity: "common", description: "Marked basic shots deal more damage.", synergy: "Rewards ranged spacing." },
    { id: "ranger_deadeye_pierce", name: "Piercing Mark", rarity: "rare", description: "Marked Shot pierces and marks the first two targets hit.", synergy: "Improves gauntlet and add pressure." },
    { id: "ranger_deadeye_tumble", name: "Snap Aim", rarity: "rare", description: "Tumble Shot empowers your next basic attack.", synergy: "Turns dodging into burst." },
    { id: "ranger_deadeye_refund", name: "Bullseye Refund", rarity: "rare", description: "Consuming the final mark reduces Marked Shot cooldown.", synergy: "Rewards precise mark spending." },
    { id: "ranger_deadeye_detonation", name: "Marked Detonation", rarity: "epic", description: "When the last mark is consumed, the target emits an AoE burst.", synergy: "Adds splash to single-target play." },
    { id: "ranger_deadeye_distance", name: "Perfect Distance", rarity: "epic", description: "Staying in a sweet-spot range charges your next Marked Shot.", synergy: "Builds a positioning minigame." },
    { id: "ranger_deadeye_cap", name: "Execution Mark", rarity: "legendary", description: "Marked targets below 30% HP take escalating damage from consumed marks.", synergy: "Strong final phase finisher." },
  ]),
  ...buildTalentPath("ranger", "Trapmaster", 1, [
    { id: "ranger_trap_tumble", name: "Pocket Trap", rarity: "common", description: "Tumble Shot drops a short-lived mini trap.", synergy: "Kiting leaves damage behind." },
    { id: "ranger_trap_size", name: "Wide Net", rarity: "common", description: "Volley Trap trigger radius is larger.", synergy: "Makes setup more reliable." },
    { id: "ranger_trap_barbed", name: "Barbed Springs", rarity: "rare", description: "Trap hits briefly slow enemies.", synergy: "Sets up Arrow Storm and Deadeye." },
    { id: "ranger_trap_chain", name: "Trap Chain", rarity: "rare", description: "A triggered trap arms a second smaller trap nearby.", synergy: "Rewards dense trap placement." },
    { id: "ranger_trap_damage", name: "Barbed Volley", rarity: "rare", description: "Volley Trap shots hit harder.", synergy: "Simple trap damage payoff." },
    { id: "ranger_trap_tripwire", name: "Tripwire Volley", rarity: "epic", description: "Traps fire toward marked enemies when triggered.", synergy: "Connects Trapmaster with Deadeye." },
    { id: "ranger_trap_snare_field", name: "Snare Field", rarity: "epic", description: "Multiple traps close together link into a slowing field.", synergy: "Creates safe ranged lanes." },
    { id: "ranger_trap_cap", name: "Hunting Grounds", rarity: "legendary", description: "Volley Trap fires more shots and refreshes faster.", synergy: "Turns Ranger into a setup turret." },
  ]),
  ...buildTalentPath("ranger", "Arrow Storm", 2, [
    { id: "ranger_storm_radius", name: "Broad Storm", rarity: "common", description: "Arrow Storm radius is larger.", synergy: "Easier AoE coverage." },
    { id: "ranger_storm_pulses", name: "Rapid Rain", rarity: "common", description: "Arrow Storm pulses more often.", synergy: "More on-hit triggers." },
    { id: "ranger_storm_follow", name: "Storm Follows", rarity: "rare", description: "Arrow Storm slowly follows your aimed target.", synergy: "Helps against mobile bosses." },
    { id: "ranger_storm_duration", name: "Lingering Clouds", rarity: "rare", description: "Arrow Storm lasts longer.", synergy: "Longer boss damage windows." },
    { id: "ranger_storm_marking", name: "Rain Marking", rarity: "rare", description: "Arrow Storm has a chance to apply a weak mark.", synergy: "Feeds Deadeye builds." },
    { id: "ranger_storm_cyclone", name: "Cyclone Step", rarity: "epic", description: "Tumble through Arrow Storm to fire a ring of arrows.", synergy: "Combines mobility with AoE." },
    { id: "ranger_storm_cloudburst", name: "Cloudburst", rarity: "epic", description: "Casting another ability inside Arrow Storm causes an extra pulse.", synergy: "Rewards ability weaving." },
    { id: "ranger_storm_cap", name: "Skyfall Engine", rarity: "legendary", description: "Arrow Storm hits much harder.", synergy: "Primary Ranger burn-window payoff." },
    { id: "ranger_storm_endless_quiver", name: "Endless Quiver", rarity: "legendary", description: "During Arrow Storm, every third basic shot fires an extra falling arrow.", synergy: "Attack-speed storm build." },
  ]),
  ...buildTalentPath("mage", "Pyromancer", 0, [
    { id: "mage_pyro_burn", name: "Scorching Blast", rarity: "common", description: "Fire Blast applies Burn.", synergy: "Starts the Mage burn loop." },
    { id: "mage_pyro_radius", name: "Hotter Blast", rarity: "common", description: "Fire Blast explosion radius is larger.", synergy: "Easier add and donut minion clears." },
    { id: "mage_pyro_kindling", name: "Kindling Rune", rarity: "rare", description: "Blink leaves a fire rune that detonates.", synergy: "Turns movement into setup damage." },
    { id: "mage_pyro_damage", name: "Combustion", rarity: "rare", description: "Fire Blast deals more damage.", synergy: "Simple burst upgrade for the main nuke." },
    { id: "mage_pyro_molten_splash", name: "Molten Splash", rarity: "rare", description: "Burning enemies hit by Meteor leave small lava puddles.", synergy: "Connects Pyromancer and Meteor Savant." },
    { id: "mage_pyro_chain_ignite", name: "Chain Ignite", rarity: "epic", description: "Killing a burning enemy spreads Burn nearby.", synergy: "Strong gauntlet wave clear." },
    { id: "mage_pyro_flame_debt", name: "Flame Debt", rarity: "epic", description: "Casting Fire Blast near-ready spends HP to fire instantly.", synergy: "Risky exposed-window burst." },
    { id: "mage_pyro_cap", name: "Inferno Core", rarity: "legendary", description: "Fire Blast becomes a huge, high-damage explosion.", synergy: "Big payoff for grouped targets." },
  ]),
  ...buildTalentPath("mage", "Meteor Savant", 1, [
    { id: "mage_meteor_radius", name: "Wide Field", rarity: "common", description: "Meteor Field radius is larger.", synergy: "Better boss zone control." },
    { id: "mage_meteor_speed", name: "Falling Stars", rarity: "common", description: "Meteor Field impacts more often.", synergy: "More status and hit triggers." },
    { id: "mage_meteor_duration", name: "Molten Sky", rarity: "rare", description: "Meteor Field lasts longer.", synergy: "Longer damage windows." },
    { id: "mage_meteor_gravity", name: "Gravity Well", rarity: "rare", description: "Meteor Field gently pulls small enemies inward.", synergy: "Gauntlet control and Fire Blast setup." },
    { id: "mage_meteor_impact_echo", name: "Impact Echo", rarity: "rare", description: "Every third meteor repeats as a smaller impact.", synergy: "Sustained AoE pressure." },
    { id: "mage_meteor_star_brand", name: "Star Brand", rarity: "epic", description: "Meteor hits brand targets; Fire Blast detonates brands.", synergy: "Rotation payoff." },
    { id: "mage_meteor_armor", name: "Meteor Armor", rarity: "epic", description: "Standing in Meteor Field grants brief damage reduction.", synergy: "Supports risky stationary casting." },
    { id: "mage_meteor_cap", name: "Cataclysm", rarity: "legendary", description: "Meteor impacts are larger and hit harder.", synergy: "Best during Shell Crack and boss exposes." },
    { id: "mage_meteor_orbiting_star", name: "Orbiting Star", rarity: "legendary", description: "A mini meteor orbits you and crashes into your next Fire Blast target.", synergy: "Burst setup for skilled timing." },
  ]),
  ...buildTalentPath("mage", "Chronomancer", 2, [
    { id: "mage_chrono_radius", name: "Wide Warp", rarity: "common", description: "Time Warp radius is larger.", synergy: "More room to slow hazards." },
    { id: "mage_chrono_duration", name: "Long Warp", rarity: "common", description: "Time Warp lasts longer.", synergy: "More cooldown and safety value." },
    { id: "mage_chrono_blink", name: "Echo Blink", rarity: "rare", description: "Blink Rune is larger and stronger.", synergy: "Mobility becomes damage." },
    { id: "mage_chrono_frozen_second", name: "Frozen Second", rarity: "rare", description: "Enemies hit inside Time Warp briefly freeze after enough hits.", synergy: "Works with Meteor and Arrow Storm allies." },
    { id: "mage_chrono_borrowed_time", name: "Borrowed Time", rarity: "rare", description: "Casting inside Time Warp reduces your longest cooldown.", synergy: "Rewards playing inside the zone." },
    { id: "mage_chrono_delayed_blast", name: "Delayed Blast", rarity: "epic", description: "Fire Blast inside Time Warp detonates again after a delay.", synergy: "Pyro/Chrono combo." },
    { id: "mage_chrono_rewind_ward", name: "Rewind Ward", rarity: "epic", description: "Taking lethal damage inside Time Warp rewinds you once per fight.", synergy: "Survival for glass armor." },
    { id: "mage_chrono_cap", name: "Time Loop", rarity: "legendary", description: "Once per fight, lethal damage rewinds into a heal.", synergy: "Keeps Mage alive in late phases." },
  ]),
  ...buildTalentPath("rogue", "Venomancer", 0, [
    { id: "rogue_venom_stacks", name: "Toxic Edge", rarity: "common", description: "Poison can stack higher.", synergy: "Core Rogue ramp." },
    { id: "rogue_venom_damage", name: "Vile Dose", rarity: "common", description: "Poison ticks harder.", synergy: "Improves all poison sources." },
    { id: "rogue_venom_cloud", name: "Spreading Cloud", rarity: "rare", description: "Poison Cloud is larger and lasts longer.", synergy: "Zone control." },
    { id: "rogue_venom_volatile", name: "Volatile Toxin", rarity: "rare", description: "Poisoned enemies explode on death.", synergy: "Excellent gauntlet wave clear." },
    { id: "rogue_smoke_poison", name: "Contaminated Smoke", rarity: "rare", description: "Smoke Bomb poisons enemies inside it.", synergy: "Connects Smoke Trickster to Venomancer." },
    { id: "rogue_venom_bloom", name: "Toxin Bloom", rarity: "epic", description: "Max poison stacks spread poison to nearby targets.", synergy: "Scales DoT into AoE." },
    { id: "rogue_venom_bank", name: "Venom Bank", rarity: "epic", description: "Poison damage charges your next Backstab.", synergy: "Turns DoT ramp into burst." },
    { id: "rogue_venom_cap", name: "Venom Nova", rarity: "legendary", description: "Max poison stacks burst for bonus damage.", synergy: "Boss ramp payoff." },
    { id: "rogue_venom_plague_artist", name: "Plague Artist", rarity: "legendary", description: "Poison Cloud follows your last poisoned boss for a few seconds.", synergy: "Keeps pressure on mobile bosses." },
  ]),
  ...buildTalentPath("rogue", "Shadow Duelist", 1, [
    { id: "rogue_shadow_backstab", name: "Dirty Knife", rarity: "common", description: "Backstab hits harder.", synergy: "Direct burst identity." },
    { id: "rogue_shadow_exposed", name: "Deep Expose", rarity: "common", description: "Exposed stacks last longer.", synergy: "Longer execute setup." },
    { id: "rogue_shadow_step", name: "Long Shadow", rarity: "rare", description: "Shadow Step keeps Backstab ready longer.", synergy: "More forgiving positioning." },
    { id: "rogue_shadow_ambush_echo", name: "Ambush Echo", rarity: "rare", description: "Shadow Step creates an echo slash behind the target.", synergy: "Boss positioning reward." },
    { id: "rogue_shadow_expose_bleed", name: "Expose Bleed", rarity: "rare", description: "Backstab applies Bleed when hitting an exposed target.", synergy: "Hybrid DoT setup." },
    { id: "rogue_shadow_death_mark", name: "Death Mark", rarity: "epic", description: "Exposed targets take bonus damage from Poison ticks.", synergy: "Venomancer hybrid." },
    { id: "rogue_shadow_knife_dance", name: "Knife Dance", rarity: "epic", description: "Killing an enemy with Backstab resets part of Shadow Step.", synergy: "Gauntlet chain kills." },
    { id: "rogue_shadow_cap", name: "Deathblow", rarity: "legendary", description: "Empowered Backstab consumes Exposed for bonus damage.", synergy: "Final phase execute." },
  ]),
  ...buildTalentPath("rogue", "Smoke Trickster", 2, [
    { id: "rogue_smoke_size", name: "Heavy Smoke", rarity: "common", description: "Smoke Bomb radius is larger.", synergy: "Safer setup zone." },
    { id: "rogue_smoke_duration", name: "Lingering Cover", rarity: "common", description: "Smoke Bomb lasts longer.", synergy: "More time to play around cover." },
    { id: "rogue_smoke_cap", name: "Black Powder", rarity: "rare", description: "Smoke Bomb clears small projectiles when dropped.", synergy: "Bullet hell defense." },
    { id: "rogue_smoke_step", name: "Smoke Step", rarity: "rare", description: "Dashing through Smoke Bomb grants brief invisibility.", synergy: "Melee uptime and escape." },
    { id: "rogue_smoke_noxious_cover", name: "Noxious Cover", rarity: "rare", description: "Poison Cloud cast inside Smoke Bomb deals extra poison ticks.", synergy: "Smoke/Venom combo." },
    { id: "rogue_smoke_blind_spot", name: "Blind Spot", rarity: "epic", description: "Enemies inside Smoke Bomb take bonus Backstab damage from any direction.", synergy: "Removes strict rear-angle requirement inside smoke." },
    { id: "rogue_smoke_vanishing_act", name: "Vanishing Act", rarity: "epic", description: "Taking heavy damage drops a mini Smoke Bomb.", synergy: "Emergency defense." },
    { id: "rogue_smoke_blackout", name: "Blackout", rarity: "legendary", description: "Smoke Bomb becomes a dark zone that slows hazards and empowers Rogue attacks inside.", synergy: "Full Rogue kit payoff." },
  ]),
  ...buildTalentPath("paladin", "Consecrated Ground", 0, [
    { id: "paladin_consecrate_size", name: "Wider Light", rarity: "common", description: "Consecration radius is larger.", synergy: "Bigger safe/damage zone." },
    { id: "paladin_consecrate_duration", name: "Lasting Prayer", rarity: "common", description: "Consecration lasts longer.", synergy: "More sustained boss uptime." },
    { id: "paladin_consecrate_damage", name: "Holy Burn", rarity: "rare", description: "Consecration deals more damage.", synergy: "Core ground damage payoff." },
    { id: "paladin_consecrate_footing", name: "Sacred Footing", rarity: "rare", description: "Standing in Consecration reduces knockback and slow.", synergy: "Helps against Taco and Shake mechanics." },
    { id: "paladin_consecrate_edge", name: "Radiant Edge", rarity: "rare", description: "Basic attacks inside Consecration release small holy arcs.", synergy: "Rewards staying in your field." },
    { id: "paladin_consecrate_cap", name: "Divine Domain", rarity: "epic", description: "Abilities recover faster while you stand in Consecration.", synergy: "Cooldown engine for Paladin." },
    { id: "paladin_consecrate_echo", name: "Hallowed Echo", rarity: "epic", description: "Radiant Smite inside Consecration pulses twice.", synergy: "Combines Ground and Judgment paths." },
    { id: "paladin_consecrate_cathedral", name: "Cathedral Field", rarity: "legendary", description: "Consecration grows while you remain inside it, then detonates when you leave.", synergy: "Risk/reward zone mastery." },
    { id: "paladin_consecrate_sunlit_march", name: "Sunlit March", rarity: "legendary", description: "Aegis Step drags a strip of Consecration behind you.", synergy: "Movement plus holy ground control." },
  ]),
  ...buildTalentPath("paladin", "Guardian", 1, [
    { id: "paladin_guard_heal", name: "Mercy Ward", rarity: "common", description: "Divine Bulwark heals more.", synergy: "Reliable sustain." },
    { id: "paladin_guard_mitigation", name: "Blessed Plate", rarity: "common", description: "Shield Wall and Bulwark reduce more damage.", synergy: "Improves all tank windows." },
    { id: "paladin_guard_projectiles", name: "Projectile Ward", rarity: "rare", description: "Divine Bulwark clears nearby projectiles.", synergy: "Protects melee and allies." },
    { id: "paladin_guard_vow", name: "Vow Of Return", rarity: "rare", description: "Damage absorbed by Bulwark empowers your next Radiant Smite.", synergy: "Defense turns into burst." },
    { id: "paladin_guard_anchor", name: "Aegis Anchor", rarity: "rare", description: "Aegis Step grants a shield when ending near the boss.", synergy: "Safe re-entry tool." },
    { id: "paladin_guard_shared", name: "Shared Bulwark", rarity: "epic", description: "Divine Bulwark also shields nearby allies.", synergy: "Strong multiplayer support." },
    { id: "paladin_guard_martyr", name: "Martyr Spark", rarity: "epic", description: "Taking damage while shielded emits holy pulses.", synergy: "Tank pressure while soaking." },
    { id: "paladin_guard_cap", name: "Unfallen", rarity: "legendary", description: "Once per fight, survive lethal damage and gain Bulwark.", synergy: "Late-fight safety net." },
  ]),
  ...buildTalentPath("paladin", "Judgment", 2, [
    { id: "paladin_judgment_damage", name: "Sharp Judgment", rarity: "common", description: "Radiant Smite hits harder.", synergy: "Direct burst upgrade." },
    { id: "paladin_judgment_radius", name: "Wide Verdict", rarity: "common", description: "Radiant Smite radius is larger.", synergy: "Easier AoE tagging." },
    { id: "paladin_judgment_mark", name: "Marked Guilty", rarity: "rare", description: "Radiant Smite marks enemies to take more damage.", synergy: "Class-wide damage amplifier." },
    { id: "paladin_judgment_chain", name: "Chain Verdict", rarity: "rare", description: "Radiant Smite chains to another nearby enemy.", synergy: "Gauntlet and add clear." },
    { id: "paladin_judgment_trial", name: "Trial By Fire", rarity: "rare", description: "Holy Burned enemies hit by Smite burst.", synergy: "Connects Consecration to Smite." },
    { id: "paladin_judgment_day", name: "Judgment Day", rarity: "epic", description: "Every third Radiant Smite is larger and leaves a holy zone.", synergy: "Rotation payoff." },
    { id: "paladin_judgment_appeal", name: "Final Appeal", rarity: "epic", description: "Smite heals you if it hits a judged target.", synergy: "Offense into sustain." },
    { id: "paladin_judgment_cap", name: "Final Judgment", rarity: "legendary", description: "Radiant Smite bursts marked enemies for bonus damage.", synergy: "Setup payoff for boss phases." },
  ]),
  ...buildTalentPath("bard", "Power Chord", 0, [
    { id: "bard_chord_damage", name: "Louder Chord", rarity: "common", description: "Power Chord deals more base damage.", synergy: "Direct damage Bard opener." },
    { id: "bard_chord_harmonic", name: "Harmonic Strike", rarity: "common", description: "Power Chord gains more damage per active song.", synergy: "Rewards keeping songs active." },
    { id: "bard_chord_extend", name: "Resonant Finale", rarity: "rare", description: "Power Chord hits extend active songs slightly.", synergy: "Rotation upkeep." },
    { id: "bard_chord_bass_cleave", name: "Bass Cleave", rarity: "rare", description: "Power Chord becomes a wider wave.", synergy: "Better gauntlet clear." },
    { id: "bard_chord_dissonance", name: "Dissonance", rarity: "rare", description: "Power Chord weakens enemy damage briefly.", synergy: "Offensive support." },
    { id: "bard_chord_echo", name: "Echo Note", rarity: "epic", description: "Every second Power Chord repeats at reduced damage.", synergy: "Cooldown and rhythm builds." },
    { id: "bard_chord_shatter", name: "Shatter Chord", rarity: "epic", description: "Power Chord deals bonus damage to marked, poisoned, burning, or bleeding targets.", synergy: "Co-op status payoff." },
    { id: "bard_chord_cap", name: "Grand Finale", rarity: "legendary", description: "Power Chord gains a large bonus when all three songs are active.", synergy: "Full Bard rotation burst." },
    { id: "bard_chord_encore_blast", name: "Encore Blast", rarity: "legendary", description: "Defeating an enemy with Power Chord casts a free weaker Power Chord.", synergy: "Gauntlet chain kills." },
  ]),
  ...buildTalentPath("bard", "Battle Hymn", 1, [
    { id: "bard_hymn_damage", name: "Brave Tempo", rarity: "common", description: "Battle Hymn grants a stronger damage buff.", synergy: "Party burst support." },
    { id: "bard_hymn_speed", name: "Fast Rhythm", rarity: "common", description: "Battle Hymn grants more attack speed.", synergy: "Great with Ranger and Rogue allies." },
    { id: "bard_hymn_radius", name: "Wide Chorus", rarity: "rare", description: "Battle Hymn radius is larger.", synergy: "Easier co-op positioning." },
    { id: "bard_hymn_marching", name: "Marching Beat", rarity: "rare", description: "Allies inside Battle Hymn gain movement speed.", synergy: "Boss dodging support." },
    { id: "bard_hymn_war", name: "War Anthem", rarity: "rare", description: "Power Chord gains bonus damage while Battle Hymn is active.", synergy: "Offensive Bard loop." },
    { id: "bard_hymn_haste", name: "Haste Verse", rarity: "epic", description: "Ability cooldowns tick faster inside Battle Hymn.", synergy: "Team cooldown engine." },
    { id: "bard_hymn_rally", name: "Rallying Echo", rarity: "epic", description: "Battle Hymn pulses damage whenever an ally uses an ability.", synergy: "Multiplayer burst windows." },
    { id: "bard_hymn_cap", name: "Anthem Of Chaos", rarity: "legendary", description: "Battle Hymn lasts longer and gives Power Chord extra scaling.", synergy: "Song-stacking payoff." },
  ]),
  ...buildTalentPath("bard", "Healing Verse", 2, [
    { id: "bard_heal_power", name: "Warm Notes", rarity: "common", description: "Healing Ballad heals more.", synergy: "Core sustain." },
    { id: "bard_heal_duration", name: "Lingering Melody", rarity: "common", description: "Healing Ballad lasts longer.", synergy: "Longer safe zone." },
    { id: "bard_heal_armor", name: "Shared Breath", rarity: "rare", description: "Healing Ballad also grants minor armor.", synergy: "Team survival." },
    { id: "bard_heal_cleanse", name: "Cleansing Note", rarity: "rare", description: "Healing Ballad removes one negative effect.", synergy: "Useful against Taco, Shake, and Sushi." },
    { id: "bard_heal_reprise", name: "Gentle Reprise", rarity: "rare", description: "Leaving Healing Ballad grants a small delayed heal.", synergy: "Mobile fight sustain." },
    { id: "bard_heal_rescue", name: "Rescue Verse", rarity: "epic", description: "Dropping low HP auto-plays a short Healing Ballad once per fight.", synergy: "Clutch safety." },
    { id: "bard_heal_sanctuary", name: "Sanctuary Song", rarity: "epic", description: "Projectiles passing through Healing Ballad slow down.", synergy: "Defensive support field." },
    { id: "bard_heal_cap", name: "Encore Recovery", rarity: "legendary", description: "Once per fight at low HP, automatically play a short Healing Ballad.", synergy: "Recovery capstone." },
  ]),
];

const talentById = new Map(talentDefinitions.map((talent) => [talent.id, talent]));

const stands = [
  { x: 165, y: 270, type: "weapon", id: "ironBlade" },
  { x: 285, y: 270, type: "weapon", id: "emberBow" },
  { x: 405, y: 270, type: "weapon", id: "pulseStaff" },
  { x: 525, y: 270, type: "weapon", id: "shadowDaggers" },
  { x: 585, y: 395, type: "weapon", id: "dawnHammer" },
  { x: 105, y: 395, type: "weapon", id: "oakLute" },
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
const bardSprite = new Image();
let cleanedBardSprite = null;
bardSprite.src = "./assets/bard-spritesheet.png";
bardSprite.addEventListener("load", () => {
  cleanedBardSprite = createTransparentSprite(bardSprite);
});
const curlyFriesSprite = new Image();
let cleanedCurlyFriesSprite = null;
curlyFriesSprite.src = "./assets/curly-fries-spritesheet.png";
curlyFriesSprite.addEventListener("load", () => {
  cleanedCurlyFriesSprite = createTransparentSprite(curlyFriesSprite);
});

const generatedClassArtKeys = ["warrior", "ranger", "mage", "rogue", "paladin", "bard"];
const generatedBossArtKeys = [
  "burger",
  "cola",
  "fries",
  "sauce",
  "shake",
  "nacho",
  "pizza",
  "taco",
  "donut",
  "sushi",
  "ketchup",
  "mustard",
  "mayo",
];
const generatedProjectileArtKeys = [
  "arrow",
  "magic-bolt",
  "fireball",
  "bard-note",
  "sword-wave",
  "dagger",
  "holy-smite",
  "fry",
  "cola-bubble",
  "pizza-slice",
  "peanut",
  "sauce-blob",
  "mustard-seed",
  "cherry-shot",
  "nacho-chip",
  "taco-shard",
  "cheese-bolt",
  "sprinkle",
  "burger-tomato-slice",
  "burger-pickle-splash",
  "burger-onion-ring",
  "sushi-roll",
];
const generatedHazardArtKeys = [
  "grease",
  "puddle",
  "glaze-ring",
  "warning-circle",
  "beam",
  "wasabi-wave",
  "slam",
  "cola-straw-snipe",
  "cola-fizz-burst",
  "cola-soda-drop",
  "cola-soda-puddle",
  "burger-pickle-puddle",
  "burger-sauce-drop",
  "burger-sauce-burst",
  "burger-charge-lane",
  "burger-burst-ring",
  "wasabi-splatter",
  "soy-wave",
  "chopstick-slash",
];
const generatedBossAbilityIcons = {
  burger: ["tomato", "pickle", "onion", "sauce", "charge", "burst"],
  cola: ["bubbles", "straw", "spill", "fizz"],
  sushi: ["wasabi-dash", "chopstick-jab", "roll-barrage", "soy-sake-wave"],
};
const generatedAbilityIconSlugs = {
  melee: ["shield-bash", "groundbreaker", "whirlwind-dash", "shield-wall"],
  ranger: ["marked-shot", "arrow-storm", "tumble-shot", "volley-trap"],
  mage: ["fire-blast", "meteor-field", "blink-step", "time-warp"],
  rogue: ["backstab", "poison-cloud", "shadow-step", "smoke-bomb"],
  paladin: ["radiant-smite", "consecration", "aegis-step", "divine-bulwark"],
  bard: ["power-chord", "battle-hymn", "quickstep-verse", "healing-ballad"],
};
const generatedArtImages = new Map();

function registerGeneratedArt(id, src) {
  const image = new Image();
  image.src = src;
  generatedArtImages.set(id, image);
  return image;
}

function preloadGeneratedArtAssets() {
  generatedClassArtKeys.forEach((key) => registerGeneratedArt(`classes.${key}`, `./assets/generated/classes/${key}-spritesheet.svg`));
  generatedBossArtKeys.forEach((key) => registerGeneratedArt(`bosses.${key}`, `./assets/generated/bosses/${key}-spritesheet.svg`));
  registerGeneratedArt("bosses.burgerDeluxe", "./assets/generated/bosses/burger-deluxe-spritesheet.svg");
  registerGeneratedArt("bosses.colaDeluxe", "./assets/generated/bosses/cola-deluxe-spritesheet.svg");
  registerGeneratedArt("bosses.sushiDeluxe", "./assets/generated/bosses/sushi-deluxe-spritesheet.svg");
  registerGeneratedArt("bosses.sushiSegment", "./assets/generated/bosses/sushi-segment.svg");
  registerGeneratedArt("bosses.sushiWeakSegment", "./assets/generated/bosses/sushi-weak-segment.svg");
  registerGeneratedArt("bosses.sushiTail", "./assets/generated/bosses/sushi-tail.svg");
  registerGeneratedArt("hazards.soySakeWavePaint", "./assets/generated/vfx/soy-sake-wave.png");
  registerGeneratedArt("hazards.soySakeWaveStrip", "./assets/generated/vfx/soy-sake-wave-strip.png");
  generatedProjectileArtKeys.forEach((key) => registerGeneratedArt(`projectiles.${key}`, `./assets/generated/projectiles/${key}.svg`));
  generatedHazardArtKeys.forEach((key) => registerGeneratedArt(`hazards.${key}`, `./assets/generated/hazards/${key}.svg`));
  Object.entries(generatedAbilityIconSlugs).forEach(([classKey, slugs]) => {
    slugs.forEach((slug, index) => registerGeneratedArt(`abilities.${classKey}.${index}`, `./assets/generated/icons/abilities/${classKey}-${index}-${slug}.svg`));
  });
  Object.entries(generatedBossAbilityIcons).forEach(([bossKey, slugs]) => {
    slugs.forEach((slug) => registerGeneratedArt(`bossAbilities.${bossKey}.${slug}`, `./assets/generated/icons/boss-abilities/${bossKey}-${slug}.svg`));
  });
  generatedClassArtKeys.forEach((key) => registerGeneratedArt(`icons.classes.${key}`, `./assets/generated/icons/classes/${key}.svg`));
  registerGeneratedArt("ui.buttonPrimary", "./assets/generated/ui/button-primary.svg");
  registerGeneratedArt("ui.buttonSecondary", "./assets/generated/ui/button-secondary.svg");
  registerGeneratedArt("ui.abilitySlotGold", "./assets/generated/ui/ability-slot-gold.svg");
  registerGeneratedArt("ui.abilitySlotBlue", "./assets/generated/ui/ability-slot-blue.svg");
  registerGeneratedArt("ui.abilityKeycapGold", "./assets/generated/ui/ability-keycap-gold.svg");
  registerGeneratedArt("ui.abilityKeycapBlue", "./assets/generated/ui/ability-keycap-blue.svg");
  registerGeneratedArt("ui.abilityIconRingGold", "./assets/generated/ui/ability-icon-ring-gold.svg");
  registerGeneratedArt("ui.abilityIconRingPurple", "./assets/generated/ui/ability-icon-ring-purple.svg");
  registerGeneratedArt("ui.abilityIconRingBlue", "./assets/generated/ui/ability-icon-ring-blue.svg");
  registerGeneratedArt("ui.cooldownClockShade", "./assets/generated/ui/cooldown-clock-shade.svg");
  registerGeneratedArt("ui.potion", "./assets/generated/ui/potion.svg");
}

function generatedArtImage(id) {
  return generatedArtImages.get(id) || null;
}

function isImageReady(image) {
  return !!(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

function drawGeneratedImage(id, x, y, w, h, options = {}) {
  const image = generatedArtImage(id);
  if (!isImageReady(image)) return false;
  const { centered = true, alpha = 1, rotation = 0, shadowColor = "", shadowBlur = 0 } = options;
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation);
  ctx.globalAlpha *= alpha;
  if (shadowColor && shadowBlur > 0) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
  }
  ctx.drawImage(image, centered ? -w / 2 : 0, centered ? -h / 2 : 0, w, h);
  ctx.restore();
  return true;
}

function drawGeneratedSpriteFrame(id, row, col, x, y, w, h, options = {}) {
  const image = generatedArtImage(id);
  if (!isImageReady(image)) return false;
  const { centered = true, alpha = 1, shadowColor = "", shadowBlur = 0, cols = 4, rows = 4, rotation = 0 } = options;
  const safeCols = Math.max(1, cols);
  const safeRows = Math.max(1, rows);
  const safeCol = ((col % safeCols) + safeCols) % safeCols;
  const safeRow = clamp(row, 0, safeRows - 1);
  const frameW = image.naturalWidth / safeCols;
  const frameH = image.naturalHeight / safeRows;
  ctx.save();
  if (rotation) {
    ctx.translate(x, y);
    ctx.rotate(rotation);
  }
  ctx.globalAlpha *= alpha;
  if (shadowColor && shadowBlur > 0) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
  }
  ctx.drawImage(
    image,
    safeCol * frameW,
    safeRow * frameH,
    frameW,
    frameH,
    rotation ? centered ? -w / 2 : 0 : centered ? x - w / 2 : x,
    rotation ? centered ? -h / 2 : 0 : centered ? y - h / 2 : y,
    w,
    h,
  );
  ctx.restore();
  return true;
}

function generatedClassArtKeyForWeapon(weaponId) {
  if (weaponId === "emberBow") return "ranger";
  if (weaponId === "pulseStaff") return "mage";
  if (weaponId === "shadowDaggers") return "rogue";
  if (weaponId === "dawnHammer") return "paladin";
  if (weaponId === "oakLute") return "bard";
  return "warrior";
}

preloadGeneratedArtAssets();

let player = createPlayer();
let boss = createBoss("cola");
let trainingDummy = createTrainingDummy();
let condimentBosses = [];
let mazeState = null;
let hazards = [];
let playerProjectiles = [];
let remoteProjectiles = [];
let abilityEffects = [];
let remoteAbilityEffects = [];
let particles = [];
let camera = { x: 0, y: 0 };
let mouseWorld = { x: 300, y: 685 };
let mouseCanvas = { x: 0, y: 0, inside: false };
let abilityHudSlots = [];
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
let lastRuntimeErrorAt = 0;
let spectateState = { targetId: null };
let logLines = ["Choose gear, use WASD to cross the gate, hold click to attack."];
let classSelectorSignature = "";
let armorSelectorSignature = "";
let bossSelectorSignature = "";
let talentTreeSignature = "";
let selectedTalentId = "";
let lastCanvasPointerAttackAt = 0;
let primaryAttackHeld = false;
let primaryAttackPointerId = null;
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
  lastPartyPhaseEvent: null,
  localPartyReady: null,
  partyReady: new Map(),
  gauntletSyncSeq: 0,
  lastGauntletSyncSeq: 0,
  lastGauntletSyncPhaseSeq: 0,
  gauntletSyncTimer: 0,
  lastGauntletSyncAt: 0,
  gauntletPhaseStartedAt: 0,
  staleGauntletReportAt: 0,
  sendTimer: 0,
  reconnectTimer: 0,
  reconnectDelay: 3,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
  attackSeq: 0,
  intentSeq: 0,
  bossSyncSeq: 0,
  hazardSyncSeq: 0,
  lastBossSyncSeq: 0,
  hostileSyncSeq: 0,
  lastHostileSyncSeq: 0,
  hostileSyncTimer: 0,
  hostileSnapCount: 0,
  lastHostileSyncAt: 0,
  hostileNetState: new Map(),
  hostileHostSendState: new Map(),
  consumedRemoteHazards: new Map(),
  lastVisualEventAt: new Map(),
  peers: new Map(),
};

const debugReportState = {
  events: [],
  lastReport: "",
  visible: false,
  messageSeq: 0,
  lastErrorAtByKey: new Map(),
};

const multiplayerStateInterval = 0.18;
const gauntletSyncInterval = 0.16;
const hostileSyncInterval = 0.095;
const hostileHazardHeavySyncInterval = 0.135;
const hostileHazardHeavyThreshold = 12;
const multiplayerWatchdogIntervalMs = 900;
const remoteGauntletEnemySmoothing = 16;
const remoteGauntletEnemySnapDistance = 260;
const remoteGauntletEnemyMaxExtrapolate = 0.18;
const hostileInterpolationDelayMs = 115;
const hostileSnapshotBufferLimit = 8;
const hostileSnapDistance = 280;
const hostileMaxExtrapolateMs = 140;
const hostileDeadKeepMs = 900;
const visualEventMinIntervalMs = {
  attack: 70,
  ability: 110,
};
const visualEventDropBufferedAmount = 180000;
const hostileSyncDropBufferedAmount = 260000;
const maxParticles = 160;
const maxRemoteProjectiles = 90;
const maxRemoteAbilityEffects = 48;
const mazeRewardInputDelayMs = 650;
const mazeEnemySteerAngles = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.45, -1.45, Math.PI * 0.72, -Math.PI * 0.72];
const mazeEnemyWaypointRefreshMs = 360;

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
  const startingMaxHp = playerBaseMaxHpForArmor("duelistCoat");
  return {
    x: 300,
    y: 685,
    radius: 18,
    destination: null,
    hp: startingMaxHp,
    maxHp: startingMaxHp,
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
    bardChordCount: 0,
    bardHealTickTimer: 0,
    smokeSpeedGranted: false,
    tumbleTimer: 0,
    invulnerableTimer: 0,
    shieldWallTimer: 0,
    consecrationTimer: 0,
    guardSpeedTimer: 0,
    tacoGreaseTimer: 0,
    pickleSlowTimer: 0,
    gateCooldown: 0,
    room: "starter",
    dead: false,
    won: false,
    freezeTimer: 0,
    lastDamageAt: 0,
    chillStacks: 0,
    chillTimer: 0,
    recentlyHitProjectileIds: new Set(),
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
      radius: 70,
      maxHp: 880,
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
    totalPhases: kind === "donut" ? 6 : kind === "burger" ? 2 : kind === "shake" || kind === "nacho" || kind === "pizza" || kind === "taco" || kind === "sushi" ? 3 : 1,
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
    sushiAnimationState: "idle",
    sushiAnimationTimer: 0,
    sushiLastAbility: "",
    sushiDashTrailTimer: 0,
    sushiWeakFlashTimer: 0,
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
  selectedTalentId = "";
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
  const requiredParents = talent.parents || [];
  const optionalParents = talent.parentsAny || [];
  return requiredParents.every((parentId) => hasTalent(parentId))
    && (!optionalParents.length || optionalParents.some((parentId) => hasTalent(parentId)));
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

function runTalentHook(hook, payload = {}) {
  if (payload.options?.talentHook) return;
  if (hook === "onAbilityCast") {
    if (hasTalent("mage_chrono_borrowed_time") && playerInTimeWarp()) reduceLongestAbilityCooldown(0.65, payload.index);
    if (hasTalent("bard_hymn_haste") && player.bardSongs?.some((song) => song.type === "battle")) reduceLongestAbilityCooldown(0.35, payload.index);
  }
  if (hook === "onBasicHit") {
    if (hasTalent("ranger_deadeye_refund") && payload.target?.markedTimer > 0) {
      player.abilityCooldowns[0] = Math.max(0, player.abilityCooldowns[0] - 0.18);
    }
    if (hasTalent("warrior_earth_stonefist") && currentClassKey() === "melee" && Math.random() < 0.08) {
      damageEnemiesInRadius(payload.target.x, payload.target.y, 52, playerDamage(0.18), "Stonefist", [], { talentHook: true });
    }
  }
  if (hook === "onProjectileDestroyed") {
    if (hasTalent("warrior_vanguard_counterquake") && payload.cleared > 0) {
      damageEnemiesInRadius(payload.x, payload.y, 72, playerDamage(0.28), "Counterquake", [], { talentHook: true });
    }
    if (hasTalent("paladin_guard_anchor") && payload.cleared > 0) {
      player.hp = Math.min(player.maxHp, player.hp + Math.min(8, payload.cleared * 2));
    }
  }
  if (hook === "onEnemyDeath") {
    const target = payload.target;
    if (!target) return;
    if (hasTalent("rogue_venom_volatile") && target.poisonStacks > 0) {
      damageEnemiesInRadius(target.x, target.y, 76, playerDamage(0.34), "Volatile Toxin", [], { talentHook: true, poison: true });
    }
    if (hasTalent("mage_pyro_chain_ignite") && target.burnTimer > 0) {
      livingBosses().forEach((nearby) => {
        if (nearby !== target && distance(target, nearby) < 150 + nearby.radius) applyBurn(nearby);
      });
    }
    if (hasTalent("ranger_deadeye_detonation") && target.markedTimer > 0) {
      damageEnemiesInRadius(target.x, target.y, 82, playerDamage(0.4), "Marked Detonation", [], { talentHook: true });
    }
  }
  if (hook === "onDamageTaken") {
    if (hasTalent("paladin_guard_vow") && payload.hit > 0) player.shieldWallTimer = Math.max(player.shieldWallTimer, 0.45);
    if (hasTalent("rogue_smoke_vanishing_act") && payload.hit > 0 && player.hp <= player.maxHp * 0.35) {
      player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.35);
    }
  }
}

function reduceLongestAbilityCooldown(amount, excludeIndex = -1) {
  let longestIndex = -1;
  let longestCooldown = 0;
  player.abilityCooldowns.forEach((cooldown, index) => {
    if (index === excludeIndex) return;
    if (cooldown > longestCooldown) {
      longestCooldown = cooldown;
      longestIndex = index;
    }
  });
  if (longestIndex >= 0) player.abilityCooldowns[longestIndex] = Math.max(0, player.abilityCooldowns[longestIndex] - amount);
}

function destroyProjectilesInRadius(x, y, radius) {
  let cleared = 0;
  const hazardIds = [];
  hazards = hazards.filter((hazard) => {
    if (!hazard.r || hazard.r > 14 || !Number.isFinite(hazard.ttl)) return true;
    if (distance({ x, y }, hazard) > radius + hazard.r) return true;
    cleared += 1;
    const syncId = sharedHazardSyncId(hazard);
    if (syncId) hazardIds.push(syncId);
    particles.push({ x: hazard.x, y: hazard.y - 10, text: "cleared", color: "#fff4c4", ttl: 0.45 });
    return false;
  });
  if (hazardIds.length) sendHazardControlIntent("destroy", hazardIds, { x, y, radius });
  if (cleared > 0) runTalentHook("onProjectileDestroyed", { cleared, x, y, radius });
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
  player.maxHp = playerBaseMaxHpForArmor(player.gear.armor) + talentMaxHpBonus() + (runState.mazeBuffs.maxHp || 0);
  player.hp = Math.min(player.maxHp, Math.max(1, Math.round(player.maxHp * hpPercent)));
}

function playerBaseMaxHpForArmor(armorId) {
  const mageBaseHp = gear.armor.channelerRobe.maxHp * playerBaseHealthMultiplier;
  return mageBaseHp + (playerArmorHealthOffsets[armorId] || 0);
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
  remoteAbilityEffects = [];
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
  remoteAbilityEffects = [];
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
  player.pickleSlowTimer = 0;
  player.backstabTimer = 0;
  player.deadeyeTimer = 0;
  player.bardChordCount = 0;
  player.bardHealTickTimer = 0;
  player.talentSaves = {};
  player.lastDamageAt = 0;
  resetSpectateState();
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
  recordDebugEvent("gauntlet-start", { kind, fromParty: Boolean(options.fromParty), sequence: options.sequence || runState.mazeCount + 1, phaseSeq: multiplayer.phaseSeq });
  lockBuildForRun();
  clearEncounterState();
  if (Number.isFinite(options.sequence)) runState.mazeCount = options.sequence;
  else runState.mazeCount += 1;
  mazeState = generateMazeForBoss(kind, runState.mazeCount);
  ensureGauntletRuntimeState();
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
  recordDebugEvent("arena-enter", { fromParty: Boolean(options.fromParty), bossKind: boss.kind, phaseSeq: multiplayer.phaseSeq });
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
  multiplayer.intentSeq = 0;
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

function debugSafeClone(value, depth = 0, seen = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return Number.isFinite(value) || typeof value !== "number" ? value : String(value);
  }
  if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol") return undefined;
  if (depth > 4) return "[depth-limit]";
  if (value instanceof Error) return debugErrorInfo(value);
  if (value instanceof Set) return Array.from(value).slice(0, 24).map((item) => debugSafeClone(item, depth + 1, seen));
  if (value instanceof Map) {
    return Array.from(value.entries()).slice(0, 24).map(([key, item]) => [String(key), debugSafeClone(item, depth + 1, seen)]);
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "[circular]";
    seen.add(value);
    if (Array.isArray(value)) return value.slice(0, 80).map((item) => debugSafeClone(item, depth + 1, seen));
    const output = {};
    Object.entries(value).slice(0, 80).forEach(([key, item]) => {
      const cloned = debugSafeClone(item, depth + 1, seen);
      if (typeof cloned !== "undefined") output[key] = cloned;
    });
    return output;
  }
  return String(value);
}

function debugErrorInfo(error) {
  const source = error?.reason || error?.error || error;
  if (source instanceof Error) {
    return {
      name: source.name || "Error",
      message: source.message || "",
      stack: source.stack || "",
    };
  }
  return {
    name: typeof source,
    message: String(source),
    stack: "",
  };
}

function recordDebugEvent(label, data = {}) {
  try {
    debugReportState.events.push({
      at: new Date().toISOString(),
      label,
      data: debugSafeClone(data),
    });
    debugReportState.events = debugReportState.events.slice(-80);
  } catch {
    // Debug logging must never become the reason the game loop stops.
  }
}

function debugStateSnapshot(context = {}) {
  const mazeWaves = Array.isArray(mazeState?.waves) ? mazeState.waves : [];
  const mazeEnemies = Array.isArray(mazeState?.enemies) ? mazeState.enemies : [];
  const mazePickups = Array.isArray(mazeState?.pickupDrops) ? mazeState.pickupDrops : [];
  const waves = mazeWaves.map((wave) => ({
    index: wave?.index,
    spawned: Boolean(wave?.spawned),
    cleared: Boolean(wave?.cleared),
    enemies: wave?.enemies?.length || 0,
  }));
  const enemies = mazeEnemies.slice(0, 20).map((enemy) => ({
    id: enemy.id || "",
    hp: Number.isFinite(enemy.hp) ? Math.round(enemy.hp) : null,
    maxHp: Number.isFinite(enemy.maxHp) ? Math.round(enemy.maxHp) : null,
    miniBoss: Boolean(enemy.miniBoss),
    x: Number.isFinite(enemy.x) ? Math.round(enemy.x) : null,
    y: Number.isFinite(enemy.y) ? Math.round(enemy.y) : null,
  })) || [];
  const peers = [];
  multiplayer.peers.forEach((peer, id) => {
    peers.push({
      id,
      room: peer.room,
      dead: Boolean(peer.dead),
      bossKind: peer.bossKind,
      partyPhase: peer.partyPhase,
      phaseSeq: peer.phaseSeq,
      x: Number.isFinite(peer.x) ? Math.round(peer.x) : null,
      y: Number.isFinite(peer.y) ? Math.round(peer.y) : null,
      ageMs: Number.isFinite(peer.updatedAt) ? Date.now() - peer.updatedAt : null,
    });
  });
  return {
    context: debugSafeClone(context),
    url: location.href,
    time: new Date().toISOString(),
    localId: multiplayer.id,
    hostId: multiplayer.room?.hostId || null,
    isHost: isMultiplayerHost(),
    connected: multiplayer.connected,
    connectedCount: multiplayer.room?.players?.length || multiplayer.count,
    roomState: multiplayer.room?.state || null,
    player: {
      room: player.room,
      dead: Boolean(player.dead),
      won: Boolean(player.won),
      hp: Math.ceil(player.hp),
      maxHp: player.maxHp,
      x: Math.round(player.x),
      y: Math.round(player.y),
    },
    boss: {
      kind: boss.kind,
      name: boss.name,
      hp: Number.isFinite(boss.hp) ? Math.round(boss.hp) : null,
      phase: boss.phase || 1,
    },
    party: {
      phase: multiplayer.partyPhase,
      phaseSeq: multiplayer.phaseSeq,
      localReady: debugSafeClone(multiplayer.localPartyReady),
      lastPartyPhaseEvent: debugSafeClone(multiplayer.lastPartyPhaseEvent),
    },
    gauntlet: mazeState ? {
      kind: mazeState.kind,
      sequence: mazeState.sequence,
      waveIndex: mazeState.waveIndex,
      waveTimer: Number.isFinite(mazeState.waveTimer) ? Number(mazeState.waveTimer.toFixed(3)) : null,
      miniBossSpawned: Boolean(mazeState.miniBossSpawned),
      rewardPending: Boolean(mazeState.rewardPending),
      rewardChosen: Boolean(mazeState.rewardChosen),
      exitOpen: Boolean(mazeState.exitOpen),
      cleared: Boolean(mazeState.cleared),
      waves,
      enemies,
      enemyCount: mazeEnemies.length,
      pickupCount: mazePickups.length,
      mazeHazardCount: hazards.filter((hazard) => hazard.mazeHazard).length,
      lastSyncAgeMs: multiplayer.lastGauntletSyncAt ? Date.now() - multiplayer.lastGauntletSyncAt : null,
      lastSyncSeq: multiplayer.lastGauntletSyncSeq,
      lastSyncPhaseSeq: multiplayer.lastGauntletSyncPhaseSeq,
      sendSeq: multiplayer.gauntletSyncSeq,
    } : null,
    peers,
  };
}

function buildDebugReport(error, context = {}) {
  const sections = {
    error: debugErrorInfo(error),
    state: debugStateSnapshot(context),
    recentEvents: debugReportState.events.slice(-80),
  };
  return [
    "Boss Fight Debug Report",
    "Paste this whole block to Codex.",
    "",
    JSON.stringify(sections, null, 2),
  ].join("\n");
}

function showDebugReport(error, context = {}) {
  try {
    const errorInfo = debugErrorInfo(error);
    recordDebugEvent("debug-report", { area: context.area || "unknown", message: errorInfo.message });
    const report = buildDebugReport(error, context);
    debugReportState.lastReport = report;
    debugReportState.visible = true;
    if (ui.debugReportText) ui.debugReportText.value = report;
    if (ui.debugReportOverlay) ui.debugReportOverlay.hidden = false;
    if (ui.debugReportCopy) ui.debugReportCopy.textContent = "Copy Report";
    if (ui.status) ui.status.textContent = "Debug report captured. Copy it and paste it to Codex.";
  } catch (reportError) {
    console.error("Failed to build debug report.", reportError);
  }
}

function reportRuntimeError(error, context = {}) {
  const errorInfo = debugErrorInfo(error);
  const area = context.area || "unknown";
  const key = `${area}:${errorInfo.message}`.slice(0, 180);
  const now = performance.now();
  const lastAt = debugReportState.lastErrorAtByKey.get(key) || 0;
  if (lastAt && now - lastAt < 1500) return;
  debugReportState.lastErrorAtByKey.set(key, now);
  recordDebugEvent("runtime-error", { area, message: errorInfo.message });
  console.error("Captured runtime error.", error);
  showDebugReport(error, context);
}

function showManualDebugReport(trigger = "manual") {
  recordDebugEvent("manual-debug-capture", { trigger });
  showDebugReport(new Error("Manual debug capture"), { area: "manual-debug-capture", trigger });
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
  return false;
}

function isRemoteBossHazard(hazard) {
  return Boolean(hazard?.remoteBossHazard) && isMultiplayerGame() && !isMultiplayerHost();
}

function isRemoteSharedHazard(hazard) {
  return Boolean(hazard?.remoteBossHazard || hazard?.remoteGauntletHazard) && isMultiplayerGame() && !isMultiplayerHost();
}

function isPartySyncActive() {
  return isMultiplayerGame() && runState.mode === "multiplayer";
}

function resetSpectateState() {
  spectateState.targetId = null;
}

function spectatePeerLabel(id) {
  return id ? id.slice(0, 4).toUpperCase() : "PLAYER";
}

function spectatablePeerEntries() {
  if (!isPartySyncActive() || !player.dead) return [];
  const entries = Array.from(multiplayer.peers.entries()).filter(([, peer]) => (
    peer &&
    !peer.dead &&
    !peer.won &&
    peer.bossKind === boss.kind &&
    Number.isFinite(peer.x) &&
    Number.isFinite(peer.y)
  ));
  const samePhase = entries.filter(([, peer]) => !peer.partyPhase || peer.partyPhase === multiplayer.partyPhase);
  const phasePool = samePhase.length ? samePhase : entries;
  const sameRoom = phasePool.filter(([, peer]) => peer.room === player.room);
  return sameRoom.length ? sameRoom : phasePool;
}

function currentSpectateTarget() {
  const entries = spectatablePeerEntries();
  if (!entries.length) {
    resetSpectateState();
    return null;
  }
  let entry = entries.find(([id]) => id === spectateState.targetId);
  if (!entry) {
    entry = entries[0];
    spectateState.targetId = entry[0];
  }
  return { id: entry[0], peer: entry[1] };
}

function isMultiplayerSpectating() {
  return Boolean(currentSpectateTarget());
}

function cycleSpectateTarget(direction = 1) {
  const entries = spectatablePeerEntries();
  if (!entries.length) {
    resetSpectateState();
    showFloat("No teammate to spectate");
    return false;
  }
  const currentIndex = entries.findIndex(([id]) => id === spectateState.targetId);
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + entries.length) % entries.length;
  spectateState.targetId = entries[nextIndex][0];
  showFloat(`Spectating ${spectatePeerLabel(spectateState.targetId)}`);
  return true;
}

function activateSpectateMode(source) {
  if (!isPartySyncActive()) return false;
  const activated = cycleSpectateTarget(1);
  if (!activated) return false;
  if (ui.mazeRewardOverlay) ui.mazeRewardOverlay.hidden = true;
  ui.status.textContent = `${source} stuffed you. Spectating ${spectatePeerLabel(spectateState.targetId)}.`;
  recordDebugEvent("spectate-start", { targetId: spectateState.targetId, source, phase: multiplayer.partyPhase, room: player.room });
  return true;
}

function spectateCameraPoint() {
  const target = currentSpectateTarget();
  if (!target) return player;
  const renderPeer = smoothedPeer(target.peer);
  if (!Number.isFinite(renderPeer.x) || !Number.isFinite(renderPeer.y)) return target.peer;
  return renderPeer;
}

function resetPartySyncState() {
  multiplayer.partyPhase = "starter";
  multiplayer.phaseSeq = 0;
  multiplayer.lastPartyPhaseEvent = null;
  multiplayer.localPartyReady = null;
  multiplayer.partyReady.clear();
  resetSpectateState();
  resetGauntletSyncState();
  resetHostileNetState();
}

function resetGauntletSyncState(options = {}) {
  multiplayer.gauntletSyncSeq = 0;
  multiplayer.lastGauntletSyncSeq = 0;
  multiplayer.lastGauntletSyncPhaseSeq = Number.isFinite(options.phaseSeq) ? options.phaseSeq : multiplayer.phaseSeq;
  multiplayer.gauntletSyncTimer = 0;
  multiplayer.gauntletPhaseStartedAt = options.primeWatchdog ? Date.now() : 0;
  multiplayer.lastGauntletSyncAt = options.primeWatchdog ? multiplayer.gauntletPhaseStartedAt : 0;
  multiplayer.staleGauntletReportAt = 0;
}

function resetHostileNetState() {
  multiplayer.hostileSyncSeq = 0;
  multiplayer.lastHostileSyncSeq = 0;
  multiplayer.hostileSyncTimer = 0;
  multiplayer.hostileSnapCount = 0;
  multiplayer.lastHostileSyncAt = 0;
  multiplayer.hostileNetState.clear();
  multiplayer.hostileHostSendState.clear();
  multiplayer.consumedRemoteHazards.clear();
}

function localPartyReadyMatches(phase) {
  return multiplayer.localPartyReady?.phase === phase && multiplayer.localPartyReady?.phaseSeq === multiplayer.phaseSeq;
}

function markPartyReady(phase) {
  if (!isPartySyncActive()) return false;
  if (phase !== multiplayer.partyPhase) {
    recordDebugEvent("party-ready-wrong-phase", { requestedPhase: phase, currentPhase: multiplayer.partyPhase, phaseSeq: multiplayer.phaseSeq });
    ui.status.textContent = `Waiting for party phase: ${multiplayer.partyPhase}.`;
    showFloat("Waiting for party");
    return true;
  }
  if (localPartyReadyMatches(phase)) {
    showFloat("Waiting for party");
    return true;
  }
  recordDebugEvent("party-ready-attempt", { requestedPhase: phase, currentPhase: multiplayer.partyPhase, phaseSeq: multiplayer.phaseSeq });
  multiplayer.localPartyReady = { phase, phaseSeq: multiplayer.phaseSeq };
  sendMultiplayerEvent({
    kind: "party-ready",
    phase,
    bossKind: boss.kind,
    phaseSeq: multiplayer.phaseSeq,
  });
  recordDebugEvent("party-ready-sent", { phase, phaseSeq: multiplayer.phaseSeq, bossKind: boss.kind });
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
  recordDebugEvent("party-ready-received", { peerId, phase: event.phase, phaseSeq: event.phaseSeq });
  maybeAdvancePartyPhase();
}

function maybeAdvancePartyPhase() {
  if (!isMultiplayerHost() || !isPartySyncActive()) return;
  if (multiplayer.partyPhase === "starter" && allPartyPlayersReady("starter")) {
    recordDebugEvent("party-advance-gauntlet", { phaseSeq: multiplayer.phaseSeq, players: partyPlayerIds() });
    broadcastPartyPhase("gauntlet", {
      bossKind: boss.kind,
      mazeSequence: runState.mazeCount + 1,
    });
    return;
  }
  if (multiplayer.partyPhase === "reward" && allPartyPlayersReady("reward")) {
    recordDebugEvent("party-advance-arena", { phaseSeq: multiplayer.phaseSeq, players: partyPlayerIds() });
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
  multiplayer.lastPartyPhaseEvent = cloneSyncObject(event);
  recordDebugEvent("party-phase-broadcast", { phase, phaseSeq: event.phaseSeq, bossKind: event.bossKind, mazeSequence: event.mazeSequence });
  sendMultiplayerEvent(event);
  if (options.applyLocal === false) {
    multiplayer.partyPhase = phase;
    multiplayer.localPartyReady = null;
    multiplayer.partyReady.clear();
    resetGauntletSyncState({ phaseSeq: event.phaseSeq });
    resetHostileNetState();
  } else {
    applyPartyPhase(event, true);
  }
}

function applyPartyPhase(event, local = false, options = {}) {
  try {
    return applyPartyPhaseInner(event, local, options);
  } catch (error) {
    reportRuntimeError(error, { area: "applyPartyPhase", event, local, options });
    return undefined;
  }
}

function applyPartyPhaseInner(event, local = false, options = {}) {
  if (!event || event.bossKind && lockedBosses.has(event.bossKind)) return;
  if (!local && !options.force && Number.isFinite(event.phaseSeq) && event.phaseSeq <= multiplayer.phaseSeq) return;
  if (Number.isFinite(event.phaseSeq)) multiplayer.phaseSeq = event.phaseSeq;
  multiplayer.partyPhase = event.phase || multiplayer.partyPhase;
  multiplayer.localPartyReady = null;
  multiplayer.partyReady.clear();
  resetGauntletSyncState({
    phaseSeq: event.phaseSeq,
    primeWatchdog: !isMultiplayerHost() && event.phase === "gauntlet",
  });
  resetHostileNetState();
  const phaseBossKind = event.bossKind || boss.kind;
  recordDebugEvent("party-phase-apply", {
    phase: event.phase,
    phaseSeq: event.phaseSeq,
    bossKind: phaseBossKind,
    local,
    force: Boolean(options.force),
    mazeSequence: event.mazeSequence,
  });
  if (event.spawns?.length) {
    const spawn = event.spawns.find((item) => item.id === multiplayer.id);
    multiplayer.assignedSpawn = spawn && Number.isFinite(spawn.x) && Number.isFinite(spawn.y) ? { x: spawn.x, y: spawn.y } : multiplayer.assignedSpawn;
  }
  if (event.phase === "gauntlet") {
    const targetSequence = Number.isFinite(event.mazeSequence) ? event.mazeSequence : runState.mazeCount + 1;
    if (player.room === "maze" && mazeState?.kind === phaseBossKind && mazeState.sequence === targetSequence) {
      recordDebugEvent("party-phase-gauntlet-duplicate", { phaseSeq: event.phaseSeq, mazeSequence: targetSequence });
      return;
    }
    if (boss.kind !== phaseBossKind) loadBoss(phaseBossKind);
    startMazeForBoss(phaseBossKind, { fromParty: true, sequence: targetSequence });
    ensureGauntletRuntimeState();
    return;
  }
  if (event.phase === "reward") {
    if (!mazeState || mazeState.kind !== phaseBossKind) startMazeForBoss(phaseBossKind, { fromParty: true, sequence: event.mazeSequence || runState.mazeCount || 1 });
    if (!mazeState) return;
    ensureGauntletRuntimeState();
    mazeState.cleared = true;
    mazeState.rewardPending = !mazeState.rewardChosen;
    mazeState.exitOpen = false;
    selectedBoss = null;
    playerProjectiles = [];
    hazards = hazards.filter((hazard) => !hazard.mazeHazard);
    if (!mazeState.rewardChosen && !player.dead) showMazeRewardChoices();
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

function partyPhaseNeedsRecovery(event) {
  if (!event) return false;
  const phaseBossKind = event.bossKind || boss.kind;
  if (boss.kind !== phaseBossKind) return true;
  if (event.phase === "gauntlet") {
    return player.room !== "maze"
      || !mazeState
      || mazeState.kind !== phaseBossKind
      || (Number.isFinite(event.mazeSequence) && mazeState.sequence !== event.mazeSequence);
  }
  if (event.phase === "reward") {
    return player.room !== "maze"
      || !mazeState
      || mazeState.kind !== phaseBossKind
      || (!mazeState.rewardPending && !mazeState.rewardChosen);
  }
  if (event.phase === "arena") return player.room !== "arena";
  return false;
}

function applyHostPartyPhaseSnapshot(state, peerId) {
  if (!isPartySyncActive() || isMultiplayerHost() || !isHostPeer(peerId) || !state) return;
  const event = state.partyPhaseEvent;
  if (event?.kind === "party-phase" && Number.isFinite(event.phaseSeq)) {
    const newer = event.phaseSeq > multiplayer.phaseSeq;
    const sameSeqRecovery = event.phaseSeq === multiplayer.phaseSeq && partyPhaseNeedsRecovery(event);
    if (newer || sameSeqRecovery) {
      recordDebugEvent("party-phase-snapshot-apply", { peerId, phase: event.phase, phaseSeq: event.phaseSeq, recovery: sameSeqRecovery });
      applyPartyPhase(event, false, { force: sameSeqRecovery });
    }
    return;
  }
  if (!state.partyPhase || !Number.isFinite(state.phaseSeq) || state.phaseSeq <= multiplayer.phaseSeq) return;
  applyPartyPhase({
    kind: "party-phase",
    phase: state.partyPhase,
    bossKind: state.bossKind || boss.kind,
    phaseSeq: state.phaseSeq,
    mazeSequence: Number.isFinite(state.mazeSequence) ? state.mazeSequence : runState.mazeCount || 1,
    spawns: state.partySpawns || [],
  });
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
  if (weaponTag === "Bard") return "bard";
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

function isBardSongEffect(effect) {
  return effect?.type === "bardBattleHymn" || effect?.type === "bardQuickstepVerse" || effect?.type === "bardHealingBallad";
}

function bardSongType(effect) {
  if (effect?.type === "bardBattleHymn") return "battle";
  if (effect?.type === "bardQuickstepVerse") return "quickstep";
  if (effect?.type === "bardHealingBallad") return "healing";
  return "";
}

function ownBardSongEffects() {
  return abilityEffects.filter((effect) => isBardSongEffect(effect) && effect.ttl > 0);
}

function activeLocalBardSongTypes() {
  return new Set(ownBardSongEffects().map((effect) => bardSongType(effect)).filter(Boolean));
}

function bardSongSnapshot() {
  return ownBardSongEffects().map((effect) => ({
    type: effect.type,
    songType: bardSongType(effect),
    room: player.room,
    x: Math.round(effect.x),
    y: Math.round(effect.y),
    r: Math.round(effect.r),
    ttl: Math.max(0, Number(effect.ttl) || 0),
    damageBuff: Number(effect.damageBuff) || 0,
    attackSpeedBuff: Number(effect.attackSpeedBuff) || 0,
    speedBuff: Number(effect.speedBuff) || 0,
    armorBonus: Number(effect.armorBonus) || 0,
    healAmount: Number(effect.healAmount) || 0,
  }));
}

function bardSongsAffectingPlayer() {
  const songs = [];
  ownBardSongEffects().forEach((effect) => {
    if (distance(player, effect) <= effect.r + player.radius) songs.push(effect);
  });
  multiplayer.peers.forEach((peer) => {
    if (peer.room !== player.room || peer.dead || peer.bossKind !== boss.kind || !Array.isArray(peer.bardSongs)) return;
    peer.bardSongs.forEach((song) => {
      if (!song || song.room !== player.room || (Number(song.ttl) || 0) <= 0) return;
      const r = Number(song.r) || 0;
      if (!Number.isFinite(song.x) || !Number.isFinite(song.y)) return;
      if (Math.hypot(song.x - player.x, song.y - player.y) <= r + player.radius) songs.push(song);
    });
  });
  return songs;
}

function strongestBardSongValue(songType, key) {
  return bardSongsAffectingPlayer().reduce((best, song) => {
    if (song.songType && song.songType !== songType) return best;
    if (!song.songType && bardSongType(song) !== songType) return best;
    return Math.max(best, Number(song[key]) || 0);
  }, 0);
}

function bardDamageBuffMultiplier() {
  return 1 + strongestBardSongValue("battle", "damageBuff");
}

function bardAttackSpeedMultiplier() {
  return clamp(1 - strongestBardSongValue("battle", "attackSpeedBuff"), 0.55, 1);
}

function bardMoveSpeedMultiplier() {
  return 1 + strongestBardSongValue("quickstep", "speedBuff");
}

function bardArmorBonus() {
  return strongestBardSongValue("healing", "armorBonus");
}

function playerDamage(multiplier = 1) {
  return Math.max(1, Math.round(player.stats.damage * bardDamageBuffMultiplier() * multiplier));
}

function effectivePlayerArmor() {
  return player.stats.armor + bardArmorBonus();
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
  if (player.dead) {
    if (isPartySyncActive()) cycleSpectateTarget(1);
    stopHeldPrimaryAttack();
    return;
  }
  if (player.won) return;
  selectedBoss = null;
  shootAt(x, y);
}

function updatePlayerFacingTowardAttackTarget(x, y) {
  const targetPoint = player.room === "starter" ? trainingDummy : { x, y };
  const dx = targetPoint.x - player.x;
  const dy = targetPoint.y - player.y;
  if (Math.hypot(dx, dy) < 6) return null;
  player.facing = getFacing(dx, dy);
  return {
    x: targetPoint.x,
    y: targetPoint.y,
    dx,
    dy,
    angle: Math.atan2(dy, dx),
  };
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
  if (mazeState?.encounterType === "gauntlet") return player.radius + gauntletPlayerObstaclePadding;
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

function ensureGauntletRuntimeState(state = mazeState) {
  if (!state) return null;
  if (!Array.isArray(state.enemies)) state.enemies = [];
  if (!Array.isArray(state.pickupDrops)) state.pickupDrops = [];
  if (!(state.claimedPickupIds instanceof Set)) {
    const claimed = Array.isArray(state.claimedPickupIds) ? state.claimedPickupIds : [];
    state.claimedPickupIds = new Set(claimed);
  }
  if (!(state.localContactTimers instanceof Map)) state.localContactTimers = new Map();
  return state;
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
  if (mazeState.encounterType === "gauntlet") return constrainToGauntlet(x, y, radius, fromX, fromY);
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

function constrainToGauntlet(x, y, radius, fromX = player.x, fromY = player.y) {
  const bounds = mazeState.bounds;
  const clamped = {
    x: clamp(x, bounds.x + radius, bounds.x + bounds.w - radius),
    y: clamp(y, bounds.y + radius, bounds.y + bounds.h - radius),
  };
  if (isGauntletCircleWalkable(clamped.x, clamped.y, radius)) return clamped;
  const resolved = resolveGauntletCircle(clamped.x, clamped.y, radius);
  if (isGauntletCircleWalkable(resolved.x, resolved.y, radius)) return resolved;
  const slide = bestGauntletPlayerSlide(fromX, fromY, clamped.x, clamped.y, radius);
  if (slide) return slide;
  if (isGauntletCircleWalkable(clamped.x, fromY, radius)) return { x: clamped.x, y: fromY };
  if (isGauntletCircleWalkable(fromX, clamped.y, radius)) return { x: fromX, y: clamped.y };
  return { x: fromX, y: fromY };
}

function resolveGauntletCircle(x, y, radius) {
  const bounds = mazeState.bounds;
  let resolved = {
    x: clamp(x, bounds.x + radius, bounds.x + bounds.w - radius),
    y: clamp(y, bounds.y + radius, bounds.y + bounds.h - radius),
  };
  for (let iteration = 0; iteration < 4; iteration += 1) {
    let moved = false;
    (mazeState.obstacles || []).forEach((obstacle) => {
      const push = gauntletObstaclePush(resolved.x, resolved.y, radius, obstacle);
      if (!push) return;
      resolved.x += push.x;
      resolved.y += push.y;
      moved = true;
    });
    resolved.x = clamp(resolved.x, bounds.x + radius, bounds.x + bounds.w - radius);
    resolved.y = clamp(resolved.y, bounds.y + radius, bounds.y + bounds.h - radius);
    if (!moved) break;
  }
  return resolved;
}

function gauntletObstaclePush(x, y, radius, obstacle) {
  const skin = 0.9;
  if (obstacle.type === "circle") {
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    const dist = Math.hypot(dx, dy);
    const minDist = radius + obstacle.r + skin;
    if (dist >= minDist) return null;
    if (dist < 0.001) return { x: minDist, y: 0 };
    return { x: (dx / dist) * (minDist - dist), y: (dy / dist) * (minDist - dist) };
  }
  const nearestX = clamp(x, obstacle.x, obstacle.x + obstacle.w);
  const nearestY = clamp(y, obstacle.y, obstacle.y + obstacle.h);
  const dx = x - nearestX;
  const dy = y - nearestY;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.001) {
    const minDist = radius + skin;
    if (dist >= minDist) return null;
    return { x: (dx / dist) * (minDist - dist), y: (dy / dist) * (minDist - dist) };
  }
  const left = Math.abs(x - obstacle.x);
  const right = Math.abs(obstacle.x + obstacle.w - x);
  const top = Math.abs(y - obstacle.y);
  const bottom = Math.abs(obstacle.y + obstacle.h - y);
  const min = Math.min(left, right, top, bottom);
  if (min === left) return { x: -(radius + skin), y: 0 };
  if (min === right) return { x: radius + skin, y: 0 };
  if (min === top) return { x: 0, y: -(radius + skin) };
  return { x: 0, y: radius + skin };
}

function bestGauntletPlayerSlide(fromX, fromY, targetX, targetY, radius) {
  const moveX = targetX - fromX;
  const moveY = targetY - fromY;
  const moveDist = Math.hypot(moveX, moveY);
  if (moveDist < 0.001) return null;
  const baseAngle = Math.atan2(moveY, moveX);
  const candidates = [
    [Math.PI / 2, 0.92],
    [-Math.PI / 2, 0.92],
    [Math.PI / 3, 0.82],
    [-Math.PI / 3, 0.82],
    [Math.PI * 0.72, 0.72],
    [-Math.PI * 0.72, 0.72],
  ];
  let best = null;
  candidates.forEach(([offset, scale]) => {
    const angle = baseAngle + offset;
    const raw = {
      x: fromX + Math.cos(angle) * moveDist * scale,
      y: fromY + Math.sin(angle) * moveDist * scale,
    };
    const resolved = resolveGauntletCircle(raw.x, raw.y, radius);
    if (!isGauntletCircleWalkable(resolved.x, resolved.y, radius)) return;
    const progress = (resolved.x - fromX) * moveX + (resolved.y - fromY) * moveY;
    const movement = Math.hypot(resolved.x - fromX, resolved.y - fromY);
    const clearance = gauntletObstacleClearance(resolved.x, resolved.y, radius);
    const score = progress / Math.max(1, moveDist) + movement * 0.25 + clearance * 0.02;
    if (!best || score > best.score) best = { ...resolved, score };
  });
  return best && best.score > 1 ? { x: best.x, y: best.y } : null;
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

function mazeRewardVisual(reward) {
  return mazeRewardVisuals[reward?.id] || { tone: "blue", category: "Reward", icon: "potion" };
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
  const pickleSlow = player.pickleSlowTimer > 0 ? 0.72 : 1;
  return player.stats.speed * haste * greaseSlow * pickleSlow * bardMoveSpeedMultiplier();
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
      const hit = damageEnemiesInRadius(player.x, player.y, 92, playerDamage(0.28), "Whirlwind Dash");
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
  if (player.room === "starter" && player.gateCooldown <= 0 && circleIntersectsRect(player.x, player.y, player.radius, world.gate)) {
    startMazeForBoss(boss.kind);
  }
  if (player.room === "maze" && player.gateCooldown <= 0 && mazeState?.exitOpen && circleIntersectsRect(player.x, player.y, player.radius, mazeState.exit)) {
    enterBossArena();
  }
  if (player.room === "arena" && player.x < world.arena.x + player.radius) {
    player.x = world.arena.x + player.radius;
    player.destination = null;
    player.slide = null;
  }
}

function updateGauntletProgress(dt) {
  try {
    updateGauntletProgressInner(dt);
  } catch (error) {
    reportRuntimeError(error, { area: "updateGauntletProgress", dt });
  }
}

function updateGauntletProgressInner(dt) {
  if (!mazeState || mazeState.encounterType !== "gauntlet" || mazeState.rewardPending) return;
  mazeState.waveTimer = Math.max(0, (mazeState.waveTimer || 0) - dt);
  updateGauntletPickups(dt);
  if (mazeState.waveIndex < 0) {
    if (gauntletWaveAdvanceReady()) recoverGauntletWaveAdvance("initial-timer");
    return;
  }
  const activeTrash = hasActiveGauntletTrash();
  const currentWave = mazeState.waves?.[mazeState.waveIndex];
  if (currentWave?.spawned && !currentWave.cleared && !activeTrash) {
    clearGauntletWave(currentWave, "normal");
    return;
  }
  if (activeTrash || !gauntletWaveAdvanceReady()) return;
  recoverGauntletWaveAdvance("timer");
}

function hasActiveGauntletTrash() {
  return Boolean(mazeState?.enemies?.some((enemy) => enemy.hp > 0 && !enemy.miniBoss));
}

function gauntletWaveAdvanceReady() {
  if (!mazeState) return false;
  const timerReady = !Number.isFinite(mazeState.waveTimer) || mazeState.waveTimer <= 0;
  const dueAt = Number(mazeState.nextWaveDueAt);
  return timerReady || (Number.isFinite(dueAt) && dueAt > 0 && performance.now() >= dueAt);
}

function canAdvanceGauntletLocally() {
  return !isPartySyncActive() || isMultiplayerHost();
}

function clearGauntletWave(wave, reason = "normal") {
  if (!mazeState || !wave || wave.cleared) return;
  wave.cleared = true;
  mazeState.waveTimer = 1.1;
  mazeState.nextWaveDueAt = performance.now() + mazeState.waveTimer * 1000;
  dropGauntletPickup(wave.index);
  recordDebugEvent("gauntlet-wave-cleared", { index: wave.index, reason, phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
  sendGauntletSync(true);
  ui.status.textContent = wave.index === 0 ? "Wave cleared. Next wave incoming." : "Trash cleared. The warden is coming.";
  showFloat(wave.index === 0 ? "Wave cleared" : "Warden incoming");
}

function recoverGauntletWaveAdvance(reason = "watchdog") {
  if (!canAdvanceGauntletLocally()) return false;
  if (!mazeState || mazeState.encounterType !== "gauntlet" || mazeState.rewardPending) return false;
  ensureGauntletRuntimeState();
  if (hasActiveGauntletTrash()) return false;
  const waves = Array.isArray(mazeState.waves) ? mazeState.waves : [];
  if (mazeState.waveIndex < 0) {
    if (!gauntletWaveAdvanceReady()) return false;
    recordDebugEvent("gauntlet-wave-watchdog", { reason, action: "spawn-initial", phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
    spawnGauntletWave(0);
    return true;
  }
  const currentWave = waves[mazeState.waveIndex];
  if (currentWave?.spawned && !currentWave.cleared) {
    clearGauntletWave(currentWave, reason);
    return true;
  }
  if (!gauntletWaveAdvanceReady()) return false;
  if (mazeState.waveIndex < waves.length - 1) {
    const nextIndex = mazeState.waveIndex + 1;
    if (!waves[nextIndex]?.spawned) {
      recordDebugEvent("gauntlet-wave-watchdog", { reason, action: "spawn-next", nextIndex, phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
      spawnGauntletWave(nextIndex);
      return true;
    }
    return false;
  }
  if (!mazeState.miniBossSpawned) {
    recordDebugEvent("gauntlet-wave-watchdog", { reason, action: "spawn-warden", phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
    spawnGauntletMiniBoss();
    return true;
  }
  return false;
}

function safeRecoverGauntletWaveAdvance(reason = "watchdog") {
  try {
    return recoverGauntletWaveAdvance(reason);
  } catch (error) {
    reportRuntimeError(error, { area: "recoverGauntletWaveAdvance", reason });
    return false;
  }
}

function spawnGauntletWave(index) {
  try {
    return spawnGauntletWaveInner(index);
  } catch (error) {
    reportRuntimeError(error, { area: "spawnGauntletWave", index });
    return fallbackSpawnGauntletWave(index);
  }
}

function spawnGauntletWaveInner(index) {
  if (!mazeState?.waves?.[index]) return;
  const wave = mazeState.waves[index];
  if (wave.spawned) return;
  wave.spawned = true;
  wave.cleared = false;
  mazeState.nextWaveDueAt = 0;
  mazeState.waveIndex = index;
  mazeState.enemies.push(...wave.enemies);
  recordDebugEvent("gauntlet-wave-spawn", { index, enemies: wave.enemies.length, phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
  ui.status.textContent = `${mazeState.theme.name}: clear wave ${index + 1} of ${mazeState.waves.length}.`;
  showScreenBanner(`Wave ${index + 1}`, "Keep moving and clear the room", "neutral", 1.6);
  sendMultiplayerState(true);
  sendGauntletSync(true);
}

function fallbackSpawnGauntletWave(index) {
  if (!mazeState?.waves?.[index]) return false;
  ensureGauntletRuntimeState();
  const wave = mazeState.waves[index];
  const existingIds = new Set(mazeState.enemies.map((enemy) => enemy.id).filter(Boolean));
  const addedEnemies = (wave.enemies || []).filter((enemy) => !enemy.id || !existingIds.has(enemy.id));
  wave.spawned = true;
  wave.cleared = false;
  mazeState.nextWaveDueAt = 0;
  mazeState.waveIndex = index;
  if (addedEnemies.length) mazeState.enemies.push(...addedEnemies);
  recordDebugEvent("gauntlet-wave-fallback-spawn", {
    index,
    enemies: addedEnemies.length,
    phaseSeq: multiplayer.phaseSeq,
    sequence: mazeState.sequence,
  });
  try {
    if (ui.status) ui.status.textContent = `${mazeState.theme?.name || "Gauntlet"}: clear wave ${index + 1}.`;
  } catch {
    // UI text is not allowed to block the authoritative host sim.
  }
  sendGauntletSync(true);
  sendMultiplayerState(true);
  return true;
}

function spawnGauntletMiniBoss() {
  if (!mazeState || mazeState.miniBossSpawned || !mazeState.miniBossEnemy) return;
  mazeState.miniBossSpawned = true;
  mazeState.enemies.push(mazeState.miniBossEnemy);
  recordDebugEvent("gauntlet-warden-spawn", { id: mazeState.miniBossEnemy.id, hp: mazeState.miniBossEnemy.hp, phaseSeq: multiplayer.phaseSeq, sequence: mazeState.sequence });
  ui.status.textContent = `${mazeState.theme.name}: defeat the warden.`;
  showScreenBanner("Warden", `${mazeState.miniBossEnemy.name} blocks the boss gate`, "neutral", 2.1);
  showFloat("Warden spawned");
  sendMultiplayerState(true);
  sendGauntletSync(true);
}

function dropGauntletPickup(waveIndex) {
  ensureGauntletRuntimeState();
  if (!mazeState?.bounds) return;
  const id = `pickup-${waveIndex}`;
  if (mazeState.pickupDrops.some((pickup) => pickup.id === id)) return;
  const point = gauntletPoint(mazeState.bounds, waveIndex === 0 ? 0.38 : 0.61, waveIndex === 0 ? 0.80 : 0.50);
  const potionDrop = waveIndex === 1 && player.potions < 4;
  mazeState.pickupDrops.push({
    id,
    type: potionDrop ? "potion" : "heal",
    x: point.x,
    y: point.y,
    r: potionDrop ? 15 : 18,
    amount: potionDrop ? 1 : 28,
    ttl: 22,
  });
}

function updateGauntletPickups(dt) {
  ensureGauntletRuntimeState();
  if (!mazeState?.pickupDrops?.length) return;
  let changed = false;
  mazeState.pickupDrops = mazeState.pickupDrops.filter((pickup) => {
    if (!Number.isFinite(pickup.x) || !Number.isFinite(pickup.y)) {
      changed = true;
      return false;
    }
    pickup.r = Number.isFinite(pickup.r) ? Math.max(4, pickup.r) : 16;
    pickup.amount = Number.isFinite(pickup.amount) ? Math.max(1, pickup.amount) : pickup.type === "potion" ? 1 : 24;
    pickup.ttl = (Number.isFinite(pickup.ttl) ? pickup.ttl : 0) - dt;
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
    if (pickup.id) mazeState.claimedPickupIds.add(pickup.id);
    changed = true;
    return false;
  });
  if (changed && isPartySyncActive() && isMultiplayerHost()) sendGauntletSync(true);
}

function updateMazeCombat(dt) {
  if (player.room !== "maze" || !mazeState || player.won || mazeState.rewardPending) return;
  ensureGauntletRuntimeState();
  if (player.dead && (!isPartySyncActive() || !isMultiplayerHost())) {
    if (isPartySyncActive() && !isMultiplayerHost()) updateRemoteHostileActors(dt);
    return;
  }
  if (isPartySyncActive() && !isMultiplayerHost()) {
    updateRemoteHostileActors(dt);
    updateRemoteGauntletEnemies(dt);
    updateGauntletPickups(dt);
    updateLocalGauntletContactDamage(dt);
    return;
  }
  if (mazeState.encounterType === "gauntlet") updateGauntletProgress(dt);
  const living = mazeState.enemies.filter((enemy) => enemy.hp > 0);
  living.forEach((enemy) => {
    enemy.moveTimer += dt;
    enemy.attackTimer -= dt;
    const target = mazeAimTarget(enemy);
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const activeRange = enemy.miniBoss ? 640 : enemy.ranged ? 560 : 590;
    if (dist < activeRange) {
      enemy.state = "fighting";
      const hasLineOfSight = isMazeSegmentWalkable(enemy.x, enemy.y, target.x, target.y, Math.min(10, enemy.radius * 0.55));
      if (!enemy.ranged || dist < 130 || !hasLineOfSight || dist > 360) {
        const speed = enemy.speed * (enemy.miniBoss && dist > 110 ? 1 : 0.82);
        moveMazeEnemyToward(enemy, target, speed, dt);
      }
      if (!enemy.miniBoss && enemy.ranged && enemy.attackTimer <= 0 && dist < 420 && hasLineOfSight) {
        spawnMazeProjectile(enemy);
        enemy.attackTimer = 1.45;
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
  updateLocalGauntletContactDamage(dt);
}

function updateRemoteGauntletEnemies(dt) {
  if (!mazeState?.enemies?.length) return;
  if (multiplayer.lastHostileSyncAt && Date.now() - multiplayer.lastHostileSyncAt < 900) return;
  const now = performance.now();
  mazeState.enemies.forEach((enemy) => {
    if (!enemy.remoteGauntletEnemy || enemy.hp <= 0) return;
    enemy.moveTimer = (Number.isFinite(enemy.moveTimer) ? enemy.moveTimer : 0) + dt;
    if (!Number.isFinite(enemy.syncTargetX) || !Number.isFinite(enemy.syncTargetY)) return;
    const age = Math.max(0, (now - (enemy.syncReceivedAt || now)) / 1000);
    const extrapolate = Math.min(remoteGauntletEnemyMaxExtrapolate, age);
    const targetX = enemy.syncTargetX + (enemy.syncVx || 0) * extrapolate;
    const targetY = enemy.syncTargetY + (enemy.syncVy || 0) * extrapolate;
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const dist = Math.hypot(dx, dy);
    if (dist > remoteGauntletEnemySnapDistance) {
      enemy.x = targetX;
      enemy.y = targetY;
      return;
    }
    const alpha = 1 - Math.exp(-remoteGauntletEnemySmoothing * dt);
    enemy.x += dx * alpha;
    enemy.y += dy * alpha;
  });
}

function updateLocalGauntletContactDamage(dt) {
  if (!mazeState || player.dead || player.room !== "maze") return;
  ensureGauntletRuntimeState();
  mazeState.localContactTimers.forEach((timer, id) => {
    const next = timer - dt;
    if (next > 0) mazeState.localContactTimers.set(id, next);
    else mazeState.localContactTimers.delete(id);
  });
  mazeState.enemies.forEach((enemy) => {
    if (enemy.hp <= 0) return;
    const key = enemy.id || enemy.name || "enemy";
    if ((mazeState.localContactTimers.get(key) || 0) > 0) return;
    const contactRange = enemy.radius + player.radius + (enemy.miniBoss ? 10 : 8);
    if (distance(enemy, player) > contactRange) return;
    damagePlayer(enemy.miniBoss ? Math.max(12, enemy.damage || 10) : enemy.damage, enemy.name || "Gauntlet enemy");
    mazeState.localContactTimers.set(key, enemy.miniBoss ? 0.95 : 1.05);
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

function moveMazeEnemyToward(enemy, target, speed, dt) {
  if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) return;
  const moveTarget = mazeEnemyMoveTarget(enemy, target);
  const dx = moveTarget.x - enemy.x;
  const dy = moveTarget.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return;
  const step = Math.min(speed * dt, Math.max(0, dist - enemy.radius * 0.4));
  if (step <= 0) return;
  const directX = enemy.x + (dx / dist) * step;
  const directY = enemy.y + (dy / dist) * step;
  if (isMazeCircleWalkable(directX, directY, enemy.radius) && isMazeSegmentWalkable(enemy.x, enemy.y, directX, directY, enemy.radius)) {
    enemy.x = directX;
    enemy.y = directY;
    enemy.steerAngle = Math.atan2(dy, dx);
    enemy.stuckTimer = 0;
    if (moveTarget.waypoint && distance(enemy, moveTarget) < enemy.radius + 12) clearMazeEnemyWaypoint(enemy);
    return;
  }
  const bestStep = bestMazeEnemySteerStep(enemy, moveTarget, step) || (moveTarget.waypoint ? bestMazeEnemySteerStep(enemy, target, step) : null);
  if (bestStep) {
    enemy.x = bestStep.x;
    enemy.y = bestStep.y;
    enemy.steerAngle = bestStep.angle;
    enemy.stuckTimer = 0;
    if (moveTarget.waypoint && distance(enemy, moveTarget) < enemy.radius + 12) clearMazeEnemyWaypoint(enemy);
    return;
  }
  enemy.stuckTimer = (enemy.stuckTimer || 0) + dt;
  moveMazeEnemy(enemy, (dx / dist) * step * 0.55, (dy / dist) * step * 0.55);
}

function mazeEnemyMoveTarget(enemy, target) {
  if (!mazeState?.obstacles?.length) return target;
  if (isMazeSegmentWalkable(enemy.x, enemy.y, target.x, target.y, enemy.radius)) {
    clearMazeEnemyWaypoint(enemy);
    return target;
  }
  const now = performance.now();
  const waypoint = enemy.pathWaypoint;
  if (
    waypoint &&
    now < (enemy.pathWaypointUntil || 0) &&
    distance(enemy, waypoint) > enemy.radius + 10 &&
    isMazeCircleWalkable(waypoint.x, waypoint.y, enemy.radius) &&
    isMazeSegmentWalkable(enemy.x, enemy.y, waypoint.x, waypoint.y, enemy.radius)
  ) {
    return { ...waypoint, waypoint: true };
  }
  const nextWaypoint = bestGauntletPathWaypoint(enemy, target);
  if (nextWaypoint) {
    enemy.pathWaypoint = nextWaypoint;
    enemy.pathWaypointUntil = now + mazeEnemyWaypointRefreshMs;
    return { ...nextWaypoint, waypoint: true };
  }
  clearMazeEnemyWaypoint(enemy);
  return target;
}

function clearMazeEnemyWaypoint(enemy) {
  enemy.pathWaypoint = null;
  enemy.pathWaypointUntil = 0;
}

function bestGauntletPathWaypoint(enemy, target) {
  const candidates = gauntletPathCandidates(enemy.radius);
  if (!candidates.length) return null;
  const currentDistance = distance(enemy, target);
  const previousAngle = Number.isFinite(enemy.steerAngle) ? enemy.steerAngle : Math.atan2(target.y - enemy.y, target.x - enemy.x);
  let best = null;
  candidates.forEach((candidate) => {
    if (!isMazeCircleWalkable(candidate.x, candidate.y, enemy.radius)) return;
    if (!isMazeSegmentWalkable(enemy.x, enemy.y, candidate.x, candidate.y, enemy.radius)) return;
    const candidateDistance = distance(candidate, target);
    const routeCost = distance(enemy, candidate) + candidateDistance;
    const progress = currentDistance - candidateDistance;
    const hasTargetSight = isMazeSegmentWalkable(candidate.x, candidate.y, target.x, target.y, Math.min(10, enemy.radius * 0.55));
    const angle = Math.atan2(candidate.y - enemy.y, candidate.x - enemy.x);
    const anglePenalty = Math.abs(angleDifference(angle, previousAngle)) * 9;
    const clearance = gauntletObstacleClearance(candidate.x, candidate.y, enemy.radius);
    const score = progress * 3.4 - routeCost * 0.12 + clearance * 0.08 + (hasTargetSight ? 90 : 0) - anglePenalty;
    if (!best || score > best.score) best = { ...candidate, score };
  });
  return best && best.score > -12 ? { x: best.x, y: best.y } : null;
}

function gauntletPathCandidates(radius) {
  const bounds = mazeState?.bounds;
  if (!bounds) return [];
  const candidates = [];
  const addCandidate = (x, y) => {
    candidates.push({
      x: clamp(x, bounds.x + radius, bounds.x + bounds.w - radius),
      y: clamp(y, bounds.y + radius, bounds.y + bounds.h - radius),
    });
  };
  (mazeState.obstacles || []).forEach((obstacle) => {
    const pad = radius + 24;
    if (obstacle.type === "circle") {
      const ring = obstacle.r + pad;
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        addCandidate(obstacle.x + Math.cos(angle) * ring, obstacle.y + Math.sin(angle) * ring);
      }
      return;
    }
    addCandidate(obstacle.x - pad, obstacle.y - pad);
    addCandidate(obstacle.x + obstacle.w + pad, obstacle.y - pad);
    addCandidate(obstacle.x - pad, obstacle.y + obstacle.h + pad);
    addCandidate(obstacle.x + obstacle.w + pad, obstacle.y + obstacle.h + pad);
    addCandidate(obstacle.x + obstacle.w / 2, obstacle.y - pad);
    addCandidate(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h + pad);
    addCandidate(obstacle.x - pad, obstacle.y + obstacle.h / 2);
    addCandidate(obstacle.x + obstacle.w + pad, obstacle.y + obstacle.h / 2);
  });
  return candidates;
}

function bestMazeEnemySteerStep(enemy, target, step) {
  const desiredAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
  const previousAngle = Number.isFinite(enemy.steerAngle) ? enemy.steerAngle : desiredAngle;
  const currentDistance = Math.hypot(target.x - enemy.x, target.y - enemy.y);
  let best = null;
  mazeEnemySteerAngles.forEach((offset) => {
    const preferredSign = angleDifference(previousAngle, desiredAngle) >= 0 ? 1 : -1;
    const angle = desiredAngle + offset * preferredSign;
    const x = enemy.x + Math.cos(angle) * step;
    const y = enemy.y + Math.sin(angle) * step;
    if (!isMazeCircleWalkable(x, y, enemy.radius)) return;
    if (!isMazeSegmentWalkable(enemy.x, enemy.y, x, y, enemy.radius)) return;
    const lookAheadX = enemy.x + Math.cos(angle) * step * 2.2;
    const lookAheadY = enemy.y + Math.sin(angle) * step * 2.2;
    const lookAheadClear = isMazeCircleWalkable(lookAheadX, lookAheadY, enemy.radius)
      && isMazeSegmentWalkable(x, y, lookAheadX, lookAheadY, enemy.radius);
    const distanceAfter = Math.hypot(target.x - x, target.y - y);
    const progress = currentDistance - distanceAfter;
    const anglePenalty = Math.abs(offset) * 10;
    const continuityPenalty = Math.abs(angleDifference(angle, previousAngle)) * 8;
    const clearanceBonus = gauntletObstacleClearance(x, y, enemy.radius) * 0.03;
    const score = progress * 4 + clearanceBonus + (lookAheadClear ? 12 : -8) - anglePenalty - continuityPenalty;
    if (!best || score > best.score) best = { x, y, angle, score };
  });
  return best && best.score > -24 ? best : null;
}

function gauntletObstacleClearance(x, y, radius) {
  if (!mazeState?.bounds) return 0;
  let clearance = Math.min(
    x - mazeState.bounds.x,
    mazeState.bounds.x + mazeState.bounds.w - x,
    y - mazeState.bounds.y,
    mazeState.bounds.y + mazeState.bounds.h - y,
  ) - radius;
  (mazeState.obstacles || []).forEach((obstacle) => {
    let distanceToObstacle = 0;
    if (obstacle.type === "circle") {
      distanceToObstacle = Math.hypot(x - obstacle.x, y - obstacle.y) - obstacle.r - radius;
    } else {
      const nearestX = clamp(x, obstacle.x, obstacle.x + obstacle.w);
      const nearestY = clamp(y, obstacle.y, obstacle.y + obstacle.h);
      distanceToObstacle = Math.hypot(x - nearestX, y - nearestY) - radius;
    }
    clearance = Math.min(clearance, distanceToObstacle);
  });
  return Math.max(0, clearance);
}

function spawnMazeProjectile(enemy) {
  const target = mazeAimTarget(enemy);
  const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
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
  const target = mazeAimTarget(enemy);
  const targetX = target.x;
  const targetY = target.y;
  const targetAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
  if (kind === "cola") {
    spawnMazeCircle(targetX, targetY, 34, 0.55, 1.2, 10, "#b9f4ff", "Fizz pop");
    spawnMazeShot(enemy, targetAngle + 0.22, { speed: 220, r: 16, ttl: 2.5, damage: 8, color: "#7ed8ef", source: "Fizz bubble" });
    spawnMazeShot(enemy, targetAngle - 0.22, { speed: 220, r: 16, ttl: 2.5, damage: 8, color: "#7ed8ef", source: "Fizz bubble" });
    return;
  }
  if (kind === "burger") {
    spawnMazeCircle(targetX, targetY, 48, 0.65, 1.05, 15, "#ff7044", "Grill slam");
    return;
  }
  if (kind === "fries") {
    spawnMazeCircle(enemy.x + Math.cos(enemy.moveTimer) * 44, enemy.y + Math.sin(enemy.moveTimer) * 44, 34, 0.3, 3.2, 5, "#f0c95d", "Hot grease", { lingering: true });
    for (let i = -1; i <= 1; i += 1) {
      spawnMazeShot(enemy, targetAngle + i * 0.22, { speed: 260, r: 10, ttl: 2.2, damage: 9, turn: i * 0.55, color: "#ffd76a", source: "Curly fry" });
    }
    return;
  }
  if (kind === "trio" || kind === "sauce") {
    const colors = ["#cf3b2f", "#e3bf34", "#f3ead2"];
    const color = colors[enemy.patternIndex % colors.length];
    for (let i = -1; i <= 1; i += 1) {
      spawnMazeShot(enemy, targetAngle + i * 0.24, { speed: 285, r: 10, ttl: 2.4, damage: 9, color, source: "Condiment burst" });
    }
    return;
  }
  if (kind === "shake") {
    spawnMazeCircle(targetX, targetY, 44, 0.7, 1.25, 11, "#bafcff", "Frost scoop", { chill: true });
    return;
  }
  if (kind === "nacho") {
    spawnMazeCircle(targetX, targetY, 42, 0.45, 2.4, 7, "#ffda6b", "Cheese puddle", { lingering: true });
    for (let i = 0; i < 6; i += 1) {
      spawnMazeShot(enemy, (Math.PI * 2 * i) / 6 + enemy.moveTimer * 0.2, { speed: 225, r: 8, ttl: 1.8, damage: 7, color: "#f0c35b", source: "Chip burst" });
    }
    return;
  }
  if (kind === "pizza") {
    const vertical = enemy.patternIndex % 2 === 0;
    spawnMazeWall(vertical ? targetX : enemy.x, vertical ? enemy.y : targetY, vertical, 0.68, 1.25, 12, "#ff7044");
    for (let i = -2; i <= 2; i += 1) {
      spawnMazeShot(enemy, targetAngle + i * 0.16, { speed: 275, r: 9, ttl: 2.1, damage: 7, color: "#b93a2f", source: "Pepperoni" });
    }
    return;
  }
  if (kind === "donut") {
    for (let i = 0; i < 10; i += 1) {
      spawnMazeShot(enemy, (Math.PI * 2 * i) / 10 + enemy.patternIndex * 0.19, { speed: 185, r: 7, ttl: 2.4, damage: 6, color: i % 2 ? "#ff79aa" : "#8ec7ff", source: "Sprinkle ring" });
    }
    spawnMazeCircle(targetX, targetY, 32, 0.55, 1.6, 9, "#ffd7e8", "Donut hole");
    return;
  }
  if (kind === "sushi") {
    spawnMazeWall(targetX, enemy.y, true, 0.7, 1.35, 12, "#b7e7d9");
    spawnMazeShot(enemy, targetAngle, { speed: 310, r: 11, ttl: 2.4, damage: 9, color: "#7ab9a8", source: "Wasabi shot" });
    return;
  }
  spawnMazeCircle(targetX, targetY, 42, 0.62, 1.15, 12, "#f0d47c", "Taco quake");
  spawnMazeShot(enemy, targetAngle, { speed: 300, r: 11, ttl: 2.2, damage: 9, color: "#6fbf55", source: "Taco shard" });
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
  if (player.dead && !isMultiplayerHost()) {
    updateRemoteHostileActors(dt);
    updateRemoteBossPassive(dt);
    return;
  }
  startFight();
  if (!shouldSimulateBossAI()) {
    updateRemoteHostileActors(dt);
    updateRemoteBossPassive(dt);
    return;
  }
  updateBossCombatLocal(dt);
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
  if (boss.kind === "burger") {
    updateBigBurger(dt);
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

function updateBigBurger(dt) {
  boss.animationTime += dt;
  player.attackCooldown -= dt;
  boss.swingTimer -= dt;
  boss.attackTimer -= dt;
  boss.animationDuration = Math.max(0, (boss.animationDuration || 0) - dt);
  if (boss.animationDuration <= 0 && boss.state !== "burgerChargeWarn" && boss.state !== "burgerCharging") {
    boss.animation = boss.enraged ? "burgerEnraged" : "burgerIdle";
  }

  updateBigBurgerCharge(dt);
  updateBigBurgerPhase();

  if (boss.swingTimer <= 0 && distance(player, boss) < boss.radius + 42) {
    damagePlayer(boss.enraged ? 19 : 14, "Burger bite");
    knockPlayerFrom(boss.x, boss.y, boss.enraged ? 250 : 190);
    boss.swingTimer = boss.enraged ? 0.82 : 1.12;
  }

  if (boss.attackTimer <= 0 && boss.state !== "burgerChargeWarn" && boss.state !== "burgerCharging") {
    spawnBigBurgerPattern();
    boss.attackTimer = attackInterval("burger") + (boss.phase >= 2 ? 0.12 : 0.28);
  }
}

function updateBigBurgerPhase() {
  const hpPercent = boss.hp / boss.maxHp;
  if (hpPercent <= 0.55 && boss.phase === 1) {
    boss.phase = 2;
    boss.attackTimer = Math.max(0.65, Math.min(boss.attackTimer, 1.05));
    playBigBurgerAnimation("burgerBurst", 0.9);
    log("Phase 2: Big Burger starts mixing ingredients.");
    showFloat("Phase 2");
  }
  if (hpPercent <= 0.24 && !boss.enraged) {
    boss.enraged = true;
    boss.attackTimer = Math.max(0.45, Math.min(boss.attackTimer, 0.8));
    playBigBurgerAnimation("burgerEnraged", 1.4);
    log("Big Burger is enraged.");
  }
}

function playBigBurgerAnimation(animation, duration = 0.75) {
  boss.animation = animation;
  boss.animationDuration = Math.max(boss.animationDuration || 0, duration);
  boss.animationTime = 0;
}

function spawnBigBurgerPattern() {
  boss.burgerPatternCount = (boss.burgerPatternCount || 0) + 1;
  const teaching = ["tomato", "pickle", "onion", "sauce"];
  if (boss.phase === 1 && boss.burgerPatternCount <= teaching.length) {
    spawnBigBurgerAttack(teaching[boss.burgerPatternCount - 1]);
    return;
  }

  if (boss.phase >= 2) {
    const comboEvery = boss.enraged ? 2 : 3;
    if (boss.burgerPatternCount % comboEvery === 0) {
      const combos = [
        ["tomato", "pickle"],
        ["onion", "sauce"],
        ["tomato", "onion"],
        ["pickle", "sauce"],
      ];
      const combo = combos[Math.floor(Math.random() * combos.length)];
      combo.forEach((kind, index) => setTimeoutLikeBurger(kind, index * 0.18));
      return;
    }
    if (boss.enraged && boss.burgerPatternCount % 5 === 0) {
      spawnBigBurgerAttack("burst");
      return;
    }
  }

  const pool = boss.phase >= 2 ? ["tomato", "pickle", "onion", "sauce", "charge", "burst"] : ["tomato", "pickle", "onion", "sauce", "charge"];
  let choice = pool[Math.floor(Math.random() * pool.length)];
  if (choice === boss.burgerLastPattern) choice = pool[(pool.indexOf(choice) + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length];
  spawnBigBurgerAttack(choice);
}

function setTimeoutLikeBurger(kind, delay) {
  if (delay <= 0) {
    spawnBigBurgerAttack(kind);
    return;
  }
  hazards.push({
    type: "burgerQueuedAttack",
    x: boss.x,
    y: boss.y,
    r: 1,
    ttl: delay + 0.05,
    warn: delay,
    damage: 0,
    kind,
    localOnly: true,
    source: "Big Burger",
  });
}

function spawnBigBurgerAttack(kind) {
  boss.burgerLastPattern = kind;
  if (kind === "tomato") {
    playBigBurgerAnimation("burgerTomato", 0.72);
    spawnBurgerTomatoSlices();
    log("Big Burger fires tomato slices.");
  } else if (kind === "pickle") {
    playBigBurgerAnimation("burgerPickle", 0.76);
    spawnBurgerPickleSplash();
    log("Big Burger throws pickle splash.");
  } else if (kind === "onion") {
    playBigBurgerAnimation("burgerOnion", 0.82);
    spawnBurgerOnionRings();
    log("Big Burger spins onion rings.");
  } else if (kind === "sauce") {
    playBigBurgerAnimation("burgerSauce", 0.82);
    spawnBurgerSauceDrips();
    log("Big Burger drips hot sauce.");
  } else if (kind === "charge") {
    beginBurgerCharge();
    log("Big Burger lines up a charge.");
  } else {
    playBigBurgerAnimation("burgerBurst", 1.0);
    spawnBurgerBurst();
    log("Big Burger releases an ingredient burst.");
  }
}

function spawnBurgerTomatoSlices() {
  const target = bossAimTarget();
  const baseAngle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const count = boss.phase >= 2 ? 3 : 2;
  const spread = boss.phase >= 2 ? 0.22 : 0.16;
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * spread;
    const angle = baseAngle + offset;
    const speed = boss.enraged ? 390 : boss.phase >= 2 ? 350 : 310;
    hazards.push({
      type: "tomatoSlice",
      x: boss.x + Math.cos(angle) * (boss.radius + 14),
      y: boss.y + Math.sin(angle) * (boss.radius + 14),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      r: 20,
      ttl: 3.2,
      warn: 0,
      damage: boss.enraged ? 21 : boss.phase >= 2 ? 18 : 15,
      knockback: boss.enraged ? 330 : 260,
      source: "Tomato slice",
      color: "#e94b3d",
    });
  }
}

function spawnBurgerPickleSplash() {
  const count = boss.phase >= 2 ? 4 : 3;
  for (let i = 0; i < count; i += 1) {
    const target = randomArenaPointNearThreat(boss.phase >= 2 ? 190 : 150, 35);
    const startAngle = Math.atan2(target.y - boss.y, target.x - boss.x);
    const flightTime = boss.enraged ? 0.56 : 0.68;
    hazards.push({
      type: "pickleSplash",
      x: boss.x,
      y: boss.y,
      startX: boss.x,
      startY: boss.y,
      targetX: target.x,
      targetY: target.y,
      vx: (target.x - boss.x) / flightTime,
      vy: (target.y - boss.y) / flightTime,
      angle: startAngle,
      age: 0,
      flightTime,
      arcHeight: 82,
      bounces: 1,
      r: 16,
      ttl: 3.4,
      warn: 0,
      damage: boss.enraged ? 16 : 13,
      source: "Pickle splash",
      color: "#9fdf45",
    });
  }
}

function spawnBurgerOnionRings() {
  const count = boss.phase >= 2 ? 6 : 4;
  const baseAngle = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + (Math.PI * 2 * i) / count;
    const speed = boss.enraged ? 255 : boss.phase >= 2 ? 230 : 200;
    hazards.push({
      type: "onionRing",
      x: boss.x + Math.cos(angle) * 42,
      y: boss.y + Math.sin(angle) * 42,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      moveAngle: angle,
      angle,
      spin: Math.random() * Math.PI * 2,
      inner: 14,
      outer: 34,
      r: 34,
      ttl: 3.1,
      warn: 0,
      damage: boss.enraged ? 18 : 14,
      knockback: 210,
      source: "Onion ring",
      color: "#aa58ff",
    });
  }
}

function spawnBurgerSauceDrips() {
  const count = boss.phase >= 2 ? 5 : 3;
  for (let i = 0; i < count; i += 1) {
    const target = randomArenaPointNearThreat(boss.phase >= 2 ? 240 : 170, 45);
    hazards.push({
      type: "burgerSauceDrop",
      x: target.x,
      y: target.y,
      r: boss.enraged ? 52 : 46,
      ttl: boss.enraged ? 1.12 : 1.28,
      warn: boss.enraged ? 0.58 : 0.75,
      warnDuration: boss.enraged ? 0.58 : 0.75,
      fallHeight: 110 + Math.random() * 25,
      damage: boss.enraged ? 20 : 16,
      source: "Sauce drip",
      color: "#e07a2a",
      hit: false,
    });
  }
}

function beginBurgerCharge() {
  const target = bossAimTarget();
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const startX = boss.x;
  const startY = boss.y;
  const end = clampArenaPoint(boss.x + Math.cos(angle) * 560, boss.y + Math.sin(angle) * 560, boss.radius);
  boss.state = "burgerChargeWarn";
  boss.stateTimer = boss.enraged ? 0.42 : 0.58;
  boss.chargeStartX = startX;
  boss.chargeStartY = startY;
  boss.chargeEndX = end.x;
  boss.chargeEndY = end.y;
  boss.chargeAge = 0;
  boss.chargeDuration = boss.enraged ? 0.48 : 0.58;
  boss.chargeHitPlayer = false;
  playBigBurgerAnimation("burgerCharge", 1.25);
  hazards.push({
    type: "burgerChargeLane",
    x: (startX + end.x) / 2,
    y: (startY + end.y) / 2,
    startX,
    startY,
    endX: end.x,
    endY: end.y,
    angle,
    length: Math.hypot(end.x - startX, end.y - startY),
    width: boss.enraged ? 104 : 92,
    r: 1,
    ttl: boss.stateTimer + boss.chargeDuration + 0.2,
    warn: boss.stateTimer,
    damage: boss.enraged ? 27 : 22,
    source: "Burger charge",
    color: "#ff6b58",
    hit: false,
  });
  boss.attackTimer = Math.max(boss.attackTimer, boss.stateTimer + boss.chargeDuration + 0.35);
}

function updateBigBurgerCharge(dt) {
  if (boss.state === "burgerChargeWarn") {
    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      boss.state = "burgerCharging";
      boss.stateTimer = boss.chargeDuration || 0.55;
      boss.chargeAge = 0;
    }
    return;
  }
  if (boss.state !== "burgerCharging") return;
  boss.stateTimer -= dt;
  boss.chargeAge = (boss.chargeAge || 0) + dt;
  const duration = Math.max(0.1, boss.chargeDuration || 0.55);
  const progress = clamp(boss.chargeAge / duration, 0, 1);
  const eased = 1 - Math.pow(1 - progress, 2);
  const previousX = boss.x;
  const previousY = boss.y;
  boss.x = boss.chargeStartX + (boss.chargeEndX - boss.chargeStartX) * eased;
  boss.y = boss.chargeStartY + (boss.chargeEndY - boss.chargeStartY) * eased;
  const swept = Math.hypot(boss.x - previousX, boss.y - previousY);
  if (!boss.chargeHitPlayer && swept > 1) {
    const angle = Math.atan2(boss.y - previousY, boss.x - previousX);
    const hit = distance(player, boss) < boss.radius + player.radius || isPlayerInLine(previousX, previousY, angle, swept, boss.radius * 0.55 + player.radius);
    if (hit && !player.dead) {
      boss.chargeHitPlayer = true;
      damagePlayer(boss.enraged ? 27 : 22, "Burger charge");
      knockPlayerFrom(previousX, previousY, boss.enraged ? 390 : 320);
    }
  }
  if (progress >= 1 || boss.stateTimer <= 0) {
    boss.state = "moving";
    boss.stateTimer = 0;
    boss.animationDuration = Math.min(boss.animationDuration || 0, 0.25);
  }
}

function spawnBurgerBurst() {
  const gapAngle = Math.atan2(player.y - boss.y, player.x - boss.x) + (Math.random() < 0.5 ? 0.95 : -0.95);
  hazards.push({
    type: "burgerBurstRing",
    x: boss.x,
    y: boss.y,
    r: boss.enraged ? 245 : 220,
    inner: 72,
    ttl: 1.28,
    warn: boss.enraged ? 0.62 : 0.82,
    warnDuration: boss.enraged ? 0.62 : 0.82,
    gapAngle,
    gapWidth: boss.enraged ? 0.82 : 1.02,
    damage: boss.enraged ? 30 : 24,
    source: "Ingredient burst",
    color: "#f0c35b",
    hit: false,
  });
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
  if (boss.animation && boss.animation !== "idle" && boss.animationTime > (boss.animationDuration || 0.85)) {
    boss.animation = "idle";
    boss.animationDuration = 0;
  }
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

function playBigColaAnimation(animation, duration = 0.85) {
  if (!boss || boss.kind !== "cola") return;
  boss.animation = animation;
  boss.animationTime = 0;
  boss.animationDuration = duration;
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

function markTacoPuzzleFailure(ingredient, options = {}) {
  if (boss.kind !== "taco" || !boss.tacoPuzzleActive) return;
  if (boss.tacoCurrentIngredient !== ingredient) return;
  if (!options.remote && shouldSendBossMechanicIntent()) {
    sendBossMechanicIntent("taco-failure", { ingredient });
    return;
  }
  boss.tacoPuzzleFailed = true;
}

function markTacoPuzzleProgress(ingredient, options = {}) {
  if (boss.kind !== "taco" || !boss.tacoPuzzleActive) return;
  if (boss.tacoCurrentIngredient !== ingredient) return;
  if (!options.remote && shouldSendBossMechanicIntent()) {
    sendBossMechanicIntent("taco-progress", { ingredient });
    return;
  }
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
  const waveId = (boss.donutHoleWaveSeq = (boss.donutHoleWaveSeq || 0) + 1);
  return Array.from({ length: count }, (_, index) => ({
    id: `hole-${waveId}-${index}`,
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
    id: `minion-${boss.donutMinionSeq = (boss.donutMinionSeq || 0) + 1}`,
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
  boss.sushiAnimationTimer = Math.max(0, (boss.sushiAnimationTimer || 0) - dt);
  boss.sushiDashTrailTimer = Math.max(0, (boss.sushiDashTrailTimer || 0) - dt);
  boss.sushiWeakFlashTimer = Math.max(0, (boss.sushiWeakFlashTimer || 0) - dt);
  if (boss.sushiAnimationTimer <= 0 && !["idle", "slither", "enrage"].includes(boss.sushiAnimationState)) {
    setSushiAnimation(boss.enraged ? "enrage" : "slither", 0.35);
  }
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
    setSushiAnimation("slither", 1.1);
    initializeSushiTrail(boss);
    log("Phase 2: Split Roll.");
    ui.status.textContent = "Sushi Serpent splits into faster patterns.";
  }
  if (hpPercent <= 0.33 && boss.phase < 3) {
    boss.phase = 3;
    boss.enraged = true;
    boss.attackTimer = 0.25;
    setSushiAnimation("enrage", 1.5);
    initializeSushiTrail(boss);
    log("Phase 3: Dragon Roll.");
    showFloat("Dragon Roll");
  }
}

function setSushiAnimation(state, duration = 0.8) {
  if (!boss || boss.kind !== "sushi") return;
  boss.sushiAnimationState = state;
  boss.sushiAnimationTimer = Math.max(boss.sushiAnimationTimer || 0, duration);
  boss.animation = `sushi-${state}`;
  boss.animationTime = 0;
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
  if (!hasFreshHostileSync()) updateSushiBodyChain();
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
  if (roll < 0.26) {
    spawnWasabiDash();
  } else if (roll < 0.49) {
    spawnChopstickJab(boss.phase >= 3 ? 3 : boss.phase >= 2 ? 2 : 1);
  } else if (roll < 0.74) {
    spawnRollBarrage(boss.phase >= 3 ? 14 : boss.phase >= 2 ? 10 : 7);
  } else {
    spawnSoySakeWave();
    if (boss.phase >= 3 && Math.random() < 0.45) startSoyWhirlpool();
  }
}

function spawnWasabiDash() {
  const target = bossAimTarget(boss);
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const distance = boss.phase >= 3 ? 720 : boss.phase >= 2 ? 650 : 580;
  const end = clampArenaPoint(boss.x + Math.cos(angle) * distance, boss.y + Math.sin(angle) * distance, boss.radius);
  hazards.push({
    type: "wasabiDash",
    x: boss.x,
    y: boss.y,
    startX: boss.x,
    startY: boss.y,
    endX: end.x,
    endY: end.y,
    prevX: boss.x,
    prevY: boss.y,
    angle,
    length: Math.hypot(end.x - boss.x, end.y - boss.y),
    width: boss.phase >= 3 ? 78 : 66,
    warn: boss.enraged ? 0.68 : 0.86,
    ttl: boss.enraged ? 1.42 : 1.66,
    dashAge: 0,
    dashDuration: boss.enraged ? 0.48 : 0.62,
    damage: boss.enraged ? 15 : 12,
    hit: false,
  });
  setSushiAnimation("dashWindup", 0.7);
  boss.sushiLastAbility = "wasabi-dash";
  log("Wasabi Dash windup.");
}

function spawnChopstickJab(count) {
  setSushiAnimation("jab", 0.75 + count * 0.08);
  boss.sushiLastAbility = "chopstick-jab";
  for (let i = 0; i < count; i += 1) {
    const target = bossAimTarget(boss);
    const angle = Math.atan2(target.y - boss.y, target.x - boss.x) + (i - (count - 1) / 2) * 0.22;
    hazards.push({
      type: "chopstickJab",
      x: boss.x,
      y: boss.y,
      angle,
      length: boss.phase >= 3 ? 760 : 660,
      width: boss.phase >= 3 ? 34 : 28,
      warn: 0.58 + i * 0.11,
      ttl: 0.98 + i * 0.11,
      damage: boss.enraged ? 10 : 8,
      hit: false,
    });
  }
}

function spawnRollBarrage(count) {
  setSushiAnimation("barrage", 0.95);
  boss.sushiLastAbility = "roll-barrage";
  const target = bossAimTarget(boss);
  const baseAngle = Math.atan2(target.y - boss.y, target.x - boss.x);
  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + (Math.PI * 2 * i) / count + (boss.enraged ? 0.18 : 0);
    hazards.push({
      type: "sushiRoll",
      x: boss.x + Math.cos(angle) * 58,
      y: boss.y + Math.sin(angle) * 58,
      vx: Math.cos(angle) * (boss.enraged ? 250 : 210),
      vy: Math.sin(angle) * (boss.enraged ? 250 : 210),
      turn: (i % 2 === 0 ? 1 : -1) * (boss.phase >= 3 ? 0.64 : 0.42),
      spin: Math.random() * Math.PI * 2,
      r: boss.phase >= 3 ? 15 : 13,
      ttl: boss.enraged ? 3.15 : 2.85,
      damage: boss.enraged ? 9 : 7,
    });
  }
}

function spawnSoySakeWave() {
  const target = bossAimTarget(boss);
  const angle = Math.atan2(target.y - boss.y, target.x - boss.x);
  const warn = boss.enraged ? 0.72 : 0.9;
  const activeDuration = boss.enraged ? 2.25 : 2.35;
  const fadeDuration = 0.48;
  setSushiAnimation("soy", 1.05);
  boss.sushiLastAbility = "soy-sake-wave";
  hazards.push({
    type: "soySakeWave",
    x: boss.x,
    y: boss.y,
    originX: boss.x,
    originY: boss.y,
    angle,
    length: boss.phase >= 3 ? 720 : 620,
    width: boss.phase >= 3 ? 116 : 94,
    speed: boss.enraged ? 245 : 205,
    warn,
    warnDuration: warn,
    ttl: warn + activeDuration + fadeDuration,
    age: 0,
    activeAge: 0,
    activeDuration,
    surgeDuration: 0.42,
    fadeDuration,
    visualPadding: 12,
    textureOffset: 0,
    waveSeed: Math.random() * Math.PI * 2,
    damage: boss.enraged ? 8 : 6,
    damageTimer: 0,
    hit: false,
  });
  spawnSoySplash(boss.phase >= 3 ? 4 : 2);
}

function spawnSoySplash(count) {
  for (let i = 0; i < count; i += 1) {
    const point = randomArenaPointNearThreat(260, 90);
    hazards.push({ type: "soyPuddle", x: point.x, y: point.y, r: boss.phase >= 3 ? 48 : 40, warn: 0.64 + i * 0.08, ttl: boss.phase >= 3 ? 4.1 : 3.5, damage: 3, damageTimer: 0 });
  }
}

function soySakeWaveShape(hazard) {
  const warnDuration = Math.max(0.1, hazard.warnDuration || 0.8);
  const activeAge = Math.max(0, hazard.activeAge || 0);
  const activeDuration = Math.max(0.6, hazard.activeDuration || 2.2);
  const surgeDuration = Math.max(0.1, hazard.surgeDuration || 0.4);
  const fadeDuration = Math.max(0.1, hazard.fadeDuration || 0.45);
  const fadeStart = Math.max(surgeDuration, activeDuration - fadeDuration);
  const warnProgress = hazard.warn > 0 ? clamp(1 - hazard.warn / warnDuration, 0, 1) : 1;
  const surgeProgress = hazard.warn > 0 ? 0 : clamp(activeAge / surgeDuration, 0, 1);
  const fadeProgress = hazard.warn > 0 ? 0 : clamp((activeAge - fadeStart) / fadeDuration, 0, 1);
  const visibleProgress = hazard.warn > 0 ? 0.22 + warnProgress * 0.78 : surgeProgress;
  const alpha = hazard.warn > 0 ? 0.18 + warnProgress * 0.18 : Math.max(0, 1 - fadeProgress * 0.82);
  const visibleLength = Math.max(90, hazard.length * visibleProgress * (1 - fadeProgress * 0.18));
  const visibleWidth = Math.max(24, hazard.width * (hazard.warn > 0 ? 0.55 + warnProgress * 0.35 : 1 - fadeProgress * 0.38));
  return {
    angle: hazard.angle,
    length: visibleLength,
    width: visibleWidth,
    collisionWidth: Math.max(18, visibleWidth * 0.42),
    alpha,
    warnProgress,
    surgeProgress,
    fadeProgress,
    frame: hazard.warn > 0 ? 0 : clamp(Math.floor((activeAge / activeDuration) * 7), 1, 7),
    damageActive: hazard.warn <= 0 && surgeProgress > 0.28 && fadeProgress < 0.82,
  };
}

function soySakeWaveTouchesPlayer(hazard, shape = soySakeWaveShape(hazard)) {
  const startX = hazard.x - Math.cos(hazard.angle) * shape.length * 0.5;
  const startY = hazard.y - Math.sin(hazard.angle) * shape.length * 0.5;
  return isPlayerInLine(startX, startY, hazard.angle, shape.length, shape.collisionWidth + player.radius);
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

function encounterThreatTargets(room) {
  const targets = [];
  if (player.room === room && !player.dead) {
    targets.push({ x: player.x, y: player.y, radius: player.radius, local: true });
  }
  multiplayer.peers.forEach((peer) => {
    if (peer.room !== room || peer.dead || peer.bossKind !== boss.kind) return;
    targets.push({ x: peer.x, y: peer.y, radius: 18, local: false });
  });
  return targets.filter((target) => Number.isFinite(target.x) && Number.isFinite(target.y));
}

function coopThreatTargets() {
  return encounterThreatTargets("arena");
}

function bossAimTarget(origin = boss) {
  const targets = coopThreatTargets();
  if (!targets.length) return player;
  if (targets.length === 1) return targets[0];
  const nearest = targets.slice().sort((a, b) => distance(origin, a) - distance(origin, b))[0];
  return Math.random() < 0.58 ? nearest : targets[Math.floor(Math.random() * targets.length)];
}

function mazeAimTarget(origin) {
  const targets = encounterThreatTargets("maze");
  if (!targets.length) return player;
  if (targets.length === 1) return targets[0];
  const nearest = targets.slice().sort((a, b) => distance(origin, a) - distance(origin, b))[0];
  return Math.random() < 0.62 ? nearest : targets[Math.floor(Math.random() * targets.length)];
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
  const attackTarget = updatePlayerFacingTowardAttackTarget(x, y);
  if (player.attackCooldown > 0) return;
  if (!attackTarget) return;
  if (player.room === "arena") startFight();
  const projectile = firePlayerProjectile(attackTarget.angle);
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
  const bardAttack = weapon.tag === "Bard";
  const projectile = {
    x: player.x + Math.cos(angle) * 24,
    y: player.y + Math.sin(angle) * 24,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: magicAttack ? 11 : meleeAttack ? 12 : rogueAttack ? 8 : bardAttack ? 9 : 6,
    damage: playerDamage(0.78 + Math.random() * 0.44),
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
  if (bardAttack) {
    player.meleeAttackTimer = 0.22;
    player.meleeAttackAngle = angle;
  }
  player.attackCooldown = basicAttackCooldown(weapon);
  ui.status.textContent = bardAttack ? `Playing ${weapon.name}.` : meleeAttack || rogueAttack ? `Slashing ${weapon.name}.` : `Firing ${weapon.name}.`;
  multiplayer.attackSeq += 1;
  sendMultiplayerEvent({
    kind: "attack",
    seq: multiplayer.attackSeq,
    x: player.x,
    y: player.y,
    angle,
    room: player.room,
    bossKind: boss.kind,
    phaseSeq: multiplayer.phaseSeq,
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
  if (tag === "Bard") return 560;
  return 760;
}

function projectileTravelTime(weapon, speed) {
  const rangeBonus = isWarriorTag(weapon.tag) ? 150 : weapon.tag === "Rogue" ? 62 : weapon.tag === "Bard" ? 170 : 210;
  return (player.stats.range + rangeBonus) / speed;
}

function basicAttackCooldown(weapon) {
  return weapon.speed * (1 - (runState.mazeBuffs.attackSpeed || 0)) * bardAttackSpeedMultiplier();
}

function updateHeldPrimaryAttack() {
  if (!primaryAttackHeld) return;
  if (player.dead || player.won) {
    stopHeldPrimaryAttack();
    return;
  }
  if (mazeState?.rewardPending) return;
  updatePlayerFacingTowardAttackTarget(mouseWorld.x, mouseWorld.y);
  if (player.attackCooldown > 0) return;
  shootAt(mouseWorld.x, mouseWorld.y);
}

function stopHeldPrimaryAttack(pointerId = null) {
  if (pointerId !== null && primaryAttackPointerId !== null && pointerId !== primaryAttackPointerId) return;
  primaryAttackHeld = false;
  primaryAttackPointerId = null;
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
  if (currentClassKey() === "bard") useBardAbility(index, ability);
}

function abilityIndexForKey(event) {
  const pressed = event.code === "Space" ? "space" : event.key.toLowerCase();
  return currentAbilities().findIndex((ability) => ability.key.toLowerCase() === pressed);
}

function spendAbility(index, ability) {
  player.abilityCooldowns[index] = ability.cooldown * talentAbilityCooldownMultiplier(index);
  runTalentHook("onAbilityCast", { index, ability });
  ui.status.textContent = `${ability.name}.`;
  showFloat(ability.name);
  sendAbilityUseEvent(index, ability);
}

function sendAbilityUseEvent(index, ability) {
  if (!isPartySyncActive()) return;
  sendMultiplayerEvent({
    kind: "ability",
    seq: `${multiplayer.id || "player"}-${Date.now()}-${index}`,
    classKey: currentClassKey(),
    abilityIndex: index,
    abilityName: ability.name,
    room: player.room,
    bossKind: boss.kind,
    phaseSeq: multiplayer.phaseSeq,
    x: player.x,
    y: player.y,
    targetX: mouseWorld.x,
    targetY: mouseWorld.y,
    angle: aimAngle(),
    weaponTag: gear.weapon[player.gear.weapon].tag,
  });
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
  const hit = damageEnemiesInCone(player.x, player.y, angle, range, halfAngle, playerDamage(hasTalent("melee_earth_bash") ? 0.92 : 0.72), "Shield Bash");
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
  const hits = damageEnemiesInRadius(player.x, player.y, radius, playerDamage(1.18), "Groundbreaker");
  hits.forEach((target) => {
    interruptTarget(target);
    shoveTarget(target, player.x, player.y, 42);
    if (hasTalent("melee_blood_hemo") && target.bleedTimer > 0) damageBossTarget(target, playerDamage(0.38), "Hemorrhage");
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
      damage: playerDamage(0.72),
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
    damage: playerDamage(0.66),
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

function useBardAbility(index, ability) {
  if (index === 0) {
    spendAbility(index, ability);
    powerChord();
    return;
  }
  if (index === 1) {
    spendAbility(index, ability);
    startBardSong("battle");
    return;
  }
  if (index === 2) {
    spendAbility(index, ability);
    quickstepVerse();
    return;
  }
  spendAbility(index, ability);
  startBardSong("healing");
}

function bardSongSettings(songType, options = {}) {
  if (songType === "battle") {
    const ttl = 6 + (hasTalent("bard_hymn_cap") ? 2 : 0);
    return {
      type: "bardBattleHymn",
      songType,
      r: 132 + (hasTalent("bard_hymn_radius") ? 34 : 0),
      ttl,
      maxTtl: ttl,
      damageBuff: 0.14 + (hasTalent("bard_hymn_damage") ? 0.08 : 0),
      attackSpeedBuff: 0.1 + (hasTalent("bard_hymn_speed") ? 0.08 : 0),
      color: "#ffd782",
    };
  }
  if (songType === "quickstep") {
    const ttl = options.encore ? 2.2 : 3.2;
    return {
      type: "bardQuickstepVerse",
      songType,
      r: 112 + (hasTalent("bard_hymn_radius") ? 20 : 0),
      ttl,
      maxTtl: ttl,
      speedBuff: 0.22,
      color: "#92d4ff",
    };
  }
  const ttl = (options.encore ? 3.4 : 6) + (hasTalent("bard_heal_duration") && !options.encore ? 2 : 0);
  return {
    type: "bardHealingBallad",
    songType: "healing",
    r: 145 + (hasTalent("bard_hymn_radius") ? 18 : 0),
    ttl,
    maxTtl: ttl,
    healAmount: (options.encore ? 4 : 4) + (hasTalent("bard_heal_power") ? 3 : 0),
    armorBonus: hasTalent("bard_heal_armor") ? 2 : 0,
    color: "#ff9fc8",
  };
}

function startBardSong(songType, options = {}) {
  const settings = bardSongSettings(songType, options);
  abilityEffects = abilityEffects.filter((effect) => !isBardSongEffect(effect) || bardSongType(effect) !== settings.songType);
  abilityEffects.push({
    ...settings,
    x: player.x,
    y: player.y,
    pulseTimer: 0.12,
    healTimer: 0,
  });
  particles.push({ x: player.x, y: player.y - 44, text: settings.songType === "battle" ? "hymn" : settings.songType === "quickstep" ? "verse" : "ballad", color: settings.color, ttl: 0.8 });
}

function quickstepVerse() {
  const angle = movementOrAimAngle();
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.slide = {
    vx: Math.cos(angle) * player.stats.speed * 2.45,
    vy: Math.sin(angle) * player.stats.speed * 2.45,
    timer: 0.24,
  };
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.32);
  startBardSong("quickstep");
  abilityEffects.push({ type: "bardQuickstepTrail", x: player.x, y: player.y, angle, ttl: 0.34, maxTtl: 0.34 });
}

function powerChord() {
  const angle = aimAngle();
  const activeSongs = activeLocalBardSongTypes();
  const songCount = activeSongs.size;
  let multiplier = 1.3 + songCount * (hasTalent("bard_chord_harmonic") ? 0.3 : 0.2);
  if (hasTalent("bard_chord_damage")) multiplier += 0.25;
  if (hasTalent("bard_hymn_cap") && activeSongs.has("battle")) multiplier += 0.15;
  if (hasTalent("bard_chord_cap") && songCount >= 3) multiplier += 0.75;
  const range = 212;
  const halfAngle = Math.PI * 0.28;
  player.facing = getFacing(Math.cos(angle), Math.sin(angle));
  player.meleeAttackTimer = 0.26;
  player.meleeAttackAngle = angle;
  const hits = damageEnemiesInCone(player.x, player.y, angle, range, halfAngle, playerDamage(multiplier), "Power Chord");
  if (hits.length && hasTalent("bard_chord_extend")) extendBardSongs(0.75);
  if (hits.length && hasTalent("bard_chord_cap") && songCount >= 3) {
    const hitTargets = [];
    hits.forEach((target) => {
      damageEnemiesInRadius(target.x, target.y, 72, playerDamage(0.48), "Grand Finale", hitTargets);
    });
  }
  if (hasTalent("bard_chord_echo")) {
    player.bardChordCount = (player.bardChordCount || 0) + 1;
    if (player.bardChordCount % 2 === 0) {
      abilityEffects.push({
        type: "bardEchoNote",
        x: player.x,
        y: player.y,
        angle,
        range,
        halfAngle,
        damage: playerDamage(multiplier * 0.55),
        songs: songCount,
        delay: 0.18,
        triggered: false,
        ttl: 0.62,
        maxTtl: 0.62,
      });
      particles.push({ x: player.x, y: player.y - 52, text: "echo ready", color: "#92d4ff", ttl: 0.55 });
    }
  }
  abilityEffects.push({ type: "bardPowerChord", x: player.x, y: player.y, angle, range, songs: songCount, ttl: 0.3, maxTtl: 0.3 });
  particles.push({ x: player.x + Math.cos(angle) * 62, y: player.y + Math.sin(angle) * 62 - 20, text: hits.length ? "chord!" : "chord", color: "#ffd782", ttl: 0.55 });
}

function extendBardSongs(amount) {
  ownBardSongEffects().forEach((effect) => {
    effect.ttl = Math.min(effect.maxTtl + 1.5, effect.ttl + amount);
  });
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
  const targets = damageEnemiesInCone(player.x, player.y, angle, 122, Math.PI * 0.52, playerDamage(empowered ? (hasTalent("rogue_shadow_backstab") ? 2.22 : 1.85) : 1.05), empowered ? "Backstab" : "Twin Cut");
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
  const hits = damageEnemiesInRadius(target.x, target.y, radius, playerDamage(hasTalent("paladin_judgment_damage") ? 1.34 : 1.12), "Radiant Smite");
  hits.forEach((enemy) => {
    interruptTarget(enemy);
    if (hasTalent("paladin_judgment_cap") && enemy.judgmentTimer > 0) damageBossTarget(enemy, playerDamage(0.7), "Final Judgment");
    if (hasTalent("paladin_judgment_mark")) {
      enemy.judgmentTimer = 5;
      particles.push({ x: enemy.x, y: enemy.y - enemy.radius - 42, text: "judged", color: "#fff0bf", ttl: 0.7 });
      syncTargetStatus(enemy, "judgment");
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
    damage: playerDamage(blastMultiplier),
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

function damageTargetsInRadius(x, y, radius, amount, source, hitTargets = [], options = {}) {
  return livingBosses().filter((target) => {
    if (hitTargets.includes(target)) return false;
    if (distance({ x, y }, target) > radius + target.radius) return false;
    const hit = damageBossTarget(target, amount, source, options);
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

function damageEnemiesInRadius(x, y, radius, amount, source, hitTargets = [], options = {}) {
  const bossHits = damageTargetsInRadius(x, y, radius, amount, source, hitTargets, options);
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
  const hazardIds = [];
  hazards = hazards.filter((hazard) => {
    if (!isDestroyableProjectile(hazard)) return true;
    const dx = hazard.x - x;
    const dy = hazard.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist > range + (hazard.r || 0)) return true;
    if (Math.abs(angleDifference(Math.atan2(dy, dx), angle)) > halfAngle) return true;
    blocked += 1;
    const syncId = sharedHazardSyncId(hazard);
    if (syncId) hazardIds.push(syncId);
    abilityEffects.push({ type: "projectileBlock", x: hazard.x, y: hazard.y, r: (hazard.r || 10) + 10, ttl: 0.22, maxTtl: 0.22 });
    return false;
  });
  if (hazardIds.length) sendHazardControlIntent("destroy", hazardIds, { x, y, angle, range, halfAngle });
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
    syncTargetControl(target);
    return;
  }
  const point = clampArenaPoint(rawPoint.x, rawPoint.y, target.radius);
  target.x = point.x;
  target.y = point.y;
  target.destination = null;
  syncTargetControl(target);
}

function interruptTarget(target) {
  if (target.state !== "winding") return;
  target.state = "recovering";
  target.stateTimer = 0.45;
  target.attackTimer = Math.min(target.attackTimer || 1, 1.0);
  particles.push({ x: target.x, y: target.y - target.radius - 32, text: "interrupted", color: "#fff08a", ttl: 0.8 });
  syncTargetControl(target);
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
    playBigColaAnimation("colaBubbles", 0.95);
    spawnColaBubbles(boss.enraged ? 7 : boss.phase === 2 ? 6 : 5);
    log("Big Cola releases bubbles.");
  } else if (roll < 0.7) {
    playBigColaAnimation("colaStraw", 0.9);
    spawnStrawSnipe();
    log("Big Cola lines up a straw snipe.");
  } else {
    playBigColaAnimation("colaSpill", 0.95);
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
  playBigColaAnimation("colaFizz", 1.08);
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

function remoteHazardKey(hazardOrId) {
  if (!hazardOrId) return "";
  if (typeof hazardOrId === "string") return hazardOrId.startsWith("hazard:") ? hazardOrId : `hazard:${hazardOrId}`;
  if (hazardOrId.syncId) return remoteHazardKey(hazardOrId.syncId);
  return "";
}

function pruneConsumedRemoteHazards() {
  const now = performance.now();
  multiplayer.consumedRemoteHazards.forEach((expiresAt, key) => {
    if (!Number.isFinite(expiresAt) || expiresAt <= now) multiplayer.consumedRemoteHazards.delete(key);
  });
}

function isConsumedRemoteHazard(hazardOrId) {
  const key = remoteHazardKey(hazardOrId);
  return Boolean(key && multiplayer.consumedRemoteHazards.has(key));
}

function consumeRemoteHazard(hazard, ttlMs = 2200) {
  const key = remoteHazardKey(hazard);
  if (!key || !isRemoteSharedHazard(hazard)) return;
  multiplayer.consumedRemoteHazards.set(key, performance.now() + ttlMs);
  multiplayer.hostileNetState.delete(key);
  if (hazard.syncId) sendHazardControlIntent("destroy", [hazard.syncId], { x: hazard.x, y: hazard.y, radius: Math.max(72, (hazard.r || 10) + player.radius + 34) });
}

function localPlayerDamageId() {
  return multiplayer.id || "local-player";
}

function assignHazardSyncId(hazard, prefix = "h") {
  if (!hazard) return "";
  if (!hazard.syncId) {
    multiplayer.hazardSyncSeq += 1;
    hazard.syncId = `${multiplayer.id || "local"}-${prefix}${multiplayer.hazardSyncSeq}`;
  }
  if (!hazard.projectileId) hazard.projectileId = hazard.syncId;
  return hazard.syncId;
}

function ensureProjectileId(projectile) {
  if (!projectile) return "";
  if (projectile.projectileId) return String(projectile.projectileId);
  if (projectile.syncId) {
    projectile.projectileId = String(projectile.syncId);
    return projectile.projectileId;
  }
  return assignHazardSyncId(projectile, projectile.mazeHazard ? "g" : "h");
}

function projectileHitSet(projectile) {
  if (!projectile.hitPlayerIds) projectile.hitPlayerIds = new Set();
  if (projectile.hitPlayerIds instanceof Set) return projectile.hitPlayerIds;
  if (Array.isArray(projectile.hitPlayerIds)) {
    projectile.hitPlayerIds = new Set(projectile.hitPlayerIds.map(String));
    return projectile.hitPlayerIds;
  }
  projectile.hitPlayerIds = new Set(Object.values(projectile.hitPlayerIds || {}).map(String));
  return projectile.hitPlayerIds;
}

function markProjectileHitPlayer(projectile, playerId, source) {
  const projectileId = ensureProjectileId(projectile);
  if (!projectileId || !playerId) return false;
  const hitPlayerIds = projectileHitSet(projectile);
  if (hitPlayerIds.has(playerId)) {
    recordDebugEvent("projectile-damage-ignored", { projectileId, playerId, source, reason: "projectile-hit-set" });
    return false;
  }
  hitPlayerIds.add(playerId);
  recordDebugEvent("projectile-damage-candidate", { projectileId, playerId, source, applied: true });
  return true;
}

function isServerMediatedProjectileDamageActive() {
  return isMultiplayerGame() && multiplayer.connected && multiplayer.room?.state === "inGame";
}

function damagePlayerFromProjectile(projectile, amount, source, options = {}) {
  const playerId = localPlayerDamageId();
  const projectileId = ensureProjectileId(projectile);
  if (!projectileId || !markProjectileHitPlayer(projectile, playerId, source)) return false;
  const piercing = Boolean(options.piercing || projectile.piercing);
  if (isServerMediatedProjectileDamageActive()) {
    sendServer({
      type: "projectile-hit",
      projectileId,
      playerId,
      amount,
      source,
      fixed: Boolean(options.fixed),
      ignoreOverlapGrace: Boolean(options.ignoreOverlapGrace),
      piercing,
      room: player.room,
      bossKind: boss.kind,
      phaseSeq: multiplayer.phaseSeq,
    });
    recordDebugEvent("projectile-hit-requested", { projectileId, playerId, source, piercing });
    return true;
  }
  return damagePlayer(amount, source, { ...options, projectileId, authoritativeProjectileDamage: true });
}

function applyAuthoritativeProjectileDamage(message) {
  if (!message?.projectileId || message.playerId !== multiplayer.id) return;
  damagePlayer(Number(message.amount) || 0, message.source || "Projectile", {
    fixed: Boolean(message.fixed),
    ignoreOverlapGrace: Boolean(message.ignoreOverlapGrace),
    projectileId: String(message.projectileId),
    authoritativeProjectileDamage: true,
  });
}

function updateHazards(dt) {
  const spawnedHazards = [];
  pruneConsumedRemoteHazards();
  hazards = hazards.filter((hazard) => {
    if (hazard.mazeHazard && player.room !== "maze") {
      return false;
    }
    if (isConsumedRemoteHazard(hazard)) return false;
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
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Maze shot");
        consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Maze hazard", { piercing: true });
          if (hazard.chill) addChillStack();
        }
      }
    } else if (hazard.type === "mazeWall") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && isPlayerInMazeWall(hazard)) {
        hazard.hit = true;
        damagePlayerFromProjectile(hazard, hazard.damage, "Maze wall", { piercing: true });
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Pico de gallo storm");
          consumeRemoteHazard(hazard);
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
        damagePlayerFromProjectile(hazard, hazard.damage, "Tortilla chip");
        consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Delivery dash", { piercing: true });
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
        damagePlayerFromProjectile(hazard, hazard.damage, "Pizza slice");
        consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Returning pizza slice");
          consumeRemoteHazard(hazard);
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
        damagePlayerFromProjectile(hazard, hazard.damage, "Oven zone", { piercing: true });
      }
    } else if (hazard.type === "pizzaBoxSlam") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        damagePlayerFromProjectile(hazard, hazard.damage, "Pizza box slam", { piercing: true });
      }
    } else if (hazard.type === "colaBubble") {
      hazard.ttl -= dt;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.vx += (Math.random() - 0.5) * 22 * dt;
      hazard.vy += (Math.random() - 0.5) * 22 * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        popColaBubble(hazard);
        consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Straw snipe", { piercing: true });
        }
      }
    } else if (hazard.type === "fizzBurst") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (distance(player, hazard) < hazard.r) {
          damagePlayerFromProjectile(hazard, hazard.damage, "Fizz burst", { piercing: true });
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Chocolate bar", { fixed: hazard.fixedDamage, piercing: true });
        }
      }
    } else if (hazard.type === "scoopDrop") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (distance(player, hazard) < player.radius + hazard.r) {
          damagePlayerFromProjectile(hazard, hazard.damage, "Ice cream scoop", { piercing: true });
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Crunch Charge", { piercing: true });
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Shell shard");
          consumeRemoteHazard(hazard);
          hazard.ttl = 0;
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
          damagePlayerFromProjectile(hazard, hazard.ingredient === "beef" ? 18 : 12, `${hazard.ingredient} drop`);
          consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Shell Slam", { piercing: true });
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
        damagePlayerFromProjectile(hazard, hazard.damage, "Lettuce fan");
        consumeRemoteHazard(hazard);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Glaze ring", { piercing: true });
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Royal Roll", { piercing: true });
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
    } else if (hazard.type === "wasabiDash") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      boss.attackTimer = Math.max(boss.attackTimer, 0.45);
      if (hazard.warn <= 0) {
        if (boss.kind === "sushi") setSushiAnimation("dash", 0.34);
        hazard.dashAge += dt;
        const progress = clamp(hazard.dashAge / hazard.dashDuration, 0, 1);
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
          damagePlayerFromProjectile(hazard, hazard.damage, "Wasabi Dash", { piercing: true });
          knockPlayerFrom(hazard.prevX, hazard.prevY, 260);
        }
        if (!remoteBossHazard && (boss.sushiDashTrailTimer || 0) <= 0) {
          hazards.push({
            type: "wasabiTrail",
            x: hazard.x,
            y: hazard.y,
            r: boss.enraged ? 42 : 34,
            warn: 0,
            ttl: boss.enraged ? 3.2 : 2.8,
            damage: boss.enraged ? 5 : 4,
            damageTimer: 0,
          });
          boss.sushiDashTrailTimer = 0.08;
        }
        if (progress >= 1) hazard.ttl = Math.min(hazard.ttl, 0.14);
      }
    } else if (hazard.type === "wasabiTrail") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r) {
        hazard.damageTimer -= dt;
        if (hazard.damageTimer <= 0) {
          damagePlayer(hazard.damage, "Wasabi trail");
          hazard.damageTimer = 0.52;
        }
      }
    } else if (hazard.type === "chopstickJab") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
          damagePlayerFromProjectile(hazard, hazard.damage, "Chopstick Jab", { piercing: true });
          particles.push({ x: player.x, y: player.y - 22, text: "jab", color: "#ffb0a4", ttl: 0.45 });
        }
      }
    } else if (hazard.type === "sushiRoll") {
      hazard.ttl -= dt;
      if (hazard.turn) {
        const speed = Math.hypot(hazard.vx, hazard.vy);
        const angle = Math.atan2(hazard.vy, hazard.vx) + hazard.turn * dt;
        hazard.vx = Math.cos(angle) * speed;
        hazard.vy = Math.sin(angle) * speed;
      }
      hazard.spin += dt * 9;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayerFromProjectile(hazard, hazard.damage, "Roll Barrage");
        consumeRemoteHazard(hazard);
        hazard.ttl = 0;
      }
    } else if (hazard.type === "soySakeWave") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      hazard.age = (hazard.age || 0) + dt;
      hazard.textureOffset = (hazard.textureOffset || 0) + dt * 90;
      if (hazard.warn <= 0) {
        hazard.activeAge = (hazard.activeAge || 0) + dt;
        const shape = soySakeWaveShape(hazard);
        const moveScale = shape.fadeProgress > 0 ? 1 - shape.fadeProgress * 0.65 : 1;
        hazard.x += Math.cos(hazard.angle) * hazard.speed * dt * moveScale;
        hazard.y += Math.sin(hazard.angle) * hazard.speed * dt * moveScale;
        hazard.damageTimer -= dt;
        if (shape.damageActive && soySakeWaveTouchesPlayer(hazard, shape)) {
          player.freezeTimer = Math.max(player.freezeTimer, 0.08);
          if (hazard.damageTimer <= 0) {
            damagePlayer(hazard.damage, "Soy Sake Wave");
            hazard.damageTimer = 0.62;
          }
        }
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
            damagePlayerFromProjectile(hazard, hazard.damage, "Wasabi wave", { piercing: true });
          }
        } else {
          hazard.y += hazard.speed * hazard.direction * dt;
          hazard.lane = hazard.y;
          if (!hazard.hit && Math.abs(player.y - hazard.y) < hazard.width + player.radius) {
            hazard.hit = true;
            damagePlayerFromProjectile(hazard, hazard.damage, "Wasabi wave", { piercing: true });
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
        if (hit) damagePlayerFromProjectile(hazard, hazard.damage, "Chopstick pin", { piercing: true });
      }
    } else if (hazard.type === "serpentSweep") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        if (isPlayerInLine(hazard.x, hazard.y, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
          damagePlayerFromProjectile(hazard, hazard.damage, "Segment sweep", { piercing: true });
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
    } else if (hazard.type === "burgerQueuedAttack") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.spawned) {
        hazard.spawned = true;
        spawnBigBurgerAttack(hazard.kind);
        hazard.ttl = 0;
      }
    } else if (hazard.type === "tomatoSlice") {
      hazard.ttl -= dt;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.angle = Math.atan2(hazard.vy, hazard.vx);
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Tomato slice");
        knockPlayerFrom(hazard.x - hazard.vx * dt, hazard.y - hazard.vy * dt, hazard.knockback || 250);
        consumeRemoteHazard(hazard);
        hazard.ttl = 0;
      }
    } else if (hazard.type === "pickleSplash") {
      hazard.ttl -= dt;
      hazard.age = (hazard.age || 0) + dt;
      const progress = clamp(hazard.age / Math.max(0.1, hazard.flightTime || 0.65), 0, 1);
      const previousX = hazard.x;
      const previousY = hazard.y;
      hazard.x = hazard.startX + (hazard.targetX - hazard.startX) * progress;
      hazard.y = hazard.startY + (hazard.targetY - hazard.startY) * progress;
      hazard.vx = (hazard.x - previousX) / Math.max(dt, 0.001);
      hazard.vy = (hazard.y - previousY) / Math.max(dt, 0.001);
      hazard.angle = Math.atan2(hazard.vy || 0, hazard.vx || 1);
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Pickle splash");
        consumeRemoteHazard(hazard);
        turnBurgerPickleIntoPuddle(hazard);
      } else if (progress >= 1) {
        if ((hazard.bounces || 0) > 0) {
          bounceBurgerPickle(hazard);
        } else {
          turnBurgerPickleIntoPuddle(hazard);
        }
      }
    } else if (hazard.type === "picklePuddle") {
      hazard.ttl -= dt;
      if (distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        player.pickleSlowTimer = Math.max(player.pickleSlowTimer || 0, hazard.slowDuration || 0.16);
      }
    } else if (hazard.type === "onionRing") {
      hazard.ttl -= dt;
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.spin = (hazard.spin || 0) + dt * (hazard.turn || 8);
      hazard.angle = hazard.spin;
      const dist = distance(player, hazard);
      if (dist < (hazard.outer || hazard.r) + player.radius && dist > (hazard.inner || 10) - player.radius && !player.dead) {
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Onion ring");
        knockPlayerFrom(hazard.x, hazard.y, hazard.knockback || 190);
        consumeRemoteHazard(hazard);
        hazard.ttl = 0;
      }
    } else if (hazard.type === "burgerSauceDrop") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        hazard.hit = true;
        hazard.type = "burgerSauceBurst";
        hazard.ttl = 0.36;
        hazard.warn = 0;
        hazard.r = Math.max(hazard.r || 46, boss.enraged ? 62 : 56);
        if (!remoteBossHazard) particles.push({ x: hazard.x, y: hazard.y - 18, text: "splash", color: "#ffd06a", ttl: 0.45 });
      }
    } else if (hazard.type === "burgerSauceBurst") {
      hazard.ttl -= dt;
      if (!hazard.hitPlayer && distance(player, hazard) < player.radius + hazard.r && !player.dead) {
        hazard.hitPlayer = true;
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Sauce burst", { piercing: true });
      }
    } else if (hazard.type === "burgerChargeLane") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && isPlayerInLine(hazard.startX, hazard.startY, hazard.angle, hazard.length, hazard.width / 2 + player.radius)) {
        hazard.hit = true;
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Burger charge", { piercing: true });
        knockPlayerFrom(hazard.startX, hazard.startY, boss.enraged ? 360 : 300);
      }
    } else if (hazard.type === "burgerBurstRing") {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit) {
        const dist = distance(player, hazard);
        const angleToPlayer = Math.atan2(player.y - hazard.y, player.x - hazard.x);
        const inGap = Math.abs(angleDifference(angleToPlayer, hazard.gapAngle)) < (hazard.gapWidth || 0.9) / 2;
        if (dist < hazard.r + player.radius && dist > (hazard.inner || 0) - player.radius && !inGap && !player.dead) {
          hazard.hit = true;
          damagePlayerFromProjectile(hazard, hazard.damage, hazard.source || "Ingredient burst", { piercing: true });
          knockPlayerFrom(hazard.x, hazard.y, boss.enraged ? 360 : 285);
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
        damagePlayerFromProjectile(hazard, hazard.damage, source, { fixed: hazard.fixedDamage });
        if (hazard.type === "peanut" && boss.kind === "shake" && boss.phase >= 2) addChillStack();
        consumeRemoteHazard(hazard);
        hazard.ttl = 0;
      }
    } else {
      hazard.ttl -= dt;
      hazard.warn -= dt;
      if (hazard.warn <= 0 && !hazard.hit && distance(player, hazard) < player.radius + hazard.r) {
        hazard.hit = true;
        damagePlayerFromProjectile(hazard, hazard.damage, hazard.type === "slam" ? "Ground slam" : "Furnace vent", { piercing: true });
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
    damagePlayerFromProjectile(hazard, hazard.damage, "Bubble pop", { piercing: true });
  }
}

function bounceBurgerPickle(hazard) {
  const target = bossAimTarget(hazard);
  const next = clampArenaPoint(
    hazard.x + (target.x - hazard.x) * 0.45 + (Math.random() - 0.5) * 150,
    hazard.y + (target.y - hazard.y) * 0.45 + (Math.random() - 0.5) * 150,
    hazard.r || 16,
  );
  hazard.startX = hazard.x;
  hazard.startY = hazard.y;
  hazard.targetX = next.x;
  hazard.targetY = next.y;
  hazard.age = 0;
  hazard.flightTime = boss.enraged ? 0.42 : 0.5;
  hazard.arcHeight = Math.max(45, (hazard.arcHeight || 82) * 0.72);
  hazard.bounces = Math.max(0, (hazard.bounces || 0) - 1);
  hazard.vx = (hazard.targetX - hazard.startX) / hazard.flightTime;
  hazard.vy = (hazard.targetY - hazard.startY) / hazard.flightTime;
}

function turnBurgerPickleIntoPuddle(hazard) {
  hazard.type = "picklePuddle";
  hazard.vx = 0;
  hazard.vy = 0;
  hazard.r = boss.enraged ? 54 : 48;
  hazard.ttl = boss.enraged ? 4.4 : 3.6;
  hazard.warn = 0;
  hazard.damage = 0;
  hazard.slowDuration = 0.18;
  hazard.source = "Pickle puddle";
  if (!isRemoteBossHazard(hazard)) particles.push({ x: hazard.x, y: hazard.y - 16, text: "slow", color: "#dfff71", ttl: 0.45 });
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
  if (shouldSendBossSubtargetIntent()) {
    sendBossSubtargetIntent("donut-hole", {
      targetId: hole.id,
      baseAmount: projectile.damage,
      popDamage: playerDamage(1.4),
      source: "Shot",
    });
    particles.push({ x: hole.x, y: hole.y - 24, text: "hit", color: "#ffb6d1", ttl: 0.45 });
    return true;
  }
  const damage = Math.ceil(projectile.damage * 0.9);
  hole.hp = Math.max(0, hole.hp - damage);
  particles.push({ x: hole.x, y: hole.y - 24, text: `-${damage}`, color: "#ffb6d1", ttl: 0.65 });
  if (hole.hp <= 0) {
    boss.shieldTimer = 0;
    damageBossTarget(boss, playerDamage(1.4), "Donut hole pop");
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

function damageDonutMinion(minion, amount, source, options = {}) {
  if (!minion || minion.hp <= 0) return false;
  if (shouldSendBossSubtargetIntent() && !options.remote) {
    sendBossSubtargetIntent("donut-minion", {
      targetId: minion.id,
      baseAmount: amount,
      source,
    });
    particles.push({ x: minion.x, y: minion.y - 24, text: "hit", color: "#ffd7e8", ttl: 0.45 });
    return true;
  }
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
  if (shouldSendBossSubtargetIntent()) {
    sendBossSubtargetIntent("sushi-segment", {
      segmentIndex: segment.index,
      baseAmount: projectile.damage,
      source: "Shot",
    });
    particles.push({ x: segment.x, y: segment.y - 24, text: "hit", color: "#9ff089", ttl: 0.45 });
    return true;
  }
  const damage = segment.weak ? Math.ceil(projectile.damage * 1.8) : Math.ceil(projectile.damage * 0.82);
  damageBossTarget(boss, damage, segment.weak ? "Weak segment" : "Sushi segment");
  if (segment.weak) {
    boss.serpentWeakIndex = 1 + ((segment.index + 2) % Math.max(2, sushiSegmentCount() - 2));
    boss.serpentWeakTimer = boss.enraged ? 1.5 : 2.15;
    boss.sushiWeakFlashTimer = 0.42;
    setSushiAnimation("weak", 0.38);
    particles.push({ x: segment.x, y: segment.y - 34, text: "weak", color: "#9ff089", ttl: 0.75 });
  }
  return true;
}

function damagePlayer(amount, source, options = {}) {
  if (options.projectileId) {
    const projectileId = String(options.projectileId);
    if (!(player.recentlyHitProjectileIds instanceof Set)) {
      player.recentlyHitProjectileIds = new Set(Array.isArray(player.recentlyHitProjectileIds) ? player.recentlyHitProjectileIds.map(String) : []);
    }
    if (player.recentlyHitProjectileIds.has(projectileId)) {
      recordDebugEvent("player-projectile-damage-ignored", { projectileId, playerId: localPlayerDamageId(), source });
      return false;
    }
    player.recentlyHitProjectileIds.add(projectileId);
  }
  if (player.invulnerableTimer > 0) {
    particles.push({ x: player.x, y: player.y - 35, text: "evade", color: "#ffd782", ttl: 0.55 });
    return false;
  }
  let hit = options.fixed ? amount : Math.max(1, Math.ceil(amount * combatTuning.incomingDamageMultiplier - effectivePlayerArmor()));
  const now = performance.now();
  if (player.lastDamageAt && now - player.lastDamageAt < combatTuning.overlapDamageWindowMs && !options.ignoreOverlapGrace) {
    hit = Math.max(1, Math.ceil(hit * combatTuning.overlapDamageMultiplier));
  }
  if (player.shieldWallTimer > 0) hit = Math.max(1, Math.ceil(hit * (hasTalent("melee_iron_wall") || hasTalent("paladin_guard_mitigation") ? 0.4 : 0.5)));
  if (player.consecrationTimer > 0) hit = Math.max(1, Math.ceil(hit * 0.78));
  if (hit >= player.hp && triggerTalentLethalSave(source)) return false;
  player.hp = Math.max(0, player.hp - hit);
  player.lastDamageAt = now;
  if (options.projectileId) recordDebugEvent("player-projectile-damage-applied", { projectileId: String(options.projectileId), playerId: localPlayerDamageId(), source, hit });
  runTalentHook("onDamageTaken", { amount, hit, source, options });
  particles.push({ x: player.x, y: player.y - 35, text: `-${hit}`, color: "#ff8f7e", ttl: 0.8 });
  if (player.hp <= 0) {
    enterDeathState(source);
  }
  return true;
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
  if (!isPartySyncActive()) hazards = [];
  playerProjectiles = [];
  remoteProjectiles = [];
  abilityEffects = [];
  remoteAbilityEffects = [];
  Object.keys(movementKeys).forEach((direction) => {
    movementKeys[direction] = false;
  });
  log(`${source} stuffed you.`);
  if (activateSpectateMode(source)) return;
  ui.status.textContent = "You're Stuffed. Continue to revive without restarting.";
  showFloat("You're Stuffed");
}

function continueRunFromDeath() {
  if (!player.dead) return;
  resetSpectateState();
  player.dead = false;
  player.hp = player.maxHp;
  player.destination = null;
  player.slide = null;
  player.moving = false;
  player.attackCooldown = 0;
  player.abilityCooldowns = [0, 0, 0, 0];
  player.castTimer = 0;
  player.castMoveLockTimer = 0;
  player.pendingAbilityCast = null;
  player.rangerAttackTimer = 0;
  player.meleeAttackTimer = 0;
  player.rogueAttackTimer = 0;
  player.tumbleTimer = 0;
  player.invulnerableTimer = 2.4;
  player.shieldWallTimer = 0;
  player.consecrationTimer = 0;
  player.guardSpeedTimer = 0;
  player.tacoGreaseTimer = 0;
  player.pickleSlowTimer = 0;
  player.backstabTimer = 0;
  player.deadeyeTimer = 0;
  player.bardHealTickTimer = 0;
  player.lastDamageAt = 0;
  player.recentlyHitProjectileIds = new Set();
  Object.keys(movementKeys).forEach((direction) => {
    movementKeys[direction] = false;
  });
  mouseWorld = { x: player.x + player.lastMoveX * 120, y: player.y + player.lastMoveY * 120 };
  ui.status.textContent = "Continued. Your run progress is intact.";
  showFloat("Continue");
  log("Continued from defeat.");
  sendMultiplayerState(true);
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
  remoteAbilityEffects = [];
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
  player.pickleSlowTimer = Math.max(0, (player.pickleSlowTimer || 0) - dt);
  player.backstabTimer = Math.max(0, player.backstabTimer - dt);
  player.deadeyeTimer = Math.max(0, (player.deadeyeTimer || 0) - dt);

  livingBosses().forEach((target) => {
    if (!isPartySyncActive() || isMultiplayerHost()) {
      target.markedTimer = Math.max(0, (target.markedTimer || 0) - dt);
      if (target.markedTimer <= 0) target.markedShots = 0;
      updateRogueDebuffs(target, dt);
    }
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
    if (effect.type === "bardEchoNote") updateBardEchoNote(effect, dt);
    if (effect.type === "divineBulwark") {
      effect.x = player.x;
      effect.y = player.y;
    }
    if (isBardSongEffect(effect)) updateBardSongEffect(effect, dt);
    return effect.ttl > 0;
  });
  updateBardSongBuffs(dt);
  applyTimeWarpSlow(dt);
}

function updateBardEchoNote(effect, dt) {
  effect.delay = Math.max(0, (effect.delay || 0) - dt);
  if (effect.triggered || effect.delay > 0) return;
  effect.triggered = true;
  const hits = damageEnemiesInCone(effect.x, effect.y, effect.angle, effect.range, effect.halfAngle, effect.damage, "Echo Note");
  particles.push({
    x: effect.x + Math.cos(effect.angle) * 82,
    y: effect.y + Math.sin(effect.angle) * 82 - 22,
    text: hits.length ? "echo!" : "echo",
    color: "#92d4ff",
    ttl: 0.62,
  });
}

function updateBardSongEffect(effect, dt) {
  effect.x = player.x;
  effect.y = player.y;
  effect.pulseTimer = (effect.pulseTimer || 0) - dt;
  if (effect.pulseTimer > 0) return;
  effect.pulseTimer = effect.type === "bardQuickstepVerse" ? 0.38 : 0.52;
  const angle = Math.random() * Math.PI * 2;
  const radius = 18 + Math.random() * Math.max(18, effect.r - 28);
  const symbol = effect.type === "bardHealingBallad" ? "♪" : effect.type === "bardBattleHymn" ? "♫" : "♩";
  particles.push({
    x: effect.x + Math.cos(angle) * radius,
    y: effect.y + Math.sin(angle) * radius - 18,
    text: symbol,
    color: effect.color || "#ffd782",
    ttl: 0.42,
  });
}

function updateBardSongBuffs(dt) {
  if (isBardBuild() && hasTalent("bard_heal_cap") && !player.talentSaves.encoreRecovery && !player.dead && player.room !== "starter" && player.hp > 0 && player.hp <= player.maxHp * 0.34) {
    player.talentSaves.encoreRecovery = true;
    startBardSong("healing", { encore: true });
    particles.push({ x: player.x, y: player.y - 52, text: "Encore Recovery", color: "#ffb6d1", ttl: 1 });
  }
  const healAmount = strongestBardSongValue("healing", "healAmount");
  if (healAmount <= 0 || player.dead) {
    player.bardHealTickTimer = 0;
    return;
  }
  player.bardHealTickTimer = (player.bardHealTickTimer || 1) - dt;
  if (player.bardHealTickTimer > 0) return;
  player.bardHealTickTimer = 1;
  const before = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + healAmount);
  if (player.hp > before) particles.push({ x: player.x, y: player.y - 48, text: `+${Math.round(player.hp - before)}`, color: "#ffb6d1", ttl: 0.65 });
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
      damageBossTarget(target, target.poisonStacks * (target.poisonDamagePerStack || roguePoisonDamagePerStack()), "Poison", { poison: true });
    }
  }
  target.bleedTimer = Math.max(0, (target.bleedTimer || 0) - dt);
  if (target.bleedTimer > 0) {
    target.bleedTickTimer = (target.bleedTickTimer || 0.5) - dt;
    if (target.bleedTickTimer <= 0) {
      target.bleedTickTimer += 0.5;
      damageBossTarget(target, target.bleedDamage || (hasTalent("melee_blood_deep") ? 6 : 4), "Bleed");
    }
  }
  target.burnTimer = Math.max(0, (target.burnTimer || 0) - dt);
  if (target.burnTimer > 0) {
    target.burnTickTimer = (target.burnTickTimer || 0.5) - dt;
    if (target.burnTickTimer <= 0) {
      target.burnTickTimer += 0.5;
      damageBossTarget(target, target.burnDamage || playerDamage(0.12), "Burn");
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
    damage: playerDamage(hasTalent("ranger_trap_damage") ? 0.68 : 0.5),
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
  damageEnemiesInRadius(effect.x, effect.y, effect.r, playerDamage(effect.damageMultiplier || 0.42), "Arrow Storm");
}

function updateMeteorField(effect, dt) {
  effect.impactTimer -= dt;
  if (effect.impactTimer > 0) return;
  effect.impactTimer = effect.impactInterval || 0.32;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * effect.r;
  const x = effect.x + Math.cos(angle) * radius;
  const y = effect.y + Math.sin(angle) * radius;
  damageEnemiesInRadius(x, y, 58 + (hasTalent("mage_meteor_cap") ? 20 : 0), playerDamage(hasTalent("mage_meteor_cap") ? 0.98 : 0.75), "Meteor Field");
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
  const hits = damageEnemiesInRadius(effect.x, effect.y, effect.r, playerDamage(0.34), "Poison Cloud");
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
    damageEnemiesInRadius(effect.x, effect.y, effect.r, playerDamage(hasTalent("paladin_consecrate_damage") ? 0.5 : 0.38), "Consecration");
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
  const hits = damageEnemiesInRadius(effect.x, effect.y, effect.r, playerDamage(0.7), "Aftershock");
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
  const hazardIds = [];
  hazards.forEach((hazard) => {
    if (!hazard.r || hazard.r > 11 || !Number.isFinite(hazard.ttl)) return;
    if (distance(effect, hazard) < effect.r + hazard.r) {
      const syncId = sharedHazardSyncId(hazard);
      if (syncId) hazardIds.push(syncId);
      hazard.ttl = 0;
      particles.push({ x: hazard.x, y: hazard.y - 10, text: "cleared", color: "#bafcff", ttl: 0.45 });
    }
  });
  if (hazardIds.length) sendHazardControlIntent("destroy", hazardIds, { x: effect.x, y: effect.y, radius: effect.r });
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
  const hazardIds = [];
  hazards.forEach((hazard) => {
    if (!Number.isFinite(hazard.vx) || !Number.isFinite(hazard.vy)) return;
    if (distance(effect, hazard) < effect.r + (hazard.r || 0)) {
      const syncId = sharedHazardSyncId(hazard);
      if (syncId) hazardIds.push(syncId);
      hazard.vx *= Math.pow(0.5, dt);
      hazard.vy *= Math.pow(0.5, dt);
      if (!hazard.smokeWeakened && Number.isFinite(hazard.damage)) {
        hazard.damage = Math.max(1, Math.ceil(hazard.damage * 0.75));
        hazard.smokeWeakened = true;
      }
    }
  });
  effect.hazardControlTimer = Math.max(0, (effect.hazardControlTimer || 0) - dt);
  if (hazardIds.length && effect.hazardControlTimer <= 0) {
    effect.hazardControlTimer = 0.2;
    sendHazardControlIntent("slow-weaken", hazardIds, { x: effect.x, y: effect.y, radius: effect.r, factor: 0.82, damageFactor: 0.75 });
  }
  if (hasTalent("rogue_smoke_poison")) {
    effect.pulseTimer = (effect.pulseTimer || 0) - dt;
    if (effect.pulseTimer <= 0) {
      effect.pulseTimer = 0.7;
      damageEnemiesInRadius(effect.x, effect.y, effect.r, playerDamage(0.18), "Noxious Smoke").forEach((target) => applyPoisonStack(target));
    }
  }
}

function applyTimeWarpSlow(dt) {
  const timeWarp = activeTimeWarp();
  if (!timeWarp) return;
  const decay = Math.pow(0.1, dt);
  const hazardIds = [];
  hazards.forEach((hazard) => {
    if (!Number.isFinite(hazard.vx) || !Number.isFinite(hazard.vy)) return;
    if (distance(timeWarp, hazard) < timeWarp.r + (hazard.r || 0)) {
      const syncId = sharedHazardSyncId(hazard);
      if (syncId) hazardIds.push(syncId);
      hazard.vx *= decay;
      hazard.vy *= decay;
    }
  });
  timeWarp.hazardControlTimer = Math.max(0, (timeWarp.hazardControlTimer || 0) - dt);
  if (hazardIds.length && timeWarp.hazardControlTimer <= 0) {
    timeWarp.hazardControlTimer = 0.2;
    sendHazardControlIntent("slow", hazardIds, { x: timeWarp.x, y: timeWarp.y, radius: timeWarp.r, factor: 0.35 });
  }
}

function activeTimeWarp() {
  return abilityEffects.find((effect) => effect.type === "timeWarp" && effect.ttl > 0) || null;
}

function playerInTimeWarp() {
  const timeWarp = activeTimeWarp();
  return Boolean(timeWarp && distance(player, timeWarp) < timeWarp.r + player.radius);
}

function runUpdateStep(area, step) {
  try {
    return step();
  } catch (error) {
    reportRuntimeError(error, { area });
    return undefined;
  }
}

function update(dt) {
  runUpdateStep("movePlayer", () => movePlayer(dt));
  runUpdateStep("playerTimers", () => {
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.castTimer = Math.max(0, player.castTimer - dt);
    player.rangerAttackTimer = Math.max(0, player.rangerAttackTimer - dt);
    player.meleeAttackTimer = Math.max(0, player.meleeAttackTimer - dt);
    player.rogueAttackTimer = Math.max(0, player.rogueAttackTimer - dt);
  });
  runUpdateStep("heldPrimaryAttack", updateHeldPrimaryAttack);
  runUpdateStep("updateAbilities", () => updateAbilities(dt));
  runUpdateStep("updateTrainingDummy", () => updateTrainingDummy(dt));
  runUpdateStep("updateRoom", () => updateRoom(dt));
  runUpdateStep("updateMazeCombat", () => updateMazeCombat(dt));
  runUpdateStep("updateCombat", () => updateCombat(dt));
  runUpdateStep("updateHazards", () => updateHazards(dt));
  runUpdateStep("updatePlayerProjectiles", () => updatePlayerProjectiles(dt));
  runUpdateStep("updateRemoteProjectiles", () => updateRemoteProjectiles(dt));
  runUpdateStep("remoteEffects", () => {
    remoteAbilityEffects = remoteAbilityEffects.filter((effect) => {
      effect.ttl -= dt;
      effect.age = (effect.age || 0) + dt;
      return effect.ttl > 0;
    });
    particles = particles.filter((particle) => {
      particle.ttl -= dt;
      particle.y -= 28 * dt;
      return particle.ttl > 0;
    });
  });
  runUpdateStep("trimTransientVisuals", trimTransientVisuals);
  runUpdateStep("uiTimers", () => {
    floatTimer -= dt;
    if (floatTimer <= 0) ui.floatText.textContent = "";
    if (screenBanner) {
      screenBanner.timer -= dt;
      if (screenBanner.timer <= 0) screenBanner = null;
    }
  });
  runUpdateStep("updateMultiplayer", () => updateMultiplayer(dt));
  runUpdateStep("camera", () => {
    const cameraTarget = player.dead && isPartySyncActive() ? spectateCameraPoint() : player;
    camera.x = clamp(cameraTarget.x - canvas.clientWidth / 2, 0, world.width - canvas.clientWidth);
    camera.y = clamp(cameraTarget.y - canvas.clientHeight / 2, 0, world.height - canvas.clientHeight);
  });
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

function trimTransientVisuals() {
  if (particles.length > maxParticles) particles = particles.slice(-maxParticles);
  if (remoteProjectiles.length > maxRemoteProjectiles) remoteProjectiles = remoteProjectiles.slice(-maxRemoteProjectiles);
  if (remoteAbilityEffects.length > maxRemoteAbilityEffects) remoteAbilityEffects = remoteAbilityEffects.slice(-maxRemoteAbilityEffects);
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
          damageBossTarget(hitMazeEnemy, projectile.damage, projectile.ability ? "Ability" : "Shot", {
            markedBonus,
            rangedBasic: projectile.tag === "Ranged" && !projectile.ability,
            markedMultiplier: 1.45,
          });
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
        damageBossTarget(hitBoss, projectile.damage, projectile.ability ? "Ability" : "Shot", {
          markedBonus,
          rangedBasic: projectile.tag === "Ranged" && !projectile.ability,
          markedMultiplier: hasTalent("ranger_deadeye_damage") ? 1.7 : 1.45,
        });
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
  syncTargetStatus(target, "mark");
}

function damageBossTarget(target, amount, source, options = {}) {
  if (!target || target.hp <= 0) return false;
  if (target.kind === "trainingDummy") return damageTrainingDummy(target, amount, source);
  if (shouldSendHostHitIntent(target, source, options)) {
    sendHitIntent(target, amount, source, damageIntentOptions(source, options));
    particles.push({ x: target.x, y: target.y - 40, text: "hit", color: "#ffe08a", ttl: 0.45 });
    return true;
  }
  return applyDamageBossTargetLocal(target, amount, source, options);
}

function shouldSendHostHitIntent(target, source, options = {}) {
  return isPartySyncActive()
    && !isMultiplayerHost()
    && !options.remote
    && source !== "Co-op"
    && target.kind !== "trainingDummy"
    && Boolean(targetSyncDescriptor(target));
}

function damageIntentOptions(source, options = {}) {
  const deadeye = !options.poison && source === "Shot" && player.deadeyeTimer > 0;
  const meleeBleed = !options.poison && source === "Shot" && hasTalent("melee_blood_bleed") && currentClassKey() === "melee";
  const bardPowerChord = source === "Power Chord" || source === "Grand Finale";
  if (deadeye) {
    player.deadeyeTimer = 0;
    particles.push({ x: player.x, y: player.y - 42, text: "deadeye", color: "#ffd782", ttl: 0.7 });
  }
  return {
    poison: Boolean(options.poison),
    tacoBypassGuard: Boolean(options.tacoBypassGuard),
    markedBonus: Boolean(options.markedBonus),
    rangedBasic: Boolean(options.rangedBasic),
    markedMultiplier: Number(options.markedMultiplier) || 1,
    deadeye,
    meleeBleed,
    bardPowerChord,
    bardSongCount: bardPowerChord ? activeLocalBardSongTypes().size : 0,
    bleedTimer: meleeBleed ? 4 + (hasTalent("melee_blood_deep") ? 2 : 0) : 0,
    bleedDamage: meleeBleed ? (hasTalent("melee_blood_deep") ? 6 : 4) : 0,
  };
}

function sendHitIntent(target, amount, source, options = {}) {
  const descriptor = targetSyncDescriptor(target);
  if (!descriptor) return;
  multiplayer.intentSeq += 1;
  sendMultiplayerEvent({
    kind: "hit-intent",
    seq: multiplayer.intentSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    ...descriptor,
    source,
    baseAmount: amount,
    options,
  });
}

function applyDamageBossTargetLocal(target, amount, source, options = {}) {
  if (target.kind === "donut" && target.donutGauntletActive) {
    particles.push({ x: world.arena.x + world.arena.w / 2, y: world.arena.y + 70, text: "offscreen", color: "#ffd7e8", ttl: 0.7 });
    return false;
  }
  if (target.kind === "nacho" && target.invulnerableTimer > 0) {
    particles.push({ x: target.x, y: target.y - 44, text: "immune", color: "#fff2c6", ttl: 0.75 });
    return false;
  }
  let tunedAmount = amount;
  if (options.meleeBleed) applyBleed(target, { timer: options.bleedTimer, damage: options.bleedDamage });
  else if (!options.remoteIntent && !options.poison && source === "Shot" && hasTalent("melee_blood_bleed") && currentClassKey() === "melee") applyBleed(target);
  if ((options.markedBonus || options.rangedBasic) && target.markedTimer > 0 && target.markedShots > 0) {
    tunedAmount = Math.ceil(tunedAmount * (Number(options.markedMultiplier) || 1.45));
    target.markedShots -= 1;
    particles.push({ x: target.x, y: target.y - 58, text: "mark", color: "#ffd782", ttl: 0.65 });
    syncTargetStatus(target, "mark");
  }
  if (!options.poison && target.judgmentTimer > 0) tunedAmount = Math.ceil(tunedAmount * 1.12);
  if (!options.poison && (options.deadeye || (!options.remoteIntent && source === "Shot" && player.deadeyeTimer > 0))) {
    tunedAmount = Math.ceil(tunedAmount * 1.4);
    if (!options.remoteIntent) player.deadeyeTimer = 0;
    particles.push({ x: target.x, y: target.y - 60, text: "deadeye", color: "#ffd782", ttl: 0.7 });
  }
  let damage = target.shieldTimer > 0 ? Math.ceil(tunedAmount * 0.5) : tunedAmount;
  if (target.kind === "taco" && !options.tacoBypassGuard) {
    if (target.shellGuardActive && target.exposedFillingTimer <= 0) damage = Math.max(1, Math.ceil(damage * 0.32));
    if (target.exposedFillingTimer > 0) damage = Math.ceil(damage * 2.35);
  }
  target.hp = Math.max(0, target.hp - damage);
  const hookPayload = { target, amount: damage, source, options };
  if (!options.remote && !options.remoteIntent) {
    runTalentHook(source === "Shot" ? "onBasicHit" : "onAbilityHit", hookPayload);
  }
  if (!target.mazeEnemy && source !== "Co-op" && !options.remote && !isPartySyncActive()) {
    sendMultiplayerEvent({
      kind: "damage",
      encounter: "arena",
      room: player.room,
      phaseSeq: multiplayer.phaseSeq,
      bossKind: boss.kind,
      targetKind: target.kind,
      amount: damage,
    });
  }
  const color = options.poison ? "#9be06f" : source === "Bleed" || source === "Backstab" ? "#ff6e7f" : "#ffe08a";
  particles.push({ x: target.x, y: target.y - 40, text: `-${damage}`, color, ttl: 0.8 });
  if (target.hp <= 0) {
    runTalentHook("onEnemyDeath", hookPayload);
    handleBossDefeated(target);
  }
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
  target.poisonDamagePerStack = roguePoisonDamagePerStack();
  if (!target.poisonTickTimer || target.poisonTickTimer <= 0) target.poisonTickTimer = 1;
  if (hasTalent("rogue_venom_cap") && oldStacks < maxStacks && target.poisonStacks >= maxStacks) {
    damageBossTarget(target, playerDamage(0.65), "Venom Nova");
  }
  particles.push({ x: target.x, y: target.y - target.radius - 26, text: `poison ${target.poisonStacks}`, color: "#9be06f", ttl: 0.65 });
  syncTargetStatus(target, "poison");
}

function roguePoisonDamagePerStack() {
  return (isRogueBuild() && player.gear.armor === "channelerRobe" ? 2 : 1) + (hasTalent("rogue_venom_damage") ? 1 : 0);
}

function applyBleed(target, options = {}) {
  target.bleedTimer = Number.isFinite(options.timer) && options.timer > 0 ? options.timer : 4 + (hasTalent("melee_blood_deep") ? 2 : 0);
  target.bleedTickTimer = 0.5;
  target.bleedDamage = Number.isFinite(options.damage) && options.damage > 0 ? options.damage : hasTalent("melee_blood_deep") ? 6 : 4;
  particles.push({ x: target.x, y: target.y - target.radius - 44, text: "bleed", color: "#ff6e7f", ttl: 0.65 });
  syncTargetStatus(target, "bleed");
}

function applyBurn(target) {
  target.burnTimer = 3.5;
  target.burnTickTimer = 0.5;
  target.burnDamage = playerDamage(0.12);
  particles.push({ x: target.x, y: target.y - target.radius - 50, text: "burn", color: "#ff8a32", ttl: 0.65 });
  syncTargetStatus(target, "burn");
}

function applyExposedStack(target, projectile) {
  const targetToPlayer = Math.atan2(player.y - target.y, player.x - target.x);
  const strikeAngle = Math.atan2(projectile.vy, projectile.vx);
  const angledHit = Math.abs(angleDifference(strikeAngle, targetToPlayer)) < Math.PI * 0.62;
  if (!angledHit && player.backstabTimer <= 0) return;
  target.exposedStacks = Math.min(3, (target.exposedStacks || 0) + 1);
  target.exposedTimer = 4 + (hasTalent("rogue_shadow_exposed") ? 2 : 0);
  particles.push({ x: target.x, y: target.y - target.radius - 58, text: `exposed ${target.exposedStacks}`, color: "#c8ff9a", ttl: 0.65 });
  syncTargetStatus(target, "exposed");
}

function consumeExposed(target) {
  if ((target.exposedStacks || 0) < 3) return;
  target.exposedStacks = 0;
  target.exposedTimer = 0;
  damageBossTarget(target, playerDamage(0.8), "Expose");
  particles.push({ x: target.x, y: target.y - target.radius - 60, text: "exploit", color: "#c8ff9a", ttl: 0.75 });
  syncTargetStatus(target, "exposed", "exposed-consume");
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
  remoteAbilityEffects = [];
  if (isPartySyncActive()) {
    if (isMultiplayerHost()) {
      recordDebugEvent("party-advance-reward", { phaseSeq: multiplayer.phaseSeq, mazeSequence: mazeState.sequence, bossKind: boss.kind });
      broadcastPartyPhase("reward", {
        bossKind: boss.kind,
        mazeSequence: mazeState.sequence,
      });
      sendGauntletSync(true);
    }
    return;
  }
  if (!player.dead) showMazeRewardChoices();
}

function showMazeRewardChoices() {
  if (!ui.mazeRewardOverlay || !ui.mazeRewardCards || !mazeState || player.dead) return;
  if (!ui.mazeRewardOverlay.hidden && ui.mazeRewardCards.querySelector(".reward-card")) {
    updateMazeRewardCardLock();
    return;
  }
  mazeState.rewardInputReadyAt = performance.now() + mazeRewardInputDelayMs;
  ui.mazeRewardTitle.textContent = `${mazeState.theme.name} Reward`;
  ui.mazeRewardCards.innerHTML = mazeState.rewardOptions.map((reward) => {
    const visual = mazeRewardVisual(reward);
    return `
    <button class="reward-card reward-card--${visual.tone}" type="button" data-reward="${reward.id}" data-tone="${visual.tone}" disabled>
      <span class="reward-card-corner" aria-hidden="true"><img src="./assets/generated/icons/rewards/${visual.icon}.svg" alt=""></span>
      <span class="reward-icon-wrap" aria-hidden="true">
        <span class="reward-icon-disc"></span>
        <img class="reward-icon" src="./assets/generated/icons/rewards/${visual.icon}.svg" alt="">
      </span>
      <strong>${escapeHtml(reward.name)}</strong>
      <span class="reward-divider" aria-hidden="true"></span>
      <span class="reward-description">${escapeHtml(reward.description)}</span>
      <span class="reward-category">${escapeHtml(visual.category)}</span>
    </button>
  `;
  }).join("");
  ui.mazeRewardOverlay.hidden = false;
  ui.status.textContent = "Choose one gauntlet reward to open the boss gate.";
  showFloat("Choose a reward");
  window.setTimeout(() => {
    updateMazeRewardCardLock();
  }, mazeRewardInputDelayMs);
}

function updateMazeRewardCardLock() {
  if (!mazeState || mazeState.rewardChosen || ui.mazeRewardOverlay?.hidden) return;
  if (mazeState.rewardConfirming) return;
  const locked = Number.isFinite(mazeState.rewardInputReadyAt) && performance.now() < mazeState.rewardInputReadyAt;
  ui.mazeRewardCards?.querySelectorAll(".reward-card").forEach((card) => {
    card.disabled = locked;
    card.classList.toggle("is-input-locked", locked);
  });
}

function chooseMazeReward(rewardId) {
  if (!mazeState || !mazeState.rewardPending || mazeState.rewardChosen || player.dead) return;
  if (Number.isFinite(mazeState.rewardInputReadyAt) && performance.now() < mazeState.rewardInputReadyAt) return;
  if (mazeState.rewardConfirming) return;
  const reward = mazeState.rewardOptions.find((option) => option.id === rewardId);
  if (!reward) return;
  mazeState.rewardConfirming = true;
  const selectedCard = Array.from(ui.mazeRewardCards?.querySelectorAll(".reward-card") || [])
    .find((card) => card.dataset.reward === rewardId);
  ui.mazeRewardCards?.querySelectorAll(".reward-card").forEach((card) => {
    card.disabled = true;
    card.classList.remove("is-input-locked");
    card.classList.toggle("is-selected", card === selectedCard);
    card.classList.toggle("is-dimmed", card !== selectedCard);
  });
  selectedCard?.classList.add("is-confirming");
  ui.status.textContent = `${reward.name} selected. Confirming reward.`;
  window.setTimeout(() => {
    selectedCard?.classList.remove("is-confirming");
    selectedCard?.classList.add("is-confirmed");
  }, 280);
  window.setTimeout(() => {
    applyMazeRewardChoice(rewardId);
  }, 560);
}

function applyMazeRewardChoice(rewardId) {
  if (!mazeState || !mazeState.rewardPending || mazeState.rewardChosen || player.dead) return;
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
  mazeState.rewardConfirming = false;
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
  remoteAbilityEffects = [];
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
  drawRemoteAbilityEffects();
  drawPlayerProjectiles();
  drawRemoteProjectiles();
  drawPlayer();
  drawRemotePlayers();
  drawParticles();
  ctx.restore();
  drawTacoObjectiveText();
  drawAbilityBar();
  drawSpectateOverlay();
  drawRunCompleteOverlay();
  drawScreenBanner();
}

function drawSpectateOverlay() {
  if (!player.dead || !isPartySyncActive()) return;
  const target = currentSpectateTarget();
  if (!target) return;
  const label = spectatePeerLabel(target.id);
  const x = canvas.clientWidth / 2;
  const y = 34;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(8, 10, 11, 0.72)";
  ctx.strokeStyle = "rgba(240, 212, 124, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 190, y - 20, 380, 56, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0d47c";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`Spectating ${label}`, x, y - 3);
  ctx.fillStyle = "#d8cfc2";
  ctx.font = "12px sans-serif";
  ctx.fillText("Tab / Arrow keys switch teammate", x, y + 19);
  ctx.restore();
}

function drawRooms() {
  ctx.fillStyle = "#141917";
  ctx.fillRect(0, 0, world.width, world.height);
  drawRoom(world.starter, "#27362f", "#a6b9a2");
  if (player.room === "maze" && mazeState) drawMaze();
  else if (boss.kind === "sushi") drawSushiArenaRoom();
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

  if (player.room !== "maze" && boss.kind !== "sushi") {
    ctx.fillStyle = "rgba(238, 228, 188, 0.1)";
    for (let x = world.arena.x + 70; x < world.arena.x + world.arena.w; x += 92) {
      ctx.fillRect(x, world.arena.y + 30, 2, world.arena.h - 60);
    }
    for (let y = world.arena.y + 70; y < world.arena.y + world.arena.h; y += 92) {
      ctx.fillRect(world.arena.x + 30, y, world.arena.w - 60, 2);
    }
  }
}

function drawSushiArenaRoom() {
  drawRoom(world.arena, "#121817", "#8de0c6");
  ctx.save();
  const rect = world.arena;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.fillStyle = "rgba(11, 16, 17, 0.6)";
  ctx.fillRect(rect.x + 22, rect.y + 22, rect.w - 44, rect.h - 44);
  ctx.strokeStyle = "rgba(141, 224, 198, 0.12)";
  ctx.lineWidth = 2;
  for (let x = rect.x + 58; x < rect.x + rect.w - 40; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y + 36);
    ctx.lineTo(x, rect.y + rect.h - 36);
    ctx.stroke();
  }
  for (let y = rect.y + 58; y < rect.y + rect.h - 40; y += 64) {
    ctx.beginPath();
    ctx.moveTo(rect.x + 36, y);
    ctx.lineTo(rect.x + rect.w - 36, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(184, 92, 255, 0.14)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, 76 + i * 48 + Math.sin(boss.animationTime * 1.7 + i) * 3, boss.animationTime * 0.35 + i, boss.animationTime * 0.35 + i + Math.PI * 1.35);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(159, 240, 95, 0.08)";
  ctx.fillRect(rect.x + 42, rect.y + 42, 92, rect.h - 84);
  ctx.fillStyle = "rgba(255, 122, 95, 0.08)";
  ctx.fillRect(rect.x + rect.w - 134, rect.y + 42, 92, rect.h - 84);
  ctx.restore();
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
    if (!Number.isFinite(pickup.x) || !Number.isFinite(pickup.y)) return;
    const radius = Number.isFinite(pickup.r) ? Math.max(4, pickup.r) : 16;
    const pulse = Math.sin(performance.now() / 180) * 2;
    ctx.fillStyle = pickup.type === "potion" ? "#77c6ff" : "#9be06f";
    ctx.strokeStyle = "#f7efd9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, radius + pulse, 0, Math.PI * 2);
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
    if (stand.type === "weapon") {
      const classIconKey = generatedClassArtKeyForWeapon(stand.id);
      drawGeneratedImage(`icons.classes.${classIconKey}`, stand.x, stand.y - 10, 48, 48, {
        alpha: selected ? 1 : 0.78,
        shadowColor: selected ? "rgba(240, 212, 124, 0.65)" : "",
        shadowBlur: selected ? 8 : 0,
      });
    }
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
    if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) return;
    const radius = Number.isFinite(enemy.radius) ? Math.max(8, enemy.radius) : enemy.miniBoss ? 34 : 18;
    const moveTimer = Number.isFinite(enemy.moveTimer) ? enemy.moveTimer : 0;
    const pulse = Math.sin(moveTimer * 6) * (enemy.miniBoss ? 3 : 1.5);
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (selectedBoss === enemy) drawRing(0, 0, radius + 8, "#ffe082");
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, radius + 8, radius * 0.9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = enemy.miniBoss ? mazeState.theme.trim : "#171313";
    ctx.lineWidth = enemy.miniBoss ? 4 : 3;
    ctx.beginPath();
    if (enemy.ranged) ctx.roundRect(-radius, -radius - pulse, radius * 2, radius * 2.1, 8);
    else ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#171313";
    ctx.beginPath();
    ctx.arc(-radius * 0.32, -radius * 0.18, 3.5, 0, Math.PI * 2);
    ctx.arc(radius * 0.32, -radius * 0.18, 3.5, 0, Math.PI * 2);
    ctx.fill();
    const hpWidth = enemy.miniBoss ? 92 : 48;
    const maxHp = Number.isFinite(enemy.maxHp) && enemy.maxHp > 0 ? enemy.maxHp : 1;
    ctx.fillStyle = "rgba(10, 12, 11, 0.82)";
    ctx.fillRect(-hpWidth / 2, -radius - 20, hpWidth, 6);
    ctx.fillStyle = enemy.miniBoss ? "#f0d47c" : "#9be06f";
    ctx.fillRect(-hpWidth / 2, -radius - 20, hpWidth * clamp(enemy.hp / maxHp, 0, 1), 6);
    if (enemy.miniBoss) {
      ctx.fillStyle = "#f7efd9";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(enemy.name, 0, -radius - 30);
      ctx.textAlign = "left";
    }
    ctx.restore();
  });
}

function generatedBossArtRow(target) {
  if (target.hp <= 0) return 3;
  if (target.state === "winding" || target.state === "charging" || target.state === "attack" || target.attackWindup > 0 || target.dashTimer > 0) return 1;
  if (target.enraged || target.phase > 1 || target.shieldTimer > 0 || target.stunnedTimer > 0) return 2;
  return 0;
}

function drawGeneratedBossSprite(target, kind, options = {}) {
  const image = generatedArtImage(`bosses.${kind}`);
  if (!isImageReady(image)) return false;
  const radius = target.radius || 52;
  const scale = options.scale || 1;
  const frame = Math.floor(performance.now() / 160 + (target.x + target.y) * 0.01) % 4;
  const row = generatedBossArtRow(target);
  const drawW = radius * 2.55 * scale;
  const drawH = radius * 2.55 * scale;
  const shadowColor = target.enraged ? "#ff6f61" : "";
  const shadowBlur = target.enraged ? 16 : 0;
  return drawGeneratedSpriteFrame(`bosses.${kind}`, row, frame, target.x, target.y - radius * 0.04, drawW, drawH, { shadowColor, shadowBlur });
}

function drawBoss() {
  if (player.room !== "arena") return;
  if (boss.kind === "trio") {
    condimentBosses.forEach(drawCondimentBoss);
    return;
  }
  if (boss.hp <= 0) return;
  if (selectedBoss === boss) drawRing(boss.x, boss.y, boss.radius + 12, "#ffe082");
  const generatedBossDrawn = ["sauce", "shake", "nacho", "pizza", "taco"].includes(boss.kind)
    ? drawGeneratedBossSprite(boss, boss.kind)
    : false;
  if (generatedBossDrawn) {
    // Generated boss sheets replace the simple canvas body while preserving existing telegraphs and HUD.
  } else if (boss.kind === "fries") {
    drawCurlyFriesBoss();
  } else if (boss.kind === "sauce") {
    drawSpecialSauceBoss();
  } else if (boss.kind === "burger") {
    drawBurgerBoss();
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
  const phaseText = boss.kind === "shake" ? ` ${boss.phase}/3` : boss.kind === "burger" || boss.kind === "nacho" || boss.kind === "pizza" || boss.kind === "taco" || boss.kind === "donut" || boss.kind === "sushi" ? ` Phase ${boss.phase}` : "";
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
  const generatedCondimentDrawn = drawGeneratedBossSprite(target, target.kind, { scale: 1.05 });
  if (!generatedCondimentDrawn) {
    if (target.kind === "ketchup") drawKetchupBoss(target);
    else if (target.kind === "mustard") drawMustardBoss(target);
    else drawMayoBoss(target);
  }
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
  const animationRows = {
    burgerIdle: 0,
    idle: 0,
    burgerTomato: 1,
    burgerPickle: 2,
    burgerOnion: 3,
    burgerSauce: 4,
    burgerCharge: 5,
    burgerBurst: 6,
    burgerEnraged: 7,
  };
  const row = animationRows[boss.animation] ?? (boss.enraged ? 7 : 0);
  const frame = Math.floor((boss.animationTime || 0) * (row === 5 ? 9 : 7)) % 4;
  const radius = boss.radius || 70;
  if (drawGeneratedSpriteFrame("bosses.burgerDeluxe", row, frame, boss.x, boss.y - radius * 0.18, radius * 3.0, radius * 3.0, {
    cols: 4,
    rows: 8,
    alpha: 0.98,
    shadowColor: boss.enraged ? "#ff3148" : "#f0c35b",
    shadowBlur: boss.enraged ? 20 : 12,
  })) {
    if (["burgerTomato", "burgerPickle", "burgerOnion", "burgerSauce", "burgerCharge", "burgerBurst"].includes(boss.animation)) {
      const slug = boss.animation.replace("burger", "").toLowerCase();
      drawGeneratedImage(`bossAbilities.burger.${slug}`, boss.x + radius * 1.22, boss.y - radius * 1.5, 32, 32, {
        alpha: 0.8,
        shadowColor: "#f0c35b",
        shadowBlur: 9,
      });
    }
    return;
  }
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

  ctx.strokeStyle = "rgba(7, 13, 10, 0.58)";
  ctx.lineWidth = 62;
  strokeSmoothSushiPath(segments);

  for (let i = segments.length - 1; i >= 1; i -= 1) {
    const segment = segments[i];
    const isTail = i === segments.length - 1;
    const assetId = isTail ? "bosses.sushiTail" : segment.weak ? "bosses.sushiWeakSegment" : "bosses.sushiSegment";
    const drawW = segment.r * (isTail ? 3.35 : 3.25);
    const drawH = segment.r * (isTail ? 2.25 : 2.05);
    const drawn = drawGeneratedImage(assetId, segment.x, segment.y, drawW, drawH, {
      rotation: segment.heading,
      shadowColor: segment.weak ? "#eaff9f" : boss.enraged ? "#9ff05f" : "",
      shadowBlur: segment.weak ? 18 : boss.enraged ? 8 : 0,
    });
    if (drawn) {
      if (segment.weak) {
        ctx.strokeStyle = `rgba(234, 255, 159, ${0.55 + Math.sin(boss.animationTime * 10) * 0.18})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.r + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      continue;
    }
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
  const headFrame = Math.floor((boss.animationTime || 0) * 9) % 4;
  const headRow = sushiAnimationRow();
  const headDrawn = drawGeneratedSpriteFrame("bosses.sushiDeluxe", headRow, headFrame, head.x, head.y, boss.radius * 3.35, boss.radius * 3.35, {
    cols: 4,
    rows: 9,
    rotation: headAngle,
    shadowColor: boss.enraged ? "#9ff05f" : "#f7dfaa",
    shadowBlur: boss.enraged ? 18 : 9,
  });
  if (headDrawn) {
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(headAngle);
    if (boss.sushiLastAbility) {
      const iconId = `bossAbilities.sushi.${boss.sushiLastAbility}`;
      drawGeneratedImage(iconId, boss.radius * 1.3, -boss.radius * 1.25, 34, 34, { alpha: 0.88, shadowColor: "#fff4db", shadowBlur: 7 });
    }
    ctx.restore();
  } else {
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

function sushiAnimationRow() {
  const state = boss.sushiAnimationState || "idle";
  if (state === "dashWindup") return 2;
  if (state === "dash") return 3;
  if (state === "jab") return 4;
  if (state === "barrage") return 5;
  if (state === "soy") return 6;
  if ((boss.sushiWeakFlashTimer || 0) > 0) return 7;
  if (boss.enraged || state === "enrage") return 8;
  if (state === "slither") return 1;
  return 0;
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

function bigColaAnimationRow() {
  if (boss.animation === "colaBubbles") return 1;
  if (boss.animation === "colaStraw") return 2;
  if (boss.animation === "colaSpill") return 3;
  if (boss.animation === "colaFizz") return 4;
  if (boss.enraged || boss.phase >= 2) return 5;
  return 0;
}

function bigColaAbilitySlug(row) {
  if (row === 1) return "bubbles";
  if (row === 2) return "straw";
  if (row === 3) return "spill";
  if (row === 4) return "fizz";
  return "";
}

function drawBigColaBoss() {
  const row = bigColaAnimationRow();
  const activeCast = boss.animation && boss.animation !== "idle" && row > 0 && row < 5;
  const frameSource = activeCast ? (boss.animationTime || 0) * 9.5 : performance.now() / 165;
  const frame = Math.floor(frameSource) % 4;
  const radius = boss.radius || 58;
  const drawW = Math.max(220, radius * 4.25);
  const drawH = Math.max(220, radius * 4.25);
  const shadowColor = row === 4 ? "#b9f4ff" : row === 5 ? "#ff6f61" : boss.enraged ? "#ff8a66" : "rgba(103, 213, 255, 0.55)";
  const shadowBlur = row === 4 ? 26 : row === 5 ? 22 : boss.enraged ? 18 : 8;
  const drawn = drawGeneratedSpriteFrame("bosses.colaDeluxe", row, frame, boss.x, boss.y - radius * 0.2, drawW, drawH, {
    cols: 4,
    rows: 6,
    shadowColor,
    shadowBlur,
  });
  if (drawn) {
    const slug = activeCast ? bigColaAbilitySlug(row) : "";
    if (slug) {
      drawGeneratedImage(`bossAbilities.cola.${slug}`, boss.x + radius * 1.28, boss.y - radius * 1.55, 34, 34, {
        alpha: 0.88,
        shadowColor,
        shadowBlur: 10,
      });
    }
    return;
  }

  ctx.fillStyle = boss.enraged ? boss.enrageColor : boss.color;
  ctx.beginPath();
  ctx.roundRect(boss.x - 46, boss.y - 62, 92, 124, 16);
  ctx.fill();
  ctx.fillStyle = "#f4f1e6";
  ctx.fillRect(boss.x - 48, boss.y - 66, 96, 16);
  ctx.fillStyle = "#17110f";
  ctx.fillRect(boss.x - 35, boss.y - 44, 70, 30);
  ctx.fillStyle = "#f7f3e8";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BIG COLA", boss.x, boss.y + 22);
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
  if (drawGeneratedBossSprite(boss, "fries")) return;
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
  const sourceWidth = sprite.naturalWidth || sprite.width;
  const sourceHeight = sprite.naturalHeight || sprite.height;
  const frameWidth = sourceWidth / 4;
  const frameHeight = sourceHeight / 3;
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
    if (drawGeneratedHazardProjectile(hazard)) return;
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
    if (hazard.type === "picklePuddle") {
      if (drawGeneratedImage("hazards.burger-pickle-puddle", hazard.x, hazard.y, hazard.r * 2.35, hazard.r * 1.45, {
        alpha: hazard.remoteBossHazard ? 0.78 : 0.9,
        shadowColor: "#9fdf45",
        shadowBlur: 8,
      })) return;
      ctx.fillStyle = "rgba(111, 158, 36, 0.38)";
      ctx.strokeStyle = "#dfff71";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(hazard.x, hazard.y, hazard.r, hazard.r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "burgerSauceDrop") {
      const warningProgress = clamp(1 - hazard.warn / Math.max(0.1, hazard.warnDuration || 0.75), 0, 1);
      ctx.fillStyle = "rgba(224, 122, 42, 0.12)";
      ctx.strokeStyle = hazard.warn > 0 ? "#ffe0a0" : "#e07a2a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r * (0.45 + warningProgress * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawGeneratedImage("hazards.burger-sauce-drop", hazard.x, hazard.y - (hazard.fallHeight || 100) * (1 - warningProgress), hazard.r * 1.45, hazard.r * 1.65, {
        alpha: 0.92,
        shadowColor: "#ffd06a",
        shadowBlur: 10,
      });
      return;
    }
    if (hazard.type === "burgerSauceBurst") {
      if (drawGeneratedImage("hazards.burger-sauce-burst", hazard.x, hazard.y, hazard.r * 2.2, hazard.r * 2.2, {
        alpha: hazard.remoteBossHazard ? 0.78 : 0.9,
        shadowColor: "#ffd06a",
        shadowBlur: 13,
      })) return;
      ctx.fillStyle = "rgba(224, 122, 42, 0.34)";
      ctx.strokeStyle = "#ffe0a0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }
    if (hazard.type === "burgerChargeLane") {
      const active = hazard.warn <= 0;
      drawGeneratedImage("hazards.burger-charge-lane", hazard.x, hazard.y, hazard.length, hazard.width, {
        alpha: active ? 0.78 : 0.45,
        rotation: hazard.angle,
        shadowColor: active ? "#ff6b58" : "#ffd66b",
        shadowBlur: active ? 14 : 7,
      });
      ctx.strokeStyle = active ? "rgba(255, 107, 88, 0.7)" : "rgba(255, 214, 107, 0.62)";
      ctx.lineWidth = active ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(hazard.startX, hazard.startY);
      ctx.lineTo(hazard.endX, hazard.endY);
      ctx.stroke();
      return;
    }
    if (hazard.type === "burgerBurstRing") {
      const warning = hazard.warn > 0;
      const progress = warning ? clamp(1 - hazard.warn / Math.max(0.1, hazard.warnDuration || 0.8), 0, 1) : 1;
      const radius = hazard.r * (warning ? 0.55 + progress * 0.45 : 1);
      drawGeneratedImage("hazards.burger-burst-ring", hazard.x, hazard.y, radius * 2.15, radius * 2.15, {
        alpha: warning ? 0.44 : 0.76,
        shadowColor: "#ffd46c",
        shadowBlur: warning ? 9 : 16,
      });
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.gapAngle);
      ctx.fillStyle = "rgba(45, 28, 18, 0.42)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius + 16, -(hazard.gapWidth || 0.9) / 2, (hazard.gapWidth || 0.9) / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 244, 196, 0.72)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(-(hazard.gapWidth || 0.9) / 2) * (hazard.inner || 70), Math.sin(-(hazard.gapWidth || 0.9) / 2) * (hazard.inner || 70));
      ctx.lineTo(Math.cos(-(hazard.gapWidth || 0.9) / 2) * radius, Math.sin(-(hazard.gapWidth || 0.9) / 2) * radius);
      ctx.moveTo(Math.cos((hazard.gapWidth || 0.9) / 2) * (hazard.inner || 70), Math.sin((hazard.gapWidth || 0.9) / 2) * (hazard.inner || 70));
      ctx.lineTo(Math.cos((hazard.gapWidth || 0.9) / 2) * radius, Math.sin((hazard.gapWidth || 0.9) / 2) * radius);
      ctx.stroke();
      ctx.restore();
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
      const beamLength = 780;
      ctx.save();
      ctx.translate(hazard.x + Math.cos(hazard.angle) * beamLength * 0.5, hazard.y + Math.sin(hazard.angle) * beamLength * 0.5);
      ctx.rotate(hazard.angle);
      const beamDrawn = drawGeneratedImage("hazards.cola-straw-snipe", 0, 0, beamLength, active ? 58 : 36, {
        alpha: active ? 0.92 : 0.5,
        shadowColor: active ? "#fff4c4" : "#67d5ff",
        shadowBlur: active ? 18 : 8,
      });
      ctx.restore();
      if (beamDrawn) return;
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
      if (drawGeneratedImage("hazards.cola-fizz-burst", hazard.x, hazard.y, hazard.r * 2.08, hazard.r * 2.08, {
        alpha: warning ? 0.34 : 0.72,
        shadowColor: warning ? "#67d5ff" : "#ffffff",
        shadowBlur: warning ? 12 : 24,
      })) return;
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
      const puddleDrawn = drawGeneratedImage("hazards.cola-soda-puddle", hazard.x, hazard.y, hazard.r * 2.05, hazard.r * 1.22, {
        alpha: 0.24 + pulse * 0.2,
        shadowColor: "#67d5ff",
        shadowBlur: 8,
      });
      const dropDrawn = drawGeneratedImage("hazards.cola-soda-drop", hazard.x, dropY, 42, 58, {
        alpha: 0.56 + progress * 0.38,
        shadowColor: "#67d5ff",
        shadowBlur: 10,
      });
      if (puddleDrawn && dropDrawn) return;
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
      if (drawGeneratedImage("hazards.cola-soda-puddle", hazard.x, hazard.y, hazard.r * 2.15, hazard.r * 1.32, {
        alpha: 0.72,
        shadowColor: "#67d5ff",
        shadowBlur: 6,
      })) return;
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
    if (hazard.type === "wasabiDash") {
      const active = hazard.warn <= 0;
      const pulse = Math.sin(boss.animationTime * 14) * 0.5 + 0.5;
      ctx.save();
      ctx.strokeStyle = active ? "rgba(159, 240, 95, 0.7)" : `rgba(234, 255, 159, ${0.34 + pulse * 0.22})`;
      ctx.lineWidth = active ? hazard.width : 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hazard.startX, hazard.startY);
      ctx.lineTo(hazard.endX, hazard.endY);
      ctx.stroke();
      ctx.strokeStyle = active ? "rgba(234, 255, 159, 0.72)" : "rgba(159, 240, 95, 0.85)";
      ctx.lineWidth = active ? 5 : 3;
      ctx.setLineDash(active ? [] : [20, 12]);
      ctx.beginPath();
      ctx.moveTo(hazard.startX, hazard.startY);
      ctx.lineTo(hazard.endX, hazard.endY);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0.25; i < 1; i += 0.25) {
        drawWasabiArrow(hazard.startX + (hazard.endX - hazard.startX) * i, hazard.startY + (hazard.endY - hazard.startY) * i, hazard.angle);
      }
      ctx.restore();
      return;
    }
    if (hazard.type === "wasabiTrail") {
      const pulse = Math.sin((hazard.ttl || 0) * 9) * 3;
      if (!drawGeneratedImage("hazards.wasabi-splatter", hazard.x, hazard.y, hazard.r * 2.35 + pulse, hazard.r * 2.35 + pulse, { alpha: 0.82, rotation: hazard.x * 0.01 })) {
        ctx.fillStyle = "rgba(122, 196, 109, 0.36)";
        ctx.strokeStyle = "#9ff05f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(hazard.x, hazard.y, hazard.r * 1.08, hazard.r * 0.72, Math.sin(hazard.x) * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      return;
    }
    if (hazard.type === "chopstickJab") {
      const active = hazard.warn <= 0;
      ctx.strokeStyle = active ? "rgba(255, 122, 95, 0.8)" : "rgba(247, 223, 170, 0.5)";
      ctx.lineWidth = active ? hazard.width : 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + Math.cos(hazard.angle) * hazard.length, hazard.y + Math.sin(hazard.angle) * hazard.length);
      ctx.stroke();
      if (active) {
        drawGeneratedImage("hazards.chopstick-slash", hazard.x + Math.cos(hazard.angle) * hazard.length * 0.48, hazard.y + Math.sin(hazard.angle) * hazard.length * 0.48, 180, 90, { rotation: hazard.angle, alpha: 0.86 });
      }
      return;
    }
    if (hazard.type === "sushiRoll") {
      if (!drawGeneratedImage("projectiles.sushi-roll", hazard.x, hazard.y, hazard.r * 4.4, hazard.r * 4.4, { rotation: hazard.spin || 0, shadowColor: "#f05f6a", shadowBlur: 8 })) {
        ctx.fillStyle = "#18261d";
        ctx.strokeStyle = "#fff4db";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      return;
    }
    if (hazard.type === "soySakeWave") {
      const active = hazard.warn <= 0;
      const shape = soySakeWaveShape(hazard);
      const seed = hazard.waveSeed || 0;
      ctx.save();
      ctx.translate(hazard.x, hazard.y);
      ctx.rotate(hazard.angle);
      ctx.globalAlpha *= shape.alpha;
      ctx.beginPath();
      ctx.moveTo(-shape.length * 0.5, -shape.width * 0.18);
      for (let i = 0; i <= 14; i += 1) {
        const t = i / 14;
        const x = -shape.length * 0.5 + shape.length * t;
        const y = -shape.width * (0.29 + 0.08 * Math.sin(t * Math.PI + shape.surgeProgress)) + Math.sin(t * Math.PI * 4 + seed + boss.animationTime * 3.4) * shape.width * 0.11;
        ctx.lineTo(x, y);
      }
      for (let i = 14; i >= 0; i -= 1) {
        const t = i / 14;
        const x = -shape.length * 0.5 + shape.length * t;
        const y = shape.width * (0.31 + 0.08 * Math.sin(t * Math.PI * 1.3 + 1.2)) + Math.sin(t * Math.PI * 3.2 + seed + boss.animationTime * 2.6 + 1.4) * shape.width * 0.13;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = active ? "rgba(33, 18, 28, 0.82)" : "rgba(92, 54, 86, 0.32)";
      ctx.fill();
      ctx.strokeStyle = active ? "rgba(163, 118, 166, 0.36)" : "rgba(203, 160, 216, 0.38)";
      ctx.lineWidth = active ? 2.5 : 2;
      ctx.stroke();
      ctx.save();
      ctx.clip();
      if (active) {
        const painted = drawGeneratedSpriteFrame("hazards.soySakeWaveStrip", 0, shape.frame, (hazard.textureOffset || 0) % 140 - 70, 0, shape.length * 1.12, shape.width * 2.15, { cols: 8, rows: 1, alpha: 0.86 });
        if (!painted) {
          for (let x = -shape.length * 0.42; x < shape.length * 0.42; x += 150) {
            drawGeneratedImage("hazards.soy-wave", x, 0, 170, 92, { alpha: 0.42, rotation: 0 });
          }
        }
      } else {
        ctx.strokeStyle = "rgba(218, 190, 220, 0.34)";
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 18]);
        ctx.beginPath();
        ctx.moveTo(-shape.length * 0.48, 0);
        ctx.lineTo(shape.length * 0.48, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
      ctx.fillStyle = active ? "rgba(230, 211, 218, 0.42)" : "rgba(230, 211, 218, 0.2)";
      for (let i = 0; i < 8; i += 1) {
        const t = (i + 0.5) / 8;
        const forwardBias = active ? shape.surgeProgress * 0.18 : 0;
        ctx.beginPath();
        ctx.ellipse(-shape.length * (0.46 - forwardBias) + shape.length * t, Math.sin(t * 9 + seed + boss.animationTime * 3) * shape.width * 0.25, 7 + (i % 3) * 4, 2.5 + (i % 2), 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      if (active && shape.damageActive) {
        ctx.strokeStyle = "rgba(245, 222, 230, 0.22)";
        ctx.lineWidth = Math.max(2, shape.collisionWidth * 0.16);
        ctx.beginPath();
        ctx.moveTo(-shape.length * 0.5, 0);
        ctx.lineTo(shape.length * 0.5, 0);
        ctx.stroke();
      }
      ctx.restore();
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
    if (effect.type === "bardPowerChord") {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 215, 130, 0.18)";
      ctx.strokeStyle = "rgba(255, 244, 210, 0.9)";
      ctx.shadowColor = "#ffd782";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.arc(0, 0, effect.range * (0.58 + progress * 0.42), -0.48, 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(28, (i - 1) * 12);
        ctx.quadraticCurveTo(effect.range * 0.38, (i - 1) * 18, effect.range * (0.7 + progress * 0.18), (i - 1) * 22);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (effect.type === "bardEchoNote") {
      const echoProgress = effect.triggered ? clamp((progress - 0.28) / 0.72, 0, 1) : 0;
      const echoAlpha = effect.triggered ? alpha : alpha * 0.35;
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.globalAlpha = echoAlpha;
      ctx.fillStyle = "rgba(146, 212, 255, 0.14)";
      ctx.strokeStyle = "rgba(220, 255, 252, 0.9)";
      ctx.shadowColor = "#92d4ff";
      ctx.shadowBlur = 22;
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 9]);
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.arc(0, 0, effect.range * (0.48 + echoProgress * 0.52), -0.42, 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255, 215, 130, 0.72)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const y = (i - 1.5) * 10;
        ctx.beginPath();
        ctx.moveTo(26, y);
        ctx.quadraticCurveTo(effect.range * 0.34, y * 1.6, effect.range * (0.62 + echoProgress * 0.28), y * 2.1);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(220, 255, 252, 0.86)";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("♪", effect.range * (0.34 + echoProgress * 0.25), -18);
      ctx.fillText("♫", effect.range * (0.48 + echoProgress * 0.18), 22);
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
    if (isBardSongEffect(effect)) {
      const songConfig = {
        bardBattleHymn: ["rgba(255, 215, 130, 0.1)", "rgba(255, 215, 130, 0.72)", "#ffd782"],
        bardQuickstepVerse: ["rgba(146, 212, 255, 0.1)", "rgba(146, 212, 255, 0.72)", "#92d4ff"],
        bardHealingBallad: ["rgba(255, 159, 200, 0.1)", "rgba(255, 159, 200, 0.72)", "#ff9fc8"],
      };
      const [fill, stroke, glow] = songConfig[effect.type];
      const spin = (effect.age || 0) * 1.9;
      ctx.globalAlpha = effect.ttl < 0.7 ? alpha : 0.9;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.r * (0.36 + i * 0.12), spin + i * 0.8, spin + i * 0.8 + Math.PI * 0.85);
        ctx.stroke();
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
    if (effect.type === "bardQuickstepTrail") {
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = "#92d4ff";
      ctx.shadowColor = "#92d4ff";
      ctx.shadowBlur = 14;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x - Math.cos(effect.angle) * (44 + progress * 58), effect.y - Math.sin(effect.angle) * (44 + progress * 58));
      ctx.stroke();
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

function drawRemoteAbilityEffects() {
  drawRemoteBardSongs();
  remoteAbilityEffects.forEach((effect) => {
    const progress = 1 - effect.ttl / effect.maxTtl;
    const alpha = clamp(effect.ttl / effect.maxTtl, 0, 1);
    const radius = 28 + progress * (effect.abilityIndex === 1 ? 96 : 58);
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = effect.color || "#8ec7ff";
    ctx.fillStyle = `${effect.color || "#8ec7ff"}33`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const lineLength = Math.min(180, Math.hypot(effect.targetX - effect.x, effect.targetY - effect.y));
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle || 0);
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = effect.color || "#8ec7ff";
    ctx.fillRect(18, -3, lineLength, 6);
    ctx.restore();
  });
}

function drawRemoteBardSongs() {
  multiplayer.peers.forEach((peer) => {
    if (peer.room !== player.room || !Array.isArray(peer.bardSongs)) return;
    peer.bardSongs.forEach((song) => {
      if (!song || song.room !== player.room || (Number(song.ttl) || 0) <= 0) return;
      const x = Number(song.x);
      const y = Number(song.y);
      const r = Number(song.r);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r)) return;
      const color = song.songType === "healing" ? "#ff9fc8" : song.songType === "quickstep" ? "#92d4ff" : "#ffd782";
      const alpha = clamp((Number(song.ttl) || 0) / 3, 0.18, 0.55);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = `${color}22`;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });
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
    if (drawGeneratedProjectileAtOrigin(projectile)) {
      ctx.restore();
      return;
    }
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
    } else if (projectile.tag === "Bard") {
      drawBardNoteProjectile(projectile);
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
    if (drawGeneratedProjectileAtOrigin(projectile, 0.82)) {
      ctx.restore();
      return;
    }
    if (projectile.tag === "Bard") {
      drawBardNoteProjectile(projectile);
    } else if (projectile.tag === "Ranged") {
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

function drawBardNoteProjectile(projectile) {
  const age = projectile.age || 0;
  const pulse = Math.sin(age * 18) * 0.5 + 0.5;
  ctx.save();
  ctx.shadowColor = projectile.color || "#ffd782";
  ctx.shadowBlur = 14 + pulse * 8;
  ctx.strokeStyle = "#fff4c4";
  ctx.fillStyle = projectile.color || "#f6c46d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(6, 4, 9, 6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(13, 2);
  ctx.lineTo(13, -24);
  ctx.quadraticCurveTo(24, -20, 26, -12);
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(-16, 0, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function projectileArtKey(projectile) {
  if (!projectile) return "";
  if (projectile.tag === "Magic") return projectile.fireBlast || projectile.heavy ? "fireball" : "magic-bolt";
  if (projectile.tag === "Bard") return "bard-note";
  if (projectile.tag === "Ranged") return "arrow";
  if (projectile.tag === "Rogue") return "dagger";
  if (projectile.tag === "Paladin") return "holy-smite";
  if (isWarriorTag(projectile.tag)) return "sword-wave";
  return "";
}

function projectileArtSize(projectile, key) {
  const radius = Math.max(8, projectile?.r || 10);
  const sizes = {
    arrow: [64, 38],
    "magic-bolt": [58, 40],
    fireball: [72, 48],
    "bard-note": [64, 54],
    "sword-wave": [72, 48],
    dagger: [58, 36],
    "holy-smite": [58, 58],
    fry: [Math.max(48, radius * 4.8), Math.max(28, radius * 2.4)],
    "cola-bubble": [Math.max(34, radius * 3.2), Math.max(34, radius * 3.2)],
    "pizza-slice": [Math.max(52, radius * 4.6), Math.max(38, radius * 3.2)],
    peanut: [Math.max(48, radius * 4.2), Math.max(30, radius * 2.5)],
    "sauce-blob": [Math.max(48, radius * 4.2), Math.max(40, radius * 3.2)],
    "mustard-seed": [Math.max(44, radius * 4), Math.max(28, radius * 2.5)],
    "cherry-shot": [Math.max(42, radius * 3.6), Math.max(42, radius * 3.6)],
    "nacho-chip": [Math.max(48, radius * 4.2), Math.max(42, radius * 3.5)],
    "taco-shard": [Math.max(52, radius * 4.6), Math.max(36, radius * 3.2)],
    "cheese-bolt": [Math.max(52, radius * 4.4), Math.max(36, radius * 3)],
    sprinkle: [Math.max(46, radius * 4.2), Math.max(24, radius * 2)],
    "burger-tomato-slice": [Math.max(56, radius * 3.7), Math.max(56, radius * 3.1)],
    "burger-pickle-splash": [Math.max(50, radius * 3.6), Math.max(38, radius * 2.8)],
    "burger-onion-ring": [Math.max(62, radius * 2.2), Math.max(62, radius * 2.2)],
  };
  return sizes[key] || [Math.max(42, radius * 3.6), Math.max(32, radius * 2.8)];
}

function drawGeneratedProjectileAtOrigin(projectile, alpha = 1) {
  const key = projectileArtKey(projectile);
  if (!key) return false;
  const [w, h] = projectileArtSize(projectile, key);
  const shadowColor = projectile.color || "";
  const shadowBlur = projectile.heavy || projectile.fireBlast ? 16 : 8;
  return drawGeneratedImage(`projectiles.${key}`, 0, 0, w, h, { alpha, shadowColor, shadowBlur });
}

function hazardProjectileArtKey(hazard) {
  if (!hazard) return "";
  const map = {
    mazeShot: "magic-bolt",
    bolt: "magic-bolt",
    fry: "fry",
    mustardSeed: "mustard-seed",
    sauceBlob: "sauce-blob",
    peanut: "peanut",
    cherryShot: "cherry-shot",
    nachoCrumb: "nacho-chip",
    nachoChip: "nacho-chip",
    pepperoni: "pizza-slice",
    pizzaSlice: "pizza-slice",
    pizzaSliceReturn: "pizza-slice",
    cheeseBolt: "cheese-bolt",
    sprinkle: "sprinkle",
    colaBubble: "cola-bubble",
    tomatoSlice: "burger-tomato-slice",
    pickleSplash: "burger-pickle-splash",
    onionRing: "burger-onion-ring",
    tacoShellShard: "taco-shard",
    lettuceLeaf: "taco-shard",
  };
  return map[hazard.type] || "";
}

function drawGeneratedHazardProjectile(hazard) {
  const key = hazardProjectileArtKey(hazard);
  if (!key) return false;
  if (hazard.warn > 0 && hazard.type !== "mazeShot") return false;
  const [w, h] = projectileArtSize(hazard, key);
  const angle = key === "cola-bubble" ? 0 : Number.isFinite(hazard.angle) ? hazard.angle : Math.atan2(hazard.vy || 0, hazard.vx || 1);
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.rotate(angle);
  const drawn = drawGeneratedImage(`projectiles.${key}`, 0, 0, w, h, {
    alpha: hazard.remoteBossHazard ? 0.88 : 0.96,
    shadowColor: hazard.color || "",
    shadowBlur: key === "cola-bubble" ? 13 : 7,
  });
  ctx.restore();
  return drawn;
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
  if (isBardBuild() && !outfit) drawBardLute(player.x, player.y, 1);
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
    if ((renderPeer.weapon === "oakLute" || renderPeer.weaponTag === "Bard") && !outfit) drawBardLute(renderPeer.x, renderPeer.y, 0.88);
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

function drawBardLute(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x + 21 * scale, y + 6 * scale);
  ctx.rotate(-0.42);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#8f5a2e";
  ctx.strokeStyle = "#f6c46d";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5b351e";
  ctx.beginPath();
  ctx.ellipse(0, 8, 3.4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d8a36f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(2, -31);
  ctx.stroke();
  ctx.strokeStyle = "#fff4c4";
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 2, -2);
    ctx.lineTo(2 + i * 1.2, -30);
    ctx.stroke();
  }
  ctx.restore();
}

function remotePlayerColor(tag) {
  if (tag === "Magic") return "#8ec7ff";
  if (tag === "Ranged") return "#9bd07b";
  if (tag === "Rogue") return "#9be06f";
  if (tag === "Paladin") return "#f0d47c";
  if (tag === "Bard") return "#ffd782";
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

function isBardBuild() {
  return player.gear.weapon === "oakLute";
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
  if (weaponId === "oakLute" && bardSprite.complete && bardSprite.naturalWidth > 0) {
    return {
      sprite: cleanedBardSprite || bardSprite,
      sideCrop: 0.04,
      cropWidth: 0.92,
      cropBottom: 0.92,
      drawWidth: 92,
      drawHeight: 100,
      topCrop: 0.02,
    };
  }
  if (weaponId === "pulseStaff" && glassMageSprite.complete && glassMageSprite.naturalWidth > 0) {
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
  const generatedClassKey = generatedClassArtKeyForWeapon(weaponId);
  const generatedSprite = generatedArtImage(`classes.${generatedClassKey}`);
  if (isImageReady(generatedSprite)) {
    return {
      sprite: generatedSprite,
      sideCrop: 0,
      cropWidth: 1,
      cropBottom: 1,
      drawWidth: generatedClassKey === "paladin" || generatedClassKey === "bard" ? 92 : 86,
      drawHeight: generatedClassKey === "paladin" || generatedClassKey === "bard" ? 92 : 86,
      topCrop: 0,
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
  const sourceWidth = sprite.naturalWidth || sprite.width;
  const sourceHeight = sprite.naturalHeight || sprite.height;
  const frameWidth = sourceWidth / 4;
  const frameHeight = sourceHeight / 4;
  const rangerAttacking = character.rangerAttackTimer > 0 && character.weapon === "emberBow";
  const meleeAttacking = character.meleeAttackTimer > 0 && character.weapon === "ironBlade";
  const rogueAttacking = character.rogueAttackTimer > 0 && character.weapon === "shadowDaggers";
  const bardAttacking = character.meleeAttackTimer > 0 && character.weapon === "oakLute";
  const frame = rangerAttacking
    ? (character.rangerAttackTimer > 0.14 ? 2 : 3)
    : rogueAttacking
      ? (character.rogueAttackTimer > 0.12 ? 2 : 3)
    : bardAttacking
      ? (character.meleeAttackTimer > 0.11 ? 2 : 3)
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
  const bardPulse = bardAttacking ? Math.sin((1 - character.meleeAttackTimer / 0.22) * Math.PI) : 0;
  const recoilX = rangerAttacking
    ? -Math.cos(character.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.cos(character.rogueAttackAngle) * roguePulse * 7
    : bardAttacking
      ? -Math.cos(character.meleeAttackAngle) * bardPulse * 3
    : meleeAttacking
      ? Math.cos(character.meleeAttackAngle) * meleePulse * 8
      : 0;
  const recoilY = rangerAttacking
    ? -Math.sin(character.rangerAttackAngle) * rangedPulse * 4
    : rogueAttacking
      ? Math.sin(character.rogueAttackAngle) * roguePulse * 7
    : bardAttacking
      ? -Math.sin(character.meleeAttackAngle) * bardPulse * 3
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
  const left = camera.x - 80;
  const right = camera.x + canvas.clientWidth + 80;
  const top = camera.y - 80;
  const bottom = camera.y + canvas.clientHeight + 80;
  ctx.save();
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  particles.forEach((particle) => {
    if (!Number.isFinite(particle.x) || !Number.isFinite(particle.y) || !particle.text) return;
    if (particle.x < left || particle.x > right || particle.y < top || particle.y > bottom) return;
    ctx.globalAlpha = clamp((Number(particle.ttl) || 0.35) / (Number(particle.maxTtl) || 0.8), 0.25, 1);
    ctx.fillStyle = particle.color || "#ffffff";
    ctx.fillText(String(particle.text || ""), particle.x, particle.y);
  });
  ctx.restore();
  ctx.textAlign = "left";
}

function drawRing(x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function abilityHudIconRingKey(classKey, index) {
  if (classKey === "mage" && (index === 1 || index === 3)) return "ui.abilityIconRingPurple";
  if (classKey === "rogue") return "ui.abilityIconRingPurple";
  if (classKey === "ranger" && index === 2) return "ui.abilityIconRingBlue";
  if (classKey === "paladin" && index === 2) return "ui.abilityIconRingBlue";
  if (classKey === "bard" && index === 2) return "ui.abilityIconRingBlue";
  return "ui.abilityIconRingGold";
}

function drawFittedHudText(text, x, y, maxWidth, size, weight, color) {
  let fontSize = size;
  const content = String(text || "");
  do {
    ctx.font = `${weight} ${fontSize}px sans-serif`;
    if (ctx.measureText(content).width <= maxWidth || fontSize <= 10) break;
    fontSize -= 1;
  } while (fontSize > 10);
  ctx.fillStyle = color;
  ctx.fillText(content, x, y);
}

function drawAbilityCooldownClock(cx, cy, radius, cooldown, duration) {
  if (!(cooldown > 0) || !(duration > 0)) return;
  const fill = clamp(cooldown / duration, 0, 1);
  drawGeneratedImage("ui.cooldownClockShade", cx, cy, radius * 2.18, radius * 2.18, { alpha: 0.78 });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius + 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill, false);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fill();
  const hand = -Math.PI / 2 + Math.PI * 2 * fill;
  ctx.strokeStyle = "rgba(247, 239, 217, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hand) * radius, cy + Math.sin(hand) * radius);
  ctx.stroke();
  ctx.restore();
}

function drawAbilityHudSlot({ x, y, w, h, key, title, status, statusColor, iconId, ringId, tone = "gold", cooldown = 0, cooldownDuration = 1 }) {
  const blue = tone === "blue";
  const slotId = blue ? "ui.abilitySlotBlue" : "ui.abilitySlotGold";
  const keycapId = blue ? "ui.abilityKeycapBlue" : "ui.abilityKeycapGold";
  drawGeneratedImage(slotId, x, y, w, h, { centered: false });
  if (!isImageReady(generatedArtImage(slotId))) {
    ctx.fillStyle = blue ? "rgba(4, 18, 34, 0.94)" : "rgba(7, 15, 24, 0.94)";
    ctx.strokeStyle = blue ? "rgba(45, 142, 232, 0.7)" : "rgba(180, 124, 36, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    ctx.stroke();
  }
  const keyW = key === "SPACE" ? 70 : 40;
  const keyH = 38;
  const keyX = x + 15;
  const keyY = y + 18;
  drawGeneratedImage(keycapId, keyX, keyY, keyW, keyH, { centered: false });
  if (!isImageReady(generatedArtImage(keycapId))) {
    ctx.fillStyle = blue ? "rgba(6, 23, 43, 0.92)" : "rgba(35, 23, 6, 0.92)";
    ctx.strokeStyle = blue ? "#2d8ee8" : "#d1942c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(keyX, keyY, keyW, keyH, 5);
    ctx.fill();
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = blue ? "#8ec7ff" : "#f0c35b";
  ctx.font = key === "SPACE" ? "900 14px sans-serif" : "900 23px sans-serif";
  ctx.fillText(key, keyX + keyW / 2, keyY + keyH / 2 + 1);

  const iconX = keyX + keyW + 36;
  const iconY = y + h / 2;
  drawGeneratedImage(ringId, iconX, iconY, 48, 48);
  drawGeneratedImage(iconId, iconX, iconY, 38, 38, {
    alpha: cooldown > 0 ? 0.72 : 1,
    shadowColor: cooldown > 0 ? "" : (blue ? "rgba(45, 142, 232, 0.55)" : "rgba(209, 148, 44, 0.48)"),
    shadowBlur: cooldown > 0 ? 0 : 8,
  });
  drawAbilityCooldownClock(iconX, iconY, 23, cooldown, cooldownDuration);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const textX = iconX + 34;
  const maxTitleWidth = Math.max(70, x + w - textX - 12);
  drawFittedHudText(title.toUpperCase(), textX, y + 27, maxTitleWidth, 14, "900", "#f4f1e6");
  drawFittedHudText(status, textX, y + 49, maxTitleWidth, 14, "800", statusColor);
}

function wrapCanvasText(text, maxWidth, font) {
  ctx.save();
  ctx.font = font;
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      return;
    }
    lines.push(line);
    line = word;
  });
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

function hoveredAbilityHudSlot() {
  if (!mouseCanvas.inside || !ui.menuOverlay?.classList.contains("hidden")) return null;
  return abilityHudSlots.find((slot) => (
    mouseCanvas.x >= slot.x
    && mouseCanvas.x <= slot.x + slot.w
    && mouseCanvas.y >= slot.y
    && mouseCanvas.y <= slot.y + slot.h
  )) || null;
}

function drawAbilityTooltip() {
  const slot = hoveredAbilityHudSlot();
  if (!slot?.ability?.description) return;
  const titleFont = "900 15px sans-serif";
  const metaFont = "800 12px sans-serif";
  const bodyFont = "700 13px sans-serif";
  const w = Math.min(360, Math.max(280, canvas.clientWidth - 28));
  const bodyLines = wrapCanvasText(slot.ability.description, w - 32, bodyFont);
  const h = 74 + bodyLines.length * 18;
  const x = clamp(slot.x + slot.w / 2 - w / 2, 14, canvas.clientWidth - w - 14);
  const aboveY = slot.y - h - 12;
  const y = aboveY >= 12 ? aboveY : Math.min(canvas.clientHeight - h - 12, slot.y + slot.h + 12);
  const accent = slot.tone === "blue" ? "#8ec7ff" : "#f0c35b";
  const cooldown = slot.cooldown > 0 ? `${slot.cooldown.toFixed(1)}s remaining` : `Cooldown ${slot.ability.cooldown}s`;

  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 14, 0.94)";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 7);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#f4f1e6";
  ctx.font = titleFont;
  ctx.fillText(slot.ability.name.toUpperCase(), x + 16, y + 14);
  ctx.fillStyle = accent;
  ctx.font = metaFont;
  ctx.fillText(`${slot.ability.key.toUpperCase()}  |  ${cooldown}`, x + 16, y + 35);
  ctx.fillStyle = "#d0c6b4";
  ctx.font = bodyFont;
  bodyLines.forEach((line, index) => {
    ctx.fillText(line, x + 16, y + 56 + index * 18);
  });
  ctx.restore();
}

function drawAbilityBar() {
  const abilities = currentAbilities();
  const slotH = 74;
  const gap = 14;
  const classKey = currentClassKey();
  const slotWidths = abilities.map((ability) => ability.key === "Space" ? 256 : 234);
  const potionW = 218;
  const totalW = slotWidths.reduce((sum, width) => sum + width, 0) + potionW + gap * abilities.length;
  const scale = Math.min(1, Math.max(0.68, (canvas.clientWidth - 28) / totalW));
  const scaledCanvasW = canvas.clientWidth / scale;
  const scaledCanvasH = canvas.clientHeight / scale;
  let cursorX = scaledCanvasW / 2 - totalW / 2;
  const y = scaledCanvasH - slotH - 26;
  abilityHudSlots = [];
  ctx.save();
  ctx.scale(scale, scale);
  abilities.forEach((ability, index) => {
    const x = cursorX;
    const slotW = slotWidths[index];
    const tone = classKey === "mage" || classKey === "ranger" ? "blue" : "gold";
    const cooldown = player.abilityCooldowns[index] || 0;
    const ready = cooldown <= 0 && (player.room === "arena" || player.room === "starter" || player.room === "maze") && !player.dead && !player.won && ui.menuOverlay?.classList.contains("hidden");
    drawAbilityHudSlot({
      x,
      y,
      w: slotW,
      h: slotH,
      key: ability.key.toUpperCase(),
      title: ability.name,
      status: cooldown > 0 ? `${cooldown.toFixed(1)}s` : "Ready",
      statusColor: cooldown > 0 ? "#d0c6b4" : "#29ef57",
      iconId: `abilities.${classKey}.${index}`,
      ringId: abilityHudIconRingKey(classKey, index),
      tone,
      cooldown,
      cooldownDuration: ability.cooldown,
    });
    abilityHudSlots.push({
      ability,
      index,
      x: x * scale,
      y: y * scale,
      w: slotW * scale,
      h: slotH * scale,
      cooldown,
      tone,
    });
    cursorX += slotW + gap;
  });
  drawAbilityHudSlot({
    x: cursorX,
    y,
    w: potionW,
    h: slotH,
    key: "F",
    title: "Potion",
    status: `${player.potions} left`,
    statusColor: player.potions > 0 ? "#5ab9ff" : "#8aa1b5",
    iconId: "ui.potion",
    ringId: "ui.abilityIconRingBlue",
    tone: "blue",
  });
  ctx.restore();
  drawAbilityTooltip();
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
  const spectateTarget = currentSpectateTarget();
  ui.roomText.textContent = spectateTarget ? `Spectating ${spectatePeerLabel(spectateTarget.id)}` : player.dead ? "You're Stuffed" : player.room === "starter" ? "Starter Room" : player.room === "maze" ? (mazeState?.theme.name || "Maze") : player.won ? "Victory" : "Boss Arena";
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
    <div><span>Damage</span><strong>${playerDamage()}</strong></div>
    <div><span>Range</span><strong>${player.stats.range}</strong></div>
    <div><span>Armor</span><strong>${effectivePlayerArmor()}</strong></div>
    <div><span>Speed</span><strong>${Math.round(playerSpeed())}</strong></div>
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
    ui.deathScreen.hidden = !player.dead || Boolean(spectateTarget);
  }
  updateMultiplayerDebugHud();
}

function updateMultiplayerDebugHud() {
  if (ui.debugReportButton) ui.debugReportButton.hidden = !gauntletTestDebugEnabled;
  if (!ui.multiplayerDebugHud) return;
  if (!gauntletTestDebugEnabled || runState.mode !== "multiplayer") {
    ui.multiplayerDebugHud.hidden = true;
    return;
  }
  const role = isMultiplayerHost() ? "Host" : "Client";
  const wave = player.room === "maze" && mazeState ? mazeState.waveIndex + 1 : "-";
  const enemies = player.room === "maze" && mazeState ? mazeState.enemies.filter((enemy) => enemy.hp > 0).length : 0;
  const syncAge = multiplayer.lastGauntletSyncAt ? `${((Date.now() - multiplayer.lastGauntletSyncAt) / 1000).toFixed(1)}s` : "--";
  const hostileAge = multiplayer.lastHostileSyncAt ? `${((Date.now() - multiplayer.lastHostileSyncAt) / 1000).toFixed(1)}s` : "--";
  const hostileCount = multiplayer.hostileNetState?.size || 0;
  ui.multiplayerDebugHud.hidden = false;
  ui.multiplayerDebugHud.textContent = `${role} | ${multiplayer.partyPhase} | seq ${multiplayer.phaseSeq} | ${player.room} | wave ${wave} | enemies ${enemies} | sync ${syncAge} | hostile ${hostileAge}/${hostileCount} | snaps ${multiplayer.hostileSnapCount || 0}`;
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

function storedMultiplayerServerUrl() {
  try {
    return localStorage.getItem("bossFightServerUrl") || "";
  } catch {
    return "";
  }
}

function saveMultiplayerServerUrl(value) {
  try {
    if (value) localStorage.setItem("bossFightServerUrl", value);
    else localStorage.removeItem("bossFightServerUrl");
  } catch {
    // Storage can be unavailable in some desktop or privacy-restricted runtimes.
  }
}

function queryMultiplayerServerUrl() {
  const params = new URLSearchParams(location.search);
  return params.get("server") || params.get("coop") || "";
}

function sameHostMultiplayerServerUrl() {
  if (location.protocol === "file:" || !location.host) return "";
  return `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`;
}

function normalizeMultiplayerServerUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (/^https:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash.replace(/^https/i, "wss");
  if (/^http:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash.replace(/^http/i, "ws");
  if (/^wss?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  if (/^(localhost|127\.0\.0\.1|\[?::1\]?)(:|$)/i.test(withoutTrailingSlash)) return `ws://${withoutTrailingSlash}`;
  return `wss://${withoutTrailingSlash}`;
}

function multiplayerServerUrl() {
  return normalizeMultiplayerServerUrl(
    ui.serverUrlInput?.value ||
      queryMultiplayerServerUrl() ||
      desktopConfig.serverUrl ||
      storedMultiplayerServerUrl() ||
      sameHostMultiplayerServerUrl()
  );
}

function multiplayerSocketUrl() {
  const serverUrl = multiplayerServerUrl();
  return serverUrl ? `${serverUrl}/coop` : "";
}

function persistMultiplayerServerUrl() {
  const serverUrl = normalizeMultiplayerServerUrl(ui.serverUrlInput?.value || multiplayerServerUrl());
  if (ui.serverUrlInput && ui.serverUrlInput.value !== serverUrl) ui.serverUrlInput.value = serverUrl;
  saveMultiplayerServerUrl(serverUrl);
}

function initializeMultiplayerServerInput() {
  if (!ui.serverUrlInput) return;
  ui.serverUrlInput.value = multiplayerServerUrl();
  ui.serverUrlInput.addEventListener("change", persistMultiplayerServerUrl);
  ui.serverUrlInput.addEventListener("blur", persistMultiplayerServerUrl);
}

function initializeDesktopUpdates() {
  if (!desktopConfig.isDesktop || !ui.desktopUpdateButton) return;
  ui.desktopUpdateButton.hidden = false;
  ui.desktopUpdateButton.addEventListener("click", async () => {
    ui.desktopUpdateButton.disabled = true;
    setMenuStatus("Checking for updates...");
    try {
      const status = await desktopUpdater?.checkForUpdates?.();
      if (status?.message) setMenuStatus(status.message);
    } catch {
      setMenuStatus("Update check failed.");
    } finally {
      ui.desktopUpdateButton.disabled = false;
    }
  });
  desktopUpdater?.onStatus?.((status) => {
    if (status?.message) setMenuStatus(status.message);
  });
}

function setupMultiplayer() {
  if (!("WebSocket" in window)) {
    setCoopStatus("Solo", 1);
    setMenuStatus("This runtime does not support multiplayer.");
    return;
  }
  const socketUrl = multiplayerSocketUrl();
  if (!socketUrl) {
    setCoopStatus("Start server for co-op", 1);
    setMenuStatus("Enter a multiplayer server URL.");
    return;
  }
  if (multiplayer.socket) return;
  multiplayer.enabled = true;
  connectMultiplayer();
}

function connectMultiplayer() {
  if (!multiplayer.enabled) return;
  const socketUrl = multiplayerSocketUrl();
  if (!socketUrl) {
    setCoopStatus("Co-op offline", 1);
    setMenuStatus("Enter a multiplayer server URL.");
    return;
  }
  persistMultiplayerServerUrl();
  const socket = new WebSocket(socketUrl);
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
      const message = JSON.parse(event.data);
      debugReportState.messageSeq += 1;
      if (message.type !== "peer-state" || debugReportState.messageSeq % 10 === 0 || message.state?.partyPhase !== multiplayer.partyPhase) {
        recordDebugEvent("ws-message", {
          type: message.type,
          peerId: message.id,
          eventKind: message.event?.kind,
          stateRoom: message.state?.room,
          statePhase: message.state?.partyPhase,
          stateSeq: message.state?.phaseSeq,
        });
      }
      handleMultiplayerMessage(message);
    } catch (error) {
      reportRuntimeError(error, { area: "websocket-message", raw: String(event.data || "").slice(0, 2000) });
    }
  });

  socket.addEventListener("close", (event) => {
    recordDebugEvent("ws-close", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      phase: multiplayer.partyPhase,
      room: player.room,
    });
    multiplayer.connected = false;
    multiplayer.socket = null;
    multiplayer.peers.clear();
    if (!multiplayer.everConnected) {
      multiplayer.enabled = false;
      setCoopStatus("Co-op offline", 1);
      setMenuStatus("Could not connect. Check the multiplayer server URL.");
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
    recordDebugEvent("ws-error", {
      phase: multiplayer.partyPhase,
      room: player.room,
      readyState: socket.readyState,
    });
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
    applyHostPartyPhaseSnapshot(message.state, message.id);
    applyRemoteBossProgress(message.state, message.id);
    if (isMultiplayerHost()) maybeAdvancePartyPhase();
    return;
  }
  if (message.type === "peer-event" && message.id && message.event) {
    handleMultiplayerEvent(message.id, message.event);
    return;
  }
  if (message.type === "projectile-damage") {
    applyAuthoritativeProjectileDamage(message);
    return;
  }
  if (message.type === "projectile-damage-ignored") {
    recordDebugEvent("projectile-damage-ignored", {
      projectileId: message.projectileId,
      playerId: message.playerId,
      reason: message.reason || "server",
    });
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
  if (multiplayer.hostileSyncTimer > 0) multiplayer.hostileSyncTimer -= dt;
  if (shouldBroadcastGauntletSync()) safeRecoverGauntletWaveAdvance("multiplayer-watchdog");
  checkStaleGauntletSync();
  if (shouldBroadcastGauntletSync()) sendGauntletSync(false);
  if (shouldBroadcastHostileSync()) sendHostileSync(false);
  multiplayer.sendTimer -= dt;
  if (multiplayer.sendTimer <= 0) {
    multiplayer.sendTimer = multiplayerStateInterval;
    sendMultiplayerState(false);
  }
}

function checkStaleGauntletSync() {
  if (!isPartySyncActive() || isMultiplayerHost() || !multiplayer.connected) return;
  if (player.room !== "maze" || multiplayer.partyPhase !== "gauntlet" || !mazeState) return;
  if (!multiplayer.lastGauntletSyncAt) return;
  if (multiplayer.lastGauntletSyncPhaseSeq !== multiplayer.phaseSeq) return;
  const now = Date.now();
  const ageMs = now - multiplayer.lastGauntletSyncAt;
  if (ageMs < 3000) return;
  if (now - (multiplayer.staleGauntletReportAt || 0) < 10000) return;
  multiplayer.staleGauntletReportAt = now;
  const hostId = multiplayer.room?.hostId || null;
  const hostPeer = hostId ? multiplayer.peers.get(hostId) : null;
  recordDebugEvent("gauntlet-sync-stale", {
    ageMs,
    lastSyncSeq: multiplayer.lastGauntletSyncSeq,
    lastSyncPhaseSeq: multiplayer.lastGauntletSyncPhaseSeq,
    phaseStartedAgeMs: multiplayer.gauntletPhaseStartedAt ? now - multiplayer.gauntletPhaseStartedAt : null,
    phaseSeq: multiplayer.phaseSeq,
    waveIndex: mazeState.waveIndex,
    hostPeerAgeMs: hostPeer?.updatedAt ? now - hostPeer.updatedAt : null,
    hostPeerRoom: hostPeer?.room || null,
    hostPeerPhase: hostPeer?.partyPhase || null,
    hostPeerPhaseSeq: hostPeer?.phaseSeq || null,
  });
  showDebugReport(new Error(`Host gauntlet sync stale for ${Math.round(ageMs)}ms`), {
    area: "gauntlet-sync-stale",
    ageMs,
    lastSyncSeq: multiplayer.lastGauntletSyncSeq,
    lastSyncPhaseSeq: multiplayer.lastGauntletSyncPhaseSeq,
    hostPeerRoom: hostPeer?.room || null,
    hostPeerPhase: hostPeer?.partyPhase || null,
    hostPeerPhaseSeq: hostPeer?.phaseSeq || null,
  });
}

function multiplayerWatchdogTick() {
  try {
    if (!multiplayer.enabled) return;
    if (shouldBroadcastGauntletSync()) {
      safeRecoverGauntletWaveAdvance("interval-watchdog");
      sendGauntletSync(true);
    }
    checkStaleGauntletSync();
    if (multiplayer.connected && multiplayer.mode === "multiplayer" && multiplayer.room?.state === "inGame" && !multiplayer.pendingStart) {
      sendMultiplayerState(true);
    }
  } catch (error) {
    reportRuntimeError(error, { area: "multiplayerWatchdogTick" });
  }
}

function sendMultiplayerState(force) {
  if (!multiplayer.connected || !multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  if (multiplayer.mode !== "multiplayer" || !multiplayer.room || multiplayer.room.state !== "inGame") return;
  if (multiplayer.pendingStart) return;
  if (!force && document.hidden) return;
  try {
    sendServer({ type: "state", state: multiplayerSnapshot() });
  } catch (error) {
    reportRuntimeError(error, { area: "sendMultiplayerState", force, room: player.room, phase: multiplayer.partyPhase });
  }
}

function sendMultiplayerEvent(event) {
  if (!multiplayer.connected || !multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  if (multiplayer.mode !== "multiplayer" || !multiplayer.room || multiplayer.room.state !== "inGame") return;
  if (shouldDropMultiplayerEvent(event)) return;
  try {
    sendServer({ type: "event", event });
  } catch (error) {
    reportRuntimeError(error, { area: "sendMultiplayerEvent", eventKind: event?.kind, phase: multiplayer.partyPhase });
  }
}

function shouldDropMultiplayerEvent(event) {
  if (!event?.kind) return false;
  const bufferedAmount = multiplayer.socket?.bufferedAmount || 0;
  if (event.kind === "hostile-sync" && bufferedAmount > hostileSyncDropBufferedAmount) {
    recordDebugEvent("event-coalesced", { kind: event.kind, reason: "buffered", bufferedAmount, seq: event.seq });
    return true;
  }
  const minInterval = visualEventMinIntervalMs[event.kind];
  if (!minInterval) return false;
  const key = event.kind === "ability" ? `${event.kind}:${event.abilityIndex ?? "x"}` : event.kind;
  const now = performance.now();
  const lastAt = multiplayer.lastVisualEventAt.get(key) || 0;
  if (bufferedAmount > visualEventDropBufferedAmount || now - lastAt < minInterval) {
    recordDebugEvent("event-coalesced", { kind: event.kind, key, reason: bufferedAmount > visualEventDropBufferedAmount ? "buffered" : "rate", bufferedAmount });
    return true;
  }
  multiplayer.lastVisualEventAt.set(key, now);
  return false;
}

function sendServer(payload) {
  if (!multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  try {
    multiplayer.socket.send(JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to send multiplayer payload.", error);
    showDebugReport(error, {
      area: "sendServer",
      payloadType: payload?.type,
      eventKind: payload?.event?.kind,
      stateRoom: payload?.state?.room,
    });
    if (ui.status) ui.status.textContent = "Multiplayer sync recovered from a bad packet.";
  }
}

function beginBossSyncCapture(source) {
  if (!shouldBroadcastBossSync()) return null;
  return {
    source,
    hazardRefs: new Set(hazards),
  };
}

function finishBossSyncCapture(capture) {
  if (!capture || !shouldBroadcastBossSync()) return;
  const newHazards = hazards
    .filter((hazard) => !capture.hazardRefs.has(hazard) && isSyncableBossHazard(hazard))
    .map(serializeBossHazard);
  if (!newHazards.length) return;
  multiplayer.bossSyncSeq += 1;
  sendMultiplayerEvent({
    kind: "boss-sync",
    seq: multiplayer.bossSyncSeq,
    source: capture.source,
    bossKind: boss.kind,
    phaseSeq: multiplayer.phaseSeq,
    hazards: newHazards,
  });
}

function isSyncableBossHazard(hazard) {
  return player.room === "arena" && hazard && !hazard.localOnly && !hazard.mazeHazard && typeof hazard.type === "string";
}

function serializeBossHazard(hazard) {
  assignHazardSyncId(hazard, "h");
  return cloneSyncObject(hazard);
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
  if (value instanceof Set) return [...value].map((item) => cloneSyncValue(item, depth + 1)).filter((item) => typeof item !== "undefined");
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
  if (event.kind === "hostile-sync") {
    applyRemoteHostileSync(peerId, event);
    return;
  }
  if (event.kind === "hit-intent") {
    applyRemoteHitIntent(peerId, event);
    return;
  }
  if (event.kind === "boss-subtarget-intent") {
    applyRemoteBossSubtargetIntent(peerId, event);
    return;
  }
  if (event.kind === "boss-mechanic-intent") {
    applyRemoteBossMechanicIntent(peerId, event);
    return;
  }
  if (event.kind === "hazard-control") {
    applyRemoteHazardControl(peerId, event);
    return;
  }
  if (event.kind === "target-status") {
    applyRemoteTargetStatus(peerId, event);
    return;
  }
  if (event.kind === "target-control") {
    applyRemoteTargetControl(peerId, event);
    return;
  }
  if (event.kind === "ability") {
    spawnRemoteAbilityVisual(peerId, event);
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
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq !== multiplayer.phaseSeq) return;
  if (Number.isFinite(event.seq) && event.seq <= multiplayer.lastBossSyncSeq) return;
  if (Number.isFinite(event.seq)) multiplayer.lastBossSyncSeq = event.seq;
  if (event.bossState && !hasFreshHostileSync()) applyBossStateSnapshot(event.bossState);
  (event.particles || []).slice(-8).forEach((remoteParticle) => {
    if (!remoteParticle?.syncId || particles.some((particle) => particle.syncId === remoteParticle.syncId)) return;
    particles.push(normalizeRemoteBossParticle(remoteParticle, event.serverTime));
  });
}

function normalizeRemoteBossHazard(remoteHazard, serverTime = 0) {
  const hazard = cloneSyncObject(remoteHazard) || {};
  hazard.remoteBossHazard = true;
  if (Number.isFinite(hazard.hazardVx)) hazard.vx = hazard.hazardVx;
  if (Number.isFinite(hazard.hazardVy)) hazard.vy = hazard.hazardVy;
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

function shouldBroadcastHostileSync() {
  if (!isMultiplayerHost() || multiplayer.room?.state !== "inGame") return false;
  if (player.room === "maze") return Boolean(mazeState) && (multiplayer.partyPhase === "gauntlet" || multiplayer.partyPhase === "reward");
  return player.room === "arena";
}

function sendHostileSync(force = false) {
  try {
    sendHostileSyncInner(force);
  } catch (error) {
    reportRuntimeError(error, { area: "sendHostileSync", force, room: player.room, phase: multiplayer.partyPhase });
  }
}

function sendHostileSyncInner(force = false) {
  if (!shouldBroadcastHostileSync()) return;
  if (!force && multiplayer.hostileSyncTimer > 0) return;
  const actors = collectHostileActors();
  const hostileHazards = collectHostileHazards();
  multiplayer.hostileSyncTimer = hostileHazards.length >= hostileHazardHeavyThreshold ? hostileHazardHeavySyncInterval : hostileSyncInterval;
  if (!actors.length && !hostileHazards.length) return;
  multiplayer.hostileSyncSeq += 1;
  const event = {
    kind: "hostile-sync",
    seq: multiplayer.hostileSyncSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    room: player.room,
    mazeSequence: mazeState?.sequence || 0,
    actors,
    hazards: hostileHazards,
  };
  sendMultiplayerEvent(event);
  multiplayer.lastHostileSyncAt = Date.now();
  if (event.seq % 12 === 0) {
    recordDebugEvent("hostile-sync-sent", {
      seq: event.seq,
      room: event.room,
      actors: actors.length,
      hazards: hostileHazards.length,
    });
  }
}

function collectHostileActors() {
  if (player.room === "maze" && mazeState) {
    return mazeState.enemies
      .filter((enemy) => enemy && Number.isFinite(enemy.x) && Number.isFinite(enemy.y))
      .map((enemy) => serializeHostileActor(enemy, {
        type: "gauntlet-enemy",
        syncId: gauntletEnemySyncId(enemy),
        sourceId: enemy.id,
        fields: [
          "id", "kind", "name", "mazeEnemy", "miniBoss", "spawnX", "spawnY", "radius", "maxHp", "hp",
          "color", "attackTimer", "patternIndex", "moveTimer", "ranged", "speed", "damage", "state", "waveIndex",
          "markedTimer", "markedShots", "poisonStacks", "poisonTimer", "poisonTickTimer", "poisonDamagePerStack",
          "bleedTimer", "bleedTickTimer", "bleedDamage", "burnTimer", "burnTickTimer", "burnDamage",
          "exposedStacks", "exposedTimer", "judgmentTimer",
        ],
      }));
  }
  if (player.room !== "arena") return [];
  const actors = [];
  if (boss.kind === "trio") {
    condimentBosses.forEach((target) => {
      actors.push(serializeHostileActor(target, {
        type: "condiment",
        syncId: `boss:${boss.kind}:${target.kind}`,
        sourceId: target.kind,
        fields: ["kind", "name", "radius", "maxHp", "hp", "color", "attackTimer", "baseAttackTimer", "shieldTimer", "moveTimer", "state", "stateTimer"],
      }));
    });
  } else {
    actors.push(serializeHostileActor(boss, {
      type: "boss",
      syncId: `boss:${boss.kind}`,
      sourceId: boss.kind,
      fields: [
        "kind", "name", "radius", "maxHp", "hp", "phase", "totalPhases", "state", "stateTimer", "attackTimer",
        "swingTimer", "animationTime", "enraged", "shieldTimer", "invulnerableTimer", "enrageTextTimer",
        "deliveryActive", "deliveryTimer", "donutGauntletActive", "donutGauntletTimer", "serpentHeading",
        "serpentAngle", "serpentWeakIndex", "serpentWeakTimer", "markedTimer", "markedShots", "poisonStacks",
        "poisonTimer", "poisonTickTimer", "poisonDamagePerStack", "bleedTimer", "bleedTickTimer", "bleedDamage",
        "burnTimer", "burnTickTimer", "burnDamage", "exposedStacks", "exposedTimer", "judgmentTimer",
      ],
    }));
  }
  if (boss.kind === "donut") {
    (boss.donutMinions || []).forEach((minion) => {
      actors.push(serializeHostileActor(minion, {
        type: "donut-minion",
        syncId: `donut-minion:${minion.id}`,
        sourceId: minion.id,
        fields: ["id", "kind", "r", "hp", "maxHp", "speed", "color", "driftAngle", "fireTimer", "ttl", "animationTime"],
      }));
    });
    (boss.donutHoles || []).forEach((hole) => {
      actors.push(serializeHostileActor(hole, {
        type: "donut-hole",
        syncId: `donut-hole:${hole.id}`,
        sourceId: hole.id,
        fields: ["id", "angle", "r", "fireTimer", "hp", "maxHp"],
      }));
    });
  }
  if (boss.kind === "sushi" && Array.isArray(boss.serpentBody)) {
    boss.serpentBody.forEach((segment, index) => {
      actors.push(serializeHostileActor(segment, {
        type: "sushi-segment",
        syncId: `sushi-segment:${index}`,
        sourceId: String(index),
        fields: ["heading"],
        extra: { index, weakIndex: boss.serpentWeakIndex },
      }));
    });
  }
  return actors.filter(Boolean);
}

const hostileHazardCommonFields = [
  "syncId", "projectileId", "ownerId", "hitPlayerIds", "piercing", "type", "mazeHazard", "remoteBossHazard", "r", "radius", "ttl", "warn", "delay",
  "fireTimer", "explodeTimer", "damageTimer", "damage", "fixedDamage", "source", "color",
  "angle", "length", "width", "height", "vertical", "horizontal", "orientation", "position",
  "axis", "direction", "speed", "turn", "sweepSpeed", "storm", "lingering", "chill", "hit",
];

const hostileHazardTypeFields = {
  mazeShot: ["turn"],
  mazeCircle: ["damageTimer", "lingering", "chill", "hit"],
  mazeWall: ["hit"],
  bolt: ["turn"],
  fry: ["turn"],
  mustardSeed: ["bounces", "turn"],
  sauceBlob: ["turn"],
  peanut: ["bounces", "turn"],
  cherryShot: ["turn"],
  nachoCrumb: ["turn"],
  pepperoni: ["turn"],
  cheeseBolt: ["turn"],
  sprinkle: ["turn", "donutMinionHazard"],
  pico: ["turn", "storm"],
  nachoChip: ["traveled", "shatterDistance"],
  nachoCheesePuddle: ["damageTimer"],
  nachoCheeseMortar: ["damageTimer"],
  cheeseWave: ["damageTimer"],
  pizzaDash: ["targetX", "targetY", "dashed"],
  pizzaCheeseTrail: ["damageTimer"],
  pizzaSlice: ["traveled", "shatterDistance"],
  pizzaSliceReturn: ["active"],
  pizzaCrustWall: ["damageTimer"],
  ovenZone: ["hit"],
  pizzaBoxSlam: ["hit"],
  tomatoSlice: ["knockback"],
  pickleSplash: ["startX", "startY", "targetX", "targetY", "age", "flightTime", "arcHeight", "bounces"],
  picklePuddle: ["slowDuration"],
  onionRing: ["moveAngle", "spin", "inner", "outer", "knockback"],
  burgerSauceDrop: ["hit", "fallHeight", "warnDuration"],
  burgerSauceBurst: ["hitPlayer"],
  burgerChargeLane: ["startX", "startY", "endX", "endY", "hit"],
  burgerBurstRing: ["inner", "gapAngle", "gapWidth", "warnDuration", "hit"],
  colaBubble: [],
  strawSnipe: ["hit"],
  fizzBurst: ["hit"],
  sodaDrop: ["hit"],
  sodaPuddle: ["damageTimer"],
  chocolateBar: ["hit", "fixedDamage"],
  scoopDrop: ["hit"],
  frozenPuddle: ["damageTimer"],
  cherryBomb: ["hit", "burstTimer", "burstShots", "burstDelay"],
  grease: ["exploded", "explodeTimer"],
  machineGun: ["fireTimer", "damageTimer", "sweepSpeed"],
  vent: ["hit"],
  slam: ["hit"],
  ketchupMortar: ["startX", "startY", "targetX", "targetY", "age", "flightTime", "permanentAfterLanding"],
  ketchupPuddle: ["damageTimer"],
  tacoCharge: ["targetX", "targetY", "tacoPuzzleIngredient"],
  tacoShellShard: ["tacoPuzzleIngredient", "damageTimer"],
  ingredientDrop: ["ingredient", "tacoPuzzleIngredient", "hit"],
  tacoSalsa: ["tacoPuzzleIngredient", "damageTimer"],
  tacoSlam: ["inner", "gapAngle", "tacoPuzzleIngredient", "hit"],
  lettuceLeaf: ["wobble", "tacoPuzzleIngredient"],
  lettuceCleanseZone: ["pulse"],
  tacoGrease: ["damageTimer"],
  tacoCheese: ["damageTimer"],
  tacoIngredientFlood: ["safeX", "safeY", "safeW", "safeH", "cleared", "hit"],
  glazeRing: ["radiusNow", "maxRadius", "gapAngle", "gapWidth", "spinSpeed", "hit"],
  frostingRibbon: ["damageTimer"],
  royalRoll: ["startX", "startY", "endX", "endY", "rollAge", "rollDuration", "prevX", "prevY", "hit"],
  sugarZone: [],
  wasabiDash: ["startX", "startY", "endX", "endY", "dashAge", "dashDuration", "prevX", "prevY", "hit"],
  wasabiTrail: ["damageTimer"],
  chopstickJab: ["hit"],
  sushiRoll: ["spin", "turn"],
  soySakeWave: ["damageTimer", "speed", "originX", "originY", "warnDuration", "age", "activeAge", "activeDuration", "surgeDuration", "fadeDuration", "visualPadding", "textureOffset", "waveSeed"],
  wasabiWave: ["lane", "hit"],
  soyPuddle: ["damageTimer"],
  chopstickPin: ["hit"],
  serpentSweep: ["hit"],
};

function hostileHazardFieldsFor(hazard) {
  return [...new Set(hostileHazardCommonFields.concat(hostileHazardTypeFields[hazard?.type] || []))];
}

function serializeHostileHazard(hazard) {
  const serialized = player.room === "maze" ? serializeGauntletHazard(hazard) : serializeBossHazard(hazard);
  const extra = {};
  if (Number.isFinite(hazard.vx)) extra.hazardVx = hazard.vx;
  if (Number.isFinite(hazard.vy)) extra.hazardVy = hazard.vy;
  return serializeHostileActor(serialized, {
    type: "hazard",
    syncId: `hazard:${serialized.syncId}`,
    sourceId: serialized.syncId,
    fields: hostileHazardFieldsFor(serialized),
    extra,
  });
}

function collectHostileHazards() {
  if (player.room !== "maze" && player.room !== "arena") return [];
  return hazards
    .filter((hazard) => hazard && Number.isFinite(hazard.x) && Number.isFinite(hazard.y))
    .filter((hazard) => !Number.isFinite(hazard.ttl) || hazard.ttl > 0)
    .filter((hazard) => player.room === "maze" ? hazard.mazeHazard : isSyncableBossHazard(hazard))
    .map(serializeHostileHazard)
    .filter(Boolean);
}

function serializeHostileActor(source, options) {
  if (!source || !options?.syncId || !Number.isFinite(source.x) || !Number.isFinite(source.y)) return null;
  const syncId = String(options.syncId);
  const velocity = hostileVelocityFor(syncId, source.x, source.y);
  const snapshot = {
    syncId,
    type: options.type,
    sourceId: options.sourceId ?? "",
    x: source.x,
    y: source.y,
    vx: velocity.vx,
    vy: velocity.vy,
  };
  (options.fields || []).forEach((key) => {
    if (key === "syncId") return;
    const value = cloneSyncObject(source[key]);
    if (typeof value === "undefined") return;
    if (options.type === "hazard" && key === "type") snapshot.hazardType = value;
    else snapshot[key] = value;
  });
  if (options.extra) Object.assign(snapshot, cloneSyncObject(options.extra));
  if (Number.isFinite(source.radius) && !Number.isFinite(snapshot.radius)) snapshot.radius = source.radius;
  if (Number.isFinite(source.r) && !Number.isFinite(snapshot.r)) snapshot.r = source.r;
  if (Number.isFinite(source.hp)) snapshot.hp = Math.max(0, source.hp);
  if (Number.isFinite(source.maxHp)) snapshot.maxHp = Math.max(1, source.maxHp);
  return snapshot;
}

function hostileVelocityFor(syncId, x, y) {
  const now = performance.now();
  const previous = multiplayer.hostileHostSendState.get(syncId);
  multiplayer.hostileHostSendState.set(syncId, { x, y, at: now });
  if (!previous || !Number.isFinite(previous.x) || !Number.isFinite(previous.y)) return { vx: 0, vy: 0 };
  const elapsed = clamp((now - previous.at) / 1000, 0.04, 0.45);
  return {
    vx: (x - previous.x) / elapsed,
    vy: (y - previous.y) / elapsed,
  };
}

function applyRemoteHostileSync(peerId, event) {
  try {
    applyRemoteHostileSyncInner(peerId, event);
  } catch (error) {
    reportRuntimeError(error, { area: "applyRemoteHostileSync", peerId, event });
  }
}

function applyRemoteHostileSyncInner(peerId, event) {
  if (!isHostPeer(peerId) || isMultiplayerHost() || !event || event.bossKind !== boss.kind) return;
  if (event.room !== player.room) return;
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq !== multiplayer.phaseSeq) return;
  if (player.room === "maze" && mazeState && Number.isFinite(event.mazeSequence) && event.mazeSequence !== mazeState.sequence) return;
  if (Number.isFinite(event.seq) && event.seq <= multiplayer.lastHostileSyncSeq) return;
  if (Number.isFinite(event.seq)) multiplayer.lastHostileSyncSeq = event.seq;
  multiplayer.lastHostileSyncAt = Date.now();
  const snapshots = []
    .concat(Array.isArray(event.actors) ? event.actors : [])
    .concat(Array.isArray(event.hazards) ? event.hazards : []);
  snapshots.forEach((snapshot) => recordHostileSnapshot(snapshot, event));
  pruneMissingHostileActors(snapshots);
  if (Number.isFinite(event.seq) && event.seq % 12 === 0) {
    recordDebugEvent("hostile-sync-received", {
      seq: event.seq,
      room: event.room,
      actors: Array.isArray(event.actors) ? event.actors.length : 0,
      hazards: Array.isArray(event.hazards) ? event.hazards.length : 0,
    });
  }
}

function pruneMissingHostileActors(snapshots) {
  const present = new Set((snapshots || []).map((snapshot) => snapshot?.syncId).filter(Boolean).map(String));
  if (player.room !== "arena" || boss.kind !== "donut") return;
  boss.donutMinions = (boss.donutMinions || []).filter((minion) => present.has(`donut-minion:${minion.id}`));
  boss.donutHoles = (boss.donutHoles || []).filter((hole) => present.has(`donut-hole:${hole.id}`));
}

function recordHostileSnapshot(snapshot, event) {
  if (!snapshot?.syncId || !snapshot.type || !Number.isFinite(snapshot.x) || !Number.isFinite(snapshot.y)) return;
  const syncId = String(snapshot.syncId);
  if (snapshot.type === "hazard" && isConsumedRemoteHazard(syncId)) return;
  const serverTime = Number(event?.serverTime) || Date.now();
  const entry = multiplayer.hostileNetState.get(syncId) || {
    syncId,
    type: snapshot.type,
    sourceId: snapshot.sourceId ?? "",
    snapshots: [],
    lastSnapshot: null,
    lastSeenAt: 0,
  };
  entry.type = snapshot.type;
  entry.sourceId = snapshot.sourceId ?? entry.sourceId;
  entry.lastSnapshot = cloneSyncObject(snapshot);
  entry.lastSeenAt = Date.now();
  entry.snapshots.push({
    t: serverTime,
    x: snapshot.x,
    y: snapshot.y,
    vx: Number(snapshot.vx) || 0,
    vy: Number(snapshot.vy) || 0,
  });
  entry.snapshots = entry.snapshots
    .filter((sample) => Number.isFinite(sample.t) && Number.isFinite(sample.x) && Number.isFinite(sample.y))
    .sort((a, b) => a.t - b.t)
    .slice(-hostileSnapshotBufferLimit);
  multiplayer.hostileNetState.set(syncId, entry);
  const target = ensureHostileTarget(entry);
  if (target) applyHostileSnapshotFields(target, entry.lastSnapshot, false);
}

function updateRemoteHostileActors(dt) {
  if (!isMultiplayerGame() || isMultiplayerHost() || !multiplayer.hostileNetState.size) return;
  const now = Date.now();
  multiplayer.hostileNetState.forEach((entry, syncId) => {
    if (now - (entry.lastSeenAt || 0) > 2600) {
      multiplayer.hostileNetState.delete(syncId);
      return;
    }
    const target = ensureHostileTarget(entry);
    if (!target) return;
    const sample = sampleHostileEntry(entry, now);
    if (!sample) return;
    applyHostileSnapshotFields(target, entry.lastSnapshot, false);
    applyHostilePosition(target, sample, dt);
  });
}

function sampleHostileEntry(entry, now) {
  const samples = entry.snapshots || [];
  if (!samples.length) return null;
  const targetTime = now - hostileInterpolationDelayMs;
  let before = null;
  let after = null;
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    if (samples[index].t <= targetTime) {
      before = samples[index];
      after = samples[index + 1] || null;
      break;
    }
  }
  if (!before) {
    const first = samples[0];
    return { x: first.x, y: first.y };
  }
  if (after) {
    const span = Math.max(1, after.t - before.t);
    const alpha = clamp((targetTime - before.t) / span, 0, 1);
    return {
      x: before.x + (after.x - before.x) * alpha,
      y: before.y + (after.y - before.y) * alpha,
    };
  }
  const extrapolate = clamp(targetTime - before.t, 0, hostileMaxExtrapolateMs) / 1000;
  return {
    x: before.x + (before.vx || 0) * extrapolate,
    y: before.y + (before.vy || 0) * extrapolate,
  };
}

function applyHostilePosition(target, sample, dt) {
  if (!target || !Number.isFinite(sample.x) || !Number.isFinite(sample.y)) return;
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) {
    target.x = sample.x;
    target.y = sample.y;
    return;
  }
  const dx = sample.x - target.x;
  const dy = sample.y - target.y;
  const dist = Math.hypot(dx, dy);
  if (dist > hostileSnapDistance) {
    multiplayer.hostileSnapCount += 1;
    target.x = sample.x;
    target.y = sample.y;
    return;
  }
  const alpha = 1 - Math.exp(-26 * dt);
  target.x += dx * alpha;
  target.y += dy * alpha;
}

function ensureHostileTarget(entry) {
  const snapshot = entry?.lastSnapshot;
  if (!snapshot) return null;
  if (entry.type === "gauntlet-enemy") {
    if (!mazeState) return null;
    let enemy = mazeState.enemies.find((candidate) => gauntletEnemySyncId(candidate) === entry.syncId || candidate.id === snapshot.id);
    if (!enemy) {
      enemy = normalizeGauntletEnemy(snapshot);
      enemy.syncId = entry.syncId;
      mazeState.enemies.push(enemy);
    }
    return enemy;
  }
  if (entry.type === "boss") return boss.kind === snapshot.kind ? boss : null;
  if (entry.type === "condiment") return condimentBosses.find((target) => target.kind === snapshot.sourceId || target.kind === snapshot.kind) || null;
  if (entry.type === "donut-minion") {
    if (boss.kind !== "donut") return null;
    boss.donutMinions = boss.donutMinions || [];
    let minion = boss.donutMinions.find((candidate) => candidate.id === snapshot.id);
    if (!minion && Number.isFinite(snapshot.hp) && snapshot.hp > 0) {
      minion = cloneSyncObject(snapshot);
      boss.donutMinions.push(minion);
    }
    return minion || null;
  }
  if (entry.type === "donut-hole") {
    if (boss.kind !== "donut") return null;
    boss.donutHoles = boss.donutHoles || [];
    let hole = boss.donutHoles.find((candidate) => candidate.id === snapshot.id);
    if (!hole && Number.isFinite(snapshot.hp) && snapshot.hp > 0) {
      hole = cloneSyncObject(snapshot);
      boss.donutHoles.push(hole);
    }
    return hole || null;
  }
  if (entry.type === "sushi-segment") {
    if (boss.kind !== "sushi" || !Number.isFinite(snapshot.index)) return null;
    if (!Array.isArray(boss.serpentBody)) initializeSushiTrail(boss);
    if (!boss.serpentBody[snapshot.index]) boss.serpentBody[snapshot.index] = { x: snapshot.x, y: snapshot.y, heading: snapshot.heading || 0 };
    return boss.serpentBody[snapshot.index];
  }
  if (entry.type === "hazard") {
    if (isConsumedRemoteHazard(entry.syncId)) return null;
    let hazard = hazards.find((candidate) => candidate.syncId && `hazard:${candidate.syncId}` === entry.syncId);
    if (!hazard && Number.isFinite(snapshot.ttl) && snapshot.ttl > 0) {
      const hazardSnapshot = { ...snapshot, type: snapshot.hazardType || snapshot.type };
      hazard = player.room === "maze" ? normalizeGauntletHazard(hazardSnapshot) : normalizeRemoteBossHazard(hazardSnapshot);
      hazard.syncId = String(entry.syncId).replace(/^hazard:/, "");
      hazards.push(hazard);
    }
    return hazard || null;
  }
  return null;
}

function applyHostileSnapshotFields(target, snapshot, includePosition = true) {
  if (!target || !snapshot) return;
  Object.entries(snapshot).forEach(([key, value]) => {
    if (["syncId", "type", "sourceId", "vx", "vy"].includes(key)) return;
    if (!includePosition && (key === "x" || key === "y")) return;
    if (key === "hazardType") {
      target.type = cloneSyncObject(value);
      return;
    }
    if (key === "hazardVx") {
      if (Number.isFinite(value)) target.vx = value;
      return;
    }
    if (key === "hazardVy") {
      if (Number.isFinite(value)) target.vy = value;
      return;
    }
    if (key === "hp" && Number.isFinite(value)) {
      target.hp = clamp(value, 0, Number.isFinite(target.maxHp) ? Math.max(1, target.maxHp) : Math.max(1, value));
      return;
    }
    if (key === "maxHp" && Number.isFinite(value)) {
      target.maxHp = Math.max(1, value);
      if (Number.isFinite(target.hp)) target.hp = Math.min(target.hp, target.maxHp);
      return;
    }
    target[key] = cloneSyncObject(value);
  });
}

function hasFreshHostileSync() {
  return isMultiplayerGame() && !isMultiplayerHost() && multiplayer.lastHostileSyncAt && Date.now() - multiplayer.lastHostileSyncAt < 1200;
}

function syncBossHazardsSnapshot(remoteHazards, serverTime = 0) {
  if (!Array.isArray(remoteHazards) || isMultiplayerHost() || player.room !== "arena") return;
  if (hasFreshHostileSync()) {
    const seen = new Set();
    remoteHazards.forEach((remoteHazard) => {
      if (!remoteHazard?.syncId) return;
      if (isConsumedRemoteHazard(remoteHazard.syncId)) return;
      seen.add(remoteHazard.syncId);
      const existing = hazards.find((hazard) => hazard.syncId === remoteHazard.syncId);
      if (existing) {
        const keepX = existing.x;
        const keepY = existing.y;
        applyHostileSnapshotFields(existing, normalizeRemoteBossHazard(remoteHazard, serverTime), true);
        if (Number.isFinite(keepX) && Number.isFinite(keepY)) {
          existing.x = keepX;
          existing.y = keepY;
        }
      } else {
        hazards.push(normalizeRemoteBossHazard(remoteHazard, serverTime));
      }
    });
    hazards = hazards.filter((hazard) => !isSyncableBossHazard(hazard) || !hazard.syncId || seen.has(hazard.syncId) || (hazard.ttl || 0) > hostileDeadKeepMs / 1000);
    return;
  }
  const keepLocal = hazards.filter((hazard) => !isSyncableBossHazard(hazard));
  const synced = remoteHazards
    .filter((hazard) => !isConsumedRemoteHazard(hazard?.syncId))
    .map((hazard) => normalizeRemoteBossHazard(hazard, serverTime));
  hazards = keepLocal.concat(synced);
}

function shouldBroadcastGauntletSync() {
  return isMultiplayerHost() && player.room === "maze" && Boolean(mazeState) && (multiplayer.partyPhase === "gauntlet" || multiplayer.partyPhase === "reward");
}

function sendGauntletSync(force = false) {
  try {
    sendGauntletSyncInner(force);
  } catch (error) {
    reportRuntimeError(error, { area: "sendGauntletSync", force });
  }
}

function sendGauntletSyncInner(force = false) {
  if (!shouldBroadcastGauntletSync()) return;
  ensureGauntletRuntimeState();
  if (!force && multiplayer.gauntletSyncTimer > 0) return;
  multiplayer.gauntletSyncTimer = gauntletSyncInterval;
  multiplayer.gauntletSyncSeq += 1;
  const event = {
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
    pickupDrops: mazeState.pickupDrops.map(serializeGauntletPickup).filter(Boolean),
    hazards: hazards.filter((hazard) => hazard.mazeHazard).map(serializeGauntletHazard),
  };
  sendMultiplayerEvent(event);
  multiplayer.lastGauntletSyncAt = Date.now();
  if (force || event.seq % 10 === 0) {
    recordDebugEvent("gauntlet-sync-sent", {
      seq: event.seq,
      phaseSeq: event.phaseSeq,
      waveIndex: event.waveIndex,
      enemies: event.enemies.length,
      hazards: event.hazards.length,
      force,
      rewardPending: event.rewardPending,
    });
  }
}

function serializeGauntletEnemy(enemy) {
  if (!enemy.id) enemy.id = enemy.miniBoss ? "warden" : `mob-${Math.round(enemy.spawnX)}-${Math.round(enemy.spawnY)}`;
  enemy.syncId = gauntletEnemySyncId(enemy);
  const fields = [
    "id", "syncId", "kind", "name", "mazeEnemy", "miniBoss", "x", "y", "spawnX", "spawnY", "radius", "maxHp",
    "hp", "color", "attackTimer", "patternIndex", "moveTimer", "ranged", "speed", "damage", "state",
    "waveIndex", "markedTimer", "markedShots", "poisonStacks", "poisonTimer", "poisonTickTimer",
    "poisonDamagePerStack", "bleedTimer", "bleedTickTimer", "bleedDamage", "burnTimer", "burnTickTimer",
    "burnDamage", "exposedStacks", "exposedTimer", "judgmentTimer",
  ];
  return fields.reduce((snapshot, key) => {
    const value = cloneSyncObject(enemy[key]);
    if (typeof value !== "undefined") snapshot[key] = value;
    return snapshot;
  }, {});
}

function gauntletEnemySyncId(enemy) {
  if (!enemy) return "gauntlet:unknown";
  if (!enemy.id) enemy.id = enemy.miniBoss ? "warden" : `mob-${Math.round(enemy.spawnX || enemy.x || 0)}-${Math.round(enemy.spawnY || enemy.y || 0)}`;
  const sequence = mazeState?.sequence || 0;
  const syncId = enemy.syncId || `gauntlet:${sequence}:${enemy.id}`;
  enemy.syncId = syncId;
  return syncId;
}

function serializeGauntletPickup(pickup) {
  if (!pickup || !Number.isFinite(pickup.x) || !Number.isFinite(pickup.y)) return null;
  return {
    id: String(pickup.id || ""),
    type: pickup.type === "potion" ? "potion" : "heal",
    x: Math.round(pickup.x),
    y: Math.round(pickup.y),
    r: Math.max(4, Math.round(Number(pickup.r) || 16)),
    amount: Math.max(1, Math.round(Number(pickup.amount) || (pickup.type === "potion" ? 1 : 24))),
    ttl: Math.max(0, Number(pickup.ttl) || 0),
  };
}

function serializeGauntletHazard(hazard) {
  assignHazardSyncId(hazard, "g");
  return cloneSyncObject(hazard);
}

function normalizeGauntletEnemy(remoteEnemy) {
  const enemy = cloneSyncObject(remoteEnemy) || {};
  enemy.mazeEnemy = true;
  enemy.remoteGauntletEnemy = true;
  enemy.id = String(enemy.id || (enemy.miniBoss ? "warden" : `mob-${Math.round(enemy.x || 0)}-${Math.round(enemy.y || 0)}`));
  enemy.syncId = String(enemy.syncId || `gauntlet:${mazeState?.sequence || 0}:${enemy.id}`);
  enemy.x = Number.isFinite(enemy.x) ? enemy.x : Number.isFinite(enemy.spawnX) ? enemy.spawnX : 0;
  enemy.y = Number.isFinite(enemy.y) ? enemy.y : Number.isFinite(enemy.spawnY) ? enemy.spawnY : 0;
  enemy.spawnX = Number.isFinite(enemy.spawnX) ? enemy.spawnX : enemy.x;
  enemy.spawnY = Number.isFinite(enemy.spawnY) ? enemy.spawnY : enemy.y;
  enemy.radius = Number.isFinite(enemy.radius) ? Math.max(8, enemy.radius) : enemy.miniBoss ? 34 : 18;
  enemy.maxHp = Number.isFinite(enemy.maxHp) ? Math.max(1, enemy.maxHp) : 1;
  enemy.hp = Number.isFinite(enemy.hp) ? clamp(enemy.hp, 0, enemy.maxHp) : enemy.maxHp;
  enemy.moveTimer = Number.isFinite(enemy.moveTimer) ? enemy.moveTimer : 0;
  enemy.attackTimer = Number.isFinite(enemy.attackTimer) ? enemy.attackTimer : 1;
  enemy.speed = Number.isFinite(enemy.speed) ? enemy.speed : enemy.miniBoss ? 82 : 96;
  enemy.damage = Number.isFinite(enemy.damage) ? enemy.damage : enemy.miniBoss ? 16 : 8;
  enemy.color = typeof enemy.color === "string" && enemy.color ? enemy.color : "#f0c35b";
  return enemy;
}

function mergeRemoteGauntletEnemy(remoteEnemy, previousById, serverTime = 0) {
  const enemy = normalizeGauntletEnemy(remoteEnemy);
  const previous = previousById?.get(enemy.id) || previousById?.get(enemy.syncId);
  const receivedAt = performance.now();
  const targetX = enemy.x;
  const targetY = enemy.y;
  const previousTargetX = Number.isFinite(previous?.syncTargetX) ? previous.syncTargetX : previous?.x;
  const previousTargetY = Number.isFinite(previous?.syncTargetY) ? previous.syncTargetY : previous?.y;
  const elapsed = previous?.syncReceivedAt ? clamp((receivedAt - previous.syncReceivedAt) / 1000, 0.04, 0.45) : gauntletSyncInterval;
  const rawVx = Number.isFinite(previousTargetX) ? (targetX - previousTargetX) / elapsed : 0;
  const rawVy = Number.isFinite(previousTargetY) ? (targetY - previousTargetY) / elapsed : 0;
  const speedCap = Math.max(220, (enemy.speed || 100) * (enemy.miniBoss ? 2.4 : 3.1));
  const velocity = Math.hypot(rawVx, rawVy);
  const scale = velocity > speedCap ? speedCap / velocity : 1;
  enemy.syncTargetX = targetX;
  enemy.syncTargetY = targetY;
  enemy.syncReceivedAt = receivedAt;
  enemy.syncVx = rawVx * scale;
  enemy.syncVy = rawVy * scale;
  recordHostileSnapshot({
    ...enemy,
    syncId: enemy.syncId,
    type: "gauntlet-enemy",
    sourceId: enemy.id,
    x: targetX,
    y: targetY,
    vx: enemy.syncVx,
    vy: enemy.syncVy,
  }, { serverTime: serverTime || Date.now() });
  if (previous?.remoteGauntletEnemy && previous.hp > 0 && enemy.hp > 0 && Number.isFinite(previous.x) && Number.isFinite(previous.y)) {
    const snapDistance = Math.hypot(targetX - previous.x, targetY - previous.y);
    if (snapDistance <= remoteGauntletEnemySnapDistance) {
      enemy.x = previous.x;
      enemy.y = previous.y;
      enemy.moveTimer = Number.isFinite(previous.moveTimer) ? previous.moveTimer : enemy.moveTimer;
    }
  }
  if (previous) {
    const keepX = Number.isFinite(previous.x) ? previous.x : enemy.x;
    const keepY = Number.isFinite(previous.y) ? previous.y : enemy.y;
    Object.assign(previous, enemy);
    if (Number.isFinite(keepX) && Number.isFinite(keepY) && previous.hp > 0) {
      previous.x = keepX;
      previous.y = keepY;
    }
    return previous;
  }
  return enemy;
}

function normalizeGauntletPickup(remotePickup) {
  const pickup = cloneSyncObject(remotePickup) || {};
  if (!Number.isFinite(pickup.x) || !Number.isFinite(pickup.y)) return null;
  return {
    id: String(pickup.id || ""),
    type: pickup.type === "potion" ? "potion" : "heal",
    x: pickup.x,
    y: pickup.y,
    r: Number.isFinite(pickup.r) ? Math.max(4, pickup.r) : 16,
    amount: Number.isFinite(pickup.amount) ? Math.max(1, pickup.amount) : pickup.type === "potion" ? 1 : 24,
    ttl: Number.isFinite(pickup.ttl) ? Math.max(0, pickup.ttl) : 0,
  };
}

function normalizeGauntletHazard(remoteHazard, serverTime = 0) {
  const hazard = cloneSyncObject(remoteHazard) || {};
  hazard.mazeHazard = true;
  hazard.remoteGauntletHazard = true;
  if (Number.isFinite(hazard.hazardVx)) hazard.vx = hazard.hazardVx;
  if (Number.isFinite(hazard.hazardVy)) hazard.vy = hazard.hazardVy;
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

function validateRemoteGauntletSyncEvent(event) {
  if (!event || typeof event !== "object") throw new Error("Invalid gauntlet sync: missing event");
  if (!Number.isFinite(event.mazeSequence) || event.mazeSequence <= 0) throw new Error("Invalid gauntlet sync: bad maze sequence");
  if (Number.isFinite(event.waveIndex) && event.waveIndex < -1) throw new Error("Invalid gauntlet sync: bad wave index");
  if (event.waves && !Array.isArray(event.waves)) throw new Error("Invalid gauntlet sync: waves must be an array");
  if (!Array.isArray(event.enemies)) throw new Error("Invalid gauntlet sync: enemies must be an array");
  if (event.pickupDrops && !Array.isArray(event.pickupDrops)) throw new Error("Invalid gauntlet sync: pickupDrops must be an array");
  if (event.hazards && !Array.isArray(event.hazards)) throw new Error("Invalid gauntlet sync: hazards must be an array");
}

function applyRemoteGauntletSync(peerId, event) {
  try {
    applyRemoteGauntletSyncInner(peerId, event);
  } catch (error) {
    reportRuntimeError(error, { area: "applyRemoteGauntletSync", peerId, event });
  }
}

function applyRemoteGauntletSyncInner(peerId, event) {
  if (!isHostPeer(peerId) || isMultiplayerHost() || !event || event.bossKind !== boss.kind) return;
  validateRemoteGauntletSyncEvent(event);
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq < multiplayer.phaseSeq) return;
  if (Number.isFinite(event.seq) && event.seq <= multiplayer.lastGauntletSyncSeq) return;
  if (Number.isFinite(event.seq)) multiplayer.lastGauntletSyncSeq = event.seq;
  multiplayer.lastGauntletSyncAt = Date.now();
  multiplayer.lastGauntletSyncPhaseSeq = Number.isFinite(event.phaseSeq) ? event.phaseSeq : multiplayer.phaseSeq;
  multiplayer.staleGauntletReportAt = 0;
  if (Number.isFinite(event.seq) && (event.seq % 10 === 0 || event.rewardPending || event.miniBossSpawned)) {
    recordDebugEvent("gauntlet-sync-received", {
      seq: event.seq,
      phaseSeq: event.phaseSeq,
      waveIndex: event.waveIndex,
      enemies: event.enemies.length,
      rewardPending: Boolean(event.rewardPending),
      miniBossSpawned: Boolean(event.miniBossSpawned),
    });
  }
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq > multiplayer.phaseSeq) {
    multiplayer.phaseSeq = event.phaseSeq;
    multiplayer.partyPhase = event.rewardPending ? "reward" : "gauntlet";
    multiplayer.localPartyReady = null;
    multiplayer.partyReady.clear();
  } else if (event.rewardPending && multiplayer.partyPhase === "gauntlet") {
    multiplayer.partyPhase = "reward";
    multiplayer.localPartyReady = null;
    multiplayer.partyReady.clear();
  }
  if (!mazeState || mazeState.sequence !== event.mazeSequence) {
    startMazeForBoss(event.bossKind, { fromParty: true, sequence: event.mazeSequence || runState.mazeCount + 1 });
  }
  if (!mazeState) return;
  ensureGauntletRuntimeState();
  const maxWaveIndex = Math.max(-1, (mazeState.waves?.length || 0) - 1);
  if (Number.isFinite(event.waveIndex) && event.waveIndex > maxWaveIndex) throw new Error("Invalid gauntlet sync: wave index out of range");
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
  const previousById = new Map();
  (mazeState.enemies || []).forEach((enemy) => {
    if (enemy.id) previousById.set(enemy.id, enemy);
    if (enemy.syncId) previousById.set(enemy.syncId, enemy);
  });
  const mergedEnemies = (event.enemies || []).map((enemy) => mergeRemoteGauntletEnemy(enemy, previousById, event.serverTime));
  const remoteEnemyIds = new Set(mergedEnemies.map((enemy) => enemy.id));
  const remoteSyncIds = new Set(mergedEnemies.map((enemy) => enemy.syncId));
  mazeState.enemies = (mazeState.enemies || [])
    .filter((enemy) => (enemy.hp > 0 && !enemy.remoteGauntletEnemy) || remoteEnemyIds.has(enemy.id) || remoteSyncIds.has(enemy.syncId))
    .map((enemy) => mergedEnemies.find((remote) => remote === enemy || remote.id === enemy.id || remote.syncId === enemy.syncId) || enemy);
  mergedEnemies.forEach((enemy) => {
    if (!mazeState.enemies.includes(enemy)) mazeState.enemies.push(enemy);
  });
  const claimed = mazeState.claimedPickupIds instanceof Set ? mazeState.claimedPickupIds : new Set();
  mazeState.claimedPickupIds = claimed;
  mazeState.pickupDrops = (event.pickupDrops || [])
    .map(normalizeGauntletPickup)
    .filter((pickup) => pickup && (!pickup.id || !claimed.has(pickup.id)));
  mergeRemoteGauntletHazards(event.hazards || [], event.serverTime);
  if (mazeState.rewardPending && !mazeState.rewardChosen && !player.dead) showMazeRewardChoices();
}

function mergeRemoteGauntletHazards(remoteHazards, serverTime = 0) {
  const keepLocalHazards = hazards.filter((hazard) => !hazard.mazeHazard);
  const previousById = new Map(hazards.filter((hazard) => hazard.mazeHazard && hazard.syncId).map((hazard) => [hazard.syncId, hazard]));
  const synced = [];
  remoteHazards.forEach((remoteHazard) => {
    if (isConsumedRemoteHazard(remoteHazard?.syncId)) return;
    const normalized = normalizeGauntletHazard(remoteHazard, serverTime);
    const previous = normalized.syncId ? previousById.get(normalized.syncId) : null;
    if (previous && hasFreshHostileSync()) {
      const keepX = previous.x;
      const keepY = previous.y;
      Object.assign(previous, normalized);
      previous.x = keepX;
      previous.y = keepY;
      synced.push(previous);
    } else {
      synced.push(previous ? Object.assign(previous, normalized) : normalized);
    }
  });
  hazards = keepLocalHazards.concat(synced);
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

function validPeerIntent(peerId, room, maxAgeMs = 2000) {
  if (!peerId || !isMultiplayerHost()) return null;
  const peer = multiplayer.peers.get(peerId);
  if (!peer) return null;
  if (!Number.isFinite(peer.updatedAt) || Date.now() - peer.updatedAt > maxAgeMs) return null;
  if (room && peer.room !== room) return null;
  if (peer.bossKind !== boss.kind) return null;
  if (peer.dead) return null;
  if (!Number.isFinite(peer.x) || !Number.isFinite(peer.y)) return null;
  return peer;
}

function peerDistanceToPoint(peer, point) {
  if (!peer || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return Infinity;
  return Math.hypot(peer.x - point.x, peer.y - point.y);
}

function remoteIntentAmountCap(peer) {
  const weapon = gear.weapon[peer.weapon] || {};
  const armor = gear.armor[peer.armor] || {};
  const baseDamage = Number(weapon.damage) || 55;
  const multiplier = Number(armor.damageMultiplier) || 1;
  const burstFactor = peer.weaponTag === "Magic" ? 58 : peer.weaponTag === "Bard" ? 58 : peer.weaponTag === "Ranged" ? 44 : 50;
  return Math.max(900, Math.min(3600, Math.ceil(baseDamage * multiplier * burstFactor)));
}

function validRemoteIntentAmount(peer, amount, multiplier = 1) {
  return Number.isFinite(amount) && amount > 0 && amount <= remoteIntentAmountCap(peer) * multiplier;
}

function remoteIntentTargetRange(peer, event, target) {
  const targetRadius = Number(target?.radius) || 0;
  const source = String(event?.source || "");
  if (source.includes("Meteor") || source.includes("Arrow Storm") || source.includes("Divine") || source.includes("Noxious") || source.includes("Groundbreaker")) {
    return 1500 + targetRadius;
  }
  if (event?.encounter === "arena") return 1700 + targetRadius;
  if (peer.weaponTag === "Ranged" || peer.weaponTag === "Magic" || peer.weaponTag === "Bard") return 1250 + targetRadius;
  return 760 + targetRadius;
}

function validPeerTargetIntent(peer, event, target, amount) {
  if (!validRemoteIntentAmount(peer, amount)) return false;
  return peerDistanceToPoint(peer, target) <= remoteIntentTargetRange(peer, event, target);
}

function applyRemoteGauntletDamage(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq) return;
  if (player.room !== "maze" || !mazeState) return;
  const peer = validPeerIntent(peerId, "maze");
  if (!peer) return;
  const amount = Math.max(0, Number(event.amount) || 0);
  if (!amount) return;
  const target = mazeState.enemies.find((enemy) => enemy.id === event.targetId && enemy.hp > 0);
  if (!target) return;
  if (!validPeerTargetIntent(peer, { encounter: "gauntlet", source: event.source }, target, amount)) return;
  damageBossTarget(target, amount, event.source || "Co-op", { remote: true });
  sendGauntletSync(true);
}

function applyRemoteHitIntent(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq) return;
  const room = event.encounter === "gauntlet" ? "maze" : event.encounter === "arena" ? "arena" : "";
  const peer = validPeerIntent(peerId, room);
  if (!peer) return;
  const target = resolveRemoteSyncedTarget(event);
  if (!target) return;
  const amount = Math.max(0, Number(event.baseAmount) || 0);
  if (!amount) return;
  if (!validPeerTargetIntent(peer, event, target, amount)) return;
  const options = cloneSyncObject(event.options || {}) || {};
  options.remote = true;
  options.remoteIntent = true;
  applyDamageBossTargetLocal(target, amount, event.source || "Co-op", options);
  if (event.encounter === "gauntlet") sendGauntletSync(true);
  else sendMultiplayerState(true);
}

function shouldSendBossSubtargetIntent() {
  return isPartySyncActive() && !isMultiplayerHost() && player.room === "arena";
}

function sendBossSubtargetIntent(subKind, payload) {
  if (!shouldSendBossSubtargetIntent()) return;
  multiplayer.intentSeq += 1;
  sendMultiplayerEvent({
    kind: "boss-subtarget-intent",
    seq: multiplayer.intentSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    subKind,
    ...payload,
  });
}

function applyRemoteBossSubtargetIntent(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq || player.room !== "arena") return;
  const peer = validPeerIntent(peerId, "arena");
  if (!peer) return;
  const amount = Math.max(0, Number(event.baseAmount) || 0);
  if (!validRemoteIntentAmount(peer, amount)) return;
  if (event.subKind === "donut-hole" && boss.kind === "donut") {
    const hole = boss.donutHoles?.find((candidate) => candidate.id === event.targetId && candidate.hp > 0);
    if (!hole || !amount) return;
    if (peerDistanceToPoint(peer, hole) > 1500 + (hole.r || 0)) return;
    const damage = Math.ceil(amount * 0.9);
    hole.hp = Math.max(0, hole.hp - damage);
    particles.push({ x: hole.x, y: hole.y - 24, text: `-${damage}`, color: "#ffb6d1", ttl: 0.65 });
    if (hole.hp <= 0) {
      boss.shieldTimer = 0;
      const popDamage = Math.min(Math.max(1, Number(event.popDamage) || Math.round(amount * 1.4)), remoteIntentAmountCap(peer) * 2);
      applyDamageBossTargetLocal(boss, popDamage, "Donut hole pop", { remote: true, remoteIntent: true });
      particles.push({ x: hole.x, y: hole.y - 36, text: "pop", color: "#ffd7e8", ttl: 0.8 });
    }
    sendMultiplayerState(true);
    return;
  }
  if (event.subKind === "donut-minion" && boss.kind === "donut") {
    const minion = boss.donutMinions?.find((candidate) => candidate.id === event.targetId && candidate.hp > 0);
    if (!minion || !amount) return;
    if (peerDistanceToPoint(peer, minion) > 1500 + (minion.radius || 0)) return;
    damageDonutMinion(minion, amount, event.source || "Co-op", { remote: true });
    sendMultiplayerState(true);
    return;
  }
  if (event.subKind === "sushi-segment" && boss.kind === "sushi") {
    const segmentIndex = Number(event.segmentIndex);
    if (!Number.isFinite(segmentIndex) || !amount) return;
    const segment = sushiSegments().find((candidate) => candidate.index === segmentIndex);
    if (!segment) return;
    if (peerDistanceToPoint(peer, segment) > 1500 + (segment.r || 0)) return;
    const damage = segment.weak ? Math.ceil(amount * 1.8) : Math.ceil(amount * 0.82);
    applyDamageBossTargetLocal(boss, damage, segment.weak ? "Weak segment" : "Sushi segment", { remote: true, remoteIntent: true });
    if (segment.weak) {
      boss.serpentWeakIndex = 1 + ((segment.index + 2) % Math.max(2, sushiSegmentCount() - 2));
      boss.serpentWeakTimer = boss.enraged ? 1.5 : 2.15;
      boss.sushiWeakFlashTimer = 0.42;
      setSushiAnimation("weak", 0.38);
      particles.push({ x: segment.x, y: segment.y - 34, text: "weak", color: "#9ff089", ttl: 0.75 });
    }
    sendMultiplayerState(true);
  }
}

function shouldSendBossMechanicIntent() {
  return isPartySyncActive() && !isMultiplayerHost() && player.room === "arena";
}

function sendBossMechanicIntent(action, payload = {}) {
  if (!shouldSendBossMechanicIntent()) return;
  multiplayer.intentSeq += 1;
  sendMultiplayerEvent({
    kind: "boss-mechanic-intent",
    seq: multiplayer.intentSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    action,
    ...payload,
  });
}

function isPointInLineSegment(point, x, y, angle, length, width) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  const dx = point.x - x;
  const dy = point.y - y;
  const forward = Math.cos(angle) * dx + Math.sin(angle) * dy;
  if (forward < 0 || forward > length) return false;
  const side = Math.abs(-Math.sin(angle) * dx + Math.cos(angle) * dy);
  return side < width;
}

function isPeerInTacoShellSafe(peer) {
  const slam = hazards.find((hazard) => hazard.type === "tacoSlam" && hazard.tacoPuzzleIngredient === "shell");
  if (!slam || slam.warn > 0) return false;
  const dist = peerDistanceToPoint(peer, slam);
  const angleToPeer = Math.atan2(peer.y - slam.y, peer.x - slam.x);
  const inGap = Math.abs(angleDifference(angleToPeer, slam.gapAngle)) < 0.46;
  return (dist < slam.r && dist > slam.inner && inGap) || dist <= slam.inner;
}

function peerTouchesTacoFailureHazard(peer, hazard) {
  if (!hazard || hazard.warn > 0) return false;
  const radius = 18;
  if (hazard.type === "tacoCharge") {
    return isPointInLineSegment(peer, hazard.x, hazard.y, hazard.angle, hazard.length, (hazard.width || 44) / 2 + radius + 18);
  }
  if (hazard.type === "tacoSlam") {
    const dist = peerDistanceToPoint(peer, hazard);
    const angleToPeer = Math.atan2(peer.y - hazard.y, peer.x - hazard.x);
    const inGap = Math.abs(angleDifference(angleToPeer, hazard.gapAngle)) < 0.42;
    return dist < hazard.r + radius && dist > hazard.inner && !inGap;
  }
  return Number.isFinite(hazard.r) && peerDistanceToPoint(peer, hazard) < hazard.r + radius + 24;
}

function validTacoMechanicIntent(peer, event) {
  if (boss.kind !== "taco" || !boss.tacoPuzzleActive) return false;
  const ingredient = event?.ingredient;
  if (!ingredient || boss.tacoCurrentIngredient !== ingredient) return false;
  if (event.action === "taco-progress") {
    if (ingredient === "lettuce") {
      return hazards.some((hazard) => hazard.type === "lettuceCleanseZone" && hazard.warn <= 0 && peerDistanceToPoint(peer, hazard) < hazard.r + 18);
    }
    if (ingredient === "shell") return isPeerInTacoShellSafe(peer);
    if (ingredient === "salsa") return !boss.tacoPuzzleFailed;
    return false;
  }
  if (event.action === "taco-failure") {
    return hazards.some((hazard) => hazard.tacoPuzzleIngredient === ingredient && peerTouchesTacoFailureHazard(peer, hazard));
  }
  return false;
}

function applyRemoteBossMechanicIntent(peerId, event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq || player.room !== "arena") return;
  const peer = validPeerIntent(peerId, "arena");
  if (!peer) return;
  if (boss.kind === "taco") {
    if (!validTacoMechanicIntent(peer, event)) return;
    if (event.action === "taco-failure") markTacoPuzzleFailure(event.ingredient, { remote: true });
    if (event.action === "taco-progress") markTacoPuzzleProgress(event.ingredient, { remote: true });
    sendMultiplayerState(true);
  }
}

function sharedHazardSyncId(hazard) {
  if (!isPartySyncActive() || !hazard) return null;
  if (!hazard.syncId && isMultiplayerHost()) {
    if (hazard.mazeHazard) serializeGauntletHazard(hazard);
    else if (player.room === "arena") serializeBossHazard(hazard);
  }
  return hazard.syncId || null;
}

function sendHazardControlIntent(action, hazardIds, payload = {}) {
  if (!isPartySyncActive() || isMultiplayerHost() || !hazardIds?.length) return;
  multiplayer.intentSeq += 1;
  sendMultiplayerEvent({
    kind: "hazard-control",
    seq: multiplayer.intentSeq,
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    room: player.room,
    action,
    hazardIds: [...new Set(hazardIds)].slice(0, 24),
    ...payload,
  });
}

function hazardControlOrigin(event) {
  const x = Number(event?.x);
  const y = Number(event?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function validHazardControlEnvelope(peer, event, origin) {
  const radius = Number(event.radius);
  const range = Number(event.range);
  const extent = Number.isFinite(radius) ? radius : Number.isFinite(range) ? range : 0;
  if (extent <= 0 || extent > 650) return false;
  if (event.action === "destroy") return peerDistanceToPoint(peer, origin) <= extent + 520;
  return peerDistanceToPoint(peer, origin) <= extent + 360;
}

function hazardWithinControlGeometry(hazard, event, origin, peer = null) {
  const padding = (Number(hazard.r) || 10) + 42;
  const radius = Number(event.radius);
  if (Number.isFinite(radius)) {
    if (peerDistanceToPoint(hazard, origin) <= radius + padding) return true;
    if (event.action === "destroy" && canRemoteDestroyHazard(hazard)) {
      const speedSlack = clamp(Math.hypot(Number(hazard.vx) || 0, Number(hazard.vy) || 0) * 0.45, 80, 260);
      return peerDistanceToPoint(hazard, origin) <= radius + padding + speedSlack
        || (peer && peerDistanceToPoint(hazard, peer) <= radius + padding + speedSlack + 180);
    }
    return false;
  }
  const range = Number(event.range);
  const angle = Number(event.angle);
  const halfAngle = Number(event.halfAngle);
  if (!Number.isFinite(range) || !Number.isFinite(angle) || !Number.isFinite(halfAngle) || halfAngle <= 0 || halfAngle > Math.PI) return false;
  const dx = hazard.x - origin.x;
  const dy = hazard.y - origin.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range + padding) return false;
  return Math.abs(angleDifference(Math.atan2(dy, dx), angle)) <= halfAngle + 0.16;
}

function canRemoteDestroyHazard(hazard) {
  if (isDestroyableProjectile(hazard)) return true;
  return Number.isFinite(hazard.r) && hazard.r <= 14 && Number.isFinite(hazard.ttl);
}

function canRemoteSlowHazard(hazard) {
  return Number.isFinite(hazard.vx) && Number.isFinite(hazard.vy) && Number.isFinite(hazard.ttl);
}

function rejectRemoteHazardControl(peerId, event, reason, extra = {}) {
  recordDebugEvent("hazard-control-rejected", {
    peerId,
    action: event?.action || "",
    reason,
    ids: Array.isArray(event?.hazardIds) ? event.hazardIds.length : 0,
    room: event?.room || "",
    ...extra,
  });
}

function applyRemoteHazardControl(peerId, event) {
  if (!isMultiplayerHost() || !event) return;
  if (event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq) {
    rejectRemoteHazardControl(peerId, event, "phase-mismatch");
    return;
  }
  if (event.room !== player.room || !Array.isArray(event.hazardIds)) {
    rejectRemoteHazardControl(peerId, event, "room-or-ids");
    return;
  }
  const peer = validPeerIntent(peerId, event.room, event.action === "destroy" ? 3500 : 2000);
  if (!peer) {
    rejectRemoteHazardControl(peerId, event, "stale-peer");
    return;
  }
  const origin = hazardControlOrigin(event);
  if (!origin || !validHazardControlEnvelope(peer, event, origin)) {
    rejectRemoteHazardControl(peerId, event, "bad-envelope", { peerAgeMs: Date.now() - (peer.updatedAt || 0) });
    return;
  }
  const ids = new Set(event.hazardIds.filter(Boolean));
  if (!ids.size) {
    rejectRemoteHazardControl(peerId, event, "empty-ids");
    return;
  }
  let changed = false;
  let rejectedGeometry = 0;
  let rejectedType = 0;
  let matched = 0;
  hazards.forEach((hazard) => {
    if (!hazard.syncId || !ids.has(hazard.syncId)) return;
    matched += 1;
    if (!hazardWithinControlGeometry(hazard, event, origin, peer)) {
      rejectedGeometry += 1;
      return;
    }
    if (event.action === "destroy") {
      if (!canRemoteDestroyHazard(hazard)) {
        rejectedType += 1;
        return;
      }
      hazard.ttl = 0;
      if (hazard.syncId) multiplayer.hostileNetState.delete(`hazard:${hazard.syncId}`);
      changed = true;
      return;
    }
    if ((event.action === "slow" || event.action === "slow-weaken") && canRemoteSlowHazard(hazard)) {
      const factor = clamp(Number(event.factor) || 0.5, 0.05, 1);
      hazard.vx *= factor;
      hazard.vy *= factor;
      changed = true;
    }
    if (event.action === "slow-weaken" && !hazard.smokeWeakened && Number.isFinite(hazard.damage)) {
      hazard.damage = Math.max(1, Math.ceil(hazard.damage * clamp(Number(event.damageFactor) || 0.75, 0.2, 1)));
      hazard.smokeWeakened = true;
      changed = true;
    }
  });
  if (!changed) {
    rejectRemoteHazardControl(peerId, event, matched ? rejectedType ? "unsupported-type" : rejectedGeometry ? "out-of-range" : "unchanged" : "missing-hazard", { matched, rejectedGeometry, rejectedType });
    return;
  }
  hazards = hazards.filter((hazard) => !Number.isFinite(hazard.ttl) || hazard.ttl > 0);
  if (event.room === "maze") sendGauntletSync(true);
  else sendHostileSync(true);
}

function targetSyncDescriptor(target) {
  if (!isPartySyncActive() || isMultiplayerHost() || !target || target.kind === "trainingDummy") return null;
  if (target.mazeEnemy && player.room === "maze" && target.id) {
    return { encounter: "gauntlet", targetId: target.id };
  }
  if (!target.mazeEnemy && player.room === "arena") {
    return { encounter: "arena", targetKind: target.kind };
  }
  return null;
}

const targetStatusGroups = {
  mark: ["markedTimer", "markedShots"],
  poison: ["poisonStacks", "poisonTimer", "poisonTickTimer", "poisonDamagePerStack"],
  bleed: ["bleedTimer", "bleedTickTimer", "bleedDamage"],
  burn: ["burnTimer", "burnTickTimer", "burnDamage"],
  exposed: ["exposedStacks", "exposedTimer"],
  judgment: ["judgmentTimer"],
};

function targetStatusSnapshot(target, statusGroup) {
  const fields = targetStatusGroups[statusGroup];
  if (!fields) return null;
  return fields.reduce((snapshot, key) => {
    snapshot[key] = target[key] || 0;
    return snapshot;
  }, {});
}

function targetControlSnapshot(target) {
  return {
    x: target.x,
    y: target.y,
    state: target.state || "",
    stateTimer: target.stateTimer || 0,
    attackTimer: target.attackTimer || 0,
    destination: target.destination ? cloneSyncObject(target.destination) : null,
  };
}

function syncTargetStatus(target, statusGroup, statusAction = "") {
  const descriptor = targetSyncDescriptor(target);
  if (!descriptor) return;
  const status = targetStatusSnapshot(target, statusGroup);
  if (!status) return;
  const event = {
    kind: "target-status",
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    ...descriptor,
    statusGroup,
    status,
  };
  if (statusAction) event.statusAction = statusAction;
  sendMultiplayerEvent(event);
}

function syncTargetControl(target) {
  const descriptor = targetSyncDescriptor(target);
  if (!descriptor) return;
  sendMultiplayerEvent({
    kind: "target-control",
    phaseSeq: multiplayer.phaseSeq,
    bossKind: boss.kind,
    ...descriptor,
    control: targetControlSnapshot(target),
  });
}

function resolveRemoteSyncedTarget(event) {
  if (!isMultiplayerHost() || !event || event.bossKind !== boss.kind || event.phaseSeq !== multiplayer.phaseSeq) return null;
  if (event.encounter === "gauntlet") {
    if (player.room !== "maze" || !mazeState) return;
    return mazeState.enemies.find((enemy) => enemy.id === event.targetId && enemy.hp > 0) || null;
  }
  if (event.encounter === "arena") {
    if (player.room !== "arena") return;
    return activeBosses().find((candidate) => candidate.kind === event.targetKind && candidate.hp > 0) || null;
  }
  return null;
}

function finiteStatusNumber(status, key) {
  const value = Number(status?.[key]);
  return Number.isFinite(value) ? value : null;
}

function mergeMaxStatusField(target, status, key) {
  const value = finiteStatusNumber(status, key);
  if (value === null) return false;
  target[key] = Math.max(target[key] || 0, value);
  return true;
}

function mergeRemoteTargetStatus(target, statusGroup, status, statusAction = "") {
  if (!targetStatusGroups[statusGroup] || !status) return false;
  let changed = false;
  if (statusGroup === "mark") {
    const currentTimer = target.markedTimer || 0;
    const incomingTimer = finiteStatusNumber(status, "markedTimer");
    if (incomingTimer !== null) {
      target.markedTimer = Math.max(currentTimer, incomingTimer);
      changed = true;
    }
    const incomingShots = finiteStatusNumber(status, "markedShots");
    if (incomingShots !== null) {
      const currentShots = target.markedShots || 0;
      const timerDelta = incomingTimer === null ? Infinity : Math.abs(incomingTimer - currentTimer);
      const consumedShot = incomingShots < currentShots && currentShots - incomingShots <= 1 && timerDelta <= 0.45;
      target.markedShots = consumedShot ? incomingShots : Math.max(currentShots, incomingShots);
      if (target.markedShots <= 0) target.markedTimer = 0;
      changed = true;
    }
    return changed;
  }
  if (statusGroup === "exposed") {
    if (statusAction === "exposed-consume") {
      target.exposedStacks = 0;
      target.exposedTimer = 0;
      return true;
    }
    changed = mergeMaxStatusField(target, status, "exposedStacks") || changed;
    changed = mergeMaxStatusField(target, status, "exposedTimer") || changed;
    return changed;
  }
  targetStatusGroups[statusGroup].forEach((key) => {
    changed = mergeMaxStatusField(target, status, key) || changed;
  });
  return changed;
}

function applyRemoteTargetStatus(peerId, event) {
  const target = resolveRemoteSyncedTarget(event);
  if (!target || !event.status) return;
  const fields = targetStatusGroups[event.statusGroup];
  if (!fields) return;
  if (!mergeRemoteTargetStatus(target, event.statusGroup, event.status, event.statusAction)) return;
  if (event.encounter === "gauntlet") sendGauntletSync(true);
  else sendMultiplayerState(true);
}

function applyRemoteTargetControl(peerId, event) {
  const target = resolveRemoteSyncedTarget(event);
  const control = event?.control;
  if (!target || !control) return;
  const x = Number(control.x);
  const y = Number(control.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    if (event.encounter === "gauntlet") {
      if (isMazeCircleWalkable(x, y, target.radius)) {
        target.x = x;
        target.y = y;
      }
    } else {
      const point = clampArenaPoint(x, y, target.radius);
      target.x = point.x;
      target.y = point.y;
    }
  }
  if (typeof control.state === "string" && control.state) target.state = control.state;
  ["stateTimer", "attackTimer"].forEach((key) => {
    if (Number.isFinite(control[key])) target[key] = Math.max(0, control[key]);
  });
  if (control.destination === null) {
    target.destination = null;
  } else if (
    control.destination &&
    Number.isFinite(control.destination.x) &&
    Number.isFinite(control.destination.y)
  ) {
    target.destination = { x: control.destination.x, y: control.destination.y };
  }
  if (event.encounter === "gauntlet") sendGauntletSync(true);
}

function applyBossStateSnapshot(state) {
  if (!state || state.kind !== boss.kind) return;
  const preserveHostileVisuals = hasFreshHostileSync();
  const bossVisualKeys = new Set(["x", "y", "donutMinions", "donutHoles", "serpentBody", "serpentTrail"]);
  Object.entries(state).forEach(([key, value]) => {
    if (key === "condiments" || key === "kind") return;
    if (preserveHostileVisuals && bossVisualKeys.has(key)) return;
    boss[key] = cloneSyncObject(value);
  });
  if (boss.kind === "trio" && Array.isArray(state.condiments)) {
    state.condiments.forEach((remoteTarget) => {
      const localTarget = condimentBosses.find((target) => target.kind === remoteTarget.kind);
      if (!localTarget) return;
      Object.entries(remoteTarget).forEach(([key, value]) => {
        if (preserveHostileVisuals && (key === "x" || key === "y")) return;
        localTarget[key] = cloneSyncObject(value);
      });
    });
  }
}

function spawnRemoteAbilityVisual(peerId, event) {
  if (!event || event.bossKind !== boss.kind) return;
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq !== multiplayer.phaseSeq) return;
  if (event.room !== player.room) return;
  const x = Number(event.x);
  const y = Number(event.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const targetX = Number.isFinite(event.targetX) ? event.targetX : x;
  const targetY = Number.isFinite(event.targetY) ? event.targetY : y;
  const angle = Number.isFinite(event.angle) ? event.angle : Math.atan2(targetY - y, targetX - x);
  const color = remotePlayerColor(event.weaponTag);
  remoteAbilityEffects.push({
    peerId,
    classKey: event.classKey || "fighter",
    abilityIndex: Number(event.abilityIndex) || 0,
    abilityName: event.abilityName || "Ability",
    room: event.room || player.room,
    x,
    y,
    targetX,
    targetY,
    angle,
    color,
    ttl: 0.95,
    maxTtl: 0.95,
  });
  if (event.classKey === "ranger" || event.classKey === "mage") {
    const speed = event.classKey === "mage" ? 480 : 760;
    remoteProjectiles.push({
      peerId,
      x: x + Math.cos(angle) * 28,
      y: y + Math.sin(angle) * 28,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: event.classKey === "mage" ? 12 : 8,
      color,
      room: event.room || player.room,
      ttl: 0.65,
      age: 0,
      heavy: event.classKey === "mage",
      tag: event.weaponTag || (event.classKey === "mage" ? "Magic" : "Ranged"),
    });
  }
}

function spawnRemoteAttackVisual(peerId, event) {
  if (event.bossKind && event.bossKind !== boss.kind) return;
  if (Number.isFinite(event.phaseSeq) && event.phaseSeq !== multiplayer.phaseSeq) return;
  if (event.room && event.room !== player.room) return;
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
    r: tag === "Magic" ? 11 : isWarriorTag(tag) ? 12 : tag === "Rogue" ? 8 : tag === "Bard" ? 9 : 6,
    color: event.color || remotePlayerColor(tag),
    room: event.room || player.room,
    ttl: tag === "Ranged" ? 0.9 : tag === "Bard" ? 0.82 : tag === "Magic" ? 0.75 : 0.42,
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
  if (isPartySyncActive() && !isMultiplayerHost()) return;
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
  const weapon = gear.weapon[player.gear.weapon] || gear.weapon.mage || {};
  const armor = gear.armor[player.gear.armor] || gear.armor.cloth || {};
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
    weaponTag: weapon.tag || "Magic",
    armorTag: armor.tag || "Cloth",
    bossKind: boss.kind,
    partyPhase: multiplayer.partyPhase,
    phaseSeq: multiplayer.phaseSeq,
    bardSongs: bardSongSnapshot(),
  };
  if (isMultiplayerHost() && multiplayer.lastPartyPhaseEvent) {
    snapshot.partyPhaseEvent = cloneSyncObject(multiplayer.lastPartyPhaseEvent);
    snapshot.partySpawns = multiplayerArenaSpawns();
  }
  if (player.room === "arena") {
    snapshot.bossHp = Math.max(0, Math.ceil(bossHealthSummary().hp));
    snapshot.bossMaxHp = bossHealthSummary().maxHp;
    snapshot.bossPhase = boss.phase || 1;
    snapshot.bossTargets = bossTargetSnapshot();
  } else if (player.room === "maze" && mazeState) {
    snapshot.mazeSequence = mazeState.sequence;
    const gauntletHp = bossHealthSummary();
    snapshot.gauntletHp = Math.max(0, Math.ceil(gauntletHp.hp));
    snapshot.gauntletMaxHp = gauntletHp.maxHp;
    snapshot.gauntletPhase = mazeState.miniBossSpawned ? "warden" : `wave-${mazeState.waveIndex + 1}`;
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
  const signature = `${classKey}:${runState.talentPoints}:${learned}:${selectedTalentId}`;
  if (!force && signature === talentTreeSignature) return;
  talentTreeSignature = signature;
  const activeTalents = talentsForActiveClass();
  if (!activeTalents.some((talent) => talent.id === selectedTalentId)) selectedTalentId = activeTalents[0]?.id || "";
  const selectedTalent = talentById.get(selectedTalentId) || activeTalents[0] || null;
  if (ui.talentMenuTitle) ui.talentMenuTitle.textContent = "Skills";
  if (ui.talentMenuPoints) ui.talentMenuPoints.textContent = `Talent Points: ${runState.talentPoints}`;
  const paths = [...new Set(activeTalents.map((talent) => talent.path || talent.branch))];
  const pathMarkup = paths.map((path, pathIndex) => {
    const nodes = activeTalents
      .filter((talent) => (talent.path || talent.branch) === path)
      .sort((a, b) => a.row - b.row || a.column - b.column);
    const connectorMarkup = renderTalentConnectors(nodes);
    return `
      <section class="talent-path path-${pathIndex}">
        <header class="talent-path-header">
          <span class="talent-path-emblem">${talentPathIcon(path)}</span>
          <h2>${escapeHtml(path)}</h2>
        </header>
        <div class="talent-node-column">
        ${connectorMarkup}
        ${nodes.map((talent) => {
          const learnedNode = hasTalent(talent.id);
          const available = canLearnTalent(talent.id);
          const state = learnedNode ? "learned" : available ? "available" : "locked";
          const req = talentRequirementText(talent, { learnedNode, available });
          const selected = selectedTalent?.id === talent.id;
          return `
            <button class="talent-node ${state} ${talent.rarity || "common"} ${talent.type} ${talent.row === 1 ? "root" : ""} ${selected ? "selected" : ""}" type="button" data-talent="${talent.id}" data-rarity="${talent.rarity || "common"}" data-state="${state}" data-requirement="${escapeHtml(req)}" aria-label="${escapeHtml(`${talent.name}. ${req}`)}" style="--node-row: ${talent.row}; --node-col: ${talent.column};">
              <span class="talent-node-core">
                <span class="talent-node-icon">${talentNodeIcon(talent)}</span>
              </span>
              <span class="talent-node-label">${escapeHtml(talent.name)}</span>
            </button>
          `;
        }).join("")}
        </div>
      </section>
    `;
  }).join("");
  ui.talentTree.innerHTML = `
    <div class="talent-board" style="--talent-bg: url('./assets/ui/talents/talent-ui-asset-sheet.png')">
      <div class="talent-board-head">
        <div>
          <div class="talent-eyebrow">Class Tree</div>
          <strong>${escapeHtml(talentClassNames[classKey] || "Class")} Talents</strong>
        </div>
        <span>${activeTalents.length} Nodes</span>
      </div>
      <div class="talent-paths">${pathMarkup}</div>
    </div>
    <aside class="talent-detail-panel">
      ${renderTalentDetail(selectedTalent)}
    </aside>
  `;
}

function renderTalentDetail(talent) {
  if (!talent) {
    return `<div class="talent-detail-empty">Select a talent node.</div>`;
  }
  const learnedNode = hasTalent(talent.id);
  const available = canLearnTalent(talent.id);
  const req = talentRequirementText(talent, { learnedNode, available, detail: true });
  return `
    <div class="talent-detail-rarity ${talent.rarity || "common"}">${escapeHtml(talent.rarity || "common")}</div>
    <h2>${escapeHtml(talent.name)}</h2>
    <p>${escapeHtml(talent.description)}</p>
    <h3>Synergy</h3>
    <p>${escapeHtml(talent.synergy || "Build-defining class interaction.")}</p>
    <div class="talent-detail-status">${escapeHtml(req)}</div>
  `;
}

function talentRequirementText(talent, { learnedNode = hasTalent(talent.id), available = canLearnTalent(talent.id), detail = false } = {}) {
  if (learnedNode) return "Learned";
  if (available) return detail ? "Available to learn" : "Click to learn";
  const requiredNames = (talent.parents || []).map((parentId) => talentById.get(parentId)?.name || parentId);
  const optionalNames = (talent.parentsAny || []).map((parentId) => talentById.get(parentId)?.name || parentId);
  if (requiredNames.length && optionalNames.length) return `Requires ${requiredNames.join(", ")} and one of ${optionalNames.join(" or ")}`;
  if (requiredNames.length) return `Requires ${requiredNames.join(", ")}`;
  if (optionalNames.length) return `Requires ${optionalNames.join(" or ")}`;
  return runState.talentPoints > 0 ? "Available" : "Need Talent Points";
}

function renderTalentConnectors(nodes) {
  const byId = new Map(nodes.map((talent) => [talent.id, talent]));
  const maxRow = Math.max(5, ...nodes.map((talent) => talent.row || 1));
  const lines = [];
  nodes.forEach((talent) => {
    [...(talent.parents || []), ...(talent.parentsAny || [])].forEach((parentId) => {
      const parent = byId.get(parentId);
      if (!parent) return;
      lines.push(`<line x1="${talentConnectorX(parent.column)}%" y1="${talentConnectorY(parent.row, maxRow)}%" x2="${talentConnectorX(talent.column)}%" y2="${talentConnectorY(talent.row, maxRow)}%" />`);
    });
  });
  if (!lines.length) return "";
  return `<svg class="talent-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines.join("")}</svg>`;
}

function talentConnectorX(column) {
  return 8 + ((Math.max(1, Math.min(5, column)) - 1) / 4) * 84;
}

function talentConnectorY(row, maxRow) {
  return 8 + ((Math.max(1, row) - 1) / Math.max(1, maxRow - 1)) * 84;
}

function talentPathIcon(path) {
  const icons = {
    "Iron Vanguard": "◆",
    "Blood Reaver": "✦",
    Earthbreaker: "◇",
    Deadeye: "◎",
    Trapmaster: "△",
    "Arrow Storm": "✧",
    Pyromancer: "✹",
    "Meteor Savant": "✶",
    Chronomancer: "◌",
    Venomancer: "✣",
    "Shadow Duelist": "◈",
    "Smoke Trickster": "☁",
    "Consecrated Ground": "✚",
    Guardian: "⬟",
    Judgment: "☀",
    "Power Chord": "♪",
    "Battle Hymn": "♬",
    "Healing Verse": "♫",
  };
  return icons[path] || "✦";
}

function talentNodeIcon(talent) {
  const rarityIcons = { common: "•", rare: "✧", epic: "✦", legendary: "✹" };
  return rarityIcons[talent.rarity] || "•";
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
    selectedTalentId = talentButton.dataset.talent;
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
  try {
    update(dt);
    draw();
    renderUi();
  } catch (error) {
    const errorAt = performance.now();
    if (errorAt - lastRuntimeErrorAt > 1500) {
      lastRuntimeErrorAt = errorAt;
      reportRuntimeError(error, { area: "gameLoop" });
    }
  } finally {
    requestAnimationFrame(gameLoop);
  }
}

function copyDebugReport() {
  try {
    if (!ui.debugReportText) return;
    const report = ui.debugReportText.value || debugReportState.lastReport || "";
    const markCopied = () => {
      if (!ui.debugReportCopy) return;
      ui.debugReportCopy.textContent = "Copied";
      window.setTimeout(() => {
        if (ui.debugReportCopy) ui.debugReportCopy.textContent = "Copy Report";
      }, 1200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(report).then(markCopied).catch(() => {
        ui.debugReportText.select();
        document.execCommand("copy");
        markCopied();
      });
      return;
    }
    ui.debugReportText.select();
    document.execCommand("copy");
    markCopied();
  } catch (error) {
    reportRuntimeError(error, { area: "copyDebugReport" });
  }
}

function handleCanvasPointerAttack(event) {
  updateCanvasPointer(event);
  handleCanvasClick(mouseWorld.x, mouseWorld.y);
}

function updateCanvasPointer(event) {
  const rect = canvas.getBoundingClientRect();
  mouseCanvas = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    inside: true,
  };
  mouseWorld = { x: mouseCanvas.x + camera.x, y: mouseCanvas.y + camera.y };
}

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  primaryAttackHeld = true;
  primaryAttackPointerId = event.pointerId;
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is a convenience for held attacks, not a requirement.
  }
  lastCanvasPointerAttackAt = performance.now();
  handleCanvasPointerAttack(event);
});

canvas.addEventListener("pointerup", (event) => {
  stopHeldPrimaryAttack(event.pointerId);
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {
    // Some browsers release pointer capture automatically.
  }
});

canvas.addEventListener("pointercancel", (event) => {
  stopHeldPrimaryAttack(event.pointerId);
});

canvas.addEventListener("click", (event) => {
  if (performance.now() - lastCanvasPointerAttackAt < 350) {
    return;
  }
  handleCanvasPointerAttack(event);
});

canvas.addEventListener("mousemove", (event) => {
  updateCanvasPointer(event);
});

canvas.addEventListener("mouseleave", () => {
  mouseCanvas.inside = false;
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
  if (!button) return;
  selectedTalentId = button.dataset.talent;
  learnTalent(button.dataset.talent);
  renderTalentTree(true);
});
ui.talentTree?.addEventListener("mouseover", (event) => {
  const button = event.target.closest("[data-talent]");
  if (!button || selectedTalentId === button.dataset.talent) return;
  selectedTalentId = button.dataset.talent;
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
ui.deathResetButton?.addEventListener("click", continueRunFromDeath);
ui.debugReportButton?.addEventListener("click", () => showManualDebugReport("button"));
ui.debugReportCopy?.addEventListener("click", copyDebugReport);
ui.debugReportDismiss?.addEventListener("click", () => {
  if (ui.debugReportOverlay) ui.debugReportOverlay.hidden = true;
  debugReportState.visible = false;
});
window.addEventListener("error", (event) => {
  if (!event.error && !event.message) return;
  reportRuntimeError(event.error || event.message, {
    area: "window-error",
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  });
});
window.addEventListener("unhandledrejection", (event) => {
  reportRuntimeError(event.reason || "Unhandled promise rejection", { area: "unhandledrejection" });
});
window.addEventListener("keydown", (event) => {
  if (isTypingTarget(document.activeElement)) return;
  const key = event.key.toLowerCase();
  if (event.ctrlKey && event.shiftKey && key === "d") {
    event.preventDefault();
    showManualDebugReport("hotkey");
    return;
  }
  if (player.dead && isPartySyncActive() && (key === "tab" || key === "arrowright" || key === "arrowleft")) {
    event.preventDefault();
    cycleSpectateTarget(key === "arrowleft" ? -1 : 1);
    return;
  }
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
  stopHeldPrimaryAttack();
});
window.addEventListener("mouseup", () => stopHeldPrimaryAttack());
window.addEventListener("resize", resizeCanvas);

initializeMultiplayerServerInput();
initializeDesktopUpdates();
loadGame();
applyGear();
resizeCanvas();
renderUi();
showMenuScreen("main");
window.setInterval(multiplayerWatchdogTick, multiplayerWatchdogIntervalMs);
requestAnimationFrame(gameLoop);
