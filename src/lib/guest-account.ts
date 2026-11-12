/**
 * A customer who verifies their email at checkout gets an account straight away, before we know their name.
 * It starts with a name made from the email ("priya.shah@x.com" becomes "Priya Shah") and is replaced by the
 * name on their first delivery address.
 */
export function defaultNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.replace(/[._\-+]+/g, " ").replace(/\d+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Customer";
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ").slice(0, 60);
}

/** True while the account still has the name we made up from its email. */
export const hasAutoName = (u: { name: string; email: string }) => u.name === defaultNameFromEmail(u.email);
