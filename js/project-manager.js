(function(){
  'use strict';

  const MAX_PROJECTS = 60;
  const $id = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel = value => {
    if (!value) return 'Data non disponibile';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Data non disponibile';
    return new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short'}).format(d);
  };

  let searchTerm = '';
  let sortMode = 'updated-desc';

  function ensureManagerUi(){
    const drawerCard = document.querySelector('.drawer-card');
    const savedList = $id('savedList');
    if (!drawerCard || !savedList || $id('projectManagerTools')) return;

    const tools = document.createElement('div');
    tools.id = 'projectManagerTools';
    tools.className = 'project-manager-tools';
    tools.innerHTML = `
      <label class="project-search">
        <span>Cerca progetto</span>
        <input id="projectSearch" type="search" placeholder="Nome, disciplina o formato" autocomplete="off">
      </label>
      <label class="project-sort">
        <span>Ordina</span>
        <select id="projectSort">
          <option value="updated-desc">Modificati di recente</option>
          <option value="updated-asc">Modificati meno di recente</option>
          <option value="name-asc">Nome A–Z</option>
          <option value="name-desc">Nome Z–A</option>
        </select>
      </label>
      <div class="project-manager-summary" id="projectManagerSummary"></div>`;
    savedList.before(tools);

    $id('projectSearch').addEventListener('input', e => { searchTerm = e.target.value.trim().toLowerCase(); renderSaved(); });
    $id('projectSort').addEventListener('change', e => { sortMode = e.target.value; renderSaved(); });
  }

  function makeThumbnail(){
    const canvas = $id('previewCanvas');
    if (!canvas || !canvas.width || !canvas.height) return '';
    try {
      const max = 360;
      const scale = Math.min(1, max / Math.max(canvas.width, canvas.height));
      const out = document.createElement('canvas');
      out.width = Math.max(1, Math.round(canvas.width * scale));
      out.height = Math.max(1, Math.round(canvas.height * scale));
      out.getContext('2d',{alpha:false}).drawImage(canvas,0,0,out.width,out.height);
      return out.toDataURL('image/jpeg',0.72);
    } catch { return ''; }
  }

  async function enhancedSaveProject(){
    const data = await build();
    const list = getProjects();
    const index = list.findIndex(item => String(item.project||'').toLowerCase() === data.project.toLowerCase());
    const previous = index >= 0 ? list[index] : null;
    data.id = previous?.id || data.id || Date.now();
    data.createdAt = previous?.createdAt || data.updatedAt || new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.thumbnail = makeThumbnail() || previous?.thumbnail || '';
    if (index >= 0) list[index] = data; else list.unshift(data);
    setProjects(list.slice(0,MAX_PROJECTS));
    notify(index >= 0 ? 'Progetto aggiornato.' : 'Progetto salvato in archivio.');
  }

  function sortedProjects(){
    let list = getProjects().slice();
    if (searchTerm) {
      list = list.filter(item => [item.project,item.discipline,item.type,item.objective].some(v => String(v||'').toLowerCase().includes(searchTerm)));
    }
    const time = item => new Date(item.updatedAt || item.createdAt || 0).getTime() || 0;
    list.sort((a,b) => {
      if (sortMode === 'updated-asc') return time(a)-time(b);
      if (sortMode === 'name-asc') return String(a.project||'').localeCompare(String(b.project||''),'it');
      if (sortMode === 'name-desc') return String(b.project||'').localeCompare(String(a.project||''),'it');
      return time(b)-time(a);
    });
    return list;
  }

  function enhancedRenderSaved(){
    ensureManagerUi();
    const all = getProjects();
    const list = sortedProjects();
    const summary = $id('projectManagerSummary');
    if (summary) summary.textContent = `${list.length} visualizzati · ${all.length} salvati`;
    const target = $id('savedList');
    if (!target) return;
    if (!list.length) {
      target.innerHTML = `<div class="project-empty"><strong>Nessun progetto trovato</strong><span>${all.length ? 'Modifica la ricerca o l’ordinamento.' : 'Salva il primo progetto per ritrovarlo qui.'}</span></div>`;
      return;
    }
    target.innerHTML = list.map(item => `
      <article class="saved-project-card" data-project-id="${Number(item.id)}">
        <div class="saved-project-thumb">${item.thumbnail ? `<img src="${escapeHtml(item.thumbnail)}" alt="Anteprima ${escapeHtml(item.project)}">` : '<span>K9</span>'}</div>
        <div class="saved-project-copy">
          <strong>${escapeHtml(item.project)}</strong>
          <small>${escapeHtml(item.discipline)} · ${escapeHtml(item.type)}</small>
          <time>${escapeHtml(dateLabel(item.updatedAt || item.createdAt))}</time>
        </div>
        <div class="saved-project-actions">
          <button type="button" data-action="open" title="Apri progetto">Apri</button>
          <button type="button" data-action="duplicate" title="Duplica progetto">Duplica</button>
          <button type="button" data-action="rename" title="Rinomina progetto">Rinomina</button>
          <button type="button" class="danger" data-action="delete" title="Elimina progetto">Elimina</button>
        </div>
      </article>`).join('');

    target.querySelectorAll('[data-project-id]').forEach(card => {
      card.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = Number(card.dataset.projectId);
        const action = button.dataset.action;
        if (action === 'open') loadProject(id);
        if (action === 'duplicate') duplicateProject(id);
        if (action === 'rename') renameProject(id);
        if (action === 'delete') removeProject(id);
      });
    });
  }

  function duplicateProject(id){
    const list = getProjects();
    const source = list.find(item => Number(item.id) === Number(id));
    if (!source) return;
    const stamp = Date.now();
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = stamp;
    copy.project = `${source.project} - copia`;
    copy.createdAt = copy.updatedAt = new Date(stamp).toISOString();
    list.unshift(copy);
    setProjects(list.slice(0,MAX_PROJECTS));
    notify('Copia del progetto creata.');
  }

  function renameProject(id){
    const list = getProjects();
    const item = list.find(project => Number(project.id) === Number(id));
    if (!item) return;
    const name = prompt('Nuovo nome del progetto:', item.project);
    if (name == null) return;
    const clean = name.trim();
    if (!clean) return notify('Il nome del progetto non può essere vuoto.',true);
    item.project = clean;
    item.updatedAt = new Date().toISOString();
    setProjects(list);
    notify('Progetto rinominato.');
  }

  function removeProject(id){
    const item = getProjects().find(project => Number(project.id) === Number(id));
    if (!item) return;
    if (!confirm(`Eliminare definitivamente “${item.project}”?`)) return;
    setProjects(getProjects().filter(project => Number(project.id) !== Number(id)));
    notify('Progetto eliminato.');
  }

  function upgradeExistingProjects(){
    const list = getProjects();
    let changed = false;
    list.forEach((item,index) => {
      if (!item.createdAt) { item.createdAt = item.updatedAt || new Date(Date.now()-index).toISOString(); changed = true; }
      if (!item.updatedAt) { item.updatedAt = item.createdAt; changed = true; }
    });
    if (changed) setProjects(list);
  }

  function bind(){
    upgradeExistingProjects();
    ensureManagerUi();
    window.saveProject = enhancedSaveProject;
    window.renderSaved = enhancedRenderSaved;
    window.deleteProject = removeProject;
    const saveButton = $id('saveProject');
    if (saveButton) saveButton.onclick = enhancedSaveProject;
    const archiveButton = $id('savedBtn');
    if (archiveButton) archiveButton.addEventListener('click', () => setTimeout(enhancedRenderSaved,0));
    enhancedRenderSaved();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
})();
