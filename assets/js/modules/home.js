import { h } from './shared/utils.js';
export async function renderHome(root){
  root.appendChild(h('section',{className:'panel'}, 
    h('h2',{},'Welcome'),
    h('p',{},'This is a lightweight, extensible framework for your pricing calculator.'),
    h('ul',{}, 
      h('li',{},'Add products inside each category module.'),
      h('li',{},'Tweak defaults in Settings and /data/config.json.'),
      h('li',{},'All UI elements and actions are consistent across tabs.'),
    ),
    h('p',{},'Use the "Quick Quote" for simple customer-facing estimates.')
  ));
}
