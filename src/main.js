import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, DirectionalLight, MeshBuilder, StandardMaterial, Color3, ShadowGenerator, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders';
import { PartyData, BestiaryData } from './data/battle_data.js';
import { BattleSystem } from './system/BattleSystem.js';
import { UIController } from './system/UIController.js';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

// URL parameters
const urlParams = new URLSearchParams(window.location.search);
const useModels = urlParams.get('models') === 'true';

const toggle = document.getElementById('toggle-models');
toggle.checked = useModels;
toggle.addEventListener('change', (e) => {
    window.location.search = `?models=${e.target.checked}`;
});

// Managers
const ui = new UIController();
const battleSystem = new BattleSystem(ui);

function renderPartyCards(party) {
    const container = document.getElementById('party-container');
    container.innerHTML = ''; 
    party.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="char-name">${char.name} <span style="font-size:12px; color:#aaa;">Lv.${char.level}</span></div>
            <div class="stat-row"><span class="stat-label">HP</span><span class="stat-value hp">${char.hp} / ${char.maxHp}</span></div>
            <div class="stat-row"><span class="stat-label">SP</span><span class="stat-value sp">${char.sp} / ${char.maxSp}</span></div>
            <div class="stat-row"><span class="stat-label">MP</span><span class="stat-value mp">${char.mp} / ${char.maxMp}</span></div>
        `;
        container.appendChild(card);
    });
}

function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.1, 0.12, 0.15); 

    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 22, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) - 0.1;
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.4;
    ambientLight.groundColor = new Color3(0.1, 0.1, 0.1);

    const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), scene);
    dirLight.position = new Vector3(20, 40, 20);
    dirLight.intensity = 0.8;

    const shadowGenerator = new ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    const arenaMat = new StandardMaterial("arenaMat", scene);
    arenaMat.diffuseColor = new Color3(0.24, 0.29, 0.36);
    const arena = MeshBuilder.CreateCylinder("arena", { height: 0.5, diameter: 30, tessellation: 64 }, scene);
    arena.position.y = -0.25;
    arena.material = arenaMat;
    arena.receiveShadows = true;

    const ringMat = new StandardMaterial("ringMat", scene);
    ringMat.diffuseColor = new Color3(0.35, 0.43, 0.55);
    ringMat.emissiveColor = new Color3(0.1, 0.15, 0.2);
    const ring = MeshBuilder.CreateTorus("ring", { diameter: 30, thickness: 0.3, tessellation: 64 }, scene);
    ring.position.y = 0.05;
    ring.material = ringMat;

    // --- PROCEDURAL GENERATORS ---

    function createRyudoFallback(id, color) {
        const root = MeshBuilder.CreateBox(id + "_root", { size: 0.1 }, scene);
        root.isVisible = false;

        const mat = new StandardMaterial(id + "_mat", scene);
        mat.diffuseColor = Color3.FromHexString(color);

        const skin = new StandardMaterial(id + "_skin", scene);
        skin.diffuseColor = new Color3(1, 0.8, 0.6);

        // Body
        const body = MeshBuilder.CreateCylinder(id + "_body", { height: 2.5, diameter: 1.0 }, scene);
        body.parent = root;
        body.position.y = 1.25;
        body.material = mat;

        // Head
        const head = MeshBuilder.CreateSphere(id + "_head", { diameter: 1.1 }, scene);
        head.parent = root;
        head.position.y = 2.5 + 0.2;
        head.material = skin;

        // Nose (facing direction)
        const nose = MeshBuilder.CreateBox(id + "_nose", { size: 0.3 }, scene);
        nose.parent = head;
        nose.position = new Vector3(0, 0, 0.55);
        nose.material = skin;

        // Sword!
        const swordMat = new StandardMaterial(id + "_sword", scene);
        swordMat.diffuseColor = new Color3(0.7, 0.7, 0.75); // Silver
        const sword = MeshBuilder.CreateBox(id + "_sword", { width: 0.15, height: 2.2, depth: 0.4 }, scene);
        sword.parent = root;
        sword.position = new Vector3(0.7, 1.5, 0.5); // Hold in right hand, pointing slightly forward
        sword.rotation.x = Math.PI / 4; 
        sword.material = swordMat;

        shadowGenerator.addShadowCaster(body, true);
        shadowGenerator.addShadowCaster(head, true);
        shadowGenerator.addShadowCaster(sword, true);

        return root;
    }

    function createSpiderFallback(id, color) {
        const root = MeshBuilder.CreateBox(id + "_root", { size: 0.1 }, scene);
        root.isVisible = false;

        // Важно: в Babylon.js меш без позиции имеет 0,0,0, но оригинальная позиция клонируется при добавлении в систему.
        // Заставим UIController находить body корректно


        const mat = new StandardMaterial(id + "_mat", scene);
        mat.diffuseColor = Color3.FromHexString(color);

        // Body (Flattened sphere)
        const body = MeshBuilder.CreateSphere(id + "_body", { diameterX: 2.2, diameterY: 1.0, diameterZ: 2.5 }, scene);
        body.parent = root;
        body.position.y = 0.6; // Low to the ground
        body.material = mat;

        // Eyes (Multiple little red spheres in front)
        const eyeMat = new StandardMaterial(id + "_eye", scene);
        eyeMat.diffuseColor = new Color3(1, 0, 0); // Red
        eyeMat.emissiveColor = new Color3(0.5, 0, 0);

        for(let i=0; i<4; i++) {
            const eye = MeshBuilder.CreateSphere(id + "_eye"+i, { diameter: 0.25 }, scene);
            eye.parent = body;
            const xOffset = -0.45 + (i * 0.3);
            eye.position = new Vector3(xOffset, 0.2, 1.15); // Front of the body
            eye.material = eyeMat;
        }

        // Legs
        const legMat = new StandardMaterial(id + "_leg", scene);
        legMat.diffuseColor = new Color3(0.1, 0.1, 0.1); // Dark legs

        for(let i=0; i<4; i++) {
            // Create a long thin cylinder that goes through the body to stick out both sides
            const leg = MeshBuilder.CreateCylinder(id + "_leg"+i, { height: 3.5, diameter: 0.15 }, scene);
            leg.parent = body;
            // Rotate them out like spider legs
            leg.rotation.y = (Math.PI / 6) * (i - 1.5);
            leg.rotation.x = Math.PI / 2; // Flat on the ground
            leg.position.y = -0.2; // Legs slightly below center of body
            leg.material = legMat;
            shadowGenerator.addShadowCaster(leg, true);
        }

        shadowGenerator.addShadowCaster(body, true);
        
        return root;
    }

    async function createUnit(data, x, z) {
        let rootMesh;
        const fileName = data.id === "ryudo" ? "ryudo.glb" : "spider.glb";

        if (useModels) {
            try {
                const result = await SceneLoader.ImportMeshAsync("", "/assets/models/", fileName, scene);
                rootMesh = result.meshes[0];
                result.meshes.forEach(m => {
                    shadowGenerator.addShadowCaster(m, true);
                    m.receiveShadows = true;
                });
                console.log(`Loaded real model for ${data.id}`);
            } catch (error) {
                console.warn(`Failed to load ${fileName}. Try disabling 3D models in settings.`);
                rootMesh = data.id === "ryudo" 
                    ? createRyudoFallback(data.id, data.color) 
                    : createSpiderFallback(data.id, data.color);
            }
        } else {
            // Direct Fallback mode
            rootMesh = data.id === "ryudo" 
                ? createRyudoFallback(data.id, data.color) 
                : createSpiderFallback(data.id, data.color);
        }

        rootMesh.position = new Vector3(x, 0, z);
        rootMesh.lookAt(Vector3.Zero());

        const unitData = { id: data.id, data: data, mesh: rootMesh };
        
        // Регистрируем юнит в системе боя
        battleSystem.addUnit(unitData, data.id === "ryudo");

        return unitData;
    }

    async function setupBattle() {
        ui.setBabylonContext(scene, camera, engine); // Передаем ссылки на 3D сцену в UI

        const ryudo = PartyData.ryudo;
        const spider = BestiaryData.mottledSpider;

        renderPartyCards([ryudo]);

        await Promise.all([
            createUnit(ryudo, -6, 0),
            createUnit({ ...spider, id: "spider1" }, 4, 3), 
            createUnit({ ...spider, id: "spider2" }, 5, -2) 
        ]);
    }

    setupBattle();
    return scene;
}

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
    
    // Обновляем логику боя с учетом дельты времени (в секундах)
    const deltaTime = engine.getDeltaTime() / 1000;
    battleSystem.update(deltaTime);
});
window.addEventListener("resize", () => engine.resize());
