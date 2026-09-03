/**
 * Vegas Roulette - Comprehensive Game Rules & Payout Engine
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { BET_TYPES } from '../config/payouts.js';

export class RouletteRules {
  /**
   * Determine color of a given number ('red', 'black', or 'green')
   */
  static getNumberColor(num) {
    const s = String(num);
    if (s === '0' || s === '00') return 'green';
    const n = Number(s);
    if (GAME_CONFIG.redNumbers.includes(n)) return 'red';
    if (GAME_CONFIG.blackNumbers.includes(n)) return 'black';
    return 'unknown';
  }

  /**
   * Determine properties of a given number
   */
  static getNumberProperties(num) {
    const s = String(num);
    if (s === '0' || s === '00') {
      return {
        number: s,
        color: 'green',
        isZero: true,
        isEven: false,
        isOdd: false,
        range: null,
        dozen: null,
        column: null
      };
    }

    const n = Number(s);
    const color = GAME_CONFIG.redNumbers.includes(n) ? 'red' : 'black';
    const isEven = n % 2 === 0;
    const isOdd = !isEven;
    const range = n <= 18 ? '1-18' : '19-36';
    const dozen = n <= 12 ? '1st 12' : n <= 24 ? '2nd 12' : '3rd 12';
    const colRem = n % 3;
    const column = colRem === 1 ? 'col1' : colRem === 2 ? 'col2' : 'col3';

    return {
      number: n,
      color,
      isZero: false,
      isEven,
      isOdd,
      range,
      dozen,
      column
    };
  }

  /**
   * Registry of all valid bet spots on the roulette table
   */
  static getBetDefinitions() {
    const bets = {};

    // 1. Straight Up (0, 00, 1-36)
    bets['num_0'] = { id: 'num_0', name: 'Straight 0', type: BET_TYPES.STRAIGHT_UP, numbers: ['0'] };
    bets['num_00'] = { id: 'num_00', name: 'Straight 00', type: BET_TYPES.STRAIGHT_UP, numbers: ['00'] };
    for (let i = 1; i <= 36; i++) {
      bets[`num_${i}`] = {
        id: `num_${i}`,
        name: `Straight ${i}`,
        type: BET_TYPES.STRAIGHT_UP,
        numbers: [i]
      };
    }

    // 2. Outside Bets - Dozens
    bets['dozen_1'] = { id: 'dozen_1', name: '1st Dozen (1-12)', type: BET_TYPES.DOZEN, numbers: Array.from({ length: 12 }, (_, i) => i + 1) };
    bets['dozen_2'] = { id: 'dozen_2', name: '2nd Dozen (13-24)', type: BET_TYPES.DOZEN, numbers: Array.from({ length: 12 }, (_, i) => i + 13) };
    bets['dozen_3'] = { id: 'dozen_3', name: '3rd Dozen (25-36)', type: BET_TYPES.DOZEN, numbers: Array.from({ length: 12 }, (_, i) => i + 25) };

    // 3. Outside Bets - Columns (2 to 1)
    bets['col_1'] = { id: 'col_1', name: 'Bottom Column (1, 4, 7... 34)', type: BET_TYPES.COLUMN, numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34] };
    bets['col_2'] = { id: 'col_2', name: 'Middle Column (2, 5, 8... 35)', type: BET_TYPES.COLUMN, numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35] };
    bets['col_3'] = { id: 'col_3', name: 'Top Column (3, 6, 9... 36)', type: BET_TYPES.COLUMN, numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36] };

    // 4. Outside Bets - Even Money (1:1)
    bets['low_1_18'] = { id: 'low_1_18', name: '1 to 18 (Low)', type: BET_TYPES.EVEN_MONEY, numbers: Array.from({ length: 18 }, (_, i) => i + 1) };
    bets['high_19_36'] = { id: 'high_19_36', name: '19 to 36 (High)', type: BET_TYPES.EVEN_MONEY, numbers: Array.from({ length: 18 }, (_, i) => i + 19) };
    bets['even'] = { id: 'even', name: 'Even', type: BET_TYPES.EVEN_MONEY, numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36] };
    bets['odd'] = { id: 'odd', name: 'Odd', type: BET_TYPES.EVEN_MONEY, numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35] };
    bets['red'] = { id: 'red', name: 'Red', type: BET_TYPES.EVEN_MONEY, numbers: GAME_CONFIG.redNumbers };
    bets['black'] = { id: 'black', name: 'Black', type: BET_TYPES.EVEN_MONEY, numbers: GAME_CONFIG.blackNumbers };

    // 5. Streets (Row of 3: e.g. 1-2-3, 4-5-6, ... 34-35-36)
    for (let r = 0; r < 12; r++) {
      const start = r * 3 + 1;
      const streetNums = [start, start + 1, start + 2];
      bets[`street_${start}`] = {
        id: `street_${start}`,
        name: `Street (${streetNums.join('-')})`,
        type: BET_TYPES.STREET,
        numbers: streetNums
      };
    }

    // 6. Horizontal & Vertical Splits (2 Numbers)
    // Horizontal splits (between column rows in same tier)
    for (let r = 0; r < 12; r++) {
      const n1 = r * 3 + 1;
      const n2 = r * 3 + 2;
      const n3 = r * 3 + 3;
      bets[`split_${n1}_${n2}`] = { id: `split_${n1}_${n2}`, name: `Split ${n1}-${n2}`, type: BET_TYPES.SPLIT, numbers: [n1, n2] };
      bets[`split_${n2}_${n3}`] = { id: `split_${n2}_${n3}`, name: `Split ${n2}-${n3}`, type: BET_TYPES.SPLIT, numbers: [n2, n3] };
    }
    // Vertical splits (between consecutive rows in same column)
    for (let col = 1; col <= 3; col++) {
      for (let r = 0; r < 11; r++) {
        const n1 = r * 3 + col;
        const n2 = (r + 1) * 3 + col;
        bets[`split_${n1}_${n2}`] = { id: `split_${n1}_${n2}`, name: `Split ${n1}-${n2}`, type: BET_TYPES.SPLIT, numbers: [n1, n2] };
      }
    }
    // Split 0 and 00
    bets['split_0_00'] = { id: 'split_0_00', name: 'Split 0-00', type: BET_TYPES.SPLIT, numbers: ['0', '00'] };
    bets['split_0_1'] = { id: 'split_0_1', name: 'Split 0-1', type: BET_TYPES.SPLIT, numbers: ['0', 1] };
    bets['split_0_2'] = { id: 'split_0_2', name: 'Split 0-2', type: BET_TYPES.SPLIT, numbers: ['0', 2] };
    bets['split_00_2'] = { id: 'split_00_2', name: 'Split 00-2', type: BET_TYPES.SPLIT, numbers: ['00', 2] };
    bets['split_00_3'] = { id: 'split_00_3', name: 'Split 00-3', type: BET_TYPES.SPLIT, numbers: ['00', 3] };

    // 7. Corners / Squares (4 numbers)
    for (let r = 0; r < 11; r++) {
      const base = r * 3;
      bets[`corner_${base + 1}`] = {
        id: `corner_${base + 1}`,
        name: `Corner ${base + 1},${base + 2},${base + 4},${base + 5}`,
        type: BET_TYPES.CORNER,
        numbers: [base + 1, base + 2, base + 4, base + 5]
      };
      bets[`corner_${base + 2}`] = {
        id: `corner_${base + 2}`,
        name: `Corner ${base + 2},${base + 3},${base + 5},${base + 6}`,
        type: BET_TYPES.CORNER,
        numbers: [base + 2, base + 3, base + 5, base + 6]
      };
    }

    // 8. Six Lines / Double Street (6 numbers)
    for (let r = 0; r < 11; r++) {
      const start = r * 3 + 1;
      const sixNums = [start, start + 1, start + 2, start + 3, start + 4, start + 5];
      bets[`sixline_${start}`] = {
        id: `sixline_${start}`,
        name: `Six Line (${start}-${start + 5})`,
        type: BET_TYPES.SIX_LINE,
        numbers: sixNums
      };
    }

    // 9. Top Line / Basket (American: 0, 00, 1, 2, 3)
    bets['top_line_basket'] = {
      id: 'top_line_basket',
      name: 'Basket (0, 00, 1, 2, 3)',
      type: BET_TYPES.TOP_LINE,
      numbers: ['0', '00', 1, 2, 3]
    };

    return bets;
  }

  /**
   * Evaluate all active bets against the winning number
   * @param {string|number} landedResult The landed wheel number ('0', '00', 1..36)
   * @param {Object} bets Placed bets in format: { [spotId]: { amount: number, ... } }
   * @returns {Object} Comprehensive outcome summary
   */
  static evaluateRound(landedResult, bets) {
    const definitions = this.getBetDefinitions();
    const winningNumber = String(landedResult);
    const winningNumberInt = (winningNumber === '0' || winningNumber === '00') ? winningNumber : Number(winningNumber);

    let totalBet = 0;
    let totalWon = 0;
    const winningBets = [];
    const losingBets = [];

    Object.entries(bets).forEach(([spotId, betData]) => {
      const amount = typeof betData === 'number' ? betData : betData.amount;
      if (!amount || amount <= 0) return;

      totalBet += amount;
      const def = definitions[spotId];

      let isWin = false;
      if (def) {
        // Check if covered numbers include winningNumberInt
        isWin = def.numbers.some(n => String(n) === winningNumber);
      }

      if (isWin) {
        const payoutRatio = def.type.payoutRatio;
        const netProfit = amount * payoutRatio;
        const totalReturn = amount * def.type.returnMultiplier;
        totalWon += totalReturn;

        winningBets.push({
          spotId,
          name: def.name,
          betType: def.type.name,
          amount,
          payoutRatio,
          netProfit,
          totalReturn
        });
      } else {
        losingBets.push({
          spotId,
          name: def ? def.name : spotId,
          amount
        });
      }
    });

    const netProfit = totalWon - totalBet;

    return {
      winningNumber,
      color: this.getNumberColor(winningNumber),
      properties: this.getNumberProperties(winningNumber),
      totalBet,
      totalWon,
      netProfit,
      isPlayerWinner: totalWon > 0,
      winningBets,
      losingBets
    };
  }

  /**
   * Generate roulette statistical analysis over history
   */
  static calculateStatistics(historyList) {
    const stats = {
      totalSpins: historyList.length,
      redCount: 0,
      blackCount: 0,
      greenCount: 0,
      evenCount: 0,
      oddCount: 0,
      lowCount: 0,
      highCount: 0,
      dozenCounts: { dozen1: 0, dozen2: 0, dozen3: 0 },
      hotNumbers: [],
      coldNumbers: [],
      frequency: {}
    };

    if (!historyList || historyList.length === 0) return stats;

    // Initialize all possible numbers in frequency table
    GAME_CONFIG.wheelNumbers.forEach(n => {
      stats.frequency[String(n)] = 0;
    });

    historyList.forEach(item => {
      const numStr = String(item.number !== undefined ? item.number : item);
      stats.frequency[numStr] = (stats.frequency[numStr] || 0) + 1;

      const props = this.getNumberProperties(numStr);
      if (props.color === 'red') stats.redCount++;
      else if (props.color === 'black') stats.blackCount++;
      else if (props.color === 'green') stats.greenCount++;

      if (props.isEven) stats.evenCount++;
      if (props.isOdd) stats.oddCount++;

      if (props.range === '1-18') stats.lowCount++;
      if (props.range === '19-36') stats.highCount++;

      if (props.dozen === '1st 12') stats.dozenCounts.dozen1++;
      else if (props.dozen === '2nd 12') stats.dozenCounts.dozen2++;
      else if (props.dozen === '3rd 12') stats.dozenCounts.dozen3++;
    });

    // Sort frequencies
    const sorted = Object.entries(stats.frequency).sort((a, b) => b[1] - a[1]);
    stats.hotNumbers = sorted.slice(0, 5).map(([num, count]) => ({ number: num, count, color: this.getNumberColor(num) }));
    stats.coldNumbers = sorted.slice(-5).reverse().map(([num, count]) => ({ number: num, count, color: this.getNumberColor(num) }));

    return stats;
  }
}
