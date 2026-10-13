import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "CommerceLens — Product Information Management & Catalog Quality Gate",
  description:
    "Deterministic catalog quality gating for WooCommerce: 7-point health scoring, Cloudinary URL transformations, and multimodal vision AI enrichment.",
};

import Navbar from "./Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8f6f0] text-stone-900 antialiased selection:bg-stone-900 selection:text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
