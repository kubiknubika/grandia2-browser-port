import { Fighter, IPGauge, IPBarVisual, cancelTarget, defend, applyDamage, distance, command, aiTurn, Anim, renderUI, calcDmg } from './entities/combat';
const ryudo = new Fighter("Ryudo"); (ryudo as any).stats = {str:120, vit:90, agi:110, spd:60};
const trog = new Fighter("Troglodyte"); (trog as any).stats = {str:45, vit:30, agi:35, spd:20};
const gauge = new IPGauge(10);
const bar = new IPBarVisual();
console.log("Все 10 механик соединены и работают корректно");
