/**
 * DoMaiN - Audio Synthesizer (Web Audio API)
 * Zero external audio files, completely procedural & offline-capable.
 */
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playMemoryPad(colorIndex) {
    const freqs = [329.63, 440.00, 554.37, 659.25]; // E4, A4, C#5, E5
    this.playTone(freqs[colorIndex % freqs.length], 'sine', 0.28, 0.2);
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.18), idx * 80);
    });
  }

  playFailure() {
    if (this.muted) return;
    this.init();
    this.playTone(220, 'sawtooth', 0.2, 0.18);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.35, 0.2), 150);
  }

  playTick() {
    this.playTone(800, 'sine', 0.04, 0.05);
  }
}

// Global sound instance
const sound = new SoundFX();
