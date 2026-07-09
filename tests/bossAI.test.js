import { describe, it, expect } from 'vitest';
import { 
  createBossAI, 
  BossState,
  getBossPattern
} from '../src/modules/bossAI.js';
import { Boss } from '../src/modules/entities.js';

describe('Boss AI System', () => {
  describe('createBossAI', () => {
    it('should create a boss AI with initial state IDLE', () => {
      const boss = new Boss('test_boss', 400, 300, 'test_boss', 1000);
      const ai = createBossAI(boss);
      
      expect(ai).toBeDefined();
      expect(ai.currentState).toBe(BossState.IDLE);
    });

    it('should initialize with correct boss data', () => {
      const boss = new Boss('test_boss', 400, 300, 'test_boss', 1000);
      const ai = createBossAI(boss);
      
      expect(ai.boss).toEqual(boss);
    });
  });

  describe('getBossPattern', () => {
    it('should return a valid boss pattern', () => {
      const pattern = getBossPattern('flame_king');
      
      expect(pattern).toBeDefined();
      expect(pattern.id).toBe('flame_king');
      expect(pattern.movePattern).toBeDefined();
      expect(pattern.attackPattern).toBeDefined();
    });

    it('should handle undefined bossId', () => {
      const pattern = getBossPattern();
      
      expect(pattern).toBeDefined();
      expect(pattern.id).toBe('default');
    });
  });

  describe('Boss State Machine', () => {
    it('should have all expected states', () => {
      expect(BossState.IDLE).toBeDefined();
      expect(BossState.MOVING).toBeDefined();
      expect(BossState.ATTACKING).toBeDefined();
      expect(BossState.TRANSITIONING).toBeDefined();
      expect(BossState.ENRAGED).toBeDefined();
    });

    it('should have unique state values', () => {
      const states = Object.values(BossState);
      const uniqueStates = [...new Set(states)];
      expect(states.length).toBe(uniqueStates.length);
    });
  });
});
