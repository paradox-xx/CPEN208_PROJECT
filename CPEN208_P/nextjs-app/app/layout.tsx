import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CENG Department Portal",
  description:
    "Computer Engineering Department academic portal — student records, fees, enrollment, and staffing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
