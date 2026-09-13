// equipment_stones_selector.js
// Выбор камней: Камни Силы (absolute) / Камни Концентрации (percent) / Оружейные камни

// Какие статы доступны для Камней Концентрации
const ConcentrationTargetStats = {
    'hp':                     'Здоровье',
    'mp':                     'Энергия',
    'hp_reg':                 'Восст. Здоровья',
    'mp_reg':                 'Восст. Энергии',
    'attack_power':           'Сила атаки',
    'attack_speed':           'Скорость атаки',
    'hit':                    'Точность',
    'crit':                   'Крит. Урон',
    'dodge':                  'Уклонение',
    'parry':                  'Парирование',
    'resist':                 'Сопр. магии',
    'armour':                 'Броня',
    'spell_armour':           'Маг. Броня',
    'block':                  'Блок',
    'crit_damage_resistance': 'Сопр. Крит'
};

// Иконки для характеристик (используются в попапе выбора цели)
const ConcentrationStatIcons = {
    'hp':                     '❤️',
    'mp':                     '💠',
    'hp_reg':                 '💖',
    'mp_reg':                 '💧',
    'attack_power':           '⚔️',
    'attack_speed':           '💨',
    'hit':                    '🎯',
    'crit':                   '💥',
    'dodge':                  '🌀',
    'parry':                  '🛡️',
    'resist':                 '✨',
    'armour':                 '🪨',
    'spell_armour':           '🔮',
    'block':                  '🔰',
    'crit_damage_resistance': '🚫'
};

function getConcentrationStatIcon(statKey) {
    return ConcentrationStatIcons[statKey] || '📊';
}

/* ============================================================
   ПОПАП ВЫБОРА ХАРАКТЕРИСТИКИ ДЛЯ КОНЦЕНТРАЦИИ
   ============================================================ */
