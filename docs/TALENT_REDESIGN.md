# Complete talent audit and proposed permanent builds

This preserves the original review of all 150 talents, with 25 nodes per class. The audit columns describe the implementation before the mechanics redesign. All 150 IDs now have gameplay handlers and baseline-versus-upgraded regressions. See [the shipped catalogue](IMPLEMENTED_TALENTS.md) for the current player-facing effects, including refinements made during implementation, and [the mechanics implementation](MECHANICS_IMPLEMENTATION.md) for validation limits.

## How to read and activate these talents

Permanently purchase talents after death, victory, or ending a run. Equip four foundation or technique talents plus one keystone before the next run. Purchase costs are 2, 4, and 8 Marks respectively. Purchasing three non-keystones in a class unlocks its keystones; the old compulsory chains do not govern purchasing or active slots. Owned talents persist, and build selection is free between runs.

**A** means equipped base attack damage after armor and bounded stat bonuses, before temporary or conditional multipliers. Direct-ability percentages modify that ability, while `0.5A` is a separate damage amount. All damage numbers, distances in the current logical world coordinates, and durations are draft playtest values. Scaling is applied once. A proc cannot trigger itself, another echo, or kill-based repeats unless its row explicitly allows that interaction.

Every keystone is designed to supply its essential setup. Conditional support effects need an equipped status source or the class baseline ability that supplies it. The loadout must identify those dependencies and prevent an impossible active combination; purchases remain freely available.

Once-per-run saves replace repeatable once-per-encounter safety nets in normal roguelite mode. Practice can reset them with its isolated checkpoint. Shield values use recipient maximum HP, refresh instead of stacking, and apply the strongest overlapping shield. Combined ordinary damage reduction is capped at 70%, attack speed at +50%, movement speed at +25%, and cooldown recovery at +30%; temporarily specified invulnerability is separate. Different healing sources can coexist, but proc healing cannot recursively produce more healing.

## Pre-redesign implementation audit

An ID with no reference after the definition block has no gameplay hook; there is no generic talent-effect interpreter supplying the missing behavior. A referenced ID is labeled Hook present, which does not guarantee correct triggers or useful numbers. The current training dummy bypasses parts of the real damage pipeline, so it is not yet a trustworthy talent test. The mismatch notes below come from inspecting the specific hooks.

| Class | Nodes | No gameplay hook | Referenced by runtime | Proposed keystones |
| --- | ---: | ---: | ---: | ---: |
| Warrior | 25 | 11 | 14 | 3 |
| Ranger | 25 | 11 | 14 | 3 |
| Mage | 25 | 11 | 14 | 3 |
| Rogue | 25 | 11 | 14 | 3 |
| Paladin | 25 | 11 | 14 | 3 |
| Bard | 25 | 11 | 14 | 3 |

There are **66 unimplemented nodes** and **84 referenced nodes**. The redesign proposes three keystones per class, one per branch; existing IDs that contain `cap` do not automatically retain a keystone purchase tier. Rewind Ward and Rescue Verse keep their IDs but receive new effects to remove duplicate roles.

## Warrior

Iron Vanguard turns a timed block into a counterattack. Blood Reaver sets up Bleed and cashes it out. Earthbreaker converts committed enemy movement into reliable area damage.

### Iron Vanguard

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Iron Stomach**<br>`melee_iron_hp` | +25 maximum health. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** +8% maximum HP. A successful Shield Bash block grants a 5%-max-HP shield for 3 seconds, once per cast; shields refresh rather than stack. |
| **Shield Hook**<br>`warrior_vanguard_shield_hook` | Shield Bash pulls small enemies and slightly drags bosses toward you. | No gameplay hook. | **Foundation, 2 Marks.** Shield Bash pulls ordinary enemies up to 70 units toward its impact point. Displacement-immune bosses instead take +25% Bash damage; it never disrupts a scripted boss movement. |
| **Brace And Break**<br>`warrior_vanguard_brace` | Standing still briefly empowers your next Shield Bash into a wider cone. | No gameplay hook. | **Technique, 4 Marks.** After 0.5 seconds without moving, your next Shield Bash gains a 120-degree cone and +35% damage. Store the charge for 2 seconds after moving. |
| **Reinforced Guard**<br>`melee_iron_wall` | Shield Wall lasts longer and blocks more damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Shield Wall lasts 2 seconds longer and reduces incoming damage by 60% instead of its baseline 50%. Show prevented damage in the shield counter. |
| **Deflecting Bite**<br>`melee_iron_heal` | Shield Bash heals when it blocks projectiles. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Shield Bash heals 2% maximum HP per projectile blocked, capped at 8% per cast. Blocking multiple pellets from one attack counts once; no healing from allied effects. |
| **Counterquake**<br>`warrior_vanguard_counterquake` | Blocking or reducing damage charges Groundbreaker. | Hook differs: current projectile-clear burst does not charge Groundbreaker. | **Technique, 4 Marks.** Preventing damage with Shield Wall or blocking a hostile attack grants one Quake charge, at most once per second. Next Groundbreaker consumes up to three: +20% damage each. |
| **Bulwark Echo**<br>`warrior_vanguard_bulwark_echo` | The next ability after Shield Wall repeats at reduced power. | No gameplay hook. | **Technique, 4 Marks.** The first damaging ability within 4 seconds after Shield Wall repeats its damage area after 0.35 seconds at 40% power. The echo has no movement, healing, or proc triggers. |
| **Unmoving Mountain**<br>`melee_iron_last` | Once per fight, survive lethal damage and gain Shield Wall. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Once per run, a lethal hit leaves you at 25% HP and grants Shield Wall plus 1.5 seconds of invulnerability. While Wall is active, your first blocked attack empowers the next basic by 100%. |

