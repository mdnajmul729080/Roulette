/**
 * Vegas Roulette - AutoPlayModal Component
 * Configures automated rounds with stop-loss and stop-win safeguards
 */

export class AutoPlayModal {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.selectedSpins = 10;
    this.stopWin = 0;
    this.stopLoss = 0;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="autoPlayModalBackdrop">
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title font-display">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              <span>Auto-Play Settings</span>
            </div>
            <button class="modal-close-btn" id="btnAutoClose">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Number of Spins -->
            <div>
              <div class="stats-section-title">Number of Spins</div>
              <div style="display:flex; gap:8px; margin-top:6px;" id="autoSpinsGroup">
                <button class="btn-secondary auto-spin-opt active" data-spins="10" style="flex:1;">10</button>
                <button class="btn-secondary auto-spin-opt" data-spins="25" style="flex:1;">25</button>
                <button class="btn-secondary auto-spin-opt" data-spins="50" style="flex:1;">50</button>
                <button class="btn-secondary auto-spin-opt" data-spins="100" style="flex:1;">100</button>
              </div>
            </div>

            <!-- Stop on Single Win -->
            <div>
              <div class="stats-section-title">Stop if Single Win Exceeds ($)</div>
              <input type="number" id="inputStopWin" placeholder="0 (No limit)" min="0" step="50"
                     style="width:100%; padding:10px; background:rgba(0,0,0,0.5); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:#fff; font-size:1rem; margin-top:4px;" />
            </div>

            <!-- Stop on Loss -->
            <div>
              <div class="stats-section-title">Stop if Total Balance Decreases By ($)</div>
              <input type="number" id="inputStopLoss" placeholder="0 (No limit)" min="0" step="50"
                     style="width:100%; padding:10px; background:rgba(0,0,0,0.5); border:1px solid var(--border-subtle); border-radius:var(--radius-md); color:#fff; font-size:1rem; margin-top:4px;" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" id="btnAutoCancel">Cancel</button>
            <button class="btn-gold" id="btnStartAuto">Start Auto-Play</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = document.getElementById('autoPlayModalBackdrop');
    const btnClose = document.getElementById('btnAutoClose');
    const btnCancel = document.getElementById('btnAutoCancel');
    const btnStart = document.getElementById('btnStartAuto');
    const spinsGroup = document.getElementById('autoSpinsGroup');

    if (btnClose) btnClose.addEventListener('click', () => this.close());
    if (btnCancel) btnCancel.addEventListener('click', () => this.close());
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }

    if (spinsGroup) {
      spinsGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.auto-spin-opt');
        if (!btn) return;
        spinsGroup.querySelectorAll('.auto-spin-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSpins = parseInt(btn.getAttribute('data-spins'), 10) || 10;
      });
    }

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const winInput = document.getElementById('inputStopWin');
        const lossInput = document.getElementById('inputStopLoss');
        const stopOnWin = winInput ? parseFloat(winInput.value) || 0 : 0;
        const stopOnLoss = lossInput ? parseFloat(lossInput.value) || 0 : 0;

        this.close();
        this.engine.startAutoPlay({
          spins: this.selectedSpins,
          stopOnWin,
          stopOnLoss
        });
      });
    }
  }

  open() {
    const backdrop = document.getElementById('autoPlayModalBackdrop');
    if (backdrop) backdrop.classList.add('open');
  }

  close() {
    const backdrop = document.getElementById('autoPlayModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }
}
