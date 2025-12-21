import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vr-game App",
  description: "Created with vr-game",
  generator: "vr-game",
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
