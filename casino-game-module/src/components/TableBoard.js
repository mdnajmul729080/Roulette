/**
 * Vegas Roulette - TableBoard Component
 * Renders authentic casino felt layout with straight, split, street, corner, and outside bets.
 */

import { RouletteRules } from '../game-engine/RouletteRules.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class TableBoard {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.render();
    this.bindEvents();
    this.subscribeEngine();
  }

  render() {
    this.container.innerHTML = `
      <div class="roulette-felt" id="rouletteFelt">
        <div class="felt-grid" id="feltGrid">
          <!-- 0 and 00 -->
          <div class="bet-cell green zero-cell-0" data-spot="num_0" id="spot-num-0">
            <span>0</span>
            <div class="chip-container" id="chip-num_0"></div>
          </div>
          <div class="bet-cell green zero-cell-00" data-spot="num_00" id="spot-num-00">
            <span>00</span>
            <div class="chip-container" id="chip-num_00"></div>
          </div>

          <!-- Numbers 1 to 36 -->
          ${this.renderNumbersGrid()}

          <!-- 2:1 Column Bets -->
          <div class="bet-cell col-bet-3" data-spot="col_3" id="spot-col-3">
            <span>2:1</span>
            <div class="chip-container" id="chip-col_3"></div>
          </div>
          <div class="bet-cell col-bet-2" data-spot="col_2" id="spot-col-2">
            <span>2:1</span>
            <div class="chip-container" id="chip-col_2"></div>
          </div>
          <div class="bet-cell col-bet-1" data-spot="col_1" id="spot-col-1">
            <span>2:1</span>
            <div class="chip-container" id="chip-col_1"></div>
          </div>

          <!-- Dozen Bets -->
          <div class="bet-cell dozen-cell-1" data-spot="dozen_1" id="spot-dozen-1">
            <span>1st 12</span>
            <div class="chip-container" id="chip-dozen_1"></div>
          </div>
          <div class="bet-cell dozen-cell-2" data-spot="dozen_2" id="spot-dozen-2">
            <span>2nd 12</span>
            <div class="chip-container" id="chip-dozen_2"></div>
          </div>
          <div class="bet-cell dozen-cell-3" data-spot="dozen_3" id="spot-dozen-3">
            <span>3rd 12</span>
            <div class="chip-container" id="chip-dozen_3"></div>
          </div>

          <!-- Even Money Bets -->
          <div class="bet-cell outside-low" data-spot="low_1_18" id="spot-low-1-18">
            <span>1 to 18</span>
            <div class="chip-container" id="chip-low_1_18"></div>
          </div>
          <div class="bet-cell outside-even" data-spot="even" id="spot-even">
            <span>EVEN</span>
            <div class="chip-container" id="chip-even"></div>
          </div>
          <div class="bet-cell outside-red" data-spot="red" id="spot-red">
            <span class="outside-label-diamond red"></span>
            <div class="chip-container" id="chip-red"></div>
          </div>
          <div class="bet-cell outside-black" data-spot="black" id="spot-black">
            <span class="outside-label-diamond black"></span>
            <div class="chip-container" id="chip-black"></div>
          </div>
          <div class="bet-cell outside-odd" data-spot="odd" id="spot-odd">
            <span>ODD</span>
            <div class="chip-container" id="chip-odd"></div>
          </div>
          <div class="bet-cell outside-high" data-spot="high_19_36" id="spot-high-19-36">
            <span>19 to 36</span>
            <div class="chip-container" id="chip-high_19_36"></div>
          </div>
        </div>

        <!-- Quick Split & Basket shortcuts bar -->
        <div class="splits-shortcuts-bar" style="display:flex; justify-content:space-between; margin-top:8px; gap:6px; flex-wrap:wrap;">
          <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; min-height:32px;" data-spot="top_line_basket" id="spot-top-line-basket">
            Basket (0, 00, 1-3)
            <span class="chip-badge" id="badge-top_line_basket"></span>
          </button>
          <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; min-height:32px;" data-spot="split_0_00" id="spot-split-0-00">
            Split 0 / 00
            <span class="chip-badge" id="badge-split_0_00"></span>
          </button>
        </div>

        <!-- Mobile Swipe Guide Indicator -->
        <div class="table-scroll-hint" id="tableScrollHint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>SWIPE BOARD FOR ALL NUMBERS</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `;
  }

  renderNumbersGrid() {
    let html = '';
    // Standard roulette grid columns: 12 columns (index 0 to 11, col 2 to 13)
    // Row 1 (top): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
    // Row 2 (mid): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
    // Row 3 (bot): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
    for (let c = 0; c < 12; c++) {
      const colNumber = c + 2; // CSS Grid column 2 to 13

      for (let r = 1; r <= 3; r++) {
        // Grid row 1 is number (c*3 + 3)
        // Grid row 2 is number (c*3 + 2)
        // Grid row 3 is number (c*3 + 1)
        const val = (3 - r + 1) + c * 3;
        const color = RouletteRules.getNumberColor(val);
        const spotId = `num_${val}`;

        html += `
          <div class="bet-cell ${color}" style="grid-column: ${colNumber}; grid-row: ${r};" data-spot="${spotId}" id="spot-num-${val}">
            <span>${val}</span>
            <div class="chip-container" id="chip-${spotId}"></div>
          </div>
        `;
      }
    }
    return html;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-spot]');
      if (!target) return;

      const spotId = target.getAttribute('data-spot');
      if (spotId) {
        this.engine.placeBet(spotId);
      }
    });

    // Fade scroll guide hint on mobile swipe
    this.container.addEventListener('scroll', () => {
      const hint = document.getElementById('tableScrollHint');
      if (hint && this.container.scrollLeft > 20) {
        hint.style.opacity = '0.3';
      } else if (hint) {
        hint.style.opacity = '1';
      }
    }, { passive: true });
  }

  subscribeEngine() {
    this.engine.on('betPlaced', () => this.updateChips());
    this.engine.on('betsCleared', () => this.updateChips());
    this.engine.on('betsDoubled', () => this.updateChips());
    this.engine.on('rebetApplied', () => this.updateChips());
    this.engine.on('betUndone', () => this.updateChips());
    this.engine.on('gameReset', () => this.updateChips());

    this.engine.on('ballLanded', (data) => {
      this.highlightWinningNumber(data.winningNumber);
    });

    this.engine.on('roundComplete', () => {
      setTimeout(() => {
        this.clearWinningHighlights();
        this.updateChips();
      }, this.engine.config.timing.winAnnouncementDuration);
    });
  }

  updateChips() {
    const activeBets = this.engine.activeBets;

    // Clear all existing chip badges
    this.container.querySelectorAll('.chip-container').forEach(el => {
      el.innerHTML = '';
    });
    this.container.querySelectorAll('.chip-badge').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Render new chip markers
    Object.entries(activeBets).forEach(([spotId, bet]) => {
      if (!bet || bet.amount <= 0) return;

      // Classify chip color based on highest denomination
      let chipClass = 'c5';
      if (bet.amount >= 500) chipClass = 'c500';
      else if (bet.amount >= 100) chipClass = 'c100';
      else if (bet.amount >= 50) chipClass = 'c50';
      else if (bet.amount >= 25) chipClass = 'c25';
      else if (bet.amount >= 10) chipClass = 'c10';
      else if (bet.amount >= 5) chipClass = 'c5';
      else chipClass = 'c1';

      const container = document.getElementById(`chip-${spotId}`);
      if (container) {
        const formatted = bet.amount >= 1000 ? `${(bet.amount / 1000).toFixed(1)}k` : bet.amount;
        container.innerHTML = `
          <div class="chip-stack-marker ${chipClass}">
            <span>${formatted}</span>
          </div>
        `;
      }

      const badge = document.getElementById(`badge-${spotId}`);
      if (badge) {
        badge.textContent = `$${bet.amount}`;
        badge.style.display = 'inline-block';
      }
    });
  }

  highlightWinningNumber(winningNum) {
    const cell = document.getElementById(`spot-num-${winningNum}`);
    if (cell) {
      cell.classList.add('win-pulse');
      cell.style.boxShadow = '0 0 25px #facc15';
      cell.style.borderColor = '#facc15';
    }
  }

  clearWinningHighlights() {
    this.container.querySelectorAll('.bet-cell').forEach(cell => {
      cell.classList.remove('win-pulse');
      cell.style.boxShadow = '';
      cell.style.borderColor = '';
    });
  }
}
