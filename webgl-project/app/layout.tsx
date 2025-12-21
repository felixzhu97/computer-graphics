import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "webgl App",
  description: "Created with webgl",
  generator: "dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
