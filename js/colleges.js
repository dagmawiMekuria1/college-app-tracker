/* ============================================================
   colleges.js — Colleges List Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  let sortField = 'deadline';
  let sortAsc = true;
  let filterStatus = 'all';
  let filterCategory = 'all';

  function getFilteredSchools() {
    let schools = Store.getSchools();

    if (filterStatus !== 'all') {
      schools = schools.filter(s => s.status === filterStatus);
    }
    if (filterCategory !== 'all') {
      schools = schools.filter(s => s.category === filterCategory);
    }

    if (sortField === 'deadline') {
      schools = Utils.sortByDate(schools, 'deadline', sortAsc);
    } else if (sortField === 'name') {
      schools.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return sortAsc ? cmp : -cmp;
      });
    }

    return schools;
  }

  function render() {
    const schools = getFilteredSchools();
    const tbody = document.getElementById('colleges-tbody');
    const cardList = document.getElementById('colleges-card-list');
    const emptyState = document.getElementById('colleges-empty');
    const tableWrapper = document.getElementById('colleges-table-wrapper');

    if (schools.length === 0) {
      const allSchools = Store.getSchools();
      if (allSchools.length === 0) {
        emptyState.style.display = '';
        tableWrapper.style.display = 'none';
        cardList.innerHTML = '';
      } else {
        emptyState.style.display = 'none';
        tableWrapper.style.display = '';
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-8);color:var(--color-text-secondary);">No schools match the current filters.</td></tr>';
        cardList.innerHTML = '<div class="empty-state empty-state--compact"><p class="empty-state__title">No schools match filters</p></div>';
      }
      return;
    }

    emptyState.style.display = 'none';
    tableWrapper.style.display = '';

    // Table view
    tbody.innerHTML = schools.map(school => {
      const completion = school.status === 'submitted' ? 100 : Utils.calcCompletion(school.checklist);
      const deadlineOverdue = school.deadline && Utils.isOverdue(school.deadline) && school.status !== 'submitted';

      return '<tr data-id="' + Utils.escapeHTML(school.id) + '">' +
        '<td><span class="table__school-name"><span class="dot dot--' + Utils.escapeHTML(school.category) + '"></span>' + Utils.escapeHTML(school.name) + '</span></td>' +
        '<td class="' + (deadlineOverdue ? 'table__deadline--overdue' : '') + '">' + Utils.formatDate(school.deadline) + '</td>' +
        '<td><span class="badge ' + Utils.getAppTypeBadgeClass(school.appType) + '">' + Utils.escapeHTML(Utils.getAppTypeLabel(school.appType)) + '</span></td>' +
        '<td><span class="badge ' + Utils.getStatusBadgeClass(school.status) + '">' + Utils.escapeHTML(Utils.getStatusLabel(school.status)) + '</span>' +
          (school.outcome ? ' <span class="badge ' + Utils.getStatusBadgeClass(school.outcome) + '">' + Utils.escapeHTML(Utils.getOutcomeLabel(school.outcome)) + '</span>' : '') +
          (school.committed ? ' <span class="badge badge--committed">Committed</span>' : '') +
        '</td>' +
        '<td><div class="table__progress"><div class="progress"><div class="progress__fill' + (completion >= 100 ? ' progress__fill--complete' : '') + '" style="width:' + completion + '%"></div></div><span class="table__progress-label">' + completion + '%</span></div></td>' +
        '<td class="table__actions"><a href="school-detail.html?id=' + Utils.escapeHTML(school.id) + '" class="btn btn--ghost btn--sm">View</a></td>' +
      '</tr>';
    }).join('');

    // Card view (mobile)
    cardList.innerHTML = schools.map(school => {
      const completion = school.status === 'submitted' ? 100 : Utils.calcCompletion(school.checklist);
      const deadlineOverdue = school.deadline && Utils.isOverdue(school.deadline) && school.status !== 'submitted';

      return '<a href="school-detail.html?id=' + Utils.escapeHTML(school.id) + '" class="card card--clickable card--school' + (deadlineOverdue ? ' card--school--overdue' : '') + '" data-id="' + Utils.escapeHTML(school.id) + '">' +
        '<div class="card--school__header"><span class="dot dot--' + Utils.escapeHTML(school.category) + '"></span><span class="card--school__name">' + Utils.escapeHTML(school.name) + '</span></div>' +
        '<div class="card--school__type">' + Utils.escapeHTML(Utils.getAppTypeLabel(school.appType)) + '</div>' +
        '<div class="card--school__detail">Deadline: ' + Utils.formatDate(school.deadline) + '</div>' +
        '<div class="card--school__progress"><div class="progress" style="flex:1;"><div class="progress__fill' + (completion >= 100 ? ' progress__fill--complete' : '') + '" style="width:' + completion + '%"></div></div><span class="card--school__progress-label">' + completion + '%</span></div>' +
        '<div class="card--school__status"><span class="badge ' + Utils.getStatusBadgeClass(school.status) + '">' + Utils.escapeHTML(Utils.getStatusLabel(school.status)) + '</span>' +
          (school.outcome ? ' <span class="badge ' + Utils.getStatusBadgeClass(school.outcome) + '">' + Utils.escapeHTML(Utils.getOutcomeLabel(school.outcome)) + '</span>' : '') +
          (school.committed ? ' <span class="badge badge--committed">Committed</span>' : '') +
        '</div>' +
      '</a>';
    }).join('');
  }

  function showAddSchoolModal() {
    const bodyHTML =
      '<div class="form-group">' +
        '<label class="input-label" for="modal-school-name">School Name *</label>' +
        '<input class="input" type="text" id="modal-school-name" placeholder="e.g. MIT" required>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-school-deadline">Application Deadline</label>' +
        '<input class="input" type="date" id="modal-school-deadline">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-school-type">Application Type</label>' +
        '<select class="select" id="modal-school-type">' +
          '<option value="regular">Regular Decision</option>' +
          '<option value="early_decision">Early Decision</option>' +
          '<option value="early_action">Early Action</option>' +
          '<option value="rolling">Rolling</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="input-label" for="modal-school-category">Category</label>' +
        '<select class="select" id="modal-school-category">' +
          '<option value="target">Target</option>' +
          '<option value="reach">Reach</option>' +
          '<option value="safety">Safety</option>' +
        '</select>' +
      '</div>';

    Components.renderModal('Add College', bodyHTML, (modal) => {
      const name = modal.querySelector('#modal-school-name').value.trim();
      if (!name) {
        Components.renderToast('Please enter a school name.', 'error');
        return false;
      }
      const deadline = modal.querySelector('#modal-school-deadline').value;
      const appType = modal.querySelector('#modal-school-type').value;
      const category = modal.querySelector('#modal-school-category').value;

      Store.addSchool({ name, deadline, appType, category });
      Components.renderToast(name + ' added!', 'success');
      render();
    }, 'Add College');
  }

  // Event listeners
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-school"]');
    if (addBtn) {
      showAddSchoolModal();
      return;
    }

    // Table row click
    const row = e.target.closest('tr[data-id]');
    if (row && !e.target.closest('a, button')) {
      window.location.href = 'school-detail.html?id=' + row.getAttribute('data-id');
    }
  });

  // Sort
  document.querySelectorAll('.table__sortable').forEach(el => {
    el.addEventListener('click', () => {
      const field = el.getAttribute('data-sort');
      if (sortField === field) {
        sortAsc = !sortAsc;
      } else {
        sortField = field;
        sortAsc = true;
      }
      render();
    });
  });

  // Filters
  document.getElementById('filter-status').addEventListener('change', (e) => {
    filterStatus = e.target.value;
    render();
  });

  document.getElementById('filter-category').addEventListener('change', (e) => {
    filterCategory = e.target.value;
    render();
  });

  render();
});