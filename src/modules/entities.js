/**
 * Entity Module - Base classes for game entities (Player, Boss, Projectile, Hazard)
 */

import { world } from './constants.js';

/**
 * Base Entity class with common properties and methods
 */
export class Entity {
  constructor(x, y, width, height, health = 100) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.health = health;
    this.maxHealth = health;
    this.armor = 0;
    this.dead = false;
    this.id = Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Check if point is inside entity bounds
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @returns {boolean} True if point is inside
   */
  containsPoint(px, py) {
    return px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }
  
  /**
   * Check collision with another entity
   * @param {Entity} other - Other entity to check
   * @returns {boolean} True if colliding
   */
  collidesWith(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }
  
  /**
   * Get center position
   * @returns {{x: number, y: number}} Center coordinates
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }
  
  /**
   * Distance to another entity or point
   * @param {Entity|{x: number, y: number}} other - Entity or point
   * @returns {number} Distance
   */
  distanceTo(other) {
    const center = this.getCenter();
    const ox = other.x !== undefined ? (other.x + (other.width || 0) / 2) : other.x;
    const oy = other.y !== undefined ? (other.y + (other.height || 0) / 2) : other.y;
    const dx = center.x - ox;
    const dy = center.y - oy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Apply damage to entity
   * @param {number} amount - Raw damage amount
   * @param {Object} options - Damage options
   * @returns {number} Actual damage dealt
   */
  takeDamage(amount, options = {}) {
    if (this.dead) return 0;
    
    const { armorPenetration = 0, damageMultiplier = 1 } = options;
    
    // Calculate effective armor
    const effectiveArmor = Math.max(0, this.armor - armorPenetration);
    
    // Damage reduction from armor (each armor reduces damage by ~4%)
    const reduction = Math.min(0.75, effectiveArmor * 0.04);
    
    // Apply reduction and multiplier
    const actualDamage = Math.ceil(amount * (1 - reduction) * damageMultiplier);
    
    this.health = Math.max(0, this.health - actualDamage);
    
    if (this.health <= 0) {
      this.dead = true;
    }
    
    return actualDamage;
  }
  
  /**
   * Check if entity is dead
   * @returns {boolean} True if dead
   */
  isDead() {
    return this.dead;
  }
  
  /**
   * Move entity by delta values
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  
  /**
   * Heal entity
   * @param {number} amount - Amount to heal
   * @returns {number} Actual amount healed
   */
  heal(amount) {
    if (this.dead) return 0;
    
    const oldHp = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    
    return this.health - oldHp;
  }
  
  /**
   * Update entity position based on velocity
   * @param {number} dt - Delta time in seconds
   */
  updatePosition(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  
  /**
   * Constrain entity to world bounds
   */
  constrainToWorld() {
    this.x = Math.max(0, Math.min(world.width - this.width, this.x));
    this.y = Math.max(0, Math.min(world.height - this.height, this.y));
  }
}

/**
 * Player entity with class-specific properties
 */
export class Player extends Entity {
  constructor(x, y, classType = 'warrior') {
    super(x, y, 48, 48, 100);
    
    this.class = classType;
    this.classType = classType;
    this.weaponId = 'ironBlade';
    this.armorId = 'duelistCoat';
    this.name = 'Player';
    this.speed = 250;
    this.damageMultiplier = 1;
    this.attackSpeed = 1;
    this.cooldownRecovery = 1;
    
    // Equipment slots
    this.equipment = {
      weapon: null,
      armor: null
    };
    
    // Combat state
    this.lastAttackAt = 0;
    this.abilities = {};
    this.statusEffects = [];
    this.potions = 3;
    this.maxPotions = 3;
    
    // Multiplayer state
    this.peerId = null;
    this.isRemote = false;
  }
  
  /**
   * Equip an item
   * @param {string} slot - Equipment slot
   * @param {Object} item - Item to equip
   */
  equip(slot, item) {
    if (!this.equipment[slot]) {
      this.equipment[slot] = item;
    } else {
      this.equipment[slot] = item;
    }
  }
  
  /**
   * Get total stats from equipment
   * @returns {Object} Total stats
   */
  getTotalStats() {
    let attackPower = 0;
    let defense = 0;
    
    if (this.equipment.weapon) {
      attackPower += this.equipment.weapon.attackPower || 0;
      attackPower += this.equipment.weapon.damage || 0;
    }
    
    if (this.equipment.armor) {
      defense += this.equipment.armor.defense || 0;
    }
    
    return { attackPower, defense };
  }
  
  /**
   * Get weapon stats
   * @returns {Object} Weapon configuration
   */
  getWeapon() {
    // Will be imported from constants
    return { damage: 46, range: 54, speed: 1.05, moveSpeedBonus: 30 };
  }
  
  /**
   * Get armor stats
   * @returns {Object} Armor configuration
   */
  getArmor() {
    // Will be imported from constants
    return { armor: 2, maxHp: 115, speed: 250 };
  }
  
  /**
   * Recalculate derived stats from equipment
   */
  recalcStats() {
    const weapon = this.getWeapon();
    const armor = this.getArmor();
    
    this.speed = (armor.speed || 250) + (weapon.moveSpeedBonus || 0);
    this.maxHp = armor.maxHp || 100;
    this.armor = armor.armor || 0;
    this.damageMultiplier = armor.damageMultiplier || 1;
  }
  
  /**
   * Use a potion
   * @returns {boolean} True if potion was used
   */
  usePotion() {
    if (this.potions <= 0 || this.health >= this.maxHealth || this.dead) {
      return false;
    }
    
    this.potions--;
    this.heal(this.maxHealth * 0.4); // Heal 40% of max HP
    
    return true;
  }
}

/**
 * Boss entity with phase management
 */
export class Boss extends Entity {
  constructor(kind, x, y, bossType, maxHealth = 1000) {
    super(x, y, 100, 100, maxHealth);
    
    this.bossType = bossType || kind;
    this.kind = kind;
    this.currentPhase = 0;
    this.phase = 1;
    this.phaseTimer = 0;
    this.attackTimer = 0;
    this.patternIndex = 0;
    this.staggered = false;
    this.staggerTimer = 0;
    this.enraged = false;
    
    // Boss-specific state
    this.subTarget = null;
    this.mechanicState = {};
    this.summons = [];
  }
  
  /**
   * Check and update phase based on health
   */
  checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;
    const thresholds = [0.66, 0.33];
    
    for (let i = 0; i < thresholds.length; i++) {
      if (healthPercent <= thresholds[i] && this.currentPhase <= i) {
        this.currentPhase = i + 1;
        break;
      }
    }
  }
  
  /**
   * Take damage and check for phase transitions
   * @param {number} amount - Damage amount
   * @param {Object} options - Damage options
   * @returns {number} Actual damage dealt
   */
  takeDamage(amount, options = {}) {
    const actualDamage = super.takeDamage(amount, options);
    this.checkPhaseTransition();
    return actualDamage;
  }
  
  /**
   * Get boss health multiplier based on kind
   * @returns {number} Health multiplier
   */
  getHealthMultiplier() {
    const multipliers = {
      cola: 1.5,
      burger: 1.55,
      fries: 1.5,
      trio: 1.5,
      sauce: 1.65,
      shake: 1.7,
      nacho: 1.58,
      pizza: 1.62,
      donut: 1.9,
      taco: 5.8,
      sushi: 1.58,
    };
    return multipliers[this.kind] || 1.5;
  }
  
  /**
   * Advance boss phase
   */
  advancePhase() {
    this.phase++;
    this.phaseTimer = 0;
    this.attackTimer = 0;
  }
  
  /**
   * Stagger the boss (interrupt current action)
   * @param {number} duration - Stagger duration in seconds
   */
  stagger(duration) {
    this.staggered = true;
    this.staggerTimer = duration;
  }
  
  /**
   * Update stagger state
   * @param {number} dt - Delta time
   */
  updateStagger(dt) {
    if (this.staggered) {
      this.staggerTimer -= dt;
      if (this.staggerTimer <= 0) {
        this.staggered = false;
      }
    }
  }
}

/**
 * Projectile entity for player and boss attacks
 */
export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage = 25, lifetime = 3) {
    super(x, y, 12, 12, 1);
    
    this.vx = vx;
    this.vy = vy;
    this.speed = Math.sqrt(vx * vx + vy * vy);
    this.damage = damage;
    this.lifetime = lifetime;
    this.age = 0;
    this.source = 'player';
    this.kind = 'basic';
    this.homing = false;
    this.target = null;
    this.piercing = false;
    this.hitCount = 0;
    this.maxHits = 1;
  }
  
  /**
   * Update projectile
   * @param {number} dt - Delta time
   * @param {Array} targets - Potential targets for homing
   */
  update(dt, targets = []) {
    this.age += dt;
    
    // Update position based on velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Homing behavior
    if (this.homing && this.target && !this.target.dead) {
      const angle = Math.atan2(
        this.target.y - this.y,
        this.target.x - this.x
      );
      const turnRate = 3; // Radians per second
      const currentAngle = Math.atan2(this.vy, this.vx);
      
      // Interpolate towards target angle
      let newAngle = currentAngle;
      const diff = angle - currentAngle;
      if (Math.abs(diff) < turnRate * dt) {
        newAngle = angle;
      } else {
        newAngle = currentAngle + Math.sign(diff) * turnRate * dt;
      }
      
      this.vx = Math.cos(newAngle) * this.speed;
      this.vy = Math.sin(newAngle) * this.speed;
    }
    
    // Check lifetime
    if (this.age >= this.lifetime) {
      this.dead = true;
    }
  }
  
  /**
   * Check if projectile is still alive
   * @returns {boolean} True if alive
   */
  isAlive() {
    return !this.dead && this.age < this.lifetime;
  }
}

