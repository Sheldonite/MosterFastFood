/* Taco and Sushi use committed, food-specific attacks. The host owns the
   choreography; every client checks its player against the same hazard shape. */
const SignatureBosses = {
  kinds: new Set(["taco", "sushi"]), localHits: new Set(), cues: new Set(),
  descriptions: {
    ram: ["Shellbreaker Ram", "Sidestep the ram · punish the wall crash"],
    crunch: ["Crunchquake", "Dodge the landing · cross the broken shockwave"],
    salsa: ["Loaded Salsa", "Bait the lobs · keep a route between the pools"],
    thread: ["Wasabi Thread", "Leave the curved lane · strike the glowing roll"],
    pinch: ["Chopstick Squeeze", "Stay between the sticks or escape to the outside"],
    tide: ["Soy Tide", "Move through the clear passage in the soy wave"]
  },
  active() { return player.room === "arena" && this.kinds.has(boss.kind) && boss.hp > 0 && !intermission; },
  cue(name) {
    const key = boss.kind + ":" + multiplayer.phaseSeq + ":" + boss.phase + ":" + boss.signatureSeq + ":" + name;
    if (this.cues.has(key)) return;
    this.cues.add(key); Arcade.emit(name);
  },
  hazard(properties) {
    const h = { type:"signature", flavor:boss.kind, attackSeq:boss.signatureSeq, age:0, activeAge:0,
      warn:0, warnDuration:0, ttl:1, damage:0, x:boss.x, y:boss.y, ...properties };
    h.warnDuration = h.warn;
    assignHazardSyncId(h, "h"); ensureProjectileId(h); hazards.push(h);
    return h;
  },
  move(point, dt, speed) {
    const dx=point.x-boss.x,dy=point.y-boss.y,d=Math.hypot(dx,dy);
    if (d<1) return;
    boss.serpentHeading=Math.atan2(dy,dx);
    const step=Math.min(d,speed*dt);boss.x+=dx/d*step;boss.y+=dy/d*step;
    if(boss.kind==="sushi")updateSushiBodyChain();
  },
  pointOnPath(points, progress) {
    const f=clamp(progress,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(f)),t=f-i;
    return {x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};
  },
  path(from, to, bend=0) {
    const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1;
    return Array.from({length:19},(_,i)=>{const t=i/18,w=Math.sin(t*Math.PI*2)*Math.sin(t*Math.PI)*bend;
      return clampArenaPoint(from.x+dx*t-dy/len*w,from.y+dy*t+dx/len*w,boss.radius);});
  },
  begin(pattern) {
    if(isPartySyncActive()&&!isMultiplayerHost())return false;
    const capture=beginBossSyncCapture("signature-"+pattern);
    const target=bossAimTarget(boss),from={x:boss.x,y:boss.y},aim=clampArenaPoint(target.x,target.y,105);
    boss.signatureSeq=(boss.signatureSeq||0)+1;
    const s=boss.signature={pattern,elapsed:0,from,target:aim,step:0};
    boss.signatureHint=this.descriptions[pattern][1];boss.signatureName=this.descriptions[pattern][0];
    boss.animation="windup";boss.animationTime=0;
    if(pattern==="ram") {
      const a=Math.atan2(aim.y-from.y,aim.x-from.x),aRect=world.arena,r=boss.radius+8;
      const tx=Math.cos(a)>0?(aRect.x+aRect.w-r-from.x)/Math.cos(a):(aRect.x+r-from.x)/Math.cos(a);
      const ty=Math.sin(a)>0?(aRect.y+aRect.h-r-from.y)/Math.sin(a):(aRect.y+r-from.y)/Math.sin(a);
      const travel=Math.min(Number.isFinite(tx)?tx:Infinity,Number.isFinite(ty)?ty:Infinity);
      s.to=clampArenaPoint(from.x+Math.cos(a)*travel,from.y+Math.sin(a)*travel,r);
      s.warn=1.05;s.duration=s.warn+.68;s.path=this.path(from,s.to);
      this.hazard({shape:"path",points:s.path,r:boss.radius*.72,warn:s.warn,ttl:s.duration,travelDuration:.68,source:"Crunch Charge",damage:13});
    } else if(pattern==="crunch") {
      s.to=aim;s.warn=1.15;s.duration=s.warn+2.15;
      this.hazard({shape:"disc",x:aim.x,y:aim.y,r:84,warn:s.warn,ttl:s.warn+.24,source:"Shell Slam",damage:12});
    } else if(pattern==="salsa") {
      s.warn=.85;s.duration=2.5;
      const offsets= boss.phase===1?[-110,0,110]:[-165,-55,55,165];
      offsets.forEach((offset,i)=>{const a=Math.atan2(aim.y-from.y,aim.x-from.x)+Math.PI/2;
        const p=clampArenaPoint(aim.x+Math.cos(a)*offset,aim.y+Math.sin(a)*offset,70);
        this.hazard({shape:"lob",x:p.x,y:p.y,startX:from.x,startY:from.y,r:38,warn:s.warn+i*.18,ttl:s.warn+i*.18+3.25,source:"Salsa pool",damage:10});});
    } else if(pattern==="thread") {
      const a=Math.atan2(aim.y-from.y,aim.x-from.x),end=clampArenaPoint(aim.x+Math.cos(a)*145,aim.y+Math.sin(a)*145,boss.radius);
      s.path=this.path(from,end,75);s.warn=1.2;s.duration=s.warn+.85;
      this.hazard({shape:"path",points:s.path,r:48,warn:s.warn,ttl:s.duration,travelDuration:.85,source:"Wasabi Dash",damage:12});
      boss.sushiLastAbility="wasabi-dash";
    } else if(pattern==="pinch") {
      s.warn=1.15;s.duration=boss.phase===3?4:2.35;
      const a=Math.atan2(aim.y-from.y,aim.x-from.x);
      this.hazard({shape:"pinch",x:aim.x,y:aim.y,angle:a,length:500,width:20,spread:110,closedSpread:50,warn:s.warn,ttl:2.3,source:"Chopstick Jab",damage:8});
      if(boss.phase===3)this.hazard({shape:"pinch",x:aim.x,y:aim.y,angle:a+Math.PI/2,length:500,width:20,spread:110,closedSpread:50,warn:2.8,ttl:3.95,source:"Chopstick Jab",damage:8});
      boss.sushiLastAbility="chopstick-jab";
    } else if(pattern==="tide") {
      s.warn=1.05;const vertical=boss.signatureSeq%2===0,b=world.arena;
      const span=vertical?b.h:b.w,speed=210;
      const gap=clamp(vertical?aim.x:aim.y,(vertical?b.x:b.y)+110,(vertical?b.x+b.w:b.y+b.h)-110);
      s.duration=s.warn+span/speed+.35;
      this.hazard({shape:"tide",x:b.x,y:b.y,vertical,gap,gapWidth:160,width:38,speed,direction:boss.signatureSeq%4<2?1:-1,warn:s.warn,ttl:s.duration,source:"Soy Sake Wave",damage:6});
      if(boss.phase===3) {
        s.duration+=1.2;
        this.hazard({shape:"tide",x:b.x,y:b.y,vertical,gap:clamp(gap+120,(vertical?b.x:b.y)+110,(vertical?b.x+b.w:b.y+b.h)-110),gapWidth:160,width:38,speed,direction:boss.signatureSeq%4<2?1:-1,warn:s.warn+1.2,ttl:s.duration,source:"Soy Sake Wave",damage:6});
      }
      boss.sushiLastAbility="soy-sake-wave";
    }
    this.cue(boss.kind==="taco"?(pattern==="salsa"?"taco-salsa":"taco-windup"):(pattern==="pinch"?"sushi-pinch":pattern==="tide"?"sushi-tide":"sushi-coil"));
    finishBossSyncCapture(capture);sendHostileSync(true);return true;
  },
  cancel() {
    boss.signatureCancelSeq=boss.signatureSeq||0;boss.signature=null;
    hazards=hazards.filter(h=>h.type!=="signature");
  },
  finish(pattern) {
    boss.signature=null;boss.animation="idle";
    boss.signatureRecovery=pattern==="ram"?4:pattern==="crunch"?2.8:1.65;
    if(boss.kind==="taco") {
      if(pattern==="ram")crackTacoShell(.055,4);
      else {boss.exposedFillingTimer=Math.max(boss.exposedFillingTimer||0,boss.signatureRecovery);boss.shellGuardActive=false;}
      boss.signatureHint="Filling exposed · attack before the shell closes";
    } else {
      boss.rogueExposed=boss.signatureRecovery;boss.signatureHint="Serpent recovering · attack the glowing roll";
    }
    this.cue(boss.kind==="taco"?"taco-crunch":"sushi-rest");
  },
  phase() {
    const next=boss.hp/boss.maxHp<=.33?3:boss.hp/boss.maxHp<=.66?2:1;
    if(next<=boss.phase)return;
    this.cancel();boss.phase=next;boss.enraged=next===3;boss.signatureRecovery=1.8;
    boss.signatureName= boss.kind==="taco"?(next===2?"Loaded Shell":"Final Feast"):(next===2?"Split Roll":"Dragon Roll");
    boss.signatureHint=boss.signatureName+" · new attack combinations";
    if(boss.kind==="sushi")initializeSushiTrail(boss);
    showFloat(boss.signatureName);this.cue("boss-phase");
  },
  update(dt) {
    if(!this.active()||isPartySyncActive()&&!isMultiplayerHost())return;
    boss.animationTime+=dt;player.attackCooldown-=dt;
    this.phase();
    boss.exposedFillingTimer=Math.max(0,(boss.exposedFillingTimer||0)-dt);
    boss.shellGuardActive=boss.kind==="taco"&&boss.exposedFillingTimer<=0;
    boss.rogueExposed=Math.max(0,(boss.rogueExposed||0)-dt);
    boss.sushiWeakFlashTimer=Math.max(0,(boss.sushiWeakFlashTimer||0)-dt);
    boss.serpentWeakTimer-=dt;
    if(boss.kind==="sushi"&&boss.serpentWeakTimer<=0)rotateSushiWeakSegment();
    const recovery=Math.max(boss.signatureRecovery||0,boss.rogueRecovery||0);
    boss.signatureRecovery=Math.max(0,(boss.signatureRecovery||0)-dt);boss.rogueRecovery=Math.max(0,(boss.rogueRecovery||0)-dt);
    if(recovery>0)return;
    const s=boss.signature;
    if(!s) {
      boss.attackTimer-=dt;
      if(boss.kind==="sushi")updateSushiMovement(dt);
      else {const target=bossAimTarget(boss);this.move(clampArenaPoint(target.x,target.y,120),dt,40);}
      if(boss.attackTimer>0)return;
      const deck=boss.kind==="taco"?["ram","crunch","salsa"]:boss.phase===1?["thread","pinch","tide"]:["thread","tide","pinch"];
      this.begin(deck[(boss.signatureTurn||0)%deck.length]);boss.signatureTurn=(boss.signatureTurn||0)+1;
      return;
    }
    s.elapsed+=dt;
    if(s.pattern==="ram"||s.pattern==="thread") {
      if(s.elapsed>=s.warn){const p=this.pointOnPath(s.path,(s.elapsed-s.warn)/(s.duration-s.warn));boss.x=p.x;boss.y=p.y;
        const ahead=this.pointOnPath(s.path,Math.min(1,(s.elapsed-s.warn)/(s.duration-s.warn)+.04));
        if(distance(p,ahead)>0.1)boss.serpentHeading=Math.atan2(ahead.y-p.y,ahead.x-p.x);
        if(boss.kind==="sushi")updateSushiBodyChain();
      }
    } else if(s.pattern==="crunch") {
      if(s.elapsed<s.warn){const t=clamp(s.elapsed/s.warn,0,1);boss.x=s.from.x+(s.to.x-s.from.x)*t;boss.y=s.from.y+(s.to.y-s.from.y)*t;}
      else if(!s.step) {
        s.step=1;boss.x=s.to.x;boss.y=s.to.y;
        const gap=Math.atan2(s.from.y-s.to.y,s.from.x-s.to.x);
        for(let i=0;i<(boss.phase>=2?2:1);i++)this.hazard({shape:"ring",x:s.to.x,y:s.to.y,r:90,width:22,speed:160,maxRadius:340,gapAngle:gap,gapWidth:1.2,warn:.25+i*.45,ttl:2.1+i*.45,source:"Shell Shard",damage:8});
        boss.exposedFillingTimer=3.2;boss.shellGuardActive=false;this.cue("taco-crunch");sendHostileSync(true);
      }
    } else if(boss.kind==="sushi") {
      // The body follows an arena-edge arc while the sticks / tide hold their aim.
      const a=s.elapsed*.55+(boss.signatureSeq%2?0:Math.PI),b=world.arena;
      this.move(clampArenaPoint(b.x+b.w/2+Math.cos(a)*280,b.y+b.h/2+Math.sin(a)*230,boss.radius),dt,110);
    }
    if(s.elapsed>=s.duration){this.finish(s.pattern);boss.attackTimer=.65;}
  },
  pinchLines(h) {
    const progress=clamp(h.activeAge/.75,0,1),spread=h.spread+(h.closedSpread-h.spread)*progress;
    return [-1,1].map(side=>{const x=h.x-Math.cos(h.angle)*h.length/2-Math.sin(h.angle)*spread*side,
      y=h.y-Math.sin(h.angle)*h.length/2+Math.cos(h.angle)*spread*side;
      return {x,y,x2:x+Math.cos(h.angle)*h.length,y2:y+Math.sin(h.angle)*h.length};});
  },
  tidePosition(h) {
    const b=world.arena,start=h.vertical?b.y:b.x,span=h.vertical?b.h:b.w;
    return h.direction>0?start+h.activeAge*h.speed:start+span-h.activeAge*h.speed;
  },
  touches(h, actor=player) {
    if(h.warn>0||h.ttl<=0)return false;
    const radius=actor.radius||18;
    if(h.shape==="disc"||h.shape==="lob")return distance(h,actor)<=h.r+radius;
    if(h.shape==="ring")return Math.abs(distance(h,actor)-h.r)<=h.width/2+radius&&Math.abs(angleDifference(Math.atan2(actor.y-h.y,actor.x-h.x),h.gapAngle))>h.gapWidth/2;
    if(h.shape==="path") {
      const now=this.pointOnPath(h.points,h.activeAge/h.travelDuration),before=this.pointOnPath(h.points,(h.previousActiveAge||0)/h.travelDuration);
      return rogueSegmentHits(before.x,before.y,now.x,now.y,actor,h.r);
    }
    if(h.shape==="pinch")return this.pinchLines(h).some(line=>rogueSegmentHits(line.x,line.y,line.x2,line.y2,actor,h.width/2));
    if(h.shape==="tide") {
      const parallel=h.vertical?actor.y:actor.x,across=h.vertical?actor.x:actor.y,pos=this.tidePosition(h);
      return Math.abs(parallel-pos)<=h.width/2+radius&&Math.abs(across-h.gap)>=h.gapWidth/2-radius;
    }
    return false;
  },
  hit(h) {
    const beat=h.shape==="lob"?Math.floor(h.activeAge/.8):0, id=ensureProjectileId(h)+":"+beat;
    if(this.localHits.has(id)||player.dead)return;
    this.localHits.add(id);
    damagePlayerFromProjectile({...h,projectileId:id,hitPlayerIds:[]},h.damage,h.source,{piercing:true});
  },
  updateHazards(dt) {
    for(const h of hazards.filter(h=>h.type==="signature")) {
      if(h.flavor!==boss.kind||h.attackSeq<=(boss.signatureCancelSeq||0)){h.ttl=0;continue;}
      const warning=Math.max(0,h.warn);h.age+=dt;h.ttl-=dt;h.warn=Math.max(0,h.warn-dt);
      h.previousActiveAge=h.activeAge;h.activeAge+=Math.max(0,dt-warning);
      if(h.shape==="ring")h.r=Math.min(h.maxRadius,90+h.activeAge*h.speed);
      if(this.touches(h))this.hit(h);
    }
    hazards=hazards.filter(h=>h.type!=="signature"||h.ttl>0);
  },
  pixel(v){return Math.round(v/2)*2;},
  lane(points,r,color,fill=.08) {
    // Fill once: overlapping translucent stamps made the center look like a glow.
    const edges=[-1,1].map(side=>points.map((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      return {x:this.pixel(p.x-dy/len*r*side),y:this.pixel(p.y+dx/len*r*side)};}));
    const polygon=[...edges[0],...edges[1].reverse()];
    ctx.save();ctx.globalAlpha=fill;ctx.fillStyle=color;ctx.beginPath();
    polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.restore();
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      ctx.fillStyle=color;for(let j=0;j<=len;j+=8)for(const side of [-1,1])ctx.fillRect(this.pixel(a.x+dx*j/len-dy/len*r*side)-2,this.pixel(a.y+dy*j/len+dx/len*r*side)-2,4,4);}
  },
  cross(x,y,color){ctx.fillStyle=color;ctx.fillRect(this.pixel(x)-9,this.pixel(y)-2,18,4);ctx.fillRect(this.pixel(x)-2,this.pixel(y)-9,4,18);},
  drawHazard(h) {
    const warning=h.warn>0,color=warning?"#efbe55":"#ff7469",progress=warning?clamp(1-h.warn/h.warnDuration,0,1):1;
    ctx.save();ctx.shadowBlur=0;
    const arena=world.arena;ctx.beginPath();ctx.rect(arena.x,arena.y,arena.w,arena.h);ctx.clip();
    if(h.shape==="path") {
      this.lane(h.points,h.r,color,warning?.055:.035);
      if(warning){const p=this.pointOnPath(h.points,progress);this.cross(p.x,p.y,color);}
      else{const p=this.pointOnPath(h.points,h.activeAge/h.travelDuration);RoguePresentation.contour(ctx,p.x,p.y,h.r,color,.07);}
    } else if(h.shape==="disc"||h.shape==="lob") {
      RoguePresentation.contour(ctx,h.x,h.y,h.r,color,warning?.06:.2);
      if(warning){RoguePresentation.contour(ctx,h.x,h.y,h.r*progress,color,.06);this.cross(h.x,h.y,color);}
      if(h.shape==="lob") {
        if(warning){const t=progress,x=h.startX+(h.x-h.startX)*t,y=h.startY+(h.y-h.startY)*t-Math.sin(t*Math.PI)*100;
          ctx.fillStyle="#101522";ctx.fillRect(this.pixel(x)-12,this.pixel(y)-12,24,24);ctx.fillStyle="#e95743";ctx.fillRect(this.pixel(x)-8,this.pixel(y)-8,16,16);ctx.fillStyle="#fff1cd";ctx.fillRect(this.pixel(x)-4,this.pixel(y)-8,8,4);}
        else{ctx.fillStyle="#df5945";for(let i=0;i<6;i++){const a=i*2.399;ctx.fillRect(this.pixel(h.x+Math.cos(a)*h.r*.55)-5,this.pixel(h.y+Math.sin(a)*h.r*.55)-4,10,8);}}
      }
    } else if(h.shape==="ring") {
      for(let a=0;a<Math.PI*2;a+=.035)if(Math.abs(angleDifference(a,h.gapAngle))>h.gapWidth/2){ctx.fillStyle=color;const x=h.x+Math.cos(a)*h.r,y=h.y+Math.sin(a)*h.r;ctx.fillRect(this.pixel(x)-h.width/2,this.pixel(y)-h.width/2,h.width,h.width);}
      const p=pointFromAngle(h.x,h.y,h.gapAngle,h.r);RoguePresentation.corners(ctx,p.x,p.y,18,"#69dec3");
    } else if(h.shape==="pinch") {
      const lines=this.pinchLines(h);
      lines.forEach(line=>{
        if(warning){const side=lines.indexOf(line)?1:-1,shift=(h.spread-h.closedSpread)/2;
          const x=line.x+Math.sin(h.angle)*shift*side,y=line.y-Math.cos(h.angle)*shift*side;
          this.lane([{x,y},{x:x+Math.cos(h.angle)*h.length,y:y+Math.sin(h.angle)*h.length}],h.width/2+shift,color,.08);}
        else{ctx.save();ctx.translate(line.x,line.y);ctx.rotate(h.angle);ctx.fillStyle="#101522";ctx.fillRect(0,-h.width/2-4,h.length,h.width+8);ctx.fillStyle="#dba667";ctx.fillRect(0,-h.width/2,h.length,h.width);ctx.fillStyle="#fff1cd";ctx.fillRect(0,-h.width/2,h.length,4);ctx.restore();}
      });
      if(warning){const closed={...h,activeAge:.75};this.pinchLines(closed).forEach(line=>this.lane([{x:line.x,y:line.y},{x:line.x2,y:line.y2}],h.width/2,"#ff7469",.025));}
    } else if(h.shape==="tide") {
      const b=world.arena,pos=this.tidePosition(h),across=h.vertical?b.x:b.y,span=h.vertical?b.w:b.h;
      for(let at=across;at<across+span;at+=8){if(Math.abs(at+4-h.gap)<h.gapWidth/2)continue;
        ctx.fillStyle=warning?"#efbe55":"#794f42";
        if(h.vertical)ctx.fillRect(at,this.pixel(pos)-h.width/2,8,h.width);else ctx.fillRect(this.pixel(pos)-h.width/2,at,h.width,8);
        ctx.fillStyle=color;if(h.vertical)ctx.fillRect(at,this.pixel(pos)-h.width/2,8,4);else ctx.fillRect(this.pixel(pos)-h.width/2,at,4,8);
      }
      const gx=h.vertical?h.gap:pos,gy=h.vertical?pos:h.gap;RoguePresentation.corners(ctx,gx,gy,h.gapWidth/2-12,"#69dec3");
      if(warning){ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#69dec3";if(h.vertical)ctx.fillRect(h.gap-h.gapWidth/2,b.y,h.gapWidth,b.h);else ctx.fillRect(b.x,h.gap-h.gapWidth/2,b.w,h.gapWidth);ctx.restore();}
    }
    ctx.restore();
  },
  drawTaco() {
    const s=boss.signature,jump=s?.pattern==="crunch"&&s.elapsed<s.warn?Math.sin(s.elapsed/s.warn*Math.PI)*105:0;
    ctx.fillStyle="#0c101caa";ctx.fillRect(this.pixel(boss.x)-55,this.pixel(boss.y)+30,110,14);
    Arcade.art.boss(ctx,{...boss,y:boss.y-jump},"taco");
    RoguePresentation.corners(ctx,boss.x,boss.y-jump-20,boss.radius+10,boss.exposedFillingTimer>0?"#69dec3":"#efbe55");
    if(boss.shellCrackStacks>0){ctx.fillStyle="#101522";for(let i=0;i<Math.min(3,boss.shellCrackStacks);i++){const x=boss.x-25+i*25;ctx.fillRect(this.pixel(x),this.pixel(boss.y-jump)-15,4,28);ctx.fillRect(this.pixel(x)+4,this.pixel(boss.y-jump)+9,8,4);}}
  },
  drawSushi() {
    const segments=sushiSegments();
    for(let i=segments.length-1;i>=1;i--){const s=segments[i],tail=i===segments.length-1;
      ctx.fillStyle="#0c101caa";ctx.fillRect(this.pixel(s.x)-s.r,this.pixel(s.y)+s.r*.3,s.r*2,10);
      drawGeneratedImage(tail?"bosses.sushiTail":s.weak?"bosses.sushiWeakSegment":"bosses.sushiSegment",this.pixel(s.x),this.pixel(s.y),s.r*2.2,s.r*1.8,{rotation:s.heading});
      if(s.weak)RoguePresentation.corners(ctx,s.x,s.y,s.r+8,"#69dec3");
    }
    Arcade.art.boss(ctx,boss,"sushi");
    if(boss.rogueRecovery>0||boss.signatureRecovery>0)RoguePresentation.corners(ctx,boss.x,boss.y,boss.radius+8,"#69dec3");
  }
};

