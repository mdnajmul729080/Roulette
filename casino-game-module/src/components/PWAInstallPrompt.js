/**
 * Vegas Roulette - PWAInstallPrompt Component
 * In-app installation banner adhering strictly to PWA guidelines
 */

export class PWAInstallPrompt {
  /**
   * @param {HTMLElement} containerElement
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.render();
    this.initPWA();
  }

  render() {
    this.container.innerHTML = `
      <div class="pwa-install-banner" id="pwaBanner" style="display:none;">
        <img src="/pwa-192x192.png" alt="Vegas Roulette" class="pwa-icon" />
        <div class="pwa-details">
          <div class="pwa-title font-display">Install Vegas Roulette</div>
          <div class="pwa-desc">Install app on your device for instant offline gameplay</div>
        </div>
        <button class="btn-gold" id="btnPwaInstall" style="padding:8px 14px; font-size:0.8rem; min-height:36px;">
          Install
        </button>
        <button class="modal-close-btn" id="btnPwaDismiss" style="font-size:1.2rem; margin-left:4px;">&times;</button>
      </div>
    `;
  }

  initPWA() {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      this.isInstalled = true;
      return;
    }

    const banner = document.getElementById('pwaBanner');
    const btnInstall = document.getElementById('btnPwaInstall');
    const btnDismiss = document.getElementById('btnPwaDismiss');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (banner && !sessionStorage.getItem('pwa_dismissed')) {
        banner.style.display = 'flex';
      }
    });

    if (btnInstall) {
      btnInstall.addEventListener('click', async () => {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('[PWA] User accepted installation prompt');
        }
        this.deferredPrompt = null;
        if (banner) banner.style.display = 'none';
      });
    }

    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => {
        if (banner) banner.style.display = 'none';
        sessionStorage.setItem('pwa_dismissed', 'true');
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Vegas Roulette successfully installed');
      this.isInstalled = true;
      if (banner) banner.style.display = 'none';
    });
  }
}
