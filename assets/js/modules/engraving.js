import { h, $, formatMoney } from './shared/utils.js';
import { Calc } from './shared/calc.js';

export async function renderEngraving(root, state){
  const form = h('div',{className:'grid cols-3'},
    h('div',{className:'field'}, h('label',{},'Example Input'),
      h('input',{type:'number', step:'0.01', value:1})
    ),
    h('div',{className:'field'}, h('label',{},'Quantity'),
      h('input',{type:'number', min:1, value:1})
    ),
    h('div',{className:'field'}, h('label',{},'Notes'),
      h('input',{placeholder:'Colour, size, finish…'})
    ),
  );

  const out = h('div',{className:'panel'},
    h('h3',{},'Totals'),
    h('p',{className:'price-lg', id:'total'},'—'),
    h('div',{className:'kpi', id:'breakdown'}),
  );

  const panel = h('section',{className:'panel'},
    h('h2',{},'Engraving'),
    form,
    h('div', {style:'margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;'},
      h('button',{className:'primary', id:'calc'},'Calculate'),
      h('button',{id:'clear'},'Clear')
    )
  );

  root.append(panel, out);

  function calc(){
    Calc.reset();
    const qty = Number(form.querySelectorAll('input')[1].value||0);
    // placeholder example costs
    const unitMat = 0.35;
    const unitLab = 0.20;
    Calc.add('Materials', qty, unitMat);
    Calc.add('Labour', qty, unitLab);

    const t = Calc.total(state.fees);
    root.querySelector('#total').textContent = formatMoney(t.grand);
    const b = root.querySelector('#breakdown'); b.innerHTML='';
    [['Subtotal', t.subtotal],['Platform Fees', t.fees],['Postage', t.postage],['Margin', t.margin]]
      .forEach(([k,v])=>{ const chip=document.createElement('div'); chip.className='chip'; chip.textContent=`${k}: £${v.toFixed(2)}`; b.appendChild(chip); });
  }

  root.querySelector('#calc').addEventListener('click', calc);
  root.querySelector('#clear').addEventListener('click', ()=>{
    form.querySelectorAll('input').forEach(i=>i.value='');
    root.querySelector('#breakdown').innerHTML='';
    root.querySelector('#total').textContent='—';
  });
}
