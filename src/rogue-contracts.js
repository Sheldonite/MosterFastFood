/* Optional objective rooms. Host owns objectives and enemy decisions. */
const RogueContracts = {
  units:{vent:"pumps",delivery:"deliveries",drain:"drain",mix:"mixtures",valves:"valves",battery:"heaters",press:"presses",hotcrate:"crate",circuit:"stamps",intercept:"crates",bait:"bait"},
  definitions: {
    cola:{name:"Pressure Works",description:"Hold Enter beside three pumps to vent them. Interrupt workers and dodge pressure lanes.",goal:3,time:60,mode:"vent",roles:["worker","sniper","worker"]},
    burger:{name:"Assembly Line",description:"Carry three ingredients to the grill. Enter picks up cargo or redirects the central conveyor.",goal:3,time:60,mode:"delivery",roles:["guard","charger","guard"]},
    fries:{name:"Fryer Crossing",description:"Reach the far drain and hold Enter to open it. Alternating fryer lanes leave a clear crossing window.",goal:1,time:50,mode:"drain",roles:["sniper","runner"]},
    trio:{name:"Mixing Station",description:"Use Enter to rotate each nozzle to its matching vat. Keep all three mixtures aligned.",goal:3,time:60,mode:"mix",roles:["worker","guard"]},
    sauce:{name:"Overflow Cellar",description:"Attack three valves to open a dry escape path. The sauce surges through visibly marked lanes.",goal:3,time:55,mode:"valves",roles:["runner","sniper"]},
    shake:{name:"Freezer Outage",description:"Pick up the battery with Enter, then charge three heaters. Powered heaters create safe thawed lanes.",goal:3,time:60,mode:"battery",roles:["charger","worker"]},
    nacho:{name:"Cheese Foundry",description:"Destroy two armor presses. Watch their locked quadrants and attack between crusher swings.",goal:2,time:55,mode:"press",roles:["crusher","guard"]},
    pizza:{name:"Oven Delivery",description:"Carry the hot crate to the far oven. Enter drops or recovers it; the central switch opens the oven door and reverses the conveyor.",goal:1,time:60,mode:"hotcrate",roles:["sniper","guard"]},
    donut:{name:"Bakery Circuit",description:"Collect three stamps through the rollers. All five stamps improve the temporary reward; Enter ends the route once three are collected.",goal:3,time:50,mode:"circuit",roles:["runner"]},
    taco:{name:"Market Rush",description:"Intercept three ingredient thieves, then recover their crates with Enter before they reach the exit.",goal:3,time:55,mode:"intercept",roles:["thief","thief","thief"]},
    sushi:{name:"River Crossing",description:"Use Enter to place bait at three river stations. Switch the current at the central wheel to reach them safely.",goal:3,time:60,mode:"bait",roles:["lancer","lancer"]}
  },
  interactHeld:false, interactPressed:false, syncTimer:0, syncSeq:0,
  create(kind,sequence) {
    const d=this.definitions[kind], b=createGauntletBounds(),variant=hashString((multiplayer.room?.id?multiplayer.room.id+":"+(multiplayer.room.runSeed||0):Arcade.progress.profile.journal?.id||"solo")+":"+kind+":"+sequence)%2;
    const patterns={cola:[[.28,.28],[.74,.28],[.5,.74]],burger:[[.2,.23],[.45,.7],[.78,.23]],fries:[[.84,.2]],trio:[[.22,.3],[.52,.23],[.8,.5]],sauce:[[.23,.24],[.73,.32],[.55,.76]],shake:[[.24,.26],[.76,.28],[.5,.75]],nacho:[[.3,.3],[.7,.7]],pizza:[[.18,.78],[.82,.2]],donut:[[.22,.6],[.3,.2],[.7,.2],[.8,.6],[.5,.8]],taco:[[.23,.3],[.5,.45],[.76,.3]],sushi:[[.24,.26],[.5,.72],[.76,.26]]};
    const nodes=patterns[kind].map(([x,y],i)=>({id:"objective-"+i,x:b.x+b.w*(variant?1-x:x),y:b.y+b.h*y,progress:0,done:false,orientation:(i+1)%3,desired:i%3,carrier:kind==="taco"?"contract-"+kind+"-"+i:null}));
    const enemyPoints=[[.7,.65],[.56,.3],[.2,.45]];
    const enemies=d.roles.map((role,i)=>{const point=enemyPoints[i%enemyPoints.length],name={worker:"Fizz Worker",guard:"Bun Guard",charger:"Pickle Flanker",sniper:"Salt Sniper",runner:"Kitchen Runner",crusher:"Press Crusher",thief:"Ingredient Thief",lancer:"Chopstick Guard"}[role];return {id:"contract-"+kind+"-"+i,kind:"mazeEnemy",name,role,mazeEnemy:true,x:b.x+b.w*point[0],y:b.y+b.h*point[1],spawnX:b.x+b.w*point[0],spawnY:b.y+b.h*point[1],radius:role==="guard"?24:18,hp:role==="guard"?90:70,maxHp:role==="guard"?90:70,speed:role==="runner"||role==="thief"?105:80,damage:10,ranged:role==="sniper",miniBoss:false,state:"idle",moveTimer:0,attackTimer:1+i*.6,windup:0,recovery:0,shieldTimer:0};});
    if(kind==="sauce"||kind==="nacho")nodes.forEach((n,i)=>enemies.push({id:n.id,kind:"mazeEnemy",name:kind==="sauce"?"Pressure Valve":"Armor Press",role:"objective",mazeEnemy:true,x:n.x,y:n.y,radius:24,hp:kind==="sauce"?65:100,maxHp:kind==="sauce"?65:100,speed:0,damage:0,miniBoss:false,moveTimer:0,attackTimer:99}));
    enemies.forEach(enemy=>{enemy.maxHp=scaledCombatHealth(enemy.maxHp);enemy.hp=enemy.maxHp;});
    const obstacles=[];
    const rect=(x,y,w,h)=>obstacles.push({shape:"rect",type:"rect",x:b.x+b.w*x-w/2,y:b.y+b.h*y-h/2,w,h,color:"#35455c",outline:"#65738c",label:"Counter"});
    if(kind==="burger"){rect(.32,.45,110,38);rect(.68,.62,110,38);}
    if(kind==="trio"){rect(.38,.6,38,130);rect(.67,.32,38,90);}
    if(kind==="sauce"){rect(.4,.45,95,40);rect(.7,.67,95,40);}
    if(kind==="nacho"){rect(.5,.5,42,120);}
    if(kind==="pizza"){rect(.5,.3,170,32);rect(.5,.65,170,32);}
    if(kind==="sushi"){rect(.37,.44,44,95);rect(.64,.65,44,95);}
    const contract={kind,name:d.name,mode:d.mode,goal:d.goal,elapsed:0,time:d.time,completed:0,nodes,variant,phase:0,carrying:null,direction:1,heat:100,finished:false,failed:false,caption:d.name+" · "+d.description};
    return {active:true,encounterType:"gauntlet",contract,kind,sequence,seed:hashString(kind+sequence),theme:{...(mazeThemes[kind]||mazeThemes.cola),name:d.name},cols:13,rows:11,grid:Array.from({length:11},()=>Array(13).fill(false)),bounds:b,cellSize:1,entrance:{x:b.x+8,y:b.y+b.h-80,w:72,h:72},exit:{x:b.x+b.w-80,y:b.y+8,w:72,h:72},playerStart:{x:b.x+60,y:b.y+b.h-48},obstacles,waves:[],waveIndex:-1,waveTimer:0,miniBossSpawned:false,miniBossEnemy:null,spawnMarkers:[],pickupDrops:[],claimedPickupIds:new Set(),enemies,rewardOptions:chooseMazeRewards(hashString(kind+sequence)),rewardPending:false,rewardChosen:false,exitOpen:false,cleared:false};
  },
  move(dx,dy){const p=constrainToRoom(player.x+dx,player.y+dy);player.x=p.x;player.y=p.y;},
  actor(id){return id===multiplayer.id||id==="solo"?player:multiplayer.peers.get(id);},
  interact(actor=player,pressed=this.interactPressed,held=this.interactHeld,dt=0) {
    const state=mazeState,c=state?.contract;if(!c||c.finished||actor.dead)return;const actorId=actor===player?(multiplayer.id||"solo"):(actor.id||[...multiplayer.peers].find(([,p])=>p===actor)?.[0]);if(c.carrying&&c.carrierId!==actorId&&["battery","delivery","hotcrate"].includes(c.mode))return;
    const n=c.nodes.find(n=>!n.done&&Math.hypot(actor.x-n.x,actor.y-n.y)<62);
    const center={x:state.bounds.x+state.bounds.w/2,y:state.bounds.y+state.bounds.h/2};
    if(pressed&&distance(actor,center)<55&&["delivery","hotcrate","bait"].includes(c.mode)){c.direction*=-1;if(c.mode==="hotcrate")c.doorOpen=!c.doorOpen;showFloat(c.mode==="hotcrate"?(c.doorOpen?"Oven door open":"Oven door closed"):"Direction switched");return;}
    if(["vent","drain","battery","bait"].includes(c.mode)&&n){
      if(c.mode==="battery"&&!c.carrying){if(pressed){c.carrying="battery";c.carrierId=actorId;};return;}
      if(held){n.progress+=dt;if(n.progress>=(c.mode==="bait"?1:2)){n.done=true;c.completed++;if(c.mode==="battery")c.activeHeater=n.id;}}
    }
    if(c.mode==="mix"&&n&&pressed){n.orientation=(n.orientation+1)%3;n.progress=0;}
    if(c.mode==="circuit"&&n&&distance(actor,n)<50){n.done=true;c.completed++;}
    if(c.mode==="circuit"&&pressed&&c.completed>=c.goal){this.finish(true);return;}
    if(["delivery","hotcrate"].includes(c.mode)&&pressed){
      const grill=c.mode==="hotcrate"?c.nodes[1]:{x:state.bounds.x+state.bounds.w*.82,y:state.bounds.y+state.bounds.h*.76};
      if(c.carrying&&distance(actor,grill)<70){c.completed++;c.carrying=null;c.carrierId=null;if(c.mode==="hotcrate")this.finish(true);return;}
      if(!c.carrying&&n&&(c.mode!=="hotcrate"||n===c.nodes[0])){c.carrying=n.id;c.carrierId=actorId;n.done=true;return;}
      if(c.carrying&&c.mode==="hotcrate"){const crate=c.nodes[0];crate.x=actor.x;crate.y=actor.y;crate.done=false;c.carrying=null;}
    }
    if(c.mode==="intercept"&&n&&pressed&&!n.carrier){n.done=true;c.completed++;}
    if(c.completed>=c.goal&&c.mode!=="circuit")this.finish(true);
  },
  environment(dt) {
    const state=mazeState,c=state?.contract;if(!c||c.finished)return;
    if(c.mode==="hotcrate"){state.obstacles=state.obstacles.filter(o=>!o.ovenDoor);if(!c.doorOpen)state.obstacles.push({ovenDoor:true,type:"rect",shape:"rect",x:state.bounds.x+state.bounds.w/2-18,y:state.bounds.y+state.bounds.h/2-48,w:36,h:96,color:"#35455c",outline:"#efbe55",label:"Oven door"});}
    if(["delivery","hotcrate"].includes(c.mode)){const lane=(Math.floor((player.y-state.bounds.y)/90)%2?1:-1)*c.direction;this.move(lane*25*dt,0);}
    if(c.mode==="bait")this.move(0,c.direction*18*dt);
  },
  update(dt) {
    if(!mazeState?.contract||mazeState.rewardPending)return;
    this.environment(dt);
    if(isPartySyncActive()&&!isMultiplayerHost()){if(this.interactPressed||this.interactHeld){this.syncTimer-=dt;if(this.interactPressed||this.syncTimer<=0){this.syncTimer=.1;sendMultiplayerEvent({kind:"contract-action",phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind,pressed:this.interactPressed,held:this.interactHeld,seq:++this.syncSeq});}}this.interactPressed=false;return;}
    const c=mazeState.contract;if(c.finished)return;c.elapsed+=dt;
    this.interact(player,this.interactPressed,this.interactHeld,dt);this.interactPressed=false;
    if(c.mode==="mix"){for(const n of c.nodes)if(!n.done&&n.orientation===n.desired){n.progress+=dt;if(n.progress>=3){n.done=true;c.completed++;}}}
    if(c.mode==="valves"||c.mode==="press"){for(const n of c.nodes)if(!n.done&&mazeState.enemies.find(e=>e.id===n.id)?.hp<=0){n.done=true;c.completed++;}}
    if(c.mode==="intercept"){for(const n of c.nodes){if(!n.carrier)continue;const thief=mazeState.enemies.find(e=>e.id===n.carrier);if(!thief||thief.hp<=0){n.carrier=null;if(thief){n.x=thief.x;n.y=thief.y;}}else{n.x=thief.x;n.y=thief.y;if(thief.y<mazeState.bounds.y+40){c.failed=true;this.finish(false);return;}}}}
    if(c.mode==="hotcrate"){c.heat=Math.max(0,c.heat-dt*(c.carrying?.8:2));if(c.heat<=0){this.finish(false);return;}}
    if(c.mode==="circuit"){for(const n of c.nodes)if(!n.done&&distance(player,n)<38){n.done=true;c.completed++;}}
    if(c.completed>=c.goal&&c.mode!=="circuit"){this.finish(true);return;}
    this.updateEnemies(dt);
    const phase=Math.floor(c.elapsed/6);if(phase!==c.phase){c.phase=phase;this.pattern(c);}
    if(c.elapsed>=c.time){this.finish(c.mode==="circuit"&&c.completed>=c.goal);return;}
    c.caption=c.name+" · "+c.completed+"/"+c.goal+" · "+Math.ceil(c.time-c.elapsed)+"s · "+(c.carrying?"Carrying "+(c.mode==="hotcrate"?"hot crate ("+Math.ceil(c.heat)+"%)":c.carrying)+" · ":"")+"Enter: interact";
    this.syncTimer-=dt;if(this.syncTimer<=0){this.syncTimer=.2;this.broadcast();}
  },
  updateEnemies(dt) {
    const c=mazeState.contract;
    for(const e of mazeState.enemies){if(e.hp<=0||e.role==="objective")continue;e.moveTimer+=dt;e.attackTimer-=dt;e.rogueStagger=Math.max(0,(e.rogueStagger||0)-dt);if(e.rogueStagger>0)continue;
      const target=mazeAimTarget(e),dist=distance(e,target);if(e.recovery>0){e.recovery-=dt;continue;}
      if(e.role==="worker"&&e.workerNode){e.windup-=dt;if(e.windup<=0){const n=c.nodes.find(n=>n.id===e.workerNode);if(n)n.progress=Math.max(0,n.progress-.75);e.workerNode=null;e.attackTimer=3;e.recovery=.6;}continue;}
      if(e.windup>0){e.windup-=dt;if(e.windup<=0){const p=pointFromAngle(e.x,e.y,e.attackAngle,e.role==="sniper"?260:100);if(e.role==="sniper")spawnMazeShot(e,e.attackAngle,{speed:220,r:7,ttl:2,damage:9,color:"#ff7469",source:e.name});else{spawnMazeCircle(p.x,p.y,e.role==="crusher"?48:27,0, .15,12,"#ff7469",e.name);if(e.role==="charger"||e.role==="lancer")moveMazeEnemy(e,Math.cos(e.attackAngle)*80,Math.sin(e.attackAngle)*80);}e.recovery=1.1;e.attackTimer=1.7;}continue;}
      if(e.role==="thief"){moveMazeEnemyToward(e,{x:e.x,y:mazeState.bounds.y+20},e.speed*.45,dt);continue;}
      if(e.role==="worker"){const n=c.nodes.find(n=>!n.done);if(n){moveMazeEnemyToward(e,n,55,dt);if(distance(e,n)<40&&e.attackTimer<=0){e.windup=1;e.workerNode=n.id;}}continue;}
      if(e.role==="guard"){e.shieldTimer=0;e.facing=getFacing(target.x-e.x,target.y-e.y);if(dist>100)moveMazeEnemyToward(e,target,48,dt);}
      else if(e.role!=="sniper"||dist>280)moveMazeEnemyToward(e,target,e.speed*(e.rogueSlowTimer>0?1-e.rogueSlow:1),dt);
      if(e.attackTimer<=0&&dist<(e.role==="sniper"?400:125)){e.attackAngle=Math.atan2(target.y-e.y,target.x-e.x);e.windup=e.role==="crusher"?.85:.65;e.recovery=0;e.facing=getFacing(target.x-e.x,target.y-e.y);}
    }
  },
  pattern(c) {
    const b=mazeState.bounds,index=c.phase%3;
    if(["vent","drain","valves","press","hotcrate"].includes(c.mode)){
      const vertical=c.mode==="drain"?false:c.phase%2===0,x=b.x+b.w*(.25+.25*index),y=b.y+b.h*(.25+.25*index);
      spawnMazeWall(x,y,vertical,1.2,1,10,"#ff7469");
    }else if(c.mode==="circuit"){
      const y=b.y+b.h*(index===0?.3:.65);spawnMazeWall(b.x+b.w/2,y,false,1.1,.8,8,"#ff7469");
    }else if(c.mode==="bait")spawnMazeWall(b.x+b.w*(.25+.25*index),b.y+b.h/2,true,1.3,.65,8,"#ff7469");
  },
  finish(success) {
    const state=mazeState,c=state?.contract;if(!c||c.finished)return;c.finished=true;c.failed=!success;state.cleared=true;state.enemies.forEach(e=>{e.hp=0;});hazards=hazards.filter(h=>!h.mazeHazard);playerProjectiles=[];abilityEffects=[];
    c.caption=success?c.name+" complete · collect your relic":c.name+" ended · exit is open";
    if(success){Arcade.progress.record("contracts",c.kind);if(c.kind==="donut"&&c.completed>=5)state.rewardOptions=state.rewardOptions.map(r=>({...r,description:r.description+" Bakery bonus: +25% benefit.",values:Object.fromEntries(Object.entries(r.values).map(([k,v])=>[k,k==="potion"?v:Math.round(v*1.25*100)/100]))}));state.rewardPending=true;if(isPartySyncActive()){this.broadcast();broadcastPartyPhase("reward",{bossKind:boss.kind,mazeSequence:state.sequence});}else showMazeRewardChoices();}
    else{state.exitOpen=true;state.rewardPending=false;this.broadcast();showFloat("Contract ended. The boss door is open.");if(isPartySyncActive())broadcastPartyPhase("arena",{bossKind:boss.kind,spawns:multiplayerArenaSpawns()});}
    RogueGame.saveCheckpoint();
  },
  broadcast(){if(isPartySyncActive()&&isMultiplayerHost()&&mazeState?.contract)sendMultiplayerEvent({kind:"contract-state",phaseSeq:multiplayer.phaseSeq,bossKind:boss.kind,seq:++this.syncSeq,contract:mazeState.contract,exitOpen:mazeState.exitOpen,rewardPending:mazeState.rewardPending,enemies:mazeState.enemies.map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,windup:e.windup,attackAngle:e.attackAngle,recovery:e.recovery,facing:e.facing}))});},
  draw() {
    const state=mazeState,c=state?.contract;if(!c)return;const b=state.bounds;
    ctx.save();ctx.font="bold 16px Consolas";ctx.textAlign="center";
    if(["delivery","hotcrate"].includes(c.mode)){ctx.fillStyle="#3d4d60";for(let y=b.y+70;y<b.y+b.h;y+=90){ctx.fillRect(b.x+20,y,b.w-40,24);ctx.fillStyle="#efbe55";for(let x=b.x+35;x<b.x+b.w-20;x+=40)ctx.fillRect(x+(c.elapsed*20*c.direction)%40,y+8,12,8);ctx.fillStyle="#3d4d60";}}
    if(c.mode==="battery"){ctx.fillStyle="#c6d7ec24";ctx.fillRect(b.x,b.y,b.w,b.h);for(const n of c.nodes)if(n.done)RoguePresentation.contour(ctx,n.x,n.y,145,"#69dec3",.12);}
    if(c.mode==="bait"){ctx.fillStyle="#304d69";for(let y=b.y+50;y<b.y+b.h;y+=100)ctx.fillRect(b.x,y,b.w,40);}
    for(const [i,n] of c.nodes.entries()){
      if(n.carrier)continue;ctx.fillStyle=n.done?"#3e6057":"#233049";ctx.fillRect(n.x-25,n.y-25,50,50);ctx.strokeStyle=n.done?"#69dec3":"#efbe55";ctx.lineWidth=4;ctx.strokeRect(n.x-25,n.y-25,50,50);ctx.fillStyle=n.done?"#69dec3":"#fff1cd";
      ctx.fillText(n.done?"✓":c.mode==="mix"?["K","M","Y"][n.orientation]:String(i+1),n.x,n.y+6);
      if(c.mode==="mix"){ctx.fillStyle="#efbe55";ctx.fillText("→ "+["K","M","Y"][n.desired],n.x,n.y-40);}
      if(n.progress>0&&!n.done){ctx.fillStyle="#69dec3";ctx.fillRect(n.x-25,n.y+32,50*Math.min(1,n.progress/(c.mode==="mix"?3:2)),6);}
    }
    if(["delivery","hotcrate","bait"].includes(c.mode)){ctx.fillStyle="#69dec3";ctx.fillRect(b.x+b.w/2-18,b.y+b.h/2-18,36,36);ctx.fillStyle="#101522";ctx.fillText("↔",b.x+b.w/2,b.y+b.h/2+6);}
    if(c.mode==="delivery"){const x=b.x+b.w*.82,y=b.y+b.h*.76;ctx.strokeStyle="#ff7469";ctx.strokeRect(x-32,y-24,64,48);ctx.fillStyle="#fff1cd";ctx.fillText("GRILL",x,y+6);}
    for(const e of state.enemies){if(e.hp<=0||e.windup<=0)continue;const p=pointFromAngle(e.x,e.y,e.attackAngle,e.role==="sniper"?260:100);ctx.strokeStyle="#efbe55";ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);}
    if(c.carrying){const carrier=RogueContracts.actor(c.carrierId)||player;ctx.fillStyle="#efbe55";ctx.fillRect(carrier.x-10,carrier.y-72,20,16);}
    ctx.restore();
  }
};

