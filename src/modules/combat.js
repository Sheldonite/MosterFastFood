/**
 * Combat System Module
 * Handles damage calculation, projectile management, and combat mechanics
 */

import { combatTuning, abilityLoadouts } from './constants.js';
import { GameState } from './GameState.js';
import { Entity, Player, Boss, Projectile, Hazard } from './entities.js';

/**
 * Calculate damage with all modifiers applied
 * @param {number} baseDamage - Base damage value
 * @param {Object} attacker - Attacking entity
 * @param {Object} defender - Defending entity
 * @param {string} damageType - Type of damage (physical, fire, etc.)
 * @returns {number} Final calculated damage
 */
export function calculateDamage(baseDamage, attacker, defender, damageType = 'physical') {
  if (!baseDamage || baseDamage <= 0) {
    return 1;
  }
  
  let damage = baseDamage;
  
  // Apply attacker buffs
  if (attacker && attacker.damageMultiplier) {
    damage *= attacker.damageMultiplier;
  }
  
  // Apply defender armor reduction (simplified formula)
  if (defender && defender.armor > 0) {
    const reduction = Math.min(0.75, defender.armor * 0.04);
    damage *= (1 - reduction);
  }
  
  // Apply resistances/vulnerabilities
  if (defender && defender.resistances && defender.resistances[damageType]) {
    damage *= defender.resistances[damageType];
  }
  
  // Critical hit calculation
  if (attacker && attacker.critChance && Math.random() < attacker.critChance) {
    damage *= attacker.critDamage || 2.0;
  }
  
  return Math.max(1, Math.floor(damage));
}

/**
 * Calculate crit multiplier based on crit chance
 * @param {boolean} isCrit - Whether the hit is critical
 * @param {number} critChance - Crit chance (0-1)
 * @param {number} baseCritDamage - Base crit damage multiplier
 * @returns {number} Crit multiplier
 */
export function calculateCritMultiplier(isCrit, critChance = 0, baseCritDamage = 2.0) {
  if (isCrit) {
    return baseCritDamage + (critChance * 0.5);
  }
  return 1.0;
}

/**
 * Apply damage modifiers to a damage value
 * @param {number} damage - Base damage
 * @param {Array} modifiers - Array of modifier objects
 * @returns {number} Modified damage
 */
export function applyDamageModifiers(damage, modifiers = []) {
  if (!damage || damage <= 0) {
    return 1;
  }
  
  let modifiedDamage = damage;
  
  for (const mod of modifiers) {
    if (mod.type === 'multiply') {
      modifiedDamage *= mod.value;
    } else if (mod.type === 'add') {
      modifiedDamage += mod.value;
    } else if (mod.type === 'subtract') {
      modifiedDamage -= mod.value;
    }
  }
  
  return Math.max(1, Math.floor(modifiedDamage));
}

/**
 * Validate damage input for server-side verification
 * @param {number} damage - Damage value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateDamageInput(damage, options = {}) {
  const { maxDamage = 10000, allowNegative = false } = options;
  
  if (typeof damage !== 'number' || isNaN(damage)) {
    return { valid: false, reason: 'Damage must be a number' };
  }
  
  if (!allowNegative && damage < 0) {
    return { valid: false, reason: 'Damage cannot be negative' };
  }
  
  if (!Number.isFinite(damage)) {
    return { valid: false, reason: 'Damage must be finite' };
  }
  
  if (damage > maxDamage) {
    return { valid: false, reason: `Damage exceeds maximum of ${maxDamage}` };
  }
  
  return { valid: true, damage: Math.floor(damage) };
}

/**
 * Apply damage to an entity
 * @param {Entity} target - Target entity
 * @param {number} damage - Damage amount
 * @param {string} damageSource - Source of damage
 * @param {Entity} source - Source entity
 * @returns {boolean} Whether target was defeated
 */
export function applyDamage(target, damage, damageSource, source = null) {
  if (!target || !target.takeDamage) {
    console.warn('Invalid target for damage:', target);
    return false;
  }
  
  const previousHp = target.hp;
  target.takeDamage(damage);
  
  // Track damage for multiplayer sync
  if (source instanceof Player && target instanceof Boss) {
    trackDamageDealt(source, target, damage, damageSource);
  }
  
  return target.hp <= 0;
}

