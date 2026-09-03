/**
 * Vegas Roulette - Casino Platform Adapter
 * Integrates with external casino host backends (REST or WebSocket)
 * Supports graceful fallback to internal cryptographic simulation.
 */

import { MockBackendRNG } from './MockBackendRNG.js';

export class CasinoPlatformAdapter {
  /**
   * @param {Object} config
   *   mode: 'standalone' | 'integrated'
   *   apiBaseUrl: string (e.g. '/api/roulette')
   *   authToken: string
   */
  constructor(config = {}) {
    this.mode = config.mode || 'standalone';
    this.apiBaseUrl = config.apiBaseUrl || '/api/roulette';
    this.authToken = config.authToken || null;
    this.onPlatformEvent = config.onPlatformEvent || null;
  }

  setMode(mode) {
    this.mode = mode;
  }

  /**
   * Request winning spin outcome from remote server or local cryptographic RNG
   * @param {Object} roundData { bets, totalBet, clientTimestamp }
   * @returns {Promise<Object>} { number, color, properties, roundId }
   */
  async requestSpin(roundData) {
    if (this.mode === 'integrated') {
      try {
        const response = await fetch(`${this.apiBaseUrl}/spin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify(roundData)
        });

        if (response.ok) {
          const data = await response.json();
          return {
            number: String(data.number),
            color: data.color,
            properties: data.properties,
            roundId: data.roundId || `rnd_${Date.now()}`,
            serverSeed: data.serverSeed
          };
        }
      } catch (err) {
        console.warn('[CasinoPlatformAdapter] Remote server RNG unreachable, falling back to local cryptographic engine:', err);
      }
    }

    // Standalone fallback: Cryptographic local generation
    const outcome = MockBackendRNG.generateOutcome();
    return {
      number: outcome.number,
      color: outcome.color,
      properties: outcome.properties,
      roundId: `local_${Date.now()}`,
      serverSeed: outcome.seed
    };
  }

  /**
   * Sync wallet balance with casino platform
   */
  async fetchWalletBalance() {
    if (this.mode === 'integrated') {
      try {
        const response = await fetch(`${this.apiBaseUrl}/wallet`, {
          headers: {
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          }
        });
        if (response.ok) {
          const data = await response.json();
          return data.balance;
        }
      } catch (e) {
        console.warn('[CasinoPlatformAdapter] Failed to fetch remote wallet balance:', e);
      }
    }
    return null;
  }

  /**
   * Report round summary to casino host analytics / transaction ledger
   */
  async reportRoundSummary(summary) {
    if (this.mode === 'integrated') {
      try {
        await fetch(`${this.apiBaseUrl}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(summary)
        });
      } catch (e) {}
    }
  }
}
