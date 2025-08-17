# Pricing Calculator — Framework

A lightweight, GitHub Pages–friendly framework for a multi-category pricing calculator.
Categories included: **Stickers, Apparel, Engraving, Homeware, Books** plus **Quick Quote** and **Settings**.

## Quick start
1. Create a new GitHub repo and upload these files.
2. Enable **Settings → Pages → Deploy from branch** (root, `/`).
3. Visit your Pages URL and use the tabs.

## Customize
- **Branding:** Edit `assets/css/style.css` variables (`--brand`, fonts, etc.).
- **Defaults:** Edit `/data/config.json` or use the **Settings** tab (persists in localStorage).
- **Category logic:** Implement real cost formulas in `assets/js/modules/<category>.js` using the `Calc` engine.
- **Routing:** Tabs use hash routes (no build step needed).

## Shared actions
All tabs provide consistent actions (Copy Quote, Reset, Export JSON) in the footer.

## Notes
- This is a front-end only app; no server needed.
- The pricing engine (`Calc`) is intentionally minimal; extend as required for materials, labour time, machine time, wastage, discounts, tiered margins, VAT, etc.
