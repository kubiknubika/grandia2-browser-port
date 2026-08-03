// WebAudio sound engine for the Grandia II browser port.
// Procedural synthesis: a battle theme loop + SFX (hit/critical/spell/heal/
// item/boss). No external assets. Toggle via sound.enabled.
//
// Usage (browser only):
//   import { sound } from './audio.js';
//   sound.init();                 // after a user gesture
//   sound.setEnabled(true);
//   sound.startBattleTheme();
//   sound.stopBattleTheme();
//   sound.playSfx('hit');         // 'hit' | 'critical' | 'spell' | 'heal' | 'item' | 'boss' | 'victory' | 'defeat' | 'cancel' | 'evade' | 'ui'

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let musicTimer = null;
let musicStep = 0;
let enabled = true;
let themeKind = 'battle';

function ensureContext() {
  if (ctx) {
    return ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    return null;
  }
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.32;
  musicGain.connect(masterGain);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.55;
  sfxGain.connect(masterGain);
  return ctx;
}

function tone(freq, start, duration, type = 'square', gain = 0.2, dest = null, slide = null) {
  const ac = ensureContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, slide), ac.currentTime + start + duration);
  }
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(g);
  g.connect(dest || sfxGain);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

function noiseBurst(start, duration, gain = 0.2, dest = null) {
  const ac = ensureContext();
  if (!ac) return;
  const length = Math.max(1, Math.floor(ac.sampleRate * duration));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2400;
  src.connect(filter);
  filter.connect(g);
  g.connect(dest || sfxGain);
  src.start(ac.currentTime + start);
}

const SFX_DEFS = {
  hit: () => { tone(160, 0, 0.12, 'square', 0.25); noiseBurst(0, 0.1, 0.18); },
  critical: () => { tone(120, 0, 0.18, 'sawtooth', 0.3, null, 60); noiseBurst(0, 0.16, 0.25); },
  spell: () => { tone(440, 0, 0.18, 'sine', 0.22); tone(660, 0.06, 0.18, 'sine', 0.18); tone(880, 0.12, 0.2, 'sine', 0.14); },
  heal: () => { tone(520, 0, 0.2, 'sine', 0.2); tone(780, 0.08, 0.22, 'sine', 0.16); tone(1040, 0.16, 0.26, 'sine', 0.12); },
  item: () => { tone(600, 0, 0.1, 'triangle', 0.2); tone(800, 0.08, 0.1, 'triangle', 0.18); },
  boss: () => { tone(90, 0, 0.4, 'sawtooth', 0.3, null, 55); tone(70, 0.1, 0.5, 'sawtooth', 0.2, null, 40); },
  victory: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.2)); },
  defeat: () => { [400, 350, 300, 220].forEach((f, i) => tone(f, i * 0.16, 0.35, 'sawtooth', 0.16, null, f * 0.85)); },
  cancel: () => { tone(300, 0, 0.08, 'square', 0.18, null, 140); },
  evade: () => { tone(700, 0, 0.08, 'sine', 0.14); tone(900, 0.06, 0.1, 'sine', 0.12); },
  ui: () => { tone(880, 0, 0.05, 'square', 0.12); },
  levelup: () => { [660, 880, 990, 1320].forEach((f, i) => tone(f, i * 0.08, 0.18, 'triangle', 0.18)); },
};

// Battle theme: driving minor arpeggio + bass.
const BATTLE_BASS = [110, 110, 87.3, 87.3, 98, 98, 82.4, 82.4];
const BATTLE_ARP = [220, 261.6, 329.6, 440, 329.6, 261.6, 220, 174.6];

function playMusicStep() {
  const ac = ensureContext();
  if (!ac || !enabled || !musicGain) return;
  const step = musicStep;
  const beat = step % 8;
  const bar = Math.floor(step / 8);
  // bass
  const bassFreq = BATTLE_BASS[(bar * 2 + (beat >= 4 ? 1 : 0)) % BATTLE_BASS.length];
  tone(bassFreq, 0, 0.24, 'triangle', 0.24, musicGain);
  // arpeggio on even beats
  if (beat % 2 === 0) {
    const arpFreq = BATTLE_ARP[(bar * 4 + beat / 2) % BATTLE_ARP.length];
    tone(arpFreq, 0, 0.18, 'square', 0.1, musicGain);
  }
  // snare-ish noise on beats 2,6
  if (beat === 2 || beat === 6) {
    noiseBurst(0, 0.06, 0.08, musicGain);
  }
  musicStep += 1;
}

export const sound = {
  init() {
    ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  },
  setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) {
      this.stopBattleTheme();
    }
  },
  isEnabled() {
    return enabled;
  },
  startBattleTheme(kind = 'battle') {
    const ac = ensureContext();
    if (!ac || !enabled || musicTimer) {
      return;
    }
    themeKind = kind;
    musicStep = 0;
    playMusicStep();
    musicTimer = setInterval(playMusicStep, 170);
  },
  stopBattleTheme() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  },
  playSfx(name) {
    if (!enabled) {
      return;
    }
    const ac = ensureContext();
    if (!ac) {
      return;
    }
    const def = SFX_DEFS[name];
    if (def) {
      def();
    }
  },
};

export function mapEventTypeToSfx(event) {
  if (!event) return null;
  const type = event.type;
  if (type === 'boss-phase' || type === 'boss-reaction') return 'boss';
  if (type === 'combo' || type === 'critical') return 'critical';
  if (type === 'evade') return 'evade';
  if (type === 'medicinalHerb' || type === 'item' || String(type).includes('Herb') || String(type).includes('Potion') || String(type).includes('Scroll')) return 'item';
  if (type === 'heal' || String(type).includes('Heal') || String(type).includes('alhealer') || String(type).includes('droplets')) return 'heal';
  if (String(type).includes('Strike') || String(type).includes('Boom') || String(type).includes('Zap') || String(type).includes('Burn') || String(type).includes('Quake') || String(type).includes('Tremor')) return 'spell';
  return 'hit';
}
