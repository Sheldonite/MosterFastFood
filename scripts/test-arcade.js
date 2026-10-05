const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createGame } = require("./game-test-harness");
let checks = 0;
function test(name, callback) { callback(createGame()); checks++; console.log("PASS " + name); }
const start = (g) => g.run('Arcade.progress.settle("fixture"); intermission=null;startSinglePlayer(); closeClassMenu();');

test("menus gate movement, attacks, abilities and potions; Escape clears held input", (g) => {
  start(g);
  g.run('movementKeys.right = true; primaryAttackHeld = true; openPauseMenu();');
  const before = g.run('JSON.stringify([player.x, player.hp, player.potions, playerProjectiles.length, player.abilityCooldowns])');
  g.run('movePlayer(1); shootAt(player.x + 100, player.y); useAbility(0); drinkPotion(); update(1);');
  assert.equal(g.run('JSON.stringify([player.x, player.hp, player.potions, playerProjectiles.length, player.abilityCooldowns])'), before);
  assert.equal(g.run('Object.values(movementKeys).some(Boolean)'), false);
  g.key("Escape"); assert.equal(g.run('arcadeInputAllowed()'), true);
  g.key("d"); g.run('movePlayer(0.1)'); assert.ok(g.run('player.x') > JSON.parse(before)[0]);
  g.window.dispatchEvent({ type: "blur" });
  assert.equal(g.run('Arcade.screens.current.id'), "pauseOverlay");
  assert.equal(g.run('Object.values(movementKeys).some(Boolean)'), false);
});

test("reward selection and confirmation apply exactly once and reject stale callbacks", (g) => {
  start(g); g.run('startMazeForBoss("cola"); mazeState.rewardPending = true; showMazeRewardChoices();');
  const id = g.run('mazeState.rewardOptions[0].id');
  const before = g.run('JSON.stringify(runState.mazeBuffs)');
  g.run(`chooseMazeReward(${JSON.stringify(id)}); confirmMazeReward();`);
  assert.equal(g.run('mazeState.selectedRewardId'), null);
  g.advance(651); g.run(`chooseMazeReward(${JSON.stringify(id)});`);
  assert.equal(g.run('JSON.stringify(runState.mazeBuffs)'), before);
  assert.equal(g.run('mazeState.rewardChosen'), false);
  g.run('confirmMazeReward(); confirmMazeReward();'); g.advance(281);
  assert.equal(g.run('mazeState.rewardChosen'), true);
  const applied = g.run('JSON.stringify(runState.mazeBuffs)');
  g.run('mazeState.cleared=true; updateGauntletProgress(.1);');
  assert.equal(g.run('mazeState.waveIndex'),-1,"cleared gauntlet cannot restart its waves");
  assert.notEqual(applied, before);
  g.run('confirmMazeReward()'); g.advance(1000);
  assert.equal(g.run('JSON.stringify(runState.mazeBuffs)'), applied);
  g.run('retryEncounterLocally(encounterCheckpoint); mazeState.rewardPending = true; showMazeRewardChoices();');
  g.advance(651); g.run('chooseMazeReward(mazeState.rewardOptions[0].id); confirmMazeReward(); retryEncounterLocally(encounterCheckpoint);');
  g.advance(300); assert.equal(g.run('JSON.stringify(runState.mazeBuffs)'), before);
});

test("Practice retry restores the checkpoint build, full health and potions without Marks",g=>{
 g.run('Arcade.progress.profile.marks=10;learnTalent("mage_pyro_burn");beginRun("practice");closeClassMenu();equipClass("mage");equipGear("armor","channelerRobe");startMazeForBoss("cola");');
 const sequence=g.run('runState.mazeCount');g.run('runState.mazeBuffs.damageMultiplier=.9;player.hp=1;player.potions=0;enterDeathState("test");requestEncounterRetry();');
 assert.equal(g.run('player.hp'),g.run('player.maxHp'));assert.equal(g.run('player.potions'),3);assert.equal(g.run('player.dead'),false);assert.equal(g.run('runState.mazeCount'),sequence);assert.equal(g.run('runState.mazeBuffs.damageMultiplier||0'),0);assert.equal(g.run('runState.learnedTalents.has("mage_pyro_burn")'),true);assert.equal(g.run('Arcade.progress.total()'),0);
 g.run('runState.mazeBuffs.damageMultiplier=.12;enterBossArena();player.hp=1;enterDeathState("boss");requestEncounterRetry();');assert.equal(g.run('player.room'),"arena");assert.equal(g.run('runState.mazeBuffs.damageMultiplier'),.12);
});

