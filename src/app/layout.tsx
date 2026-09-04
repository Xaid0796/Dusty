import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocXume - Professional Resume, CV & Cover Letter Builder",
  description: "Create stunning professional resumes, CVs, and cover letters in minutes. Edit in browser, preview in real time, and download as high-quality PDFs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5152470932827508" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Noto+Sans:wght@400;700&family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600;700&family=Georgia&family=Merriweather:wght@400;700&family=Noto+Serif:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