### Blood Reaver

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Serrated Opening**<br>`melee_blood_bleed` | Basic attacks apply Bleed. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Basic hits apply one Bleed dealing 0.12A per second for 4 seconds. Reapplication refreshes duration; it does not stack infinitely. Show the remaining Bleed damage. |
| **Red Sweep**<br>`melee_blood_whirl` | Whirlwind Dash applies Bleed to all targets hit. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Whirlwind Dash applies the same 4-second Bleed independently of Serrated Opening. Its finishing slash deals +25% damage to an already bleeding target. |
| **Deep Cuts**<br>`melee_blood_deep` | Bleeds last longer and tick harder. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Your Bleed lasts 6 seconds and deals 0.16A per second. Requires an equipped Bleed source; total tick damage and expiry are visible on the target. |
| **Blood Price**<br>`warrior_blood_price` | Spend a little HP to cast Groundbreaker if its cooldown is almost ready. | No gameplay hook. | **Technique, 4 Marks.** Groundbreaker can be cast with at most 2 seconds of cooldown remaining by paying 6% maximum HP. This cannot kill you or activate below 30% HP; display the cost before casting. |
| **Hemorrhage Pulse**<br>`melee_blood_hemo` | Groundbreaker bursts bleeding targets for bonus damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Groundbreaker consumes up to 3 seconds of remaining Bleed and deals that damage immediately with a 50% bonus. A target without Bleed takes a 2-second starter Bleed instead. |
| **Crimson Trail**<br>`warrior_blood_crimson_trail` | Whirlwind leaves a blood trail that damages bleeding enemies more. | No gameplay hook. | **Technique, 4 Marks.** Whirlwind leaves a 3-second trail dealing 0.12A per second, doubled against bleeding targets. Overlapping trails from the same player do not stack. |
| **Reaver Rhythm**<br>`warrior_blood_reaver_rhythm` | Alternating basic attacks and abilities extends Bleed duration. | No gameplay hook. | **Technique, 4 Marks.** Alternating a basic hit and a damaging ability hit extends your Bleed by 1 second and grants the ability +15% damage. Extension is capped at 6 seconds remaining; duplicates do not count. |
| **Bloodstorm**<br>`warrior_blood_bloodstorm` | Whirlwind consumes long Bleeds for a huge spinning burst. | No gameplay hook. | **Keystone, 8 Marks.** Whirlwind applies Bleed when absent. Against bleeding targets, consume remaining Bleed for 150% of its pending damage, capped at 2A, then emit one 0.5A finishing burst per cast. |

### Earthbreaker

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Wider Quake**<br>`melee_earth_radius` | Groundbreaker radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Groundbreaker radius increases by 25%. Its outer quarter deals +20% damage, rewarding deliberate spacing; draw that edge in the attack preview. |
| **Stonefist**<br>`warrior_earth_stonefist` | Basic attacks after Groundbreaker create tiny aftershocks. | Hook differs: current random basic-hit proc does not require Groundbreaker. | **Foundation, 2 Marks.** After Groundbreaker, your next three basic hits within 5 seconds produce a 48-unit aftershock for 0.25A. Replace the current random trigger with this visible three-charge effect. |
| **Fault Line**<br>`warrior_earth_fault_line` | Groundbreaker travels forward in a short line. | No gameplay hook. | **Technique, 4 Marks.** Groundbreaker also creates a 220-unit forward fissure. Targets outside the central circle take 0.6A from the fissure; a target in both areas receives only the main hit. |
| **Aftershock**<br>`melee_earth_after` | Groundbreaker hits a second time after a short delay. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Groundbreaker repeats after 0.45 seconds at 45% damage. The repeat uses the original position, allowing setup against committed attacks; it cannot generate another repeat. |
| **Shock Bash**<br>`melee_earth_bash` | Shield Bash reaches farther and hits harder. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Shield Bash reach increases by 25% and damage by 30%. Hitting an ordinary enemy near maximum reach staggers it for 0.4 seconds; bosses receive damage without a forced stun. |
| **Rubble Guard**<br>`warrior_earth_rubble_guard` | Groundbreaker creates a brief projectile-blocking rubble ring. | No gameplay hook. | **Technique, 4 Marks.** Groundbreaker creates a 1-second rubble boundary that blocks up to three hostile projectiles. The boundary matches its art; it does not block beams, contact, or allied shots. |
| **Earth Battery**<br>`melee_earth_cap` | Groundbreaker destroys nearby small projectiles. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Rename to Earth Battery: Groundbreaker destroys hostile projectiles inside its impact area. Each distinct hostile attack cleared refunds 0.5 seconds of its cooldown, capped at 2 seconds per cast. |
| **Worldsplitter**<br>`warrior_earth_worldsplitter` | Every third Groundbreaker creates three branching shockwaves. | No gameplay hook. | **Keystone, 8 Marks.** Every third Groundbreaker emits three visible forward shockwaves. Each target can take up to two wave hits for 0.6A each. A persistent counter shows the next empowered cast. |
| **Titan Stance**<br>`warrior_earth_titan_stance` | Groundbreaker radius grows near the boss, but movement speed drops briefly. | No gameplay hook. | **Technique, 4 Marks.** Casting Groundbreaker within 120 units of a boss grants 15% damage reduction for 2 seconds and +20% damage to that cast. Remove the self-slow penalty. |

## Ranger

Deadeye rewards mark timing and spacing. Trapmaster controls crossings and has a real single-boss payoff. Arrow Storm rewards a prepared field and direct hits into it.

### Deadeye

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Long Mark**<br>`ranger_deadeye_mark` | Marked Shot lasts longer and stores more marked hits. | Hook differs: current hook adds mark hits, not the promised duration. | **Foundation, 2 Marks.** Marked Shot lasts 8 seconds and provides six empowered basic hits. A visible six-pip indicator replaces the ambiguous timer-only mark; last-hit interactions use these pips. |
| **Clean Angle**<br>`ranger_deadeye_damage` | Marked basic shots deal more damage. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Marked basic hits gain +20 percentage points to their existing damage bonus. A shot fired after 0.3 seconds of steady aim gains another +15%; moving cancels only the steady-aim charge. |
| **Piercing Mark**<br>`ranger_deadeye_pierce` | Marked Shot pierces and marks the first two targets hit. | No gameplay hook. | **Technique, 4 Marks.** Marked Shot pierces up to two ordinary enemies and marks each. On a single boss its first hit deals +35% damage, so this purchase remains useful in boss-only encounters. |
| **Snap Aim**<br>`ranger_deadeye_tumble` | Tumble Shot empowers your next basic attack. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Tumble loads a Precision arrow for 4 seconds: your next basic deals +60% damage and pierces one ordinary enemy. Show the loaded arrow; firing consumes it once. |
| **Bullseye Refund**<br>`ranger_deadeye_refund` | Consuming the final mark reduces Marked Shot cooldown. | Hook differs: current refund occurs on ordinary marked hits, not just the last pip. | **Technique, 4 Marks.** Consuming the last Mark pip refunds 35% of Marked Shot's base cooldown. Trigger once per mark application, including against bosses; ordinary marked hits do not repeatedly refund it. |
| **Marked Detonation**<br>`ranger_deadeye_detonation` | When the last mark is consumed, the target emits an AoE burst. | Hook differs: current detonation requires marked enemy death, not last-pip consumption. | **Technique, 4 Marks.** The last Mark pip detonates for 0.8A in an 80-unit radius. Marked enemy death also detonates once, using the same application ID so last-hit kills cannot double-trigger. |
| **Perfect Distance**<br>`ranger_deadeye_distance` | Staying in a sweet-spot range charges your next Marked Shot. | No gameplay hook. | **Technique, 4 Marks.** Hitting a marked target from 180 to 320 units grants +25% damage to that basic. Show the effective range in practice and a small ready indicator when aiming at a qualifying target. |
| **Execution Mark**<br>`ranger_deadeye_cap` | Marked targets below 30% HP take escalating damage from consumed marks. | Hook differs: current hook extends mark duration and hits, not low-HP execution scaling. | **Keystone, 8 Marks.** Marked Shot supplies its own six-pip mark. Marked basic hits gain up to +50% damage as target HP falls from 50% to zero; below 20%, the last pip deals an extra 1A. |

