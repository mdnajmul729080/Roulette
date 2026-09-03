/**
 * Vegas Roulette - Core Game Engine
 * Standardized casino-grade lifecycle controller with external platform integration hooks
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { StateMachine, GameStates } from './StateMachine.js';
import { RouletteRules } from './RouletteRules.js';
import { AudioController } from './AudioController.js';
import { WalletService } from '../api/WalletService.js';
import { CasinoPlatformAdapter } from '../api/CasinoPlatformAdapter.js';

export class GameEngine {
  constructor(config = {}) {
    this.config = { ...GAME_CONFIG, ...config };
    this.stateMachine = new StateMachine(GameStates.IDLE);
    this.audio = new AudioController();
    this.wallet = new WalletService(this.config.initialBalance);
    this.platformAdapter = new CasinoPlatformAdapter(this.config.platform || {});

    // Active bets: { [spotId]: { amount: number, chips: number[] } }
    this.activeBets = {};
    this.previousBets = null;
    this.betHistoryStack = []; // For Undo functionality

    // Selected chip denomination
    this.selectedChip = this.config.chipDenominations[1] || this.config.chipDenominations[0]; // default $5

    // History of past spins
    this.spinHistory = [];
    this.roundCount = 0;

    // Autoplay configuration & state
    this.autoPlay = {
      active: false,
      remainingSpins: 0,
      initialBalance: 0,
      stopOnWinLimit: 0,
      stopOnLossLimit: 0,
      timer: null
    };

    // Fast spin toggle
    this.fastSpin = false;

    // References to UI components (set during initialize)
    this.wheelRenderer = null;
    this.eventListeners = new Map();

    this.loadPersistedHistory();
  }

  loadPersistedHistory() {
    try {
      const saved = localStorage.getItem('vr_spin_history');
      if (saved) {
        this.spinHistory = JSON.parse(saved);
      }
    } catch (e) {}

    // If empty, generate a realistic seed history
    if (this.spinHistory.length === 0) {
      const seedSamples = [17, 24, 0, 32, 11, 7, 28, 9, 36, 15, '00', 4, 21, 2, 25];
      this.spinHistory = seedSamples.map(n => ({
        number: String(n),
        color: RouletteRules.getNumberColor(n),
        timestamp: Date.now() - Math.floor(Math.random() * 100000)
      }));
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('vr_spin_history', JSON.stringify(this.spinHistory.slice(0, 30)));
    } catch (e) {}
  }

  /**
   * Primary Platform Hook: Initialize engine with configuration
   */
  initialize(options = {}) {
    if (options.platform) {
      this.platformAdapter = new CasinoPlatformAdapter(options.platform);
    }
    if (options.wheelCanvas) {
      // Lazy or passed wheel renderer will be attached
    }
    this.emit('initialized', { config: this.config });
    return this;
  }

  attachWheelRenderer(wheelRenderer) {
    this.wheelRenderer = wheelRenderer;
  }

  /**
   * Primary Platform Hook: Start / Resume game
   */
  start() {
    this.stateMachine.transition(GameStates.IDLE);
    this.emit('started', { balance: this.wallet.getBalance() });
  }

  /**
   * Select active chip value for betting
   */
  setSelectedChip(chip) {
    this.selectedChip = chip;
    this.emit('chipSelected', chip);
  }

  getSelectedChip() {
    return this.selectedChip;
  }

  /**
   * Total current bet across all spots
   */
  getTotalBet() {
    return Object.values(this.activeBets).reduce((sum, bet) => sum + bet.amount, 0);
  }

  /**
   * Primary Platform Hook: Place bet on a spot
   */
  placeBet(spotId, chipValue = null) {
    if (!this.stateMachine.canPlaceBet()) {
      this.emit('betRejected', { reason: 'INVALID_STATE', state: this.stateMachine.getState() });
      return false;
    }

    const value = chipValue || (this.selectedChip ? this.selectedChip.value : 5);
    const currentTotal = this.getTotalBet();

    // Check table limits
    if (currentTotal + value > this.config.maxTableBet) {
      this.emit('betRejected', { reason: 'MAX_TABLE_BET_EXCEEDED', max: this.config.maxTableBet });
      return false;
    }

    // Check wallet funds
    if (!this.wallet.hasSufficientFunds(currentTotal + value)) {
      this.emit('betRejected', { reason: 'INSUFFICIENT_FUNDS' });
      return false;
    }

    // Update or add spot
    if (!this.activeBets[spotId]) {
      this.activeBets[spotId] = { amount: 0, chips: [] };
    }
    this.activeBets[spotId].amount += value;
    this.activeBets[spotId].chips.push(value);

    // Record action for Undo
    this.betHistoryStack.push({ spotId, value });

    this.stateMachine.transition(GameStates.BETTING);
    this.audio.playChip();
    this.emit('betPlaced', { spotId, amount: this.activeBets[spotId].amount, totalBet: this.getTotalBet() });
    return true;
  }

  /**
   * Clear all placed bets
   */
  clearBets() {
    if (!this.stateMachine.canPlaceBet()) return;
    if (this.getTotalBet() === 0) return;

    this.activeBets = {};
    this.betHistoryStack = [];
    this.stateMachine.transition(GameStates.IDLE);
    this.audio.playClear();
    this.emit('betsCleared', { totalBet: 0 });
  }

  /**
   * Double all currently active bets
   */
  doubleBets() {
    if (!this.stateMachine.canPlaceBet()) return;
    const currentTotal = this.getTotalBet();
    if (currentTotal === 0) return;

    if (!this.wallet.hasSufficientFunds(currentTotal * 2)) {
      this.emit('betRejected', { reason: 'INSUFFICIENT_FUNDS' });
      return;
    }

    if (currentTotal * 2 > this.config.maxTableBet) {
      this.emit('betRejected', { reason: 'MAX_TABLE_BET_EXCEEDED' });
      return;
    }

    Object.keys(this.activeBets).forEach(spotId => {
      const spot = this.activeBets[spotId];
      const additional = spot.amount;
      spot.amount *= 2;
      spot.chips.push(...spot.chips);
      this.betHistoryStack.push({ spotId, value: additional, isDouble: true });
    });

    this.audio.playChip();
    this.emit('betsDoubled', { totalBet: this.getTotalBet(), bets: this.activeBets });
  }

  /**
   * Rebet previously placed bets from last round
   */
  rebet() {
    if (!this.stateMachine.canPlaceBet()) return;
    if (!this.previousBets || Object.keys(this.previousBets).length === 0) return;

    const previousTotal = Object.values(this.previousBets).reduce((s, b) => s + b.amount, 0);
    if (!this.wallet.hasSufficientFunds(previousTotal)) {
      this.emit('betRejected', { reason: 'INSUFFICIENT_FUNDS' });
      return;
    }

    this.activeBets = JSON.parse(JSON.stringify(this.previousBets));
    this.betHistoryStack = [];
    this.stateMachine.transition(GameStates.BETTING);
    this.audio.playChip();
    this.emit('rebetApplied', { totalBet: this.getTotalBet(), bets: this.activeBets });
  }

  /**
   * Undo last placed chip
   */
  undoBet() {
    if (!this.stateMachine.canPlaceBet() || this.betHistoryStack.length === 0) return;

    const lastAction = this.betHistoryStack.pop();
    const spot = this.activeBets[lastAction.spotId];
    if (spot) {
      spot.amount -= lastAction.value;
      const chipIdx = spot.chips.lastIndexOf(lastAction.value);
      if (chipIdx !== -1) spot.chips.splice(chipIdx, 1);

      if (spot.amount <= 0) {
        delete this.activeBets[lastAction.spotId];
      }
    }

    if (this.getTotalBet() === 0) {
      this.stateMachine.transition(GameStates.IDLE);
    }

    this.audio.playClear();
    this.emit('betUndone', { totalBet: this.getTotalBet(), bets: this.activeBets });
  }

  /**
   * Primary Platform Hook: Trigger Spin
   */
  async spin() {
    if (!this.stateMachine.canSpin()) return;
    const totalBet = this.getTotalBet();

    if (totalBet === 0) {
      this.emit('spinRejected', { reason: 'NO_BETS_PLACED' });
      return;
    }

    // Deduct bet from wallet
    const deducted = this.wallet.deduct(totalBet, 'SPIN_BET');
    if (!deducted) {
      this.emit('spinRejected', { reason: 'INSUFFICIENT_FUNDS' });
      return;
    }

    // Save previous bets for Rebet functionality
    this.previousBets = JSON.parse(JSON.stringify(this.activeBets));
    this.roundCount++;

    this.stateMachine.transition(GameStates.SPINNING);
    this.emit('spinStarted', { roundCount: this.roundCount, totalBet });

    // Request result from platform or local RNG
    try {
      const resultPayload = await this.platformAdapter.requestSpin({
        bets: this.activeBets,
        totalBet,
        roundCount: this.roundCount,
        clientTimestamp: Date.now()
      });

      this.receiveResult(resultPayload);
    } catch (err) {
      console.error('[GameEngine] Spin request failed:', err);
      // Fallback
      this.receiveResult({ number: '0', color: 'green' });
    }
  }

  /**
   * Primary Platform Hook: Receive result from RNG/Backend
   */
  receiveResult(resultPayload) {
    const winningNumber = String(resultPayload.number);
    this.emit('resultReceived', { winningNumber, resultPayload });
    this.playAnimation(winningNumber);
  }

  /**
   * Primary Platform Hook: Play wheel spin animation
   */
  playAnimation(winningNumber) {
    const duration = this.fastSpin ? this.config.timing.quickSpinDuration : this.config.timing.spinDuration;

    if (this.wheelRenderer) {
      this.wheelRenderer.spinTo(winningNumber, duration);
    } else {
      // Emulate timer if no canvas renderer attached
      setTimeout(() => {
        this.onBallLanded(winningNumber);
      }, duration);
    }
  }

  /**
   * Callback invoked when ball finishes physics settle into pocket
   */
  onBallLanded(winningNumber) {
    this.stateMachine.transition(GameStates.EVALUATING);
    this.emit('ballLanded', { winningNumber, color: RouletteRules.getNumberColor(winningNumber) });

    // Record in history
    const historyItem = {
      number: winningNumber,
      color: RouletteRules.getNumberColor(winningNumber),
      timestamp: Date.now()
    };
    this.spinHistory.unshift(historyItem);
    if (this.spinHistory.length > 50) this.spinHistory.pop();
    this.saveHistory();

    // Evaluate all active bets
    const roundSummary = RouletteRules.evaluateRound(winningNumber, this.activeBets);

    // Credit winnings to wallet if any
    if (roundSummary.totalWon > 0) {
      this.wallet.credit(roundSummary.totalWon, 'ROUND_WIN');
      this.audio.playWin();
    } else {
      this.audio.playLose();
    }

    this.showWin(roundSummary);
  }

  /**
   * Primary Platform Hook: Display Win / Lose outcome
   */
  showWin(roundSummary) {
    this.stateMachine.transition(GameStates.WIN_CELEBRATION, roundSummary);
    this.emit('roundComplete', roundSummary);

    // Platform report
    this.platformAdapter.reportRoundSummary(roundSummary);

    // Check AutoPlay loop
    if (this.autoPlay.active) {
      this.handleAutoPlayStep(roundSummary);
    } else {
      // Auto transition to IDLE / BETTING after celebratory delay
      setTimeout(() => {
        if (this.stateMachine.getState() === GameStates.WIN_CELEBRATION) {
          this.activeBets = {};
          this.betHistoryStack = [];
          if (this.wallet.getBalance() <= 0) {
            this.stateMachine.transition(GameStates.GAME_OVER);
            this.emit('gameOver');
          } else {
            this.stateMachine.transition(GameStates.IDLE);
          }
        }
      }, this.config.timing.winAnnouncementDuration);
    }
  }

  /**
   * AutoPlay Controller
   */
  startAutoPlay(options = { spins: 10, stopOnWin: 0, stopOnLoss: 0 }) {
    if (this.getTotalBet() === 0) {
      this.emit('spinRejected', { reason: 'NO_BETS_PLACED' });
      return;
    }
    this.autoPlay = {
      active: true,
      remainingSpins: options.spins || 10,
      initialBalance: this.wallet.getBalance(),
      stopOnWinLimit: options.stopOnWin || 0,
      stopOnLossLimit: options.stopOnLoss || 0,
      timer: null
    };
    this.emit('autoPlayStarted', this.autoPlay);
    this.spin();
  }

  stopAutoPlay() {
    this.autoPlay.active = false;
    this.autoPlay.remainingSpins = 0;
    if (this.autoPlay.timer) clearTimeout(this.autoPlay.timer);
    this.emit('autoPlayStopped');
  }

  handleAutoPlayStep(roundSummary) {
    this.autoPlay.remainingSpins--;

    const currentBalance = this.wallet.getBalance();
    const balanceDiff = currentBalance - this.autoPlay.initialBalance;

    // Check stop conditions
    let shouldStop = false;
    let stopReason = '';

    if (this.autoPlay.remainingSpins <= 0) {
      shouldStop = true;
      stopReason = 'Spins completed';
    } else if (this.autoPlay.stopOnWinLimit > 0 && roundSummary.netProfit >= this.autoPlay.stopOnWinLimit) {
      shouldStop = true;
      stopReason = `Single win exceeded $${this.autoPlay.stopOnWinLimit}`;
    } else if (this.autoPlay.stopOnLossLimit > 0 && balanceDiff <= -this.autoPlay.stopOnLossLimit) {
      shouldStop = true;
      stopReason = `Loss limit of $${this.autoPlay.stopOnLossLimit} reached`;
    } else if (!this.wallet.hasSufficientFunds(this.getTotalBet())) {
      shouldStop = true;
      stopReason = 'Insufficient funds for next bet';
    }

    if (shouldStop) {
      this.stopAutoPlay();
      this.emit('autoPlayFinished', { reason: stopReason });
      setTimeout(() => {
        this.stateMachine.transition(GameStates.IDLE);
      }, this.config.timing.winAnnouncementDuration);
    } else {
      this.emit('autoPlayProgress', { remainingSpins: this.autoPlay.remainingSpins });
      this.autoPlay.timer = setTimeout(() => {
        // Keep active bets or re-apply previous bets
        this.spin();
      }, this.config.timing.winAnnouncementDuration + this.config.timing.autoPlayDelay);
    }
  }

  /**
   * Primary Platform Hook: Reset game to initial state
   */
  reset() {
    this.stopAutoPlay();
    this.activeBets = {};
    this.previousBets = null;
    this.betHistoryStack = [];
    this.roundCount = 0;
    this.wallet.reset(this.config.initialBalance);
    this.stateMachine.transition(GameStates.IDLE);
    this.audio.playNewGame();
    this.emit('gameReset', { balance: this.wallet.getBalance() });
  }

  // Event bus methods
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.eventListeners.has(event)) return;
    const list = this.eventListeners.get(event).filter(h => h !== handler);
    this.eventListeners.set(event, list);
  }

  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    this.eventListeners.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error(`[GameEngine] Error in handler for event '${event}':`, e);
      }
    });
  }
}
