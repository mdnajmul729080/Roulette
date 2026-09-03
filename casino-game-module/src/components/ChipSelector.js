/**
 * Vegas Roulette - ChipSelector Component
 * Carousel of casino chip denominations with active glow and value selector
 */

export class ChipSelector {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('../game-engine/GameEngine.js').GameEngine} engine
   */
  constructor(containerElement, engine) {
    this.container = containerElement;
    this.engine = engine;
    this.chips = this.engine.config.chipDenominations;
    this.render();
    this.bindEvents();
    this.subscribeEngine();
  }

  render() {
    const selected = this.engine.getSelectedChip();

    this.container.innerHTML = `
      <div class="chip-carousel" id="chipCarousel" role="radiogroup" aria-label="Chip denominations">
        ${this.chips.map(chip => {
          const isSelected = selected && selected.value === chip.value;
          return `
            <div 
              class="chip-item ${isSelected ? 'active' : ''}" 
              data-value="${chip.value}"
              role="radio" 
              aria-checked="${isSelected}" 
              tabindex="0"
              title="$${chip.value} Chip"
              id="chip-btn-${chip.value}"
            >
              <img src="${chip.asset}" alt="$${chip.value} chip" class="chip-img" />
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.chip-item');
      if (!item) return;

      const value = parseInt(item.getAttribute('data-value'), 10);
      const chosen = this.chips.find(c => c.value === value);
      if (chosen) {
        this.engine.setSelectedChip(chosen);
        this.updateActiveUI(value);
      }
    });
  }

  updateActiveUI(value) {
    this.container.querySelectorAll('.chip-item').forEach(el => {
      const v = parseInt(el.getAttribute('data-value'), 10);
      const isMatch = v === value;
      el.classList.toggle('active', isMatch);
      el.setAttribute('aria-checked', String(isMatch));
    });
  }

  subscribeEngine() {
    this.engine.on('chipSelected', (chip) => {
      this.updateActiveUI(chip.value);
    });
  }
}