### Trapmaster

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Pocket Trap**<br>`ranger_trap_tumble` | Tumble Shot drops a short-lived mini trap. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Tumble drops a 5-second trap at its starting point. It fires three 0.35A arrows at the triggering enemy; bosses can trigger it, and the trap shows its armed radius. |
| **Wide Net**<br>`ranger_trap_size` | Volley Trap trigger radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Arrow Trap trigger radius increases by 40%. Its first arrow deals +30% damage, preserving a useful benefit against a lone boss without making every arrow stronger. |
| **Barbed Springs**<br>`ranger_trap_barbed` | Trap hits briefly slow enemies. | No gameplay hook. | **Technique, 4 Marks.** Trap hits slow ordinary enemies by 35% for 2 seconds. Displacement-immune bosses instead take a 2-second Wounded effect: +15% damage from your basic attacks. |
| **Trap Chain**<br>`ranger_trap_chain` | A triggered trap arms a second smaller trap nearby. | No gameplay hook. | **Technique, 4 Marks.** Arrow Trap gains a second charge. Recharge is sequential and unchanged; only two placed traps from this ability can be active per player. |
| **Barbed Volley**<br>`ranger_trap_damage` | Volley Trap shots hit harder. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Trap arrows deal +30% damage. Every third arrow fired by one trap pierces once; a boss struck by it instead receives a +25% third-arrow bonus. |
| **Tripwire Volley**<br>`ranger_trap_tripwire` | Traps fire toward marked enemies when triggered. | No gameplay hook. | **Technique, 4 Marks.** When a trap triggers, it prioritizes your marked target if one is in its 320-unit firing range. Its first shot also adds one Mark pip, capped at six. |
| **Snare Field**<br>`ranger_trap_snare_field` | Multiple traps close together link into a slowing field. | No gameplay hook. | **Technique, 4 Marks.** Two traps within 220 units form a visible tripwire. A crossing enemy triggers one 0.8A volley and a 1-second ordinary-enemy root; each pair triggers once, bosses take damage without rooting. |
| **Hunting Grounds**<br>`ranger_trap_cap` | Volley Trap fires more shots and refreshes faster. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Traps reload after 1.5 seconds and may trigger three times before expiring. Each trigger fires three 0.4A arrows. Maximum two traps, with distinct per-trigger hit IDs and clear remaining-charge pips. |

### Arrow Storm

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Broad Storm**<br>`ranger_storm_radius` | Arrow Storm radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Arrow Storm radius increases by 25%. Its first pulse slows ordinary enemies by 25% for 1 second; bosses take an additional 0.2A first-pulse hit instead. |
| **Rapid Rain**<br>`ranger_storm_pulses` | Arrow Storm pulses more often. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Arrow Storm pulses 25% faster with the same per-pulse damage. Show its pulse count and duration; this is a direct, predictable improvement rather than a hidden random proc. |
| **Storm Follows**<br>`ranger_storm_follow` | Arrow Storm slowly follows your aimed target. | No gameplay hook. | **Technique, 4 Marks.** Holding the Storm key while its field is active steers it toward the cursor at up to 90 units per second. Release leaves it stationary; steering cannot move it through room boundaries. |
| **Lingering Clouds**<br>`ranger_storm_duration` | Arrow Storm lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Arrow Storm lasts 1.2 seconds longer. This adds actual scheduled pulses; the displayed pulse count updates when equipped. |
| **Rain Marking**<br>`ranger_storm_marking` | Arrow Storm has a chance to apply a weak mark. | No gameplay hook. | **Technique, 4 Marks.** The first Storm pulse applies a 4-second, two-pip weak Mark. Later pulses cannot refresh it. Existing stronger marks retain their duration and gain at most one pip. |
| **Cyclone Step**<br>`ranger_storm_cyclone` | Tumble through Arrow Storm to fire a ring of arrows. | No gameplay hook. | **Technique, 4 Marks.** Tumbling through your Storm emits one six-arrow ring, with at most two 0.3A hits on a target. Once per Storm cast, avoiding repeated dash or echo farming. |
| **Cloudburst**<br>`ranger_storm_cloudburst` | Casting another ability inside Arrow Storm causes an extra pulse. | No gameplay hook. | **Technique, 4 Marks.** Casting Marked Shot or Arrow Trap while inside your Storm produces one extra 0.35A pulse. Limit one pulse per ability cast and two per Storm. |
| **Skyfall Engine**<br>`ranger_storm_cap` | Arrow Storm hits much harder. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Storm ends with a clearly marked 0.8A Skyfall strike. Direct basic hits on a target inside it add 0.2A to that strike, up to five charges; show the stored damage. |
| **Endless Quiver**<br>`ranger_storm_endless_quiver` | During Arrow Storm, every third basic shot fires an extra falling arrow. | No gameplay hook. | **Technique, 4 Marks.** Every third basic hit on a target inside your Storm calls one falling arrow for 0.4A. Keep a visible three-hit counter; falling arrows cannot advance it. |

## Mage

Pyromancer links direct aim, Burn, and detonation. Meteor Savant rewards predicting an impact area. Chronomancer uses field position and delayed attacks rather than another flat damage ladder.

