// equipment_tooltip.js
document.addEventListener('DOMContentLoaded', function() {
    // Создаем элемент для подсказки
    const tooltip = document.createElement('div');
    tooltip.id = 'equipment-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: transparent;
        color: white;
        padding: 16px;
        font-size: 12px;
        max-width: 320px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: none;
        backdrop-filter: none;
        border: none;
        box-sizing: border-box;
    `;
    document.body.appendChild(tooltip);

    // Создаем элемент для рамки
    const border = document.createElement('div');
    border.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        border: 12px solid transparent;
        border-image: url('static/Ico/Tooltip/tt_x.png') 12 fill round;
        pointer-events: none;
        z-index: 0;
    `;
    tooltip.appendChild(border);

    // Создаем контейнер для контента
    const content = document.createElement('div');
    content.id = 'tooltip-content';
    content.style.cssText = `
        position: relative;
        z-index: 1;
    `;
    tooltip.appendChild(content);

    // Стили для внутренних элементов подсказки
    const style = document.createElement('style');
    style.textContent = `
        .tooltip-name {
            font-weight: bold;
            font-size: 14px;
            color: #ffd700;
            margin-bottom: 8px;
            border-bottom: 1px solid #444;
            padding-bottom: 4px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .tooltip-type {
            color: #aaa;
            font-size: 11px;
            margin-bottom: 6px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        .tooltip-stats {
            margin: 8px 0;
        }
        .tooltip-stat {
            margin: 2px 0;
            display: flex;
            justify-content: space-between;
        }
        .tooltip-stat-name {
            color: #ccc;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        .tooltip-stat-value {
            color: #4CAF50;
            font-weight: bold;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        .tooltip-bonus {
            color: #ff9800;
            margin: 2px 0;
            font-size: 11px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        .tooltip-class {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px solid #444;
            color: #64B5F6;
            font-weight: bold;
            font-size: 11px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        .tooltip-section {
            margin: 6px 0;
        }
        .tooltip-section-title {
            color: #ffd700;
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.8);
        }
        
        /* Дополнительные стили для прозрачности основного контейнера */
        #equipment-tooltip {
            background: transparent !important;
        }
        
        /* Стиль для контента */
        #tooltip-content {
            position: relative;
            z-index: 1;
        }
    `;
    document.head.appendChild(style);

    // Обработчики событий для слотов экипировки
    document.querySelectorAll('.equipment-slot').forEach(slot => {
        slot.addEventListener('mouseenter', function(event) {
            const slotType = this.getAttribute('data-slot');
            const equipmentData = window.equipmentData?.[slotType];
            
            if (equipmentData) {
                showTooltip(this, equipmentData, slotType);
            }
        });

        slot.addEventListener('mousemove', function(event) {
            if (tooltip.style.opacity === '1') {
                updateTooltipPosition(event);
            }
        });

        slot.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });

    // Функция показа подсказки
    function showTooltip(slotElement, equipmentData, slotType) {
        const currentClass = getCurrentCharacterClass();
        
        // Получаем базовые значения брони
        const baseArmor = window.armorCalculator?.getBaseArmor(
            currentClass,
            slotType,
            equipmentData.equipmentType,
            equipmentData.quality,
            equipmentData.quality
        );

        // Получаем бонусы от рун
        const runeBonus = calculateRuneBonus(equipmentData, baseArmor);
        
        // Формируем HTML подсказки
        let tooltipHTML = '';

        // Название и руны
        tooltipHTML += `<div class="tooltip-name">${equipmentData.type} ${equipmentData.runeLevel > 0 ? `+${equipmentData.runeLevel}` : ''}</div>`;

        // Тип экипировки
        const slotNames = {
            'helm': 'Голова',
            'shoulders': 'Плечи',
            'chest': 'Грудь',
            'pants': 'Штаны',
            'boots': 'Обувь',
            'hands': 'Перчатки',
            'bracers': 'Наручи',
            'belt': 'Пояс',
            'cape': 'Плащ',
            'neck': 'Ожерелье',
            'ring1': 'Кольцо',
            'ring2': 'Кольцо',
            'trinket1': 'Амулет',
            'trinket2': 'Амулет',
            'rhand': 'Оружие',
            'lhand': equipmentData.leftHandType === 'shield' ? 'Щит' : 'Оружие'
        };
        
        tooltipHTML += `<div class="tooltip-type">${slotNames[slotType] || slotType} • ${equipmentData.equipmentType === '4-stat' ? '4 характеристики' : '3 характеристики'}</div>`;

        // Базовые характеристики (броня/блок) - ПОКАЗЫВАЕМ БАЗОВЫЕ + БОНУС РУН В ОДНОЙ СТРОКЕ
        if (baseArmor && (baseArmor.armour > 0 || baseArmor.spell_armour > 0 || baseArmor.block > 0)) {
            tooltipHTML += `<div class="tooltip-section">`;
            tooltipHTML += `<div class="tooltip-section-title">Базовые характеристики:</div>`;
            
            if (baseArmor.armour > 0) {
                const totalArmour = baseArmor.armour + (runeBonus?.armour || 0);
                tooltipHTML += `<div class="tooltip-stat">
                    <span class="tooltip-stat-name">Броня:</span>
                    <span class="tooltip-stat-value">${formatNumber(totalArmour)}</span>
                </div>`;
                if (runeBonus?.armour > 0) {
                    tooltipHTML += `<div class="tooltip-bonus" style="margin-left: 10px;">↳ бонус рун: +${formatNumber(runeBonus.armour)}</div>`;
                }
            }
            
            if (baseArmor.spell_armour > 0) {
                const totalSpellArmour = baseArmor.spell_armour + (runeBonus?.spell_armour || 0);
                tooltipHTML += `<div class="tooltip-stat">
                    <span class="tooltip-stat-name">Маг. броня:</span>
                    <span class="tooltip-stat-value">${formatNumber(totalSpellArmour)}</span>
                </div>`;
                if (runeBonus?.spell_armour > 0) {
                    tooltipHTML += `<div class="tooltip-bonus" style="margin-left: 10px;">↳ бонус рун: +${formatNumber(runeBonus.spell_armour)}</div>`;
                }
            }
            
            if (baseArmor.block > 0) {
                const totalBlock = baseArmor.block + (runeBonus?.block || 0);
                tooltipHTML += `<div class="tooltip-stat">
                    <span class="tooltip-stat-name">Блок:</span>
                    <span class="tooltip-stat-value">${formatNumber(totalBlock)}</span>
                </div>`;
                if (runeBonus?.block > 0) {
                    tooltipHTML += `<div class="tooltip-bonus" style="margin-left: 10px;">↳ бонус рун: +${formatNumber(runeBonus.block)}</div>`;
                }
            }
            tooltipHTML += `</div>`;
        }

        // Основные характеристики (также показываем с бонусами рун)
        if (equipmentData.stats && Object.keys(equipmentData.stats).length > 0) {
            tooltipHTML += `<div class="tooltip-section">`;
            tooltipHTML += `<div class="tooltip-section-title">Характеристики:</div>`;
            
            const runeMultiplier = getRuneBonusMultiplier(slotType, equipmentData.runeLevel || 0);
            
            Object.entries(equipmentData.stats).forEach(([stat, value]) => {
                if (value > 0) {
                    const statNames = {
                        'attack_power': 'Сила атаки',
                        'attack_speed': 'Скорость атаки',
                        'hit': 'Точность',
                        'crit': 'Крит. урон',
                        'parry': 'Парирование',
                        'dodge': 'Уклонение',
                        'resist': 'Сопр. магии',
                        'block': 'Блок',
                        'spell_armour': 'Маг. броня',
                        'armour': 'Броня',
                        'mp_reg': 'Восст. энергии',
                        'hp_reg': 'Восст. здоровья',
                        'mp': 'Энергия',
                        'hp': 'Здоровье',
                        'crit_damage_resistance': 'Сопр. крит'
                    };
                    
                    const statName = statNames[stat] || stat;
                    const baseValue = value;
                    const runeBonusValue = Math.round(baseValue * runeMultiplier);
                    const totalValue = baseValue + runeBonusValue;
                    
                    tooltipHTML += `<div class="tooltip-stat">
                        <span class="tooltip-stat-name">${statName}:</span>
                        <span class="tooltip-stat-value">+${formatNumber(totalValue)}</span>
                    </div>`;
                    
                    if (runeBonusValue > 0) {
                        tooltipHTML += `<div class="tooltip-bonus" style="margin-left: 10px;">↳ бонус рун: +${formatNumber(runeBonusValue)}</div>`;
                    }
                }
            });
            tooltipHTML += `</div>`;
        }

        // Камни
        if (equipmentData.stones && equipmentData.stones.length > 0) {
            tooltipHTML += `<div class="tooltip-section">`;
            tooltipHTML += `<div class="tooltip-section-title">Камни (${equipmentData.stones.length}):</div>`;
            
            const stoneGroups = {};
            equipmentData.stones.forEach(stone => {
                if (!stoneGroups[stone.name]) {
                    stoneGroups[stone.name] = [];
                }
                stoneGroups[stone.name].push(stone.level);
            });
            
            Object.entries(stoneGroups).forEach(([name, levels]) => {
                const levelCounts = {};
                levels.forEach(level => {
                    levelCounts[level] = (levelCounts[level] || 0) + 1;
                });
                
                const levelText = Object.keys(levelCounts).map(level => {
                    const count = levelCounts[level];
                    return count > 1 ? `ур.${level}×${count}` : `ур.${level}`;
                }).join(', ');
                
                tooltipHTML += `<div class="tooltip-bonus">${name} (${levelText})</div>`;
            });
            tooltipHTML += `</div>`;
        }

        // Класс
        const classNames = {
            'warrior': 'Воин',
            'mage': 'Маг',
            'archer': 'Лучник',
            'priest': 'Жрец',
            'rogue': 'Разбойник'
        };
        
        tooltipHTML += `<div class="tooltip-class">Только для класса: ${classNames[currentClass] || currentClass}</div>`;

        // Используем content контейнер вместо прямого innerHTML tooltip
        content.innerHTML = tooltipHTML;
        tooltip.style.opacity = '1';
        
        // Позиционируем подсказку
        updateTooltipPosition({ clientX: event.clientX, clientY: event.clientY });
    }

    // Функция расчета бонусов от рун
    function calculateRuneBonus(equipmentData, baseArmor) {
        if (!equipmentData.runeLevel || equipmentData.runeLevel === 0) {
            return null;
        }

        // Получаем множитель бонуса рун для этого слота
        const runeMultiplier = getRuneBonusMultiplier(equipmentData.slot, equipmentData.runeLevel);
        
        if (runeMultiplier === 0) {
            return null;
        }

        const bonus = {
            armour: 0,
            spell_armour: 0,
            block: 0
        };

        // Применяем бонус к базовой броне
        if (baseArmor) {
            if (baseArmor.armour > 0) {
                bonus.armour = Math.round(baseArmor.armour * runeMultiplier);
            }
            if (baseArmor.spell_armour > 0) {
                bonus.spell_armour = Math.round(baseArmor.spell_armour * runeMultiplier);
            }
            if (baseArmor.block > 0) {
                bonus.block = Math.round(baseArmor.block * runeMultiplier);
            }
        }

        return bonus;
    }

    // Новая функция для получения множителя бонуса рун
    function getRuneBonusMultiplier(slotType, runeLevel) {
        const runeBonuses = {
            1: { equipment: 0.105, jewelry: 0.10, weapon: 0.105 },
            2: { equipment: 0.21, jewelry: 0.25, weapon: 0.21 },
            3: { equipment: 0.315, jewelry: 0.40, weapon: 0.315 },
            4: { equipment: 0.42, jewelry: 0.55, weapon: 0.42 },
            5: { equipment: 0.525, jewelry: 0.70, weapon: 0.525 },
            6: { equipment: 0.63, jewelry: 0.85, weapon: 0.63 },
            7: { equipment: 0.735, jewelry: 1.00, weapon: 0.735 },
            8: { equipment: 0.84, jewelry: 1.15, weapon: 0.84 },
            9: { equipment: 0.88, jewelry: 1.20, weapon: 0.88 },
            10: { equipment: 0.92, jewelry: 1.25, weapon: 0.92 },
            11: { equipment: 0.96, jewelry: 1.30, weapon: 0.96 },
            12: { equipment: 1.00, jewelry: 1.35, weapon: 1.00 }
        };

        if (!runeBonuses[runeLevel]) return 0;

        const equipmentSlots = ['chest', 'helm', 'shoulders', 'pants', 'boots', 'hands', 'bracers', 'belt', 'cape'];
        const jewelrySlots = ['neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
        const weaponSlots = ['rhand', 'lhand'];

        if (slotType === 'lhand' && window.equipmentData?.lhand?.leftHandType === 'shield') {
            return runeBonuses[runeLevel].weapon;
        }
        
        if (equipmentSlots.includes(slotType)) {
            return runeBonuses[runeLevel].equipment;
        } else if (jewelrySlots.includes(slotType)) {
            return runeBonuses[runeLevel].jewelry;
        } else if (weaponSlots.includes(slotType)) {
            return runeBonuses[runeLevel].weapon;
        }
        
        return 0;
    }

    // Функция обновления позиции подсказки
    function updateTooltipPosition(event) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let x = event.clientX + 15;
        let y = event.clientY + 15;
        
        // Проверяем, чтобы подсказка не выходила за правый край экрана
        if (x + tooltipRect.width > viewportWidth - 10) {
            x = event.clientX - tooltipRect.width - 15;
        }
        
        // Проверяем, чтобы подсказка не выходила за нижний край экрана
        if (y + tooltipRect.height > viewportHeight - 10) {
            y = event.clientY - tooltipRect.height - 15;
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    // Функция скрытия подсказки
    function hideTooltip() {
        tooltip.style.opacity = '0';
    }

    // Вспомогательная функция для получения текущего класса
    function getCurrentCharacterClass() {
        const activeClassButton = document.querySelector('.class-btn.active');
        if (activeClassButton) {
            return activeClassButton.getAttribute('data-class') || 'warrior';
        }
        return window.currentClass || 'warrior';
    }

    // Вспомогательная функция для форматирования чисел
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
});