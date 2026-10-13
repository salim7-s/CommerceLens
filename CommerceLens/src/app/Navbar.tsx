"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Package,
  Sparkles,
  RefreshCw,
  Plus,
  Menu,
  X,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/products", label: "Products", icon: Package, exact: false },
    { href: "/agent", label: "Quality Agent", icon: Sparkles, exact: false },
    { href: "/sync-log", label: "Sync History", icon: RefreshCw, exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e2d6] bg-[#f8f6f0]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
              title="Go to CommerceLens Home Page"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-bold text-xs shadow-sm">
                CL
              </div>
              <span className="font-bold text-[15px] tracking-tight text-stone-900">
                Commerce<span className="font-normal text-stone-500">Lens</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#f2ebe0] text-stone-600 border border-[#e2d9cd]">
                PIM
              </span>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              {navLinks.map((link) => {
                const active = isActive(link.href, link.exact);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      active
                        ? "bg-stone-900 text-stone-50 shadow-sm"
                        : "text-stone-600 hover:text-stone-950 hover:bg-[#ede7db]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#ecfdf5] border border-emerald-200/80 text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Store Connected</span>
            </div>

            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#ede7db] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Compact Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e8e2d6] py-3 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-stone-900 text-stone-50"
                      : "text-stone-700 hover:bg-[#ede7db]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-header Quick Navigation Pills for Mobile/Tablet */}
      <div className="md:hidden border-t border-[#e8e2d6] bg-[#f4efe6]/60 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
        {navLinks.map((link) => {
          const active = isActive(link.href, link.exact);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-stone-900 text-stone-50"
                  : "bg-white text-stone-700 border border-[#ded7cb] hover:bg-stone-50"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
