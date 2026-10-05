(function () {
  "use strict";
  const byId = function (id) { return document.getElementById(id); };
  const set = function (id, value) { Arcade.setText(byId(id),value); };
  let hooks, abilitySignature="", partySignature="", loadoutSignature="";
  const roles = { warrior:"Close control",ranger:"Safe ranged pressure",mage:"Burst spells",rogue:"Fast poison",paladin:"Wards and protection",bard:"Songs and support" };
  const names = {warrior:"Warrior",ranger:"Ranger",mage:"Mage",rogue:"Rogue",paladin:"Paladin",bard:"Bard"};
  const escape = function (value) { return String(value).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); };
  Arcade.ui = {
    connect: function (callbacks) {
      hooks=callbacks;
      byId("pauseButton").addEventListener("click",hooks.pause);
      document.addEventListener("click",function(event){
        const open=event.target.closest("[data-open]");
        if(open){Arcade.screens.open(byId(open.dataset.open),Boolean(Arcade.screens.current));return;}
        if(event.target.closest("[data-close]"))Arcade.screens.close();
      });
      document.querySelectorAll("#effectsVolume,#musicVolume,#muteAudio,#reducedMotion,#screenShake").forEach(function(control){
        const key={effectsVolume:"effects",musicVolume:"music",muteAudio:"mute",reducedMotion:"reducedMotion",screenShake:"shake"}[control.id];
        if(control.type==="range")control.value=Math.round(Arcade.settings[key]*100);else control.checked=Arcade.settings[key];
        control.addEventListener("input",function(){Arcade.settings[key]=control.type==="range"?Number(control.value)/100:control.checked;Arcade.audio.save();});
      });
      byId("fullscreenButton").addEventListener("click",async function(){
        try { if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();set("settingsStatus","Settings save on this device."); }
        catch(_){set("settingsStatus","Fullscreen is unavailable in this window.");}
      });
      byId("abilityBar").addEventListener("click",function(event){const button=event.target.closest("[data-ability]");if(button)hooks.ability(Number(button.dataset.ability));});
      byId("rewardConfirmButton").addEventListener("click",hooks.confirmReward);
      byId("returnMenuButton").addEventListener("click",hooks.menu);
      byId("resultsMenuButton").addEventListener("click",hooks.menu);
      byId("continueButton").addEventListener("click",hooks.continueRun);
      byId("resultsTalentsButton").addEventListener("click",hooks.talents);
      byId("spectatePrevious").addEventListener("click",function(){hooks.spectate(-1);});
      byId("spectateNext").addEventListener("click",function(){hooks.spectate(1);});
      byId("devBossButton").addEventListener("click",hooks.bossMenu);
      byId("devArenaButton").addEventListener("click",hooks.testArena);
      byId("devGauntletButton").addEventListener("click",hooks.testGauntlet);
      byId("devClearButton").addEventListener("click",hooks.clearTest);
      byId("devDamageButton").addEventListener("click",function(){Arcade.screens.open(byId("devToolsOverlay"));byId("bossDamageToggle").click();});
      byId("devSpriteButton").addEventListener("click",hooks.spriteMenu);
      document.querySelectorAll(".class-menu-overlay,.reward-overlay").forEach(function(overlay){
        overlay.addEventListener("click",function(event){if(event.target===overlay && !["mazeRewardOverlay","resultsOverlay","deathScreen"].includes(overlay.id))Arcade.screens.close();});
      });
    },
    render: function (state) {
      const kind=state.classId, abilities=state.abilities;
      set("hudName",names[kind]);set("playerStatus",state.playerStatus);
      const portrait=byId("hudPortrait"),src="./assets/pixel/portraits/"+kind+".png";
      if(portrait.getAttribute("src")!==src)portrait.src=src;
      set("encounterCaption",state.encounterCaption);set("resultsBuild",state.buildSummary);
      byId("bossMeter").hidden=state.room==="starter";
      byId("bossHpText").hidden=state.room==="starter";
      byId("starterCoach").hidden=state.room!=="starter"||state.modal||!state.active;
      set("dummyFeedback",state.dummyFeedback);
      if(abilitySignature!==kind){
        abilitySignature=kind;
        byId("abilityBar").innerHTML=abilities.map(function(ability,index){
          return '<button class="ability-slot" type="button" data-ability="'+index+'" title="'+escape(ability.description)+'" aria-label="'+escape(ability.name+", "+ability.key+". "+ability.description)+'"><img src="./assets/pixel/icons/'+kind+'-'+index+'.png" alt=""><div><strong>'+escape(ability.name)+'</strong><span class="ability-state">Ready</span></div><kbd class="ability-key">'+escape(ability.key)+'</kbd><i class="cooldown-cover"></i></button>';
        }).join("");
      }
      byId("abilityBar").querySelectorAll("[data-ability]").forEach(function(button,index){
        const cooldown=state.cooldowns[index]||0;
        const hint=typeof rogueAbilityHint==="function"?rogueAbilityHint(index):"";
        Arcade.setText(button.querySelector(".ability-state"),hint?(cooldown>0?cooldown.toFixed(1)+"s · ":"")+hint:cooldown>0?cooldown.toFixed(1)+"s":"Ready");
        button.classList.toggle("is-cooling",cooldown>0);
        const width=Math.min(100,cooldown/abilities[index].cooldown*100).toFixed(1)+"%";
        const cover=button.querySelector(".cooldown-cover");if(cover.style.width!==width)cover.style.width=width;
        button.disabled=!state.inputAllowed;
      });
      set("potionCount",state.potions+" potions");
      byId("potionButton").disabled=!state.inputAllowed||state.potions===0||state.hp>=state.maxHp;
      const partyKey=JSON.stringify(state.party.map(function(peer){return [peer.name,peer.classId,peer.dead];}));
      if(partyKey!==partySignature){partySignature=partyKey;byId("partyPortraits").innerHTML=state.party.map(function(peer){return '<span class="party-avatar '+(peer.dead?"dead":"")+'" title="'+escape(peer.name+(peer.dead?" · defeated":" · "+peer.hp+"/"+peer.maxHp))+'"><img src="./assets/pixel/portraits/'+peer.classId+'.png" alt="'+escape(peer.name)+'"></span>';}).join("");}
      byId("partyPortraits").querySelectorAll(".party-avatar").forEach(function(avatar,index){const peer=state.party[index],title=peer.name+(peer.dead?" · defeated":" · "+peer.hp+"/"+peer.maxHp);if(avatar.title!==title)avatar.title=title;});
      byId("spectateHud").hidden=!state.spectate;
      set("spectateLabel",state.spectate?"Spectating "+state.spectate+" · Tab to switch":"");
      const notice=byId("screenNotice");
      notice.hidden=!state.banner||state.modal;
      if(state.banner){const markup="<strong>"+escape(state.banner.title)+"</strong><span>"+escape(state.banner.subtitle)+"</span>";if(notice.innerHTML!==markup)notice.innerHTML=markup;}
      byId("devToolbar").hidden=!state.dev;
      if(state.loadout && loadoutSignature!==state.loadout.signature){
        loadoutSignature=state.loadout.signature;
        const focused=document.activeElement;
        const focusClass=focused?.closest("[data-class]")?.dataset.class;
        const focusArmor=focused?.closest("[data-armor]")?.dataset.armor;
        byId("classSelector").innerHTML=state.loadout.classes.map(function(option){return '<button class="class-card '+(option.id===kind?"selected":"")+'" type="button" data-class="'+option.id+'" aria-pressed="'+(option.id===kind)+'"><img src="./assets/pixel/portraits/'+option.id+'.png" alt=""><strong>'+option.name+'</strong><small>'+roles[option.id]+'</small></button>';}).join("");
        byId("armorSelector").innerHTML=state.loadout.armors.map(function(armor){return '<button class="armor-card '+(armor.selected?"selected":"")+'" type="button" data-armor="'+armor.id+'" aria-pressed="'+armor.selected+'"><strong>'+armor.name+'</strong><small>'+armor.hp+' HP · '+armor.armor+' defense<br>'+armor.speed+' speed · '+armor.damage+' damage</small></button>';}).join("");
        const details=abilities.map(function(ability,index){return '<div class="ability-description"><img src="./assets/pixel/icons/'+kind+'-'+index+'.png" alt=""><div><strong><kbd>'+ability.key+'</kbd> '+ability.name+' · '+ability.cooldown+'s</strong><p>'+ability.description+'</p></div></div>';}).join("");
        byId("loadoutPreview").innerHTML='<div class="hero-preview-head"><div class="hero-preview" style="background-image:url(./assets/pixel/classes/'+kind+'.png)" aria-hidden="true"></div><div><h2>'+names[kind]+'</h2><p>'+roles[kind]+'<br>'+state.loadout.weapon+' · '+state.loadout.armor+'</p></div></div><div class="loadout-stats"><div><span>HEALTH</span><strong>'+state.maxHp+'</strong></div><div><span>DAMAGE</span><strong>'+state.loadout.damage+'</strong></div><div><span>DEFENSE</span><strong>'+state.loadout.defense+'</strong></div><div><span>SPEED</span><strong>'+state.loadout.speed+'</strong></div></div>'+details;
        if(focusClass)byId("classSelector").querySelector('[data-class="'+focusClass+'"]')?.focus();
        if(focusArmor)byId("armorSelector").querySelector('[data-armor="'+focusArmor+'"]')?.focus();
      }
      byId("resetButton").disabled=!state.active||state.intermission||(state.coop&&!state.retryAllowed);
      set("pauseTitle",state.coop?"Party menu":"Paused");
      set("pauseCaption",state.coop?"The party keeps fighting while this menu is open.":"Your adventure will be here when you return.");
      set("deathPartyStatus",state.coop?(state.retryAllowed?"Party defeated. The host can retry this encounter.":"Waiting for the host to retry the encounter."):"Your earned talents and rewards carry into the retry.");
      byId("deathResetFightButton").disabled=state.coop&&!state.retryAllowed;
    },
    results: function (result) {
      set("resultsEyebrow",result.final?"THE WHOLE MENU, CONQUERED":"ORDER COMPLETE");
      set("resultsTitle",result.final?"Run cleared!":result.name+" defeated");
      set("resultsSummary",result.final?"Every boss defeated. That’s one heroic appetite.":"+2 talent points. Next up: "+result.nextName+".");
      byId("resultsStats").innerHTML='<div>Run time<strong>'+Arcade.formatTime(result.seconds)+'</strong></div><div>Bosses cleared<strong>'+result.cleared+'</strong></div><div>Your hero<strong>'+escape(result.className)+'</strong></div>';
      set("resultsBuild",result.build);
      set("continueButton",result.final?"Play Again":result.coop&&!result.host?"Waiting for host":"Continue");
      byId("continueButton").disabled=result.coop&&!result.host;
      byId("resultsTalentsButton").hidden=result.final;
      Arcade.screens.open(byId("resultsOverlay"));
    },
    invalidateLoadout: function () { loadoutSignature=""; }
  };
})();
