/* Stateful combat events are separate from presentation and permanent ownership. */
const RogueCombat = {
  rules:new Map(), state:{}, clock:0, sequence:0, tasks:[], queuedEffects:[], current:null, updating:false, legacyDepth:0,
  has(id){return runState.learnedTalents.has(id);}, A(){return player.stats.damage;},
  rule(id,event,apply){if(this.rules.has(id))throw new Error("Duplicate talent effect: "+id);this.rules.set(id,{events:event.split(" "),apply});},
  emit(event,c){c.event=event;for(const id of runState.learnedTalents){const rule=this.rules.get(id);if(rule?.events.includes(event))rule.apply(c);}},
  resetRun(){this.state={saves:{},counts:{},trapCharges:this.has("ranger_trap_chain")?2:1};this.tasks=[];this.clock=0;this.current=null;},
  count(key){return this.state.counts[key]=(this.state.counts[key]||0)+1;},
  ready(key,seconds){if((this.state[key]||0)>this.clock)return false;this.state[key]=this.clock+seconds;return true;},
  once(c,key){c.once ||= new Set();if(c.once.has(key))return false;c.once.add(key);return true;},
  later(delay,callback){this.tasks.push({at:this.clock+delay,callback,room:player.room,phase:multiplayer.phaseSeq});},
  effect(effect){effect.id ||= "effect-"+(++this.sequence);effect.maxTtl ||= effect.ttl;effect.room=player.room;if(this.updating)this.queuedEffects.push(effect);else abilityEffects.push(effect);return effect;},
  pulse(x,y,r,amount,source){this.effect({type:"rogueImpact",x,y,r,ttl:.3});return damageEnemiesInRadius(x,y,r,Math.round(amount),source,[],{proc:true,talentHook:true});},
  field(type){return abilityEffects.find(e=>e.type===type&&e.ttl>0);},
  inside(type,target=player){return abilityEffects.find(e=>e.type===type&&e.ttl>0&&distance(e,target)<=e.r+(target.radius||0));},
  shield(percent,duration=3){player.rogueShield=Math.max(player.rogueShield||0,Math.ceil(player.maxHp*percent));player.rogueShieldUntil=Math.max(player.rogueShieldUntil||0,this.clock+duration);},
  heal(percent){const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+Math.ceil(player.maxHp*percent));return player.hp-before;},
  refund(index,amount){player.abilityCooldowns[index]=Math.max(0,player.abilityCooldowns[index]-amount);},
  mark(t,pips=4,duration=5){t.markedShots=Math.max(t.markedShots||0,pips);t.markedTimer=Math.max(t.markedTimer||0,duration);t.rogueMarkId=++this.sequence;syncTargetStatus(t,"mark");},
  poison(t,count=1,direct=false){for(let i=0;i<count;i++)applyPoisonStack(t,{direct});},
  expose(t,count=1){t.exposedStacks=Math.min(3,(t.exposedStacks||0)+count);t.exposedTimer=4+(this.has("rogue_shadow_exposed")?2:0);syncTargetStatus(t,"exposed");},
  slow(t,fraction,time){if(t.mazeEnemy||t.kind==="trainingDummy"){t.rogueSlow=fraction;t.rogueSlowTimer=time;}},
  rear(t,actor=player){const facing={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[t.facing]??t.chargeAngle??t.serpentHeading??Math.atan2(player.y-t.y,player.x-t.x);return Math.abs(angleDifference(Math.atan2(actor.y-t.y,actor.x-t.x),facing))>Math.PI*.6;},
  basic(){return {index:-1,type:"basic",id:++this.sequence,origin:RogueTraining.origin(),once:new Set()};},
  hitContext(target,amount,source,options){return {target,amount,source,options,cast:options.cast||options.projectile?.cast||this.current||player.slide?.cast||this.basic(),basic:source==="Shot",proc:Boolean(options.proc||options.talentHook||options.dot),A:this.A(),once:new Set()};},
  area(c,x,y,r,multiplier,source=c.name){return damageEnemiesInRadius(x,y,r,playerDamage(multiplier),source,[],{cast:c});},
  cone(c,range,half,damage,source=c.name){const origin=c.origin;const hits=livingBosses().filter(t=>{const p=RogueTraining.targetPoint(t),dx=p.x-origin.x,dy=p.y-origin.y;return Math.hypot(dx,dy)<=range+(t.radius||20)&&Math.abs(angleDifference(Math.atan2(dy,dx),c.angle))<=half;});return hits.filter(t=>damageBossTarget(t,playerDamage(damage),source,{cast:c}));},
  trap(x,y,pocket=false){const e=this.effect({type:"volleyTrap",x,y,r:pocket?28:36,ttl:pocket?5:7,triggerTimer:pocket?.15:.6,shotsRemaining:0,reloads:1,pocket,shotTimer:0,round:0});const c={type:"trap",field:e};this.emit("field",c);return e;},
  smoke(x,y,ttl=4.2,mini=false){const e=this.effect({type:"smokeBomb",x,y,r:92,ttl,pulseTimer:0,mini,slowFactor:.5});if(!mini)this.emit("field",{type:"smoke",field:e});return e;},
  cast(index,ability){
    const type=({melee:["bash","quake","whirlwind","wall"],ranger:["mark","storm","tumble","trap"],mage:["blast","meteor","blink","warp"],rogue:["backstab","cloud","shadowstep","smoke"],paladin:["smite","consecration","aegis","bulwark"],bard:["chord","hymn","quickstep","ballad"]})[currentClassKey()][index];
    const c={index,type,name:ability.name,ability,id:++this.sequence,angle:aimAngle(),origin:RogueTraining.origin(),start:{x:player.x,y:player.y},damage:1,factor:1,range:138,radius:142,once:new Set(),baseCooldown:ability.cooldown};
    const aimed=RogueTraining.aim();c.origin=aimed.origin;c.angle=aimed.angle;player.facing=aimed.facing;
    this.emit("cast",c);this.current=c;
    spendAbility(index,ability);
    const finish=()=>{this.emit("castEnd",c);this.current=null;};
    if(type==="bash"){
      c.range*=c.rangeMultiplier||1;const hits=this.cone(c,c.range,c.halfAngle||Math.PI*.36,.72*(c.factor||1));
      hits.forEach(t=>{if(t.mazeEnemy){interruptTarget(t);if(!this.has("warrior_vanguard_shield_hook"))shoveTarget(t,c.start.x,c.start.y,34);}});
      const groups=new Set(hazards.filter(h=>isDestroyableProjectile(h)&&distance(c.origin,h)<=c.range+22+(h.r||0)&&Math.abs(angleDifference(Math.atan2(h.y-c.origin.y,h.x-c.origin.x),c.angle))<=(c.halfAngle||Math.PI*.36)).map(h=>h.attackId||h.sourceAttackId||h.syncId||h));
      const blocked=destroyProjectilesInCone(c.origin.x,c.origin.y,c.angle,c.range+22,c.halfAngle||Math.PI*.36);
      this.emit("block",{cast:c,blocked,attacksBlocked:groups.size});this.effect({type:"shieldBash",...c.origin,angle:c.angle,range:c.range,ttl:.24});
    }else if(type==="quake"){
      const r=142*(c.radiusMultiplier||1);this.area(c,c.start.x,c.start.y,r,1.18*c.factor,"Groundbreaker").forEach(t=>{interruptTarget(t);shoveTarget(t,c.start.x,c.start.y,30);});
      this.effect({type:"groundbreaker",...c.start,r,ttl:.45});this.emit("quakeEnd",{cast:c,r});
    }else if(type==="whirlwind"){
      const angle=movementOrAimAngle();player.slide={vx:Math.cos(angle)*player.stats.speed*2.75,vy:Math.sin(angle)*player.stats.speed*2.75,timer:.3,whirlwind:true,damageTimer:0,cast:c,reducedShieldCooldown:false};player.invulnerableTimer=Math.max(player.invulnerableTimer,.32);
      this.emit("dash",{cast:c,type,origin:c.start,destination:pointFromAngle(player.x,player.y,angle,120)});
    }else if(type==="wall"||type==="bulwark"){
      player.shieldWallTimer=(type==="wall"?10:8)+(c.durationBonus||0);this.effect({type:type==="wall"?"shieldWall":"divineBulwark",...c.start,r:64,ttl:player.shieldWallTimer});
      if(type==="bulwark")this.heal(.18);this.state.echoReady=this.has("warrior_vanguard_bulwark_echo")?this.clock+4:0;this.state.prevented=0;this.state.guardPrevented=0;this.emit("guard",{cast:c,type});
    }else if(type==="mark"){
      fireAbilityArrow(c.angle,{damage:playerDamage(.72*c.factor),speed:860,color:"#efbe55",markedShot:true,ttl:.75});const p=playerProjectiles[playerProjectiles.length-1];p.cast=c;p.piercing=Boolean(c.pierce);p.maxHits=c.pierce?3:1;
    }else if(type==="storm"){
      const target=clampCombatPoint(mouseWorld.x,mouseWorld.y,72);const e=this.effect({type:"arrowStorm",...target,r:128,ttl:3.2,pulseTimer:.15,shotTimer:0,pulseInterval:.45,damageMultiplier:.42,cast:c,charges:0});this.emit("field",{type,field:e});
    }else if(type==="tumble"){
      const a=movementOrAimAngle();player.slide={vx:Math.cos(a)*player.stats.speed*3,vy:Math.sin(a)*player.stats.speed*3,timer:.24,cast:c};player.invulnerableTimer=Math.max(player.invulnerableTimer,.22);player.tumbleTimer=.28;fireAbilityArrow(c.angle,{damage:playerDamage(.66),speed:760,color:"#efbe55",ttl:.65});this.emit("dash",{cast:c,type,origin:c.start});
    }else if(type==="trap"){
      this.trap(player.x,player.y);if(this.has("ranger_trap_chain")){this.state.trapCharges=Math.max(0,(this.state.trapCharges??2)-1);this.state.trapRecharge ||= ability.cooldown;if(this.state.trapCharges>0)player.abilityCooldowns[3]=0;}
    }else if(type==="blast"){
      player.pendingAbilityCast={type:"fireBlast",timer:.28,angle:c.angle,cast:c};player.castTimer=.36;player.castMoveLockTimer=.08;player.castAngle=c.angle;
    }else if(type==="meteor"){
      const target=clampCombatPoint(mouseWorld.x,mouseWorld.y,96);const e=this.effect({type:"meteorField",...target,r:150,ttl:3.4,impactTimer:.12,impactInterval:.32,remaining:10,total:10,impactCount:0,cast:c,targets:new Set()});this.emit("field",{type,field:e});
    }else if(type==="blink"||type==="shadowstep"||type==="aegis"){
      const range=type==="blink"?165:type==="shadowstep"?185:150,target=constrainToRoom(player.x+Math.cos(c.angle)*range*(c.rangeMultiplier||1),player.y+Math.sin(c.angle)*range*(c.rangeMultiplier||1));player.x=target.x;player.y=target.y;player.slide=null;player.invulnerableTimer=Math.max(player.invulnerableTimer,.32);
      if(type==="shadowstep")player.backstabTimer=2;
      if(type==="aegis"){player.invulnerableTimer=Math.max(player.invulnerableTimer,.38);player.guardSpeedTimer=Math.max(player.guardSpeedTimer,.7);}if(type==="blink")this.effect({type:"blinkRune",...c.start,r:72,ttl:1.15,pulseTimer:0});else this.effect({type:type==="aegis"?"aegisStep":"shadowStep",...c.start,x2:target.x,y2:target.y,r:72,ttl:.45,pulseTimer:999});this.emit("dash",{cast:c,type,origin:c.start,destination:target});
    }else if(type==="warp"){
      abilityEffects=abilityEffects.filter(e=>e.type!=="timeWarp");const e=this.effect({type:"timeWarp",...c.start,r:132,ttl:7.5,cast:c,slowFactor:.5});this.emit("field",{type,field:e});
    }else if(type==="backstab"){
      const multiplier=(player.backstabTimer>0?1.85:1.05)*c.factor;const hits=this.cone(c,122,Math.PI*.52,multiplier,"Backstab");hits.forEach(t=>{if(!(t.bleedTimer>0))applyBleed(t);});player.backstabTimer=0;player.rogueAttackTimer=.3;player.rogueAttackAngle=c.angle;this.effect({type:"backstab",...c.origin,angle:c.angle,range:122,ttl:.28});
    }else if(type==="cloud"){
      const target=clampCombatPoint(mouseWorld.x,mouseWorld.y,90),e=this.effect({type:"poisonCloud",...target,r:118,ttl:5.2,pulseTimer:0,cast:c});this.emit("field",{type,field:e});
    }else if(type==="smoke")this.smoke(player.x,player.y);
    else if(type==="smite"){
      const center=pointFromAngle(c.origin.x,c.origin.y,c.angle,98),r=96*(c.radiusMultiplier||1);this.area(c,center.x,center.y,r,1.12*c.factor,"Radiant Smite");this.effect({type:"radiantSmite",...center,r,ttl:.42});c.center=center;c.r=r;this.emit("smiteEnd",{cast:c});
    }else if(type==="consecration"){
      abilityEffects=abilityEffects.filter(e=>e.type!=="consecration");const e=this.effect({type:"consecration",...c.start,r:128,ttl:6,pulseTimer:0,healTimer:0,cast:c,damageMultiplier:.38});this.emit("field",{type,field:e});player.consecrationTimer=e.ttl;
    }else if(type==="chord"){
      const songs=activeLocalBardSongTypes().size,multiplier=(1.3+.2*songs)*c.factor;const hits=this.cone(c,212*(c.rangeMultiplier||1),c.halfAngle||Math.PI*.28,multiplier,"Power Chord");c.hits=hits;c.damageAmount=playerDamage(multiplier);this.effect({type:"bardPowerChord",...c.origin,angle:c.angle,range:212,ttl:.3});this.emit("chordEnd",{cast:c,songs,hits});
    }else if(type==="hymn"||type==="ballad"||type==="quickstep"){
      if(type==="quickstep"){const a=movementOrAimAngle();player.slide={vx:Math.cos(a)*player.stats.speed*2.45,vy:Math.sin(a)*player.stats.speed*2.45,timer:.24};player.invulnerableTimer=Math.max(player.invulnerableTimer,.32);}
      startBardSong(type==="hymn"?"battle":type==="ballad"?"healing":"quickstep");
    }
    finish();
  }
};

