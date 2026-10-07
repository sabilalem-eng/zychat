/**
 * Sound Effects Engine using Web Audio API for zyChat
 * Menghasilkan nada dering panggilan, suara pesan terkirim/masuk, tombol klik,
 * dan efek audio telepon asli tanpa ketergantungan file eksternal.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private ringtoneInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Suara pesan terkirim (suara 'pop/click' WhatsApp)
   */
  public playSentSound(volume = 0.2): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Suara pesan masuk (suara 'ting' notifikasi)
   */
  public playReceivedSound(volume = 0.25): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(volume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Suara tombol UI / Keyboard tap
   */
  public playTapSound(volume = 0.1): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  /**
   * Nada Dering Panggilan Masuk (WhatsApp Marimba Ringtone Pattern)
   */
  public startIncomingRingtone(volume = 0.3): void {
    this.stopRingtone();
    const playNotePattern = () => {
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
        const now = ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);

          gain.gain.setValueAtTime(volume, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.25);
        });
      } catch {
        // Ignore
      }
    };

    playNotePattern();
    this.ringtoneInterval = setInterval(playNotePattern, 2400);
  }

  /**
   * Nada Tunggu Panggilan Keluar (Dial Tone / Tuuutt... Tuuutt...)
   */
  public startOutgoingRingtone(volume = 0.2): void {
    this.stopRingtone();
    const playDialTone = () => {
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.setValueAtTime(volume, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.4);
      } catch {
        // Ignore
      }
    };

    playDialTone();
    this.ringtoneInterval = setInterval(playDialTone, 3000);
  }

  /**
   * Hentikan nada dering
   */
  public stopRingtone(): void {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  /**
   * Suara Panggilan Terhubung / Call Connected
   */
  public playCallConnectedSound(volume = 0.2): void {
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.setValueAtTime(950, now + 0.12);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  /**
   * Suara Panggilan Berakhir (Tut tut tut..)
   */
  public playCallEndedSound(volume = 0.2): void {
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [450, 450, 450].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);

        gain.gain.setValueAtTime(volume, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Suara Voice Note Beep (PTT Start)
   */
  public playVoiceNoteBeep(volume = 0.2): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  public playReceiveSound(volume = 0.25): void {
    this.playReceivedSound(volume);
  }
}

export const soundEffects = new SoundEffectsService();
