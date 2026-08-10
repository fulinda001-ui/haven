import type { Metadata } from "next";
import "./globals.css";

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Haven · 栖境",
    template: "%s · Haven",
  },
  applicationName: "Haven",
  description: "A quiet place to emotionally escape reality for a little while.",
  keywords: ["Haven", "栖境", "emotional escape", "ambient spaces", "mindful pause"],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Haven · 栖境",
    description: "A quiet place to emotionally escape reality for a little while.",
    type: "website",
    siteName: "Haven",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Haven — a quiet place to pause" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haven · 栖境",
    description: "A quiet place to emotionally escape reality for a little while.",
    images: ["/opengraph-image"],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
