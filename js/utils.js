/* ============================================================
   utils.js — Utility Functions
   ============================================================ */

const Utils = {
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  },

  formatDateShort(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate();
  },

  daysUntil(isoString) {
    if (!isoString) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(isoString + 'T00:00:00');
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  isOverdue(isoString) {
    if (!isoString) return false;
    return Utils.daysUntil(isoString) < 0;
  },

  calcCompletion(checklist) {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  },

  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
  },

  debounce(fn, ms) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  },

  sortByDate(arr, key, ascending) {
    if (typeof ascending === 'undefined') ascending = true;
    return [...arr].sort((a, b) => {
      const dateA = a[key] ? new Date(a[key]) : new Date('9999-12-31');
      const dateB = b[key] ? new Date(b[key]) : new Date('9999-12-31');
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  getStatusLabel(status) {
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'submitted': 'Submitted',
      'drafting': 'Drafting',
      'revising': 'Revising',
      'final': 'Final'
    };
    return labels[status] || status;
  },

  getStatusBadgeClass(status) {
    const classes = {
      'not_started': 'badge--not-started',
      'in_progress': 'badge--in-progress',
      'submitted': 'badge--submitted',
      'drafting': 'badge--drafting',
      'revising': 'badge--revising',
      'final': 'badge--final',
      'accepted': 'badge--accepted',
      'rejected': 'badge--rejected',
      'waitlisted': 'badge--waitlisted',
      'deferred': 'badge--deferred',
      'committed': 'badge--committed'
    };
    return classes[status] || 'badge--not-started';
  },

  getAppTypeLabel(type) {
    const labels = {
      'early_decision': 'Early Decision',
      'early_action': 'Early Action',
      'regular': 'Regular',
      'rolling': 'Rolling'
    };
    return labels[type] || type;
  },

  getAppTypeBadgeClass(type) {
    const classes = {
      'early_decision': 'badge--ed',
      'early_action': 'badge--ea',
      'regular': 'badge--regular',
      'rolling': 'badge--rolling'
    };
    return classes[type] || 'badge--regular';
  },

  getCategoryLabel(cat) {
    const labels = {
      'reach': 'Reach',
      'target': 'Target',
      'safety': 'Safety'
    };
    return labels[cat] || cat;
  },

  getOutcomeLabel(outcome) {
    const labels = {
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'waitlisted': 'Waitlisted',
      'deferred': 'Deferred'
    };
    return labels[outcome] || '—';
  },

  todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
};