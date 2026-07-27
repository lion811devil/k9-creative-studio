/* K9 Creative Studio 6.5 - Template & Smart Layout Engine */
(() => {
  'use strict';

  const TEMPLATES = {
    course: {
      name: 'Corso professionale',
      description: 'Presentazione strutturata di un percorso formativo.',
      values: { objective: 'Presenta un corso', audience: 'Proprietari di cani', tone: 'Professionale', tone2: 'Educativo', toneMix: '72', style: 'Corporate premium', styleMode: 'auto', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    event: {
      name: 'Evento / Open Day',
      description: 'Locandina orientata a data, luogo e iscrizioni.',
      values: { objective: 'Annuncia evento', audience: 'Pubblico locale', tone: 'Professionale', tone2: 'Motivazionale', toneMix: '70', style: 'Evento open day', styleMode: 'auto', contentMode: 'complete' },
      formats: { portrait: 'Post Instagram verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    dogsitter: {
      name: 'Servizio Dogsitter',
      description: 'Comunicazione chiara e rassicurante per servizi a domicilio.',
      values: { discipline: 'Dogsitter', objective: 'Promuovi servizio', audience: 'Proprietari di cani', tone: 'Professionale', tone2: 'Amichevole', toneMix: '68', style: 'Soft professionale', styleMode: 'light', contentMode: 'complete' },
      formats: { portrait: 'Post Instagram verticale', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
    },
    stage: {
      name: 'Stage / Seminario',
      description: 'Impostazione tecnica per giornate formative e workshop.',
      values: { discipline: 'Stage e seminari', objective: 'Raccogli iscrizioni', audience: 'Professionisti cinofili', tone: 'Tecnico', tone2: 'Istituzionale', toneMix: '76', style: 'Evento seminario', styleMode: 'auto', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    operational: {
      name: 'Unità cinofile operative',
      description: 'Comunicazione tecnica e istituzionale per attività specialistiche.',
      values: { discipline: 'Unità cinofile', objective: 'Informa ed educa', audience: 'Associazioni e gruppi', tone: 'Istituzionale', tone2: 'Tecnico', toneMix: '78', style: 'Report operativo', styleMode: 'dark', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Presentazione 16:9' }
    },
    premium: {
      name: 'Academy Premium',
      description: 'Presentazione istituzionale elegante dell’Academy.',
      values: { discipline: 'Academy generale', objective: 'Promuovi servizio', audience: 'Proprietari di cani', tone: 'Premium', tone2: 'Istituzionale', toneMix: '74', style: 'Luxury nero oro', styleMode: 'dark', contentMode: 'complete' },
      formats: { portrait: 'Locandina A4 verticale', square: 'Post Instagram quadrato', landscape: 'Banner sito standard' }
    },
    social: {
      name: 'Social announcement',
      description: 'Composizione rapida per annunci e iscrizioni sui social.',
      values: { objective: 'Comunica disponibilità', audience: 'Pubblico locale', tone: 'Social coinvolgente', tone2: 'Commerciale', toneMix: '65', style: 'Social announcement', styleMode: 'auto', contentMode: 'essential' },
      formats: { portrait: 'Storia Instagram', square: 'Post Instagram quadrato', landscape: 'Post Facebook' }
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

  function applySmartLayout(showMessage = true) {
    const result = chooseSmartStyle();
    setValue('style', result.style);
    const mode = result.group === 'clean' ? 'light' : 'auto';
    setValue('styleMode', mode);
    if (typeof window.graphicVariant === 'number' && typeof window.normalizeGraphicVariant === 'function') {
      window.graphicVariant = window.normalizeGraphicVariant($id('type').value, 0);
    }
    if (typeof window.build === 'function') window.build(false);
    updateStatus(`Smart Layout: ${result.style} · ${result.group === 'dense' ? 'contenuto esteso' : result.group === 'photo' ? 'priorità fotografia' : result.group === 'event' ? 'priorità evento' : 'composizione essenziale'}.`);
    if (showMessage && typeof window.notify === 'function') window.notify(`Layout intelligente applicato: ${result.style}.`);
  }

  function applyTemplate(key) {
    const template = TEMPLATES[key];
    if (!template) return;
    const family = formatFamily($id('type')?.value);
    const preferredFormat = template.formats[family] || template.formats.square;
    setValue('type', preferredFormat);
    Object.entries(template.values).forEach(([id, value]) => setValue(id, value));
    if (typeof window.applyServiceDefaults === 'function') window.applyServiceDefaults();
    if (typeof window.generateContent === 'function') window.generateContent('all', true);
    applySmartLayout(false);
    updateStatus(`${template.name} applicato. Testi, tono, formato e composizione sono stati coordinati.`);
    if (typeof window.notify === 'function') window.notify(`Template applicato: ${template.name}.`);
  }

  function updateStatus(text) {
    const status = $id('templateEngineStatus');
    if (status) status.textContent = text;
  }

  function createInterface() {
    const firstSection = document.querySelector('[data-panel="graphics"] .controls .section');
    if (!firstSection || $id('templateEngine')) return;
    const panel = document.createElement('div');
    panel.id = 'templateEngine';
    panel.className = 'template-engine';
    panel.innerHTML = `
      <div class="template-engine-head">
        <div><strong>Template professionale</strong><span>Imposta in un solo passaggio struttura, tono, stile e contenuti.</span></div>
        <span class="template-engine-badge">SMART</span>
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
    const refreshDescription = () => {
      const item = TEMPLATES[select.value];
      $id('templateDescription').textContent = item?.description || '';
    };
    select.addEventListener('change', refreshDescription);
    $id('applyTemplatePreset').addEventListener('click', () => applyTemplate(select.value));
    $id('applySmartLayout').addEventListener('click', () => applySmartLayout(true));
    refreshDescription();
  }

  window.K9TemplateEngine = Object.freeze({ templates: TEMPLATES, applyTemplate, applySmartLayout, chooseSmartStyle });
  createInterface();
})();
