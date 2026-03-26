"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/shared/SectionLabel";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waText = `Halo Teras Fried Chicken!%0A%0ANama: ${form.name}%0AEmail: ${form.email}%0APesan: ${form.message}`;
    window.open(`https://wa.me/6281234567890?text=${waText}`, "_blank");
  };

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel text="Hubungi Kami" />
          <h1 className="font-display text-5xl sm:text-6xl text-tfc-brown mt-4 mb-4">
            Ada yang Bisa Dibantu?
          </h1>
          <p className="font-body text-tfc-muted max-w-md mx-auto leading-relaxed">
            Punya pertanyaan, saran, atau ingin bermitra dengan kami? Jangan ragu
            untuk menghubungi Teras Fried Chicken.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-body text-tfc-muted">Nama</label>
            <Input
              type="text"
              placeholder="Nama lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-white border-tfc-brown/15 text-tfc-brown placeholder:text-tfc-muted focus:border-tfc-orange focus:ring-tfc-orange/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-body text-tfc-muted">Email</label>
            <Input
              type="email"
              placeholder="email@contoh.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-white border-tfc-brown/15 text-tfc-brown placeholder:text-tfc-muted focus:border-tfc-orange focus:ring-tfc-orange/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-body text-tfc-muted">Pesan</label>
            <Textarea
              placeholder="Tulis pesan Anda di sini..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={5}
              className="bg-white border-tfc-brown/15 text-tfc-brown placeholder:text-tfc-muted focus:border-tfc-orange focus:ring-tfc-orange/20 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-tfc-orange text-white hover:bg-tfc-orange/90 font-body font-medium tracking-wide rounded-full py-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Kirim via WhatsApp
          </Button>
        </form>
      </div>
    </section>
  );
}
