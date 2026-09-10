import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://docxume.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DocXume – Free & Professional Resume, CV & Cover Letter Builder",
  description:
    "Create free, professional resumes, CVs, and cover letters in minutes. No signup or login required. Edit in your browser, preview in real time, and download a high-quality PDF.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "DocXume",
    title: "DocXume – Free & Professional Resume, CV & Cover Letter Builder",
    description:
      "Create free, professional resumes, CVs, and cover letters in minutes. No signup or login required. Edit in your browser and download a high-quality PDF.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "DocXume – Free & Professional Resume, CV & Cover Letter Builder",
    description:
      "Create free, professional resumes, CVs, and cover letters in minutes. No signup or login required.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "DocXume",
      description:
        "Free, professional resume, CV, and cover letter builder. No signup or login required.",
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/templates`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DocXume",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#softwareapplication`,
      name: "DocXume",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "A free, browser-based resume, CV, and cover letter builder. Edit in-browser and download a high-quality PDF with no signup or login required.",
    },
  ],
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5152470932827508" crossOrigin="anonymous"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Noto+Sans:wght@400;700&family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600;700&family=Georgia&family=Merriweather:wght@400;700&family=Noto+Serif:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
