/**
 * Vegas Roulette - Professional Audio Controller
 * Hybrid HTML5 Audio + Web Audio API Synthesizer
 */

export class AudioController {
  constructor() {
    this.muted = false;
    this.volume = 0.7;
    this.audioContext = null;
    this.sounds = {};
    this.isUnlocked = false;

    // Load persisted preferences
    try {
      const savedMute = localStorage.getItem('vr_audio_muted');
      if (savedMute !== null) this.muted = savedMute === 'true';
      const savedVol = localStorage.getItem('vr_audio_volume');
      if (savedVol !== null) this.volume = parseFloat(savedVol) || 0.7;
    } catch (e) {
      // localStorage may be disabled
    }

    this.initAudioElements();
  }

  initAudioElements() {
    this.sounds = {
      placeBet: this.createAudioElement('/main/assets/coin-and-money-place-bets.mp3'),
      clearBets: this.createAudioElement('/main/assets/poker-chips-clear-bets.mp3'),
      newGame: this.createAudioElement('/main/assets/paper-shuffle-new-game.mp3')
    };
  }

  createAudioElement(src) {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    audio.volume = this.volume;
    return audio;
  }

  unlock() {
    if (this.isUnlocked) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !this.audioContext) {
        this.audioContext = new AudioContext();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.isUnlocked = true;
    } catch (e) {
      console.warn('[AudioController] Web Audio not available', e);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(audio => {
      if (audio) audio.volume = this.volume;
    });
    try {
      localStorage.setItem('vr_audio_volume', String(this.volume));
    } catch (e) {}
  }

  setMuted(mute) {
    this.muted = !!mute;
    try {
      localStorage.setItem('vr_audio_muted', String(this.muted));
    } catch (e) {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playChip() {
    if (this.muted) return;
    this.unlock();
    if (this.sounds.placeBet) {
      this.sounds.placeBet.currentTime = 0;
      this.sounds.placeBet.play().catch(() => this.synthChipClick());
    } else {
      this.synthChipClick();
    }
  }

  playClear() {
    if (this.muted) return;
    this.unlock();
    if (this.sounds.clearBets) {
      this.sounds.clearBets.currentTime = 0;
      this.sounds.clearBets.play().catch(() => this.synthClearSound());
    } else {
      this.synthClearSound();
    }
  }

  playNewGame() {
    if (this.muted) return;
    this.unlock();
    if (this.sounds.newGame) {
      this.sounds.newGame.currentTime = 0;
      this.sounds.newGame.play().catch(() => {});
    }
  }

  playBallBounce() {
    if (this.muted) return;
    this.unlock();
    this.synthFretClick();
  }

  playWin() {
    if (this.muted) return;
    this.unlock();
    this.synthWinArpeggio();
  }

  playLose() {
    if (this.muted) return;
    this.unlock();
    this.synthLoseTone();
  }

  // Web Audio Synthesizer Fallbacks & Accents
  synthChipClick() {
    if (!this.audioContext || this.muted) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  synthFretClick() {
    if (!this.audioContext || this.muted) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  synthClearSound() {
    if (!this.audioContext || this.muted) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  synthWinArpeggio() {
    if (!this.audioContext || this.muted) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.audioContext.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25 * this.volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {}
  }

  synthLoseTone() {
    if (!this.audioContext || this.muted) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}
