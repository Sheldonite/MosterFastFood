(function () {
  "use strict";
  const defaults = { effects: 0.65, music: 0.22, mute: false, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches, shake: true };
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem("boss-fight-settings-v1") || "{}"); } catch (_) {}
  const settings = Arcade.settings = Object.assign({}, defaults, stored);
  ["effects", "music"].forEach(function (key) { settings[key] = Math.max(0, Math.min(1, Number(settings[key]) || 0)); });
  let context, musicTimer, beat = 0, lastWarning = 0;
  function tone(frequency, length, volume, type, delay) {
    if (!context || settings.mute || volume <= 0) return;
    const start = context.currentTime + (delay || 0);
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type || "square";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * 0.09, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(start); oscillator.stop(start + length + 0.01);
  }
  Arcade.audio = {
    unlock: function () {
      try {
        if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === "suspended") context.resume();
        if (!musicTimer) musicTimer = window.setInterval(function () {
          if (document.hidden || Arcade.screens.paused()) return;
          const melody = [262, 330, 392, 330, 294, 349, 440, 349, 220, 262, 330, 392, 294, 262, 220, 196];
          tone(melody[beat % melody.length], 0.16, settings.music * 0.4, "triangle");
          if (beat % 4 === 0) tone(melody[beat % melody.length] / 2, 0.35, settings.music * 0.35, "triangle");
          beat++;
        }, 280);
      } catch (_) { /* Browsers without audio can still play. */ }
    },
    save: function () {
      try { localStorage.setItem("boss-fight-settings-v1", JSON.stringify(settings)); } catch (_) {}
      document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
    }
  };
  const notes = {
    menu: [440, 660], attack: [330, 165], ability: [392, 784], hit: [150, 75],
    hurt: [110, 65], heal: [392, 523, 659], reward: [523, 659, 784],
    victory: [392, 523, 659, 784], warning: [220, 220], unavailable: [130]
  };
  Object.keys(notes).forEach(function (name) {
    Arcade.on(name, function () {
      if (name === "warning" && performance.now() - lastWarning < 500) return;
      if (name === "warning") lastWarning = performance.now();
      notes[name].forEach(function (note, index) { tone(note, 0.085, settings.effects, name === "hurt" ? "sawtooth" : "square", index * 0.075); });
    });
  });
  document.addEventListener("pointerdown", Arcade.audio.unlock, { once: true });
  document.addEventListener("keydown", Arcade.audio.unlock, { once: true });
  Arcade.audio.save();
})();
