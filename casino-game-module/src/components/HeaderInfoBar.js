/**
 * Vegas Roulette - HeaderInfoBar Component
 * Displays live HUD meters (Balance, Total Bet, Win) and quick utility actions.
 */

export class HeaderInfoBar {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   * @param {Object} modalCallbacks { openStats, openSettings }
   */
  constructor(containerElement, engine, modalCallbacks = {}) {
    this.container = containerElement;
    this.engine = engine;
    this.modalCallbacks = modalCallbacks;
    this.lastWinAmount = 0;
    this.render();
    this.bindEvents();
    this.subscribeEngine();
    this.updateMeters();
  }

  render() {
    this.container.innerHTML = `
      <header class="game-header" id="gameHeader">
        <div class="header-top-row">
          <!-- Brand identity -->
          <div class="brand-section">
            <img src="/main/assets/705363.png" alt="Vegas Roulette" class="brand-logo" />
            <div>
              <div class="brand-title font-display">VEGAS ROULETTE</div>
              <div class="brand-badge">American Table</div>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="header-actions">
            <button class="btn-icon" id="btnStats" title="Statistics & Trends">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </button>

            <button class="btn-icon" id="btnAudioToggle" title="Toggle Sound">
              <svg id="iconVolumeOn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg id="iconVolumeMute" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>

            <button class="btn-icon" id="btnSettings" title="Game Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            <button class="btn-icon" id="btnFullscreen" title="Toggle Fullscreen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- HUD Meters -->
        <div class="hud-meters">
          <div class="meter-card" id="meterCardBalance">
            <span class="meter-label">Balance</span>
            <span class="meter-value gold" id="hudBalanceVal">$1,000</span>
          </div>

          <div class="meter-card" id="meterCardBet">
            <span class="meter-label">Total Bet</span>
            <span class="meter-value" id="hudBetVal">$0</span>
          </div>

          <div class="meter-card" id="meterCardWin">
            <span class="meter-label">Win</span>
            <span class="meter-value green" id="hudWinVal">$0</span>
          </div>
        </div>
      </header>
    `;
  }

  bindEvents() {
    const btnAudio = document.getElementById('btnAudioToggle');
    const btnStats = document.getElementById('btnStats');
    const btnSettings = document.getElementById('btnSettings');
    const btnFullscreen = document.getElementById('btnFullscreen');

    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = this.engine.audio.toggleMute();
        this.updateAudioIcons(isMuted);
      });
    }

    if (btnStats && this.modalCallbacks.openStats) {
      btnStats.addEventListener('click', () => this.modalCallbacks.openStats());
    }

    if (btnSettings && this.modalCallbacks.openSettings) {
      btnSettings.addEventListener('click', () => this.modalCallbacks.openSettings());
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    this.updateAudioIcons(this.engine.audio.muted);
  }

  updateAudioIcons(isMuted) {
    const onIcon = document.getElementById('iconVolumeOn');
    const muteIcon = document.getElementById('iconVolumeMute');
    if (onIcon && muteIcon) {
      onIcon.style.display = isMuted ? 'none' : 'block';
      muteIcon.style.display = isMuted ? 'block' : 'none';
    }
  }

  updateMeters() {
    const elBal = document.getElementById('hudBalanceVal');
    const elBet = document.getElementById('hudBetVal');
    const elWin = document.getElementById('hudWinVal');

    if (elBal) elBal.textContent = this.engine.wallet.getFormattedBalance();
    if (elBet) elBet.textContent = `$${this.engine.getTotalBet().toLocaleString()}`;
    if (elWin) elWin.textContent = `$${this.lastWinAmount.toLocaleString()}`;
  }

  subscribeEngine() {
    this.engine.wallet.onBalanceChange(() => this.updateMeters());
    this.engine.on('betPlaced', () => this.updateMeters());
    this.engine.on('betsCleared', () => this.updateMeters());
    this.engine.on('betsDoubled', () => this.updateMeters());
    this.engine.on('rebetApplied', () => this.updateMeters());
    this.engine.on('betUndone', () => this.updateMeters());
    this.engine.on('spinStarted', () => this.updateMeters());
    this.engine.on('roundComplete', (summary) => {
      this.lastWinAmount = summary.totalWon;
      this.updateMeters();
    });
    this.engine.on('gameReset', () => {
      this.lastWinAmount = 0;
      this.updateMeters();
    });
  }
}
