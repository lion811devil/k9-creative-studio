(() => {
  'use strict';

  const STORAGE_KEY = 'k9-ui2-settings-v3';
  const state = { zoom: 1, compact: false, collapsed: {} };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let previousBodyOverflow = '';
  let previewObserver = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved && typeof saved === 'object') Object.assign(state, saved);
    } catch (_) {
      // Impostazioni non valide: usa i valori predefiniti.
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // L'interfaccia continua a funzionare anche senza persistenza locale.
    }
  }

  function setZoom(value) {
    const canvas = $('#previewCanvas');
    if (!canvas) return;
    state.zoom = Math.max(0.65, Math.min(1.8, Number(value) || 1));
    canvas.style.width = `${Math.round(state.zoom * 100)}%`;
    canvas.style.height = 'auto';
    const valueNode = $('#ui2ZoomValue');
    if (valueNode) valueNode.textContent = `${Math.round(state.zoom * 100)}%`;
    saveState();
  }

  function closeFullscreen() {
    const panel = $('.preview-panel');
    const button = $('#ui2Fullscreen');
    if (!panel?.classList.contains('ui2-preview-fullscreen')) return;
    panel.classList.remove('ui2-preview-fullscreen');
    document.body.style.overflow = previousBodyOverflow;
    if (button) {
      button.textContent = '⛶';
      button.setAttribute('aria-label', 'Anteprima a tutto schermo');
      button.setAttribute('aria-pressed', 'false');
    }
  }

  function toggleFullscreen() {
    const panel = $('.preview-panel');
    const button = $('#ui2Fullscreen');
    if (!panel || !button) return;
    const opening = !panel.classList.contains('ui2-preview-fullscreen');
    if (opening) {
      previousBodyOverflow = document.body.style.overflow;
      panel.classList.add('ui2-preview-fullscreen');
      document.body.style.overflow = 'hidden';
      button.textContent = '✕';
      button.setAttribute('aria-label', 'Chiudi anteprima a tutto schermo');
      button.setAttribute('aria-pressed', 'true');
      panel.scrollTop = 0;
    } else {
      closeFullscreen();
    }
  }

  function addPreviewControls() {
    const head = $('.preview-head');
    if (!head || $('#ui2PreviewActions')) return;

    const actions = document.createElement('div');
    actions.className = 'ui2-preview-actions';
    actions.id = 'ui2PreviewActions';
    actions.innerHTML = `
      <button class="ui2-preview-btn" type="button" id="ui2ZoomOut" aria-label="Riduci anteprima">−</button>
      <span class="ui2-zoom-value" id="ui2ZoomValue" aria-live="polite">100%</span>
      <button class="ui2-preview-btn" type="button" id="ui2ZoomIn" aria-label="Ingrandisci anteprima">+</button>
      <button class="ui2-preview-btn ui2-fit-btn" type="button" id="ui2Fit" aria-label="Adatta anteprima allo schermo">Adatta</button>
      <button class="ui2-preview-btn" type="button" id="ui2Fullscreen" aria-label="Anteprima a tutto schermo" aria-pressed="false">⛶</button>`;
    head.appendChild(actions);

    $('#ui2ZoomOut')?.addEventListener('click', () => setZoom(state.zoom - 0.1));
    $('#ui2ZoomIn')?.addEventListener('click', () => setZoom(state.zoom + 0.1));
    $('#ui2Fit')?.addEventListener('click', () => setZoom(1));
    $('#ui2Fullscreen')?.addEventListener('click', toggleFullscreen);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeFullscreen();
    });
    window.addEventListener('pagehide', closeFullscreen);
    setZoom(state.zoom);
  }

  function sectionKey(section, index) {
    const title = $('.section-title', section)?.textContent?.trim().replace(/\s+/g, '-').toLowerCase();
    return title ? `section-${title}` : `section-${index}`;
  }

  function setSectionCollapsed(section, key, collapsed) {
    const button = $('.ui2-section-toggle', section);
    section.classList.toggle('ui2-collapsed', collapsed);
    if (button) {
      button.textContent = collapsed ? '⌄' : '⌃';
      button.setAttribute('aria-expanded', String(!collapsed));
      button.setAttribute('aria-label', collapsed ? 'Espandi sezione' : 'Comprimi sezione');
    }
    state.collapsed[key] = collapsed;
  }

  function makeSectionsCollapsible() {
    $$('.controls .section').forEach((section, index) => {
      const title = $('.section-title', section);
      if (!title || $('.ui2-section-toggle', title)) return;

      const key = sectionKey(section, index);
      const body = document.createElement('div');
      body.className = 'ui2-section-body';
      body.id = `ui2-section-body-${index}`;
      [...section.children].filter(element => element !== title).forEach(element => body.appendChild(element));
      section.appendChild(body);
      section.classList.add('ui2-collapsible');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ui2-section-toggle';
      button.setAttribute('aria-controls', body.id);
      title.appendChild(button);

      setSectionCollapsed(section, key, Boolean(state.collapsed[key]));

      const toggle = () => {
        setSectionCollapsed(section, key, !section.classList.contains('ui2-collapsed'));
        saveState();
      };
      button.addEventListener('click', event => {
        event.stopPropagation();
        toggle();
      });
      title.classList.add('ui2-clickable-title');
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.addEventListener('click', event => {
        if (event.target.closest('button, input, select, textarea, a')) return;
        toggle();
      });
      title.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  function setAllSections(collapsed) {
    $$('.controls .ui2-collapsible').forEach((section, index) => {
      setSectionCollapsed(section, sectionKey(section, index), collapsed);
    });
    saveState();
  }

  function addFocusBar() {
    const controls = $('.workspace .controls');
    if (!controls || $('#ui2FocusBar')) return;

    const bar = document.createElement('div');
    bar.id = 'ui2FocusBar';
    bar.className = 'ui2-focus-bar';
    bar.innerHTML = `
      <button type="button" class="btn" id="ui2ToggleCompact">Compatta</button>
      <button type="button" class="btn secondary" id="ui2CollapseAll">Comprimi</button>
      <button type="button" class="btn secondary" id="ui2ExpandAll">Espandi</button>`;
    controls.prepend(bar);

    const compactButton = $('#ui2ToggleCompact');
    const applyCompactLabel = () => {
      if (compactButton) compactButton.textContent = state.compact ? 'Mostra guida' : 'Compatta';
    };
    compactButton?.addEventListener('click', () => {
      state.compact = !state.compact;
      document.body.classList.toggle('ui2-compact', state.compact);
      applyCompactLabel();
      saveState();
    });
    $('#ui2CollapseAll')?.addEventListener('click', () => setAllSections(true));
    $('#ui2ExpandAll')?.addEventListener('click', () => setAllSections(false));
    applyCompactLabel();
  }

  function addMobileLabel() {
    const stage = $('.workspace .stage');
    if (!stage || $('.ui2-mobile-preview-label', stage)) return;
    const label = document.createElement('div');
    label.className = 'ui2-mobile-preview-label';
    label.innerHTML = '<span>Anteprima</span><span>Modifica nei pannelli sotto</span>';
    stage.prepend(label);
  }

  function addReturnToPreviewButton() {
    const stage = $('.workspace .stage');
    if (!stage || $('#ui2ReturnPreview')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'ui2ReturnPreview';
    button.className = 'ui2-return-preview';
    button.textContent = '↑ Anteprima';
    button.setAttribute('aria-label', 'Torna all’anteprima');
    button.addEventListener('click', () => stage.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    document.body.appendChild(button);

    if ('IntersectionObserver' in window) {
      previewObserver = new IntersectionObserver(entries => {
        const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0.15);
        button.classList.toggle('is-visible', !visible && window.matchMedia('(max-width: 940px)').matches);
      }, { threshold: [0, 0.15, 0.5] });
      previewObserver.observe(stage);
    }
  }

  function bindFormatFit() {
    $('#type')?.addEventListener('change', () => {
      window.setTimeout(() => setZoom(1), 80);
    });
  }

  function updateVersion() {
    const footer = $('.footer');
    if (footer) footer.textContent = footer.textContent.replace(/Creative Studio\s+[\d.]+/i, 'Creative Studio 1.1.3');
  }

  function init() {
    loadState();
    document.body.classList.add('ui2-ready');
    document.body.classList.toggle('ui2-compact', Boolean(state.compact));
    addPreviewControls();
    makeSectionsCollapsible();
    addFocusBar();
    addMobileLabel();
    addReturnToPreviewButton();
    bindFormatFit();
    updateVersion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
