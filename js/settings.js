/* ============================================================
   settings.js — Settings Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = Store.getCurrentUser();
  if (!user) return;

  // Populate profile
  document.getElementById('settings-name').value = user.name || '';
  document.getElementById('settings-email').value = user.email || '';
  document.getElementById('settings-role').value = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  // Invite section visibility
  const inviteSection = document.getElementById('invite-section');
  const linkedSection = document.getElementById('linked-students-section');

  if (user.role === 'student') {
    inviteSection.style.display = '';
    linkedSection.style.display = 'none';

    // Show existing invite code
    if (user.inviteCode) {
      document.getElementById('invite-code').textContent = user.inviteCode;
    }
  } else {
    inviteSection.style.display = 'none';
    linkedSection.style.display = '';

    // Show linked students
    const list = document.getElementById('linked-students-list');
    if (user.linkedStudents && user.linkedStudents.length > 0) {
      list.innerHTML = user.linkedStudents.map(sid => {
        const student = Store.getUserById(sid);
        if (!student) return '';
        return '<div class="linked-student-item">' +
          '<div>' +
            '<div class="linked-student-name">' + Utils.escapeHTML(student.name) + '</div>' +
            '<div class="linked-student-email">' + Utils.escapeHTML(student.email) + '</div>' +
          '</div>' +
          '<button class="btn btn--ghost btn--sm" data-action="view-student" data-student-id="' + Utils.escapeHTML(student.id) + '">View Tracker</button>' +
        '</div>';
      }).join('');
    } else {
      list.innerHTML = '<p style="font-size:var(--font-size-body-sm);color:var(--color-text-secondary);padding:var(--space-4) 0;">No linked students. Enter an invite code when signing up to link to a student.</p>';
    }
  }

  // Profile form
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('settings-name').value.trim();
    if (!name) {
      Components.renderToast('Name is required.', 'error');
      return;
    }
    Store.updateUser(user.id, { name: name });
    Components.renderToast('Profile updated!', 'success');
    // Re-render navbar
    const currentPage = window.location.pathname.split('/').pop();
    Components.renderNavbar('settings');
  });

  // Password form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('password-error');
    errorEl.style.display = 'none';

    const currentPw = document.getElementById('current-password').value;
    const newPw = document.getElementById('new-password').value;

    if (newPw.length < 6) {
      errorEl.textContent = 'New password must be at least 6 characters.';
      errorEl.style.display = 'flex';
      return;
    }

    const currentHash = await Auth._hashPassword(currentPw);
    if (currentHash !== user.passwordHash) {
      errorEl.textContent = 'Current password is incorrect.';
      errorEl.style.display = 'flex';
      return;
    }

    const newHash = await Auth._hashPassword(newPw);
    Store.updateUser(user.id, { passwordHash: newHash });
    Components.renderToast('Password updated!', 'success');
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
  });

  // Generate invite code
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="generate-invite"]');
    if (btn) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      Store.updateUser(user.id, { inviteCode: code });
      document.getElementById('invite-code').textContent = code;
      Components.renderToast('Invite code generated! Share "' + code + '" with your parent or counselor.', 'success');
      return;
    }

    const viewBtn = e.target.closest('[data-action="view-student"]');
    if (viewBtn) {
      const studentId = viewBtn.getAttribute('data-student-id');
      const session = Store.getSession();
      session.viewingStudentId = studentId;
      Store.setSession(session);
      window.location.href = 'dashboard.html';
    }
  });
});