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
import { createHeadMesh } from './head_mesh.js';
import { createHairMesh } from './hair_mesh.js';

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
function shadeMat(scene, name, color, weapon) {
    return makeMaterial(scene, name, shade(color, weapon === 'staff' ? 1.3 : 0.52));
}

export function createHumanoid(scene, { id, color = '#3498db', weapon = 'sword', accent = null } = {}) {
    const meshes = [];
    const track = (mesh) => { meshes.push(mesh); return mesh; };

    const cloth = makeMaterial(scene, `${id}_cloth`, color);
    const clothDark = makeMaterial(scene, `${id}_clothDark`, shade(color, 0.65));
    const trim = makeMaterial(scene, `${id}_trim`, accent ?? shade(color, 1.45));
    const skin = makeMaterial(scene, `${id}_skin`, '#f2c9a0');
    const hair = makeMaterial(scene, `${id}_hair`, weapon === 'staff' ? '#f5d76e' : '#3b2b22');
    const steel = makeMaterial(scene, `${id}_steel`, '#c9ced6', { specular: 0.8 });
    const steelDark = makeMaterial(scene, `${id}_steelDark`, '#8f97a3', { specular: 0.6 });
    const leather = makeMaterial(scene, `${id}_leather`, '#4a3728');
    const leatherLight = makeMaterial(scene, `${id}_leatherLight`, '#6b5233');
    const gold = makeMaterial(scene, `${id}_gold`, '#d4a537', { specular: 0.7 });
    const scarfMat = makeMaterial(scene, `${id}_scarfMat`, '#c0392b');
    const packMat = makeMaterial(scene, `${id}_packMat`, '#7a6247');

    const root = new TransformNode(`${id}_root`, scene);

    // --- Скелет -----------------------------------------------------------
    const hips = joint(scene, `${id}_hips`, root, new Vector3(0, 1.45, 0));
    const torso = joint(scene, `${id}_torso`, hips, Vector3.Zero());
    const neck = joint(scene, `${id}_neck`, torso, new Vector3(0, 1.02, 0));
    // Плечи выносим за радиус груди (0.34), иначе руки тонут в торсе.
    // Плечевые суставы держим у верхнего среза корпуса (он на 1.07): раньше
    // они сидели на 0.8, и руки росли из середины груди — плечи оказывались
    // заметно ниже линии ключиц.
    const shoulderL = joint(scene, `${id}_shoulderL`, torso, new Vector3(-0.5, 0.98, 0));
    const shoulderR = joint(scene, `${id}_shoulderR`, torso, new Vector3(0.5, 0.98, 0));
    const elbowL = joint(scene, `${id}_elbowL`, shoulderL, new Vector3(0, -0.52, 0));
    const elbowR = joint(scene, `${id}_elbowR`, shoulderR, new Vector3(0, -0.52, 0));
    const hipL = joint(scene, `${id}_hipL`, hips, new Vector3(-0.21, -0.08, 0));
    const hipR = joint(scene, `${id}_hipR`, hips, new Vector3(0.21, -0.08, 0));
    const kneeL = joint(scene, `${id}_kneeL`, hipL, new Vector3(0, -0.62, 0));
    const kneeR = joint(scene, `${id}_kneeR`, hipR, new Vector3(0, -0.62, 0));

    // --- Туловище ---------------------------------------------------------
    // Имя *_body важно: UIController подсвечивает его при попадании.
    // Конус даёт треугольный силуэт: широкие плечи, узкая талия.
    const chest = track(MeshBuilder.CreateCylinder(`${id}_body`, {
        height: 0.82, diameterTop: 0.78, diameterBottom: 0.5, tessellation: 14,
    }, scene));
    chest.parent = torso;
    chest.position.y = 0.66;
    chest.scaling.z = 0.72; // тело не бочка, а слегка приплюснутое
    chest.material = cloth;

    // Плечевой пояс. Без него верх корпуса-конуса оставался открытым диском:
    // у шеи торчала плоская «крышка», и ключицы выглядели как срезанная труба.
    // Полусфера закрывает срез и даёт покатый скат от шеи к плечам.
    const yoke = track(MeshBuilder.CreateSphere(`${id}_yoke`, {
        diameterX: 0.80, diameterY: 0.16, diameterZ: 0.58,
        slice: 0.5, segments: 14,
    }, scene));
    yoke.parent = torso;
    yoke.position.y = 1.07;
    yoke.material = cloth;

    // Наплечники разбивают силуэт и делают героя «экипированным».
    for (const side of [-1, 1]) {
        const pad = track(MeshBuilder.CreateSphere(`${id}_pauldron${side}`, {
            diameterX: 0.34, diameterY: 0.26, diameterZ: 0.32, slice: 0.55,
        }, scene));
        // Наплечник крепим к САМОМУ плечевому суставу: он должен ехать
        // вместе с рукой. На торсе он оставался на месте, и после разворота
        // рук наружу между ним и рукавом открывалась щель.
        pad.parent = side < 0 ? shoulderL : shoulderR;
        pad.position.set(0.02 * side, 0.04, 0);
        pad.rotation.z = side * 0.35;
        pad.material = weapon === 'staff' ? trim : steel;
    }

    const waist = track(MeshBuilder.CreateCylinder(`${id}_waist`, {
        height: 0.3, diameterTop: 0.5, diameterBottom: 0.56, tessellation: 14,
    }, scene));
    waist.parent = torso;
    waist.position.y = 0.14;
    waist.scaling.z = 0.72;
    waist.material = cloth;

    const belt = track(MeshBuilder.CreateCylinder(`${id}_belt`, {
        height: 0.13, diameter: 0.6, tessellation: 16,
    }, scene));
    belt.parent = torso;
    belt.position.y = 0.02;
    belt.scaling.z = 0.78;
    belt.material = leather;

    const buckle = track(MeshBuilder.CreateBox(`${id}_buckle`, {
        width: 0.14, height: 0.12, depth: 0.06,
    }, scene));
    buckle.parent = torso;
    buckle.position.set(0, 0.02, 0.22);
    buckle.material = trim;

    if (weapon === 'sword') {
        // Нагрудная пластина: плоский торс выглядел «доской в рубашке».
        const plate = track(MeshBuilder.CreateCylinder(`${id}_chestPlate`, {
            height: 0.5, diameterTop: 0.7, diameterBottom: 0.52, tessellation: 14,
        }, scene));
        plate.parent = torso;
        plate.position.set(0, 0.72, 0.09);
        plate.scaling.z = 0.5;
        plate.material = steelDark;

        // Ремень через грудь — за спиной ножны.
        const strap = track(MeshBuilder.CreateBox(`${id}_strap`, {
            width: 0.12, height: 0.8, depth: 0.05,
        }, scene));
        strap.parent = torso;
        // z=0.13 держит ремень НА груди: при 0.2 он висел в воздухе перед ней.
        strap.position.set(0.03, 0.68, 0.13);
        strap.rotation.z = 0.42;
        strap.material = leatherLight;

        // Ножны на поясе, а не на лопатке: раньше верх упирался в наплечник.
        const scabbard = track(MeshBuilder.CreateCylinder(`${id}_scabbard`, {
            height: 1.0, diameterTop: 0.09, diameterBottom: 0.12, tessellation: 8,
        }, scene));
        scabbard.parent = torso;
        scabbard.position.set(-0.28, 0.06, -0.16);
        scabbard.rotation.set(0.42, 0, -0.5);
        scabbard.material = leather;

        const scabbardTip = track(MeshBuilder.CreateCylinder(`${id}_scabbardTip`, {
            height: 0.14, diameterTop: 0.13, diameterBottom: 0.06, tessellation: 8,
        }, scene));
        scabbardTip.parent = torso;
        scabbardTip.position.set(-0.5, -0.35, -0.36);
        scabbardTip.rotation.set(0.42, 0, -0.5);
        scabbardTip.material = gold;

        // Красный шарф — самая узнаваемая деталь силуэта Рюдо.
        const scarf = track(MeshBuilder.CreateTorus(`${id}_scarf`, {
            diameter: 0.4, thickness: 0.12, tessellation: 12,
        }, scene));
        scarf.parent = torso;
        scarf.position.set(0, 1.12, 0.02);
        scarf.rotation.x = Math.PI / 2;
        scarf.scaling.z = 0.8;
        scarf.material = scarfMat;

        // Свисающий конец шарфа.
        // Конец шарфа свисает вдоль плеча и уходит НАЗАД, а не лежит красной
        // плахой на груди: прежний торчал за габарит корпуса (x до 0.45 при
        // ширине тела 0.39) и читался как посторонний предмет спереди.
        const scarfTail = track(MeshBuilder.CreateBox(`${id}_scarfTail`, {
            width: 0.13, height: 0.38, depth: 0.06,
        }, scene));
        scarfTail.parent = torso;
        scarfTail.position.set(0.2, 0.92, -0.14);
        scarfTail.rotation.set(-0.12, 0, 0.24);
        scarfTail.material = scarfMat;

        // Заплечный мешок странствующего Geohound.
        // Мешок сидит НИЖЕ линии плеч и уже корпуса: раньше он вместе со
        // скаткой и клапаном выглядывал из-за плеч на ракурсе 3/4, и это
        // читалось как рюкзак, надетый задом наперёд.
        // Мешок сидит МЕЖДУ ЛОПАТОК, а не на пояснице. Рюкзак обязан
        // выступать за спину (иначе его не видно со спины), но на уровне
        // живота этот выступ выглядывал сбоку от корпуса под углом ~40° —
        // читалось как «рюкзак просвечивает через живот». На высоте лопаток
        // корпус шире, и тот же выступ остаётся закрыт силуэтом.
        const pack = track(MeshBuilder.CreateBox(`${id}_pack`, {
            width: 0.34, height: 0.34, depth: 0.14,
        }, scene));
        pack.parent = torso;
        pack.position.set(0, 0.86, -0.26);
        pack.material = packMat;

        const packFlap = track(MeshBuilder.CreateBox(`${id}_packFlap`, {
            width: 0.36, height: 0.12, depth: 0.16,
        }, scene));
        packFlap.parent = torso;
        packFlap.position.set(0, 1.0, -0.26);
        packFlap.material = leather;

        // Скатка лежит на клапане, а не над плечами.
        const bedroll = track(MeshBuilder.CreateCylinder(`${id}_bedroll`, {
            height: 0.36, diameter: 0.12, tessellation: 10,
        }, scene));
        bedroll.parent = torso;
        bedroll.position.set(0, 1.07, -0.26);
        bedroll.rotation.z = Math.PI / 2;
        bedroll.material = scarfMat;

        // Лямки идут по спине вплотную к корпусу, а не по бокам.
        for (const side of [-1, 1]) {
            const packStrap = track(MeshBuilder.CreateBox(`${id}_packStrap${side}`, {
                width: 0.08, height: 0.42, depth: 0.05,
            }, scene));
            packStrap.parent = torso;
            packStrap.position.set(0.15 * side, 0.86, -0.21);
            packStrap.rotation.x = -0.12;
            packStrap.material = leather;
        }

        // Наручи.
        for (const [name, parent] of [[`${id}_bracerL`, elbowL], [`${id}_bracerR`, elbowR]]) {
            const bracer = track(MeshBuilder.CreateCylinder(name, {
                height: 0.26, diameterTop: 0.26, diameterBottom: 0.22, tessellation: 10,
            }, scene));
            bracer.parent = parent;
            bracer.position.y = -0.34;
            bracer.material = steelDark;
        }

        // Набедренные щитки поверх бёдер.
        for (const [name, parent, side] of [[`${id}_tassetL`, hipL, -1], [`${id}_tassetR`, hipR, 1]]) {
            // Поясная сумка висит на ВНЕШНЕЙ стороне бедра. Прежний щиток
            // был вдвое крупнее и сидел спереди — читался как коричневая
            // коробка на животе, а не как карман.
            const tasset = track(MeshBuilder.CreateBox(name, {
                width: 0.12, height: 0.18, depth: 0.14,
            }, scene));
            tasset.parent = parent;
            tasset.position.set(0.15 * side, -0.12, 0.0);
            tasset.rotation.z = side * 0.1;
            tasset.material = leatherLight;
        }
    }

    // Плащ носит только Елена: у Рюдо за спиной рюкзак, и вместе они
    // превращались в кашу. Узел cape существует всегда — на нём держится
    // рюкзак, и аниматор ищет его по имени.
    const cape = new TransformNode(`${id}_capePivot`, scene);
    cape.parent = torso;
    cape.position.set(0, 0.58, -0.34);

    if (weapon === 'staff') {
    const cloak = track(MeshBuilder.CreateCylinder(`${id}_cape`, {
        height: 1.05, diameterTop: 0.62, diameterBottom: 0.98,
        tessellation: 4, faceted: true,
    }, scene));
    cloak.parent = cape;
    cloak.rotation.set(-0.06, Math.PI / 4, 0);
    cloak.scaling.z = 0.12;
    cloak.material = trim;

    // Складки: две вертикальные грани ломают плоскость плаща.
    for (const side of [-1, 1]) {
        const fold = track(MeshBuilder.CreateCylinder(`${id}_capeFold${side}`, {
            height: 1.0, diameterTop: 0.16, diameterBottom: 0.3,
            tessellation: 4, faceted: true,
        }, scene));
        fold.parent = cloak;
        // Родитель уже сплющен по z, поэтому компенсируем масштаб.
        fold.position.set(0.26 * side, 0.0, -0.6);
        fold.rotation.y = Math.PI / 4;
        fold.scaling.set(1, 0.98, 1);
        fold.material = trim;
    }

    // Застёжка плаща у горла.
    const clasp = track(MeshBuilder.CreateSphere(`${id}_capeClasp`, {
        diameterX: 0.14, diameterY: 0.1, diameterZ: 0.1,
    }, scene));
    clasp.parent = torso;
    clasp.position.set(0, 1.02, -0.18);
    clasp.material = gold;
    }

    // Шея и воротник: без них голова просто висела над торсом.
    const neckMesh = track(MeshBuilder.CreateCylinder(`${id}_neckMesh`, {
        height: 0.3, diameterTop: 0.155, diameterBottom: 0.185, tessellation: 10,
    }, scene));
    neckMesh.parent = neck;
    neckMesh.position.y = 0.09;
    neckMesh.material = skin;

    const collar = track(MeshBuilder.CreateCylinder(`${id}_collar`, {
        height: 0.09, diameterTop: 0.24, diameterBottom: 0.33, tessellation: 12,
    }, scene));
    collar.parent = neck;
    collar.position.y = 0.1;
    collar.scaling.z = 0.78;
    collar.material = clothDark;

    // --- Голова -----------------------------------------------------------
    // Единая поверхность по анатомическим сечениям (см. head_mesh.js).
    // Раньше голова была стопкой сфер: шар-череп, шар-челюсть, шары-скулы —
    // отсюда «всё из кружочков» и отсутствие настоящей формы лица.
    const head = track(createHeadMesh(scene, `${id}_head`));
    head.parent = neck;
    head.position.y = 0.1;
    head.scaling.setAll(0.86);
    head.material = skin;

    // Нос лепим из граней, чтобы он был частью лица, а не приклеенным шаром.
    const noseBridge = track(MeshBuilder.CreateCylinder(`${id}_noseBridge`, {
        height: 0.105, diameterTop: 0.022, diameterBottom: 0.05,
        tessellation: 3, faceted: true,
    }, scene));
    noseBridge.parent = head;
    noseBridge.position.set(0, 0.322, 0.15);
    noseBridge.rotation.set(-0.1, 0, 0);
    noseBridge.material = skin;

    const noseTip = track(MeshBuilder.CreateCylinder(`${id}_nose`, {
        height: 0.042, diameterTop: 0.06, diameterBottom: 0.038,
        tessellation: 3, faceted: true,
    }, scene));
    noseTip.parent = head;
    noseTip.position.set(0, 0.275, 0.176);
    noseTip.rotation.set(0.45, 0, 0);
    noseTip.material = skin;

    // Губы: верхняя и нижняя с тёмной линией между ними.
    const mouth = track(MeshBuilder.CreateBox(`${id}_mouth`, {
        width: 0.085, height: 0.012, depth: 0.02,
    }, scene));
    mouth.parent = head;
    mouth.position.set(0, 0.205, 0.176);
    mouth.material = makeMaterial(scene, `${id}_mouthMat`, '#6d4038');

    const lipLower = track(MeshBuilder.CreateSphere(`${id}_lipLower`, {
        diameterX: 0.09, diameterY: 0.035, diameterZ: 0.04,
    }, scene));
    lipLower.parent = head;
    lipLower.position.set(0, 0.19, 0.172);
    lipLower.material = skin;

    // Уши прижаты к черепу и вытянуты вертикально.
    for (const side of [-1, 1]) {
        const ear = track(MeshBuilder.CreateSphere(`${id}_ear${side}`, {
            diameterX: 0.045, diameterY: 0.13, diameterZ: 0.09,
        }, scene));
        ear.parent = head;
        ear.position.set(0.158 * side, 0.315, -0.01);
        ear.rotation.z = side * -0.12;
        ear.material = skin;
    }

    // Причёска — оболочка по форме черепа (см. hair_mesh.js). Раньше это была
    // половина сферы с воткнутыми конусами: они пересекали купол под
    // случайными углами, и волосы читались как шлем с шипами.
    const hairMesh = track(createHairMesh(
        scene, `${id}_hair`, weapon === 'staff' ? 'smooth' : 'spiky',
    ));
    hairMesh.parent = head;
    hairMesh.material = hair;

    if (weapon === 'staff') {
        // Длину волос Елены даёт подол самой оболочки (hair_mesh.js).
        // Раньше здесь висели две капсулы-«пряди» и шар на затылке —
        // они читались как приклеенные трубы.
        for (const side of [-1, 1]) {
            const lock = track(MeshBuilder.CreateCapsule(`${id}_strand${side}`, {
                height: 0.34, radius: 0.045, capSubdivisions: 3, subdivisions: 3,
            }, scene));
            lock.parent = head;
            // Передняя прядь вдоль щеки — обрамляет лицо.
            lock.position.set(0.196 * side, 0.235, 0.055);
            lock.rotation.set(0.12, 0, side * 0.07);
            lock.material = hair;
        }
    } else {
        // Рюдо: хвостик у затылка. Шипы уже часть меша причёски.
        const tail = track(MeshBuilder.CreateCapsule(`${id}_tail`, {
            height: 0.26, radius: 0.055, capSubdivisions: 3, subdivisions: 3,
        }, scene));
        tail.parent = head;
        // Лежит на затылке и спускается вниз. При rotation.x = 1.0 он торчал
        // назад поперёк головы обрубком.
        tail.position.set(0, 0.34, -0.212);
        tail.rotation.x = 0.42;
        tail.material = hair;

        // Бакенбарды перед ушами — стык причёски с лицом.
        for (const side of [-1, 1]) {
            const burn = track(MeshBuilder.CreateBox(`${id}_sideburn${side}`, {
                width: 0.03, height: 0.075, depth: 0.062,
            }, scene));
            burn.parent = head;
            burn.position.set(0.152 * side, 0.372, 0.038);
            burn.material = hair;
        }

        // Наушники — фирменная деталь Рюдо.
        for (const side of [-1, 1]) {
            const cup = track(MeshBuilder.CreateCylinder(`${id}_phoneCup${side}`, {
                height: 0.09, diameter: 0.26, tessellation: 8, faceted: true,
            }, scene));
            cup.parent = head;
            cup.position.set(0.17 * side, 0.318, -0.012);
            cup.rotation.z = Math.PI / 2;
            cup.material = gold;

            const pad = track(MeshBuilder.CreateCylinder(`${id}_phonePad${side}`, {
                height: 0.04, diameter: 0.19, tessellation: 8,
            }, scene));
            pad.parent = head;
            pad.position.set(0.148 * side, 0.318, -0.012);
            pad.rotation.z = Math.PI / 2;
            pad.material = leather;
        }

        // Дужка через макушку.
        const band = track(MeshBuilder.CreateTorus(`${id}_phoneBand`, {
            diameter: 0.48, thickness: 0.05, tessellation: 16,
        }, scene));
        band.parent = head;
        band.position.set(0, 0.42, -0.015);
        band.rotation.x = Math.PI / 2;
        band.scaling.z = 0.85;
        band.material = gold;
    }

    for (const side of [-1, 1]) {
        const brow = track(MeshBuilder.CreateBox(`${id}_brow${side}`, {
            width: 0.115, height: 0.03, depth: 0.045,
        }, scene));
        brow.parent = head;
        brow.position.set(0.086 * side, 0.412, 0.152);
        brow.rotation.z = side * (weapon === 'staff' ? -0.1 : 0.22);
        brow.material = hair;
    }

    // Глаза: белок + радужка + зрачок. Раньше это был один тёмный шарик,
    // из-за чего лицо читалось как маска с дырками.
    const scleraMat = makeMaterial(scene, `${id}_scleraMat`, '#f4f1ea');
    const irisMat = makeMaterial(scene, `${id}_irisMat`, weapon === 'staff' ? '#2f6f4f' : '#2e6b8f');
    const pupilMat = makeMaterial(scene, `${id}_pupilMat`, '#15171c');
    const lidMat = makeMaterial(scene, `${id}_lidMat`, shade('#f2c9a0', 0.82));

    for (const side of [-1, 1]) {
        const tag = side > 0 ? 'R' : 'L';

        // Глазница — небольшое затемнение под бровью.
        const socket = track(MeshBuilder.CreateSphere(`${id}_socket${tag}`, {
            diameterX: 0.128, diameterY: 0.095, diameterZ: 0.055,
        }, scene));
        socket.parent = head;
        socket.position.set(0.082 * side, 0.347, 0.132);
        socket.material = lidMat;

        const eye = track(MeshBuilder.CreateSphere(`${id}_eye${tag}`, {
            diameterX: 0.1, diameterY: 0.072, diameterZ: 0.065,
        }, scene));
        eye.parent = head;
        eye.position.set(0.082 * side, 0.347, 0.139);
        eye.material = scleraMat;

        const iris = track(MeshBuilder.CreateSphere(`${id}_iris${tag}`, {
            diameterX: 0.048, diameterY: 0.048, diameterZ: 0.038,
        }, scene));
        iris.parent = head;
        iris.position.set(0.082 * side, 0.344, 0.158);
        iris.material = irisMat;

        const pupil = track(MeshBuilder.CreateSphere(`${id}_pupil${tag}`, {
            diameterX: 0.026, diameterY: 0.03, diameterZ: 0.02,
        }, scene));
        pupil.parent = head;
        pupil.position.set(0.082 * side, 0.344, 0.164);
        pupil.material = pupilMat;

        // Верхнее веко — прикрывает глаз сверху, придаёт взгляду тяжесть.
        const lid = track(MeshBuilder.CreateBox(`${id}_lid${tag}`, {
            width: 0.108, height: 0.02, depth: 0.033,
        }, scene));
        lid.parent = head;
        lid.position.set(0.082 * side, 0.377, 0.146);
        lid.rotation.z = side * (weapon === 'staff' ? -0.06 : 0.16);
        lid.material = lidMat;
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

    // Плечо чуть длиннее расстояния до локтя (0.52), чтобы капсулы
    // ПЕРЕКРЫВАЛИСЬ: иначе на сгибе видна ступенька между рукавом и
    // предплечьем — сустав ничем не закрыт.
    limb(`${id}_upperArmL`, shoulderL, 0.6, 0.12, cloth);
    limb(`${id}_upperArmR`, shoulderR, 0.6, 0.12, cloth);
    const foreArmL = limb(`${id}_foreArmL`, elbowL, 0.5, 0.105, skin);
    const foreArmR = limb(`${id}_foreArmR`, elbowR, 0.5, 0.105, skin);

    // Шарнир локтя скрывает стык двух капсул при любом угле сгиба. Сфера
    // сдвинута ВВЕРХ от сустава и уменьшена: по центру она свисала на
    // голое предплечье, и рукав казался обрезанным посреди локтя.
    for (const [name, parent] of [[`${id}_elbowCapL`, elbowL], [`${id}_elbowCapR`, elbowR]]) {
        const cap = track(MeshBuilder.CreateSphere(name, { diameter: 0.2, segments: 8 }, scene));
        cap.parent = parent;
        cap.position.y = 0.05;
        cap.material = cloth;
    }
    limb(`${id}_thighL`, hipL, 0.64, 0.15, clothDark);
    limb(`${id}_thighR`, hipR, 0.64, 0.15, clothDark);
    limb(`${id}_shinL`, kneeL, 0.62, 0.13, clothDark);
    limb(`${id}_shinR`, kneeR, 0.62, 0.13, clothDark);

    for (const [name, parent] of [[`${id}_footL`, kneeL], [`${id}_footR`, kneeR]]) {
        const foot = track(MeshBuilder.CreateBox(name, { width: 0.21, height: 0.11, depth: 0.36 }, scene));
        foot.parent = parent;
        foot.position.set(0, -0.62, 0.08);
        foot.material = leather;

        // Голенище — сапог, а не дощечка под ногой.
        const shaftBoot = track(MeshBuilder.CreateCylinder(`${name}_boot`, {
            height: 0.26, diameterTop: 0.29, diameterBottom: 0.25, tessellation: 10,
        }, scene));
        shaftBoot.parent = parent;
        shaftBoot.position.set(0, -0.46, 0.01);
        shaftBoot.material = leather;
    }

    // --- Кисти -------------------------------------------------------------
    // Без них руки просто обрубались на предплечье.
    const hand = joint(scene, `${id}_hand`, elbowR, new Vector3(0, -0.52, 0));
    const handL = joint(scene, `${id}_handL`, elbowL, new Vector3(0, -0.52, 0));

    for (const [name, parent] of [[`${id}_fistR`, hand], [`${id}_fistL`, handL]]) {
        const fist = track(MeshBuilder.CreateSphere(name, {
            diameterX: 0.15, diameterY: 0.18, diameterZ: 0.14,
        }, scene));
        fist.parent = parent;
        fist.material = weapon === 'staff' ? skin : leather;
    }

    const weaponPivot = joint(scene, `${id}_weaponPivot`, hand, Vector3.Zero());

    if (weapon === 'sword') {
        // Меч лежит в ладони СЕРЕДИНОЙ РУКОЯТИ. Раньше геометрия строилась
        // от гарды (y = 0), поэтому в кулаке оказывалась гарда, а рукоять с
        // навершием торчала за кистью — меч будто висел рядом с рукой.
        // Весь клинок поднят на GRIP_SHIFT: теперь центр рукояти совпадает
        // с центром кулака, и оружие ведёт себя как продолжение кисти.
        const GRIP_SHIFT = 0.14;

        // Клинок: широкое основание, сужение к острию и дол по центру.
        const blade = track(MeshBuilder.CreateBox(`${id}_blade`, {
            width: 0.15, height: 1.2, depth: 0.045,
        }, scene));
        blade.parent = weaponPivot;
        blade.position.y = 0.63 + GRIP_SHIFT;
        blade.material = steel;

        const fuller = track(MeshBuilder.CreateBox(`${id}_fuller`, {
            width: 0.05, height: 1.04, depth: 0.055,
        }, scene));
        fuller.parent = weaponPivot;
        fuller.position.y = 0.61 + GRIP_SHIFT;
        fuller.material = steelDark;

        // Остриё отдельным клином — прямоугольная «линейка» выглядела бедно.
        const tip = track(MeshBuilder.CreateCylinder(`${id}_bladeTip`, {
            height: 0.3, diameterTop: 0.01, diameterBottom: 0.15,
            tessellation: 4, faceted: true,
        }, scene));
        tip.parent = weaponPivot;
        tip.position.y = 1.32 + GRIP_SHIFT;
        tip.scaling.z = 0.3;
        tip.material = steel;

        const guard = track(MeshBuilder.CreateBox(`${id}_guard`, {
            width: 0.42, height: 0.08, depth: 0.11,
        }, scene));
        guard.parent = weaponPivot;
        guard.position.y = 0.03 + GRIP_SHIFT;
        guard.material = gold;

        // Загнутые концы гарды.
        for (const side of [-1, 1]) {
            const quillon = track(MeshBuilder.CreateSphere(`${id}_quillon${side}`, {
                diameterX: 0.1, diameterY: 0.14, diameterZ: 0.1,
            }, scene));
            quillon.parent = weaponPivot;
            quillon.position.set(0.2 * side, 0.07 + GRIP_SHIFT, 0);
            quillon.material = gold;
        }

        const grip = track(MeshBuilder.CreateCylinder(`${id}_grip`, {
            height: 0.28, diameter: 0.08, tessellation: 8,
        }, scene));
        grip.parent = weaponPivot;
        grip.position.y = -0.14 + GRIP_SHIFT;
        grip.material = leather;

        // Обмотка рукояти.
        for (let i = 0; i < 3; i += 1) {
            const wrap = track(MeshBuilder.CreateCylinder(`${id}_gripWrap${i}`, {
                height: 0.035, diameter: 0.095, tessellation: 8,
            }, scene));
            wrap.parent = weaponPivot;
            wrap.position.y = -0.05 - i * 0.08 + GRIP_SHIFT;
            wrap.material = leatherLight;
        }

        const pommel = track(MeshBuilder.CreateSphere(`${id}_pommel`, {
            diameterX: 0.13, diameterY: 0.12, diameterZ: 0.13,
        }, scene));
        pommel.parent = weaponPivot;
        pommel.position.y = -0.3 + GRIP_SHIFT;
        pommel.material = gold;
    } else {
        // Посох делаем толще и светлее: тонкая тёмная палка терялась на фоне.
        const wood = makeMaterial(scene, `${id}_wood`, '#b98a56');
        const shaft = track(MeshBuilder.CreateCylinder(`${id}_shaft`, {
            height: 1.9, diameter: 0.11, tessellation: 10,
        }, scene));
        shaft.parent = weaponPivot;
        shaft.position.y = 0.55;
        shaft.material = wood;

        // Перехваты, чтобы посох не выглядел трубой.
        for (const y of [0.05, 1.0]) {
            const wrap = track(MeshBuilder.CreateCylinder(`${id}_wrap${y}`, {
                height: 0.1, diameter: 0.14, tessellation: 10,
            }, scene));
            wrap.parent = weaponPivot;
            wrap.position.y = y;
            wrap.material = leather;
        }

        const orbColor = accent ?? '#7fe7ff';
        const orb = track(MeshBuilder.CreateSphere(`${id}_orb`, { diameter: 0.34 }, scene));
        orb.parent = weaponPivot;
        orb.position.y = 1.62;
        orb.material = makeMaterial(scene, `${id}_orbMat`, orbColor, {
            emissive: orbColor, specular: 0.9,
        });

        // Держатель-когти вокруг орба.
        for (const side of [-1, 1]) {
            const claw = track(MeshBuilder.CreateCylinder(`${id}_claw${side}`, {
                height: 0.3, diameterTop: 0.02, diameterBottom: 0.09, tessellation: 6,
            }, scene));
            claw.parent = weaponPivot;
            claw.position.set(0.13 * side, 1.48, 0);
            claw.rotation.z = side * -0.4;
            claw.material = trim;
        }

        const ringMesh = track(MeshBuilder.CreateTorus(`${id}_orbRing`, {
            diameter: 0.46, thickness: 0.04, tessellation: 20,
        }, scene));
        ringMesh.parent = weaponPivot;
        ringMesh.position.y = 1.62;
        ringMesh.rotation.x = Math.PI / 2.6;
        ringMesh.material = trim;
    }

    // Поза покоя: руки разведены, оружие видно и не пересекает тело.
    // Знак Z разводит руки НАРУЖУ: прежние 0.2/-0.2 работали наоборот и
    // вжимали предплечья в бёдра (перекрытие по X до 0.23). Замер: при
    // -0.10/+0.10 зазор между предплечьем и бедром 0.08.
    shoulderL.rotation.z = -0.1;
    shoulderR.rotation.z = 0.1;
    elbowL.rotation.x = -0.22;

    if (weapon === 'sword') {
        // Стойка с опущенным мечом. Углы подобраны численно под три условия:
        //   1) остриё чуть выше земли (низ клинка ~0.22 при росте 3.1);
        //   2) клинок смотрит ВПЕРЁД, а не вбок (направление к острию z≈0.79);
        //   3) плоскость клинка развёрнута вбок — меч держат РЕЖУЩЕЙ КРОМКОЙ
        //      вперёд, а не плашмя (нормаль плоскости почти строго по X).
        // Кисть довёрнута под весом клинка, поэтому меч не параллелен полу,
        // а наклонён остриём вниз (составляющая y≈-0.61).
        // Рука отведена от бедра (зазор 0.18), клинок при этом остаётся
        // остриём вперёд-вниз и режет кромкой: одним разворотом плеча этого
        // не добиться — угол уводил меч вбок, стойка пересчитана целиком.
        shoulderR.rotation.x = 0.40;
        shoulderR.rotation.z = 0.15;
        elbowR.rotation.x = -0.39;
        weaponPivot.rotation.x = 3.4;
        weaponPivot.rotation.y = 1.8;
        weaponPivot.rotation.z = 0.6;
    } else {
        // Посох держат ДВУМЯ руками ПО ДИАГОНАЛИ, как ремень безопасности:
        // низ древка у правого бедра, орб над левым плечом. Прежняя поза
        // ставила посох почти вертикально перед корпусом, и левой руке
        // приходилось тянуться через грудь на 92 % полного растяжения —
        // неестественно и неудобно. Теперь вылет левой руки 45 %.
        //
        // Углы подобраны численно в два прохода: сперва правая кисть и
        // наклон древка, затем левая кисть подводится к древку с жёстким
        // штрафом за вылет за пределы комфортной зоны (промах хвата 0.003).
        // Правый локоть ОТВЕДЁН наружу (отступ от корпуса 0.14): прежде он
        // был прижат к рёбрам и «врастал» в бок. Одним углом плеча это не
        // правится — разворот рвал двуручный хват, поэтому стойка
        // пересчитана целиком.
        shoulderR.rotation.x = 0.23;
        shoulderR.rotation.z = 0.05;
        elbowR.rotation.x = -1.14;
        weaponPivot.rotation.set(1.10, -0.80, -0.10);

        shoulderL.rotation.set(-0.35, 0.50, 0.80);
        elbowL.rotation.x = -1.98;
    }

    return {
        root,
        meshes,
        rig: {
            kind: 'humanoid',
            weapon,
            hips, torso, neck, head,
            shoulderL, shoulderR, elbowL, elbowR,
            hipL, hipR, kneeL, kneeR,
            hand, handL, weaponPivot, cape,
            foreArmL, foreArmR,
            // Поза покоя: аниматор возвращается к ней, а не к константам.
            rest: {
                hipsY: hips.position.y,
                shoulderLX: shoulderL.rotation.x,
                shoulderLY: shoulderL.rotation.y,
                shoulderLZ: shoulderL.rotation.z,
                shoulderRZ: shoulderR.rotation.z,
                shoulderRX: shoulderR.rotation.x,
                elbowLX: elbowL.rotation.x,
                elbowRX: elbowR.rotation.x,
                weaponX: weaponPivot.rotation.x,
                weaponY: weaponPivot.rotation.y,
                weaponZ: weaponPivot.rotation.z,
            },
        },
    };
}

/** Паук: 8 суставчатых ног, брюшко, жвалы и гроздь глаз. */
// Геометрия паука: высота тела над ареной и целевая высота кончика лапы.
const BODY_HEIGHT = 0.78;
const FOOT_Y = 0.04;

export function createSpider(scene, { id, color = '#8e44ad' } = {}) {
    const meshes = [];
    const track = (mesh) => { meshes.push(mesh); return mesh; };

    const shell = makeMaterial(scene, `${id}_shell`, color);
    const shellDark = makeMaterial(scene, `${id}_shellDark`, shade(color, 0.6));
    const legMat = makeMaterial(scene, `${id}_legMat`, shade(color, 0.42));
    const fangMat = makeMaterial(scene, `${id}_fang`, '#ecf0f1');
    const eyeMat = makeMaterial(scene, `${id}_eyeMat`, '#ff2d2d', { emissive: '#7a0000' });

    const root = new TransformNode(`${id}_root`, scene);
    const body = joint(scene, `${id}_bodyJoint`, root, new Vector3(0, BODY_HEIGHT, 0));

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
    // Бедро идёт вверх-наружу, голень — вниз к земле: у паука колено выше тела.
    const FEMUR_LENGTH = 0.9;
    const TIBIA_LENGTH = 1.45;
    const HIP_UP_ANGLE = 0.66;
    // Угол голени подбираем так, чтобы лапа реально доставала до пола,
    // а не висела в воздухе (иначе паук лежит брюхом на арене).
    const KNEE_Y = BODY_HEIGHT + Math.sin(HIP_UP_ANGLE) * FEMUR_LENGTH;
    const TIBIA_ANGLE = Math.asin(
        Math.max(-1, Math.min(1, (FOOT_Y - KNEE_Y) / TIBIA_LENGTH)),
    );
    const legs = [];
    for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i += 1) {
            const label = `${side > 0 ? 'R' : 'L'}${i}`;

            const hip = joint(scene, `${id}_legHip${label}`, body,
                new Vector3(0.45 * side, 0.02, 0.62 - i * 0.42));
            // Передние ноги смотрят вперёд, задние — назад.
            hip.rotation.y = side * (-0.72 + i * 0.44);
            // Бедро задирается ВВЕРХ — отсюда характерный домик паучьей ноги.
            hip.rotation.z = side * HIP_UP_ANGLE;

            const femur = track(MeshBuilder.CreateCapsule(`${id}_femur${label}`, {
                height: FEMUR_LENGTH, radius: 0.075, capSubdivisions: 3, subdivisions: 3,
            }, scene));
            femur.parent = hip;
            // Капсула растёт по Y, поэтому кладём её вдоль оси сустава.
            femur.rotation.z = Math.PI / 2;
            femur.position.x = (FEMUR_LENGTH / 2) * side;
            femur.material = legMat;

            // Колено на конце бедра; голень уходит ВНИЗ, к земле.
            const knee = joint(scene, `${id}_legKnee${label}`, hip, new Vector3(FEMUR_LENGTH * side, 0, 0));
            knee.rotation.z = side * (TIBIA_ANGLE - HIP_UP_ANGLE);

            const tibia = track(MeshBuilder.CreateCapsule(`${id}_tibia${label}`, {
                height: TIBIA_LENGTH, radius: 0.05, capSubdivisions: 3, subdivisions: 3,
            }, scene));
            tibia.parent = knee;
            tibia.rotation.z = Math.PI / 2;
            tibia.position.x = (TIBIA_LENGTH / 2) * side;
            tibia.material = legMat;

            legs.push({
                hip, knee, side, index: i,
                restHipY: hip.rotation.y,
                restHipZ: hip.rotation.z,
                restKneeZ: knee.rotation.z,
            });
        }
    }

    return {
        root,
        meshes,
        rig: { kind: 'spider', body, cephalothorax, abdomen, legs, fangs, restBodyY: BODY_HEIGHT },
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
