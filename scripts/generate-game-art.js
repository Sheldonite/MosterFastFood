const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outRoot = path.join(root, "assets", "generated");

const classConfigs = {
  warrior: { name: "Warrior", primary: "#8e3c2d", secondary: "#d8b66a", accent: "#f7efd9", weapon: "blade" },
  ranger: { name: "Ranger", primary: "#2f6d46", secondary: "#b9803c", accent: "#d9f0a3", weapon: "bow" },
  mage: { name: "Mage", primary: "#3951a3", secondary: "#7fd6ff", accent: "#f0f8ff", weapon: "staff" },
  rogue: { name: "Rogue", primary: "#35313f", secondary: "#9f78ff", accent: "#d7cffd", weapon: "dagger" },
  paladin: { name: "Paladin", primary: "#f0d47c", secondary: "#6aa4d8", accent: "#fff4c4", weapon: "hammer" },
  bard: { name: "Bard", primary: "#a83232", secondary: "#d99b34", accent: "#fff0ba", weapon: "lute" },
};

const bossConfigs = {
  burger: { name: "Big Burger", body: "#8b552f", trim: "#f3cc68", accent: "#6cc96b", face: "#2b1711" },
  cola: { name: "Big Cola", body: "#b9362f", trim: "#f7efd9", accent: "#67d5ff", face: "#2b1711" },
  fries: { name: "Curly Fries", body: "#ce4331", trim: "#f4c851", accent: "#ffdf78", face: "#2b1711" },
  sauce: { name: "Special Sauce", body: "#be2e2e", trim: "#f6dfae", accent: "#f0a03a", face: "#2b1711" },
  shake: { name: "Peanut Buster Shake", body: "#d8b58c", trim: "#f7efd9", accent: "#7b4a2f", face: "#2b1711" },
  nacho: { name: "Nacho Libre", body: "#f4c24e", trim: "#7b3f24", accent: "#e64632", face: "#2b1711" },
  pizza: { name: "Pizza Phantom", body: "#e7b94d", trim: "#b83d30", accent: "#f7efd9", face: "#2b1711" },
  taco: { name: "Taco Titan", body: "#e0ae47", trim: "#63aa4f", accent: "#cf4131", face: "#2b1711" },
  donut: { name: "Donut Donald", body: "#b97845", trim: "#f0a8d4", accent: "#79d7ff", face: "#2b1711" },
  sushi: { name: "Sushi Serpent", body: "#f7efd9", trim: "#2b5349", accent: "#f05b51", face: "#2b1711" },
  ketchup: { name: "Ketchup", body: "#b92d28", trim: "#f2d087", accent: "#f4ead7", face: "#2b1711" },
  mustard: { name: "Mustard", body: "#e3bf34", trim: "#f2d087", accent: "#fff08a", face: "#2b1711" },
  mayo: { name: "Mayo", body: "#f1ead9", trim: "#8ec7ff", accent: "#f2d087", face: "#2b1711" },
};

const abilityIcons = {
  melee: [
    ["shield-bash", "#d8b66a", "shield"],
    ["groundbreaker", "#9b6842", "quake"],
    ["whirlwind-dash", "#f7efd9", "swirl"],
    ["shield-wall", "#8ec7ff", "wall"],
  ],
  ranger: [
    ["marked-shot", "#9be06f", "target"],
    ["arrow-storm", "#d7f6a3", "arrows"],
    ["tumble-shot", "#8ec7ff", "dash"],
    ["volley-trap", "#f0d47c", "trap"],
  ],
  mage: [
    ["fire-blast", "#ff8a32", "fire"],
    ["meteor-field", "#c26aff", "meteor"],
    ["blink-step", "#8ec7ff", "spark"],
    ["time-warp", "#e0b7ff", "clock"],
  ],
  rogue: [
    ["backstab", "#d7cffd", "dagger"],
    ["poison-cloud", "#9be06f", "cloud"],
    ["shadow-step", "#9f78ff", "dash"],
    ["smoke-bomb", "#c7c7c7", "smoke"],
  ],
  paladin: [
    ["radiant-smite", "#fff08a", "hammer"],
    ["consecration", "#f0d47c", "sun"],
    ["aegis-step", "#8ec7ff", "shield"],
    ["divine-bulwark", "#fff4c4", "wall"],
  ],
  bard: [
    ["power-chord", "#f0d47c", "note"],
    ["battle-hymn", "#ff8a6b", "banner"],
    ["quickstep-verse", "#8ec7ff", "wing"],
    ["healing-ballad", "#9be06f", "heart"],
  ],
};

const projectileConfigs = {
  arrow: { color: "#d9f0a3", accent: "#5c8a4e", shape: "arrow" },
  "magic-bolt": { color: "#70e8ff", accent: "#dffffc", shape: "bolt" },
  fireball: { color: "#ff7a2b", accent: "#fff1b8", shape: "orb" },
  "bard-note": { color: "#f0d47c", accent: "#fff4c4", shape: "note" },
  "sword-wave": { color: "#fff4d2", accent: "#d8b66a", shape: "wave" },
  dagger: { color: "#d7cffd", accent: "#9f78ff", shape: "dagger" },
  "holy-smite": { color: "#fff08a", accent: "#8ec7ff", shape: "cross" },
  fry: { color: "#f1c15d", accent: "#fff0a3", shape: "stick" },
  "cola-bubble": { color: "#67d5ff", accent: "#f7efd9", shape: "colaBubble" },
  "pizza-slice": { color: "#e9bc54", accent: "#b93a2f", shape: "slice" },
  peanut: { color: "#9a6238", accent: "#e0b67c", shape: "peanut" },
  "sauce-blob": { color: "#c43b30", accent: "#ff8a6b", shape: "blob" },
  "mustard-seed": { color: "#e3bf34", accent: "#fff08a", shape: "seed" },
  "cherry-shot": { color: "#ff3f5f", accent: "#ffd2d9", shape: "orb" },
  "nacho-chip": { color: "#f4c24e", accent: "#7b3f24", shape: "chip" },
  "taco-shard": { color: "#e0ae47", accent: "#63aa4f", shape: "shard" },
  "cheese-bolt": { color: "#f4d36b", accent: "#fff4c4", shape: "bolt" },
  sprinkle: { color: "#ff79aa", accent: "#8ec7ff", shape: "sprinkle" },
  "burger-tomato-slice": { color: "#d94135", accent: "#ffb06a", shape: "tomatoSlice" },
  "burger-pickle-splash": { color: "#9fbd36", accent: "#eaff7a", shape: "pickleChip" },
  "burger-onion-ring": { color: "#aa58ff", accent: "#ffd5ff", shape: "onionRing" },
};

const hazardConfigs = {
  grease: { color: "#dbae48", accent: "#ffe276", shape: "puddle" },
  puddle: { color: "#ffbe23", accent: "#ffe7a0", shape: "puddle" },
  "glaze-ring": { color: "#f0a8d4", accent: "#79d7ff", shape: "ring" },
  "warning-circle": { color: "#fff4c4", accent: "#ff6f61", shape: "ring" },
  beam: { color: "#8ec7ff", accent: "#fff4c4", shape: "beam" },
  "wasabi-wave": { color: "#83c96a", accent: "#f7efd9", shape: "wave" },
  slam: { color: "#e0ae47", accent: "#cf4131", shape: "burst" },
  "cola-straw-snipe": { color: "#6fdcff", accent: "#fff4c4", shape: "colaBeam" },
  "cola-fizz-burst": { color: "#67d5ff", accent: "#fff8dc", shape: "colaFizz" },
  "cola-soda-drop": { color: "#5b3322", accent: "#b9f4ff", shape: "colaDrop" },
  "cola-soda-puddle": { color: "#5b3322", accent: "#67d5ff", shape: "colaPuddle" },
  "burger-pickle-puddle": { color: "#6f9e24", accent: "#dfff71", shape: "picklePuddle" },
  "burger-sauce-drop": { color: "#c06a23", accent: "#ffd06a", shape: "burgerSauceDrop" },
  "burger-sauce-burst": { color: "#e07a2a", accent: "#ffe0a0", shape: "burgerSauceBurst" },
  "burger-charge-lane": { color: "#e65245", accent: "#ffd66b", shape: "burgerChargeLane" },
  "burger-burst-ring": { color: "#f05d47", accent: "#ffd46c", shape: "burgerBurstRing" },
};

const colaAbilityConfigs = {
  bubbles: { label: "Bubble Barrage", color: "#67d5ff", accent: "#fff8dc", glyph: "bubbles" },
  straw: { label: "Straw Snipe", color: "#f0c35b", accent: "#6fdcff", glyph: "straw" },
  spill: { label: "Soda Spill", color: "#8a4b2b", accent: "#67d5ff", glyph: "spill" },
  fizz: { label: "Fizz Burst", color: "#ff6f61", accent: "#fff8dc", glyph: "fizz" },
};

const burgerAbilityConfigs = {
  tomato: { label: "Tomato Slice", color: "#e94b3d", accent: "#ffb06a", glyph: "tomato" },
  pickle: { label: "Pickle Splash", color: "#9fdf45", accent: "#eaff7a", glyph: "pickle" },
  onion: { label: "Onion Ring", color: "#aa58ff", accent: "#ffd5ff", glyph: "onion" },
  sauce: { label: "Sauce Drip", color: "#e07a2a", accent: "#ffe0a0", glyph: "sauce" },
  charge: { label: "Burger Charge", color: "#ff6b58", accent: "#ffd66b", glyph: "charge" },
  burst: { label: "Ingredient Burst", color: "#f0c35b", accent: "#ff5d48", glyph: "burst" },
};

const sushiAbilityConfigs = {
  "wasabi-dash": { label: "Wasabi Dash", color: "#9ff05f", accent: "#eaff9f", glyph: "wasabi" },
  "chopstick-jab": { label: "Chopstick Jab", color: "#ff7a5f", accent: "#f7dfaa", glyph: "chopstick" },
  "roll-barrage": { label: "Roll Barrage", color: "#f05f6a", accent: "#fff4db", glyph: "roll" },
  "soy-sake-wave": { label: "Soy Sake Wave", color: "#b85cff", accent: "#f2b7ff", glyph: "soy" },
};

const rewardToneColors = {
  blue: { color: "#42adff", dark: "#06172b", glow: "#0b416f" },
  green: { color: "#75df4a", dark: "#071f13", glow: "#205f1b" },
  purple: { color: "#9b62ff", dark: "#100b28", glow: "#372061" },
  gold: { color: "#f0c35b", dark: "#241805", glow: "#7b4d12" },
};

const rewardIconConfigs = {
  damage: { tone: "gold", glyph: "blade" },
  speed: { tone: "blue", glyph: "boot" },
  hp: { tone: "green", glyph: "heart" },
  armor: { tone: "blue", glyph: "shield" },
  attackSpeed: { tone: "blue", glyph: "hands" },
  potion: { tone: "green", glyph: "flask" },
  cooldown: { tone: "purple", glyph: "snow" },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeGenerated(parts, contents) {
  const fullPath = path.join(outRoot, ...parts);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, contents, "utf8");
  return `./assets/generated/${parts.join("/")}`;
}

function svg(width, height, body, viewBox = `0 0 ${width} ${height}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" role="img">${body}</svg>\n`;
}

