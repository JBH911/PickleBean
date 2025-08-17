/* Simple hash router + shared pricing engine scaffolding */
import { renderHome } from './modules/home.js';
import { renderQuickQuote } from './modules/quickQuote.js';
import { renderSettings } from './modules/settings.js';
import { renderStickers } from './modules/stickers.js';
import { renderApparel } from './modules/apparel.js';
import { renderEngraving } from './modules/engraving.js';
import { renderHomeware } from './modules/homeware.js';
import { renderBooks } from './modules/books.js';
import { Calc } from './modules/shared/calc.js';
import { $, formatMoney, persist, restore } from './modules/shared/utils.js';

const routes = {
  '/': renderHome,
  '/quick-quote': renderQuickQuote,
  '/settings': renderSettings,
  '/stickers': renderStickers,
  '/apparel': renderApparel,
  '/engraving': renderEngraving,
  '/homeware': renderHomeware,
  '/books': renderBooks,
};

// Global state (can be saved/restored)
export const state = {
  fees: null,   // loaded from /data/config.json
  lastQuote: null,
};

async function loadConfig() {
  const r = await fetch('data/config.json');
  state.fees = await r.json();
  // try load saved user overrides
  const saved = restore('feesOverrides');
  if (saved) Object.assign(state.fees, saved);
}

async function router() {
  const path = location.hash.replace('#','') || '/';
  document.querySelectorAll('.tabs a').forEach(a => {
    a.setAttribute('aria-current', a.getAttribute('href') === `#${path}` ? 'page' : 'false');
  });

  const el = $('#app');
  el.innerHTML = ''; // clear

  if (!state.fees) await loadConfig();

  const view = routes[path] || (()=>{ el.textContent = 'Not found'; });
  await view(el, state);

  // footer actions
  $('#btn-copy')?.addEventListener('click', () => {
    const text = JSON.stringify(state.lastQuote ?? {}, null, 2);
    navigator.clipboard.writeText(text).then(()=>{
      alert('Quote copied to clipboard.');
    });
  });
  $('#btn-reset')?.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
  });
  $('#btn-export')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'calculator-state.json'; a.click();
    URL.revokeObjectURL(url);
  });

  // year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// expose helpers for console tinkering
window.PB = { Calc, state };
