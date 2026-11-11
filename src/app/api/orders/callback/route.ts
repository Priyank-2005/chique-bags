import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmOnlinePayment, markPaymentFailed } from "@/lib/checkout";
import { guestQuery } from "@/lib/order-access";
import { checkPayment, verifyPaymentSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * Razorpay sends the customer's browser here (a POST) when a payment had to leave the page, for example
 * a bank's 3-D Secure page or a UPI app on a phone, so the checkout page could not receive the result itself.
 * The signature identifies the payment, so no login cookie is needed. The customer then lands on a normal page.
 */
export async function POST(req: Request) {
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  const form = await req.formData().catch(() => null);
  const get = (k: string) => (typeof form?.get(k) === "string" ? (form!.get(k) as string) : "");

  const razorpayOrderId = get("razorpay_order_id");
  const paymentId = get("razorpay_payment_id");
  const signature = get("razorpay_signature");

  // On failure Razorpay sends the order id inside error[metadata].
  let failedOrderId = razorpayOrderId;
  if (!failedOrderId) {
    try {
      failedOrderId = JSON.parse(get("error[metadata]") || "{}").order_id ?? "";
    } catch {
      failedOrderId = "";
    }
  }
  const order = failedOrderId ? await prisma.order.findUnique({ where: { razorpayOrderId: failedOrderId } }) : null;
  if (!order) return go("/order-failed");
  const q = `id=${order.id}${guestQuery(order.userId ? null : order.accessToken)}`;

  if (!paymentId || !signature || !verifyPaymentSignature(order.razorpayOrderId!, paymentId, signature)) {
    await markPaymentFailed(order.id);
    return go(`/order-failed?${q}`);
  }
  const check = await checkPayment(paymentId, order.razorpayOrderId!, order.total);
  if (!check.ok) {
    await markPaymentFailed(order.id);
    return go(`/order-failed?${q}`);
  }
  await confirmOnlinePayment(order.id, paymentId);
  return go(`/order-success?${q}`);
}
