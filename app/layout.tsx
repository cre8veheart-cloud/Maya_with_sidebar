import "./globals.css";
import type { Metadata } from "next";
import SidebarLayout from "@/components/SidebarLayout";

export const metadata: Metadata = {
  title: "Maya",
  description: "Maya — your AI assistant with sidebar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#1a1a2e] text-[#e2e8f0]">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
