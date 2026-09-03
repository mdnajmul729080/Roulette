/**
 * Vegas Roulette - HistoryBar Component
 * Live horizontal ticker displaying recent winning numbers
 */

import { RouletteRules } from '../game-engine/RouletteRules.js';

export class HistoryBar {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   * @param {Function} onClick
   */
  constructor(containerElement, engine, onClick) {
    this.container = containerElement;
    this.engine = engine;
    this.onClick = onClick;
    this.render();
    this.bindEvents();
    this.subscribeEngine();
  }

  render() {
    const history = this.engine.spinHistory || [];

    this.container.innerHTML = `
      <div class="history-ribbon" id="historyRibbon" title="Click to view full statistics & trends">
        <span class="history-label">Last Spins</span>
        <div class="history-list" id="historyList">
          ${history.slice(0, 16).map(item => {
            const num = String(item.number !== undefined ? item.number : item);
            const color = item.color || RouletteRules.getNumberColor(num);
            return `
              <div class="history-pill ${color}">
                <span>${num}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener('click', () => {
      if (this.onClick) this.onClick();
    });
  }

  subscribeEngine() {
    this.engine.on('roundComplete', () => {
      this.render();
    });
  }
}
