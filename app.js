
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  config: null,
  inputs: {
    width: 6,
    height: 2,
    stickersPerPack: 2,
    wastePct: 0,
    overheadPct: 0,
    includePostage: "no",
    laborRate: null,
    laborMinutes: null,
    laborOverride: null,
  },
  settings: {
    roundStep: 0.10,
    feePct: 6.5,
  },
  results: {}
};

function loadLocalOverrides(){
  try{
    const ov = JSON.parse(localStorage.getItem("pbp_settings")||"{}");
    if (ov.roundStep) state.settings.roundStep = parseFloat(ov.roundStep);
    if (ov.feePct) state.settings.feePct = parseFloat(ov.feePct);
  }catch(e){}
  $("#roundStep").value = state.settings.roundStep.toFixed(2);
  $("#feePct").value = state.settings.feePct.toFixed(1);
}

function saveLocalOverrides(){
  const ov = { roundStep: $("#roundStep").value, feePct: $("#feePct").value };
  localStorage.setItem("pbp_settings", JSON.stringify(ov));
}

function roundToStep(value, step){
  step = parseFloat(step);
  return Math.round(value/step)*step;
}

async function loadConfig(){
  const res = await fetch("data/pricing_calculator_config.json");
  state.config = await res.json();
  $("#metaLine").textContent = `${state.config.meta?.project || "Project"} · Currency: ${state.config.meta?.currency || "GBP"}`;
  buildMaterialsViews();
  buildShippingView();
  applyDefaultsFromConfig();
  recalcAll();
}

function applyDefaultsFromConfig(){
  const p = state.config.products.instagram_tag_stickers_pack_of_2;
  if (p?.sticker_size_in){
    state.inputs.width = p.sticker_size_in.width || 6;
    state.inputs.height = p.sticker_size_in.height || 2;
  }
  state.inputs.stickersPerPack = p?.stickers_per_pack || 2;
  state.inputs.wastePct = p?.waste_margin_pct || 0;
  state.inputs.overheadPct = p?.overhead_pct || 0;
  $("#stickerWidth").value = state.inputs.width;
  $("#stickerHeight").value = state.inputs.height;
  $("#stickersPerPack").value = state.inputs.stickersPerPack;
  $("#wastePct").value = state.inputs.wastePct;
  $("#overheadPct").value = state.inputs.overheadPct;
}

function sectionKV(elemId, obj){
  const el = document.getElementById(elemId);
  el.innerHTML = "";
  for (const [k,v] of Object.entries(obj)){
    const rowKey = document.createElement("div");
    const rowVal = document.createElement("div");
    rowKey.textContent = k;
    rowVal.textContent = typeof v === "number" ? asMoney(v) : String(v);
    el.appendChild(rowKey); el.appendChild(rowVal);
  }
}

function asMoney(n){ return "£" + (Number(n).toFixed(2)); }

function buildMaterialsViews(){
  const v = state.config.materials.vinyl;
  sectionKV("vinylKV", {
    "Roll price": v.roll_price ?? "—",
    "Roll size (in)": v.roll_width_in && v.roll_length_in ? `${v.roll_width_in} × ${v.roll_length_in}` : "—",
    "Cost per sq in": v.cost_per_sq_in ?? "—"
  });

  const t = state.config.materials.transfer_tape;
  sectionKV("tapeKV", {
    "Roll price": t.roll_price ?? "—",
    "Dimensions": t.dimensions ?? "unknown",
    "Cost per sq in": t.cost_per_sq_in ?? "—",
    "Per-pack allocation": t.per_pack_allocation_override ?? "—"
  });
}

function buildShippingView(){
  sectionKV("shipKV", {
    "Envelope (each)": state.config.packaging_postage.envelope.unit_cost,
    "Stamp (2nd)": state.config.packaging_postage.stamp.unit_price
  });
}

function getLaborCost(){
  const o = parseFloat($("#laborOverride").value);
  if (!isNaN(o)) return o;
  const rate = parseFloat($("#laborRate").value);
  const mins = parseFloat($("#laborMinutes").value);
  if (!isNaN(rate) && !isNaN(mins)){
    return (rate/60.0) * mins;
  }
  return 0;
}

