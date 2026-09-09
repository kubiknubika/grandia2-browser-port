import { Vector3, Matrix, Color3 } from '@babylonjs/core';

// Управляет HTML/CSS элементами
export class UIController {
    constructor() {
        this.gaugeContainer = document.getElementById('ip-gauge-container');
        this.gaugeIcons = {};
        
        this.gaugeContainer.innerHTML = `
            <div class="gauge-line"></div>
            <div class="com-marker"></div>
        `;

        const style = document.createElement('style');
        style.innerHTML = `
            .gauge-line {
                position: absolute; top: 50%; left: 5%; right: 5%;
                height: 2px; background: #5a6e8c; transform: translateY(-50%);
            }
            .com-marker {
                position: absolute; top: 0; left: 80%; width: 2px; height: 100%;
                background: #e74c3c; box-shadow: 0 0 5px #e74c3c;
            }
            .ip-icon {
                position: absolute; top: 50%; width: 32px; height: 32px;
                border-radius: 50%; border: 2px solid white;
                transform: translate(-50%, -50%); display: flex;
                align-items: center; justify-content: center;
                font-weight: bold; font-size: 14px; color: white;
                text-shadow: 1px 1px 2px black; box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
                transition: left 0.1s linear; z-index: 10;
            }
            .ip-icon.enemy { border-color: #e74c3c; }
            .ip-icon.player { border-color: #3498db; }
        `;
        document.head.appendChild(style);
    }

    // Сохраняем ссылки на 3D сцену, чтобы можно было проецировать координаты
    setBabylonContext(scene, camera, engine) {
        this.scene = scene;
        this.camera = camera;
        this.engine = engine;
    }

    addUnitToGauge(unit) {
        const icon = document.createElement('div');
        icon.className = `ip-icon ${unit.isPlayer ? 'player' : 'enemy'}`;
        icon.style.background = unit.color;
        icon.innerText = unit.name.charAt(0);
        icon.style.left = '5%'; 

        this.gaugeContainer.appendChild(icon);
        this.gaugeIcons[unit.id] = icon;
    }

    updateUnitOnGauge(unit) {
        const icon = this.gaugeIcons[unit.id];
        if (icon) {
            const visualPercent = 5 + (unit.ip / 100) * 90; 
            icon.style.left = `${visualPercent}%`;
            
            if (unit.state === "ACT" || unit.state === "EXECUTE") {
                icon.style.boxShadow = `0 0 10px ${unit.color}`;
            } else {
                icon.style.boxShadow = `2px 2px 5px rgba(0,0,0,0.5)`;
            }
        }
    }

    showCommandRing(unit, onCommandSelected) {
        // Мы убрали логику AI отсюда. Сюда попадает только игрок.
        
        const ring = document.createElement('div');
        ring.id = 'command-ring';
        ring.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 10px; color: #f1c40f;">${unit.name}'s Turn</div>
            <button class="cmd-btn" id="btn-combo">Combo (2 hits)</button>
            <button class="cmd-btn" id="btn-critical">Critical (Cancel)</button>
        `;

        Object.assign(ring.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(20, 30, 45, 0.95)', padding: '20px', borderRadius: '12px',
            border: '2px solid #5a6e8c', display: 'flex', flexDirection: 'column',
            gap: '10px', pointerEvents: 'auto', boxShadow: '0 0 20px rgba(0,0,0,0.8)'
        });

        const style = document.createElement('style');
        style.innerHTML = `
            .cmd-btn {
                background: #34495e; color: white; border: 1px solid #7f8c8d;
                padding: 10px 20px; border-radius: 6px; cursor: pointer;
                font-size: 16px; font-weight: bold; text-transform: uppercase; transition: background 0.2s;
            }
            .cmd-btn:hover { background: #e74c3c; border-color: #c0392b; }
        `;
        document.head.appendChild(style);
        document.getElementById('ui-layer').appendChild(ring);

        // Обработка кликов
        const closeAndProceed = (cmd) => {
            ring.remove();
            onCommandSelected(cmd);
        };

        document.getElementById('btn-combo').onclick = () => closeAndProceed('combo');
        document.getElementById('btn-critical').onclick = () => closeAndProceed('critical');
    }

    // Отображает всплывающий урон над 3D-моделью
    showDamage(targetMesh, damageAmount) {
        if (!this.scene || !this.camera) return;

        // Берем позицию модели и поднимаем над головой
        const pos3d = targetMesh.getAbsolutePosition().clone();
        pos3d.y += 3.5; 

        // Проецируем 3D-координату в 2D координаты экрана
        const transform = this.scene.getTransformMatrix();
        const viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());
        const pos2d = Vector3.Project(pos3d, Matrix.Identity(), transform, viewport);

        const div = document.createElement('div');
        div.innerText = damageAmount;
        Object.assign(div.style, {
            position: 'absolute',
            left: `${pos2d.x}px`,
            top: `${pos2d.y}px`,
            color: '#fff',
            fontWeight: '900',
            fontSize: '36px',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 4px 10px rgba(255,0,0,0.5)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            transition: 'top 1s cubic-bezier(0, 0, 0.2, 1), opacity 1s ease-in'
        });
        
        document.getElementById('ui-layer').appendChild(div);

        // CSS-анимация: цифра отлетает вверх и плавно исчезает
        setTimeout(() => {
            div.style.top = `${pos2d.y - 120}px`;
            div.style.opacity = '0';
        }, 50);

        setTimeout(() => { div.remove(); }, 1050);
    }

    // Мигает модель красным при получении урона
    flashMesh(mesh) {
        // Ищем тело среди дочерних элементов (у наших заглушек оно называется *_body)
        const body = mesh.getChildren().find(c => c.name.includes("_body"));
        if (body && body.material) {
            const oldEmissive = body.material.emissiveColor;
            body.material.emissiveColor = new Color3(1, 0, 0); // Красный свет
            
            setTimeout(() => {
                body.material.emissiveColor = oldEmissive || new Color3(0,0,0);
            }, 200); // Вернуть как было через 200мс
        }
    }
}