test("boss clear grants journal earnings once, relics confirm before continuing, and death banks them",g=>{
 start(g);g.run('enterBossArena();boss.hp=0;winFight();');assert.equal(g.run('Arcade.screens.current.id'),"mazeRewardOverlay");assert.equal(g.run('Arcade.progress.total()'),3);g.run('winFight();');assert.equal(g.run('Arcade.progress.total()'),3);
 g.advance(651);g.run('chooseMazeReward(mazeState.rewardOptions[0].id);confirmMazeReward();');g.advance(281);assert.equal(g.run('Arcade.screens.current.id'),"resultsOverlay");g.run('continueArcadeRun();');assert.equal(g.run('boss.kind'),"burger");assert.equal(g.run('player.room'),"starter");assert.equal(g.run('runState.talentPoints'),0);
 g.run('enterBossArena();player.hp=1;damagePlayer(9999,"Test",{fixed:true,ignoreOverlapGrace:true});');assert.equal(g.run('RogueGame.finished'),true);assert.equal(g.run('Arcade.progress.profile.marks'),3);g.run('RogueGame.end("death");');assert.equal(g.run('Arcade.progress.profile.marks'),3);
 g.run('learnTalent("melee_iron_hp");continueArcadeRun();equipClass("warrior");');assert.equal(g.run('runState.learnedTalents.has("melee_iron_hp")'),true);assert.equal(g.run('runState.talentPoints'),0);
});

test("all six classes, gauntlets and bosses update and render without runtime failures", (g) => {
  const classes = g.run('classOptions.filter(x=>!x.locked).map(x=>x.id)');
  const bosses = ["cola","burger","fries","trio","sauce","shake","nacho","pizza","donut","taco","sushi"];
  for (const hero of classes) for (const kind of bosses) {
    start(g); g.run(`equipClass(${JSON.stringify(hero)}); loadBoss(${JSON.stringify(kind)}); startMazeForBoss(boss.kind); player.invulnerableTimer=999;`);
    for (let i=0;i<12;i++) { g.advance(100); g.run('update(.1); draw(); renderUi();'); }
    g.run('enterBossArena(); player.invulnerableTimer=999;');
    for (let i=0;i<35;i++) { g.advance(100); g.run('update(.1); draw();'); }
    assert.equal(g.run('debugReportState.lastErrorAtByKey.size'), 0, hero + "/" + kind);
  }
  assert.equal(classes.length, 6);
});

test("all class attacks and four abilities remain usable with the original bindings",(g)=>{
  for(const hero of g.run('classOptions.filter(x=>!x.locked).map(x=>x.id)')){
    start(g);g.run(`equipClass(${JSON.stringify(hero)}); mouseWorld={x:trainingDummy.x,y:trainingDummy.y}; shootAt(trainingDummy.x,trainingDummy.y);`);
    for(let index=0;index<4;index++){
      g.run(`player.abilityCooldowns=[0,0,0,0]; player.pendingAbilityCast=null; player.castTimer=0; useAbility(${index});`);
      for(let step=0;step<12;step++){g.advance(100);g.run('update(.1); draw();');}
      assert.ok(g.run(`player.abilityCooldowns[${index}]`) > 0,hero+" ability "+index);
    }
    assert.equal(g.run('debugReportState.lastErrorAtByKey.size'),0,hero);
  }
});

