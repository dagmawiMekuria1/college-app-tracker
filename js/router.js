/* ============================================================
   router.js — Page Guard & Read-Only Mode
   ============================================================ */

(function() {
  const session = Store.getSession();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // If on auth page and logged in, redirect
  if (currentPage === 'index.html' || currentPage === '') {
    return; // Auth page handles its own redirect
  }

  // If not logged in, redirect to auth
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  const user = Store.getCurrentUser();
  if (!user) {
    Store.clearSession();
    window.location.href = 'index.html';
    return;
  }

  // Set read-only flag
  window.__READONLY__ = user.role !== 'student';

  if (window.__READONLY__) {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('readonly');

      // Render read-only banner
      const bannerEl = document.getElementById('readonly-banner');
      if (bannerEl) {
        const viewingStudent = Store.getUserById(Store.getViewingStudentId());
        const studentName = viewingStudent ? viewingStudent.name : 'Student';
        bannerEl.className = 'readonly-banner';
        bannerEl.innerHTML = '<span>\uD83D\uDC41 Viewing ' + Utils.escapeHTML(studentName) + '\'s tracker &mdash; Read Only</span>';
      }
    });
  }
})();