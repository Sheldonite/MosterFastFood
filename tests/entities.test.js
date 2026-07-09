import { describe, it, expect } from 'vitest';
import { 
  Entity, 
  Player, 
  Boss, 
  Projectile,
  createPlayer,
  createBoss,
  createTrainingDummy
} from '../src/modules/entities.js';

describe('Entity System', () => {
  describe('Entity Base Class', () => {
    it('should create an entity with basic properties', () => {
      const entity = new Entity(100, 200, 50, 30);
      
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
      expect(entity.width).toBe(50);
      expect(entity.height).toBe(30);
      expect(entity.health).toBe(100);
      expect(entity.maxHealth).toBe(100);
    });

    it('should detect collision between entities', () => {
      const entity1 = new Entity(0, 0, 50, 50);
      const entity2 = new Entity(40, 40, 50, 50); // Overlapping
      
      expect(entity1.collidesWith(entity2)).toBe(true);
    });

    it('should not detect collision when entities are far apart', () => {
      const entity1 = new Entity(0, 0, 50, 50);
      const entity2 = new Entity(200, 200, 50, 50);
      
      expect(entity1.collidesWith(entity2)).toBe(false);
    });

    it('should take damage and reduce health', () => {
      const entity = new Entity(0, 0, 50, 50, 100);
      
      entity.takeDamage(30);
      
      expect(entity.health).toBe(70);
    });

    it('should not go below 0 health', () => {
      const entity = new Entity(0, 0, 50, 50, 50);
      
      entity.takeDamage(100);
      
      expect(entity.health).toBe(0);
      expect(entity.isDead()).toBe(true);
    });

    it('should move entity by delta values', () => {
      const entity = new Entity(100, 100, 50, 50);
      
      entity.move(10, -20);
      
      expect(entity.x).toBe(110);
      expect(entity.y).toBe(80);
    });
  });

  describe('Player Entity', () => {
    it('should create a player with equipment slots', () => {
      const player = new Player(100, 100, 'warrior');
      
      expect(player.class).toBe('warrior');
      expect(player.equipment).toBeDefined();
      expect(player.equipment.weapon).toBeNull();
      expect(player.equipment.armor).toBeNull();
    });

    it('should equip items', () => {
      const player = new Player(100, 100, 'warrior');
      const weapon = { name: 'Sword', damage: 10 };
      
      player.equip('weapon', weapon);
      
      expect(player.equipment.weapon).toEqual(weapon);
    });

    it('should calculate total stats from equipment', () => {
      const player = new Player(100, 100, 'warrior');
      const weapon = { name: 'Sword', damage: 10, attackPower: 5 };
      const armor = { name: 'Shield', defense: 8 };
      
      player.equip('weapon', weapon);
      player.equip('armor', armor);
      
      const stats = player.getTotalStats();
      
      expect(stats.attackPower).toBeGreaterThanOrEqual(5);
      expect(stats.defense).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Boss Entity', () => {
    it('should create a boss with phases', () => {
      const boss = new Boss('test_boss', 400, 300, 'test_boss', 1000);
      
      expect(boss.bossType).toBe('test_boss');
      expect(boss.maxHealth).toBe(1000);
      expect(boss.health).toBe(1000);
      expect(boss.currentPhase).toBe(0);
    });

    it('should track phase transitions', () => {
      const boss = new Boss('test_boss', 400, 300, 'test_boss', 1000);
      
      boss.takeDamage(339); // 66.1% HP (still phase 0, just above threshold)
      expect(boss.currentPhase).toBe(0);
      
      boss.takeDamage(339); // ~32.2% HP - should trigger phase transitions
      expect(boss.currentPhase).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Projectile Entity', () => {
    it('should create a projectile with velocity', () => {
      const projectile = new Projectile(100, 100, 5, 3, 25, 3);
      
      expect(projectile.x).toBe(100);
      expect(projectile.y).toBe(100);
      expect(projectile.vx).toBe(5);
      expect(projectile.vy).toBe(3);
      expect(projectile.damage).toBe(25);
    });

    it('should update position based on velocity', () => {
      const projectile = new Projectile(100, 100, 10, 0, 25, 3);
      
      projectile.update(1); // Update with dt=1 second
      
      expect(projectile.x).toBe(110);
      expect(projectile.y).toBe(100);
    });

    it('should track lifetime', () => {
      const projectile = new Projectile(100, 100, 10, 0, 25, 1000);
      
      expect(projectile.lifetime).toBe(1000);
      expect(projectile.isAlive()).toBe(true);
    });
  });

  describe('Factory Functions', () => {
    it('should create a player using factory', () => {
      const player = createPlayer(100, 100, 'mage');
      
      expect(player instanceof Player).toBe(true);
      expect(player.class).toBe('mage');
    });

    it('should create a boss using factory', () => {
      const boss = createBoss('flame_king', 400, 300, 'flame_king');
      
      expect(boss instanceof Boss).toBe(true);
      expect(boss.bossType).toBe('flame_king');
    });

    it('should create a training dummy', () => {
      const dummy = createTrainingDummy(200, 200);
      
      expect(dummy instanceof Entity).toBe(true);
      expect(dummy.isStatic).toBe(true);
    });
  });
});
