# Chique Bags

Custom e-commerce website for **Chique Bags** (owner: Priyanka Vora), built by Priyank Bohra.
Handcrafted sling and crossbody bags: storefront, checkout, customer accounts, automated emails and an admin panel.

- **Quotation:** [docs/quotation/Chique-Bags-Quotation.pdf](docs/quotation/Chique-Bags-Quotation.pdf)

## Stack

Next.js 16 (App Router) Â· React 19 Â· TypeScript Â· Tailwind CSS 4 Â· PostgreSQL + Prisma Â· iron-session Â· Razorpay Â· Cloudinary Â· Nodemailer (SMTP) Â· Upstash Redis (optional, rate limiting)

## What is in it

**Storefront:** home, shop (side filters for category, price range and colour, search, sort, pagination), product page (photos that follow the chosen colour, colour stock, reviews, JSON-LD), bag drawer and page, checkout (email code sign-in that creates the account, or log in with a password; coupons; prepaid with Razorpay), order success/failed, favourites, login / sign-up with email verification / password reset, account (profile, addresses, orders, invoices, cancel; order status is shown here only), about, contact, policy pages, sitemap and robots.

**Admin (`/admin`):** dashboard (revenue, 7-day chart, low stock, alerts), products (colours with their own photos, stock, Cloudinary photo upload), orders (status flow, tracking, cancel with refund, invoice), customers, categories, coupons, contact messages, store settings.

**Checkout sign-in:** nobody needs a password to buy. At checkout the customer enters their email and taps **Get OTP**; typing the 6-digit code we email (free, no SMS) signs them in, and creates their account if they are new. The same "Email me a code" option is on the login page, and the order API refuses an order without a signed-in customer. An account made this way starts with a name guessed from the email and takes the name on the first delivery address; the customer can set a password any time with "Forgot password". Order status, tracking and invoices are shown in the account only. **Coupons:** one-use-per-customer coupons (such as the first-order coupon) need a signed-in account, which verifying the email provides, so they can't be reused with another email.

**Payments & shipping:** prepaid orders only, paid through Razorpay (UPI, cards, net banking, wallets). Shipping is free on every order. Pincodes are validated at checkout against India Post and the city and state are filled in automatically.

**WhatsApp:** a floating chat button on every page, and an "Enquire about this bag on WhatsApp" button on each product that opens a chat pre-filled with the bag's name, price and link. The store has two numbers (9817742416 and 8708863593): the floating button opens a small list so the customer can pick either, and the product and contact pages show both. Change them in Admin > Settings (comma separated), or with `NEXT_PUBLIC_WHATSAPP_NUMBER`; a 10-digit Indian number gets +91 automatically.

**Returns & refunds:** customers report a damaged, defective or wrong item within 7 days of delivery, with photos, from their order page. The store reviews it in Admin > Returns (requested, approved, item received, refunded or rejected), issues the refund through Razorpay and every step, amount and reference is recorded on the request and on the order. The store can also record a return on a customer's behalf.

**Invoices:** numbered per financial year (CB/26-27/00001), showing each line, the gift box, any coupon and the total the customer paid, with the amount in words. Prices include GST, so there are no separate tax lines, GSTIN or HSN on the invoice (customers see exactly the listed price). Set the business name, address, email and phone in Admin > Settings (the page is at `/admin/settings`). Order contact details, delivery address and private notes can be edited from the admin order page.

**Instagram strip:** the footer shows our bestselling bags in an Instagram-style grid linking to the Instagram profile.

**Homepage banners:** two or three full-width slides (photo, headline, text, buttons) managed in Admin > Banners, with swipe and auto-play.

**Gifting:** a gift box and a handwritten note (up to 200 characters) can be added to any order at checkout. The owner sets the price, on/off and the gift box photo in Admin > Settings. Gift orders are highlighted in the admin order screen with the note to write.

