import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Providers from "@/components/shared/Providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tensaiconsultancy.com"),
  title: "Tensai — The Way of Global Career",
  description: "The Way of Global Career. Tensai connects verified students with global institutions through a transparent, fraud-proof digital ecosystem.",
  keywords: ["global career", "study abroad", "Japan", "student visa", "agency", "Tensai"],
  openGraph: {
    title: "Tensai — The Way of Global Career",
    description: "The Way of Global Career. Tensai connects verified students with global institutions through a transparent, fraud-proof digital ecosystem.",
    siteName: "Tensai",
    type: "website",
    // No explicit `images` here — the sibling opengraph-image.tsx file
    // convention supplies a branded 1200x630 logo+tagline card and cascades
    // to every route that doesn't define its own override.
  },
  twitter: {
    card: "summary_large_image",
    title: "Tensai — The Way of Global Career",
    description: "The Way of Global Career. Connect. Verify. Succeed.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${sora.variable} min-h-full bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
