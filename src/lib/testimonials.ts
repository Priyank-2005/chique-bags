export interface Testimonial {
  name: string;
  rating: number;
  text: string;
  source: string;
}

/** Customer reviews, as written by the customers on Google. To add or change one, edit this list. */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Natasha Sharma",
    rating: 5,
    source: "Google review",
    text: "I really loved all the products I received. The quality is excellent, and everything feels very well-made. I also really appreciate the way they deal with their customers. They are very patient, polite, and take the time to explain everything clearly about the products. Overall, I had a really great experience and would definitely recommend them!",
  },
  {
    name: "Hoor1434",
    rating: 5,
    source: "Google review",
    text: "Received my bags today and I’m absolutely in love with them! They are even more beautiful in person—very elegant, unique, and classy. The quality is truly top-notch, and every detail feels so well made. The wait was definitely worth it! I’m really happy with my purchase and would highly recommend this brand to anyone looking for beautiful and premium-quality bags.",
  },
  {
    name: "Shivani Tripathi",
    rating: 5,
    source: "Google review",
    text: "Absolutely loved this purchase! The quality is top-notch, the detailing is beautiful, and the pricing is just perfect! Totally worth every penny. You’ve definitely earned yourself a regular customer. I’ll surely be recommending your website to everyone! Wishing you lots of love, success, and growth ahead. Keep up the amazing work!",
  },
  {
    name: "Nikita Gandhi",
    rating: 5,
    source: "Google review",
    text: "I recently got my bag from them, and I’m honestly so happy with it! The quality and craftsmanship are top-notch, and the attention to detail is truly impressive. The delivery was incredibly quick as well. Had a wonderful experience overall. Highly recommend them to anyone looking for beautifully crafted bags!",
  },
];
