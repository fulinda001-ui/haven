import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haven · 栖境",
  description: "A quiet place to emotionally escape reality for a little while.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
