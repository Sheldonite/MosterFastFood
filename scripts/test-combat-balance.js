const assert = require("node:assert/strict");
const { createGame } = require("./game-test-harness");
let checks = 0;
function test(name, run) { run(); checks++; console.log("PASS " + name); }
function start(scale = 1.5) {
  const g = createGame();
  g.run(`combatBalance.healthMultiplier=${scale};combatBalance.damageMultiplier=${scale};startSinglePlayer();closeClassMenu();`);
  return g;
}
const read = (g, expression) => JSON.parse(g.run(`JSON.stringify(${expression})`));
function increased(before, after, label, tolerance = 1) {
  assert.ok(Math.abs(after - before * 1.5) <= tolerance, `${label}: ${before} → ${after}`);
}

test("all six classes and three armors receive 50% more health and attack damage", () => {
  const baseline = start(1), current = start();
  for (const hero of ["warrior", "ranger", "mage", "rogue", "paladin", "bard"]) {
    for (const armor of ["channelerRobe", "duelistCoat", "bulwarkPlate"]) {
      const configure = `equipClass(${JSON.stringify(hero)});player.gear.armor=${JSON.stringify(armor)};runState.mazeBuffs={maxHp:30,damageMultiplier:.16};applyGear();`;
      baseline.run(configure); current.run(configure);
      increased(baseline.run("player.maxHp"), current.run("player.maxHp"), hero + "/" + armor + " HP");
      increased(baseline.run("playerDamage()"), current.run("playerDamage()"), hero + "/" + armor + " damage");
    }
  }
  current.run('runState.mazeBuffs={};equipClass("warrior");runState.learnedTalents=new Set(["melee_iron_hp"]);applyGear();');
  baseline.run('runState.mazeBuffs={};equipClass("warrior");runState.learnedTalents=new Set(["melee_iron_hp"]);applyGear();');
  increased(baseline.run("player.maxHp"), current.run("player.maxHp"), "talent HP");
});

test("every boss, bottle, contract enemy, summon and damageable part receives the HP increase", () => {
  const baseline = start(1), current = start();
  const stats = g => read(g, `(()=>{
    const hp=[];
    for(const kind of Object.keys(combatTuning.bossHealthMultipliers)){
      hp.push([kind,createBoss(kind).maxHp]);
      for(const e of RogueContracts.create(kind,1).enemies)hp.push([kind+":"+e.id,e.maxHp]);
    }
    hp.push(["dummy",createTrainingDummy().maxHp]);
    for(const t of createCondimentBosses())hp.push([t.kind,t.maxHp]);
    loadBoss("pizza");for(const t of RogueBosses.parts())hp.push([t.kind,t.maxHp]);
    loadBoss("donut");for(const phase of [2,3]){boss.phase=phase;hp.push(["hole-"+phase,createDonutHoles(1)[0].maxHp]);}
    spawnDonutMinion(0,1);spawnDonutMinion(0,20);
    for(const m of boss.donutMinions)hp.push(["minion-"+m.kind,m.maxHp]);
    for(const i of [0,1,2]){const e=createMazeEnemy("cola",0,0,i,i===2,()=>.5);hp.push(["legacy-"+i,e.maxHp]);}
    const bounds=createGauntletBounds();hp.push(["warden",createGauntletMiniBoss("cola",1,bounds,[],()=>.5).maxHp]);
    return hp;
  })()`);
  // Match random summon roles rather than assuming both runs picked the same role.
  const before = new Map(stats(baseline));
  before.set("minion-crawler",64);before.set("minion-shooter",58);before.set("minion-glazer",78);
  for (const [name,hp] of stats(current)) increased(before.get(name),hp,name);
});

test("all hostile ability definitions and unlisted enemy attacks scale once before mitigation", () => {
  const baseline = start(1), current = start();
  for (const kind of read(current,"Object.keys(bossAbilityDamageDefinitions)")) {
    for (const g of [baseline,current]) g.run(`loadBoss(${JSON.stringify(kind)});`);
    const evaluate = g => read(g,'bossAbilityDamageDefinitions[boss.kind].map(d=>tunedBossAbilityDamage(d.defaultDamage,d.sources?.[0],{type:d.hazardTypes?.[0]}))');
    const before=evaluate(baseline), after=evaluate(current);
    before.forEach((value,i)=>increased(value,after[i],kind+" attack "+i,0));
  }
  current.run('player.invulnerableTimer=0;player.lastDamageAt=0;var hpBefore=player.hp;damagePlayer(20,"Contract guard",{fixed:true,ignoreOverlapGrace:true});');
  assert.equal(current.run("hpBefore-player.hp"),30);
  current.run('player.lastDamageAt=0;hpBefore=player.hp;damagePlayer(20,"Contract guard",{ignoreOverlapGrace:true});');
  assert.equal(current.run("hpBefore-player.hp"),current.run("Math.ceil(30*combatTuning.incomingDamageMultiplier-effectivePlayerArmor())"));
});

test("class projectiles, DoT and flat Blink damage carry the increase without double scaling", () => {
  const baseline=start(1), current=start();
  for(const hero of ["warrior","ranger","mage","rogue","paladin","bard"]){
    const attacks = g => {
      g.run(`equipClass(${JSON.stringify(hero)});runState.mazeBuffs={};applyGear();RogueTraining.reset();player.x=trainingDummy.x-130;player.y=trainingDummy.y;mouseWorld=RogueTraining.targetPoint(trainingDummy);player.attackCooldown=0;shootAt(mouseWorld.x,mouseWorld.y);updatePlayerProjectiles(.4);applyBleed(trainingDummy);applyBurn(trainingDummy);applyPoisonStack(trainingDummy);`);
      return read(g,'[trainingDummy.damageTotal,trainingDummy.bleedDamage,trainingDummy.burnDamage,trainingDummy.poisonDamagePerStack]');
    };
    const before=attacks(baseline), after=attacks(current);
    before.forEach((value,i)=>increased(value,after[i],hero+" damage "+i));
  }
  current.run('RogueTraining.reset();var d=trainingDummy.damageTotal;updateBlinkRune({x:trainingDummy.x,y:trainingDummy.y,r:72,pulseTimer:0},.1);');
  assert.equal(current.run("trainingDummy.damageTotal-d"),12);
});

