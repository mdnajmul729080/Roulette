/**
 * Vegas Roulette - State Machine
 * Manages game lifecycle and transitions cleanly
 */

export const GameStates = {
  IDLE: 'IDLE',
  BETTING: 'BETTING',
  SPINNING: 'SPINNING',
  EVALUATING: 'EVALUATING',
  WIN_CELEBRATION: 'WIN_CELEBRATION',
  GAME_OVER: 'GAME_OVER'
};

export class StateMachine {
  constructor(initialState = GameStates.IDLE) {
    this.currentState = initialState;
    this.previousState = null;
    this.listeners = new Map();
    this.stateChangeListeners = [];

    // Valid state transitions
    this.transitions = {
      [GameStates.IDLE]: [GameStates.BETTING, GameStates.SPINNING, GameStates.GAME_OVER],
      [GameStates.BETTING]: [GameStates.IDLE, GameStates.SPINNING, GameStates.GAME_OVER],
      [GameStates.SPINNING]: [GameStates.EVALUATING],
      [GameStates.EVALUATING]: [GameStates.WIN_CELEBRATION, GameStates.IDLE, GameStates.BETTING, GameStates.GAME_OVER],
      [GameStates.WIN_CELEBRATION]: [GameStates.IDLE, GameStates.BETTING, GameStates.GAME_OVER],
      [GameStates.GAME_OVER]: [GameStates.IDLE, GameStates.BETTING]
    };
  }

  /**
   * Get current active state
   */
  getState() {
    return this.currentState;
  }

  /**
   * Check if action is allowed in current state
   */
  canPlaceBet() {
    return this.currentState === GameStates.IDLE || this.currentState === GameStates.BETTING;
  }

  canSpin() {
    return this.currentState === GameStates.IDLE || this.currentState === GameStates.BETTING;
  }

  isSpinning() {
    return this.currentState === GameStates.SPINNING;
  }

  /**
   * Transition to next state if permitted
   */
  transition(newState, payload = {}) {
    if (this.currentState === newState) return true;

    const allowed = this.transitions[this.currentState] || [];
    if (!allowed.includes(newState)) {
      console.warn(`[StateMachine] Invalid state transition from ${this.currentState} to ${newState}`);
      return false;
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    // Trigger state change callbacks
    this.stateChangeListeners.forEach(fn => fn(this.currentState, this.previousState, payload));
    this.emit(this.currentState, payload);

    return true;
  }

  onStateChange(listener) {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(l => l !== listener);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error(`[StateMachine] Error in listener for event ${event}:`, err);
      }
    });
  }
}
