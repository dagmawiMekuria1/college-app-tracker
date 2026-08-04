/* ============================================================
   school-detail.js — School Detail & Checklist
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const schoolId = params.get('id');

  if (!schoolId) {
    window.location.href = 'colleges.html';
    return;
  }

  function getSchool() {
    return Store.getSchoolById(schoolId);
  }

  function renderHeader() {
    const school = getSchool();
    if (!school) {
      document.getElementById('school-header').innerHTML = '<p>School not found.</p>';
      return;
    }

    document.getElementById('school-header').innerHTML =
      '<div class="school-header__top">' +
        '<span class="dot dot--' + Utils.escapeHTML(school.category) + '"></span>' +
        '<h1 class="school-header__name">' + Utils.escapeHTML(school.name) + '</h1>' +
      '</div>' +
      '<div class="school-header__meta">' +
        (school.location ? '<span>' + Utils.escapeHTML(school.location) + '</span>' : '') +
        '<span class="badge ' + Utils.getAppTypeBadgeClass(school.appType) + '">' + Utils.escapeHTML(Utils.getAppTypeLabel(school.appType)) + '</span>' +
        (school.deadline ? '<span>Deadline: ' + Utils.formatDate(school.deadline) + '</span>' : '') +
      '</div>';
  }

  function renderInfo() {
    const school = getSchool();
    if (!school) return;

    const isReadOnly = window.__READONLY__;

    let statusOptions = '<option value="not_started"' + (school.status === 'not_started' ? ' selected' : '') + '>Not Started</option>' +
      '<option value="in_progress"' + (school.status === 'in_progress' ? ' selected' : '') + '>In Progress</option>' +
      '<option value="submitted"' + (school.status === 'submitted' ? ' selected' : '') + '>Submitted</option>';

    let outcomeOptions = '<option value="">—</option>' +
      '<option value="accepted"' + (school.outcome === 'accepted' ? ' selected' : '') + '>Accepted</option>' +
      '<option value="rejected"' + (school.outcome === 'rejected' ? ' selected' : '') + '>Rejected</option>' +
      '<option value="waitlisted"' + (school.outcome === 'waitlisted' ? ' selected' : '') + '>Waitlisted</option>' +
      '<option value="deferred"' + (school.outcome === 'deferred' ? ' selected' : '') + '>Deferred</option>';

    document.getElementById('school-info-body').innerHTML =
      '<div class="school-info__row"><span class="school-info__label">Location</span><span class="school-info__value">' + Utils.escapeHTML(school.location || '—') + '</span></div>' +
      '<div class="school-info__row"><span class="school-info__label">Tuition</span><span class="school-info__value">' + Utils.escapeHTML(school.tuition || '—') + '</span></div>' +
      '<div class="school-info__row"><span class="school-info__label">Acceptance Rate</span><span class="school-info__value">' + Utils.escapeHTML(school.acceptanceRate || '—') + '</span></div>' +
      '<div class="school-info__row"><span class="school-info__label">Category</span><span class="school-info__value"><span class="dot dot--' + Utils.escapeHTML(school.category) + '" style="margin-right:4px;"></span>' + Utils.escapeHTML(Utils.getCategoryLabel(school.category)) + '</span></div>' +
      '<div class="school-info__row"><span class="school-info__label">Status</span><span class="school-info__value"><select class="select school-info__select" data-field="status"' + (isReadOnly ? ' disabled' : '') + '>' + statusOptions + '</select></span></div>' +
      (school.status === 'submitted' ?
        '<div class="school-info__row"><span class="school-info__label">Outcome</span><span class="school-info__value"><select class="select school-info__select" data-field="outcome"' + (isReadOnly ? ' disabled' : '') + '>' + outcomeOptions + '</select></span></div>' +
        '<div class="school-info__row"><span class="school-info__label">Committed</span><span class="school-info__value"><label style="cursor:pointer;display:flex;align-items:center;gap:var(--space-2);"><input type="checkbox" data-field="committed"' + (school.committed ? ' checked' : '') + (isReadOnly ? ' disabled' : '') + '> ' + (school.committed ? 'Yes' : 'No') + '</label></span></div>'
        : '');

    // Bind status/outcome/committed change handlers
    if (!isReadOnly) {
      const statusSelect = document.querySelector('[data-field="status"]');
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          Store.updateSchool(schoolId, { status: e.target.value });
          if (e.target.value === 'submitted') {
            Components.renderToast('Application marked as submitted!', 'success');
          }
          renderInfo();
          renderChecklist();
        });
      }

      const outcomeSelect = document.querySelector('[data-field="outcome"]');
      if (outcomeSelect) {
        outcomeSelect.addEventListener('change', (e) => {
          Store.updateSchool(schoolId, { outcome: e.target.value || null });
          renderInfo();
        });
      }

      const committedCheckbox = document.querySelector('[data-field="committed"]');
      if (committedCheckbox) {
        committedCheckbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            // Uncommit all other schools
            Store.getSchools().forEach(s => {
              if (s.id !== schoolId && s.committed) {
                Store.updateSchool(s.id, { committed: false });
              }
            });
          }
          Store.updateSchool(schoolId, { committed: e.target.checked });
          Components.renderToast(e.target.checked ? 'Committed!' : 'Commitment removed.', 'success');
          renderInfo();
        });
      }
    }
  }

  function renderChecklist() {
    const school = getSchool();
    if (!school) return;

    const checklist = school.checklist || [];
    const completed = checklist.filter(i => i.completed).length;
    const total = checklist.length;

    document.getElementById('checklist-count').textContent = '(' + completed + '/' + total + ')';

    const listEl = document.getElementById('checklist-items');
    if (checklist.length === 0) {
      listEl.innerHTML = '<li style="padding:var(--space-4);color:var(--color-text-secondary);font-size:var(--font-size-body-sm);">No checklist items.</li>';
      return;
    }

    listEl.innerHTML = checklist.map(item => {
      const overdue = item.dueDate && !item.completed && Utils.isOverdue(item.dueDate);
      return '<li class="checklist__item" data-item-id="' + Utils.escapeHTML(item.id) + '">' +
        '<div class="checklist__checkbox' + (item.completed ? ' checked' : '') + '" data-action="toggle-check" tabindex="0" role="checkbox" aria-checked="' + item.completed + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<span class="checklist__label' + (item.completed ? ' checklist__label--completed' : '') + '">' + Utils.escapeHTML(item.label) + '</span>' +
        (item.dueDate ? '<span class="checklist__due' + (overdue ? ' checklist__due--overdue' : '') + '">' + Utils.formatDateShort(item.dueDate) + '</span>' : '') +
        '<button class="checklist__delete btn--delete" data-action="delete-check" aria-label="Remove item">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</li>';
    }).join('');
  }

  function renderNotes() {
    const school = getSchool();
    if (!school) return;
    const textarea = document.getElementById('school-notes');
    textarea.value = school.notes || '';
  }

  // Event delegation for checklist
  document.getElementById('checklist-items').addEventListener('click', (e) => {
    if (window.__READONLY__) return;

    const toggleEl = e.target.closest('[data-action="toggle-check"]');
    if (toggleEl) {
      const itemEl = toggleEl.closest('.checklist__item');
      const itemId = itemEl.getAttribute('data-item-id');
      Store.toggleChecklistItem(schoolId, itemId);
      renderChecklist();
      renderInfo();
      return;
    }

    const deleteEl = e.target.closest('[data-action="delete-check"]');
    if (deleteEl) {
      const itemEl = deleteEl.closest('.checklist__item');
      const itemId = itemEl.getAttribute('data-item-id');
      Store.removeChecklistItem(schoolId, itemId);
      renderChecklist();
      renderInfo();
    }
  });

  // Keyboard support for checkboxes
  document.getElementById('checklist-items').addEventListener('keydown', (e) => {
    if (window.__READONLY__) return;
    if (e.key === ' ' || e.key === 'Enter') {
      const toggleEl = e.target.closest('[data-action="toggle-check"]');
      if (toggleEl) {
        e.preventDefault();
        toggleEl.click();
      }
    }
  });

  // Add checklist item
  document.querySelector('[data-action="add-checklist-item"]').addEventListener('click', () => {
    if (window.__READONLY__) return;

    const bodyHTML =
      '<div class="form-group">' +
        '<label class="input-label" for="modal-item-label">Item Label *</label>' +
        '<input class="input" type="text" id="modal-item-label" placeholder="e.g. Submit financial aid forms">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-item-due">Due Date (optional)</label>' +
        '<input class="input" type="date" id="modal-item-due">' +
      '</div>';

    Components.renderModal('Add Checklist Item', bodyHTML, (modal) => {
      const label = modal.querySelector('#modal-item-label').value.trim();
      if (!label) {
        Components.renderToast('Please enter an item label.', 'error');
        return false;
      }
      const dueDate = modal.querySelector('#modal-item-due').value || null;
      Store.addChecklistItem(schoolId, { label, dueDate });
      renderChecklist();
      renderInfo();
      Components.renderToast('Item added!', 'success');
    }, 'Add Item');
  });

  // Edit school info
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit-info"]');
    if (!editBtn) return;
    if (window.__READONLY__) return;

    const school = getSchool();
    if (!school) return;

    const bodyHTML =
      '<div class="form-group">' +
        '<label class="input-label" for="edit-name">School Name</label>' +
        '<input class="input" type="text" id="edit-name" value="' + Utils.escapeHTML(school.name) + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-location">Location</label>' +
        '<input class="input" type="text" id="edit-location" value="' + Utils.escapeHTML(school.location || '') + '" placeholder="e.g. Cambridge, MA">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-tuition">Tuition</label>' +
        '<input class="input" type="text" id="edit-tuition" value="' + Utils.escapeHTML(school.tuition || '') + '" placeholder="e.g. $57,986">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-rate">Acceptance Rate</label>' +
        '<input class="input" type="text" id="edit-rate" value="' + Utils.escapeHTML(school.acceptanceRate || '') + '" placeholder="e.g. 4%">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-deadline">Deadline</label>' +
        '<input class="input" type="date" id="edit-deadline" value="' + Utils.escapeHTML(school.deadline || '') + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-type">Application Type</label>' +
        '<select class="select" id="edit-type">' +
          '<option value="regular"' + (school.appType === 'regular' ? ' selected' : '') + '>Regular Decision</option>' +
          '<option value="early_decision"' + (school.appType === 'early_decision' ? ' selected' : '') + '>Early Decision</option>' +
          '<option value="early_action"' + (school.appType === 'early_action' ? ' selected' : '') + '>Early Action</option>' +
          '<option value="rolling"' + (school.appType === 'rolling' ? ' selected' : '') + '>Rolling</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="edit-category">Category</label>' +
        '<select class="select" id="edit-category">' +
          '<option value="reach"' + (school.category === 'reach' ? ' selected' : '') + '>Reach</option>' +
          '<option value="target"' + (school.category === 'target' ? ' selected' : '') + '>Target</option>' +
          '<option value="safety"' + (school.category === 'safety' ? ' selected' : '') + '>Safety</option>' +
        '</select>' +
      '</div>';

    Components.renderModal('Edit School Info', bodyHTML, (modal) => {
      Store.updateSchool(schoolId, {
        name: modal.querySelector('#edit-name').value.trim(),
        location: modal.querySelector('#edit-location').value.trim(),
        tuition: modal.querySelector('#edit-tuition').value.trim(),
        acceptanceRate: modal.querySelector('#edit-rate').value.trim(),
        deadline: modal.querySelector('#edit-deadline').value,
        appType: modal.querySelector('#edit-type').value,
        category: modal.querySelector('#edit-category').value
      });
      renderHeader();
      renderInfo();
      Components.renderToast('School info updated!', 'success');
    }, 'Save Changes');
  });

  // Notes auto-save
  const notesTextarea = document.getElementById('school-notes');
  const saveNotes = Utils.debounce(() => {
    Store.updateSchool(schoolId, { notes: notesTextarea.value });
  }, 500);
  notesTextarea.addEventListener('input', saveNotes);

  // Initial render
  const school = getSchool();
  if (!school) {
    document.querySelector('.container').innerHTML =
      '<div class="empty-state">' +
        '<h3 class="empty-state__title">School not found</h3>' +
        '<p class="empty-state__subtitle">This school may have been deleted.</p>' +
        '<a href="colleges.html" class="btn btn--primary">Back to Colleges</a>' +
      '</div>';
    return;
  }

  renderHeader();
  renderInfo();
  renderChecklist();
  renderNotes();
});