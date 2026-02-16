// priest_bonuses.js - Специальные бонусы для класса Жрец
class PriestBonuses {
    constructor() {
        this.bonuses = {
            'dual_wield': {
                'attack_speed': 2.5,
                'crit': 2.5
            },
            'shield': {
                'block': 5
            },
            'two_handed': {
                'attack_speed': 5
            }
        };
    }

    // Получить бонусы в зависимости от типа оружия
    getWeaponBonuses(characterClass, weaponType, leftHandType) {
        // Проверяем, что это Жрец
        if (characterClass !== 'priest') {
            return {};
        }

        let bonuses = {};

        // Бонусы для парного оружия (lhand И rhand с оружием)
        if (weaponType === 'one-handed' && leftHandType === 'weapon') {
            bonuses = { ...this.bonuses.dual_wield };
        }
        // Бонусы для щита (lhand с щитом И rhand с оружием)
        else if (leftHandType === 'shield' && weaponType === 'one-handed') {
            bonuses = { ...this.bonuses.shield };
        }
        // Бонусы для двуручного оружия (только rhand с two-handed)
        else if (weaponType === 'two-handed') {
            bonuses = { ...this.bonuses.two_handed };
        }

        return bonuses;
    }

    // Применить бонусы к статистикам
    applyPriestBonuses(characterStats, characterClass, equipmentData) {
        // Проверяем, что это Жрец
        if (characterClass !== 'priest') {
            return characterStats;
        }

        const stats = { ...characterStats };

        // Получаем информацию об оружии
        const rightHand = equipmentData?.rhand;
        const leftHand = equipmentData?.lhand;

        if (!rightHand) {
            return stats;
        }

        const weaponType = rightHand.weaponType;
        
        // Определяем тип левой руки
        let leftHandType = null;
        if (leftHand) {
            // Если в левой руке есть экипировка, используем ее тип
            leftHandType = leftHand.leftHandType || 
                          (leftHand.weaponType ? 'weapon' : 'shield');
        }

        // Получаем бонусы
        const bonuses = this.getWeaponBonuses(characterClass, weaponType, leftHandType);

        // Применяем бонусы как процентные
        Object.keys(bonuses).forEach(stat => {
            const bonusPercent = bonuses[stat];
            
            if (stats[stat] !== undefined) {
                // Для процентных бонусов применяем процентное увеличение
                if (['attack_speed', 'crit', 'block'].includes(stat)) {
                    // Преобразуем процент в множитель и применяем
                    const multiplier = 1 + (bonusPercent / 100);
                    stats[stat] = Math.round(stats[stat] * multiplier);
                }
            }
        });

        return stats;
    }

    // Получить описание бонусов для отображения в интерфейсе
    getBonusDescription(characterClass, weaponType, leftHandType) {
        if (characterClass !== 'priest') {
            return '';
        }

        const bonuses = this.getWeaponBonuses(characterClass, weaponType, leftHandType);
        
        if (Object.keys(bonuses).length === 0) {
            return '';
        }

        const bonusText = Object.keys(bonuses).map(stat => {
            const value = bonuses[stat];
            const statNames = {
                'attack_speed': 'Скорость атаки',
                'crit': 'Шанс крит. урона', 
                'block': 'Блок'
            };
            return `${statNames[stat]} +${value}%`;
        }).join(', ');

        // Определяем тип конфигурации для описания
        let configType = '';
        if (weaponType === 'one-handed' && leftHandType === 'weapon') {
            configType = 'Парное оружие';
        } else if (leftHandType === 'shield' && weaponType === 'one-handed') {
            configType = 'Оружие + Щит';
        } else if (weaponType === 'two-handed') {
            configType = 'Двуручное оружие';
        }

        return `${configType}: ${bonusText}`;
    }

    // Проверить, активны ли какие-либо бонусы
    hasActiveBonuses(characterClass, equipmentData) {
        if (characterClass !== 'priest') {
            return false;
        }

        const rightHand = equipmentData?.rhand;
        const leftHand = equipmentData?.lhand;

        if (!rightHand) {
            return false;
        }

        const weaponType = rightHand.weaponType;
        const leftHandType = leftHand?.leftHandType;

        const bonuses = this.getWeaponBonuses(characterClass, weaponType, leftHandType);
        return Object.keys(bonuses).length > 0;
    }

