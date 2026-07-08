/**
 * Module Index - Central export point for all game modules
 */

// Core data and configuration
export * from './constants.js';

// Entity classes and factories
export * from './entities.js';

// Talent system
export * from './talents.js';

// Game state management
export { GameState, gameState } from './GameState.js';
