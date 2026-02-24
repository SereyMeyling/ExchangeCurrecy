
// === DEFAULT RATES (base: USD) ===
const DEFAULT_RATES = {
  USD: 1,
  KHR: 4100,   // Cambodian Riel — editable!
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CNY: 7.24,
  THB: 35.2,
  VND: 24500,
  MYR: 4.72,
  SGD: 1.34,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.89,
  INR: 83.1,
  KRW: 1325,
  HKD: 7.82,
  TWD: 31.5,
  IDR: 15650,
  PHP: 56.2,
  BRL: 4.97,
  MXN: 17.1,
  AED: 3.67,
  SAR: 3.75,
  TRY: 32.1,
  ZAR: 18.6,
  RUB: 89.5,
  LAK: 21000,
  MMK: 2100,
};

const CURRENCY_INFO = {
  USD: { name: "US Dollar",          flag: "🇺🇸" },
  KHR: { name: "Cambodian Riel",     flag: "🇰🇭" },
  EUR: { name: "Euro",               flag: "🇪🇺" },
  GBP: { name: "British Pound",      flag: "🇬🇧" },
  JPY: { name: "Japanese Yen",       flag: "🇯🇵" },
  CNY: { name: "Chinese Yuan",       flag: "🇨🇳" },
  THB: { name: "Thai Baht",          flag: "🇹🇭" },
  VND: { name: "Vietnamese Dong",    flag: "🇻🇳" },
  MYR: { name: "Malaysian Ringgit",  flag: "🇲🇾" },
  SGD: { name: "Singapore Dollar",   flag: "🇸🇬" },
  AUD: { name: "Australian Dollar",  flag: "🇦🇺" },
  CAD: { name: "Canadian Dollar",    flag: "🇨🇦" },
  CHF: { name: "Swiss Franc",        flag: "🇨🇭" },
  INR: { name: "Indian Rupee",       flag: "🇮🇳" },
  KRW: { name: "South Korean Won",   flag: "🇰🇷" },
  HKD: { name: "Hong Kong Dollar",   flag: "🇭🇰" },
  TWD: { name: "Taiwan Dollar",      flag: "🇹🇼" },
  IDR: { name: "Indonesian Rupiah",  flag: "🇮🇩" },
  PHP: { name: "Philippine Peso",    flag: "🇵🇭" },
  BRL: { name: "Brazilian Real",     flag: "🇧🇷" },
  MXN: { name: "Mexican Peso",       flag: "🇲🇽" },
  AED: { name: "UAE Dirham",         flag: "🇦🇪" },
  SAR: { name: "Saudi Riyal",        flag: "🇸🇦" },
  TRY: { name: "Turkish Lira",       flag: "🇹🇷" },
  ZAR: { name: "South African Rand", flag: "🇿🇦" },
  RUB: { name: "Russian Ruble",      flag: "🇷🇺" },
  LAK: { name: "Lao Kip",            flag: "🇱🇦" },
  MMK: { name: "Myanmar Kyat",       flag: "🇲🇲" },
};

// Load custom rates from localStorage
let customRates = {};
try { customRates = JSON.parse(localStorage.getItem('ex_custom_rates') || '{}'); } catch(e) {}

function getRate(code) {
  return parseFloat(customRates[code] ?? DEFAULT_RATES[code]);
}

function saveRates() {
  try { localStorage.setItem('ex_custom_rates', JSON.stringify(customRates)); } catch(e) {}
}

const codes = Object.keys(DEFAULT_RATES);
const fromSel = document.getElementById('fromCurrency');
const toSel = document.getElementById('toCurrency');

// Populate selects
function buildSelect(sel, selectedCode) {
  sel.innerHTML = '';
  codes.forEach(c => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = `${c} ${CURRENCY_INFO[c]?.flag || ''}`;
    if (c === selectedCode) o.selected = true;
    sel.appendChild(o);
  });
}

buildSelect(fromSel, 'USD');
buildSelect(toSel, 'KHR');

// Quick amounts
const QUICK = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000];
const qWrap = document.getElementById('quickBtns');
QUICK.forEach(v => {
  const b = document.createElement('button');
  b.className = 'quick-btn';
  b.textContent = fmtNum(v);
  b.onclick = () => { document.getElementById('fromAmount').value = v; convert(); };
  qWrap.appendChild(b);
});

function fmtNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(n%1000000===0?0:2)+'M';
  if (n >= 1000) return (n/1000).toFixed(n%1000===0?0:2)+'K';
  return n.toString();
}

