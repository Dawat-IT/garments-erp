# Dawat RMG SOFT

Complete Bangladesh RMG (Ready-Made Garments) ERP — same module coverage as a full factory control tower from **Order Confirmation → Shipment & Accounts**.

## Brand
**Dawat RMG SOFT** · Dawat Garments Ltd.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- MongoDB (Mongoose)
- PDF (jsPDF) + Excel (SheetJS) exports on invoices/reports
- Bangla corporate typography (Hind Siliguri + Source Serif 4)

## Modules
Dashboard · Buyers · Orders · T&A · Samples · Costing · Procurement · Inventory · Cutting · Sewing · Finishing · Packing · QC · Shipment · Accounts · Reports · Settings

## Panels (`/enter`)
Super Admin · Owner/Director · Merchandiser · Production Manager · QC Manager · Store Manager · Accounts Manager

## Local setup
```bash
npm install
cp .env.example .env.local
# set MONGODB_URI
npm run dev
```

Open http://localhost:3000 → **Enter ERP** → pick a panel.

## Seed MongoDB
```bash
curl -X POST http://localhost:3000/api/seed
```

## Deploy (Vercel)
1. Push this repo to GitHub
2. Import project in Vercel
3. Set env `MONGODB_URI` and `NEXT_PUBLIC_APP_NAME=Dawat RMG SOFT`
4. Deploy

## License
Private — Dawat Garments Ltd.

# garments-erp
