import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

import "./globals.css";

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "noteway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-nunito">{children}</body>
    </html>
  );
}
