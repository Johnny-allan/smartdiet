import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SmartDiet",
  description: "SmartDiet - Inteligencia Nutricional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
