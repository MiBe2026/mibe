// Lustre — booking wizard

const SERVICES = [
  { id: 'cut-finish', category: 'Cut & Finish', name: 'Cut & Finish', mins: 45, price: 42 },
  { id: 'cut-restyle', category: 'Cut & Finish', name: 'Restyle Cut', mins: 60, price: 58 },
  { id: 'blow-dry', category: 'Cut & Finish', name: 'Blow Dry', mins: 30, price: 26 },
  { id: 'full-colour', category: 'Colour', name: 'Full Colour', mins: 120, price: 85 },
  { id: 'root-touch', category: 'Colour', name: 'Root Touch-Up', mins: 75, price: 62 },
  { id: 'balayage', category: 'Colour', name: 'Balayage', mins: 150, price: 120 },
  { id: 'gel-mani', category: 'Nails', name: 'Gel Manicure', mins: 40, price: 28 },
  { id: 'gel-pedi', category: 'Nails', name: 'Gel Pedicure', mins: 50, price: 34 },
  { id: 'brow-shape', category: 'Brows & Lashes', name: 'Brow Shape & Tint', mins: 25, price: 22 },
  { id: 'lash-lift', category: 'Brows & Lashes', name: 'Lash Lift', mins: 45, price: 38 },
];

const STYLISTS = [
  { id: 'any', name: 'Any available', role: 'First free slot', initials: '?', color: '#8C7A82' },
  { id: 'rosa', name: 'Rosa Fenn', role: 'Colour specialist', initials: 'RF', color: '#C9738A' },
  { id: 'noah', name: 'Noah Kade', role: 'Cutting & styling', initials: 'NK', color: '#CBA35C' },
  { id: 'ines', name: 'Inés Marlow', role: 'Nails & brows', initials: 'IM', color: '#9C6B8F' },
];

const state = {
  services: new Set(),
  stylist: null,
  dateISO: null,
  time: null,
};

const money = (n) => `£${n}`;

function selectedServices() {
  return SERVICES.filter(s => state.services.has(s.id));
}
function totalMins() { return selectedServices().reduce((s, x) => s + x.mins, 0); }
function totalPrice() { return selectedServices().reduce((s, x) => s + x.price, 0); }

// ─── STEP 1: services ───────────────────────────────────

const serviceListEl = document.getElementById('serviceList');
const categories = [...new Set(SERVICES.map(s => s.category))];

categories.forEach(cat => {
  const label = document.createElement('div');
  label.className = 'category-label';
  label.textContent = cat;
  serviceListEl.appendChild(label);

  const list = document.createElement('div');
  list.className = 'service-list';
  SERVICES.filter(s => s.category === cat).forEach(s => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.id = s.id;
    card.innerHTML = `
      <div class="service-card-main">
        <div class="service-check">✓</div>
        <div>
          <div class="service-name">${s.name}</div>
          <div class="service-meta">${s.mins} min</div>
        </div>
      </div>
      <div class="service-price">${money(s.price)}</div>
    `;
    card.addEventListener('click', () => {
      if (state.services.has(s.id)) state.services.delete(s.id);
      else state.services.add(s.id);
      card.classList.toggle('selected');
      updateServiceSummary();
    });
    list.appendChild(card);
  });
  serviceListEl.appendChild(list);
});

function updateServiceSummary() {
  const n = state.services.size;
  document.getElementById('svcSummaryCount').textContent = `${n} service${n === 1 ? '' : 's'}`;
  document.getElementById('svcSummaryPrice').textContent = money(totalPrice());
  document.getElementById('toStep2').disabled = n === 0;
}

// ─── STEP 2: stylist ────────────────────────────────────

const stylistListEl = document.getElementById('stylistList');
STYLISTS.forEach(st => {
  const card = document.createElement('div');
  card.className = 'stylist-card';
  card.dataset.id = st.id;
  card.innerHTML = `
    <div class="avatar" style="background:${st.color}">${st.initials}</div>
    <div>
      <div class="stylist-name">${st.name}</div>
      <div class="stylist-role">${st.role}</div>
    </div>
  `;
  card.addEventListener('click', () => {
    document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.stylist = st.id;
    document.getElementById('toStep3').disabled = false;
  });
  stylistListEl.appendChild(card);
});

// ─── STEP 3: date & time ────────────────────────────────

const dayTabsEl = document.getElementById('dayTabs');
const slotGridEl = document.getElementById('slotGrid');

function nextDays(n) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAYS = nextDays(7);
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BASE_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function isoDate(d) { return d.toISOString().slice(0, 10); }

