/**
 * Vegas Roulette - Casino Game Module Entry Point
 * Exports all modules and provides standalone & embedded mounting APIs.
 */

import { GAME_CONFIG } from './config/gameConfig.js';
import { BET_TYPES } from './config/payouts.js';
import { GameEngine } from './game-engine/GameEngine.js';
import { StateMachine, GameStates } from './game-engine/StateMachine.js';
import { RouletteRules } from './game-engine/RouletteRules.js';
import { WheelRenderer } from './game-engine/WheelRenderer.js';
import { AudioController } from './game-engine/AudioController.js';
import { CasinoPlatformAdapter } from './api/CasinoPlatformAdapter.js';
import { WalletService } from './api/WalletService.js';
import { MockBackendRNG } from './api/MockBackendRNG.js';

import { TableBoard } from './components/TableBoard.js';
import { ChipSelector } from './components/ChipSelector.js';
import { ControlPanel } from './components/ControlPanel.js';
import { HeaderInfoBar } from './components/HeaderInfoBar.js';
import { HistoryBar } from './components/HistoryBar.js';
import { WheelModal } from './components/WheelModal.js';
import { StatsModal } from './components/StatsModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { AutoPlayModal } from './components/AutoPlayModal.js';
import { PWAInstallPrompt } from './components/PWAInstallPrompt.js';

export {
  GAME_CONFIG,
  BET_TYPES,
  GameEngine,
  StateMachine,
  GameStates,
  RouletteRules,
  WheelRenderer,
  AudioController,
  CasinoPlatformAdapter,
  WalletService,
  MockBackendRNG,
  TableBoard,
  ChipSelector,
  ControlPanel,
  HeaderInfoBar,
  HistoryBar,
  WheelModal,
  StatsModal,
  SettingsModal,
  AutoPlayModal,
  PWAInstallPrompt
};

/**
 * Mount the complete casino roulette game into any DOM container
 * @param {HTMLElement} rootContainer
 * @param {Object} options
 * @returns {GameEngine} Initialized game engine instance
 */
export function mountCasinoRoulette(rootContainer, options = {}) {
  // Construct markup shell
  rootContainer.innerHTML = `
    <div class="game-container" id="vegasRouletteApp">
      <div id="headerContainer"></div>
      <div id="historyContainer"></div>

      <main class="main-stage">
        <div id="wheelContainer"></div>
        <div class="table-container" id="tableContainer"></div>
      </main>

      <div class="bottom-dock">
        <div id="chipContainer"></div>
        <div id="controlsContainer"></div>
      </div>

      <div id="modalsContainer">
        <div id="statsModalMount"></div>
        <div id="settingsModalMount"></div>
        <div id="autoPlayModalMount"></div>
        <div id="pwaMount"></div>
      </div>
    </div>
  `;

  // Initialize Game Engine
  const engine = new GameEngine(options);

  // Initialize Modals first so callbacks can be passed
  const statsModal = new StatsModal(document.getElementById('statsModalMount'), engine);
  const settingsModal = new SettingsModal(document.getElementById('settingsModalMount'), engine);
  const autoPlayModal = new AutoPlayModal(document.getElementById('autoPlayModalMount'), engine);
  new PWAInstallPrompt(document.getElementById('pwaMount'));

  // Mount Header & History
  new HeaderInfoBar(document.getElementById('headerContainer'), engine, {
    openStats: () => statsModal.open(),
    openSettings: () => settingsModal.open()
  });

  new HistoryBar(document.getElementById('historyContainer'), engine, () => {
    statsModal.open();
  });

  // Mount Wheel Stage
  new WheelModal(document.getElementById('wheelContainer'), engine);

  // Mount Felt Table Board
  new TableBoard(document.getElementById('tableContainer'), engine);

  // Mount Chip Selector
  new ChipSelector(document.getElementById('chipContainer'), engine);

  // Mount Controls Dock
  new ControlPanel(document.getElementById('controlsContainer'), engine, () => {
    autoPlayModal.open();
  });

  // Start engine
  engine.initialize(options);
  engine.start();

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[PWA] ServiceWorker registration error:', err);
      });
    });
  }

  // Global handle for integration testing
  window.CasinoRouletteEngine = engine;

  return engine;
}