function installRogueCombat() {
  const oldHas=hasTalent;hasTalent=id=>RogueCombat.legacyDepth?false:oldHas(id);
  const oldSpend=spendAbility,oldUpdate=updateAbilities,oldDamage=applyDamageBossTargetLocal,oldSlide=moveSlidingPlayer;
  runTalentHook=function(hook,payload){if(hook==="onProjectileDestroyed")RogueCombat.emit("projectiles",payload);};
  talentMaxHpBonus=()=>RogueCombat.has("melee_iron_hp")?Math.round(playerBaseMaxHpForArmor(player.gear.armor)*.08):0;
  spendAbility=function(index,ability){RogueCombat.legacyDepth++;try{oldSpend(index,ability);}finally{RogueCombat.legacyDepth--;}};
  useAbility=function(index){if(!arcadeInputAllowed()||player.pendingAbilityCast)return;const ability=currentAbilities()[index];if(!ability)return;
    if(index===2&&currentClassKey()==="mage"&&RogueCombat.state.blinkReturn?.until>RogueCombat.clock){const marker=RogueCombat.state.blinkReturn;player.x=marker.x;player.y=marker.y;player.invulnerableTimer=.3;RogueCombat.state.blinkReturn=null;return;}
    if(index===1&&currentClassKey()==="ranger"&&RogueCombat.has("ranger_storm_follow")&&RogueCombat.field("arrowStorm")){RogueCombat.state.steerStorm=true;return;}
    const cooldown=player.abilityCooldowns[index];if(cooldown>0){const cost=currentClassKey()==="melee"&&index===1&&RogueCombat.has("warrior_blood_price")?.06:currentClassKey()==="mage"&&index===0&&RogueCombat.has("mage_pyro_flame_debt")?.05:0;if(cost&&cooldown<=2&&player.hp>player.maxHp*.3)player.hp-=Math.ceil(player.maxHp*cost);else{if(cooldown<=.12)RogueCombat.state.buffer={index,until:RogueCombat.clock+.12};showFloat(ability.name+" · "+cooldown.toFixed(1)+"s");Arcade.emit("unavailable");return;}}
    if(player.room==="arena")startFight();RogueCombat.cast(index,ability);
  };
  moveSlidingPlayer=function(dt){const cast=player.slide?.cast;RogueCombat.current=cast;RogueCombat.legacyDepth++;try{oldSlide(dt);}finally{RogueCombat.legacyDepth--;RogueCombat.current=null;}if(cast&& !player.slide)RogueCombat.emit("dashEnd",{cast,type:cast.type});};
  applyDamageBossTargetLocal=function(target,amount,source,options={}){
    const c=RogueCombat.hitContext(target,amount,source,options),before=target.hp,markBefore=target.markedShots||0;
    if(!c.proc&&!options.remoteIntent)RogueCombat.emit("hit",c);
    if(!c.proc&&c.basic&&(options.rangedBasic||options.markedBonus)&&target.markedTimer>0&&markBefore>0){c.amount*=options.markedMultiplier||1.45;target.markedShots--;c.lastMark=target.markedShots===0;if(c.lastMark)target.markedTimer=0;syncTargetStatus(target,"mark");}
    // The legacy routine retains shield, Taco guard, defeat, and network handling.
    const judgment=target.judgmentTimer;target.judgmentTimer=0;
    if(!c.proc&&judgment>0&&target.rogueJudgmentOwner===(options.attackerId||multiplayer.id))c.amount*=1.15;
    if(target.role==="guard"&&!RogueCombat.rear(target,multiplayer.peers.get(options.attackerId)||player)&&!(target.recovery>0))c.amount*=.45;
    RogueCombat.legacyDepth++;let result;
    try{result=oldDamage(target,Math.round(c.amount),source,{...options,markedBonus:false,rangedBasic:false,deadeye:false,remoteIntent:true,proc:c.proc});}finally{RogueCombat.legacyDepth--;target.judgmentTimer=judgment;}
    c.dealt=before-target.hp;c.before=before;c.judgedBefore=judgment>0;
    if(result&&options.dot&&options.remoteIntent&&isMultiplayerHost()&&options.attackerId)sendMultiplayerEvent({kind:"rogue-dot-result",seq:++RogueCombat.sequence,phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind,recipient:options.attackerId,...targetSyncDescriptor(target),source,before,dealt:c.dealt,hp:target.hp});
    RogueCombat.lastResolvedHit=c;
    if(result&&!options.remoteIntent)RogueCombat.emit("afterDamage",c);
    if(result&&target.kind==="trainingDummy"){} // Training records the resolved damage in its shared adapter.
    if(result&&!options.remoteIntent&&!c.proc)RogueCombat.emit("afterHit",c);
    if(result&&!options.remoteIntent&&before>0&&target.hp<=0&&(!c.proc||options.dot))RogueCombat.emit("death",c);
    if(result&&target.role==="worker"){target.rogueStagger=.8;target.windup=0;target.workerNode=null;target.attackTimer=2;}
    return result;
  };
  markBossTarget=function(target){const c={target,pips:4,duration:5};RogueCombat.emit("mark",c);RogueCombat.mark(target,c.pips,c.duration);};
  applyBleed=function(t,options={}){const c={target:t,duration:options.timer||4,tickDamage:options.damage||RogueCombat.A()*.06};RogueCombat.emit("bleed",c);t.bleedOwner=multiplayer.id;t.bleedTimer=c.duration;t.bleedTickTimer=.5;t.bleedDamage=c.tickDamage;syncTargetStatus(t,"bleed");};
  applyBurn=function(t){t.burnOwner=multiplayer.id;t.burnTimer=4;t.burnTickTimer=.5;t.burnDamage=RogueCombat.A()*.075;syncTargetStatus(t,"burn");};
  applyPoisonStack=function(t,options={}){const max=RogueCombat.has("rogue_venom_stacks")?7:5,old=t.poisonStacks||0;t.poisonOwner=multiplayer.id;t.poisonStacks=Math.min(max,old+1);t.poisonTimer=5;t.poisonDamagePerStack=roguePoisonDamagePerStack();t.poisonTickTimer ||= 1;syncTargetStatus(t,"poison");if(!t.mazeEnemy)RogueCombat.state.lastPoisonedBoss=t;RogueCombat.emit("poison",{target:t,old,max,direct:options.direct!==false});};
  roguePoisonDamagePerStack=()=>RogueCombat.A()*.035*(RogueCombat.has("rogue_venom_damage")?1.25:1);
  triggerTalentLethalSave=function(source){const c={source,saved:false};RogueCombat.emit("lethal",c);return c.saved;};
  updateRogueDebuffs=function(t,dt){
    for(const [timer,tick,damage,label,interval] of [["poisonTimer","poisonTickTimer","poisonDamagePerStack","Poison",1],["bleedTimer","bleedTickTimer","bleedDamage","Bleed",.5],["burnTimer","burnTickTimer","burnDamage","Burn",.5],["holyBurnTimer","holyBurnTick","holyBurnDamage","Holy Burn",.5]]){
      const remaining=t[timer]||0;if(remaining>0){t[tick]=(t[tick]??interval)-Math.min(dt,remaining);let guard=0;while(t[tick]<=0&&guard++<8){t[tick]+=interval;const owner=t[label.toLowerCase()+"Owner"];damageBossTarget(t,(t[damage]||0)*(label==="Poison"?(t.poisonStacks||0):1),label,{proc:true,dot:true,remoteIntent:Boolean(isPartySyncActive()&&owner&&owner!==multiplayer.id),attackerId:owner});}t[timer]=Math.max(0,remaining-dt);}if(timer==="poisonTimer"&&!t[timer])t.poisonStacks=0;
    }
    t.exposedTimer=Math.max(0,(t.exposedTimer||0)-dt);if(!t.exposedTimer)t.exposedStacks=0;t.judgmentTimer=Math.max(0,(t.judgmentTimer||0)-dt);t.rogueSlowTimer=Math.max(0,(t.rogueSlowTimer||0)-dt);
  };
  updateAbilities=function(dt){RogueCombat.clock+=dt;RogueCombat.updating=true;oldUpdate(dt);RogueCombat.updating=false;abilityEffects.push(...RogueCombat.queuedEffects);RogueCombat.queuedEffects=[];
    const tasks=RogueCombat.tasks;RogueCombat.tasks=[];for(const task of tasks){if(task.room!==player.room||task.phase!==multiplayer.phaseSeq)continue;if(task.at<=RogueCombat.clock)task.callback();else RogueCombat.tasks.push(task);}
    RogueCombat.emit("tick",{dt});const recovery=Math.min(.3,(runState.mazeBuffs.cooldownRecovery||0)+strongestBardSongValue("battle","cooldownRecovery")+(RogueCombat.state.divineRecovery||0))-Math.min(.3,runState.mazeBuffs.cooldownRecovery||0);player.abilityCooldowns=player.abilityCooldowns.map(c=>Math.max(0,c-dt*Math.max(0,recovery)));rogueUpdateExtraFields(dt);if(player.rogueShieldUntil<=RogueCombat.clock)player.rogueShield=0;
    if(RogueCombat.state.buffer&&RogueCombat.state.buffer.until>=RogueCombat.clock&&arcadeInputAllowed()&&player.abilityCooldowns[RogueCombat.state.buffer.index]<=0){const index=RogueCombat.state.buffer.index;RogueCombat.state.buffer=null;useAbility(index);}
    RogueCombat.state.history ||= [];RogueCombat.state.history.push({at:RogueCombat.clock,x:player.x,y:player.y});RogueCombat.state.history=RogueCombat.state.history.filter(h=>RogueCombat.clock-h.at<=2.2);
    if(RogueCombat.state.trapRecharge>0){RogueCombat.state.trapRecharge-=dt;if(RogueCombat.state.trapRecharge<=0){RogueCombat.state.trapCharges=Math.min(2,(RogueCombat.state.trapCharges||0)+1);RogueCombat.state.trapRecharge=RogueCombat.state.trapCharges<2?currentAbilities()[3].cooldown:0;}if(RogueCombat.state.trapCharges>0)player.abilityCooldowns[3]=0;}
  };
  clearArcadeInputs=(function(original){return function(){original();RogueCombat.state.buffer=null;};})(clearArcadeInputs);
  damagePlayer=rogueDamagePlayer;
  const oldHazards=updateHazards;
  updateHazards=function(dt){
    const practice=hazards.filter(h=>h.practice);hazards=hazards.filter(h=>!h.practice);const scaled=[];for(const h of hazards){if(!Number.isFinite(h.vx)||!Number.isFinite(h.vy))continue;let factor=1;for(const e of abilityEffects.concat([...multiplayer.peers.values()].filter(p=>p.room===player.room&&!p.dead).flatMap(p=>p.bardSongs||[]))){if(e.ttl>0&&e.slowFactor&&distance(e,h)<=e.r+(h.r||0))factor=Math.min(factor,e.slowFactor);}if(factor<1){scaled.push({h,vx:h.vx,vy:h.vy});h.vx*=factor;h.vy*=factor;}}
    try{oldHazards(dt);}finally{for(const {h,vx,vy} of scaled){h.vx=vx;h.vy=vy;}}
    for(const h of practice){h.ttl-=dt;const slow=Math.min(1,...abilityEffects.filter(e=>e.slowFactor&&distance(e,h)<e.r).map(e=>e.slowFactor));h.x+=h.vx*dt*slow;h.y+=h.vy*dt*slow;if(distance(h,player)<player.radius+h.r){if(player.hp>1)damagePlayer(Math.min(scaledCombatDamage(4),player.hp-1),"Practice bolt",{fixed:true,skipBossDamageTune:true});h.ttl=0;}if(h.ttl>0&&pointInRect(h.x,h.y,world.starter))hazards.push(h);}
  };
  const oldSpeed=playerSpeed;
  playerSpeed=function(){let speed=oldSpeed();const bonus=Math.max(strongestBardSongValue("battle","speedBuff"),strongestBardSongValue("quickstep","speedBuff")),strips=abilityEffects.concat([...multiplayer.peers.values()].filter(p=>!p.dead&&p.room===player.room&&p.bossKind===boss.kind).flatMap(p=>p.supportZones||[])),stripBonus=strips.some(e=>e.type==="holyStrip"&&e.ttl>0&&rogueSegmentHits(e.x,e.y,e.x2,e.y2,player,e.r))?.1:0;speed=speed/bardMoveSpeedMultiplier()*(1+Math.min(.25,bonus+stripBonus));if(RogueCombat.state.footingUntil>RogueCombat.clock){if(player.tacoGreaseTimer>0)speed*=.832/.58;if(player.pickleSlowTimer>0)speed*=.888/.72;}if(player.castTimer>0&&currentClassKey()==="mage")speed*=.7;return speed;};
  basicAttackCooldown=function(weapon){return weapon.speed/(1+Math.min(.5,(runState.mazeBuffs.attackSpeed||0)+strongestBardSongValue("battle","attackSpeedBuff")));};
  window.addEventListener("keyup",event=>{if(event.key.toLowerCase()==="e")RogueCombat.state.steerStorm=false;});
  fireFireBlast=function(angle){const c=player.pendingAbilityCast?.cast||{factor:1,origin:RogueTraining.origin(player,angle)},origin=RogueTraining.aim().origin,a=Math.atan2(mouseWorld.y-origin.y,mouseWorld.x-origin.x);playerProjectiles.push({x:origin.x,y:origin.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:18,damage:playerDamage(3*c.factor),ttl:1.05,age:0,heavy:true,tag:"Magic",ability:true,fireBlast:true,explosionRadius:132*(c.radiusMultiplier||1),room:player.room,cast:c});};
  explodeFireBlast=function(p,forcedTarget=null,options={}){const c=p.cast||{};c.impactPoint={x:p.x,y:p.y};const excluded=[],hits=[];if(forcedTarget){excluded.push(forcedTarget);if(damageBossTarget(forcedTarget,p.damage,"Fire Blast",{cast:c,...options}))hits.push(forcedTarget);}hits.push(...damageEnemiesInRadius(p.x,p.y,p.explosionRadius,p.damage,"Fire Blast",excluded,{cast:c}));RogueCombat.effect({type:"fireBlastExplosion",x:p.x,y:p.y,r:p.explosionRadius,ttl:.42});RogueCombat.emit("blastEnd",{projectile:p,cast:c,hits});};
  updateArrowStorm=rogueUpdateStorm;updateMeteorField=rogueUpdateMeteor;updateVolleyTrap=rogueUpdateTrap;updatePoisonCloud=rogueUpdateCloud;updateConsecration=rogueUpdateConsecration;updateSmokeBomb=rogueUpdateSmoke;
  applyTimeWarpSlow=()=>{};updateBlinkRune=function(e,dt){e.pulseTimer-=dt;if(e.pulseTimer<=0){e.pulseTimer=.35;damageEnemiesInRadius(e.x,e.y,e.r,scaledCombatDamage(8),"Blink Rune",[],{proc:true});destroyProjectilesInRadius(e.x,e.y,e.r);}};updateAftershock=()=>{};updateBardEchoNote=()=>{};
  const oldSongs=bardSongSettings;
  bardSongSettings=function(type,options={}){RogueCombat.legacyDepth++;let e;try{e=oldSongs(type,options);}finally{RogueCombat.legacyDepth--;}e.id="song-"+(++RogueCombat.sequence);RogueCombat.emit("song",{type,field:e,options});return e;};
  updateBardSongBuffs=rogueUpdateHealing;
  talentAbilityCooldownMultiplier=function(){return (playerInTimeWarp()?.5:1)/(1+Math.min(.3,runState.mazeBuffs.cooldownRecovery||0));};
  const oldKnock=knockPlayerFrom;knockPlayerFrom=function(x,y,speed){oldKnock(x,y,speed*(RogueCombat.state.footingUntil>RogueCombat.clock?.4:1));};
  const oldAim=mazeAimTarget;mazeAimTarget=function(enemy){const target=oldAim(enemy);if(target===player&&RogueCombat.state.untargetableUntil>RogueCombat.clock){const other=[...multiplayer.peers.values()].find(p=>!p.dead&&p.room===player.room);return other||{x:enemy.x,y:enemy.y};}return target;};
  RogueCombat.resetRun();
}