### Pyromancer

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Scorching Blast**<br>`mage_pyro_burn` | Fire Blast applies Burn. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Fire Blast applies a Burn dealing 0.15A per second for 4 seconds. Burns refresh rather than stack; a visible duration and tick preview confirms the effect. |
| **Hotter Blast**<br>`mage_pyro_radius` | Fire Blast explosion radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Fire Blast explosion radius increases by 25%. Direct projectile impact deals an extra 0.3A, rewarding accurate aim even against a single target. |
| **Kindling Rune**<br>`mage_pyro_kindling` | Blink leaves a fire rune that detonates. | No gameplay hook. | **Technique, 4 Marks.** Blink leaves a 3-second fire rune at its starting point. First contact applies a 4-second Burn and deals 0.4A; a target triggers the rune only once. |
| **Combustion**<br>`mage_pyro_damage` | Fire Blast deals more damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Fire Blast deals +25% direct damage. Against a burning target, it also consumes up to 2 seconds of pending Burn for immediate damage without an extra multiplier. |
| **Molten Splash**<br>`mage_pyro_molten_splash` | Burning enemies hit by Meteor leave small lava puddles. | No gameplay hook. | **Technique, 4 Marks.** A Meteor hitting a burning target creates a 2-second lava patch for 0.1A per second. Limit one patch per second and one active damage patch per target per player. |
| **Chain Ignite**<br>`mage_pyro_chain_ignite` | Killing a burning enemy spreads Burn nearby. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** A burning enemy's death spreads its remaining Burn to two enemies within 150 units. With no recipient, the death instead refunds 1 second of Fire Blast cooldown, at most once per second. |
| **Flame Debt**<br>`mage_pyro_flame_debt` | Casting Fire Blast near-ready spends HP to fire instantly. | No gameplay hook. | **Technique, 4 Marks.** Fire Blast may be cast with at most 2 seconds remaining by paying 5% maximum HP. Disabled below 30% HP, cannot kill, and displays the health cost before accepting the cast. |
| **Inferno Core**<br>`mage_pyro_cap` | Fire Blast becomes a huge, high-damage explosion. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Fire Blast applies Burn itself. Every third cast creates an Inferno explosion for +75% direct damage and a 3-second 0.2A-per-second fire field; show the three-cast counter. |

### Meteor Savant

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Wide Field**<br>`mage_meteor_radius` | Meteor Field radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Meteor Field radius increases by 25%. Display every impact location before it lands; the larger area improves coverage without concealing which impacts will connect. |
| **Falling Stars**<br>`mage_meteor_speed` | Meteor Field impacts more often. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Meteors arrive 25% faster. The total scheduled impact count stays fixed; this compresses the burst window rather than silently adding unlimited damage. |
| **Molten Sky**<br>`mage_meteor_duration` | Meteor Field lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Meteor Field schedules two additional impacts over 1.2 extra seconds. The preview shows both the new total and duration, including when combined with Falling Stars. |
| **Gravity Well**<br>`mage_meteor_gravity` | Meteor Field gently pulls small enemies inward. | No gameplay hook. | **Technique, 4 Marks.** The field pulls ordinary enemies toward its center at 45 units per second. Immovable bosses hit in the inner half instead take +15% Meteor damage. |
| **Impact Echo**<br>`mage_meteor_impact_echo` | Every third meteor repeats as a smaller impact. | No gameplay hook. | **Technique, 4 Marks.** Every third scheduled meteor repeats its impact after 0.35 seconds at 40% damage. Repeats do not advance meteor counters or spawn another echo. |
| **Star Brand**<br>`mage_meteor_star_brand` | Meteor hits brand targets; Fire Blast detonates brands. | No gameplay hook. | **Technique, 4 Marks.** Meteor hits apply one Star Brand for 5 seconds. Fire Blast consumes it for an extra 0.8A; maximum one brand per target and one detonation per Blast. |
| **Meteor Armor**<br>`mage_meteor_armor` | Standing in Meteor Field grants brief damage reduction. | No gameplay hook. | **Technique, 4 Marks.** While inside your Meteor Field, take 20% less damage. The protection persists for 0.75 seconds after leaving so dodging is not immediately punished. |
| **Cataclysm**<br>`mage_meteor_cap` | Meteor impacts are larger and hit harder. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Meteor Field finishes with one visibly targeted meteor for 1.5A. Each distinct target hit during the field adds 0.15A, capped at 0.6A; single bosses retain the full base payoff. |
| **Orbiting Star**<br>`mage_meteor_orbiting_star` | A mini meteor orbits you and crashes into your next Fire Blast target. | No gameplay hook. | **Technique, 4 Marks.** After casting Fire Blast, store one orbiting star for 5 seconds. Your next direct basic hit releases it for 0.5A. Only one star can be stored; it does not trigger Brand or echoes. |

### Chronomancer

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Wide Warp**<br>`mage_chrono_radius` | Time Warp radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Time Warp radius increases by 25%. Entering it grants a 1-second, 5%-max-HP shield, once per Warp cast; the larger field is useful for self and teammates. |
| **Long Warp**<br>`mage_chrono_duration` | Time Warp lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Time Warp lasts 1.5 seconds longer. Show remaining field time and its actual slowdown effect; overlapping Warps use the strongest effect rather than multiply it. |
| **Echo Blink**<br>`mage_chrono_blink` | Blink Rune is larger and stronger. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Blink gains 20% range and leaves a 2-second return marker. Press Blink again during that window to return once without a second cooldown reset or new marker. |
| **Frozen Second**<br>`mage_chrono_frozen_second` | Enemies hit inside Time Warp briefly freeze after enough hits. | No gameplay hook. | **Technique, 4 Marks.** Three direct hits within your Warp freeze an ordinary enemy for 0.6 seconds. Bosses instead receive a delayed 0.6A rupture; once per target per Warp, with visible hit pips. |
| **Borrowed Time**<br>`mage_chrono_borrowed_time` | Casting inside Time Warp reduces your longest cooldown. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** A damaging ability cast while inside Warp reduces the other two offensive cooldowns by 0.8 seconds. Once per cast, at most 2.4 seconds per cooldown per Warp; cannot refund itself. |
| **Delayed Blast**<br>`mage_chrono_delayed_blast` | Fire Blast inside Time Warp detonates again after a delay. | No gameplay hook. | **Technique, 4 Marks.** Fire Blast exploding inside Warp leaves a visible timer and repeats at 40% direct damage after 0.8 seconds. The repeat cannot Burn, consume Brand, or generate another echo. |
| **Rewind Ward**<br>`mage_chrono_rewind_ward` | Taking lethal damage inside Time Warp rewinds you once per fight. | No gameplay hook; duplicates the lethal-save role of Time Loop. | **Technique, 4 Marks.** Repurpose the duplicate lethal-save concept: entering your Warp grants a 10%-max-HP ward for 3 seconds. Unused ward refunds 1 second of Blink cooldown when it expires, once per Warp. |
| **Time Loop**<br>`mage_chrono_cap` | Once per fight, lethal damage rewinds into a heal. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Once per run, lethal damage returns you to your position 2 seconds earlier with 30% HP and 1 second of invulnerability. Each Warp also stores your first basic to repeat once at 50% damage. |

