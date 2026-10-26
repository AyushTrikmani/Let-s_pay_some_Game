// Web Audio API Synthesizer for Declare Card Game
// Generates lightweight, crisp UI sounds without external audio file dependencies

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playCardClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        } catch {
            // Audio context safely caught
        }
    }

    playSuccessDeclare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = this.ctx.currentTime + idx * 0.08;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.12, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.25);
            });
        } catch {
            // Audio context safely caught
        }
    }

    playBust() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(196, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.35);
        } catch {
            // Audio context safely caught
        }
    }

    playRoundSubmit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch {
            // Audio context safely caught
        }
    }

    playVictoryFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const chords = [
                { f: 523.25, t: 0 },
                { f: 659.25, t: 0.12 },
                { f: 783.99, t: 0.24 },
                { f: 1046.50, t: 0.36 },
                { f: 1318.51, t: 0.55 }
            ];

            chords.forEach(({ f, t }) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const start = this.ctx.currentTime + t;

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, start);

                gain.gain.setValueAtTime(0.15, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(start);
                osc.stop(start + 0.45);
            });
        } catch {
            // Audio context safely caught
        }
    }
}

export const soundManager = new SoundManager();
