<div align="center">

# 🛒 Rawaj — Retail Platform Web Frontend

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

---

## 📖 Project Overview

**Rawaj** is a multi-business retail management platform. One shared Angular codebase (dashboard, POS, inventory, purchasing, payments, reporting, licensing, i18n) powers several business types, each shipped as its own branded variant. It was originally forked from [SmartPharma](https://github.com/amer-rouby/smartpharma-frontend) and has since grown into its own product with a dedicated set of "Rawaj AI" features (below).

**Runs independently of SmartPharma** — different app identity, different backend port (`8082` vs `8081`) — so both can run side by side during development.

## 🏪 Business Variants

`main` holds the shared, business-agnostic platform. Each business type lives on a long-lived variant branch that is kept in sync by merging `main` into it (never re-implemented), and selects its identity through `environment.brand`.

| Variant branch | Business | `brand` | Default theme |
|---|---|---|---|
| `variant/supermarket` | Supermarket | `supermarket` | Emerald |
| `variant/computer-mobile-shop` | Computer & mobile shop | `techShop` | Indigo |

More business types will be added the same way: a new `variant/<business>` branch with its own `brand`, name and theme, on top of the same core.

## 🤖 Rawaj AI Features

Every feature is powered by real, rule-based/statistical backend logic over the store's own data — no paid AI/ML API. Each is toggled per store from **Settings → Rawaj Features**, and a disabled feature's route/menu entry disappears for that store.

| # | Feature | Where |
|---|---|---|
| 1 | Smart Inventory Prediction | Stockout date + risk chip on Demand Predictions |
| 2 | Smart Reorder Recommendations | "Reorder Recommendations" tab, opens a pre-filled purchase draft (never auto-submits) |
| 3 | Smart Pricing / Expiry Recommendations | Suggested discounts on the Expiry Report screen |
| 4 | Supplier Order Recommendations | "Recommended Orders" tab on the Suppliers screen |
| 5 | Rawaj Owner Dashboard Insights | Insights card on the owner dashboard |
| 6 | Rawaj Daily Brief | Daily Brief dialog from the dashboard |
| 7 | Unusual Activity Detection | Unusual Activity screen (never labeled "fraud") |
| 8 | Real-Time Inventory Updates | Stock screens patch live via SSE, no manual refresh |
| 9 | Voice Product Search | Mic button next to product search on the POS screen (hidden if the browser doesn't support speech recognition) |
| 10 | Customer Credit / Debt Management | Customers screens + credit sales/payments on POS |
| 11 | Rawaj Assistant | Chat dialog answering from real store data only |
| 12 | Egyptian E-Invoice (ETA) | Status badge + retry action on sale details (shows "not configured" until the backend has real ETA credentials) |
| 13 | Offline-First POS | Works offline: product cache, sales queue, syncs on reconnect, conflicts surface for manual review |

Some features are most relevant to specific business types (e.g. expiry recommendations for supermarkets); the per-store toggles let each variant expose only what fits.

## 🎨 Branding & Themes

Five selectable color themes (emerald, indigo, maroon, azure, amber), each with light and dark modes, drive both Angular Material and the app's own color tokens. The default comes from the variant's `brand`; users can change it from **Settings → Appearance**.

## 🛠 Tech Stack

Angular 22 (standalone components, signals), TypeScript 5.9, Angular Material, RxJS, Chart.js, ngx-translate (ar/en), `@angular/service-worker`.

## 🚀 Running locally

```bash
npm install
npm start
```
Navigate to `http://localhost:4200/`. Requires the [backend](https://github.com/amer-rouby/rawaj-backend) running on `http://localhost:8082`.

To work on a specific business, check out its variant branch (`variant/supermarket` or `variant/computer-mobile-shop`) first.

## ⚠️ Known carry-over from the SmartPharma fork

Some copy/validation still reflects the pharmacy origin in places that were never business-critical to rewrite (e.g. batch/expiry framing originally tuned for medicine, and the `PHARMACIST` role value on `main`, which the variant branches already call `CASHIER`). Core workflows (POS, inventory, purchasing, the Rawaj AI feature set above) are fully adapted.

## 🔗 Related Repositories

- **Backend**: [rawaj-backend](https://github.com/amer-rouby/rawaj-backend)
- **Mobile**: not published yet
- **Forked from**: [smartpharma-frontend](https://github.com/amer-rouby/smartpharma-frontend)

## 📄 License

This project is proprietary and protected by intellectual property rights.
