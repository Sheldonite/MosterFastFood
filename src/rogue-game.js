const RogueGame = {
  hubClass: "melee", route: "boss", finished: false, saveTimer: 0, hubSignature: "", endSeq: 0,
  inHub() { return !runState.active || Boolean(Arcade.progress.profile.journal?.settled); },
  practice() { return ["practice","dev"].includes(runState.mode)||Boolean(Arcade.progress.profile.journal?.practice); },
  activate() {
    runState.learnedTalents = new Set(Arcade.progress.selection(currentClassKey()));
    runState.talentPoints = 0; talentTreeSignature=""; applyGear();
  },
  end(reason, final = false, network = true) {
    if (this.finished) return;
    if (network && isPartySyncActive() && !isMultiplayerHost()) { showFloat("The host ends the party run."); return; }
    if (network && isPartySyncActive()) {
      sendMultiplayerState(true);
      sendMultiplayerEvent({kind:"run-end",phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind,seq:++this.endSeq,reason,final,bosses:Arcade.progress.profile.journal?.bosses || [],contracts:Arcade.progress.profile.journal?.contracts || []});
    }
    const result=Arcade.progress.settle(reason,final);this.finished=true;runState.active=false;clearArcadeInputs();clearEncounterState();intermission=null;
    Arcade.screens.open(document.getElementById("resultsOverlay"));
    Arcade.setText(document.getElementById("resultsEyebrow"),final?"THE KITCHEN IS CLEAR":"ANOTHER RUN IN THE BOOKS");
    Arcade.setText(document.getElementById("resultsTitle"),final?"Run cleared":reason==="death"?"You're Stuffed":"Run complete");
    Arcade.setText(document.getElementById("resultsSummary"),(deathCause&&reason==="death"?"Defeated by "+deathCause+". ":"")+(result?.practice?"Practice awards no Marks.":"Banked "+(result?.earned||0)+" Marks. Your permanent upgrades are ready for the next run."));
    document.getElementById("resultsStats").innerHTML='<div><span>Run time</span><strong>'+Arcade.formatTime(runElapsedSeconds)+'</strong></div><div><span>Bosses cleared</span><strong>'+clearedBosses.length+'</strong></div><div><span>Marks available</span><strong>'+Arcade.progress.profile.marks+'</strong></div>';
    Arcade.setText(document.getElementById("continueButton"),isPartySyncActive()?"Return to lobby":"New Run");
    document.getElementById("continueButton").disabled=isPartySyncActive()&&!isMultiplayerHost();
    document.getElementById("resultsTalentsButton").hidden=false;
    Arcade.setText(document.getElementById("resultsTalentsButton"),"Permanent upgrades");
  },
  saveCheckpoint() {
    if (!runState.active || this.practice() || isPartySyncActive()) return;
    Arcade.progress.checkpoint({healthMultiplier:combatBalance.healthMultiplier,bossKind:boss.kind,encounterId:boss.encounterId,condimentFusion:cloneSyncObject(boss.condimentFusion),condimentRemains:cloneSyncObject(boss.condimentRemains),room:player.room,x:player.x,y:player.y,hp:player.hp,potions:player.potions,cooldowns:player.abilityCooldowns.slice(),gear:{...player.gear},buffs:{...runState.mazeBuffs},seconds:runElapsedSeconds,cleared:clearedBosses.slice(),talentSaves:{...RogueCombat.state.saves},bossTargets:boss.kind==="trio"?condimentBosses.map(t=>({kind:t.kind,hp:t.hp})):null,toppingParts:RogueBosses.parts().map(t=>({kind:t.kind,hp:t.hp,disabledFor:Math.max(0,t.disabledUntil-RogueCombat.clock)})),contractEnemies:mazeState?.contract?mazeState.enemies.map(e=>({id:e.id,hp:e.hp,x:e.x,y:e.y})):null,intermission:intermission?{name:intermission.name,nextBoss:intermission.nextBoss,relicChosen:intermission.relicChosen}:null,contractRewardChosen:Boolean(mazeState?.rewardChosen),bossHp:boss.hp,bossPhase:boss.phase,contract:mazeState?.contract?JSON.parse(JSON.stringify(mazeState.contract)):null});
  },
  resume() {
    const journal=Arcade.progress.profile.journal, saved=cloneSyncObject(journal?.checkpoint);
    if(!journal || journal.settled)return;
    if(journal.mode==="multiplayer" || !saved){this.end("saved run",false,false);return;}
    // Old saves predate the global HP increase. Convert once before restoring,
    // including defeated targets (zero stays zero), then save the new scale.
    const savedHealthMultiplier=Number(saved.healthMultiplier)>0?Number(saved.healthMultiplier):1;
    const healthRatio=combatBalance.healthMultiplier/savedHealthMultiplier;
    for(const key of ["hp","bossHp"])if(Number.isFinite(saved[key]))saved[key]*=healthRatio;
    for(const key of ["bossTargets","toppingParts","contractEnemies"])for(const target of saved[key]||[])if(Number.isFinite(target.hp))target.hp*=healthRatio;
    this.resuming=true;player.gear={...saved.gear};beginRun("single",saved.bossKind);this.resuming=false;
    closeClassMenu();runState.mazeBuffs={...saved.buffs};this.activate();runElapsedSeconds=saved.seconds||0;clearedBosses=saved.cleared||[];RogueCombat.state.saves={...saved.talentSaves};
    if(saved.room==="arena"){enterBossArena();boss.hp=Math.max(1,Math.min(boss.maxHp,saved.bossHp));boss.phase=saved.bossPhase||1;for(const t of condimentBosses){const s=saved.bossTargets?.find(s=>s.kind===t.kind);if(s)t.hp=Math.max(0,Math.min(t.maxHp,s.hp));}for(const t of RogueBosses.parts()){const s=saved.toppingParts?.find(s=>s.kind===t.kind);if(s){t.hp=Math.max(0,Math.min(t.maxHp,s.hp));t.disabledUntil=RogueCombat.clock+s.disabledFor;}}if(boss.kind==="donut"&&boss.phase>=2)boss.donutHoles=createDonutHoles(boss.phase===3?2:1);}
    if(saved.room==="maze"){startMazeForBoss(saved.bossKind);if(saved.contract&&mazeState){mazeState.contract=saved.contract;for(const e of mazeState.enemies){const p=saved.contractEnemies?.find(p=>p.id===e.id);if(p)Object.assign(e,p);}if(saved.contract.finished){mazeState.cleared=true;mazeState.exitOpen=Boolean(saved.contract.failed||saved.contractRewardChosen);mazeState.rewardChosen=Boolean(saved.contractRewardChosen);mazeState.rewardPending=!mazeState.exitOpen;if(mazeState.rewardPending)showMazeRewardChoices();}}}
    if(saved.room==="arena")CondimentFusion.restore(saved);
    if(saved.intermission){intermission={...saved.intermission};if(intermission.nextBoss==="sauce")intermission.nextBoss="shake";showEncounterResults(false);}
    player.hp=Math.max(1,Math.min(player.maxHp,saved.hp));player.potions=saved.potions;if(Number.isFinite(saved.x)&&Number.isFinite(saved.y)){const p=constrainToRoom(saved.x,saved.y);player.x=p.x;player.y=p.y;}if(Array.isArray(saved.cooldowns))player.abilityCooldowns=saved.cooldowns.map(c=>Math.max(0,Number(c)||0));if(!saved.intermission&&!mazeState?.rewardPending)Arcade.screens.close(true);this.finished=false;this.saveCheckpoint();
  },
  openRecovery() {
    const journal=Arcade.progress.profile.journal;
    Arcade.setText(document.getElementById("resumeSummary"),"This run has "+Arcade.progress.total()+" earned Marks. "+(journal?.mode==="multiplayer"?"The previous party is no longer active; bank its confirmed progress.":"Resume the saved encounter or bank your confirmed progress."));
    document.getElementById("resumeConfirm").hidden=journal?.mode==="multiplayer";
    Arcade.screens.open(document.getElementById("resumeOverlay"));
  },
  openRoute() {
    if(player.room!=="starter"||player.dead)return;
    clearArcadeInputs(); player.gateCooldown=1; player.x=Math.min(player.x,world.gate.x-player.radius-8);
    const contract=typeof RogueContracts!=="undefined"?RogueContracts.definitions[boss.kind]:null;
    Arcade.setText(document.getElementById("routeTitle"),boss.name);
    Arcade.setText(document.getElementById("routeDescription"),"Choose a direct encounter or risk an optional objective for a temporary relic and one Mark.");
    document.getElementById("routeContractButton").innerHTML=escapeHtml(contract?.name||"Optional contract")+'<small>'+escapeHtml(contract?.description||"Complete a short objective before the boss.")+'</small>';
    document.getElementById("routeContractButton").disabled=isPartySyncActive()&&!isMultiplayerHost();
    Arcade.setText(document.getElementById("routeStatus"),isPartySyncActive()?(isMultiplayerHost()?"The host chooses the route; everyone confirms readiness.":"The host chooses the route. Press the boss button to mark yourself ready."):"Skipping the contract leaves a fair boss encounter.");
    Arcade.screens.open(document.getElementById("routeOverlay"));
  },
  chooseRoute(route) {
    if(isPartySyncActive()&&!isMultiplayerHost()) { Arcade.screens.close(true);markPartyReady("starter");return; }
    this.route=route;lockBuildForRun();Arcade.screens.close(true);
    if(isPartySyncActive()) {sendMultiplayerEvent({kind:"route-choice",route,phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind});markPartyReady("starter");}
    else if(route==="contract")startMazeForBoss(boss.kind);else enterBossArena();
  }
};

