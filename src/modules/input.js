/**
 * Input Handling Module
 * Manages keyboard, mouse, and touch input for player control
 */

import { GameState } from './GameState.js';

/**
 * Input state tracking
 */
export const InputState = {
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    ability1: false,
    ability2: false,
    ability3: false,
    ability4: false,
    potion: false,
    interact: false
  },
  mouse: {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
    leftDown: false,
    rightDown: false,
    insideCanvas: false
  },
  touch: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    tapDetected: false
  }
};

/**
 * Key mappings for different control schemes
 */
export const KeyMappings = {
  wasd: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    ability1: 'KeyQ',
    ability2: 'KeyE',
    ability3: 'KeyR',
    ability4: 'KeyF',
    potion: 'KeyP',
    interact: 'KeyI'
  },
  arrows: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    ability1: 'KeyZ',
    ability2: 'KeyX',
    ability3: 'KeyC',
    ability4: 'KeyV',
    potion: 'ShiftLeft',
    interact: 'Enter'
  }
};

let currentMapping = KeyMappings.wasd;
let keyListenersAttached = false;
let mouseListenersAttached = false;
let touchListenersAttached = false;

/**
 * Initialize input handlers
 * @param {HTMLCanvasElement} canvas - Game canvas
 * @param {Object} options - Configuration options
 */
export function initInput(canvas, options = {}) {
  if (options.keyMapping) {
    currentMapping = KeyMappings[options.keyMapping] || options.keyMapping;
  }
  
  attachKeyboardListeners();
  attachMouseListeners(canvas);
  
  // Touch controls for mobile
  if (options.enableTouch !== false) {
    attachTouchListeners(canvas);
  }
  
  return InputState;
}

/**
 * Attach keyboard event listeners
 */
function attachKeyboardListeners() {
  if (keyListenersAttached) return;
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  keyListenersAttached = true;
}

/**
 * Detach keyboard event listeners
 */
export function detachKeyboardListeners() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  keyListenersAttached = false;
}

/**
 * Handle key down events
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  const code = event.code;
  
  // Map key codes to input actions
  for (const [action, keyCode] of Object.entries(currentMapping)) {
    if (code === keyCode) {
      InputState.keys[action] = true;
      
      // Prevent default browser behavior for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        event.preventDefault();
      }
    }
  }
}

/**
 * Handle key up events
 * @param {KeyboardEvent} event
 */
function handleKeyUp(event) {
  const code = event.code;
  
  // Map key codes to input actions
  for (const [action, keyCode] of Object.entries(currentMapping)) {
    if (code === keyCode) {
      InputState.keys[action] = false;
    }
  }
}

/**
 * Attach mouse event listeners
 * @param {HTMLCanvasElement} canvas
 */
function attachMouseListeners(canvas) {
  if (mouseListenersAttached) return;
  
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('mouseenter', handleMouseEnter);
  
  mouseListenersAttached = true;
}

/**
 * Detach mouse event listeners
 */
export function detachMouseListeners() {
  const canvas = document.querySelector('#game');
  if (!canvas) return;
  
  canvas.removeEventListener('mousemove', handleMouseMove);
  canvas.removeEventListener('mousedown', handleMouseDown);
  canvas.removeEventListener('mouseup', handleMouseUp);
  canvas.removeEventListener('mouseleave', handleMouseLeave);
  canvas.removeEventListener('mouseenter', handleMouseEnter);
  mouseListenersAttached = false;
}

/**
 * Handle mouse move events
 * @param {MouseEvent} event
 */
function handleMouseMove(event) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  
  InputState.mouse.x = event.clientX - rect.left;
  InputState.mouse.y = event.clientY - rect.top;
  
  // Update world coordinates based on camera
  if (window.camera) {
    InputState.mouse.worldX = InputState.mouse.x + window.camera.x;
    InputState.mouse.worldY = InputState.mouse.y + window.camera.y;
  }
}

/**
 * Handle mouse down events
 * @param {MouseEvent} event
 */
function handleMouseDown(event) {
  if (event.button === 0) {
    InputState.mouse.leftDown = true;
  } else if (event.button === 2) {
    InputState.mouse.rightDown = true;
  }
}

/**
 * Handle mouse up events
 * @param {MouseEvent} event
 */
function handleMouseUp(event) {
  if (event.button === 0) {
    InputState.mouse.leftDown = false;
  } else if (event.button === 2) {
    InputState.mouse.rightDown = false;
  }
}

/**
 * Handle mouse leave events
 * @param {MouseEvent} event
 */
function handleMouseLeave(event) {
  InputState.mouse.insideCanvas = false;
}

/**
 * Handle mouse enter events
 * @param {MouseEvent} event
 */
function handleMouseEnter(event) {
  InputState.mouse.insideCanvas = true;
}

/**
 * Attach touch event listeners
 * @param {HTMLCanvasElement} canvas
 */
function attachTouchListeners(canvas) {
  if (touchListenersAttached) return;
  
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  touchListenersAttached = true;
}

/**
 * Detach touch event listeners
 */
export function detachTouchListeners() {
  const canvas = document.querySelector('#game');
  if (!canvas) return;
  
  canvas.removeEventListener('touchstart', handleTouchStart);
  canvas.removeEventListener('touchmove', handleTouchMove);
  canvas.removeEventListener('touchend', handleTouchEnd);
  touchListenersAttached = false;
}

/**
 * Handle touch start events
 * @param {TouchEvent} event
 */
