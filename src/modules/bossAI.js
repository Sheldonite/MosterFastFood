/**
 * Boss AI System Module
 * Handles boss behavior patterns, phase transitions, and ability usage
 */

import { bossAbilityDamageDefinitions } from './constants.js';
import { GameState } from './GameState.js';
import { Boss, Hazard, Projectile } from './entities.js';

/**
 * Boss state machine states
 */
export const BossState = {
  IDLE: 'idle',
  MOVING: 'moving',
  ATTACKING: 'attacking',
  TRANSITIONING: 'transitioning',
  STUNNED: 'stunned',
  ENRAGED: 'enraged'
};

/**
 * Boss AI Controller
 * Manages boss behavior and decision making
 */
export class BossAI {
  constructor(boss) {
    this.boss = boss;
    this.currentState = BossState.IDLE;
    this.stateTimer = 0;
    this.target = null;
    this.patternIndex = 0;
    this.abilityQueue = [];
    this.lastAttackTime = 0;
    this.phaseTransitionCooldown = 0;
  }

  /**
   * Update boss AI
   * @param {number} dt - Delta time in seconds
   * @param {GameState} gameState - Current game state
   */
  update(dt, gameState) {
    if (this.boss.stunned || this.boss.hp <= 0) {
      return;
    }

    this.stateTimer -= dt;
    
    // Check for phase transition
    this.checkPhaseTransition();
    
    // Select target
    this.selectTarget(gameState);
    
    // Execute current state
    switch (this.currentState) {
      case BossState.IDLE:
        this.updateIdle(dt);
        break;
      case BossState.MOVING:
        this.updateMoving(dt);
        break;
      case BossState.ATTACKING:
        this.updateAttacking(dt, gameState);
        break;
      case BossState.TRANSITIONING:
        this.updateTransitioning(dt);
        break;
      case BossState.ENRAGED:
        this.updateEnraged(dt, gameState);
        break;
    }
    
    // Process ability queue
    this.processAbilityQueue(gameState);
  }

  /**
   * Select closest player as target
   * @param {GameState} gameState - Game state
   */
  selectTarget(gameState) {
    const players = gameState.players.filter(p => p.hp > 0);
    
    if (players.length === 0) {
      this.target = null;
      return;
    }
    
    // Find closest player
    let closest = null;
    let closestDist = Infinity;
    
    for (const player of players) {
      const dx = player.x - this.boss.x;
      const dy = player.y - this.boss.y;
      const dist = dx * dx + dy * dy;
      
      if (dist < closestDist) {
        closestDist = dist;
        closest = player;
      }
    }
    
    this.target = closest;
  }

  /**
   * Update idle state
   * @param {number} dt - Delta time
   */
  updateIdle(dt) {
    if (this.stateTimer <= 0) {
      // Transition to moving or attacking
      if (this.target && this.isInRange(this.target)) {
        this.setState(BossState.ATTACKING, this.boss.attackPattern?.attackDuration || 2);
      } else {
        this.setState(BossState.MOVING, this.boss.movePattern?.moveDuration || 1.5);
      }
    }
  }

  /**
   * Update moving state
   * @param {number} dt - Delta time
   */
  updateMoving(dt) {
    if (!this.target) return;
    
    const movePattern = this.boss.movePattern || this.getDefaultMovePattern();
    const now = Date.now() / 1000;
    
    // Calculate movement direction
    let dx = 0, dy = 0;
    
    switch (movePattern.type) {
      case 'chase':
        dx = this.target.x - this.boss.x;
        dy = this.target.y - this.boss.y;
        break;
      case 'circle':
        const angle = now * movePattern.speed;
        dx = Math.cos(angle) * movePattern.radius;
        dy = Math.sin(angle) * movePattern.radius;
        break;
      case 'strafe':
        dx = Math.sin(now * movePattern.speed) * movePattern.amplitude;
        break;
      case 'retreat':
        dx = this.boss.x - this.target.x;
        dy = this.boss.y - this.target.y;
        break;
    }
    
    // Normalize and apply speed
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    this.boss.vx = (dx / mag) * movePattern.speed;
    this.boss.vy = (dy / mag) * movePattern.speed;
    
    // Check if reached destination or timer expired
    if (this.isInRange(this.target) || this.stateTimer <= 0) {
      this.setState(BossState.ATTACKING, this.boss.attackPattern?.attackDuration || 2);
    }
  }

  /**
   * Update attacking state
   * @param {number} dt - Delta time
   * @param {GameState} gameState - Game state
   */
  updateAttacking(dt, gameState) {
    const now = Date.now() / 1000;
    
    // Stop movement during attack
    this.boss.vx = 0;
    this.boss.vy = 0;
    
    // Check if enough time has passed since last attack
    if (now - this.lastAttackTime >= this.boss.attackPattern?.attackInterval || 1.5) {
      this.executeAttack(gameState);
      this.lastAttackTime = now;
    }
    
    // Transition back to idle or moving after attack duration
    if (this.stateTimer <= 0) {
      const movePattern = this.boss.movePattern || this.getDefaultMovePattern();
      this.setState(BossState.MOVING, movePattern.moveDuration || 1.5);
    }
  }

