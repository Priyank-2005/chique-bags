"use client";

import { useState } from "react";
import StatusBadge, { OrderProgress } from "@/components/store/StatusBadge";
import { formatDate } from "@/lib/utils";

interface Result {
  orderNumber: string;
  status: string;
  courier: string | null;
  trackingUrl: string | null;
  createdAt: string;
  items: { name: string; variantName: string | null; quantity: number }[];
  invoicePath?: string | null;
}

export default function TrackForm({ initial = null }: { initial?: Result | null }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber, email }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setResult(data.order);
    else setError(data.error ?? "Something went wrong");
  }

  return (
    <>
      {!initial && (
      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        <div><label className="label" htmlFor="t-num">Order number</label><input id="t-num" required placeholder="CB-26-00001" className="input uppercase" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} /></div>
        <div><label className="label" htmlFor="t-email">Email</label><input id="t-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {error && <p role="alert" className="rounded-sm bg-blush p-3 text-sm font-medium text-berry">{error}</p>}
        <button className="btn btn-dark" disabled={busy}>{busy ? "Looking…" : "Track order"}</button>
      </form>
      )}

      {result && (
        <div className="card mt-6 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold">{result.orderNumber}</p><p className="text-sm text-muted">Placed {formatDate(result.createdAt)}</p></div>
            <StatusBadge status={result.status} />
          </div>
          <OrderProgress status={result.status} />
          <ul className="space-y-1 text-sm text-muted">{result.items.map((i, n) => <li key={n}>{i.name} · {i.variantName} × {i.quantity}</li>)}</ul>
          <div className="flex flex-wrap gap-3">
            {result.trackingUrl && <a href={result.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm">Track shipment{result.courier ? ` (${result.courier})` : ""}</a>}
            {result.invoicePath && <a href={result.invoicePath} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">View invoice</a>}
          </div>
        </div>
      )}
    </>
  );
}
