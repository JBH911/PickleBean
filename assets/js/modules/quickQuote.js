import { h, $, formatMoney } from './shared/utils.js';
import { Calc } from './shared/calc.js';

export async function renderQuickQuote(root, state){
  const form = h('div',{className:'grid cols-3'},
    h('div',{className:'field'}, h('label',{},'Category'),
      (()=>{ const s=document.createElement('select');
        ['Stickers','Apparel','Engraving','Homeware','Books','Other'].forEach(v=>{
          const o=document.createElement('option'); o.value=v; o.textContent=v; s.appendChild(o);
        }); return s; })()
    ),
    h('div',{className:'field'}, h('label',{},'Description'),
      h('input',{placeholder:'e.g., 2× Instagram tag decals, white'})),
    h('div',{className:'field'}, h('label',{},'Quantity'),
      h('input',{type:'number', min:1, value:2})),
    h('div',{className:'field'}, h('label',{},'Unit Material Cost (£)'),
      h('input',{type:'number', min:0, step:'0.01', value:0.35})),
    h('div',{className:'field'}, h('label',{},'Unit Labour Cost (£)'),
      h('input',{type:'number', min:0, step:'0.01', value:0.20})),
    h('div',{className:'field'}, h('label',{},'Target Margin %'),
      h('input',{type:'number', min:0, step:'1', value:50})),
    h('div',{className:'field'}, h('label',{},'Postage (flat)'),
      h('input',{type:'number', min:0, step:'0.01', value:state.fees.postage_flat})),
    h('div',{className:'field'}, h('label',{},'Platform Fee %'),
      h('input',{type:'number', min:0, step:'0.1', value:state.fees.platform_pct})),
    h('div',{className:'field'}, h('label',{},'Payment Fee (fixed)'),
      h('input',{type:'number', min:0, step:'0.01', value:state.fees.payment_fixed})),
    h('div',{className:'field'}, h('label',{},'Currency'),
      (()=>{ const s=document.createElement('select');
        ['GBP','USD','EUR'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;s.appendChild(o)});
        s.value='GBP'; return s;})()
    ),
    h('div',{className:'field'}, h('label',{},'Customer Name (optional)'),
      h('input',{placeholder:'e.g., Sam'})),
    h('div',{className:'field'}, h('label',{},'Notes (optional)'),
      h('input',{placeholder:'Gift message, colour, deadline...'})),
  );

  const out = h('div', {className:'panel'}, 
    h('h3',{},'Estimate'),
    h('p',{className:'price-lg', id:'qq-total'}, '—'),
    h('div',{className:'kpi', id:'qq-breakdown'}),
  );

  const panel = h('section',{className:'panel'},
    h('h2',{},'Quick Quote'),
    form,
    h('div', {style:'margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;'},
      h('button',{className:'primary', id:'qq-calc'},'Calculate'),
      h('button',{id:'qq-clear'},'Clear')
    )
  );

  root.append(panel, out);

  function calc(){
    Calc.reset();
    const [cat, desc, qtyEl, unitMatEl, unitLabEl, marginEl, postEl, feePctEl, feeFixedEl, curEl] = form.querySelectorAll('select,input');
    const qty = Number(qtyEl.value||0);
    const unitMat = Number(unitMatEl.value||0);
    const unitLab = Number(unitLabEl.value||0);
    const marginPct = Number(marginEl.value||0);
    const postage = Number(postEl.value||0);
    const feePct = Number(feePctEl.value||0);
    const feeFixed = Number(feeFixedEl.value||0);
    const currency = curEl.value;

    Calc.add('Materials', qty, unitMat);
    Calc.add('Labour', qty, unitLab);

    const cfg = { ...state.fees, margin_pct: marginPct, postage_flat: postage, platform_pct: feePct, payment_fixed: feeFixed };
    const t = Calc.total(cfg);

    state.lastQuote = {
      category: cat.value, description: desc.value, qty,
      lines: Calc.lines, totals: t, currency
    };

    $('#qq-total').textContent = formatMoney(t.grand, currency);
    const b = $('#qq-breakdown'); b.innerHTML='';
    [
      ['Subtotal', t.subtotal],
      ['Platform Fees', t.fees],
      ['Postage', t.postage],
      ['Margin', t.margin],
    ].forEach(([label,val])=>{
      const chip = document.createElement('div'); chip.className='chip';
      chip.textContent = `${label}: ${formatMoney(val, currency)}`;
      b.appendChild(chip);
    });
  }

  $('#qq-calc').addEventListener('click', calc);
  $('#qq-clear').addEventListener('click', ()=>{
    form.querySelectorAll('input').forEach(i=>i.value='');
    $('#qq-breakdown').innerHTML=''; $('#qq-total').textContent='—';
  });
}
