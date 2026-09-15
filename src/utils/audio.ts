/**
 * Synthesized Web Audio Sound Engine
 * Zero external audio files required, instant latency, zero bandwidth overhead.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let soundEnabled = true;
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('figma_todo_sound_enabled');
  soundEnabled = saved !== null ? saved === 'true' : true;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('figma_todo_sound_enabled', String(soundEnabled));
  }
  if (soundEnabled) {
    playPop();
  }
  return soundEnabled;
}

/** Crisp UI tactile pop */
export function playPop(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(540, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/** Triumphant task completion chime (Major chord arpeggio) */
export function playSuccessChime(combo = 1): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  // Shift up pitch slightly for high combos
  const pitchMultiplier = Math.min(1.4, 1 + (combo - 1) * 0.06);

  baseFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime + index * 0.06;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * pitchMultiplier, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  });
}

/** Level up triumphant fanfare */
export function playLevelUpFanfare(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { f: 523.25, d: 0.1 }, // C5
    { f: 659.25, d: 0.1 }, // E5
    { f: 783.99, d: 0.1 }, // G5
    { f: 1046.5, d: 0.25 }, // C6
    { f: 1318.5, d: 0.4 }, // E6
  ];

  let timeOffset = 0;
  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime + timeOffset;

    osc.type = 'square';
    osc.frequency.setValueAtTime(note.f, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + note.d);
    timeOffset += note.d * 0.75;
  });
}

/** Delete / Disintegration whoosh */
export function playDeleteSwoosh(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/** Dice roulette tick */
export function playDiceTick(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);

  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}
