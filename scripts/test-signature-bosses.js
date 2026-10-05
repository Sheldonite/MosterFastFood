const assert=require("node:assert/strict"),{createGame}=require("./game-test-harness");
let checks=0;
function test(name,fn){fn();checks++;console.log("PASS "+name);}
function start(kind){const g=createGame();g.run(`beginRun("practice",${JSON.stringify(kind)});closeClassMenu();enterBossArena();player.invulnerableTimer=999;boss.attackTimer=999;`);return g;}
function tick(g,seconds){for(let i=0;i<Math.ceil(seconds/.02);i++){g.advance(20);g.run('update(.02);draw();');}}
const read=(g,code)=>JSON.parse(g.run('JSON.stringify('+code+')'));

test("Taco locks the wall ram, physically crosses its lane and exposes the cracked shell",()=>{
  const g=start("taco");g.run('var hp=boss.hp;var from={x:boss.x,y:boss.y};SignatureBosses.begin("ram");var end={...boss.signature.to};var path=JSON.stringify(boss.signature.path);player.x+=200;player.y+=150;');
  tick(g,.8);assert.equal(g.run('boss.x'),g.run('from.x'));assert.equal(g.run('JSON.stringify(boss.signature.path)'),g.run('path'));
  tick(g,1.05);assert.ok(Math.abs(g.run('boss.x-end.x'))<.01);assert.ok(Math.abs(g.run('boss.y-end.y'))<.01);
  assert.equal(g.run('boss.shellCrackStacks'),1);assert.ok(g.run('boss.exposedFillingTimer')>3.7);assert.equal(g.run('boss.shellGuardActive'),false);assert.ok(g.run('boss.hp')<g.run('hp'));
  g.run('var before=boss.hp;damageBossTarget(boss,100,"Counter",{proc:true});');assert.equal(g.run('before-boss.hp'),235);
  tick(g,4.2);assert.equal(g.run('boss.shellGuardActive'),true);
});

test("Taco leaps to a locked landing and its expanding shell wave has a real escape gap",()=>{
  const g=start("taco");g.run('SignatureBosses.begin("crunch");var target={...boss.signature.to};player.x+=170;player.y+=140;');tick(g,1.18);
  assert.equal(g.run('boss.signature.step'),1);assert.ok(g.run('Math.hypot(boss.x-target.x,boss.y-target.y)')<.01);
  g.run('var ring=hazards.find(h=>h.shape==="ring");ring.warn=0;ring.activeAge=.5;ring.r=170;var gap=pointFromAngle(ring.x,ring.y,ring.gapAngle,170);var danger=pointFromAngle(ring.x,ring.y,ring.gapAngle+Math.PI,170);');
  assert.equal(g.run('SignatureBosses.touches(ring,{...gap,radius:18})'),false);assert.equal(g.run('SignatureBosses.touches(ring,{...danger,radius:18})'),true);
  assert.equal(g.run('SignatureBosses.touches(ring,{x:ring.x,y:ring.y,radius:18})'),false);
});

test("Salsa lobs warn before landing, tick at a bounded rate and expire before the next salvo",()=>{
  const g=start("taco");g.run('SignatureBosses.begin("salsa");var pool=hazards[0];player.x=pool.x;player.y=pool.y;player.invulnerableTimer=0;var hp=player.hp;');tick(g,.6);assert.equal(g.run('player.hp'),g.run('hp'));
  tick(g,.35);assert.ok(g.run('player.hp')<g.run('hp'));const after=g.run('player.hp');tick(g,.1);assert.equal(g.run('player.hp'),after);
  tick(g,4.2);assert.equal(g.run('hazards.some(h=>h.shape==="lob")'),false);
});

test("Sushi commits to a curved wasabi route and swept collision follows the moving head",()=>{
  const g=start("sushi");g.run('SignatureBosses.begin("thread");var route=JSON.stringify(boss.signature.path);var h=hazards[0];var locked={...boss.signature.target};player.x+=170;player.y+=150;');
  tick(g,.8);assert.equal(g.run('JSON.stringify(boss.signature.path)'),g.run('route'));
  assert.equal(g.run('SignatureBosses.touches(h,{...locked,radius:18})'),false);
  g.run('h.warn=0;h.activeAge=.4;h.previousActiveAge=.32;var p=SignatureBosses.pointOnPath(h.points,.4/.85);');
  assert.equal(g.run('SignatureBosses.touches(h,{...p,radius:18})'),true);
  assert.equal(g.run('SignatureBosses.touches(h,{x:p.x+250,y:p.y+250,radius:18})'),false);
  tick(g,1.4);assert.ok(g.run('boss.signatureRecovery')>0);assert.equal(g.run('boss.signature'),null);
});

