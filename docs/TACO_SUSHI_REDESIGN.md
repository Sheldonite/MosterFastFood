# Taco Titan and Sushi Serpent

These bosses now have distinct attack controllers in `src/signature-bosses.js`. Their existing health, damage sources, class interactions, shared health bars, rewards, and the global 50% HP/damage increase remain. Attacks lock their aim during anticipation rather than continually tracking the player.

## Taco Titan: heavy shell brawler

| Attack | Behavior | Player response |
| --- | --- | --- |
| Shellbreaker Ram | A gold lane locks for 1.05 seconds. Taco physically charges to the arena wall over 0.68 seconds. The crash chips 5.5% of its health and exposes its filling for four seconds. | Sidestep after the lane locks, then punish the wall crash. |
| Crunchquake | Taco leaps to the marked landing over 1.15 seconds. Its landing releases an expanding broken shell ring; later phases release two staggered rings. | Leave the landing disc, then use the teal-marked gap in each ring. |
| Loaded Salsa | Three spaced lobs, increasing to four, leave small pools for 3.25 seconds. Pool ticks are limited to once per 0.8 seconds per player. | Bait the landing locations and keep a route between the pools. |

The ingredient-matching interruption inside the boss fight is replaced by these attacks; the optional ingredient-thief contract remains. Shell Guard retains 50% damage reduction and exposed filling retains its ×2.35 multiplier. Recovery is explicit and the guard returns before the next attack.

## Sushi Serpent: flowing movement and precise openings

| Attack | Behavior | Player response |
| --- | --- | --- |
| Wasabi Thread | A curved route locks for 1.2 seconds. The head lunges along it over 0.85 seconds and the roll chain follows. Damage tests the moving head's swept path. | Leave the curved lane and punish the recovery. |
| Chopstick Squeeze | Two long sticks anticipate for 1.15 seconds, then close toward a corridor that stays open. The final phase adds a second perpendicular squeeze after the first has ended. | Stay in the middle passage or move outside the swept bands. |
| Soy Tide | A visible soy front sweeps horizontally or vertically across the arena, leaving a 160-unit passage. The final phase adds a delayed second front with an offset passage. | Follow the clear channel and reposition for the second wave. |

The glowing roll retains its ×2.05 weak-point multiplier. A qualifying hit interrupts the current attack, clears its hazards, and staggers the serpent, with the existing three-second interruption limiter. Ordinary body hits retain their ×0.82 multiplier. The roll sprites replace the old smooth backbone and oversized body glows.

## Presentation and co-op

Gold warnings, coral active boundaries, teal passage/weak-point brackets, and short synthesized cues distinguish the attacks. Path fills are uniform and hazard art clips to the arena. Taco visibly jumps and charges; Sushi's body follows its movement. Reduced motion preserves attack timing and collision geometry. The readable encounter caption describes the current response.

The host chooses targets, paths, phases, and interruptions. Existing hostile snapshots carry the attack sequence, warning timers, movement path, and cancellations. Client timers cannot rewind on frequent snapshots. Damage uses the existing host-mediated projectile pipeline with unique hazard/tick IDs; a hit is deduplicated per player and receives the global damage increase once.

## Verification

`node scripts/test-signature-bosses.js` runs eleven focused groups against the shipped scripts:

- Committed target locks, actual movement, shell crash damage, exposed damage, curved head collision, and warning inactivity.
- Broken ring gaps, salsa tick limits/expiry, chopstick corridors, and soy passage geometry.
- Weak-roll cancellation, phase changes, final-phase combinations, pause/reduced motion, and full-health Practice retry.
- Dedicated rendering excludes the old generic circle fallback and preserves the hazard list.
- Two/four-client host snapshots, cancellation receipts, and mediated damage/deduplication.
- All six classes, normal encounter completion, and Practice's zero-Mark rule.

The full `npm run check` suite also passes, including all 150 talent probes and the real WebSocket protocol tests. Live browser review exercises both attack cycles and their visual presentation. Controls fit without combat scrolling at 960×640, 1280×720, 1440×900, and 1920×1080. Both short live samples report 144 FPS; Taco's measured frame work is 0.25 ms average/0.30 ms p95 and Sushi's is 0.22 ms/0.30 ms. See [recorded browser validation](taco-sushi-browser-validation.json). These are solo scene samples, rather than worst-case multiplayer benchmarks. These checks verify mechanics and integration; difficulty and enjoyment still benefit from human playtesting.