function rogueBuildDependency(id, ids) {
  const required={melee_blood_deep:["melee_blood_bleed","melee_blood_whirl","warrior_blood_bloodstorm","melee_blood_hemo"],mage_pyro_molten_splash:["mage_pyro_burn","mage_pyro_kindling","mage_pyro_cap"]};
  return !required[id] || required[id].some(other=>ids.includes(other));
}

function rogueAbilityHint(index) {
  const C=RogueCombat,s=C.state,n=C.clock,counts=s.counts||{},next=(key,total)=>"Next "+((counts[key]||0)%total+1)+"/"+total;
  if(currentClassKey()==="melee"){
    if(index===0&&C.has("warrior_vanguard_brace")&&s.braceUntil>=n)return "Brace ready";
    if(index===1&&C.has("warrior_earth_worldsplitter"))return next("worldsplitter",3);
    if(index===1&&C.has("warrior_vanguard_counterquake"))return (s.quakeCharges||0)+"/3 charges";
  }else if(currentClassKey()==="mage"){
    if(index===2&&s.blinkReturn?.until>n)return "Return "+(s.blinkReturn.until-n).toFixed(1)+"s";
    if(index===0&&C.has("mage_pyro_cap"))return next("inferno",3);
  }else if(currentClassKey()==="ranger"&&index===3&&C.has("ranger_trap_chain"))return (s.trapCharges||0)+"/2 traps";
  else if(currentClassKey()==="rogue"&&index===0&&C.has("rogue_venom_bank"))return (s.venomCharges||0)+"/3 Venom";
  else if(currentClassKey()==="paladin"&&index===0&&C.has("paladin_judgment_day"))return next("judgmentDay",3);
  else if(currentClassKey()==="bard"&&index===0){if(C.has("bard_chord_cap"))return activeLocalBardSongTypes().size+"/3 songs";if(C.has("bard_chord_echo"))return next("echoNote",2);}
  return "";
}

