"use client";

import { RefreshCw, WifiOff, Wifi, CloudOff } from "lucide-react";

interface SyncSidebarWidgetProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  countdown: number;
  collapsed: boolean;
  onSyncNow: () => void;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SyncSidebarWidget({
  isOnline,
  pendingCount,
  isSyncing,
  countdown,
  collapsed,
  onSyncNow,
}: SyncSidebarWidgetProps) {
  // Offline state
  if (!isOnline) {
    return (
      <div className="px-3 py-2 border-t border-white/10">
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/20 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-body font-semibold text-red-400">
                Offline
              </p>
              {pendingCount > 0 && (
                <p className="text-[10px] font-body text-red-400/70">
                  {pendingCount} pesanan menunggu
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Syncing state
  if (isSyncing) {
    return (
      <div className="px-3 py-2 border-t border-white/10">
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/20 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
          {!collapsed && (
            <p className="text-xs font-body font-semibold text-amber-400">
              Sinkronisasi...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Online state with countdown
  return (
    <div className="px-3 py-2 border-t border-white/10">
      <div
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {pendingCount > 0 ? (
          <CloudOff className="w-4 h-4 text-tfc-orange shrink-0" />
        ) : (
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            {pendingCount > 0 ? (
              <>
                <p className="text-[11px] font-body font-semibold text-white/80">
                  {pendingCount} belum sync
                </p>
                <p className="text-[10px] font-body text-white/40">
                  Auto {formatCountdown(countdown)}
                </p>
              </>
            ) : (
              <p className="text-[11px] font-body font-semibold text-white/50">
                Tersinkronisasi
              </p>
            )}
          </div>
        )}
        {!collapsed && pendingCount > 0 && (
          <button
            type="button"
            onClick={onSyncNow}
            title="Sync sekarang"
            className="shrink-0 w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white/60" />
          </button>
        )}
      </div>
    </div>
  );
}
