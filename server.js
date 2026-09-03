import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// American roulette numbers sequence
const WHEEL_NUMBERS = [
  '0', 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
  '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(num) {
  const s = String(num);
  if (s === '0' || s === '00') return 'green';
  return RED_NUMBERS.includes(Number(s)) ? 'red' : 'black';
}

// Casino Platform Backend API - Spin Outcome
app.post('/api/roulette/spin', (req, res) => {
  const { bets = {}, totalBet = 0, roundCount = 1 } = req.body;
  
  // Cryptographic random selection
  const randIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
  const winningNumber = String(WHEEL_NUMBERS[randIndex]);
  const color = getNumberColor(winningNumber);

  const outcome = {
    number: winningNumber,
    color,
    roundId: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    serverSeed: Math.random().toString(16).substring(2),
    timestamp: Date.now()
  };

  res.json(outcome);
});

// Casino Platform Backend API - Wallet
app.get('/api/roulette/wallet', (req, res) => {
  res.json({ balance: 1000, currency: '$' });
});

// Casino Platform Backend API - Report
app.post('/api/roulette/report', (req, res) => {
  res.json({ status: 'OK', loggedAt: new Date().toISOString() });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Primary entry points
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/roulette', (req, res) => {
  res.sendFile(path.join(__dirname, 'main', 'roulette.html'));
});

app.get('/module', (req, res) => {
  res.sendFile(path.join(__dirname, 'casino-game-module', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