**Emails:** verification codes (sign-up, checkout, password reset), welcome, order confirmation, shipped, delivered, cancelled, owner new-order alert, contact messages. They are sent with `SMTP_*` from `.env` (for Gmail, an App password; see `.env.example`). Check the setup with `npm run mail:test -- you@example.com`.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in the values
npm run db:local            # optional: throw-away local Postgres on port 5544 (Windows, needs PostgreSQL installed)
npx prisma migrate deploy   # create the tables
npm run db:seed             # owner account, categories, sample products, CHIQUE15 / CHIQUE150 coupons
npm run dev                 # http://localhost:3020
```

Sign in to the admin panel at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

### Environment

See [.env.example](.env.example). The database variables are named `PRISMA_DATABASE_URL` and `PRISMA_DATABASE_URL_UNPOOLED` (not `DATABASE_URL`, which many machines already have set globally). Use the pooled Neon URL for the first and the direct (non-`-pooler`) URL for the second.

Without SMTP credentials, emails are printed to the server log. Without Razorpay keys (development only), checkout shows a built-in **test payment** so the whole order flow can be tried; this is disabled in production.

### Photos

The sample products, banners and gift box use real stock photographs (Unsplash, free licence) as placeholders. They are uploaded to Cloudinary by `node scripts/stock-photos.mjs` (Cloudinary fetches them by URL) and listed in `prisma/seed-images.json`. Replace them with the client's own photos: product photos in Admin > Products (each colour has its own photos; a colour with none shows the product's main photos), homepage slides in Admin > Banners, gift box and story photos in Admin > Settings.

### Backups and recovery

- **Database (Neon):** Neon keeps a continuous history of the database and can restore it to an earlier point in time (or branch from it) from the Neon console. How far back you can go depends on the Neon plan, so confirm the history window on the plan you use. For an independent copy, export it from time to time:
  ```bash
  pg_dump "<PRISMA_DATABASE_URL_UNPOOLED>" -Fc -f chique-backup.dump
  # restore into an empty database with: pg_restore -d "<new database url>" chique-backup.dump
  ```
- **Photos:** stored on Cloudinary.
- **Code:** stored on GitHub; the site can be redeployed on Vercel from any commit.

### Setting up the Neon database

Put the Neon URLs in `.env` (`PRISMA_DATABASE_URL` pooled, `PRISMA_DATABASE_URL_UNPOOLED` direct), then:

```bash
npx prisma migrate deploy
npm run db:seed
```

### Razorpay

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (use the `rzp_test_` keys while testing: the checkout then shows test-card instructions, and the live `rzp_live_` keys once the business is verified).

What is wired up:
- **Checkout:** the payment window opens on the order page with the customer's details filled in; a customer can retry a failed attempt inside it. If a payment has to leave the page (a bank's secure page, a UPI app), Razorpay posts the result to `/api/orders/callback`.
- **Confirmation:** every payment is verified by signature and then checked with Razorpay for the right amount and for capture, before the order is marked paid and stock is taken.
- **Resume:** a customer who closes the window can pay for the same order from the "Payment didn't go through" page or from the order in their account, without a second order. If the money did arrive, the order is simply confirmed.
- **Admin:** each order links to the payment at Razorpay, and an unpaid order has a "Check payment with Razorpay" button.
- **Refunds:** full (on cancellation) or partial (through Returns) refunds are sent to Razorpay and recorded with their reference.

**Webhook (recommended):** in the Razorpay dashboard add a webhook to `https://<your-domain>/api/webhooks/razorpay` with the events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed` and `refund.failed`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`. It confirms an order when a customer pays and then closes the tab, and records refunds issued from the Razorpay dashboard.

For live payments Razorpay requires the website domain to be added in the dashboard (Account & Settings, Website and app settings).

## Order and stock rules

- Prices, coupons, shipping and stock are always recalculated on the server; the browser is never trusted.
- Stock is reduced when an order is confirmed (after payment is verified) with a `stock >= quantity` guard, so it can never go negative. If two customers pay for the last piece, the second order is flagged "needs attention" on the dashboard.
- Cancelling an order restores stock, releases the coupon and refunds online payments through Razorpay.

## Deploying

Vercel + Neon. Set the environment variables, run `npx prisma migrate deploy` and `npm run db:seed` once against the production database, then add the Razorpay webhook.
