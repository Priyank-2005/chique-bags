import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmOnlinePayment, markPaymentFailed } from "@/lib/checkout";
import { getRazorpay, verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

interface Entity { id: string; order_id?: string; payment_id?: string; amount: number }
interface WebhookEvent {
  event: string;
  payload?: { payment?: { entity?: Entity }; refund?: { entity?: Entity }; order?: { entity?: { id: string } } };
}

/**
 * Razorpay calls this for payments and refunds, so an order is confirmed even if the customer closed the
 * tab right after paying, and refunds made from the Razorpay dashboard show up here too.
 * Enable these events in the dashboard: payment.captured, payment.failed, order.paid, refund.processed, refund.failed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as WebhookEvent;
  const payment = event.payload?.payment?.entity;
  const refund = event.payload?.refund?.entity;

  // ── Refunds ──
  if (event.event === "refund.processed" || event.event === "refund.failed") {
    const paymentId = refund?.payment_id ?? payment?.id;
    if (!paymentId) return NextResponse.json({ ok: true });
    const order = await prisma.order.findFirst({ where: { razorpayPaymentId: paymentId } });
    if (!order) return NextResponse.json({ ok: true });

    if (event.event === "refund.failed") {
      await prisma.order.update({
        where: { id: order.id },
        data: { needsAttention: true, notes: [order.notes, `Razorpay could not complete a refund (${refund?.id ?? "unknown"}). Check the Razorpay dashboard.`].filter(Boolean).join(" | ") },
      });
      return NextResponse.json({ ok: true });
    }

    // Bring our record in line with what Razorpay has refunded in total.
    const rp = getRazorpay();
    if (rp) {
      try {
        const p = await rp.payments.fetch(paymentId);
        const refunded = Math.min(order.total, Math.round(Number(p.amount_refunded ?? 0) / 100));
        if (refunded > order.refundedAmount) {
          await prisma.order.update({
            where: { id: order.id },
            data: { refundedAmount: refunded, paymentStatus: refunded >= order.total ? "REFUNDED" : "PARTIALLY_REFUNDED" },
          });
        }
      } catch (err) {
        console.error("Could not sync a refund from Razorpay", err);
        return NextResponse.json({ error: "retry" }, { status: 500 }); // Razorpay will deliver it again
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── Payments ──
  const razorpayOrderId = payment?.order_id ?? event.payload?.order?.entity?.id;
  if (!payment || !razorpayOrderId) return NextResponse.json({ ok: true });

  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured" || event.event === "order.paid") {
    // The paid amount must match what we asked for.
    if (payment.amount !== order.total * 100) {
      await prisma.order.update({ where: { id: order.id }, data: { needsAttention: true, notes: "Webhook amount did not match the order total." } });
      return NextResponse.json({ ok: true });
    }
    await confirmOnlinePayment(order.id, payment.id);
  } else if (event.event === "payment.failed") {
    await markPaymentFailed(order.id);
  }
  return NextResponse.json({ ok: true });
}