/**
 * Track damage dealt for multiplayer synchronization
 * @param {Player} attacker - Attacking player
 * @param {Boss} boss - Target boss
 * @param {number} damage - Damage dealt
 * @param {string} ability - Ability used
 */
function trackDamageDealt(attacker, boss, damage, ability) {
  if (!window.gameState) return;
  
  const damageEvent = {
    timestamp: Date.now(),
    playerId: attacker.id,
    bossId: boss.id,
    damage,
    ability,
    crit: attacker.lastCrit || false
  };
  
  window.gameState.damageLog.push(damageEvent);
}

/**
 * Create a projectile
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @param {number} vx - Velocity X
 * @param {number} vy - Velocity Y
 * @param {Object} options - Additional options
 * @returns {Projectile}
 */
export function createProjectile(x, y, vx, vy, options = {}) {
  const projectile = new Projectile(x, y, vx, vy, options);
  return projectile;
}

/**
 * Update all projectiles
 * @param {GameState} gameState - Game state instance
 * @param {number} dt - Delta time
 */
export function updateProjectiles(gameState, dt) {
  const { projectiles, remoteProjectiles, worldBounds } = gameState;
  
  // Update local projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.update(dt);
    
    // Remove if out of bounds or expired
    if (proj.isExpired() || isOutOfBounds(proj, worldBounds)) {
      projectiles.splice(i, 1);
    }
  }
  
  // Update remote projectiles (multiplayer)
  for (let i = remoteProjectiles.length - 1; i >= 0; i--) {
    const proj = remoteProjectiles[i];
    proj.update(dt);
    
    if (proj.isExpired() || isOutOfBounds(proj, worldBounds)) {
      remoteProjectiles.splice(i, 1);
    }
  }
}

/**
 * Check if entity is out of world bounds
 * @param {Entity} entity - Entity to check
 * @param {Object} worldBounds - World boundaries
 * @returns {boolean}
 */
function isOutOfBounds(entity, worldBounds) {
  return (
    entity.x < worldBounds.x ||
    entity.x > worldBounds.x + worldBounds.width ||
    entity.y < worldBounds.y ||
    entity.y > worldBounds.y + worldBounds.height
  );
}

/**
 * Check projectile collisions
 * @param {GameState} gameState - Game state instance
 */
