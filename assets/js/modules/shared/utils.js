export const $ = (sel, root=document)=>root.querySelector(sel);
export const h = (tag, attrs={}, ...children) => {
  const el = Object.assign(document.createElement(tag), attrs);
  for (const c of children.flat()) {
    if (c == null) continue;
    el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
};
export const formatMoney = (n, currency='GBP') => new Intl.NumberFormat('en-GB', {style:'currency', currency}).format(n);
export const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
export const persist = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
export const restore = (k)=>{ try{ return JSON.parse(localStorage.getItem(k)); }catch{return null} };
