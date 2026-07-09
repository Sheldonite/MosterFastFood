/**
 * Rendering System Module
 * Handles all canvas rendering operations for the game
 */

import { GameState } from './GameState.js';
import { generatedArtImage, drawGeneratedArt, clamp } from './constants.js';

/**
 * Render configuration
 */
export const RenderConfig = {
  showHitboxes: false,
  showDamageNumbers: true,
  particleLimit: 500,
  fpsTarget: 60
};

/**
 * Main render function
 * @param {HTMLCanvasElement} canvas - Game canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {GameState} gameState - Current game state
 * @param {Object} camera - Camera object
 */
export function render(canvas, ctx, gameState, camera) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply camera transform
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  
  // Render world layers
  renderBackground(ctx, gameState);
  renderHazards(ctx, gameState);
  renderEntities(ctx, gameState);
  renderProjectiles(ctx, gameState);
  renderAbilityEffects(ctx, gameState);
  renderParticles(ctx, gameState);
  renderUIElements(ctx, gameState);
  
  // Restore camera transform
  ctx.restore();
  
  // Render HUD (not affected by camera)
  renderHUD(ctx, gameState);
}

/**
 * Render background
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderBackground(ctx, gameState) {
  const { world } = gameState;
  
  // Draw arena floor
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(world.arena.x, world.arena.y, world.arena.width, world.arena.height);
  
  // Draw grid pattern
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  const gridSize = 50;
  
  for (let x = world.arena.x; x < world.arena.x + world.arena.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, world.arena.y);
    ctx.lineTo(x, world.arena.y + world.arena.height);
    ctx.stroke();
  }
  
  for (let y = world.arena.y; y < world.arena.y + world.arena.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(world.arena.x, y);
    ctx.lineTo(world.arena.x + world.arena.width, y);
    ctx.stroke();
  }
  
  // Draw walls
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(world.wall, world.wall, world.width - world.wall * 2, world.height - world.wall * 2);
  
  // Draw starter area
  if (gameState.starterArea) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(
      gameState.starterArea.x,
      gameState.starterArea.y,
      gameState.starterArea.width,
      gameState.starterArea.height
    );
  }
}

/**
 * Render hazards
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderHazards(ctx, gameState) {
  for (const hazard of gameState.hazards) {
    ctx.save();
    
    // Draw hazard area
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = hazard.color || '#ff4444';
    
    if (hazard.radius) {
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      ctx.globalAlpha = pulse * 0.4;
      ctx.strokeStyle = hazard.color || '#ff4444';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (hazard.width && hazard.height) {
      ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
    }
    
    ctx.restore();
  }
}

/**
 * Render all entities (players, bosses, enemies)
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderEntities(ctx, gameState) {
  // Render players
  for (const player of gameState.players) {
    renderPlayer(ctx, player);
  }
  
  // Render boss
  if (gameState.boss) {
    renderBoss(ctx, gameState.boss);
  }
  
  // Render other enemies
  for (const enemy of gameState.enemies) {
    renderEnemy(ctx, enemy);
  }
}

/**
 * Render player entity
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} player - Player entity
 */