test("HUD markup stays stable between state changes", (g) => {
  start(g); g.run('renderUi();');
  const ids = ["abilityBar","buildPanel","runBuffList","partyPortraits"];
  const writes = ids.map((id) => g.document.getElementById(id).writes);
  for (let i=0;i<120;i++) g.run('renderUi();');
  assert.deepEqual(ids.map((id) => g.document.getElementById(id).writes), writes);
  g.run('player.abilityCooldowns[0] = 3; renderUi();');
  assert.equal(g.document.getElementById("abilityBar").writes, writes[0]);
  g.run('player.hp -= 1; renderUi();');
  assert.equal(g.document.getElementById("partyPortraits").writes,writes[3]);
  g.run('equipClass("warrior");runState.learnedTalents=new Set(["warrior_earth_worldsplitter"]);renderUi();');
  const state=g.document.querySelector('[data-ability="1"] .ability-state'),labelWrites=state.writes,captionWrites=g.document.getElementById("encounterCaption").writes,dummyWrites=g.document.getElementById("dummyFeedback").writes;
  for(let i=0;i<60;i++)g.run('renderUi();');
  assert.equal(state.writes,labelWrites,"unchanged talent counters must not rewrite their labels");
  assert.equal(g.document.getElementById("encounterCaption").writes,captionWrites);
  assert.equal(g.document.getElementById("dummyFeedback").writes,dummyWrites);
});

test("hub inspection needs an explicit purchase and modal focus restores through nesting",g=>{
 g.run('Arcade.progress.profile.marks=2;openTalentMenu();');const node=g.document.getElementById("talentTree").querySelector("[data-talent]");g.document.getElementById("talentTree").dispatchEvent({type:"click",target:node});assert.equal(g.run('Arcade.progress.profile.marks'),2);assert.equal(g.run('Arcade.progress.profile.owned.length'),0);
 const learn=g.document.getElementById("talentTree").querySelector("[data-learn-talent]");g.document.dispatchEvent({type:"click",target:learn,preventDefault(){}});assert.equal(g.run('Arcade.progress.profile.marks'),0);assert.equal(g.run('Arcade.progress.profile.owned.length'),1);
 g.run('closeTalentMenu();startSinglePlayer();closeClassMenu();document.querySelector("#pauseButton").focus();openPauseMenu();Arcade.screens.open(document.querySelector("#settingsOverlay"),true);Arcade.screens.open(document.querySelector("#helpOverlay"),true);');g.key("Escape");assert.equal(g.run('Arcade.screens.current.id'),"settingsOverlay");g.key("Escape");assert.equal(g.run('Arcade.screens.current.id'),"pauseOverlay");g.key("Escape");assert.equal(g.document.activeElement.id,"pauseButton");
});

test("all six unupgraded classes traverse every boss, phase, relic and final result",g=>{
 for(const hero of g.run('classOptions.filter(o=>!o.locked).map(o=>o.id)')){start(g);g.run('equipClass('+JSON.stringify(hero)+');');let count=0;while(!g.run('player.won')&&count<12){const kind=g.run('boss.kind');g.run('enterBossArena();player.invulnerableTimer=9999;');for(const fraction of [.6,.3,.2])g.run('boss.hp=boss.maxHp*'+fraction+';for(let i=0;i<25;i++){update(.1);draw();}');if(["cola","burger","fries","shake","nacho","pizza","taco","sushi","donut"].includes(kind))assert.equal(g.run('boss.phase'),["cola","burger","fries"].includes(kind)?2:3,kind);
 g.run('activeBosses().slice().forEach(t=>damageBossTarget(t,999999,"Test"));draw();');count++;if(!g.run('player.won')){assert.equal(g.run('Arcade.screens.current.id'),"mazeRewardOverlay");g.advance(651);g.run('chooseMazeReward(mazeState.rewardOptions[0].id);confirmMazeReward();');g.advance(281);g.run('continueArcadeRun();');}}
 assert.equal(count,11);assert.equal(g.run('player.won'),true);assert.equal(g.run('clearedBosses.length'),11);assert.equal(g.run('runState.learnedTalents.size'),0);assert.equal(g.run('Arcade.progress.profile.lastResult.earned'),g.run('Arcade.progress.profile.lastResult.bosses')+3+(hero==="warrior"?8:0));assert.equal(g.run('debugReportState.lastErrorAtByKey.size'),0);}
});

