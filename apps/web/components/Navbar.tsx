"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/skills", label: "Skills" },
  { href: "/agents", label: "Agents" },
  { href: "/workspace", label: "Workspace" },
  { href: "/editor", label: "Editor" },
  { href: "/docs", label: "Docs" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-xl">☀️</span>
          <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
            SuryaPrajna
          </span>
          <span className="hidden sm:block text-xs text-gray-600 font-mono mt-0.5">सूर्यप्रज्ञा</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>67 skills available</span>
        </div>
      </div>
    </nav>
  );
}
