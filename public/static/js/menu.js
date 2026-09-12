/* ==========================================================
   MENU.JS — меню, модалки, ленивая загрузка контента, logout
   Использует делегирование событий — работает надёжно,
   независимо от момента вставки HTML в DOM.
   ========================================================== */

(function () {
    'use strict';

    const MENU_URL = '/static/partials/menu.html';
    const MODAL_URL = (name) => `/static/partials/modals/${name}.html`;

    // Кэш: какие модалки уже загружены
    const loadedModals = new Set();

    // ---------- Старт ----------
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        await loadMenuHTML();
        bindGlobalHandlers();
        handleHashOnLoad();
        window.addEventListener('hashchange', handleHashOnLoad);
    }

    // ---------- Загрузка разметки меню ----------
    async function loadMenuHTML() {
        if (document.querySelector('.menu-container')) return;

        try {
            const res = await fetch(MENU_URL, { credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            document.body.insertAdjacentHTML('afterbegin', html);
        } catch (err) {
            console.error('[menu] Не удалось загрузить меню:', err);
        }
    }

    // ---------- Глобальные обработчики (делегирование) ----------
    function bindGlobalHandlers() {
        document.addEventListener('click', onDocumentClick);
        document.addEventListener('keydown', onKeydown);
    }

    function onDocumentClick(e) {
        const target = e.target;

        // 1) Кнопка-бургер
        if (target.closest('.menu-button')) {
            e.preventDefault();
            const dd = document.querySelector('.menu-dropdown');
            if (dd) dd.classList.toggle('active');
            return;
        }

        // 2) Клик по пункту меню с модалкой
        const menuItem = target.closest('.menu-item[data-modal]');
        if (menuItem) {
            e.preventDefault();
            const modalName = menuItem.dataset.modal;
            closeMenuDropdown();
            openModal(modalName);
            return;
        }

        // 3) Кнопка "Выйти"
        if (target.closest('#logout-btn')) {
            e.preventDefault();
            closeMenuDropdown();
            handleLogout();
            return;
        }

        // 4) Кнопка закрытия модалки (крестик)
        if (target.closest('.modal-close')) {
            const modal = target.closest('.modal');
            if (modal) closeModal(modal);
            return;
        }

        // 5) Клик по фону модалки (вне .modal-content)
        if (target.classList.contains('modal')) {
            closeModal(target);
            return;
        }

        // 6) Клик где-то ещё — закрыть выпадающее меню
        if (!target.closest('.menu-dropdown') && !target.closest('.menu-button')) {
            closeMenuDropdown();
        }
    }

    function onKeydown(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(closeModal);
            closeMenuDropdown();
        }
    }

    // ---------- Управление меню ----------
    function closeMenuDropdown() {
        const dd = document.querySelector('.menu-dropdown');
        if (dd) dd.classList.remove('active');
    }

    // ---------- Управление модалками ----------
    async function openModal(name) {
        const modal = document.getElementById(`${name}-modal`);
        if (!modal) {
            console.warn(`[menu] Модалка "${name}-modal" не найдена`);
            return;
        }

        // Ленивая подгрузка содержимого
        if (!loadedModals.has(name)) {
            const body = modal.querySelector('[data-modal-body]');
            if (body) {
                try {
                    const res = await fetch(MODAL_URL(name), { credentials: 'same-origin' });
                    if (res.ok) {
                        body.innerHTML = await res.text();
                    } else {
                        body.innerHTML = `<p style="color:#e74c3c">Не удалось загрузить содержимое (HTTP ${res.status}).</p>`;
                    }
                    loadedModals.add(name);
                } catch (err) {
                    console.error(`[menu] Ошибка загрузки контента модалки "${name}":`, err);
                    body.innerHTML = `<p style="color:#e74c3c">Ошибка загрузки содержимого.</p>`;
                }
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        // Если больше нет открытых модалок — вернуть скролл
        if (!document.querySelector('.modal.active')) {
            document.body.style.overflow = '';
        }
    }

    // ---------- Открытие по hash (#licenses-modal) ----------
    function handleHashOnLoad() {
        const hash = window.location.hash;
        if (!hash) return;

        const name = hash.replace('#', '').replace('-modal', '');
        if (!name) return;

        // Открываем только если модалка существует
        if (document.getElementById(`${name}-modal`)) {
            // Небольшая задержка, чтобы DOM успел вставиться
            setTimeout(() => openModal(name), 150);
        }
    }

    // ---------- Logout ----------
    async function handleLogout() {
        window.location.href = '/logout';   // GET-редирект, как у вас в server.js
    }
})();