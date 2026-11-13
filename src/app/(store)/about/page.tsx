import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCards } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Our story", description: "More than just handbags, it's a dream we are building together. The story of Chique Bags, told by its founder, Priyanka." };
export const dynamic = "force-dynamic";

const STORY = [
  "Chique Bags started with a dream I had carried in my heart for a long time: the dream of building something of my own.",
  "After moving back from Canada, I found myself at a point in life where, although I was happy to be closer to family, I felt that something was missing. I wanted to create something that was mine, something that gave me a sense of purpose and allowed me to turn my love for fashion into something meaningful.",
  "And that's how Chique Bags came to life.",
  "What began as a little idea has slowly become something I hold incredibly close to my heart. Every bag we curate, every order we pack and every customer we get to know is a part of this journey.",
  "At Chique Bags, I want you to find more than just a handbag. I want you to find that one piece that makes your outfit feel complete, that gets you compliments at a gathering, or simply makes you feel a little more dressed up on an ordinary day.",
  "I know there are countless places where you can shop for bags, and that's why every time you choose Chique Bags, it means so much to me. Whether it's your first purchase, your fifth order, or simply a kind message appreciating something we've created, please know that there is a real person behind this brand who notices and appreciates it all.",
  "Your trust, your repeat purchases, your recommendations to friends and family, and even the little messages you send us are what keep this dream growing.",
  "I may have started Chique Bags on my own, but every one of you who shops with us becomes a part of its story.",
  "Thank you for giving a small business like mine a place in your wardrobe and, more importantly, a place in your lives.",
];

export default async function AboutPage() {
  const [[pick], settings] = await Promise.all([getCards({ isFeatured: true }, 1), getSettings()]);
  const photo = settings.storyImage || pick?.image;
  return (
    <>
      <section className="bg-blush">
        <div className="wrap grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="h-display mt-3 text-4xl sm:text-5xl">More than just handbags, it&rsquo;s a dream we are building <em>together</em></h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">Hi, I&rsquo;m Priyanka, the founder of Chique Bags.</p>
          </div>
          {photo && <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden"><Image src={photo} alt="A Chique Bags bag" fill sizes="448px" className="object-cover" /></div>}
        </div>
      </section>

      <section className="wrap max-w-3xl py-20">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          {STORY.map((p) => <p key={p}>{p}</p>)}
        </div>
        <div className="mt-12 border-t border-line pt-8">
          <p className="text-muted">With love and gratitude,</p>
          <p className="mt-2 font-serif text-3xl">Priyanka</p>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-muted">Founder, Chique Bags ❤️</p>
        </div>
        <Link href="/shop" className="btn btn-dark mt-12">Shop the collection</Link>
      </section>
    </>
  );
}