function handleTouchStart(event) {
  event.preventDefault();
  
  const touch = event.touches[0];
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  
  InputState.touch.active = true;
  InputState.touch.startX = touch.clientX - rect.left;
  InputState.touch.startY = touch.clientY - rect.top;
  InputState.touch.currentX = InputState.touch.startX;
  InputState.touch.currentY = InputState.touch.startY;
  InputState.touch.tapDetected = true;
  
  // Map touch to mouse for compatibility
  InputState.mouse.x = InputState.touch.startX;
  InputState.mouse.y = InputState.touch.startY;
  InputState.mouse.leftDown = true;
  InputState.mouse.insideCanvas = true;
}

/**
 * Handle touch move events
 * @param {TouchEvent} event
 */
function handleTouchMove(event) {
  event.preventDefault();
  
  const touch = event.touches[0];
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  
  InputState.touch.currentX = touch.clientX - rect.left;
  InputState.touch.currentY = touch.clientY - rect.top;
  
  // Calculate movement delta for virtual joystick
  const deltaX = InputState.touch.currentX - InputState.touch.startX;
  const deltaY = InputState.touch.currentY - InputState.touch.startY;
  
  // Map to movement keys based on direction
  const threshold = 10;
  InputState.keys.up = deltaY < -threshold;
  InputState.keys.down = deltaY > threshold;
  InputState.keys.left = deltaX < -threshold;
  InputState.keys.right = deltaX > threshold;
  
  // Update mouse position
  InputState.mouse.x = InputState.touch.currentX;
  InputState.mouse.y = InputState.touch.currentY;
}

/**
 * Handle touch end events
 * @param {TouchEvent} event
 */
function handleTouchEnd(event) {
  event.preventDefault();
  
  InputState.touch.active = false;
  InputState.mouse.leftDown = false;
  
  // Reset movement keys
  InputState.keys.up = false;
  InputState.keys.down = false;
  InputState.keys.left = false;
  InputState.keys.right = false;
}

/**
 * Get movement direction vector
 * @returns {Object} Normalized direction vector
 */
export function getMovementDirection() {
  let dx = 0;
  let dy = 0;
  
  if (InputState.keys.left) dx -= 1;
  if (InputState.keys.right) dx += 1;
  if (InputState.keys.up) dy -= 1;
  if (InputState.keys.down) dy += 1;
  
  // Normalize diagonal movement
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length > 0) {
    dx /= length;
    dy /= length;
  }
  
  return { x: dx, y: dy };
}

/**
 * Check if ability key is pressed
 * @param {number} slot - Ability slot (1-4)
 * @returns {boolean}
 */
export function isAbilityPressed(slot) {
  const abilityKeys = ['ability1', 'ability2', 'ability3', 'ability4'];
  const key = abilityKeys[slot - 1];
  return InputState.keys[key];
}

/**
 * Check if ability key was just pressed (edge detection)
 * @param {number} slot - Ability slot (1-4)
 * @param {Set} processedKeys - Set of already processed keys
 * @returns {boolean}
 */
export function isAbilityJustPressed(slot, processedKeys) {
  const abilityKeys = ['ability1', 'ability2', 'ability3', 'ability4'];
  const key = abilityKeys[slot - 1];
  
  if (InputState.keys[key] && !processedKeys.has(key)) {
    processedKeys.add(key);
    return true;
  }
  
  if (!InputState.keys[key]) {
    processedKeys.delete(key);
  }
  
  return false;
}

/**
 * Check if potion key is pressed
 * @returns {boolean}
 */
export function isPotionPressed() {
  return InputState.keys.potion;
}

/**
 * Check if potion key was just pressed
 * @param {Set} processedKeys - Set of already processed keys
 * @returns {boolean}
 */
export function isPotionJustPressed(processedKeys) {
  const key = 'potion';
  
  if (InputState.keys[key] && !processedKeys.has(key)) {
    processedKeys.add(key);
    return true;
  }
  
  if (!InputState.keys[key]) {
    processedKeys.delete(key);
  }
  
  return false;
}

/**
 * Reset all input states
 */
export function resetInput() {
  // Reset keys
  for (const key in InputState.keys) {
    InputState.keys[key] = false;
  }
  
  // Reset mouse
  InputState.mouse.leftDown = false;
  InputState.mouse.rightDown = false;
  InputState.mouse.insideCanvas = false;
  
  // Reset touch
  InputState.touch.active = false;
  InputState.touch.tapDetected = false;
}

/**
 * Change key mapping scheme
 * @param {string|Object} mapping - Mapping name or custom mapping object
 */
export function setKeyMapping(mapping) {
  if (typeof mapping === 'string') {
    currentMapping = KeyMappings[mapping];
  } else {
    currentMapping = mapping;
  }
}

/**
 * Get current key mapping
 * @returns {Object} Current key mapping
 */
export function getKeyMapping() {
  return currentMapping;
}

/**
 * Update mouse world coordinates based on camera
 * @param {Object} camera - Camera object with x, y properties
 */
export function updateMouseWorldCoords(camera) {
  if (camera) {
    InputState.mouse.worldX = InputState.mouse.x + camera.x;
    InputState.mouse.worldY = InputState.mouse.y + camera.y;
  }
}

export default {
  initInput,
  detachKeyboardListeners,
  detachMouseListeners,
  detachTouchListeners,
  getMovementDirection,
  isAbilityPressed,
  isAbilityJustPressed,
  isPotionPressed,
  isPotionJustPressed,
  resetInput,
  setKeyMapping,
  getKeyMapping,
  updateMouseWorldCoords,
  InputState,
  KeyMappings
};
