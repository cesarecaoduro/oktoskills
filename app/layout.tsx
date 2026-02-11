import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OctoSkills — Visual AI Workflow Orchestration",
  description:
    "Build, connect, and orchestrate AI agent workflows visually with OctoSkills. A node-based editor that puts you in control of your AI pipelines.",
  openGraph: {
    title: "OctoSkills — Visual AI Workflow Orchestration",
    description:
      "Build, connect, and orchestrate AI agent workflows visually with OctoSkills.",
    images: ["/images/mascot_and_text.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
