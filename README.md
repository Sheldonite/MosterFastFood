# Boss Fight

## Starting Locally

Windows:

```text
Double-click start.bat
```

If Node.js is missing and `winget` is available, `start.bat` will ask whether to install Node.js LTS. Choose `Y` only if you want Windows to download and install Node.js from the standard package source.

macOS/Linux:

```sh
chmod +x start.sh
./start.sh
```

Then open:

```text
http://localhost:4173
```

The launchers try Node.js first, then Python. If neither is installed, Windows opens `index.html` directly as a fallback.

Use the Node launcher for co-op. Python and direct-file fallbacks support solo play; they do not provide the WebSocket lobby server.

## Playing

Choose Solo or Co-op, then one of six heroes and an armor set. Try your equipped permanent build in the training room. The gate locks the loadout and offers a direct boss encounter or a short optional contract. Boss clears and completed contracts earn Marks; their rewards offer temporary relics that last for this run.

Global combat balance now gives players, bosses, enemies, summons, training targets, and damageable boss parts 50% more HP and base damage. Abilities, damage over time, bonus attacks, and hostile hazards use the same increase; integer stats round to the nearest whole number. Armor and other mitigation still apply afterward. Existing solo checkpoints convert their remaining HP once when resumed, preserving progress and defeated targets.

The Condiment Trio and Special Sauce are one encounter. Defeating Ketchup, Mustard, and Mayo starts a seven-second amalgamation: their remains stream into a vortex and rise as the sauce abomination. Phase two continues in the same arena with the same health, potions, cooldowns, and build. The combined fight grants one clear and one relic, then leads to the Shake. A full run now contains ten encounters. Practice retries restart all three bottles.

Taco Titan now commits to a wall-crashing ram, a leaping Crunchquake with broken shell shockwaves, and spaced salsa lobs. Exploit its exposed filling after an attack. Sushi Serpent follows a curved lunge, closes a pair of chopsticks, and sends soy tides with a clear passage. Strike its glowing roll to cancel an attack and stagger it. Later phases add combinations, with pixel warnings, matching collision shapes, and distinct sound cues. See [Taco and Sushi encounter details](docs/TACO_SUSHI_REDESIGN.md).

Death ends a normal run. The results bank its Marks once, including depth milestones, and let you open Permanent upgrades for the next attempt. All 150 talents have gameplay effects. Foundations cost 2 Marks, techniques 4, and keystones 8. Equip four support talents and one keystone; three owned support talents in a class unlock its keystones. Purchases persist, and refunds and build swaps are free between runs.

| Input | Action |
| --- | --- |
| WASD | Move |
| Mouse / hold left click | Aim / attack |
| Q, E, Space, R | Four class abilities |
| F | Drink a potion |
| Enter | Interact with an objective; hold to operate pumps/heaters |
| Escape | Open or close the menu |
| Tab, left/right arrows | Switch living teammates while spectating |

Solo menus pause the simulation. Co-op menus keep the party running. Defeated players spectate; a party wipe ends a normal run for everyone. The host selects routes and resolves encounters. Practice awards no Marks and retains full-health encounter retries, including synchronized host-only retries after a party wipe. The host selects Practice in the co-op lobby.

The versioned progression profile and journal save on this device. Reloading offers solo encounter recovery or banking its confirmed earnings; a disconnected party run can bank confirmed progress. Existing saved gear remains separate. The same browser profile is shared across tabs, so use separate profiles for different local co-op players.

Settings include effects and music volume, mute, reduced motion, screen shake, and fullscreen. They save locally. Co-op's Advanced connection section retains the configurable server URL. Existing saved gear and Electron configuration remain supported.

## Pixel art and presentation

The authored PNG library is in assets/pixel. Regenerate it with npm run generate:pixel.

Hero frames are 32×48 with a four-column, four-direction grid. Boss frames are 64×64, environment tiles 16×16, and ability icons 32×32. assets/pixel/manifest.json records frame dimensions, anchors, animation frames, and timing. PNG transparency is authored in the generator. Physics footprints remain independent of image size.

The world renders to a 640×360 canvas with nearest-neighbor presentation, integer scaling when space permits, and letterboxing. Simulation coordinates remain continuous. HUD and menu text use readable CSS sizes.

The arcade and rogue modules separate UI, progression, combat hooks, contracts, boss revisions, and networking adapters from the original game controllers. See [implementation and validation](docs/MECHANICS_IMPLEMENTATION.md) and [all implemented talents](docs/IMPLEMENTED_TALENTS.md).

## Checks and encounter testing

```sh
npm run check
```

This syntax-checks the shipped scripts and runs regressions against the actual game code and WebSocket server: training collision, input gating, projectile deduplication, reward confirmation, Practice retries, permanent builds, settlement/reload, all classes and bosses, all 150 talent effects, and two/four-client synchronization.

Run `node scripts/document-talents.js` to export the implemented talent catalogue from the shipped descriptions. The original review proposal is retained as historical design context.

The title's Development tools entry retains the existing developer password flow. Dev Test exposes Boss, Test Arena, Test Gauntlet, and Clear Test controls for exercising encounters and results. These controls are hidden during ordinary runs.
