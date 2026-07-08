/**
 * Talent System - Character progression and skill trees
 */

import { talentClassNames } from './constants.js';

/**
 * Generate layout for talent path branches
 * @param {number} count - Number of nodes in the path
 * @returns {Array} Layout configuration with row, column, and parent information
 */
export function talentPathBranchLayout(count) {
  if (count >= 9) {
    return [
      { row: 1, column: 3 },
      { row: 2, column: 2, parents: [0] },
      { row: 2, column: 4, parents: [0] },
      { row: 3, column: 1, parents: [1] },
      { row: 3, column: 3, parentsAny: [1, 2] },
      { row: 3, column: 5, parents: [2] },
      { row: 4, column: 2, parentsAny: [3, 4] },
      { row: 4, column: 4, parentsAny: [4, 5] },
      { row: 5, column: 3, parentsAny: [6, 7] },
    ];
  }
  return [
    { row: 1, column: 3 },
    { row: 2, column: 2, parents: [0] },
    { row: 2, column: 4, parents: [0] },
    { row: 3, column: 2, parents: [1] },
    { row: 3, column: 4, parents: [2] },
    { row: 4, column: 2, parents: [3] },
    { row: 4, column: 4, parents: [4] },
    { row: 5, column: 3, parentsAny: [5, 6] },
  ];
}

/**
 * Build a talent path with all node metadata
 * @param {string} classKey - Class identifier (melee, ranger, mage, etc.)
 * @param {string} path - Path name
 * @param {number} pathIndex - Index of this path within the class
 * @param {Array} nodes - Array of node definitions
 * @returns {Array} Array of fully defined talent nodes
 */
export function buildTalentPath(classKey, path, pathIndex, nodes) {
  const layout = talentPathBranchLayout(nodes.length);
  return nodes.map((node, index) => {
    const slot = layout[index] || { row: index + 1, column: 3 };
    const defaultParents = slot.parents?.map((parentIndex) => nodes[parentIndex]?.id).filter(Boolean) || [];
    const defaultParentsAny = slot.parentsAny?.map((parentIndex) => nodes[parentIndex]?.id).filter(Boolean) || [];
    return {
      id: node.id,
      classKey,
      branch: path,
      path,
      pathIndex,
      row: slot.row,
      column: slot.column,
      name: node.name,
      rarity: node.rarity || (index === nodes.length - 1 ? "legendary" : index >= nodes.length - 3 ? "epic" : index >= 2 ? "rare" : "common"),
      description: node.description,
      synergy: node.synergy || "",
      type: node.type || (index === nodes.length - 1 ? "capstone" : index === 0 ? "minor" : "major"),
      parents: node.parents || defaultParents,
      parentsAny: node.parentsAny || defaultParentsAny,
      effect: node.effect || node.description,
      effectKey: node.effectKey || node.id,
    };
  });
}

/**
 * Complete talent definitions for all classes and paths
 */
