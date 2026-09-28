import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal | Sign In",
  description: "Sign in or register for your private Lumière Parfums account to track orders and curation preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
