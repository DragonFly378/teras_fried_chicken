"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AUTH_KEY = "tfc_pos_auth";
const HASH_USER = "236b48dd0b0add93cc77f3aee73bb4c2f30ec0ba1409ce4ffd7dbaabe508d914";
const HASH_PASS = "7f62851762e1f1309e738ed37b0eb49f12e71e0e41252f446a02625945436bc5";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const [uHash, pHash] = await Promise.all([
      sha256(username),
      sha256(password),
    ]);
    if (uHash === HASH_USER && pHash === HASH_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      router.push("/dashboard");
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <section className="min-h-screen bg-tfc-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 relative mx-auto mb-4">
            <Image
              src="/images/logo_bg.svg"
              alt="Teras Fried Chicken"
              fill
              sizes="80px"
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="font-display text-2xl text-tfc-brown font-bold leading-tight">
            Teras Fried Chicken
          </h1>
          <p className="font-body text-xs text-tfc-orange font-semibold tracking-widest uppercase mt-1">
            POS Dashboard
          </p>
          <p className="text-sm font-body text-tfc-muted mt-2">
            Masukkan kredensial untuk melanjutkan
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-tfc-brown/10 shadow-sm p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-body font-semibold text-tfc-brown uppercase tracking-wide">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Username"
              autoFocus
              className="h-10 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-body font-semibold text-tfc-brown uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Password"
                className="h-10 text-sm bg-white border-tfc-brown/15 text-tfc-brown font-medium placeholder:text-tfc-muted placeholder:font-normal focus:border-tfc-orange focus:ring-tfc-orange/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tfc-muted hover:text-tfc-brown transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-body font-medium text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-tfc-brown text-white hover:bg-tfc-brown/90 font-body font-bold tracking-wide rounded-xl py-5"
          >
            <Lock className="w-4 h-4 mr-2" />
            Masuk
          </Button>
        </form>
      </div>
    </section>
  );
}
