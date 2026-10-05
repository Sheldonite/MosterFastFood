# Implemented permanent talents

All 150 stable talent IDs have gameplay handlers and a baseline-versus-upgraded regression. Values are the starting balance, subject to playtesting. Buy between runs; equip four support talents and one keystone. Costs are 2 / 4 / 8 Marks. Three owned support talents in a class unlock its keystones.

A means equipped base attack damage before conditional multipliers. Bonus attacks cannot recursively trigger another bonus attack.

## Warrior

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Iron Stomach | Iron Vanguard | foundation / 2 | +8% maximum HP. A successful Shield Bash block grants a 5%-max-HP shield for 3 seconds, once per cast; shields refresh rather than stack. |
| Shield Hook | Iron Vanguard | foundation / 2 | Shield Bash pulls ordinary enemies up to 70 units toward you. Displacement-immune bosses instead take +25% Bash damage; it never disrupts a scripted boss movement. |
| Brace And Break | Iron Vanguard | technique / 4 | After 0.5 seconds without moving, your next Shield Bash gains a 120-degree cone and +35% damage. Store the charge for 2 seconds after moving. |
| Reinforced Guard | Iron Vanguard | technique / 4 | Shield Wall lasts 2 seconds longer and reduces incoming damage by 60% instead of its baseline 50%. |
| Deflecting Bite | Iron Vanguard | technique / 4 | Shield Bash heals 2% maximum HP per projectile blocked, capped at 8% per cast. Blocking multiple pellets from one attack counts once; no healing from allied effects. |
| Counterquake | Iron Vanguard | technique / 4 | Preventing damage with Shield Wall or blocking a hostile attack grants one Quake charge, at most once per second. Next Groundbreaker consumes up to three: +20% damage each. |
| Bulwark Echo | Iron Vanguard | technique / 4 | The first damaging ability within 4 seconds after Shield Wall repeats its damage area after 0.35 seconds at 40% power. The echo has no movement, healing, or proc triggers. |
| Unmoving Mountain | Iron Vanguard | keystone / 8 | Once per run, a lethal hit leaves you at 25% HP and grants Shield Wall plus 1.5 seconds of invulnerability. While Wall is active, your first blocked attack empowers the next basic by 100%. |
| Serrated Opening | Blood Reaver | foundation / 2 | Basic hits apply one Bleed dealing 0.12A per second for 4 seconds. Reapplication refreshes duration; it does not stack infinitely. |
| Red Sweep | Blood Reaver | foundation / 2 | Whirlwind Dash applies the same 4-second Bleed independently of Serrated Opening. Its finishing slash deals +25% damage to an already bleeding target. |
| Deep Cuts | Blood Reaver | technique / 4 | Your Bleed lasts 6 seconds and deals 0.16A per second. Requires an equipped Bleed source; total tick damage and expiry are visible on the target. |
| Blood Price | Blood Reaver | technique / 4 | Groundbreaker can be cast with at most 2 seconds of cooldown remaining by paying 6% maximum HP. This cannot kill you or activate below 30% HP. |
| Hemorrhage Pulse | Blood Reaver | technique / 4 | Groundbreaker consumes up to 3 seconds of remaining Bleed and deals that damage immediately with a 50% bonus. A target without Bleed takes a 2-second starter Bleed instead. |
| Crimson Trail | Blood Reaver | technique / 4 | Whirlwind leaves a 3-second trail dealing 0.12A per second, doubled against bleeding targets. Overlapping trails from the same player do not stack. |
| Reaver Rhythm | Blood Reaver | technique / 4 | Alternating a basic hit and a damaging ability hit extends your Bleed by 1 second and grants the ability +15% damage. Extension is capped at 6 seconds remaining; duplicates do not count. |
| Bloodstorm | Blood Reaver | keystone / 8 | Whirlwind applies Bleed when absent. Against bleeding targets, consume remaining Bleed for 150% of its pending damage, capped at 2A, then emit one 0.5A finishing burst per cast. |
| Wider Quake | Earthbreaker | foundation / 2 | Groundbreaker radius increases by 25%. Its outer quarter deals +20% damage, rewarding deliberate spacing. |
| Stonefist | Earthbreaker | foundation / 2 | After Groundbreaker, your next three basic hits within 5 seconds produce a 48-unit aftershock for 0.25A. |
| Fault Line | Earthbreaker | technique / 4 | Groundbreaker also creates a 220-unit forward fissure. Targets outside the central circle take 0.6A from the fissure; a target in both areas receives only the main hit. |
| Aftershock | Earthbreaker | technique / 4 | Groundbreaker repeats after 0.45 seconds at 45% damage. The repeat uses the original position, allowing setup against committed attacks; it cannot generate another repeat. |
| Shock Bash | Earthbreaker | technique / 4 | Shield Bash reach increases by 25% and damage by 30%. Hitting an ordinary enemy near maximum reach staggers it for 0.4 seconds; bosses receive damage without a forced stun. |
| Rubble Guard | Earthbreaker | technique / 4 | Groundbreaker creates a 1-second rubble boundary that blocks up to three hostile projectiles. The boundary matches its art; it does not block beams, contact, or allied shots. |
| Earth Battery | Earthbreaker | technique / 4 | Groundbreaker destroys hostile projectiles inside its impact area. Each distinct hostile attack cleared refunds 0.5 seconds of its cooldown, capped at 2 seconds per cast. |
| Worldsplitter | Earthbreaker | keystone / 8 | Every third Groundbreaker emits three visible forward shockwaves. Each target can take up to two wave hits for 0.6A each. A persistent counter shows the next empowered cast. |
| Titan Stance | Earthbreaker | technique / 4 | Casting Groundbreaker within 120 units of a boss grants 15% damage reduction for 2 seconds and +20% damage to that cast. Remove the self-slow penalty. |

