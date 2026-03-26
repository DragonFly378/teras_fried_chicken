"use client";

import { useState } from "react";
import { Flame, Star, Drumstick, CupSoda, Cookie, Salad } from "lucide-react";
import { menuItems, categoryLabels, type MenuItem } from "@/lib/menu";
import { SpiceLevel } from "@/components/shared/SpiceLevel";
import { Badge } from "@/components/ui/badge";

const categoryIcons: Record<string, React.ElementType> = {
  ayam: Drumstick,
  paket: Star,
  snack: Cookie,
  minuman: CupSoda,
};

const categories = ["all", "ayam", "paket", "snack", "minuman"];

function MenuCard({ item }: { item: MenuItem }) {
  const Icon = categoryIcons[item.category] || Salad;

  return (
    <div className="group relative bg-white border border-tfc-brown/10 rounded-lg overflow-hidden hover:border-tfc-orange hover:shadow-lg transition-all duration-500">
      {/* Visual header */}
      <div className="relative h-48 bg-gradient-to-br from-tfc-surface to-tfc-orange/10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-tfc-orange/5 group-hover:bg-tfc-orange/15 transition-colors duration-500" />
        <Icon className="w-16 h-16 text-tfc-orange/20 group-hover:text-tfc-orange/40 transition-all duration-500 group-hover:scale-110" />
        <div className="absolute top-4 left-4 flex gap-2">
          {item.isPopular && (
            <Badge className="bg-tfc-orange/90 text-white text-xs font-body border-0">
              Populer
            </Badge>
          )}
          {item.isNew && (
            <Badge className="bg-tfc-gold/90 text-white text-xs font-body border-0">
              Baru
            </Badge>
          )}
        </div>
        <span className="absolute top-4 right-4 font-body text-[10px] text-tfc-brown/30 uppercase tracking-[2px]">
          {categoryLabels[item.category]}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-2xl text-tfc-brown group-hover:text-tfc-orange transition-colors duration-300">
            {item.name}
          </h3>
        </div>

        <p className="font-body text-sm text-tfc-muted leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {item.spiceLevel > 0 && <SpiceLevel level={item.spiceLevel} />}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl text-tfc-orange font-semibold">
            {item.priceJumbo ? "Mulai " : ""}Rp {item.price.toLocaleString("id-ID")}
          </span>
          <a
            href={`https://wa.me/6281234567890?text=Halo, saya ingin order ${item.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-medium bg-tfc-orange/10 text-tfc-orange rounded-full hover:bg-tfc-orange hover:text-white transition-all duration-300 border border-tfc-orange/30"
          >
            Pesan
          </a>
        </div>
      </div>
    </div>
  );
}

export function MenuGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-24 px-6 bg-tfc-surface">
      <div className="max-w-7xl mx-auto">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-tfc-orange text-white shadow-md"
                  : "bg-white text-tfc-brown border border-tfc-brown/10 hover:border-tfc-orange/30 hover:text-tfc-orange"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-tfc-muted">
              Tidak ada menu dalam kategori ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
