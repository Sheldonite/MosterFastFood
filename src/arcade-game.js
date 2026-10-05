/* Adapter between the legacy simulation and the new presentation modules.
   Combat definitions and physics stay in game.js. */
function clearArcadeInputs() {
  Object.keys(movementKeys).forEach((key) => { movementKeys[key] = false; });
  stopHeldPrimaryAttack();
  player.moving = false;
}

function arcadeInputAllowed() {
  return Arcade.inputAllowed({
    active: runState.active, dead: player.dead, won: player.won,
    menu: !ui.menuOverlay.classList.contains("hidden"),
    modal: Boolean(Arcade.screens.current), reward: Boolean(mazeState?.rewardPending),
    intermission: Boolean(intermission)
  });
}

function updateArcadeCamera() {
  const bounds = player.room === "starter"
    ? { x: world.starter.x, y: world.starter.y, w: world.starter.w + world.gate.w, h: world.starter.h }
    : world.arena;
  camera.x = Math.round((bounds.x + bounds.w / 2 - Arcade.viewport.width / 2) / 2) * 2;
  camera.y = Math.round((bounds.y + bounds.h / 2 - Arcade.viewport.height / 2) / 2) * 2;
}

function openPauseMenu() {
  if (!runState.active || player.dead || player.won || intermission || mazeState?.rewardPending) return;
  Arcade.screens.open(document.querySelector("#pauseOverlay"));
}

function captureEncounterCheckpoint() {
  encounterCheckpoint = {
    room: player.room, bossKind: boss.kind, mazeSequence: mazeState?.sequence || runState.mazeCount,
    gear: { ...player.gear }, talentPoints: runState.talentPoints,
    learnedTalents: Array.from(runState.learnedTalents), lockedTalentClass: runState.lockedTalentClass,
    buildLocked: runState.buildLocked, mazeCount: runState.mazeCount, mazeBuffs: { ...runState.mazeBuffs }
  };
}

function isPartyWiped() {
  if (!player.dead || !isPartySyncActive()) return false;
  return (multiplayer.room?.players || []).every((peer) => peer.id === multiplayer.id || multiplayer.peers.get(peer.id)?.dead === true);
}

function requestEncounterRetry() {
  if (!encounterCheckpoint || intermission || player.won || !runState.active) return;
  if (isPartySyncActive()) {
    if (!isMultiplayerHost() || !isPartyWiped()) return;
    const event = Arcade.network.retryEnvelope(multiplayer.phaseSeq + 1, boss.kind, encounterCheckpoint.room, encounterCheckpoint.mazeSequence);
    sendServer({ type: "event", event });
    // Server echoes the accepted retry to the host as well as its clients.
    return;
  }
  retryEncounterLocally(encounterCheckpoint);
}

function retryEncounterLocally(event) {
  if (!encounterCheckpoint || event.bossKind !== encounterCheckpoint.bossKind || event.room !== encounterCheckpoint.room) return;
  const checkpoint = encounterCheckpoint;
  Arcade.screens.close(true);
  intermission = null;
  runState.talentPoints = checkpoint.talentPoints;
  runState.learnedTalents = new Set(checkpoint.learnedTalents);
  runState.lockedTalentClass = checkpoint.lockedTalentClass;
  runState.buildLocked = checkpoint.buildLocked;
  runState.mazeCount = checkpoint.mazeCount;
  runState.mazeBuffs = { ...checkpoint.mazeBuffs };
  player = createPlayer();
  player.gear = { ...checkpoint.gear };
  applyGear();
  player.hp = player.maxHp;
  player.potions = 3;
  talentTreeSignature = "";
  deathCause = "";
  clearArcadeInputs();
  resetSpectateState();
  resetGauntletSyncState({ phaseSeq: multiplayer.phaseSeq });
  resetHostileNetState();
  multiplayer.lastPartyPhaseEvent = null;
  multiplayer.localPartyReady = null;
  multiplayer.partyReady.clear();
  loadBoss(checkpoint.bossKind);
  if (checkpoint.room === "maze") {
    multiplayer.partyPhase = "gauntlet";
    startMazeForBoss(checkpoint.bossKind, { fromParty: true, sequence: checkpoint.mazeSequence });
  } else if (checkpoint.room === "arena") {
    multiplayer.partyPhase = "arena";
    enterBossArena({ fromParty: true });
  } else {
    multiplayer.partyPhase = "starter";
    sendPlayerToStarterRoom();
    updateArcadeCamera();
    captureEncounterCheckpoint();
  }
  showFloat("Fresh encounter. Same heroic build.");
  sendMultiplayerState(true);
  if (isMultiplayerHost()) { sendGauntletSync(true); sendHostileSync(true); }
}

