"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const API_BASE =
  "https://script.google.com/macros/s/AKfycbz5UQlOzXNGrbBbSNPSHX8gTcNUKL1oE8TlJhIj-FbLhJ-9StEi3-t9rG6jKe_hTxNC/exec";

// ── Types ──────────────────────────────────────────────
interface Scorecard {
  totalPendapatan: number;
  totalProfit: number;
  grossMarginPersen: number;
  totalPengeluaran: number;
  rincianPengeluaran: {
    operasional: number;
    bahanBaku: number;
  };
  statusProfit: string;
}

interface KpiResponse {
  status: string;
  bulan: string;
  scorecard: Scorecard;
}

interface TrenDataset {
  label: string;
  data: (number | null)[];
  color: string;
}

interface TrenResponse {
  status: string;
  chartData: {
    labels: string[];
    datasets: TrenDataset[];
  };
}

interface ChartRow {
  bulan: string;
  bulanFull: string;
  Pendapatan: number | null;
  HPP: number | null;
  Profit: number | null;
}

// ── Helpers ────────────────────────────────────────────
function formatRupiah(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `Rp${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")} jt`;
  }
  if (Math.abs(n) >= 1_000) {
    return `Rp${(n / 1_000).toFixed(0)} rb`;
  }
  return `Rp${n.toLocaleString("id-ID")}`;
}

