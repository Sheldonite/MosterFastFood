/* Attack anchors and practice targets use the same collision path as encounters. */
const RogueTraining = {
  targets: [], mode: "single", incoming: false, incomingTimer: 0, details: false,
  origin(actor = player, angle = aimAngle()) {
    const facing = getFacing(Math.cos(angle), Math.sin(angle));
    const offsets = { down:[8,-32], up:[-8,-54], left:[-18,-42], right:[18,-42] };
    const [x,y] = offsets[facing];
    return { x: actor.x + x, y: actor.y + y };
  },
  targetPoint(target) { return { x: target.x, y: target.y - (target.kind === "trainingDummy" ? 40 : 0) }; },
  aim(actor=player,point=mouseWorld){let angle=Math.atan2(point.y-actor.y,point.x-actor.x),origin;for(let i=0;i<3;i++){origin=this.origin(actor,angle);angle=Math.atan2(point.y-origin.y,point.x-origin.x);}return {origin,angle,facing:getFacing(Math.cos(angle),Math.sin(angle))};},
  reset(mode = this.mode) {
    this.mode = mode; trainingDummy = createTrainingDummy(); trainingDummy.y -= 70;
    this.targets = [trainingDummy];
    if (mode === "cluster") for (let i = 0; i < 2; i++) this.targets.push({ ...createTrainingDummy(), x: trainingDummy.x + (i ? 86 : -86), y: trainingDummy.y - 65, name: "Practice target " + (i+2) });
    this.targets.forEach(t => { t.samples = []; t.breakdown = { direct:0, dot:0, proc:0 }; t.baseX = t.x; t.baseY = t.y; });
    playerProjectiles = []; abilityEffects = []; player.pendingAbilityCast = null;
  },
  record(target, amount, source, options) {
    const now = performance.now(); target.samples ||= []; target.breakdown ||= { direct:0, dot:0, proc:0 };
    target.samples.push({ at:now, amount }); target.samples = target.samples.filter(s => now-s.at <= 5000).slice(-300);
    target.damageTotal = (target.damageTotal || 0) + amount; target.lastDamage = amount; target.lastHitAt = now; target.lastSource = source;
    target.breakdown[options.dot || ["Poison","Bleed","Burn","Holy Burn"].includes(source) ? "dot" : options.proc ? "proc" : "direct"] += amount;
  },
  dps() { return this.targets.reduce((sum,t) => sum + (t.samples || []).filter(s => performance.now()-s.at <= 5000).reduce((n,s) => n+s.amount,0),0) / 5; },
  update(dt) {
    if (player.room !== "starter") return;
    if (!this.targets.length || this.targets[0] !== trainingDummy) this.reset();
    if (this.mode === "moving") { trainingDummy.x = trainingDummy.baseX + Math.sin(runElapsedSeconds*1.4)*85; trainingDummy.y = trainingDummy.baseY + Math.cos(runElapsedSeconds)*25; }
    for (const target of this.targets) if (target.hp <= 0) { target.hp=target.maxHp; target.markedTimer=0; target.markedShots=0; }
    if (this.incoming && (this.incomingTimer -= dt) <= 0) {
      this.incomingTimer = 2; const source = {x:world.starter.x+world.starter.w-60,y:world.starter.y+130};
      const angle = Math.atan2(player.y-source.y,player.x-source.x);
      hazards.push({type:"mazeShot",x:source.x,y:source.y,vx:Math.cos(angle)*130,vy:Math.sin(angle)*130,r:8,damage:4,ttl:5,source:"Practice bolt",practice:true,color:"#ff7469"});
    }
  },
  draw() {
    if (player.room !== "starter") return;
    for (const target of this.targets) {
      Arcade.art.dummy(ctx,target);
      const center = this.targetPoint(target);
      ctx.fillStyle="#101522"; ctx.fillRect(target.x-36,target.y-91,72,10);
      ctx.fillStyle="#efbe55"; ctx.fillRect(target.x-34,target.y-89,68*target.hp/target.maxHp,6);
      const pips = Math.max(target.markedShots || 0,target.poisonStacks || 0,target.exposedStacks || 0);
      ctx.fillStyle=target.poisonStacks>0?"#69dec3":"#efbe55";
      for(let i=0;i<pips;i++)ctx.fillRect(center.x-pips*4+i*8,center.y-42,6,6);
    }
  }
};

