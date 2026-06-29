let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  startTime: number,
  duration: number,
  vol = 0.25,
  type: OscillatorType = "sine"
) {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function playCorrect() {
  try {
    const c = ctx();
    const now = c.currentTime;
    tone(440, now, 0.15);
    tone(550, now + 0.12, 0.15);
    tone(660, now + 0.24, 0.2);
  } catch { /* ignore */ }
}

export function playWrong() {
  try {
    const c = ctx();
    const now = c.currentTime;
    tone(200, now, 0.25, 0.18, "sawtooth");
  } catch { /* ignore */ }
}

export function playCelebrate() {
  try {
    const c = ctx();
    const now = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, now + i * 0.14, 0.2, 0.3));
  } catch { /* ignore */ }
}

export function playTick() {
  try {
    const c = ctx();
    tone(800, c.currentTime, 0.05, 0.08, "square");
  } catch { /* ignore */ }
}