## Ranger

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Long Mark | Deadeye | foundation / 2 | Marked Shot lasts 8 seconds and provides six empowered basic hits. A visible six-pip indicator replaces the ambiguous timer-only mark; last-hit interactions use these pips. |
| Clean Angle | Deadeye | foundation / 2 | Marked basic hits gain +20 percentage points to their existing damage bonus. A shot fired after 0.3 seconds of steady aim gains another +15%; moving cancels only the steady-aim charge. |
| Piercing Mark | Deadeye | technique / 4 | Marked Shot pierces up to two ordinary enemies and marks each. On a single boss its first hit deals +35% damage, so this purchase remains useful in boss-only encounters. |
| Snap Aim | Deadeye | technique / 4 | Tumble loads a Precision arrow for 4 seconds. Your next basic hit deals +60% damage and the arrow pierces one enemy. The damage charge is consumed by that first hit. |
| Bullseye Refund | Deadeye | technique / 4 | Consuming the last Mark pip refunds 35% of Marked Shot's base cooldown. Trigger once per mark application, including against bosses; ordinary marked hits do not repeatedly refund it. |
| Marked Detonation | Deadeye | technique / 4 | The last Mark pip detonates for 0.8A in an 80-unit radius. Marked enemy death also detonates once, using the same application ID so last-hit kills cannot double-trigger. |
| Perfect Distance | Deadeye | technique / 4 | Hitting a marked target from 180 to 320 units grants +25% damage to that basic. |
| Execution Mark | Deadeye | keystone / 8 | Marked Shot supplies its own six-pip mark. Marked basic hits gain up to +50% damage as target HP falls from 50% to zero; below 20%, the last pip deals an extra 1A. |
| Pocket Trap | Trapmaster | foundation / 2 | Tumble drops a 5-second trap at its starting point. It fires three 0.35A arrows at the triggering enemy; bosses can trigger it, and the trap shows its armed radius. |
| Wide Net | Trapmaster | foundation / 2 | Arrow Trap trigger radius increases by 40%. Its first arrow deals +30% damage, preserving a useful benefit against a lone boss without making every arrow stronger. |
| Barbed Springs | Trapmaster | technique / 4 | Trap hits slow ordinary enemies by 35% for 2 seconds. Displacement-immune bosses instead take a 2-second Wounded effect: +15% damage from your basic attacks. |
| Trap Chain | Trapmaster | technique / 4 | Arrow Trap gains a second charge. Recharge is sequential and unchanged; only two placed traps from this ability can be active per player. |
| Barbed Volley | Trapmaster | technique / 4 | Trap arrows deal +30% damage. Every third arrow fired by one trap pierces once; a boss struck by it instead receives a +25% third-arrow bonus. |
| Tripwire Volley | Trapmaster | technique / 4 | When a trap triggers, it prioritizes your marked target if one is in its 320-unit firing range. Its first shot also adds one Mark pip, capped at six. |
| Snare Field | Trapmaster | technique / 4 | Two traps within 220 units form a visible tripwire. A crossing enemy triggers one 0.8A volley and a 1-second ordinary-enemy root; each pair triggers once, bosses take damage without rooting. |
| Hunting Grounds | Trapmaster | keystone / 8 | Traps reload after 1.5 seconds and may trigger three times before expiring. Each trigger fires three 0.4A arrows. Maximum two traps, with distinct per-trigger hit IDs and clear remaining-charge pips. |
| Broad Storm | Arrow Storm | foundation / 2 | Arrow Storm radius increases by 25%. Its first pulse slows ordinary enemies by 25% for 1 second; bosses take an additional 0.2A first-pulse hit instead. |
| Rapid Rain | Arrow Storm | foundation / 2 | Arrow Storm pulses 25% faster with the same per-pulse damage. |
| Storm Follows | Arrow Storm | technique / 4 | Holding the Storm key while its field is active steers it toward the cursor at up to 90 units per second. Release leaves it stationary; steering cannot move it through room boundaries. |
| Lingering Clouds | Arrow Storm | technique / 4 | Arrow Storm lasts 1.2 seconds longer. This adds actual scheduled pulses; the displayed pulse count updates when equipped. |
| Rain Marking | Arrow Storm | technique / 4 | The first Storm pulse applies a 4-second, two-pip weak Mark. Later pulses cannot refresh it. Existing stronger marks retain their duration and gain at most one pip. |
| Cyclone Step | Arrow Storm | technique / 4 | Tumbling from inside your Storm emits a 90-unit ring pulse for 0.6A. Once per Storm cast; bonus attacks cannot produce another pulse. |
| Cloudburst | Arrow Storm | technique / 4 | Casting Marked Shot or Arrow Trap while inside your Storm produces one extra 0.35A pulse. Limit one pulse per ability cast and two per Storm. |
| Skyfall Engine | Arrow Storm | keystone / 8 | Storm ends with a clearly marked 0.8A Skyfall strike. Direct basic hits on a target inside it add 0.2A to that strike, up to five charges. |
| Endless Quiver | Arrow Storm | technique / 4 | Every third basic hit on a target inside your Storm calls one falling arrow for 0.4A. |

