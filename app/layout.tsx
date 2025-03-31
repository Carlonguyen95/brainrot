import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import GoogleAdSenseScript from "@/components/ads/google-adsense-script";
import GoogleAnalytics from "@/components/tracking/google-tag-manager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brain Rot Dictionary",
  description: "The ultimate dictionary for internet slang and memes",
  keywords:
    "brain rot, brainrot, gen z slang, internet slang, tiktok slang, viral terms, internet culture",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics measurementId="G-YBXEK3KYDQ" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary
          fallback={<div>Something went wrong. Please try again later.</div>}
        >
          <AuthProvider>
            <GoogleAdSenseScript />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
