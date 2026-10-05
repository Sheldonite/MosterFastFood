const assert=require("node:assert/strict");
const {createGame}=require("./game-test-harness");
const catalogue=require("../docs/talent-redesign.json");
const data=Array.isArray(catalogue)?catalogue:catalogue.nodes;
const probe=createGame();
const nodes=JSON.parse(probe.run('JSON.stringify(talentDefinitions.map(t=>({id:t.id,classKey:t.classKey})))'));
// Replay real casts, projectile collisions, field ticks, blocked attacks and lethal
// damage. Snapshot gameplay outputs, excluding rule registration and cosmetics.
function scenario(node,upgraded){
  const g=createGame();
  const deps={melee_blood_deep:["melee_blood_bleed"],mage_pyro_molten_splash:["mage_pyro_burn"]}[node.id]||[];
  const ids=upgraded?[...deps,node.id]:deps;
  g.run(`startSinglePlayer();closeClassMenu();equipClass(${JSON.stringify(node.classKey==="melee"?"warrior":node.classKey)});runState.learnedTalents=new Set(${JSON.stringify(ids)});applyGear();RogueCombat.resetRun();RogueTraining.reset("cluster");Arcade.screens.close(true);var trace=[];var fixtureTargets=RogueTraining.targets;fixtureTargets.forEach((t,i)=>{t.maxHp=100000;t.hp=75000;t.x=420+i*18;t.y=490;t.facing="right";});player.x=385;player.y=450;mouseWorld={x:420,y:450};player.hp=Math.floor(player.maxHp*.3);`);
  function capture(){g.run(`trace.push([player.maxHp,Math.round(player.hp),player.rogueShield||0,player.x,player.y,...player.abilityCooldowns.map(c=>Math.round(c*100)),...fixtureTargets.flatMap(t=>[Math.round(t.hp),t.poisonStacks||0,Math.round((t.bleedTimer||0)*100),t.exposedStacks||0,t.markedShots||0,Math.round((t.burnTimer||0)*100),t.bleedDamage||0]),abilityEffects.filter(e=>e.ttl>1).map(e=>[e.type,Math.round(e.r||0),Math.round(e.ttl*100),e.shotsRemaining||0,e.remaining||0,e.damageMultiplier||0,e.healAmount||0,e.damageBuff||0,e.attackSpeedBuff||0,e.speedBuff||0]).sort(),playerProjectiles.map(p=>[p.damage,p.piercing||false,p.maxHits||0])]);`);}
  function tick(seconds){for(let i=0;i<Math.ceil(seconds/.05);i++){g.advance(50);g.run('updateAbilities(.05);updatePlayerProjectiles(.05);if(player.slide)moveSlidingPlayer(.05);');}capture();}
  tick(.6);
  for(let round=0;round<5;round++){
    for(const index of [3,1,0,2]){
      g.run(`player.x=385;player.y=450;mouseWorld={x:420,y:450};player.abilityCooldowns=[4,4,4,4];player.abilityCooldowns[${index}]=0;player.pendingAbilityCast=null;player.castTimer=0;player.invulnerableTimer=0;hazards=[0,1,2,3].map(i=>({type:"mazeShot",x:400+i*4,y:405,vx:-10,vy:0,r:8,ttl:10,damage:4}));useAbility(${index});`);
      capture();tick(index===1?4:.4);
      g.run('player.x=385;player.y=450;mouseWorld={x:420,y:450};for(let i=0;i<7;i++){player.attackCooldown=0;shootAt(420,450);updatePlayerProjectiles(.25);}');capture();
      g.run('player.invulnerableTimer=0;damagePlayer(12,"Training",{fixed:true,ignoreOverlapGrace:true});');capture();
    }
    g.run('for(const t of fixtureTargets){applyPoisonStack(t);applyPoisonStack(t);applyPoisonStack(t);applyPoisonStack(t);applyPoisonStack(t);RogueCombat.expose(t);applyBurn(t);applyBleed(t);t.hp=500;}player.abilityCooldowns=[0,0,0,0];player.x=385;player.y=450;mouseWorld={x:420,y:450};useAbility(0);');tick(.5);
    g.run('fixtureTargets.forEach(t=>{if(t.hp<=0)t.hp=75000;});player.hp=Math.max(1,player.maxHp*.2);');
  }
  // Health-price shortcuts and once-per-run saves are exercised through input.
  g.run('player.hp=player.maxHp*.6;player.abilityCooldowns=[1,1,1,1];player.pendingAbilityCast=null;useAbility(currentClassKey()==="melee"?1:0);');capture();
  g.run('player.invulnerableTimer=0;player.hp=1;damagePlayer(9999,"Lethal",{fixed:true,ignoreOverlapGrace:true});');capture();
  return g.run('JSON.stringify(trace)');
}
const focused={
 melee_iron_heal:'player.hp=player.maxHp*.5;var a=RogueTraining.aim();hazards=[{type:"mazeShot",x:a.origin.x+Math.cos(a.angle)*30,y:a.origin.y+Math.sin(a.angle)*30,vx:1,vy:1,r:8,ttl:3,damage:6}];useAbility(0);',
 melee_earth_radius:'trainingDummy.x=player.x+167;trainingDummy.y=player.y;trainingDummy.radius=1;useAbility(1);',
 warrior_earth_fault_line:'trainingDummy.x=player.x+172;trainingDummy.y=player.y;trainingDummy.radius=1;useAbility(1);',
 warrior_earth_rubble_guard:'useAbility(1);hazards=[{type:"mazeShot",x:player.x+142,y:player.y,vx:0,vy:1,r:5,ttl:3}];updateAbilities(.1);',
 ranger_deadeye_distance:'trainingDummy.x=player.x+240;trainingDummy.y=player.y;markBossTarget(trainingDummy);damageBossTarget(trainingDummy,27,"Shot",{rangedBasic:true});',
 ranger_trap_barbed:'damageBossTarget(trainingDummy,20,"Trap Arrow");damageBossTarget(trainingDummy,27,"Shot",{rangedBasic:true});',
 ranger_trap_tripwire:'markBossTarget(trainingDummy);useAbility(3);tick(1);',
 ranger_trap_snare_field:'player.x=340;useAbility(3);player.x=500;player.abilityCooldowns[3]=0;useAbility(3);trainingDummy.x=420;trainingDummy.y=player.y+40;updateAbilities(.1);',
 ranger_storm_follow:'useAbility(1);mouseWorld.x+=70;useAbility(1);tick(.5);',
 ranger_storm_cyclone:'useAbility(1);useAbility(2);',
 ranger_storm_cloudburst:'useAbility(1);useAbility(0);',
 ranger_storm_endless_quiver:'useAbility(1);for(let i=0;i<3;i++)damageBossTarget(trainingDummy,27,"Shot",{rangedBasic:true});',
 mage_pyro_burn:'useAbility(0);tick(1.1);',
 rogue_shadow_ambush_echo:'trainingDummy.x=570;trainingDummy.y=player.y;useAbility(2);tick(.4);',
 rogue_shadow_expose_bleed:'RogueCombat.expose(trainingDummy);useAbility(0);tick(.6);',
 rogue_shadow_knife_dance:'player.abilityCooldowns[2]=8;useAbility(0);',
 rogue_smoke_step:'useAbility(3);useAbility(2);var e={x:480,y:450};var aim=mazeAimTarget(e);trace.push([aim.x,aim.y]);',
 rogue_smoke_blind_spot:'trainingDummy.facing="left";useAbility(3);useAbility(0);',
 rogue_smoke_vanishing_act:'player.hp=player.maxHp;damagePlayer(player.maxHp*.25,"Heavy",{fixed:true,ignoreOverlapGrace:true});',
 paladin_consecrate_footing:'useAbility(1);tick(.1);player.pickleSlowTimer=3;knockPlayerFrom(200,player.y,100);',
 paladin_guard_projectiles:'var a=RogueTraining.aim().angle;hazards=[{type:"mazeShot",x:player.x+Math.cos(a)*75,y:player.y+Math.sin(a)*75,r:8,vx:10,vy:0,ttl:3}];useAbility(2);',
 paladin_guard_martyr:'RogueCombat.shield(.05);player.hp=player.maxHp;damagePlayer(100,"Heavy",{fixed:true,ignoreOverlapGrace:true});',
 paladin_judgment_radius:'trainingDummy.x=player.x+116;trainingDummy.y=player.y-42;trainingDummy.radius=1;mouseWorld={x:600,y:player.y-42};useAbility(0);',
 paladin_judgment_appeal:'trainingDummy.judgmentTimer=5;player.hp=player.maxHp*.5;useAbility(0);',
 bard_chord_bass_cleave:'trainingDummy.x=player.x+50;trainingDummy.y=player.y+73;trainingDummy.radius=1;mouseWorld={x:600,y:player.y};useAbility(0);',
 bard_chord_dissonance:'trainingDummy.name="Training hit";useAbility(0);damagePlayer(20,"Training hit",{fixed:true,ignoreOverlapGrace:true});',
 bard_heal_cleanse:'player.pickleSlowTimer=4;player.chillStacks=2;useAbility(3);',
 bard_heal_reprise:'player.hp=player.maxHp*.1;useAbility(3);tick(9.5);',
 bard_heal_sanctuary:'useAbility(3);hazards=[{type:"mazeShot",x:player.x+50,y:player.y,vx:100,vy:0,r:5,ttl:3,practice:true}];updateHazards(.1);'
};
function focusedScenario(node,on){const g=createGame();g.run(`startSinglePlayer();closeClassMenu();equipClass(${JSON.stringify(node.classKey==="melee"?"warrior":node.classKey)});runState.learnedTalents=new Set(${JSON.stringify(on?[node.id]:[])});applyGear();RogueCombat.resetRun();player.x=385;player.y=450;player.invulnerableTimer=0;trainingDummy.x=420;trainingDummy.y=490;trainingDummy.facing="right";trainingDummy.hp=trainingDummy.maxHp=100000;mouseWorld={x:420,y:450};var trace=[];function snap(){trace.push([player.hp,player.rogueShield||0,player.x,player.y,playerSpeed(),player.pickleSlowTimer,player.chillStacks,player.slide?.vx,...player.abilityCooldowns,trainingDummy.hp,trainingDummy.bleedDamage||0,trainingDummy.burnTimer||0,trainingDummy.markedShots||0,hazards.map(h=>[h.x,h.vx]),abilityEffects.map(e=>[e.type,e.x,e.y,e.r,e.ttl])]);}function tick(t){for(let i=0;i<t/.05;i++){updateAbilities(.05);updatePlayerProjectiles(.05);}}`);g.run(focused[node.id]);g.run('snap();');return g.run('JSON.stringify(trace)');}
let tested=0,failures=[];
for(const node of nodes){const a=scenario(node,false),b=scenario(node,true);if(a!==b||focused[node.id]&&focusedScenario(node,false)!==focusedScenario(node,true))tested++;else failures.push(node.id);}
if(failures.length)throw new Error("Talents without a measured gameplay difference: "+failures.join(", "));
assert.equal(tested,150);
console.log("PASS all 150 talents alter actual cast, collision, status, defense or recovery results");