function formatAmount(n) {
  if (isNaN(n)) return '0';
  if (Math.abs(n) < 0.01) return n.toFixed(6);
  if (Math.abs(n) < 1) return n.toFixed(4);
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Core conversion
function convert() {
  const from = fromSel.value;
  const to = toSel.value;
  const amt = parseFloat(document.getElementById('fromAmount').value) || 0;

  const fromRate = getRate(from);
  const toRate = getRate(to);
  const result = (amt / fromRate) * toRate;

  document.getElementById('toAmount').value = formatAmount(result);

  const rateOneFrom = toRate / fromRate;
  const rateOneTo = fromRate / toRate;

  document.getElementById('resultText').textContent = `${formatAmount(result)} ${to}`;
  document.getElementById('rateText').textContent = `1 ${from} = ${formatAmount(rateOneFrom)} ${to}`;
  document.getElementById('inverseRate').textContent = `1 ${to} = ${formatAmount(rateOneTo)} ${from}`;
  document.getElementById('fromSymbolBadge').textContent = from;

  // Pulse
  const rd = document.querySelector('.result-display');
  rd.classList.remove('pulse');
  void rd.offsetWidth;
  rd.classList.add('pulse');

  buildTable(from, amt);
}

function buildTable(from, amt) {
  const fromRate = getRate(from);
  const tbody = document.getElementById('conversionTable');
  tbody.innerHTML = '';
  codes.forEach(c => {
    if (c === from) return;
    const toRate = getRate(c);
    const converted = (amt / fromRate) * toRate;
    const info = CURRENCY_INFO[c] || {};
    const isCustom = customRates[c] !== undefined;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="flag">${info.flag || ''}</td>
      <td><div>${info.name || c}</div><div class="currency-name">${c}</div></td>
      <td><span class="ticker">${c}</span>${isCustom ? '<span class="badge-custom">custom</span>' : ''}</td>
      <td>${formatAmount(toRate / fromRate)}</td>
      <td class="converted-val">${formatAmount(converted)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Build custom rate inputs
function buildRatesGrid() {
  const grid = document.getElementById('ratesGrid');
  grid.innerHTML = '';
  codes.filter(c => c !== 'USD').forEach(c => {
    const defaultVal = DEFAULT_RATES[c];
    const currentVal = getRate(c);
    const isCustom = customRates[c] !== undefined;
    const info = CURRENCY_INFO[c] || {};

    const item = document.createElement('div');
    item.className = 'rate-item';
    item.id = `rateitem-${c}`;
    item.innerHTML = `
      <div class="rate-pair">${info.flag || ''} 1 USD → ${c} ${isCustom ? '<span class="badge-custom" style="font-size:9px">custom</span>' : ''}</div>
      <div class="rate-row">
        <span class="rate-prefix">1 USD =</span>
        <input class="rate-input" id="rateinput-${c}" type="number" value="${currentVal}" min="0" step="any" data-code="${c}" data-default="${defaultVal}">
      </div>
      ${isCustom ? `<div class="rate-reset" onclick="resetRate('${c}')">↺ Reset to default</div>` : '<div style="height:16px"></div>'}
    `;
    grid.appendChild(item);

    document.getElementById(`rateinput-${c}`).addEventListener('input', function() {
      const val = parseFloat(this.value);
      if (!isNaN(val) && val > 0) {
        customRates[c] = val;
        saveRates();
        rebuildRateItem(c);
        convert();
      }
    });
  });
}

function rebuildRateItem(c) {
  const item = document.getElementById(`rateitem-${c}`);
  if (!item) return;
  const isCustom = customRates[c] !== undefined;
  const pairEl = item.querySelector('.rate-pair');
  const info = CURRENCY_INFO[c] || {};
  pairEl.innerHTML = `${info.flag || ''} 1 USD → ${c} ${isCustom ? '<span class="badge-custom" style="font-size:9px">custom</span>' : ''}`;
  const resetEl = item.querySelector('.rate-reset');
  if (isCustom) {
    if (resetEl) { resetEl.style.display = ''; }
    else {
      const d = document.createElement('div');
      d.className = 'rate-reset';
      d.onclick = () => resetRate(c);
      d.textContent = '↺ Reset to default';
      item.appendChild(d);
    }
  } else {
    if (resetEl) resetEl.style.display = 'none';
  }
}

function resetRate(c) {
  delete customRates[c];
  saveRates();
  const inp = document.getElementById(`rateinput-${c}`);
  if (inp) inp.value = DEFAULT_RATES[c];
  rebuildRateItem(c);
  convert();
}

// Swap
function swapCurrencies() {
  const f = fromSel.value, t = toSel.value;
  buildSelect(fromSel, t);
  buildSelect(toSel, f);
  convert();
}

// Event listeners
document.getElementById('fromAmount').addEventListener('input', convert);
fromSel.addEventListener('change', convert);
toSel.addEventListener('change', convert);

// Init
buildRatesGrid();
convert();
