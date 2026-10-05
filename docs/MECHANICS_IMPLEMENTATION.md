# Mechanics and roguelite implementation

The October 4 mechanics redesign is playable through the existing local browser and Windows/Electron entry points. Six classes, eleven boss encounters, stable talent IDs, saved gear, default bindings, and server configuration are retained. Starting balance values have changed where specified by the mechanics redesign; they require human difficulty testing.

## Run loop and permanent builds

Normal death or party wipe ends the run. Each distinct boss clear and completed optional contract earns one Mark. Depths 1, 3, 6, and 11 award two bonus Marks once per profile; final victory adds three. End Run displays the pending bank amount. Currency settles once through the run journal on death, victory, explicit ending, or banking a recovered run.

The post-run hub contains 25 talents per class, organized into three branches, with persistent details, purchase costs, Equip/Unequip, and Refund. Four support slots and one keystone define the active build. Three owned support talents in a class open its keystones. Conditional Bleed/Burn builds reject missing status sources. All 150 nodes have explicit combat handlers; echoes and bonus attacks carry proc flags to prevent recursive damage. [The exported catalogue](IMPLEMENTED_TALENTS.md) documents the shipped effects.

The profile uses `boss-fight.profile.v2` in local storage. Solo checkpoints save health, potions, gear, cooldowns, position, temporary bonuses, boss progress, contract state, and once-per-run saves. Trio bottle health and disabled Pizza stations survive recovery. Recovery rebuilds the encounter rather than restoring an exact live projectile frame. Existing equipment and settings keys remain separate. Device-local progression is not an account/cloud save, and tabs in the same browser profile share storage.

Practice and development modes award no Marks. Practice preserves encounter retries; the server owns the co-op room's Practice setting and rejects normal-run retries regardless of the client's claimed mode.

## Combat and training

- Basics aim at the cursor, launch from shared directional weapon anchors, travel through the correct room, and use swept collision. Misses remain misses. Fixed basic damage removes unexplained roll variation.
- Training has stationary, clustered, and moving targets, incoming practice bolts, self-damage, target reset, and cooldown reset. It uses the encounter damage/status pipeline and reports five-second DPS, last action, direct/DOT/bonus breakdown, and statuses.
- Ground fields show an origin cue and destination marker. Player effects use stepped pixel contours, short bursts, and friendly corners. Hostile warning patterns follow their existing damaging geometry.
- Ability presses near cooldown completion buffer for 120 ms; menus clear the buffer. Mage release movement lock is 80 ms, with slower movement during casting.
- Combat readouts expose active shields, prevented guard damage, basic interval, recovery multiplier, charged basics, once-per-run save state, and keystone counters. Relevant ability slots show next-cast/charge hints.
- Sushi segment, area, and cone hits use the shared pipeline. Body hits preserve Mark, Poison, Fire Blast explosions and Burn; a projectile can hit its body once. Weak-segment interruptions have a three-second limiter and cannot be triggered by a bonus attack.

## Optional contracts and encounter revisions

Every encounter offers a direct boss route. All eleven contracts have short timed objectives, two mirrored objective layouts, low-durability role enemies, explicit attack anticipation/recovery, and no generic wave/warden requirement. Completion grants one Mark and a temporary relic. Timeout or leaving opens the boss route without an award. The pause menu includes Leave Contract.

