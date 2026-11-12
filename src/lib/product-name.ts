const ARTICLES = new Set(["the", "a", "an"]);

/**
 * Puts the colour inside the product name, after its first word: "Ara Embellished" in Lilac becomes
 * "Ara Lilac Embellished". A leading "The", "A" or "An" is skipped, so "The Petite Sling" becomes
 * "The Petite Lilac Sling" rather than "The Lilac Petite Sling". A name that already contains the colour is left alone,
 * so it is safe to apply more than once.
 */
export function nameWithColour(name: string, colour: string | null | undefined): string {
  const c = colour?.trim();
  const base = name.trim();
  if (!c || !base) return name;
  if (base.toLowerCase().includes(c.toLowerCase())) return name;
  const words = base.split(/\s+/);
  const at = words.length > 1 && ARTICLES.has(words[0].toLowerCase()) ? 2 : 1;
  words.splice(Math.min(at, words.length), 0, c);
  return words.join(" ");
}
