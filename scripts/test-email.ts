// Sends a test email with the SMTP settings from .env, to check the store's automated emails will work.
//   npm run mail:test -- someone@example.com
import { config } from "dotenv";
config({ override: true });
import { sendMail } from "../src/lib/mail";

async function main() {
  const to = process.argv[2];
  if (!to || !to.includes("@")) {
    console.error("Usage: npm run mail:test -- someone@example.com");
    process.exit(1);
  }
  const configured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  console.log(configured ? `Sending through ${process.env.SMTP_HOST || "smtp.gmail.com"} as ${process.env.SMTP_USER}…` : "SMTP_USER / SMTP_PASSWORD are not set, so the email will only be printed below.");
  const sent = await sendMail({
    to,
    subject: "Chique Bags test email",
    html: "<p>This is a test email from the Chique Bags website. If you can read it, order confirmations and verification codes will reach your customers.</p>",
  });
  console.log(sent ? (configured ? "Sent. Check the inbox (and the spam folder)." : "Done (printed only).") : "Failed. See the error above: usually a wrong app password, or 2-Step Verification is off on the Google account.");
  process.exit(sent ? 0 : 1);
}

main();
