class TalentCalculator {
    constructor() {
        this.talentBonuses = {
            warrior: {
                'Стойкость':  { stats: {} },
                'Проворство':  { stats: {} },
                'Ярость':      { stats: {} }
            },
            rogue: {
                'Приёмы': { stats: {} },
                'Уловки': { stats: {} },
                'Удары':  { stats: {} }
            },
            mage: {
                'Лед':     { stats: {} },
                'Пламя':   { stats: {} },
                'Энергия': { stats: {} }
            },
            priest: {
                'Опека':      { stats: {} },
                'Отмщение':  { stats: {} },
                'Вера':       { stats: {} }
            },
            archer: {
                'Охотник': { stats: {} },
                'Стрелок': { stats: {} },
                'Снайпер': { stats: {} }
            }
        };
    }
}

// Создаем глобальный экземпляр калькулятора талантов
window.talentCalculator = new TalentCalculator();