// equipment_data_loader.js
// Функции для загрузки данных из XML

function loadEquipmentDataFromXML(slotType, dataFile, equipmentType) {
    let filePath = '';
    
    if (slotType === 'cape' && window.selectedQuality) {
        const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
        filePath = `/data/${window.selectedQuality}/${statsFolder}/${dataFile}`;
    } 
    else if (EquipmentConfig.jewelrySlots.includes(slotType) && window.selectedQuality) {
        const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
        filePath = `/data/jewelry/${window.selectedQuality}/${statsFolder}/${dataFile}`;
    }
    else {
        const statsFolder = equipmentType === '4-stat' ? '4-stats' : '3-stats';
        filePath = `/data/equipment/${statsFolder}/${dataFile}`;
    }

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Файл не найден: ${filePath}`);
            }
            return response.text();
        })
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('Ошибка парсинга XML');
            }

            const equipmentData = extractClassesFromXML(xmlDoc, equipmentType);
            const currentClass = getCurrentCharacterClass();
            const filteredData = filterEquipmentByClass(equipmentData, currentClass);
            
            window.currentEquipmentData = filteredData;
            window.currentEquipmentDataOriginal = [...filteredData];
            openEquipmentStatsSelector(slotType, filteredData, equipmentType);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных экипировки:', error);
            alert(`Ошибка загрузки данных: ${error.message}`);
        });
}