// equipment_stats_selector.js
// Функции для выбора характеристик экипировки

function openEquipmentStatsSelector(slotType, equipmentData, equipmentType) {
    const slotNames = {
        'chest': 'Робы',
        'helm': 'Шлема',
        'shoulders': 'Наплечников',
        'pants': 'Штанов',
        'boots': 'Сапог',
        'hands': 'Перчаток',
        'bracers': 'Наручей',
        'belt': 'Пояса',
        'cape': 'Плаща',
        'neck': 'Ожерелья',
        'ring1': 'Кольца',
        'ring2': 'Кольца',
        'trinket1': 'Амулета',
        'trinket2': 'Амулета',
        'rhand': 'Оружия',
        'rlhand': 'Оружия',
        'lhand': 'Щита'
    };

    let qualityInfo = '';
    if (slotType === 'cape' && window.selectedQuality) {
        qualityInfo = `<p class="quality-info">Качество: ${EquipmentConfig.qualityNames[window.selectedQuality]}</p>`;
    }

    let weaponInfo = '';
    if (slotType === 'rhand' && window.selectedWeaponType) {
        weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
    }

    window.modalContent.innerHTML = `
        <h2 class="modal-title">Выбор ${slotNames[slotType] || 'экипировки'} (${equipmentType === '4-stat' ? '4 стата' : '3 стата'})</h2>
        ${qualityInfo}
        ${weaponInfo}
        
        <div class="search-container" style="margin: 20px 0;">
            <input type="text" 
                id="equipment-search" 
                placeholder="Поиск по названию или характеристикам (например: Атаки, Сила атаки, Здоровье...)" 
                style="width: 100%; 
                        padding: 12px 15px; 
                        border: 2px solid var(--border); 
                        border-radius: 10px; 
                        font-size: 1rem;
                        transition: var(--transition);
                        background: white;" />
            <div class="search-hint">Можно искать по названию экипировки или по характеристикам</div>
        </div>
        
        <p class="modal-subtitle">Выберите тип экипировки:</p>
        <div id="equipment-stats-grid">
            <!-- Характеристики будут загружены из XML -->
        </div>
        <div id="search-results-info" style="text-align: center; margin: 10px 0; color: var(--gray); font-size: 0.9rem;"></div>
        
        <div class="button-container">
            <button id="back-to-type" class="modal-button button-back">← Назад</button>
            <button id="confirm-equipment" class="modal-button button-confirm" disabled>Далее → Выбор рун</button>
        </div>
    `;

    window.currentEquipmentDataOriginal = [...equipmentData];
    
    loadEquipmentStatsOptions(equipmentData);
    setupSearchFunctionality();
    setupEquipmentSelection(slotType, equipmentType);

    document.getElementById('back-to-type').addEventListener('click', function() {
        const dataFile = EquipmentConfig.dataFiles[slotType];
        
        if (slotType === 'cape') {
            openQualitySelector(slotType, dataFile);
        } else if (slotType === 'rhand') {
            openWeaponTypeSelector(slotType, dataFile);
        } else {
            openEquipmentTypeSelector(slotType, dataFile);
        }
    });

    window.equipmentModal.style.display = 'flex';
}

