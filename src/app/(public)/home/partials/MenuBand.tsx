import { Drumstick } from "lucide-react";

const items = [
  "Ayam Goreng Original",
  "Ayam Goreng Crispy",
  "Ayam Geprek",
  "Paket Nasi Ayam Original",
  "Paket Nasi Ayam Geprek",
  "Kentang Goreng",
  "Tahu Crispy",
  "Es Teh Manis",
];

export function MenuBand() {
  return (
    <section className="py-6 bg-tfc-brown border-y border-tfc-orange/10 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-4 mx-8">
            <Drumstick className="w-4 h-4 text-tfc-orange/40 flex-shrink-0" />
            <span className="font-display font-semibold text-lg text-tfc-orange/70 tracking-wider">
              {item}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
