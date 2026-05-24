"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRINTER_SLOTS } from "@/lib/bluetooth/types";
import { useStoreProfile, type StoreProfile } from "@/hooks/useStoreProfile";
import { PrinterSlotCard } from "./PrinterSlotCard";

const inputClass =
  "w-full h-9 px-3 rounded-lg border border-tfc-brown/15 font-body text-sm text-tfc-brown placeholder:text-tfc-muted/40 focus:outline-none focus:ring-2 focus:ring-tfc-orange/30";
const labelClass = "block font-body text-xs font-semibold text-tfc-muted mb-1";

export function SettingsPage() {
  const { profile, saveProfile, isSaving, isLoading } = useStoreProfile();
  const [draft, setDraft] = useState<StoreProfile>(profile);
  const [saved, setSaved] = useState(false);

  // Sync draft when profile loads from API
  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const handleSave = async () => {
    await saveProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: keyof StoreProfile, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      {/* Section: Profil Toko */}
      <section>
        <h2 className="font-body text-lg font-bold text-tfc-brown mb-3">
          Profil Toko
        </h2>
        <div className="bg-white rounded-xl border border-tfc-brown/10 p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-tfc-muted" />
              <span className="font-body text-sm text-tfc-muted ml-2">
                Memuat profil...
              </span>
            </div>
          ) : (
            <>
              {/* Nama Toko */}
              <div>
                <label htmlFor="store-name" className={labelClass}>
                  Nama Toko
                </label>
                <textarea
                  id="store-name"
                  rows={2}
                  value={draft.namaToko}
                  onChange={(e) => update("namaToko", e.target.value)}
                  placeholder={"Teras Fried Chicken"}
                  className={`${inputClass} h-auto py-2 resize-none`}
                />
                <p className="font-body text-[10px] text-tfc-muted/60 mt-1">
                  Tekan Enter untuk baris baru di struk
                </p>
              </div>

              {/* Alamat */}
              <div>
                <label htmlFor="store-address" className={labelClass}>
                  Alamat
                </label>
                <input
                  id="store-address"
                  type="text"
                  value={draft.alamat}
                  onChange={(e) => update("alamat", e.target.value)}
                  placeholder="Jl. Contoh No. 123, Jakarta"
                  className={inputClass}
                />
              </div>

              {/* Tagline */}
              <div>
                <label htmlFor="store-tagline" className={labelClass}>
                  Tagline
                </label>
                <input
                  id="store-tagline"
                  type="text"
                  value={draft.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="Ayam Goreng & Geprek Spesial"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram */}
                <div>
                  <label htmlFor="store-ig" className={labelClass}>
                    Instagram
                  </label>
                  <input
                    id="store-ig"
                    type="text"
                    value={draft.instagram}
                    onChange={(e) => update("instagram", e.target.value)}
                    placeholder="terasfriedchicken"
                    className={inputClass}
                  />
                </div>

                {/* Whatsapp */}
                <div>
                  <label htmlFor="store-wa" className={labelClass}>
                    Whatsapp
                  </label>
                  <input
                    id="store-wa"
                    type="text"
                    value={draft.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="0812-3456-7890"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="store-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="store-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="terasfc@gmail.com"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username Wifi */}
                <div>
                  <label htmlFor="store-wifi-user" className={labelClass}>
                    Username Wifi
                  </label>
                  <input
                    id="store-wifi-user"
                    type="text"
                    value={draft.usernameWifi}
                    onChange={(e) => update("usernameWifi", e.target.value)}
                    placeholder="terasfc_wifi"
                    className={inputClass}
                  />
                </div>

                {/* Password Wifi */}
                <div>
                  <label htmlFor="store-wifi-pass" className={labelClass}>
                    Password Wifi
                  </label>
                  <input
                    id="store-wifi-pass"
                    type="text"
                    value={draft.passwordWifi}
                    onChange={(e) => update("passwordWifi", e.target.value)}
                    placeholder="ayamgoreng123"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {saved && (
                  <span className="font-body text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Tersimpan
                  </span>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="bg-tfc-brown text-white hover:bg-tfc-brown/90 font-body font-semibold h-9 text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Section: Printer Setup */}
      <section>
        <h2 className="font-body text-lg font-bold text-tfc-brown mb-3">
          Printer Setup
        </h2>
        <div className="space-y-3">
          {PRINTER_SLOTS.map((slot) => (
            <PrinterSlotCard key={slot.id} slotId={slot.id} label={slot.label} />
          ))}
        </div>
      </section>
    </div>
  );
}
