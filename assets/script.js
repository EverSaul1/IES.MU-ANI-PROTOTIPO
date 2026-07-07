// ==========================================================================
// I.E. Horizonte — Prototipo visual. NO hay backend.
// Todo lo interactivo de aquí es una simulación en el navegador.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function initialsOf(name) {
    const clean = String(name).replace(/^(Ing\.|Prof\.|Lic\.|Mg\.|Dr\.|Sr\.|Sra\.|Miss)\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '—';
  }
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll to top ---------- */
  const scrollTopBtn = document.querySelector('[data-scroll-top]');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Mobile nav ---------- */
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      mobileNav.classList.toggle('hidden', !isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Subnav dropdown ---------- */
  const subnavTriggers = document.querySelectorAll('[data-subnav-trigger]');
  subnavTriggers.forEach(trigger => {
    const panel = document.getElementById(trigger.getAttribute('data-subnav-trigger'));
    if (!panel) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !panel.classList.contains('is-open');
      document.querySelectorAll('.subnav-panel.is-open').forEach(p => p.classList.remove('is-open'));
      if (willOpen) panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.subnav-panel.is-open').forEach(p => p.classList.remove('is-open'));
    subnavTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
  });
  document.querySelectorAll('.subnav-panel').forEach(p => p.addEventListener('click', e => e.stopPropagation()));

  /* ---------- Generic fade slider engine (used by hero + testimonios) ---------- */
  function createSlider(root, { interval = 5000, auto = true } = {}) {
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-slide-dot]'));
    const prevBtn = root.querySelector('[data-slide-prev]');
    const nextBtn = root.querySelector('[data-slide-next]');
    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }
    function next() { show(index + 1); }
    function prev() { show(index - 1); }
    function restart() {
      if (!auto || prefersReducedMotion) return;
      clearInterval(timer);
      timer = setInterval(next, interval);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));
    nextBtn?.addEventListener('click', () => { next(); restart(); });
    prevBtn?.addEventListener('click', () => { prev(); restart(); });
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);

    show(index);
    restart();
  }
  createSlider(document.querySelector('[data-hero-slider]'), { interval: 5000, auto: true });
  createSlider(document.querySelector('[data-testi-slider]'), { interval: 6000, auto: true });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------- Animated counters ---------- */
  const counterEls = document.querySelectorAll('[data-counter]');
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-PE');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('es-PE');
    }
    if (prefersReducedMotion) { el.textContent = target.toLocaleString('es-PE'); return; }
    requestAnimationFrame(tick);
  }
  if (counterEls.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); io2.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counterEls.forEach(el => io2.observe(el));
  }

  /* ---------- Generic tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const buttons = group.querySelectorAll('[data-tab]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        const scope = group.closest('[data-tab-scope]') || document;
        scope.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        scope.querySelectorAll('[data-tab-panel]').forEach(panel => {
          panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== target);
        });
      });
    });
  });

  /* ---------- Mesa de Partes: interactive status stepper ---------- */
  const stepButtons = document.querySelectorAll('[data-status-btn]');
  const steps = document.querySelectorAll('[data-step]');
  const statusNote = document.querySelector('[data-status-note]');
  const statusNotes = {
    pendiente: 'El trámite fue registrado y espera ser asignado a un responsable.',
    revision: 'Un especialista de la oficina correspondiente está evaluando tu solicitud.',
    observado: 'Se requiere información o documentación adicional de tu parte.',
    aprobado: 'La solicitud fue aprobada y pasa a trámite final.',
    finalizado: 'El proceso concluyó. Puedes descargar la resolución o respuesta.'
  };
  const order = ['pendiente', 'revision', 'observado', 'aprobado', 'finalizado'];
  function setStatus(key) {
    const idx = order.indexOf(key);
    steps.forEach(step => {
      const stepIdx = order.indexOf(step.getAttribute('data-step'));
      step.classList.remove('is-current', 'is-done');
      if (stepIdx < idx) step.classList.add('is-done');
      if (stepIdx === idx) step.classList.add('is-current');
    });
    stepButtons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-status-btn') === key));
    if (statusNote) statusNote.textContent = statusNotes[key] || '';
  }
  if (stepButtons.length) {
    stepButtons.forEach(btn => btn.addEventListener('click', () => setStatus(btn.getAttribute('data-status-btn'))));
    setStatus('revision');
  }

  /* ---------- Toast ---------- */
  const toastEl = document.querySelector('[data-toast]');
  const toastTextEl = document.querySelector('[data-toast-text]');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    if (toastTextEl) toastTextEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  /* ---------- Working toggle switches ---------- */
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', (e) => {
      e.preventDefault();
      const input = sw.querySelector('input[type="checkbox"]');
      if (input) input.checked = !input.checked;
    });
  });

  /* ---------- Chip filter groups ---------- */
  document.querySelectorAll('[data-chip-group]').forEach(group => {
    const chips = group.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const key = group.getAttribute('data-chip-group');
        const val = chip.getAttribute('data-chip-filter');
        const list = document.querySelector(`[data-list="${key}"]`);
        if (list && val) {
          list.querySelectorAll('[data-status]').forEach(row => {
            row.classList.toggle('hidden', val !== 'all' && row.getAttribute('data-status') !== val);
          });
        }
      });
    });
  });

  /* ==========================================================================
     Admin panel — sidebar navigation
     ========================================================================== */
  const adminLinks = document.querySelectorAll('[data-admin-link]');
  const adminPanels = document.querySelectorAll('[data-admin-panel]');
  const adminTitle = document.querySelector('[data-admin-title]');
  adminLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-admin-link');
      adminLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
      adminPanels.forEach(panel => panel.classList.toggle('hidden', panel.getAttribute('data-admin-panel') !== target));
      if (adminTitle) adminTitle.textContent = link.getAttribute('data-admin-title') || link.textContent.trim();
      document.querySelectorAll('[data-mobile-admin-nav]').forEach(nav => nav.classList.remove('is-open'));
      document.querySelectorAll('[data-admin-backdrop]').forEach(b => b.classList.add('hidden'));
    });
  });
  function switchAdminPanel(key) { document.querySelector(`[data-admin-link="${key}"]`)?.click(); }

  const adminMenuBtn = document.querySelector('[data-admin-menu-toggle]');
  const adminMobileNav = document.querySelector('[data-mobile-admin-nav]');
  const adminBackdrop = document.querySelector('[data-admin-backdrop]');
  if (adminMenuBtn && adminMobileNav) {
    adminMenuBtn.addEventListener('click', () => {
      adminMobileNav.classList.toggle('is-open');
      if (adminBackdrop) adminBackdrop.classList.toggle('hidden');
    });
  }
  if (adminBackdrop && adminMobileNav) {
    adminBackdrop.addEventListener('click', () => {
      adminMobileNav.classList.remove('is-open');
      adminBackdrop.classList.add('hidden');
    });
  }

  /* ---------- Generic "+ Nuevo…" mini add-forms ---------- */
  function openAddForm(panelKey, { focusTitle = true } = {}) {
    const form = document.querySelector(`[data-add-form="${panelKey}"]`);
    if (!form) return null;
    form.classList.remove('hidden');
    if (focusTitle) form.querySelector('[data-field-title]')?.focus();
    return form;
  }
  function closeAddForm(form) {
    if (!form) return;
    form.querySelectorAll('input, textarea').forEach(el => { el.value = ''; });
    form.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
    form._editingRow = null;
    const heading = form.querySelector('p.font-display');
    if (heading && form._originalHeading) heading.textContent = form._originalHeading;
    const saveBtn = form.querySelector('[data-save-item]');
    if (saveBtn && form._originalSaveLabel) saveBtn.textContent = form._originalSaveLabel;
    form.classList.add('hidden');
  }

  const nivelMap = { Inicial: 'badge-amber', Primaria: 'badge-blue', Secundaria: 'badge-violet', General: 'badge-gray' };
  function nivelBadge(nivel) {
    const cls = nivelMap[nivel] || 'badge-gray';
    return `<span class="badge ${cls}">${escapeHtml(nivel || 'General')}</span>`;
  }

  const rowBuilders = {
    comunicados: (v) => `<div class="admin-row" data-status="${(v.category||'General').toLowerCase()}"><div class="admin-thumb">—</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">nuevo</p></div>${nivelBadge(v.category)}<button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`,
    eventos: (v) => `<div class="admin-row"><div class="admin-thumb">NUEVO</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">${v.secondary ? escapeHtml(v.secondary) : 'Fecha por confirmar'}</p></div>${nivelBadge(v.category)}<button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`,
    concursos: (v) => `<div class="admin-row"><div class="admin-thumb">PDF</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">${v.secondary ? 'Inscripciones hasta ' + escapeHtml(v.secondary) : 'Nuevo concurso'}</p></div>${nivelBadge(v.category)}<span class="badge badge-green">Abierto</span><button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`,
    biblioteca: (v) => `<div class="admin-row"><div class="admin-thumb">${v.secondary === 'Video' ? 'VIDEO' : 'PDF'}</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">${escapeHtml(v.secondary || 'Recurso')}</p></div>${nivelBadge(v.category)}<button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`,
    directorio: (v) => `<div class="admin-row"><div class="admin-thumb">${initialsOf(v.title)}</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">${escapeHtml(v.secondary || 'Personal')}</p></div>${nivelBadge(v.category)}<button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`,
    usuarios: (v) => {
      const roleBadge = v.category === 'Administrador' ? 'badge-blue' : 'badge-amber';
      return `<div class="admin-row"><div class="admin-thumb">${initialsOf(v.title)}</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(v.title)}</p><p class="text-[11px] text-[var(--ink-soft)]">${escapeHtml(v.secondary || '')}</p></div><span class="badge ${roleBadge}">${escapeHtml(v.category || 'Editor')}</span><span class="badge badge-gray">Invitado</span><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`;
    },
  };

  function buildGalleryCard(title) {
    const colors = ['linear-gradient(150deg,#1B4D9E,#3FA9F0)', 'linear-gradient(150deg,#0E2F6B,#1B4D9E)', 'linear-gradient(150deg,#8B5CF6,#3FA9F0)'];
    const bg = colors[Math.floor(Math.random() * colors.length)];
    const card = document.createElement('div');
    card.className = 'card rounded-2xl overflow-hidden';
    card.setAttribute('data-deletable', '');
    card.innerHTML = `<div class="h-32" style="background:${bg}"></div><div class="p-4 flex items-center justify-between"><p class="text-sm font-bold text-[var(--ink)]">${escapeHtml(title)}</p><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`;
    return card;
  }

  document.querySelectorAll('[data-add-form]').forEach(form => {
    const key = form.getAttribute('data-add-form');
    if (key === 'noticias') return; // handled separately below (content-type selector)
    const heading = form.querySelector('p.font-display');
    const saveBtn = form.querySelector('[data-save-item]');
    const cancelBtn = form.querySelector('[data-cancel-item]');
    form._originalHeading = heading ? heading.textContent : '';
    form._originalSaveLabel = saveBtn ? saveBtn.textContent : '';

    saveBtn?.addEventListener('click', () => {
      const titleInput = form.querySelector('[data-field-title]');
      const title = titleInput?.value.trim();
      if (!title) { titleInput?.focus(); return; }
      const secondary = form.querySelector('[data-field-secondary]')?.value.trim() || '';
      const category = form.querySelector('[data-field-category]')?.value || '';
      const editingRow = form._editingRow;

      if (editingRow) {
        const titleEl = editingRow.querySelector('.font-bold, .font-medium');
        if (titleEl) titleEl.textContent = title;
        showToast('Cambios guardados (vista previa — sin backend)');
      } else if (key === 'galeria') {
        const list = document.querySelector('[data-list="galeria"]');
        list?.prepend(buildGalleryCard(title));
        showToast('Foto agregada (vista previa — sin backend)');
      } else {
        const list = document.querySelector(`[data-list="${key}"]`);
        const builder = rowBuilders[key];
        if (list && builder) {
          const html = builder({ title, secondary, category });
          if (list.hasAttribute('data-list-append')) list.insertAdjacentHTML('beforeend', html);
          else list.insertAdjacentHTML('afterbegin', html);
        }
        showToast('Elemento agregado (vista previa — sin backend)');
      }
      closeAddForm(form);
    });
    cancelBtn?.addEventListener('click', () => closeAddForm(form));
  });

  /* ---------- "+ Nuevo…" buttons + dashboard shortcuts ---------- */
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-goto');
      switchAdminPanel(key);
      setTimeout(() => openAddForm(key), 50);
    });
  });
  document.querySelectorAll('button').forEach(btn => {
    if (btn.hasAttribute('data-goto') || btn.hasAttribute('data-save-item') || btn.hasAttribute('data-cancel-item')) return;
    if (!btn.textContent.trim().startsWith('+')) return;
    const panel = btn.closest('[data-admin-panel]');
    if (!panel) return;
    const key = panel.getAttribute('data-admin-panel');
    if (!document.querySelector(`[data-add-form="${key}"]`)) return;
    btn.addEventListener('click', () => openAddForm(key));
  });

  /* ---------- Edit / delete — event delegation ---------- */
  let rowPendingDelete = null;
  const confirmModal = document.querySelector('[data-confirm-modal]');
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-icon-btn');
    if (!btn) return;
    const label = btn.getAttribute('aria-label') || '';
    const symbol = btn.textContent.trim();
    const row = btn.closest('.admin-row, [data-deletable]');
    if (!row) return;

    if (symbol === '🗑' || label === 'Eliminar') {
      rowPendingDelete = row;
      confirmModal?.classList.remove('hidden');
    } else if (symbol === '✎' || label === 'Editar') {
      const panel = row.closest('[data-admin-panel]');
      const panelKey = panel?.getAttribute('data-admin-panel');
      const currentTitle = row.querySelector('.font-bold, .font-medium')?.textContent.trim() || '';
      if (panelKey) {
        const form = openAddForm(panelKey, { focusTitle: false });
        if (form) {
          const titleInput = form.querySelector('[data-field-title]');
          if (titleInput) titleInput.value = currentTitle;
          form._editingRow = row;
          const headingEl = form.querySelector('p.font-display');
          if (headingEl) headingEl.textContent = `Editando: ${currentTitle}`;
          const saveBtnEl = form.querySelector('[data-save-item]');
          if (saveBtnEl) saveBtnEl.textContent = 'Guardar cambios';
          titleInput?.focus();
        }
      }
    }
  });
  document.querySelector('[data-confirm-delete-btn]')?.addEventListener('click', () => {
    if (rowPendingDelete) {
      const el = rowPendingDelete;
      el.classList.add('is-removing');
      setTimeout(() => el.remove(), 250);
      rowPendingDelete = null;
    }
    confirmModal?.classList.add('hidden');
    showToast('Elemento eliminado (vista previa — sin backend)');
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-backdrop')?.classList.add('hidden'));
  });

  /* ---------- Mesa de Partes (admin): change expediente status live ---------- */
  const statusLabels = { pendiente: 'Pendiente', revision: 'En revisión', observado: 'Observado', aprobado: 'Aprobado', finalizado: 'Finalizado' };
  const statusBadgeClass = { pendiente: 'badge-gray', revision: 'badge-blue', observado: 'badge-red', aprobado: 'badge-blue', finalizado: 'badge-green' };
  document.querySelectorAll('[data-expediente-select]').forEach(select => {
    select.addEventListener('change', () => {
      const val = select.value;
      const row = select.closest('.admin-row');
      if (!row) return;
      row.setAttribute('data-status', val);
      const badge = row.querySelector('[data-status-badge]');
      if (badge) { badge.className = `badge ${statusBadgeClass[val] || 'badge-gray'}`; badge.textContent = statusLabels[val] || val; }
      showToast(`Estado actualizado a "${statusLabels[val]}" (vista previa)`);
    });
  });

  /* ---------- Noticias (public): open detail modal ---------- */
  document.querySelectorAll('[data-noticia-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-noticia-open');
      document.querySelector(`[data-noticia-modal="${id}"]`)?.classList.remove('hidden');
    });
  });

  /* ---------- Click outside modal card to close ---------- */
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target !== backdrop) return;
      if (backdrop.hasAttribute('data-add-form')) closeAddForm(backdrop);
      else backdrop.classList.add('hidden');
    });
  });

  /* ---------- Admin: Noticias — tipo de contenido selector + guardar ---------- */
  const noticiaTypeGroup = document.querySelector('[data-noticia-type-group]');
  if (noticiaTypeGroup) {
    const typeButtons = noticiaTypeGroup.querySelectorAll('[data-noticia-type]');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-noticia-type');
        typeButtons.forEach(b => b.classList.toggle('is-active', b === btn));
        document.querySelectorAll('[data-noticia-field]').forEach(field => {
          field.classList.toggle('hidden', field.getAttribute('data-noticia-field') !== type);
        });
      });
    });

    const noticiaForm = document.querySelector('[data-add-form="noticias"]');
    const noticiaHeading = noticiaForm?.querySelector('p.font-display');
    const noticiaSaveBtn = noticiaForm?.querySelector('[data-save-item]');
    if (noticiaForm) {
      noticiaForm._originalHeading = noticiaHeading ? noticiaHeading.textContent : '';
      noticiaForm._originalSaveLabel = noticiaSaveBtn ? noticiaSaveBtn.textContent : '';
    }
    noticiaForm?.querySelector('[data-cancel-item]')?.addEventListener('click', () => {
      closeAddForm(noticiaForm);
      typeButtons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-noticia-type') === 'texto'));
      document.querySelectorAll('[data-noticia-field]').forEach(field => field.classList.toggle('hidden', field.getAttribute('data-noticia-field') !== 'texto'));
    });
    const noticiaLabels = { texto: 'TEXTO', pdf: 'PDF', video: 'VIDEO', link: 'LINK' };
    noticiaForm?.querySelector('[data-save-item]')?.addEventListener('click', () => {
      const titleInput = noticiaForm.querySelector('[data-field-title]');
      const title = titleInput?.value.trim();
      if (!title) { titleInput?.focus(); return; }
      const category = noticiaForm.querySelector('[data-field-category]')?.value || 'General';
      const activeTypeBtn = noticiaForm.querySelector('[data-noticia-type].is-active');
      const type = activeTypeBtn ? activeTypeBtn.getAttribute('data-noticia-type') : 'texto';
      const editingRow = noticiaForm._editingRow;

      if (editingRow) {
        const titleEl = editingRow.querySelector('.font-bold, .font-medium');
        if (titleEl) titleEl.textContent = title;
        showToast('Noticia actualizada (vista previa — sin backend)');
      } else {
        const list = document.querySelector('[data-list="noticias"]');
        const html = `<div class="admin-row" data-status="${type}"><div class="admin-thumb">${noticiaLabels[type]}</div><div class="flex-1 min-w-0"><p class="text-sm font-bold text-[var(--ink)] truncate">${escapeHtml(title)}</p><p class="text-[11px] text-[var(--ink-soft)]">nueva</p></div>${nivelBadge(category)}<button class="admin-icon-btn" aria-label="Editar">✎</button><button class="admin-icon-btn" aria-label="Eliminar">🗑</button></div>`;
        list?.insertAdjacentHTML('afterbegin', html);
        showToast('Noticia agregada (vista previa — sin backend)');
      }
      closeAddForm(noticiaForm);
      // reset type selector back to "texto" for next time
      typeButtons.forEach(b => b.classList.toggle('is-active', b.getAttribute('data-noticia-type') === 'texto'));
      document.querySelectorAll('[data-noticia-field]').forEach(field => field.classList.toggle('hidden', field.getAttribute('data-noticia-field') !== 'texto'));
    });
  }

  /* ---------- Settings "Guardar cambios" ---------- */
  document.querySelectorAll('[data-save-settings]').forEach(btn => {
    btn.addEventListener('click', () => showToast('Cambios guardados (vista previa — este panel no tiene backend)'));
  });

  /* ==========================================================================
     Admin — Banner Hero CRUD (upload preview, reorder, activar/desactivar, editar)
     ========================================================================== */
  const bannerList = document.querySelector('[data-banner-list]');
  if (bannerList) {
    function wireBannerCard(card) {
      const fileInput = card.querySelector('[data-banner-upload]');
      const thumbImg = card.querySelector('[data-banner-img]');
      const thumbEmpty = card.querySelector('[data-banner-empty]');
      fileInput?.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (thumbImg) { thumbImg.src = e.target.result; thumbImg.classList.remove('hidden'); }
          if (thumbEmpty) thumbEmpty.classList.add('hidden');
          showToast('Imagen cargada en la vista previa del banner');
        };
        reader.readAsDataURL(file);
      });

      card.querySelector('[data-banner-up]')?.addEventListener('click', () => {
        const prev = card.previousElementSibling;
        if (prev) { card.parentElement.insertBefore(card, prev); showToast('Banner movido hacia arriba'); }
      });
      card.querySelector('[data-banner-down]')?.addEventListener('click', () => {
        const next = card.nextElementSibling;
        if (next) { card.parentElement.insertBefore(next, card); showToast('Banner movido hacia abajo'); }
      });

      card.querySelector('[data-banner-save]')?.addEventListener('click', () => {
        showToast('Banner actualizado (vista previa — sin backend)');
      });

      card.querySelector('[data-banner-delete]')?.addEventListener('click', () => {
        rowPendingDelete = card;
        confirmModal?.classList.remove('hidden');
      });
    }
    bannerList.querySelectorAll('[data-banner-card]').forEach(wireBannerCard);

    document.querySelector('[data-banner-add]')?.addEventListener('click', () => {
      const tpl = document.querySelector('[data-banner-template]');
      if (!tpl) return;
      const clone = tpl.content.firstElementChild.cloneNode(true);
      bannerList.appendChild(clone);
      wireBannerCard(clone);
      clone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Nuevo banner agregado — complétalo y sube una imagen');
    });
  }

});