function rogueEncounterCaption(fallback) {
  if(CondimentFusion.active())return "The condiments are combining · combat resumes after the reveal";
  if(player.room==="starter")return "Practice your build · gate opens route choices";
  if(player.room==="maze"&&mazeState?.contract)return mazeState.rewardChosen?"Relic collected · the boss exit is open":mazeState.contract.caption;
  if(player.room==="arena")return boss.rogueRecovery>0?"EXPOSED · "+boss.rogueRecovery.toFixed(1)+"s":boss.kind==="taco"?(boss.exposedFillingTimer>0?"EXPOSED FILLING · "+boss.exposedFillingTimer.toFixed(1)+"s · ×2.35 damage":"Shell guard · 50% damage · solve the ingredient objective"):RogueBosses.tips[boss.kind];
  return fallback;
}

function rogueCombatReadout() {
  const C=RogueCombat,s=C.state,lines=["Basic interval: "+basicAttackCooldown(gear.weapon[player.gear.weapon]).toFixed(2)+"s","Cooldown recovery: ×"+(1+Math.min(.3,(runState.mazeBuffs.cooldownRecovery||0)+strongestBardSongValue("battle","cooldownRecovery")+(s.divineRecovery||0))).toFixed(2)];
  if(player.rogueShield>0)lines.push("Shield: "+player.rogueShield+" HP");
  if(player.shieldWallTimer>0)lines.push("Guard prevented: "+Math.round(s.guardPrevented||0)+" damage");
  if(s.stoneHits>0&&s.stoneUntil>C.clock)lines.push("Stonefist: "+s.stoneHits+" charged basics");
  if(s.precisionUntil>C.clock)lines.push("Precision arrow loaded");
  if(s.guardBasic)lines.push("Guard counter ready");
  for(let i=0;i<4;i++){const hint=rogueAbilityHint(i);if(hint)lines.push(currentAbilities()[i].name+": "+hint);}
  for(const [id,key] of [["melee_iron_last","Unmoving Mountain"],["mage_chrono_cap","timeLoop"],["paladin_guard_cap","Unfallen"],["bard_heal_cap","encore"]])if(C.has(id))lines.push(talentById.get(id).name+": "+(s.saves[key]?"used this run":"ready"));
  return lines;
}

