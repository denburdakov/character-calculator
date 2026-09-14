// equipment_stats_selector.js
// Новая система: пользователь сам выбирает от 1 до 6 характеристик

// Все доступные характеристики с иконками и категориями
const AllAvailableStats = {
    'attack_power':           { name: 'Сила атаки',       icon: '⚔️', category: 'offensive' },
    'attack_speed':           { name: 'Скорость атаки',   icon: '💨', category: 'offensive' },
    'hit':                    { name: 'Точность',         icon: '🎯', category: 'offensive' },
    'crit':                   { name: 'Шанс крит. урона', icon: '💥', category: 'offensive' },
    'crit_damage':            { name: 'Критический урон', icon: '💢', category: 'offensive' },  // ← новый
    'parry':                  { name: 'Парирование',      icon: '🛡️', category: 'defensive' },
    'dodge':                  { name: 'Уклонение',        icon: '🌀', category: 'defensive' },
    'resist':                 { name: 'Сопр. Магии',      icon: '✨', category: 'defensive' },
    'block':                  { name: 'Блок',             icon: '🔰', category: 'defensive' },
    'spell_armour':           { name: 'Маг. Броня',       icon: '🔮', category: 'defensive' },
    'armour':                 { name: 'Броня',            icon: '🪨', category: 'defensive' },
    'mp_reg':                 { name: 'Восст. Энергии',   icon: '💧', category: 'resource'  },
    'hp_reg':                 { name: 'Восст. Здоровья',  icon: '💖', category: 'resource'  },
    'mp':                     { name: 'Энергия',          icon: '💠', category: 'resource'  },
    'hp':                     { name: 'Здоровье',         icon: '❤️', category: 'resource'  },
    'crit_damage_resistance': { name: 'Сопр. Крит',       icon: '🚫', category: 'defensive' }
};

const MAX_STATS = 6;

// Кэш средних значений по слотам
window.slotAverageStatsCache = {};

/* ============================================================
   ЗАГРУЗКА СРЕДНИХ ИЗ XML (3-stats + 4-stats вместе)
   ============================================================ */
async function loadSlotAverageStats(slotType, dataFile) {
    const cacheKey = slotType;
    if (window.slotAverageStatsCache[cacheKey]) {
        return window.slotAverageStatsCache[cacheKey];
    }

    const allStatValues = {};
    const currentClass  = getCurrentCharacterClass();
    const paths         = [];
    const folders       = ['3-stats', '4-stats'];

    for (const folder of folders) {
        if (slotType === 'cape') {
            paths.push(`/data/orange/${folder}/${dataFile}`);
            paths.push(`/data/red/${folder}/${dataFile}`);
        } else if (EquipmentConfig.jewelrySlots.includes(slotType)) {
            paths.push(`/data/jewelry/purple/${folder}/${dataFile}`);
            paths.push(`/data/jewelry/orange/${folder}/${dataFile}`);
        } else {
            paths.push(`/data/equipment/${folder}/${dataFile}`);
        }
    }

    for (const filePath of paths) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) continue;

            const xmlText = await response.text();
            const parser  = new DOMParser();
            const xmlDoc  = parser.parseFromString(xmlText, 'text/xml');

            const equipmentData = extractClassesFromXML(xmlDoc, '4-stat');
            const filteredData  = filterEquipmentByClass(equipmentData, currentClass);

            filteredData.forEach(equip => {
                equip.stats.forEach(statLine => {
                    const match = statLine.match(/^(.+?)\s*[:\+]\s*(\d+)$/);
                    if (!match) return;

                    const statName = match[1].trim();
                    const value    = parseInt(match[2], 10);
                    const statKey  = EquipmentConfig.statMapping[statName];

                    if (statKey && !isNaN(value)) {
                        if (!allStatValues[statKey]) allStatValues[statKey] = [];
                        allStatValues[statKey].push(value);
                    }
                });
            });
        } catch (e) {
            console.warn(`⚠️ ${filePath}:`, e);
        }
    }

    const result = {};
    Object.entries(allStatValues).forEach(([statKey, values]) => {
        if (values.length === 0) return;
        const sum     = values.reduce((a, b) => a + b, 0);
        const average = Math.round(sum / values.length);
        const min     = Math.round(average * 0.8); // -20%
        const max     = Math.round(average * 1.2); // +20%
        result[statKey] = { average, min, max, samples: values.length };
    });

    window.slotAverageStatsCache[cacheKey] = result;
    console.log(`📊 Средние значения для ${slotType}:`, result);
    return result;
}

