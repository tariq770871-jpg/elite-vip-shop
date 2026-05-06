import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://my-project-vipmarket.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";
const SITE_DESCRIPTION =
  "متجركم الإلكتروني المتكامل - تطبيقات، أدوات ذكاء اصطناعي، أكاديمية، وربح من الإنترنت. أفضل المنتجات الرقمية بأسعار تنافسية مع ضمان الجودة.";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ELITE VIP",
    "متجر النخبة",
    "متجر إلكتروني",
    "ذكاء اصطناعي",
    "تطبيقات",
    "أكاديمية",
    "ربح من الإنترنت",
    "تسوق عربي",
    "منتجات رقمية",
    "VIP Shop",
    "دورات تدريبية",
    "أدوات AI",
    "تطبيقات مجانية",
  ],
  authors: [{ name: "Elite VIP Shop", url: SITE_URL }],
  creator: "Elite VIP Shop",
  publisher: "Elite VIP Shop",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#d4a843" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