function rogueUpdateStorm(e,dt){
  RogueCombat.emit("stormTick",{field:e,dt});e.pulseTimer-=dt;if(e.pulseTimer>0)return;e.pulseTimer=e.pulseInterval;const hits=RogueCombat.area(e.cast,e.x,e.y,e.r,e.damageMultiplier,"Arrow Storm");e.pulses=(e.pulses||0)+1;RogueCombat.emit("stormPulse",{field:e,hits});if(e.ttl<=e.pulseInterval)RogueCombat.emit("stormEnd",{field:e});
}
function rogueUpdateMeteor(e,dt){
  RogueCombat.emit("meteorTick",{field:e,dt});e.impactTimer-=dt;if(e.remaining<=0||e.impactTimer>0)return;e.impactTimer+=e.impactInterval;e.remaining--;e.impactCount++;
  const a=e.impactCount*2.39996,r=e.impactCount===1?0:Math.sqrt((e.impactCount*.618)%1)*e.r*.65,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;
  const amount=RogueCombat.A()*.75;RogueCombat.effect({type:"meteorWarning",x,y,r:58,ttl:.24});RogueCombat.later(.24,()=>{const hits=damageEnemiesInRadius(x,y,58,amount,"Meteor Field",[],{cast:e.cast});hits.forEach(t=>e.targets.add(t));RogueCombat.effect({type:"meteorImpact",x,y,r:58,ttl:.25});RogueCombat.emit("meteorImpact",{field:e,hits,x,y,amount});if(e.remaining===0)RogueCombat.emit("meteorEnd",{field:e});});
}
function rogueUpdateTrap(e,dt){
  e.triggerTimer-=dt;e.shotTimer-=dt;if(e.triggerTimer>0)return;
  const target=livingBosses().find(t=>distance(e,t)<=e.r+t.radius);
  if(e.shotsRemaining<=0){if(!target)return;if(e.round>=e.reloads){e.ttl=Math.min(e.ttl,.3);return;}e.round++;e.shotsRemaining=e.pocket?3:e.reloads>1?3:5;e.triggerTarget=target;e.triggerTimer=e.round>1?1.5:0;RogueCombat.emit("trapTrigger",{field:e,target});}
  if(e.triggerTimer>0||e.shotTimer>0)return;const t=e.triggerTarget?.hp>0?e.triggerTarget:volleyTrapTarget(e);if(!t)return;
  const c={field:e,target:t,amount:RogueCombat.A()*(e.pocket?.35:e.reloads>1?.4:.5),piercing:false};RogueCombat.emit("trapShot",c);const p=RogueTraining.targetPoint(c.target),a=Math.atan2(p.y-e.y,p.x-e.x);
  playerProjectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*710,vy:Math.sin(a)*710,r:6,damage:Math.round(c.amount),ttl:.8,age:0,tag:"Ranged",ability:true,source:"Trap Arrow",room:player.room,trap:e,piercing:c.piercing});e.shotsRemaining--;e.shotTimer=.13;
}
function rogueUpdateCloud(e,dt){RogueCombat.emit("cloudTick",{field:e,dt});e.pulseTimer-=dt;if(e.pulseTimer>0)return;e.pulseTimer=1;const hits=RogueCombat.area(e.cast,e.x,e.y,e.r,.34,"Poison Cloud");hits.forEach(t=>RogueCombat.poison(t,1,false));}
function rogueUpdateConsecration(e,dt){if(!RogueCombat.has("paladin_consecrate_cathedral")){e.x=player.x;e.y=player.y;}RogueCombat.emit("consecrationTick",{field:e,dt});player.consecrationTimer=distance(e,player)<=e.r?.08:0;e.pulseTimer-=dt;e.healTimer-=dt;if(e.pulseTimer<=0){e.pulseTimer=.5;const hits=RogueCombat.area(e.cast,e.x,e.y,e.r,e.damageMultiplier,"Consecration");RogueCombat.emit("holyPulse",{field:e,hits});}if(e.healTimer<=0){e.healTimer=1;if(distance(e,player)<=e.r)player.hp=Math.min(player.maxHp,player.hp+3);}if(e.ttl<=dt)RogueCombat.emit("consecrationEnd",{field:e});}
function rogueUpdateSmoke(e,dt){RogueCombat.emit("smokeTick",{field:e,dt});if(distance(e,player)<=e.r+player.radius){e.wasInside=true;RogueCombat.state.smokeGrace=RogueCombat.clock+.1;}else if(e.wasInside&&!e.left){e.left=true;player.backstabTimer=Math.max(player.backstabTimer,1.5);player.guardSpeedTimer=Math.max(player.guardSpeedTimer,.75);}e.pulseTimer-=dt;if(e.pulseTimer<=0){e.pulseTimer=1;RogueCombat.emit("smokePulse",{field:e});}}
function rogueUpdateHealing(dt){
  RogueCombat.emit("healingTick",{dt});const songs=bardSongsAffectingPlayer().filter(s=>(s.songType||bardSongType(s))==="healing");const best=songs.sort((a,b)=>(b.healAmount||0)-(a.healAmount||0))[0];if(!best||player.dead)return;
  player.bardHealTickTimer=(player.bardHealTickTimer||0)-dt;if(player.bardHealTickTimer>0)return;player.bardHealTickTimer=1;
  const before=player.hp,amount=best.healAmount||4;player.hp=Math.min(player.maxHp,before+amount);const c={field:best,before,amount,overheal:Math.max(0,before+amount-player.maxHp)};RogueCombat.emit("healPulse",c);
  if(best.overhealShield&&c.overheal>0&&!RogueCombat.has("bard_heal_power"))RogueCombat.shield(Math.min(.05,c.overheal/player.maxHp),2);if(best.rescue&&c.before<player.maxHp*.35&&!RogueNetwork.supportSeen.has("rescue-"+best.id)){RogueNetwork.supportSeen.add("rescue-"+best.id);RogueCombat.heal(.08);}
}

