import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Stage 0 baseline only - the final display + UI font pairing is chosen in Stage 1.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aether - Things worth having.",
    template: "%s - Aether",
  },
  description:
    "A considered collection of everyday pieces for how you live, work and move.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