## Rogue

Venomancer builds and spends visible Poison stacks. Shadow Duelist rewards rear approaches and Exposed setup. Smoke Trickster creates short attack and escape windows with explicit limits.

### Venomancer

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Toxic Edge**<br>`rogue_venom_stacks` | Poison can stack higher. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Maximum Poison stacks increase from five to seven. Show stack count and per-second damage; reaching seven requires direct poison applications, not recursively generated procs. |
| **Vile Dose**<br>`rogue_venom_damage` | Poison ticks harder. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Poison tick damage increases by 25%. Use the same declared attack-damage scaling on enemies and bosses; remove any unrelated flat tick value that becomes negligible later. |
| **Spreading Cloud**<br>`rogue_venom_cloud` | Poison Cloud is larger and lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Poison Cloud radius increases by 25% and duration by 1 second. Cloud ticks add at most one stack per target per second; display its footprint and remaining pulses. |
| **Volatile Toxin**<br>`rogue_venom_volatile` | Poisoned enemies explode on death. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** A poisoned enemy's death releases a 0.6A toxin burst and two Poison stacks within 90 units. A poisoned boss crossing each 25%-HP threshold releases the same burst once. |
| **Contaminated Smoke**<br>`rogue_smoke_poison` | Smoke Bomb poisons enemies inside it. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Smoke applies one Poison stack per second to enemies inside it. A target must be inside the actual field; Smoke from an echo does not create a second stacking source. |
| **Toxin Bloom**<br>`rogue_venom_bloom` | Max poison stacks spread poison to nearby targets. | No gameplay hook. | **Technique, 4 Marks.** Reaching maximum Poison stacks spreads two stacks to two nearby targets. With no neighbor, deal 0.5A to the original target instead. Per-target 3-second cooldown; refreshed max stacks do not spam it. |
| **Venom Bank**<br>`rogue_venom_bank` | Poison damage charges your next Backstab. | No gameplay hook. | **Technique, 4 Marks.** Applying three direct Poison stacks stores one Venom charge, up to three. Backstab consumes them for +20% damage each; show charges beside its icon and exclude proc-generated stacks. |
| **Venom Nova**<br>`rogue_venom_cap` | Max poison stacks burst for bonus damage. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** At maximum stacks, the next Backstab detonates pending Poison for up to 1.5A and leaves two stacks. Applies its own three Poison stacks on an unpoisoned target, so the engine works independently. |
| **Plague Artist**<br>`rogue_venom_plague_artist` | Poison Cloud follows your last poisoned boss for a few seconds. | No gameplay hook. | **Technique, 4 Marks.** Poison Cloud follows the last directly poisoned boss at 70 units per second, with a fixed 4-second duration. It never teleports or follows across a phase transition. |

### Shadow Duelist

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Dirty Knife**<br>`rogue_shadow_backstab` | Backstab hits harder. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Backstab deals +25% damage. Hitting from the rear grants one Exposed stack and a clearly labeled rear-hit flash; rear direction is defined by the target's committed facing. |
| **Deep Expose**<br>`rogue_shadow_exposed` | Exposed stacks last longer. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Exposed lasts 2 seconds longer. Your first basic after Backstab deals +30% damage against an Exposed target; the ready indicator expires after 3 seconds. |
| **Long Shadow**<br>`rogue_shadow_step` | Shadow Step keeps Backstab ready longer. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Shadowstep grants 20% more travel distance and empowers the next Backstab within 3 seconds for +30% damage. It does not redirect unexpectedly to a hidden target. |
| **Ambush Echo**<br>`rogue_shadow_ambush_echo` | Shadow Step creates an echo slash behind the target. | No gameplay hook. | **Technique, 4 Marks.** Shadowstep leaves a delayed stab along its endpoint aim after 0.25 seconds for 0.6A. The preview shows its short cone; the stab cannot trigger another echo or refund. |
| **Expose Bleed**<br>`rogue_shadow_expose_bleed` | Backstab applies Bleed when hitting an exposed target. | No gameplay hook. | **Technique, 4 Marks.** Backstab against an Exposed target applies a 4-second wound dealing 0.15A per second. This is one refreshing wound, not a new unlimited damage stack. |
| **Death Mark**<br>`rogue_shadow_death_mark` | Exposed targets take bonus damage from Poison ticks. | No gameplay hook. | **Technique, 4 Marks.** An Exposed target with at least three Poison stacks takes +20% Backstab damage. Backstab itself applies one Poison stack when equipped, providing a usable setup without a separate Poison talent. |
| **Knife Dance**<br>`rogue_shadow_knife_dance` | Killing an enemy with Backstab resets part of Shadow Step. | No gameplay hook. | **Technique, 4 Marks.** A Backstab kill refunds 50% of Shadowstep's cooldown. A rear Backstab on a boss refunds 20% instead, once per Backstab cast; both outcomes cannot trigger from one hit. |
| **Deathblow**<br>`rogue_shadow_cap` | Empowered Backstab consumes Exposed for bonus damage. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Backstab applies one Exposed stack if none is present. Otherwise consume up to three stacks for +30% damage each; a rear hit refunds 30% of Backstab's cooldown once per cast. |

