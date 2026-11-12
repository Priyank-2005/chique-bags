import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, limit, ok, parseBody } from "@/lib/api";
import { loginCustomer } from "@/lib/auth";
import { consumeCode } from "@/lib/codes";
import { defaultNameFromEmail } from "@/lib/guest-account";
import { claimGuestOrders } from "@/lib/order-access";
import { emailSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailSchema, code: z.string().trim().length(6, "Enter the 6-digit code") });

// Sign in or register with an email code, step 2. A correct code proves the customer owns the email, so it
// signs them in, creating the account first if there isn't one (no password needed; they can set one later).
export async function POST(req: Request) {
  const limited = await limit(req, "email-login", 15, 10 * 60_000);
  if (limited) return limited;

  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { email, code } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (existing && existing.role !== "CUSTOMER") return fail("This email belongs to a store account. Please use a different email.", 400);

  const result = await consumeCode(email, "CHECKOUT", code);
  if (!result.ok) return fail(result.error, 400);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: defaultNameFromEmail(email), emailVerified: true },
    update: { emailVerified: true },
  });
  await loginCustomer(user.id);
  await claimGuestOrders(user.id, user.email).catch(() => {});
  return ok({ ok: true, created: !existing, user: { id: user.id, name: user.name, email: user.email } });
}
