export class Player {}
export function movePlayer(x: number, y: number) {
  return { x: x + 2, y: y + 1 };
}
export class Camera {
  x = 0; y = 0;
  follow(target: {x:number,y:number}) { this.x = target.x; this.y = target.y; }
}
export function animateAttack() { console.log("slash!"); }
export let hp = 100; export function takeDamage(d: number) { hp -= d; }
export function saveToStorage(data: object) { localStorage.setItem("save", JSON.stringify(data)); }
export function loadFromStorage() { return JSON.parse(localStorage.getItem("save")||"{}"); }
export function startDialog(text: string) { console.log(text); }