/**
 * Hazard entity for environmental dangers
 */
export class Hazard extends Entity {
  constructor(x, y, options = {}) {
    super(x, y, options.width || 40, options.height || 40);
    
    this.kind = options.kind || 'generic';
    this.damage = options.damage || 10;
    this.duration = options.duration || 5;
    this.age = 0;
    this.tickRate = options.tickRate || 0.5;
    this.tickTimer = 0;
    this.slowFactor = options.slowFactor || 1;
    this.owner = options.owner || null;
    this.syncId = options.syncId || Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Update hazard
   * @param {number} dt - Delta time
   */
  update(dt) {
    this.age += dt;
    
    if (this.duration > 0 && this.age >= this.duration) {
      this.dead = true;
    }
  }
  
  /**
   * Check if hazard should damage entity
   * @param {Entity} entity - Entity to check
   * @returns {boolean} True if should damage
   */
  shouldDamage(entity) {
    return this.collidesWith(entity) && !this.dead;
  }
}

/**
 * Create a new player instance
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @param {string} classType - Player class type
 * @returns {Player} New player instance
 */
export function createPlayer(x = 100, y = 450, classType = 'warrior') {
  return new Player(x, y, classType);
}

/**
 * Create a new boss instance
 * @param {string} kind - Boss kind identifier
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} bossType - Boss type name
 * @param {number} maxHealth - Maximum health
 * @returns {Boss} New boss instance
 */
export function createBoss(kind, x = 1000, y = 400, bossType, maxHealth) {
  const sizes = {
    cola: { width: 120, height: 180 },
    burger: { width: 160, height: 160 },
    fries: { width: 100, height: 200 },
    trio: { width: 140, height: 140 },
    sauce: { width: 130, height: 150 },
    shake: { width: 150, height: 190 },
    nacho: { width: 140, height: 160 },
    pizza: { width: 130, height: 170 },
    taco: { width: 200, height: 140 },
    donut: { width: 180, height: 180 },
    sushi: { width: 220, height: 120 },
  };
  
  const size = sizes[kind] || { width: 140, height: 160 };
  const hp = maxHealth || Math.floor(2000 * (bossType ? 1.5 : 1));
  const boss = new Boss(kind, x, y, bossType || kind, hp);
  
  return boss;
}

/**
 * Create a training dummy for testing
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Entity} Training dummy entity
 */
export function createTrainingDummy(x = 1000, y = 450) {
  const dummy = new Entity(x, y, 60, 80, 10000);
  dummy.isStatic = true;
  return dummy;
}
