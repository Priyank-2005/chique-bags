"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { splitEmphasis } from "@/lib/banners";

export interface HeroBanner {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  cta2Text: string | null;
  cta2Href: string | null;
  image: string;
  imageMobile: string | null;
  focus: string;
  theme: string;
}

const AUTOPLAY_MS = 6500;

/** A banner with no words of its own is a finished picture: show all of it, uncropped, and let the whole banner be the link. */
const isPicture = (b: HeroBanner) => !b.title && !b.eyebrow && !b.subtitle;

/** Buttons for a picture banner. With none set up in the admin panel it offers "Shop now" and "Gift a bag". */
function pictureButtons(b: HeroBanner): { text: string; href: string }[] {
  const first = { text: b.ctaText || "Shop now", href: b.ctaHref || "/shop" };
  const second = b.cta2Text && b.cta2Href ? { text: b.cta2Text, href: b.cta2Href } : !b.ctaText ? { text: "Gift a bag", href: "/gifting" } : null;
  return second ? [first, second] : [first];
}

export default function HeroBanners({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = banners.length;

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;
  const allPictures = banners.every(isPicture);
  const darkControls = isPicture(banners[index]);

  const mobileButtons = isPicture(banners[index]) ? pictureButtons(banners[index]) : [];

  return (
    <>
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className={`relative isolate overflow-hidden ${allPictures ? "bg-cream" : "bg-ink"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className={allPictures ? "relative aspect-[3168/1344] max-h-[calc(100svh-110px)] w-full" : "relative h-[82svh] min-h-[520px] max-h-[760px] lg:h-[calc(100svh-150px)] lg:min-h-[560px] lg:max-h-[780px]"}>
        {banners.map((b, i) => {
          const active = i === index;
          const light = b.theme !== "dark";
          const picture = isPicture(b);
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
            >
              {/* photo */}
              <div className={`absolute inset-0 ${active ? "scale-100" : "scale-[1.04]"} transition-transform duration-[7000ms] ease-out`}>
                {b.imageMobile ? (
                  <>
                    <Image src={b.imageMobile} alt="" fill priority={i === 0} sizes="100vw" className="object-cover md:hidden" style={{ objectPosition: b.focus }} />
                    <Image src={b.image} alt="" fill priority={i === 0} sizes="100vw" className="hidden object-cover md:block" style={{ objectPosition: b.focus }} />
                  </>
                ) : (
                  <Image src={b.image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: b.focus }} />
                )}
              </div>
              {picture && (b.ctaHref || "/shop") && <Link href={b.ctaHref || "/shop"} tabIndex={-1} aria-hidden="true" className="absolute inset-0 z-10" />}
              {picture && (
                <div className={`absolute left-[5.5%] top-[67%] z-20 hidden gap-3 md:flex ${active ? "hero-copy" : ""}`}>
                  {pictureButtons(b).map((btn, k) => (
                    <Link key={btn.text} href={btn.href} tabIndex={active ? 0 : -1} className={k === 0 ? "btn btn-dark btn-sm" : "btn btn-line btn-sm"}>{btn.text}</Link>
                  ))}
                </div>
              )}
              {/* readability overlay */}
              {!picture && <div className={`absolute inset-0 ${light ? "bg-gradient-to-t from-black/70 via-black/20 to-black/10 md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" : "bg-gradient-to-t from-white/85 via-white/35 to-white/10 md:bg-gradient-to-r md:from-white/85 md:via-white/35 md:to-transparent"}`} />}

              {/* copy */}
              {!picture && <div className="wrap relative flex h-full items-end pb-20 md:items-center md:pb-0">
                <div className={`max-w-xl ${light ? "text-white" : "text-ink"} ${active ? "hero-copy" : ""}`}>
                  {b.eyebrow && <p className={`text-[0.7rem] font-medium uppercase tracking-[0.34em] ${light ? "text-rose-soft" : "text-berry"}`}>{b.eyebrow}</p>}
                  <h2 className="h-display mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
                    {splitEmphasis(b.title).map((p, k) => (p.em ? <em key={k} className={light ? "text-rose-soft" : "text-berry"}>{p.text}</em> : <span key={k}>{p.text}</span>))}
                  </h2>
                  {b.subtitle && <p className={`mt-5 max-w-md text-[0.98rem] leading-relaxed ${light ? "text-white/85" : "text-ink/75"}`}>{b.subtitle}</p>}
                  {(b.ctaText || b.cta2Text) && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {b.ctaText && b.ctaHref && <Link href={b.ctaHref} tabIndex={active ? 0 : -1} className={`btn ${light ? "btn-light" : "btn-dark"}`}>{b.ctaText}</Link>}
                      {b.cta2Text && b.cta2Href && <Link href={b.cta2Href} tabIndex={active ? 0 : -1} className={`btn ${light ? "btn-ghost-light" : "btn-line"}`}>{b.cta2Text}</Link>}
                    </div>
                  )}
                </div>
              </div>}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-3 md:bottom-8" role="tablist" aria-label="Choose slide">
            {banners.map((b, i) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => go(i)}
                className="group grid h-6 w-10 place-items-center"
              >
                <span className={`block h-[2px] w-full transition-all ${darkControls ? (i === index ? "bg-ink" : "bg-ink/30 group-hover:bg-ink/60") : i === index ? "bg-white" : "bg-white/40 group-hover:bg-white/70"}`} />
              </button>
            ))}
          </div>
          <button aria-label="Previous slide" onClick={() => go(index - 1)} className={`absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border backdrop-blur-sm transition lg:grid ${darkControls ? "border-ink/30 text-ink hover:bg-ink hover:text-white" : "border-white/40 text-white hover:bg-white hover:text-ink"}`}><ChevronLeft size={20} /></button>
          <button aria-label="Next slide" onClick={() => go(index + 1)} className={`absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center border backdrop-blur-sm transition lg:grid ${darkControls ? "border-ink/30 text-ink hover:bg-ink hover:text-white" : "border-white/40 text-white hover:bg-white hover:text-ink"}`}><ChevronRight size={20} /></button>
        </>
      )}
    </section>
    {mobileButtons.length > 0 && (
      <div className="flex justify-center gap-3 bg-cream px-4 py-4 md:hidden">
        {mobileButtons.map((btn, k) => (
          <Link key={btn.text} href={btn.href} className={k === 0 ? "btn btn-dark btn-sm" : "btn btn-line btn-sm"}>{btn.text}</Link>
        ))}
      </div>
    )}
    </>
  );
}
