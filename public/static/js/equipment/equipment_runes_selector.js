// equipment_runes_selector.js
// Функции для выбора уровня рун

function openRuneSelector(slotType, equipmentType) {
    let qualityInfo = '';
    if (slotType === 'cape' && window.selectedQuality) {
        qualityInfo = `<p class="quality-info">Качество: ${EquipmentConfig.qualityNames[window.selectedQuality]}</p>`;
    }

    let weaponInfo = '';
    if (slotType === 'rhand' && window.selectedWeaponType) {
        weaponInfo = `<p class="weapon-info">Тип: ${EquipmentConfig.weaponTypeNames[window.selectedWeaponType]}</p>`;
    }

    window.modalContent.innerHTML = `
        <h2 class="modal-title">Выбор уровня рун улучшения</h2>
        ${qualityInfo}
        ${weaponInfo}
        <p class="modal-subtitle">Выберите уровень улучшения рунами (от 1 до 12):</p>
        <div class="runes-grid">
            ${Array.from({length: 12}, (_, i) => i + 1).map(level => `
                <div class="rune-level-option" data-level="${level}">
                    <h3>+${level}</h3>
                    <p>Уровень ${level}</p>
                </div>
            `).join('')}
        </div>
        <div class="button-container">
            <button id="back-to-stats" class="modal-button button-back">← Назад</button>            
            <button id="skip-runes" class="modal-button button-skip">Без рун</button>
            <button id="confirm-runes" class="modal-button button-confirm" disabled>Далее → Выбор камней</button>
        </div>
    `;

    let selectedRuneOption = null;

    document.querySelectorAll('.rune-level-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedRuneOption) {
                selectedRuneOption.classList.remove('selected');
            }

            this.classList.add('selected');
            selectedRuneOption = this;
            window.selectedRuneLevel = parseInt(this.getAttribute('data-level'));

            document.getElementById('confirm-runes').disabled = false;
        });
    });

    document.getElementById('skip-runes').addEventListener('click', function() {
        window.selectedRuneLevel = 0;
        openStoneSelector(slotType, equipmentType);
    });

    document.getElementById('back-to-stats').addEventListener('click', function() {
        openEquipmentStatsSelector(slotType, window.currentEquipmentData, equipmentType);
    });

    document.getElementById('confirm-runes').addEventListener('click', function() {
        if (selectedRuneOption) {
            openStoneSelector(slotType, equipmentType);
        }
    });

    window.equipmentModal.style.display = 'flex';
}