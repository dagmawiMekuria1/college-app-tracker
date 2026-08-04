/* ============================================================
   store.js — localStorage Data Layer
   ============================================================ */

const STORAGE_KEY = 'collegeTracker';

const DEFAULT_CHECKLIST = [
  { label: 'Transcript requested', dueDate: null, completed: false },
  { label: 'Test scores sent', dueDate: null, completed: false },
  { label: 'Main essay completed', dueDate: null, completed: false },
  { label: 'Supplemental essays completed', dueDate: null, completed: false },
  { label: 'Recommendation letters requested', dueDate: null, completed: false },
  { label: 'Application fee paid', dueDate: null, completed: false },
  { label: 'Application submitted', dueDate: null, completed: false },
  { label: 'Interview scheduled', dueDate: null, completed: false },
  { label: 'Portfolio submitted', dueDate: null, completed: false }
];

const Store = {
  _getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { users: [], session: null, schools: [], essays: [], recommendations: [] };
      return JSON.parse(raw);
    } catch (e) {
      console.error('Store: Error reading localStorage', e);
      return { users: [], session: null, schools: [], essays: [], recommendations: [] };
    }
  },

  _saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Store: Error writing localStorage', e);
    }
  },

  getState() {
    return this._getAll();
  },

  setState(patch) {
    const data = this._getAll();
    Object.assign(data, patch);
    this._saveAll(data);
  },

  // ── Users ──
  getUsers() {
    return this._getAll().users || [];
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  },

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  addUser(user) {
    const data = this._getAll();
    data.users.push(user);
    this._saveAll(data);
    return user;
  },

  updateUser(id, patch) {
    const data = this._getAll();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(data.users[idx], patch);
    this._saveAll(data);
    return data.users[idx];
  },

  // ── Session ──
  getSession() {
    return this._getAll().session;
  },

  setSession(session) {
    const data = this._getAll();
    data.session = session;
    this._saveAll(data);
  },

  clearSession() {
    const data = this._getAll();
    data.session = null;
    this._saveAll(data);
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return this.getUserById(session.userId);
  },

  getViewingStudentId() {
    const session = this.getSession();
    const user = this.getCurrentUser();
    if (!user) return null;
    if (user.role === 'student') return user.id;
    if (session && session.viewingStudentId) return session.viewingStudentId;
    // For parent/counselor, return first linked student
    if (user.linkedStudents && user.linkedStudents.length > 0) {
      return user.linkedStudents[0];
    }
    return null;
  },

  // ── Schools ──
  getSchools(studentId) {
    const sid = studentId || this.getViewingStudentId();
    if (!sid) return [];
    return (this._getAll().schools || []).filter(s => s.studentId === sid);
  },

  getSchoolById(id) {
    return (this._getAll().schools || []).find(s => s.id === id) || null;
  },

  addSchool(data) {
    const state = this._getAll();
    const studentId = this.getViewingStudentId();
    const checklist = DEFAULT_CHECKLIST.map(item => ({
      id: Utils.generateId(),
      label: item.label,
      dueDate: item.dueDate,
      completed: item.completed
    }));
    const school = {
      id: Utils.generateId(),
      studentId: studentId,
      name: data.name || '',
      location: data.location || '',
      tuition: data.tuition || '',
      acceptanceRate: data.acceptanceRate || '',
      deadline: data.deadline || '',
      appType: data.appType || 'regular',
      category: data.category || 'target',
      status: 'not_started',
      outcome: null,
      committed: false,
      notes: '',
      checklist: checklist,
      createdAt: new Date().toISOString()
    };
    state.schools.push(school);
    this._saveAll(state);
    return school;
  },

  updateSchool(id, patch) {
    const state = this._getAll();
    const idx = state.schools.findIndex(s => s.id === id);
    if (idx === -1) return null;
    Object.assign(state.schools[idx], patch);
    this._saveAll(state);
    return state.schools[idx];
  },

  deleteSchool(id) {
    const state = this._getAll();
    state.schools = state.schools.filter(s => s.id !== id);
    // Also remove references from essays and recommendations
    state.essays = (state.essays || []).map(e => {
      e.schoolIds = (e.schoolIds || []).filter(sid => sid !== id);
      return e;
    });
    state.recommendations = (state.recommendations || []).map(r => {
      r.schoolIds = (r.schoolIds || []).filter(sid => sid !== id);
      return r;
    });
    this._saveAll(state);
  },

  // ── Checklist ──
  getChecklistItems(schoolId) {
    const school = this.getSchoolById(schoolId);
    return school ? (school.checklist || []) : [];
  },

  toggleChecklistItem(schoolId, itemId) {
    const state = this._getAll();
    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return;
    const item = (school.checklist || []).find(i => i.id === itemId);
    if (!item) return;
    item.completed = !item.completed;
    // Auto-update status
    if (school.status === 'not_started' && item.completed) {
      school.status = 'in_progress';
    }
    this._saveAll(state);
    return item;
  },

  addChecklistItem(schoolId, itemData) {
    const state = this._getAll();
    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return null;
    const item = {
      id: Utils.generateId(),
      label: itemData.label || 'New item',
      dueDate: itemData.dueDate || null,
      completed: false
    };
    school.checklist = school.checklist || [];
    school.checklist.push(item);
    this._saveAll(state);
    return item;
  },

  updateChecklistItem(schoolId, itemId, patch) {
    const state = this._getAll();
    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return null;
    const item = (school.checklist || []).find(i => i.id === itemId);
    if (!item) return null;
    Object.assign(item, patch);
    this._saveAll(state);
    return item;
  },

  removeChecklistItem(schoolId, itemId) {
    const state = this._getAll();
    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return;
    school.checklist = (school.checklist || []).filter(i => i.id !== itemId);
    this._saveAll(state);
  },

  // ── Essays ──
  getEssays(studentId) {
    const sid = studentId || this.getViewingStudentId();
    if (!sid) return [];
    return (this._getAll().essays || []).filter(e => e.studentId === sid);
  },

  getEssayById(id) {
    return (this._getAll().essays || []).find(e => e.id === id) || null;
  },

  addEssay(data) {
    const state = this._getAll();
    const studentId = this.getViewingStudentId();
    const essay = {
      id: Utils.generateId(),
      studentId: studentId,
      prompt: data.prompt || '',
      wordLimit: data.wordLimit || 650,
      schoolIds: data.schoolIds || [],
      status: 'not_started',
      draft: '',
      createdAt: new Date().toISOString()
    };
    state.essays = state.essays || [];
    state.essays.push(essay);
    this._saveAll(state);
    return essay;
  },

  updateEssay(id, patch) {
    const state = this._getAll();
    const idx = (state.essays || []).findIndex(e => e.id === id);
    if (idx === -1) return null;
    Object.assign(state.essays[idx], patch);
    this._saveAll(state);
    return state.essays[idx];
  },

  deleteEssay(id) {
    const state = this._getAll();
    state.essays = (state.essays || []).filter(e => e.id !== id);
    this._saveAll(state);
  },

  // ── Recommendations ──
  getRecommendations(studentId) {
    const sid = studentId || this.getViewingStudentId();
    if (!sid) return [];
    return (this._getAll().recommendations || []).filter(r => r.studentId === sid);
  },

  getRecommendationById(id) {
    return (this._getAll().recommendations || []).find(r => r.id === id) || null;
  },

  addRec(data) {
    const state = this._getAll();
    const studentId = this.getViewingStudentId();
    const rec = {
      id: Utils.generateId(),
      studentId: studentId,
      teacherName: data.teacherName || '',
      subject: data.subject || '',
      dateAsked: data.dateAsked || Utils.todayISO(),
      schoolIds: data.schoolIds || [],
      submitted: false,
      createdAt: new Date().toISOString()
    };
    state.recommendations = state.recommendations || [];
    state.recommendations.push(rec);
    this._saveAll(state);
    return rec;
  },

  updateRec(id, patch) {
    const state = this._getAll();
    const idx = (state.recommendations || []).findIndex(r => r.id === id);
    if (idx === -1) return null;
    Object.assign(state.recommendations[idx], patch);
    this._saveAll(state);
    return state.recommendations[idx];
  },

  deleteRec(id) {
    const state = this._getAll();
    state.recommendations = (state.recommendations || []).filter(r => r.id !== id);
    this._saveAll(state);
  }
};