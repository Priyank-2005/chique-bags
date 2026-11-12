import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, limit, ok, parseBody } from "@/lib/api";
import { issueCode } from "@/lib/codes";
import { sendVerificationCode } from "@/lib/emails";
import { emailSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const schema = z.object({ email: emailSchema });
const COOLDOWN_MS = 30_000;

// Sign in or register with an email code, step 1: email a 6-digit code to the address typed.
// Used at checkout ("Get OTP") and on the login page ("Email me a code").
export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { email } = parsed.data;

  const limited = await limit(req, "email-code", 6, 10 * 60_000, email);
  if (limited) return limited;

  // Store accounts (the owner's admin login) are not customers and never get a customer code.
  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (existing && existing.role !== "CUSTOMER") return fail("This email belongs to a store account. Please use a different email.", 400);

  const recent = await prisma.verificationCode.findFirst({ where: { email, purpose: "CHECKOUT", createdAt: { gt: new Date(Date.now() - COOLDOWN_MS) } } });
  if (recent) return fail("A code was just sent. Please wait a few seconds before asking for another.", 429);

  const code = await issueCode(email, "CHECKOUT");
  await sendVerificationCode(email, code, "CHECKOUT");
  return ok({ ok: true });
}
