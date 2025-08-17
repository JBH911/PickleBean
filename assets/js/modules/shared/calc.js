/* Pricing engine scaffolding.
   Extend Calc.parts(...) within categories to compute lines, fees, totals.
*/
export class Calc {
  static lines = []; // [{label, qty, unit, cost}]
  static reset(){ this.lines = []; }

  static add(label, qty, unitCost){
    const cost = qty * unitCost;
    this.lines.push({ label, qty, unit: unitCost, cost });
  }

  static subtotal(){
    return this.lines.reduce((a,b)=>a+b.cost,0);
  }

  static platformFees(subtotal, cfg){
    // Example: Etsy 6.5% + fixed 20p payment fee; tweak in Settings.
    const pct = (cfg.platform_pct || 0) / 100;
    const fixed = cfg.payment_fixed || 0;
    return subtotal * pct + fixed;
  }

  static postage(cfg){
    // simple placeholder
    return cfg.postage_flat || 0;
  }

  static margin(subtotal, cfg){
    const pct = (cfg.margin_pct || 0) / 100;
    return subtotal * pct;
  }

  static total(cfg){
    const sub = this.subtotal();
    const fees = this.platformFees(sub, cfg);
    const post = this.postage(cfg);
    const margin = this.margin(sub, cfg);
    return {
      subtotal: sub,
      fees, postage: post, margin,
      grand: sub + fees + post + margin
    };
  }
}
