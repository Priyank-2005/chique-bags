import { z } from "zod";
import { fail, limit, ok, parseBody } from "@/lib/api";
import { getTrackResult } from "@/lib/track";
import { emailSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const schema = z.object({ orderNumber: z.string().trim().toUpperCase().min(5).max(20), email: emailSchema });

// Lets a customer look up an order with order number + the email used. Returns status only, no personal details.
export async function POST(req: Request) {
  const limited = await limit(req, "track", 15, 10 * 60_000);
  if (limited) return limited;
  const parsed = await parseBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const order = await getTrackResult({ orderNumber: parsed.data.orderNumber, email: parsed.data.email });
  if (!order) return fail("We couldn't find an order with those details.", 404);
  return ok({ order });
}
