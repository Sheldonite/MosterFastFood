const assert = require("node:assert/strict");
const { createGame } = require("./game-test-harness");
let checks = 0;
function test(name, fn) { fn(); checks++; console.log("PASS " + name); }
function start(g, mode = "single") {
  g.run(`beginRun(${JSON.stringify(mode)},"trio");closeClassMenu();enterBossArena();`);
}
function killTrio(g) { g.run('activeBosses().slice().forEach(t=>damageBossTarget(t,99999,"Fusion fixture"));'); }
function finishFusion(g) { g.run('for(let i=0;i<73;i++){update(.1);draw();renderUi();}'); }
function chooseRelic(g) { g.advance(651); g.run('chooseMazeReward(mazeState.rewardOptions[0].id);confirmMazeReward();'); g.advance(281); }

test("the last bottle starts a protected reveal, then one phase-two clear earns one reward", () => {
  const g = createGame(); start(g);
  g.run('player.hp=79;player.potions=1;player.abilityCooldowns=[3,4,5,6];runState.mazeBuffs.damageMultiplier=.12;condimentBosses[0].x=900;damageBossTarget(condimentBosses[0],99999,"Test");damageBossTarget(condimentBosses[1],99999,"Test");');
  assert.equal(g.run('CondimentFusion.active()'), false);
  assert.equal(g.run('boss.condimentRemains[0].x'), 900);
  assert.equal(g.run('Arcade.progress.total()'), 0);
  g.run('movementKeys.right=true;primaryAttackHeld=true;player.slide={vx:400,vy:0,timer:2};RogueCombat.state.buffer={index:0,until:999};hazards.push({type:"bolt",ttl:9});playerProjectiles.push({ttl:9});damageBossTarget(condimentBosses[2],99999,"Test");');
  assert.equal(g.run('CondimentFusion.active()'), true);
  assert.equal(g.run('intermission'), null);
  assert.equal(g.run('Arcade.screens.current'), null);
  assert.equal(g.run('arcadeInputAllowed()'), false);
  assert.equal(g.run('RogueCombat.state.buffer'), null);
  assert.equal(g.run('hazards.length+playerProjectiles.length'), 0);
  assert.equal(g.run('movementKeys.right'), false);
  assert.equal(g.run('player.slide'),null);
  assert.equal(g.run('primaryAttackHeld'),false);
  assert.equal(g.run('damagePlayer(99999,"Late projectile",{fixed:true})'), false);
  g.run('winFight();'); assert.equal(g.run('boss.condimentFusion.elapsed'), 0);
  finishFusion(g);
  assert.equal(g.run('boss.kind'), "sauce"); assert.equal(g.run('boss.phase'), 2);
  assert.equal(g.run('boss.encounterId'), "trio"); assert.equal(g.run('player.room'), "arena");
  assert.equal(g.run('player.hp'), 79); assert.equal(g.run('player.potions'), 1);
  assert.ok(g.run('player.abilityCooldowns[3]') >= 5.8, "cinematic time does not clear cooldowns");
  assert.equal(g.run('runState.mazeBuffs.damageMultiplier'), .12);
  assert.equal(g.run('Arcade.progress.total()'), 0);
  g.run('damageBossTarget(boss,99999,"Test");winFight();');
  assert.equal(g.run('clearedBosses.length'), 1);
  assert.equal(g.run('Arcade.progress.profile.journal.bosses.join()'), "trio");
  assert.equal(g.run('Arcade.screens.current.id'), "mazeRewardOverlay");
  assert.equal(g.run('intermission.nextBoss'), "shake");
  chooseRelic(g); g.run('continueArcadeRun();');
  assert.equal(g.run('boss.kind'), "shake");
  assert.equal(g.run('debugReportState.lastErrorAtByKey.size'), 0);
});

