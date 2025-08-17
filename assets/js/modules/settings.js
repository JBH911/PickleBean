import { h, $, persist } from './shared/utils.js';

export async function renderSettings(root, state){
  const f = state.fees;
  const form = h('div', {className:'grid cols-3'},
    input('Platform Fee %','platform_pct', f.platform_pct, 0.1),
    input('Payment Fee (fixed)','payment_fixed', f.payment_fixed, 0.01),
    input('Default Postage (flat)','postage_flat', f.postage_flat, 0.01),
    input('Default Margin %','margin_pct', f.margin_pct, 1),
    input('Vinyl Roll Cost (£)','materials.vinyl_roll', f.materials.vinyl_roll, 0.01),
    input('Vinyl Roll Width (in)','materials.vinyl_width_in', f.materials.vinyl_width_in, 0.1),
    input('Vinyl Roll Length (ft)','materials.vinyl_length_ft', f.materials.vinyl_length_ft, 0.1),
    input('Transfer Tape Cost (£)','materials.transfer_roll', f.materials.transfer_roll, 0.01),
  );

  const panel = h('section',{className:'panel'},
    h('h2',{},'Settings'),
    h('p',{},'These defaults are used by all categories. You can override them per-quote.'),
    form,
    h('div',{style:'margin-top:14px; display:flex; gap:10px; flexWrap:"wrap"'},
      h('button',{className:'primary', id:'save'},'Save'),
      h('button',{id:'revert'},'Revert to file defaults')
    )
  );
  root.append(panel);

  function input(label, key, value, step){
    const [obj, prop] = key.split('.').length===2 ? key.split('.') : [null, key];
    const v = obj ? value : (value ?? '');
    const el = h('div',{className:'field'},
      h('label',{},label),
      h('input',{type:'number', step:String(step||1), value:v})
    );
    el.dataset.key = key;
    return el;
  }

  $('#save').addEventListener('click', ()=>{
    const overrides = {};
    form.querySelectorAll('.field').forEach(fld=>{
      const key = fld.dataset.key; const val = Number(fld.querySelector('input').value);
      const parts = key.split('.');
      if (parts.length === 2){
        overrides[parts[0]] ||= {};
        overrides[parts[0]][parts[1]] = val;
      } else {
        overrides[key] = val;
      }
    });
    persist('feesOverrides', overrides);
    alert('Saved. Reloading to apply…');
    location.reload();
  });

  $('#revert').addEventListener('click', ()=>{
    localStorage.removeItem('feesOverrides');
    alert('Local overrides cleared. Reloading…');
    location.reload();
  });
}
