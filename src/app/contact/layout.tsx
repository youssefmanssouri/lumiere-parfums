import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Concierge | Bespoke Inquiries",
  description:
    "Connect with the Lumière Parfums concierge for bespoke consultations, private boutique appointments, and customer assistance.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Concierge | Lumière Parfums",
    description: "Connect with the Lumière Parfums concierge for bespoke consultations and appointments.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