function roundedRect(x, y, w, h, r, fill, stroke = "#2b1711", sw = 3) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function drawWeapon(config, dir) {
  if (config.weapon === "bow") {
    return `<path d="M82 42 C112 55 112 77 82 90" fill="none" stroke="#7b4a2f" stroke-width="6"/><path d="M84 44 L84 88" stroke="#f7efd9" stroke-width="1.5"/><path d="M78 66 L103 66" stroke="${config.accent}" stroke-width="3"/>`;
  }
  if (config.weapon === "staff") {
    return `<path d="M88 37 L78 96" stroke="#7b4a2f" stroke-width="7" stroke-linecap="round"/><circle cx="90" cy="34" r="10" fill="${config.secondary}" stroke="#2b1711" stroke-width="3"/><circle cx="90" cy="34" r="4" fill="${config.accent}"/>`;
  }
  if (config.weapon === "dagger") {
    return `<path d="M84 57 L108 43" stroke="${config.accent}" stroke-width="5" stroke-linecap="round"/><path d="M83 72 L109 85" stroke="${config.secondary}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (config.weapon === "hammer") {
    return `<path d="M83 42 L72 91" stroke="#7b4a2f" stroke-width="7" stroke-linecap="round"/><rect x="74" y="31" width="34" height="18" rx="4" fill="${config.accent}" stroke="#2b1711" stroke-width="3"/>`;
  }
  if (config.weapon === "lute") {
    return `<ellipse cx="88" cy="69" rx="20" ry="25" fill="#b9803c" stroke="#2b1711" stroke-width="3"/><circle cx="88" cy="69" r="7" fill="#4b2b18"/><path d="M98 51 L116 34" stroke="#7b4a2f" stroke-width="8" stroke-linecap="round"/><path d="M78 68 L109 43" stroke="#ffe7a0" stroke-width="1.5"/><path d="M34 32 C24 20 28 10 40 18" fill="none" stroke="${config.secondary}" stroke-width="5"/><circle cx="32" cy="43" r="5" fill="${config.secondary}" stroke="#2b1711" stroke-width="2"/>`;
  }
  return `<path d="M83 35 L103 78" stroke="${config.accent}" stroke-width="7" stroke-linecap="round"/><path d="M77 62 L94 52" stroke="#2b1711" stroke-width="4" stroke-linecap="round"/>`;
}

function classFrame(config, row, col) {
  const stride = [0, 3, 0, -3][col] || 0;
  const bob = row === 3 ? -2 : row === 0 ? 1 : 0;
  const cape = config.weapon === "lute" || config.weapon === "hammer";
  return `
    <g transform="translate(${col * 128},${row * 128})">
      <ellipse cx="64" cy="102" rx="29" ry="9" fill="rgba(0,0,0,0.22)"/>
      ${cape ? `<path d="M38 45 C24 72 28 95 51 105 L78 105 C101 93 102 64 84 43 Z" fill="${config.primary}" opacity="0.82" stroke="#2b1711" stroke-width="3"/>` : ""}
      <path d="M49 ${76 + bob} L43 ${105 - stride} M79 ${76 + bob} L85 ${105 + stride}" stroke="#3b2418" stroke-width="12" stroke-linecap="round"/>
      <path d="M45 ${53 + bob} C42 79 47 95 64 96 C82 96 87 79 83 ${53 + bob} Z" fill="${config.primary}" stroke="#2b1711" stroke-width="3"/>
      <path d="M51 ${58 + bob} C56 69 73 69 78 ${58 + bob}" fill="none" stroke="${config.secondary}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="64" cy="${40 + bob}" r="22" fill="#f3b875" stroke="#2b1711" stroke-width="3"/>
      <path d="M43 ${32 + bob} C48 9 81 10 87 ${32 + bob} C76 26 58 26 43 ${32 + bob} Z" fill="${config.primary}" stroke="#2b1711" stroke-width="3"/>
      <circle cx="56" cy="${43 + bob}" r="3" fill="#2b1711"/><circle cx="72" cy="${43 + bob}" r="3" fill="#2b1711"/>
      <path d="M55 ${54 + bob} C60 ${59 + bob} 68 ${59 + bob} 73 ${54 + bob}" fill="none" stroke="#2b1711" stroke-width="2" stroke-linecap="round"/>
      ${drawWeapon(config, row)}
    </g>`;
}

function classSpritesheet(config) {
  const frames = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) frames.push(classFrame(config, row, col));
  }
  return svg(512, 512, frames.join(""));
}

function bossShape(kind, config, row, col) {
  const bob = Math.sin((col / 4) * Math.PI * 2) * 3;
  const attack = row === 1;
  const hurt = row === 2;
  const shadow = `<ellipse cx="64" cy="104" rx="42" ry="11" fill="rgba(0,0,0,0.24)"/>`;
  const eyes = `<circle cx="52" cy="${58 + bob}" r="4" fill="${config.face}"/><circle cx="76" cy="${58 + bob}" r="4" fill="${config.face}"/><path d="M54 ${72 + bob} C60 ${78 + bob} 70 ${78 + bob} 76 ${72 + bob}" fill="none" stroke="${config.face}" stroke-width="3" stroke-linecap="round"/>`;
  if (kind === "cola" || kind === "ketchup" || kind === "mustard" || kind === "mayo") {
    return `${shadow}${roundedRect(37, 28 + bob, 54, 76, 15, hurt ? config.accent : config.body)}<rect x="46" y="${48 + bob}" width="36" height="26" rx="7" fill="${config.trim}" stroke="#2b1711" stroke-width="3"/><rect x="46" y="${15 + bob}" width="36" height="18" rx="7" fill="${config.trim}" stroke="#2b1711" stroke-width="3"/>${eyes}`;
  }
  if (kind === "pizza") {
    return `${shadow}<path d="M28 ${101 + bob} L99 ${28 + bob} L110 ${104 + bob} Z" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><path d="M37 ${91 + bob} L99 ${28 + bob}" stroke="${config.trim}" stroke-width="10" stroke-linecap="round"/><circle cx="69" cy="${68 + bob}" r="7" fill="${config.trim}"/><circle cx="84" cy="${88 + bob}" r="7" fill="${config.trim}"/>${eyes}`;
  }
  if (kind === "sushi") {
    return `${shadow}<ellipse cx="64" cy="${67 + bob}" rx="43" ry="30" fill="${config.trim}" stroke="#2b1711" stroke-width="4"/><ellipse cx="64" cy="${67 + bob}" rx="31" ry="21" fill="${config.body}"/><rect x="40" y="${47 + bob}" width="48" height="40" rx="12" fill="none" stroke="#2b1711" stroke-width="3"/>${eyes}`;
  }
  if (kind === "donut") {
    return `${shadow}<circle cx="64" cy="${67 + bob}" r="43" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><circle cx="64" cy="${67 + bob}" r="20" fill="#221610" stroke="#2b1711" stroke-width="3"/><path d="M30 ${62 + bob} C45 ${43 + bob} 84 ${43 + bob} 99 ${62 + bob}" fill="none" stroke="${config.trim}" stroke-width="13" stroke-linecap="round"/><circle cx="49" cy="${49 + bob}" r="3" fill="${config.accent}"/><circle cx="82" cy="${49 + bob}" r="3" fill="${config.accent}"/>${eyes}`;
  }
  if (kind === "taco") {
    return `${shadow}<path d="M25 ${91 + bob} C28 ${33 + bob} 99 ${33 + bob} 103 ${91 + bob} Z" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><path d="M34 ${56 + bob} C49 ${42 + bob} 79 ${42 + bob} 94 ${56 + bob}" fill="none" stroke="${config.trim}" stroke-width="9" stroke-linecap="round"/><circle cx="56" cy="${48 + bob}" r="5" fill="${config.accent}"/><circle cx="76" cy="${48 + bob}" r="5" fill="${config.accent}"/>${eyes}`;
  }
  if (kind === "nacho") {
    return `${shadow}<path d="M64 ${24 + bob} L111 ${104 + bob} L17 ${104 + bob} Z" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><path d="M49 ${55 + bob} L78 ${55 + bob} L63 ${81 + bob} Z" fill="${config.trim}"/>${eyes}`;
  }
  if (kind === "shake") {
    return `${shadow}<path d="M37 ${31 + bob} H91 L83 ${106 + bob} H45 Z" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><path d="M42 ${29 + bob} H86" stroke="${config.trim}" stroke-width="11" stroke-linecap="round"/><path d="M73 ${27 + bob} L86 ${5 + bob}" stroke="${attack ? config.accent : "#f7efd9"}" stroke-width="6" stroke-linecap="round"/>${eyes}`;
  }
  if (kind === "fries") {
    return `${shadow}<path d="M32 ${54 + bob} L96 ${54 + bob} L87 ${106 + bob} H41 Z" fill="${config.body}" stroke="#2b1711" stroke-width="4"/><path d="M42 ${55 + bob} L38 ${20 + bob} M57 ${54 + bob} L55 ${13 + bob} M73 ${55 + bob} L77 ${16 + bob} M88 ${56 + bob} L96 ${24 + bob}" stroke="${config.trim}" stroke-width="10" stroke-linecap="round"/>${eyes}`;
  }
  return `${shadow}<ellipse cx="64" cy="${69 + bob}" rx="47" ry="38" fill="${hurt ? config.accent : config.body}" stroke="#2b1711" stroke-width="4"/><path d="M25 ${54 + bob} C44 ${36 + bob} 84 ${36 + bob} 103 ${54 + bob}" stroke="${config.trim}" stroke-width="12" stroke-linecap="round"/><path d="M35 ${49 + bob} C46 ${39 + bob} 80 ${39 + bob} 93 ${49 + bob}" stroke="${config.accent}" stroke-width="5" stroke-linecap="round"/>${eyes}`;
}

function bossSpritesheet(kind, config) {
  const frames = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      frames.push(`<g transform="translate(${col * 128},${row * 128})">${bossShape(kind, config, row, col)}</g>`);
    }
  }
  return svg(512, 512, frames.join(""));
}

function colaSmallCan(x, y, angle, side, lit = false) {
  return `
    <g transform="translate(${x} ${y}) rotate(${angle})">
      <rect x="-13" y="-22" width="26" height="44" rx="7" fill="url(#colaBody)" stroke="#17110f" stroke-width="4"/>
      <rect x="-10" y="-25" width="20" height="8" rx="3" fill="url(#colaMetal)" stroke="#17110f" stroke-width="3"/>
      <rect x="-9" y="-7" width="18" height="12" rx="4" fill="#2b1711" opacity="0.42"/>
      <path d="M-5 7 L2 -5 L1 5 L7 4 L-1 18 L0 8 Z" fill="#fff4c4" opacity="${lit ? 0.95 : 0.62}"/>
      ${lit ? `<path d="M${side * 8} -2 C${side * 30} -16 ${side * 43} -8 ${side * 55} -20" fill="none" stroke="#b9f4ff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>` : ""}
    </g>`;
}

function colaArm(side, row, col, bob) {
  const spread = row === 1 ? 17 + col * 2 : row === 2 ? 26 : row === 4 ? 21 + col * 2 : 8 + Math.sin(col) * 3;
  const shoulderX = 128 + side * 49;
  const shoulderY = 119 + bob * 0.42;
  const elbowX = 128 + side * (70 + spread);
  const elbowY = 108 + bob + (row === 3 ? 12 : 0);
  const handX = 128 + side * (89 + spread);
  const handY = row === 2 ? 97 + bob : row === 1 ? 123 + bob : row === 4 ? 105 + bob : 128 + bob;
  const canAngle = side * (row === 2 ? -22 : row === 1 ? 18 : row === 4 ? -8 : 10);
  const lit = row === 1 || row === 2 || row === 4;
  return `
    <g>
      <path d="M${shoulderX} ${shoulderY} C${128 + side * (58 + spread)} ${shoulderY - 20} ${elbowX} ${elbowY - 14} ${elbowX} ${elbowY}" fill="none" stroke="#17110f" stroke-width="13" stroke-linecap="round"/>
      <path d="M${shoulderX} ${shoulderY} C${128 + side * (58 + spread)} ${shoulderY - 20} ${elbowX} ${elbowY - 14} ${elbowX} ${elbowY}" fill="none" stroke="#62534a" stroke-width="6" stroke-linecap="round"/>
      <path d="M${elbowX} ${elbowY} C${128 + side * (82 + spread)} ${elbowY + 6} ${handX - side * 11} ${handY - 10} ${handX} ${handY}" fill="none" stroke="#17110f" stroke-width="13" stroke-linecap="round"/>
      <path d="M${elbowX} ${elbowY} C${128 + side * (82 + spread)} ${elbowY + 6} ${handX - side * 11} ${handY - 10} ${handX} ${handY}" fill="none" stroke="#6b5a50" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${shoulderX}" cy="${shoulderY}" r="12" fill="#2a2220" stroke="#17110f" stroke-width="4"/>
      <circle cx="${elbowX}" cy="${elbowY}" r="12" fill="#302825" stroke="#17110f" stroke-width="4"/>
      <path d="M${elbowX - side * 6} ${elbowY - 4} L${elbowX + side * 6} ${elbowY + 4}" stroke="#958474" stroke-width="3" stroke-linecap="round"/>
      ${colaSmallCan(handX, handY, canAngle, side, lit)}
    </g>`;
}

function colaAbilityEffects(row, col, bob) {
  if (row === 1) {
    const bubbles = [
      [43, 55, 12], [58, 178, 9], [202, 50, 12], [213, 172, 10], [30, 122, 8], [226, 118, 8],
    ].map(([x, y, r], index) => `<circle cx="${x + Math.sin(col + index) * 5}" cy="${y + Math.cos(col * 0.8 + index) * 4}" r="${r}" fill="#67d5ff" fill-opacity="0.28" stroke="#fff8dc" stroke-width="4"/><circle cx="${x - 4}" cy="${y - 5}" r="${Math.max(2, r * 0.28)}" fill="#ffffff" opacity="0.82"/>`);
    return `<g filter="url(#colaGlow)">${bubbles.join("")}</g>`;
  }
  if (row === 2) {
    const beamY = 99 + bob;
    return `
      <g opacity="${0.76 + col * 0.04}">
        <path d="M160 ${beamY} H244" stroke="#fff4c4" stroke-width="${7 + col}" stroke-linecap="round"/>
        <path d="M160 ${beamY} H244" stroke="#67d5ff" stroke-width="${3 + col}" stroke-linecap="round"/>
        <circle cx="${189 + col * 9}" cy="${beamY}" r="${8 + col}" fill="#fff8dc" opacity="0.32"/>
      </g>`;
  }
  if (row === 3) {
    const dropY = 184 + Math.sin(col * 1.7) * 6;
    return `
      <ellipse cx="128" cy="215" rx="${42 + col * 3}" ry="15" fill="#5b3322" opacity="0.36" stroke="#67d5ff" stroke-width="3"/>
      <path d="M112 ${dropY - 42} C126 ${dropY - 61} 143 ${dropY - 43} 132 ${dropY - 20} C122 ${dropY - 5} 105 ${dropY - 18} 112 ${dropY - 42} Z" fill="#5b3322" stroke="#b9f4ff" stroke-width="4"/>
      <circle cx="122" cy="${dropY - 43}" r="5" fill="#ffffff" opacity="0.58"/>
      <path d="M89 191 C105 181 124 183 145 191 C165 199 181 196 196 188" fill="none" stroke="#67d5ff" stroke-width="4" stroke-linecap="round" opacity="0.52"/>`;
  }
  if (row === 4) {
    const ringR = 72 + col * 8;
    return `
      <circle cx="128" cy="${128 + bob}" r="${ringR}" fill="#67d5ff" opacity="0.08" stroke="#b9f4ff" stroke-width="4"/>
      <circle cx="128" cy="${128 + bob}" r="${ringR + 22}" fill="none" stroke="#fff8dc" stroke-width="3" opacity="0.28"/>
      <path d="M97 ${73 + bob} C87 ${42} 106 ${31} 116 ${58}" fill="none" stroke="#fff8dc" stroke-width="7" stroke-linecap="round"/>
      <path d="M159 ${74 + bob} C177 ${42} 153 ${27} 143 ${58}" fill="none" stroke="#fff8dc" stroke-width="7" stroke-linecap="round"/>
      <path d="M81 ${97 + bob} C51 ${84} 44 ${110} 69 ${119}" fill="none" stroke="#67d5ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M175 ${97 + bob} C205 ${84} 212 ${110} 187 ${119}" fill="none" stroke="#67d5ff" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (row === 5) {
    return `
      <circle cx="128" cy="${132 + bob}" r="${84 + col * 2}" fill="#ff6f61" opacity="0.12"/>
      <path d="M47 64 L57 52 M49 177 L61 164 M205 58 L193 48 M209 176 L195 163" stroke="#fff4c4" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 113 L42 105 M191 116 L214 105" stroke="#ffb04a" stroke-width="4" stroke-linecap="round"/>`;
  }
  return "";
}

