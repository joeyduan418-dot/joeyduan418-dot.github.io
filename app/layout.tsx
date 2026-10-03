import type { Metadata } from "next";
import "./globals.css";
import "./workbench.css";
import "./desk-refinement.css";
import "./resume-direct.css";
import "./personal-archive.css";
import "./font-faces.css";
import "./typography.css";
import "./desk-home.css";
import "../components/resume-prop.css";
import "./site-status.css";

export const metadata: Metadata = {
  title: "段静怡 · Visual Designer",
  description: "段静怡的个人创意档案与视觉设计作品集。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><head><link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/noto-sans-sc-ui.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>;
}
