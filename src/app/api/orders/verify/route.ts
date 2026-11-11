import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { accessWhere } from "@/lib/order-access";
import { confirmOnlinePayment, markPaymentFailed } from "@/lib/checkout";
import { checkPayment, isSimulatedPaymentAllowed, verifyPaymentSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  failed: z.boolean().optional(),
  accessToken: z.string().optional(), // guests prove it is their order with this
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { orderId, razorpayPaymentId, razorpaySignature, failed, accessToken } = parsed.data;

  const access = accessWhere(user, accessToken);
  if (!access) return fail("Order not found.", 404);
  const order = await prisma.order.findFirst({ where: { id: orderId, paymentMethod: "ONLINE", ...access } });
  if (!order || !order.razorpayOrderId) return fail("Order not found.", 404);

  if (failed) {
    await markPaymentFailed(order.id);
    return ok({ ok: false });
  }

  if (order.razorpayOrderId.startsWith("sim_")) {
    // Built-in test payment: only ever allowed when no real gateway is configured outside production.
    if (!isSimulatedPaymentAllowed()) return fail("Invalid payment.", 400);
    const res = await confirmOnlinePayment(order.id, `sim_pay_${Date.now()}`);
    return ok({ ok: res.ok, soldOut: res.soldOut ?? false });
  }

  if (!razorpayPaymentId || !razorpaySignature || !verifyPaymentSignature(order.razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    await markPaymentFailed(order.id);
    return fail("Payment verification failed.", 400);
  }
  // The signature proves the payment; this also confirms the amount and that the money was captured.
  const check = await checkPayment(razorpayPaymentId, order.razorpayOrderId, order.total);
  if (!check.ok) {
    await markPaymentFailed(order.id);
    return fail(check.reason, 400);
  }
  const res = await confirmOnlinePayment(order.id, razorpayPaymentId);
  return ok({ ok: res.ok, soldOut: res.soldOut ?? false });
}
