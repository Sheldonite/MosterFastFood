const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
for (const directory of ["src", "scripts", "electron"]) {
  for (const file of fs.readdirSync(path.join(__dirname, "..", directory)).filter((file) => file.endsWith(".js"))) {
    const filename = path.join(__dirname, "..", directory, file);
    new vm.Script(fs.readFileSync(filename, "utf8"), { filename });
  }
}
new vm.Script(fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8"), { filename:"server.js" });
require("./test-projectile-damage-once");
require("./test-combat-balance");
require("./test-signature-bosses");
require("./test-arcade");
require("./test-rogue");
require("./test-condiment-fusion");
require("./test-rogue-talents");
require("./test-coop-server");
