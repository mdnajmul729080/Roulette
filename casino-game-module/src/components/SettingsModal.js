/**
 * Vegas Roulette - SettingsModal Component
 * User preferences for audio, fast spin mode, and bankroll reload.
 */

export class SettingsModal {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.render();
    this.bindEvents();
  }

  render() {
    const isMuted = this.engine.audio.muted;
    const volume = Math.round(this.engine.audio.volume * 100);
    const isFast = this.engine.fastSpin;

    this.container.innerHTML = `
      <div class="modal-backdrop" id="settingsModalBackdrop">
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title font-display">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Game Settings</span>
            </div>
            <button class="modal-close-btn" id="btnSettingsClose">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Sound Effects Toggle -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Sound Effects</span>
                <span class="setting-desc">Chips, wheel clicks, and winning fanfares</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="chkSettingSound" ${!isMuted ? 'checked' : ''} />
                <span class="slider-track"></span>
              </label>
            </div>

            <!-- Volume Slider -->
            <div class="setting-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
              <div style="display:flex; justify-content:space-between; width:100%;">
                <span class="setting-title">Master Volume</span>
                <span class="setting-title" id="valSettingVolume" style="color:var(--gold-400);">${volume}%</span>
              </div>
              <input type="range" min="0" max="100" value="${volume}" id="rangeSettingVolume" style="width:100%; accent-color:var(--gold-500); cursor:pointer;" />
            </div>

            <!-- Fast Spin Toggle -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Fast Spin (Turbo)</span>
                <span class="setting-desc">Speed up wheel animation to 1.8 seconds</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="chkSettingFastSpin" ${isFast ? 'checked' : ''} />
                <span class="slider-track"></span>
              </label>
            </div>

            <!-- Reload / Reset Bankroll -->
            <div style="margin-top:10px;">
              <div class="setting-title" style="margin-bottom:6px;">Reload Demo Bankroll</div>
              <div style="display:flex; gap:8px;">
                <button class="btn-secondary" style="flex:1;" id="btnReload1k">$1,000</button>
                <button class="btn-secondary" style="flex:1;" id="btnReload5k">$5,000</button>
                <button class="btn-secondary" style="flex:1;" id="btnReload10k">$10,000</button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-gold" id="btnSettingsDone">Done</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = document.getElementById('settingsModalBackdrop');
    const btnClose = document.getElementById('btnSettingsClose');
    const btnDone = document.getElementById('btnSettingsDone');

    const chkSound = document.getElementById('chkSettingSound');
    const rangeVol = document.getElementById('rangeSettingVolume');
    const valVol = document.getElementById('valSettingVolume');
    const chkFast = document.getElementById('chkSettingFastSpin');

    const btn1k = document.getElementById('btnReload1k');
    const btn5k = document.getElementById('btnReload5k');
    const btn10k = document.getElementById('btnReload10k');

    if (btnClose) btnClose.addEventListener('click', () => this.close());
    if (btnDone) btnDone.addEventListener('click', () => this.close());
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }

    if (chkSound) {
      chkSound.addEventListener('change', (e) => {
        this.engine.audio.setMuted(!e.target.checked);
      });
    }

    if (rangeVol && valVol) {
      rangeVol.addEventListener('input', (e) => {
        const v = parseInt(e.target.value, 10);
        valVol.textContent = `${v}%`;
        this.engine.audio.setVolume(v / 100);
      });
    }

    if (chkFast) {
      chkFast.addEventListener('change', (e) => {
        this.engine.fastSpin = e.target.checked;
      });
    }

    const handleReload = (amt) => {
      this.engine.wallet.reset(amt);
      this.close();
    };

    if (btn1k) btn1k.addEventListener('click', () => handleReload(1000));
    if (btn5k) btn5k.addEventListener('click', () => handleReload(5000));
    if (btn10k) btn10k.addEventListener('click', () => handleReload(10000));
  }

  open() {
    const backdrop = document.getElementById('settingsModalBackdrop');
    if (backdrop) backdrop.classList.add('open');
  }

  close() {
    const backdrop = document.getElementById('settingsModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }
}
