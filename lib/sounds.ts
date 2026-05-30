// Web Audio API sound utilities for timer events
let ctx: AudioContext | null = null;
const activeOscillators: OscillatorNode[] = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function stopAllSounds() {
  activeOscillators.forEach((osc) => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  activeOscillators.length = 0;
}

function playTone(
  frequency: number,
  gainPeak: number,
  duration: number,
  type: OscillatorType = "sine",
  delay = 0
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);

  gain.gain.setValueAtTime(0, ac.currentTime + delay);
  gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.05);

  activeOscillators.push(osc);
  osc.onended = () => {
    const idx = activeOscillators.indexOf(osc);
    if (idx !== -1) activeOscillators.splice(idx, 1);
  };
}

// Three-tone ascending chime — played when a focus session ends
export function playSessionEndSound() {
  playTone(523.25, 0.18, 0.6);
  playTone(659.25, 0.15, 0.5, "sine", 0.22);
  playTone(783.99, 0.12, 0.8, "sine", 0.44);
}

// Repeating two-tone pulse x4, one pulse every 2s (~8s total) — played when a break ends
export function playBreakEndSound() {
  for (let i = 0; i < 4; i++) {
    const offset = i * 2;
    playTone(880,    0.14, 0.4, "sine", offset);
    playTone(1046.5, 0.10, 0.5, "sine", offset + 0.25);
  }
}
