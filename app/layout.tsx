import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PHProvider } from "@/components/providers/PostHogProvider";
import AuthModal from "@/components/ui/AuthModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FocusSharp — Free Focus Timer, Flow Timer & Deep Work Tracker",
    template: "%s | FocusSharp",
  },
  description:
    "Free focus timer and flow timer app. Use Pomodoro mode or open-ended flow sessions to track deep work and study time by category. No signup required.",
  keywords: [
    "focus timer",
    "focus flow timer",
    "flow timer",
    "pomodoro timer",
    "study timer app",
    "deep work timer",
    "flowtime timer",
    "time tracking by category",
    "focus app for students",
    "pomodoro app no signup",
    "deep work tracker",
    "focus session tracker",
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
        url: "/og?title=Focus Timer, Pomodoro %26 Deep Work Tracker&subtitle=Minimal. No gamification. Just pure focus.",
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
    images: ["/og?title=Focus Timer, Pomodoro %26 Deep Work Tracker&subtitle=Minimal. No gamification. Just pure focus."],
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/icon.svg",
    shortcut: "/favicon.ico",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FocusSharp",
              url: "https://focussharp.app",
              description: "Minimal focus timer and time tracking for deep work, study sessions, and flow states.",
            }),
          }}
        />
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
        <PHProvider>
          {children}
          <AuthModal />
          <Analytics />
        </PHProvider>
      </body>
    </html>
  );
}