function calc(){
  // pull inputs
  const width = parseFloat($("#stickerWidth").value);
  const height = parseFloat($("#stickerHeight").value);
  const qty = parseInt($("#stickersPerPack").value,10);
  const wastePct = parseFloat($("#wastePct").value||0)/100;
  const overheadPct = parseFloat($("#overheadPct").value||0)/100;
  const includePostage = $("#includePostage").value;

  const roundStep = parseFloat($("#roundStep").value||state.settings.roundStep);
  const feePct = parseFloat($("#feePct").value||state.settings.feePct)/100;

  const areaPer = width*height;
  const totalArea = areaPer * qty * (1 + wastePct);
  const vinCostPerSqIn = Number(state.config.materials.vinyl.cost_per_sq_in || 0);
  const vinylCost = totalArea * vinCostPerSqIn;

  // Transfer tape: use cost_per_sq_in if known else allocation override else 0
  const tape = state.config.materials.transfer_tape || {};
  let tapeCost = 0;
  if (tape.cost_per_sq_in){
    tapeCost = totalArea * Number(tape.cost_per_sq_in);
  }else if (tape.per_pack_allocation_override){
    tapeCost = Number(tape.per_pack_allocation_override);
  }

  const packaging = Number(state.config.packaging_postage.envelope.unit_cost || 0);
  const postage = Number(state.config.packaging_postage.stamp.unit_price || 0);
  const labor = getLaborCost();

  const overhead = (vinylCost + tapeCost + packaging + (includePostage==="yes"?postage:0) + labor) * overheadPct;
  const itemBeforeFees = vinylCost + tapeCost + packaging + (includePostage==="yes"?postage:0) + labor + overhead;
  const etsyFee = itemBeforeFees * feePct;
  const finalPrice = roundToStep(itemBeforeFees + etsyFee, roundStep);

  state.results = {vinylCost, tapeCost, packaging, postage, labor, etsyFee, itemBeforeFees, finalPrice, areaPer, totalArea, qty};

  // Update UI
  $("#vinylCost").textContent = asMoney(vinylCost);
  $("#tapeCost").textContent = asMoney(tapeCost);
  $("#packagingCost").textContent = asMoney(packaging);
  $("#postageCost").textContent = asMoney(postage);
  $("#laborCost").textContent = asMoney(labor);
  $("#etsyFee").textContent = asMoney(etsyFee);
  $("#itemBefore").textContent = asMoney(itemBeforeFees);
  $("#finalPrice").textContent = asMoney(finalPrice);
  $("#shipSeparate").textContent = includePostage==="yes" ? "£0.00" : asMoney(postage);

  // quick quote mirror
  const kv = $("#quoteSummaryKV");
  kv.innerHTML = "";
  const add = (k,v)=>{ const a=document.createElement("div"); a.textContent=k; const b=document.createElement("div"); b.textContent=(typeof v==="number")?asMoney(v):String(v); kv.appendChild(a); kv.appendChild(b); };
  add("Qty (stickers per pack)", qty);
  add("Area per sticker (sq in)", areaPer.toFixed(2));
  add("Total vinyl area (sq in)", state.results.totalArea.toFixed(2));
  add("Item price (before fees)", state.results.itemBeforeFees);
  add("Etsy fee", state.results.etsyFee);
  add("Final price", state.results.finalPrice);

  $("#qqItem").textContent = asMoney(finalPrice);
  $("#qqShip").textContent = includePostage==="yes" ? asMoney(0) : asMoney(postage);
  $("#qqGrand").textContent = includePostage==="yes" ? asMoney(finalPrice) : asMoney(finalPrice + postage);
}

function recalcAll(){ calc(); }

function setupTabs(){
  function show(tab){
    $$(".tab-btn").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
    $$(".tab").forEach(sec=>sec.hidden = (sec.id !== `tab-${tab}`));
    window.scrollTo({top:0, behavior:"smooth"});
  }
  $("#homeLogo").addEventListener("click", ()=>show("home"));
  $$(".tab-btn").forEach(btn=>btn.addEventListener("click", ()=>show(btn.dataset.tab)));
  // Quick actions
  $("#btnQuick").addEventListener("click", ()=>show("quick"));
  $("#btnFull").addEventListener("click", ()=>show("stickers"));
}

function setupActions(){
  // Save session to localStorage
  $("#btnSave").addEventListener("click", ()=>{
    const payload = { inputs: {
      width: $("#stickerWidth").value,
      height: $("#stickerHeight").value,
      stickersPerPack: $("#stickersPerPack").value,
      wastePct: $("#wastePct").value,
      overheadPct: $("#overheadPct").value,
      includePostage: $("#includePostage").value,
      laborRate: $("#laborRate").value,
      laborMinutes: $("#laborMinutes").value,
      laborOverride: $("#laborOverride").value,
    }, settings: {
      roundStep: $("#roundStep").value,
      feePct: $("#feePct").value
    }};
    localStorage.setItem("pbp_session", JSON.stringify(payload));
    alert("Saved in your browser.");
  });

  // Export JSON
  $("#btnExport").addEventListener("click", ()=>{
    const out = {
      meta: { exported_at: new Date().toISOString() },
      config: state.config,
      results: state.results,
      customer: {
        name: $("#qName").value,
        email: $("#qEmail").value,
        phone: $("#qPhone").value,
        company: $("#qCompany").value,
        notes: $("#qNotes").value
      }
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pricing_calculator_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Settings overrides
  $("#roundStep").addEventListener("input", ()=>{ saveLocalOverrides(); recalcAll(); });
  $("#feePct").addEventListener("input", ()=>{ saveLocalOverrides(); recalcAll(); });
}

function bindInputs(){
  ["#stickerWidth","#stickerHeight","#stickersPerPack","#wastePct","#overheadPct","#includePostage",
   "#laborRate","#laborMinutes","#laborOverride"].forEach(sel=>{
    $(sel).addEventListener("input", recalcAll);
  });
}

(async function init(){
  loadLocalOverrides();
  setupTabs();
  setupActions();
  bindInputs();
  await loadConfig();
})();
