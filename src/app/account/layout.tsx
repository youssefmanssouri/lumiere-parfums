import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Account",
  description: "Manage your profile, order history, and personal luxury concierge preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