/* ============================================================
   ГЛАВНАЯ ФУНКЦИЯ — ОТКРЫТИЕ СЕЛЕКТОРА ХАРАКТЕРИСТИК
   ============================================================ */
async function openEquipmentStatsSelector(slotType, equipmentData, equipmentType) {
    // Если тип не передан — рандомим 3-stat / 4-stat (влияет только на иконку предмета)
    if (!equipmentType) {
        equipmentType = Math.random() < 0.5 ? '3-stat' : '4-stat';
    }
    window.selectedEquipmentType = equipmentType;

    // Определяем файл данных
    let dataFile = EquipmentConfig.dataFiles[slotType];
    if (slotType === 'rhand' && window.selectedWeaponType === 'two-handed') {
        dataFile = 'Оружие2.xml';
    }
    if (slotType === 'lhand' && window.selectedLeftHandType === 'shield') {
        dataFile = 'Щит.xml';
    }

    // Показываем индикатор загрузки
    window.modalContent.innerHTML = `
        <h2 class="modal-title">Выбор характеристик</h2>
        <div style="text-align:center; padding: 40px;">
            <div style="font-size: 2rem;">⏳</div>
            <p>Загрузка средних значений из XML...</p>
        </div>
    `;
    window.equipmentModal.style.display = 'flex';

    // Грузим средние значения
    const averages = await loadSlotAverageStats(slotType, dataFile);

    // Генерируем карточки статов
    const statCardsHTML = Object.entries(AllAvailableStats).map(([statKey, info]) => {
        const avg      = averages[statKey];
        const hasAvg   = !!avg;
        const avgValue = hasAvg ? avg.average : '';
        const rangeTxt = hasAvg ? `${avg.min}–${avg.max}` : '—';
        const sample   = hasAvg ? `n=${avg.samples}` : '';

        return `
            <div class="stat-option stat-cat-${info.category}" data-stat="${statKey}">
                <div class="stat-option-header">
                    <span class="stat-icon">${info.icon}</span>
                    <h3>${info.name}</h3>
                    <span class="stat-counter" data-stat="${statKey}">0</span>
                </div>
                <p class="stat-average" data-stat="${statKey}">
                    ${hasAvg
                        ? `<span class="avg-label">Среднее из статов:</span>
                        <span class="avg-value">${avgValue}</span>
                        <span class="avg-range">размах: ${rangeTxt}</span>
                        <span class="avg-samples">${sample}</span>`
                        : `<span class="no-data">Нет данных на этом классе</span>`}
                </p>
                <div class="instances-container" data-stat="${statKey}"></div>
            </div>
        `;
    }).join('');

    const slotTitles = {
        'chest': 'Роба', 'helm': 'Шлем', 'shoulders': 'Наплечники',
        'pants': 'Штаны', 'boots': 'Сапоги', 'hands': 'Перчатки',
        'bracers': 'Наручи', 'belt': 'Пояс', 'cape': 'Плащ',
        'neck': 'Ожерелье', 'ring1': 'Кольцо', 'ring2': 'Кольцо',
        'trinket1': 'Амулет', 'trinket2': 'Амулет',
        'rhand': 'Оружие', 'lhand': 'Щит'
    };

    window.modalContent.innerHTML = `
        <h2 class="modal-title">Выбор характеристик — ${slotTitles[slotType] || ''}</h2>
        <p class="modal-subtitle">
            Выберите от <strong>1</strong> до <strong>${MAX_STATS}</strong> характеристик.
            Можно выбирать одну и ту же характеристику несколько раз.
            Выбрано: <span id="selected-stats-count">0</span>/${MAX_STATS}
        </p>

        <div class="stats-grid">
            ${statCardsHTML}
        </div>

        <div id="selected-stats">
            <h4>Выбранные характеристики: <span id="stats-counter">0/${MAX_STATS}</span></h4>
            <div id="stats-list">Не выбрано</div>
            <button id="reset-stats" class="modal-button button-reset">Сбросить характеристики</button>
        </div>

        <div class="button-container">
            <button id="back-button" class="modal-button button-back">← Назад</button>
            <button id="confirm-equipment" class="modal-button button-confirm" disabled>
                Далее → Выбор рун
            </button>
        </div>
    `;

    setupStatsSelection(slotType, dataFile, equipmentType);

    // Кнопка "Назад"
    document.getElementById('back-button').addEventListener('click', function() {
        if (slotType === 'rhand' && typeof openWeaponTypeSelector === 'function') {
            openWeaponTypeSelector(slotType, dataFile);
        } else if (slotType === 'lhand' && typeof openLeftHandTypeSelector === 'function') {
            openLeftHandTypeSelector(slotType);
        } else if (typeof window.closeModal === 'function') {
            window.closeModal();
        }
    });

    window.equipmentModal.style.display = 'flex';
}

