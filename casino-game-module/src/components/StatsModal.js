/**
 * Vegas Roulette - StatsModal Component
 * Visualizes hot & cold numbers, red vs black, even vs odd, and dozen trends.
 */

import { RouletteRules } from '../game-engine/RouletteRules.js';

export class StatsModal {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.isOpen = false;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="statsModalBackdrop">
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title font-display">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              <span>Table Statistics & Trends</span>
            </div>
            <button class="modal-close-btn" id="btnStatsClose">&times;</button>
          </div>

          <div class="modal-body" id="statsModalContent">
            <!-- Dynamic stats content rendered on open -->
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" id="btnStatsDismiss">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = document.getElementById('statsModalBackdrop');
    const btnClose = document.getElementById('btnStatsClose');
    const btnDismiss = document.getElementById('btnStatsDismiss');

    if (btnClose) btnClose.addEventListener('click', () => this.close());
    if (btnDismiss) btnDismiss.addEventListener('click', () => this.close());

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }
  }

  open() {
    this.isOpen = true;
    this.updateStats();
    const backdrop = document.getElementById('statsModalBackdrop');
    if (backdrop) backdrop.classList.add('open');
  }

  close() {
    this.isOpen = false;
    const backdrop = document.getElementById('statsModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  updateStats() {
    const content = document.getElementById('statsModalContent');
    if (!content) return;

    const stats = RouletteRules.calculateStatistics(this.engine.spinHistory);
    const total = stats.totalSpins || 1;

    const redPct = Math.round((stats.redCount / total) * 100);
    const blackPct = Math.round((stats.blackCount / total) * 100);
    const greenPct = 100 - redPct - blackPct;

    const evenPct = Math.round((stats.evenCount / total) * 100);
    const oddPct = Math.round((stats.oddCount / total) * 100);

    content.innerHTML = `
      <!-- Hot Numbers -->
      <div>
        <div class="stats-section-title">Hot Numbers (Most Frequent)</div>
        <div class="stats-number-row">
          ${stats.hotNumbers.map(item => `
            <div class="stat-bubble">
              <span class="num ${item.color}">${item.number}</span>
              <div class="hits">${item.count} hits</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Cold Numbers -->
      <div>
        <div class="stats-section-title">Cold Numbers (Least Frequent)</div>
        <div class="stats-number-row">
          ${stats.coldNumbers.map(item => `
            <div class="stat-bubble">
              <span class="num ${item.color}">${item.number}</span>
              <div class="hits">${item.count} hits</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Red vs Black vs Green -->
      <div>
        <div class="stats-section-title" style="display:flex; justify-content:space-between;">
          <span>Color Distribution (${total} Spins)</span>
          <span>Red ${redPct}% / Black ${blackPct}%</span>
        </div>
        <div class="stats-progress-bar">
          <div class="bar-segment red" style="width: ${redPct}%;">${redPct > 8 ? redPct + '%' : ''}</div>
          <div class="bar-segment green" style="width: ${greenPct}%;">${greenPct > 5 ? greenPct + '%' : ''}</div>
          <div class="bar-segment black" style="width: ${blackPct}%;">${blackPct > 8 ? blackPct + '%' : ''}</div>
        </div>
      </div>

      <!-- Even vs Odd -->
      <div>
        <div class="stats-section-title" style="display:flex; justify-content:space-between;">
          <span>Parity</span>
          <span>Even ${evenPct}% / Odd ${oddPct}%</span>
        </div>
        <div class="stats-progress-bar">
          <div class="bar-segment even" style="width: ${evenPct}%;">${evenPct > 10 ? 'Even ' + evenPct + '%' : ''}</div>
          <div class="bar-segment odd" style="width: ${oddPct}%;">${oddPct > 10 ? 'Odd ' + oddPct + '%' : ''}</div>
        </div>
      </div>

      <!-- Dozen Breakdown -->
      <div>
        <div class="stats-section-title">Dozen Breakdown</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div class="stat-bubble">
            <div style="font-weight:700; font-size:0.85rem; color:#fff;">1st 12</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--gold-400); margin-top:2px;">
              ${Math.round((stats.dozenCounts.dozen1 / total) * 100)}%
            </div>
          </div>
          <div class="stat-bubble">
            <div style="font-weight:700; font-size:0.85rem; color:#fff;">2nd 12</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--gold-400); margin-top:2px;">
              ${Math.round((stats.dozenCounts.dozen2 / total) * 100)}%
            </div>
          </div>
          <div class="stat-bubble">
            <div style="font-weight:700; font-size:0.85rem; color:#fff;">3rd 12</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--gold-400); margin-top:2px;">
              ${Math.round((stats.dozenCounts.dozen3 / total) * 100)}%
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
