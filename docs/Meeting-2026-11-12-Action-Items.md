# Client call, 12 Nov 2026 (16:32 IST): action items

Attendees: Priyanka Vohra (client), Priyank Bohra (developer), Ayushi Sainani.
Source: Gemini notes and transcript (32 pages). Where the summary and the transcript differ, the transcript is followed.
Status column: **Done** = built and tested locally, **Open** = not started, **Blocked** = waiting on the client.

---

## 1. Developer: Priyank Bohra

### Build or change on the site (agreed)

| # | Item | Details | Status |
|---|------|---------|--------|
| 1 | Email OTP at checkout | A "Get OTP" button under the email field sends a code. Entering it verifies the email and **signs the customer in, creating the account if they are new** (no password). Email chosen over phone OTP (SMS costs about ₹5 each without GST, 15-20 paise with GST). Uses the free 500 emails/day. | Done |
| 2 | First-order coupon needs an account | The customer must be signed in to use it; verifying the email at checkout does that, so the coupon then applies. | Done |
| 3 | Order tracking only after login | Remove the "enter your order number" tracking. Customers open orders from their account order list. | Done |
| 4 | Remove the newsletter section | Priyanka saw it on the site and does not want it. If wanted later (templates by email, WhatsApp, SMS) it is a paid extra. | Done |
| 5 | Colour name inside the product name | Colour goes after the first word of the name and changes with the selected colour, e.g. "Ara Lilac Embellished". Applies to all products (title, cart, orders). | Done |
| 6 | Invoice with GST included | GST is inside the price, no separate GST line. Total = product + gift box, shipping free (e.g. 3,500 + 200 = 3,700). | Done |
| 7 | Invoice: remove tax identification details | Optional: show the store email and phone once Priyanka confirms them. | Done |
| 8 | Categories | Keep only the intended ones and delete the extras. Priyanka named Luxury, Clutches and Metal bags. Flapbags needs her confirmation. | Done (four categories live; Flapbags to confirm with Priyanka) |
| 9 | Category image upload | Upload button in Admin > Categories, like product photo upload. She wants to add her own images, not paste links. | Done |
| 10 | Homepage reels section | The reels play on loop, optional start/stop. Tapping a reel opens Instagram; a separate button under each goes to its product page. Videos are stored on our own storage, not embedded from Instagram. | Open |
| 11 | Our Story page | Take the text from the WhatsApp group; add images when received. | Blocked (images) |
| 12 | Logo | Place it once received. | Blocked (logo) |
| 13 | Automated order emails | The emails are built and send through SMTP (confirmation, shipped, delivered, verification codes). Needs the Google account's app password in `SMTP_USER` / `SMTP_PASSWORD`; check it with `npm run mail:test -- you@example.com`. | Code ready, blocked on credentials |
| 14 | Real admin email | Replace the dummy test admin address before launch. Not chargeable. | Blocked (email) |
| 15 | Banners | Priyanka wants to change banner images herself, not the layout. The admin banner manager exists; confirm it covers her needs. The mobile banner is fine since it was made smaller. | Open (confirm) |

### Research and replies owed to the client

| # | Item | Details |
|---|------|---------|
| 16 | Shiprocket research | Regular and express shipping, and whether customers can choose at checkout. International orders. Pin code check (Priyank said it exists). Any fee or commission beyond the usual rates (Priyank guessed none). Whether integration is in the current quotation. Order status updates automatically if integrated, otherwise by hand in admin. |
| 17 | Written hosting breakdown | Free tier: about 3,000 monthly active users and 1 million CDN requests/month. Pro plan: $20/month. Priyank compared it to Shopify at about ₹28-30k/year against ₹20-22k here. Priyanka also asked how many people at once the free plan handles (only an estimate was given). |
| 18 | Quote for extras | After Priyanka's feature list: credit note / exchange system (major backend rework), admin control of homepage reels, product-page reel if out of scope. |
| 19 | Product-page reel | On a product page, show that product's Instagram reel on the right, linking to Instagram. Each product needs its video and reel URL in admin. Waiting for Priyanka's reference example. |

### Process

- Second payment falls due after Priyanka confirms the UI. She agreed.

---

## 2. Client: Priyanka Vohra

