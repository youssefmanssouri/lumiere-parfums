import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "View and edit the fragrances in your luxury shopping bag.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
