"use client";

import { RefreshCw, WifiOff } from "lucide-react";

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
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
          <div
            className={`min-w-0 transition-all duration-300 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <p className="text-xs font-body font-medium text-red-400">
              Offline
            </p>
            {pendingCount > 0 && (
              <p className="text-[10px] font-body text-white/40">
                {pendingCount} tersimpan
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Syncing state
  if (isSyncing) {
    return (
      <div className="px-3 py-2 border-t border-white/10">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <RefreshCw className="w-4 h-4 text-tfc-orange animate-spin shrink-0" />
          <span
            className={`text-xs font-body font-medium text-tfc-orange transition-all duration-300 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Menyinkronkan...
          </span>
        </div>
      </div>
    );
  }

  // Online state — countdown + manual sync button
  return (
    <div className="px-3 py-2 border-t border-white/10 space-y-1">
      {/* Countdown */}
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
          collapsed ? "lg:justify-center lg:px-0" : ""
        }`}
      >
        <span
          className={`font-mono text-xs shrink-0 ${
            pendingCount > 0 ? "text-amber-400" : "text-white/40"
          }`}
        >
          {formatCountdown(countdown)}
        </span>
        <div
          className={`min-w-0 transition-all duration-300 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          <p
            className={`text-[11px] font-body font-medium ${
              pendingCount > 0 ? "text-amber-400" : "text-white/40"
            }`}
          >
            {pendingCount > 0
              ? `${pendingCount} pending`
              : "Tersinkron"}
          </p>
        </div>
      </div>

      {/* Manual sync button */}
      <button
        type="button"
        onClick={onSyncNow}
        title={collapsed ? "Sinkron sekarang" : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-xs font-medium text-white/60 hover:bg-white/5 hover:text-tfc-orange transition-colors w-full ${
          collapsed ? "lg:justify-center lg:px-0" : ""
        }`}
      >
        <RefreshCw className="w-4 h-4 shrink-0" />
        <span
          className={`transition-all duration-300 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          Sinkron Sekarang
        </span>
      </button>
    </div>
  );
}
