import { RouletteRules } from '../casino-game-module/src/game-engine/RouletteRules.js';
import { GameEngine } from '../casino-game-module/src/game-engine/GameEngine.js';

console.log('Testing Roulette Rules & Payout Calculation...');

// 1. Test Number Colors
if (RouletteRules.getNumberColor('0') !== 'green') throw new Error('0 must be green');
if (RouletteRules.getNumberColor('00') !== 'green') throw new Error('00 must be green');
if (RouletteRules.getNumberColor('17') !== 'black') throw new Error('17 must be black');
if (RouletteRules.getNumberColor('7') !== 'red') throw new Error('7 must be red');
console.log('✓ Number colors verified');

// 2. Test Straight Win
const betsStraight = {
  num_17: { amount: 10, chips: [10] },
  num_20: { amount: 5, chips: [5] }
};
const evalStraight = RouletteRules.evaluateRound('17', betsStraight);
if (evalStraight.totalBet !== 15) throw new Error('Total bet mismatch');
if (evalStraight.winningBets.length !== 1) throw new Error('Should have 1 winning bet');
if (evalStraight.winningBets[0].payoutRatio !== 35) throw new Error('Straight up payout must be 35:1');
if (evalStraight.totalWon !== 360) throw new Error(`Expected $360 total return (35*10 + 10), got ${evalStraight.totalWon}`);
if (evalStraight.netProfit !== 345) throw new Error(`Expected $345 net profit, got ${evalStraight.netProfit}`);
console.log('✓ Straight Up evaluation verified');

// 3. Test Outside Bets (Red, Even, 1st 12)
const betsOutside = {
  red: { amount: 20, chips: [20] },
  even: { amount: 20, chips: [20] },
  dozen_1: { amount: 15, chips: [10, 5] }
};
// On number 12 (Red, Even, 1st Dozen) - ALL 3 should win!
const evalOutside = RouletteRules.evaluateRound('12', betsOutside);
if (evalOutside.winningBets.length !== 3) throw new Error(`Expected 3 winning bets, got ${evalOutside.winningBets.length}`);
// Red pays 1:1 -> $40 return
// Even pays 1:1 -> $40 return
// 1st 12 pays 2:1 -> $45 return
// Total return = 40 + 40 + 45 = 125
if (evalOutside.totalWon !== 125) throw new Error(`Expected $125 total won, got ${evalOutside.totalWon}`);
console.log('✓ Outside bets evaluation verified');

// 4. Test Basket Bet
const betsBasket = {
  top_line_basket: { amount: 10, chips: [10] }
};
const evalBasket = RouletteRules.evaluateRound('00', betsBasket);
if (evalBasket.winningBets.length !== 1) throw new Error('Basket should win on 00');
if (evalBasket.totalWon !== 70) throw new Error(`Expected $70, got ${evalBasket.totalWon}`);
console.log('✓ Basket bet evaluation verified');

// 5. Test Statistics
const history = [
  { number: '17', color: 'black' },
  { number: '7', color: 'red' },
  { number: '0', color: 'green' },
  { number: '17', color: 'black' }
];
const stats = RouletteRules.calculateStatistics(history);
if (stats.frequency['17'] !== 2) throw new Error('17 frequency should be 2');
if (stats.hotNumbers[0].number !== '17') throw new Error('Hot number should be 17');
console.log('✓ Statistics calculation verified');

console.log('\nAll Engine and Rules unit tests passed perfectly!');