function installSignatureBosses() {
  const oldCreate=createBoss;
  createBoss=function(kind){const b=oldCreate(kind);if(SignatureBosses.kinds.has(kind))Object.assign(b,{signature:null,signatureSeq:0,signatureCancelSeq:0,signatureTurn:0,signatureRecovery:0,signatureHint:kind==="taco"?"Bait the wall ram · crack the shell":"Watch the curved lane · strike the glowing roll",signatureName:"",tacoPuzzleActive:false});return b;};
  const oldLoad=loadBoss;loadBoss=function(kind){oldLoad(kind);SignatureBosses.localHits.clear();SignatureBosses.cues.clear();};
  const oldUpdate=updateBossCombatLocal;updateBossCombatLocal=function(dt){if(SignatureBosses.kinds.has(boss.kind))return SignatureBosses.update(dt);return oldUpdate(dt);};
  const oldPassive=updateRemoteBossPassive;updateRemoteBossPassive=function(dt){oldPassive(dt);if(!SignatureBosses.kinds.has(boss.kind))return;if(boss.signature){boss.signature.elapsed+=dt;const p=boss.signature.pattern;SignatureBosses.cue(boss.kind==="taco"?(p==="salsa"?"taco-salsa":"taco-windup"):(p==="pinch"?"sushi-pinch":p==="tide"?"sushi-tide":"sushi-coil"));}boss.signatureRecovery=Math.max(0,(boss.signatureRecovery||0)-dt);};
  const oldHazards=updateHazards;updateHazards=function(dt){const owned=hazards.filter(h=>h.type==="signature");hazards=hazards.filter(h=>h.type!=="signature");oldHazards(dt);hazards.push(...owned);SignatureBosses.updateHazards(dt);};
  const oldDraw=drawHazards;drawHazards=function(){const all=hazards,owned=all.filter(h=>h.type==="signature");hazards=all.filter(h=>h.type!=="signature");try{oldDraw();}finally{hazards=all;}owned.forEach(h=>SignatureBosses.drawHazard(h));};
  drawTacoTitanBoss=()=>SignatureBosses.drawTaco();drawSushiSerpentBoss=()=>SignatureBosses.drawSushi();
  drawTacoObjectiveText=()=>{};
  const oldCaption=rogueEncounterCaption;rogueEncounterCaption=function(fallback){if(SignatureBosses.active())return boss.signatureHint;return oldCaption(fallback);};
  const oldHit=applyDamageBossTargetLocal;applyDamageBossTargetLocal=function(t,amount,source,options={}){const before=boss.rogueRecovery||0,result=oldHit(t,amount,source,options);if(result&&t===boss&&boss.kind==="sushi"&&(boss.rogueRecovery||0)>before&&(!isPartySyncActive()||isMultiplayerHost())){SignatureBosses.cancel();boss.signatureHint="Roll broken · the serpent is staggered";SignatureBosses.cue("sushi-rest");}return result;};
  hostileHazardTypeFields.signature=["flavor","attackSeq","shape","points","age","activeAge","previousActiveAge","warnDuration","travelDuration","startX","startY","maxRadius","gapAngle","gapWidth","spread","closedSpread","gap"];
  // Frequent pose packets must not rewind a warning or active wave between
  // arrivals. The host still supplies every path, phase and cancellation.
  const oldMerge=applyHostileSnapshotFields;applyHostileSnapshotFields=function(target,snapshot,includePosition){
    const own=target?.type==="signature",age=target?.activeAge,warn=target?.warn,ttl=target?.ttl;
    oldMerge(target,snapshot,includePosition);
    if(own){target.activeAge=Math.max(age||0,target.activeAge||0);target.warn=Math.min(warn,target.warn);target.ttl=Math.min(ttl,target.ttl);}
  };
}
