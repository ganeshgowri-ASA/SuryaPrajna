import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SuryaPrajna — Solar Wisdom",
  description:
    "Universal PV scientific skills workspace. AI-powered solar energy domain expertise across the entire photovoltaic value chain.",
  keywords: ["solar energy", "PV", "photovoltaic", "AI agents", "skills", "pvlib", "IEC standards"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-gray-800/60 mt-20 py-8 px-6 text-center text-gray-600 text-sm">
          <p>
            SuryaPrajna &mdash; Sanskrit: <span className="text-amber-600/70">सूर्यप्रज्ञा</span>{" "}
            &ldquo;Solar Wisdom&rdquo; &mdash; Universal PV scientific skills following the{" "}
            <a
              href="https://agentskills.io"
              className="text-amber-600/70 hover:text-amber-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Agent Skills standard
            </a>
          </p>
          <p className="mt-1 text-gray-700">MIT License &copy; 2026 ASA</p>
        </footer>
      </body>
    </html>
  );
}