## Mage

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Scorching Blast | Pyromancer | foundation / 2 | Fire Blast applies a Burn dealing 0.15A per second for 4 seconds. Burns refresh rather than stack; a visible duration and tick preview confirms the effect. |
| Hotter Blast | Pyromancer | foundation / 2 | Fire Blast explosion radius increases by 25%. Direct projectile impact deals an extra 0.3A, rewarding accurate aim even against a single target. |
| Kindling Rune | Pyromancer | technique / 4 | Blink leaves a 3-second fire rune at its starting point. First contact applies a 4-second Burn and deals 0.4A; a target triggers the rune only once. |
| Combustion | Pyromancer | technique / 4 | Fire Blast deals +25% direct damage. Against a burning target, it also consumes up to 2 seconds of pending Burn for immediate damage without an extra multiplier. |
| Molten Splash | Pyromancer | technique / 4 | A Meteor hitting a burning target creates a 2-second lava patch for 0.1A per second. Limit one patch per second and one active damage patch per target per player. |
| Chain Ignite | Pyromancer | technique / 4 | A burning enemy's death spreads its remaining Burn to two enemies within 150 units. With no recipient, the death instead refunds 1 second of Fire Blast cooldown, at most once per second. |
| Flame Debt | Pyromancer | technique / 4 | Fire Blast may be cast with at most 2 seconds remaining by paying 5% maximum HP. Disabled below 30% HP, cannot kill, and displays the health cost before accepting the cast. |
| Inferno Core | Pyromancer | keystone / 8 | Fire Blast applies Burn itself. Every third cast creates an Inferno explosion for +75% direct damage and a 3-second 0.2A-per-second fire field. |
| Wide Field | Meteor Savant | foundation / 2 | Meteor Field radius increases by 25%. |
| Falling Stars | Meteor Savant | foundation / 2 | Meteors arrive 25% faster. The total scheduled impact count stays fixed; this compresses the burst window rather than silently adding unlimited damage. |
| Molten Sky | Meteor Savant | technique / 4 | Meteor Field schedules two additional impacts over 1.2 extra seconds. The preview shows both the new total and duration, including when combined with Falling Stars. |
| Gravity Well | Meteor Savant | technique / 4 | The field pulls ordinary enemies toward its center at 45 units per second. Immovable bosses hit in the inner half instead take +15% Meteor damage. |
| Impact Echo | Meteor Savant | technique / 4 | Every third scheduled meteor repeats its impact after 0.35 seconds at 40% damage. Repeats do not advance meteor counters or spawn another echo. |
| Star Brand | Meteor Savant | technique / 4 | Meteor hits apply one Star Brand for 5 seconds. Fire Blast consumes it for an extra 0.8A; maximum one brand per target and one detonation per Blast. |
| Meteor Armor | Meteor Savant | technique / 4 | While inside your Meteor Field, take 20% less damage. The protection persists for 0.75 seconds after leaving so dodging is not immediately punished. |
| Cataclysm | Meteor Savant | keystone / 8 | Meteor Field finishes with one visibly targeted meteor for 1.5A. Each distinct target hit during the field adds 0.15A, capped at 0.6A; single bosses retain the full base payoff. |
| Orbiting Star | Meteor Savant | technique / 4 | After casting Fire Blast, store one orbiting star for 5 seconds. Your next direct basic hit releases it for 0.5A. Only one star can be stored; it does not trigger Brand or echoes. |
| Wide Warp | Chronomancer | foundation / 2 | Time Warp radius increases by 25%. Entering it grants a 1-second, 5%-max-HP shield, once per Warp cast; the larger field is useful for self and teammates. |
| Long Warp | Chronomancer | foundation / 2 | Time Warp lasts 1.5 seconds longer. |
| Echo Blink | Chronomancer | technique / 4 | Blink gains 20% range and leaves a 2-second return marker. Press Blink again during that window to return once without a second cooldown reset or new marker. |
| Frozen Second | Chronomancer | technique / 4 | Three direct hits within your Warp freeze an ordinary enemy for 0.6 seconds. Bosses instead receive a delayed 0.6A rupture; once per target per Warp, with visible hit pips. |
| Borrowed Time | Chronomancer | technique / 4 | Casting Fire Blast or Meteor Field inside Warp refunds 0.8 seconds of the other offensive ability. At most 2.4 seconds per cooldown per Warp; cannot refund itself. |
| Delayed Blast | Chronomancer | technique / 4 | Fire Blast exploding inside Warp leaves a visible timer and repeats at 40% direct damage after 0.8 seconds. The repeat cannot Burn, consume Brand, or generate another echo. |
| Rewind Ward | Chronomancer | technique / 4 | Entering your Warp grants a 10%-max-HP ward for 3 seconds. Unused ward refunds 1 second of Blink cooldown when it expires, once per Warp. |
| Time Loop | Chronomancer | keystone / 8 | Once per run, lethal damage returns you to your position 2 seconds earlier with 30% HP and 1 second of invulnerability. Each Warp also stores your first basic to repeat once at 50% damage. |