function renderRogueTalents(force=false) {
  const progress=Arcade.progress,profile=progress.profile,hub=RogueGame.inHub();
  const cls=hub?RogueGame.hubClass:currentClassKey(), ids=hub?progress.selection(cls):Array.from(runState.learnedTalents),owned=profile.owned;
  const sig=JSON.stringify([cls,hub,profile.marks,owned,ids,selectedTalentId,progress.error]);if(!force&&sig===RogueGame.hubSignature)return;RogueGame.hubSignature=sig;
  const nodes=talentDefinitions.filter(t=>t.classKey===cls);if(!nodes.some(t=>t.id===selectedTalentId))selectedTalentId=nodes[0].id;
  const t=talentById.get(selectedTalentId),node=progress.catalogue.get(t.id),equipped=ids.includes(t.id),purchased=owned.includes(t.id),canBuy=hub&&progress.canPurchase(t.id);
  Arcade.setText(ui.talentMenuTitle,hub?"Permanent upgrades":"Active build");
  Arcade.setText(ui.talentMenuPoints,profile.marks+" Marks · "+ids.filter(id=>progress.catalogue.get(id)[1]!=="keystone").length+"/4 support · "+ids.filter(id=>progress.catalogue.get(id)[1]==="keystone").length+"/1 keystone");
  const status=!hub?"This build is locked for the run. Purchases and build changes happen afterward.":!purchased&&node[1]==="keystone"&&owned.filter(id=>talentById.get(id)?.classKey===cls&&progress.catalogue.get(id)[1]!=="keystone").length<3?"Purchase three support talents in this class to unlock keystones.":!purchased?"Purchase permanently for "+progress.cost(t.id)+" Marks.":equipped?"Equipped for your next run.":"Owned permanently. Equip it for your next run.";
  const branches=[...new Set(nodes.map(n=>n.branch))];
  const focus=document.activeElement,focusKeys=["talentClass","talent","learnTalent","equipTalent","refundTalent"],focusKey=ui.talentTree.contains(focus)?focusKeys.find(key=>focus.dataset?.[key]):null,focusId=focusKey?focus.dataset[focusKey]:null;
  ui.talentTree.innerHTML='<div class="rogue-class-tabs">'+classOptions.filter(c=>!c.locked).map(c=>'<button type="button" data-talent-class="'+(c.id==="warrior"?"melee":c.id)+'" aria-pressed="'+((c.id==="warrior"?"melee":c.id)===cls)+'" '+(!hub?'disabled':'')+'>'+c.name+'</button>').join('')+'</div><div class="rogue-talents"><div class="rogue-branches">'+branches.map(branch=>'<section class="rogue-branch"><h2>'+escapeHtml(branch)+'</h2>'+nodes.filter(n=>n.branch===branch).map(n=>'<button class="rogue-node '+(n.id===t.id?'selected ':'')+(ids.includes(n.id)?'equipped':'')+'" type="button" data-talent="'+n.id+'"><strong>'+escapeHtml(n.name)+'</strong><small>'+progress.catalogue.get(n.id)[1]+' · '+(ids.includes(n.id)?'Equipped':owned.includes(n.id)?'Owned':progress.cost(n.id)+' Marks')+'</small></button>').join('')+'</section>').join('')+'</div><aside class="rogue-detail"><p class="eyebrow">'+node[1]+'</p><h2>'+escapeHtml(t.name)+'</h2><p>'+escapeHtml(node[2])+'</p><p>'+escapeHtml(status)+'</p><p>Damage unit A = your equipped base attack damage. Bonus attacks cannot trigger themselves.</p>'+(!purchased?'<button type="button" class="primary" data-learn-talent="'+t.id+'" '+(!canBuy?'disabled':'')+'>Unlock · '+progress.cost(t.id)+' Marks</button>':'<button type="button" class="primary" data-equip-talent="'+t.id+'" '+(!hub?'disabled':'')+'>'+(equipped?'Unequip':'Equip')+'</button><button type="button" data-refund-talent="'+t.id+'" '+(!hub?'disabled':'')+'>Refund · '+progress.cost(t.id)+' Marks</button>')+'<p id="talentActionStatus" role="status">'+escapeHtml(progress.error)+'</p></aside></div>';
  if(focusKey){const attribute="data-"+focusKey.replace(/[A-Z]/g,c=>"-"+c.toLowerCase()),replacement=ui.talentTree.querySelector('['+attribute+'="'+focusId+'"]')||ui.talentTree.querySelector('[data-talent="'+t.id+'"]');replacement?.focus({preventScroll:true});}
}

