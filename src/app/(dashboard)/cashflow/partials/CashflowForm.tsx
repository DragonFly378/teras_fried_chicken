"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { formatRupiah } from "@/lib/pos-menu";
import { API_URL } from "@/lib/api/config";

const GOOGLE_SCRIPT_URL = API_URL;

const BULAN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const POST_OPTIONS = [
  "Biaya Iklan", "Gaji Karyawan", "Operasional", "Jajan Teras",
  "Biaya Marketplace", "Fee Afiliator", "Dividen", "Adjustmen",
  "Asset", "Bahan Baku", "Hutang", "Ongkir", "Sponsorship",
  "RnD", "Charity & Donation", "Modal", "Tester Teras", "Bazaar",
];

type Tipe = "pemasukan" | "pengeluaran";

interface CashflowEntry {
  tanggal: string;
  bulan: string;
  pemasukan: number | string;
  pengeluaran: number | string;
  post: string;
  keterangan: string;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function formatTanggal(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

function getBulan(dateStr: string): string {
  if (!dateStr) return "";
  return BULAN[parseInt(dateStr.split("-")[1]) - 1];
}

function displayTanggal(raw: string): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

export function CashflowForm() {
  const [tanggal, setTanggal] = useState(getTodayString());
  const [tipe, setTipe] = useState<Tipe>("pemasukan");
  const [jumlah, setJumlah] = useState("");
  const [post, setPost] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<CashflowEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    bulan: BULAN[new Date().getMonth()],
    totalPemasukan: 0,
    totalPengeluaran: 0,
  });

  const fetchData = async () => {
    try {
      const currentBulan = BULAN[new Date().getMonth()];
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=cashflow&bulan=${currentBulan}`);
      const result = await res.json();
      if (result.status === "success") {
        if (Array.isArray(result.data)) setEntries(result.data);
        setSummary({
          bulan: result.bulan || currentBulan,
          totalPemasukan: result.totalPemasukan || 0,
          totalPengeluaran: result.totalPengeluaran || 0,
        });
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const amt = parseFloat(jumlah);
    if (!tanggal || !post || !amt || amt <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Pastikan tanggal, jumlah, dan post sudah diisi.",
        confirmButtonColor: "#3D1C0A",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        action: "cashflow",
        tanggal: formatTanggal(tanggal),
        bulan: getBulan(tanggal),
        pemasukan: tipe === "pemasukan" ? amt : 0,
        pengeluaran: tipe === "pengeluaran" ? amt : 0,
        post,
        keterangan,
      };

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.status === "success") {
        fetchData();
        setJumlah("");
        setPost("");
        setKeterangan("");
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data cashflow berhasil disimpan.",
          confirmButtonColor: "#3D1C0A",
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: result.message || "Terjadi kesalahan saat menyimpan.",
          confirmButtonColor: "#3D1C0A",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal mengirim. Cek koneksi internet.",
        confirmButtonColor: "#3D1C0A",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass =
    "text-xs font-body font-semibold text-tfc-brown uppercase tracking-wide";
  const triggerClass =
    "h-9 w-full bg-white border-tfc-brown/15 text-tfc-brown font-body font-medium text-sm focus:ring-tfc-orange/20 focus:border-tfc-orange";

  return (
    <section className="p-4 sm:p-6 bg-tfc-surface min-h-screen">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Form Card */}
        <div className="bg-white rounded-xl border border-tfc-brown/10 shadow-sm overflow-hidden">
          <div className="bg-tfc-brown px-5 py-4">
            <h2 className="font-body text-lg text-white font-semibold">
              Input Cashflow
            </h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Tanggal + Tipe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Tanggal</label>
                <DatePicker
                  value={tanggal}
                  onChange={setTanggal}
                  placeholder="Pilih tanggal"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Tipe</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipe("pemasukan")}
                    className={`flex-1 h-9 rounded-lg text-sm font-body font-semibold transition-all duration-200 ${
                      tipe === "pemasukan"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-white text-tfc-brown border border-tfc-brown/15 hover:border-emerald-400"
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipe("pengeluaran")}
                    className={`flex-1 h-9 rounded-lg text-sm font-body font-semibold transition-all duration-200 ${
                      tipe === "pengeluaran"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-white text-tfc-brown border border-tfc-brown/15 hover:border-red-400"
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Jumlah + Post */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Jumlah</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-body font-semibold text-tfc-muted">
                    Rp
                  </span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="pl-10 h-9 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted focus:border-tfc-orange focus:ring-tfc-orange/20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Post</label>
                <Select value={post} onValueChange={setPost}>
                  <SelectTrigger className={triggerClass}>
                    <SelectValue placeholder="Pilih post..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Keterangan */}
            <div className="space-y-1">
              <label className={labelClass}>Keterangan</label>
              <Input
                type="text"
                placeholder="Deskripsi singkat..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="h-9 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted focus:border-tfc-orange focus:ring-tfc-orange/20"
              />
            </div>

            {/* Submit */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-tfc-orange text-white hover:bg-tfc-orange/90 font-body font-bold tracking-wide rounded-xl py-5 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-tfc-brown/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-body text-tfc-muted">Pemasukan</span>
              </div>
              <p className="text-base sm:text-lg font-body font-bold text-emerald-600 truncate">
                {formatRupiah(summary.totalPemasukan)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-tfc-brown/10 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs font-body text-tfc-muted">Pengeluaran</span>
              </div>
              <p className="text-base sm:text-lg font-body font-bold text-red-500 truncate">
                {formatRupiah(summary.totalPengeluaran)}
              </p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-tfc-brown/10 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-tfc-brown/10">
            <h2 className="font-body text-base text-tfc-brown font-semibold">
              Cashflow Bulan {summary.bulan}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-tfc-muted" />
            </div>
          ) : entries.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-body text-tfc-muted">
                Belum ada data cashflow.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-tfc-surface text-tfc-brown">
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Tanggal</th>
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Post</th>
                    <th className="text-right px-4 py-2.5 font-semibold whitespace-nowrap">Pemasukan</th>
                    <th className="text-right px-4 py-2.5 font-semibold whitespace-nowrap">Pengeluaran</th>
                    <th className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={i} className="border-t border-tfc-brown/5 hover:bg-tfc-surface/50">
                      <td className="px-4 py-2.5 text-tfc-brown whitespace-nowrap">{displayTanggal(entry.tanggal)}</td>
                      <td className="px-4 py-2.5 text-tfc-brown">{entry.post}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600 font-medium whitespace-nowrap">
                        {Number(entry.pemasukan) > 0 ? formatRupiah(Number(entry.pemasukan)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-500 font-medium whitespace-nowrap">
                        {Number(entry.pengeluaran) > 0 ? formatRupiah(Number(entry.pengeluaran)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-tfc-muted">{entry.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