function arcadeBuildSummary() {
  const talents = runState.learnedTalents.size;
  const bonuses = Object.values(runState.mazeBuffs).filter((value) => value > 0).length;
  return gear.armor[player.gear.armor].name + " · " + talents + (talents === 1 ? " talent" : " talents") + " · " + bonuses + (bonuses === 1 ? " run bonus" : " run bonuses");
}

function arcadeBuffLabel(key, value) {
  const labels = { maxHp:"Maximum health", armor:"Defense", damageMultiplier:"Damage", speedMultiplier:"Move speed", attackSpeed:"Basic attack speed", cooldownRecovery:"Cooldown recovery" };
  const percent = ["damageMultiplier","speedMultiplier","attackSpeed","cooldownRecovery"].includes(key);
  return (labels[key] || key) + ": +" + (percent ? Math.round(value * 100) + "%" : value);
}

function showEncounterResults(final) {
  clearArcadeInputs();
  const next = intermission?.nextBoss;
  Arcade.ui.results({
    final, name: intermission?.name || boss.name, nextName: next ? createBoss(next).name : "",
    seconds: runElapsedSeconds, cleared: clearedBosses.length, className: currentClassOption().name,
    build: arcadeBuildSummary(),
    coop: isPartySyncActive(), host: isMultiplayerHost()
  });
}

function continueArcadeRun() {
  if (player.won) {
    if (isPartySyncActive()) {
      if (isMultiplayerHost()) sendServer({ type: "return-lobby" });
    } else startSinglePlayer();
    return;
  }
  if (!intermission || (isPartySyncActive() && !isMultiplayerHost())) return;
  const result = intermission;
  prepareNextBoss(result.nextBoss, result.name);
  updateArcadeCamera();
  captureEncounterCheckpoint();
}