function showConcentrationTargetChooser(stoneId, level, onSelect) {
    // Удаляем предыдущий попап, если был
    document.querySelectorAll('.conc-chooser-overlay').forEach(el => el.remove());

    const data = stoneBonuses.concentration[stoneId];
    const value = data ? data.values[level - 1] : 0;

    const overlay = document.createElement('div');
    overlay.className = 'conc-chooser-overlay';

    overlay.innerHTML = `
        <div class="conc-chooser-modal" role="dialog" aria-modal="true">
            <button class="conc-chooser-close" title="Закрыть">✕</button>
            <h3 class="conc-chooser-title">✨ Куда направить Концентрацию?</h3>
            <p class="conc-chooser-subtitle">
                Уровень <strong>${level}</strong> · <strong>+${value}%</strong> к выбранной характеристике
            </p>
            <div class="conc-chooser-grid">
                ${Object.entries(ConcentrationTargetStats).map(([k, v]) => `
                    <button type="button" class="conc-target-btn" data-stat="${k}">
                        <span class="conc-target-icon">${getConcentrationStatIcon(k)}</span>
                        <span class="conc-target-name">${v}</span>
                    </button>
                `).join('')}
            </div>
            <button type="button" class="conc-chooser-cancel">Отмена</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Анимация появления
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Выбор характеристики
    overlay.querySelectorAll('.conc-target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const stat = btn.getAttribute('data-stat');
            closeChooser();
            onSelect(stat);
        });
    });

    // Отмена
    overlay.querySelector('.conc-chooser-cancel').addEventListener('click', closeChooser);
    overlay.querySelector('.conc-chooser-close').addEventListener('click', closeChooser);

    // Клик по фону
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeChooser();
    });

    // Esc
    const escHandler = (e) => {
        if (e.key === 'Escape') closeChooser();
    };
    document.addEventListener('keydown', escHandler);

    function closeChooser() {
        document.removeEventListener('keydown', escHandler);
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 180);
    }
}

/* ============================================================
   ОСНОВНАЯ ФУНКЦИЯ — ОТКРЫТИЕ СЕЛЕКТОРА КАМНЕЙ
   ============================================================ */
function openStoneSelector(slotType, equipmentType) {
    const isWeaponOrShield = EquipmentConfig.weaponSlots.includes(slotType) ||
                            (slotType === 'lhand' && (window.selectedLeftHandType === 'weapon' || window.selectedLeftHandType === 'shield'));

    let isTwoHandedWeapon = false;
    if (slotType === 'rhand') {
        isTwoHandedWeapon = window.selectedWeaponType === 'two-handed';
    }

    if (EquipmentConfig.skipStonesSlots.includes(slotType)) {
        applyEquipmentSelection(slotType, equipmentType);
        window.closeModal();
        return;
    }

    window.selectedStones = [];
    let currentStoneLevel = 1;
    let currentStoneCategory = isWeaponOrShield ? 'weapon' : 'strength';

    const render = () => {
        const maxStones = getMaxStones(slotType, isTwoHandedWeapon);

        let weaponInfo = '';
        if (slotType === 'rhand' && window.selectedWeaponType) {
            weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
        }

        // Переключатель категории (только для не-оружия)
        const categorySwitcher = isWeaponOrShield ? '' : `
            <div class="stone-category-switcher">
                <button class="stone-cat-btn ${currentStoneCategory === 'strength' ? 'active' : ''}" data-cat="strength">💎 Камни Силы</button>
                <button class="stone-cat-btn ${currentStoneCategory === 'concentration' ? 'active' : ''}" data-cat="concentration">✨ Камни Концентрации</button>
            </div>
        `;

        let stones = [];
        if (isWeaponOrShield) {
            stones = StonesData.weapon;
        } else if (currentStoneCategory === 'concentration') {
            stones = StonesData.concentration;
        } else {
            stones = StonesData.strength;
        }

        const maxLevel = isWeaponOrShield ? 5 : 10;
        const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
        const isConcentrationCategory = !isWeaponOrShield && currentStoneCategory === 'concentration';

        const cardsHTML = stones.map(stone => {
            const bonusData = isWeaponOrShield
                ? stoneBonuses.weapon[stone.id]
                : (currentStoneCategory === 'concentration'
                    ? stoneBonuses.concentration[stone.id]
                    : stoneBonuses.strength[stone.id]);

            const levelValue = bonusData ? bonusData.values[currentStoneLevel - 1] : 0;
            const isPercent = bonusData && (bonusData.type === 'percent' || bonusData.type === 'concentration');
            const valueText = isPercent ? `+${levelValue}%` : `+${levelValue} ед.`;

            // Подсказка / превью цели для концентрации
            const concHint = isConcentrationCategory ? `
                <div class="conc-hint">
                    <span class="conc-hint-icon">🎯</span>
                    <span class="conc-hint-text">Нажмите, чтобы выбрать характеристику</span>
                </div>
            ` : '';

            return `
                <div class="stone-option ${isConcentrationCategory ? 'concentration-stone' : ''}"
                     data-stone="${stone.id}"
                     style="background: ${stone.color}20; border: 2px solid ${stone.color}40;">
                    <h3 style="color: ${stone.color};">${stone.name}</h3>
                    <p class="stone-values" id="stone-${stone.id}-values">${valueText}</p>
                    ${concHint}
                    <div class="stone-counter" id="stone-${stone.id}-counter">0</div>
                </div>
            `;
        }).join('');

        window.modalContent.innerHTML = `
            <h2 class="modal-title">Выбор камней</h2>
            ${weaponInfo}
            ${categorySwitcher}
            <p class="modal-subtitle" id="stone-subtitle">${getStoneSubtitle(slotType, isWeaponOrShield, isTwoHandedWeapon)}</p>

            <div class="stone-level-selector">
                <h4>Уровень камня:</h4>
                <div class="stone-levels">
                    ${levels.map(lvl => `
                        <div class="stone-level-option ${lvl === currentStoneLevel ? 'selected' : ''}" data-level="${lvl}">
                            <span>Ур. ${lvl}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stones-grid">${cardsHTML}</div>

            <div id="selected-stones">
                <h4>Выбранные камни: <span id="stone-counter">0/${maxStones}</span></h4>
                <div id="stones-list">Не выбрано</div>
                <button id="reset-stones" class="modal-button button-reset">Сбросить камни</button>
            </div>

            <div class="button-container">
                <button id="back-to-runes" class="modal-button button-back">← Назад</button>
                <button id="skip-stones" class="modal-button button-skip">Без камней</button>
                <button id="confirm-stones" class="modal-button button-confirm">Применить экипировку</button>
            </div>
        `;

        bindEvents();
    };

    const bindEvents = () => {
        const isWeaponOrShieldLocal = isWeaponOrShield;
        const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
        const isConcentrationLocal = !isWeaponOrShield && currentStoneCategory === 'concentration';

        // Переключение категории
        document.querySelectorAll('.stone-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentStoneCategory = btn.getAttribute('data-cat');
                window.selectedStones = [];
                render();
            });
        });

        // Уровень
        document.querySelectorAll('.stone-level-option').forEach(opt => {
            opt.addEventListener('click', () => {
                currentStoneLevel = parseInt(opt.getAttribute('data-level'));
                render();
            });
        });

        // Клик по камню
        document.querySelectorAll('.stone-option').forEach(option => {
            option.addEventListener('click', () => {
                const stoneId = option.getAttribute('data-stone');

                if (window.selectedStones.length >= maxStones) {
                    alert(`Можно выбрать не более ${maxStones} камней`);
                    return;
                }

                const sameCount = window.selectedStones.filter(s => s.id === stoneId).length;
                if (isWeaponOrShieldLocal) {
                    if (sameCount >= 2) {
                        alert('Можно установить максимум 2 одинаковых камня в оружие');
                        return;
                    }
                } else if (!isConcentrationLocal) {
                    if (sameCount >= 1) {
                        alert('Нельзя устанавливать одинаковые камни в обычную экипировку');
                        return;
                    }
                }

                // === КОНЦЕНТРАЦИЯ: сначала спросим цель ===
                if (isConcentrationLocal) {
                    showConcentrationTargetChooser(stoneId, currentStoneLevel, (targetStat) => {
                        window.selectedStones.push({
                            id: stoneId,
                            category: 'concentration',
                            level: currentStoneLevel,
                            targetStat
                        });
                        updateSelectedStonesDisplay(slotType, isTwoHandedWeapon, isWeaponOrShieldLocal);
                        render();
                    });
                    return;
                }

                // Обычное добавление (сила / оружие)
                window.selectedStones.push({
                    id: stoneId,
                    category: isWeaponOrShieldLocal ? 'weapon' : currentStoneCategory,
                    level: currentStoneLevel,
                    targetStat: null
                });

                updateSelectedStonesDisplay(slotType, isTwoHandedWeapon, isWeaponOrShieldLocal);
                render();
            });
        });

        document.getElementById('reset-stones').addEventListener('click', () => {
            window.selectedStones = [];
            render();
        });

        document.getElementById('skip-stones').addEventListener('click', () => {
            window.selectedStones = [];
            applyEquipmentSelection(slotType, equipmentType);
            window.closeModal();
        });

        document.getElementById('back-to-runes').addEventListener('click', () => {
            openRuneSelector(slotType, equipmentType);
        });

        document.getElementById('confirm-stones').addEventListener('click', () => {
            if (window.currentEquipmentData && window.selectedStats.length > 0) {
                applyEquipmentSelection(slotType, equipmentType);
                window.closeModal();
            } else {
                alert('Пожалуйста, выберите тип экипировки');
            }
        });

        updateSelectedStonesDisplay(slotType, isTwoHandedWeapon, isWeaponOrShieldLocal);
    };

    render();
    window.equipmentModal.style.display = 'flex';
}

