import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenField – Crop protection innovation matching",
  description:
    "Connects practical crop protection challenges with innovators ready to test, prove, or scale their solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
