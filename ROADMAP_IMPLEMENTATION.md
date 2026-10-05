# Retro pixel arcade implementation

The pixel redesign retains six classes, food bosses, armor, co-op messages, saved gear, and Electron integration. The subsequent mechanics redesign adds permanent talent builds and optional contracts, with revised talent effects and boss pacing. The default keys and eleven-encounter order remain. See [the current mechanics implementation](docs/MECHANICS_IMPLEMENTATION.md) and [all 150 implemented talents](docs/IMPLEMENTED_TALENTS.md).

## Implemented

| Area | Result |
| --- | --- |
| Screen behavior | One modal controller, nested focus restoration, Tab containment, Escape handling, input clearing on transitions and focus loss. Solo pauses; co-op continues with explicit messaging. |
| Title and loadout | Pixel logo and animated food scene, prominent Solo/Co-op, six hero cards, animated preview, four ability descriptions, actual armor tradeoffs. Development tools have an explicit entry. |
| Arena and HUD | Full-width stage, 640×360 world buffer, nearest-neighbor scaling and letterboxing, shared viewport aiming transform, stable health/party/ability elements, Build drawer, starter coaching. |
| Art | Original transparent PNG sheets for six heroes and all food bosses; matching portraits, icons, floor tiles, projectiles, hazards, training dummy, and Sushi segments. Frame grids and anchors have metadata. |
| Feedback | Cosmetic hit flashes, brief shake, particles, chiptone cues, unavailable-action feedback, hostile warnings with countdown fill and active boundaries. Friendly fields use teal dots and brackets; hostile fields use crosses and stripes. |
| Talents and rewards | Post-run permanent hub, four support slots and one keystone, all 150 gameplay handlers. Temporary relics require selection and Confirm with the existing accidental-click guard. |
| Results and retry | Normal death/wipe settles Marks once. Boss clears offer relics and Continue; final results show duration/boss count/build. Practice retains checkpoint retries. Solo journals can recover after reload. |
| Co-op | Four-player lobby, Advanced server URL, ready/spectate states, host-owned routes/objectives/damage, talent receipts and support metadata. Normal wipes end runs; Practice uses sequenced host-only retry. |
| Settings | Saved effects/music volume, mute, fullscreen, reduced motion, and screen shake. Synthesized arcade music and effects require no external audio files. |

## Responsibility map

| File | Responsibility |
| --- | --- |
| src/arcade-core.js | Modal controller, input policy, viewport transform, presentation events, bounded frame diagnostics. |
| src/arcade-ui.js | Persistent DOM HUD, loadout, results, settings, and button bindings. |
| src/arcade-game.js | Adapter to the existing simulation, encounter checkpoints, retry/continue flow, UI view model. |
| src/arcade-art.js | Pixel assets, anchors, animation, environment patterns, geometry-based telegraphs. |
| src/arcade-audio.js | Gesture-unlocked Web Audio effects, music, and saved preferences. |
| src/arcade-network.js | Sequenced host retry validation and event envelope. |
| src/rogue-*.js | Permanent profiles/builds, training origins/collision, talent combat events, optional contracts, boss pacing, host protocol adapters, and pixel effects. |
| src/game.js | Original encounter controllers, hazards, local movement, and host simulation, adapted by the arcade/rogue modules. |
| server.js | Existing room/protocol handling, projectile deduplication, party-wipe retry validation. |
| scripts/generate-pixel-art.js | Reproducible authored pixel PNGs and metadata. |

## Automated validation

Run npm run check. The harness executes all shipped client scripts rather than copies of their implementation. The actual server tests use a temporary server on port 4187 and close it afterward.

- Menu input gating, held-input clearing, Escape, and nested keyboard focus restoration.
- Actual projectile damage and server deduplication, including piercing and stale encounter events.
- Deliberate reward confirmation, delayed-click protection, stale callback rejection, and rollback on retry.
- Practice full-health retries and normal-run retry rejection; idempotent permanent settlement and reload recovery.
- All six classes' attacks and abilities, and update/render smoke coverage across every encounter and gauntlet.
- Six complete solo progression fixtures, one per class, through all eleven encounters, temporary relics, revised Shake/Donut phases, and final settlement. These fixtures use controlled damage to verify transitions.
- Four client simulations exchanging their actual messages through readiness, reward waiting, spectating, wipe/retry, intermission, and the next encounter.
- Actual server two/four-player readiness, four-player limit, host-only retry, new-run sequence reset, and host departure.
- Stable HUD markup across repeated renders and changing health.
- Viewport aiming at 960×640, 1280×720, 1440×900, and 1920×1080, plus fractional/high-density mapping fixtures.
- PNG dimensions, alpha encoding, animation metadata, and registered asset paths.
- Existing saved gear, URL parameters, stored server configuration, and Electron's configuration/updater bridge.
- Advanced connection changes, malformed/unreachable server feedback, retrying a failed connection, and stale socket messages.

## Manual validation and release limits

The local browser pass checks title, loadout, starter/HUD, talents, rewards, Build, settings, instructions, pause, results, death, and co-op controls at the four target window sizes. The checked menus retain accessible actions, and combat has no page scrolling or clipped ability slots. Browser console errors and frame diagnostics are checked during encounter testing.

The pixel pass's historical browser evidence remains in docs/arcade-validation.json. The mechanics pass adds 15 client regression groups, 150 baseline-versus-upgraded talent probes, and seven real-server groups alongside the existing 16 arcade groups and projectile check. Current browser evidence and performance limits are documented in [the mechanics validation](docs/MECHANICS_IMPLEMENTATION.md).

These automated checks exercise mechanics and transitions; they do not establish that every fight feels fair. Human playtesting is still needed for boss readability, difficulty, sound balance, and four-player visual density. Release checks should also cover real network latency, separate machines, physical high-DPI monitors, and a packaged Windows Electron build. The in-app browser may not support operating-system fullscreen; use a normal PC browser or Electron to validate fullscreen on the target machine.

Further extraction from src/game.js should be incremental. Several old render helpers and source assets remain for editor compatibility; the normal play path uses the pixel library. More bespoke boss animation and effect frames can be added without changing hit geometry or networking authority.
