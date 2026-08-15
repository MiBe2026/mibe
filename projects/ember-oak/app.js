// Ember & Oak — menu, hours badge, reservation flow

const HOURS = [
  { day: 'Monday', open: null },
  { day: 'Tuesday', open: [17, 22] },
  { day: 'Wednesday', open: [17, 22] },
  { day: 'Thursday', open: [17, 22.5] },
  { day: 'Friday', open: [17, 23] },
  { day: 'Saturday', open: [12, 23] },
  { day: 'Sunday', open: [12, 21] },
];

const MENU = [
  {
    cat: 'Starters', items: [
      { name: 'Charred flatbread, smoked butter', desc: 'Wood-fired flatbread with cultured smoked butter and Maldon salt.', price: '£6', tags: ['veg'] },
      { name: 'Burrata, roast grape, hazelnut', desc: 'Stracciatella-filled burrata, blistered grapes, toasted hazelnuts.', price: '£11', tags: ['veg', 'nuts'] },
      { name: 'Charred octopus, nduja butter', desc: 'Coal-grilled octopus, nduja butter, crisp capers.', price: '£13', tags: [] },
    ]
  },
  {
    cat: 'Mains', items: [
      { name: 'Whole grilled sea bream', desc: 'Salt-crusted, grilled whole over oak, salsa verde, charred lemon.', price: '£24', tags: [] },
      { name: 'Dry-aged bavette, embers', desc: '35-day dry-aged bavette steak, cooked directly in the embers.', price: '£27', tags: [] },
      { name: 'Roast squash, romesco, pine nut', desc: 'Whole roast squash, smoked romesco, toasted pine nuts, sage oil.', price: '£17', tags: ['veg', 'nuts'] },
      { name: 'Fire-roasted mushroom risotto', desc: 'Wild mushroom risotto finished with a smoked mushroom broth.', price: '£16', tags: ['veg'] },
    ]
  },
  {
    cat: 'Puddings', items: [
      { name: 'Burnt Basque cheesecake', desc: 'Classic burnt-top cheesecake, blackened and custardy.', price: '£8', tags: ['veg'] },
      { name: 'Smoked chocolate tart, walnut', desc: 'Dark chocolate tart with a hint of applewood smoke, candied walnut.', price: '£9', tags: ['veg', 'nuts'] },
    ]
  },
  {
    cat: 'Drinks', items: [
      { name: 'House red / white / rosé', desc: 'Rotating natural wine list — ask your server for tonight\'s pour.', price: '£8/glass', tags: ['veg'] },
      { name: 'Smoked old fashioned', desc: 'Bourbon, demerara, applewood smoke, orange oil.', price: '£11', tags: [] },
    ]
  },
];

// ─── OPEN / CLOSED BADGE ────────────────────────────────

function updateStatusBadge() {
  const badge = document.getElementById('statusBadge');
  const now = new Date();
  const today = HOURS[(now.getDay() + 6) % 7]; // Mon-indexed to match HOURS array (starts Monday)
  const hourFloat = now.getHours() + now.getMinutes() / 60;

  const isOpen = today.open && hourFloat >= today.open[0] && hourFloat < today.open[1];
  badge.textContent = isOpen ? 'Open now' : 'Closed';
  badge.className = 'status-badge ' + (isOpen ? 'open' : 'closed');
}
updateStatusBadge();
setInterval(updateStatusBadge, 60000);

function fmtHour(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const period = hh >= 12 ? 'pm' : 'am';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return mm === 0 ? `${h12}${period}` : `${h12}:${String(mm).padStart(2, '0')}${period}`;
}

const hoursListEl = document.getElementById('hoursList');
HOURS.forEach(h => {
  const row = document.createElement('div');
  row.innerHTML = `<span>${h.day}</span><span>${h.open ? `${fmtHour(h.open[0])} – ${fmtHour(h.open[1])}` : 'Closed'}</span>`;
  hoursListEl.appendChild(row);
});

// ─── MENU RENDER + FILTER ───────────────────────────────

const menuListEl = document.getElementById('menuList');
let activeFilter = 'all';

function renderMenu() {
  menuListEl.innerHTML = '';
  MENU.forEach(cat => {
    const catEl = document.createElement('div');
    catEl.className = 'menu-cat';
    const visibleItems = cat.items.filter(i => activeFilter === 'all' || i.tags.includes(activeFilter));
    if (visibleItems.length === 0) return;

    catEl.innerHTML = `<div class="menu-cat-title">${cat.cat}</div>`;
    visibleItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.innerHTML = `
        <div>
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-desc">${item.desc}</div>
          ${item.tags.length ? `<div class="menu-item-tags">${item.tags.map(t => t === 'veg' ? 'Vegetarian' : 'Contains nuts').join(' · ')}</div>` : ''}
        </div>
        <div class="menu-item-price">${item.price}</div>
      `;
      catEl.appendChild(row);
    });
    menuListEl.appendChild(catEl);
  });
}
renderMenu();

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderMenu();
  });
});

// ─── RESERVATIONS ───────────────────────────────────────

const form = document.getElementById('resForm');
const pending = document.getElementById('resPending');
const confirmEl = document.getElementById('resConfirm');
const upcomingBanner = document.getElementById('upcomingBanner');

function showUpcoming() {
  const saved = JSON.parse(localStorage.getItem('emberoak:reservation') || 'null');
  if (!saved) return;
  const d = new Date(saved.date + 'T' + saved.time);
  if (d < new Date()) return;
  upcomingBanner.innerHTML = `You have an upcoming reservation: <strong>${saved.dateLabel} at ${saved.time}</strong> for ${saved.party} — ref ${saved.ref}`;
  upcomingBanner.className = 'upcoming-banner';
}
showUpcoming();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  form.style.display = 'none';
  pending.style.display = 'block';

  setTimeout(() => {
    const dateVal = document.getElementById('resDate').value;
    const timeVal = document.getElementById('resTime').value;
    const party = document.getElementById('resParty').value;
    const dateObj = dateVal ? new Date(dateVal + 'T00:00:00') : new Date();
    const dateLabel = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const ref = 'EO-' + dateVal.replace(/-/g, '').slice(2) + '-' + Math.floor(1000 + Math.random() * 9000);

    localStorage.setItem('emberoak:reservation', JSON.stringify({ date: dateVal, time: timeVal, party, dateLabel, ref }));

    pending.style.display = 'none';
    confirmEl.style.display = 'block';
    document.getElementById('resConfirmDetail').textContent = `${dateLabel} at ${timeVal}, table for ${party}. We'll text you to confirm.`;
    document.getElementById('resRef').textContent = `Reference ${ref}`;
  }, 900);
});
