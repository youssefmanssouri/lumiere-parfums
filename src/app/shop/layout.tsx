import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Fragrances | Artisanal Perfumery",
  description:
    "Explore the complete Lumière Parfums collection of handcrafted luxury fragrances, niche extrait de parfums, and timeless eau de parfums.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Fragrances | Lumière Parfums",
    description: "Explore the complete Lumière Parfums collection of handcrafted luxury fragrances.",
    url: "/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
