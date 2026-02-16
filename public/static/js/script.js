document.addEventListener('DOMContentLoaded', function() {
    
    // Загрузка сохраненных данных
    loadSavedData();
});

async function loadSavedData() {
    try {
        const response = await fetch('/api/saves');
        const data = await response.json();
        
        if (data.success && data.saves.length > 0) {
            // Загрузить последнее сохранение
            const lastSave = data.saves[0];
            loadCharacterData(lastSave.save_data);
        }
    } catch (error) {
        console.error('Ошибка загрузки сохранений:', error);
    }
}

async function saveCharacterData() {
    const characterData = {
        class: window.currentClass,
        equipment: window.equipmentData || {},
        talents: window.talentData || {},
        elixirs: getSelectedElixirs(),
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(characterData)
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Данные сохранены:', data);
            showNotification('Данные успешно сохранены!', 'success');
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('Ошибка сохранения данных', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const classButtons = document.querySelectorAll('.class-btn');
    const talentTabButtons = document.querySelectorAll('.talent-tab-btn');
    const talentTabPanes = document.querySelectorAll('.talent-tab-pane');
    const statsTabButtons = document.querySelectorAll('.stats-tab-btn');
    const statsTabPanes = document.querySelectorAll('.stats-tab-pane');
    const elixirsTabButtons = document.querySelectorAll('.elixirs-tab-btn');
    const elixirsTabPanes = document.querySelectorAll('.elixirs-tab-pane');
    
    let currentClass = null;
    window.currentClass = null;
    
    // Обработчики для кнопок классов
    classButtons.forEach(button => {
        button.addEventListener('click', function() {
            classButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentClass = this.getAttribute('data-class');
            window.currentClass = currentClass;
            
            resetAllEquipment();
            loadClassStats(currentClass);
            
            // Обновляем систему талантов при смене класса
            if (window.talentSystem) {
                window.talentSystem.currentClass = currentClass;
                window.talentSystem.loadTalentsForClass(currentClass);
            }
            
            // Сохраняем выбор класса
            if (window.localStorageManager) {
                setTimeout(() => window.localStorageManager.saveAllData(), 100);
            }
        });
    });
    
    // Обработчики для вкладок талантов
    talentTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            talentTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            talentTabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Обработчики для вкладок статистик
    statsTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            statsTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            statsTabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Обработчики для вкладок эликсиров
    elixirsTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            elixirsTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            elixirsTabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Функция для форматирования чисел с пробелами для тысяч
    window.formatNumber = function(number) {
        if (typeof number !== 'number') return number;
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    // Инициализация базовых статистик
    function initializeBaseStats() {
        if (window.characterStats && window.statCalculator) {
            const baseStats = window.characterStats[currentClass];
            
            if (baseStats) {
                window.statCalculator.setBaseStats(currentClass, baseStats);
                const totalStats = window.statCalculator.calculateTotalStats();
                window.updateStatsDisplay(totalStats);
            } else {
                console.error('Базовые статистики не найдены для класса:', currentClass);
            }
        } else {
            console.error('characterStats или statCalculator не доступны');
        }
    }

    // Функция загрузки статистик класса
    function loadClassStats(characterClass) {
        const stats = window.characterStats && window.characterStats[characterClass];
        
        if (stats && window.statCalculator) {
            window.statCalculator.setBaseStats(characterClass, stats);
            const totalStats = window.statCalculator.calculateTotalStats();
            updateStatsDisplay(totalStats);
        }
    }

    // Функция обновления отображения статистик
    window.updateStatsDisplay = function(stats) {
        const statMapping = {
            'attack_power': 'attack_power',
            'attack_speed': 'attack_speed', 
            'hit': 'hit',
            'crit': 'crit',
            'parry': 'parry',
            'dodge': 'dodge',
            'resist': 'resist',
            'block': 'block',
            'spell_armour': 'spell_armour',
            'armour': 'armour',
            'mp_reg': 'mp_reg',
            'hp_reg': 'hp_reg',
            'mp': 'mp',
            'hp': 'hp',
            'crit_damage_resistance': 'crit_damage_resistance',
            'speed': 'speed'
        };
        
        for (const [stat, value] of Object.entries(stats)) {
            const elementId = statMapping[stat];
            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = window.formatNumber(value);
                }
            }
        }
    }

    // Функция сброса всей экипировки
    function resetAllEquipment() {
        if (window.equipmentData) {
            window.equipmentData = {};
        }
        
        if (window.statCalculator) {
            window.statCalculator.equipmentStats = {};
            window.statCalculator.runeStats = {};
            window.statCalculator.stoneStats = {};
            if (window.statCalculator.stoneCalculator) {
                window.statCalculator.stoneCalculator.reset();
            }
            if (window.statCalculator.runeCalculator) {
                window.statCalculator.runeCalculator.reset();
            }
        }
        
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            const slotType = slot.getAttribute('data-slot');
            slot.innerHTML = `
                <img src="/static/Ico/Button_Char/${getSlotIconName(slotType)}.svg" alt="${slotType}">
                <span>${getSlotName(slotType)}</span>
            `;
            slot.classList.remove('equipped');
        });
        
        updateLeftHandState();
    }

    // Вспомогательная функция для получения названий слотов
    function getSlotName(slotType) {
        const slotNames = {
            'helm': 'Голова',
            'shoulders': 'Плечи',
            'chest': 'Роба',
            'ring1': 'Кольцо 1',
            'trinket1': 'Амулет 1',
            'neck': 'Ожерелье',
            'pants': 'Штаны',
            'rhand': 'Оружие',
            'trinket2': 'Амулет 2',
            'hands': 'Перчатки',
            'boots': 'Сапоги',
            'lhand': 'Щит',
            'cape': 'Плащ',
            'bracers': 'Наручи',
            'belt': 'Пояс',
            'ring2': 'Кольцо 2'
        };
        return slotNames[slotType] || slotType;
    }

    // Вспомогательная функция для получения имен иконок
    function getSlotIconName(slotType) {
        const iconMapping = {
            'helm': '01_Helm',
            'shoulders': '02_shoulders',
            'chest': '04_Chest',
            'ring1': '08_Ring1',
            'trinket1': '06_Trinket1',
            'neck': '09_Neck',
            'pants': '16_Pants',
            'rhand': '07_Rhand',
            'trinket2': '18_Trinket2',
            'hands': '14_Hands',
            'boots': '17_Boots',
            'lhand': '11_Lhand',
            'cape': '03_Cape',
            'bracers': '13_Bracers',
            'belt': '15_Belt',
            'ring2': '12_Ring2'
        };
        return iconMapping[slotType] || slotType;
    }

    // Функция обновления всех статистик
    function updateAllStats() {
        if (!window.statCalculator) return;
        
        const totalStats = window.statCalculator.calculateTotalStats();
        const totalArmor = window.statCalculator.calculateTotalArmor();
        
        const finalStats = {
            ...totalStats,
            armour: totalArmor.armour || 0,
            spell_armour: totalArmor.spell_armour || 0,
            block: totalArmor.block || 0
        };
        
        window.updateStatsDisplay(finalStats);
    }

    // Обработчик гильдейского баффа
    document.getElementById('guild-buff').addEventListener('change', function() {
        if (window.statCalculator) {
            window.statCalculator.setGuildBuff(this.checked);
            // Принудительно обновляем статистики
            setTimeout(() => {
                window.statCalculator.updateStats();
            }, 100);
        }
    });

    // Обработчики эликсиров
    document.querySelectorAll('input[name="offensive-elixir"], input[name="defensive-elixir"]').forEach(input => {
        input.addEventListener('change', function() {
            if (!window.statCalculator) return;
            
            const offensiveElixir = document.querySelector('input[name="offensive-elixir"]:checked').value;
            const defensiveElixir = document.querySelector('input[name="defensive-elixir"]:checked').value;
            
            window.statCalculator.setElixirs(offensiveElixir, defensiveElixir);
            updateAllStats();
        });
    });

    // Обработчик для чекбокса талантов
    document.getElementById('talent-buff').addEventListener('change', function() {
        if (window.talentCalculator && window.applyTalents) {
            window.applyTalents();
        } else {
            updateAllStats();
        }
    });

    // Вспомогательная функция для обновления состояния левой руки
    function updateLeftHandState() {
        // Реализация зависит от логики приложения
    }

    // Инициализация после загрузки всех скриптов
    window.addEventListener('load', function() {
        setTimeout(() => {
            // Устанавливаем класс воина по умолчанию на случай, если нет сохраненных данных
            let defaultClass = 'warrior';
            currentClass = defaultClass;
            window.currentClass = defaultClass;
            
            // Загружаем сохраненные данные ЕСЛИ ЕСТЬ localStorageManager
            if (window.localStorageManager) {
                const hasLoadedData = window.localStorageManager.loadAllData();
                
                if (!hasLoadedData) {
                    // Если нет сохраненных данных, инициализируем с классом по умолчанию
                    initializeWithDefaultClass(defaultClass);
                } else {
                    // Если данные загружены, они уже установили текущий класс
                    // Ждем завершения загрузки талантов
                    setTimeout(() => {
                        if (window.currentClass) {
                            currentClass = window.currentClass;
                            loadClassStats(currentClass);
                            updateUIForClass(currentClass);
                        }
                    }, 500);
                }
                
                window.localStorageManager.setupAutoSave();
            } else {
                // Если localStorageManager не доступен, используем воина по умолчанию
                initializeWithDefaultClass(defaultClass);
            }
            
            // Обновляем статистики через 1 секунду после загрузки
            setTimeout(() => {
                if (window.statCalculator) {
                    window.statCalculator.updateStats();
                }
            }, 1000);
            
        }, 100);
    });

    function initializeWithDefaultClass(className) {
        currentClass = className;
        window.currentClass = className;
        
        // Обновляем UI кнопок класса
        updateUIForClass(className);
        
        // Загружаем статистики для выбранного класса
        loadClassStats(className);
        
        // Синхронизируем с системой талантов
        if (window.talentSystem && window.talentSystem.setCurrentClass) {
            window.talentSystem.setCurrentClass(className);
        }
    }
    
    function updateUIForClass(className) {
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-class') === className) {
                btn.classList.add('active');
            }
        });
    }

    // Обработчик кнопки сброса
    document.querySelector('.reset-btn').addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите сбросить все данные?')) {
            window.localStorageManager.clearAllData();
            alert('Все данные сброшены!');
        }
    });
});