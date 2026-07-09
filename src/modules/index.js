/**
 * Module Index - Central export point for all game modules
 * 
 * This module provides a clean API for importing game functionality.
 * For detailed documentation, see README.md in this directory.
 */

// Core data and configuration
export * from './constants.js';

// Entity classes and factories
export * from './entities.js';

// Talent system
export * from './talents.js';

// Game state management
export { GameState, gameState } from './GameState.js';

// Combat system
export * from './combat.js';

// Boss AI system
export * from './bossAI.js';

// Input handling
export * from './input.js';

// Rendering system
export * from './rendering.js';