function loadEquipmentStatsOptions(equipmentData) {
    const statsGrid = document.getElementById('equipment-stats-grid');
    
    if (!statsGrid) return;
    
    statsGrid.innerHTML = '';

    if (equipmentData.length === 0) {
        const currentClass = getCurrentCharacterClass();
        
        statsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; 
                    text-align: center; 
                    padding: 40px 20px; 
                    color: var(--gray);
                    background: var(--lighter);
                    border-radius: 12px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🎯</div>
                <h4 style="margin-bottom: 10px; color: var(--dark);">Нет доступной экипировки</h4>
                <p>Для класса <strong>${EquipmentConfig.classNames[currentClass]}</strong> нет подходящей экипировки</p>
                <p style="font-size: 0.9rem; margin-top: 10px; color: var(--gray);">
                    Попробуйте изменить поисковый запрос или выберите другой класс
                </p>
            </div>
        `;
        return;
    }

    equipmentData.forEach((equipType, index) => {
        const statOption = document.createElement('div');
        statOption.className = 'stat-option';
        statOption.setAttribute('data-index', index);

        const highlightedStats = equipType.stats.map(stat => {
            const searchTerm = document.getElementById('equipment-search')?.value.trim().toLowerCase();
            if (searchTerm && stat.toLowerCase().includes(searchTerm)) {
                return `<div style="background: var(--warning-light); padding: 2px 4px; border-radius: 4px; margin: 2px 0;">${stat}</div>`;
            }
            return `<div>${stat}</div>`;
        }).join('');

        statOption.innerHTML = `
            <h4>${equipType.type}</h4>
            <div class="stats-list">
                ${highlightedStats}
            </div>
        `;

        statsGrid.appendChild(statOption);
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('equipment-search');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        filterEquipmentOptions(searchTerm);
    });
}

function filterEquipmentOptions(searchTerm) {
    const resultsInfo = document.getElementById('search-results-info');
    const currentClass = getCurrentCharacterClass();
    
    if (!searchTerm) {
        const filteredByClass = filterEquipmentByClass(window.currentEquipmentDataOriginal, currentClass);
        loadEquipmentStatsOptions(filteredByClass);
        window.currentEquipmentData = filteredByClass;
        
        if (resultsInfo) {
            const totalForClass = filteredByClass.length;
            const totalAll = window.currentEquipmentDataOriginal.length;
            const hiddenCount = totalAll - totalForClass;
            
            let infoText = `Найдено: ${totalForClass} вариантов`;
            if (hiddenCount > 0) {
                infoText += ` (скрыто ${hiddenCount} для вашего класса)`;
            }
            resultsInfo.textContent = infoText;
        }
        return;
    }
    
    const filteredBySearch = window.currentEquipmentDataOriginal.filter(equip => {
        const nameMatch = equip.type.toLowerCase().includes(searchTerm);
        const statsMatch = equip.stats.some(stat => 
            stat.toLowerCase().includes(searchTerm)
        );
        return nameMatch || statsMatch;
    });
    
    const filteredData = filterEquipmentByClass(filteredBySearch, currentClass);
    window.currentEquipmentData = filteredData;
    
    loadEquipmentStatsOptions(filteredData);
    
    if (resultsInfo) {
        if (filteredData.length === 0) {
            resultsInfo.textContent = `Ничего не найдено по запросу "${searchTerm}" для вашего класса`;
            resultsInfo.style.color = 'var(--accent)';
        } else {
            const totalForClass = filteredData.length;
            const totalSearch = filteredBySearch.length;
            const hiddenCount = totalSearch - totalForClass;
            
            let infoText = `Найдено: ${totalForClass} из ${totalSearch} вариантов`;
            if (hiddenCount > 0) {
                infoText += ` (скрыто ${hiddenCount} для вашего класса)`;
            }
            resultsInfo.textContent = infoText;
            resultsInfo.style.color = 'var(--secondary)';
        }
    }
    
    document.getElementById('confirm-equipment').disabled = true;
    window.selectedStats = [];
}

function setupEquipmentSelection(slotType, equipmentType) {
    let selectedOption = null;

    document.getElementById('equipment-stats-grid').addEventListener('click', function(event) {
        const statOption = event.target.closest('.stat-option');
        if (!statOption) return;

        if (selectedOption) {
            selectedOption.classList.remove('selected');
        }

        statOption.classList.add('selected');
        selectedOption = statOption;

        const selectedIndex = parseInt(statOption.getAttribute('data-index'));
        
        if (window.currentEquipmentData && window.currentEquipmentData[selectedIndex]) {
            window.selectedStats = [selectedIndex];
            document.getElementById('confirm-equipment').disabled = false;
        } else {
            console.error('Неверный индекс выбранного элемента:', selectedIndex);
            document.getElementById('confirm-equipment').disabled = true;
        }
    });

    document.getElementById('confirm-equipment').addEventListener('click', function() {
        if (selectedOption && window.currentEquipmentData && window.selectedStats.length > 0) {
            const selectedIndex = window.selectedStats[0];
            if (window.currentEquipmentData[selectedIndex]) {
                openRuneSelector(slotType, equipmentType);
            } else {
                console.error('Выбран неверный индекс экипировки:', selectedIndex);
                alert('Ошибка выбора экипировки. Пожалуйста, выберите снова.');
            }
        } else {
            console.error('Не выбрана экипировка');
            alert('Пожалуйста, выберите тип экипировки');
        }
    });
}