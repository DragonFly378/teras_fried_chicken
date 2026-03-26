import Link from "next/link";
import { ArrowRight, Flame, Star, Sparkles } from "lucide-react";

const highlights = [
  {
    name: "Ayam Goreng Original",
    desc: "Bumbu rempah khas \u00B7 Renyah sempurna",
    price: "Mulai Rp 15.000",
    icon: Star,
    tag: "Best Seller",
    tagColor: "bg-tfc-orange",
  },
  {
    name: "Ayam Geprek",
    desc: "Sambal bawang pedas \u00B7 Favorit anak muda",
    price: "Mulai Rp 18.000",
    icon: Flame,
    tag: "Favorit",
    tagColor: "bg-tfc-red",
  },
  {
    name: "Ayam Goreng Crispy",
    desc: "Crispy di luar \u00B7 Juicy di dalam",
    price: "Mulai Rp 17.000",
    icon: Sparkles,
    tag: "New",
    tagColor: "bg-tfc-gold",
  },
];

export function MenuHighlights() {
  return (
    <section className="bg-tfc-surface px-8 py-[120px] md:py-[160px]">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-body font-bold text-[16px] text-tfc-brown uppercase tracking-[3.6px]">
            MENU UNGGULAN
          </p>
          <h2 className="font-display font-semibold text-[28px] sm:text-[34px] md:text-[42px] text-tfc-brown leading-[1.5]">
            Tiga Rasa, Satu Kebanggaan.
          </h2>
          <p className="font-body font-light text-lg text-tfc-muted leading-[1.6] max-w-[480px]">
            Dari bumbu rempah pilihan Nusantara, kami hadirkan ayam goreng dengan
            cita rasa yang jujur dan autentik.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {highlights.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl overflow-hidden shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] group hover:shadow-lg transition-all duration-300"
            >
              {/* Visual header */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-tfc-cream to-tfc-orange/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-tfc-orange/5 group-hover:bg-tfc-orange/15 transition-colors duration-500" />
                <item.icon className="w-20 h-20 text-tfc-orange/20 group-hover:text-tfc-orange/40 transition-all duration-500 group-hover:scale-110" />
                <span
                  className={`absolute top-4 left-4 ${item.tagColor} text-white text-xs font-body font-semibold px-3 py-1 rounded-full`}
                >
                  {item.tag}
                </span>
              </div>

              {/* Content */}
              <div className="pt-5 pb-8 px-8 flex flex-col gap-2">
                <h3 className="font-display font-semibold text-[24px] text-tfc-brown leading-[1.5] group-hover:text-tfc-orange transition-colors duration-300">
                  {item.name}
                </h3>
                <p className="font-body font-normal text-[15px] text-tfc-muted leading-[1.5]">
                  {item.desc}
                </p>
                <p className="font-display font-semibold text-[20px] text-tfc-orange mt-2">
                  {item.price}
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 pt-3 font-body font-medium text-[15px] text-tfc-brown hover:text-tfc-orange transition-colors duration-300"
                >
                  Lihat Detail
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Link */}
        <Link
          href="/menu"
          className="font-body font-normal text-[14px] text-tfc-brown underline underline-offset-4 hover:text-tfc-orange transition-colors duration-300"
        >
          Lihat semua menu kami &rarr;
        </Link>
      </div>
    </section>
  );
}