    // Получить информацию о текущей конфигурации оружия
    getWeaponConfiguration(equipmentData) {
        const rightHand = equipmentData?.rhand;
        const leftHand = equipmentData?.lhand;

        if (!rightHand) {
            return 'Нет оружия';
        }

        const weaponType = rightHand.weaponType;
        const leftHandType = leftHand?.leftHandType;

        if (weaponType === 'one-handed' && leftHandType === 'weapon') {
            return 'dual_wield';
        } else if (leftHandType === 'shield' && weaponType === 'one-handed') {
            return 'shield';
        } else if (weaponType === 'two-handed') {
            return 'two_handed';
        } else if (weaponType === 'one-handed' && !leftHandType) {
            return 'one_handed_only';
        }

        return 'unknown';
    }
}

// Создаем глобальный экземпляр для использования в других модулях
if (typeof window !== 'undefined') {
    window.priestBonuses = new PriestBonuses();

    // Переопределяем метод обновления статистик для учета бонусов Жреца
    const originalUpdateStats = window.statCalculator?.updateStats;
    if (window.statCalculator && originalUpdateStats) {
        window.statCalculator.updateStats = function() {
            try {
                // Вызываем оригинальный метод
                const totalStats = this.calculateTotalStats();
                
                // Применяем бонусы Жреца если это Жрец
                let finalStats = totalStats;
                if (this.currentClass === 'priest' && window.equipmentData) {
                    finalStats = window.priestBonuses.applyPriestBonuses(
                        totalStats, 
                        this.currentClass, 
                        window.equipmentData
                    );
                }
                
                // Расчет брони отдельно
                const totalArmor = this.calculateTotalArmor();
                
                // Объединяем обычные статистики и броню
                const combinedStats = {
                    ...finalStats,
                    armour: totalArmor.armour || 0,
                    spell_armour: totalArmor.spell_armour || 0,
                    block: totalArmor.block || 0
                };
                
                if (typeof window.updateStatsDisplay === 'function') {
                    window.updateStatsDisplay(combinedStats);
                }
                
                // Обновляем отображение брони
                this.updateArmorStats(totalArmor);

                // Показываем информацию о бонусах Жреца если они активны
                this.showPriestBonusInfo();
                
            } catch (error) {
                console.error('Error in updateStats:', error);
            }
        };

        // Добавляем метод для отображения информации о бонусах
        window.statCalculator.showPriestBonusInfo = function() {
            const bonusInfoElement = document.getElementById('priest-bonus-info');
            
            if (!bonusInfoElement) {
                // Создаем элемент если его нет
                const statsContainer = document.querySelector('.stats-grid');
                if (statsContainer) {
                    const newBonusElement = document.createElement('div');
                    newBonusElement.id = 'priest-bonus-info';
                    newBonusElement.className = 'priest-bonus-info';
                    newBonusElement.style.cssText = `
                        grid-column: 1 / -1;
                        background: linear-gradient(135deg, #8e44ad, #9b59b6);
                        color: white;
                        padding: 10px 15px;
                        border-radius: 8px;
                        margin: 10px 0;
                        font-size: 0.9rem;
                        text-align: center;
                        display: none;
                    `;
                    statsContainer.parentNode.insertBefore(newBonusElement, statsContainer.nextSibling);
                }
                return;
            }

            // Проверяем активные бонусы
            if (this.currentClass === 'priest' && window.equipmentData) {
                const rightHand = window.equipmentData.rhand;
                const leftHand = window.equipmentData.lhand;
                
                if (rightHand) {
                    const weaponType = rightHand.weaponType;
                    const leftHandType = leftHand?.leftHandType;
                    
                    const description = window.priestBonuses.getBonusDescription(
                        this.currentClass, 
                        weaponType, 
                        leftHandType
                    );
                    
                    if (description) {
                        bonusInfoElement.textContent = description;
                        bonusInfoElement.style.display = 'block';
                        return;
                    }
                }
            }
            
            // Скрываем если бонусов нет
            bonusInfoElement.style.display = 'none';
        };
    }

    // Также обновляем функцию применения экипировки для учета бонусов
    const originalApplyEquipment = window.equipmentSelector?.applyEquipmentSelection;
    if (window.equipmentSelector) {
        window.equipmentSelector.applyEquipmentSelection = function(slotType, equipmentType) {
            // Вызываем оригинальную функцию
            originalApplyEquipment.call(this, slotType, equipmentType);
            
            // Обновляем информацию о бонусах Жреца
            if (window.statCalculator?.showPriestBonusInfo) {
                setTimeout(() => {
                    window.statCalculator.showPriestBonusInfo();
                }, 100);
            }
        };
    }

    // console.log('Priest bonuses module loaded successfully');
}