/**
 * GameState - Centralized game state management
 * Encapsulates all global state into a single class for better organization
 */

import { world } from './constants.js';

export class GameState {
  constructor() {
    // Core entities
    this.player = null;
    this.boss = null;
    this.trainingDummy = null;
    this.condimentBosses = [];
    
    // Game systems
    this.mazeState = null;
    this.hazards = [];
    this.playerProjectiles = [];
    this.remoteProjectiles = [];
    this.abilityEffects = [];
    this.remoteAbilityEffects = [];
    this.particles = [];
    
    // Camera and input
    this.camera = { x: 0, y: 0 };
    this.mouseWorld = { x: 300, y: 685 };
    this.mouseCanvas = { x: 0, y: 0, inside: false };
    this.movementKeys = { up: false, down: false, left: false, right: false };
    this.keyDirections = {
      w: 'up',
      a: 'left',
      s: 'down',
      d: 'right',
      ArrowUp: 'up',
      ArrowLeft: 'left',
      ArrowDown: 'down',
      ArrowRight: 'right',
    };
    
    // UI state
    this.abilityHudSlots = [];
    this.selectedBoss = null;
    this.floatTimer = 0;
    this.screenBanner = null;
    this.logLines = ["Choose gear, use WASD to cross the gate, hold click to attack."];
    
    // Timing and performance
    this.fightStartedAt = 0;
    this.lastTime = performance.now();
    this.lastRuntimeErrorAt = 0;
    
    // Spectator state
    this.spectateState = { targetId: null };
    
    // Boss damage panel state
    this.bossDamagePanelSignature = "";
    this.bossDamagePanelOpen = false;
    this.bossDamageOverrides = {};
    
    // Selector signatures
    this.classSelectorSignature = "";
    this.armorSelectorSignature = "";
    this.bossSelectorSignature = "";
    this.talentTreeSignature = "";
    this.selectedTalentId = "";
    
    // Attack state
    this.lastCanvasPointerAttackAt = 0;
    this.primaryAttackHeld = false;
    this.primaryAttackPointerId = null;
    
    // Multiplayer state
    this.multiplayer = {
      enabled: false,
      connected: false,
      socket: null,
      peerId: null,
      name: "Player",
      room: null,
      peers: new Map(),
      lastStateSentAt: 0,
      lastGauntletSyncAt: 0,
      host: false,
      ready: false,
      spectating: false,
      latency: 0,
      debug: false,
    };
    
    // Debug state
    this.debugReportState = {
      visible: false,
      text: "",
      lastGeneratedAt: 0,
    };
  }
  
  /**
   * Reset game state for a new fight
   */
  resetFight() {
    this.hazards = [];
    this.playerProjectiles = [];
    this.remoteProjectiles = [];
    this.abilityEffects = [];
    this.remoteAbilityEffects = [];
    this.particles = [];
    this.condimentBosses = [];
    this.mazeState = null;
    this.fightStartedAt = performance.now();
    this.screenBanner = null;
  }
  
  /**
   * Clear all entities and reset completely
   */
  resetAll() {
    this.resetFight();
    this.player = null;
    this.boss = null;
    this.trainingDummy = null;
    this.selectedBoss = null;
    this.camera.x = 0;
    this.camera.y = 0;
  }
  
  /**
   * Add a hazard to the game
   * @param {Object} hazard - The hazard object to add
   */
  addHazard(hazard) {
    this.hazards.push(hazard);
  }
  
  /**
   * Remove hazards matching a condition
   * @param {Function} predicate - Function that returns true for hazards to remove
   */
  removeHazards(predicate) {
    this.hazards = this.hazards.filter(h => !predicate(h));
  }
  
  /**
   * Add a projectile
   * @param {Object} projectile - The projectile to add
   * @param {boolean} isRemote - Whether this is from a remote player
   */
  addProjectile(projectile, isRemote = false) {
    if (isRemote) {
      this.remoteProjectiles.push(projectile);
    } else {
      this.playerProjectiles.push(projectile);
    }
  }
  
  /**
   * Remove projectiles matching a condition
   * @param {Function} predicate - Function that returns true for projectiles to remove
   * @param {boolean} isRemote - Whether to filter remote or local projectiles
   */
  removeProjectiles(predicate, isRemote = false) {
    const array = isRemote ? this.remoteProjectiles : this.playerProjectiles;
    const filtered = array.filter(p => !predicate(p));
    if (isRemote) {
      this.remoteProjectiles = filtered;
    } else {
      this.playerProjectiles = filtered;
    }
  }
  
  /**
   * Add a particle effect
   * @param {Object} particle - The particle to add
   */
  addParticle(particle) {
    this.particles.push(particle);
  }
  
  /**
   * Remove particles matching a condition
   * @param {Function} predicate - Function that returns true for particles to remove
   */
  removeParticles(predicate) {
    this.particles = this.particles.filter(p => !predicate(p));
  }
  
  /**
   * Update mouse position
   * @param {number} canvasX - X position on canvas
   * @param {number} canvasY - Y position on canvas
   */
  updateMousePosition(canvasX, canvasY) {
    this.mouseCanvas.x = canvasX;
    this.mouseCanvas.y = canvasY;
    this.mouseWorld.x = canvasX + this.camera.x;
    this.mouseWorld.y = canvasY + this.camera.y;
  }
  
  /**
   * Log a message to the game log
   * @param {string} message - Message to log
   */
  log(message) {
    this.logLines.push(message);
    // Keep only last 10 lines
    if (this.logLines.length > 10) {
      this.logLines.shift();
    }
  }
}

// Export singleton instance
export const gameState = new GameState();