  /**
   * Execute boss attack
   * @param {GameState} gameState - Game state
   */
  executeAttack(gameState) {
    const attackPattern = this.boss.attackPattern;
    
    if (!attackPattern) {
      console.warn('Boss has no attack pattern');
      return;
    }
    
    // Select attack based on pattern index or random
    const attackIndex = this.patternIndex % attackPattern.attacks.length;
    const attack = attackPattern.attacks[attackIndex];
    
    // Queue the attack
    this.queueAbility(attack, gameState);
    
    // Advance pattern index
    this.patternIndex++;
  }

  /**
   * Update transitioning state (phase changes)
   * @param {number} dt - Delta time
   */
  updateTransitioning(dt) {
    // Boss is typically invulnerable during transition
    this.boss.invulnerable = true;
    
    if (this.stateTimer <= 0) {
      this.boss.invulnerable = false;
      this.setState(BossState.IDLE, 1);
    }
  }

  /**
   * Update enraged state
   * @param {number} dt - Delta time
   * @param {GameState} gameState - Game state
   */
  updateEnraged(dt, gameState) {
    // Enraged bosses attack faster and deal more damage
    this.boss.damageMultiplier = this.boss.enrageMultiplier || 1.5;
    
    // Execute rapid attacks
    if (this.stateTimer <= 0) {
      this.executeAttack(gameState);
      this.setState(BossState.ATTACKING, 0.5); // Faster attack cycle
    }
  }

  /**
   * Check if boss should transition phases
   */
  checkPhaseTransition() {
    const now = Date.now() / 1000;
    
    if (now < this.phaseTransitionCooldown) {
      return;
    }
    
    const healthThresholds = this.boss.phaseThresholds || [0.75, 0.5, 0.25];
    const currentPhase = this.boss.currentPhase || 0;
    
    for (let i = 0; i < healthThresholds.length; i++) {
      const threshold = healthThresholds[i];
      
      if (this.boss.hp / this.boss.maxHp <= threshold && currentPhase <= i) {
        this.transitionToPhase(i + 1);
        break;
      }
    }
  }

  /**
   * Transition to new phase
   * @param {number} phase - New phase number
   */
  transitionToPhase(phase) {
    this.boss.currentPhase = phase;
    this.setState(BossState.TRANSITIONING, this.boss.transitionDuration || 3);
    this.phaseTransitionCooldown = Date.now() / 1000 + 5; // 5 second cooldown
    
    // Update boss stats for new phase
    if (this.boss.phaseStats && this.boss.phaseStats[phase]) {
      const stats = this.boss.phaseStats[phase];
      Object.assign(this.boss, stats);
    }
  }

  /**
   * Set boss state
   * @param {string} state - New state
   * @param {number} duration - State duration in seconds
   */
  setState(state, duration) {
    this.currentState = state;
    this.stateTimer = duration;
  }

  /**
   * Check if target is in attack range
   * @param {Object} target - Target entity
   * @returns {boolean}
   */
  isInRange(target) {
    if (!target) return false;
    
    const dx = target.x - this.boss.x;
    const dy = target.y - this.boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= (this.boss.attackRange || 400);
  }

  /**
   * Get default move pattern
   * @returns {Object} Default movement pattern
   */
  getDefaultMovePattern() {
    return {
      type: 'chase',
      speed: 100,
      moveDuration: 2
    };
  }

  /**
   * Queue ability for execution
   * @param {Object} ability - Ability data
   * @param {GameState} gameState - Game state
   */
  queueAbility(ability, gameState) {
    this.abilityQueue.push({
      ability,
      timestamp: Date.now(),
      delay: ability.delay || 0
    });
  }

  /**
   * Process queued abilities
   * @param {GameState} gameState - Game state
   */
  processAbilityQueue(gameState) {
    const now = Date.now();
    
    for (let i = this.abilityQueue.length - 1; i >= 0; i--) {
      const queued = this.abilityQueue[i];
      
      if (now - queued.timestamp >= queued.delay * 1000) {
        this.executeAbility(queued.ability, gameState);
        this.abilityQueue.splice(i, 1);
      }
    }
  }

