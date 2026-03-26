import { MessageCircle, MapPin, Phone } from "lucide-react";

const channels = [
  {
    label: "WhatsApp",
    href: "https://wa.me/6281234567890?text=Halo%20Teras%20Fried%20Chicken!%20Saya%20ingin%20pesan.",
    icon: MessageCircle,
    style: "bg-[#25D366] text-white hover:bg-[#1fb855]",
  },
  {
    label: "Lokasi Kami",
    href: "https://maps.google.com",
    icon: MapPin,
    style: "bg-tfc-orange text-white hover:bg-tfc-orange/90",
  },
  {
    label: "Telepon",
    href: "tel:+6281234567890",
    icon: Phone,
    style: "bg-tfc-brown text-white hover:bg-tfc-dark-brown",
  },
];

export function CtaSection() {
  return (
    <section id="cta" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(226,123,46,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-tfc-brown mb-6 leading-tight">
          Sudah lapar?
          <br />
          <span className="italic text-tfc-orange">Pesan sekarang!</span>
        </h2>
        <p className="font-body text-tfc-muted max-w-md mx-auto mb-12 leading-relaxed">
          Nikmati ayam goreng renyah dengan bumbu rempah khas Indonesia. Pesan
          langsung dan rasakan kelezatan Teras Fried Chicken.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-body font-semibold rounded-[8px] transition-all duration-300 tracking-wide ${ch.style}`}
            >
              <ch.icon className="w-5 h-5" />
              {ch.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
