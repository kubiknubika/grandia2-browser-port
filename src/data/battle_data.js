// Каноничные характеристики из Grandia II (начало игры)

export const PartyData = {
    ryudo: {
        id: "ryudo",
        name: "Ryudo",
        level: 10, // Рюдо начинает игру на 10 уровне
        hp: 460,
        maxHp: 460,
        mp: 20,
        maxMp: 20,
        sp: 32,
        maxSp: 32,
        stats: {
            str: 55, // Strength (Физ. урон)
            vit: 45, // Vitality (Физ. защита)
            act: 40, // Action (Скорость движения по шкале IP WAIT -> COM)
            mov: 45, // Movement (Скорость бега по 3D-арене)
            mag: 30, // Magic (Маг. урон)
            men: 35  // Mentality (Маг. защита)
        },
        color: "#3498db" // Синий для 3D заглушки
    }
};

export const BestiaryData = {
    mottledSpider: {
        id: "mottledSpider",
        name: "Mottled Spider",
        level: 4, // Мобы в Башне Гармия (Garmia Tower)
        hp: 240,
        maxHp: 240,
        mp: 0,
        maxMp: 0,
        sp: 0,
        maxSp: 0,
        stats: {
            str: 32, 
            vit: 20, 
            act: 25, // Медленнее Рюдо
            mov: 35, // Но бегают по арене довольно шустро
            mag: 10,
            men: 15
        },
        color: "#8e44ad" // Фиолетово-пурпурный для паука
    }
};