function bigColaFrame(row, col) {
  const phase = (col / 4) * Math.PI * 2;
  const bob = Math.sin(phase) * (row === 4 ? 7 : 5);
  const shake = row === 5 ? [-4, 3, -2, 4][col] : 0;
  const tilt = row === 3 ? [-7, -3, 6, 2][col] : row === 2 ? [0, -2, -4, -2][col] : 0;
  const faceFill = row === 5 ? "#140909" : "#17110f";
  const eyeColor = row === 5 ? "#fff0a3" : "#fff8dc";
  const browY = 105 + bob;
  const glow = row === 4 || row === 5 ? `<circle cx="128" cy="${129 + bob}" r="96" fill="${row === 5 ? "#ff6f61" : "#67d5ff"}" opacity="0.12" filter="url(#colaGlow)"/>` : "";
  const body = `
    <g transform="translate(${128 + shake} ${126 + bob}) rotate(${tilt}) translate(${-128 - shake} ${-126 - bob})">
      <ellipse cx="${128 + shake}" cy="${205 + bob}" rx="45" ry="13" fill="#11100f" opacity="0.35"/>
      <path d="M82 ${73 + bob} C83 ${54 + bob} 173 ${54 + bob} 174 ${73 + bob} L169 ${187 + bob} C166 ${209 + bob} 90 ${209 + bob} 86 ${187 + bob} Z" fill="url(#colaBody)" stroke="#17110f" stroke-width="6" stroke-linejoin="round"/>
      <path d="M91 ${80 + bob} C104 ${66 + bob} 153 ${65 + bob} 165 ${80 + bob}" fill="none" stroke="#ff8b66" stroke-width="4" opacity="0.44"/>
      <path d="M94 ${88 + bob} C93 ${123 + bob} 91 ${153 + bob} 96 ${184 + bob}" fill="none" stroke="#ff9a75" stroke-width="5" opacity="0.22"/>
      <path d="M158 ${83 + bob} C167 ${121 + bob} 160 ${158 + bob} 153 ${188 + bob}" fill="none" stroke="#5e1414" stroke-width="8" opacity="0.2"/>
      <ellipse cx="${128 + shake}" cy="${72 + bob}" rx="48" ry="16" fill="url(#colaMetal)" stroke="#17110f" stroke-width="5"/>
      <ellipse cx="${128 + shake}" cy="${67 + bob}" rx="38" ry="10" fill="#d9d6cb" stroke="#17110f" stroke-width="3"/>
      <rect x="${113 + shake}" y="${53 + bob}" width="30" height="18" rx="7" fill="#f2efe6" stroke="#17110f" stroke-width="4"/>
      <rect x="${119 + shake}" y="${48 + bob}" width="18" height="13" rx="5" fill="#c8c2b6" stroke="#17110f" stroke-width="3"/>
      <rect x="${99 + shake}" y="${96 + bob}" width="58" height="39" rx="12" fill="${faceFill}" stroke="#42110f" stroke-width="5"/>
      <path d="M111 ${browY} L126 ${111 + bob} L110 ${118 + bob} Z" fill="${eyeColor}"/>
      <path d="M145 ${browY} L130 ${111 + bob} L146 ${118 + bob} Z" fill="${eyeColor}"/>
      <path d="M103 ${146 + bob} C119 ${137 + bob} 140 ${137 + bob} 154 ${146 + bob}" fill="none" stroke="#fff4c4" stroke-width="3" stroke-linecap="round" opacity="0.2"/>
      <text x="${128 + shake}" y="${160 + bob}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="24" fill="#fff4e1" stroke="#7b211e" stroke-width="1.2">BIG</text>
      <text x="${128 + shake}" y="${184 + bob}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="25" fill="#fff4e1" stroke="#7b211e" stroke-width="1.2">COLA</text>
      <path d="M158 ${170 + bob} C150 ${168 + bob} 149 ${181 + bob} 158 ${179 + bob} M164 ${156 + bob} C156 ${154 + bob} 156 ${165 + bob} 164 ${164 + bob}" fill="none" stroke="#f5d9bf" stroke-width="3" opacity="0.5"/>
      <ellipse cx="${128 + shake}" cy="${204 + bob}" rx="43" ry="11" fill="#17110f" opacity="0.42"/>
      <circle cx="${106 + shake}" cy="${211 + bob}" r="7" fill="#ffb04a" opacity="${row === 4 ? 0.95 : 0.54}"/>
      <circle cx="${128 + shake}" cy="${215 + bob}" r="8" fill="#ffcc69" opacity="${row === 4 ? 0.95 : 0.62}"/>
      <circle cx="${150 + shake}" cy="${211 + bob}" r="7" fill="#ffb04a" opacity="${row === 4 ? 0.95 : 0.54}"/>
    </g>`;
  return `
    <rect x="0" y="0" width="256" height="256" fill="none"/>
    <ellipse cx="128" cy="220" rx="70" ry="18" fill="#000000" opacity="0.22"/>
    ${glow}
    ${colaAbilityEffects(row, col, bob)}
    ${colaArm(-1, row, col, bob)}
    ${colaArm(1, row, col, bob)}
    ${body}`;
}

function bigColaSpritesheet() {
  const defs = `
    <defs>
      <linearGradient id="colaBody" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#f15a43"/>
        <stop offset="0.42" stop-color="#b62929"/>
        <stop offset="1" stop-color="#651313"/>
      </linearGradient>
      <linearGradient id="colaMetal" x1="0" x2="0" y1="0" y2="1">
        <stop stop-color="#fff8e6"/>
        <stop offset="0.5" stop-color="#b9b6ad"/>
        <stop offset="1" stop-color="#6f6a63"/>
      </linearGradient>
      <filter id="colaGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
  const frames = [];
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      frames.push(`<g transform="translate(${col * 256},${row * 256})">${bigColaFrame(row, col)}</g>`);
    }
  }
  return svg(1024, 1536, defs + frames.join(""));
}

function bigColaAbilityIconSvg(config) {
  const c = config.color;
  const a = config.accent;
  const glyphs = {
    bubbles: `<circle cx="46" cy="55" r="18" fill="${c}" fill-opacity="0.28" stroke="${a}" stroke-width="5"/><circle cx="76" cy="42" r="14" fill="${c}" fill-opacity="0.22" stroke="${a}" stroke-width="4"/><circle cx="78" cy="80" r="21" fill="${c}" fill-opacity="0.24" stroke="${a}" stroke-width="5"/><circle cx="41" cy="49" r="5" fill="#ffffff" opacity="0.82"/>`,
    straw: `<path d="M26 70 H101" stroke="${a}" stroke-width="9" stroke-linecap="round"/><path d="M26 70 H101" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M36 31 L68 69" stroke="#fff4c4" stroke-width="8" stroke-linecap="round"/><circle cx="94" cy="70" r="13" fill="${a}" opacity="0.32"/>`,
    spill: `<ellipse cx="65" cy="87" rx="35" ry="13" fill="${c}" fill-opacity="0.42" stroke="${a}" stroke-width="5"/><path d="M55 25 C75 47 82 60 68 77 C52 65 43 47 55 25 Z" fill="${c}" stroke="${a}" stroke-width="5"/><circle cx="58" cy="38" r="5" fill="#ffffff" opacity="0.62"/>`,
    fizz: `<circle cx="64" cy="64" r="39" fill="${c}" fill-opacity="0.12" stroke="${a}" stroke-width="6"/><path d="M64 18 V38 M64 90 V110 M18 64 H38 M90 64 H110 M32 32 L44 44 M84 84 L96 96 M96 32 L84 44 M44 84 L32 96" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="64" r="13" fill="${a}"/>`,
  };
  return svg(128, 128, `
    <defs>
      <radialGradient id="colaAbilityBg" cx="0.5" cy="0.42" r="0.75">
        <stop stop-color="#122a36"/>
        <stop offset="1" stop-color="#06101a"/>
      </radialGradient>
    </defs>
    <rect x="8" y="8" width="112" height="112" rx="18" fill="url(#colaAbilityBg)" stroke="${c}" stroke-width="4"/>
    <circle cx="64" cy="64" r="48" fill="${c}" opacity="0.08"/>
    ${glyphs[config.glyph] || glyphs.fizz}
  `);
}

