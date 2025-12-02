import type { Metadata } from "next";
import { Inter, Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const merriweather = Merriweather({ weight: ["300", "400", "700", "900"], subsets: ["latin"], variable: '--font-merriweather' });

export const metadata: Metadata = {
  title: "Simla-Chandigarh Diocese",
  description: "A spiritual companion app for the Diocese of Simla-Chandigarh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${merriweather.variable} font-sans antialiased`}>
        {/* Fallback load for Indian Language Fonts via Google CDN as they might have partial support in next/font */}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          .font-hindi { font-family: 'Noto Sans Devanagari', sans-serif; }
          .font-punjabi { font-family: 'Noto Sans Gurmukhi', sans-serif; }
        `}} />
        {children}
      </body>
    </html>
  );
}