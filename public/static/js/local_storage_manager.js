// local_storage_manager.js
class LocalStorageManager {
    constructor() {
        this.storageKey = 'reforge_simulator_data';
        this.currentClass = null;
        this.isLoading = false; // Флаг загрузки для предотвращения рекурсии
    }

    // Сохранение всех данных
    saveAllData() {
        try {
            // Собираем данные талантов из системы талантов
            let talentData = {};
            let spentPoints = 0;
            
            // ПРИОРИТЕТ: используем window.talentSystem если доступен
            if (window.talentSystem && window.talentSystem.talentPoints) {
                talentData = window.talentSystem.talentPoints;
                spentPoints = window.talentSystem.spentPoints || 0;
                console.log('✅ Таланты сохранены из talentSystem:', talentData);
            } else if (window.talentCalculator && window.talentCalculator.talentPoints) {
                talentData = window.talentCalculator.talentPoints;
                console.log('✅ Таланты сохранены из talentCalculator:', talentData);
            }

            const data = {
                // Текущий класс
                currentClass: window.currentClass || 'warrior',
                
                // Экипировка
                equipmentData: window.equipmentData || {},
                
                // Таланты - сохраняем ВСЕ данные системы талантов
                talentPoints: talentData,
                talentAuras: window.statCalculator?.talentAuras || {},
                talentSpentPoints: spentPoints,
                availablePoints: window.talentSystem?.availablePoints || 42,
                
                
                // Баффы
                guildBuff: window.statCalculator?.guildBuff || false,
                talentBuff: document.getElementById('talent-buff')?.checked || false,
                
                // Временная метка
                timestamp: new Date().toISOString(),
                
                // Версия данных для совместимости
                version: '1.2'
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('✅ Данные сохранены в localStorage:', data);
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения в localStorage:', error);
            return false;
        }
    }

    // Загрузка всех данных
    loadAllData() {
        try {
            // Устанавливаем флаг загрузки
            this.isLoading = true;
            
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                console.log('📭 Нет сохраненных данных в localStorage');
                this.isLoading = false;
                return false;
            }

            const data = JSON.parse(savedData);
            console.log('📥 Загружаемые данные:', data);
            
            // ВОССТАНАВЛИВАЕМ ТЕКУЩИЙ КЛАСС СРАЗУ И СИНХРОНИЗИРУЕМ
            if (data.currentClass) {
                this.currentClass = data.currentClass;
                window.currentClass = data.currentClass;
                
                // Важно: устанавливаем текущий класс в калькуляторе статистик
                if (window.statCalculator) {
                    window.statCalculator.currentClass = data.currentClass;
                    console.log('✅ Класс установлен в statCalculator:', data.currentClass);
                }
                
                // СИНХРОНИЗИРУЕМ КЛАСС В СИСТЕМЕ ТАЛАНТОВ СРАЗУ ЖЕ
                if (window.talentSystem && window.talentSystem.setCurrentClass) {
                    window.talentSystem.setCurrentClass(data.currentClass);
                    console.log('✅ Класс установлен в системе талантов:', data.currentClass);
                }
                
                // Немедленно обновляем активную кнопку класса
                setTimeout(() => {
                    document.querySelectorAll('.class-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-class') === data.currentClass) {
                            btn.classList.add('active');
                            console.log('✅ Кнопка класса активирована:', data.currentClass);
                        }
                    });
                }, 50);
            }
            
            // Восстанавливаем экипировку (если есть)
            if (data.equipmentData) {
                setTimeout(() => {
                    this.restoreEquipment(data.equipmentData);
                }, 100);
            }
            
            // Восстанавливаем таланты (если есть)
            if (data.talentPoints || data.talentSpentPoints !== undefined) {
                setTimeout(() => {
                    this.restoreTalents(
                        data.talentPoints,
                        data.talentAuras,
                        data.talentSpentPoints,
                        data.availablePoints
                    );
                }, 200);
            }
            
            // Восстанавливаем эликсиры и баффы (если есть)
            if (data.elixirs || data.guildBuff !== undefined) {
                setTimeout(() => {
                    this.restoreElixirsAndBuffs(data);
                }, 300);
            }
            
            // Обновляем статистики после всех восстановлений
            setTimeout(() => {
                // Сбрасываем флаг загрузки перед обновлением статистик
                this.isLoading = false;
                
                if (window.statCalculator && window.statCalculator.updateStats) {
                    // Проверяем, что калькулятор готов
                    if (window.statCalculator.currentClass && window.statCalculator.baseStats[window.statCalculator.currentClass]) {
                        console.log('🔄 Обновление статистик после загрузки данных');
                        window.statCalculator.updateStats();
                    } else {
                        console.warn('Калькулятор не готов для обновления статов. Текущий класс в калькуляторе:', window.statCalculator.currentClass);
                        
                        // Пытаемся восстановить базовые статы
                        if (window.currentClass && window.characterStats && window.characterStats[window.currentClass]) {
                            console.log('🔄 Восстанавливаем базовые статы для класса:', window.currentClass);
                            window.statCalculator.setBaseStats(window.currentClass, window.characterStats[window.currentClass]);
                            window.statCalculator.updateStats();
                        }
                    }
                }
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки из localStorage:', error);
            this.isLoading = false;
            return false;
        }
    }

    // Установка текущего класса
    setCurrentClass(className) {
        this.currentClass = className;
        window.currentClass = className;
        
        // Устанавливаем класс в калькуляторе статистик
        if (window.statCalculator) {
            window.statCalculator.currentClass = className;
        }
        
        // Активируем кнопку класса
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-class') === className) {
                btn.classList.add('active');
            }
        });
        
        // Устанавливаем базовые статы
        if (window.characterStats && window.characterStats[className]) {
            window.statCalculator.setBaseStats(className, window.characterStats[className]);
        }
    }

    // Восстановление экипировки
    restoreEquipment(equipmentData) {
        window.equipmentData = equipmentData;
        
        // Восстанавливаем отображение слотов
        Object.keys(equipmentData).forEach(slotType => {
            const slotData = equipmentData[slotType];
            this.updateEquipmentSlotDisplay(slotType, slotData);
            
            // Восстанавливаем статы в калькуляторе
            if (window.statCalculator && slotData.stats) {
                window.statCalculator.addEquipmentStats(slotType, slotData.stats);
                
                // Восстанавливаем руны
                if (slotData.runeLevel > 0) {
                    window.statCalculator.setRuneLevel(slotType, slotData.runeLevel);
                }
                
                // Восстанавливаем камни
                if (slotData.stones && slotData.stones.length > 0) {
                    window.statCalculator.addStones(slotType, slotData.stones);
                }
            }
        });
        
        // Обновляем состояние левой руки
        if (window.updateLeftHandState) {
            window.updateLeftHandState();
        }
    }

    // Восстановление талантов
    restoreTalents(talentPoints, talentAuras, spentPoints, availablePoints) {
        console.log('🔄 Восстановление талантов:', { talentPoints, spentPoints, availablePoints });
        
        // Восстанавливаем данные в системе талантов
        if (window.talentSystem) {
            // Устанавливаем текущий класс для системы талантов
            window.talentSystem.currentClass = this.currentClass;
            
            // Устанавливаем точки талантов для ВСЕХ классов
            if (talentPoints) {
                Object.keys(talentPoints).forEach(className => {
                    if (!window.talentSystem.talentPoints[className]) {
                        window.talentSystem.talentPoints[className] = {};
                    }
                    Object.assign(window.talentSystem.talentPoints[className], talentPoints[className]);
                });
            }
            
            window.talentSystem.spentPoints = spentPoints || 0;
            window.talentSystem.availablePoints = availablePoints || 42;
            
            console.log('✅ Данные талантов установлены в talentSystem:', {
                talentPoints: window.talentSystem.talentPoints,
                spentPoints: window.talentSystem.spentPoints,
                availablePoints: window.talentSystem.availablePoints
            });
            
            // Обновляем отображение очков
            if (window.talentSystem.updatePointsDisplay) {
                window.talentSystem.updatePointsDisplay();
            }
            
            // Перезагружаем таланты для текущего класса
            if (window.talentSystem.loadTalentsForClass) {
                setTimeout(() => {
                    window.talentSystem.loadTalentsForClass(this.currentClass);
                    console.log('✅ Таланты перезагружены для класса:', this.currentClass);
                    
                    // ПЕРЕПОДКЛЮЧАЕМ ОБРАБОТЧИКИ после загрузки
                    setTimeout(() => {
                        this.reconnectTalentHandlers();
                        
                        // Применяем таланты после загрузки
                        if (window.talentSystem.applyTalents) {
                            window.talentSystem.applyTalents();
                        }
                    }, 500);
                }, 200);
            }
        }
        
        // Также сохраняем в talentCalculator для совместимости
        if (window.talentCalculator) {
            window.talentCalculator.talentPoints = talentPoints || {};
        }
        
        // Восстанавливаем ауры талантов
        if (window.statCalculator && talentAuras) {
            window.statCalculator.setTalentAuras(talentAuras);
        }
    }

    // Новый метод для переподключения обработчиков
    reconnectTalentHandlers() {
        console.log('🔄 Переподключение обработчиков талантов...');
        
        // Переподключаем обработчики для кнопок "+"
        document.querySelectorAll('.add-point-btn').forEach(btn => {
            // Сначала удаляем старые обработчики
            btn.replaceWith(btn.cloneNode(true));
        });
        
        // Подключаем новые обработчики
        document.querySelectorAll('.add-point-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                
                // Сохраняем текущую активную вкладку перед добавлением очка
                if (window.talentSystem) {
                    window.talentSystem.currentActiveTab = branchName;
                }
                
                if (window.talentSystem && window.talentSystem.addPointToBranch) {
                    window.talentSystem.addPointToBranch(branchName);
                }
            });
        });
        
        // Переподключаем обработчики вкладок
        document.querySelectorAll('.talents-tab-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        
        document.querySelectorAll('.talents-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                
                if (window.talentSystem) {
                    // Сохраняем текущую активную вкладку
                    window.talentSystem.currentActiveTab = branchName;
                    
                    // Убираем активный класс у всех кнопок
                    document.querySelectorAll('.talents-tab-btn').forEach(b => b.classList.remove('active'));
                    // Добавляем активный класс текущей кнопке
                    this.classList.add('active');
                    
                    // Скрываем все вкладки
                    document.querySelectorAll('.talents-tab-pane').forEach(pane => pane.classList.remove('active'));
                    // Показываем выбранную вкладку
                    const targetPane = document.getElementById(`branch-${branchName}`);
                    if (targetPane) {
                        targetPane.classList.add('active');
                    }
                }
            });
        });
        
        console.log('✅ Обработчики талантов переподключены');
    }

    // Восстановление эликсиров и баффов
    restoreElixirsAndBuffs(data) {
        // Эликсиры
        if (data.elixirs && window.statCalculator) {
            window.statCalculator.setElixirs(data.elixirs.offensive, data.elixirs.defensive);
            
            // Обновляем UI эликсиров
            this.updateElixirsUI(data.elixirs);
        }
        
        // Баффы
        if (window.statCalculator) {
            window.statCalculator.setGuildBuff(data.guildBuff || false);
            
            // Обновляем чекбоксы баффов
            this.updateBuffsUI(data);
        }
    }

    // Обновление UI эликсиров
    updateElixirsUI(elixirs) {
        // Атакующие эликсиры
        const offensiveRadio = document.getElementById(`offensive-${elixirs.offensive}`);
        if (offensiveRadio) {
            offensiveRadio.checked = true;
        }
        
        // Защитные эликсиры
        const defensiveRadio = document.getElementById(`defensive-${elixirs.defensive}`);
        if (defensiveRadio) {
            defensiveRadio.checked = true;
        }
    }

    // Обновление UI баффов
    updateBuffsUI(data) {
        const guildBuffCheckbox = document.getElementById('guild-buff');
        if (guildBuffCheckbox) {
            guildBuffCheckbox.checked = data.guildBuff || false;
        }
        
        const talentBuffCheckbox = document.getElementById('talent-buff');
        if (talentBuffCheckbox) {
            talentBuffCheckbox.checked = data.talentBuff || false;
        }
    }

    // Обновление отображения слота экипировки (аналогично функции из equipment_selector.js)
    updateEquipmentSlotDisplay(slotType, equipmentData) {
        const slotElement = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
        if (!slotElement) return;

        // Используем существующую функцию из equipment_selector.js если доступна
        if (typeof window.updateEquipmentSlotDisplay === 'function') {
            window.updateEquipmentSlotDisplay(slotType, equipmentData);
        } else {
            // Базовое обновление
            slotElement.classList.add('equipped');
            slotElement.innerHTML = `
                <div class="slot-content">
                    <div class="equipment-name">${equipmentData.type}</div>
                    ${equipmentData.runeLevel > 0 ? `<div class="rune-badge">+${equipmentData.runeLevel}</div>` : ''}
                </div>
            `;
        }
    }

    // Полная очистка всех данных
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            
            // Сбрасываем калькулятор
            if (window.statCalculator) {
                window.statCalculator.reset();
            }
            
            // Сбрасываем таланты
            if (window.talentCalculator) {
                window.talentCalculator.reset();
            }
            
            // Сбрасываем экипировку
            window.equipmentData = {};
            
            // Сбрасываем UI
            this.resetUI();
            
            console.log('✅ Все данные очищены');
            return true;
        } catch (error) {
            console.error('❌ Ошибка очистки данных:', error);
            return false;
        }
    }

    // Сброс UI
    resetUI() {
        // Сбрасываем класс на воина
        this.setCurrentClass('warrior');
        
        // Сбрасываем слоты экипировки
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.classList.remove('equipped');
            const slotType = slot.getAttribute('data-slot');
            const slotName = this.getSlotName(slotType);
            slot.innerHTML = `
                <img src="/static/Ico/Button_Char/${this.getSlotIcon(slotType)}" alt="${slotType}">
                <span>${slotName}</span>
            `;
        });
        
        // Сбрасываем эликсиры
        document.getElementById('offensive-none').checked = true;
        document.getElementById('defensive-none').checked = true;
        
        // Сбрасываем баффы
        document.getElementById('guild-buff').checked = false;
        document.getElementById('talent-buff').checked = false;
        
        // Обновляем статистики
        if (window.statCalculator) {
            window.statCalculator.updateStats();
        }
    }

    // Вспомогательные функции
    getSlotIcon(slotType) {
        const icons = {
            'rhand': '07_Rhand.svg',
            'lhand': '11_Lhand.svg',
            'chest': '04_Chest.svg',
            'helm': '01_Helm.svg',
            'shoulders': '02_Shoulders.svg',
            'pants': '16_Pants.svg',
            'boots': '17_Boots.svg',
            'hands': '14_Hands.svg',
            'belt': '15_Belt.svg',
            'bracers': '13_Bracers.svg',
            'cape': '03_Cape.svg',
            'neck': '09_Neck.svg',
            'ring1': '08_Ring1.svg',
            'ring2': '12_Ring2.svg',
            'trinket1': '06_Trinket1.svg',
            'trinket2': '18_Trinket2.svg'
        };
        return icons[slotType] || '11_Lhand.svg';
    }

    getSlotName(slotType) {
        const names = {
            'rhand': 'Оружие',
            'lhand': 'Левая рука',
            'chest': 'Грудь',
            'helm': 'Голова',
            'shoulders': 'Плечи',
            'pants': 'Штаны',
            'boots': 'Обувь',
            'hands': 'Перчатки',
            'belt': 'Пояс',
            'bracers': 'Наручи',
            'cape': 'Плащ',
            'neck': 'Шея',
            'ring1': 'Кольцо 1',
            'ring2': 'Кольцо 2',
            'trinket1': 'Амулет 1',
            'trinket2': 'Амулет 2'
        };
        return names[slotType] || 'Слот';
    }

    // Автосохранение при изменениях
    setupAutoSave() {
        // Защита от автосохранения во время загрузки
        if (this.isLoading) return;
        
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => this.saveAllData(), 100);
            });
        });

        const originalUpdateStats = window.statCalculator?.updateStats;
        if (originalUpdateStats) {
            window.statCalculator.updateStats = function() {
                originalUpdateStats.apply(this, arguments);
                setTimeout(() => {
                    if (!window.localStorageManager.isLoading) {
                        window.localStorageManager.saveAllData();
                    }
                }, 100);
            };
        }

        // Сохраняем при изменении эликсиров
        document.querySelectorAll('input[name="offensive-elixir"], input[name="defensive-elixir"]').forEach(radio => {
            radio.addEventListener('change', () => {
                setTimeout(() => {
                    if (!this.isLoading) {
                        this.saveAllData();
                    }
                }, 100);
            });
        });

        // Сохраняем при изменении баффов
        document.getElementById('guild-buff')?.addEventListener('change', () => {
            setTimeout(() => {
                if (!this.isLoading) {
                    this.saveAllData();
                }
            }, 100);
        });
        
        document.getElementById('talent-buff')?.addEventListener('change', () => {
            setTimeout(() => {
                if (!this.isLoading) {
                    this.saveAllData();
                }
            }, 100);
        });

        // Перехватываем изменения талантов в системе талантов
        this.setupTalentAutoSave();
    }

    setupTalentAutoSave() {
        if (window.talentSystem && window.talentSystem.addPointToBranch) {
            const originalAddPoint = window.talentSystem.addPointToBranch;
            window.talentSystem.addPointToBranch = function(branchName) {
                originalAddPoint.call(this, branchName);
                setTimeout(() => {
                    if (!window.localStorageManager.isLoading) {
                        window.localStorageManager.saveAllData();
                    }
                }, 100);
            };
        }

        if (window.talentSystem && window.talentSystem.resetTalents) {
            const originalReset = window.talentSystem.resetTalents;
            window.talentSystem.resetTalents = function() {
                originalReset.call(this);
                setTimeout(() => {
                    if (!window.localStorageManager.isLoading) {
                        window.localStorageManager.saveAllData();
                    }
                }, 100);
            };
        }
    }
}

// Создаем глобальный экземпляр
window.localStorageManager = new LocalStorageManager();