function initializeRogueGame() {
  document.querySelector(".game-wrap").appendChild(document.getElementById("fusionOverlay"));
  isPartySyncActive=()=>isMultiplayerGame()&&["multiplayer","practice"].includes(runState.mode);
  Arcade.progress.configure(talentDefinitions);
  for(const talent of talentDefinitions){const data=Arcade.progress.catalogue.get(talent.id);talent.description=data[2];talent.purchaseTier=data[1];}
  talentById.get("melee_earth_cap").name="Earth Battery";
  installRogueTraining();installRogueCombat();installRogueContracts();installRogueNetwork();installRoguePresentation();installRogueBosses();installSignatureBosses();updatePlayerProjectiles=rogueUpdateProjectiles;
  const oldBegin=beginRun,oldReset=resetRunTalents,oldEquip=equipClass,oldDeath=enterDeathState,oldRetry=requestEncounterRetry,oldMenu=returnToMainMenu,oldContinue=continueArcadeRun,oldResults=showEncounterResults,oldRender=renderArcadeUi,oldUpdate=update,oldParty=maybeAdvancePartyPhase,oldLobby=returnToMultiplayerLobby;
  resetRunTalents=function(){oldReset();if(runState.active)runState.learnedTalents=new Set(Arcade.progress.selection(currentClassKey()));};
  beginRun=function(mode,first="cola"){
    if(!RogueGame.resuming&&!Arcade.progress.begin(mode==="multiplayer"&&multiplayer.room?.practice?"practice":mode,player.gear)){RogueGame.openRecovery();return;}
    RogueGame.finished=false;RogueGame.route="boss";oldBegin(mode,first);RogueGame.activate();player.hp=player.maxHp;
    if(typeof RogueCombat!=="undefined")RogueCombat.resetRun();RogueGame.saveCheckpoint();
  };
  equipClass=function(id){const result=oldEquip(id);if(!runState.buildLocked)RogueGame.activate();return result;};
  canLearnTalent=id=>RogueGame.inHub()&&Arcade.progress.canPurchase(id);
  learnTalent=function(id){if(!canLearnTalent(id)||!Arcade.progress.purchase(id))return false;const cls=talentById.get(id).classKey,ids=Arcade.progress.selection(cls);if(Arcade.progress.validBuild(ids.concat(id),cls)&&rogueBuildDependency(id,ids.concat(id)))Arcade.progress.select(cls,ids.concat(id));RogueGame.hubSignature="";renderRogueTalents(true);Arcade.emit("reward");return true;};
  grantTalentPoints=function(){Arcade.progress.record("bosses",CondimentFusion.rewardId());};
  renderTalentTree=renderRogueTalents;
  openTalentMenu=function(){if(RogueGame.inHub())RogueGame.hubClass=currentClassKey();Arcade.screens.open(ui.talentMenuOverlay,Boolean(Arcade.screens.current));renderRogueTalents(true);};
  enterDeathState=function(source){oldDeath(source);if(!RogueGame.practice()&&!isPartySyncActive())RogueGame.end("death");};
  requestEncounterRetry=function(){if(RogueGame.practice())return oldRetry();if(!runState.active||player.dead){if(isPartySyncActive()){if(isMultiplayerHost())sendServer({type:"return-lobby"});}else startSinglePlayer();}};
  returnToMainMenu=function(message){if(runState.active&&!RogueGame.practice()){RogueGame.end("ended run");return;}if(runState.active)Arcade.progress.settle("practice");return oldMenu(message);};
  returnToMultiplayerLobby=function(message){if(Arcade.progress.profile.journal&&!Arcade.progress.profile.journal.settled)Arcade.progress.settle("party connection ended");RogueGame.finished=true;return oldLobby(message);};
  continueArcadeRun=function(){if(RogueGame.finished){if(isPartySyncActive()){if(isMultiplayerHost())sendServer({type:"return-lobby"});}else startSinglePlayer();return;}return oldContinue();};
  showEncounterResults=function(final){if(final){RogueGame.end("victory",true,false);return;}oldResults(false);Arcade.setText(document.getElementById("resultsSummary"),Arcade.progress.total()+" Marks earned so far. Upgrades unlock after this run ends. Next: "+createBoss(intermission.nextBoss).name+'.');document.getElementById("resultsTalentsButton").hidden=true;};
  maybeAdvancePartyPhase=function(){if(multiplayer.partyPhase==="starter"&&allPartyPlayersReady("starter")&&isMultiplayerHost()&&RogueGame.route==="boss"){broadcastPartyPhase("arena",{bossKind:boss.kind,spawns:multiplayerArenaSpawns()});return;}return oldParty();};
  updateRoom=function(dt){player.gateCooldown=Math.max(0,player.gateCooldown-dt);if(player.room==="starter"&&player.gateCooldown<=0&&circleIntersectsRect(player.x,player.y,player.radius,world.gate))RogueGame.openRoute();if(player.room==="maze"&&player.gateCooldown<=0&&mazeState?.exitOpen&&circleIntersectsRect(player.x,player.y,player.radius,mazeState.exit))enterBossArena();};
  update=function(dt){oldUpdate(dt);if(!runState.active)return;if(!Arcade.screens.paused()){RogueGame.saveTimer+=dt;if(RogueGame.saveTimer>=2){RogueGame.saveTimer=0;RogueGame.saveCheckpoint();}}if(isPartySyncActive()&&isMultiplayerHost()&&isPartyWiped()&&!RogueGame.practice())RogueGame.end("party wipe");};
  renderArcadeUi=function(){oldRender();Arcade.setText(document.getElementById("skillsButton"),"Talents");document.getElementById("trainingButton").hidden=player.room!=="starter";document.getElementById("resumeRunButton").hidden=!Arcade.progress.profile.journal||Arcade.progress.profile.journal.settled;
    CondimentFusion.renderUi();
    if(!document.getElementById("buildOverlay").hidden){const readout=document.getElementById("talentReadout"),html=rogueCombatReadout().map(line=>'<span>'+escapeHtml(line)+'</span>').join("");if(readout.innerHTML!==html)readout.innerHTML=html;}
    const breakdown=RogueTraining.targets.reduce((sum,t)=>({direct:sum.direct+t.breakdown.direct,dot:sum.dot+t.breakdown.dot,proc:sum.proc+t.breakdown.proc}),{direct:0,dot:0,proc:0});Arcade.setText(document.getElementById("trainingDetails"),"Direct: "+breakdown.direct+" · Damage over time: "+breakdown.dot+" · Bonus attacks: "+breakdown.proc+". "+RogueTraining.targets.map(t=>[t.markedShots?"Mark ×"+t.markedShots:"",t.poisonStacks?"Poison ×"+t.poisonStacks:"",t.bleedTimer>0?"Bleed "+t.bleedTimer.toFixed(1)+"s":"",t.burnTimer>0?"Burn "+t.burnTimer.toFixed(1)+"s":""].filter(Boolean).join(" / ")).filter(Boolean).join(" · "));
    document.getElementById("skipContractButton").hidden=!(mazeState?.contract&&!mazeState.contract.finished&&player.room==="maze");document.getElementById("skipContractButton").disabled=isPartySyncActive()&&!isMultiplayerHost();
    document.getElementById("resetButton").hidden=!RogueGame.practice();Arcade.setText(document.getElementById("returnMenuButton"),RogueGame.practice()?"End Practice":"End Run · bank "+Arcade.progress.total()+" Marks");
  };
  installRogueRelics();
  document.getElementById("skipContractButton").addEventListener("click",()=>{if(isPartySyncActive()&&!isMultiplayerHost())return;RogueContracts.finish(false);if(!isPartySyncActive())enterBossArena();});
  document.getElementById("hubButton").addEventListener("click",openTalentMenu);
  document.getElementById("practiceButton").addEventListener("click",()=>{multiplayer.mode="single";closeMultiplayerSocket();beginRun("practice","cola");});
  document.getElementById("resumeRunButton").addEventListener("click",()=>RogueGame.openRecovery());
  document.getElementById("resumeConfirm").addEventListener("click",()=>RogueGame.resume());
  document.getElementById("bankSavedRun").addEventListener("click",()=>RogueGame.end("saved run",false,false));
  document.getElementById("routeBossButton").addEventListener("click",()=>RogueGame.chooseRoute("boss"));
  document.getElementById("routeContractButton").addEventListener("click",()=>RogueGame.chooseRoute("contract"));
  document.getElementById("trainingButton").addEventListener("click",()=>{if(player.room==="starter")Arcade.screens.open(document.getElementById("trainingOverlay"));});
  document.querySelectorAll("[data-training-mode]").forEach(button=>button.addEventListener("click",()=>RogueTraining.reset(button.dataset.trainingMode)));
  document.getElementById("trainingReset").addEventListener("click",()=>RogueTraining.reset());
  document.getElementById("trainingCooldowns").addEventListener("click",()=>{if(player.room!=="starter")return;player.abilityCooldowns=[0,0,0,0];player.attackCooldown=0;player.pendingAbilityCast=null;});
  document.getElementById("trainingHurt").addEventListener("click",()=>{if(player.room==="starter")player.hp=Math.max(1,player.hp-player.maxHp*.25);});
  document.getElementById("trainingIncoming").addEventListener("click",event=>{RogueTraining.incoming=!RogueTraining.incoming;event.target.setAttribute("aria-pressed",String(RogueTraining.incoming));});
  ui.talentTree.addEventListener("click",event=>{
    const cls=event.target.closest("[data-talent-class]"),equip=event.target.closest("[data-equip-talent]"),refund=event.target.closest("[data-refund-talent]");
    if(!RogueGame.inHub())return;
    if(cls){RogueGame.hubClass=cls.dataset.talentClass;selectedTalentId="";renderRogueTalents(true);}
    if(equip){const id=equip.dataset.equipTalent,ids=Arcade.progress.selection(RogueGame.hubClass),next=ids.includes(id)?ids.filter(other=>other!==id):ids.concat(id);const valid=next.every(other=>rogueBuildDependency(other,next));if(!valid||!Arcade.progress.select(RogueGame.hubClass,next))Arcade.setText(document.getElementById("talentActionStatus"),valid?"Choose up to four support talents and one keystone.":"Equip a compatible status source before using this talent.");else renderRogueTalents(true);}
    if(refund){Arcade.progress.refund(refund.dataset.refundTalent);renderRogueTalents(true);}
  });
}