test("paired chopsticks leave a safe corridor; soy tides damage only their colored front",()=>{
  const g=start("sushi");g.run('SignatureBosses.begin("pinch");var h=hazards[0];h.warn=0;h.activeAge=.75;var stick=SignatureBosses.pinchLines(h)[0];var middle={x:h.x,y:h.y,radius:18};var side={x:(stick.x+stick.x2)/2,y:(stick.y+stick.y2)/2,radius:18};');
  assert.equal(g.run('SignatureBosses.touches(h,middle)'),false);assert.equal(g.run('SignatureBosses.touches(h,side)'),true);
  g.run('SignatureBosses.cancel();SignatureBosses.begin("tide");h=hazards[0];h.warn=0;h.activeAge=1.5;var at=SignatureBosses.tidePosition(h);var safe=h.vertical?{x:h.gap,y:at,radius:18}:{x:at,y:h.gap,radius:18};var unsafe=h.vertical?{x:h.gap+120,y:at,radius:18}:{x:at,y:h.gap+120,radius:18};');
  assert.equal(g.run('SignatureBosses.touches(h,safe)'),false);assert.equal(g.run('SignatureBosses.touches(h,unsafe)'),true);
  g.run('unsafe[h.vertical?"y":"x"]+=80;');assert.equal(g.run('SignatureBosses.touches(h,unsafe)'),false);
});

test("weak-roll hits cancel Sushi attacks; phase changes clear obsolete hazards and add combinations",()=>{
  const g=start("sushi");g.run('SignatureBosses.begin("pinch");var weak=sushiSegments().find(s=>s.weak);damageBossTarget(boss,20,"Shot",{sushiSegment:weak.index});');
  assert.equal(g.run('boss.signature'),null);assert.equal(g.run('hazards.length'),0);assert.ok(g.run('boss.rogueRecovery')>0);
  g.run('boss.hp=boss.maxHp*.3;SignatureBosses.update(.02);');assert.equal(g.run('boss.phase'),3);assert.equal(g.run('boss.signatureName'),"Dragon Roll");
  g.run('boss.signatureRecovery=0;boss.rogueRecovery=0;SignatureBosses.begin("pinch");');assert.equal(g.run('hazards.length'),2);
  g.run('SignatureBosses.cancel();SignatureBosses.begin("tide");');assert.equal(g.run('hazards.length'),2);
  const taco=start("taco");taco.run('SignatureBosses.begin("ram");boss.hp=boss.maxHp*.6;SignatureBosses.update(.02);');assert.equal(taco.run('boss.phase'),2);assert.equal(taco.run('hazards.length'),0);
});

test("signature art bypasses legacy circle fallbacks and preserves the hazard list",()=>{
  const g=start("taco");
  g.run('SignatureBosses.begin("crunch");hazards.push({type:"slam",x:boss.x,y:boss.y,r:40,warn:1,ttl:2});var drawTypes=[];var originalTelegraph=Arcade.art.telegraph;Arcade.art.telegraph=(ctx,h)=>{drawTypes.push(h.type);return originalTelegraph(ctx,h);};var beforeDraw=hazards;drawHazards();');
  assert.deepEqual(read(g,'drawTypes'),['slam']);assert.equal(g.run('hazards===beforeDraw'),true);assert.equal(g.run('hazards.length'),2);
});

test("solo pause and reduced motion preserve gameplay; Practice retry resets the choreography",()=>{
  const g=start("taco");g.run('SignatureBosses.begin("crunch");openPauseMenu();');const before=g.run('JSON.stringify([boss.signature.elapsed,boss.x,hazards[0].warn])');tick(g,.4);assert.equal(g.run('JSON.stringify([boss.signature.elapsed,boss.x,hazards[0].warn])'),before);
  g.run('Arcade.screens.close(true);Arcade.settings.reducedMotion=true;');tick(g,.4);assert.ok(g.run('boss.signature.elapsed')>.39);
  g.run('player.hp=1;enterDeathState("fixture");requestEncounterRetry();');assert.equal(g.run('boss.signatureSeq'),0);assert.equal(g.run('hazards.length'),0);assert.equal(g.run('player.hp'),g.run('player.maxHp'));
});

