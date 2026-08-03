import { mkdirSync, writeFileSync } from 'node:fs';
import { PRESETS } from '../src/entities/combat.js';

const ROOT = new URL('../assets/', import.meta.url);

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function initials(name = '') {
  const parts = String(name).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function roleAccent(role = '') {
  if (role.includes('support')) return '#c084fc';
  if (role.includes('caster')) return '#38bdf8';
  if (role.includes('bruiser')) return '#fb923c';
  if (role.includes('sentinel') || role.includes('guardian')) return '#93c5fd';
  if (role.includes('valmar') || role.includes('chaos') || role.includes('core')) return '#ef4444';
  if (role.includes('poison') || role.includes('root')) return '#84cc16';
  return '#facc15';
}

function unitSvg(key, preset) {
  const base = preset.color ?? '#94a3b8';
  const accent = roleAccent(preset.role);
  const teamGlow = preset.team === 'players' ? '#bfdbfe' : '#fecaca';
  const label = initials(preset.name ?? key);
  const horn = preset.team === 'enemies' ? `<path d="M30 28 Q20 8 38 18 Q42 6 50 18" fill="${rgba(accent, 0.9)}" opacity="0.85"/><path d="M66 28 Q76 8 58 18 Q54 6 46 18" fill="${rgba(accent, 0.9)}" opacity="0.85"/>` : '';
  const cape = preset.team === 'players'
    ? `<path d="M24 78 Q48 54 72 78 L72 92 L24 92 Z" fill="${rgba(base, 0.55)}"/>`
    : `<path d="M20 74 Q48 46 76 74 L68 92 L28 92 Z" fill="${rgba(base, 0.55)}"/>`;
  const roleGlyph = preset.role.includes('caster')
    ? `<circle cx="72" cy="24" r="8" fill="${accent}" opacity="0.9"/><path d="M72 16 L74 24 L72 32 L70 24 Z" fill="#f8fafc"/>`
    : preset.role.includes('support')
      ? `<path d="M68 18 h8 v8 h-8 z" fill="${accent}" opacity="0.9"/><path d="M72 19 v6 M69 22 h6" stroke="#f8fafc" stroke-width="1.5"/>`
      : preset.role.includes('bruiser') || preset.role.includes('hunter')
        ? `<path d="M66 16 L78 24 L66 32 Z" fill="${accent}" opacity="0.9"/>`
        : `<circle cx="72" cy="24" r="7" fill="${accent}" opacity="0.9"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <radialGradient id="bg-${key}" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${rgba(base, 0.95)}"/>
      <stop offset="100%" stop-color="${rgba('#0f172a', 0.98)}"/>
    </radialGradient>
  </defs>
  <rect x="4" y="4" width="88" height="88" rx="18" fill="url(#bg-${key})" stroke="${teamGlow}" stroke-width="2"/>
  <ellipse cx="48" cy="79" rx="24" ry="8" fill="${rgba('#020617', 0.45)}"/>
  <circle cx="48" cy="34" r="16" fill="${rgba('#f8fafc', 0.92)}" opacity="0.92"/>
  ${horn}
  ${cape}
  <path d="M30 76 Q48 46 66 76 L60 92 L36 92 Z" fill="${rgba(base, 0.92)}" stroke="${rgba(accent, 0.8)}" stroke-width="2"/>
  <path d="M39 52 Q48 58 57 52" stroke="${rgba('#0f172a', 0.7)}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="42" cy="31" r="2.5" fill="${rgba('#0f172a', 0.75)}"/>
  <circle cx="54" cy="31" r="2.5" fill="${rgba('#0f172a', 0.75)}"/>
  ${roleGlyph}
  <rect x="10" y="70" width="30" height="16" rx="8" fill="${rgba('#020617', 0.55)}"/>
  <text x="25" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#f8fafc">${label}</text>
</svg>`;
}

function backdropSvg({ id, top, mid, ground, accent, motif }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="60%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${ground}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky-${id})"/>
  <ellipse cx="1260" cy="180" rx="170" ry="110" fill="${rgba(accent, 0.22)}"/>
  <path d="M0 640 Q180 520 340 590 T700 570 T1100 610 T1600 540 V900 H0 Z" fill="${rgba('#0f172a', 0.35)}"/>
  <path d="M0 720 Q220 600 420 670 T860 650 T1280 700 T1600 640 V900 H0 Z" fill="${rgba('#020617', 0.48)}"/>
  ${motif}
</svg>`;
}

function battleBackdrop(theme) {
  const motifs = {
    forest: `<g fill="${rgba('#4ade80', 0.16)}"><rect x="110" y="230" width="30" height="380"/><circle cx="125" cy="220" r="90"/><rect x="420" y="210" width="32" height="420"/><circle cx="438" cy="198" r="104"/><rect x="1230" y="250" width="34" height="350"/><circle cx="1248" cy="238" r="92"/></g>`,
    cavern: `<g fill="${rgba('#94a3b8', 0.15)}"><path d="M0 140 L140 0 L320 110 L520 0 L710 150 L930 0 L1160 145 L1390 0 L1600 160 V0 H0 Z"/><path d="M150 900 L250 640 L340 900 Z"/><path d="M860 900 L980 620 L1090 900 Z"/></g>`,
    ruins: `<g fill="${rgba('#cbd5e1', 0.13)}"><rect x="180" y="250" width="80" height="340"/><rect x="660" y="220" width="94" height="390"/><rect x="1160" y="260" width="72" height="330"/><rect x="150" y="220" width="140" height="26"/><rect x="620" y="190" width="170" height="30"/><rect x="1120" y="230" width="150" height="28"/></g>`,
    volcano: `<g fill="${rgba('#fb7185', 0.18)}"><path d="M240 640 L380 260 L520 640 Z"/><path d="M920 680 L1080 210 L1240 680 Z"/><rect x="0" y="720" width="1600" height="180" fill="${rgba('#ef4444', 0.15)}"/></g>`,
  };
  const palettes = {
    forest: { top: '#0f172a', mid: '#134e4a', ground: '#1f3b29', accent: '#22c55e' },
    cavern: { top: '#08111f', mid: '#1f2937', ground: '#2b3443', accent: '#93c5fd' },
    ruins: { top: '#111827', mid: '#2a3448', ground: '#3f3328', accent: '#f59e0b' },
    volcano: { top: '#18080a', mid: '#3b0f16', ground: '#422018', accent: '#ef4444' },
  };
  return backdropSvg({ id: `battle-${theme}`, ...palettes[theme], motif: motifs[theme] });
}

function campaignBackdrop(key) {
  const configs = {
    south_silesia: { top: '#13315c', mid: '#3d7b4f', ground: '#2c4f2f', accent: '#facc15', motif: `<g fill="${rgba('#f8fafc', 0.1)}"><path d="M0 560 Q260 460 480 520 T980 500 T1600 530 V900 H0 Z"/><rect x="1180" y="280" width="90" height="300"/><rect x="1150" y="250" width="150" height="30"/></g>` },
    east_silesia: { top: '#0f2748', mid: '#6b7280', ground: '#cbd5e1', accent: '#e2e8f0', motif: `<g fill="${rgba('#ffffff', 0.14)}"><circle cx="260" cy="250" r="110"/><path d="M0 620 Q220 520 440 600 T920 580 T1600 610 V900 H0 Z"/></g>` },
    holy_city: { top: '#1e293b', mid: '#475569', ground: '#bfa88a', accent: '#f8fafc', motif: `<g fill="${rgba('#f8fafc', 0.16)}"><rect x="620" y="180" width="130" height="360"/><rect x="560" y="150" width="250" height="36"/><rect x="680" y="90" width="18" height="90"/></g>` },
    cyrum_castle: { top: '#10213f', mid: '#284674', ground: '#7388a6', accent: '#60a5fa', motif: `<g fill="${rgba('#cbd5e1', 0.16)}"><rect x="540" y="230" width="200" height="310"/><rect x="500" y="200" width="280" height="36"/><rect x="620" y="130" width="42" height="100"/></g>` },
    sea_route: { top: '#0f3460', mid: '#0ea5e9', ground: '#0c4a6e', accent: '#bae6fd', motif: `<g fill="${rgba('#f8fafc', 0.14)}"><path d="M0 650 Q120 620 240 650 T480 650 T720 650 T960 650 T1200 650 T1440 650 T1600 650 V900 H0 Z"/><path d="M1260 500 L1380 420 L1480 520 Z"/></g>` },
    garlan_island: { top: '#14213d', mid: '#4b6b3c', ground: '#3f2f1d', accent: '#f59e0b', motif: `<g fill="${rgba('#fde68a', 0.12)}"><path d="M0 600 Q230 520 430 590 T860 610 T1600 550 V900 H0 Z"/><rect x="1090" y="320" width="40" height="220"/></g>` },
    northern_route: { top: '#1f2937', mid: '#2d3748', ground: '#4c1d1d', accent: '#fb7185', motif: `<g fill="${rgba('#cbd5e1', 0.12)}"><path d="M0 620 Q200 480 420 560 T860 540 T1600 580 V900 H0 Z"/><path d="M980 640 L1130 280 L1280 640 Z"/></g>` },
    ancient_mechanism: { top: '#0b1020', mid: '#1e3a5f', ground: '#1e293b', accent: '#22d3ee', motif: `<g fill="${rgba('#67e8f9', 0.12)}"><rect x="160" y="300" width="1240" height="26"/><rect x="200" y="240" width="40" height="220"/><rect x="1360" y="200" width="44" height="260"/></g>` },
    ancient_core: { top: '#0b1120', mid: '#263243', ground: '#2f3440', accent: '#93c5fd', motif: `<g fill="${rgba('#93c5fd', 0.14)}"><rect x="260" y="230" width="120" height="310"/><rect x="740" y="180" width="120" height="360"/><rect x="1180" y="250" width="120" height="290"/></g>` },
    endgame_front: { top: '#111827', mid: '#334155', ground: '#452727', accent: '#f87171', motif: `<g fill="${rgba('#f8fafc', 0.12)}"><path d="M0 650 Q260 610 520 650 T1040 670 T1600 630 V900 H0 Z"/><rect x="360" y="420" width="220" height="18"/></g>` },
    final_dungeon: { top: '#15080d', mid: '#3a0d1f', ground: '#2b1217', accent: '#f472b6', motif: `<g fill="${rgba('#f8fafc', 0.08)}"><circle cx="1220" cy="240" r="160"/><path d="M0 680 Q220 600 440 660 T920 640 T1600 670 V900 H0 Z"/></g>` },
  };
  return backdropSvg({ id: `campaign-${key}`, ...configs[key] });
}

function menuHeroSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700" viewBox="0 0 1600 700">
  <defs>
    <linearGradient id="menu-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#581c87"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="700" fill="url(#menu-bg)"/>
  <circle cx="1180" cy="180" r="150" fill="${rgba('#f8fafc', 0.11)}"/>
  <path d="M0 520 Q260 430 500 480 T1040 500 T1600 450 V700 H0 Z" fill="${rgba('#020617', 0.35)}"/>
  <g transform="translate(980 120)">
    <circle cx="120" cy="70" r="56" fill="#f8fafc" opacity="0.92"/>
    <path d="M46 228 Q120 72 194 228 L170 286 L70 286 Z" fill="#60a5fa" stroke="#dbeafe" stroke-width="6"/>
    <path d="M138 158 L228 118 L232 148 L160 180 Z" fill="#facc15" opacity="0.9"/>
    <path d="M70 142 Q120 182 170 142" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
  </g>
  <text x="120" y="170" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="70" font-weight="800">Grandia II Browser Port</text>
  <text x="124" y="230" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="28">Story campaign • combat sandbox • replay lab</text>
</svg>`;
}

function writeAsset(relativePath, content) {
  const url = new URL(relativePath, ROOT);
  ensureDir(new URL('.', url));
  writeFileSync(url, content, 'utf8');
}

ensureDir(new URL('./units/', ROOT));
ensureDir(new URL('./battle/', ROOT));
ensureDir(new URL('./campaign/', ROOT));
ensureDir(new URL('./ui/', ROOT));

for (const [key, preset] of Object.entries(PRESETS)) {
  writeAsset(`./units/${key}.svg`, unitSvg(key, preset));
}

for (const theme of ['forest', 'cavern', 'ruins', 'volcano']) {
  writeAsset(`./battle/${theme}.svg`, battleBackdrop(theme));
}

for (const key of ['south_silesia', 'east_silesia', 'holy_city', 'cyrum_castle', 'sea_route', 'garlan_island', 'northern_route', 'ancient_mechanism', 'ancient_core', 'endgame_front', 'final_dungeon']) {
  writeAsset(`./campaign/${key}.svg`, campaignBackdrop(key));
}

writeAsset('./ui/menu-hero.svg', menuHeroSvg());
console.log('SVG art assets regenerated.');
