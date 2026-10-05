# Condiment Trio → Special Sauce

Ketchup, Mustard and Mayo form phase one. Each bottle leaves a colored pool and broken cap at its defeat position. When all three are down, the encounter stays in the arena and runs a 7.2-second protected transition:

1. Bottles collapse into trembling pools.
2. Three pixel ribbons flow from their actual remains into a rotating, three-color vortex.
3. The pool contracts and the marbled abomination rises from it.
4. Three embedded heads, broken bottle collars, a toothy central mouth, an outward splatter and an arcade roar announce Special Sauce.

The boss sprite has authored idle, attack, hurt and enraged frames. Its red/yellow/cream veins retain the original ingredients. This uses the existing code-authored pixel asset pipeline; regenerate with `npm run generate:pixel`.

## Gameplay and recovery

There is no starter-room reset, refill, talent point, Mark, clear or relic between phases. Player health, potions, cooldowns, build, once-per-run saves and encounter time carry forward. Combat inputs and damage are gated during the reveal. Solo pause freezes the clock; co-op pause keeps it running. Reduced motion removes bottle shaking, orbit rotation, outward flying splatter and screen shake while retaining the timed reveal.

Special Sauce grants one combined encounter clear under the stable `trio` progression ID, one relic, then advances to Shake. Normal runs contain ten encounters and the completion milestone is depth 10. Existing banked currency is preserved. Historical `sauce` clear IDs merge with `trio`; a previously owned depth-11 milestone moves to depth 10 without another payout.

Solo checkpoints preserve the fusion clock/remains and phase-two health. Recovery resumes the cinematic or second phase rather than replaying a reward. Practice retries restart the three bottles with full resources, including from phase two. The original encounter checkpoint remains the retry boundary.

## Co-op

Two new phases travel through the existing `party-phase` message: `condiment-fusion` and `condiment-abomination`. The host alone advances combat and phase sequences. Snapshots carry the current fusion clock and recover missing phase messages. Duplicated/stale phase events cannot rewind the animation or respawn phase two. Spectators remain defeated through the transition. Host departure banks only previously confirmed clears.

## Validation

`npm run check` includes seven dedicated combined-encounter regression groups, all six full-run progression fixtures, existing mechanics and 150 talent probes, plus the real WebSocket protocol tests. Progression fixtures use controlled damage; they establish behavior rather than human difficulty balance. Live browser recording uses the development UI's Trio → Test Arena → Clear Test flow. Real remote latency and human encounter balance still need playtesting.

The four new reveal layout checks passed at 960×640, 1280×720, 1440×900 and 1920×1080. The live retry restarted all three bottles; the second reveal carried 225/225 health and three potions into phase two. The sampled fusion reported 144 FPS and 0.40 ms p95 frame work, with no browser console errors. The combined results displayed one clear and advanced directly to Shake. [Recorded evidence](condiment-browser-validation.json) distinguishes these development checks from balance and remote-machine testing.

`src/condiment-fusion.js` owns the transition, presentation, host phases and recovery helpers. The existing Sauce combat controller supplies phase two.