/* ---------- вспомогательные ---------- */

function getStoneSubtitle(slotType, isWeapon = false, isTwoHandedWeapon = false) {
    if (EquipmentConfig.skipStonesSlots.includes(slotType)) {
        return 'Камни не доступны для этого типа экипировки';
    }
    const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
    if (isWeapon) {
        if (maxStones === 8) return 'Двуручное оружие: до 8 камней Потенциала (до 2 одинаковых).';
        if (slotType === 'lhand' && window.selectedLeftHandType === 'shield')
            return 'Щит: до 4 камней Потенциала (до 2 одинаковых).';
        return 'Одноручное оружие: до 4 камней Потенциала (до 2 одинаковых).';
    }
    return 'Экипировка: до 1 камня Силы или Концентрации. Камни Силы — фиксированные значения, Камни Концентрации — процент к выбранной характеристике.';
}

function updateSelectedStonesDisplay(slotType, isTwoHandedWeapon, isWeapon) {
    const list    = document.getElementById('stones-list');
    const counter = document.getElementById('stone-counter');
    if (!list || !counter) return;

    const maxStones = getMaxStones(slotType, isTwoHandedWeapon);
    counter.textContent = `${window.selectedStones.length}/${maxStones}`;

    // Обновляем счётчик на каждой карточке камня
    document.querySelectorAll('.stone-option').forEach(option => {
        const stoneId     = option.getAttribute('data-stone');
        const cardCounter = option.querySelector('.stone-counter');
        if (!cardCounter) return;

        const count = window.selectedStones.filter(s => s.id === stoneId).length;
        cardCounter.textContent = count;
        cardCounter.classList.toggle('active', count > 0);
    });

    if (window.selectedStones.length === 0) {
        list.innerHTML = 'Не выбрано';
        return;
    }

    list.innerHTML = window.selectedStones.map(s => {
        if (s.id === 'concentration') {
            const targetName = ConcentrationTargetStats[s.targetStat] || '?';
            const icon = getConcentrationStatIcon(s.targetStat);
            return `<div class="selected-stone-item conc-item">
                <span class="conc-item-icon">${icon}</span>
                <span class="conc-item-text">Концентрация → <strong>${targetName}</strong></span>
                <span class="conc-item-level">ур. ${s.level}</span>
            </div>`;
        }
        const name = StonesData.strength.find(x => x.id === s.id)?.name ||
                     StonesData.weapon.find(x => x.id === s.id)?.name || s.id;
        return `<div class="selected-stone-item">${name} (ур. ${s.level})</div>`;
    }).join('');
}

// совместимость
const stoneBonusesData = stoneBonuses;