## Rogue

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Toxic Edge | Venomancer | foundation / 2 | Maximum Poison stacks increase from five to seven. |
| Vile Dose | Venomancer | foundation / 2 | Poison tick damage increases by 25%. Use the same declared attack-damage scaling on enemies and bosses; remove any unrelated flat tick value that becomes negligible later. |
| Spreading Cloud | Venomancer | technique / 4 | Poison Cloud radius increases by 25% and duration by 1 second. Cloud ticks add at most one stack per target per second. |
| Volatile Toxin | Venomancer | technique / 4 | A poisoned enemy's death releases a 0.6A toxin burst and two Poison stacks within 90 units. A poisoned boss crossing each 25%-HP threshold releases the same burst once. |
| Contaminated Smoke | Venomancer | technique / 4 | Smoke applies one Poison stack per second to enemies inside it. A target must be inside the actual field; Smoke from an echo does not create a second stacking source. |
| Toxin Bloom | Venomancer | technique / 4 | Reaching maximum Poison stacks spreads two stacks to two nearby targets. With no neighbor, deal 0.5A to the original target instead. Per-target 3-second cooldown; refreshed max stacks do not spam it. |
| Venom Bank | Venomancer | technique / 4 | Applying three direct Poison stacks stores one Venom charge, up to three. Backstab consumes them for +20% damage each. |
| Venom Nova | Venomancer | keystone / 8 | At maximum stacks, the next Backstab detonates pending Poison for up to 1.5A and leaves two stacks. Applies its own three Poison stacks on an unpoisoned target, so the engine works independently. |
| Plague Artist | Venomancer | technique / 4 | Poison Cloud follows the last directly poisoned boss at 70 units per second, with a fixed 4-second duration. It never teleports or follows across a phase transition. |
| Dirty Knife | Shadow Duelist | foundation / 2 | Backstab deals +25% damage. Hitting from the rear grants one Exposed stack and a clearly labeled rear-hit flash; rear direction is defined by the target's committed facing. |
| Deep Expose | Shadow Duelist | foundation / 2 | Exposed lasts 2 seconds longer. Your first basic after Backstab deals +30% damage against an Exposed target; the ready indicator expires after 3 seconds. |
| Long Shadow | Shadow Duelist | technique / 4 | Shadowstep grants 20% more travel distance and empowers the next Backstab within 3 seconds for +30% damage. It does not redirect unexpectedly to a hidden target. |
| Ambush Echo | Shadow Duelist | technique / 4 | Shadowstep leaves a delayed 70-unit burst at its endpoint after 0.25 seconds for 0.6A. The burst cannot trigger another echo or refund. |
| Expose Bleed | Shadow Duelist | technique / 4 | Backstab against an Exposed target applies a 4-second wound dealing 0.15A per second. This is one refreshing wound, not a new unlimited damage stack. |
| Death Mark | Shadow Duelist | technique / 4 | An Exposed target with at least three Poison stacks takes +20% Backstab damage. Backstab itself applies one Poison stack when equipped, providing a usable setup without a separate Poison talent. |
| Knife Dance | Shadow Duelist | technique / 4 | A Backstab kill refunds 50% of Shadowstep's cooldown. A rear Backstab on a boss refunds 20% instead, once per Backstab cast; both outcomes cannot trigger from one hit. |
| Deathblow | Shadow Duelist | keystone / 8 | Backstab applies one Exposed stack if none is present. Otherwise consume up to three stacks for +30% damage each; a rear hit refunds 30% of Backstab's cooldown once per cast. |
| Heavy Smoke | Smoke Trickster | foundation / 2 | Smoke radius increases by 25%. On entering your Smoke, your next basic within 2 seconds gains +25% damage, once per field cast. |
| Lingering Cover | Smoke Trickster | foundation / 2 | Smoke lasts 1.5 seconds longer. Its protection persists for 0.5 seconds after leaving, allowing an intentional escape without a sharp protection cliff. |
| Black Powder | Smoke Trickster | technique / 4 | Black Powder clears ordinary hostile projectiles inside Smoke when cast. Each distinct attack cleared gives 0.5 seconds of Shadowstep cooldown recovery, capped at 2 seconds; beams remain visible and unaffected. |
| Smoke Step | Smoke Trickster | technique / 4 | Shadowstep from inside Smoke grants 0.75 seconds of untargetability against newly aimed ordinary attacks. Existing hazards still damage you; a visible silhouette and icon communicate the exact state. |
| Noxious Cover | Smoke Trickster | technique / 4 | Directly poisoning an enemy inside your Smoke deals a bonus 0.2A, at most once per target per second. Poison ticks and field-generated stacks cannot trigger this bonus. |
| Blind Spot | Smoke Trickster | technique / 4 | Backstab against a target inside your Smoke receives its rear-hit bonus from any angle. The target, not just the player, must be within the visible field. |
| Vanishing Act | Smoke Trickster | technique / 4 | A single hit costing at least 20% maximum HP drops a 2-second mini Smoke at your position. Twenty-second cooldown. |
| Blackout | Smoke Trickster | keystone / 8 | Smoke lasts 1 second longer and slows ordinary hostile projectiles inside it by 60% instead of 50%. Your first three basics fired from that field gain +35% damage; beams and ground hazards are unaffected. |

