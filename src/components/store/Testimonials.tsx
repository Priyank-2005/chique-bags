import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";

/** Customer reviews for the homepage. */
export default function Testimonials() {
  return (
    <section className="bg-blush" aria-labelledby="testimonials-title">
      <div className="wrap py-16 lg:py-24">
        <div className="mb-12 text-center">
          <p className="eyebrow">Kind words</p>
          <h2 id="testimonials-title" className="h-display mt-4 text-4xl sm:text-5xl">Loved by our <em>customers</em></h2>
          <span className="rule" />
          <p className="mx-auto mt-5 max-w-md text-sm text-muted">Reviews our customers have written about their bags and their experience with us.</p>
        </div>

        <ul className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="flex flex-col justify-between border border-line bg-white p-7 sm:p-9">
              <div>
                <div className="flex items-center gap-1" role="img" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} strokeWidth={1.5} className={i < t.rating ? "fill-gold text-gold" : "text-[#d6cbb8]"} />
                  ))}
                </div>
                <blockquote className="mt-5 font-serif text-[1.15rem] leading-[1.6] text-ink sm:text-[1.22rem]">
                  {t.text}
                </blockquote>
              </div>
              <footer className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream font-serif text-lg text-gold">{t.name[0]}</span>
                <span className="text-sm">
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">{t.source}</span>
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