  /**
   * Execute ability
   * @param {Object} ability - Ability definition
   * @param {GameState} gameState - Game state
   */
  executeAbility(ability, gameState) {
    const { hazards, projectiles } = gameState;
    
    switch (ability.type) {
      case 'projectile_barrage':
        this.executeProjectileBarrage(ability, projectiles);
        break;
      case 'area_denial':
        this.executeAreaDenial(ability, hazards);
        break;
      case 'charge':
        this.executeCharge(ability);
        break;
      case 'summon':
        this.executeSummon(ability, gameState);
        break;
      case 'aoe_blast':
        this.executeAoeBlast(ability, hazards);
        break;
    }
  }

  /**
   * Execute projectile barrage attack
   * @param {Object} ability - Ability config
   * @param {Array} projectiles - Projectiles array
   */
  executeProjectileBarrage(ability, projectiles) {
    const count = ability.count || 8;
    const spreadAngle = ability.spreadAngle || Math.PI / 2;
    const startAngle = ability.startAngle || -spreadAngle / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (spreadAngle / (count - 1)) * i;
      const speed = ability.projectileSpeed || 400;
      
      const proj = new Projectile(
        this.boss.x,
        this.boss.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        {
          damage: ability.damage,
          owner: this.boss,
          lifetime: ability.lifetime || 5,
          homing: ability.homing,
          homingTarget: this.target
        }
      );
      
      projectiles.push(proj);
    }
  }

  /**
   * Execute area denial attack
   * @param {Object} ability - Ability config
   * @param {Set} hazards - Hazards set
   */
  executeAreaDenial(ability, hazards) {
    const count = ability.count || 3;
    
    for (let i = 0; i < count; i++) {
      const x = this.target?.x + (Math.random() - 0.5) * ability.spread || this.boss.x;
      const y = this.target?.y + (Math.random() - 0.5) * ability.spread || this.boss.y;
      
      const hazard = new Hazard(x, y, {
        damage: ability.damage,
        radius: ability.radius || 60,
        duration: ability.duration || 5,
        tickRate: ability.tickRate || 0.5,
        source: this.boss,
        damageType: ability.damageType || 'fire'
      });
      
      hazards.add(hazard);
    }
  }

  /**
   * Execute charge attack
   * @param {Object} ability - Ability config
   */
  executeCharge(ability) {
    if (!this.target) return;
    
    const dx = this.target.x - this.boss.x;
    const dy = this.target.y - this.boss.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    
    this.boss.vx = (dx / mag) * ability.speed;
    this.boss.vy = (dy / mag) * ability.speed;
    this.boss.invulnerable = ability.invulnerable || false;
  }

  /**
   * Execute summon attack
   * @param {Object} ability - Ability config
   * @param {GameState} gameState - Game state
   */
  executeSummon(ability, gameState) {
    // Implementation depends on minion system
    console.log('Summon ability not yet implemented');
  }

  /**
   * Execute AOE blast attack
   * @param {Object} ability - Ability config
   * @param {Set} hazards - Hazards set
   */
  executeAoeBlast(ability, hazards) {
    const hazard = new Hazard(this.boss.x, this.boss.y, {
      damage: ability.damage,
      radius: ability.radius || 150,
      duration: ability.duration || 2,
      tickRate: ability.tickRate || 0.25,
      source: this.boss,
      damageType: ability.damageType || 'physical',
      expanding: ability.expanding,
      expandSpeed: ability.expandSpeed || 100
    });
    
    hazards.add(hazard);
  }

  /**
   * Get boss state info for debugging
   * @returns {Object} State information
   */
  getStateInfo() {
    return {
      state: this.currentState,
      stateTimer: this.stateTimer,
      phase: this.boss.currentPhase,
      target: this.target?.id || null,
      abilityQueueLength: this.abilityQueue.length
    };
  }
}

/**
 * Define boss patterns from constants
 * @param {string} bossId - Boss identifier
 * @returns {Object} Boss pattern configuration
 */
export function getBossPattern(bossId) {
  // Default pattern if not found
  const defaultPattern = {
    movePattern: {
      type: 'chase',
      speed: 80,
      moveDuration: 2
    },
    attackPattern: {
      attackInterval: 2,
      attackDuration: 1.5,
      attacks: [
        {
          type: 'projectile_barrage',
          damage: 15,
          count: 6,
          spreadAngle: Math.PI,
          projectileSpeed: 350,
          lifetime: 4
        }
      ]
    },
    phaseThresholds: [0.66, 0.33],
    transitionDuration: 3
  };
  
  // Return pattern with boss ID
  return {
    ...defaultPattern,
    id: bossId || 'default'
  };
}

/**
 * Create a boss AI instance from boss entity
 * @param {Boss} boss - Boss entity
 * @returns {BossAI|null} Boss AI controller or null if invalid
 */
export function createBossAI(boss) {
  if (!boss) {
    console.warn('Creating BossAI with null boss');
    return null;
  }
  return new BossAI(boss);
}

export default {
  BossAI,
  BossState,
  createBossAI,
  getBossPattern
};
