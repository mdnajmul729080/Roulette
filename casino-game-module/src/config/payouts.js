/**
 * Vegas Roulette - Payout Tables and Betting Rules
 */

export const BET_TYPES = {
  STRAIGHT_UP: {
    id: 'straight_up',
    name: 'Straight Up',
    payoutRatio: 35, // 35:1
    returnMultiplier: 36,
    description: 'Bet on any single number including 0 and 00'
  },
  SPLIT: {
    id: 'split',
    name: 'Split',
    payoutRatio: 17, // 17:1
    returnMultiplier: 18,
    description: 'Bet on two adjoining numbers'
  },
  STREET: {
    id: 'street',
    name: 'Street',
    payoutRatio: 11, // 11:1
    returnMultiplier: 12,
    description: 'Bet on three numbers in a horizontal row'
  },
  CORNER: {
    id: 'corner',
    name: 'Corner',
    payoutRatio: 8, // 8:1
    returnMultiplier: 9,
    description: 'Bet on four numbers in a square block'
  },
  SIX_LINE: {
    id: 'six_line',
    name: 'Six Line',
    payoutRatio: 5, // 5:1
    returnMultiplier: 6,
    description: 'Bet on six numbers in two consecutive rows'
  },
  TOP_LINE: {
    id: 'top_line',
    name: 'Top Line / Basket',
    payoutRatio: 6, // 6:1
    returnMultiplier: 7,
    description: 'Bet on 0, 00, 1, 2, and 3'
  },
  DOZEN: {
    id: 'dozen',
    name: 'Dozen',
    payoutRatio: 2, // 2:1
    returnMultiplier: 3,
    description: 'Bet on 1st 12 (1-12), 2nd 12 (13-24), or 3rd 12 (25-36)'
  },
  COLUMN: {
    id: 'column',
    name: 'Column',
    payoutRatio: 2, // 2:1
    returnMultiplier: 3,
    description: 'Bet on any of the three vertical 12-number columns'
  },
  EVEN_MONEY: {
    id: 'even_money',
    name: 'Even Money',
    payoutRatio: 1, // 1:1
    returnMultiplier: 2,
    description: 'Red, Black, Even, Odd, 1-18 (Low), or 19-36 (High)'
  }
};
