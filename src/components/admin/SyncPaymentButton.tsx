"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

/** Asks Razorpay whether an unpaid order was in fact paid (for example the customer closed the tab). */
export default function SyncPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function run() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${orderId}/sync-payment`, { method: "POST" });
    const b = await res.json().catch(() => ({}));
    setMsg(b.message ?? b.error ?? "Done");
    setBusy(false);
    router.refresh();
  }
  return (
    <div className="pt-2">
      <button type="button" className="btn btn-line btn-sm" onClick={run} disabled={busy}><RefreshCw size={14} className={busy ? "animate-spin" : ""} /> {busy ? "Checking…" : "Check payment with Razorpay"}</button>
      {msg && <p role="status" className="mt-2 text-xs text-muted">{msg}</p>}
    </div>
  );
}