### Smoke Trickster

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Heavy Smoke**<br>`rogue_smoke_size` | Smoke Bomb radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Smoke radius increases by 25%. On entering your Smoke, your next basic within 2 seconds gains +25% damage, once per field cast. |
| **Lingering Cover**<br>`rogue_smoke_duration` | Smoke Bomb lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Smoke lasts 1.5 seconds longer. Its protection persists for 0.5 seconds after leaving, allowing an intentional escape without a sharp protection cliff. |
| **Black Powder**<br>`rogue_smoke_cap` | Smoke Bomb clears small projectiles when dropped. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Black Powder clears ordinary hostile projectiles inside Smoke when cast. Each distinct attack cleared gives 0.5 seconds of Shadowstep cooldown recovery, capped at 2 seconds; beams remain visible and unaffected. |
| **Smoke Step**<br>`rogue_smoke_step` | Dashing through Smoke Bomb grants brief invisibility. | No gameplay hook. | **Technique, 4 Marks.** Shadowstep from inside Smoke grants 0.75 seconds of untargetability against newly aimed ordinary attacks. Existing hazards still damage you; a visible silhouette and icon communicate the exact state. |
| **Noxious Cover**<br>`rogue_smoke_noxious_cover` | Poison Cloud cast inside Smoke Bomb deals extra poison ticks. | No gameplay hook. | **Technique, 4 Marks.** Directly poisoning an enemy inside your Smoke deals a bonus 0.2A, at most once per target per second. Poison ticks and field-generated stacks cannot trigger this bonus. |
| **Blind Spot**<br>`rogue_smoke_blind_spot` | Enemies inside Smoke Bomb take bonus Backstab damage from any direction. | No gameplay hook. | **Technique, 4 Marks.** Backstab against a target inside your Smoke receives its rear-hit bonus from any angle. The target, not just the player, must be within the visible field. |
| **Vanishing Act**<br>`rogue_smoke_vanishing_act` | Taking heavy damage drops a mini Smoke Bomb. | Hook differs: current low-HP damage response grants brief invulnerability, not a dropped Smoke. | **Technique, 4 Marks.** A single hit costing at least 20% maximum HP drops a 2-second mini Smoke at your position. Twenty-second cooldown, clear ready icon; replace the unexplained repeated low-HP invulnerability. |
| **Blackout**<br>`rogue_smoke_blackout` | Smoke Bomb becomes a dark zone that slows hazards and empowers Rogue attacks inside. | No gameplay hook. | **Keystone, 8 Marks.** Smoke lasts 1 second longer and slows ordinary hostile projectiles inside it by 40%. Your first three basics fired from that field gain +35% damage; beams and ground hazards are unaffected. |

## Paladin

Consecrated Ground offers a mobile zone build. Guardian converts prevented damage into offense while protecting a party or solo player. Judgment builds and consumes a visible mark.

### Consecrated Ground

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Wider Light**<br>`paladin_consecrate_size` | Consecration radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Consecration radius increases by 25%. Its first pulse grants allies a 5%-max-HP shield for 2 seconds; the shield uses the recipient's HP and refreshes instead of stacking. |
| **Lasting Prayer**<br>`paladin_consecrate_duration` | Consecration lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Consecration lasts 1.5 seconds longer. Scheduled damage and support pulses are displayed, including the added pulses, rather than extending only the visual effect. |
| **Holy Burn**<br>`paladin_consecrate_damage` | Consecration deals more damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Consecration deals +25% pulse damage and applies a 2-second Holy Burn totaling 0.2A. Holy Burns refresh; multiple Paladins do not multiply the same owner's stacks. |
| **Sacred Footing**<br>`paladin_consecrate_footing` | Standing in Consecration reduces knockback and slow. | No gameplay hook. | **Technique, 4 Marks.** Inside Consecration, slow strength and knockback distance are reduced by 60%. Protection persists 0.75 seconds after leaving; this does not suppress mandatory boss arena movement. |
| **Radiant Edge**<br>`paladin_consecrate_edge` | Basic attacks inside Consecration release small holy arcs. | No gameplay hook. | **Technique, 4 Marks.** Basic hits while inside Consecration emit a short holy cleave for 0.25A, once per basic. A target can receive the main hit and one cleave; the cleave does not chain procs. |
| **Divine Domain**<br>`paladin_consecrate_cap` | Abilities recover faster while you stand in Consecration. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Divine Domain grants 15% faster ability cooldown recovery inside your Consecration. Multiple fields use the strongest bonus, capped with other recovery bonuses; show the actual recovery multiplier. |
| **Hallowed Echo**<br>`paladin_consecrate_echo` | Radiant Smite inside Consecration pulses twice. | No gameplay hook. | **Technique, 4 Marks.** Radiant Smite cast inside Consecration repeats at 40% damage after 0.35 seconds. The repeat cannot repeat again, heal, reapply Judgment, or advance third-cast counters. |
| **Cathedral Field**<br>`paladin_consecrate_cathedral` | Consecration grows while you remain inside it, then detonates when you leave. | No gameplay hook. | **Keystone, 8 Marks.** Consecration grows by 30% over its first 2 seconds. Leaving grants an 8%-max-HP shield for 3 seconds once per ally per cast; field expiry emits a single 1A holy burst. |
| **Sunlit March**<br>`paladin_consecrate_sunlit_march` | Aegis Step drags a strip of Consecration behind you. | No gameplay hook. | **Technique, 4 Marks.** Aegis Dash leaves a 3-second holy strip dealing 0.12A per second and granting allies 10% movement speed. Overlapping strips from one player do not stack. |

### Guardian

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Mercy Ward**<br>`paladin_guard_heal` | Divine Bulwark heals more. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Bulwark activation heals you and nearby allies for 6% of each recipient's maximum HP. Once per cast; healing echoes and overheal do not recursively trigger support talents. |
| **Blessed Plate**<br>`paladin_guard_mitigation` | Shield Wall and Bulwark reduce more damage. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Bulwark reduces incoming damage by 60% instead of 50%. Prevented damage is recorded visibly for Vow Of Return, but immunity does not generate prevented-damage credit. |
| **Projectile Ward**<br>`paladin_guard_projectiles` | Divine Bulwark clears nearby projectiles. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Aegis Dash clears ordinary projectiles within its visible shield path. Clearing at least one distinct hostile attack grants an 8%-max-HP shield for 3 seconds, once per dash. |
| **Vow Of Return**<br>`paladin_guard_vow` | Damage absorbed by Bulwark empowers your next Radiant Smite. | Hook differs: current damage response extends protection rather than empowering Smite from prevented damage. | **Technique, 4 Marks.** Damage prevented by Bulwark empowers your next Smite within 5 seconds: add 50% of prevented damage, capped at 1A. Taking unrelated damage does not generate this bonus. |
| **Aegis Anchor**<br>`paladin_guard_anchor` | Aegis Step grants a shield when ending near the boss. | Hook differs: current projectile-clear healing does not check a near-boss dash endpoint. | **Technique, 4 Marks.** Ending Aegis Dash within 140 units of a boss grants a 10%-max-HP shield for 3 seconds. Show the endpoint preview; this replaces the current projectile-clear healing mismatch. |
| **Shared Bulwark**<br>`paladin_guard_shared` | Divine Bulwark also shields nearby allies. | No gameplay hook. | **Technique, 4 Marks.** Bulwark grants nearby allies a 10%-max-HP shield for 3 seconds. In solo, your shield becomes 15%; choose the strongest active shield rather than stacking several copies. |
| **Martyr Spark**<br>`paladin_guard_martyr` | Taking damage while shielded emits holy pulses. | No gameplay hook. | **Technique, 4 Marks.** The first hostile hit that breaks your shield emits a 0.8A holy pulse. Once per shield application, with a 2-second cooldown; shield expiry and allied damage cannot trigger it. |
| **Unfallen**<br>`paladin_guard_cap` | Once per fight, survive lethal damage and gain Bulwark. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Once per run, lethal damage restores 25% HP and grants Bulwark plus 1.5 seconds of invulnerability. Each Bulwark also grants allies a 5%-max-HP shield on activation. |