1. **Logo**: upload to Google Drive and send the link, tonight (12 Nov). Her email was failing.
2. **Google account access**: the login shared in the group gives a wrong-password error. Retry, or create an app password and share it privately. Blocks the confirmation emails.
3. **Our Story images**: resend them (text is in the group chat).
4. **List of extra features** for the new quotation (credit note / exchange credit, admin control of reels, etc.).
5. **Reference example** for the reel on the product page.
6. **Reel assets**: video files, Instagram URLs, and which product each belongs to.
7. **Re-upload colour photos properly**: select a colour first, then upload that colour's photos, repeat per colour. Use original quality, not the downloaded demo images.
8. **Confirm categories**: three were named on the call, four were set up earlier (Flapbags). Which should stay?
9. **Real admin email**, plus the email and phone to show on invoices (optional).
10. **Read the hosting screenshot** posted in the group.
11. **Test a full order** with the test payment, and confirm the UI. Then pay the second instalment.
12. **Confirm GST status** (she said she would; less important now that phone OTP is dropped).
13. **Shiprocket account details**, if integration goes ahead (inferred, not said on the call).

---

## 3. Conflicts with what was already built (and how they were handled)

- **Guest checkout**: replaced by the email code sign-in. Every order now belongs to an account, so status, tracking and invoices are in the account; the old guest tracking link and the order-number lookup were removed.
- **Coupons**: previously checked by email for guests; now require a logged-in account.
- **Invoices**: showed CGST/SGST/IGST lines and the GSTIN; both removed. Priyanka has a GST registration, so she should confirm with her accountant that invoices without a GST line are fine.
- **Refunds**: the returns system still issues refunds; she only wants exchanges. Refunds stay available in admin; to be discussed with the credit note quote.
- **Colour rule**: "after the first word" reads oddly for names starting with "The". Handled case by case; confirm with her.

## 4. Corrections to the Gemini summary

- It says the colour goes as a **prefix**; the transcript says **after the first word**.
- It says Razorpay test payments carry 1-2% charges; the 1-2% is Razorpay's normal fee on live payments.
- It lists Shiprocket express shipping as settled; it is not.
- The free hosting plan is meant for non-commercial use; a live store may need the $20 Pro plan from launch. Verify before telling the client.

## 5. Not in the current quotation (separate quote)

- Credit note / exchange credit system.
- Managing homepage reels from admin.
- Newsletter (if wanted later).
- Product-page reel (confirm once the reference arrives).
- Shiprocket integration (confirm after research).

---

## 6. What was built (items 1-9 and 13)

No database migration is needed for this batch.

- **Email OTP at checkout:** `POST /api/auth/email-code` and `/api/auth/email-login` (reuse the `VerificationCode` table, 10-minute codes, 5 attempts, 30-second resend gap). A correct code signs the customer in and creates the account if there is none (name guessed from the email, replaced by the delivery address name on the first order). Store/admin emails are refused. `POST /api/orders` requires a signed-in customer. The same code sign-in is on the login page ("Email me a code"). UI: Get OTP button and code box in `CheckoutClient.tsx`; after verifying the page refreshes, the cart is priced again and coupons apply.
- **Coupons:** `evaluateCoupon` requires a signed-in account for any "one use per customer" coupon; the cart and checkout show "Log in or create an account" links (at checkout, verifying the email is enough).
- **Tracking:** `/track` and `/track/invoice` now redirect to My orders (login first); the order-number lookup, its API and the guest tracking link were removed. Guest emails and the order-success page invite the guest to create an account with the same email (their orders attach to it).
- **Newsletter:** footer section, form and API route removed; privacy text updated.
- **Colour in the name:** `src/lib/product-name.ts` puts the colour after the first word (skipping a leading "The/A/An"), on the product title, cart, checkout summary and new order records.
- **Invoice:** no GST lines, GSTIN, HSN or place of supply; lines, gift box, coupon, shipping and total only. Admin Settings now has a short "Invoices" section.
- **Category image upload:** upload button in Admin > Categories (shared helper `src/lib/upload-client.ts`, also used by the product form). A category with no image borrows a bag photo.
- **Emails:** `npm run mail:test`, setup notes in `.env.example` and the README.

Verified locally (type check, production build, API tests with curl, browser checks). Not verified: real emails through Gmail (no credentials here) and a real image upload to Cloudinary.
