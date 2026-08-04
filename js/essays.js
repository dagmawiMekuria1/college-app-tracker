/* ============================================================
   essays.js — Essay CRUD & Management
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  function render() {
    const essays = Store.getEssays();
    const listEl = document.getElementById('essay-list');
    const emptyEl = document.getElementById('essays-empty');

    if (essays.length === 0) {
      emptyEl.style.display = '';
      listEl.innerHTML = '';
      return;
    }

    emptyEl.style.display = 'none';

    listEl.innerHTML = essays.map(essay => {
      const schools = (essay.schoolIds || []).map(id => Store.getSchoolById(id)).filter(Boolean);
      const schoolNames = schools.map(s => s.name);
      const wordCount = essay.draft ? essay.draft.trim().split(/\s+/).filter(w => w).length : 0;

      return '<div class="card card--essay" data-id="' + Utils.escapeHTML(essay.id) + '">' +
        '<div class="card--essay__header">' +
          '<div>' +
            '<div class="card--essay__prompt">' + Utils.escapeHTML(essay.prompt || 'Untitled Essay') + '</div>' +
            '<div class="card--essay__meta">' +
              '<span>Word limit: ' + (essay.wordLimit || '—') + '</span>' +
              (schoolNames.length > 0 ? '<span>' + schoolNames.length + ' school' + (schoolNames.length > 1 ? 's' : '') + '</span>' : '') +
              '<span>' + wordCount + ' words written</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        (schoolNames.length > 0 ? '<div class="essay-schools">' + schoolNames.map(n => '<span class="essay-school-tag">' + Utils.escapeHTML(n) + '</span>').join('') + '</div>' : '') +
        '<div class="card--essay__footer">' +
          '<span class="badge ' + Utils.getStatusBadgeClass(essay.status) + '">' + Utils.escapeHTML(Utils.getStatusLabel(essay.status)) + '</span>' +
          '<div class="card--essay__actions">' +
            '<button class="btn btn--ghost btn--sm btn--edit" data-action="edit-essay" data-id="' + Utils.escapeHTML(essay.id) + '">Edit</button>' +
            '<button class="btn btn--ghost btn--sm btn--delete" data-action="delete-essay" data-id="' + Utils.escapeHTML(essay.id) + '" style="color:var(--color-danger-500);">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function showAddEditModal(essay) {
    const isEdit = !!essay;
    const title = isEdit ? 'Edit Essay' : 'Add Essay';
    const schools = Store.getSchools();

    const bodyHTML =
      '<div class="form-group">' +
        '<label class="input-label" for="modal-essay-prompt">Prompt *</label>' +
        '<textarea class="textarea" id="modal-essay-prompt" placeholder="Describe a challenge you overcame..." style="min-height:80px;">' + (isEdit ? Utils.escapeHTML(essay.prompt) : '') + '</textarea>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-essay-limit">Word Limit</label>' +
        '<input class="input" type="number" id="modal-essay-limit" value="' + (isEdit ? essay.wordLimit : 650) + '" min="1">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label">Status</label>' +
        '<select class="select" id="modal-essay-status">' +
          '<option value="not_started"' + (isEdit && essay.status === 'not_started' ? ' selected' : '') + '>Not Started</option>' +
          '<option value="drafting"' + (isEdit && essay.status === 'drafting' ? ' selected' : '') + '>Drafting</option>' +
          '<option value="revising"' + (isEdit && essay.status === 'revising' ? ' selected' : '') + '>Revising</option>' +
          '<option value="final"' + (isEdit && essay.status === 'final' ? ' selected' : '') + '>Final</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label">Linked Schools</label>' +
        Components.getSchoolMultiSelectHTML(isEdit ? essay.schoolIds : []) +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-essay-draft">Draft</label>' +
        '<textarea class="textarea essay-draft__textarea" id="modal-essay-draft" placeholder="Paste or type your essay draft here...">' + (isEdit ? Utils.escapeHTML(essay.draft || '') : '') + '</textarea>' +
      '</div>';

    Components.renderModal(title, bodyHTML, (modal) => {
      const prompt = modal.querySelector('#modal-essay-prompt').value.trim();
      if (!prompt) {
        Components.renderToast('Please enter a prompt.', 'error');
        return false;
      }

      const wordLimit = parseInt(modal.querySelector('#modal-essay-limit').value) || 650;
      const status = modal.querySelector('#modal-essay-status').value;
      const draft = modal.querySelector('#modal-essay-draft').value;
      const selectedSchools = Array.from(modal.querySelectorAll('input[name="schoolIds"]:checked')).map(cb => cb.value);

      if (isEdit) {
        Store.updateEssay(essay.id, { prompt, wordLimit, status, draft, schoolIds: selectedSchools });
        Components.renderToast('Essay updated!', 'success');
      } else {
        const newEssay = Store.addEssay({ prompt, wordLimit, schoolIds: selectedSchools });
        Store.updateEssay(newEssay.id, { status, draft });
        Components.renderToast('Essay added!', 'success');
      }
      render();
    }, isEdit ? 'Save Changes' : 'Add Essay');
  }

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-essay"]');
    if (addBtn) {
      showAddEditModal(null);
      return;
    }

    const editBtn = e.target.closest('[data-action="edit-essay"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const essay = Store.getEssayById(id);
      if (essay) showAddEditModal(essay);
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete-essay"]');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      Components.renderConfirmDialog('Are you sure you want to delete this essay?', () => {
        Store.deleteEssay(id);
        Components.renderToast('Essay deleted.', 'info');
        render();
      });
    }
  });

  render();
});