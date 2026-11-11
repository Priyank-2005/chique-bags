import { fail, limit, ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { getPaymentSession } from "@/lib/checkout";

export const dynamic = "force-dynamic";

// Starts (or resumes) payment for an order that is still unpaid. Needs the customer's login or the order's link token.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  const body = (await req.json().catch(() => ({}))) as { accessToken?: string };
  const token = typeof body.accessToken === "string" ? body.accessToken : null;
  if (!user && !token) return fail("Order not found.", 404);
  const limited = await limit(req, "pay", 20, 10 * 60_000, user?.id ?? token ?? "");
  if (limited) return limited;
  const { id } = await params;
  const result = await getPaymentSession(id, { userId: user?.id, token });
  if (!result.ok) return fail(result.error, result.status);
  return ok(result);
}
