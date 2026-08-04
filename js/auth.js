/* ============================================================
   auth.js — Authentication (simulated via localStorage)
   ============================================================ */

const Auth = {
  async _hashPassword(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback for environments without crypto.subtle
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'fallback_' + Math.abs(hash).toString(16);
    }
  },

  async signUp(email, password, role, name, inviteCode) {
    const existing = Store.getUserByEmail(email);
    if (existing) {
      return { error: 'An account with this email already exists.' };
    }

    const passwordHash = await this._hashPassword(password);
    const user = {
      id: Utils.generateId(),
      email: email.toLowerCase().trim(),
      passwordHash: passwordHash,
      name: name.trim(),
      role: role,
      linkedStudents: [],
      inviteCode: null,
      createdAt: new Date().toISOString()
    };

    // Link parent/counselor to student via invite code
    if ((role === 'parent' || role === 'counselor') && inviteCode) {
      const students = Store.getUsers().filter(u => u.role === 'student' && u.inviteCode === inviteCode.toUpperCase());
      if (students.length === 0) {
        return { error: 'Invalid invite code. Ask the student to generate one in Settings.' };
      }
      user.linkedStudents = students.map(s => s.id);
    }

    Store.addUser(user);
    Store.setSession({ userId: user.id, viewingStudentId: role === 'student' ? user.id : (user.linkedStudents[0] || null) });

    return { user: user };
  },

  async signIn(email, password) {
    const user = Store.getUserByEmail(email);
    if (!user) {
      return { error: 'No account found with this email.' };
    }

    const passwordHash = await this._hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { error: 'Incorrect password.' };
    }

    const viewingStudentId = user.role === 'student' ? user.id : (user.linkedStudents && user.linkedStudents[0] || null);
    Store.setSession({ userId: user.id, viewingStudentId: viewingStudentId });

    return { user: user };
  },

  signOut() {
    Store.clearSession();
    window.location.href = 'index.html';
  },

  getCurrentSession() {
    return Store.getSession();
  },

  isReadOnly() {
    const user = Store.getCurrentUser();
    if (!user) return true;
    return user.role !== 'student';
  }
};