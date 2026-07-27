/* K9 Creative Studio 7.6 - Template Engine definitivo */
(() => {
  'use strict';

  const TEMPLATES = {
    dogsitter: {
      name: 'Dogsitter',
      description: 'Servizi di cura, passeggiate e assistenza a domicilio.',
      values: { discipline: 'Dogsitter', objective: 'Promuovi servizio', audience: 'Proprietari di cani', tone: 'Professionale', tone2: 'Amichevole', toneMix: '68', style: 'Soft professionale', styleMode: 'light', contentMode: 'balanced' },
      formats: { portrait: 'Post Instagram verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    mantrailing: {
      name: 'Mantrailing',
      description: 'Presentazione professionale di attività, corsi e giornate di Mantrailing.',
      values: { discipline: 'Mantrailing', objective: 'Raccogli iscrizioni', audience: 'Proprietari di cani', tone: 'Professionale', tone2: 'Sportivo', toneMix: '72', style: 'Fotografico cinematico', styleMode: 'dark', contentMode: 'balanced' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    detection: {
      name: 'Detection',
      description: 'Comunicazione tecnica e dinamica per attività di ricerca olfattiva.',
      values: { discipline: 'Detection', objective: 'Presenta un corso', audience: 'Proprietari di cani', tone: 'Tecnico', tone2: 'Motivazionale', toneMix: '72', style: 'K9 intelligence', styleMode: 'dark', contentMode: 'balanced' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    hrdd: {
      name: 'HRDD',
      description: 'Impostazione istituzionale per unità cinofile specialistiche e formazione HRDD.',
      values: { discipline: 'HRDD', objective: 'Informa ed educa', audience: 'Professionisti cinofili', tone: 'Istituzionale', tone2: 'Tecnico', toneMix: '80', style: 'Report operativo', styleMode: 'dark', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    event: {
      name: 'Evento / Open Day',
      description: 'Locandina focalizzata su data, luogo, disponibilità e contatti.',
      values: { objective: 'Annuncia evento', audience: 'Pubblico locale', tone: 'Professionale', tone2: 'Motivazionale', toneMix: '70', style: 'Evento open day', styleMode: 'auto', contentMode: 'balanced' },
      formats: { portrait: 'Post Instagram verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    course: {
      name: 'Corso',
      description: 'Presentazione ordinata di programma, destinatari e modalità di partecipazione.',
      values: { objective: 'Presenta un corso', audience: 'Proprietari di cani', tone: 'Professionale', tone2: 'Educativo', toneMix: '74', style: 'Corporate premium', styleMode: 'auto', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    social: {
      name: 'Locandina Social',
      description: 'Annuncio sintetico e leggibile per feed social.',
      values: { objective: 'Comunica disponibilità', audience: 'Pubblico locale', tone: 'Social coinvolgente', tone2: 'Commerciale', toneMix: '64', style: 'Social announcement', styleMode: 'auto', contentMode: 'essential' },
      formats: { portrait: 'Post Instagram verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    flyerA4: {
      name: 'Volantino A4',
      description: 'Formato stampa con contenuti completi e gerarchia editoriale.',
      values: { objective: 'Promuovi servizio', audience: 'Pubblico locale', tone: 'Professionale', tone2: 'Informativo', toneMix: '75', style: 'Editoriale verticale', styleMode: 'auto', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Locandina A4 verticale', landscape: 'Locandina A4 orizzontale' }
    },
    story: {
      name: 'Story Instagram 9:16',
      description: 'Composizione verticale immediata, pensata per lettura rapida da smartphone.',
      values: { objective: 'Comunica disponibilità', audience: 'Pubblico locale', tone: 'Social coinvolgente', tone2: 'Motivazionale', toneMix: '66', style: 'Social launch', styleMode: 'auto', contentMode: 'essential' },
      formats: { portrait: 'Storia Instagram', square: 'Storia Instagram', landscape: 'Storia Instagram' }
    },
    facebook: {
      name: 'Banner Facebook',
      description: 'Formato orizzontale con titolo, immagine e contatto ben separati.',
      values: { objective: 'Annuncia evento', audience: 'Pubblico locale', tone: 'Professionale', tone2: 'Social coinvolgente', toneMix: '68', style: 'Banner superiore', styleMode: 'auto', contentMode: 'essential' },
      formats: { portrait: 'Post Facebook', square: 'Post Facebook', landscape: 'Post Facebook' }
    }
  };

  const LAYOUT_RECOMMENDATIONS = {
    portrait: {
      dense: ['Scheda tecnica', 'Editoriale verticale', 'Corporate premium'],
      photo: ['Foto a tutta pagina', 'Finestra fotografica', 'Manifesto fotografico'],
      event: ['Evento open day', 'Nastro evento', 'Timeline evento'],
      clean: ['Minimal nordico', 'Soft professionale', 'Chiaro professionale']
    },
    square: {
      dense: ['Pannelli modulari', 'Mosaico K9', 'Scheda tecnica'],
      photo: ['Cover magazine', 'Collage fotografico', 'Focus circolare'],
      event: ['Biglietto evento', 'Evento countdown', 'Poster festival'],
      clean: ['Swiss grid', 'Minimal elegante', 'Corporate premium']
    },
    landscape: {
      dense: ['Editoriale a colonne', 'Report operativo', 'Blueprint K9'],
      photo: ['Split editoriale sinistra', 'Finestra fotografica', 'Cover documentario'],
      event: ['Banner superiore', 'Evento workshop', 'Biglietto evento'],
      clean: ['Corporate premium', 'Soft professionale', 'Minimal nordico']
    }
  };

  const $id = id => document.getElementById(id);
  const setValue = (id, value) => {
    const el = $id(id);
    if (!el || value == null) return false;
    const optionExists = el.tagName !== 'SELECT' || [...el.options].some(option => option.value === value || option.text === value);
    if (!optionExists) return false;
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  function formatFamily(value) {
    const text = String(value || '').toLowerCase();
    if (/orizzontale|16:9|4:3|facebook|youtube|linkedin|banner|biglietto/.test(text)) return 'landscape';
    if (/quadrato/.test(text)) return 'square';
    return 'portrait';
  }

  function contentDensity() {
    const ids = ['titleInput', 'sloganInput', 'subtitleInput', 'details', 'benefits', 'program', 'targetText', 'methodText', 'includedText', 'requirementsText', 'notesText'];
    return ids.reduce((sum, id) => sum + String($id(id)?.value || '').trim().length, 0);
  }

  function chooseSmartStyle() {
    const family = formatFamily($id('type')?.value);
    const objective = $id('objective')?.value || '';
    const density = contentDensity();
    const hasPhoto = Boolean(window.currentImage || $id('imageThumb')?.src);
    let group = 'clean';
    if (/evento|iscrizioni/i.test(objective)) group = 'event';
    else if (hasPhoto) group = 'photo';
    else if (density > 1100) group = 'dense';
    const candidates = LAYOUT_RECOMMENDATIONS[family]?.[group] || LAYOUT_RECOMMENDATIONS.square.clean;
    const select = $id('style');
    const selected = candidates.find(name => [...select.options].some(option => option.value === name || option.text === name));
    return { style: selected || select.value, family, group, density };
  }

  function updateStatus(text, kind = '') {
    const status = $id('templateEngineStatus');
    if (!status) return;
    status.textContent = text;
    status.dataset.kind = kind;
  }

  function applySmartLayout(showMessage = true) {
    const result = chooseSmartStyle();
    setValue('style', result.style);
    setValue('styleMode', result.group === 'clean' ? 'light' : 'auto');
    if (typeof window.graphicVariant === 'number' && typeof window.normalizeGraphicVariant === 'function') {
      window.graphicVariant = window.normalizeGraphicVariant($id('type').value, 0);
    }
    if (typeof window.build === 'function') window.build(false);
    updateStatus(`Layout adattato: ${result.style}.`);
    if (showMessage && typeof window.notify === 'function') window.notify(`Layout applicato: ${result.style}.`);
  }

  function applyTemplate(key) {
    const template = TEMPLATES[key];
    if (!template) return;
    const family = formatFamily($id('type')?.value);
    const preferredFormat = template.formats[family] || template.formats.square;
    setValue('type', preferredFormat);
    Object.entries(template.values).forEach(([id, value]) => setValue(id, value));
    document.documentElement.dataset.activeTemplate = key;
    try { localStorage.setItem('k9-active-template', key); } catch (_) {}
    if (typeof window.applyServiceDefaults === 'function') window.applyServiceDefaults();
    if (typeof window.generateContent === 'function') window.generateContent('all', true);
    applySmartLayout(false);
    updateStatus(`${template.name} applicato. Puoi sostituire testi e immagini, poi esportare.`);
    if (typeof window.notify === 'function') window.notify(`Template applicato: ${template.name}.`);
  }

  function createInterface() {
    const firstSection = document.querySelector('[data-panel="graphics"] .controls .section');
    if (!firstSection || $id('templateEngine')) return;
    const panel = document.createElement('div');
    panel.id = 'templateEngine';
    panel.className = 'template-engine';
    panel.innerHTML = `
      <div class="template-engine-head">
        <div><strong>Template definitivi</strong><span>Scegli il tipo di locandina e personalizza i contenuti.</span></div>
        <span class="template-engine-badge">10 MODELLI</span>
      </div>
      <div class="template-engine-grid">
        <label class="field"><span>Modello</span><select id="templatePreset">${Object.entries(TEMPLATES).map(([key, item]) => `<option value="${key}">${item.name}</option>`).join('')}</select></label>
        <button class="btn primary" type="button" id="applyTemplatePreset">Applica modello</button>
        <button class="btn secondary" type="button" id="applySmartLayout">Adatta layout</button>
      </div>
      <div id="templateDescription" class="template-description"></div>
      <div id="templateEngineStatus" class="format-adapt-status">Motore template pronto.</div>`;
    const anchor = firstSection.querySelector('.section-title');
    anchor.insertAdjacentElement('afterend', panel);

    const select = $id('templatePreset');
    const saved = (() => { try { return localStorage.getItem('k9-active-template'); } catch (_) { return ''; } })();
    if (saved && TEMPLATES[saved]) select.value = saved;
    const refreshDescription = () => {
      const item = TEMPLATES[select.value];
      $id('templateDescription').textContent = item?.description || '';
    };
    select.addEventListener('change', refreshDescription);
    $id('applyTemplatePreset').addEventListener('click', () => applyTemplate(select.value));
    $id('applySmartLayout').addEventListener('click', () => applySmartLayout(true));
    refreshDescription();
  }

  window.K9TemplateEngine = Object.freeze({ templates: TEMPLATES, applyTemplate, applySmartLayout, chooseSmartStyle, formatFamily });
  createInterface();
})();
