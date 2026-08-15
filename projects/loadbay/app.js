// Loadbay — sample order data + call-off interaction

const ORDER = {
  ref: 'PO-4471',
  project: 'Elm Grove Phase 2',
  plots: [
    {
      plot: '11', type: 'Type A — 2 bed', items: [
        { sku: 'TF-C24-47x100', desc: 'C24 Timber Frame Stud 47×100', qty: 62, unit: 'lm' },
        { sku: 'OSB3-11', desc: 'OSB3 Board 11mm', qty: 18, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 40, unit: 'm' },
        { sku: 'INS-PIR-90', desc: 'PIR Insulation Board 90mm', qty: 22, unit: 'sheets' },
      ]
    },
    {
      plot: '12', type: 'Type A — 2 bed', items: [
        { sku: 'TF-C24-47x100', desc: 'C24 Timber Frame Stud 47×100', qty: 62, unit: 'lm' },
        { sku: 'OSB3-11', desc: 'OSB3 Board 11mm', qty: 18, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 40, unit: 'm' },
        { sku: 'INS-PIR-90', desc: 'PIR Insulation Board 90mm', qty: 22, unit: 'sheets' },
      ]
    },
    {
      plot: '13', type: 'Type B — 3 bed', items: [
        { sku: 'TF-C24-47x150', desc: 'C24 Timber Frame Stud 47×150', qty: 86, unit: 'lm' },
        { sku: 'OSB3-18', desc: 'OSB3 Board 18mm', qty: 24, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 52, unit: 'm' },
        { sku: 'INS-PIR-120', desc: 'PIR Insulation Board 120mm', qty: 30, unit: 'sheets' },
        { sku: 'FIX-M10-BAG', desc: 'M10 Frame Fixings, bagged', qty: 4, unit: 'bags' },
      ]
    },
    {
      plot: '14', type: 'Type B — 3 bed', items: [
        { sku: 'TF-C24-47x150', desc: 'C24 Timber Frame Stud 47×150', qty: 86, unit: 'lm' },
        { sku: 'OSB3-18', desc: 'OSB3 Board 18mm', qty: 24, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 52, unit: 'm' },
        { sku: 'INS-PIR-120', desc: 'PIR Insulation Board 120mm', qty: 30, unit: 'sheets' },
        { sku: 'FIX-M10-BAG', desc: 'M10 Frame Fixings, bagged', qty: 4, unit: 'bags' },
      ]
    },
    {
      plot: '15', type: 'Type B — 3 bed (handed)', items: [
        { sku: 'TF-C24-47x150', desc: 'C24 Timber Frame Stud 47×150', qty: 86, unit: 'lm' },
        { sku: 'OSB3-18', desc: 'OSB3 Board 18mm', qty: 24, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 52, unit: 'm' },
        { sku: 'INS-PIR-120', desc: 'PIR Insulation Board 120mm', qty: 30, unit: 'sheets' },
        { sku: 'FIX-M10-BAG', desc: 'M10 Frame Fixings, bagged', qty: 4, unit: 'bags' },
      ]
    },
    {
      plot: '16', type: 'Type C — 4 bed', items: [
        { sku: 'TF-C24-47x200', desc: 'C24 Timber Frame Stud 47×200', qty: 114, unit: 'lm' },
        { sku: 'OSB3-18', desc: 'OSB3 Board 18mm', qty: 33, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 68, unit: 'm' },
        { sku: 'INS-PIR-140', desc: 'PIR Insulation Board 140mm', qty: 38, unit: 'sheets' },
        { sku: 'FIX-M10-BAG', desc: 'M10 Frame Fixings, bagged', qty: 6, unit: 'bags' },
        { sku: 'FLASH-LEAD-C4', desc: 'Lead Flashing Code 4', qty: 14, unit: 'm' },
      ]
    },
    {
      plot: '17', type: 'Type C — 4 bed', items: [
        { sku: 'TF-C24-47x200', desc: 'C24 Timber Frame Stud 47×200', qty: 114, unit: 'lm' },
        { sku: 'OSB3-18', desc: 'OSB3 Board 18mm', qty: 33, unit: 'sheets' },
        { sku: 'DPC-150', desc: 'Damp Proof Course 150mm', qty: 68, unit: 'm' },
        { sku: 'INS-PIR-140', desc: 'PIR Insulation Board 140mm', qty: 38, unit: 'sheets' },
        { sku: 'FIX-M10-BAG', desc: 'M10 Frame Fixings, bagged', qty: 6, unit: 'bags' },
        { sku: 'FLASH-LEAD-C4', desc: 'Lead Flashing Code 4', qty: 14, unit: 'm' },
      ]
    },
  ]
};

