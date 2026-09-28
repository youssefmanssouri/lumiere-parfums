import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityTracker from "@/components/ActivityTracker";
import CartDrawer from "@/components/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumiere-parfums-mu.vercel.app"),
  title: {
    default: "Lumière Parfums | Luxury Fragrance House",
    template: "%s | Lumière Parfums",
  },
  description:
    "Curated luxury fragrance boutique presenting the world's most coveted designer and niche perfumes, including Dior, Creed, Chanel, Maison Francis Kurkdjian, and Xerjoff.",
  keywords: [
    "luxury perfume",
    "niche fragrance",
    "eau de parfum",
    "Dior Sauvage",
    "Creed Aventus",
    "Baccarat Rouge 540",
    "Tom Ford Ombre Leather",
    "luxury perfumery",
    "fragrance house",
  ],
  authors: [{ name: "Youssef Manssouri" }],
  creator: "Youssef Manssouri",
  publisher: "Lumière Parfums",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lumiere-parfums-mu.vercel.app",
    siteName: "Lumière Parfums",
    title: "Lumière Parfums | Luxury Fragrance House",
    description:
      "Curated luxury fragrance boutique presenting the world's most coveted designer and niche perfumes.",
    images: [
      {
        url: "/products/dior-sauvage-edp.jpg",
        width: 1200,
        height: 630,
        alt: "Lumière Parfums - Luxury Fragrance House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumière Parfums | Luxury Fragrance House",
    description:
      "Curated luxury fragrance boutique presenting the world's most coveted designer and niche perfumes.",
    images: ["/products/dior-sauvage-edp.jpg"],
    creator: "@youssefmanssouri",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Lumière Parfums",
  url: "https://lumiere-parfums-mu.vercel.app",
  logo: "https://lumiere-parfums-mu.vercel.app/products/dior-sauvage-edp.jpg",
  description:
    "Luxury fragrance boutique curating exceptional designer and niche perfumes with guaranteed authenticity.",
  founder: {
    "@type": "Person",
    name: "Youssef Manssouri",
  },
  priceRange: "$$$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, White-Glove Handover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <ActivityTracker />
            <Header />
            <CartDrawer />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
