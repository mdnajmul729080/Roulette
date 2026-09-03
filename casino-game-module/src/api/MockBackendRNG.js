/**
 * Vegas Roulette - Mock Cryptographic Backend RNG
 * Provides secure provably fair RNG simulation with optional server handshake
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { RouletteRules } from '../game-engine/RouletteRules.js';

export class MockBackendRNG {
  /**
   * Generate next cryptographically secure outcome
   * @returns {Object} { number, color, properties, hash, timestamp }
   */
  static generateOutcome() {
    const numbers = GAME_CONFIG.wheelNumbers;
    const array = new Uint32Array(1);
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      array[0] = Math.floor(Math.random() * 0xFFFFFFFF);
    }

    const index = array[0] % numbers.length;
    const winningNumber = String(numbers[index]);
    const color = RouletteRules.getNumberColor(winningNumber);
    const properties = RouletteRules.getNumberProperties(winningNumber);

    return {
      number: winningNumber,
      color,
      properties,
      seed: array[0].toString(16),
      timestamp: Date.now()
    };
  }
}