| Encounter | Shipped contract | Main boss revision |
| --- | --- | --- |
| Cola | Operate three pressure pumps; interrupt workers | Lower opening health, ordered major patterns, shootable pressure bubbles, vent recovery |
| Burger | Carry three ingredients; redirect conveyors | Bait a charge into a grill; committed bite and stagger window |
| Fries | Cross the fryer lanes and open a drain | Alternating firing sweeps and heat vent |
| Trio | Rotate three nozzles to matching vats | Breaking a bottle interrupts the surviving pair |
| Sauce | Attack three valves amid pressure lanes | Interrupt mixer windup to clear a dry island |
| Shake | Carry a battery and power heaters; thawed areas remove ice slowdown | One health bar; breaks at 66% and 33% |
| Nacho | Destroy two armor presses | Shorter invulnerability, quadrant recovery, rear opening |
| Pizza | Deliver a cooling crate; toggle the oven door/conveyor | Attackable topping stations disable their pattern for nine seconds |
| Donut | Collect three stamps; five improve the relic | Three stages, fewer overlapping rings and adds, recovery windows |
| Taco | Intercept thieves and recover their ingredient crates | Readable 50% shell guard and ×2.35 exposed filling |
| Sushi | Place bait and reverse the river current | Shared body damage and weak-segment interruption |

These are functional objective-room implementations. Further authored layout families, richer props/animation, enemy mixture reactions, cache/seasoning variants, and boss-specific route consequences remain content polish rather than additional progression systems. The first pass retains the eleven-boss order and existing full refills between encounters. Shorter six-boss routes and partial healing/potion refills remain the plan's later playtest experiments.

## Co-op

The existing host authority and message types remain. Adapters add sequenced run-end/contract events, host-confirmed talent-hit and DOT receipts, and shared support metadata. Duplicate/stale hits and objective presses cannot apply twice. Normal party wipes settle all players; Practice retries remain host-only. Host departure banks confirmed earnings once and returns the party to the lobby. Shared relic choices wait for every player. Bard auras and Paladin support work on teammates who do not own those talents.

## Validation

Run `npm run check`. It syntax-checks shipped code and executes the actual client scripts in deterministic browser fixtures plus the real WebSocket server:

- Existing projectile regression and 16 arcade regression groups, including six complete progression fixtures through eleven bosses and stable HUD markup.
- 15 mechanics groups covering all contract objective actions, timeout, training travel/misses, settlement/reload/milestones, builds/dependencies, conditional caps and DOT budgets, two/four-client receipts/wipes, support, objective deduplication, and Sushi body behavior.
- All 150 baseline-versus-upgraded talent gameplay probes. These compare casts, collisions, status ticks, defenses, and recovery outputs; they do not merely check registration.
- Seven real-server protocol groups covering readiness, four-player limit, projectile deduplication/piercing, Practice retries, normal retry rejection, host-only events, sequenced settlement, and host departure.

All 64 recorded browser layout checks passed across the six talent trees, title, loadout, training/ability slots, Practice controls, pause, settings, results, room browser, and lobby at 960×640, 1280×720, 1440×900, and 1920×1080. Menus may scroll internally; combat does not scroll. Evidence is recorded in [mechanics-browser-validation.json](mechanics-browser-validation.json). Talent selection retains keyboard focus, and full hover borders fit their buttons. Live attacks visibly travel and update the dummy's resolved damage. Short Pressure Works and Big Cola samples each reported 144 FPS, with 0.30 ms p95 game-frame work; these are scene samples rather than a sustained worst-case benchmark.

Automated progression fixtures use controlled damage and invulnerability to verify transitions; they do not prove every unupgraded class can fairly win a human-played run. Human playtesting remains necessary for difficulty, talent combinations, encounter readability, and four-player visual density. Remote-machine latency, a packaged Windows build, physical high-DPI displays, and OS fullscreen still require target-device verification. Browser frame samples establish performance for the sampled scenes, not worst-case four-player performance.

## Code ownership

`rogue-progress` owns saves and settlement; `rogue-training` owns targets/origins/projectile collision; `rogue-combat` and `rogue-talents` own casts and bounded effects; `rogue-contracts` owns objectives/enemy roles; `rogue-bosses` adapts encounter decisions; `rogue-network` extends host messages; `rogue-relics` owns temporary reward waiting; `rogue-presentation` owns pixel effects; `rogue-game` connects the run loop and hub. The original controllers and arcade screen/input/asset/audio modules remain underneath these adapters. Further extraction should preserve the gameplay regressions.