function bigBurgerAbilityEffect(row, col, bob) {
  const flicker = 0.72 + (col % 2) * 0.18;
  if (row === 1) {
    return `<g opacity="${flicker}"><circle cx="${72 - col * 5}" cy="${76 + col * 4}" r="15" fill="#e94b3d" stroke="#ffd09a" stroke-width="4"/><path d="M45 ${78 + col * 3} C58 66 74 66 88 78" fill="none" stroke="#ff6b58" stroke-width="6" stroke-linecap="round"/></g>`;
  }
  if (row === 2) {
    return `<g opacity="${flicker}"><ellipse cx="${187 + col * 4}" cy="${88 + bob}" rx="23" ry="13" fill="#9fdf45" stroke="#2b1711" stroke-width="4"/><circle cx="${181 + col * 4}" cy="${85 + bob}" r="3" fill="#f7ffbd"/><path d="M172 ${115 + bob} C188 126 207 125 220 113" stroke="#eaff7a" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  }
  if (row === 3) {
    return `<g opacity="${flicker}"><circle cx="${68 + col * 6}" cy="${137 - bob}" r="27" fill="none" stroke="#aa58ff" stroke-width="10"/><circle cx="${198 - col * 4}" cy="${126 + bob}" r="22" fill="none" stroke="#ffd5ff" stroke-width="8"/></g>`;
  }
  if (row === 4) {
    return `<g opacity="${flicker}"><path d="M184 45 C206 75 214 101 195 127 C174 110 169 77 184 45 Z" fill="#e07a2a" stroke="#ffe0a0" stroke-width="5"/><ellipse cx="${75 + col * 8}" cy="176" rx="38" ry="11" fill="#c06a23" opacity="0.52"/></g>`;
  }
  if (row === 5) {
    return `<g opacity="${flicker}"><path d="M18 190 H232" stroke="#ff6b58" stroke-width="11" stroke-linecap="round" opacity="0.55"/><path d="M34 164 L63 190 L34 216 M182 164 L211 190 L182 216" fill="none" stroke="#ffd66b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  if (row === 6) {
    return `<g opacity="${flicker}"><circle cx="128" cy="137" r="${76 + col * 5}" fill="none" stroke="#f0c35b" stroke-width="8" opacity="0.42"/><path d="M128 35 V60 M128 213 V238 M25 137 H51 M205 137 H231" stroke="#ff5d48" stroke-width="7" stroke-linecap="round"/></g>`;
  }
  if (row === 7) {
    return `<g opacity="0.7"><circle cx="128" cy="137" r="${92 + col * 4}" fill="#ff3148" opacity="0.08"/><path d="M43 206 C82 178 170 178 214 204" stroke="#ff3148" stroke-width="8" stroke-linecap="round" opacity="0.46"/></g>`;
  }
  return "";
}

function bigBurgerFrame(row, col) {
  const bob = Math.sin((col / 4) * Math.PI * 2) * (row === 5 ? 2 : 5);
  const lean = row === 5 ? 11 + col * 4 : row === 6 ? Math.sin(col) * 3 : 0;
  const open = row === 6 ? 18 + col * 3 : row === 4 ? 6 : 0;
  const angry = row >= 5 || row === 7;
  const glow = row === 7 ? "#ff3148" : row === 3 ? "#aa58ff" : row === 2 ? "#9fdf45" : "#f05d47";
  return `
    <rect x="0" y="0" width="256" height="256" fill="none"/>
    <ellipse cx="128" cy="221" rx="74" ry="18" fill="#000000" opacity="0.28"/>
    <circle cx="128" cy="136" r="96" fill="${glow}" opacity="0.08"/>
    ${bigBurgerAbilityEffect(row, col, bob)}
    <g transform="translate(${lean},${bob})">
      <ellipse cx="128" cy="211" rx="75" ry="14" fill="#461a1c" opacity="${row === 7 ? 0.88 : 0.62}"/>
      <rect x="58" y="196" width="140" height="19" rx="9" fill="#26211d" stroke="#7f2b32" stroke-width="5"/>
      <path d="M52 ${125 - open} C63 80 96 60 137 62 C181 63 203 86 209 ${126 - open} C181 ${114 - open} 83 ${114 - open} 52 ${125 - open} Z" fill="url(#burgerBun)" stroke="#3a1d12" stroke-width="6"/>
      <path d="M66 ${126 - open} C92 ${145 - open} 164 ${145 - open} 196 ${125 - open} L191 ${153 - open} C157 ${168 - open} 93 ${168 - open} 63 ${153 - open} Z" fill="#f5c348" stroke="#704018" stroke-width="5"/>
      <rect x="67" y="${139 - open}" width="123" height="30" rx="14" fill="#3c2118" stroke="#22120e" stroke-width="5"/>
      <path d="M61 ${164 - open} C84 ${149 - open} 104 ${178 - open} 126 ${162 - open} C151 ${148 - open} 168 ${177 - open} 197 ${160 - open} L198 ${185 - open} C154 ${199 - open} 94 ${199 - open} 58 ${183 - open} Z" fill="#5fbd4d" stroke="#2f5d25" stroke-width="4"/>
      <ellipse cx="92" cy="${159 - open}" rx="21" ry="9" fill="#c92e2d" opacity="0.92"/>
      <ellipse cx="151" cy="${159 - open}" rx="23" ry="9" fill="#7a3d97" opacity="0.9"/>
      <path d="M79 ${178 - open} H181 C190 ${178 - open} 197 ${185 - open} 197 ${194 - open} V198 H61 V194 C61 ${185 - open} 69 ${178 - open} 79 ${178 - open} Z" fill="#8b4f2d" stroke="#3a1d12" stroke-width="5"/>
      <path d="M82 ${105 - open} C104 ${98 - open} 153 ${98 - open} 176 ${106 - open}" fill="none" stroke="#fff0b8" stroke-width="3" opacity="0.22"/>
      <g fill="#fff0b8" opacity="0.78">
        <ellipse cx="94" cy="${84 - open}" rx="4" ry="2.2"/><ellipse cx="120" cy="${77 - open}" rx="4" ry="2.2"/><ellipse cx="151" cy="${80 - open}" rx="4" ry="2.2"/><ellipse cx="177" cy="${96 - open}" rx="4" ry="2.2"/><ellipse cx="71" cy="${104 - open}" rx="4" ry="2.2"/>
      </g>
      <rect x="81" y="${113 - open}" width="94" height="39" rx="16" fill="#20110f"/>
      <path d="M99 ${129 - open} L119 ${122 - open} L113 ${135 - open} Z" fill="#fff1b6"/>
      <path d="M157 ${129 - open} L137 ${122 - open} L143 ${135 - open} Z" fill="#fff1b6"/>
      <path d="M102 ${119 - open} L121 ${125 - open}" stroke="#2b1711" stroke-width="${angry ? 6 : 4}" stroke-linecap="round"/>
      <path d="M154 ${119 - open} L135 ${125 - open}" stroke="#2b1711" stroke-width="${angry ? 6 : 4}" stroke-linecap="round"/>
      <path d="M124 ${61 - open} V36 M124 36 H166 L158 47 L166 58 H124" fill="#d64b28" stroke="#3a1d12" stroke-width="4"/>
      <text x="146" y="52" font-family="Arial Black, Impact, sans-serif" font-size="17" text-anchor="middle" fill="#ffd66b">BB</text>
      ${row === 6 ? `<path d="M82 ${166 - open} C116 ${191 - open} 156 ${192 - open} 191 ${165 - open}" fill="none" stroke="#120807" stroke-width="12" stroke-linecap="round"/>` : ""}
    </g>`;
}

function bigBurgerSpritesheet() {
  const defs = `
    <defs>
      <linearGradient id="burgerBun" x1="0" x2="0" y1="0" y2="1">
        <stop stop-color="#ffc766"/>
        <stop offset="0.5" stop-color="#c47a32"/>
        <stop offset="1" stop-color="#8a4e27"/>
      </linearGradient>
    </defs>`;
  const frames = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      frames.push(`<g transform="translate(${col * 256},${row * 256})">${bigBurgerFrame(row, col)}</g>`);
    }
  }
  return svg(1024, 2048, defs + frames.join(""));
}

function bigBurgerAbilityIconSvg(config) {
  const c = config.color;
  const a = config.accent;
  const common = `stroke="#2b1711" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  const glyphs = {
    tomato: `<circle cx="64" cy="64" r="34" fill="${c}" ${common}/><path d="M64 31 V97 M31 64 H97 M41 41 L87 87 M87 41 L41 87" stroke="${a}" stroke-width="5" stroke-linecap="round"/><circle cx="53" cy="55" r="4" fill="#ffd7a1"/><circle cx="73" cy="75" r="4" fill="#ffd7a1"/>`,
    pickle: `<ellipse cx="64" cy="64" rx="40" ry="26" fill="${c}" ${common}/><circle cx="49" cy="58" r="5" fill="${a}"/><circle cx="67" cy="73" r="5" fill="${a}"/><circle cx="82" cy="61" r="4" fill="${a}"/>`,
    onion: `<circle cx="64" cy="64" r="39" fill="none" stroke="${c}" stroke-width="13"/><circle cx="64" cy="64" r="27" fill="none" stroke="${a}" stroke-width="4"/><path d="M64 25 A39 39 0 0 1 99 76" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.42"/>`,
    sauce: `<path d="M61 19 C87 52 94 78 72 105 C49 125 26 100 39 72 C45 53 53 36 61 19 Z" fill="${c}" ${common}/><ellipse cx="76" cy="101" rx="29" ry="10" fill="${a}" opacity="0.36"/>`,
    charge: `<path d="M20 66 H98" stroke="${a}" stroke-width="11" stroke-linecap="round"/><path d="M66 35 L101 66 L66 97" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42 H48 M24 90 H48" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
    burst: `<path d="M64 14 L76 48 L111 34 L89 65 L112 91 L79 86 L69 116 L56 86 L24 105 L38 72 L15 55 L48 49 Z" fill="${c}" stroke="${a}" stroke-width="5" stroke-linejoin="round"/><circle cx="64" cy="64" r="17" fill="${a}" opacity="0.42"/>`,
  };
  return svg(128, 128, `
    <defs><radialGradient id="burgerAbilityBg" cx="0.5" cy="0.42" r="0.75"><stop stop-color="#26110d"/><stop offset="1" stop-color="#06101a"/></radialGradient></defs>
    <rect x="8" y="8" width="112" height="112" rx="18" fill="url(#burgerAbilityBg)" stroke="${c}" stroke-width="4"/>
    <circle cx="64" cy="64" r="48" fill="${c}" opacity="0.08"/>
    ${glyphs[config.glyph] || glyphs.burst}
  `);
}

function sushiAbilityIconSvg(config) {
  const c = config.color;
  const a = config.accent;
  const glyphs = {
    wasabi: `<path d="M36 83 C48 43 68 25 96 17 C91 50 76 79 43 101 Z" fill="${c}" stroke="#1f3d1f" stroke-width="5"/><circle cx="38" cy="91" r="13" fill="#5c9f38" stroke="${a}" stroke-width="4"/><path d="M50 71 C66 73 78 63 86 42" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
    chopstick: `<path d="M18 82 L112 29 M24 101 L116 51" stroke="${a}" stroke-width="8" stroke-linecap="round"/><path d="M25 73 L104 28 M31 92 L108 50" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M19 56 L42 49 M28 118 L49 101" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
    roll: `<circle cx="48" cy="51" r="25" fill="#18261d" stroke="${a}" stroke-width="5"/><circle cx="48" cy="51" r="15" fill="#fff4db"/><circle cx="48" cy="51" r="6" fill="${c}"/><circle cx="82" cy="80" r="27" fill="#18261d" stroke="${a}" stroke-width="5"/><circle cx="82" cy="80" r="16" fill="#fff4db"/><circle cx="82" cy="80" r="6" fill="#9ff05f"/><path d="M24 96 C46 116 78 119 107 95" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
    soy: `<path d="M31 21 C64 38 96 48 104 82 C76 116 38 106 23 77 C14 58 20 38 31 21 Z" fill="${c}" fill-opacity="0.34" stroke="${a}" stroke-width="6"/><path d="M27 83 C47 69 62 93 81 72 C90 63 98 65 108 75" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/><circle cx="45" cy="49" r="6" fill="${a}" opacity="0.8"/>`,
  };
  return svg(128, 128, `
    <defs>
      <radialGradient id="sushiAbilityBg" cx="0.45" cy="0.35" r="0.72">
        <stop stop-color="${c}" stop-opacity="0.22"/>
        <stop offset="0.58" stop-color="#111315"/>
        <stop offset="1" stop-color="#050607"/>
      </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="56" fill="url(#sushiAbilityBg)" stroke="${c}" stroke-width="5"/>
    <circle cx="64" cy="64" r="48" fill="none" stroke="${a}" stroke-opacity="0.28" stroke-width="2"/>
    ${glyphs[config.glyph] || glyphs.roll}
  `);
}

