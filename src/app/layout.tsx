import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PMS - Product Management System",
  description: "Professional inventory and product management system with real-time analytics and comprehensive business tools.",
  keywords: ["product management", "inventory", "PMS", "business", "analytics", "e-commerce"],
  authors: [{ name: "PMS Team" }],
  creator: "PMS Team",
  publisher: "PMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.svg?v=3',
    shortcut: '/icon.svg?v=3',
  },
  // Note: metadataBase will be automatically inferred by Next.js in production
  // For custom domains, set NEXT_PUBLIC_APP_URL environment variable
  ...(process.env.NEXT_PUBLIC_APP_URL && {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),
  }),
  openGraph: {
    title: "PMS - Product Management System",
    description: "Professional inventory and product management system with real-time analytics and comprehensive business tools.",
    siteName: 'PMS',
    locale: 'en_US',
    type: 'website',
    // URL will be automatically inferred when metadataBase is set
  },
  twitter: {
    card: 'summary_large_image',
    title: "PMS - Product Management System",
    description: "Professional inventory and product management system with real-time analytics and comprehensive business tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
