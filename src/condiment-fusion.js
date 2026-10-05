/* One encounter, two combat phases. The host owns the transition clock;
   ribbons, droplets, camera accents and sound are presentation only. */
const CondimentFusion = {
  duration: 7.2,
  colors: { ketchup: "#ed685a", mustard: "#efbe55", mayo: "#fff1cd" },
  active() { return player.room === "arena" && Boolean(boss.condimentFusion); },
  rewardId() { return boss.encounterId === "trio" ? "trio" : boss.kind; },
  remember(target) {
    if (boss.kind !== "trio" || !this.colors[target.kind]) return;
    boss.condimentRemains ||= [];
    if (!boss.condimentRemains.some(r => r.kind === target.kind)) {
      boss.condimentRemains.push({ kind: target.kind, x: target.x, y: target.y });
      Arcade.emit("bottle-break");
    }
  },
  begin() {
    if (boss.kind !== "trio" || this.active() || intermission || player.won) return;
    if (isPartySyncActive() && !isMultiplayerHost()) return;
    condimentBosses.forEach(t => this.remember(t));
    const fusion = { elapsed: 0, duration: this.duration,
      x: world.arena.x + world.arena.w / 2, y: world.arena.y + world.arena.h / 2,
      remains: boss.condimentRemains.map(r => ({ ...r })) };
    if (isPartySyncActive()) this.broadcast("condiment-fusion", "trio", { fusion });
    else this.start(fusion);
    RogueGame.saveCheckpoint();
  },
  clear() {
    clearArcadeInputs(); selectedBoss = null;
    hazards = []; playerProjectiles = []; remoteProjectiles = [];
    abilityEffects = []; remoteAbilityEffects = []; particles = [];
    player.pendingAbilityCast = null;
    player.slide = null; player.destination = null; player.castTimer = 0;
    RogueCombat.tasks = []; RogueCombat.queuedEffects = [];
    screenBanner = null;
  },
  start(fusion) {
    if (boss.kind !== "trio") loadBoss("trio");
    this.clear();
    condimentBosses.forEach(t => { t.hp = 0; });
    boss.encounterId = "trio"; boss.totalPhases = 2; boss.phase = 1;
    boss.condimentFusion = cloneSyncObject(fusion);
    boss.condimentRemains = fusion.remains.map(r => ({ ...r }));
    if (!Arcade.screens.current) canvas.focus();
    Arcade.emit("fusion-gather");
    Arcade.setText(ui.status, "The bottles are empty. Something inside them is still alive.");
    this.cue = "gather";
  },
  broadcast(phase, bossKind, extra = {}) {
    const event = { kind: "party-phase", phase, bossKind, phaseSeq: multiplayer.phaseSeq + 1, ...extra };
    this.applyPhase(event);
    multiplayer.lastPartyPhaseEvent = cloneSyncObject(event);
    sendMultiplayerState(true);
    sendMultiplayerEvent(event);
  },
  applyPhase(event) {
    if (event.phase !== "condiment-fusion" && event.phase !== "condiment-abomination") return false;
    if (!Number.isInteger(event.phaseSeq)) return true;
    if (event.phase === "condiment-fusion" && (!event.fusion || !Number.isFinite(event.fusion.elapsed) ||
      !Number.isFinite(event.fusion.x) || !Number.isFinite(event.fusion.y) || event.fusion.duration !== this.duration ||
      !Array.isArray(event.fusion.remains) || event.fusion.remains.length !== 3 ||
      new Set(event.fusion.remains.map(r => r.kind)).size !== 3 ||
      event.fusion.remains.some(r => !this.colors[r.kind] || !Number.isFinite(r.x) || !Number.isFinite(r.y)))) return true;
    if (event.phase === "condiment-abomination" && (!Number.isFinite(event.x) || !Number.isFinite(event.y))) return true;
    multiplayer.phaseSeq = event.phaseSeq;
    multiplayer.partyPhase = event.phase;
    multiplayer.localPartyReady = null; multiplayer.partyReady.clear();
    resetGauntletSyncState({ phaseSeq: event.phaseSeq }); resetHostileNetState();
    if (event.phase === "condiment-fusion") this.start(event.fusion);
    else this.spawn(event.x, event.y);
    return true;
  },
  update(dt) {
    const f = boss.condimentFusion;
    f.elapsed = Math.min(f.duration, f.elapsed + dt);
    const cue = f.elapsed >= 5.4 ? "reveal" : f.elapsed >= 3.7 ? "mix" : "gather";
    if (cue !== this.cue) { this.cue = cue; Arcade.emit("fusion-" + cue); }
    if (f.elapsed >= f.duration - 1e-6 && (!isPartySyncActive() || isMultiplayerHost())) this.reveal();
  },
  reveal() {
    const f = boss.condimentFusion;
    if (!f || isPartySyncActive() && !isMultiplayerHost()) return;
    if (isPartySyncActive()) this.broadcast("condiment-abomination", "sauce", { x: f.x, y: f.y });
    else this.spawn(f.x, f.y);
    RogueGame.saveCheckpoint();
  },
  spawn(x, y) {
    this.clear(); condimentBosses = [];
    boss = createBoss("sauce");
    Object.assign(boss, { x, y, encounterId: "trio", phase: 2, totalPhases: 2,
      state: "recovering", stateTimer: 1.2, attackTimer: 1.8, modeTimer: 3.5 });
    // Keep the encounter's original retry checkpoint, including a recovered phase two.
    if (encounterCheckpoint) encounterCheckpoint.bossKind = "trio";
    Arcade.emit("fusion-roar");
    if (Arcade.settings.shake && !Arcade.settings.reducedMotion) cosmeticShakeUntil = performance.now() + 220;
    Arcade.setText(ui.status, "Special Sauce awakens. Finish the recipe.");
    showFloat("Phase II · Special Sauce");
    this.cue = "";
  },
  restore(saved) {
    if (saved.encounterId === "trio" || saved.bossKind === "sauce") { boss.encounterId = "trio"; boss.totalPhases = 2; if(boss.kind==="sauce")boss.phase=2; if (encounterCheckpoint) encounterCheckpoint.bossKind = "trio"; }
    if (saved.condimentRemains) boss.condimentRemains = cloneSyncObject(saved.condimentRemains);
    else if(boss.kind==="trio")condimentBosses.filter(t=>t.hp<=0).forEach(t=>this.remember(t));
    if (saved.condimentFusion) this.start(saved.condimentFusion);
    else if (boss.kind === "trio" && condimentBosses.every(t => t.hp <= 0) && !saved.intermission) this.begin();
  },
  syncClock(state, peerId) {
    if (!isPartySyncActive() || isMultiplayerHost() || !isHostPeer(peerId) || state.phaseSeq !== multiplayer.phaseSeq) return;
    if (this.active() && state.condimentFusion) {
      boss.condimentFusion.elapsed = Math.max(boss.condimentFusion.elapsed, Math.min(this.duration, state.condimentFusion.elapsed));
    }
    if (boss.kind === "trio" && state.condimentRemains) boss.condimentRemains = cloneSyncObject(state.condimentRemains);
  },
  renderUi() {
    const panel = document.getElementById("fusionOverlay"), active = this.active();
    panel.hidden = !active || Boolean(Arcade.screens.current);
    if (!active) return;
    const time = boss.condimentFusion.elapsed, reveal = time >= 4.8;
    Arcade.setText(document.getElementById("fusionEyebrow"), reveal ? "THE FINAL INGREDIENT" : "THE RECIPE WAS A LIE");
    Arcade.setText(document.getElementById("fusionTitle"), reveal ? "SPECIAL SAUCE" : time >= 2.6 ? "THREE BECOME ONE" : time >= 1.2 ? "IT'S STILL ALIVE" : "THREE BOTTLES. ONE MONSTER.");
    Arcade.setText(document.getElementById("fusionSubtitle"), reveal ? "An abomination is born · Phase II" : "Ketchup + Mustard + Mayo");
    panel.classList.toggle("fusion-reveal", reveal);
  },
  pixel(v) { return Math.round(v / 2) * 2; },
  oval(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    for (let yy = -ry; yy < ry; yy += 4) {
      const w = Math.sqrt(Math.max(0, 1 - (yy / ry) ** 2)) * rx;
      ctx.fillRect(this.pixel(x - w), this.pixel(y + yy), this.pixel(w * 2), 4);
    }
  },
  pool(r, scale = 1, time = 0) {
    const c = this.colors[r.kind], wobble = Arcade.settings.reducedMotion ? 0 : Math.sin(time * 3 + r.x) * 3;
    this.oval(r.x, r.y + 8, 45 * scale, (18 + wobble) * scale, "#101522");
    this.oval(r.x, r.y + 5, 40 * scale, 15 * scale, c);
    ctx.fillStyle = "#fff1cd"; ctx.fillRect(this.pixel(r.x - 22 * scale), this.pixel(r.y - 2), 16 * scale, 4);
    ctx.fillStyle = "#101522"; ctx.fillRect(this.pixel(r.x - 12), this.pixel(r.y - 16), 22, 10);
    ctx.fillStyle = c; ctx.fillRect(this.pixel(r.x - 10), this.pixel(r.y - 14), 18, 6);
    ctx.fillStyle = "#bac7d6"; ctx.fillRect(this.pixel(r.x + 21), this.pixel(r.y + 9), 10, 6);
  },
  ribbon(from, center, progress, time, index, reduced) {
    const twist = reduced ? 0 : Math.sin(time * 2.5 + index * 2) * 95;
    const dx = center.x - from.x, dy = center.y - from.y, len = Math.max(1, Math.hypot(dx, dy));
    for (let i = 0; i <= 48 * progress; i++) {
      const t = i / 48, bend = Math.sin(t * Math.PI) * twist;
      const x = from.x + dx * t - dy / len * bend, y = from.y + dy * t + dx / len * bend;
      const size = 10 + Math.sin(t * Math.PI) * 9;
      ctx.fillStyle = "#101522"; ctx.fillRect(this.pixel(x - size / 2 - 2), this.pixel(y - size / 2 - 2), size + 4, size + 4);
      ctx.fillStyle = this.colors[from.kind]; ctx.fillRect(this.pixel(x - size / 2), this.pixel(y - size / 2), size, size);
      if (i % 4 === 0) { ctx.fillStyle = "#fff1cd"; ctx.fillRect(this.pixel(x - size / 2), this.pixel(y - size / 2), 6, 4); }
    }
  },
  draw() {
    const f = boss.condimentFusion;
    if (!f) { (boss.condimentRemains || []).forEach(r => this.pool(r)); return; }
    const t = f.elapsed, reduced = Arcade.settings.reducedMotion;
    ctx.save();
    ctx.fillStyle = "#080e1bb3"; ctx.fillRect(world.arena.x, world.arena.y, world.arena.w, world.arena.h);
    // The streams begin at the actual places where each bottle fell.
    const flow = clamp((t - 1.1) / 2.5, 0, 1), gather = clamp((t - 3.2) / 1.1, 0, 1);
    for (let i = 0; i < f.remains.length; i++) {
      const r = f.remains[i], scale = 1 - gather * .7;
      this.pool(r, scale, t);
      if (t < 1.2) {
        ctx.save(); ctx.translate(this.pixel(r.x), this.pixel(r.y - 20 * (1 - t / 1.2)));
        ctx.rotate(reduced ? 0 : Math.sin(t * 12 + i) * .12);
        ctx.scale(1, Math.max(.12, 1 - t / 1.2));
        Arcade.art.boss(ctx, { x: 0, y: -24, radius: 34, animationTime: 0 }, r.kind); ctx.restore();
      }
      if (flow > 0 && t < 4.8) this.ribbon(r, f, flow, t, i, reduced);
    }
    if (flow > .3 && t < 5.5) {
      const radius = 28 + flow * 80 - gather * 50;
      this.oval(f.x, f.y + 14, radius + 12, radius * .56 + 8, "#101522");
      // Three layered spiral arms stay distinct until the final compression.
      for (let arm = 0; arm < 3; arm++) for (let n = 0; n < 64; n++) {
        const q = n / 64, angle = arm * Math.PI * 2 / 3 + q * Math.PI * 3 - (reduced ? 0 : t * 2.7);
        const rr = radius * (1 - q), size = 8 + q * 13;
        ctx.fillStyle = Object.values(this.colors)[arm];
        ctx.fillRect(this.pixel(f.x + Math.cos(angle) * rr - size / 2), this.pixel(f.y + Math.sin(angle) * rr * .58 - size / 2), size, size);
      }
      for (let n = 0; n < (reduced ? 6 : 18); n++) {
        const age = (t * .65 + n * .173) % 1, a = n * 2.4;
        const rr = radius + age * 45;
        ctx.fillStyle = Object.values(this.colors)[n % 3];
        ctx.fillRect(this.pixel(f.x + Math.cos(a) * rr), this.pixel(f.y + Math.sin(a) * rr * .65 - Math.sin(age * Math.PI) * 35), 6, 6);
      }
    }
    if (t >= 4.3) {
      const rise = clamp((t - 4.3) / 1.35, 0, 1), foot = f.y + 65;
      this.oval(f.x, foot, 92 + rise * 12, 24, "#101522");
      this.oval(f.x, foot - 3, 84 + rise * 12, 19, "#ae684d");
      ctx.save(); ctx.translate(this.pixel(f.x), this.pixel(foot));
      const squash = reduced ? 1 : 1 + Math.sin(Math.min(1, rise) * Math.PI) * .13;
      ctx.scale(squash, Math.max(.05, rise / squash));
      Arcade.art.boss(ctx, { x: 0, y: -65, radius: 66, stateTimer: 1, animationTime: reduced ? 0 : t }, "sauce");
      ctx.restore();
      if (t > 5.65) {
        const age = clamp((t - 5.65) / 1.1, 0, 1);
        if (!reduced) for (let i = 0; i < 24; i++) {
          const a = i * Math.PI / 12, rr = 110 + age * 135;
          ctx.fillStyle = Object.values(this.colors)[i % 3];
          ctx.fillRect(this.pixel(f.x + Math.cos(a) * rr), this.pixel(f.y + Math.sin(a) * rr * .64 - Math.sin(age * Math.PI) * 45), 8, 8);
        }
        RoguePresentation.contour(ctx, f.x, foot, 115 + age * 80, "#efbe55", .025 * (1 - age));
      }
    }
    ctx.restore();
  }
};
