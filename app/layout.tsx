import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FocusSharp — Focus Timer & Time Tracking App",
    template: "%s | FocusSharp",
  },
  description:
    "FocusSharp is a minimal, powerful focus timer and time tracking app. Track deep work, study sessions, and flow states by category. No signup required.",
  keywords: [
    "focus timer",
    "pomodoro timer",
    "study timer app",
    "deep work timer",
    "flow timer",
    "time tracking by category",
    "focus app for students",
    "pomodoro app no signup",
  ],
  authors: [{ name: "Sandeep Amarnath", url: "https://staarsolutions.ca" }],
  creator: "Sandeep Amarnath",
  metadataBase: new URL("https://focussharp.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focussharp.app",
    siteName: "FocusSharp",
    title: "FocusSharp — Focus Timer & Time Tracking App",
    description:
      "Track your deep work, study sessions, and flow states with FocusSharp — the minimal focus timer built for makers, students, and professionals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FocusSharp Focus Timer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusSharp — Focus Timer & Time Tracking",
    description:
      "Minimal focus timer with category tracking. No signup. No gamification. Just pure focus.",
    images: ["/og-image.png"],
    creator: "@focussharpapp",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('focussharp-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
