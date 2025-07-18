import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "./composants/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Image to PDF - Convertisseur d'images en PDF",
  description: "Convertissez facilement vos images en fichier PDF avec notre outil en ligne gratuit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
