# Truck Management System — Starter (Next.js + Tailwind + shadcn + Google Sheets)

This is a starter skeleton project for the Truck Management System you requested.
It uses the Next.js App Router (JavaScript), TailwindCSS, and shadcn/ui for components.
Backend example routes include placeholders to connect to Google Sheets via the Sheets API.

## What’s included
- Basic Next.js app structure (app/ router)
- Example pages: home, drivers list, add driver, trucks, daily logs
- API route stubs: `/api/drivers` and `/api/daily-logs` showing where to call Google Sheets
- `lib/sheets.js` helper with instructions for service account setup
- Tailwind + globals.css
- README with setup steps

## Important: Google Sheets (Backend)
This starter uses Google Sheets as the backend by demonstrating where to call the Sheets API.
You must:
1. Create a Google Cloud project and a Service Account.
2. Enable Google Sheets API.
3. Create and download a JSON key for the service account.
4. Share your target Google Sheet with the service account email (viewer/editor).
5. Add the key file content to an environment variable or secure secret manager (DO NOT commit it).

See `lib/sheets.js` for a helper and instructions.

## How to run (locally)
1. `npm install`
2. Set necessary environment variables (see `.env.example`).
3. `npm run dev`
4. Open http://localhost:3000

## Files to review
- `app/page.js` — landing
- `app/drivers/page.js`, `app/drivers/new/page.js` — drivers UI
- `app/trucks/page.js` — truck list
- `app/logs/page.js` — daily logs form
- `app/api/drivers/route.js` — API stub for drivers
- `app/api/daily-logs/route.js` — API stub for daily logs
- `lib/sheets.js` — instructions + helper for Google Sheets

## Note
This is a starter. It intentionally keeps things simple and focused on the structure so you can:
- Plug in Google Sheets credentials
- Expand forms, tables, and validation
- Integrate shadcn components or replace UI packages

If you want, I can now:
- Expand the Google Sheets helper to perform CRUD with sample data
- Add more pages (maintenance, docs, invoices)
- Convert to a full template with more components and seeded sample data

Happy building — chips out 🍟
"# Truck-Management-Software" 
"# Truck-Management-Software" 
# Truck-Management-Software 
