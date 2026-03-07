import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TINAOGAN ES- EcoVolunteer",
  description: "Track volunteer attendance and points for school clean-up events at Tinaogan Elementary School",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-green-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