function rogueDamagePlayer(amount,source,options={}) {
  if(CondimentFusion.active())return false;
  if(player.dead||!runState.active)return false;
  const tuned=options.skipBossDamageTune?amount:tunedBossAbilityDamage(amount,source),now=performance.now();
  player.recentlyHitProjectileIds ||= new Set();if(options.projectileId){const id=String(options.projectileId);if(player.recentlyHitProjectileIds.has(id))return false;player.recentlyHitProjectileIds.add(id);}
  if(player.invulnerableTimer>0)return false;
  let hit=options.fixed?tuned:Math.max(1,Math.ceil(tuned*combatTuning.incomingDamageMultiplier-effectivePlayerArmor()));
  if(player.lastDamageAt&&now-player.lastDamageAt<combatTuning.overlapDamageWindowMs&&!options.ignoreOverlapGrace)hit=Math.max(1,Math.ceil(hit*combatTuning.overlapDamageMultiplier));
  const enemy=livingBosses().find(t=>t.name===source)||boss;if(enemy.dissonanceUntil>RogueCombat.clock)hit=Math.ceil(hit*.85);
  const original=hit,c={hit,multiplier:1,guardMultiplier:RogueCombat.has("melee_iron_wall")?.4:.5};RogueCombat.emit("defense",c);
  if(strongestBardSongValue("healing","reduction")>0&&!RogueCombat.has("bard_heal_armor"))c.multiplier*=.88;
  if(player.shieldWallTimer>0)c.multiplier*=c.guardMultiplier;
  if(RogueCombat.inside("consecration"))c.multiplier*=.78;
  if(RogueCombat.state.smokeGrace>RogueCombat.clock)c.multiplier*=.75;
  hit=Math.max(1,Math.ceil(hit*Math.max(.3,c.multiplier)));
  const shield=player.rogueShield||0,absorbed=Math.min(shield,hit);player.rogueShield=Math.max(0,shield-absorbed);hit-=absorbed;
  if(player.shieldWallTimer>0)RogueCombat.state.guardPrevented=(RogueCombat.state.guardPrevented||0)+original-hit;
  RogueCombat.emit("prevented",{prevented:original-hit,hit,source});
  if(hit>=player.hp&&triggerTalentLethalSave(source))return false;
  player.hp=Math.max(0,player.hp-hit);player.lastDamageAt=now;Arcade.emit("hurt");cosmeticShakeUntil=now+140;
  RogueCombat.emit("hurt",{hit,amount:tuned,source});if(shield>0&&player.rogueShield===0)RogueCombat.emit("shieldBreak",{source});
  particles.push({x:player.x,y:player.y-48,text:absorbed?"shield -"+absorbed:"-"+hit,color:absorbed?"#69dec3":"#ff7469",ttl:.6});
  if(player.hp<=0)enterDeathState(source);return true;
}

