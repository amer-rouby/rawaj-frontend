<div align="center">

# 🛒 Zaki Supermarket — Web Frontend

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

---

## 📖 Project Overview

**Zaki Supermarket** is a retail management system originally forked from [SmartPharma](https://github.com/amer-rouby/smartpharma-frontend), reusing its Angular architecture, design system, and feature set (dashboard, POS, inventory, purchasing, payments, reporting, i18n) as the base for a **supermarket** business instead of a pharmacy. A dedicated set of "Zaki AI" features (below) has since been built on top of that base specifically for supermarket operations.

**Runs independently of SmartPharma** — different app identity, different backend port (`8082` vs `8081`) — so both can run side by side during development.

## 🤖 Zaki AI Features

Every feature is powered by real, rule-based/statistical backend logic over the store's own data — no paid AI/ML API. Each is toggled per store from **Settings → Zaki Features**, and a disabled feature's route/menu entry disappears for that store.

| # | Feature | Where |
|---|---|---|
| 1 | Smart Inventory Prediction | Stockout date + risk chip on Demand Predictions |
| 2 | Smart Reorder Recommendations | "Reorder Recommendations" tab, opens a pre-filled purchase draft (never auto-submits) |
| 3 | Smart Pricing / Expiry Recommendations | Suggested discounts on the Expiry Report screen |
| 4 | Supplier Order Recommendations | "Recommended Orders" tab on the Suppliers screen |
| 5 | Zaki Owner Dashboard Insights | Insights card on the owner dashboard |
| 6 | Zaki Daily Brief | Daily Brief dialog from the dashboard |
| 7 | Unusual Activity Detection | Unusual Activity screen (never labeled "fraud") |
| 8 | Real-Time Inventory Updates | Stock screens patch live via SSE, no manual refresh |
| 9 | Voice Product Search | Mic button next to product search on the POS screen (hidden if the browser doesn't support speech recognition) |
| 10 | Customer Credit / Debt Management | Customers screens + credit sales/payments on POS |
| 11 | Zaki Assistant | Chat dialog answering from real store data only |
| 12 | Egyptian E-Invoice (ETA) | Status badge + retry action on sale details (shows "not configured" until the backend has real ETA credentials) |
| 13 | Offline-First POS | Works offline: product cache, sales queue, syncs on reconnect, conflicts surface for manual review |

## 🛠 Tech Stack

Angular 22 (standalone components, signals), TypeScript 5.9, Angular Material, RxJS, Chart.js, ngx-translate (ar/en), `@angular/service-worker`.

## 🚀 Running locally

```bash
npm install
npm start
```
Navigate to `http://localhost:4200/`. Requires the [backend](https://github.com/amer-rouby/zaki-supermarket-backend) running on `http://localhost:8082`.

## ⚠️ Known carry-over from the SmartPharma fork

Some copy/validation still reflects the pharmacy origin in places that were never business-critical to rewrite (e.g. batch/expiry framing originally tuned for medicine). Core supermarket workflows (POS, inventory, purchasing, the Zaki AI feature set above) are fully adapted.

## 🔗 Related Repositories

- **Backend**: [zaki-supermarket-backend](https://github.com/amer-rouby/zaki-supermarket-backend)
- **Mobile**: not published yet
- **Forked from**: [smartpharma-frontend](https://github.com/amer-rouby/smartpharma-frontend)

## 📄 License

This project is proprietary and protected by intellectual property rights.
