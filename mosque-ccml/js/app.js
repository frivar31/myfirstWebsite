/* ============================================================
   CCML – Centre Culturel Musulman de Longueuil
   Prayer times app — uses AlAdhan public API
   Coordinates: Longueuil, QC  45.5317° N, 73.5185° W
   Method 2 = ISNA (used widely in North America)
   ============================================================ */

const CONFIG = {
  lat: 45.5317,
  lng: -73.5185,
  method: 2,          // ISNA
  school: 0,          // Shafi (standard)
  timezone: 'America/Montreal',
};

// Iqama offsets (minutes after adhan) – adjust to match CCML schedule
const IQAMA_OFFSET = { Fajr: 20, Dhuhr: 10, Asr: 10, Maghrib: 5, Isha: 15 };

const PRAYER_ARABIC = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

const DAYS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                   'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function padZ(n) { return String(n).padStart(2,'0'); }

function to12h(time24) {
  if (!time24) return '–';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${padZ(m)} ${ampm}`;
}

function addMinutes(time24, mins) {
  if (!time24) return '–';
  let [h, m] = time24.split(':').map(Number);
  m += mins; h += Math.floor(m / 60); m %= 60; h %= 24;
  return `${padZ(h)}:${padZ(m)}`;
}

function timeToMinutes(time24) {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatCountdown(targetMinutes) {
  const now = nowMinutes();
  let diff = targetMinutes - now;
  if (diff < 0) diff += 1440;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `dans ${h}h ${padZ(m)}min`;
  return `dans ${m} min`;
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchPrayers(year, month) {
  const url = `https://api.aladhan.com/v1/calendar/${year}/${month}` +
    `?latitude=${CONFIG.lat}&longitude=${CONFIG.lng}` +
    `&method=${CONFIG.method}&school=${CONFIG.school}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  const json = await res.json();
  return json.data; // array of day objects
}

// ── TODAY'S PRAYERS ───────────────────────────────────────────────────────────

async function loadToday() {
  const now = new Date();
  try {
    const data = await fetchPrayers(now.getFullYear(), now.getMonth() + 1);
    const dayData = data[now.getDate() - 1];
    const timings = dayData.timings;
    const hijri = dayData.date.hijri;

    // Hijri date
    document.getElementById('hijriDate').textContent =
      `${hijri.day} ${hijri.month.en} ${hijri.year} H`;

    // Gregorian date
    document.getElementById('gregorianDate').textContent =
      `${DAYS_FR[now.getDay()]} ${now.getDate()} ${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`;

    // Render prayer cards
    const prayers = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    const nowMin = nowMinutes();

    // Find active (next) prayer
    let nextIdx = -1;
    for (let i = 0; i < prayers.length; i++) {
      const p = prayers[i];
      const t = timings[p]?.replace(' (EST)','').replace(' (EDT)','').split(' ')[0];
      if (timeToMinutes(t) > nowMin) { nextIdx = i; break; }
    }
    if (nextIdx === -1) nextIdx = 0; // wrap to Fajr next day

    const grid = document.getElementById('prayersGrid');
    grid.innerHTML = '';

    prayers.forEach((name, idx) => {
      const rawTime = timings[name]?.replace(' (EST)','').replace(' (EDT)','').split(' ')[0];
      const card = document.createElement('div');
      card.className = 'prayer-card' + (idx === nextIdx ? ' active' : '');

      const hasIqama = IQAMA_OFFSET[name] !== undefined;
      const iqamaTime = hasIqama ? to12h(addMinutes(rawTime, IQAMA_OFFSET[name])) : null;

      card.innerHTML = `
        <p class="prayer-card__name">${name === 'Sunrise' ? 'Lever' : name}</p>
        <p class="prayer-card__arabic">${PRAYER_ARABIC[name] || ''}</p>
        <p class="prayer-card__time">${to12h(rawTime)}</p>
        ${iqamaTime ? `<p class="prayer-card__iqama">Iqama <span>${iqamaTime}</span></p>` : '<p class="prayer-card__iqama" style="visibility:hidden">–</p>'}
      `;
      grid.appendChild(card);
    });

    // Next prayer info
    const nextName = prayers[nextIdx];
    const nextRaw = timings[nextName]?.replace(' (EST)','').replace(' (EDT)','').split(' ')[0];
    document.getElementById('nextPrayerName').textContent = nextName === 'Sunrise' ? 'Lever du soleil' : nextName;
    document.getElementById('nextPrayerTime').textContent = to12h(nextRaw);

    // Countdown – update every 30s
    function updateCountdown() {
      document.getElementById('countdown').textContent =
        formatCountdown(timeToMinutes(nextRaw));
    }
    updateCountdown();
    setInterval(updateCountdown, 30000);

  } catch (e) {
    console.error('Prayer API error:', e);
    document.getElementById('hijriDate').textContent = '–';
    document.getElementById('gregorianDate').textContent = 'Impossible de charger les horaires.';
    document.getElementById('prayersGrid').innerHTML =
      '<p style="color:rgba(255,255,255,.6);grid-column:1/-1;text-align:center;padding:24px">Veuillez réessayer plus tard.</p>';
  }
}

// ── MONTHLY CALENDAR ──────────────────────────────────────────────────────────

let calYear, calMonth;

async function loadCalendar(year, month) {
  const titleEl = document.getElementById('calendarMonthTitle');
  const tbody   = document.getElementById('prayerTableBody');
  titleEl.textContent = `${MONTHS_FR[month - 1]} ${year}`;
  tbody.innerHTML = '<tr><td colspan="8" class="loading-cell"><div class="spinner"></div> Chargement…</td></tr>';

  try {
    const data = await fetchPrayers(year, month);
    const today = new Date();
    tbody.innerHTML = '';

    data.forEach(day => {
      const t = day.timings;
      const d = day.date.gregorian;
      const dayNum   = parseInt(d.day);
      const dayOfWeek = new Date(d.date).getDay(); // 0=Sun
      const isFriday = dayOfWeek === 5;
      const isToday  = year === today.getFullYear() && month === today.getMonth() + 1 && dayNum === today.getDate();

      const clean = s => (s || '–').replace(/ \(E[SD]T\)/g, '').split(' ')[0];

      const tr = document.createElement('tr');
      if (isToday) tr.className = 'today';
      else if (isFriday) tr.className = 'friday';

      tr.innerHTML = `
        <td>${d.day}/${d.month.number}/${d.year}</td>
        <td>${DAYS_FR[dayOfWeek]}</td>
        <td>${to12h(clean(t.Fajr))}</td>
        <td>${to12h(clean(t.Sunrise))}</td>
        <td>${to12h(clean(t.Dhuhr))}</td>
        <td>${to12h(clean(t.Asr))}</td>
        <td>${to12h(clean(t.Maghrib))}</td>
        <td>${to12h(clean(t.Isha))}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">Erreur de chargement. Veuillez réessayer.</td></tr>';
  }
}

