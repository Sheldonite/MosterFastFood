/* Device-local progression and an idempotent run journal share one atomic save. */
(function () {
  "use strict";
  const key = "boss-fight.profile.v2", catalogue = new Map(Arcade.rogueData.nodes.map(n => [n[0], n]));
  const classes = ["melee", "ranger", "mage", "rogue", "paladin", "bard"];
  let classById = new Map(), error = "";
  const fresh = () => ({ version: 2, marks: 0, owned: [], builds: {}, milestones: [], journal: null, lastResult: null });
  let profile = fresh();
  try { const saved = JSON.parse(localStorage.getItem(key) || "null"); if (saved && saved.version === 2) profile = { ...fresh(), ...saved }; } catch (_) { error = "The progression save could not be read. Your gear is kept separately."; }
  profile.marks = Math.max(0, Math.floor(Number(profile.marks) || 0));
  profile.owned = [...new Set(Array.isArray(profile.owned) ? profile.owned.filter(id => catalogue.has(id)) : [])];
  // The former eleventh-clear milestone now belongs to the tenth encounter.
  // Previously banked Marks and purchased builds are preserved.
  profile.milestones = Array.isArray(profile.milestones) ? [...new Set(profile.milestones.map(n => n===11?10:n).filter(n => [1,3,6,10].includes(n)))] : [];
  if (!profile.builds || typeof profile.builds !== "object") profile.builds = {};
  if (profile.journal && (!Array.isArray(profile.journal.bosses) || !Array.isArray(profile.journal.contracts) || !profile.journal.id)) profile.journal = null;
  if(profile.journal){for(const kind of ["bosses","contracts"])profile.journal[kind]=[...new Set(profile.journal[kind].filter(id=>["cola","burger","fries","trio","sauce","shake","nacho","pizza","donut","taco","sushi"].includes(id)).map(id=>kind==="bosses"&&id==="sauce"?"trio":id))];profile.journal.settled=profile.journal.settled===true;}
  function save() {
    try { localStorage.setItem(key, JSON.stringify(profile)); error = ""; return true; }
    catch (_) { error = "Progress is in memory, but could not save on this device. Keep this window open."; return false; }
  }
  function selection(classKey) { return (profile.builds[classKey] || []).filter(id => profile.owned.includes(id) && classById.get(id) === classKey); }
  function validBuild(ids, classKey) {
    if (new Set(ids).size !== ids.length || ids.some(id => !profile.owned.includes(id) || classById.get(id) !== classKey)) return false;
    return (typeof rogueBuildDependency!=="function"||ids.every(id=>rogueBuildDependency(id,ids))) && ids.filter(id => catalogue.get(id)[1] === "keystone").length <= 1 && ids.filter(id => catalogue.get(id)[1] !== "keystone").length <= 4;
  }
  function total(journal = profile.journal) {
    if (!journal || journal.practice) return 0;
    return journal.bosses.length + journal.contracts.length + (journal.final ? 3 : 0) + [1,3,6,10].filter(n => journal.bosses.length >= n && !profile.milestones.includes(n)).length * 2;
  }
  Arcade.progress = {
    get profile() { return profile; }, get error() { return error; }, catalogue,
    configure(definitions) {
      classById = new Map(definitions.map(t => [t.id, t.classKey]));
      for (const cls of classes) { const ids = selection(cls); profile.builds[cls] = validBuild(ids, cls) ? ids : []; }
    },
    save, selection, validBuild, total,
    cost(id) { const node = catalogue.get(id); return node ? Arcade.rogueData.tiers[node[1]] : Infinity; },
    canPurchase(id) {
      const node = catalogue.get(id), cls = classById.get(id);
      return Boolean(node && !profile.owned.includes(id) && (!profile.journal || profile.journal.settled) && profile.marks >= this.cost(id) && (node[1] !== "keystone" || profile.owned.filter(other => classById.get(other) === cls && catalogue.get(other)[1] !== "keystone").length >= 3));
    },
    purchase(id) {
      if (!this.canPurchase(id)) return false;
      profile.marks -= this.cost(id); profile.owned.push(id); save(); return true;
    },
    refund(id) {
      if (!profile.owned.includes(id) || profile.journal && !profile.journal.settled) return false;
      profile.owned = profile.owned.filter(other => other !== id); profile.marks += this.cost(id);
      for (const cls of classes) {let ids=selection(cls);if(typeof rogueBuildDependency==="function")ids=ids.filter(id=>rogueBuildDependency(id,ids));profile.builds[cls]=ids;} save(); return true;
    },
    select(classKey, ids) {
      if (profile.journal && !profile.journal.settled || !validBuild(ids, classKey)) return false;
      profile.builds[classKey] = ids.slice(); save(); return true;
    },
    begin(mode, gear) {
      if (profile.journal && !profile.journal.settled) return null;
      const journal = { id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2), mode, practice: mode === "practice" || mode === "dev", bosses: [], contracts: [], final: false, settled: false, gear: { ...gear }, checkpoint: null };
      profile.journal = journal; save(); return journal;
    },
    record(kind, id) {
      if(kind==="bosses"&&id==="sauce")id="trio";
      const journal = profile.journal;
      if (!journal || journal.settled || journal.practice || !["bosses", "contracts"].includes(kind) || journal[kind].includes(id) || !["cola","burger","fries","trio","sauce","shake","nacho","pizza","donut","taco","sushi"].includes(id)) return false;
      journal[kind].push(id); save(); return true;
    },
    checkpoint(snapshot) { if (profile.journal && !profile.journal.settled) { profile.journal.checkpoint = snapshot; save(); } },
    settle(reason, final = false) {
      const journal = profile.journal;
      if (!journal) return null;
      if (journal.settled) return profile.lastResult;
      journal.final = Boolean(final); const earned = total(journal);
      const result = { id: journal.id, earned, bosses: journal.bosses.length, contracts: journal.contracts.length, reason, practice: journal.practice, final: journal.final };
      profile.marks += earned;
      if (!journal.practice) for (const depth of [1,3,6,10]) if (journal.bosses.length >= depth && !profile.milestones.includes(depth)) profile.milestones.push(depth);
      journal.settled = true; journal.checkpoint = null; profile.lastResult = result; save(); return result;
    }
  };
})();
