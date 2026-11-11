import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

let client: Razorpay | null = null;

/** The public key id. `RAZORPAY_KEY_ID` is preferred; the older NEXT_PUBLIC_ name still works. */
export function getKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function isGatewayConfigured(): boolean {
  return Boolean(getKeyId() && process.env.RAZORPAY_KEY_SECRET);
}

/** True when the keys are Razorpay test keys (rzp_test_…): no real money moves. */
export function isTestMode(): boolean {
  return getKeyId().startsWith("rzp_test_");
}

/**
 * In development, with no Razorpay keys, checkout falls back to a built-in
 * "test payment" so the full order flow can be tried. Never allowed in production.
 */
export function isSimulatedPaymentAllowed(): boolean {
  return !isGatewayConfigured() && process.env.NODE_ENV !== "production";
}

export function getRazorpay(): Razorpay | null {
  if (!isGatewayConfigured()) return null;
  if (!client) client = new Razorpay({ key_id: getKeyId(), key_secret: process.env.RAZORPAY_KEY_SECRET! });
  return client;
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function verifyPaymentSignature(razorpayOrderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Razorpay's own message for an API error, when it gave one. */
export function razorpayErrorMessage(err: unknown, fallback = "Razorpay could not process this request."): string {
  return (err as { error?: { description?: string } })?.error?.description ?? fallback;
}

export type PaymentCheck = { ok: true } | { ok: false; reason: string };

/**
 * Asks Razorpay what really happened to a payment: it must belong to this gateway order, be for the
 * right amount, and end up captured (an authorised-only payment is captured here).
 * If Razorpay can't be reached we trust the already-verified signature rather than lose a paid order.
 */
export async function checkPayment(paymentId: string, razorpayOrderId: string, amountRupees: number): Promise<PaymentCheck> {
  const rp = getRazorpay();
  if (!rp) return { ok: false, reason: "Online payment is not configured." };
  try {
    let p = await rp.payments.fetch(paymentId);
    if (p.order_id !== razorpayOrderId) return { ok: false, reason: "This payment belongs to a different order." };
    if (Number(p.amount) !== amountRupees * 100 || p.currency !== "INR") return { ok: false, reason: "The paid amount does not match the order total." };
    if (p.status === "authorized") p = await rp.payments.capture(paymentId, amountRupees * 100, "INR");
    if (p.status !== "captured") return { ok: false, reason: `The payment is ${p.status}.` };
    return { ok: true };
  } catch (err) {
    const description = (err as { error?: { description?: string } })?.error?.description;
    // A definite answer from Razorpay (for example "payment not found") is a failure; a network error is not.
    if (description) return { ok: false, reason: description };
    console.error("Could not reach Razorpay to confirm a payment", err);
    return { ok: true };
  }
}

/** Finds a successful payment on a gateway order (used when a customer paid but the confirmation never arrived). */
export async function findPaidPayment(razorpayOrderId: string, amountRupees: number): Promise<string | null> {
  const rp = getRazorpay();
  if (!rp) return null;
  const list = await rp.orders.fetchPayments(razorpayOrderId);
  for (const p of list.items) {
    if (Number(p.amount) !== amountRupees * 100) continue;
    if (p.status === "captured") return p.id;
    if (p.status === "authorized") {
      const c = await rp.payments.capture(p.id, amountRupees * 100, "INR");
      if (c.status === "captured") return c.id;
    }
  }
  return null;
}