function installRogueTraining() {
  const oldActive=activeBosses, oldDamage=applyDamageBossTargetLocal, oldDefeated=handleBossDefeated;
  activeBosses=function(){return player.room==="starter"?RogueTraining.targets.length?RogueTraining.targets:[trainingDummy]:oldActive();};
  resetTrainingDummy=()=>RogueTraining.reset();
  updateTrainingDummy=dt=>RogueTraining.update(dt);
  drawTrainingDummy=()=>RogueTraining.draw();
  handleBossDefeated=function(target){if(target.kind==="trainingDummy")return;return oldDefeated(target);};
  applyDamageBossTargetLocal=function(target,amount,source,options={}){
    const before=target.hp; const result=oldDamage(target,amount,source,options);
    if(target.kind==="trainingDummy" && result)RogueTraining.record(target,before-target.hp,source,options);
    return result;
  };
  const oldFire=firePlayerProjectile, oldArrow=fireAbilityArrow, oldBlast=fireFireBlast;
  function align(created,angle) {
    if(!created)return; const aimed=RogueTraining.aim(),origin=aimed.origin;player.facing=aimed.facing;
    // Cursor aiming is calculated from the weapon, not the feet.
    const exact=Math.atan2(mouseWorld.y-origin.y,mouseWorld.x-origin.x), speed=Math.hypot(created.vx,created.vy);
    created.x=origin.x;created.y=origin.y;created.vx=Math.cos(exact)*speed;created.vy=Math.sin(exact)*speed;created.room=player.room;
    created.attackId="ability-shot-"+(++RogueCombat.sequence); created.origin={...origin};
  }
  firePlayerProjectile=function(angle){const result=oldFire(angle);align(result,angle);if(result){result.attackId=multiplayer.attackSeq;result.damage=playerDamage();if(currentClassKey()==="ranger"&&RogueCombat.state.precisionUntil>RogueCombat.clock){result.piercing=true;result.maxHits=2;}result.cast=RogueCombat.basic();}if(gear.weapon[player.gear.weapon].tag==="Magic")player.castMoveLockTimer=0.08;return result;};
  fireAbilityArrow=function(angle,options){const start=playerProjectiles.length;oldArrow(angle,options);playerProjectiles.slice(start).forEach(p=>align(p,angle));};
  fireFireBlast=function(angle){const start=playerProjectiles.length;oldBlast(angle);playerProjectiles.slice(start).forEach(p=>align(p,angle));};
  const dummySprite=new Image();dummySprite.src="./assets/pixel/props/training-dummy.png";
  Arcade.art.dummy=function(context,target){if(dummySprite.complete&&dummySprite.naturalWidth)context.drawImage(dummySprite,Math.round(target.x/2)*2-32,Math.round(target.y/2)*2-88,64,96);};
  RogueTraining.reset();
}

function rogueSegmentHits(x1,y1,x2,y2,target,radius) {
  const point=RogueTraining.targetPoint(target),dx=x2-x1,dy=y2-y1;
  const t=clamp(((point.x-x1)*dx+(point.y-y1)*dy)/(dx*dx+dy*dy||1),0,1);
  return Math.hypot(point.x-x1-dx*t,point.y-y1-dy*t) <= (target.radius || target.r || 20)+radius;
}

function rogueUpdateProjectiles(dt) {
  playerProjectiles=playerProjectiles.filter(p=>{
    const remaining=Math.min(dt,Math.max(0,p.ttl)),x=p.x,y=p.y; p.ttl-=dt;p.age=(p.age||0)+dt;p.x+=p.vx*remaining;p.y+=p.vy*remaining;
    p.hitTargets ||= []; p.room ||= player.room;
    if(p.room!==player.room)return false;
    if(p.room==="maze" && mazeState && !isMazeSegmentWalkable(x,y,p.x,p.y,p.r||0))return false;
    if(p.room==="arena"){
      if(boss.kind==="donut" && (hitDonutMinion(p)||hitDonutHole(p)))return Boolean(p.piercing&&p.ttl>0);
      if(boss.kind==="sushi" && hitSushiSegment(p,x,y))return Boolean(p.piercing&&p.ttl>0);
    }
    if(typeof RogueBosses!=="undefined"&&RogueBosses.hitBubble?.(p,x,y)&&!p.piercing)return false;
    const targets=livingBosses().filter(t=>!p.hitTargets.includes(t)&&rogueSegmentHits(x,y,p.x,p.y,t,p.r||0)).sort((a,b)=>distance({x,y},a)-distance({x,y},b));
    for(const target of targets){
      p.hitTargets.push(target);
      if(p.fireBlast){explodeFireBlast(p);return false;}
      if(p.markedShot)markBossTarget(target);
      damageBossTarget(target,p.damage,p.markedShot?"Marked Shot":p.ability?p.source||"Ability":"Shot",{projectile:p,rangedBasic:p.tag==="Ranged"&&!p.ability,markedBonus:p.tag==="Ranged"&&!p.ability,markedMultiplier:1.45,proc:Boolean(p.proc)});
      if(p.tag==="Rogue"&&!p.ability){applyPoisonStack(target);applyExposedStack(target,p);}
      if(!p.piercing||p.maxHits&&p.hitTargets.length>=p.maxHits)return false;
    }
    const bounds=p.room==="starter"?world.starter:p.room==="maze"?mazeState?.bounds:world.arena;
    return p.ttl>0 && bounds && pointInRect(p.x,p.y,bounds);
  });
}