test("solo pause freezes the reveal; reduced motion follows the same gameplay timing", () => {
  for (const reduced of [false, true]) {
    const g = createGame(); start(g); killTrio(g);
    g.run(`Arcade.settings.reducedMotion=${reduced};update(2);openPauseMenu();update(2);draw();`);
    assert.equal(g.run('boss.condimentFusion.elapsed'), 2);
    g.key("Escape"); g.run('update(2);draw();renderUi();');
    assert.equal(g.run('boss.condimentFusion.elapsed'), 4);
    assert.equal(g.document.getElementById("fusionOverlay").hidden, false);
    assert.equal(g.document.getElementById("fusionTitle").textContent, "THREE BECOME ONE");
    g.run('update(3.2);draw();renderUi();');
    assert.equal(g.run('boss.kind'), "sauce");
    assert.equal(g.document.getElementById("fusionOverlay").hidden, true);
    if (reduced) assert.equal(g.run('cosmeticShakeUntil'), 0);
    assert.equal(g.run('debugReportState.lastErrorAtByKey.size'), 0);
  }
});

test("solo reload restores both the fusion clock and the merged second phase without rewards", () => {
  const g = createGame(); start(g); killTrio(g);
  g.run('player.hp=83;player.potions=1;update(3.3);RogueGame.saveCheckpoint();');
  const restore = original => {
    const next = createGame({ storage: { "boss-fight.profile.v2": original.run('localStorage.getItem("boss-fight.profile.v2")') } });
    next.run('RogueGame.resume();'); return next;
  };
  const a = restore(g);
  assert.equal(a.run('boss.condimentFusion.elapsed'), 3.3);
  assert.equal(a.run('boss.condimentFusion.remains.length'), 3);
  assert.equal(a.run('player.hp'), 83); assert.equal(a.run('player.potions'), 1);
  a.run('update(3.9);boss.hp=211;RogueGame.saveCheckpoint();');
  const b = restore(a);
  assert.equal(b.run('boss.kind'), "sauce"); assert.equal(b.run('boss.phase'), 2);
  assert.equal(b.run('boss.hp'), 211); assert.equal(b.run('boss.encounterId'), "trio");
  assert.equal(b.run('Arcade.progress.total()'), 0);
  b.run('damageBossTarget(boss,99999,"Test");');
  assert.equal(b.run('Arcade.progress.profile.journal.bosses.join()'), "trio");
});

test("Practice retries restart the entire combined encounter and never bank a phase", () => {
  const g = createGame(); start(g, "practice"); killTrio(g); finishFusion(g);
  g.run('player.invulnerableTimer=0;damagePlayer(99999,"Test",{fixed:true,ignoreOverlapGrace:true});requestEncounterRetry();');
  assert.equal(g.run('boss.kind'), "trio");
  assert.equal(g.run('condimentBosses.filter(t=>t.hp===t.maxHp).length'), 3);
  assert.equal(g.run('CondimentFusion.active()'), false);
  assert.equal(g.run('player.hp'), g.run('player.maxHp')); assert.equal(g.run('player.potions'), 3);
  assert.equal(g.run('Arcade.progress.total()'), 0);
});

function party(count) {
  const gs = Array.from({ length: count }, () => createGame());
  const room = { id: "fusion", state: "inGame", hostId: "p0", players: gs.map((_,i)=>({id:"p"+i,name:"Hero "+i})) };
  gs.forEach((g,i)=>g.run(`multiplayer.mode="multiplayer";multiplayer.enabled=true;multiplayer.connected=true;multiplayer.id="p${i}";multiplayer.room=${JSON.stringify(room)};multiplayer.socket={readyState:1};var outbound=[];sendServer=m=>{outbound.push(m);return true;};beginRun("multiplayer","trio");closeClassMenu();enterBossArena({fromParty:true});`));
  function relay() {
    for (let pass=0;pass<30;pass++) {
      let count=0;
      gs.forEach((from,i)=>{ for(const m of JSON.parse(from.run('JSON.stringify(outbound.splice(0))'))) {
        count++; gs.forEach((to,j)=>{if(i===j)return;
          const msg=m.type==="event"?{type:"peer-event",id:"p"+i,event:m.event}:m.type==="state"?{type:"peer-state",id:"p"+i,state:m.state}:null;
          if(msg)to.run(`handleMultiplayerMessage(${JSON.stringify(msg)});`);
        });
      }});
      if(!count)return;
    }
    throw new Error("Unbounded fusion relay");
  }
  relay(); return {gs,host:gs[0],client:gs[1],relay};
}