test("co-op damage packets and host hit intents use the boosted amount exactly once", () => {
  const g=start();
  g.run('multiplayer.mode="multiplayer";multiplayer.connected=true;multiplayer.id="p1";multiplayer.room={id:"test",hostId:"host",state:"inGame",players:[{id:"host"},{id:"p1"}]};var sent=[];sendServer=m=>sent.push(m);player.invulnerableTimer=0;player.lastDamageAt=0;var hpBefore=player.hp;var bolt={id:"balance-bolt"};damagePlayerFromProjectile(bolt,20,"Balance bolt",{fixed:true,ignoreOverlapGrace:true});');
  const packet=read(g,'sent.find(m=>m.type==="projectile-hit")');
  assert.equal(packet.amount,30);
  assert.equal(g.run("player.hp"),g.run("hpBefore"));
  g.run(`applyAuthoritativeProjectileDamage(${JSON.stringify(packet)});applyAuthoritativeProjectileDamage(${JSON.stringify(packet)});`);
  assert.equal(g.run("hpBefore-player.hp"),30);
  g.run('multiplayer.room.hostId="p1";loadBoss("cola");enterBossArena({fromParty:true});multiplayer.phaseSeq=9;multiplayer.peers.set("p2",{id:"p2",x:boss.x-100,y:boss.y,hp:375,maxHp:375,dead:false,room:"arena",bossKind:boss.kind,phaseSeq:9,updatedAt:Date.now(),weapon:"ironBlade",armor:"duelistCoat",weaponTag:"Melee"});var bossBefore=boss.hp;var intent={kind:"hit-intent",seq:1,phaseSeq:9,bossKind:boss.kind,encounter:"arena",targetKind:boss.kind,source:"Shot",baseAmount:39,options:{rogue:true}};applyRemoteHitIntent("p2",intent);applyRemoteHitIntent("p2",intent);');
  assert.equal(g.run("bossBefore-boss.hp"),39);
});

test("old saved encounters migrate health once and retain defeated or disabled targets", () => {
  for(const kind of ["cola","trio","sauce","pizza","nacho"]){
    const old=start(1);
    old.run(`loadBoss(${JSON.stringify(kind)});${kind==='nacho'?'startMazeForBoss(boss.kind);':'enterBossArena();'}player.hp=player.maxHp*.4;boss.hp=boss.maxHp*.4;for(const t of condimentBosses)t.hp=t.maxHp*.4;for(const t of RogueBosses.parts())t.hp=t.maxHp*.4;for(const t of mazeState?.enemies||[])t.hp=t.maxHp*.4;if(boss.kind==="trio")condimentBosses[0].hp=0;if(boss.kind==="pizza"){boss.toppingParts[0].hp=0;boss.toppingParts[0].disabledUntil=8;}RogueGame.saveCheckpoint();delete Arcade.progress.profile.journal.checkpoint.healthMultiplier;`);
    const saved=old.run('JSON.stringify(Arcade.progress.profile)');
    const restored=createGame({storage:{"boss-fight.profile.v2":saved}});
    restored.run('RogueGame.resume();');
    assert.ok(Math.abs(restored.run("player.hp/player.maxHp")-.4)<.002,kind+" player HP");
    if(kind==='nacho')assert.ok(restored.run('mazeState.enemies.every(e=>Math.abs(e.hp/e.maxHp-.4)<.01)'));
    else assert.ok(Math.abs(restored.run("boss.hp/boss.maxHp")-.4)<.002,kind+" boss HP");
    if(kind==='trio')assert.equal(restored.run('condimentBosses[0].hp'),0);
    if(kind==='pizza')assert.equal(restored.run('boss.toppingParts[0].hp'),0);
    const before=read(restored,'[player.hp,boss.hp,...condimentBosses.map(t=>t.hp),...RogueBosses.parts().map(t=>t.hp),...(mazeState?.enemies||[]).map(t=>t.hp)]');
    const again=createGame({storage:{"boss-fight.profile.v2":restored.run('JSON.stringify(Arcade.progress.profile)')}});
    again.run('RogueGame.resume();');
    assert.deepEqual(read(again,'[player.hp,boss.hp,...condimentBosses.map(t=>t.hp),...RogueBosses.parts().map(t=>t.hp),...(mazeState?.enemies||[]).map(t=>t.hp)]'),before,kind+" reload does not multiply again");
  }
});

test("training bolts remain nonlethal and health reward text matches the actual bonus", () => {
  const g=start();
  g.run('player.hp=2;player.invulnerableTimer=0;hazards=[{practice:true,x:player.x,y:player.y,vx:0,vy:0,r:8,ttl:2}];updateHazards(.01);');
  assert.equal(g.run("player.hp"),1);assert.equal(g.run("player.dead"),false);
  g.run('var hpBefore=player.maxHp;runState.mazeBuffs.maxHp=15;applyGear();');
  assert.equal(g.run("player.maxHp-hpBefore"),23);
  assert.match(g.run('mazeRewardPool.find(r=>r.id==="hp").description'),/\+23 maximum health/);
  assert.equal(g.run('arcadeBuffLabel("maxHp",15)'),"Maximum health: +23");
});
console.log(checks + " global combat balance groups passed.");
