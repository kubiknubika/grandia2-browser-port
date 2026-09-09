/**
 * Процедурные модели бойцов.
 *
 * Внешние CDN с готовыми GLB в этом окружении недоступны, поэтому модели
 * собираются из примитивов. Ключевое отличие от прежних заглушек: детали
 * висят на иерархии суставов (TransformNode), а не приклеены к корню.
 * Благодаря этому Animator может вращать плечо, локоть, бедро и колено —
 * то есть модель можно анимировать, а не только двигать целиком.
 *
 * Каждая фабрика возвращает { root, rig, meshes }:
 *   root   — TransformNode, его двигает BattleSystem;
 *   rig    — именованные суставы для анимации;
 *   meshes — плоский список мешей (тени, подсветка попадания).
 */

import { Color3, MeshBuilder, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core';

function makeMaterial(scene, name, hex, { emissive = null, specular = 0.2 } = {}) {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.FromHexString(hex);
    material.specularColor = new Color3(specular, specular, specular);
    if (emissive) material.emissiveColor = Color3.FromHexString(emissive);
    return material;
}

/** Осветлить/затемнить цвет — чтобы палитра юнита была производной от его color. */
function shade(hex, factor) {
    const base = Color3.FromHexString(hex);
    const mix = (channel) => Math.max(0, Math.min(1, factor > 1
        ? channel + (1 - channel) * (factor - 1)
        : channel * factor));
    return new Color3(mix(base.r), mix(base.g), mix(base.b)).toHexString();
}

function joint(scene, name, parent, position) {
    const node = new TransformNode(name, scene);
    node.parent = parent;
    node.position = position;
    return node;
}

/**
 * Гуманоид: Рюдо (мечник) и Елена (магичка) отличаются оружием,
 * палитрой и силуэтом, но используют один риг.
 */
export function createHumanoid(scene, { id, color = '#3498db', weapon = 'sword', accent = null } = {}) {
    const meshes = [];
    const track = (mesh) => { meshes.push(mesh); return mesh; };

    const cloth = makeMaterial(scene, `${id}_cloth`, color);
    const clothDark = makeMaterial(scene, `${id}_clothDark`, shade(color, 0.65));
    const trim = makeMaterial(scene, `${id}_trim`, accent ?? shade(color, 1.45));
    const skin = makeMaterial(scene, `${id}_skin`, '#f2c9a0');
    const hair = makeMaterial(scene, `${id}_hair`, weapon === 'staff' ? '#f5d76e' : '#3b2b22');
    const steel = makeMaterial(scene, `${id}_steel`, '#c9ced6', { specular: 0.8 });
    const leather = makeMaterial(scene, `${id}_leather`, '#4a3728');

    const root = new TransformNode(`${id}_root`, scene);

    // --- Скелет -----------------------------------------------------------
    const hips = joint(scene, `${id}_hips`, root, new Vector3(0, 1.45, 0));
    const torso = joint(scene, `${id}_torso`, hips, Vector3.Zero());
    const neck = joint(scene, `${id}_neck`, torso, new Vector3(0, 1.02, 0));
    // Плечи выносим за радиус груди (0.34), иначе руки тонут в торсе.
    const shoulderL = joint(scene, `${id}_shoulderL`, torso, new Vector3(-0.52, 0.8, 0));
    const shoulderR = joint(scene, `${id}_shoulderR`, torso, new Vector3(0.52, 0.8, 0));
    const elbowL = joint(scene, `${id}_elbowL`, shoulderL, new Vector3(0, -0.52, 0));
    const elbowR = joint(scene, `${id}_elbowR`, shoulderR, new Vector3(0, -0.52, 0));
    const hipL = joint(scene, `${id}_hipL`, hips, new Vector3(-0.21, -0.08, 0));
    const hipR = joint(scene, `${id}_hipR`, hips, new Vector3(0.21, -0.08, 0));
    const kneeL = joint(scene, `${id}_kneeL`, hipL, new Vector3(0, -0.62, 0));
    const kneeR = joint(scene, `${id}_kneeR`, hipR, new Vector3(0, -0.62, 0));

    // --- Туловище ---------------------------------------------------------
    // Имя *_body важно: UIController подсвечивает его при попадании.
    const chest = track(MeshBuilder.CreateCapsule(`${id}_body`, {
        height: 1.05, radius: 0.34, capSubdivisions: 6, subdivisions: 6,
    }, scene));
    chest.parent = torso;
    chest.position.y = 0.55;
    chest.material = cloth;

    const belt = track(MeshBuilder.CreateCylinder(`${id}_belt`, {
        height: 0.14, diameter: 0.68, tessellation: 16,
    }, scene));
    belt.parent = torso;
    belt.position.y = 0.06;
    belt.material = leather;

    // Плащ/накидка — силуэт, который отличает персонажа издалека.
    const cape = track(MeshBuilder.CreateBox(`${id}_cape`, {
        width: 0.6, height: 1.0, depth: 0.06,
    }, scene));
    cape.parent = torso;
    cape.position.set(0, 0.58, -0.34);
    cape.rotation.x = -0.06;
    cape.material = weapon === 'staff' ? trim : clothDark;

    // --- Голова -----------------------------------------------------------
    const head = track(MeshBuilder.CreateSphere(`${id}_head`, {
        diameterX: 0.5, diameterY: 0.56, diameterZ: 0.5,
    }, scene));
    head.parent = neck;
    head.position.y = 0.28;
    head.material = skin;

    const hairMesh = track(MeshBuilder.CreateSphere(`${id}_hair`, {
        diameterX: 0.54, diameterY: 0.44, diameterZ: 0.54, slice: 0.62,
    }, scene));
    hairMesh.parent = head;
    hairMesh.position.y = 0.1;
    hairMesh.material = hair;

    // Взгляд: чтобы было видно, куда повёрнут юнит.
    for (const side of [-1, 1]) {
        const eye = track(MeshBuilder.CreateSphere(`${id}_eye${side > 0 ? 'R' : 'L'}`, {
            diameter: 0.075,
        }, scene));
        eye.parent = head;
        eye.position.set(0.1 * side, 0.02, 0.23);
        eye.material = makeMaterial(scene, `${id}_eyeMat${side}`, '#20232a');
    }

    // --- Руки и ноги ------------------------------------------------------
    const limb = (name, parent, height, radius, material) => {
        const mesh = track(MeshBuilder.CreateCapsule(name, {
            height, radius, capSubdivisions: 4, subdivisions: 4,
        }, scene));
        mesh.parent = parent;
        mesh.position.y = -height / 2 + radius * 0.5;
        mesh.material = material;
        return mesh;
    };

    limb(`${id}_upperArmL`, shoulderL, 0.54, 0.12, cloth);
    limb(`${id}_upperArmR`, shoulderR, 0.54, 0.12, cloth);
    const foreArmL = limb(`${id}_foreArmL`, elbowL, 0.5, 0.105, skin);
    const foreArmR = limb(`${id}_foreArmR`, elbowR, 0.5, 0.105, skin);
    limb(`${id}_thighL`, hipL, 0.64, 0.15, clothDark);
    limb(`${id}_thighR`, hipR, 0.64, 0.15, clothDark);
    limb(`${id}_shinL`, kneeL, 0.62, 0.13, clothDark);
    limb(`${id}_shinR`, kneeR, 0.62, 0.13, clothDark);

    for (const [name, parent] of [[`${id}_footL`, kneeL], [`${id}_footR`, kneeR]]) {
        const foot = track(MeshBuilder.CreateBox(name, { width: 0.2, height: 0.12, depth: 0.34 }, scene));
        foot.parent = parent;
        foot.position.set(0, -0.6, 0.07);
        foot.material = leather;
    }

    // --- Оружие в правой руке --------------------------------------------
    const hand = joint(scene, `${id}_hand`, elbowR, new Vector3(0, -0.52, 0));
    const weaponPivot = joint(scene, `${id}_weaponPivot`, hand, Vector3.Zero());

    if (weapon === 'sword') {
        const blade = track(MeshBuilder.CreateBox(`${id}_blade`, {
            width: 0.1, height: 1.5, depth: 0.03,
        }, scene));
        blade.parent = weaponPivot;
        blade.position.y = 0.72;
        blade.material = steel;

        const guard = track(MeshBuilder.CreateBox(`${id}_guard`, {
            width: 0.34, height: 0.07, depth: 0.09,
        }, scene));
        guard.parent = weaponPivot;
        guard.material = trim;

        const grip = track(MeshBuilder.CreateCylinder(`${id}_grip`, {
            height: 0.26, diameter: 0.075, tessellation: 8,
        }, scene));
        grip.parent = weaponPivot;
        grip.position.y = -0.15;
        grip.material = leather;
    } else {
        const shaft = track(MeshBuilder.CreateCylinder(`${id}_shaft`, {
            height: 1.75, diameter: 0.07, tessellation: 8,
        }, scene));
        shaft.parent = weaponPivot;
        shaft.position.y = 0.5;
        shaft.material = leather;

        const orb = track(MeshBuilder.CreateSphere(`${id}_orb`, { diameter: 0.26 }, scene));
        orb.parent = weaponPivot;
        orb.position.y = 1.4;
        orb.material = makeMaterial(scene, `${id}_orbMat`, accent ?? '#c084fc', {
            emissive: shade(accent ?? '#c084fc', 0.55),
        });

        const ringMesh = track(MeshBuilder.CreateTorus(`${id}_orbRing`, {
            diameter: 0.4, thickness: 0.035, tessellation: 20,
        }, scene));
        ringMesh.parent = weaponPivot;
        ringMesh.position.y = 1.4;
        ringMesh.rotation.x = Math.PI / 2.6;
        ringMesh.material = trim;
    }

    // Поза покоя: руки чуть разведены, оружие наготове.
    shoulderL.rotation.z = 0.16;
    shoulderR.rotation.z = -0.16;
    elbowL.rotation.x = -0.24;
    elbowR.rotation.x = -0.35;
    weaponPivot.rotation.x = weapon === 'sword' ? -0.5 : 0;

    return {
        root,
        meshes,
        rig: {
            kind: 'humanoid',
            hips, torso, neck, head,
            shoulderL, shoulderR, elbowL, elbowR,
            hipL, hipR, kneeL, kneeR,
            hand, weaponPivot, cape,
            foreArmL, foreArmR,
        },
    };
}

/** Паук: 8 суставчатых ног, брюшко, жвалы и гроздь глаз. */
export function createSpider(scene, { id, color = '#8e44ad' } = {}) {
    const meshes = [];
    const track = (mesh) => { meshes.push(mesh); return mesh; };

    const shell = makeMaterial(scene, `${id}_shell`, color);
    const shellDark = makeMaterial(scene, `${id}_shellDark`, shade(color, 0.6));
    const legMat = makeMaterial(scene, `${id}_legMat`, shade(color, 0.42));
    const fangMat = makeMaterial(scene, `${id}_fang`, '#ecf0f1');
    const eyeMat = makeMaterial(scene, `${id}_eyeMat`, '#ff2d2d', { emissive: '#7a0000' });

    const root = new TransformNode(`${id}_root`, scene);
    const body = joint(scene, `${id}_bodyJoint`, root, new Vector3(0, 0.78, 0));

    // Головогрудь — её подсвечивает UIController при попадании.
    const cephalothorax = track(MeshBuilder.CreateSphere(`${id}_body`, {
        diameterX: 1.15, diameterY: 0.72, diameterZ: 1.25,
    }, scene));
    cephalothorax.parent = body;
    cephalothorax.position.z = 0.45;
    cephalothorax.material = shell;

    const abdomen = track(MeshBuilder.CreateSphere(`${id}_abdomen`, {
        diameterX: 1.5, diameterY: 1.15, diameterZ: 1.7,
    }, scene));
    abdomen.parent = body;
    abdomen.position.set(0, 0.1, -0.85);
    abdomen.material = shellDark;

    // Пятнистость — это Mottled Spider.
    for (let i = 0; i < 5; i += 1) {
        const spot = track(MeshBuilder.CreateSphere(`${id}_spot${i}`, { diameter: 0.3 }, scene));
        spot.parent = abdomen;
        const angle = (i / 5) * Math.PI * 2;
        spot.position.set(Math.cos(angle) * 0.42, 0.34, Math.sin(angle) * 0.5);
        spot.scaling.y = 0.35;
        spot.material = shell;
    }

    // Глаза: 4 крупных спереди + 4 мелких сверху.
    for (let i = 0; i < 4; i += 1) {
        const eye = track(MeshBuilder.CreateSphere(`${id}_eye${i}`, { diameter: 0.17 }, scene));
        eye.parent = cephalothorax;
        eye.position.set(-0.27 + i * 0.18, 0.16, 0.52);
        eye.material = eyeMat;
    }
    for (const side of [-1, 1]) {
        for (let i = 0; i < 2; i += 1) {
            const eye = track(MeshBuilder.CreateSphere(`${id}_eyeTop${side}${i}`, { diameter: 0.1 }, scene));
            eye.parent = cephalothorax;
            eye.position.set(0.14 * side * (i + 1), 0.3, 0.32);
            eye.material = eyeMat;
        }
    }

    // Жвалы.
    const fangs = [];
    for (const side of [-1, 1]) {
        const fang = track(MeshBuilder.CreateCylinder(`${id}_fang${side}`, {
            height: 0.36, diameterTop: 0.02, diameterBottom: 0.11, tessellation: 6,
        }, scene));
        fang.parent = cephalothorax;
        fang.position.set(0.16 * side, -0.2, 0.52);
        fang.rotation.x = 0.5;
        fang.material = fangMat;
        fangs.push(fang);
    }

    // --- Восемь ног из двух сегментов ------------------------------------
    const legs = [];
    for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i += 1) {
            const label = `${side > 0 ? 'R' : 'L'}${i}`;

            const hip = joint(scene, `${id}_legHip${label}`, body,
                new Vector3(0.45 * side, 0.02, 0.62 - i * 0.42));
            // Передние ноги смотрят вперёд, задние — назад.
            hip.rotation.y = side * (-0.72 + i * 0.44);
            hip.rotation.z = side * -0.62;

            const femur = track(MeshBuilder.CreateCapsule(`${id}_femur${label}`, {
                height: 0.92, radius: 0.075, capSubdivisions: 3, subdivisions: 3,
            }, scene));
            femur.parent = hip;
            femur.rotation.z = Math.PI / 2;
            femur.position.x = 0.46 * side;
            femur.material = legMat;

            const knee = joint(scene, `${id}_legKnee${label}`, hip, new Vector3(0.92 * side, 0, 0));
            knee.rotation.z = side * 1.32;

            const tibia = track(MeshBuilder.CreateCapsule(`${id}_tibia${label}`, {
                height: 0.95, radius: 0.055, capSubdivisions: 3, subdivisions: 3,
            }, scene));
            tibia.parent = knee;
            tibia.rotation.z = Math.PI / 2;
            tibia.position.x = 0.47 * side;
            tibia.material = legMat;

            legs.push({ hip, knee, side, index: i, restHipY: hip.rotation.y, restHipZ: hip.rotation.z });
        }
    }

    return {
        root,
        meshes,
        rig: { kind: 'spider', body, cephalothorax, abdomen, legs, fangs },
    };
}

/** Единая точка входа: выбирает фабрику по meshKind юнита. */
export function createUnitModel(scene, data) {
    if (data.meshKind === 'spider') {
        return createSpider(scene, { id: data.id, color: data.color });
    }
    return createHumanoid(scene, {
        id: data.id,
        color: data.color,
        weapon: data.weapon ?? (data.presetKey === 'elena' ? 'staff' : 'sword'),
        accent: data.accent ?? null,
    });
}
