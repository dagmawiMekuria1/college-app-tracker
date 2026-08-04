/* ============================================================
   recommendations.js — Recommendation CRUD
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  function render() {
    const recs = Store.getRecommendations();
    const tbody = document.getElementById('recs-tbody');
    const cardList = document.getElementById('recs-card-list');
    const emptyEl = document.getElementById('recs-empty');
    const tableWrapper = document.getElementById('recs-table-wrapper');

    if (recs.length === 0) {
      emptyEl.style.display = '';
      tableWrapper.style.display = 'none';
      cardList.innerHTML = '';
      return;
    }

    emptyEl.style.display = 'none';
    tableWrapper.style.display = '';

    // Table
    tbody.innerHTML = recs.map(rec => {
      const schools = (rec.schoolIds || []).map(id => Store.getSchoolById(id)).filter(Boolean);
      const schoolTags = schools.map(s => '<span class="rec-school-tag">' + Utils.escapeHTML(s.name) + '</span>').join(' ');

      return '<tr data-id="' + Utils.escapeHTML(rec.id) + '">' +
        '<td>' + Utils.escapeHTML(rec.teacherName) + '</td>' +
        '<td>' + Utils.escapeHTML(rec.subject || '—') + '</td>' +
        '<td>' + Utils.formatDate(rec.dateAsked) + '</td>' +
        '<td>' + (schoolTags || '—') + '</td>' +
        '<td>' +
          (rec.submitted ?
            '<span class="table__submitted-check"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Submitted</span>' :
            '<span class="table__submitted-pending">Pending</span>') +
        '</td>' +
        '<td class="table__actions">' +
          '<button class="btn btn--ghost btn--sm btn--edit" data-action="edit-rec" data-id="' + Utils.escapeHTML(rec.id) + '">Edit</button>' +
          '<button class="btn btn--ghost btn--sm btn--delete" data-action="delete-rec" data-id="' + Utils.escapeHTML(rec.id) + '" style="color:var(--color-danger-500);">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    // Mobile cards
    cardList.innerHTML = recs.map(rec => {
      const schools = (rec.schoolIds || []).map(id => Store.getSchoolById(id)).filter(Boolean);
      const schoolTags = schools.map(s => '<span class="rec-school-tag">' + Utils.escapeHTML(s.name) + '</span>').join(' ');

      return '<div class="card card--rec" data-id="' + Utils.escapeHTML(rec.id) + '">' +
        '<div class="card--rec__header">' +
          '<div><span class="card--rec__name">' + Utils.escapeHTML(rec.teacherName) + '</span>' +
          (rec.subject ? '<div class="card--rec__subject">' + Utils.escapeHTML(rec.subject) + '</div>' : '') +
          '</div>' +
          '<span class="badge ' + (rec.submitted ? 'badge--submitted' : 'badge--not-started') + '">' + (rec.submitted ? 'Submitted' : 'Pending') + '</span>' +
        '</div>' +
        '<div class="card--rec__detail">Asked: ' + Utils.formatDate(rec.dateAsked) + '</div>' +
        (schools.length > 0 ? '<div class="card--rec__schools">' + schoolTags + '</div>' : '') +
        '<div class="card--rec__footer">' +
          '<div></div>' +
          '<div style="display:flex;gap:var(--space-2);">' +
            '<button class="btn btn--ghost btn--sm btn--edit" data-action="edit-rec" data-id="' + Utils.escapeHTML(rec.id) + '">Edit</button>' +
            '<button class="btn btn--ghost btn--sm btn--delete" data-action="delete-rec" data-id="' + Utils.escapeHTML(rec.id) + '" style="color:var(--color-danger-500);">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function showAddEditModal(rec) {
    const isEdit = !!rec;
    const title = isEdit ? 'Edit Recommendation' : 'Add Recommendation';

    const bodyHTML =
      '<div class="form-group">' +
        '<label class="input-label" for="modal-rec-teacher">Teacher Name *</label>' +
        '<input class="input" type="text" id="modal-rec-teacher" value="' + (isEdit ? Utils.escapeHTML(rec.teacherName) : '') + '" placeholder="e.g. Mr. Smith">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-rec-subject">Subject</label>' +
        '<input class="input" type="text" id="modal-rec-subject" value="' + (isEdit ? Utils.escapeHTML(rec.subject || '') : '') + '" placeholder="e.g. AP Physics">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-rec-date">Date Asked</label>' +
        '<input class="input" type="date" id="modal-rec-date" value="' + (isEdit ? (rec.dateAsked || '') : Utils.todayISO()) + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label">Linked Schools</label>' +
        Components.getSchoolMultiSelectHTML(isEdit ? rec.schoolIds : []) +
      '</div>' +
      '<div class="form-group">' +
        '<label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;font-size:var(--font-size-body-sm);">' +
          '<input type="checkbox" id="modal-rec-submitted"' + (isEdit && rec.submitted ? ' checked' : '') + ' style="width:16px;height:16px;"> Submitted' +
        '</label>' +
      '</div>';

    Components.renderModal(title, bodyHTML, (modal) => {
      const teacherName = modal.querySelector('#modal-rec-teacher').value.trim();
      if (!teacherName) {
        Components.renderToast('Please enter a teacher name.', 'error');
        return false;
      }

      const subject = modal.querySelector('#modal-rec-subject').value.trim();
      const dateAsked = modal.querySelector('#modal-rec-date').value;
      const submitted = modal.querySelector('#modal-rec-submitted').checked;
      const selectedSchools = Array.from(modal.querySelectorAll('input[name="schoolIds"]:checked')).map(cb => cb.value);

      if (isEdit) {
        Store.updateRec(rec.id, { teacherName, subject, dateAsked, schoolIds: selectedSchools, submitted });
        Components.renderToast('Recommendation updated!', 'success');
      } else {
        const newRec = Store.addRec({ teacherName, subject, dateAsked, schoolIds: selectedSchools });
        if (submitted) Store.updateRec(newRec.id, { submitted: true });
        Components.renderToast('Recommendation added!', 'success');
      }
      render();
    }, isEdit ? 'Save Changes' : 'Add Recommendation');
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-rec"]');
    if (addBtn) {
      showAddEditModal(null);
      return;
    }

    const editBtn = e.target.closest('[data-action="edit-rec"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const rec = Store.getRecommendationById(id);
      if (rec) showAddEditModal(rec);
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete-rec"]');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      Components.renderConfirmDialog('Are you sure you want to delete this recommendation?', () => {
        Store.deleteRec(id);
        Components.renderToast('Recommendation deleted.', 'info');
        render();
      });
    }
  });

  render();
});