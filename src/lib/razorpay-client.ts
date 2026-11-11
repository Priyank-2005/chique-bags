/** Browser-side helper that opens the Razorpay payment window. */

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
  }
}

export interface PaymentSession {
  orderId: string;
  orderNumber: string;
  accessToken?: string | null; // guests carry this instead of a login
  razorpayOrderId: string;
  amount: number; // paise
  currency: string;
  keyId: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

/** Opens the payment window. The customer can retry inside it; we only move on when it succeeds or is closed. */
export async function payWithRazorpay(
  s: PaymentSession,
  cb: { onSuccess: () => void; onFailure: () => void; onDismiss: () => void; onLoadError: () => void; onAttemptFailed?: () => void }
) {
  if (!(await loadScript()) || !window.Razorpay) return cb.onLoadError();
  const rzp = new window.Razorpay({
    key: s.keyId,
    amount: s.amount,
    currency: s.currency,
    name: "Chique Bags",
    description: `Order ${s.orderNumber}`,
    order_id: s.razorpayOrderId,
    prefill: s.prefill,
    notes: { order: s.orderNumber },
    theme: { color: "#b08d57" },
    // If the payment has to leave this page (a bank's secure page, a UPI app), Razorpay posts the result here.
    callback_url: `${window.location.origin}/api/orders/callback`,
    retry: { enabled: true, max_count: 4 },
    timeout: 900,
    handler: async (r: { razorpay_payment_id: string; razorpay_signature: string }) => {
      const v = await post("/api/orders/verify", { orderId: s.orderId, accessToken: s.accessToken ?? undefined, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
      if (v.ok) cb.onSuccess();
      else cb.onFailure();
    },
    modal: { ondismiss: cb.onDismiss, confirm_close: true },
  });
  rzp.on("payment.failed", () => {
    // A failed attempt: note it, but leave the window open so the customer can try another method.
    post("/api/orders/verify", { orderId: s.orderId, accessToken: s.accessToken ?? undefined, failed: true });
    cb.onAttemptFailed?.();
  });
  rzp.open();
}

/** Starts loading Razorpay's script early so the payment window opens quickly. */
export function preloadRazorpay() {
  void loadScript();
}