### Judgment

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Sharp Judgment**<br>`paladin_judgment_damage` | Radiant Smite hits harder. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Radiant Smite deals +25% direct damage. A clear impact flash and damage breakdown distinguish the improvement from Holy Burn and other secondary effects. |
| **Wide Verdict**<br>`paladin_judgment_radius` | Radiant Smite radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Smite radius increases by 25%. A target at the exact center takes an extra 0.25A once, rewarding precision without multiplying every splash hit. |
| **Marked Guilty**<br>`paladin_judgment_mark` | Radiant Smite marks enemies to take more damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Smite applies Judgment for 5 seconds: the target takes +15% damage from your direct attacks. Other players see the mark, but it does not stack into a party-wide exponential multiplier. |
| **Chain Verdict**<br>`paladin_judgment_chain` | Radiant Smite chains to another nearby enemy. | No gameplay hook. | **Technique, 4 Marks.** Smite chains once to a nearby enemy for 60% damage. With no second enemy within 160 units, the main target instead takes +25% Smite damage; the chain cannot chain again. |
| **Trial By Fire**<br>`paladin_judgment_trial` | Holy Burned enemies hit by Smite burst. | No gameplay hook. | **Technique, 4 Marks.** Smite consumes up to 2 seconds of Holy Burn for double its pending damage. Against an unburning target it applies a 2-second starter Holy Burn, making the interaction self-contained. |
| **Judgment Day**<br>`paladin_judgment_day` | Every third Radiant Smite is larger and leaves a holy zone. | No gameplay hook. | **Technique, 4 Marks.** Every third direct Smite leaves a 3-second holy zone dealing 0.15A per second. Show the three-cast counter; echoes do not advance it and overlapping zones from one player do not stack. |
| **Final Appeal**<br>`paladin_judgment_appeal` | Smite heals you if it hits a judged target. | No gameplay hook. | **Technique, 4 Marks.** Smite on a judged target heals you for 5% maximum HP, at most once per cast. In co-op it also heals the lowest-health nearby ally for 3%; no heal from immune hits. |
| **Final Judgment**<br>`paladin_judgment_cap` | Radiant Smite bursts marked enemies for bonus damage. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Smite applies Judgment if absent. Against an already judged target, consume it for +60% direct damage and reduce Smite cooldown by 20%, once per cast; no mark or refund from an echo. |

## Bard

Power Chord offers a viable solo damage build. Battle Hymn improves rhythmic attacking and ability use with party-safe caps. Healing Verse adds protection, cleansing, and deliberate recovery without immortal heal loops.

### Power Chord

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Louder Chord**<br>`bard_chord_damage` | Power Chord deals more base damage. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Power Chord deals +25% direct damage. The impact displays its direct damage separately from song scaling so the purchased improvement is easy to confirm. |
| **Harmonic Strike**<br>`bard_chord_harmonic` | Power Chord gains more damage per active song. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Power Chord gains an additional +10% base damage per distinct active song, capped at three. Multiple copies of one song count once; show active song pips. |
| **Resonant Finale**<br>`bard_chord_extend` | Power Chord hits extend active songs slightly. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** A direct Power Chord hit extends your active songs by 0.75 seconds, once per cast. Maximum 2.25 seconds added to each song application, avoiding permanent-song loops. |
| **Bass Cleave**<br>`bard_chord_bass_cleave` | Power Chord becomes a wider wave. | No gameplay hook. | **Technique, 4 Marks.** Power Chord becomes a 120-degree wave with 20% more reach. A target receives one hit per cast; the broader shape is shared by the visual and collision paths. |
| **Dissonance**<br>`bard_chord_dissonance` | Power Chord weakens enemy damage briefly. | No gameplay hook. | **Technique, 4 Marks.** Power Chord reduces a target's outgoing ordinary attack damage by 15% for 3 seconds. Multiple Bards refresh the strongest debuff; scripted percentage-HP mechanics are not altered. |
| **Echo Note**<br>`bard_chord_echo` | Every second Power Chord repeats at reduced damage. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Every second direct Power Chord repeats after 0.3 seconds at 40% damage. The echo cannot extend songs, advance the counter, heal, or create another echo. |
| **Shatter Chord**<br>`bard_chord_shatter` | Power Chord deals bonus damage to marked, poisoned, burning, or bleeding targets. | No gameplay hook. | **Technique, 4 Marks.** Power Chord gains +15% damage per distinct Mark, Poison, Burn, Bleed, or Judgment status on the target, capped at +45%. Repeated stacks of one status count once. |
| **Grand Finale**<br>`bard_chord_cap` | Power Chord gains a large bonus when all three songs are active. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** With three distinct songs active, Power Chord deals +60% damage and produces a 0.5A finishing pulse. Each direct cast can produce one pulse; display Grand Finale readiness before casting. |
| **Encore Blast**<br>`bard_chord_encore_blast` | Defeating an enemy with Power Chord casts a free weaker Power Chord. | No gameplay hook. | **Technique, 4 Marks.** A direct Chord kill creates one 50%-damage Chord toward the nearest hostile target. On a lone boss, every third direct Chord creates it instead; one extra Chord per cast, no recursion. |