function installRogueContracts() {
  const oldObjective=gauntletObjectiveText;gauntletObjectiveText=function(){return mazeState?.contract?mazeState.contract.caption:oldObjective();};
  const oldGenerate=generateMazeForBoss,oldMazeCombat=updateMazeCombat,oldDraw=drawMaze,oldRecover=recoverGauntletWaveAdvance,oldProgress=updateGauntletProgress;
  generateMazeForBoss=function(kind,sequence){return RogueContracts.definitions[kind]?RogueContracts.create(kind,sequence):oldGenerate(kind,sequence);};
  updateMazeCombat=function(dt){if(player.room==="maze"&&mazeState?.contract){RogueContracts.update(dt);return;}oldMazeCombat(dt);};
  updateGauntletProgress=function(dt){if(!mazeState?.contract)oldProgress(dt);};
  recoverGauntletWaveAdvance=function(reason){return mazeState?.contract?false:oldRecover(reason);};
  drawMaze=function(){oldDraw();RogueContracts.draw();};
  const oldClear=clearArcadeInputs;clearArcadeInputs=function(){oldClear();RogueContracts.interactHeld=false;RogueContracts.interactPressed=false;};
  window.addEventListener("keydown",e=>{if(e.key==="Enter"&&arcadeInputAllowed()&&player.room==="maze"&&!e.repeat){e.preventDefault();RogueContracts.interactHeld=true;RogueContracts.interactPressed=true;}});
  window.addEventListener("keyup",e=>{if(e.key==="Enter")RogueContracts.interactHeld=false;});
  const oldSpeed=playerSpeed;playerSpeed=function(){if(mazeState?.contract?.mode==="battery"&&player.room==="maze"&&!mazeState.contract.nodes.some(n=>n.done&&distance(player,n)<=145))return oldSpeed()*.75;return oldSpeed();};
}
