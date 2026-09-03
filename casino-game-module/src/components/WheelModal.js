/**
 * Vegas Roulette - WheelModal & Stage Component
 * Embeds high-resolution wheel canvas and winning celebration banner
 */

import { WheelRenderer } from '../game-engine/WheelRenderer.js';
import { RouletteRules } from '../game-engine/RouletteRules.js';

export class WheelModal {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.wheelRenderer = null;
    this.render();
    this.initCanvas();
    this.subscribeEngine();
  }

  render() {
    this.container.innerHTML = `
      <div class="wheel-stage" id="wheelStage">
        <div class="wheel-frame">
          <canvas id="rouletteWheelCanvas" class="wheel-canvas"></canvas>
        </div>

        <!-- Win Celebration Banner Overlay -->
        <div class="win-overlay-banner" id="winCelebrationBanner">
          <div class="win-num-badge green" id="winBannerBadge">0</div>
          <div class="win-title-text font-display" id="winBannerTitle">WINNER!</div>
          <div class="win-amount-text" id="winBannerAmount">+$350</div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    const canvas = document.getElementById('rouletteWheelCanvas');
    if (!canvas) return;

    this.wheelRenderer = new WheelRenderer(canvas, {
      spinDuration: this.engine.config.timing.spinDuration,
      onBallBounce: () => {
        this.engine.audio.playBallBounce();
      },
      onSpinComplete: (winningNumber) => {
        this.engine.onBallLanded(winningNumber);
      }
    });

    this.engine.attachWheelRenderer(this.wheelRenderer);
  }

  subscribeEngine() {
    const banner = document.getElementById('winCelebrationBanner');
    const badge = document.getElementById('winBannerBadge');
    const title = document.getElementById('winBannerTitle');
    const amount = document.getElementById('winBannerAmount');

    this.engine.on('spinStarted', () => {
      if (banner) banner.classList.remove('visible');
    });

    this.engine.on('roundComplete', (summary) => {
      if (!banner || !badge || !title || !amount) return;

      const num = summary.winningNumber;
      const color = summary.color;
      
      badge.textContent = num;
      badge.className = `win-num-badge ${color}`;

      if (summary.totalWon > 0) {
        title.textContent = 'YOU WIN!';
        title.style.color = '#facc15';
        amount.textContent = `+$${summary.netProfit > 0 ? summary.netProfit.toLocaleString() : summary.totalWon.toLocaleString()}`;
        amount.style.color = '#4ade80';
      } else {
        title.textContent = `${color.toUpperCase()} ${num}`;
        title.style.color = '#e2e8f0';
        amount.textContent = 'NO WIN';
        amount.style.color = '#94a3b8';
      }

      banner.classList.add('visible');

      setTimeout(() => {
        banner.classList.remove('visible');
      }, this.engine.config.timing.winAnnouncementDuration);
    });
  }
}
