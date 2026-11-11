"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payWithRazorpay } from "@/lib/razorpay-client";

/** Finishes payment for an existing unpaid order (no second order is created). */
export default function PayNowButton({ orderId, token, label = "Pay now", className = "btn btn-dark" }: { orderId: string; token?: string | null; label?: string; className?: string }) {
  const q = token ? `&t=${encodeURIComponent(token)}` : "";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token ?? undefined }) });
    const b = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setMessage(b.error ?? "Could not start the payment. Please try again.");
    }
    if (b.paid) return router.push(`/order-success?id=${orderId}${q}`);
    if (b.simulated) {
      // Built-in test payment (development only, when no Razorpay keys are set)
      const v = await fetch("/api/orders/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, accessToken: token ?? undefined }) });
      return router.push(v.ok ? `/order-success?id=${orderId}${q}` : `/order-failed?id=${orderId}${q}`);
    }
    await payWithRazorpay(b, {
      onSuccess: () => router.push(`/order-success?id=${orderId}${q}`),
      onFailure: () => router.push(`/order-failed?id=${orderId}${q}`),
      onDismiss: () => setBusy(false),
      onLoadError: () => {
        setBusy(false);
        setMessage("Could not load the payment window. Check your connection and try again.");
      },
    });
  }

  return (
    <>
      <button type="button" className={className} onClick={pay} disabled={busy}>{busy ? "Opening payment…" : label}</button>
      {message && <p role="alert" className="mt-3 w-full text-sm font-medium text-berry">{message}</p>}
    </>
  );
}
