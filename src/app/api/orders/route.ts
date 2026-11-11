import { z } from "zod";
import { fail, limit, ok, parseBody } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { createOrder } from "@/lib/checkout";
import { getKeyId } from "@/lib/razorpay";
import { addressSchema, cartSchema, emailSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const schema = z.object({
  items: cartSchema,
  address: addressSchema,
  email: emailSchema.optional(), // required when not logged in
  couponCode: z.string().trim().max(40).nullish(),
  expectedTotal: z.number().int().nonnegative().optional(),
  giftBox: z.boolean().optional(),
  giftNote: z.string().trim().max(200, "Gift note can be up to 200 characters").nullish(),
});

// Anyone can order: a logged-in customer is attached to their account, everyone else checks out as a guest.
export async function POST(req: Request) {
  const user = await getSessionUser();
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { items, address, email, couponCode, expectedTotal, giftBox, giftNote } = parsed.data;

  const contactEmail = user?.email ?? email;
  if (!contactEmail) return fail("Please enter your email so we can send your order confirmation.", 400);

  const limited = await limit(req, "checkout", 12, 10 * 60_000, user?.id ?? contactEmail);
  if (limited) return limited;

  const result = await createOrder({
    userId: user?.id ?? null,
    name: user?.name ?? address.name,
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
