"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, UtensilsCrossed } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Hubungi Kami" },
];

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-tfc-brown/90 backdrop-blur-xl shadow-[0px_4px_22px_0px_rgba(0,0,0,0.15)]"
    >
      <nav className="max-w-[1444px] mx-auto px-6 md:px-11 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative shrink-0 flex items-center gap-3">
          <Image
            src="/images/logo_bg.svg"
            alt="Teras Fried Chicken"
            width={180}
            height={74}
            className="h-[45px] md:h-[60px] w-auto rounded-lg"
            priority
          />
        </Link>

        {/* Desktop Nav & CTA */}
        <div className="hidden md:flex items-center gap-[45px]">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[16px] font-body font-medium text-white/90 tracking-[0.4px] hover:text-tfc-orange transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-[18px]">
            <Link
              href="/order"
              className="border border-tfc-orange text-tfc-orange font-body font-bold text-[14px] uppercase tracking-[0.8px] px-7 py-[10px] rounded-[6px] hover:bg-tfc-orange hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Demo Order POS
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="md:hidden text-white" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-tfc-brown border-l border-tfc-orange/10 w-72"
          >
            <div className="flex flex-col gap-8 mt-8">
              <Link href="/">
                <Image
                  src="/images/logo_bg.svg"
                  alt="Teras Fried Chicken"
                  width={120}
                  height={50}
                  className="h-[50px] w-auto rounded-lg"
                />
              </Link>
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base font-body font-medium text-white/70 hover:text-tfc-orange transition-colors duration-300 tracking-wide"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/order"
                className="inline-flex justify-center border border-tfc-orange text-tfc-orange font-body font-bold text-sm uppercase tracking-[0.8px] px-5 py-3 rounded-[6px] hover:bg-tfc-orange hover:text-white transition-all duration-300"
              >
                Demo Order POS
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
