"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface SyncStatusBarProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export function SyncStatusBar({
  isOnline,
  pendingCount,
  isSyncing,
  onSyncNow,
}: SyncStatusBarProps) {
  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-body text-tfc-orange font-medium">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Menyinkronkan...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-body text-red-500 font-medium">
        <WifiOff className="w-3 h-3" />
        <span>
          Offline{pendingCount > 0 && ` \u00b7 ${pendingCount} tersimpan`}
        </span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-body text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>{pendingCount} belum tersinkron</span>
        <button
          type="button"
          onClick={onSyncNow}
          className="ml-0.5 underline underline-offset-2 hover:text-amber-800 transition-colors"
        >
          Sinkron
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-body text-emerald-600 font-medium">
      <Wifi className="w-3 h-3" />
      <span>Tersinkron</span>
    </div>
  );
}
