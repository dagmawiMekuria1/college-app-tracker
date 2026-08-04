/* ============================================================
   dashboard.js — Dashboard Data & Rendering
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  function render() {
    const schools = Store.getSchools();
    const total = schools.length;
    const submitted = schools.filter(s => s.status === 'submitted').length;
    const open = total - submitted;

    // Stats
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-submitted').textContent = submitted;
    document.getElementById('stat-open').textContent = open;

    // Overall completion
    let overallCompletion = 0;
    if (total > 0) {
      const nonSubmitted = schools.filter(s => s.status !== 'submitted');
      if (nonSubmitted.length > 0) {
        const totalCompletion = nonSubmitted.reduce((sum, s) => sum + Utils.calcCompletion(s.checklist), 0);
        overallCompletion = Math.round(totalCompletion / nonSubmitted.length);
      } else {
        overallCompletion = 100;
      }
    }

    document.getElementById('progress-pct').textContent = overallCompletion + '%';
    const fill = document.getElementById('progress-fill');
    fill.style.width = overallCompletion + '%';
    if (overallCompletion >= 100) {
      fill.classList.add('progress__fill--complete');
    } else {
      fill.classList.remove('progress__fill--complete');
    }

    // Next deadline
    const allDeadlines = [];
    schools.forEach(school => {
      if (school.deadline && school.status !== 'submitted') {
        allDeadlines.push({ school: school.name, task: 'Application deadline', date: school.deadline, type: 'school' });
      }
      (school.checklist || []).forEach(item => {
        if (item.dueDate && !item.completed) {
          allDeadlines.push({ school: school.name, task: item.label, date: item.dueDate, type: 'checklist' });
        }
      });
    });

    allDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Next deadline stat
    const nextDeadline = allDeadlines.find(d => Utils.daysUntil(d.date) >= 0);
    document.getElementById('stat-next').textContent = nextDeadline ? Utils.formatDateShort(nextDeadline.date) : '—';

    // Next 7 days
    const upcoming = allDeadlines.filter(d => {
      const days = Utils.daysUntil(d.date);
      return days >= 0 && days <= 7;
    });

    // Also include overdue items
    const overdue = allDeadlines.filter(d => Utils.isOverdue(d.date));

    const deadlineListEl = document.getElementById('deadline-list');
    const combined = [...overdue, ...upcoming];

    if (combined.length === 0) {
      deadlineListEl.innerHTML =
        '<div class="empty-state empty-state--compact">' +
          '<p class="empty-state__title">No upcoming deadlines</p>' +
          '<p class="empty-state__subtitle">Deadlines within the next 7 days will appear here.</p>' +
        '</div>';
    } else {
      // Deduplicate
      const seen = new Set();
      const unique = combined.filter(d => {
        const key = d.school + d.task + d.date;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      unique.sort((a, b) => new Date(a.date) - new Date(b.date));

      deadlineListEl.innerHTML = unique.map(d => {
        const isOverdue = Utils.isOverdue(d.date);
        const daysLeft = Utils.daysUntil(d.date);
        let dateLabel = Utils.formatDateShort(d.date);
        if (isOverdue) dateLabel = 'Overdue';
        else if (daysLeft === 0) dateLabel = 'Today';
        else if (daysLeft === 1) dateLabel = 'Tomorrow';

        return '<div class="deadline-item">' +
          '<span class="deadline-item__school">' + Utils.escapeHTML(d.school) + '</span>' +
          '<span class="deadline-item__task">' + Utils.escapeHTML(d.task) + '</span>' +
          '<span class="deadline-item__date' + (isOverdue ? ' deadline-item__date--overdue' : '') + '">' + dateLabel + '</span>' +
        '</div>';
      }).join('');
    }
  }

  render();
});