function rogueUpdateExtraFields(dt) {
  for(const e of abilityEffects){
    if(e.type==="rubbleGuard"&&e.blocks>0){hazards=hazards.filter(h=>{if(e.blocks>0&&Number.isFinite(h.vx)&&Math.abs(distance(e,h)-e.r)<(h.r||8)+8){e.blocks--;return false;}return true;});}
    if(e.type==="kindlingRune"){for(const t of livingBosses())if(!e.triggered.has(t)&&distance(e,t)<e.r+t.radius){e.triggered.add(t);damageBossTarget(t,RogueCombat.A()*.4,"Kindling Rune",{proc:true});applyBurn(t);}}
    if(["bloodTrail","holyStrip","lavaPatch","infernoField","judgmentZone"].includes(e.type)){
      e.pulseTimer=(e.pulseTimer||0)-dt;if(e.pulseTimer>0)continue;e.pulseTimer=.5;
      for(const t of livingBosses()){const line=Number.isFinite(e.x2),inside=line?rogueSegmentHits(e.x,e.y,e.x2,e.y2,t,e.r):distance(e,t)<e.r+t.radius;if(!inside)continue;const rate=e.type==="bloodTrail"?.12*(t.bleedTimer>0?2:1):e.type==="holyStrip"?.12:e.type==="lavaPatch"?.1:e.type==="infernoField"?.2:.15;damageBossTarget(t,RogueCombat.A()*rate*.5,e.type,{proc:true,dot:true});}
    }
  }
}