function sushiPartSvg(part) {
  const defs = `
    <defs>
      <radialGradient id="rice" cx="0.36" cy="0.26" r="0.75">
        <stop stop-color="#fff8e5"/>
        <stop offset="0.58" stop-color="#f1ead7"/>
        <stop offset="1" stop-color="#cfc4ad"/>
      </radialGradient>
      <linearGradient id="nori" x1="0" x2="1">
        <stop stop-color="#101913"/>
        <stop offset="0.48" stop-color="#273b2e"/>
        <stop offset="1" stop-color="#101913"/>
      </linearGradient>
      <linearGradient id="fish" x1="0" x2="1">
        <stop stop-color="#ff8e78"/>
        <stop offset="0.5" stop-color="#e54e5f"/>
        <stop offset="1" stop-color="#b62b43"/>
      </linearGradient>
    </defs>`;
  if (part === "tail") {
    return svg(192, 128, `${defs}<ellipse cx="78" cy="66" rx="54" ry="35" fill="url(#nori)" stroke="#14100e" stroke-width="6"/><path d="M111 37 L174 18 L141 66 L174 110 L111 94 Z" fill="url(#fish)" stroke="#3b1716" stroke-width="5"/><path d="M126 44 L158 30 M126 86 L158 102" stroke="#ffd0ba" stroke-width="4" stroke-linecap="round"/><ellipse cx="72" cy="66" rx="32" ry="21" fill="url(#rice)" opacity="0.8"/>`);
  }
  if (part === "weak") {
    return svg(192, 128, `${defs}<ellipse cx="96" cy="64" rx="72" ry="41" fill="url(#rice)" stroke="#eaff9f" stroke-width="8"/><ellipse cx="96" cy="64" rx="52" ry="30" fill="url(#nori)" stroke="#182218" stroke-width="5"/><circle cx="96" cy="64" r="23" fill="#fff8e5"/><circle cx="86" cy="64" r="8" fill="#ff7b5f"/><circle cx="105" cy="62" r="8" fill="#9ff05f"/><circle cx="99" cy="75" r="6" fill="#ffcf4d"/><path d="M25 64 C48 37 72 28 96 28 C128 29 151 43 172 64" fill="none" stroke="#eaff9f" stroke-width="4" stroke-linecap="round" opacity="0.75"/>`);
  }
  return svg(192, 128, `${defs}<ellipse cx="96" cy="64" rx="70" ry="40" fill="url(#rice)" stroke="#171311" stroke-width="6"/><rect x="45" y="31" width="102" height="66" rx="23" fill="url(#nori)" stroke="#171311" stroke-width="5"/><ellipse cx="96" cy="64" rx="37" ry="24" fill="#fff4db"/><path d="M71 56 C82 43 100 43 111 56 C102 62 83 62 71 56 Z" fill="#ff856b"/><path d="M79 77 C94 65 109 66 119 78" fill="none" stroke="#9ff05f" stroke-width="8" stroke-linecap="round"/><path d="M46 31 L146 97 M146 31 L46 97" stroke="#ffffff" stroke-opacity="0.18" stroke-width="4"/>`);
}

function sushiVfxSvg(kind) {
  if (kind === "wasabi-splatter") {
    return svg(160, 160, `<path d="M25 93 C34 48 70 38 91 61 C106 33 145 53 135 92 C130 121 98 132 76 112 C54 137 18 123 25 93 Z" fill="#78d34d" stroke="#eaff9f" stroke-width="6"/><circle cx="45" cy="46" r="7" fill="#eaff9f"/><circle cx="123" cy="45" r="5" fill="#9ff05f"/><circle cx="132" cy="116" r="8" fill="#5cae36"/><path d="M45 91 C65 78 88 83 108 65" fill="none" stroke="#d9ffd1" stroke-width="7" stroke-linecap="round" opacity="0.7"/>`);
  }
  if (kind === "soy-wave") {
    return svg(220, 120, `
      <path d="M8 77 C28 42 55 41 78 64 C98 84 112 102 139 84 C163 67 184 53 211 68 L211 112 L8 112 Z" fill="#231421" opacity="0.9"/>
      <path d="M11 72 C36 54 54 57 76 76 C100 98 121 99 145 78 C166 60 189 55 214 72 L214 101 C188 91 169 91 145 105 C113 121 88 105 68 88 C48 71 30 72 11 88 Z" fill="#3a183d" opacity="0.92"/>
      <path d="M18 73 C40 62 57 65 75 80 C98 99 119 100 144 82 C166 67 190 62 208 75" fill="none" stroke="#6d3a76" stroke-width="8" stroke-linecap="round" opacity="0.74"/>
      <path d="M27 85 C48 77 64 83 82 96 M118 102 C135 102 146 91 163 84 M170 75 C181 71 192 72 203 78" fill="none" stroke="#cba0d8" stroke-width="3.5" stroke-linecap="round" opacity="0.58"/>
      <ellipse cx="55" cy="70" rx="6" ry="4" fill="#b980c9" opacity="0.7"/>
      <ellipse cx="106" cy="98" rx="7" ry="4" fill="#1a0e19" opacity="0.65"/>
      <ellipse cx="179" cy="72" rx="5" ry="3" fill="#d8b0df" opacity="0.55"/>
      <circle cx="34" cy="98" r="3" fill="#a875b8" opacity="0.6"/>
      <circle cx="197" cy="94" r="4" fill="#140b13" opacity="0.55"/>
    `);
  }
  if (kind === "chopstick-slash") {
    return svg(192, 96, `<path d="M14 55 C65 22 118 17 178 28" fill="none" stroke="#fff0c4" stroke-width="13" stroke-linecap="round"/><path d="M16 56 C72 38 118 35 176 29" fill="none" stroke="#ff7a5f" stroke-width="5" stroke-linecap="round"/><path d="M49 21 L35 48 M91 15 L84 42 M135 18 L133 44" stroke="#ff7a5f" stroke-width="4" stroke-linecap="round"/>`);
  }
  return svg(128, 128, `<circle cx="64" cy="64" r="42" fill="#18261d" stroke="#fff4db" stroke-width="7"/><circle cx="64" cy="64" r="25" fill="#fff4db"/><circle cx="57" cy="62" r="9" fill="#ff7a5f"/><circle cx="73" cy="68" r="7" fill="#9ff05f"/><path d="M24 100 C47 116 82 116 105 98" fill="none" stroke="#f05f6a" stroke-width="6" stroke-linecap="round"/>`);
}

function sushiDeluxeFrame(row, col) {
  const bob = Math.sin((col / 4) * Math.PI * 2) * 3;
  const lunge = row === 3 ? 8 + col * 3 : row === 2 ? -4 + col : 0;
  const jaw = row === 4 || row === 6 ? 5 + col * 1.5 : 0;
  const glow = row === 7 ? "#eaff9f" : row === 8 ? "#9ff05f" : "#f7dfaa";
  const finColor = row === 8 ? "#ff5f6b" : "#f07a6d";
  const cast = row === 5 || row === 6;
  const eyeTilt = row === 8 ? 7 : 4;
  const whiskerLift = Math.sin(col * 1.2 + row * 0.4) * 3;
  return `
    <g transform="translate(${col * 192},${row * 192})">
      <ellipse cx="94" cy="150" rx="72" ry="17" fill="rgba(0,0,0,0.28)"/>
      ${cast ? `<circle cx="96" cy="86" r="${60 + col * 4}" fill="none" stroke="${row === 6 ? "#b85cff" : "#f05f6a"}" stroke-width="5" opacity="0.32"/>` : ""}
      <path d="M64 ${51 + bob} L42 ${18 + bob} L91 ${35 + bob} Z M91 ${34 + bob} L123 ${6 + bob} L118 ${47 + bob} Z M116 ${45 + bob} L165 ${23 + bob} L143 ${65 + bob} Z" fill="${finColor}" stroke="#5a1616" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="${91 + lunge}" cy="${89 + bob}" rx="66" ry="${45 + jaw * 0.35}" fill="#f1ead7" stroke="#171311" stroke-width="7"/>
      <path d="M34 ${68 + bob} C55 ${38 + bob - lunge * 0.35} 111 ${39 + bob - lunge * 0.2} 145 ${68 + bob} C132 ${79 + bob} 116 ${83 + bob} 94 ${82 + bob} C70 ${81 + bob} 50 ${78 + bob} 34 ${68 + bob} Z" fill="#14251c" stroke="#171311" stroke-width="4"/>
      <path d="M62 ${61 + bob} C82 ${42 + bob - lunge * 0.2} 116 ${44 + bob - lunge * 0.15} 134 ${65 + bob} C119 ${75 + bob} 82 ${76 + bob} 62 ${61 + bob} Z" fill="#ff8e78" stroke="#74251f" stroke-width="4"/>
      <path d="M65 ${58 + bob} C80 ${49 + bob} 105 ${50 + bob} 125 ${62 + bob}" fill="none" stroke="#ffd0ba" stroke-width="3" stroke-linecap="round" opacity="0.65"/>
      <g stroke="#d7b77c" stroke-width="5" stroke-linecap="round">
        <path d="M132 ${93 + bob} C153 ${96 + bob + whiskerLift} 171 ${104 + bob + whiskerLift} 188 ${122 + bob}"/>
        <path d="M132 ${106 + bob} C154 ${116 + bob - whiskerLift} 170 ${130 + bob - whiskerLift} 181 ${151 + bob}"/>
        <path d="M128 ${80 + bob} C153 ${75 + bob - whiskerLift} 174 ${72 + bob - whiskerLift} 190 ${76 + bob}"/>
      </g>
      <path d="M107 ${77 + bob} C118 ${67 + bob - eyeTilt} 134 ${69 + bob - eyeTilt} 144 ${80 + bob} C132 ${88 + bob} 118 ${87 + bob} 107 ${77 + bob} Z" fill="#fff6ee" stroke="#672522" stroke-width="4"/>
      <path d="M105 ${107 + bob} C118 ${98 + bob + eyeTilt} 134 ${100 + bob + eyeTilt} 144 ${111 + bob} C131 ${118 + bob} 117 ${117 + bob} 105 ${107 + bob} Z" fill="#fff6ee" stroke="#672522" stroke-width="4"/>
      <circle cx="130" cy="${80 + bob}" r="4.5" fill="${glow}"/><circle cx="130" cy="${110 + bob}" r="4.5" fill="${glow}"/>
      <path d="M91 ${121 + bob + jaw} C103 ${128 + bob + jaw} 119 ${128 + bob + jaw} 132 ${120 + bob + jaw}" fill="none" stroke="#672522" stroke-width="4" stroke-linecap="round"/>
      <g fill="#fff8e5" opacity="0.8">
        <circle cx="48" cy="${94 + bob}" r="4"/><circle cx="57" cy="${111 + bob}" r="3.5"/><circle cx="74" cy="${124 + bob}" r="3.5"/><circle cx="40" cy="${82 + bob}" r="3"/>
      </g>
    </g>`;
}

function sushiDeluxeSpritesheet() {
  const frames = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 4; col += 1) frames.push(sushiDeluxeFrame(row, col));
  }
  return svg(768, 1728, frames.join(""));
}

function iconBody(color, glyph) {
  const bg = `<circle cx="32" cy="32" r="28" fill="#191816" stroke="${color}" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="${color}" opacity="0.18"/>`;
  const commonStroke = `stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const fill = `fill="${color}" stroke="#2b1711" stroke-width="2"`;
  const glyphs = {
    shield: `<path d="M32 12 L48 19 V32 C48 44 41 52 32 56 C23 52 16 44 16 32 V19 Z" ${fill}/>`,
    quake: `<path d="M11 43 L22 32 L31 42 L43 25 L53 37" ${commonStroke}/><path d="M17 51 H48" ${commonStroke}/>`,
    swirl: `<path d="M50 31 C48 17 31 12 21 20 C8 31 18 53 36 48 C48 45 49 33 39 29 C30 25 23 34 28 40" ${commonStroke}/>`,
    wall: `<path d="M15 17 H49 V51 H15 Z M15 29 H49 M26 17 V51 M38 17 V51" ${commonStroke}/>`,
    target: `<circle cx="32" cy="32" r="18" ${commonStroke}/><circle cx="32" cy="32" r="6" ${fill}/><path d="M32 8 V18 M32 46 V56 M8 32 H18 M46 32 H56" ${commonStroke}/>`,
    arrows: `<path d="M14 46 L46 14 M35 13 H47 V25 M20 52 L52 20 M41 19 H53 V31" ${commonStroke}/>`,
    dash: `<path d="M12 42 H38 L28 32 H52 M12 25 H29" ${commonStroke}/>`,
    trap: `<path d="M18 48 L32 15 L46 48 Z" ${commonStroke}/><circle cx="32" cy="38" r="5" ${fill}/>`,
    fire: `<path d="M33 55 C18 47 20 32 31 20 C33 13 37 10 42 7 C40 20 51 25 47 39 C45 49 39 54 33 55 Z" ${fill}/><path d="M31 48 C25 41 29 34 36 28 C35 38 43 39 39 48 Z" fill="#fff1b8"/>`,
    meteor: `<path d="M13 15 L34 33 M18 34 L34 41 M31 13 L41 31" ${commonStroke}/><circle cx="42" cy="42" r="11" ${fill}/>`,
    spark: `<path d="M32 8 L37 27 L56 32 L37 37 L32 56 L27 37 L8 32 L27 27 Z" ${fill}/>`,
    clock: `<circle cx="32" cy="32" r="21" ${commonStroke}/><path d="M32 19 V33 L43 41" ${commonStroke}/>`,
    dagger: `<path d="M45 12 L53 20 L29 46 L21 38 Z M18 42 L12 52" ${commonStroke}/>`,
    cloud: `<path d="M18 43 C8 39 13 26 24 29 C27 17 45 18 45 32 C56 31 58 45 47 47 H20" ${commonStroke}/>`,
    smoke: `<circle cx="24" cy="36" r="11" fill="${color}" opacity="0.7"/><circle cx="36" cy="30" r="13" fill="${color}" opacity="0.55"/><circle cx="43" cy="42" r="10" fill="${color}" opacity="0.65"/>`,
    hammer: `<path d="M23 42 L43 22 M33 14 L50 31 M40 7 L57 24" ${commonStroke}/>`,
    sun: `<circle cx="32" cy="32" r="11" ${fill}/><path d="M32 8 V16 M32 48 V56 M8 32 H16 M48 32 H56 M15 15 L21 21 M43 43 L49 49 M49 15 L43 21 M21 43 L15 49" ${commonStroke}/>`,
    note: `<path d="M38 13 V41 C38 48 32 53 24 53 C18 53 14 50 14 45 C14 39 20 35 28 35 C31 35 34 36 36 37 V18 L51 14 V25 L38 29" ${commonStroke}/>`,
    banner: `<path d="M18 53 V12 M21 14 H50 L44 26 L50 38 H21" fill="${color}" stroke="#2b1711" stroke-width="3"/>`,
    wing: `<path d="M13 44 C22 18 42 14 53 18 C44 27 36 31 25 32 C33 35 42 35 51 32 C40 47 25 52 13 44 Z" ${fill}/>`,
    heart: `<path d="M32 53 C12 39 12 19 26 18 C31 18 32 23 32 23 C32 23 34 18 39 18 C52 19 52 39 32 53 Z" ${fill}/>`,
  };
  return svg(64, 64, bg + (glyphs[glyph] || glyphs.spark));
}

