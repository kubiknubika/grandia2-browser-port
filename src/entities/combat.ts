export class Fighter { name: string; hp = 100; atb = 0; constructor(n:string){this.name=n;} attack(t: Fighter){ t.hp -= 10; } }
export const fighters: Fighter[] = [];
export function tick() { for(const f of fighters) f.atb += f.hp>0 ? 5:0; }
// Рьюдо: HP ~5000 (на высоких уровнях), Speed высокая. Троглодит: HP 980, Speed средняя.
export const ryudo = new Fighter("Ryudo"); ryudo.hp = 5000; ryudo.atb = 10; (ryudo as any).stats = {str: 120, vit: 90, agi: 110, spd: 60};
export const troglodyte = new Fighter("Troglodyte"); troglodyte.hp = 980; troglodyte.atb = 5; (troglodyte as any).stats = {str: 45, vit: 30, agi: 35, spd: 20};
export interface Stats { str: number; vit: number; agi: number; spd: number; }
export function setStats(f: Fighter, s: Stats) { (f as any).stats = s; }
export class IPGauge { progress = 0; speed: number; constructor(s: number){ this.speed = s; } tick(){ this.progress += this.speed; if(this.progress >= 100) this.progress = 0; } }
export class IPBarVisual { x=0; y=0; width=400; height=30; draw(ctx: CanvasRenderingContext2D, entities: Fighter[]){ ctx.fillStyle="#333"; ctx.fillRect(this.x,this.y,this.width,this.height); entities.forEach((e,i)=>{ const px = this.x + (i+1)*(this.width/entities.length); ctx.fillStyle="red"; ctx.fillRect(px, this.y+10, 10, 10); }); } }
export function cancelTarget(target: Fighter, attacker: Fighter) { if(target.atb > 33 && target.atb < 100) target.atb = 0; console.log(attacker.name + " cancelled " + target.name); }
export function criticalAttack(attacker: Fighter, target: Fighter) { target.hp -= 15; target.atb -= 20; }
export function defend(f: Fighter) { (f as any).defending = true; }
export function applyDamage(f: Fighter, dmg: number) { if((f as any).defending){ dmg *= 0.4; (f as any).defending = false; } f.hp -= dmg; }
export interface Pos { x: number; y: number; }
export function distance(a: Pos, b: Pos) { const dx = a.x-b.x, dy = a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }
export function command(c: string, f: Fighter, target?: Fighter) { if(f.hp<=0) return; if(c=="Combo" && target) target.hp -= 10; if(c=="Critical" && target) { target.hp -= 15; target.atb = Math.max(0, target.atb-20); } }
export function aiTurn(enemy: Fighter, players: Fighter[]) { const target = players.reduce((a,b)=>a.hp<b.hp?a:b); if(distance({x:0,y:0}, {x:target.hp,y:0}) < 10) command("Combo", enemy, target); else defend(enemy); }
export class Anim { start=0; duration=300; update(now:number){ return (now-this.start)/this.duration; } }
export function renderUI(ctx: CanvasRenderingContext2D, fighters: Fighter[]) { fighters.slice(0,6).forEach((f,i)=>{ ctx.fillText(f.name + " HP:" + f.hp, 10, 20+i*15); }); }
export function calcDmg(attacker: Fighter, defender: Fighter, isMagic=false) { const base = isMagic ? (attacker as any).stats?.mag*2 - (defender as any).stats?.men : (attacker as any).stats?.str*2 - (defender as any).stats?.vit; return Math.max(1, Math.round(base || 10)); }
export function testBalance() { const p = new Fighter("Test"); p.hp=500; const e = new Fighter("Enemy"); e.hp=500; for(let i=0;i<10;i++){ command("Combo",p,e); if(e.hp<=0) break; command("Combo",e,p); if(p.hp<=0) break; } console.log("Test balance: Player HP", p.hp, "Enemy HP", e.hp); return p.hp > e.hp ? "Player too strong" : p.hp < e.hp ? "Player too weak" : "Balanced"; }
export function runInfiniteTests(durationMs: number) { const start = Date.now(); let wins = 0, total = 0; while(Date.now() - start < durationMs) { const p = new Fighter("Bot"); p.hp=500; (p as any).stats={str:120,vit:90}; const e = new Fighter("Mob"); e.hp=500; (e as any).stats={str:45,vit:30}; let turn=0; while(p.hp>0 && e.hp>0 && turn<20){ if(turn%2===0) command("Combo",p,e); else command("Combo",e,p); turn++; } if(p.hp>e.hp) wins++; total++; } return { wins, total, rate: wins/total }; }
export interface WeightProfile { desc: string; weights: number[]; }
export const profiles: WeightProfile[] = [];
export function saveProfile(desc: string, w: number[]) { profiles.push({desc, weights: [...w]}); localStorage.setItem('ga_profiles', JSON.stringify(profiles)); }
export function loadProfiles() { const s = localStorage.getItem('ga_profiles'); if(s) Object.assign(profiles, JSON.parse(s)); }
