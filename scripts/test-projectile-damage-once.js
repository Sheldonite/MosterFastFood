const assert = require("assert");

function createProjectile(id, piercing = false) {
  return { id, piercing, hitPlayerIds: new Set() };
}

function markProjectileHit(projectile, playerId) {
  if (projectile.hitPlayerIds.has(playerId)) return false;
  projectile.hitPlayerIds.add(playerId);
  return true;
}

function createServerRegistry() {
  return { hits: new Set(), consumed: new Set() };
}

function acceptServerDamage(registry, projectile, playerId) {
  const hitKey = `${projectile.id}:${playerId}`;
  if (registry.hits.has(hitKey)) return false;
  if (!projectile.piercing && registry.consumed.has(projectile.id)) return false;
  registry.hits.add(hitKey);
  if (!projectile.piercing) registry.consumed.add(projectile.id);
  return true;
}

function applyPlayerDamage(player, projectileId, amount) {
  if (player.recentlyHitProjectileIds.has(projectileId)) return false;
  player.recentlyHitProjectileIds.add(projectileId);
  player.hp -= amount;
  return true;
}

{
  const projectile = createProjectile("bolt-1");
  assert.equal(markProjectileHit(projectile, "p1"), true);
  assert.equal(markProjectileHit(projectile, "p1"), false);
  assert.equal(markProjectileHit(projectile, "p1"), false);
}

{
  const registry = createServerRegistry();
  const projectile = createProjectile("bolt-2");
  assert.equal(acceptServerDamage(registry, projectile, "p1"), true);
  assert.equal(acceptServerDamage(registry, projectile, "p1"), false);
  assert.equal(acceptServerDamage(registry, projectile, "p2"), false);
}

{
  const registry = createServerRegistry();
  const projectile = createProjectile("beam-1", true);
  assert.equal(acceptServerDamage(registry, projectile, "p1"), true);
  assert.equal(acceptServerDamage(registry, projectile, "p1"), false);
  assert.equal(acceptServerDamage(registry, projectile, "p2"), true);
}

{
  const player = { hp: 100, recentlyHitProjectileIds: new Set() };
  assert.equal(applyPlayerDamage(player, "synced-1", 12), true);
  assert.equal(applyPlayerDamage(player, "synced-1", 12), false);
  assert.equal(applyPlayerDamage(player, "synced-2", 12), true);
  assert.equal(player.hp, 76);
}

console.log("Projectile damage once regression passed.");
