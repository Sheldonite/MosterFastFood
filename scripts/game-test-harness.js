/* Loads the shipped scripts, with browser IO replaced by a deterministic DOM,
   canvas and clock. Tests exercise the real simulation and event handlers. */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");

function createGame(options = {}) {
  let now = 1000, timerId = 0;
  const timers = new Map(), storage = new Map(Object.entries(options.storage || {}));
  const paint = new Proxy({
    measureText: (value) => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    createPattern: () => ({}),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    canvas: { width: 640, height: 360 }
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  let document;
  class Element {
    constructor(tag = "div", attributes = {}) {
      this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
      this.dataset = {}; this.style = {}; this.listeners = {}; this.writes = 0;
      this.hidden = false; this.disabled = false; this.value = ""; this.isConnected = true;
      this.classes = new Set();
      this.classList = {
        add: (...items) => items.forEach((item) => this.classes.add(item)),
        remove: (...items) => items.forEach((item) => this.classes.delete(item)),
        contains: (item) => this.classes.has(item),
        toggle: (item, force) => { const on = force ?? !this.classes.has(item); on ? this.classes.add(item) : this.classes.delete(item); return on; }
      };
      Object.entries(attributes).forEach(([key, value]) => this.setAttribute(key, value));
    }
    get className() { return [...this.classes].join(" "); }
    set className(value) { this.classes = new Set(value.split(/\s+/)); }
    setAttribute(key, value) {
      value = String(value); this.attributes[key] = value;
      if (key === "class") this.className = value;
      else if (key === "hidden" || key === "disabled" || key === "checked") this[key] = true;
      else if (key.startsWith("data-")) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      else this[key] = value;
    }
    getAttribute(key) { return key === "class" ? this.className : this.attributes[key] ?? null; }
    removeAttribute(key) { delete this.attributes[key]; if (key === "hidden" || key === "disabled") this[key] = false; }
    get innerHTML() { return this.html || ""; }
    set innerHTML(value) { this.html = String(value); this.children = parse(this.html, this); this.writes++; }
    get textContent() { return this.text ?? this.children.map((child) => child.textContent).join(""); }
    set textContent(value) { this.text = String(value); this.writes++; }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) {
      const descendants = []; const visit = (node) => node.children.forEach((child) => { descendants.push(child); visit(child); }); visit(this);
      return descendants.filter((node) => selector.split(",").some((part) => matchesChain(node, part.trim())));
    }
    matches(selector) { return matchesChain(this, selector); }
    closest(selector) { let node = this; while (node) { if (node.matches(selector)) return node; node = node.parentElement; } return null; }
    contains(other) { return other === this || this.children.some((child) => child.contains(other)); }
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
    removeEventListener() {}
    dispatchEvent(event) { event.target ||= this; (this.listeners[event.type] || []).forEach((callback) => callback(event)); }
    click() { if (!this.disabled) this.dispatchEvent({ type: "click", target: this, preventDefault() {}, stopPropagation() {} }); }
    focus() { document.activeElement = this; }
    blur() { document.activeElement = document.body; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 540, right: 1280, bottom: 540 }; }
    getClientRects() { return this.hidden ? [] : [this.getBoundingClientRect()]; }
    getContext() { return paint; }
    toDataURL() { return "data:image/png;base64,"; }
    scrollIntoView() {}
    setPointerCapture() {}
    releasePointerCapture() {}
  }
  function matches(node, selector) {
    selector = selector.replace(/:not\(([^)]+)\)/g, (_, excluded) => node.matches(excluded) ? "__never__" : "");
    if (selector.includes("__never__")) return false;
    const tag = selector.match(/^[a-z]+/i)?.[0]; if (tag && tag.toUpperCase() !== node.tagName) return false;
    const id = selector.match(/#([\w-]+)/)?.[1]; if (id && node.id !== id) return false;
    for (const match of selector.matchAll(/\.([\w-]+)/g)) if (!node.classes.has(match[1])) return false;
    for (const match of selector.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)) {
      const actual = node.getAttribute(match[1]);
      if (actual === null || (match[2] !== undefined && actual !== match[2])) return false;
    }
    return true;
  }
  function matchesChain(node, selector) {
    const parts = selector.split(/\s+(?![^[]*\])/).filter(Boolean); if (!matches(node, parts.pop() || "")) return false;
    while (parts.length) { const part = parts.pop(); node = node.parentElement; while (node && !matches(node, part)) node = node.parentElement; if (!node) return false; }
    return true;
  }
  function parse(html, parent) {
    const holder = { children: [], parentElement: parent }, stack = [holder];
    for (const token of html.matchAll(/<\/?[a-z][^>]*>|[^<]+/gi)) {
      const value = token[0];
      if (value.startsWith("</")) { if (stack.length > 1) stack.pop(); continue; }
      if (!value.startsWith("<")) { const node = stack[stack.length - 1]; node.text = (node.text || "") + value; continue; }
      const tag = value.match(/^<([\w-]+)/)[1], attrs = {};
      const attributes = value.slice(tag.length + 1, -1);
      for (const match of attributes.matchAll(/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? "";
      const node = new Element(tag, attrs), container = stack[stack.length - 1];
      node.parentElement = container === holder ? parent : container; container.children.push(node);
      if (!["img", "input", "br", "hr", "meta", "link"].includes(tag.toLowerCase())) stack.push(node);
    }
    return holder.children;
  }
  document = new Element("document");
  document.children = parse(fs.readFileSync(path.join(root, "index.html"), "utf8"), document);
  document.documentElement = document.querySelector("html"); document.body = document.querySelector("body"); document.activeElement = document.body;
  document.getElementById = (id) => document.querySelector("#" + id);
  document.createElement = (tag) => new Element(tag);
  document.hidden = false;
  const window = new Element("window");
  const setTimeout = (callback, delay = 0) => { const id = ++timerId; timers.set(id, { callback, at: now + delay }); return id; };
  Object.assign(window, { document, innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, matchMedia: () => ({ matches: false }), setTimeout, setInterval: () => ++timerId });
  if (options.desktopConfig) window.BossFightConfig = options.desktopConfig;
  if (options.updater) window.BossFightUpdater = options.updater;
  class Image extends Element { constructor() { super("img"); this.complete = true; this.naturalWidth = 256; this.naturalHeight = 256; this.width = 256; this.height = 256; } }
  class Socket extends Element {
    static OPEN = 1;
    constructor(url) { super("socket"); new URL(url); this.url = url; this.readyState = 0; this.sent = []; }
    send(message) { this.sent.push(message); }
    close() { this.readyState = 3; this.dispatchEvent({ type:"close",code:1000,reason:"",wasClean:true }); }
  }
  window.WebSocket = Socket;
  const context = vm.createContext({ window, document, Image, HTMLImageElement: Image, HTMLCanvasElement: class {}, console, URL, URLSearchParams,
    location: Object.assign({ protocol: "http:", hostname: "localhost", host: "localhost:4173", search: "", href: "http://localhost:4173/" }, options.location),
    navigator: { clipboard: { writeText: async () => {} } }, performance: { now: () => now },
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) },
    setTimeout, clearTimeout: (id) => timers.delete(id), setInterval: window.setInterval, clearInterval() {}, requestAnimationFrame() {},
    WebSocket: Socket, fetch: async () => ({ ok: true, json: async () => ({}) })
  });
  for (const file of ["arcade-core", "arcade-audio", "arcade-network", "arcade-art", "arcade-ui", "arcade-game", "rogue-data", "rogue-progress", "rogue-training", "rogue-combat", "rogue-talents", "rogue-contracts", "rogue-network", "rogue-relics", "rogue-presentation", "rogue-bosses", "signature-bosses", "condiment-fusion", "rogue-game", "game"]) {
    vm.runInContext(fs.readFileSync(path.join(root, "src", file + ".js"), "utf8"), context, { filename: file + ".js" });
    if (file === "arcade-core") context.Arcade = window.Arcade;
  }
  return {
    run: (code) => vm.runInContext(code, context), document, window,
    advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); } },
    key(key) { window.dispatchEvent({ type: "keydown", key, code: key === " " ? "Space" : "Key" + key.toUpperCase(), preventDefault() {}, repeat: false }); }
  };
}
module.exports = { createGame };