/* ============================================================
   ОБРАБОТЧИКИ ВЫБОРА
   ============================================================ */
function setupStatsSelection(slotType, dataFile, equipmentType) {
    // Массив экземпляров: [{ uid, statKey, value }]
    const instances = [];
    let uidCounter = 0;

    document.querySelectorAll('.stat-option').forEach(card => {
        const statKey = card.getAttribute('data-stat');

        card.addEventListener('click', (e) => {
            // Игнорируем клики по инпутам и кнопкам удаления
            if (e.target.closest('.stat-value-input') ||
                e.target.closest('.remove-instance-btn') ||
                e.target.closest('.instance-input-row')) {
                return;
            }

            if (instances.length >= MAX_STATS) {
                alert(`Можно выбрать не более ${MAX_STATS} характеристик (включая повторы)`);
                return;
            }

            // Добавляем новый экземпляр
            const avg = window.slotAverageStatsCache[slotType]?.[statKey];
            const uid = `inst_${++uidCounter}`;
            instances.push({
                uid,
                statKey,
                value: avg ? avg.average : null
            });

            renderInstancesInCard(card, statKey, instances, slotType);
            updateSelectedStatsDisplay(instances, slotType);
            updateConfirmButton(instances);

            // Фокус на только что добавленный инпут
            setTimeout(() => {
                const newInput = card.querySelector(`.stat-value-input[data-uid="${uid}"]`);
                if (newInput) newInput.focus();
            }, 30);
        });
    });

    // Сброс
    document.getElementById('reset-stats').addEventListener('click', () => {
        instances.length = 0;
        document.querySelectorAll('.stat-option').forEach(card => {
            card.querySelector('.stat-counter').textContent = '0';
            const container = card.querySelector('.instances-container');
            if (container) container.innerHTML = '';
        });
        updateSelectedStatsDisplay(instances, slotType);
        updateConfirmButton(instances);
    });

    // Подтверждение
    document.getElementById('confirm-equipment').addEventListener('click', function() {
        // Валидация
        for (const inst of instances) {
            if (!inst.value || inst.value <= 0) {
                alert(`Введите значение для "${AllAvailableStats[inst.statKey].name}"`);
                const input = document.querySelector(`.stat-value-input[data-uid="${inst.uid}"]`);
                if (input) input.focus();
                return;
            }
        }

        if (instances.length === 0) {
            alert('Выберите хотя бы одну характеристику');
            return;
        }

        // Сборка данных
        const averages  = window.slotAverageStatsCache[slotType] || {};
        const slotTitle = getSlotNameForType(slotType);

        // Название типа — с учётом дубликатов: "Сила атаки ×2, Здоровье"
        const counts = {};
        instances.forEach(inst => {
            counts[inst.statKey] = (counts[inst.statKey] || 0) + 1;
        });
        const nameParts = Object.entries(counts).map(([key, count]) => {
            const n = AllAvailableStats[key].name;
            return count > 1 ? `${n} ×${count}` : n;
        });
        const typeName = `${slotTitle} (${nameParts.join(', ')})`;

        // Итоговые статы — суммируем значения одинаковых характеристик
        const parsedStats = {};
        instances.forEach(inst => {
            parsedStats[inst.statKey] = (parsedStats[inst.statKey] || 0) + inst.value;
        });

        // Строки для отображения (одна строка на экземпляр)
        const statsStrings = instances.map(inst => {
            const avg = averages[inst.statKey];
            const rangeNote = avg ? ` (размах: ${avg.min}–${avg.max})` : '';
            return `${AllAvailableStats[inst.statKey].name} +${inst.value}${rangeNote}`;
        });

        window.currentEquipmentData = [{
            type: typeName,
            stats: statsStrings,
            statKey: Object.keys(parsedStats).join('|'),
            classes: [getCurrentCharacterClass()],
            parsedStats,
            instances: instances.map(i => ({ ...i }))   // сохраняем подробности
        }];

        window.selectedStats = [0];

        openRuneSelector(slotType, equipmentType);
    });
}

/* ============================================================
   РЕНДЕР ЭКЗЕМПЛЯРОВ ВНУТРИ КАРТОЧКИ
   ============================================================ */
