import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateDamage, 
  calculateCritMultiplier, 
  applyDamageModifiers,
  validateDamageInput 
} from '../src/modules/combat.js';
import { COMBAT_CONSTANTS } from '../src/modules/constants.js';

describe('Combat System', () => {
  describe('calculateDamage', () => {
    it('should calculate base damage within weapon range', () => {
      const baseDamage = 15;
      const attacker = { damageMultiplier: 1.0 };
      const defender = { armor: 0 };
      
      const damage = calculateDamage(baseDamage, attacker, defender);
      
      expect(damage).toBeGreaterThanOrEqual(10);
      expect(damage).toBeLessThanOrEqual(40); // Allow for multipliers
    });

    it('should return minimum damage when defense is very high', () => {
      const baseDamage = 100;
      const attacker = { damageMultiplier: 1.0 };
      const defender = { armor: 1000 };
      
      const damage = calculateDamage(baseDamage, attacker, defender);
      
      expect(damage).toBeGreaterThanOrEqual(1); // Minimum 1 damage
    });

    it('should scale with attack power', () => {
      const baseDamage = 50;
      const defender = { armor: 0 };
      
      const lowMult = calculateDamage(baseDamage, { damageMultiplier: 1.0 }, defender);
      const highMult = calculateDamage(baseDamage, { damageMultiplier: 2.0 }, defender);
      
      expect(highMult).toBeGreaterThan(lowMult);
    });
  });

  describe('calculateCritMultiplier', () => {
    it('should return 1.0 for non-crit', () => {
      expect(calculateCritMultiplier(false, 0.5)).toBe(1.0);
    });

    it('should return crit multiplier for critical hit', () => {
      const critMultiplier = calculateCritMultiplier(true, 0.5);
      expect(critMultiplier).toBeGreaterThan(1.0);
      expect(critMultiplier).toBeLessThanOrEqual(3.0); // Reasonable cap
    });

    it('should increase with crit chance', () => {
      const lowCrit = calculateCritMultiplier(true, 0);
      const highCrit = calculateCritMultiplier(true, 1.0);
      expect(highCrit).toBeGreaterThan(lowCrit);
    });
  });

  describe('applyDamageModifiers', () => {
    it('should apply multiplicative modifiers correctly', () => {
      const baseDamage = 100;
      const modifiers = [
        { type: 'multiply', value: 1.5 },
        { type: 'multiply', value: 0.8 },
        { type: 'multiply', value: 1.2 }
      ];
      
      const result = applyDamageModifiers(baseDamage, modifiers);
      
      expect(result).toBeCloseTo(100 * 1.5 * 0.8 * 1.2, 0);
    });

    it('should handle empty modifiers array', () => {
      const baseDamage = 100;
      const result = applyDamageModifiers(baseDamage, []);
      expect(result).toBe(100);
    });

    it('should not allow negative damage', () => {
      const baseDamage = 100;
      const modifiers = [
        { type: 'multiply', value: 0.1 },
        { type: 'multiply', value: 0.1 },
        { type: 'multiply', value: 0.1 }
      ]; // Very heavy reduction
      
      const result = applyDamageModifiers(baseDamage, modifiers);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateDamageInput', () => {
    it('should accept valid damage values', () => {
      const result = validateDamageInput(500);
      expect(result.valid).toBe(true);
      expect(result.damage).toBe(500);
    });

    it('should reject negative damage', () => {
      const result = validateDamageInput(-100);
      expect(result.valid).toBe(false);
    });

    it('should reject damage exceeding maximum', () => {
      const result = validateDamageInput(15000, { maxDamage: 10000 });
      expect(result.valid).toBe(false);
    });

    it('should reject NaN values', () => {
      const result = validateDamageInput(NaN);
      expect(result.valid).toBe(false);
    });

    it('should reject infinity', () => {
      const result = validateDamageInput(Infinity);
      expect(result.valid).toBe(false);
    });

    it('should allow damage at exactly maximum', () => {
      const result = validateDamageInput(10000, { maxDamage: 10000 });
      expect(result.valid).toBe(true);
    });
  });
});