### Battle Hymn

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Brave Tempo**<br>`bard_hymn_damage` | Battle Hymn grants a stronger damage buff. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Battle Hymn's damage bonus increases by 10 percentage points. Use the strongest matching aura, never multiply several Bards' copies; show the exact resulting bonus to each recipient. |
| **Fast Rhythm**<br>`bard_hymn_speed` | Battle Hymn grants more attack speed. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Battle Hymn grants an additional 15% attack speed. Combined attack-speed bonuses are capped at +50%; the character sheet displays the actual basic attack interval. |
| **Wide Chorus**<br>`bard_hymn_radius` | Battle Hymn radius is larger. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Battle Hymn and Quickstep radius increase by 30%. Leaving either retains its benefit for 1 second, once refreshed on re-entry; show the grace-period icon. |
| **Marching Beat**<br>`bard_hymn_marching` | Allies inside Battle Hymn gain movement speed. | No gameplay hook. | **Technique, 4 Marks.** Battle Hymn grants 12% movement speed to its recipients. Use the strongest matching aura and cap combined movement bonuses at +25%; the Bard receives the benefit in solo. |
| **War Anthem**<br>`bard_hymn_war` | Power Chord gains bonus damage while Battle Hymn is active. | No gameplay hook. | **Technique, 4 Marks.** A Power Chord cast from inside your Hymn gains +25% direct damage. The cast-origin position decides eligibility, and the ready icon appears before releasing it. |
| **Haste Verse**<br>`bard_hymn_haste` | Ability cooldowns tick faster inside Battle Hymn. | Hook differs: current ability-cast refund does not accelerate cooldown ticking in the field. | **Technique, 4 Marks.** Battle Hymn grants recipients 15% faster ability cooldown recovery while inside. Replace the current on-cast refund behavior; strongest aura only, combined recovery capped at +30%. |
| **Rallying Echo**<br>`bard_hymn_rally` | Battle Hymn pulses damage whenever an ally uses an ability. | No gameplay hook. | **Technique, 4 Marks.** A recipient casting a damaging ability inside your Hymn emits one 0.2A pulse from the Bard. Shared 0.75-second pulse cooldown per Bard; solo casts qualify and proc abilities do not. |
| **Anthem Of Chaos**<br>`bard_hymn_cap` | Battle Hymn lasts longer and gives Power Chord extra scaling. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Battle Hymn lasts 2 seconds longer. After three direct basic hits while benefiting from it, release one 0.5A chord pulse; the counter is yours, not multiplied by party size. |

### Healing Verse

| Talent and stable ID | Current promise | Current implementation | Proposed effect and purchase tier |
| --- | --- | --- | --- |
| **Warm Notes**<br>`bard_heal_power` | Healing Ballad heals more. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Healing Ballad heals 25% more. Any overheal creates a shield up to 5% of the recipient's maximum HP for 2 seconds; repeated ticks refresh, not stack, the shield. |
| **Lingering Melody**<br>`bard_heal_duration` | Healing Ballad lasts longer. | Hook present; validate its actual baseline and upgraded action. | **Foundation, 2 Marks.** Healing Ballad lasts 1.5 seconds longer and schedules its corresponding extra healing pulses. Display total self-healing and ally-healing separately in practice. |
| **Shared Breath**<br>`bard_heal_armor` | Healing Ballad also grants minor armor. | Hook present; validate its actual baseline and upgraded action. | **Technique, 4 Marks.** Healing Ballad recipients take 12% less ordinary damage while inside, retaining protection for 0.5 seconds after leaving. Replace the small opaque flat-armor bonus; strongest matching effect only. |
| **Cleansing Note**<br>`bard_heal_cleanse` | Healing Ballad removes one negative effect. | No gameplay hook. | **Technique, 4 Marks.** Ballad activation removes one slow, Poison, or Burn from each recipient, in that priority order. It cannot erase a boss's required objective marker; show the cleansed status name. |
| **Gentle Reprise**<br>`bard_heal_reprise` | Leaving Healing Ballad grants a small delayed heal. | No gameplay hook. | **Technique, 4 Marks.** Leaving Ballad grants a heal of 4% maximum HP after 1 second, once per recipient per song application. Repeated boundary crossing cannot produce extra heals. |
| **Rescue Verse**<br>`bard_heal_rescue` | Dropping low HP auto-plays a short Healing Ballad once per fight. | No gameplay hook; duplicates the automatic-ballad role of Encore Recovery. | **Technique, 4 Marks.** Repurpose the duplicate automatic-ballad concept: Ballad's first pulse on a recipient below 35% HP heals an extra 8% maximum HP. Once per recipient per song application. |
| **Sanctuary Song**<br>`bard_heal_sanctuary` | Projectiles passing through Healing Ballad slow down. | No gameplay hook. | **Technique, 4 Marks.** Ordinary hostile projectiles travel 30% slower inside Ballad. Their damage and lifetime remain unchanged; beams, contact attacks, and ground hazards are explicitly unaffected. |
| **Encore Recovery**<br>`bard_heal_cap` | Once per fight at low HP, automatically play a short Healing Ballad. | Hook present; validate its actual baseline and upgraded action. | **Keystone, 8 Marks.** Once per run, crossing below 25% HP automatically plays a 3-second emergency Ballad and grants a 10%-max-HP shield. Ordinary Ballad activations also grant a 3%-max-HP first-pulse shield. |

## Example active builds

Each example uses four support talents and one keystone. These are target experiences for playtesting, not proven optimal builds.

| Class and build | Four support talents | Keystone | Intended sequence |
| --- | --- | --- | --- |
| Warrior counter tank | Iron Stomach, Reinforced Guard, Counterquake, Bulwark Echo | Unmoving Mountain | Block a committed attack, build Quake charges, then counter with an echoed Groundbreaker. |
| Ranger execution archer | Long Mark, Snap Aim, Bullseye Refund, Marked Detonation | Execution Mark | Apply Mark, Tumble into a loaded shot, spend the last pip for a burst and a predictable cooldown refund. |
| Mage delayed burst | Echo Blink, Frozen Second, Borrowed Time, Delayed Blast | Time Loop | Place Warp, cast into a committed target, escape or return with Blink, then land the delayed hit. |
| Rogue toxin finisher | Toxic Edge, Vile Dose, Venom Bank, Long Shadow | Venom Nova | Build Poison and Venom charges, reposition, then Backstab to cash out a visible setup. |
| Paladin judgment | Sharp Judgment, Marked Guilty, Chain Verdict, Final Appeal | Final Judgment | Mark, use basic attacks during the opening, then consume Judgment with Smite and recover health. |
| Bard solo finale | Harmonic Strike, Resonant Finale, Echo Note, War Anthem | Grand Finale | Maintain three song types, land direct Chords to extend a limited window, then deliver a distinct finishing pulse. |

## Tests required before exposing a purchase

For each node, compare an actual baseline action against its upgraded action and assert the numerical change or state transition described above. Test its failed trigger, cap, expiry, and interaction with its keystone. A learned-set or menu-click assertion alone is insufficient.

Exercise ordinary enemies, a single boss, a displacement-immune boss, multi-target encounters, solo support builds, and a four-player party. Check that warnings, origins, hit geometry, status pips, and combat breakdowns agree. Repeat inputs or network messages cannot award another proc, mark pip, save, or settlement.

Every node needs a reachable setup, a useful boss case, a readable result, and an accurate tooltip. Do not ship a node that merely exists in the tree. Use the saved [proposal data](talent-redesign.json) as the ID coverage checklist while implementing class batches.