function renderPlayer(ctx, player) {
  ctx.save();
  
  // Apply transformations
  ctx.translate(player.x, player.y);
  if (player.rotation) {
    ctx.rotate(player.rotation);
  }
  
  // Draw player sprite or shape
  if (player.sprite) {
    drawGeneratedArt(ctx, player.sprite, {
      centered: true,
      alpha: player.invulnerable ? 0.5 : 1
    });
  } else {
    // Fallback: draw colored circle
    ctx.beginPath();
    ctx.arc(0, 0, player.radius || 20, 0, Math.PI * 2);
    ctx.fillStyle = player.color || '#4a9eff';
    ctx.fill();
    
    // Class indicator
    ctx.fillStyle = getClassColor(player.class);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw shield/barrier effect
  if (player.shield > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  // Draw invulnerability effect
  if (player.invulnerable) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Draw hitbox if debug mode
  if (RenderConfig.showHitboxes) {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(-player.radius, -player.radius, player.radius * 2, player.radius * 2);
  }
  
  ctx.restore();
}

/**
 * Get color for player class
 * @param {string} className - Class name
 * @returns {string} Color hex code
 */
function getClassColor(className) {
  const colors = {
    warrior: '#c44',
    ranger: '#4c4',
    mage: '#44c',
    rogue: '#cc4',
    paladin: '#c4c',
    bard: '#4cc'
  };
  return colors[className] || '#888';
}

/**
 * Render boss entity
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} boss - Boss entity
 */
function renderBoss(ctx, boss) {
  ctx.save();
  
  ctx.translate(boss.x, boss.y);
  
  // Draw boss sprite or shape
  if (boss.sprite) {
    drawGeneratedArt(ctx, boss.sprite, {
      centered: true,
      cols: boss.cols || 4,
      rows: boss.rows || 4,
      col: boss.frame || 0,
      row: boss.currentPhase || 0
    });
  } else {
    // Fallback: draw large rectangle
    const w = boss.width || 120;
    const h = boss.height || 120;
    
    ctx.fillStyle = boss.color || '#aa4444';
    ctx.fillRect(-w/2, -h/2, w, h);
    
    // Phase indicator border
    ctx.strokeStyle = getPhaseColor(boss.currentPhase);
    ctx.lineWidth = 4;
    ctx.strokeRect(-w/2, -h/2, w, h);
  }
  
  // Draw enrage effect
  if (boss.enraged) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(boss.width, boss.height), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw hitbox if debug mode
  if (RenderConfig.showHitboxes) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    const w = boss.width || 120;
    const h = boss.height || 120;
    ctx.strokeRect(-w/2, -h/2, w, h);
  }
  
  ctx.restore();
}

/**
 * Get color for boss phase
 * @param {number} phase - Phase number
 * @returns {string} Color hex code
 */
function getPhaseColor(phase) {
  const colors = ['#aa4444', '#cc6644', '#ee8844', '#ffaa44'];
  return colors[phase] || colors[0];
}

/**
 * Render enemy entity
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} enemy - Enemy entity
 */
function renderEnemy(ctx, enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  
  // Simple enemy rendering
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius || 15, 0, Math.PI * 2);
  ctx.fillStyle = enemy.color || '#888';
  ctx.fill();
  
  ctx.restore();
}

/**
 * Render projectiles
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderProjectiles(ctx, gameState) {
  // Render local projectiles
  for (const proj of gameState.projectiles) {
    renderProjectile(ctx, proj);
  }
  
  // Render remote projectiles
  for (const proj of gameState.remoteProjectiles) {
    renderProjectile(ctx, proj, true);
  }
}

/**
 * Render single projectile
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} proj - Projectile entity
 * @param {boolean} isRemote - Is this a remote projectile
 */
