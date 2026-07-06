import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteConfig } from "@/features/knowledge/api/knowledge-api";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * サイト共通のmetadataを、{@link getSiteConfig}（`site.md`）の内容から動的に組み立てる。
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();

  return {
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.subtitle,
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.subtitle,
      type: "website",
    },
  };
}

/**
 * 全ページ共通のルートレイアウト（フォント読み込み・`<html>`/`<body>`）。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">{children}</body>
    </html>
  );
}
