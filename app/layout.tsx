import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "AI chatbot powered by Grok",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