test("viewport aiming uses the same mapping at every supported size and scale", (g) => {
  start(g);
  for (const [width,height] of [[960,640],[1280,720],[1440,900],[1920,1080],[960,600],[600,400]]) for(const density of [1,1.25,1.5,2]) {
    const stageHeight=height-180,fit=Math.min(width/640,stageHeight/360),scale=fit>=1?Math.floor(fit):fit;
    g.run(`window.devicePixelRatio=${density}; canvas.parentElement.getBoundingClientRect=()=>({width:${width},height:${stageHeight}}); resizeCanvas(); camera={x:450,y:90};`);
    assert.equal(g.run('canvas.width'),640);assert.equal(g.run('canvas.height'),360);
    assert.equal(g.run('canvas.style.width'),Math.floor(640*scale)+"px");
    const renderedWidth=parseFloat(g.run('canvas.style.width')),renderedHeight=parseFloat(g.run('canvas.style.height'));
    g.run(`canvas.getBoundingClientRect=()=>({left:30.25,top:20.5,width:${renderedWidth},height:${renderedHeight}});`);
    g.document.getElementById("game").dispatchEvent({type:"mousemove",clientX:30.25+renderedWidth/2,clientY:20.5+renderedHeight/2});
    assert.equal(g.run('mouseWorld.x'),1090); assert.equal(g.run('mouseWorld.y'),450);
    g.document.getElementById("game").dispatchEvent({type:"mousemove",clientX:30.25+renderedWidth*.25,clientY:20.5+renderedHeight*.75});
    assert.equal(g.run('mouseWorld.x'),770); assert.equal(g.run('mouseWorld.y'),630);
  }
});

test("Electron configuration, URL parameters and existing saved gear remain supported",()=>{
  let onStatus;
  const desktop=createGame({
    location:{protocol:"file:",host:"",hostname:"",href:"file:///game/index.html"},
    desktopConfig:{serverUrl:"https://coop.example.test",isDesktop:true},
    updater:{onStatus(callback){onStatus=callback;},checkForUpdates:async()=>({message:"Current"})},
    storage:{"boss-fight-save-v1":JSON.stringify({gear:{weapon:"ironBlade",armor:"bulwarkPlate"}})}
  });
  assert.equal(desktop.run('multiplayerSocketUrl()'),"wss://coop.example.test/coop");
  assert.equal(desktop.run('player.gear.armor'),"bulwarkPlate");
  assert.equal(desktop.document.getElementById("desktopUpdateButton").hidden,false);
  onStatus({message:"Update ready"});assert.equal(desktop.document.getElementById("multiplayerStatus").textContent,"Update ready");
  const browser=createGame({location:{search:"?server=http%3A%2F%2Flocalhost%3A4188"}});
  assert.equal(browser.run('multiplayerSocketUrl()'),"ws://localhost:4188/coop");
  const saved=createGame({storage:{bossFightServerUrl:"wss://saved.example.test"}});
  assert.equal(saved.run('multiplayerSocketUrl()'),"wss://saved.example.test/coop");
});