## Paladin

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Wider Light | Consecrated Ground | foundation / 2 | Consecration radius increases by 25%. Its first pulse grants allies a 5%-max-HP shield for 2 seconds; the shield uses the recipient's HP and refreshes instead of stacking. |
| Lasting Prayer | Consecrated Ground | foundation / 2 | Consecration lasts 1.5 seconds longer. Scheduled damage and support pulses are displayed, including the added pulses, rather than extending only the visual effect. |
| Holy Burn | Consecrated Ground | technique / 4 | Consecration deals +25% pulse damage and applies a 2-second Holy Burn totaling 0.2A. Holy Burns refresh; multiple Paladins do not multiply the same owner's stacks. |
| Sacred Footing | Consecrated Ground | technique / 4 | Inside Consecration, slow strength and knockback distance are reduced by 60%. Protection persists 0.75 seconds after leaving; this does not suppress mandatory boss arena movement. |
| Radiant Edge | Consecrated Ground | technique / 4 | Basic hits while inside Consecration emit a short holy cleave for 0.25A, once per basic. A target can receive the main hit and one cleave; the cleave does not chain procs. |
| Divine Domain | Consecrated Ground | technique / 4 | Divine Domain grants 15% faster ability cooldown recovery inside your Consecration. Multiple fields use the strongest bonus, capped with other recovery bonuses. |
| Hallowed Echo | Consecrated Ground | technique / 4 | Radiant Smite cast inside Consecration repeats at 40% damage after 0.35 seconds. The repeat cannot repeat again, heal, reapply Judgment, or advance third-cast counters. |
| Cathedral Field | Consecrated Ground | keystone / 8 | Consecration grows by 30% over its first 2 seconds. Leaving grants an 8%-max-HP shield for 3 seconds once per ally per cast; field expiry emits a single 1A holy burst. |
| Sunlit March | Consecrated Ground | technique / 4 | Aegis Dash leaves a 3-second holy strip dealing 0.12A per second and granting allies 10% movement speed. Overlapping strips from one player do not stack. |
| Mercy Ward | Guardian | foundation / 2 | Bulwark activation heals you and nearby allies for 6% of each recipient's maximum HP. Once per cast; healing echoes and overheal do not recursively trigger support talents. |
| Blessed Plate | Guardian | foundation / 2 | Bulwark reduces incoming damage by 60% instead of 50%. Prevented damage is recorded visibly for Vow Of Return, but immunity does not generate prevented-damage credit. |
| Projectile Ward | Guardian | technique / 4 | Aegis Dash clears ordinary projectiles within its visible shield path. Clearing at least one distinct hostile attack grants an 8%-max-HP shield for 3 seconds, once per dash. |
| Vow Of Return | Guardian | technique / 4 | Damage prevented by Bulwark empowers your next Smite within 5 seconds: add 50% of prevented damage, capped at 1A. Taking unrelated damage does not generate this bonus. |
| Aegis Anchor | Guardian | technique / 4 | Ending Aegis Dash within 140 units of a boss grants a 10%-max-HP shield for 3 seconds. |
| Shared Bulwark | Guardian | technique / 4 | Bulwark grants nearby allies a 10%-max-HP shield for 3 seconds. In solo, your shield becomes 15%; choose the strongest active shield rather than stacking several copies. |
| Martyr Spark | Guardian | technique / 4 | The first hostile hit that breaks your shield emits a 0.8A holy pulse. Once per shield application, with a 2-second cooldown; shield expiry and allied damage cannot trigger it. |
| Unfallen | Guardian | keystone / 8 | Once per run, lethal damage restores 25% HP and grants Bulwark plus 1.5 seconds of invulnerability. Each Bulwark also grants allies a 5%-max-HP shield on activation. |
| Sharp Judgment | Judgment | foundation / 2 | Radiant Smite deals +25% direct damage. A clear impact flash and damage breakdown distinguish the improvement from Holy Burn and other secondary effects. |
| Wide Verdict | Judgment | foundation / 2 | Smite radius increases by 25%. A target at the exact center takes an extra 0.25A once, rewarding precision without multiplying every splash hit. |
| Marked Guilty | Judgment | technique / 4 | Smite applies Judgment for 5 seconds: the target takes +15% damage from your direct attacks. Other players see the mark, but it does not stack into a party-wide exponential multiplier. |
| Chain Verdict | Judgment | technique / 4 | Smite chains once to a nearby enemy for 60% damage. With no second enemy within 160 units, the main target instead takes +25% Smite damage; the chain cannot chain again. |
| Trial By Fire | Judgment | technique / 4 | Smite consumes up to 2 seconds of Holy Burn for double its pending damage. Against an unburning target it applies a 2-second starter Holy Burn, making the interaction self-contained. |
| Judgment Day | Judgment | technique / 4 | Every third direct Smite leaves a 3-second holy zone dealing 0.15A per second. |
| Final Appeal | Judgment | technique / 4 | Smite on a judged target heals you for 5% maximum HP, at most once per cast. In co-op it also heals the lowest-health nearby ally for 3%; no heal from immune hits. |
| Final Judgment | Judgment | keystone / 8 | Smite applies Judgment if absent. Against an already judged target, consume it for +60% direct damage and reduce Smite cooldown by 20%, once per cast; no mark or refund from an echo. |