function projectileSvg(config) {
  const c = config.color;
  const a = config.accent;
  const stroke = "#2b1711";
  const shapes = {
    arrow: `<path d="M-36 0 H24" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M24 0 L7 -11 L7 11 Z" fill="${a}" stroke="${stroke}" stroke-width="3"/><path d="M-37 0 L-48 -9 M-37 0 L-48 9" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`,
    bolt: `<path d="M-38 8 L-6 -18 L-12 -2 L34 -8 L-2 22 L6 3 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-29 5 L4 -4" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`,
    orb: `<ellipse cx="-12" cy="0" rx="30" ry="15" fill="${c}" opacity="0.32"/><circle cx="11" cy="0" r="17" fill="${c}" stroke="${stroke}" stroke-width="3"/><circle cx="17" cy="-6" r="6" fill="${a}"/>`,
    note: `<path d="M0 -22 V12 C0 21 -8 27 -18 27 C-27 27 -33 22 -33 15 C-33 7 -24 2 -12 3 C-8 3 -4 4 -1 6 V-16 L28 -22 V-9 L0 -3" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 -22 L28 -28" stroke="${a}" stroke-width="3"/>`,
    wave: `<path d="M35 0 C10 -22 -22 -19 -40 -2 C-24 18 10 22 35 0 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-28 -1 C-9 -8 9 -8 25 0" fill="none" stroke="${a}" stroke-width="3"/>`,
    dagger: `<path d="M-40 14 L18 -18 L39 0 L-18 18 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-23 18 L-42 25" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`,
    cross: `<path d="M0 -34 L8 -8 L34 0 L8 8 L0 34 L-8 8 L-34 0 L-8 -8 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><circle cx="0" cy="0" r="9" fill="${a}"/>`,
    stick: `<rect x="-34" y="-8" width="64" height="16" rx="8" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-22 -5 C-11 -12 9 -12 22 -5" stroke="${a}" stroke-width="3" fill="none"/>`,
    bubble: `<circle cx="0" cy="0" r="23" fill="${c}" fill-opacity="0.38" stroke="${a}" stroke-width="5"/><circle cx="-8" cy="-8" r="6" fill="${a}" opacity="0.75"/>`,
    colaBubble: `<circle cx="0" cy="0" r="25" fill="${c}" fill-opacity="0.26" stroke="${a}" stroke-width="5"/><circle cx="-8" cy="-9" r="7" fill="#ffffff" opacity="0.84"/><circle cx="9" cy="10" r="5" fill="${c}" opacity="0.55"/><path d="M-19 8 C-9 21 11 21 20 6" fill="none" stroke="${a}" stroke-width="3" opacity="0.5"/><circle cx="-30" cy="-16" r="5" fill="${c}" fill-opacity="0.3" stroke="${a}" stroke-width="2"/><circle cx="31" cy="-11" r="4" fill="${c}" fill-opacity="0.28" stroke="${a}" stroke-width="2"/>`,
    slice: `<path d="M-28 23 L34 0 L-28 -23 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><circle cx="-7" cy="-8" r="5" fill="${a}"/><circle cx="-10" cy="10" r="5" fill="${a}"/>`,
    peanut: `<ellipse cx="-10" cy="0" rx="18" ry="12" fill="${c}" stroke="${stroke}" stroke-width="3"/><ellipse cx="13" cy="0" rx="18" ry="12" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-17 -2 C-8 -8 7 -8 18 -2" stroke="${a}" stroke-width="3" fill="none"/>`,
    blob: `<path d="M-28 5 C-31 -14 -13 -25 4 -20 C20 -26 35 -8 26 10 C21 25 -7 28 -20 19 C-26 16 -29 11 -28 5 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><circle cx="6" cy="-6" r="7" fill="${a}" opacity="0.72"/>`,
    seed: `<ellipse cx="0" cy="0" rx="25" ry="15" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-13 -3 C-3 -11 13 -9 20 0" stroke="${a}" stroke-width="3" fill="none"/>`,
    chip: `<path d="M-27 20 L-2 -24 L31 17 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><circle cx="-4" cy="3" r="4" fill="${a}"/>`,
    shard: `<path d="M-32 -13 L34 0 L-13 24 Z" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-13 -7 L5 7" stroke="${a}" stroke-width="3"/>`,
    sprinkle: `<rect x="-28" y="-7" width="56" height="14" rx="7" fill="${c}" stroke="${stroke}" stroke-width="3"/><path d="M-18 0 H18" stroke="${a}" stroke-width="3" stroke-linecap="round"/>`,
    tomatoSlice: `<circle cx="0" cy="0" r="25" fill="${c}" stroke="${stroke}" stroke-width="4"/><circle cx="0" cy="0" r="13" fill="${a}" opacity="0.22"/><path d="M0 -23 V23 M-23 0 H23 M-16 -16 L16 16 M16 -16 L-16 16" stroke="${a}" stroke-width="4" stroke-linecap="round" opacity="0.75"/><circle cx="-8" cy="-5" r="3" fill="#ffd7a1"/><circle cx="8" cy="8" r="3" fill="#ffd7a1"/><path d="M-42 0 C-30 -12 -23 -10 -15 -4" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity="0.46"/>`,
    pickleChip: `<ellipse cx="0" cy="0" rx="28" ry="18" fill="${c}" stroke="${stroke}" stroke-width="4"/><ellipse cx="-5" cy="-3" rx="15" ry="8" fill="${a}" opacity="0.2"/><circle cx="-10" cy="-4" r="3" fill="#f7ffbd"/><circle cx="2" cy="6" r="3" fill="#f7ffbd"/><circle cx="12" cy="-2" r="2.5" fill="#f7ffbd"/><path d="M-39 7 C-26 -2 -17 -2 -8 4" stroke="${a}" stroke-width="5" stroke-linecap="round" opacity="0.46"/>`,
    onionRing: `<circle cx="0" cy="0" r="28" fill="none" stroke="${c}" stroke-width="10"/><circle cx="0" cy="0" r="20" fill="none" stroke="${a}" stroke-width="3" opacity="0.72"/><path d="M0 -28 A28 28 0 0 1 26 10" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.35"/><path d="M-42 0 H-24 M24 0 H42" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity="0.4"/>`,
  };
  return svg(96, 64, shapes[config.shape] || shapes.orb, "-48 -32 96 64");
}

function hazardSvg(config) {
  const c = config.color;
  const a = config.accent;
  const shapes = {
    puddle: `<ellipse cx="64" cy="64" rx="48" ry="28" fill="${c}" fill-opacity="0.42" stroke="${a}" stroke-width="5"/><ellipse cx="49" cy="56" rx="13" ry="6" fill="${a}" opacity="0.45"/>`,
    ring: `<circle cx="64" cy="64" r="44" fill="${c}" fill-opacity="0.12" stroke="${a}" stroke-width="7"/><circle cx="64" cy="64" r="24" fill="none" stroke="${c}" stroke-width="4" opacity="0.72"/>`,
    beam: `<rect x="10" y="48" width="108" height="32" rx="16" fill="${c}" opacity="0.38"/><rect x="12" y="58" width="104" height="12" rx="6" fill="${a}" opacity="0.82"/>`,
    wave: `<path d="M9 74 C24 41 47 41 63 74 C78 105 103 102 119 70" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"/><path d="M12 82 C33 65 46 66 62 87 C78 105 94 103 116 84" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
    burst: `<path d="M64 8 L75 44 L112 28 L90 62 L120 86 L82 85 L82 120 L61 89 L31 115 L42 77 L8 68 L43 52 Z" fill="${c}" stroke="${a}" stroke-width="5" stroke-linejoin="round"/>`,
    colaBeam: `<rect x="4" y="48" width="120" height="32" rx="16" fill="${c}" opacity="0.2"/><path d="M10 64 H118" stroke="${a}" stroke-width="11" stroke-linecap="round"/><path d="M10 64 H118" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="101" cy="64" r="18" fill="${a}" opacity="0.18"/>`,
    colaFizz: `<circle cx="64" cy="64" r="51" fill="${c}" fill-opacity="0.13" stroke="${a}" stroke-width="7"/><circle cx="64" cy="64" r="31" fill="none" stroke="${c}" stroke-width="4" opacity="0.7"/><path d="M64 4 V24 M64 104 V124 M4 64 H24 M104 64 H124 M22 22 L36 36 M92 92 L106 106 M106 22 L92 36 M36 92 L22 106" stroke="${a}" stroke-width="5" stroke-linecap="round" opacity="0.82"/>`,
    colaDrop: `<path d="M58 12 C83 44 94 70 73 101 C52 123 25 98 37 70 C42 53 51 36 58 12 Z" fill="${c}" stroke="${a}" stroke-width="6"/><circle cx="56" cy="43" r="9" fill="#ffffff" opacity="0.58"/><path d="M43 98 C55 111 75 110 88 97" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`,
    colaPuddle: `<ellipse cx="64" cy="72" rx="52" ry="29" fill="${c}" fill-opacity="0.48" stroke="${a}" stroke-width="5"/><ellipse cx="52" cy="63" rx="16" ry="7" fill="${a}" opacity="0.42"/><path d="M22 78 C42 88 67 89 105 75" fill="none" stroke="#fff8dc" stroke-width="3" opacity="0.22"/>`,
    picklePuddle: `<ellipse cx="64" cy="72" rx="52" ry="28" fill="${c}" fill-opacity="0.45" stroke="${a}" stroke-width="5"/><circle cx="43" cy="67" r="7" fill="${a}" opacity="0.34"/><circle cx="71" cy="78" r="5" fill="${a}" opacity="0.38"/><circle cx="87" cy="62" r="6" fill="${a}" opacity="0.32"/><path d="M21 76 C42 89 71 90 106 73" fill="none" stroke="#f7ffbd" stroke-width="3" opacity="0.3"/>`,
    burgerSauceDrop: `<path d="M59 11 C82 42 91 68 72 97 C52 120 27 98 37 71 C43 52 51 35 59 11 Z" fill="${c}" stroke="${a}" stroke-width="6"/><circle cx="56" cy="43" r="8" fill="#fff0be" opacity="0.58"/><ellipse cx="69" cy="103" rx="31" ry="10" fill="${c}" fill-opacity="0.36" stroke="${a}" stroke-width="3"/>`,
    burgerSauceBurst: `<path d="M64 7 L77 43 L116 29 L91 63 L120 88 L83 86 L78 121 L60 91 L27 115 L40 78 L8 66 L44 51 Z" fill="${c}" fill-opacity="0.52" stroke="${a}" stroke-width="6" stroke-linejoin="round"/><circle cx="64" cy="66" r="25" fill="${a}" opacity="0.24"/><circle cx="43" cy="51" r="7" fill="${a}" opacity="0.55"/><circle cx="84" cy="79" r="8" fill="${a}" opacity="0.45"/>`,
    burgerChargeLane: `<rect x="4" y="46" width="120" height="36" rx="18" fill="${c}" opacity="0.22"/><path d="M10 64 H118" stroke="${a}" stroke-width="9" stroke-linecap="round"/><path d="M15 47 L34 64 L15 81 M92 47 L111 64 L92 81" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    burgerBurstRing: `<circle cx="64" cy="64" r="51" fill="${c}" fill-opacity="0.1" stroke="${a}" stroke-width="8"/><circle cx="64" cy="64" r="24" fill="none" stroke="${c}" stroke-width="5" opacity="0.64"/><path d="M64 5 V23 M64 105 V123 M5 64 H23 M105 64 H123 M22 22 L35 35 M93 93 L106 106 M106 22 L93 35 M35 93 L22 106" stroke="${a}" stroke-width="5" stroke-linecap="round" opacity="0.72"/>`,
  };
  return svg(128, 128, shapes[config.shape] || shapes.ring);
}