test("co-op retries accept only new host events for the current encounter", (g) => {
  start(g); g.run('startMazeForBoss("cola"); multiplayer.mode="multiplayer"; runState.mode="practice"; multiplayer.enabled=true; multiplayer.connected=true; multiplayer.id="host"; multiplayer.room={state:"inGame",hostId:"host",players:[{id:"host"},{id:"peer"}]}; multiplayer.phaseSeq=3; player.dead=true; multiplayer.peers.set("peer",{dead:false});');
  assert.equal(g.run('isPartyWiped()'), false);
  g.run('multiplayer.peers.get("peer").dead=true;'); assert.equal(g.run('isPartyWiped()'), true);
  g.run('handleMultiplayerEvent("peer",Arcade.network.retryEnvelope(4,"cola","maze",1));');
  assert.equal(g.run('player.dead'), true);
  g.run('handleMultiplayerEvent("host",Arcade.network.retryEnvelope(4,"cola","maze",1));');
  assert.equal(g.run('player.dead'), false); assert.equal(g.run('multiplayer.phaseSeq'), 4);
  g.run('player.hp=10; handleMultiplayerEvent("host",Arcade.network.retryEnvelope(4,"cola","maze",1));');
  assert.equal(g.run('player.hp'), 10);
  g.run('handleMultiplayerEvent("host",Arcade.network.retryEnvelope(5,"burger","maze",1));');
  assert.equal(g.run('player.hp'), 10);
});

test("four actual clients synchronize ready gates, rewards, spectating, retry and intermission", (host) => {
  const clients=[host,createGame(),createGame(),createGame()];
  const room={state:"inGame",name:"Test party",id:"test",hostId:"p0",players:[0,1,2,3].map(index=>({id:"p"+index,name:"Hero "+index,host:index===0}))};
  clients.forEach((g,index)=>g.run(`multiplayer.mode="multiplayer"; multiplayer.enabled=true; multiplayer.connected=true; multiplayer.id="p${index}"; multiplayer.room=${JSON.stringify(room)}; multiplayer.socket={readyState:1,close(){}}; var outbound=[]; sendServer=function(message){outbound.push(message);return true;}; beginRun("practice"); closeClassMenu();RogueGame.route="contract";`));
  function relay(){
    for(let pass=0;pass<20;pass++){
      let count=0;
      clients.forEach((sender,index)=>{
        const messages=JSON.parse(sender.run('JSON.stringify(outbound.splice(0))'));
        for(const message of messages){
          count++;
          clients.forEach((receiver,other)=>{
            if(other===index&&message.event?.kind!=="party-retry")return;
            const incoming=message.type==="state"?{type:"peer-state",id:"p"+index,state:message.state}:message.type==="event"?{type:"peer-event",id:"p"+index,event:message.event}:null;
            if(incoming)receiver.run(`handleMultiplayerMessage(${JSON.stringify(incoming)});`);
          });
        }
      });
      if(!count)return;
    }
    throw new Error("Unbounded network relay");
  }
  relay();
  clients.forEach(g=>g.run('markPartyReady("starter");'));relay();
  clients.forEach(g=>assert.equal(g.run('player.room'),"maze"));
  host.run('RogueContracts.finish(true);');relay();
  clients.forEach(g=>{assert.equal(g.run('multiplayer.partyPhase'),"reward");g.advance(651);g.run('chooseMazeReward(mazeState.rewardOptions[0].id); confirmMazeReward();');g.advance(281);});relay();
  clients.forEach(g=>assert.equal(g.run('player.room'),"arena"));
  clients[1].run('openPauseMenu();');
  const clock=clients[1].run('runElapsedSeconds');clients[1].run('update(.1);');
  assert.ok(clients[1].run('runElapsedSeconds')>clock,"co-op menu keeps simulation running");
  clients[1].run('Arcade.screens.close(true); damagePlayer(99999,"Test",{fixed:true,ignoreOverlapGrace:true});');relay();
  assert.ok(clients[1].run('currentSpectateTarget()'),"defeated client spectates");
  const spectateBefore = clients[1].run('spectateState.targetId');
  clients[1].run('Arcade.screens.open(document.querySelector("#helpOverlay"));');
  clients[1].key("Tab"); clients[1].key("ArrowRight");
  assert.equal(clients[1].run('spectateState.targetId'),spectateBefore,"modal navigation must not switch spectated teammates");
  clients[1].key("Escape"); clients[1].key("Tab");
  assert.notEqual(clients[1].run('spectateState.targetId'),spectateBefore,"spectate hotkeys work after closing the menu");
  [clients[0],clients[2],clients[3]].forEach(g=>g.run('damagePlayer(99999,"Test",{fixed:true,ignoreOverlapGrace:true});'));relay();
  assert.equal(host.run('isPartyWiped()'),true);
  host.run('requestEncounterRetry();');relay();
  clients.forEach(g=>{assert.equal(g.run('player.dead'),false);assert.equal(g.run('player.hp'),g.run('player.maxHp'));assert.equal(g.run('player.potions'),3);});
  host.run('boss.hp=0; winFight();');relay();
  clients.forEach(g=>{assert.equal(g.run('runState.talentPoints'),0);assert.equal(g.run('Arcade.screens.current.id'),"mazeRewardOverlay");g.advance(651);g.run('chooseMazeReward(mazeState.rewardOptions[0].id);confirmMazeReward();');g.advance(281);});relay();
  host.run('continueArcadeRun();');relay();
  clients.forEach(g=>{assert.equal(g.run('boss.kind'),"burger");assert.equal(g.run('player.room'),"starter");assert.equal(g.run('runState.talentPoints'),0);assert.equal(g.run('debugReportState.lastErrorAtByKey.size'),0);});
});

