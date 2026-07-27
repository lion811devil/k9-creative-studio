(() => {
  'use strict';
  const STORAGE_KEY = 'k9-ui2-settings-v1';
  const state = { zoom: 1, compact: false, collapsed: {} };
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  function loadState(){
    try{ Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }catch(_){ }
  }
  function saveState(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(_){ }
  }
  function setZoom(value){
    const canvas = $('#previewCanvas');
    if(!canvas) return;
    state.zoom = Math.max(.65, Math.min(1.8, Number(value) || 1));
    canvas.style.width = `${Math.round(state.zoom * 100)}%`;
    const valueNode = $('#ui2ZoomValue');
    if(valueNode) valueNode.textContent = `${Math.round(state.zoom * 100)}%`;
    saveState();
  }
  function addPreviewControls(){
    const head = $('.preview-head');
    const panel = $('.preview-panel');
    if(!head || !panel || $('#ui2PreviewActions')) return;
    const actions = document.createElement('div');
    actions.className = 'ui2-preview-actions';
    actions.id = 'ui2PreviewActions';
    actions.innerHTML = `
      <button class="ui2-preview-btn" type="button" id="ui2ZoomOut" aria-label="Riduci anteprima">−</button>
      <span class="ui2-zoom-value" id="ui2ZoomValue">100%</span>
      <button class="ui2-preview-btn" type="button" id="ui2ZoomIn" aria-label="Ingrandisci anteprima">+</button>
      <button class="ui2-preview-btn" type="button" id="ui2Fit" aria-label="Adatta anteprima">Adatta</button>
      <button class="ui2-preview-btn" type="button" id="ui2Fullscreen" aria-label="Anteprima a tutto schermo">⛶</button>`;
    head.appendChild(actions);
    $('#ui2ZoomOut').addEventListener('click', () => setZoom(state.zoom - .1));
    $('#ui2ZoomIn').addEventListener('click', () => setZoom(state.zoom + .1));
    $('#ui2Fit').addEventListener('click', () => setZoom(1));
    $('#ui2Fullscreen').addEventListener('click', () => {
      panel.classList.toggle('ui2-preview-fullscreen');
      document.body.style.overflow = panel.classList.contains('ui2-preview-fullscreen') ? 'hidden' : '';
      $('#ui2Fullscreen').textContent = panel.classList.contains('ui2-preview-fullscreen') ? '✕' : '⛶';
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && panel.classList.contains('ui2-preview-fullscreen')) $('#ui2Fullscreen').click();
    });
    setZoom(state.zoom);
  }
  function makeSectionsCollapsible(){
    $$('.controls .section').forEach((section, index) => {
      const title = $('.section-title', section);
      if(!title || $('.ui2-section-toggle', title)) return;
      const key = `section-${index}`;
      const body = document.createElement('div');
      body.className = 'ui2-section-body';
      [...section.children].filter(el => el !== title).forEach(el => body.appendChild(el));
      section.appendChild(body);
      section.classList.add('ui2-collapsible');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ui2-section-toggle';
      button.setAttribute('aria-label', 'Comprimi o espandi sezione');
      button.textContent = '⌃';
      title.appendChild(button);
      const apply = collapsed => {
        section.classList.toggle('ui2-collapsed', collapsed);
        button.textContent = collapsed ? '⌄' : '⌃';
        button.setAttribute('aria-expanded', String(!collapsed));
      };
      apply(Boolean(state.collapsed[key]));
      button.addEventListener('click', () => {
        state.collapsed[key] = !section.classList.contains('ui2-collapsed');
        apply(state.collapsed[key]);
        saveState();
      });
    });
  }
  function addFocusBar(){
    const controls = $('.workspace .controls');
    if(!controls || $('#ui2FocusBar')) return;
    const bar = document.createElement('div');
    bar.id = 'ui2FocusBar';
    bar.className = 'ui2-focus-bar';
    bar.innerHTML = '<button type="button" class="btn" id="ui2ToggleCompact">Modalità compatta</button><button type="button" class="btn secondary" id="ui2OpenPreview">Anteprima intera</button>';
    controls.prepend(bar);
    $('#ui2ToggleCompact').addEventListener('click', () => {
      state.compact = !state.compact;
      document.body.classList.toggle('ui2-compact', state.compact);
      $('#ui2ToggleCompact').textContent = state.compact ? 'Mostra introduzione' : 'Modalità compatta';
      saveState();
    });
    $('#ui2OpenPreview').addEventListener('click', () => $('#ui2Fullscreen')?.click());
  }
  function addMobileLabel(){
    const stage = $('.workspace .stage');
    if(!stage || $('.ui2-mobile-preview-label', stage)) return;
    const label = document.createElement('div');
    label.className = 'ui2-mobile-preview-label';
    label.innerHTML = '<span>Anteprima sempre in primo piano</span><span>Scorri sotto per modificare</span>';
    stage.prepend(label);
  }
  function updateVersion(){
    const footer = $('.footer');
    if(footer) footer.textContent = footer.textContent.replace(/Creative Studio\s+[\d.]+/i, 'Creative Studio 7.4');
  }
  function init(){
    loadState();
    document.body.classList.add('ui2-ready');
    document.body.classList.toggle('ui2-compact', Boolean(state.compact));
    addPreviewControls();
    makeSectionsCollapsible();
    addFocusBar();
    addMobileLabel();
    updateVersion();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
