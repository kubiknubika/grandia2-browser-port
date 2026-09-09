import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, DirectionalLight, MeshBuilder, StandardMaterial, Color3, ShadowGenerator, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders';
import { DEFAULT_ENCOUNTER, DEFAULT_INVENTORY, makeUnitData } from './data/battle_data.js';
import { createUnitModel } from './render/models.js';
import { Animator } from './render/Animator.js';
import { BattleCamera } from './render/BattleCamera.js';
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
const animator = new Animator();
let battleCamera = null;
const battleSystem = new BattleSystem(ui, { inventory: DEFAULT_INVENTORY, animator });

// Карточки партии рисует и обновляет UIController (HP-бары живут по ходу боя),
// поэтому статического рендерера здесь больше нет.

function createScene() {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.1, 0.12, 0.15); 

    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 22, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) - 0.1;
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    // Камера следит за тем, кто бьёт: раньше она стояла неподвижно и
    // приёмы происходили где-то вдалеке без всякого акцента.
    battleCamera = new BattleCamera(camera);
    battleSystem.camera = battleCamera;

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

    // --- МОДЕЛИ ---------------------------------------------------------
    // Процедурные модели с суставами живут в src/render/models.js,
    // а их анимацию считает Animator. Здесь только регистрация в сцене.

    function buildModel(data) {
        const model = createUnitModel(scene, data);
        for (const mesh of model.meshes) {
            shadowGenerator.addShadowCaster(mesh, true);
            mesh.receiveShadows = true;
        }
        return model;
    }

    // Vite serves index.html for unknown paths, so a missing .glb returns
    // "200 OK" with an HTML body instead of a network error. Check the glTF
    // magic bytes before handing the file to the loader.
    async function glbExists(url) {
        try {
            const response = await fetch(url, { headers: { Range: 'bytes=0-3' } });
            if (!response.ok) return false;
            const magic = new Uint8Array(await response.arrayBuffer()).subarray(0, 4);
            return String.fromCharCode(...magic) === 'glTF';
        } catch (error) {
            return false;
        }
    }

    async function createUnit(data, isPlayer) {
        const { x, z } = data.position;
        const fileName = data.meshKind === "spider" ? "spider.glb" : "ryudo.glb";

        let model = null;

        // Готовые GLB опциональны: если файла нет, играем на процедурных
        // моделях, которые тоже анимируются.
        if (useModels) {
            const modelUrl = `/assets/models/${fileName}`;
            if (await glbExists(modelUrl)) {
                try {
                    const result = await SceneLoader.ImportMeshAsync("", "/assets/models/", fileName, scene);
                    const imported = result.meshes[0];
                    result.meshes.forEach((m) => {
                        shadowGenerator.addShadowCaster(m, true);
                        m.receiveShadows = true;
                    });
                    model = { root: imported, meshes: result.meshes, rig: { kind: 'imported' } };
                    console.log(`Loaded real model for ${data.id}`);
                } catch (error) {
                    console.warn(`Failed to parse ${fileName}, using procedural model.`, error);
                }
            } else {
                console.warn(
                    `${fileName} not found in public/assets/models/. `
                    + `Run "python3 download_model.py" to fetch it. Using procedural model.`
                );
                ui.showModelWarning();
            }
        }

        if (!model) {
            model = buildModel(data);
        }

        model.root.position = new Vector3(x, 0, z);
        model.root.lookAt(Vector3.Zero());

        const unitData = { id: data.id, data, mesh: model.root };

        // Регистрируем юнит в системе боя и в аниматоре.
        battleSystem.addUnit(unitData, isPlayer);
        if (model.rig.kind !== 'imported') {
            animator.register(data.id, model);
        }

        return unitData;
    }

    async function setupBattle() {
        ui.setBabylonContext(scene, camera, engine); // Передаем ссылки на 3D сцену в UI

        // Юниты собираются из канонических PRESETS (combat.js) через makeUnitData,
        // поэтому статы боя и статы симулятора баланса всегда совпадают.
        const build = ({ presetKey, ...overrides }) => makeUnitData(presetKey, overrides);

        await Promise.all([
            ...DEFAULT_ENCOUNTER.players.map((entry) => createUnit(build(entry), true)),
            ...DEFAULT_ENCOUNTER.enemies.map((entry) => createUnit(build(entry), false)),
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
    animator.update(battleSystem.units, deltaTime);
    battleCamera?.update(battleSystem.units, deltaTime);
});
window.addEventListener("resize", () => engine.resize());
