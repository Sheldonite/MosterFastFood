/**
 * Game Constants and Configuration Data
 * Centralized configuration for game balance, tuning, and static data
 */

// World dimensions and layout
export const world = {
  width: 1680,
  height: 900,
  wall: 36,
  starter: { x: 80, y: 120, w: 560, h: 660 },
  arena: { x: 760, y: 90, w: 820, h: 720 },
  maze: { x: 760, y: 90, w: 820, h: 720 },
  gate: { x: 610, y: 390, w: 150, h: 130 },
};

// Equipment definitions
export const gear = {
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

// Class options
export const classOptions = [
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

// Boss test options
export const bossTestOptions = [
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

// Progression bosses
export const progressionBosses = ["cola", "burger", "fries", "trio", "shake", "nacho", "pizza", "donut", "taco", "sushi"];

// Maze themes
export const mazeThemes = {
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

// Maze reward pool
export const mazeRewardPool = [
  { id: "damage", name: "Sharper Strikes", description: "+8% damage for this run.", values: { damageMultiplier: 0.08 } },
  { id: "speed", name: "Quick Feet", description: "+10% move speed for this run.", values: { speedMultiplier: 0.1 } },
  { id: "hp", name: "Heartier Build", description: "+15 maximum health for this run.", values: { maxHp: 15 } },
  { id: "armor", name: "Extra Plating", description: "+1 armor for this run.", values: { armor: 1 } },
  { id: "attackSpeed", name: "Fast Hands", description: "+8% basic attack speed for this run.", values: { attackSpeed: 0.08 } },
  { id: "potion", name: "Spare Flask", description: "+1 potion now, up to 4.", values: { potion: 1 } },
  { id: "cooldown", name: "Clear Focus", description: "+10% ability cooldown recovery for this run.", values: { cooldownRecovery: 0.1 } },
];

// Maze reward visuals
export const mazeRewardVisuals = {
  damage: { tone: "gold", category: "Damage", icon: "damage" },
  speed: { tone: "blue", category: "Speed", icon: "speed" },
  hp: { tone: "green", category: "Health", icon: "hp" },
  armor: { tone: "blue", category: "Defense", icon: "armor" },
  attackSpeed: { tone: "blue", category: "Speed", icon: "attackSpeed" },
  potion: { tone: "green", category: "Utility", icon: "potion" },
  cooldown: { tone: "purple", category: "Cooldown", icon: "cooldown" },
};

// Health and armor constants
export const playerBaseHealthMultiplier = 3;
export const playerArmorHealthOffsets = {
  channelerRobe: 0,
  duelistCoat: 25,
  bulwarkPlate: 50,
};

// Maze constants
export const mazeWallThickness = 8;
export const mazePlayerWallPadding = 8;
export const gauntletPlayerObstaclePadding = 3;

// Combat tuning
export const combatTuning = {
  incomingDamageMultiplier: 1.74,
  overlapDamageWindowMs: 360,
  overlapDamageMultiplier: 0.62,
  bossAttackIntervalMultiplier: 0.92,
  globalBossHealthMultiplier: 2.25,
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

// Ability loadouts by class type
export const abilityLoadouts = {
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

// Talent class names mapping
export const talentClassNames = {
  melee: "Warrior",
  ranger: "Ranger",
  mage: "Mage",
  rogue: "Rogue",
  paladin: "Paladin",
  bard: "Bard",
};

// Generated art keys
export const generatedClassArtKeys = ["warrior", "ranger", "mage", "rogue", "paladin", "bard"];
export const generatedBossArtKeys = [
  "cola",
  "burger",
  "fries",
  "trio",
  "sauce",
  "shake",
  "nacho",
  "pizza",
  "taco",
  "donut",
  "sushi",
];
export const generatedProjectileArtKeys = [
  "arrow",
  "fireball",
  "magicMissile",
  "dagger",
  "hammer",
  "musicNote",
  "peanut",
  "chocolateBar",
  "cherryBomb",
  "tomatoSlice",
  "pickleSplash",
  "onionRing",
  "ketchupMortar",
  "mustardSeed",
  "mayoGlob",
  "cheeseWave",
  "chipCrumb",
  "pizzaSlice",
  "pepperoni",
  "shellShard",
  "wasabiBlob",
  "sushiRoll",
];
export const generatedHazardArtKeys = [
  "bubble",
  "strawSnipe",
  "fizzBurst",
  "sodaDrop",
  "burgerChargeLane",
  "burgerBurstRing",
  "greasePuddle",
  "ketchupPuddle",
  "mustardRicochet",
  "mayoSpiral",
  "peanutFan",
  "chocolateRain",
  "scoopDrop",
  "cherryShot",
  "picoStorm",
  "cheesePuddle",
  "chipShard",
  "pizzaDash",
  "ovenZone",
  "boxSlam",
  "cheeseTrail",
  "tacoCharge",
  "shellSlam",
  "lettuceLeaf",
  "salsaPool",
  "glazeRing",
  "sprinkleSpiral",
  "frostingRibbon",
  "royalRoll",
  "wasabiDash",
  "wasabiTrail",
  "chopstickJab",
  "soyWave",
  "soySplash",
  "segmentSweep",
];

// Generated boss ability icons
export const generatedBossAbilityIcons = {
  cola: ["bubbles", "straw", "fizz", "spill"],
  burger: ["swing", "bite", "tomato", "pickle", "onion", "sauce", "charge", "burst"],
  fries: ["machineGun", "greaseBurst"],
  trio: ["ketchup", "mustard", "mayo"],
  sauce: ["mortar", "ricochet", "spiral"],
  shake: ["peanuts", "chocolate", "scoop", "cherry"],
  nacho: ["pico", "cheeseWave", "cheesePuddle", "cheeseMortar", "chip", "crumb"],
  pizza: ["dash", "pepperoni", "slice", "crust", "cloneBolt", "oven", "boxSlam", "cheeseTrail"],
  taco: ["crunch", "shard", "ingredient", "beef", "slam", "lettuce", "salsa", "stuffed"],
  donut: ["crawler", "minionShot", "glazeBurst", "glazeRing", "sprinkle", "frosting", "roll"],
  sushi: ["dash", "trail", "jab", "roll", "soyWave", "soySplash", "wasabiWave", "pin", "sweep"],
};

// Generated ability icon slugs
export const generatedAbilityIconSlugs = {
  Q: "q",
  E: "e",
  Space: "space",
  R: "r",
};

// Save key
export const saveKey = "boss-fight-save-v1";

// Stands (spawn positions)
export const stands = [
  { id: 1, x: 860, y: 200, label: "Top" },
  { id: 2, x: 1480, y: 450, label: "Right" },
  { id: 3, x: 860, y: 700, label: "Bottom" },
  { id: 4, x: 860, y: 450, label: "Center" },
];

// Multiplayer timing constants
export const multiplayerStateInterval = 0.18;
export const gauntletSyncInterval = 0.16;
export const hostileSyncInterval = 0.095;
export const hostileHazardHeavySyncInterval = 0.135;
export const hostileHazardHeavyThreshold = 12;

// Boss ability damage definitions
export const bossAbilityDamageDefinitions = {
  cola: [
    { key: "bubbles", label: "Bubbles", defaultDamage: 24, sources: ["Bubble pop"], hazardTypes: ["colaBubble"] },
    { key: "straw", label: "Straw Snipe", defaultDamage: 46, sources: ["Straw snipe"], hazardTypes: ["strawSnipe"] },
    { key: "fizz", label: "Fizz Burst", defaultDamage: 42, sources: ["Fizz burst"], hazardTypes: ["fizzBurst"] },
    { key: "spill", label: "Soda Spill", defaultDamage: 12, sources: ["Soda spill"], hazardTypes: ["sodaDrop"] },
  ],
  burger: [
    { key: "swing", label: "Crushing Swing", defaultDamage: 13, sources: ["Crushing swing"] },
    { key: "bite", label: "Burger Bite", defaultDamage: 14, sources: ["Burger bite"] },
    { key: "tomato", label: "Tomato Slice", defaultDamage: 15, sources: ["Tomato slice"], hazardTypes: ["tomatoSlice"] },
    { key: "pickle", label: "Pickle Splash", defaultDamage: 13, sources: ["Pickle splash"], hazardTypes: ["pickleSplash"] },
    { key: "onion", label: "Onion Ring", defaultDamage: 14, sources: ["Onion ring"], hazardTypes: ["onionRing"] },
    { key: "sauce", label: "Sauce Drip", defaultDamage: 16, sources: ["Sauce drip", "Sauce burst"], hazardTypes: ["burgerSauceDrop"] },
    { key: "charge", label: "Burger Charge", defaultDamage: 22, sources: ["Burger charge"], hazardTypes: ["burgerChargeLane"] },
    { key: "burst", label: "Ingredient Burst", defaultDamage: 24, sources: ["Ingredient burst"], hazardTypes: ["burgerBurstRing"] },
  ],
  fries: [
    { key: "machineGun", label: "French Fry Machine Gun", defaultDamage: 11, sources: ["French fry machine gun"], hazardTypes: ["fry"] },
    { key: "greaseBurst", label: "Grease Burst", defaultDamage: 14, sources: ["Grease burst"], hazardTypes: ["fry"] },
  ],
  trio: [
    { key: "ketchup", label: "Ketchup Puddle", defaultDamage: 6, sources: ["Ketchup puddle"], hazardTypes: ["ketchupMortar", "ketchupPuddle"] },
    { key: "mustard", label: "Mustard Seed", defaultDamage: 11, sources: ["Mustard seed"], hazardTypes: ["mustardSeed"] },
    { key: "mayo", label: "Mayo Glob", defaultDamage: 10, sources: ["Mayo glob"], hazardTypes: ["mayoGlob"] },
  ],
  sauce: [
    { key: "mortar", label: "Splatter Mortar", defaultDamage: 6, sources: ["Ketchup puddle"], hazardTypes: ["ketchupMortar", "ketchupPuddle"] },
    { key: "ricochet", label: "Mustard Ricochet", defaultDamage: 11, sources: ["Mustard seed"], hazardTypes: ["mustardSeed"] },
    { key: "spiral", label: "Sauce Spiral", defaultDamage: 10, sources: ["Mayo glob"], hazardTypes: ["mayoGlob"] },
  ],
  shake: [
    { key: "peanuts", label: "Peanut Fan", defaultDamage: 12, sources: ["Peanut spread", "Ricochet peanuts"], hazardTypes: ["peanut"] },
    { key: "chocolate", label: "Chocolate Bars", defaultDamage: 30, sources: ["Chocolate bar"], hazardTypes: ["chocolateBar"], max: 150 },
    { key: "scoop", label: "Ice Cream Scoop", defaultDamage: 16, sources: ["Ice cream scoop"], hazardTypes: ["scoopDrop"] },
    { key: "cherry", label: "Cherry Bomb", defaultDamage: 20, sources: ["Cherry burst"], hazardTypes: ["cherryBomb", "cherryShot"] },
  ],
  nacho: [
    { key: "pico", label: "Pico Storm", defaultDamage: 8, sources: ["Pico de gallo storm"], hazardTypes: ["pico"] },
    { key: "cheeseWave", label: "Cheese Wave", defaultDamage: 28, sources: ["Nacho cheese wave"], hazardTypes: ["cheeseWave"] },
    { key: "cheesePuddle", label: "Melted Cheese", defaultDamage: 6, sources: ["Melted cheese"], hazardTypes: ["nachoCheesePuddle"] },
    { key: "cheeseMortar", label: "Cheese Mortar", defaultDamage: 8, sources: ["Cheese mortar"], hazardTypes: ["nachoCheeseMortar"] },
    { key: "chip", label: "Tortilla Chip", defaultDamage: 15, sources: ["Tortilla chip"], hazardTypes: ["nachoChip"] },
    { key: "crumb", label: "Chip Crumbs", defaultDamage: 8, sources: ["Nacho crumb"], hazardTypes: ["nachoCrumb"] },
  ],
  pizza: [
    { key: "dash", label: "Delivery Dash", defaultDamage: 26, sources: ["Delivery dash"], hazardTypes: ["pizzaDash"] },
    { key: "pepperoni", label: "Pepperoni Volley", defaultDamage: 9, sources: ["Pepperoni"], hazardTypes: ["pepperoni"] },
    { key: "slice", label: "Pizza Slice", defaultDamage: 18, sources: ["Pizza slice", "Returning pizza slice"], hazardTypes: ["pizzaSlice"] },
    { key: "crust", label: "Stuffed Crust Wall", defaultDamage: 12, sources: ["Stuffed crust wall"], hazardTypes: ["pizzaCrustWall"] },
    { key: "cloneBolt", label: "Cheese Bolt", defaultDamage: 8, sources: ["Cheese bolt"], hazardTypes: ["cheeseBolt"] },
    { key: "oven", label: "Oven Zone", defaultDamage: 24, sources: ["Oven zone"], hazardTypes: ["ovenZone"] },
    { key: "boxSlam", label: "Pizza Box Slam", defaultDamage: 44, sources: ["Pizza box slam"], hazardTypes: ["pizzaBoxSlam"], max: 200 },
    { key: "cheeseTrail", label: "Hot Cheese Trail", defaultDamage: 8, sources: ["Hot cheese trail"], hazardTypes: ["pizzaCheeseTrail"] },
  ],
  taco: [
    { key: "crunch", label: "Crunch Charge", defaultDamage: 13, sources: ["Crunch Charge", "Taco Titan crunch"], hazardTypes: ["tacoCharge"] },
    { key: "shard", label: "Shell Shard", defaultDamage: 8, sources: ["Shell shard"], hazardTypes: ["tacoShellShard"] },
    { key: "ingredient", label: "Ingredient Drop", defaultDamage: 12, sources: ["cheese drop", "lettuce drop", "salsa drop"], hazardTypes: ["ingredientDrop"] },
    { key: "beef", label: "Beef Drop", defaultDamage: 18, sources: ["beef drop"] },
    { key: "slam", label: "Shell Slam", defaultDamage: 12, sources: ["Shell Slam"], hazardTypes: ["tacoSlam"] },
    { key: "lettuce", label: "Lettuce Fan", defaultDamage: 8, sources: ["Lettuce fan"], hazardTypes: ["lettuceLeaf"] },
    { key: "salsa", label: "Salsa Pool", defaultDamage: 10, sources: ["Salsa pool"], hazardTypes: ["tacoSalsa"] },
    { key: "stuffed", label: "Too Stuffed", defaultDamage: 12, sources: ["Too stuffed"], max: 100 },
  ],
  donut: [
    { key: "crawler", label: "Crawler Bite", defaultDamage: 13, sources: ["Donut crawler"] },
    { key: "minionShot", label: "Minion Shot", defaultDamage: 3, sources: ["Donut minion shot"], hazardTypes: ["donutMinionShot"] },
    { key: "glazeBurst", label: "Mini Glaze Burst", defaultDamage: 1, sources: ["Mini glaze burst"], hazardTypes: ["sprinkle"] },
    { key: "glazeRing", label: "Glaze Ring", defaultDamage: 50, sources: ["Glaze ring"], hazardTypes: ["glazeRing"] },
    { key: "sprinkle", label: "Sprinkle Spiral", defaultDamage: 2, sources: ["Sprinkle"], hazardTypes: ["sprinkle"] },
    { key: "frosting", label: "Frosting Ribbon", defaultDamage: 29, sources: ["Frosting ribbon"], hazardTypes: ["frostingRibbon"] },
    { key: "roll", label: "Royal Roll", defaultDamage: 54, sources: ["Royal Roll"], hazardTypes: ["royalRoll"] },
  ],
  sushi: [
    { key: "dash", label: "Wasabi Dash", defaultDamage: 12, sources: ["Wasabi Dash"], hazardTypes: ["wasabiDash"] },
    { key: "trail", label: "Wasabi Trail", defaultDamage: 4, sources: ["Wasabi trail"], hazardTypes: ["wasabiTrail"] },
    { key: "jab", label: "Chopstick Jab", defaultDamage: 8, sources: ["Chopstick Jab"], hazardTypes: ["chopstickJab"] },
    { key: "roll", label: "Roll Barrage", defaultDamage: 7, sources: ["Roll Barrage"], hazardTypes: ["sushiRoll"] },
    { key: "soyWave", label: "Soy Sake Wave", defaultDamage: 6, sources: ["Soy Sake Wave"], hazardTypes: ["soySakeWave"] },
    { key: "soySplash", label: "Soy Splash", defaultDamage: 3, sources: ["Soy splash"], hazardTypes: ["soyPuddle"] },
    { key: "wasabiWave", label: "Wasabi Wave", defaultDamage: 8, sources: ["Wasabi wave"], hazardTypes: ["wasabiWave"] },
    { key: "pin", label: "Chopstick Pin", defaultDamage: 10, sources: ["Chopstick pin"], hazardTypes: ["chopstickPin"] },
    { key: "sweep", label: "Segment Sweep", defaultDamage: 10, sources: ["Segment sweep"], hazardTypes: ["serpentSweep"] },
  ],
};