function party(count,kind){
  const gs=Array.from({length:count},()=>createGame()),room={id:"signature",hostId:"p0",state:"inGame",players:gs.map((_,i)=>({id:"p"+i}))};
  gs.forEach((g,i)=>g.run(`multiplayer.mode="multiplayer";multiplayer.connected=true;multiplayer.enabled=true;multiplayer.id="p${i}";multiplayer.room=${JSON.stringify(room)};multiplayer.socket={readyState:1};var outbound=[];sendServer=m=>outbound.push(m);beginRun("practice",${JSON.stringify(kind)});closeClassMenu();enterBossArena({fromParty:true});multiplayer.partyPhase="arena";multiplayer.phaseSeq=3;boss.attackTimer=999;player.invulnerableTimer=999;outbound=[];`));
  function relay(){for(const m of read(gs[0],'outbound.splice(0)'))if(m.type==="event")gs.slice(1).forEach(g=>g.run(`handleMultiplayerMessage({type:"peer-event",id:"p0",event:${JSON.stringify(m.event)}});`));}
  return {gs,host:gs[0],relay};
}
test("two and four players receive host-owned paths, warnings, guard state and attack cancellations",()=>{
  for(const count of [2,4])for(const kind of ["taco","sushi"]){
    const {gs,host,relay}=party(count,kind);host.run(`SignatureBosses.begin(${JSON.stringify(kind==='taco'?'ram':'thread')});`);relay();
    for(const client of gs.slice(1)){
      client.run('updateRemoteHostileActors(.02);');assert.equal(client.run('boss.signatureSeq'),host.run('boss.signatureSeq'));
      assert.equal(client.run('boss.signature.pattern'),host.run('boss.signature.pattern'));
      assert.equal(client.run('hazards[0].points.length'),19);
      assert.deepEqual(read(client,'hazards[0].points'),read(host,'hazards[0].points'));
      const seq=client.run('boss.signatureSeq');assert.equal(client.run('SignatureBosses.begin("pinch")'),false);assert.equal(client.run('boss.signatureSeq'),seq);
    }
    host.run('SignatureBosses.cancel();sendHostileSync(true);');relay();
    for(const client of gs.slice(1)){client.run('updateRemoteHostileActors(.02);SignatureBosses.updateHazards(.02);');assert.equal(client.run('hazards.length'),0);}
    if(kind==='taco'){host.run('boss.exposedFillingTimer=2;boss.shellGuardActive=false;sendHostileSync(true);');relay();gs.slice(1).forEach(g=>{g.run('updateRemoteHostileActors(.02);');assert.equal(g.run('boss.shellGuardActive'),false);assert.equal(g.run('boss.exposedFillingTimer'),2);});}
  }
});

test("new hazard damage stays server-mediated, boosted once and deduplicated per player",()=>{
  const {gs,host,relay}=party(2,"sushi");host.run('SignatureBosses.begin("pinch");');relay();const client=gs[1];
  client.run('updateRemoteHostileActors(.02);var h=hazards[0];player.invulnerableTimer=0;SignatureBosses.hit(h);SignatureBosses.hit(h);');
  const packets=read(client,'outbound.filter(m=>m.type==="projectile-hit")');assert.equal(packets.length,1);assert.equal(packets[0].amount,12);
  client.run(`var hp=player.hp;applyAuthoritativeProjectileDamage(${JSON.stringify(packets[0])});applyAuthoritativeProjectileDamage(${JSON.stringify(packets[0])});`);
  assert.equal(client.run('hp-player.hp'),client.run('Math.max(1,Math.ceil(12*combatTuning.incomingDamageMultiplier-effectivePlayerArmor()))'));
});

test("all classes can damage both bosses, complete their phases and retain Practice reward rules",()=>{
  for(const kind of ["taco","sushi"])for(const hero of ["warrior","ranger","mage","rogue","paladin","bard"]){
    const g=start(kind);g.run(`runState.buildLocked=false;equipClass(${JSON.stringify(hero)});boss.hp=boss.maxHp*.6;update(.02);`);assert.equal(g.run('boss.phase'),2);
    g.run('boss.hp=boss.maxHp*.3;update(.02);');assert.equal(g.run('boss.phase'),3);
    g.run('boss.shellGuardActive=false;var before=boss.hp;damageBossTarget(boss,playerDamage(),"Class hit",{proc:true});');assert.ok(g.run('boss.hp')<g.run('before'));
    g.run('damageBossTarget(boss,999999,"Finish",{tacoBypassGuard:true});');assert.equal(g.run('boss.hp'),0);assert.equal(g.run('Arcade.progress.total()'),0,"Practice awards no Marks");
    if(kind==='sushi')assert.equal(g.run('player.won'),true);else assert.ok(g.run('intermission'));
  }
});
console.log(checks+" Taco and Sushi signature encounter groups passed.");