const selected = new Set();

const plotListEl = document.getElementById('plotList');
const searchEl = document.getElementById('search');
const selectAllBtn = document.getElementById('selectAllBtn');
const generateBtn = document.getElementById('generateBtn');
const basketCount = document.getElementById('basketCount');
const basketItems = document.getElementById('basketItems');

document.getElementById('orderRef').textContent = ORDER.ref;
document.getElementById('projectName').textContent = ORDER.project;
document.getElementById('plotTotal').textContent = ORDER.plots.length;

function itemTotalCount(plot) {
  return plot.items.reduce((sum, i) => sum + i.qty, 0);
}

function renderPlots(filter) {
  const f = (filter || '').trim().toLowerCase();
  plotListEl.innerHTML = '';
  ORDER.plots
    .filter(p => !f || p.plot.toLowerCase().includes(f) || p.type.toLowerCase().includes(f))
    .forEach(plot => {
      const row = document.createElement('div');
      row.className = 'plot-row';
      row.dataset.plot = plot.plot;

      const head = document.createElement('div');
      head.className = 'plot-row-head';
      head.innerHTML = `
        <input type="checkbox" class="plot-checkbox" ${selected.has(plot.plot) ? 'checked' : ''} />
        <span class="plot-chevron">▶</span>
        <span class="plot-num">#${plot.plot}</span>
        <span class="plot-type">${plot.type}</span>
        <span class="plot-item-count">${plot.items.length} items</span>
      `;

      const body = document.createElement('div');
      body.className = 'plot-items';
      body.innerHTML = `
        <table class="items-table">
          <thead><tr><th>SKU</th><th>Description</th><th>Qty</th><th>Unit</th></tr></thead>
          <tbody>
            ${plot.items.map(i => `
              <tr>
                <td class="sku">${i.sku}</td>
                <td>${i.desc}</td>
                <td class="qty">${i.qty}</td>
                <td>${i.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      const checkbox = head.querySelector('.plot-checkbox');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelect(plot.plot, checkbox.checked);
      });

      head.addEventListener('click', () => row.classList.toggle('open'));

      row.appendChild(head);
      row.appendChild(body);
      plotListEl.appendChild(row);
    });
}

function toggleSelect(plotNum, isSelected) {
  if (isSelected) selected.add(plotNum);
  else selected.delete(plotNum);
  updateBasket();
}

function updateBasket() {
  basketCount.textContent = selected.size;
  const plots = ORDER.plots.filter(p => selected.has(p.plot));
  const totalItems = plots.reduce((sum, p) => sum + itemTotalCount(p), 0);
  basketItems.textContent = totalItems;
  generateBtn.disabled = selected.size === 0;
}

searchEl.addEventListener('input', () => renderPlots(searchEl.value));

selectAllBtn.addEventListener('click', () => {
  const allSelected = selected.size === ORDER.plots.length;
  if (allSelected) {
    selected.clear();
  } else {
    ORDER.plots.forEach(p => selected.add(p.plot));
  }
  renderPlots(searchEl.value);
  updateBasket();
});

function pad(n, len) { return String(n).padStart(len, '0'); }

function nextDeliveryNoteNumber() {
  const key = 'loadbay:dnCounter';
  let n = parseInt(localStorage.getItem(key) || '2200', 10);
  n += 1;
  localStorage.setItem(key, String(n));
  return n;
}

function generateRef() {
  const now = new Date();
  const ym = `${now.getFullYear() % 100}${pad(now.getMonth() + 1, 2)}`;
  const suffix = pad(Math.floor(Math.random() * 9999), 4);
  return `MFG-${ym}-${suffix}`;
}

generateBtn.addEventListener('click', () => {
  const plots = ORDER.plots.filter(p => selected.has(p.plot));
  const callOff = {
    deliveryNote: `DN-${nextDeliveryNoteNumber()}`,
    mfgRef: generateRef(),
    date: new Date().toISOString(),
    orderRef: ORDER.ref,
    project: ORDER.project,
    plots: plots.map(p => ({ plot: p.plot, type: p.type, items: p.items })),
  };
  localStorage.setItem('loadbay:lastCallOff', JSON.stringify(callOff));
  window.open('slip.html', '_blank');
});

renderPlots('');
updateBasket();