function renderInstancesInCard(card, statKey, instances, slotType) {
    const counter   = card.querySelector('.stat-counter');
    const container = card.querySelector('.instances-container');

    const cardInstances = instances.filter(i => i.statKey === statKey);

    counter.textContent = cardInstances.length;
    card.classList.toggle('has-instances', cardInstances.length > 0);

    if (cardInstances.length === 0) {
        container.innerHTML = '';
        return;
    }

    const avg = window.slotAverageStatsCache[slotType]?.[statKey];

    container.innerHTML = cardInstances.map((inst, idx) => `
        <div class="instance-input-row" data-uid="${inst.uid}">
            <span class="instance-index">#${idx + 1}</span>
            <input type="number"
                   class="stat-value-input"
                   data-uid="${inst.uid}"
                   data-stat="${statKey}"
                   placeholder="Значение"
                   min="1"
                   value="${inst.value ?? ''}">
            <span class="input-unit">ед.</span>
            <button class="remove-instance-btn" data-uid="${inst.uid}" title="Убрать">✕</button>
        </div>
    `).join('');

    // Подписка на инпуты
    container.querySelectorAll('.stat-value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            e.stopPropagation();
            const uid = input.getAttribute('data-uid');
            const inst = instances.find(i => i.uid === uid);
            if (inst) inst.value = parseInt(input.value, 10) || 0;
            updateSelectedStatsDisplay(instances, slotType);
            updateConfirmButton(instances);
        });
        input.addEventListener('click', e => e.stopPropagation());
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
    });

    // Подписка на кнопки удаления
    container.querySelectorAll('.remove-instance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = btn.getAttribute('data-uid');
            const idx = instances.findIndex(i => i.uid === uid);
            if (idx > -1) instances.splice(idx, 1);

            renderInstancesInCard(card, statKey, instances, slotType);
            updateSelectedStatsDisplay(instances, slotType);
            updateConfirmButton(instances);
        });
    });
}

/* ============================================================
   ОБНОВЛЕНИЕ СПИСКА ВЫБРАННЫХ
   ============================================================ */
function updateSelectedStatsDisplay(instances, slotType) {
    const counter      = document.getElementById('stats-counter');
    const list         = document.getElementById('stats-list');
    const countDisplay = document.getElementById('selected-stats-count');

    if (counter)      counter.textContent      = `${instances.length}/${MAX_STATS}`;
    if (countDisplay) countDisplay.textContent = instances.length;

    if (instances.length === 0) {
        list.innerHTML = 'Не выбрано';
        return;
    }

    list.innerHTML = instances.map(inst => {
        const info  = AllAvailableStats[inst.statKey];
        const value = inst.value ?? 0;
        return `<div class="selected-stat-item">
            <span class="item-icon">${info.icon}</span>
            <span class="item-name">${info.name}</span>
            <span class="item-value">+${value}</span>
            <button class="remove-stat-btn" data-uid="${inst.uid}" title="Убрать">✕</button>
        </div>`;
    }).join('');

    // Удаление из панели
    list.querySelectorAll('.remove-stat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = btn.getAttribute('data-uid');
            const inst = instances.find(i => i.uid === uid);
            if (!inst) return;

            const idx = instances.findIndex(i => i.uid === uid);
            if (idx > -1) instances.splice(idx, 1);

            const card = document.querySelector(`.stat-option[data-stat="${inst.statKey}"]`);
            if (card) renderInstancesInCard(card, inst.statKey, instances, slotType);

            updateSelectedStatsDisplay(instances, slotType);
            updateConfirmButton(instances);
        });
    });
}

function updateConfirmButton(instances) {
    const btn = document.getElementById('confirm-equipment');
    if (!btn) return;
    const allValid = instances.length > 0 && instances.every(s => s.value && s.value > 0);
    btn.disabled = !allValid;
}

function getSlotNameForType(slotType) {
    const names = {
        'chest': 'Роба', 'helm': 'Шлем', 'shoulders': 'Наплечники',
        'pants': 'Штаны', 'boots': 'Сапоги', 'hands': 'Перчатки',
        'bracers': 'Наручи', 'belt': 'Пояс', 'cape': 'Плащ',
        'neck': 'Ожерелье', 'ring1': 'Кольцо', 'ring2': 'Кольцо',
        'trinket1': 'Амулет', 'trinket2': 'Амулет',
        'rhand': 'Оружие', 'lhand': 'Щит'
    };
    return names[slotType] || 'Экипировка';
}