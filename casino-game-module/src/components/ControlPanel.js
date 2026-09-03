/**
 * Vegas Roulette - ControlPanel Component
 * Main casino bottom command dock: Spin, Double, Rebet, Undo, Clear, and Auto-Play
 */

import { GameStates } from '../game-engine/StateMachine.js';

export class ControlPanel {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   * @param {Function} openAutoPlayModal
   */
  constructor(containerElement, engine, openAutoPlayModal) {
    this.container = containerElement;
    this.engine = engine;
    this.openAutoPlayModal = openAutoPlayModal;
    this.render();
    this.bindEvents();
    this.subscribeEngine();
    this.updateButtonStates();
  }

  render() {
    this.container.innerHTML = `
      <div class="action-controls" id="actionControls">
        <!-- Clear Bets -->
        <button class="btn-secondary" id="btnClearBets" title="Clear all placed bets">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Clear</span>
        </button>

        <!-- Undo Last Bet -->
        <button class="btn-secondary" id="btnUndoBet" title="Undo last placed chip">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 14L4 9l5-5"></path>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
          </svg>
          <span>Undo</span>
        </button>

        <!-- Double 2x -->
        <button class="btn-secondary" id="btnDoubleBet" title="Double all bets">
          <span style="font-weight:900;">2X</span>
          <span>Double</span>
        </button>

        <!-- Rebet Previous -->
        <button class="btn-secondary" id="btnRebet" title="Repeat last round's bets">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Rebet</span>
        </button>

        <!-- Auto Play -->
        <button class="btn-secondary" id="btnAutoPlay" title="Auto-Play Mode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          <span id="autoPlayLabel">Auto</span>
        </button>

        <!-- Main Big Spin Button -->
        <button class="btn-gold spin-btn-main" id="btnSpin" title="Spin Wheel">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span>SPIN</span>
        </button>
      </div>
    `;
  }

  bindEvents() {
    const btnSpin = document.getElementById('btnSpin');
    const btnClear = document.getElementById('btnClearBets');
    const btnDouble = document.getElementById('btnDoubleBet');
    const btnRebet = document.getElementById('btnRebet');
    const btnUndo = document.getElementById('btnUndoBet');
    const btnAuto = document.getElementById('btnAutoPlay');

    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        this.engine.spin();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.engine.clearBets();
      });
    }

    if (btnDouble) {
      btnDouble.addEventListener('click', () => {
        this.engine.doubleBets();
      });
    }

    if (btnRebet) {
      btnRebet.addEventListener('click', () => {
        this.engine.rebet();
      });
    }

    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        this.engine.undoBet();
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        if (this.engine.autoPlay.active) {
          this.engine.stopAutoPlay();
        } else if (this.openAutoPlayModal) {
          this.openAutoPlayModal();
        }
      });
    }
  }

  updateButtonStates() {
    const state = this.engine.stateMachine.getState();
    const isSpinning = state === GameStates.SPINNING;
    const hasBets = this.engine.getTotalBet() > 0;
    const hasPreviousBets = !!this.engine.previousBets && Object.keys(this.engine.previousBets).length > 0;
    const canUndo = this.engine.betHistoryStack.length > 0;

    const btnSpin = document.getElementById('btnSpin');
    const btnClear = document.getElementById('btnClearBets');
    const btnDouble = document.getElementById('btnDoubleBet');
    const btnRebet = document.getElementById('btnRebet');
    const btnUndo = document.getElementById('btnUndoBet');
    const btnAuto = document.getElementById('btnAutoPlay');
    const autoLabel = document.getElementById('autoPlayLabel');

    if (btnSpin) btnSpin.disabled = isSpinning || !hasBets;
    if (btnClear) btnClear.disabled = isSpinning || !hasBets;
    if (btnDouble) btnDouble.disabled = isSpinning || !hasBets;
    if (btnRebet) btnRebet.disabled = isSpinning || !hasPreviousBets;
    if (btnUndo) btnUndo.disabled = isSpinning || !canUndo;

    if (btnAuto && autoLabel) {
      if (this.engine.autoPlay.active) {
        btnAuto.classList.add('win-pulse');
        autoLabel.textContent = `Stop (${this.engine.autoPlay.remainingSpins})`;
      } else {
        btnAuto.classList.remove('win-pulse');
        autoLabel.textContent = 'Auto';
        btnAuto.disabled = isSpinning;
      }
    }
  }

  subscribeEngine() {
    this.engine.on('betPlaced', () => this.updateButtonStates());
    this.engine.on('betsCleared', () => this.updateButtonStates());
    this.engine.on('betsDoubled', () => this.updateButtonStates());
    this.engine.on('rebetApplied', () => this.updateButtonStates());
    this.engine.on('betUndone', () => this.updateButtonStates());
    this.engine.on('spinStarted', () => this.updateButtonStates());
    this.engine.on('roundComplete', () => this.updateButtonStates());
    this.engine.on('gameReset', () => this.updateButtonStates());
    this.engine.on('autoPlayStarted', () => this.updateButtonStates());
    this.engine.on('autoPlayProgress', () => this.updateButtonStates());
    this.engine.on('autoPlayStopped', () => this.updateButtonStates());
    this.engine.on('autoPlayFinished', () => this.updateButtonStates());
  }
}
