/* Presentation state is deliberately independent of the combat simulation. */
(function () {
  "use strict";
  const Arcade = window.Arcade = {};
  const subscribers = new Map();
  Arcade.emit = function (name, data) {
    (subscribers.get(name) || []).forEach(function (listener) { listener(data || {}); });
  };
  Arcade.on = function (name, listener) {
    if (!subscribers.has(name)) subscribers.set(name, []);
    subscribers.get(name).push(listener);
  };
  Arcade.viewport = {
    width: 1280, height: 720, bufferWidth: 640, bufferHeight: 360,
    resize: function (canvas) {
      const stage = canvas.parentElement.getBoundingClientRect();
      const fit = Math.min(stage.width / 640, stage.height / 360);
      const scale = fit >= 1 ? Math.max(1, Math.floor(fit)) : fit;
      canvas.width = 640;
      canvas.height = 360;
      canvas.style.width = Math.floor(640 * scale) + "px";
      canvas.style.height = Math.floor(360 * scale) + "px";
      const context = canvas.getContext("2d");
      context.setTransform(0.5, 0, 0, 0.5, 0, 0);
      context.imageSmoothingEnabled = false;
    },
    point: function (rect, clientX, clientY, camera) {
      const x = (clientX - rect.left) * 1280 / rect.width;
      const y = (clientY - rect.top) * 720 / rect.height;
      return { x: x, y: y, worldX: x + camera.x, worldY: y + camera.y };
    }
  };
  Arcade.inputAllowed = function (state) {
    return Boolean(state.active && !state.dead && !state.won && !state.menu && !state.modal && !state.reward && !state.intermission);
  };
  const focusable = 'button:not([disabled]):not([hidden]), input:not([disabled]), select, textarea, a[href], summary, [tabindex="0"]';
  const screens = Arcade.screens = {
    current: null,
    history: [],
    returnFocus: null,
    clearInputs: function () {},
    isCoop: function () { return false; },
    open: function (element, nested) {
      if (!element || screens.current === element) return;
      screens.clearInputs();
      if (screens.current) {
        screens.current.hidden = true;
        if (nested) screens.history.push({ element:screens.current, focus:document.activeElement });
        else screens.history = [];
      } else {
        screens.returnFocus = document.activeElement;
        screens.history = [];
      }
      screens.current = element;
      element.hidden = false;
      element.setAttribute("role", "dialog");
      element.setAttribute("aria-modal", "true");
      document.querySelector(".shell").inert = true;
      document.querySelector("#menuOverlay").inert = true;
      const first = element.querySelector('[data-autofocus]') || element.querySelector(focusable);
      if (first) first.focus();
      Arcade.emit("menu");
    },
    close: function (all) {
      screens.clearInputs();
      if (screens.current) screens.current.hidden = true;
      const previous = all ? null : screens.history.pop();
      if (previous) {
        screens.current = previous.element;
        previous.element.hidden = false;
        const focus = previous.focus && previous.focus.isConnected ? previous.focus : previous.element.querySelector(focusable);
        if (focus) focus.focus();
        return;
      }
      screens.current = null;
      screens.history = [];
      const menusVisible = !document.querySelector("#menuOverlay").classList.contains("hidden");
      document.querySelector(".shell").inert = menusVisible;
      document.querySelector("#menuOverlay").inert = false;
      if (screens.returnFocus && screens.returnFocus.isConnected && !screens.returnFocus.disabled && screens.returnFocus.getClientRects().length) screens.returnFocus.focus();
      else if (!menusVisible) document.querySelector("#game").focus();
      screens.returnFocus = null;
    },
    paused: function () { return Boolean(screens.current) && !screens.isCoop(); }
  };
  document.addEventListener("keydown", function (event) {
    const root = screens.current || (!document.querySelector("#menuOverlay").classList.contains("hidden") ? document.querySelector("#menuOverlay .active") : null);
    if (!root || event.key !== "Tab") return;
    const nodes = Array.from(root.querySelectorAll(focusable)).filter(function (node) { return node.getClientRects().length; });
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  Arcade.setText = function (element, value) {
    if (element && element.textContent !== String(value)) element.textContent = String(value);
  };
  Arcade.formatTime = function (seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  };
  // Bounded diagnostics are exposed as DOM data for profiling without changing
  // gameplay state. Samples are published only every two seconds.
  Arcade.metrics = {
    costs: [], intervals: [], publishedAt: 0,
    record: function (canvas, cost, interval) {
      this.costs.push(cost); this.intervals.push(interval);
      if (this.costs.length > 180) { this.costs.shift(); this.intervals.shift(); }
      const now = performance.now();
      if (now - this.publishedAt < 2000 || this.costs.length < 30) return;
      this.publishedAt = now;
      const sorted = this.costs.slice().sort(function (a,b) { return a-b; });
      canvas.dataset.frameP95 = sorted[Math.floor(sorted.length*.95)].toFixed(2);
      canvas.dataset.frameAverage = (this.costs.reduce(function(a,b){return a+b;},0)/this.costs.length).toFixed(2);
      canvas.dataset.fps = (1000/(this.intervals.reduce(function(a,b){return a+b;},0)/this.intervals.length)).toFixed(1);
    }
  };
})();
