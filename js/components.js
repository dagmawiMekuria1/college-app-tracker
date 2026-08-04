/* ============================================================
   components.js — Shared UI Components
   ============================================================ */

const Components = {
  renderNavbar(activePage) {
    const navEl = document.getElementById('navbar');
    if (!navEl) return;

    const user = Store.getCurrentUser();
    if (!user) return;

    const initials = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const links = [
      { page: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
      { page: 'colleges', label: 'My Colleges', href: 'colleges.html', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>' },
      { page: 'essays', label: 'Essays', href: 'essays.html', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
      { page: 'recommendations', label: 'Recs', href: 'recommendations.html', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' },
      { page: 'calendar', label: 'Calendar', href: 'calendar.html', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' }
    ];

    const desktopLinks = links.map(link => {
      const isActive = activePage === link.page;
      return '<a href="' + link.href + '" class="nav__link' + (isActive ? ' nav__link--active' : '') + '">' +
        link.icon + ' ' + Utils.escapeHTML(link.label) + '</a>';
    }).join('');

    const mobileLinks = links.map(link => {
      const isActive = activePage === link.page;
      return '<a href="' + link.href + '" class="mobile-nav__link' + (isActive ? ' mobile-nav__link--active' : '') + '">' +
        link.icon + ' ' + Utils.escapeHTML(link.label) + '</a>';
    }).join('');

    navEl.className = 'navbar';
    navEl.innerHTML =
      '<a href="dashboard.html" class="navbar__brand">CollegeTracker</a>' +
      '<div class="navbar__links">' + desktopLinks + '</div>' +
      '<div class="navbar__user">' +
        '<div class="navbar__avatar">' + Utils.escapeHTML(initials) + '</div>' +
        '<span class="navbar__username">' + Utils.escapeHTML(user.name) + '</span>' +
        '<a href="settings.html" class="btn btn--icon" aria-label="Settings"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></a>' +
        '<button class="btn btn--icon" aria-label="Sign out" data-action="signout"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>' +
      '</div>' +
      '<button class="navbar__hamburger" aria-label="Menu">' +
        '<span class="hamburger__line"></span>' +
        '<span class="hamburger__line"></span>' +
        '<span class="hamburger__line"></span>' +
      '</button>' +
      '<div class="mobile-nav" id="mobile-nav">' +
        mobileLinks +
        '<div class="mobile-nav__footer">' +
          '<span style="font-size:var(--font-size-body-sm);color:var(--color-text-secondary);">' + Utils.escapeHTML(user.name) + '</span>' +
          '<div style="display:flex;gap:var(--space-2);">' +
            '<a href="settings.html" class="btn btn--ghost btn--sm">Settings</a>' +
            '<button class="btn btn--ghost btn--sm" data-action="signout" style="color:var(--color-danger-500);">Sign Out</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Hamburger toggle
    const hamburger = navEl.querySelector('.navbar__hamburger');
    const mobileNav = navEl.querySelector('#mobile-nav');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('hamburger--open');
        mobileNav.classList.toggle('mobile-nav--open');
      });
    }

    // Sign out handler
    navEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="signout"]');
      if (btn) {
        e.preventDefault();
        Auth.signOut();
      }
    });
  },

  renderModal(title, bodyHTML, onConfirm, confirmText, confirmClass) {
    confirmText = confirmText || 'Save';
    confirmClass = confirmClass || 'btn--primary';
    const root = document.getElementById('modal-root');
    if (!root) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title);

    modal.innerHTML =
      '<div class="modal__header">' +
        '<h2 class="modal__title">' + Utils.escapeHTML(title) + '</h2>' +
        '<button class="modal__close" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal__body">' + bodyHTML + '</div>' +
      '<div class="modal__footer">' +
        '<button class="btn btn--secondary" data-modal-action="cancel">Cancel</button>' +
        '<button class="btn ' + confirmClass + '" data-modal-action="confirm">' + Utils.escapeHTML(confirmText) + '</button>' +
      '</div>';

    overlay.appendChild(modal);
    root.appendChild(overlay);

    function closeModal() {
      overlay.classList.add('modal-overlay--closing');
      modal.classList.add('modal--closing');
      setTimeout(() => {
        if (root.contains(overlay)) root.removeChild(overlay);
      }, 100);
    }

    // Close handlers
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    modal.querySelector('[data-modal-action="cancel"]').addEventListener('click', closeModal);

    modal.querySelector('[data-modal-action="confirm"]').addEventListener('click', () => {
      if (onConfirm) {
        const result = onConfirm(modal);
        if (result !== false) closeModal();
      } else {
        closeModal();
      }
    });

    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onEsc);
      }
    });

    // Focus first input or close button
    requestAnimationFrame(() => {
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) firstInput.focus();
      else modal.querySelector('.modal__close').focus();
    });

    return { close: closeModal, modal: modal, overlay: overlay };
  },

  renderConfirmDialog(message, onYes) {
    return Components.renderModal(
      'Confirm',
      '<p class="confirm-dialog__message">' + Utils.escapeHTML(message) + '</p>',
      onYes,
      'Delete',
      'btn--danger'
    );
  },

  renderToast(message, type) {
    type = type || 'success';
    const root = document.getElementById('toast-root');
    if (!root) return;

    const icons = {
      success: '<svg class="toast__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg class="toast__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      info: '<svg class="toast__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML = (icons[type] || icons.info) + '<span>' + Utils.escapeHTML(message) + '</span>';

    root.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--exiting');
      setTimeout(() => {
        if (root.contains(toast)) root.removeChild(toast);
      }, 200);
    }, 3000);
  },

  renderEmptyState(iconSVG, title, subtitle, ctaText, ctaAction) {
    let html = '<div class="empty-state">';
    if (iconSVG) html += iconSVG;
    html += '<h3 class="empty-state__title">' + Utils.escapeHTML(title) + '</h3>';
    html += '<p class="empty-state__subtitle">' + Utils.escapeHTML(subtitle) + '</p>';
    if (ctaText) {
      html += '<button class="btn btn--primary btn--add" data-action="' + Utils.escapeHTML(ctaAction || '') + '">' + Utils.escapeHTML(ctaText) + '</button>';
    }
    html += '</div>';
    return html;
  },

  getSchoolMultiSelectHTML(selectedIds) {
    selectedIds = selectedIds || [];
    const schools = Store.getSchools();
    if (schools.length === 0) {
      return '<p style="font-size:var(--font-size-caption);color:var(--color-text-secondary);">No schools added yet.</p>';
    }
    let html = '<div class="school-multiselect" style="max-height:160px;overflow-y:auto;border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-2);">';
    schools.forEach(school => {
      const checked = selectedIds.includes(school.id) ? 'checked' : '';
      html += '<label style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1) var(--space-2);cursor:pointer;font-size:var(--font-size-body-sm);">' +
        '<input type="checkbox" name="schoolIds" value="' + Utils.escapeHTML(school.id) + '" ' + checked + ' style="width:16px;height:16px;">' +
        Utils.escapeHTML(school.name) +
      '</label>';
    });
    html += '</div>';
    return html;
  }
};

// Auto-render navbar on page load
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'index.html' && currentPage !== '') {
    const pageMap = {
      'dashboard.html': 'dashboard',
      'colleges.html': 'colleges',
      'school-detail.html': 'colleges',
      'essays.html': 'essays',
      'recommendations.html': 'recommendations',
      'calendar.html': 'calendar',
      'settings.html': 'settings'
    };
    Components.renderNavbar(pageMap[currentPage] || '');
  }
});