import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

const menuLinks = [
  { href: "/menu#ayam", label: "Ayam Original" },
  { href: "/menu#ayam", label: "Ayam Geprek" },
  { href: "/menu#ayam", label: "Ayam Pedas Nusantara" },
  { href: "/menu#paket", label: "Paket Hemat" },
];

const companyLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/menu", label: "Menu" },
  { href: "/contact", label: "Hubungi Kami" },
];

export function Footer() {
  return (
    <footer className="bg-tfc-dark-brown text-white">
      {/* Main Footer */}
      <div className="max-w-[1280px] mx-auto px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <Link href="/">
              <Image
                src="/images/logo_bg.svg"
                alt="Teras Fried Chicken"
                width={160}
                height={66}
                className="h-[60px] w-auto rounded-lg"
              />
            </Link>
            <p className="font-body font-normal text-[14px] text-white/50 leading-[1.7] max-w-[280px]">
              Ayam goreng khas Indonesia dengan bumbu rempah pilihan. Renyah di
              luar, juicy di dalam. Authentic Indonesian Taste.
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="https://instagram.com/terasfriedchicken"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-tfc-orange transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@terasfriedchicken.id"
                className="text-white/40 hover:text-tfc-orange transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-5">
            <h4 className="font-display font-semibold text-[16px] text-white">
              Menu Kami
            </h4>
            <ul className="flex flex-col gap-3">
              {menuLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="font-body font-normal text-[14px] text-white/50 hover:text-tfc-orange transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div className="flex flex-col gap-5">
            <h4 className="font-display font-semibold text-[16px] text-white">
              Perusahaan
            </h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body font-normal text-[14px] text-white/50 hover:text-tfc-orange transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="flex flex-col gap-5">
            <h4 className="font-display font-semibold text-[16px] text-white">
              Hubungi Kami
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-tfc-orange flex-shrink-0 mt-0.5" />
                <span className="font-body font-normal text-[14px] text-white/50 leading-[1.6]">
                  Jakarta, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-tfc-orange flex-shrink-0" />
                <a
                  href="mailto:hello@terasfriedchicken.id"
                  className="font-body font-normal text-[14px] text-white/50 hover:text-tfc-orange transition-colors duration-300"
                >
                  hello@terasfriedchicken.id
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-tfc-orange flex-shrink-0" />
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-normal text-[14px] text-white/50 hover:text-tfc-orange transition-colors duration-300"
                >
                  Pesan via WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-tfc-orange flex-shrink-0" />
                <a
                  href="https://instagram.com/terasfriedchicken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-normal text-[14px] text-white/50 hover:text-tfc-orange transition-colors duration-300"
                >
                  @terasfriedchicken
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body font-normal text-[13px] text-white/40">
            &copy; {new Date().getFullYear()} Teras Fried Chicken. Authentic
            Indonesian Taste.
          </p>
          <p className="font-body font-normal text-[13px] text-white/30">
            Part of Teras Corp
          </p>
        </div>
      </div>
    </footer>
  );
}
