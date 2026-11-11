import type { Metadata } from "next";
import TrackForm from "@/components/store/TrackForm";
import { getTrackResult } from "@/lib/track";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ o?: string; t?: string }> }) {
  const { o, t } = await searchParams;
  // The private link from an order email opens the order straight away.
  const initial = o && t ? await getTrackResult({ orderNumber: o, token: t }) : null;
  return (
    <div className="wrap max-w-xl py-14">
      <p className="eyebrow">Order status</p>
      <h1 className="h-display mt-2 text-4xl">Track your order</h1>
      <p className="mt-3 text-muted">{initial ? "Here is where your order stands." : "Enter your order number (from your confirmation email) and the email you used."}</p>
      <TrackForm initial={initial} />
    </div>
  );
}
