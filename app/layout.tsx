import type { Metadata } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "GameHut CRM",
  description: "GameHut Room Booking and Daily Balance CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#020617",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}