export const talentDefinitions = [
  ...buildTalentPath("melee", "Iron Vanguard", 0, [
    { id: "melee_iron_hp", name: "Iron Stomach", rarity: "common", description: "+25 maximum health.", synergy: "Gives Warrior room to stand close during boss patterns." },
    { id: "warrior_vanguard_shield_hook", name: "Shield Hook", rarity: "common", description: "Shield Bash pulls small enemies and slightly drags bosses toward you.", synergy: "Improves melee uptime before Groundbreaker." },
    { id: "warrior_vanguard_brace", name: "Brace And Break", rarity: "rare", description: "Standing still briefly empowers your next Shield Bash into a wider cone.", synergy: "Rewards tank timing during safe windows." },
    { id: "melee_iron_wall", name: "Reinforced Guard", rarity: "rare", description: "Shield Wall lasts longer and blocks more damage.", synergy: "Combines with projectile-heavy boss phases." },
    { id: "melee_iron_heal", name: "Deflecting Bite", rarity: "rare", description: "Shield Bash heals when it blocks projectiles.", synergy: "Turns defense into sustain." },
    { id: "warrior_vanguard_counterquake", name: "Counterquake", rarity: "epic", description: "Blocking or reducing damage charges Groundbreaker.", synergy: "Feeds tank play into AoE pressure." },
    { id: "warrior_vanguard_bulwark_echo", name: "Bulwark Echo", rarity: "epic", description: "The next ability after Shield Wall repeats at reduced power.", synergy: "Creates Shield Wall into Groundbreaker burst lines." },
    { id: "melee_iron_last", name: "Unmoving Mountain", rarity: "legendary", description: "Once per fight, survive lethal damage and gain Shield Wall.", synergy: "Lets Warrior recover during final boss chaos." },
  ]),
  ...buildTalentPath("melee", "Blood Reaver", 1, [
    { id: "melee_blood_bleed", name: "Serrated Opening", rarity: "common", description: "Basic attacks apply Bleed.", synergy: "Starts the Warrior bleed engine." },
    { id: "melee_blood_whirl", name: "Red Sweep", rarity: "common", description: "Whirlwind Dash applies Bleed to all targets hit.", synergy: "Strong in gauntlets and add phases." },
    { id: "melee_blood_deep", name: "Deep Cuts", rarity: "rare", description: "Bleeds last longer and tick harder.", synergy: "Improves every Reaver payoff." },
    { id: "warrior_blood_price", name: "Blood Price", rarity: "rare", description: "Spend a little HP to cast Groundbreaker if its cooldown is almost ready.", synergy: "Risky burst during exposed windows." },
    { id: "melee_blood_hemo", name: "Hemorrhage Pulse", rarity: "rare", description: "Groundbreaker bursts bleeding targets for bonus damage.", synergy: "Core Q/E/Space bleed combo payoff." },
    { id: "warrior_blood_crimson_trail", name: "Crimson Trail", rarity: "epic", description: "Whirlwind leaves a blood trail that damages bleeding enemies more.", synergy: "Turns movement into a DoT lane." },
    { id: "warrior_blood_reaver_rhythm", name: "Reaver Rhythm", rarity: "epic", description: "Alternating basic attacks and abilities extends Bleed duration.", synergy: "Rewards clean rotations." },
    { id: "warrior_blood_bloodstorm", name: "Bloodstorm", rarity: "legendary", description: "Whirlwind consumes long Bleeds for a huge spinning burst.", synergy: "Big setup payoff for boss burn windows." },
  ]),
  ...buildTalentPath("melee", "Earthbreaker", 2, [
    { id: "melee_earth_radius", name: "Wider Quake", rarity: "common", description: "Groundbreaker radius is larger.", synergy: "Makes Warrior AoE more forgiving." },
    { id: "warrior_earth_stonefist", name: "Stonefist", rarity: "common", description: "Basic attacks after Groundbreaker create tiny aftershocks.", synergy: "Adds sustained melee splash." },
    { id: "warrior_earth_fault_line", name: "Fault Line", rarity: "rare", description: "Groundbreaker travels forward in a short line.", synergy: "Lets melee threaten from safer spacing." },
    { id: "melee_earth_after", name: "Aftershock", rarity: "rare", description: "Groundbreaker hits a second time after a short delay.", synergy: "Excellent on bosses held in place." },
    { id: "melee_earth_bash", name: "Shock Bash", rarity: "rare", description: "Shield Bash reaches farther and hits harder.", synergy: "Gives Earthbreaker a ranged opener." },
    { id: "warrior_earth_rubble_guard", name: "Rubble Guard", rarity: "epic", description: "Groundbreaker creates a brief projectile-blocking rubble ring.", synergy: "Adds survival to AoE timing." },
    { id: "melee_earth_cap", name: "Earth Battery", rarity: "epic", description: "Groundbreaker destroys nearby small projectiles.", synergy: "Projectile clears feed safer melee windows." },
    { id: "warrior_earth_worldsplitter", name: "Worldsplitter", rarity: "legendary", description: "Every third Groundbreaker creates three branching shockwaves.", synergy: "Huge arena pressure against large bosses." },
    { id: "warrior_earth_titan_stance", name: "Titan Stance", rarity: "legendary", description: "Groundbreaker radius grows near the boss, but movement speed drops briefly.", synergy: "High-risk close-range mastery." },
  ]),
  ...buildTalentPath("ranger", "Deadeye", 0, [
    { id: "ranger_deadeye_mark", name: "Long Mark", rarity: "common", description: "Marked Shot lasts longer and stores more marked hits.", synergy: "Core boss DPS setup." },
    { id: "ranger_deadeye_damage", name: "Clean Angle", rarity: "common", description: "Marked basic shots deal more damage.", synergy: "Rewards ranged spacing." },
    { id: "ranger_deadeye_pierce", name: "Piercing Mark", rarity: "rare", description: "Marked Shot pierces and marks the first two targets hit.", synergy: "Improves gauntlet and add pressure." },
    { id: "ranger_deadeye_tumble", name: "Snap Aim", rarity: "rare", description: "Tumble Shot empowers your next basic attack.", synergy: "Turns dodging into burst." },
    { id: "ranger_deadeye_refund", name: "Bullseye Refund", rarity: "rare", description: "Consuming the final mark reduces Marked Shot cooldown.", synergy: "Rewards precise mark spending." },
    { id: "ranger_deadeye_detonation", name: "Marked Detonation", rarity: "epic", description: "When the last mark is consumed, the target emits an AoE burst.", synergy: "Adds splash to single-target play." },
    { id: "ranger_deadeye_distance", name: "Perfect Distance", rarity: "epic", description: "Staying in a sweet-spot range charges your next Marked Shot.", synergy: "Builds a positioning minigame." },
    { id: "ranger_deadeye_cap", name: "Execution Mark", rarity: "legendary", description: "Marked targets below 30% HP take escalating damage from consumed marks.", synergy: "Strong final phase finisher." },
  ]),
  ...buildTalentPath("ranger", "Trapmaster", 1, [
    { id: "ranger_trap_tumble", name: "Pocket Trap", rarity: "common", description: "Tumble Shot drops a short-lived mini trap.", synergy: "Kiting leaves damage behind." },
    { id: "ranger_trap_size", name: "Wide Net", rarity: "common", description: "Volley Trap trigger radius is larger.", synergy: "Makes setup more reliable." },
    { id: "ranger_trap_barbed", name: "Barbed Springs", rarity: "rare", description: "Trap hits briefly slow enemies.", synergy: "Sets up Arrow Storm and Deadeye." },
    { id: "ranger_trap_chain", name: "Trap Chain", rarity: "rare", description: "A triggered trap arms a second smaller trap nearby.", synergy: "Rewards dense trap placement." },
    { id: "ranger_trap_damage", name: "Barbed Volley", rarity: "rare", description: "Volley Trap shots hit harder.", synergy: "Simple trap damage payoff." },
    { id: "ranger_trap_tripwire", name: "Tripwire Volley", rarity: "epic", description: "Traps fire toward marked enemies when triggered.", synergy: "Connects Trapmaster with Deadeye." },
    { id: "ranger_trap_snare_field", name: "Snare Field", rarity: "epic", description: "Multiple traps close together link into a slowing field.", synergy: "Creates safe ranged lanes." },
    { id: "ranger_trap_cap", name: "Hunting Grounds", rarity: "legendary", description: "Volley Trap fires more shots and refreshes faster.", synergy: "Turns Ranger into a setup turret." },
  ]),
  ...buildTalentPath("ranger", "Arrow Storm", 2, [
    { id: "ranger_storm_radius", name: "Broad Storm", rarity: "common", description: "Arrow Storm radius is larger.", synergy: "Easier AoE coverage." },
    { id: "ranger_storm_pulses", name: "Rapid Rain", rarity: "common", description: "Arrow Storm pulses more often.", synergy: "More on-hit triggers." },
    { id: "ranger_storm_follow", name: "Storm Follows", rarity: "rare", description: "Arrow Storm slowly follows your aimed target.", synergy: "Helps against mobile bosses." },
    { id: "ranger_storm_duration", name: "Lingering Clouds", rarity: "rare", description: "Arrow Storm lasts longer.", synergy: "Longer boss damage windows." },
    { id: "ranger_storm_marking", name: "Rain Marking", rarity: "rare", description: "Arrow Storm has a chance to apply a weak mark.", synergy: "Feeds Deadeye builds." },
    { id: "ranger_storm_cyclone", name: "Cyclone Step", rarity: "epic", description: "Tumble through Arrow Storm to fire a ring of arrows.", synergy: "Combines mobility with AoE." },
    { id: "ranger_storm_cloudburst", name: "Cloudburst", rarity: "epic", description: "Casting another ability inside Arrow Storm causes an extra pulse.", synergy: "Rewards ability weaving." },
    { id: "ranger_storm_cap", name: "Skyfall Engine", rarity: "legendary", description: "Arrow Storm hits much harder.", synergy: "Primary Ranger burn-window payoff." },
    { id: "ranger_storm_endless_quiver", name: "Endless Quiver", rarity: "legendary", description: "During Arrow Storm, every third basic shot fires an extra falling arrow.", synergy: "Attack-speed storm build." },
  ]),
  ...buildTalentPath("mage", "Pyromancer", 0, [
    { id: "mage_pyro_burn", name: "Scorching Blast", rarity: "common", description: "Fire Blast applies Burn.", synergy: "Starts the Mage burn loop." },
    { id: "mage_pyro_radius", name: "Hotter Blast", rarity: "common", description: "Fire Blast explosion radius is larger.", synergy: "Easier add and donut minion clears." },
    { id: "mage_pyro_kindling", name: "Kindling Rune", rarity: "rare", description: "Blink leaves a fire rune that detonates.", synergy: "Turns movement into setup damage." },
    { id: "mage_pyro_damage", name: "Combustion", rarity: "rare", description: "Fire Blast deals more damage.", synergy: "Simple burst upgrade for the main nuke." },
    { id: "mage_pyro_molten_splash", name: "Molten Splash", rarity: "rare", description: "Burning enemies hit by Meteor leave small lava puddles.", synergy: "Connects Pyromancer and Meteor Savant." },
    { id: "mage_pyro_chain_ignite", name: "Chain Ignite", rarity: "epic", description: "Killing a burning enemy spreads Burn nearby.", synergy: "Strong gauntlet wave clear." },
    { id: "mage_pyro_flame_debt", name: "Flame Debt", rarity: "epic", description: "Casting Fire Blast near-ready spends HP to fire instantly.", synergy: "Risky exposed-window burst." },
    { id: "mage_pyro_cap", name: "Inferno Core", rarity: "legendary", description: "Fire Blast becomes a huge, high-damage explosion.", synergy: "Big payoff for grouped targets." },
  ]),
  ...buildTalentPath("mage", "Meteor Savant", 1, [
    { id: "mage_meteor_radius", name: "Wide Field", rarity: "common", description: "Meteor Field radius is larger.", synergy: "Better boss zone control." },
    { id: "mage_meteor_speed", name: "Falling Stars", rarity: "common", description: "Meteor Field impacts more often.", synergy: "More status and hit triggers." },
    { id: "mage_meteor_duration", name: "Molten Sky", rarity: "rare", description: "Meteor Field lasts longer.", synergy: "Longer damage windows." },
    { id: "mage_meteor_gravity", name: "Gravity Well", rarity: "rare", description: "Meteor Field gently pulls small enemies inward.", synergy: "Gauntlet control and Fire Blast setup." },
    { id: "mage_meteor_impact_echo", name: "Impact Echo", rarity: "rare", description: "Every third meteor repeats as a smaller impact.", synergy: "Sustained AoE pressure." },
    { id: "mage_meteor_star_brand", name: "Star Brand", rarity: "epic", description: "Meteor hits brand targets; Fire Blast detonates brands.", synergy: "Rotation payoff." },
    { id: "mage_meteor_armor", name: "Meteor Armor", rarity: "epic", description: "Standing in Meteor Field grants brief damage reduction.", synergy: "Supports risky stationary casting." },
    { id: "mage_meteor_cap", name: "Cataclysm", rarity: "legendary", description: "Meteor impacts are larger and hit harder.", synergy: "Best during Shell Crack and boss exposes." },
    { id: "mage_meteor_orbiting_star", name: "Orbiting Star", rarity: "legendary", description: "A mini meteor orbits you and crashes into your next Fire Blast target.", synergy: "Burst setup for skilled timing." },
  ]),
  ...buildTalentPath("mage", "Chronomancer", 2, [
    { id: "mage_chrono_radius", name: "Wide Warp", rarity: "common", description: "Time Warp radius is larger.", synergy: "More room to slow hazards." },
    { id: "mage_chrono_slow", name: "Deep Slow", rarity: "common", description: "Time Warp slows hazards more.", synergy: "Easier pattern navigation." },
    { id: "mage_chrono_duration", name: "Extended Moment", rarity: "rare", description: "Time Warp lasts longer.", synergy: "Longer control windows." },
    { id: "mage_chrono_cooldown", name: "Temporal Recovery", rarity: "rare", description: "Abilities used inside Time Warp refund cooldown.", synergy: "Enables rapid spell rotations." },
    { id: "mage_chrono_anchor", name: "Time Anchor", rarity: "rare", description: "Blink leaves an anchor; recast to return.", synergy: "Safe repositioning tool." },
    { id: "mage_chrono_burst", name: "Time Burst", rarity: "epic", description: "Ending Time Warp releases stored slowdown as a burst.", synergy: "Crowd control payoff." },
    { id: "mage_chrono rewind", name: "Personal Rewind", rarity: "epic", description: "Taking lethal damage rewinds your position and HP once.", synergy: "Second chance mechanic." },
    { id: "mage_chrono_cap", name: "Time Lord", rarity: "legendary", description: "Time Warp affects cooldown recovery rate.", synergy: "Massive ability spam potential." },
  ]),
  ...buildTalentPath("rogue", "Assassin", 0, [
    { id: "rogue_assass_backstab", name: "Vital Strike", rarity: "common", description: "Backstab crits from behind.", synergy: "Rewards positioning." },
    { id: "rogue_assass_poison", name: "Deadly Toxin", rarity: "common", description: "Poison Cloud deals more damage.", synergy: "Stronger zone denial." },
    { id: "rogue_assass_execute", name: "Finishing Blow", rarity: "rare", description: "Backstab executes low-HP enemies.", synergy: "Clean gauntlet clears." },
    { id: "rogue_assass_shadow", name: "Shadow Veil", rarity: "rare", description: "Shadow Step grants brief invisibility.", synergy: "Improved survivability." },
    { id: "rogue_assass_combo", name: "Combo Builder", rarity: "rare", description: "Consecutive Backstabs stack damage.", synergy: "Rewards aggressive play." },
    { id: "rogue_assass_deathmark", name: "Deathmark", rarity: "epic", description: "Marked enemies take bonus damage from all sources.", synergy: "Team damage amplification." },
    { id: "rogue_assass_phantom", name: "Phantom Strike", rarity: "epic", description: "Shadow Step can be cast twice before cooldown.", synergy: "Double mobility burst." },
    { id: "rogue_assass_cap", name: "Master Assassin", rarity: "legendary", description: "Backstab resets Shadow Step cooldown on kill.", synergy: "Reset chains in gauntlets." },
  ]),
  ...buildTalentPath("rogue", "Poisonmaster", 1, [
    { id: "rogue_poison_cloud", name: "Toxic Cloud", rarity: "common", description: "Poison Cloud is larger.", synergy: "Better zone control." },
    { id: "rogue_poison_stack", name: "Stacking Toxins", rarity: "common", description: "Poison stacks higher.", synergy: "Stronger DoT ramp." },
    { id: "rogue_poison_slow", name: "Neurotoxin", rarity: "rare", description: "Poison slows enemies more.", synergy: "Kiting support." },
    { id: "rogue_poison_blast", name: "Virulent Burst", rarity: "rare", description: "Poison stacks explode when refreshed.", synergy: "Burst window payoff." },
    { id: "rogue_poison_pool", name: "Contaminated Ground", rarity: "rare", description: "Poison Cloud leaves lingering pools.", synergy: "Persistent area denial." },
    { id: "rogue_poison_chain", name: "Chain Reaction", rarity: "epic", description: "Exploding poison spreads to nearby enemies.", synergy: "AoE poison spread." },
    { id: "rogue_poison_amp", name: "Amplified Toxicity", rarity: "epic", description: "Poison damage scales with missing enemy HP.", synergy: "Execute synergy." },
    { id: "rogue_poison_cap", name: "Plague Bringer", rarity: "legendary", description: "Poison Cloud applies max stacks instantly.", synergy: "Immediate poison pressure." },
  ]),
  ...buildTalentPath("rogue", "Shadowdancer", 2, [
    { id: "rogue_shadow_step", name: "Long Step", rarity: "common", description: "Shadow Step range is increased.", synergy: "More mobility options." },
    { id: "rogue_shadow_evasion", name: "Elusive", rarity: "common", description: "Shadow Step evasion lasts longer.", synergy: "More defensive uptime." },
    { id: "rogue_shadow_clone", name: "Shadow Clone", rarity: "rare", description: "Shadow Step leaves a decoy that explodes.", synergy: "Distraction and damage." },
    { id: "rogue_shadow_velocity", name: "Momentum", rarity: "rare", description: "Shadow Step grants move speed.", synergy: "Chase or escape tool." },
    { id: "rogue_shadow_strike", name: "Dancing Blade", rarity: "rare", description: "Basic attacks reduce Shadow Step cooldown.", synergy: "Frequent mobility." },
    { id: "rogue_shadow_twilight", name: "Twilight Zone", rarity: "epic", description: "Shadow Step creates a slowing field.", synergy: "Area control on mobility." },
    { id: "rogue_shadow_umbral", name: "Umbral Surge", rarity: "epic", description: "Emerging from Shadow Step empowers attacks.", synergy: "Hit-and-run tactics." },
    { id: "rogue_shadow_cap", name: "Dance of Death", rarity: "legendary", description: "Shadow Step has no cooldown but costs HP.", synergy: "High-skill ceiling mobility." },
  ]),
  ...buildTalentPath("paladin", "Holy", 0, [
    { id: "paladin_holy_smite", name: "Righteous Smite", rarity: "common", description: "Radiant Smite deals more damage.", synergy: "Stronger holy burst." },
    { id: "paladin_holy_aura", name: "Expanded Aura", rarity: "common", description: "Consecration radius is larger.", synergy: "Better healing coverage." },
    { id: "paladin_holy_purity", name: "Purity", rarity: "rare", description: "Consecration cleanses debuffs.", synergy: "Utility against status bosses." },
    { id: "paladin_holy_barrier", name: "Divine Barrier", rarity: "rare", description: "Divine Bulwark protects nearby allies.", synergy: "Team support." },
    { id: "paladin_holy_judgment", name: "Judgment", rarity: "rare", description: "Radiant Smite marks enemies for bonus damage.", synergy: "Damage amplification." },
    { id: "paladin_holy_avenging", name: "Avenging Wrath", rarity: "epic", description: "Low HP empowers all holy effects.", synergy: "Comeback mechanic." },
    { id: "paladin_holy_sanctuary", name: "Sanctuary", rarity: "epic", description: "Consecration grants immunity to interrupts.", synergy: "Uninterruptible healing." },
    { id: "paladin_holy_cap", name: "Avatar", rarity: "legendary", description: "Ultimate transforms you, empowering all abilities.", synergy: "Full power transformation." },
  ]),
  ...buildTalentPath("paladin", "Protection", 1, [
    { id: "paladin_prot_block", name: "Improved Block", rarity: "common", description: "Block chance is increased.", synergy: "More consistent mitigation." },
    { id: "paladin_prot_thorns", name: "Thorns", rarity: "common", description: "Reflect damage when hit.", synergy: "Passive damage while tanking." },
    { id: "paladin_prot_guardian", name: "Guardian's Favor", rarity: "rare", description: "Divine Bulwark cooldown is reduced.", synergy: "More uptime on barrier." },
    { id: "paladin_prot_retaliation", name: "Retaliation", rarity: "rare", description: "Blocking charges your next Smite.", synergy: "Defensive-to-offensive conversion." },
    { id: "paladin_prot_bastion", name: "Bastion", rarity: "rare", description: "Gain armor based on missing HP.", synergy: "Stronger when pressured." },
    { id: "paladin_prot_vengeance", name: "Vengeance", rarity: "epic", description: "Taking damage increases your damage dealt.", synergy: "Tank DPS scaling." },
    { id: "paladin_prot_immovable", name: "Immovable Object", rarity: "epic", description: "Cannot be knocked back while shielding.", synergy: "Positional stability." },
    { id: "paladin_prot_cap", name: "Unbreakable", rarity: "legendary", description: "Survive lethal damage once per fight with full shield.", synergy: "Ultimate safety net." },
  ]),
  ...buildTalentPath("paladin", "Retribution", 2, [
    { id: "paladin_retib_crit", name: "Critical Faith", rarity: "common", description: "Holy crit chance increased.", synergy: "More burst potential." },
    { id: "paladin_retib_zeal", name: "Zeal", rarity: "common", description: "Basic attacks generate holy power.", synergy: "Resource generation." },
    { id: "paladin_retib_execution", name: "Executioner's Justice", rarity: "rare", description: "Execute enemies below threshold.", synergy: "Finisher tool." },
    { id: "paladin_retib_crusade", name: "Crusade", rarity: "rare", description: "Smite hits additional targets.", synergy: "Cleave damage." },
    { id: "paladin_retib_inquisition", name: "Inquisition", rarity: "rare", description: "Damaging enemies reduces cooldowns.", synergy: "Ability haste." },
    { id: "paladin_retib_tempest", name: "Holy Tempest", rarity: "epic", description: "Critical hits chain lightning to nearby enemies.", synergy: "AoE crit payoff." },
    { id: "paladin_retib_wrath", name: "Divine Wrath", rarity: "epic", description: "Smite cooldown is greatly reduced.", synergy: "Spam holy damage." },
    { id: "paladin_retib_cap", name: "Final Verdict", rarity: "legendary", description: "Smite becomes a massive execute with extended range.", synergy: "Ultimate boss killer." },
  ]),
  ...buildTalentPath("bard", "Inspiration", 0, [
    { id: "bard_inspire_anthem", name: "Grand Anthem", rarity: "common", description: "Battle Hymn affects more allies.", synergy: "Better team buffing." },
    { id: "bard_inspire_melody", name: "Catchy Melody", rarity: "common", description: "Songs last longer.", synergy: "Less maintenance." },
    { id: "bard_inspire_crescendo", name: "Crescendo", rarity: "rare", description: "Song effects strengthen over time.", synergy: "Ramping power." },
    { id: "bard_inspire_encore", name: "Encore", rarity: "rare", description: "Songs have a chance to not consume cooldown.", synergy: "Free casts." },
    { id: "bard_inspire_solo", name: "Virtuoso Solo", rarity: "rare", description: "Playing alone grants bonus effects.", synergy: "Solo play enhancement." },
    { id: "bard_inspire_masterwork", name: "Masterwork", rarity: "epic", description: "Active songs amplify each other.", synergy: "Multi-song synergy." },
    { id: "bard_inspire_standout", name: "Standout Performance", rarity: "epic", description: "Kills while singing extend song duration.", synergy: "Sustain through combat." },
    { id: "bard_inspire_cap", name: "Legendary Performance", rarity: "legendary", description: "All songs reach maximum potency instantly.", synergy: "Immediate full power." },
  ]),
  ...buildTalentPath("bard", "Disruption", 1, [
    { id: "bard_disrupt_cacophony", name: "Cacophony", rarity: "common", description: "Power Chord hits more targets.", synergy: "Better AoE." },
    { id: "bard_disrupt_disharmony", name: "Disharmony", rarity: "common", description: "Enemies hit by songs deal less damage.", synergy: "Defensive utility." },
    { id: "bard_disrupt_silence", name: "Silence", rarity: "rare", description: "Power Chord silences enemies briefly.", synergy: "Interrupt tool." },
    { id: "bard_disrupt_fatigue", name: "Mental Fatigue", rarity: "rare", description: "Songs reduce enemy attack speed.", synergy: "Slows boss pressure." },
    { id: "bard_disrupt_screech", name: "Ear Piercing Screech", rarity: "rare", description: "Power Chord stuns small enemies.", synergy: "Crowd control." },
    { id: "bard_disrupt_requiem", name: "Requiem", rarity: "epic", description: "Killed enemies explode with sonic damage.", synergy: "Chain reactions." },
    { id: "bard_disrupt_opera", name: "Grand Opera", rarity: "epic", description: "Power Chord creates lingering sound zones.", synergy: "Area denial." },
    { id: "bard_disrupt_cap", name: "Symphony of Ruin", rarity: "legendary", description: "All songs also damage enemies.", synergy: "Full offensive conversion." },
  ]),
  ...buildTalentPath("bard", "Harmony", 2, [
    { id: "bard_harmony_ballad", name: "Healing Ballad", rarity: "common", description: "Healing Ballad heals more.", synergy: "Stronger sustain." },
    { id: "bard_harmony_resonance", name: "Resonance", rarity: "common", description: "Healing creates small shields.", synergy: "Overheal conversion." },
    { id: "bard_harmony_cleanse", name: "Cleansing Song", rarity: "rare", description: "Songs cleanse debuffs from allies.", synergy: "Support utility." },
    { id: "bard_harmony_revitalize", name: "Revitalize", rarity: "rare", description: "Low HP allies receive increased healing.", synergy: "Recovery tool." },
    { id: "bard_harmony_protection", name: "Protective Harmony", rarity: "rare", description: "Songs grant temporary damage reduction.", synergy: "Preventive defense." },
    { id: "bard_harmony_salvation", name: "Salvation", rarity: "epic", description: "Healing Ballad can prevent death once.", synergy: "Save ally from lethal." },
    { id: "bard_harmony_conduit", name: "Harmonic Conduit", rarity: "epic", description: "Healing spreads to nearby allies.", synergy: "AoE healing." },
    { id: "bard_harmony_cap", name: "Immortal Symphony", rarity: "legendary", description: "Allies cannot die while affected by your songs.", synergy: "Ultimate team save." },
  ]),
];

/**
 * Create a lookup map for talents by ID
 */
export const talentById = new Map(talentDefinitions.map((talent) => [talent.id, talent]));

/**
 * Get talent definition by ID
 * @param {string} talentId - The talent ID to look up
 * @returns {Object|undefined} The talent definition or undefined
 */
export function getTalent(talentId) {
  return talentById.get(talentId);
}

/**
 * Get all talents for a specific class
 * @param {string} classKey - The class key (melee, ranger, etc.)
 * @returns {Array} Array of talents for the class
 */
export function getTalentsForClass(classKey) {
  return talentDefinitions.filter((talent) => talent.classKey === classKey);
}

/**
 * Get talents by rarity
 * @param {string} rarity - The rarity to filter by
 * @returns {Array} Array of talents with the specified rarity
 */
export function getTalentsByRarity(rarity) {
  return talentDefinitions.filter((talent) => talent.rarity === rarity);
}