// ── NAV ACTIVE LINK ───────────────────────────────────────────────────────────

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ── HEADER SCROLL ─────────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
});

// ── HAMBURGER ────────────────────────────────────────────────────────────────

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});
document.getElementById('nav').querySelectorAll('.nav__link').forEach(l => {
  l.addEventListener('click', () => document.getElementById('nav').classList.remove('open'));
});

// ── DONATION AMOUNTS ──────────────────────────────────────────────────────────

document.querySelectorAll('.amount-btn:not(.amount-btn--custom)').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});
document.querySelector('.amount-btn--custom')?.addEventListener('click', () => {
  const amt = prompt('Entrez le montant en dollars (ex: 75):');
  if (amt && !isNaN(amt)) alert(`Merci pour votre don de ${amt} $! Veuillez procéder au paiement via Interac à dons@ccmlongueuil.ca`);
});

// ── CONTACT FORM ──────────────────────────────────────────────────────────────

document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Message envoyé ✓';
  btn.style.background = 'var(--green-700)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Envoyer le message';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
});

// ── FOOTER YEAR ───────────────────────────────────────────────────────────────

document.getElementById('footerYear').textContent = new Date().getFullYear();

// ── INIT ──────────────────────────────────────────────────────────────────────

(function init() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth() + 1;

  loadToday();
  loadCalendar(calYear, calMonth);
  initScrollSpy();

  document.getElementById('prevMonth').addEventListener('click', () => {
    calMonth--; if (calMonth < 1) { calMonth = 12; calYear--; }
    loadCalendar(calYear, calMonth);
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    calMonth++; if (calMonth > 12) { calMonth = 1; calYear++; }
    loadCalendar(calYear, calMonth);
  });
})();
