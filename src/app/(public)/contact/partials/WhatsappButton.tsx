import { MessageCircle } from "lucide-react";

export function WhatsappButton() {
  return (
    <section className="pb-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-8 rounded-lg border border-tfc-orange/10 bg-tfc-surface space-y-4">
          <MessageCircle className="w-8 h-8 text-green-500 mx-auto" />
          <h3 className="font-display text-xl text-tfc-brown">
            Lebih Suka WhatsApp?
          </h3>
          <p className="font-body text-sm text-tfc-muted">
            Chat langsung dengan kami untuk pemesanan atau pertanyaan.
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Teras%20Fried%20Chicken!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            Chat di WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
