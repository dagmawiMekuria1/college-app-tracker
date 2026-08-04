/* ============================================================
   calendar.js — Calendar Rendering
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();
  let selectedDate = null;

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  function getAllEvents() {
    const events = [];
    const schools = Store.getSchools();
    const today = Utils.todayISO();

    schools.forEach(school => {
      if (school.deadline && school.status !== 'submitted') {
        events.push({
          date: school.deadline,
          label: school.name + ' — Application deadline',
          school: school.name,
          type: 'school',
          overdue: Utils.isOverdue(school.deadline)
        });
      }

      (school.checklist || []).forEach(item => {
        if (item.dueDate && !item.completed) {
          events.push({
            date: item.dueDate,
            label: school.name + ' — ' + item.label,
            school: school.name,
            type: 'checklist',
            overdue: Utils.isOverdue(item.dueDate)
          });
        }
      });
    });

    return events;
  }

  function getEventsForDate(dateStr) {
    return getAllEvents().filter(e => e.date === dateStr);
  }

  function renderCalendar() {
    document.getElementById('cal-month-label').textContent = MONTH_NAMES[currentMonth] + ' ' + currentYear;

    const grid = document.getElementById('calendar-grid');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const todayStr = Utils.todayISO();
    const events = getAllEvents();

    // Build event lookup by date
    const eventsByDate = {};
    events.forEach(ev => {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });

    let html = '';

    // Previous month filler days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const pMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const pYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = pYear + '-' + String(pMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      const dayEvents = eventsByDate[dateStr] || [];
      const hasOverdue = dayEvents.some(e => e.overdue);

      html += '<div class="calendar-day calendar-day--other-month' + (hasOverdue ? ' calendar-day--has-overdue' : '') + '" data-date="' + dateStr + '">' +
        '<span class="calendar-day__number">' + day + '</span>' +
        renderEventDots(dayEvents) +
      '</div>';
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;
      const dayEvents = eventsByDate[dateStr] || [];
      const hasOverdue = dayEvents.some(e => e.overdue);

      let classes = 'calendar-day';
      if (isToday) classes += ' calendar-day--today';
      if (isSelected) classes += ' calendar-day--selected';
      if (hasOverdue) classes += ' calendar-day--has-overdue';

      html += '<div class="' + classes + '" data-date="' + dateStr + '">' +
        '<span class="calendar-day__number">' + day + '</span>' +
        renderEventDots(dayEvents) +
      '</div>';
    }

    // Next month filler days
    const totalCells = startDow + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      const nMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = nYear + '-' + String(nMonth + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
      const dayEvents = eventsByDate[dateStr] || [];

      html += '<div class="calendar-day calendar-day--other-month" data-date="' + dateStr + '">' +
        '<span class="calendar-day__number">' + i + '</span>' +
        renderEventDots(dayEvents) +
      '</div>';
    }

    grid.innerHTML = html;
  }

  function renderEventDots(events) {
    if (events.length === 0) return '';
    const maxDots = 3;
    let html = '<div class="calendar-day__events">';
    const shown = events.slice(0, maxDots);
    shown.forEach(ev => {
      let dotClass = 'calendar-event-dot calendar-event-dot--' + (ev.overdue ? 'overdue' : ev.type);
      html += '<span class="' + dotClass + '"></span>';
    });
    if (events.length > maxDots) {
      html += '<span class="calendar-day__more">+' + (events.length - maxDots) + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderDetail(dateStr) {
    const detailCard = document.getElementById('calendar-detail');
    const events = getEventsForDate(dateStr);

    if (events.length === 0) {
      detailCard.style.display = 'none';
      return;
    }

    detailCard.style.display = '';
    document.getElementById('calendar-detail-title').textContent = 'Events on ' + Utils.formatDate(dateStr);

    const listEl = document.getElementById('calendar-detail-list');
    listEl.innerHTML = events.map(ev => {
      return '<li class="calendar-detail-item">' +
        '<span class="calendar-event-dot calendar-event-dot--' + (ev.overdue ? 'overdue' : ev.type) + '"></span>' +
        '<span style="flex:1;">' + Utils.escapeHTML(ev.label) + '</span>' +
        (ev.overdue ? '<span class="badge badge--overdue">Overdue</span>' : '') +
      '</li>';
    }).join('');
  }

  // Navigation
  document.getElementById('cal-prev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    selectedDate = null;
    renderCalendar();
    document.getElementById('calendar-detail').style.display = 'none';
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    selectedDate = null;
    renderCalendar();
    document.getElementById('calendar-detail').style.display = 'none';
  });

  // Day click
  document.getElementById('calendar-grid').addEventListener('click', (e) => {
    const dayEl = e.target.closest('.calendar-day');
    if (!dayEl) return;

    const dateStr = dayEl.getAttribute('data-date');
    selectedDate = dateStr;
    renderCalendar();
    renderDetail(dateStr);
  });

  renderCalendar();
});