test("two and four clients follow one host clock, preserve spectators and recover missed phase events", () => {
  for (const count of [2,4]) {
    const {gs,host,client,relay} = party(count);
    gs.forEach(g=>g.run('player.hp=91;player.potions=1;'));
    if(count===4){gs[3].run('player.dead=true;player.hp=0;sendMultiplayerState(true);');relay();}
    killTrio(host); relay();
    gs.forEach(g=>assert.equal(g.run('CondimentFusion.active()'),true));
    const seq=host.run('multiplayer.phaseSeq');
    client.run('update(8);'); assert.equal(client.run('boss.kind'),"trio", "client cannot start combat without host");
    client.run('openPauseMenu();update(.1);'); assert.equal(client.run('boss.condimentFusion.elapsed'),7.2);
    host.run('update(4);sendMultiplayerState(true);'); relay();
    const duplicate=host.run('JSON.stringify(multiplayer.lastPartyPhaseEvent)');
    client.run(`handleMultiplayerEvent("p0",${duplicate});`);
    assert.equal(client.run('boss.condimentFusion.elapsed'),7.2,"duplicate transition cannot rewind");
    finishFusion(host); relay();
    gs.forEach(g=>{assert.equal(g.run('boss.kind'),"sauce");assert.equal(g.run('boss.phase'),2);assert.equal(g.run('multiplayer.phaseSeq'),seq+1);assert.equal(g.run('player.potions'),1);});
    assert.equal(gs.at(-1).run('player.dead'),count===4);
    assert.equal(client.run('player.hp'),91);
    // Snapshot recovery also carries the combined encounter identity and never refills resources.
    const snapshot=host.run('JSON.stringify(multiplayerSnapshot())');
    client.run('Arcade.screens.close(true);loadBoss("trio");');
    client.run(`handleMultiplayerMessage({type:"peer-state",id:"p0",state:${snapshot}});`);
    assert.equal(client.run('boss.kind'),"sauce"); assert.equal(client.run('boss.encounterId'),"trio");
    assert.equal(client.run('player.hp'),91);
    host.run('damageBossTarget(boss,99999,"Test");'); relay();
    gs.forEach(g=>{assert.equal(g.run('clearedBosses.length'),1);assert.equal(g.run('Arcade.progress.profile.journal.bosses.join()'),"trio");assert.equal(g.run('intermission.nextBoss'),"shake");assert.equal(g.run('debugReportState.lastErrorAtByKey.size'),0);});
  }
});

test("host departure during fusion banks confirmed clears without granting the unfinished fight", () => {
  const {host,client,relay} = party(2);
  client.run('Arcade.progress.record("bosses","cola");'); killTrio(host); relay();
  client.run('returnToMultiplayerLobby("Host left.");');
  assert.equal(client.run('Arcade.progress.profile.marks'),3);
  assert.equal(client.run('Arcade.progress.profile.lastResult.bosses'),1);
});

test("existing banked profiles retain currency and merge historical sauce IDs and final milestones", () => {
  const legacy={version:2,marks:77,owned:[],builds:{},milestones:[1,3,6,11],journal:{id:"old-run",mode:"single",practice:false,bosses:["trio","sauce"],contracts:[],settled:false},lastResult:null};
  const g=createGame({storage:{"boss-fight.profile.v2":JSON.stringify(legacy)}});
  assert.equal(g.run('Arcade.progress.profile.marks'),77);
  assert.equal(g.run('Arcade.progress.profile.milestones.join()'),"1,3,6,10");
  assert.equal(g.run('Arcade.progress.profile.journal.bosses.join()'),"trio");
  assert.equal(g.run('Arcade.progress.record("bosses","sauce")'),false);
  assert.equal(g.run('Arcade.progress.total()'),1);
});
console.log(checks + " combined condiment encounter groups passed.");