function renderArcadeUi() {
  const option = currentClassOption(), weapon = gear.weapon[player.gear.weapon];
  const armor = gear.armor[player.gear.armor], classId = option.id;
  const spectate = currentSpectateTarget();
  const party = (multiplayer.room?.players || [{ id: multiplayer.id || "solo", name: option.name }]).map((member) => {
    const actor = member.id === multiplayer.id || !isPartySyncActive() ? player : multiplayer.peers.get(member.id);
    return {
      name: member.name, classId: generatedClassArtKeyForWeapon(actor?.weapon || actor?.gear?.weapon || "ironBlade"),
      dead: Boolean(actor?.dead), hp: Math.ceil(actor?.hp || 0), maxHp: actor?.maxHp || 0
    };
  });
  let playerStatus = player.dead ? "Defeated" : player.invulnerableTimer > 0 ? "Evading" : player.freezeTimer > 0 ? "Frozen" : player.chillStacks > 0 ? "Chilled ×" + player.chillStacks : player.shieldWallTimer > 0 ? "Guarded" : player.room === "starter" ? "Try your abilities on the dummy" : "Hold click to attack";
  let encounterCaption = player.room === "starter" ? (runState.buildLocked ? "Spend your talent points, then cross the gate" : "Choose your loadout. Crossing the gate locks it.") : player.room === "maze" ? (mazeState?.rewardChosen ? "Reward collected · find the exit" : mazeState?.miniBossSpawned ? "Defeat the warden" : "Clear the enemy waves") : "Phase " + (boss.phase || 1) + " / " + (boss.totalPhases || 1);
  if(typeof rogueEncounterCaption==="function")encounterCaption=rogueEncounterCaption(encounterCaption);
  if (isPartySyncActive() && multiplayer.localPartyReady) encounterCaption = "Ready · waiting for the party";
  if (isPartySyncActive() && !multiplayer.connected) encounterCaption = "Connection lost · returning to the lobby";
  Arcade.ui.render({
    classId, buildSummary: arcadeBuildSummary(), abilities: currentAbilities(), cooldowns: player.abilityCooldowns,
    dummyFeedback: typeof RogueTraining!=="undefined"?"Last: "+(trainingDummy.lastDamage||0)+" · 5s DPS: "+RogueTraining.dps().toFixed(1)+(trainingDummy.lastSource?" · "+trainingDummy.lastSource:""):"Crossing the gate locks your loadout.",
    playerStatus, encounterCaption, room: player.room, potions: player.potions, hp: player.hp, maxHp: player.maxHp,
    inputAllowed: arcadeInputAllowed(), party, spectate: spectate ? spectatePeerLabel(spectate.id) : "",
    banner: screenBanner, modal: Boolean(Arcade.screens.current), dev: runState.mode === "dev",
    active: runState.active, intermission: Boolean(intermission), coop: isPartySyncActive(),
    retryAllowed: isMultiplayerHost() && isPartyWiped(),
    loadout: Arcade.screens.current === ui.classMenuOverlay ? {
      signature: [classId, player.gear.armor, player.maxHp, JSON.stringify(runState.mazeBuffs)].join(":"),
      classes: classOptions.filter((entry) => !entry.locked),
      weapon: weapon.name, armor: armor.name, damage: playerDamage(), defense: effectivePlayerArmor(), speed: Math.round(playerSpeed()),
      armors: Object.entries(gear.armor).map(([id, item]) => ({
        id, name: item.name, selected: id === player.gear.armor,
        hp: playerBaseMaxHpForArmor(id) + talentMaxHpBonus() + (runState.mazeBuffs.maxHp || 0),
        armor: item.armor + (isWarriorTag(weapon.tag) ? 4 : weapon.tag === "Rogue" ? 2 : 0) + (runState.mazeBuffs.armor || 0),
        speed: Math.round((item.speed + (weapon.moveSpeedBonus || 0)) * (1 + (runState.mazeBuffs.speedMultiplier || 0))),
        damage: Math.round(weapon.damage * (item.damageMultiplier || 1) * (1 + (runState.mazeBuffs.damageMultiplier || 0)))
      }))
    } : null
  });
}

function initializeArcadeGame() {
  Arcade.screens.clearInputs = clearArcadeInputs;
  Arcade.screens.isCoop = isPartySyncActive;
  Arcade.ui.connect({
    pause: openPauseMenu, ability: useAbility, confirmReward: confirmMazeReward,
    testArena: () => { if (runState.mode === "dev") { intermission = null; loadBoss(boss.kind); enterBossArena(); } },
    clearTest: () => {
      if (runState.mode !== "dev" || !arcadeInputAllowed()) return;
      if (player.room === "maze" && mazeState) {
        const target = mazeState.miniBossEnemy || mazeState.enemies.find((enemy) => enemy.miniBoss);
        if (target) { mazeState.miniBossSpawned = true; mazeState.waveIndex = mazeState.waves.length - 1; mazeState.waves.forEach((wave) => { wave.spawned = true; wave.cleared = true; }); mazeState.enemies.forEach((enemy) => { enemy.hp = 0; }); target.hp = 0; handleMazeEnemyDefeated(target); }
      } else if (player.room === "arena") { boss.hp = 0; condimentBosses.forEach((target) => { target.hp = 0; }); winFight(); }
    },
    testGauntlet: () => { if (runState.mode === "dev") { intermission = null; loadBoss(boss.kind); startMazeForBoss(boss.kind); } },
    menu: () => returnToMainMenu(), continueRun: continueArcadeRun,
    talents: openTalentMenu, spectate: cycleSpectateTarget, bossMenu: openBossMenu, spriteMenu: openSpriteSheetEditor
  });
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("fullscreenchange", resizeCanvas);
  document.addEventListener("visibilitychange", () => {
    clearArcadeInputs();
    if (document.hidden && !isPartySyncActive()) openPauseMenu();
  });
  updateArcadeCamera();
}