function formatRupiahFull(n: number): string {
  return `Rp${n.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

const BULAN_ID: Record<string, string> = {
  January: "Januari",
  February: "Februari",
  March: "Maret",
  April: "April",
  Mei: "Mei",
  May: "Mei",
  June: "Juni",
  July: "Juli",
  August: "Agustus",
  September: "September",
  October: "Oktober",
  November: "November",
  December: "Desember",
};

const MONTH_ORDER: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

// ── CSV Fallback ───────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function computeFromCSV(csvText: string): { kpi: KpiResponse; tren: TrenResponse } {
  const rows = parseCSV(csvText);
  const completed = rows.filter((r) => r["Status"] === "Selesai");

  // Group by month
  const monthMap: Record<string, { pendapatan: number; modal: number }> = {};
  for (const r of completed) {
    const bulan = r["Bulan"];
    if (!monthMap[bulan]) monthMap[bulan] = { pendapatan: 0, modal: 0 };
    monthMap[bulan].pendapatan += Number(r["Harga Total"]) || 0;
    monthMap[bulan].modal += Number(r["Total modal"]) || 0;
  }

  // Current month KPI (latest month with data)
  const sortedMonths = Object.keys(monthMap).sort(
    (a, b) => (MONTH_ORDER[a] || 0) - (MONTH_ORDER[b] || 0)
  );
  const currentMonth = sortedMonths[sortedMonths.length - 1] || "March";
  const cm = monthMap[currentMonth] || { pendapatan: 0, modal: 0 };
  const totalProfit = cm.pendapatan - cm.modal;
  const grossMargin = cm.pendapatan > 0 ? Math.round((totalProfit / cm.pendapatan) * 100) : 0;

  const kpi: KpiResponse = {
    status: "success",
    bulan: currentMonth,
    scorecard: {
      totalPendapatan: cm.pendapatan,
      totalProfit: totalProfit,
      grossMarginPersen: grossMargin,
      totalPengeluaran: cm.modal,
      rincianPengeluaran: {
        operasional: 0,
        bahanBaku: cm.modal,
      },
      statusProfit: totalProfit >= 0 ? "PROFIT" : "RUGI",
    },
  };

  // Trend data
  const labels = sortedMonths;
  const pendapatanData = labels.map((m) => monthMap[m].pendapatan);
  const hppData = labels.map((m) => monthMap[m].modal);
  const profitData = labels.map((m) => monthMap[m].pendapatan - monthMap[m].modal);

  const tren: TrenResponse = {
    status: "success",
    chartData: {
      labels,
      datasets: [
        { label: "Pendapatan", data: pendapatanData, color: "#3D1C0A" },
        { label: "HPP", data: hppData, color: "#C9993A" },
        { label: "Profit", data: profitData, color: "#22c55e" },
      ],
    },
  };

  return { kpi, tren };
}

// ── Component ──────────────────────────────────────────
export default function DashboardPage() {
  const [kpi, setKpi] = useState<KpiResponse | null>(null);
  const [tren, setTren] = useState<TrenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<"api" | "csv">("api");

  useEffect(() => {
    async function fetchData() {
      // Try API first
      try {
        const [kpiRes, trenRes] = await Promise.all([
          fetch(`${API_BASE}?action=kpi`),
          fetch(`${API_BASE}?action=tren`),
        ]);
        const kpiData = await kpiRes.json();
        const trenData = await trenRes.json();

        if (kpiData.status === "success" && trenData.status === "success") {
          setKpi(kpiData);
          setTren(trenData);
          setDataSource("api");
          setLoading(false);
          return;
        }
      } catch {
        // API failed, try CSV fallback
      }

      // Fallback: compute from local CSV
      try {
        const csvRes = await fetch("/pesanan-teras-fried-chicken.csv");
        if (!csvRes.ok) throw new Error("CSV not found");
        const csvText = await csvRes.text();
        const { kpi: csvKpi, tren: csvTren } = computeFromCSV(csvText);
        setKpi(csvKpi);
        setTren(csvTren);
        setDataSource("csv");
      } catch {
        setError("Gagal memuat data. API dan CSV tidak tersedia.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-tfc-orange animate-spin mx-auto" />
          <p className="font-body text-sm text-tfc-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !kpi || !tren) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="font-body text-sm text-red-600">{error || "Data tidak tersedia."}</p>
        </div>
      </div>
    );
  }

  const sc = kpi.scorecard;
  const isProfit = sc.statusProfit === "PROFIT";
  const bulanId = BULAN_ID[kpi.bulan] || kpi.bulan;

  // Build chart data
  const currentYear = new Date().getFullYear();
  const chartData: ChartRow[] = tren.chartData.labels
    .map((label, i) => ({
      bulan: (BULAN_ID[label] || label).substring(0, 3),
      bulanFull: `${BULAN_ID[label] || label} ${currentYear}`,
      Pendapatan: tren.chartData.datasets[0].data[i],
      HPP: tren.chartData.datasets[1].data[i],
      Profit: tren.chartData.datasets[2].data[i],
    }))
    .filter((row) => row.Pendapatan !== null);

  const kpiCards = [
    {
      label: "Total Pendapatan",
      value: formatRupiahFull(sc.totalPendapatan),
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      sub: `Bulan ${bulanId}`,
    },
    {
      label: "Total Profit",
      value: formatRupiahFull(sc.totalProfit),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600",
      sub: isProfit ? "PROFIT" : "RUGI",
      subColor: isProfit ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Gross Margin",
      value: `${sc.grossMarginPersen}%`,
      icon: PieChart,
      color: "bg-violet-50 text-violet-600",
      sub: "Margin / Pendapatan",
    },
    {
      label: "Total Pengeluaran",
      value: formatRupiahFull(sc.totalPengeluaran),
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
      sub: sc.rincianPengeluaran.operasional > 0
        ? `Ops ${formatRupiah(sc.rincianPengeluaran.operasional)} · Bahan ${formatRupiah(sc.rincianPengeluaran.bahanBaku)}`
        : `Bahan Baku ${formatRupiah(sc.rincianPengeluaran.bahanBaku)}`,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Period Label */}
      <div>
        <h1 className="font-body text-xl lg:text-2xl text-tfc-brown font-bold">
          Dashboard
        </h1>
        <p className="font-body text-sm text-tfc-muted mt-0.5">
          Data bulan {bulanId} {currentYear}
        </p>
      </div>

      {dataSource === "csv" && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-body text-xs lg:text-sm">
          <span className="font-semibold">Info:</span> Data diambil dari file lokal (API belum tersedia).
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-tfc-brown/10 p-4 lg:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs lg:text-sm font-body text-tfc-muted leading-tight">
                  {card.label}
                </p>
                <div
                  className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
              </div>
              <p className="text-lg lg:text-2xl font-body font-bold text-tfc-brown mt-2 truncate">
                {card.value}
              </p>
              <p className="text-[11px] lg:text-xs font-body text-tfc-muted mt-1.5">
                <span className={`font-semibold ${card.subColor || "text-tfc-muted"}`}>
                  {card.sub}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl border border-tfc-brown/10 p-4 lg:p-6">
        <div className="mb-4 lg:mb-6">
          <h2 className="font-body text-lg text-tfc-brown font-semibold">
            Tren Bulanan
          </h2>
          <p className="font-body text-xs text-tfc-muted mt-0.5">
            Pendapatan vs HPP vs Profit per bulan
          </p>
        </div>
        <div className="w-full h-[280px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickFormatter={(v: number) => formatRupiah(v)}
              />
              <Tooltip
                formatter={(value) => formatRupiahFull(value as number)}
                labelFormatter={(_label, payload) => {
                  const row = payload?.[0]?.payload as ChartRow | undefined;
                  return row?.bulanFull ?? _label;
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans)",
                }}
                labelStyle={{
                  fontWeight: 700,
                  color: "#3D1C0A",
                  marginBottom: "4px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}
              />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Pendapatan" stroke="#3D1C0A" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="HPP" stroke="#C9993A" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Profit" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {chartData.some((row) => (row.Profit ?? 0) < 0) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 font-body text-xs lg:text-sm">
            <span className="font-semibold">Perhatian:</span>{" "}
            Ada bulan dengan profit negatif (rugi). Periksa pengeluaran operasional pada bulan tersebut.
          </div>
        )}
      </div>
    </div>
  );
}