## Bard

| Talent | Branch | Tier / Marks | Implemented effect |
| --- | --- | --- | --- |
| Louder Chord | Power Chord | foundation / 2 | Power Chord deals +25% direct damage. The impact displays its direct damage separately from song scaling so the purchased improvement is easy to confirm. |
| Harmonic Strike | Power Chord | foundation / 2 | Power Chord gains an additional +10% base damage per distinct active song, capped at three. Multiple copies of one song count once. |
| Resonant Finale | Power Chord | technique / 4 | A direct Power Chord hit extends your active songs by 0.75 seconds, once per cast. Maximum 2.25 seconds added to each song application, avoiding permanent-song loops. |
| Bass Cleave | Power Chord | technique / 4 | Power Chord becomes a 120-degree wave with 20% more reach. A target receives one hit per cast; the broader shape is shared by the visual and collision paths. |
| Dissonance | Power Chord | technique / 4 | Power Chord reduces a target's outgoing ordinary attack damage by 15% for 3 seconds. Multiple Bards refresh the strongest debuff; scripted percentage-HP mechanics are not altered. |
| Echo Note | Power Chord | technique / 4 | Every second direct Power Chord repeats after 0.3 seconds at 40% damage. The echo cannot extend songs, advance the counter, heal, or create another echo. |
| Shatter Chord | Power Chord | technique / 4 | Power Chord gains +15% damage per distinct Mark, Poison, Burn, Bleed, or Judgment status on the target, capped at +45%. Repeated stacks of one status count once. |
| Grand Finale | Power Chord | keystone / 8 | With three distinct songs active, Power Chord deals +60% damage and produces a 0.5A finishing pulse. Each direct cast can produce one pulse. |
| Encore Blast | Power Chord | technique / 4 | A direct Chord kill creates one 50%-damage Chord toward the nearest hostile target. On a lone boss, every third direct Chord creates it instead; one extra Chord per cast, no recursion. |
| Brave Tempo | Battle Hymn | foundation / 2 | Battle Hymn's damage bonus increases by 10 percentage points. Use the strongest matching aura, never multiply several Bards' copies. |
| Fast Rhythm | Battle Hymn | foundation / 2 | Battle Hymn grants an additional 15% attack speed. Combined attack-speed bonuses are capped at +50%; the character sheet displays the actual basic attack interval. |
| Wide Chorus | Battle Hymn | technique / 4 | Battle Hymn and Quickstep radius increase by 30%. Leaving either retains its benefit for 1 second, once refreshed on re-entry. |
| Marching Beat | Battle Hymn | technique / 4 | Battle Hymn grants 12% movement speed to its recipients. Use the strongest matching aura and cap combined movement bonuses at +25%; the Bard receives the benefit in solo. |
| War Anthem | Battle Hymn | technique / 4 | A Power Chord cast from inside your Hymn gains +25% direct damage. The cast-origin position decides eligibility, and the ready icon appears before releasing it. |
| Haste Verse | Battle Hymn | technique / 4 | Battle Hymn grants recipients 15% faster ability cooldown recovery while inside. Use the strongest aura; combined recovery is capped at +30%. |
| Rallying Echo | Battle Hymn | technique / 4 | A recipient casting a damaging ability inside your Hymn emits one 0.2A pulse around the caster. Shared 0.75-second pulse cooldown per Bard; solo casts qualify and bonus attacks do not. |
| Anthem Of Chaos | Battle Hymn | keystone / 8 | Battle Hymn lasts 2 seconds longer. After three direct basic hits while benefiting from it, release one 0.5A chord pulse; the counter is yours, not multiplied by party size. |
| Warm Notes | Healing Verse | foundation / 2 | Healing Ballad heals 25% more. Any overheal creates a shield up to 5% of the recipient's maximum HP for 2 seconds; repeated ticks refresh, not stack, the shield. |
| Lingering Melody | Healing Verse | foundation / 2 | Healing Ballad lasts 1.5 seconds longer and schedules its corresponding extra healing pulses. |
| Shared Breath | Healing Verse | technique / 4 | Healing Ballad recipients take 12% less ordinary damage while inside, retaining protection for 0.5 seconds after leaving. Use the strongest matching effect. |
| Cleansing Note | Healing Verse | technique / 4 | Ballad activation clears one movement debuff from each recipient: pickle slow, chill, then grease, in that priority order. Required boss objective markers remain. |
| Gentle Reprise | Healing Verse | technique / 4 | Leaving Ballad grants a heal of 4% maximum HP after 1 second, once per recipient per song application. Repeated boundary crossing cannot produce extra heals. |
| Rescue Verse | Healing Verse | technique / 4 | Ballad's first pulse on a recipient below 35% HP heals an extra 8% maximum HP. Once per recipient per song application. |
| Sanctuary Song | Healing Verse | technique / 4 | Ordinary hostile projectiles travel 30% slower inside Ballad. Their damage and lifetime remain unchanged; beams, contact attacks, and ground hazards are explicitly unaffected. |
| Encore Recovery | Healing Verse | keystone / 8 | Once per run, crossing below 25% HP automatically plays a 3-second emergency Ballad and grants a 10%-max-HP shield. Ordinary Ballad activations also grant a 3%-max-HP first-pulse shield. |
