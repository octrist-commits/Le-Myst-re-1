import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Le Mystere",
  description: "Events • Community • Experiences",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
