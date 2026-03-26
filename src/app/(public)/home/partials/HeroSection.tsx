"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

const heroSlides = [
  {
    label: "Ayam Goreng Original",
    tag: "FRIED CHICKEN \u00B7 INDONESIA",
    heading: "Renyah di luar,",
    headingEnd: "juicy di",
    accent: "dalam.",
    desc: "Ayam goreng dengan bumbu rempah khas Indonesia. Tersedia ukuran Regular & Jumbo.",
  },
  {
    label: "Ayam Geprek",
    tag: "SPICY SENSATION \u00B7 INDONESIA",
    heading: "Digeprek dengan",
    headingEnd: "sambal yang",
    accent: "menggoda.",
    desc: "Ayam goreng tepung digeprek dengan sambal bawang pedas khas Nusantara yang bikin nagih.",
  },
  {
    label: "Ayam Goreng Crispy",
    tag: "CRISPY SENSATION \u00B7 INDONESIA",
    heading: "Crispy sempurna,",
    headingEnd: "rasa yang",
    accent: "autentik.",
    desc: "Lapisan tepung crispy yang renyah dengan daging ayam juicy. Cocok untuk semua kalangan.",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollProgress = -rect.top;
      const maxScroll = container.offsetHeight - window.innerHeight;

      if (scrollProgress < 0 || scrollProgress > maxScroll) return;

      hasScrolled.current = true;

      const segmentSize = maxScroll / heroSlides.length;
      const slideIndex = Math.min(
        Math.floor(scrollProgress / segmentSize),
        heroSlides.length - 1
      );

      setCurrent(slideIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!hasScrolled.current) {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    hasScrolled.current = true;
    const maxScroll = container.offsetHeight - window.innerHeight;
    const segmentSize = maxScroll / heroSlides.length;
    const targetScroll =
      container.offsetTop + segmentSize * index + segmentSize * 0.5;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  const progress = ((current + 1) / heroSlides.length) * 100;

  return (
    <div
      ref={containerRef}
      style={{ height: `calc(100vh + ${heroSlides.length * 100}px)` }}
    >
      <section className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background gradient for each slide */}
        {heroSlides.map((_, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                i === 0
                  ? "linear-gradient(135deg, #3D1C0A 0%, #5C2D0E 40%, #7A3D12 100%)"
                  : i === 1
                  ? "linear-gradient(135deg, #4A1D0A 0%, #8B3A0F 40%, #C0392B 100%)"
                  : "linear-gradient(135deg, #2A1206 0%, #3D1C0A 40%, #5C2D0E 100%)",
            }}
          />
        ))}

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5D6A0' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo watermark */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none hidden lg:block">
          <Image
            src="/images/logo_bg.svg"
            alt=""
            width={600}
            height={600}
            className="w-[500px] h-auto"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col h-full max-w-[1440px] mx-auto px-8 md:px-[68px]">
          {/* Navbar spacer */}
          <div className="shrink-0 h-[82px] md:h-[106px]" />
          <div className="flex flex-1 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-4 max-w-[650px]">
              <p className="font-body text-xs md:text-[12px] font-normal text-tfc-orange uppercase tracking-[2.5px] transition-all duration-500">
                {heroSlides[current].tag}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl md:text-[65px] font-normal text-white leading-[1.15] transition-all duration-500">
                {heroSlides[current].heading}{" "}
                <br className="hidden md:block" />
                {heroSlides[current].headingEnd}{" "}
                <span className="italic text-tfc-orange">
                  {heroSlides[current].accent}
                </span>
              </h1>

              <p className="font-body font-light text-tfc-cream text-sm md:text-[17px] leading-[1.7] mt-1 transition-all duration-500">
                {heroSlides[current].desc}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Link
                  href="/menu"
                  className="bg-tfc-orange text-white font-body font-medium text-[15px] md:text-[16px] px-8 py-4 rounded-[7px] hover:bg-tfc-orange/90 transition-colors duration-300 text-center"
                >
                  Lihat Menu
                </Link>
                <Link
                  href="/about"
                  className="border border-tfc-orange/50 text-tfc-orange font-body font-light text-[15px] md:text-[16px] px-8 py-4 rounded-[7px] hover:bg-tfc-orange/10 transition-colors duration-300 text-center"
                >
                  Cerita Kami
                </Link>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {heroSlides.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-[7px] h-[7px] rounded-full transition-opacity duration-300 ${
                  i === current ? "bg-tfc-orange" : "bg-white/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Right Side - Vertical Text */}
          <div className="hidden lg:block absolute top-[106px] right-[34px]">
            <p className="font-body font-thin text-[11px] text-white/50 uppercase tracking-[4.5px] [writing-mode:vertical-rl] transition-all duration-500">
              {heroSlides[current].label}
            </p>
          </div>

          {/* Right Side - Slide Counter */}
          <div className="hidden lg:block absolute bottom-14 right-[72px]">
            <p className="font-body font-thin text-[13px] text-white/50 tracking-[1.3px]">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(heroSlides.length).padStart(2, "0")}
            </p>
          </div>

          {/* Right Side - Scroll Indicator */}
          <div className="hidden lg:flex absolute right-[72px] top-1/2 -translate-y-1/2 flex-col items-center gap-[18px]">
            <div className="relative w-[1px] h-[72px] bg-white/20">
              <div
                className="absolute top-0 left-0 w-full bg-tfc-orange transition-all duration-500"
                style={{ height: `${progress}%` }}
              />
            </div>
            <p className="font-body font-thin text-[11px] text-white/50 uppercase tracking-[1.1px] [writing-mode:vertical-rl]">
              Scroll
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