function uiButtonSvg(kind) {
  const primary = kind === "primary" ? "#3a2d1a" : "#191816";
  const accent = kind === "primary" ? "#f0d47c" : "#8ec7ff";
  return svg(256, 80, `
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="#11110f"/></linearGradient></defs>
    <rect x="4" y="4" width="248" height="72" rx="10" fill="url(#g)" stroke="${accent}" stroke-width="4"/>
    <path d="M19 20 H237 M19 60 H237" stroke="${accent}" stroke-opacity="0.28" stroke-width="2"/>
    <circle cx="32" cy="40" r="8" fill="${accent}" opacity="0.45"/><circle cx="224" cy="40" r="8" fill="${accent}" opacity="0.45"/>
  `);
}

function abilitySlotSvg(tone) {
  const accent = tone === "blue" ? "#2d8ee8" : "#b47c24";
  const glow = tone === "blue" ? "#12345b" : "#3a2710";
  return svg(260, 74, `
    <defs>
      <linearGradient id="slotBg" x1="0" x2="1">
        <stop stop-color="#08101a"/>
        <stop offset="0.52" stop-color="#0a1520"/>
        <stop offset="1" stop-color="#07111c"/>
      </linearGradient>
      <linearGradient id="slotLine" x1="0" x2="1">
        <stop stop-color="${accent}" stop-opacity="0.72"/>
        <stop offset="0.5" stop-color="${accent}" stop-opacity="0.36"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0.72"/>
      </linearGradient>
      <radialGradient id="slotGlow" cx="0.22" cy="0.45" r="0.72">
        <stop stop-color="${glow}" stop-opacity="0.72"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="1" y="1" width="258" height="72" rx="3" fill="url(#slotBg)" stroke="url(#slotLine)" stroke-width="1.5"/>
    <rect x="2" y="2" width="256" height="70" rx="2" fill="url(#slotGlow)" opacity="0.44"/>
    <path d="M1.5 9 H258.5 M1.5 65 H258.5" stroke="${accent}" stroke-opacity="0.18" stroke-width="1"/>
  `);
}

function abilityKeycapSvg(tone) {
  const accent = tone === "blue" ? "#2d8ee8" : "#d1942c";
  const fill = tone === "blue" ? "#06172b" : "#231706";
  return svg(96, 56, `
    <defs>
      <linearGradient id="keyBg" x1="0" x2="0" y1="0" y2="1">
        <stop stop-color="${fill}"/>
        <stop offset="1" stop-color="#0b0f14"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="92" height="52" rx="7" fill="url(#keyBg)" stroke="${accent}" stroke-width="4"/>
    <rect x="7" y="7" width="82" height="42" rx="5" fill="${accent}" opacity="0.08"/>
    <path d="M10 13 H86" stroke="${accent}" stroke-opacity="0.28" stroke-width="2"/>
  `);
}

function abilityIconRingSvg(tone) {
  const accent = tone === "blue" ? "#2d8ee8" : tone === "purple" ? "#9157ff" : "#c79224";
  return svg(64, 64, `
    <defs>
      <radialGradient id="ringGlow" cx="0.5" cy="0.5" r="0.62">
        <stop stop-color="${accent}" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#07101b" stroke="${accent}" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="24" fill="url(#ringGlow)"/>
    <path d="M32 4 A28 28 0 0 1 59 39" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  `);
}

function cooldownClockShadeSvg() {
  return svg(64, 64, `
    <circle cx="32" cy="32" r="31" fill="#02060b" opacity="0.42"/>
    <path d="M32 32 L32 2 A30 30 0 0 1 62 32 Z" fill="#000000" opacity="0.62"/>
    <circle cx="32" cy="32" r="4" fill="#f4f1e6" opacity="0.45"/>
  `);
}

function rewardPanelFrameSvg() {
  return svg(1519, 999, `
    <defs>
      <radialGradient id="panelGlow" cx="0.52" cy="0.12" r="0.7">
        <stop stop-color="#0a304d" stop-opacity="0.58"/>
        <stop offset="0.48" stop-color="#071522" stop-opacity="0.36"/>
        <stop offset="1" stop-color="#02070d" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="panelLine" x1="0" x2="1">
        <stop stop-color="#2e4b68"/>
        <stop offset="0.5" stop-color="#17324d"/>
        <stop offset="1" stop-color="#2e4b68"/>
      </linearGradient>
    </defs>
    <rect width="1519" height="999" fill="#02070d"/>
    <rect x="25" y="28" width="1469" height="943" rx="21" fill="#061321" stroke="url(#panelLine)" stroke-width="2.2"/>
    <rect x="27" y="30" width="1465" height="939" rx="19" fill="url(#panelGlow)"/>
    <path d="M690 28 C709 12 777 12 794 28" fill="none" stroke="#09344c" stroke-width="7" stroke-linecap="round" opacity="0.7"/>
    <path d="M386 200 H1118 M744 193 L752 201 L744 209 L736 201 Z" stroke="#214764" stroke-width="1.5" fill="#42adff" opacity="0.6"/>
  `);
}

function rewardCardFrameSvg(tone, state = "default") {
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  const stateBoost = state === "hover" ? 0.25 : state === "selected" ? 0.42 : state === "confirm" ? 0.62 : state === "locked" ? 0.2 : 0;
  const strokeWidth = state === "confirm" ? 5 : state === "selected" || state === "hover" ? 4 : 3;
  const overlayOpacity = state === "locked" ? 0.38 : state === "confirm" ? 0.22 : state === "selected" ? 0.16 : 0.1;
  const confirmBits = state === "confirm" ? `
    <path d="M-7 116 H10 M-7 154 H6 M386 118 H402 M390 160 H404 M-4 430 H12 M381 448 H401" stroke="${t.color}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <g fill="${t.color}" opacity="0.82">
      <rect x="10" y="82" width="4" height="4"/><rect x="22" y="132" width="3" height="8"/><rect x="374" y="88" width="5" height="5"/><rect x="364" y="132" width="3" height="8"/>
      <rect x="18" y="454" width="4" height="4"/><rect x="372" y="488" width="4" height="4"/>
    </g>
  ` : "";
  const lockedCheck = state === "locked" ? `
    <circle cx="382" cy="38" r="20" fill="${t.color}" stroke="#07101b" stroke-width="4"/>
    <path d="M372 37 L380 45 L394 29" fill="none" stroke="#07101b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  ` : "";
  return svg(392, 574, `
    <defs>
      <radialGradient id="cardGlow" cx="0.45" cy="0.25" r="0.7">
        <stop stop-color="${t.glow}" stop-opacity="${0.65 + stateBoost}"/>
        <stop offset="0.46" stop-color="${t.dark}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#050916" stop-opacity="0.96"/>
      </radialGradient>
      <linearGradient id="cardLine" x1="0" x2="1">
        <stop stop-color="${t.color}"/>
        <stop offset="0.5" stop-color="${t.color}" stop-opacity="0.42"/>
        <stop offset="1" stop-color="${t.color}"/>
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="386" height="568" rx="27" fill="url(#cardGlow)" stroke="url(#cardLine)" stroke-width="${strokeWidth}"/>
    <rect x="7" y="7" width="378" height="560" rx="23" fill="none" stroke="${t.color}" stroke-opacity="0.24" stroke-width="1"/>
    <path d="M3 110 L108 3 H148 L3 148 Z" fill="${t.color}" opacity="${overlayOpacity}"/>
    <path d="M16 99 L101 14 H139" fill="none" stroke="${t.color}" stroke-opacity="0.36" stroke-width="1.5"/>
    <path d="M111 3 L136 3 M272 3 L300 3" stroke="${t.color}" stroke-opacity="0.8" stroke-width="2"/>
    <path d="M13 486 L13 549 Q13 561 25 561 H62" stroke="${t.color}" stroke-opacity="0.24" stroke-width="1.5" fill="none"/>
    ${confirmBits}
    ${lockedCheck}
  `);
}

function rewardConfirmParticlesSvg(tone) {
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  return svg(460, 620, `
    <g fill="${t.color}" stroke="${t.color}" stroke-linecap="round" opacity="0.9">
      <rect x="8" y="112" width="4" height="10"/><rect x="19" y="182" width="3" height="3"/><rect x="36" y="246" width="4" height="12"/><rect x="18" y="402" width="5" height="5"/><rect x="48" y="532" width="4" height="10"/>
      <rect x="438" y="103" width="5" height="5"/><rect x="421" y="171" width="4" height="11"/><rect x="445" y="254" width="4" height="4"/><rect x="414" y="384" width="5" height="12"/><rect x="435" y="517" width="4" height="4"/>
      <path d="M55 94 H72 M42 124 H51 M389 91 H410 M409 132 H420 M37 570 H51 M405 571 H421" stroke-width="3"/>
      <circle cx="27" cy="321" r="3"/><circle cx="432" cy="313" r="3"/><circle cx="58" cy="467" r="2"/><circle cx="397" cy="462" r="2"/>
    </g>
  `);
}

function rewardMedallionSvg(tone) {
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  return svg(190, 190, `
    <defs>
      <radialGradient id="medGlow" cx="0.5" cy="0.5" r="0.55">
        <stop stop-color="${t.glow}" stop-opacity="0.6"/>
        <stop offset="1" stop-color="#01040a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="95" cy="95" r="90" fill="url(#medGlow)" stroke="${t.color}" stroke-width="4"/>
    <circle cx="95" cy="95" r="74" fill="#07101b" opacity="0.58"/>
    <path d="M95 6 A89 89 0 0 1 178 65" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3" stroke-linecap="round"/>
  `);
}

function rewardPillSvg(tone) {
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  return svg(190, 52, `
    <rect x="2" y="2" width="186" height="48" rx="17" fill="#07131f" stroke="${t.color}" stroke-width="2"/>
    <rect x="8" y="8" width="174" height="36" rx="13" fill="${t.color}" opacity="0.08"/>
    <path d="M13 14 L6 21 V31 L15 42 M177 14 L184 21 V31 L175 42" stroke="${t.color}" stroke-opacity="0.36" stroke-width="2" fill="none"/>
  `);
}

function rewardDividerSvg(tone) {
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  return svg(290, 24, `
    <path d="M0 12 H118 M172 12 H290" stroke="${t.color}" stroke-opacity="0.28" stroke-width="2"/>
    <path d="M145 5 L152 12 L145 19 L138 12 Z" fill="none" stroke="${t.color}" stroke-width="2"/>
  `);
}

function rewardHeaderFlaskSvg() {
  return svg(160, 84, `
    <path d="M30 48 H66 M94 48 H130" stroke="#42dfff" stroke-width="2" opacity="0.8"/>
    <path d="M54 32 L39 23 M106 32 L121 23 M61 22 L52 10 M99 22 L108 10" stroke="#42dfff" stroke-width="2" stroke-linecap="round"/>
    <path d="M73 15 H87 V39 L99 57 C105 70 95 80 80 80 C65 80 55 70 61 57 L73 39 Z" fill="none" stroke="#42dfff" stroke-width="4" stroke-linejoin="round"/>
    <path d="M68 60 C74 66 86 66 92 60 C93 70 88 75 80 75 C72 75 67 70 68 60 Z" fill="#42dfff" opacity="0.35"/>
    <circle cx="68" cy="11" r="2" fill="#79f3ff"/><circle cx="92" cy="9" r="2" fill="#79f3ff"/><path d="M80 4 V10 M76 7 H84" stroke="#79f3ff" stroke-width="1.5"/>
  `);
}