function renderProjectile(ctx, proj, isRemote = false) {
  ctx.save();
  ctx.translate(proj.x, proj.y);
  
  // Rotate to face direction
  const angle = Math.atan2(proj.vy, proj.vx);
  ctx.rotate(angle);
  
  // Draw projectile
  if (proj.type === 'arrow') {
    // Arrow shape
    ctx.fillStyle = proj.color || '#ffd700';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-5, -3);
    ctx.lineTo(-5, 3);
    ctx.closePath();
    ctx.fill();
  } else if (proj.type === 'fireball') {
    // Fireball with glow
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 10;
    ctx.fillStyle = proj.color || '#ff8800';
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius || 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic projectile
    ctx.fillStyle = proj.color || '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius || 6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Homing indicator
  if (proj.homing) {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Render ability effects
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderAbilityEffects(ctx, gameState) {
  for (const effect of gameState.abilityEffects) {
    renderAbilityEffect(ctx, effect);
  }
  
  for (const effect of gameState.remoteAbilityEffects) {
    renderAbilityEffect(ctx, effect);
  }
}

/**
 * Render single ability effect
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} effect - Ability effect
 */
function renderAbilityEffect(ctx, effect) {
  ctx.save();
  
  switch (effect.type) {
    case 'dash':
      // Draw dash trail
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.arc(effect.owner.x, effect.owner.y, 25, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'area':
      // Draw area indicator
      if (effect.hazards) {
        for (const hazard of effect.hazards) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#ff4444';
          ctx.beginPath();
          ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'buff':
      // Draw buff icon around player
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.owner.x, effect.owner.y, 30, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  
  ctx.restore();
}

/**
 * Render particles
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderParticles(ctx, gameState) {
  // Limit particle count for performance
  const particles = gameState.particles.slice(0, RenderConfig.particleLimit);
  
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.alpha || 1;
    ctx.fillStyle = particle.color || '#ffffff';
    
    if (particle.size) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(particle.x, particle.y, 3, 3);
    }
    
    ctx.restore();
  }
}

/**
 * Render UI elements in world space
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderUIElements(ctx, gameState) {
  // Render health bars above entities
  for (const player of gameState.players) {
    renderHealthBar(ctx, player, player.hp, player.maxHp, player.x, player.y - 35);
  }
  
  if (gameState.boss) {
    renderHealthBar(
      ctx,
      gameState.boss,
      gameState.boss.hp,
      gameState.boss.maxHp,
      gameState.boss.x,
      gameState.boss.y - 50,
      200,
      20
    );
  }
  
  // Render damage numbers
  if (RenderConfig.showDamageNumbers) {
    renderDamageNumbers(ctx, gameState);
  }
}

/**
 * Render health bar
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} entity - Entity
 * @param {number} current - Current HP
 * @param {number} max - Max HP
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Bar width
 * @param {number} height - Bar height
 */
function renderHealthBar(ctx, entity, current, max, x, y, width = 100, height = 12) {
  ctx.save();
  ctx.translate(x, y);
  
  // Background
  ctx.fillStyle = '#333';
  ctx.fillRect(-width/2, 0, width, height);
  
  // Health fill
  const percent = Math.max(0, Math.min(1, current / max));
  const fillWidth = width * percent;
  
  // Color based on health percentage
  if (percent > 0.6) {
    ctx.fillStyle = '#44cc44';
  } else if (percent > 0.3) {
    ctx.fillStyle = '#cccc44';
  } else {
    ctx.fillStyle = '#cc4444';
  }
  
  ctx.fillRect(-width/2, 0, fillWidth, height);
  
  // Border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(-width/2, 0, width, height);
  
  ctx.restore();
}

/**
 * Render floating damage numbers
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderDamageNumbers(ctx, gameState) {
  const now = Date.now();
  
  for (let i = gameState.damageNumbers.length - 1; i >= 0; i--) {
    const num = gameState.damageNumbers[i];
    
    // Check if expired
    if (now - num.createdAt > num.duration * 1000) {
      gameState.damageNumbers.splice(i, 1);
      continue;
    }
    
    // Calculate position with upward drift
    const elapsed = (now - num.createdAt) / 1000;
    const y = num.y - elapsed * 50;
    const alpha = 1 - elapsed / num.duration;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = num.crit ? '#ffcc00' : (num.heal ? '#44ff44' : '#ffffff');
    ctx.font = num.crit ? 'bold 24px Arial' : '18px Arial';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    const text = num.crit ? `CRIT ${num.value}!` : num.value.toString();
    ctx.strokeText(text, num.x, y);
    ctx.fillText(text, num.x, y);
    
    ctx.restore();
  }
}

/**
 * Render HUD (heads-up display)
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} gameState
 */
function renderHUD(ctx, gameState) {
  // This would render fixed UI elements like ability bars, minimap, etc.
  // Implementation depends on specific HUD requirements
}

/**
 * Spawn damage number
 * @param {GameState} gameState
 * @param {number} value - Damage value
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} options - Additional options
 */
export function spawnDamageNumber(gameState, value, x, y, options = {}) {
  gameState.damageNumbers.push({
    value,
    x,
    y,
    createdAt: Date.now(),
    duration: options.duration || 1.5,
    crit: options.crit || false,
    heal: options.heal || false,
    color: options.color
  });
}

/**
 * Spawn particle effect
 * @param {GameState} gameState
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} options - Particle options
 */
export function spawnParticles(gameState, x, y, options = {}) {
  const count = options.count || 10;
  const color = options.color || '#ffffff';
  const speed = options.speed || 100;
  const size = options.size || 3;
  const lifetime = options.lifetime || 0.5;
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * speed;
    
    gameState.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color,
      size: Math.random() * size + 1,
      alpha: 1,
      createdAt: Date.now(),
      lifetime
    });
  }
}

/**
 * Update particles
 * @param {GameState} gameState
 * @param {number} dt - Delta time
 */
export function updateParticles(gameState, dt) {
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const particle = gameState.particles[i];
    
    // Update position
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    
    // Fade out
    const elapsed = (Date.now() - particle.createdAt) / 1000;
    particle.alpha = 1 - elapsed / particle.lifetime;
    
    // Remove if expired
    if (elapsed >= particle.lifetime) {
      gameState.particles.splice(i, 1);
    }
  }
}

/**
 * Toggle debug rendering
 * @param {boolean} enabled - Enable/disable debug mode
 */
export function toggleDebugMode(enabled) {
  RenderConfig.showHitboxes = enabled;
  RenderConfig.showDamageNumbers = enabled;
}

export default {
  render,
  renderPlayer,
  renderBoss,
  renderProjectiles,
  renderHazards,
  spawnDamageNumber,
  spawnParticles,
  updateParticles,
  toggleDebugMode,
  RenderConfig
};
