import { adminGuard, fail, ok } from "@/lib/api";
import { syncOrderPayment } from "@/lib/checkout";

export const dynamic = "force-dynamic";

// Asks Razorpay whether an unpaid order was in fact paid, and confirms it if so.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await params;
  const r = await syncOrderPayment(id);
  return r.ok ? ok(r) : fail(r.message, 502);
}
