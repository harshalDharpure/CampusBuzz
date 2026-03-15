import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Navigation System | CampusBaze",
  description: "Navigate campus buildings with an interactive map, search, and directions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
