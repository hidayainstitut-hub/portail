import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- C'est cette ligne qu'il fallait ajouter !

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portail - Hidaya Institut",
  description: "Portail de gestion des inscriptions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}