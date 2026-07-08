# Game Modules

This directory contains the modularized game code, refactored from the monolithic `game.js` file.

## Module Structure

### Core Modules

- **`constants.js`** - All game configuration data, balance values, and static definitions
  - World dimensions and layout
  - Equipment (weapons, armor) stats
  - Class options and boss definitions
  - Combat tuning parameters
  - Ability loadouts
  - Maze themes and rewards
  - Boss ability damage definitions

- **`entities.js`** - Entity classes and factories
  - `Entity` - Base class with collision, damage, and movement
  - `Player` - Player character with class-specific properties
  - `Boss` - Boss entity with phase management
  - `Projectile` - Projectile entities for attacks
  - `Hazard` - Environmental hazards
  - Factory functions: `createPlayer()`, `createBoss()`, `createTrainingDummy()`

- **`talents.js`** - Talent system and progression
  - Talent path building utilities
  - Complete talent definitions for all classes
  - Talent lookup and filtering functions

- **`GameState.js`** - Centralized state management
  - `GameState` class encapsulating all game state
  - Singleton `gameState` instance
  - Methods for managing entities, projectiles, hazards
  - Multiplayer state tracking

### Planned Modules (To Be Extracted)

- **`combat.js`** - Combat system logic
  - Damage calculation
  - Attack resolution
  - Status effects
  
- **`bossAI.js`** - Boss behavior patterns
  - State machines for each boss
  - Attack pattern definitions
  - Phase transitions

- **`multiplayer.js`** - Network communication
  - WebSocket handling
  - State synchronization
  - Peer management

- **`rendering.js`** - Canvas rendering
  - Entity drawing
  - Particle effects
  - UI overlays

- **`input.js`** - Input handling
  - Keyboard/mouse events
  - Touch support
  - Input buffering

- **`audio.js`** - Sound management
  - SFX playback
  - Music control
  - Volume settings

- **`utils.js`** - Utility functions
  - Math helpers
  - Collision detection
  - Performance monitoring

## Usage

```javascript
// Import specific modules
import { GameState, createPlayer, createBoss } from './modules/index.js';
import { combatTuning, gear, classOptions } from './modules/constants.js';

// Or import everything
import * as Game from './modules/index.js';

// Create game state
const state = new GameState();
state.player = createPlayer(100, 450);
state.boss = createBoss('burger', 1000, 400);
```

## Migration Progress

The refactoring from monolithic `game.js` (17,676 lines) to modules is in progress:

- ✅ Constants extracted (400+ lines)
- ✅ Talent system extracted (300+ lines)  
- ✅ Entity classes created
- ✅ GameState class created
- ⏳ Combat system (pending)
- ⏳ Boss AI (pending)
- ⏳ Rendering (pending)
- ⏳ Input handling (pending)
- ⏳ Multiplayer networking (pending)

## Benefits

1. **Maintainability** - Smaller, focused files are easier to understand and modify
2. **Testability** - Isolated modules can be unit tested independently
3. **Performance** - Better code organization enables optimization opportunities
4. **Collaboration** - Multiple developers can work on different modules
5. **Type Safety Ready** - Modular structure prepares for TypeScript migration