DAYS.forEach((d, idx) => {
  const tab = document.createElement('div');
  tab.className = 'day-tab';
  tab.dataset.iso = isoDate(d);
  tab.innerHTML = `<div class="dow">${DOW[d.getDay()]}</div><div class="dom">${d.getDate()}</div>`;
  tab.addEventListener('click', () => selectDay(isoDate(d)));
  dayTabsEl.appendChild(tab);
  if (idx === 0) selectDay(isoDate(d));
});

function takenKey(stylistId, dateISO, time) {
  return `lustre:taken:${stylistId}:${dateISO}:${time}`;
}

function isTaken(stylistId, dateISO, time) {
  // deterministic "pre-booked" slots baked into the demo, plus anything the visitor has booked
  const seed = (dateISO + time).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const preBooked = seed % 5 === 0;
  return preBooked || localStorage.getItem(takenKey(stylistId, dateISO, time)) === '1';
}

function selectDay(iso) {
  state.dateISO = iso;
  state.time = null;
  document.getElementById('toStep4') && (document.getElementById('toStep4').disabled = true);
  document.querySelectorAll('.day-tab').forEach(t => t.classList.toggle('active', t.dataset.iso === iso));
  renderSlots();
}

function renderSlots() {
  slotGridEl.innerHTML = '';
  const stylistId = state.stylist || 'any';
  BASE_SLOTS.forEach(time => {
    const taken = isTaken(stylistId, state.dateISO, time);
    const slot = document.createElement('div');
    slot.className = 'slot' + (taken ? ' taken' : '') + (state.time === time ? ' selected' : '');
    slot.textContent = time;
    if (!taken) {
      slot.addEventListener('click', () => {
        state.time = time;
        renderSlots();
        document.getElementById('toStep4').disabled = false;
      });
    }
    slotGridEl.appendChild(slot);
  });
}

// ─── STEP 4: confirm ────────────────────────────────────

function renderConfirm() {
  const list = document.getElementById('confirmList');
  const services = selectedServices();
  const stylist = STYLISTS.find(s => s.id === state.stylist);
  const dateObj = new Date(state.dateISO + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  list.innerHTML = `
    <div class="confirm-row"><span class="lbl">Service${services.length > 1 ? 's' : ''}</span><span>${services.map(s => s.name).join(', ')}</span></div>
    <div class="confirm-row"><span class="lbl">Duration</span><span>${totalMins()} min</span></div>
    <div class="confirm-row"><span class="lbl">Stylist</span><span>${stylist.name}</span></div>
    <div class="confirm-row"><span class="lbl">When</span><span>${dateStr}, ${state.time}</span></div>
  `;
  document.getElementById('confirmTotal').textContent = money(totalPrice());
}

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `LU-${s}`;
}

// ─── WIZARD NAV ─────────────────────────────────────────

function goToStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${n}`).classList.add('active');
  document.querySelectorAll('.progress-step').forEach(p => {
    const step = parseInt(p.dataset.step, 10);
    p.classList.toggle('active', step === n);
    p.classList.toggle('done', step < n);
  });
  if (n === 4) renderConfirm();
}

document.getElementById('toStep2').addEventListener('click', () => goToStep(2));
document.getElementById('backTo1').addEventListener('click', () => goToStep(1));
document.getElementById('toStep3').addEventListener('click', () => { renderSlots(); goToStep(3); });
document.getElementById('backTo2').addEventListener('click', () => goToStep(2));
document.getElementById('toStep4').addEventListener('click', () => goToStep(4));
document.getElementById('backTo3').addEventListener('click', () => goToStep(3));

document.getElementById('confirmBtn').addEventListener('click', () => {
  localStorage.setItem(takenKey(state.stylist, state.dateISO, state.time), '1');
  const ref = genRef();
  const stylist = STYLISTS.find(s => s.id === state.stylist);
  const dateObj = new Date(state.dateISO + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  document.getElementById('confirmView').style.display = 'none';
  document.getElementById('doneView').style.display = 'block';
  document.getElementById('doneSummary').textContent = `${selectedServices().map(s => s.name).join(', ')} with ${stylist.name}, ${dateStr} at ${state.time}.`;
  document.getElementById('doneRef').textContent = `Booking reference ${ref}`;
});

document.getElementById('bookAnother').addEventListener('click', () => {
  state.services.clear();
  state.stylist = null;
  state.time = null;
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.stylist-card').forEach(c => c.classList.remove('selected'));
  updateServiceSummary();
  document.getElementById('toStep3').disabled = true;
  document.getElementById('confirmView').style.display = 'block';
  document.getElementById('doneView').style.display = 'none';
  goToStep(1);
});

document.getElementById('resetDemo').addEventListener('click', () => {
  Object.keys(localStorage)
    .filter(k => k.startsWith('lustre:taken:'))
    .forEach(k => localStorage.removeItem(k));
  renderSlots();
  alert('Demo booking data cleared.');
});

updateServiceSummary();
