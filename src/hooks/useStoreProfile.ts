"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { API_URL } from "@/lib/api/config";

export interface StoreProfile {
  namaToko: string;
  tagline: string;
  alamat: string;
  instagram: string;
  whatsapp: string;
  email: string;
  usernameWifi: string;
  passwordWifi: string;
}

const STORAGE_KEY = "tfc_store_profile";

const DEFAULT_PROFILE: StoreProfile = {
  namaToko: "",
  tagline: "",
  alamat: "",
  instagram: "",
  whatsapp: "",
  email: "",
  usernameWifi: "",
  passwordWifi: "",
};

export function useStoreProfile() {
  const [profile, setProfileState] = useState<StoreProfile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // Load: localStorage first (instant), then fetch from API (fresh)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // 1. Hydrate from localStorage immediately
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfileState({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
      }
    } catch {
      // localStorage unavailable
    }

    // 2. Fetch from API for fresh data
    fetch(`${API_URL}?action=settings`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "ok" && json.data) {
          const merged = { ...DEFAULT_PROFILE, ...json.data };
          setProfileState(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // localStorage unavailable
          }
        }
      })
      .catch(() => {
        // Offline — localStorage data is fine
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Save: update local state + localStorage + POST to API
  const saveProfile = useCallback(async (updates: Partial<StoreProfile>) => {
    setIsSaving(true);

    const next = await new Promise<StoreProfile>((resolve) => {
      setProfileState((prev) => {
        const merged = { ...prev, ...updates };
        resolve(merged);
        return merged;
      });
    });

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable
    }

    // POST to API
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "settings", ...next }),
      });
      const result = await res.json();
      if (result.status !== "ok") {
        console.error("Gagal menyimpan profil:", result.message);
      }
    } catch {
      // Offline — localStorage already updated
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { profile, saveProfile, isSaving, isLoading };
}
