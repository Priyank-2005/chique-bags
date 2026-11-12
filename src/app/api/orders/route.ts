import { z } from "zod";
import { fail, limit, ok, parseBody } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { createOrder } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { hasAutoName } from "@/lib/guest-account";
import { getKeyId } from "@/lib/razorpay";
import { addressSchema, cartSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const schema = z.object({
  items: cartSchema,
  address: addressSchema,
  couponCode: z.string().trim().max(40).nullish(),
  expectedTotal: z.number().int().nonnegative().optional(),
  giftBox: z.boolean().optional(),
  giftNote: z.string().trim().max(200, "Gift note can be up to 200 characters").nullish(),
});

// Ordering needs a signed-in customer. At checkout a new or returning customer signs in by verifying their email
// with a code (which creates the account if needed), so there are no anonymous orders.
export async function POST(req: Request) {
  const user = await getSessionUser();
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { items, address, couponCode, expectedTotal, giftBox, giftNote } = parsed.data;

  if (!user) return fail("Please verify your email with the code we send you, then place your order.", 401, { code: "EMAIL_UNVERIFIED" });
  const contactEmail = user.email;

  const limited = await limit(req, "checkout", 12, 10 * 60_000, user.id);
  if (limited) return limited;

  // An account made at checkout starts with a name taken from the email: use the name on the address instead.
  let customerName = user.name;
  if (hasAutoName(user)) {
    customerName = address.name;
    await prisma.user.update({ where: { id: user.id }, data: { name: address.name, ...(user.phone ? {} : { phone: address.phone }) } });
  }

  const result = await createOrder({
    userId: user.id,
    name: customerName,
    email: contactEmail,
    phone: address.phone,
    address,
    items,
    couponCode,
    expectedTotal,
    giftBox,
    giftNote,
  });
  if (!result.ok) return fail(result.error, result.status, { code: result.code, total: result.total });

  return ok(
    {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      accessToken: result.accessToken,
      method: result.method,
      razorpayOrderId: result.razorpayOrderId,
      amount: result.amountPaise,
      currency: "INR",
      keyId: getKeyId() || null,
      simulated: result.simulated ?? false,
    },
    201
  );
}