export function checkProjectileCollisions(gameState) {
  const { projectiles, enemies, players, hazards } = gameState;
  
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    
    // Check collision with enemies
    for (const enemy of enemies) {
      if (proj.owner !== enemy && proj.collidesWith(enemy)) {
        const defeated = applyDamage(enemy, proj.damage, proj.damageType, proj.owner);
        
        if (proj.onHit) {
          proj.onHit(enemy, defeated);
        }
        
        if (!proj.pierce || defeated) {
          projectiles.splice(i, 1);
          break;
        }
      }
    }
    
    // Check collision with players (friendly fire disabled by default)
    if (proj.friendlyFire) {
      for (const player of players) {
        if (proj.owner !== player && proj.collidesWith(player)) {
          applyDamage(player, proj.damage, proj.damageType, proj.owner);
          
          if (proj.onHit) {
            proj.onHit(player, false);
          }
          
          if (!proj.pierce) {
            projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }
}

/**
 * Update all hazards
 * @param {GameState} gameState - Game state instance
 * @param {number} dt - Delta time
 */
export function updateHazards(gameState, dt) {
  const { hazards, players } = gameState;
  
  for (const hazard of hazards) {
    hazard.update(dt);
    
    // Check collision with players
    for (const player of players) {
      if (hazard.collidesWith(player) && !hazard.applied.has(player)) {
        applyDamage(player, hazard.damage, hazard.damageType, hazard.source);
        hazard.applied.add(player);
        
        if (hazard.onHit) {
          hazard.onHit(player);
        }
      }
    }
    
    // Remove expired hazards
    if (hazard.isExpired()) {
      hazards.delete(hazard);
    }
  }
}

/**
 * Spawn hazard at position
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} config - Hazard configuration
 * @returns {Hazard}
 */
export function spawnHazard(x, y, config) {
  const hazard = new Hazard(x, y, config);
  return hazard;
}

/**
 * Execute ability
 * @param {Player} player - Player using ability
 * @param {string} abilityKey - Ability key from abilityLoadouts
 * @param {Object} target - Optional target
 * @returns {Object|null} Ability effect data or null if failed
 */
export function executeAbility(player, abilityKey, target = null) {
  const ability = abilityLoadouts[player.class]?.[abilityKey];
  
  if (!ability) {
    console.warn(`Ability ${abilityKey} not found for class ${player.class}`);
    return null;
  }
  
  // Check cooldown
  if (player.abilitiesOnCooldown && player.abilitiesOnCooldown[abilityKey]) {
    return null;
  }
  
  // Check resource cost
  if (ability.cost && player.resource < ability.cost) {
    return null;
  }
  
  // Deduct resource
  if (ability.cost) {
    player.resource -= ability.cost;
  }
  
  // Start cooldown
  if (ability.cooldown) {
    startAbilityCooldown(player, abilityKey, ability.cooldown);
  }
  
  // Execute ability effect
  const effect = createAbilityEffect(player, ability, target);
  return effect;
}

/**
 * Start ability cooldown
 * @param {Player} player - Player
 * @param {string} abilityKey - Ability key
 * @param {number} duration - Cooldown duration in seconds
 */
function startAbilityCooldown(player, abilityKey, duration) {
  if (!player.abilitiesOnCooldown) {
    player.abilitiesOnCooldown = {};
  }
  
  player.abilitiesOnCooldown[abilityKey] = {
    startTime: Date.now(),
    duration: duration * 1000
  };
}

/**
 * Create ability visual/mechanical effect
 * @param {Player} player - Casting player
 * @param {Object} ability - Ability definition
 * @param {Object} target - Optional target
 * @returns {Object} Effect data
 */
function createAbilityEffect(player, ability, target) {
  const effect = {
    type: ability.type,
    owner: player,
    createdAt: Date.now(),
    duration: ability.duration || 0,
    data: { ...ability }
  };
  
  // Handle different ability types
  switch (ability.type) {
    case 'projectile':
      effect.projectiles = spawnAbilityProjectiles(player, ability, target);
      break;
    case 'area':
      effect.hazards = spawnAbilityHazards(player, ability, target);
      break;
    case 'buff':
      applyBuff(player, ability);
      break;
    case 'dash':
      effect.dash = { ...ability, startTime: Date.now() };
      break;
  }
  
  return effect;
}

/**
 * Spawn projectiles from ability
 * @param {Player} player - Casting player
 * @param {Object} ability - Ability definition
 * @param {Object} target - Optional target
 * @returns {Projectile[]}
 */
function spawnAbilityProjectiles(player, ability, target) {
  const projectiles = [];
  const count = ability.projectileCount || 1;
  
  for (let i = 0; i < count; i++) {
    const angle = ability.spreadAngle 
      ? (Math.random() - 0.5) * ability.spreadAngle 
      : Math.atan2(target?.y - player.y || 1, target?.x - player.x || 1);
    
    const speed = ability.projectileSpeed || 500;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    const proj = createProjectile(
      player.x,
      player.y,
      vx,
      vy,
      {
        damage: ability.damage,
        damageType: ability.damageType,
        owner: player,
        pierce: ability.pierce,
        lifetime: ability.lifetime,
        homing: ability.homing,
        homingTarget: ability.homing ? target : null
      }
    );
    
    projectiles.push(proj);
  }
  
  return projectiles;
}

/**
 * Spawn hazards from ability
 * @param {Player} player - Casting player
 * @param {Object} ability - Ability definition
 * @param {Object} target - Optional target
 * @returns {Hazard[]}
 */
function spawnAbilityHazards(player, ability, target) {
  const hazards = [];
  const targetX = target?.x || player.x + (ability.range || 100);
  const targetY = target?.y || player.y;
  
  const hazard = spawnHazard(targetX, targetY, {
    damage: ability.damage,
    damageType: ability.damageType,
    radius: ability.radius,
    duration: ability.duration,
    tickRate: ability.tickRate,
    source: player
  });
  
  hazards.push(hazard);
  return hazards;
}

/**
 * Apply buff to entity
 * @param {Entity} entity - Target entity
 * @param {Object} ability - Ability with buff properties
 */
function applyBuff(entity, ability) {
  if (!entity.buffs) {
    entity.buffs = [];
  }
  
  const buff = {
    type: ability.buffType,
    value: ability.buffValue,
    duration: ability.buffDuration,
    startTime: Date.now()
  };
  
  entity.buffs.push(buff);
  
  // Apply immediate effects
  if (buff.type === 'heal') {
    entity.hp = Math.min(entity.maxHp, entity.hp + buff.value);
  }
}

/**
 * Update ability effects
 * @param {GameState} gameState - Game state instance
 * @param {number} dt - Delta time
 */
export function updateAbilityEffects(gameState, dt) {
  const { abilityEffects, remoteAbilityEffects } = gameState;
  
  // Update local effects
  for (let i = abilityEffects.length - 1; i >= 0; i--) {
    const effect = abilityEffects[i];
    
    if (effect.duration && (Date.now() - effect.createdAt) > effect.duration * 1000) {
      abilityEffects.splice(i, 1);
      continue;
    }
    
    // Update effect-specific logic
    if (effect.type === 'dash') {
      updateDashEffect(effect, dt);
    }
  }
  
  // Update remote effects
  for (let i = remoteAbilityEffects.length - 1; i >= 0; i--) {
    const effect = remoteAbilityEffects[i];
    
    if (effect.duration && (Date.now() - effect.createdAt) > effect.duration * 1000) {
      remoteAbilityEffects.splice(i, 1);
    }
  }
}

/**
 * Update dash effect
 * @param {Object} effect - Dash effect
 * @param {number} dt - Delta time
 */
function updateDashEffect(effect, dt) {
  const { owner, dash } = effect;
  const elapsed = Date.now() - dash.startTime;
  
  if (elapsed < dash.duration * 1000) {
    // Apply dash movement
    const progress = elapsed / (dash.duration * 1000);
    owner.x += dash.directionX * dash.speed * dt * progress;
    owner.y += dash.directionY * dash.speed * dt * progress;
    
    // Apply iframe if specified
    if (dash.invulnerable) {
      owner.invulnerable = true;
    }
  } else {
    owner.invulnerable = false;
  }
}

/**
 * Server-authoritative damage validation
 * @param {Object} damageReport - Damage report from client
 * @param {GameState} gameState - Current game state
 * @returns {Object} Validated damage data
 */
export function validateDamageReport(damageReport, gameState) {
  const { players, bosses } = gameState;
  
  const player = players.find(p => p.id === damageReport.playerId);
  const boss = bosses.find(b => b.id === damageReport.bossId);
  
  if (!player || !boss) {
    return { valid: false, reason: 'Invalid entities' };
  }
  
  // Validate damage range
  const maxPossibleDamage = calculateMaxPossibleDamage(player, boss);
  if (damageReport.damage > maxPossibleDamage * 1.5) { // 50% tolerance
    return { valid: false, reason: 'Damage exceeds maximum possible' };
  }
  
  // Validate timing (prevent spam)
  const now = Date.now();
  const recentDamage = gameState.damageLog.filter(
    d => d.playerId === damageReport.playerId && 
         now - d.timestamp < 100
  );
  
  if (recentDamage.length > 10) { // Max 10 hits per 100ms
    return { valid: false, reason: 'Damage rate exceeded' };
  }
  
  return {
    valid: true,
    damage: Math.floor(damageReport.damage),
    timestamp: now
  };
}

/**
 * Calculate maximum possible damage for validation
 * @param {Player} player - Attacking player
 * @param {Boss} boss - Target boss
 * @returns {number} Maximum theoretical damage
 */
function calculateMaxPossibleDamage(player, boss) {
  const baseDamage = player.weapon?.damage || 50;
  const critMultiplier = player.critDamage || 2.0;
  const buffMultiplier = player.buffs?.reduce((acc, b) => acc * (b.value || 1), 1) || 1;
  
  return baseDamage * critMultiplier * buffMultiplier * 3; // Safety margin
}

export default {
  calculateDamage,
  applyDamage,
  createProjectile,
  updateProjectiles,
  checkProjectileCollisions,
  updateHazards,
  spawnHazard,
  executeAbility,
  updateAbilityEffects,
  validateDamageReport
};
