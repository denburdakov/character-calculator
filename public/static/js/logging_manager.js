// enhanced_logging_manager_fixed.js
class EnhancedLoggingManager {
    constructor() {
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            TRACE: 4
        };
        
        this.currentLogLevel = this.logLevels.DEBUG;
        this.logEntries = [];
        this.maxLogEntries = 1000;
        this.enableStackTrace = true;
        this.enableCodeLocation = true;
        this.codeFiles = {};
        this.callStack = [];
        this.performanceMarks = new Map();
        
        this.initialize();
    }

    initialize() {
        try {
            this.analyzeLoadedScripts();
            this.interceptConsole();
            this.interceptGlobalErrors();
            this.setupCleanup();
            
            // Логируем успешную инициализацию
            const initData = {
                level: this.getLogLevelName(this.currentLogLevel),
                scripts: Object.keys(this.codeFiles).length,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };
            
            this.info('EnhancedLoggingManager initialized', initData);
            
            // Отправляем событие инициализации
            this.dispatchCustomEvent('logging:initialized', initData);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации логирования:', error);
            // Пытаемся логировать даже ошибку инициализации
            this.safeLog('ERROR', 'Ошибка инициализации логирования', { 
                error: error.message,
                stack: error.stack 
            });
        }
    }

    // Безопасное логирование на случай, если система еще не инициализирована
    safeLog(level, message, data = null) {
        try {
            const timestamp = new Date();
            const entry = {
                timestamp: timestamp.toISOString(),
                level: level,
                message: message,
                data: data
            };
            
            console[level.toLowerCase()]?.apply(console, [
                `[${timestamp.toLocaleTimeString()}] [${level}] ${message}`,
                data
            ]);
            
            return entry;
        } catch (e) {
            console.error('Безопасное логирование не удалось:', e);
            return null;
        }
    }

    analyzeLoadedScripts() {
        try {
            // Внешние скрипты
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                const url = script.src;
                const filename = this.extractFilename(url);
                this.codeFiles[filename] = {
                    url: url,
                    type: 'external',
                    loaded: true
                };
            });
            
            // Inline скрипты
            const inlineScripts = document.querySelectorAll('script:not([src])');
            inlineScripts.forEach((script, index) => {
                const filename = `inline-script-${index}.js`;
                this.codeFiles[filename] = {
                    url: 'inline',
                    type: 'inline',
                    loaded: true,
                    contentPreview: script.textContent.substring(0, 200) + '...'
                };
            });
            
            this.debug(`Проанализировано скриптов: ${scripts.length + inlineScripts.length}`);
            
        } catch (error) {
            this.warn('Не удалось проанализировать скрипты', { error: error.message });
        }
    }

    extractFilename(url) {
        try {
            if (url === 'inline') return 'inline.js';
            
            const urlObj = new URL(url, window.location.href);
            const path = urlObj.pathname;
            return path.split('/').pop() || 'unknown.js';
            
        } catch {
            // Простой парсинг если URL не валиден
            const parts = url.split('/');
            return parts[parts.length - 1] || 'unknown.js';
        }
    }

    interceptConsole() {
        try {
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                info: console.info,
                debug: console.debug,
                trace: console.trace
            };

            // Создаем безопасные перехватчики
            const createInterceptor = (methodName, level) => {
                return (...args) => {
                    try {
                        // Получаем информацию о месте вызова
                        const location = this.getCallerLocation(2);
                        
                        // Логируем
                        this.log(level, args.join(' '), {
                            location: location,
                            consoleArgs: args.length > 1 ? args : undefined
                        });
                        
                        // Вызываем оригинальный console метод
                        if (level === 'ERROR') {
                            const locationStr = location ? `📍 ${location.file}:${location.line}` : '';
                            originalConsole.error(`❌`, ...args, locationStr);
                        } else if (level === 'WARN') {
                            originalConsole.warn(`⚠️`, ...args);
                        } else if (level === 'INFO') {
                            originalConsole.info(`ℹ️`, ...args);
                        } else {
                            originalConsole[methodName].apply(console, args);
                        }
                        
                    } catch (error) {
                        // Если перехватчик сломался, вызываем оригинал без логирования
                        originalConsole[methodName].apply(console, args);
                    }
                };
            };

            // Применяем перехватчики
            console.log = createInterceptor('log', 'DEBUG');
            console.error = createInterceptor('error', 'ERROR');
            console.warn = createInterceptor('warn', 'WARN');
            console.info = createInterceptor('info', 'INFO');
            console.debug = createInterceptor('debug', 'DEBUG');
            console.trace = createInterceptor('trace', 'TRACE');
            
            this.debug('Перехват консоли настроен');
            
        } catch (error) {
            this.safeLog('ERROR', 'Ошибка перехвата консоли', { error: error.message });
        }
    }

    interceptGlobalErrors() {
        try {
            // Ошибки JavaScript
            window.addEventListener('error', (event) => {
                this.error('Глобальная JavaScript ошибка', {
                    message: event.message,
                    filename: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    error: event.error?.toString(),
                    stack: event.error?.stack
                });
                
                // Предотвращаем стандартное поведение ошибки если нужно
                // event.preventDefault();
            });

            // Необработанные промисы
            window.addEventListener('unhandledrejection', (event) => {
                this.error('Необработанный Promise', {
                    reason: event.reason?.toString(),
                    stack: event.reason?.stack,
                    promise: event.promise
                });
            });

            // Ошибки загрузки ресурсов
            window.addEventListener('load', () => {
                // Проверяем ошибки загрузки ресурсов
                const resources = performance.getEntriesByType('resource');
                resources.forEach(resource => {
                    if (resource.initiatorType && resource.duration > 5000) {
                        this.warn('Медленная загрузка ресурса', {
                            url: resource.name,
                            duration: `${Math.round(resource.duration)}ms`,
                            type: resource.initiatorType
                        });
                    }
                });
            });
            
            this.debug('Перехват глобальных ошибок настроен');
            
        } catch (error) {
            this.warn('Не удалось настроить перехват глобальных ошибок', { error: error.message });
        }
    }

    getCallerLocation(skipFrames = 1) {
        if (!this.enableCodeLocation) return null;
        
        try {
            const error = new Error();
            const stack = error.stack;
            
            if (!stack) return null;
            
            const lines = stack.split('\n');
            if (lines.length <= skipFrames + 1) return null;
            
            const callerLine = lines[skipFrames + 1];
            return this.parseStackLine(callerLine);
            
        } catch (error) {
            return null;
        }
    }

    parseStackLine(stackLine) {
        try {
            stackLine = stackLine.trim();
            
            // Паттерны для разных браузеров
            const patterns = [
                // Chrome/Edge: at functionName (file.js:10:20)
                /at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/,
                // Firefox: functionName@file.js:10:20
                /(.+?)@(.+?):(\d+):(\d+)/,
                // Safari и другие
                /at\s+(.+?):(\d+):(\d+)/,
                /(.+?):(\d+):(\d+)/
            ];
            
            for (const pattern of patterns) {
                const match = stackLine.match(pattern);
                if (match) {
                    const functionName = match[1] || 'anonymous';
                    const file = match[2] || match[1];
                    const line = parseInt(match[match.length - 2]) || 0;
                    const column = parseInt(match[match.length - 1]) || 0;
                    
                    const filename = this.extractFilename(file);
                    
                    return {
                        function: functionName,
                        file: filename,
                        fullPath: file,
                        line: line,
                        column: column,
                        raw: stackLine
                    };
                }
            }
            
            return { raw: stackLine };
            
        } catch (error) {
            return { raw: stackLine };
        }
    }

    getStackTrace(skipFrames = 1) {
        if (!this.enableStackTrace) return null;
        
        try {
            const error = new Error();
            const stack = error.stack;
            
            if (!stack) return null;
            
            const lines = stack.split('\n');
            const relevantLines = lines.slice(skipFrames + 1);
            
            return relevantLines.map(line => this.parseStackLine(line)).filter(Boolean);
            
        } catch (error) {
            return null;
        }
    }

    log(level, message, metadata = {}) {
        try {
            const levelValue = this.logLevels[level];
            
            // Фильтрация по уровню
            if (levelValue < this.currentLogLevel) {
                return;
            }

            const timestamp = new Date();
            const entry = {
                id: `${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: timestamp,
                isoTime: timestamp.toISOString(),
                level: level,
                message: message,
                metadata: metadata,
                callStack: [...this.callStack],
                session: {
                    url: window.location.href,
                    userAgent: navigator.userAgent
                }
            };

            // Форматируем и сохраняем
            const formatted = this.formatLogEntry(entry);
            this.logEntries.push(formatted);
            
            // Ограничиваем размер
            if (this.logEntries.length > this.maxLogEntries) {
                this.logEntries.shift();
            }
            
            // Диспатчим событие
            this.dispatchLogEvent(entry);
            
            // Для TRACE уровней обновляем стек вызовов
            if (level === 'TRACE' && metadata.location) {
                this.callStack.push({
                    time: timestamp,
                    message: message,
                    location: metadata.location
                });
                
                if (this.callStack.length > 100) {
                    this.callStack.shift();
                }
            }
            
            return entry;
            
        } catch (error) {
            // Если логирование сломалось, пытаемся хотя бы в консоль
            console.error('Ошибка в системе логирования:', error);
            return null;
        }
    }

    formatLogEntry(entry) {
        const time = entry.timestamp.toLocaleTimeString('ru-RU', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
        
        const levelText = entry.level.padEnd(5);
        let formatted = `[${time}] [${levelText}] ${entry.message}`;
        
        // Добавляем информацию о месте
        if (entry.metadata.location) {
            const loc = entry.metadata.location;
            if (loc.file && loc.line) {
                formatted += `\n📍 ${loc.file}:${loc.line}:${loc.column}`;
                if (loc.function && loc.function !== 'anonymous') {
                    formatted += ` (${loc.function})`;
                }
            }
        }
        
        // Добавляем стектрейс для ошибок
        if (entry.level === 'ERROR' || entry.level === 'WARN') {
            const stackTrace = entry.metadata.stackTrace || this.getStackTrace(3);
            if (stackTrace?.length > 0) {
                formatted += '\n📚 Stack trace:';
                stackTrace.forEach((frame, i) => {
                    if (frame.file) {
                        formatted += `\n   ${i + 1}. ${frame.file}:${frame.line}`;
                        if (frame.function && frame.function !== 'anonymous') {
                            formatted += ` (${frame.function})`;
                        }
                    }
                });
            }
        }
        
        // Добавляем дополнительные данные
        if (entry.metadata.data) {
            try {
                const dataStr = JSON.stringify(entry.metadata.data, null, 2)
                    .replace(/\n/g, '\n    ');
                formatted += `\n📊 Data:\n    ${dataStr}`;
            } catch (e) {
                formatted += `\n📊 Data: [Не удалось сериализовать]`;
            }
        }
        
        return formatted;
    }

    // Методы для каждого уровня
    debug(message, data = null) {
        const location = this.getCallerLocation(1);
        return this.log('DEBUG', message, { location, data });
    }

    info(message, data = null) {
        const location = this.getCallerLocation(1);
        return this.log('INFO', message, { location, data });
    }

    warn(message, data = null) {
        const location = this.getCallerLocation(1);
        const stackTrace = this.getStackTrace(2);
        return this.log('WARN', message, { location, stackTrace, data });
    }

    error(message, data = null) {
        const location = this.getCallerLocation(1);
        const stackTrace = this.getStackTrace(2);
        return this.log('ERROR', message, { location, stackTrace, data });
    }

    trace(message, data = null) {
        const location = this.getCallerLocation(1);
        const stackTrace = this.getStackTrace(2);
        return this.log('TRACE', message, { location, stackTrace, data });
    }

    // Утилиты для измерений
    startMeasure(name) {
        this.performanceMarks.set(name, {
            start: performance.now(),
            startTime: new Date()
        });
        this.trace(`Начато измерение: ${name}`);
    }

    endMeasure(name, data = null) {
        const mark = this.performanceMarks.get(name);
        if (!mark) {
            this.warn(`Измерение "${name}" не было начато`);
            return null;
        }
        
        const duration = performance.now() - mark.start;
        this.performanceMarks.delete(name);
        
        const location = this.getCallerLocation(1);
        this.debug(`Измерение завершено: ${name}`, {
            duration: `${duration.toFixed(2)}ms`,
            location: location,
            data: data
        });
        
        return duration;
    }

    async measureAsync(name, asyncFn) {
        this.startMeasure(name);
        try {
            const result = await asyncFn();
            const duration = this.endMeasure(name);
            return { result, duration };
        } catch (error) {
            this.endMeasure(name, { error: error.message });
            throw error;
        }
    }

    measureSync(name, syncFn) {
        this.startMeasure(name);
        try {
            const result = syncFn();
            const duration = this.endMeasure(name);
            return { result, duration };
        } catch (error) {
            this.endMeasure(name, { error: error.message });
            throw error;
        }
    }

    // Управление
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            const oldLevel = this.getLogLevelName(this.currentLogLevel);
            this.currentLogLevel = this.logLevels[level];
            this.info(`Уровень логирования изменен: ${oldLevel} → ${level}`);
        } else {
            this.warn(`Неизвестный уровень логирования: ${level}`);
        }
    }

    getLogLevelName(levelValue) {
        for (const [name, value] of Object.entries(this.logLevels)) {
            if (value === levelValue) return name;
        }
        return 'UNKNOWN';
    }

    exportLogs() {
        try {
            if (this.logEntries.length === 0) {
                this.warn('Нет записей для экспорта');
                return null;
            }

            const content = [
                '=== GAME DEBUG LOG ===',
                `Generated: ${new Date().toLocaleString('ru-RU')}`,
                `URL: ${window.location.href}`,
                `User Agent: ${navigator.userAgent}`,
                `Log Level: ${this.getLogLevelName(this.currentLogLevel)}`,
                `Entries: ${this.logEntries.length}`,
                '================================\n\n',
                ...this.logEntries
            ].join('\n');

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `game_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.info('Логи экспортированы в файл');
            return blob;
            
        } catch (error) {
            this.error('Ошибка экспорта логов', error);
            return null;
        }
    }

    clearLogs() {
        const count = this.logEntries.length;
        this.logEntries = [];
        this.callStack = [];
        this.performanceMarks.clear();
        
        this.info(`Логи очищены (удалено ${count} записей)`);
        this.dispatchCustomEvent('logging:cleared', { count });
        
        return count;
    }

    getStats() {
        const stats = {
            total: this.logEntries.length,
            byLevel: {},
            performanceMarks: this.performanceMarks.size,
            callStackDepth: this.callStack.length
        };
        
        // Считаем по уровням
        this.logEntries.forEach(entry => {
            const match = entry.match(/\[(DEBUG|INFO|WARN|ERROR|TRACE)\]/);
            if (match) {
                const level = match[1];
                stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
            }
        });
        
        return stats;
    }

    dispatchLogEvent(entry) {
        this.dispatchCustomEvent('log:entry', entry);
    }

    dispatchCustomEvent(name, detail) {
        try {
            const event = new CustomEvent(name, { detail });
            window.dispatchEvent(event);
        } catch (error) {
            // Игнорируем ошибки событий
        }
    }

    setupCleanup() {
        // Сохраняем логи перед закрытием если нужно
        window.addEventListener('beforeunload', () => {
            this.info('Страница закрывается');
            this.dispatchCustomEvent('logging:cleanup', { 
                entriesCount: this.logEntries.length 
            });
        });
    }

    // Метод для удобного доступа
    getRecentLogs(count = 20) {
        return this.logEntries.slice(-count).join('\n');
    }

    // Простая панель отладки
    createSimplePanel() {
        try {
            // Проверяем, не создана ли уже панель
            if (document.getElementById('simple-debug-panel')) {
                return;
            }

            const panel = document.createElement('div');
            panel.id = 'simple-debug-panel';
            panel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                height: 300px;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #4a4a4a;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
                resize: both;
                overflow: hidden;
            `;

            const header = document.createElement('div');
            header.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 8px 12px;
                color: white;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                user-select: none;
            `;
            header.innerHTML = `
                <span>🔍 Debug Logs</span>
                <div>
                    <button class="panel-btn" title="Экспорт">💾</button>
                    <button class="panel-btn" title="Очистить">🗑️</button>
                    <button class="panel-btn" title="Свернуть">➖</button>
                    <button class="panel-btn" title="Закрыть">✕</button>
                </div>
            `;

            const controls = document.createElement('div');
            controls.style.cssText = `
                padding: 8px;
                background: #222;
                display: flex;
                gap: 8px;
                border-bottom: 1px solid #333;
            `;
            controls.innerHTML = `
                <select id="log-level-filter" style="flex: 1; background: #333; color: white; border: 1px solid #555; padding: 4px; border-radius: 4px;">
                    <option value="DEBUG">Все уровни</option>
                    <option value="INFO">INFO+</option>
                    <option value="WARN">WARN+</option>
                    <option value="ERROR">Только ERROR</option>
                </select>
                <input type="text" id="log-search" placeholder="Поиск..." style="flex: 2; background: #333; color: white; border: 1px solid #555; padding: 4px; border-radius: 4px;">
            `;

            const content = document.createElement('div');
            content.id = 'debug-panel-content';
            content.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                color: #e0e0e0;
                white-space: pre-wrap;
                word-break: break-all;
                font-size: 11px;
                line-height: 1.4;
            `;

            panel.appendChild(header);
            panel.appendChild(controls);
            panel.appendChild(content);
            document.body.appendChild(panel);

            // Настройка событий
            this.setupPanelEvents(panel);
            
            // Обновление контента
            this.updatePanelContent();
            
            // Автообновление
            this.panelUpdateInterval = setInterval(() => {
                this.updatePanelContent();
            }, 1000);
            
            this.info('Простая панель отладки создана');
            
        } catch (error) {
            this.error('Ошибка создания панели отладки', error);
        }
    }

    setupPanelEvents(panel) {
        // Кнопки заголовка
        const buttons = panel.querySelectorAll('.panel-btn');
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                switch(index) {
                    case 0: this.exportLogs(); break;
                    case 1: this.clearLogs(); break;
                    case 2: this.togglePanelMinimize(panel); break;
                    case 3: this.closePanel(panel); break;
                }
            });
        });

        // Фильтры
        document.getElementById('log-level-filter').addEventListener('change', () => {
            this.updatePanelContent();
        });

        document.getElementById('log-search').addEventListener('input', () => {
            this.updatePanelContent();
        });

        // Перетаскивание
        this.makePanelDraggable(panel, panel.querySelector('div'));
    }

    updatePanelContent() {
        const content = document.getElementById('debug-panel-content');
        if (!content) return;

        const levelFilter = document.getElementById('log-level-filter')?.value || 'DEBUG';
        const searchTerm = document.getElementById('log-search')?.value.toLowerCase() || '';
        
        let filteredLogs = this.logEntries;
        
        // Фильтрация по уровню
        if (levelFilter !== 'DEBUG') {
            const levelValue = this.logLevels[levelFilter];
            filteredLogs = filteredLogs.filter(log => {
                for (const [name, value] of Object.entries(this.logLevels)) {
                    if (value >= levelValue && log.includes(`[${name}]`)) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        // Поиск
        if (searchTerm) {
            filteredLogs = filteredLogs.filter(log => 
                log.toLowerCase().includes(searchTerm)
            );
        }
        
        // Берем последние 50 записей
        const recentLogs = filteredLogs.slice(-50);
        
        // Цветовое оформление
        const coloredLogs = recentLogs.map(log => {
            let colored = log
                .replace(/\[ERROR\]/g, '<span style="color: #ff6b6b; font-weight: bold;">[ERROR]</span>')
                .replace(/\[WARN\]/g, '<span style="color: #ffd166; font-weight: bold;">[WARN]</span>')
                .replace(/\[INFO\]/g, '<span style="color: #06d6a0; font-weight: bold;">[INFO]</span>')
                .replace(/\[DEBUG\]/g, '<span style="color: #118ab2; font-weight: bold;">[DEBUG]</span>')
                .replace(/\[TRACE\]/g, '<span style="color: #9d4edd; font-weight: bold;">[TRACE]</span>')
                .replace(/📍/g, '<span style="color: #8ecae6;">📍</span>')
                .replace(/📚/g, '<span style="color: #e0aaff;">📚</span>')
                .replace(/📊/g, '<span style="color: #a7c957;">📊</span>')
                .replace(/\n/g, '<br>');
            
            // Подсветка поиска
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                colored = colored.replace(regex, '<mark style="background: #ffd16633; color: #ffd166;">$1</mark>');
            }
            
            return colored;
        }).join('<br>');
        
        content.innerHTML = coloredLogs || '<div style="color: #888; text-align: center; padding: 20px;">Нет записей</div>';
        content.scrollTop = content.scrollHeight;
    }

    makePanelDraggable(panel, handle) {
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
        
        handle.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }
    }

    togglePanelMinimize(panel) {
        const content = document.getElementById('debug-panel-content');
        const controls = panel.querySelector('div:nth-child(2)');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            controls.style.display = 'flex';
            panel.style.height = '300px';
        } else {
            content.style.display = 'none';
            controls.style.display = 'none';
            panel.style.height = 'auto';
        }
    }

    closePanel(panel) {
        if (this.panelUpdateInterval) {
            clearInterval(this.panelUpdateInterval);
        }
        panel.remove();
        this.info('Панель отладки закрыта');
    }
}

// Создаем глобальный экземпляр
if (typeof window !== 'undefined') {
    // Используем безопасную инициализацию
    let loggingInstance = null;
    
    try {
        loggingInstance = new EnhancedLoggingManager();
        window.$log = loggingInstance;
        
        // Короткие алиасы
        window.$debug = (...args) => loggingInstance.debug(args.join(' '));
        window.$info = (...args) => loggingInstance.info(args.join(' '));
        window.$warn = (...args) => loggingInstance.warn(args.join(' '));
        window.$error = (...args) => loggingInstance.error(args.join(' '));
        window.$trace = (...args) => loggingInstance.trace(args.join(' '));
        
        // Утилиты
        window.$measure = (name, fn) => loggingInstance.measureSync(name, fn);
        window.$measureAsync = (name, fn) => loggingInstance.measureAsync(name, fn);
        window.$exportLogs = () => loggingInstance.exportLogs();
        window.$showPanel = () => loggingInstance.createSimplePanel();
        
        console.log('🚀 Enhanced Logging Manager успешно загружен!');
        console.log('📝 Используйте $log, $debug, $error и другие методы для логирования');
        console.log('🛠️  Используйте $showPanel() для отображения панели отладки');
        
    } catch (error) {
        console.error('❌ Не удалось инициализировать систему логирования:', error);
        
        // Создаем заглушку на случай ошибки
        window.$log = {
            debug: (...args) => console.debug(...args),
            info: (...args) => console.info(...args),
            warn: (...args) => console.warn(...args),
            error: (...args) => console.error(...args),
            trace: (...args) => console.trace(...args)
        };
    }
}

// Добавляем базовые стили для панели
const panelStyles = document.createElement('style');
panelStyles.textContent = `
.panel-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
    margin-left: 4px;
}

.panel-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

mark {
    background: #ffd16633 !important;
    color: inherit !important;
    padding: 0 2px;
    border-radius: 2px;
}

#debug-panel-content::-webkit-scrollbar {
    width: 8px;
}

#debug-panel-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

#debug-panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

#debug-panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
`;
document.head.appendChild(panelStyles);