function rewardInfoIconSvg() {
  return svg(42, 42, `
    <circle cx="21" cy="21" r="17" fill="#07131f" stroke="#9fb6d3" stroke-width="2.4"/>
    <circle cx="21" cy="13" r="2.3" fill="#9fb6d3"/>
    <path d="M21 19 V30" stroke="#9fb6d3" stroke-width="4" stroke-linecap="round"/>
  `);
}

function rewardIconSvg(config) {
  const tone = config.tone || "blue";
  const t = rewardToneColors[tone] || rewardToneColors.blue;
  const c = t.color;
  const stroke = "#07101b";
  const glyphs = {
    blade: `<path d="M83 12 C76 42 60 73 32 100 L24 92 C51 64 63 43 71 9 Z" fill="${c}" stroke="${stroke}" stroke-width="5"/><path d="M36 88 L19 105" stroke="${c}" stroke-width="10" stroke-linecap="round"/>`,
    boot: `<path d="M43 24 C60 39 73 54 84 76 L105 84 C112 87 113 99 105 104 H60 C44 88 33 67 28 41 Z" fill="${c}" stroke="${stroke}" stroke-width="5"/><path d="M13 51 H43 M18 68 H50 M25 85 H59" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
    heart: `<path d="M64 109 C24 80 22 38 49 35 C59 34 64 44 64 44 C64 44 70 34 80 35 C107 38 104 80 64 109 Z" fill="${c}" stroke="${stroke}" stroke-width="5"/>`,
    shield: `<path d="M64 14 L101 29 V58 C101 84 86 103 64 113 C42 103 27 84 27 58 V29 Z" fill="${c}" stroke="${stroke}" stroke-width="5"/><path d="M64 27 V97" stroke="#ffffff" stroke-opacity="0.24" stroke-width="5"/>`,
    hands: `<path d="M60 34 C72 26 86 37 78 49 L99 31 C111 24 120 39 109 49 L90 68 C105 63 113 78 99 87 C82 99 58 103 41 91 C31 83 25 72 26 57" fill="${c}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><path d="M12 48 H39 M17 64 H42 M24 80 H49" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
    flask: `<path d="M53 17 H75 V50 L94 82 C105 103 89 118 64 118 C39 118 23 103 34 82 L53 50 Z" fill="${c}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><path d="M43 92 C52 103 76 103 86 91 C87 108 78 114 64 114 C50 114 41 108 43 92 Z" fill="#07101b" opacity="0.32"/><circle cx="49" cy="88" r="5" fill="#07101b" opacity="0.45"/>`,
    snow: `<path d="M64 18 V110 M24 41 L104 87 M104 41 L24 87" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M47 28 L64 44 L81 28 M47 100 L64 84 L81 100 M27 59 L49 66 L44 88 M101 59 L79 66 L84 88" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  return svg(128, 128, `
    <defs><filter id="softGlow"><feGaussianBlur stdDeviation="2.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g filter="url(#softGlow)">${glyphs[config.glyph] || glyphs.flask}</g>
  `);
}

function potionSvg() {
  return svg(96, 96, `
    <ellipse cx="48" cy="78" rx="26" ry="7" fill="rgba(0,0,0,0.28)"/>
    <rect x="37" y="15" width="22" height="18" rx="5" fill="#d0c6b4" stroke="#2b1711" stroke-width="3"/>
    <path d="M31 34 C18 54 25 82 48 84 C71 82 78 54 65 34 Z" fill="#8ec7ff" stroke="#2b1711" stroke-width="4"/>
    <path d="M28 61 C38 68 56 68 68 58 C70 72 62 80 48 81 C34 80 27 72 28 61 Z" fill="#4da4e8" opacity="0.78"/>
    <circle cx="41" cy="48" r="6" fill="#e8f7ff" opacity="0.8"/>
  `);
}

function readme() {
  return `# Generated Game Art

These SVG assets are generated by \`node scripts/generate-game-art.js\`.

The files are intentionally lightweight and deterministic so the game has a complete image-backed art layer for classes, bosses, projectiles, hazards, ability icons, and UI chrome. They can be replaced one-by-one with hand-painted PNGs later while keeping the same manifest concepts and render hooks.
`;
}

function main() {
  ensureDir(outRoot);
  const manifest = {
    note: "Generated by scripts/generate-game-art.js",
    classes: {},
    bosses: {},
    bossAbilities: {},
    abilities: {},
    projectiles: {},
    hazards: {},
    rewards: {},
    ui: {},
  };

  for (const [key, config] of Object.entries(classConfigs)) {
    manifest.classes[key] = writeGenerated(["classes", `${key}-spritesheet.svg`], classSpritesheet(config));
    manifest.ui[`class-${key}`] = writeGenerated(["icons", "classes", `${key}.svg`], iconBody(config.secondary, config.weapon === "lute" ? "note" : config.weapon === "bow" ? "target" : config.weapon === "staff" ? "spark" : config.weapon === "dagger" ? "dagger" : config.weapon === "hammer" ? "hammer" : "shield"));
  }

  for (const [key, config] of Object.entries(bossConfigs)) {
    manifest.bosses[key] = writeGenerated(["bosses", `${key}-spritesheet.svg`], bossSpritesheet(key, config));
  }
  manifest.bosses.colaDeluxe = writeGenerated(["bosses", "cola-deluxe-spritesheet.svg"], bigColaSpritesheet());
  manifest.bosses.burgerDeluxe = writeGenerated(["bosses", "burger-deluxe-spritesheet.svg"], bigBurgerSpritesheet());
  manifest.bosses.sushiDeluxe = writeGenerated(["bosses", "sushi-deluxe-spritesheet.svg"], sushiDeluxeSpritesheet());
  manifest.bosses.sushiParts = {
    segment: writeGenerated(["bosses", "sushi-segment.svg"], sushiPartSvg("segment")),
    weakSegment: writeGenerated(["bosses", "sushi-weak-segment.svg"], sushiPartSvg("weak")),
    tail: writeGenerated(["bosses", "sushi-tail.svg"], sushiPartSvg("tail")),
  };
  manifest.bossAbilities.cola = {};
  Object.entries(colaAbilityConfigs).forEach(([key, config]) => {
    manifest.bossAbilities.cola[key] = writeGenerated(["icons", "boss-abilities", `cola-${key}.svg`], bigColaAbilityIconSvg(config));
  });
  manifest.bossAbilities.burger = {};
  Object.entries(burgerAbilityConfigs).forEach(([key, config]) => {
    manifest.bossAbilities.burger[key] = writeGenerated(["icons", "boss-abilities", `burger-${key}.svg`], bigBurgerAbilityIconSvg(config));
  });
  manifest.bossAbilities.sushi = {};
  Object.entries(sushiAbilityConfigs).forEach(([key, config]) => {
    manifest.bossAbilities.sushi[key] = writeGenerated(["icons", "boss-abilities", `sushi-${key}.svg`], sushiAbilityIconSvg(config));
  });
  manifest.projectiles["sushi-roll"] = writeGenerated(["projectiles", "sushi-roll.svg"], sushiVfxSvg("sushi-roll"));
  manifest.hazards["wasabi-splatter"] = writeGenerated(["hazards", "wasabi-splatter.svg"], sushiVfxSvg("wasabi-splatter"));
  manifest.hazards["soy-wave"] = writeGenerated(["hazards", "soy-wave.svg"], sushiVfxSvg("soy-wave"));
  manifest.hazards["chopstick-slash"] = writeGenerated(["hazards", "chopstick-slash.svg"], sushiVfxSvg("chopstick-slash"));

  for (const [classKey, icons] of Object.entries(abilityIcons)) {
    manifest.abilities[classKey] = {};
    icons.forEach(([slug, color, glyph], index) => {
      manifest.abilities[classKey][index] = writeGenerated(["icons", "abilities", `${classKey}-${index}-${slug}.svg`], iconBody(color, glyph));
    });
  }

  for (const [key, config] of Object.entries(projectileConfigs)) {
    manifest.projectiles[key] = writeGenerated(["projectiles", `${key}.svg`], projectileSvg(config));
  }

  for (const [key, config] of Object.entries(hazardConfigs)) {
    manifest.hazards[key] = writeGenerated(["hazards", `${key}.svg`], hazardSvg(config));
  }

  for (const [key, config] of Object.entries(rewardIconConfigs)) {
    manifest.rewards[key] = writeGenerated(["icons", "rewards", `${key}.svg`], rewardIconSvg(config));
  }

  manifest.ui.buttonPrimary = writeGenerated(["ui", "button-primary.svg"], uiButtonSvg("primary"));
  manifest.ui.buttonSecondary = writeGenerated(["ui", "button-secondary.svg"], uiButtonSvg("secondary"));
  manifest.ui.abilitySlotGold = writeGenerated(["ui", "ability-slot-gold.svg"], abilitySlotSvg("gold"));
  manifest.ui.abilitySlotBlue = writeGenerated(["ui", "ability-slot-blue.svg"], abilitySlotSvg("blue"));
  manifest.ui.abilityKeycapGold = writeGenerated(["ui", "ability-keycap-gold.svg"], abilityKeycapSvg("gold"));
  manifest.ui.abilityKeycapBlue = writeGenerated(["ui", "ability-keycap-blue.svg"], abilityKeycapSvg("blue"));
  manifest.ui.abilityIconRingGold = writeGenerated(["ui", "ability-icon-ring-gold.svg"], abilityIconRingSvg("gold"));
  manifest.ui.abilityIconRingPurple = writeGenerated(["ui", "ability-icon-ring-purple.svg"], abilityIconRingSvg("purple"));
  manifest.ui.abilityIconRingBlue = writeGenerated(["ui", "ability-icon-ring-blue.svg"], abilityIconRingSvg("blue"));
  manifest.ui.cooldownClockShade = writeGenerated(["ui", "cooldown-clock-shade.svg"], cooldownClockShadeSvg());
  manifest.ui.rewardPanelFrame = writeGenerated(["ui", "reward-panel-frame.svg"], rewardPanelFrameSvg());
  Object.keys(rewardToneColors).forEach((tone) => {
    const name = tone[0].toUpperCase() + tone.slice(1);
    manifest.ui[`rewardCard${name}`] = writeGenerated(["ui", `reward-card-${tone}.svg`], rewardCardFrameSvg(tone));
    manifest.ui[`rewardCard${name}Hover`] = writeGenerated(["ui", `reward-card-${tone}-hover.svg`], rewardCardFrameSvg(tone, "hover"));
    manifest.ui[`rewardCard${name}Selected`] = writeGenerated(["ui", `reward-card-${tone}-selected.svg`], rewardCardFrameSvg(tone, "selected"));
    manifest.ui[`rewardCard${name}Confirm`] = writeGenerated(["ui", `reward-card-${tone}-confirm.svg`], rewardCardFrameSvg(tone, "confirm"));
    manifest.ui[`rewardCard${name}Locked`] = writeGenerated(["ui", `reward-card-${tone}-locked.svg`], rewardCardFrameSvg(tone, "locked"));
    manifest.ui[`rewardConfirmParticles${name}`] = writeGenerated(["ui", `reward-confirm-particles-${tone}.svg`], rewardConfirmParticlesSvg(tone));
    manifest.ui[`rewardMedallion${name}`] = writeGenerated(["ui", `reward-medallion-${tone}.svg`], rewardMedallionSvg(tone));
    manifest.ui[`rewardPill${name}`] = writeGenerated(["ui", `reward-pill-${tone}.svg`], rewardPillSvg(tone));
    manifest.ui[`rewardDivider${name}`] = writeGenerated(["ui", `reward-divider-${tone}.svg`], rewardDividerSvg(tone));
  });
  manifest.ui.rewardHeaderFlask = writeGenerated(["ui", "reward-header-flask.svg"], rewardHeaderFlaskSvg());
  manifest.ui.rewardInfoIcon = writeGenerated(["ui", "reward-info-icon.svg"], rewardInfoIconSvg());
  manifest.ui.potion = writeGenerated(["ui", "potion.svg"], potionSvg());
  writeGenerated(["README.md"], readme());
  writeGenerated(["manifest.json"], `${JSON.stringify(manifest, null, 2)}\n`);

  const total =
    Object.keys(manifest.classes).length +
    Object.keys(manifest.bosses).length +
    Object.values(manifest.bossAbilities).reduce((sum, group) => sum + Object.keys(group).length, 0) +
    Object.values(manifest.abilities).reduce((sum, group) => sum + Object.keys(group).length, 0) +
    Object.keys(manifest.projectiles).length +
    Object.keys(manifest.hazards).length +
    Object.keys(manifest.rewards).length +
    Object.keys(manifest.ui).length;
  console.log(`Generated ${total} game art assets in ${path.relative(root, outRoot)}`);
}

main();
