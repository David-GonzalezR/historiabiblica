/**
 * LA HISTORIA: EL CAMINO - LÓGICA PRINCIPAL (JS Vanilla)
 * Funcionalidad Mobile-First, PWA, Mapa de Ruta Interactivo y Lector Sanitizado.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. CONFIGURACIÓN DE ACTOS Y FECHAS CRONOLÓGICAS (12 ACTOS)
    // ----------------------------------------------------------------------
    const ACT_CONFIG = {
        'Acto I':     { color: 'var(--act-1-color)',  light: 'var(--act-1-light)',  date: '~4000 a.C. – 2000 a.C.' },
        'Acto II':    { color: 'var(--act-2-color)',  light: 'var(--act-2-light)',  date: '~2166 a.C. – 1805 a.C.' },
        'Acto III':   { color: 'var(--act-3-color)',  light: 'var(--act-3-light)',  date: '~1525 a.C. – 1405 a.C.' },
        'Acto IV':    { color: 'var(--act-4-color)',  light: 'var(--act-4-light)',  date: '~1405 a.C. – 1050 a.C.' },
        'Acto V':     { color: 'var(--act-5-color)',  light: 'var(--act-5-light)',  date: '~1050 a.C. – 931 a.C.' },
        'Acto VI':    { color: 'var(--act-6-color)',  light: 'var(--act-6-light)',  date: '~931 a.C. – 586 a.C.' },
        'Acto VII':   { color: 'var(--act-7-color)',  light: 'var(--act-7-light)',  date: '~586 a.C. – 538 a.C.' },
        'Acto VIII':  { color: 'var(--act-8-color)',  light: 'var(--act-8-light)',  date: '~538 a.C. – 430 a.C.' },
        'Acto IX':    { color: 'var(--act-9-color)',  light: 'var(--act-9-light)',  date: '~4 a.C. – 30 d.C.' },
        'Acto X':     { color: 'var(--act-10-color)', light: 'var(--act-10-light)', date: '~30 d.C. – 62 d.C.' },
        'Acto XI':    { color: 'var(--act-11-color)', light: 'var(--act-11-light)', date: '~48 d.C. – 95 d.C.' },
        'Acto XII':   { color: 'var(--act-12-color)', light: 'var(--act-12-light)', date: '~95 d.C. – Eternidad' }
    };

    // SVG Icons reutilizables
    const ICONS = {
        check: `<svg class="node-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        current: `<svg class="node-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        lock: `<svg class="node-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    };

    // ----------------------------------------------------------------------
    // 2. ESTADO GLOBAL DE LA APLICACIÓN
    // ----------------------------------------------------------------------
    let chaptersData = [];
    let actsData = {};
    let currentChapterIndex = -1;
    let highestUnlockedIndex = 0;
    let isStoryCompleted = false;
    let readerFontSize = 18;
    let readerTheme = 'dark'; // 'light' | 'sepia' | 'dark'

    // Elementos DOM
    const timelineView = document.getElementById('timeline-view');
    const chapterView = document.getElementById('chapter-view');
    const completionScreen = document.getElementById('completion-screen');
    const pathContainer = document.getElementById('path-container');
    const globalProgressFill = document.getElementById('global-progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    const fabContinue = document.getElementById('fab-continue');
    
    // Elementos Sticky Indicator
    const stickyActBar = document.getElementById('sticky-act-bar');
    const stickyActBadge = document.getElementById('sticky-act-badge');
    const stickyActTitle = document.getElementById('sticky-act-title');

    // Elementos Lector
    const readerContent = document.getElementById('reader-content');
    const chapterMarkdown = document.getElementById('chapter-markdown');
    const readerBadge = document.getElementById('reader-badge');
    const readerTitleShort = document.getElementById('reader-title-short');
    const readingProgressBar = document.getElementById('reading-progress-bar');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const nextBtnText = document.getElementById('next-btn-text');

    // Elementos Hero Lector
    const heroActBadge = document.getElementById('hero-act-badge');
    const heroPeriod = document.getElementById('hero-period');
    const heroTitle = document.getElementById('hero-title');
    const heroReadTime = document.getElementById('hero-read-time');

    // Botones e Interacciones
    const backBtn = document.getElementById('back-btn');
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    const readerSettingsBtn = document.getElementById('reader-settings-btn');
    
    // Bottom Sheet & Modales
    const settingsBackdrop = document.getElementById('settings-backdrop');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const fontDecreaseBtn = document.getElementById('font-decrease-btn');
    const fontIncreaseBtn = document.getElementById('font-increase-btn');
    const fontSizeDisplay = document.getElementById('font-size-display');
    const themeOptionBtns = document.querySelectorAll('.theme-option-btn');

    const resetBackdrop = document.getElementById('reset-backdrop');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const confirmResetBtn = document.getElementById('confirm-reset-btn');
    const completionRestartBtn = document.getElementById('completion-restart-btn');

    // ----------------------------------------------------------------------
    // 3. CARGA DE PROGRESO Y AJUSTES DESDE LOCALSTORAGE
    // ----------------------------------------------------------------------
    function loadSavedProgress() {
        try {
            const savedProg = localStorage.getItem('laHistoriaProgress');
            if (savedProg !== null) {
                const parsed = parseInt(savedProg, 10);
                if (Number.isFinite(parsed) && parsed >= 0) {
                    highestUnlockedIndex = parsed;
                }
            }
            const savedComp = localStorage.getItem('laHistoriaCompleted');
            if (savedComp === 'true') {
                isStoryCompleted = true;
            }
        } catch (e) {
            console.warn('Error leyendo localStorage:', e);
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem('laHistoriaProgress', highestUnlockedIndex.toString());
            localStorage.setItem('laHistoriaCompleted', isStoryCompleted ? 'true' : 'false');
        } catch (e) {
            console.warn('Error guardando progreso:', e);
        }
    }

    function loadSavedSettings() {
        try {
            const savedSettings = localStorage.getItem('laHistoriaReaderSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.fontSize) readerFontSize = parsed.fontSize;
                if (parsed.theme) readerTheme = parsed.theme;
            }
        } catch (e) {}
        applyReaderSettings();
    }

    function saveSettings() {
        try {
            localStorage.setItem('laHistoriaReaderSettings', JSON.stringify({
                fontSize: readerFontSize,
                theme: readerTheme
            }));
        } catch (e) {}
    }

    // ----------------------------------------------------------------------
    // 4. FETCH Y PROCESAMIENTO DE DATOS
    // ----------------------------------------------------------------------
    loadSavedProgress();
    loadSavedSettings();

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network error loading data.json');
            return response.json();
        })
        .then(data => {
            chaptersData = data;
            processAndSortChapters();
            
            // Validar límites del progreso cargado
            if (highestUnlockedIndex >= chaptersData.length) {
                highestUnlockedIndex = chaptersData.length - 1;
                isStoryCompleted = true;
            }

            renderTimeline();
            updateGlobalProgressBar();
            initHashRouting();
        })
        .catch(error => {
            console.error('Error al cargar capítulos:', error);
            pathContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #E63946;">
                    <h3>No se pudieron cargar los datos</h3>
                    <p style="margin: 10px 0 20px; font-size: 0.9rem; color: var(--text-muted);">Asegúrate de ejecutar un servidor local (ej. npx serve).</p>
                    <button onclick="location.reload()" class="nav-btn primary-btn" style="max-width: 200px; margin: 0 auto;">Reintentar</button>
                </div>
            `;
        });

    function getActNumber(actoString) {
        if (!actoString) return 99;
        const match = actoString.match(/Acto ([IXV]+)/i);
        if (match) {
            const roman = match[1].toUpperCase();
            const romanNumerals = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 };
            return romanNumerals[roman] || 99;
        }
        return 99;
    }

    function getSegmentNumber(segmentoString) {
        if (!segmentoString) return 0;
        const match = segmentoString.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    function processAndSortChapters() {
        chaptersData.sort((a, b) => {
            const actNumA = getActNumber(a.acto);
            const actNumB = getActNumber(b.acto);
            if (actNumA !== actNumB) return actNumA - actNumB;
            const segA = getSegmentNumber(a.segmento);
            const segB = getSegmentNumber(b.segmento);
            return segA - segB;
        });

        actsData = {};
        chaptersData.forEach((chapter, index) => {
            chapter.globalIndex = index;
            if (!actsData[chapter.acto]) {
                actsData[chapter.acto] = { chapters: [], period: chapter.periodo };
            }
            actsData[chapter.acto].chapters.push(chapter);
        });
    }

    // ----------------------------------------------------------------------
    // 5. RENDERS Y MAPA DE RUTA (TIMELINE)
    // ----------------------------------------------------------------------
    function renderTimeline() {
        pathContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // Crear elemento SVG para la curva continua de fondo
        const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgOverlay.setAttribute('class', 'path-svg-overlay');
        svgOverlay.setAttribute('id', 'path-svg-overlay');
        
        const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathBg.setAttribute('class', 'path-svg-line-bg');
        pathBg.setAttribute('id', 'path-line-bg');
        
        const pathCompleted = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathCompleted.setAttribute('class', 'path-svg-line-completed');
        pathCompleted.setAttribute('id', 'path-line-completed');

        svgOverlay.appendChild(pathBg);
        svgOverlay.appendChild(pathCompleted);
        fragment.appendChild(svgOverlay);

        const sortedActs = Object.keys(actsData).sort((a, b) => getActNumber(a) - getActNumber(b));
        
        sortedActs.forEach(actName => {
            const actInfo = actsData[actName];
            const config = ACT_CONFIG[actName] || { color: 'var(--gold-main)', light: 'var(--gold-bright)', date: 'Historia Bíblica' };

            // Sección del Acto (Header Cover)
            const actSection = document.createElement('section');
            actSection.className = 'act-section';
            actSection.dataset.actName = actName;
            actSection.style.setProperty('--act-accent-color', config.color);

            actSection.innerHTML = `
                <div class="act-header-cover">
                    <div class="act-header-num">${actName}</div>
                    <div class="act-header-period">${actInfo.period}</div>
                    <div class="act-header-date">${config.date}</div>
                    <div class="act-header-flourish">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="12,2 15,12 12,22 9,12"/></svg>
                    </div>
                </div>
                <div class="path-nodes-list" id="nodes-list-${actName.replace(/\s+/g, '-')}"></div>
            `;

            const nodesList = actSection.querySelector('.path-nodes-list');

            // Renderizar nodos dentro del Acto
            actInfo.chapters.forEach((chapter, idxWithinAct) => {
                const globalIdx = chapter.globalIndex;

                // Cálculo de desplazamiento en onda sinusoide suave para el camino curvo
                const sinOffset = Math.sin(globalIdx * 0.95) * 55; // -55px a +55px
                const titlePosition = sinOffset >= 0 ? 'pos-left' : 'pos-right';

                const wrapper = document.createElement('div');
                wrapper.className = 'path-node-wrapper';
                wrapper.dataset.index = globalIdx;
                wrapper.style.transform = `translateX(${sinOffset}px)`;

                // Determinar Estado del Nodo
                let statusClass = 'node-status-locked';
                let iconSvg = ICONS.lock;
                let ariaStatusText = 'Bloqueado';

                if (globalIdx < highestUnlockedIndex || (globalIdx === highestUnlockedIndex && isStoryCompleted)) {
                    statusClass = 'node-status-completed';
                    iconSvg = ICONS.check;
                    ariaStatusText = 'Completado';
                } else if (globalIdx === highestUnlockedIndex && !isStoryCompleted) {
                    statusClass = 'node-status-current';
                    iconSvg = ICONS.current;
                    ariaStatusText = 'Capítulo Actual';
                }

                // Generar Botón Accessible del Nodo
                const button = document.createElement('button');
                button.className = `node-btn ${statusClass}`;
                button.setAttribute('aria-label', `Capítulo ${globalIdx + 1}: ${chapter.titulo}. Estado: ${ariaStatusText}`);
                if (statusClass === 'node-status-locked') {
                    button.setAttribute('aria-disabled', 'true');
                }

                button.innerHTML = `
                    ${statusClass === 'node-status-current' ? '<span class="node-badge-floating">EMPEZAR</span>' : ''}
                    <div class="node-circle">
                        ${iconSvg}
                    </div>
                `;

                // Tarjeta de Título Siempre Visible
                const titleCard = document.createElement('div');
                titleCard.className = `node-title-card ${titlePosition}`;
                titleCard.innerHTML = `
                    <div class="node-title-num">Cap. ${globalIdx + 1}</div>
                    <div class="node-title-text">${chapter.titulo}</div>
                `;

                // Evento Click
                button.addEventListener('click', () => {
                    if (globalIdx <= highestUnlockedIndex) {
                        openChapter(chapter.id);
                    } else {
                        // Animación Shake y Toast de Feedback
                        button.classList.add('shake');
                        setTimeout(() => button.classList.remove('shake'), 400);
                        showToast('Completa los capítulos anteriores para desbloquear');
                    }
                });

                wrapper.appendChild(button);
                wrapper.appendChild(titleCard);
                nodesList.appendChild(wrapper);
            });

            fragment.appendChild(actSection);
        });

        pathContainer.appendChild(fragment);

        // Renderizar la curva SVG conectiva tras montar el DOM
        requestAnimationFrame(() => {
            updateSvgCurvedPath();
            initScrollObservers();
        });
    }

    // Dibujar trazo curvo Bézier continuo conectando los centros de todos los nodos
    function updateSvgCurvedPath() {
        const svgOverlay = document.getElementById('path-svg-overlay');
        const pathLineBg = document.getElementById('path-line-bg');
        const pathLineCompleted = document.getElementById('path-line-completed');
        if (!svgOverlay || !pathLineBg || !pathLineCompleted) return;

        const nodeElements = document.querySelectorAll('.path-node-wrapper');
        if (nodeElements.length === 0) return;

        const containerRect = pathContainer.getBoundingClientRect();

        let dPoints = [];
        nodeElements.forEach(node => {
            const circle = node.querySelector('.node-circle');
            if (circle) {
                const rect = circle.getBoundingClientRect();
                const x = rect.left + rect.width / 2 - containerRect.left;
                const y = rect.top + rect.height / 2 - containerRect.top;
                dPoints.push({ x, y });
            }
        });

        if (dPoints.length < 2) return;

        // Construir curva suave
        let dStr = `M ${dPoints[0].x} ${dPoints[0].y}`;
        for (let i = 0; i < dPoints.length - 1; i++) {
            const p0 = dPoints[i];
            const p1 = dPoints[i + 1];
            const midY = (p0.y + p1.y) / 2;
            dStr += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
        }

        pathLineBg.setAttribute('d', dStr);
        pathLineCompleted.setAttribute('d', dStr);

        // Calcular la longitud para teñir hasta el nodo actual
        const totalLength = pathLineBg.getTotalLength ? pathLineBg.getTotalLength() : 1000;
        pathLineCompleted.style.strokeDasharray = `${totalLength}`;

        const activeIndex = isStoryCompleted ? chaptersData.length : highestUnlockedIndex;
        const progressRatio = Math.min(1, activeIndex / (chaptersData.length - 1));
        const completedLength = totalLength * progressRatio;

        pathLineCompleted.style.strokeDashoffset = `${totalLength - completedLength}`;
    }

    // ----------------------------------------------------------------------
    // 6. ACTUALIZACIÓN EFICIENTE DE NODOS Y PROGRESO
    // ----------------------------------------------------------------------
    function updateNodeStatuses() {
        const nodeWrappers = document.querySelectorAll('.path-node-wrapper');
        nodeWrappers.forEach(wrapper => {
            const globalIdx = parseInt(wrapper.dataset.index, 10);
            const button = wrapper.querySelector('.node-btn');
            const circle = wrapper.querySelector('.node-circle');
            if (!button || !circle) return;

            let statusClass = 'node-status-locked';
            let iconSvg = ICONS.lock;
            let ariaStatusText = 'Bloqueado';

            if (globalIdx < highestUnlockedIndex || (globalIdx === highestUnlockedIndex && isStoryCompleted)) {
                statusClass = 'node-status-completed';
                iconSvg = ICONS.check;
                ariaStatusText = 'Completado';
            } else if (globalIdx === highestUnlockedIndex && !isStoryCompleted) {
                statusClass = 'node-status-current';
                iconSvg = ICONS.current;
                ariaStatusText = 'Capítulo Actual';
            }

            button.className = `node-btn ${statusClass}`;
            button.setAttribute('aria-label', `Capítulo ${globalIdx + 1}: ${chaptersData[globalIdx].titulo}. Estado: ${ariaStatusText}`);
            button.removeAttribute('aria-disabled');
            if (statusClass === 'node-status-locked') {
                button.setAttribute('aria-disabled', 'true');
            }

            // Actualizar Badge en Nodo Actual
            const oldBadge = button.querySelector('.node-badge-floating');
            if (oldBadge) oldBadge.remove();
            if (statusClass === 'node-status-current') {
                button.insertAdjacentHTML('afterbegin', '<span class="node-badge-floating">EMPEZAR</span>');
            }

            circle.innerHTML = iconSvg;
        });

        updateGlobalProgressBar();
        updateSvgCurvedPath();
    }

    function updateGlobalProgressBar() {
        const total = chaptersData.length;
        if (total === 0) return;
        const completedCount = isStoryCompleted ? total : highestUnlockedIndex;
        const percent = Math.round((completedCount / total) * 100);

        globalProgressFill.style.width = `${percent}%`;
        progressText.textContent = `${completedCount} de ${total} capítulos`;
        progressPercent.textContent = `${percent}%`;
    }

    // ----------------------------------------------------------------------
    // 7. OBSERVERS (STICKY ACT INDICATOR & FAB CONTINUAR)
    // ----------------------------------------------------------------------
    function initScrollObservers() {
        // Observer para el Indicador Sticky de Acto Visible
        const actHeaders = document.querySelectorAll('.act-header-cover');
        const actObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target.closest('.act-section');
                    if (section) {
                        const actName = section.dataset.actName;
                        stickyActBadge.textContent = actName;
                        stickyActTitle.textContent = actsData[actName] ? actsData[actName].period : '';
                        stickyActBar.classList.remove('hidden');
                    }
                }
            });
        }, { threshold: 0.2 });

        actHeaders.forEach(header => actObserver.observe(header));

        // Observer para mostrar/ocultar el FAB "Continuar"
        const currentWrapper = document.querySelector(`.path-node-wrapper[data-index="${highestUnlockedIndex}"]`);
        if (currentWrapper) {
            const fabObserver = new IntersectionObserver((entries) => {
                const isVisible = entries[0].isIntersecting;
                if (isVisible) {
                    fabContinue.classList.add('hidden');
                } else {
                    fabContinue.classList.remove('hidden');
                }
            }, { threshold: 0.3 });

            fabObserver.observe(currentWrapper);
        }
    }

    fabContinue.addEventListener('click', scrollToCurrentNode);

    function scrollToCurrentNode() {
        const currentWrapper = document.querySelector(`.path-node-wrapper[data-index="${highestUnlockedIndex}"]`);
        if (currentWrapper) {
            currentWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ----------------------------------------------------------------------
    // 8. HASH ROUTING Y VISTAS DE NAVEGACIÓN
    // ----------------------------------------------------------------------
    function initHashRouting() {
        window.addEventListener('hashchange', handleHashRouting);
        handleHashRouting();
    }

    function handleHashRouting() {
        const hash = location.hash;
        if (hash.startsWith('#/capitulo/')) {
            const chapterId = decodeURIComponent(hash.replace('#/capitulo/', ''));
            const chapter = chaptersData.find(c => c.id === chapterId);
            if (chapter && chapter.globalIndex <= highestUnlockedIndex) {
                showChapterView(chapter);
            } else {
                location.hash = '#/mapa';
            }
        } else {
            showMapView();
        }
    }

    function showMapView() {
        chapterView.classList.add('hidden');
        completionScreen.classList.add('hidden');
        timelineView.classList.remove('hidden');
        document.title = 'La Historia: El Camino';

        // Recalcular posiciones SVG tras cambiar vista
        requestAnimationFrame(() => updateSvgCurvedPath());
    }

    function openChapter(chapterId) {
        location.hash = `#/capitulo/${encodeURIComponent(chapterId)}`;
    }

    function showChapterView(chapter) {
        currentChapterIndex = chapter.globalIndex;
        timelineView.classList.add('hidden');
        completionScreen.classList.add('hidden');
        chapterView.classList.remove('hidden');

        // Reset Scroll Lector
        readerContent.scrollTop = 0;
        readingProgressBar.style.width = '0%';

        // Color de Acento del Acto Actual
        const actConfig = ACT_CONFIG[chapter.acto] || { color: 'var(--gold-main)', light: 'var(--gold-bright)' };
        chapterView.style.setProperty('--act-accent-color', actConfig.color);

        // Header corto
        readerBadge.textContent = chapter.acto;
        readerTitleShort.textContent = chapter.titulo;
        document.title = `${chapter.titulo} - La Historia`;

        // Hero Banner
        heroActBadge.textContent = chapter.acto;
        heroPeriod.textContent = chapter.periodo;
        heroTitle.textContent = chapter.titulo;

        // Extraer texto plano de forma segura (sea string u objeto con .value)
        let cleanMarkdown = '';
        if (typeof chapter.content === 'string') {
            cleanMarkdown = chapter.content;
        } else if (typeof chapter.content === 'object' && chapter.content !== null) {
            cleanMarkdown = chapter.content.value || chapter.content.toString() || '';
        }

        // Calcular Tiempo Estimado de Lectura (200 palabras / min)
        const wordCount = cleanMarkdown ? cleanMarkdown.split(/\s+/).length : 0;
        const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));
        heroReadTime.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ~${readTimeMin} min de lectura
        `;

        // Quitar bloque Frontmatter inicial si existe
        if (cleanMarkdown.startsWith('---')) {
            const parts = cleanMarkdown.split('---');
            if (parts.length >= 3) {
                cleanMarkdown = parts.slice(2).join('---').trim();
            }
        }

        const rawHtml = marked.parse(cleanMarkdown);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        chapterMarkdown.innerHTML = cleanHtml;

        // Actualizar estado de botones de navegación
        prevBtn.disabled = currentChapterIndex === 0;
        prevBtn.style.opacity = currentChapterIndex === 0 ? '0.5' : '1';

        if (currentChapterIndex === chaptersData.length - 1) {
            nextBtnText.textContent = 'Finalizar Historia';
        } else {
            nextBtnText.textContent = 'Completado · Siguiente';
        }
    }

    // Progreso de Lectura al hacer scroll
    readerContent.addEventListener('scroll', () => {
        const scrollTop = readerContent.scrollTop;
        const scrollHeight = readerContent.scrollHeight - readerContent.clientHeight;
        if (scrollHeight > 0) {
            const percent = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            readingProgressBar.style.width = `${percent}%`;
        }
    });

    // Eventos de Navegación del Lector
    backBtn.addEventListener('click', () => {
        location.hash = '#/mapa';
    });

    prevBtn.addEventListener('click', () => {
        if (currentChapterIndex > 0) {
            const prevChapter = chaptersData[currentChapterIndex - 1];
            openChapter(prevChapter.id);
        }
    });

    nextBtn.addEventListener('click', () => {
        completeCurrentChapterAndAdvance();
    });

    function completeCurrentChapterAndAdvance() {
        // Lanzar Micro-Celebración de Confeti Ligero
        triggerConfettiCelebration();

        if (currentChapterIndex >= chaptersData.length - 1) {
            // Historia Finalizada
            isStoryCompleted = true;
            highestUnlockedIndex = chaptersData.length - 1;
            saveProgress();
            updateNodeStatuses();
            showCompletionScreen();
        } else {
            // Avanzar al siguiente capítulo y desbloquearlo
            if (currentChapterIndex >= highestUnlockedIndex) {
                highestUnlockedIndex = currentChapterIndex + 1;
                saveProgress();
                updateNodeStatuses();
            }
            const nextChapter = chaptersData[currentChapterIndex + 1];
            openChapter(nextChapter.id);
        }
    }

    function showCompletionScreen() {
        timelineView.classList.add('hidden');
        chapterView.classList.add('hidden');
        completionScreen.classList.remove('hidden');
        document.title = '¡Historia Completada! - La Historia';

        // Lluvia Especial de Confeti Dorado
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    }

    completionRestartBtn.addEventListener('click', () => {
        location.hash = '#/mapa';
    });

    function triggerConfettiCelebration() {
        // Respetar preferencia de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 35,
                spread: 50,
                origin: { y: 0.85 },
                colors: ['#D4A94F', '#F2D48A', '#FFFFFF']
            });
        }
    }

    // ----------------------------------------------------------------------
    // 9. PANEL DE AJUSTES DE LECTURA (BOTTOM SHEET)
    // ----------------------------------------------------------------------
    readerSettingsBtn.addEventListener('click', () => {
        settingsBackdrop.classList.remove('hidden');
        settingsBackdrop.setAttribute('aria-hidden', 'false');
    });

    closeSettingsBtn.addEventListener('click', closeSettingsSheet);
    settingsBackdrop.addEventListener('click', (e) => {
        if (e.target === settingsBackdrop) closeSettingsSheet();
    });

    function closeSettingsSheet() {
        settingsBackdrop.classList.add('hidden');
        settingsBackdrop.setAttribute('aria-hidden', 'true');
    }

    fontDecreaseBtn.addEventListener('click', () => {
        if (readerFontSize > 14) {
            readerFontSize -= 2;
            applyReaderSettings();
            saveSettings();
        }
    });

    fontIncreaseBtn.addEventListener('click', () => {
        if (readerFontSize < 26) {
            readerFontSize += 2;
            applyReaderSettings();
            saveSettings();
        }
    });

    themeOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            readerTheme = btn.dataset.theme;
            applyReaderSettings();
            saveSettings();
        });
    });

    function applyReaderSettings() {
        fontSizeDisplay.textContent = `${readerFontSize}px`;
        chapterView.style.setProperty('--reader-font-size', `${readerFontSize}px`);

        // Aplicar clase de Tema
        chapterView.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
        chapterView.classList.add(`theme-${readerTheme}`);

        themeOptionBtns.forEach(btn => {
            if (btn.dataset.theme === readerTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 10. REINICIAR PROGRESO (MODAL Y CONFIRMACIÓN)
    // ----------------------------------------------------------------------
    resetProgressBtn.addEventListener('click', () => {
        resetBackdrop.classList.remove('hidden');
        resetBackdrop.setAttribute('aria-hidden', 'false');
    });

    cancelResetBtn.addEventListener('click', () => {
        resetBackdrop.classList.add('hidden');
        resetBackdrop.setAttribute('aria-hidden', 'true');
    });

    confirmResetBtn.addEventListener('click', () => {
        resetBackdrop.classList.add('hidden');
        resetBackdrop.setAttribute('aria-hidden', 'true');

        highestUnlockedIndex = 0;
        isStoryCompleted = false;
        saveProgress();
        updateNodeStatuses();
        showToast('Progreso reiniciado correctamente');
        scrollToCurrentNode();
    });

    // ----------------------------------------------------------------------
    // 11. NOTIFICACIONES TOAST FLOANTES
    // ----------------------------------------------------------------------
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Recalcular posiciones SVG al redimensionar ventana
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => updateSvgCurvedPath());
    });
});
