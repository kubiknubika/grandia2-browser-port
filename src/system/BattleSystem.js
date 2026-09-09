import { Vector3 } from '@babylonjs/core';

// Менеджер боевой системы (IP System & Movement)
export class BattleSystem {
    constructor(uiController) {
        this.units = []; 
        this.isPaused = false; 
        this.ui = uiController; 
    }

    addUnit(unitData, isPlayer) {
        const unit = {
            id: unitData.id,
            name: unitData.data.name,
            isPlayer: isPlayer,
            stats: unitData.data.stats,
            color: unitData.data.color,
            ip: 0,           
            state: "WAIT",   
            mesh: unitData.mesh,
            originalPosition: unitData.mesh.position.clone() // Сохраняем начальную позицию
        };
        
        this.units.push(unit);
        this.ui.addUnitToGauge(unit);
    }

    update(deltaTime) {
        if (this.isPaused) return;

        let reachedCom = null;

        for (const unit of this.units) {
            if (unit.state === "EXECUTE") {
                this.handleExecution(unit, deltaTime);
                continue; 
            }

            if (unit.state === "WAIT") {
                const speed = unit.stats.act / 2; 
                unit.ip += speed * deltaTime;

                if (unit.ip >= 80) { 
                    unit.ip = 80;
                    unit.state = "COM";
                    
                    // Если это враг, задаем ему внутренний таймер "раздумий",
                    // чтобы не останавливать игру паузой (isPaused = true)
                    if (!unit.isPlayer) {
                        unit.aiThinkTimer = 0.5; // AI думает полсекунды
                    } else if (!reachedCom) {
                        reachedCom = unit; // Игрок ставит игру на паузу
                    }
                }
            } 
            else if (unit.state === "COM" && !unit.isPlayer) {
                // Логика AI внутри главного цикла (без setTimeout)
                unit.aiThinkTimer -= deltaTime;
                if (unit.aiThinkTimer <= 0) {
                    unit.commandType = 'combo'; // Враг всегда бьет Combo
                    unit.state = "ACT";
                }
            }
            else if (unit.state === "ACT") {
                const actSpeed = unit.stats.act / 1.5;
                unit.ip += actSpeed * deltaTime;

                if (unit.ip >= 100) {
                    unit.ip = 100;
                    unit.state = "EXECUTE";
                }
            }
            
            this.ui.updateUnitOnGauge(unit);
        }

        // Ставим игру на паузу только для хода Игрока
        if (reachedCom) {
            this.isPaused = true;
            this.ui.showCommandRing(reachedCom, (commandType) => {
                reachedCom.commandType = commandType; 
                reachedCom.state = "ACT";
                this.isPaused = false;
            });
        }
    }

    handleExecution(unit, deltaTime) {
        if (!unit.actionState) {
            unit.actionState = "RUN_FORWARD";
            unit.hitsDone = 0;
            unit.maxHits = unit.commandType === "critical" ? 1 : 2; // Critical 1 удар, Combo 2 удара
            
            const enemies = this.units.filter(u => u.isPlayer !== unit.isPlayer);
            unit.target = enemies[Math.floor(Math.random() * enemies.length)];
        }

        const mesh = unit.mesh;
        const speed = unit.stats.mov; // Увеличил скорость бега в 4 раза

        if (unit.actionState === "RUN_FORWARD") {
            const targetPos = unit.target.mesh.position.clone();
            targetPos.y = mesh.position.y; 

            mesh.lookAt(targetPos);
            
            const dist = Vector3.Distance(mesh.position, targetPos);
            if (dist > 2.0) { 
                const dir = targetPos.subtract(mesh.position).normalize();
                mesh.position.addInPlace(dir.scale(speed * deltaTime));
            } else {
                // Добежали, начинаем бить
                unit.actionState = "ATTACK";
                unit.attackTimer = 0; 
            }
        } 
        else if (unit.actionState === "ATTACK") {
            unit.attackTimer -= deltaTime;
            
            // Если таймер удара истек (наносим удар)
            if (unit.attackTimer <= 0) {
                // Считаем урон
                let dmg = Math.max(1, Math.floor(unit.stats.str * (0.8 + Math.random()*0.4) - unit.target.stats.vit * 0.5));
                
                // Если это критический удар, урон выше, и он отбрасывает цель по IP
                if (unit.commandType === "critical") {
                    dmg = Math.floor(dmg * 1.5);
                    this.applyCancelEffect(unit.target);
                }

                this.ui.showDamage(unit.target.mesh, dmg);
                this.ui.flashMesh(unit.target.mesh);

                unit.hitsDone++;

                if (unit.hitsDone < unit.maxHits) {
                    // Ждем 0.4 сек перед вторым ударом комбо
                    unit.attackTimer = 0.4;
                } else {
                    // Все удары нанесены, убегаем через 0.2 сек
                    unit.actionState = "RUN_BACK";
                }
            }
        } 
        else if (unit.actionState === "RUN_BACK") {
            const homePos = unit.originalPosition;
            mesh.lookAt(homePos);
            
            const dist = Vector3.Distance(mesh.position, homePos);
            if (dist > 0.2) {
                const dir = homePos.subtract(mesh.position).normalize();
                mesh.position.addInPlace(dir.scale(speed * deltaTime));
            } else {
                mesh.position.copyFrom(homePos);
                mesh.lookAt(Vector3.Zero()); 
                
                // Сброс
                unit.actionState = null;
                unit.target = null;
                unit.state = "WAIT";
                unit.ip = 0;
            }
        }
    }

    applyCancelEffect(targetUnit) {
        // Cancel/Отбрасывание по шкале
        // Если враг уже прошел черту COM (готовит атаку) - это CANCEL (жесткое прерывание)
        if (targetUnit.state === "ACT" || targetUnit.state === "COM") {
            targetUnit.state = "WAIT";
            targetUnit.ip = 40; // Откидываем его на середину шкалы
            this.ui.showDamage(targetUnit.mesh, "CANCEL!"); // Показываем надпись
        } else {
            // Обычное отбрасывание (Delay)
            targetUnit.ip = Math.max(0, targetUnit.ip - 25);
        }
    }
}