/**
 * Vegas Roulette - Wallet Service
 * Handles user balances, bet holds, payouts, and transaction ledger.
 * Seamlessly interfaces with host platform wallet APIs.
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class WalletService {
  constructor(initialBalance = GAME_CONFIG.initialBalance) {
    this.balance = initialBalance;
    this.currency = GAME_CONFIG.currency;
    this.transactions = [];
    this.listeners = [];

    // Check local storage for persistent guest wallet
    try {
      const saved = localStorage.getItem('vr_wallet_balance');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0) {
          this.balance = parsed;
        }
      }
    } catch (e) {}
  }

  getBalance() {
    return this.balance;
  }

  getFormattedBalance() {
    return `${this.currency}${this.balance.toLocaleString('en-US')}`;
  }

  hasSufficientFunds(amount) {
    return this.balance >= amount;
  }

  deduct(amount, reason = 'BET_PLACED') {
    if (amount <= 0) return true;
    if (this.balance < amount) {
      return false;
    }
    this.balance -= amount;
    this.logTransaction(reason, -amount, this.balance);
    this.notify();
    return true;
  }

  credit(amount, reason = 'BET_WIN') {
    if (amount <= 0) return;
    this.balance += amount;
    this.logTransaction(reason, amount, this.balance);
    this.notify();
  }

  reset(newBalance = GAME_CONFIG.initialBalance) {
    this.balance = newBalance;
    this.logTransaction('WALLET_RESET', newBalance, this.balance);
    this.notify();
  }

  logTransaction(type, delta, currentBalance) {
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      delta,
      balance: currentBalance,
      timestamp: new Date().toISOString()
    };
    this.transactions.unshift(tx);
    if (this.transactions.length > 50) this.transactions.pop();
    
    try {
      localStorage.setItem('vr_wallet_balance', String(this.balance));
    } catch (e) {}
  }

  onBalanceChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.balance, this.getFormattedBalance()));
  }
}
