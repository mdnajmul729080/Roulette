/**
 * Vegas Roulette - Game Configuration
 * Standardized configuration for standalone and casino platform integration
 */

export const GAME_CONFIG = {
  id: 'vegas-roulette',
  title: 'Vegas Roulette',
  version: '2.0.0',
  type: 'AMERICAN_ROULETTE',
  currency: '$',
  initialBalance: 1000,
  minBet: 1,
  maxBet: 5000,
  maxTableBet: 25000,
  
  // Chip denominations available on the carousel
  chipDenominations: [
    { value: 1, color: '#f5f5f5', border: '#2563eb', label: '1', asset: '/main/chip images/casino-chip-1.png' },
    { value: 5, color: '#ef4444', border: '#ffffff', label: '5', asset: '/main/chip images/casino-chip-5.png' },
    { value: 10, color: '#3b82f6', border: '#ffffff', label: '10', asset: '/main/chip images/casino-chip-10.png' },
    { value: 25, color: '#10b981', border: '#ffffff', label: '25', asset: '/main/chip images/casino-chip-25.png' },
    { value: 50, color: '#8b5cf6', border: '#ffffff', label: '50', asset: '/main/chip images/casino-chip-50.png' },
    { value: 100, color: '#111827', border: '#d4af37', label: '100', asset: '/main/chip images/casino-chip-100.png' },
    { value: 500, color: '#d97706', border: '#fef08a', label: '500', asset: '/main/chip images/casino-chip-500.png' }
  ],

  // Roulette Wheel configuration (American 38 pockets)
  wheelNumbers: [
    '0', 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
    '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
  ],

  redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
  greenNumbers: ['0', '00'],

  // Timing (milliseconds)
  timing: {
    spinDuration: 4200,
    quickSpinDuration: 1800,
    winAnnouncementDuration: 2800,
    autoPlayDelay: 1200
  },

  // Audio settings
  audio: {
    defaultVolume: 0.7,
    soundEffectsEnabled: true,
    synthesizerEnabled: true
  }
};
