class TalentCalculator {
    constructor() {
        this.talentBonuses = {
            warrior: {
                'Стойкость': {
                    stats: {
                        'hp': 0.75,           // 0.75% здоровья
                        'crit_damage_resistance': 0.75, // 0.75% сопр. криту
                        'block': 0.5          // 0.5% блока
                    }
                },
                'Проворство': {
                    stats: {
                        'hit': 0.5,           // 0.5% точности
                        'dodge': 1.0,         // 1.0% уклонения 
                        'attack_speed': 1.0   // 1.0% скорости атаки
                    }
                },
                'Ярость': {
                    stats: {
                        'crit': 0.75,         // 0.75% крита
                        'attack_power': 0.75, // 0.75% силы атаки
                        'mp': 0.5             // 0.5% маны
                    }
                }
            },
            rogue: {
                'Приемы': {
                    stats: {
                        'hit': 0.75,          // 0.75% точности
                        'crit': 0.75,         // 0.75% крита
                        'armour': 0.5,        // 0.5% физ броня
                        'spell_armour': 0.5   // 0.5% маг броня
                    }
                },
                'Уловки': {
                    stats: {
                        'mp': 0.5,            // 0.5% маны
                        'dodge': 0.75,        // 0.75% уклонения
                        'crit': 0.75          // 0.75% крит. урона
                    }
                },
                'Удары': {
                    stats: {
                        'attack_power': 0.75, // 0.75% силы атаки
                        'parry': 0.75,        // 0.75% парирования
                        'crit': 0.5           // 0.5% шанса крита
                    }
                }
            },
            mage: {
                'Лед': {
                    stats: {
                        'armour': 1.0,        // 1.0% брони
                        'crit_damage_resistance': 0.75, // 0.75% сопр. криту
                        'hit': 0.75           // 0.75% точности
                    }
                },
                'Пламя': {
                    stats: {
                        'attack_power': 0.75, // 0.75% силы атаки
                        'crit': 0.75,         // 0.75% крита
                        'hp': 0.5             // 0.5% здоровья
                    }
                },
                'Энергия': {
                    stats: {
                        'crit': 0.75,         // 0.75% крит. урона
                        'mp': 0.5,            // 0.5% маны
                        'dodge': 0.75         // 0.75% уклонения
                    }
                }
            },
            priest: {
                'Опека': {
                    stats: {
                        'hp': 0.75,           // 0.75% здоровья
                        'mp_reg': 0.5,        // 0.5% восстановления маны
                        'crit_damage_resistance': 0.75 // 0.75% сопр. криту
                    }
                },
                'Отомщение': {
                    stats: {
                        'attack_power': 0.75, // 0.75% силы атаки
                        'mp': 0.5,            // 0.5% маны
                        'crit': 0.75          // 0.75% крита
                    }
                },
                'Вера': {
                    stats: {
                        'block': 0.5,         // 0.5% блока
                        'resist': 1.0,        // 1.0% сопротивления магии
                        'crit_damage_resistance': 0.5 // 0.5% сопр. криту
                    }
                }
            },
            archer: {
                'Охотник': {
                    stats: {
                        'hp': 0.75,           // 0.75% здоровья
                        'attack_speed': 0.5,  // 0.5% скорости атаки
                        'crit_damage_resistance': 0.75 // 0.75% сопр. криту
                    }
                },
                'Стрелок': {
                    stats: {
                        'attack_power': 0.75, // 0.75% силы атаки
                        'armour': 0.5,        // 0.5% физ броня
                        'mp_reg': 0.75,       // 0.75% регена маны
                        'spell_armour': 0.5   // 0.5% маг броня
                    }
                },
                'Снайпер': {
                    stats: {
                        'hit': 0.75,          // 0.75% точности
                        'mp': 0.5,            // 0.5% маны
                        'dodge': 0.75         // 0.75% уклонения
                    }
                }
            }
        };
    }

    // Определяет, даёт ли очко процентные бонусы
    givesPercentageBonus(pointsInBranch) {
        // Очки, которые НЕ дают процентных бонусов (только дают навыки)
        const noBonusPoints = [6, 12, 18, 24];
        return !noBonusPoints.includes(pointsInBranch);
    }

    // Подсчитывает количество очков, дающих процентные бонусы
    getEffectivePoints(pointsInBranch) {
        let effectivePoints = 0;
        
        for (let i = 1; i <= pointsInBranch; i++) {
            if (this.givesPercentageBonus(i)) {
                effectivePoints++;
            }
        }
        
        return effectivePoints;
    }

    calculateTalentBonuses(characterClass, talentPoints, currentStats) {
        const bonuses = {};
        const classBonuses = this.talentBonuses[characterClass];

        if (!classBonuses || !talentPoints || !currentStats) {
            return bonuses;
        }

        Object.keys(talentPoints).forEach(branchName => {
            const pointsInBranch = talentPoints[branchName];
            const branchBonus = classBonuses[branchName];

            if (branchBonus && pointsInBranch > 0) {
                // Используем только эффективные очки (те, что дают проценты)
                const effectivePoints = this.getEffectivePoints(pointsInBranch);
                
                if (effectivePoints > 0) {
                    Object.keys(branchBonus.stats).forEach(statKey => {
                        const bonusPercentPerPoint = branchBonus.stats[statKey];
                        const currentValue = parseFloat(currentStats[statKey]) || 0;

                        // Рассчитываем общий процент бонуса
                        const totalBonusPercent = bonusPercentPerPoint * effectivePoints;
                        
                        // Рассчитываем абсолютное значение бонуса
                        const totalBonus = currentValue * totalBonusPercent / 100;
                        
                        if (totalBonus > 0) {
                            bonuses[statKey] = (bonuses[statKey] || 0) + totalBonus;
                            
                            console.log(`📊 Талант ${branchName}: ${statKey} = ${currentValue} × ${totalBonusPercent}% = +${totalBonus.toFixed(1)}`);
                        }
                    });
                }
            }
        });

        return bonuses;
    }

    applyTalentBonuses(totalStats, characterClass, talentPoints, baseStats) {
        if (!totalStats || !characterClass || !talentPoints) {
            console.warn('Недостаточно данных для применения талантов:', {
                totalStats, characterClass, talentPoints
            });
            return totalStats || {};
        }

        const talentBonuses = this.calculateTalentBonuses(characterClass, talentPoints, totalStats);
        const resultStats = { ...totalStats };

        console.log('Бонусы от талантов:', talentBonuses);
        console.log('Эффективные очки по веткам:', 
            Object.keys(talentPoints).map(branch => ({
                branch,
                total: talentPoints[branch],
                effective: this.getEffectivePoints(talentPoints[branch])
            }))
        );

        Object.keys(talentBonuses).forEach(statKey => {
            if (resultStats[statKey] !== undefined) {
                resultStats[statKey] += talentBonuses[statKey];
            } else {
                resultStats[statKey] = talentBonuses[statKey];
            }
        });

        return resultStats;
    }

    reset() {
        // Сброс состояния калькулятора талантов, если нужно
        console.log('Сброс талантов');
    }
}

// Создаем глобальный экземпляр калькулятора талантов
window.talentCalculator = new TalentCalculator();