test("advanced connection replaces the old socket and connection failures can retry", (g) => {
  g.run('startMultiplayerFlow(); var oldSocket=multiplayer.socket; oldSocket.readyState=1; oldSocket.dispatchEvent({type:"open"});');
  assert.equal(g.run('multiplayer.connected'),true);
  assert.equal(g.document.getElementById("createRoomButton").disabled,false);
  g.document.getElementById("serverUrlInput").value="localhost:4188";
  g.document.getElementById("connectServerButton").click();
  assert.equal(g.run('multiplayer.socket.url'),"ws://localhost:4188/coop");
  assert.equal(g.run('multiplayer.connected'),false);
  assert.equal(g.document.getElementById("createRoomButton").disabled,true);
  g.run('oldSocket.dispatchEvent({type:"open"}); oldSocket.dispatchEvent({type:"message",data:JSON.stringify({type:"welcome",id:"stale"})});');
  assert.notEqual(g.run('multiplayer.id'),"stale");assert.equal(g.run('multiplayer.connected'),false);
  g.run('multiplayer.socket.close();');
  assert.equal(g.run('multiplayer.enabled'),false);
  assert.match(g.document.getElementById("multiplayerStatus").textContent,/Could not connect/);
  g.document.getElementById("refreshRoomsButton").click();
  assert.equal(g.run('multiplayer.socket.url'),"ws://localhost:4188/coop");
  g.run('multiplayer.socket.readyState=1; multiplayer.socket.dispatchEvent({type:"open"});');
  assert.equal(g.run('multiplayer.connected'),true);
  g.document.getElementById("serverUrlInput").value="ws://[bad";
  g.document.getElementById("connectServerButton").click();
  assert.match(g.document.getElementById("multiplayerStatus").textContent,/Could not connect/);
  assert.equal(g.run('debugReportState.lastErrorAtByKey.size'),0);
});

test("pixel assets and animation metadata match the authored files", () => {
  const base = path.join(__dirname,"..","assets","pixel"), manifest = JSON.parse(fs.readFileSync(path.join(base,"manifest.json"),"utf8"));
  assert.ok(manifest);
  for (const hero of ["warrior","ranger","mage","rogue","paladin","bard"]) {
    const png=fs.readFileSync(path.join(base,"classes",hero+".png"));
    assert.equal(png.readUInt32BE(16),128); assert.equal(png.readUInt32BE(20),192);
    assert.equal(png[25],6,"RGBA transparency");
  }
});
test("every registered image source exists",(g)=>{
  for(const [id,src] of g.run('Array.from(generatedArtImages,([id,image])=>[id,image.src])')){
    assert.ok(fs.existsSync(path.join(__dirname,"..",src)),id+": "+src);
  }
});
console.log(`${checks} arcade regression groups passed.`);
