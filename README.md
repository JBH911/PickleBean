# Pricing Calculator (GitHub Pages)

Static single-page app for PickleBean Press pricing.

## Deploy
Upload the contents of this folder to your GitHub Pages branch (e.g. `main` with Pages enabled).

```
pricing_calculator_app/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── logo.svg
└── data/
    └── pricing_calculator_config.json
```

## Notes
- Tabs: Home (splash), Stickers, Quick Quote, Materials, Postage, Settings.
- Bottom action bar appears on all tabs: Quick Quote, Full Quote, Save, Export.
- Quick Quote includes customer-facing fields (Name, Email, Phone, Company, Notes).
- Pricing formula includes vinyl, optional transfer tape, packaging, optional postage, labor, overhead, and Etsy fee (6.5% default). Rounds to nearest £0.10 by default.
- All values are configurable in `data/pricing_calculator_config.json`.

## Local testing
Open `index.html` directly, or serve with a simple HTTP server:
```sh
python3 -m http.server 8080
```
