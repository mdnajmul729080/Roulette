# Vegas Roulette - Professional Casino Game Module

A high-performance, modular, casino-platform-ready American Roulette game engineered for standalone web operation and seamless integration into modern online casino platforms, aggregator backends, and mobile apps.

---

## 🎰 Architecture Overview

```
/casino-game-module
├── src
│   ├── game-engine
│   │   ├── GameEngine.js        # Central state, lifecycle & API controller
│   │   ├── StateMachine.js      # Strict FSM managing IDLE, BETTING, SPINNING, etc.
│   │   ├── RouletteRules.js      # Rulebook, payout tables, statistics calculator
│   │   ├── WheelRenderer.js     # 60 FPS hardware-accelerated Canvas physics engine
│   │   └── AudioController.js   # Hybrid HTML5 + Web Audio synthesizer
│   ├── components
│   │   ├── TableBoard.js        # High-res felt grid with split, street, basket bets
│   │   ├── ChipSelector.js      # 7 casino chip denominations with active glow
│   │   ├── ControlPanel.js      # Spin, Double (2x), Rebet, Undo, Clear, Auto-Play
│   │   ├── HeaderInfoBar.js     # Live Balance, Total Bet, Win meters, Quick Actions
│   │   ├── HistoryBar.js        # Live ribbon of recent winning numbers
│   │   ├── WheelModal.js        # Wheel presentation + celebration overlay
│   │   ├── StatsModal.js        # Hot/Cold numbers, Color & Parity trend analytics
│   │   ├── SettingsModal.js     # Fast spin, sound controls, bankroll reloader
│   │   ├── AutoPlayModal.js     # Configurable auto-spins with stop-loss protection
│   │   └── PWAInstallPrompt.js  # Installable Progressive Web App banner
│   ├── api
│   │   ├── CasinoPlatformAdapter.js  # Host platform bridge (REST / WebSocket)
│   │   ├── MockBackendRNG.js         # Cryptographically secure browser fallback RNG
│   │   └── WalletService.js          # Balance ledger, holds, credits, transaction logs
│   ├── config
│   │   ├── gameConfig.js        # Table limits, chip values, wheel sequences
│   │   └── payouts.js           # Full American Roulette payout ratios & multipliers
│   ├── styles
│   │   ├── theme.css            # Dark luxury casino styling, typography, variables
│   │   ├── board.css            # Responsive table layout & chip stack rendering
│   │   └── modal.css            # Modals, banners, and HUD overlays
│   └── index.js                 # Public module exports and mounting factory
└── README.md
```

---

## 🚀 Quick Start (Embedding into a Casino Platform)

### Installation / Import
```javascript
import { mountCasinoRoulette, GameEngine } from './casino-game-module/src/index.js';

// Mount into any container element:
const container = document.getElementById('game-mount-point');
const engine = mountCasinoRoulette(container, {
  initialBalance: 5000,
  minBet: 1,
  maxTableBet: 25000,
  platform: {
    mode: 'integrated', // 'integrated' for server RNG/wallet or 'standalone'
    apiBaseUrl: '/api/roulette'
  }
});
```

---

## 🔌 Core Integration Hooks (Platform Lifecycle)

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `GameEngine.initialize(config)` | `config: Object` | Initializes game settings and platform adapter |
| `GameEngine.start()` | *none* | Boots game into ready IDLE state |
| `GameEngine.placeBet(spotId, chipValue)` | `spotId: string, chipValue: number` | Places chip on table cell or split boundary |
| `GameEngine.clearBets()` | *none* | Removes all active chips from board |
| `GameEngine.doubleBets()` | *none* | Multiplies all placed bets by 2 (2x) |
| `GameEngine.rebet()` | *none* | Re-applies exact bets placed in previous round |
| `GameEngine.undoBet()` | *none* | Undoes the most recent chip placement |
| `GameEngine.spin()` | *none* | Deducts bet hold and triggers RNG request & spin |
| `GameEngine.receiveResult(payload)` | `payload: Object` | Ingests server-authoritative winning number |
| `GameEngine.playAnimation(outcome)` | `outcome: string\|number` | Initiates 60 FPS wheel physics deceleration |
| `GameEngine.showWin(summary)` | `summary: Object` | Triggers celebration fanfare, credit, & HUD |
| `GameEngine.reset()` | *none* | Resets bankroll and wipes bet state |

---

## 📡 Event System (`engine.on(event, handler)`)

Subscribe to real-time game events to sync your casino platform UI:

```javascript
engine.on('spinStarted', ({ roundCount, totalBet }) => {
  console.log(`Spinning round ${roundCount} with total bet $${totalBet}`);
});

engine.on('ballLanded', ({ winningNumber, color }) => {
  console.log(`Ball landed in pocket ${color} ${winningNumber}`);
});

engine.on('roundComplete', (roundSummary) => {
  console.log('Result:', roundSummary);
  // { winningNumber: "17", color: "black", totalBet: 50, totalWon: 1800, netProfit: 1750, isPlayerWinner: true }
});

engine.wallet.onBalanceChange((balance, formatted) => {
  console.log(`Platform Balance Updated: ${formatted}`);
});
```

---

## 🎯 Payout Schedule (American Roulette)

- **Straight Up (1 Number)**: 35 to 1
- **Split (2 Numbers)**: 17 to 1
- **Street (Row of 3)**: 11 to 1
- **Corner / Square (4 Numbers)**: 8 to 1
- **Six Line (6 Numbers)**: 5 to 1
- **Top Line / Basket (0, 00, 1, 2, 3)**: 6 to 1
- **Columns (12 Numbers)**: 2 to 1
- **Dozens (1st, 2nd, 3rd 12)**: 2 to 1
- **Even / Odd, Red / Black, 1-18 / 19-36**: 1 to 1

---

## 📱 Mobile-First Responsive Design
- Optimized for mobile viewports (320px, 375px, 390px, 414px) and tablet/desktop wide displays.
- Minimum 44px thumb-friendly touch targets on all interactive controls.
- Full offline PWA installability with Service Worker caching and standalone mode.
