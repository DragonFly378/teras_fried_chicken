import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3D1C0A",
};

export const metadata: Metadata = {
  title: "Teras Fried Chicken — Authentic Indonesian Taste",
  description:
    "Ayam goreng khas Indonesia dengan bumbu rempah pilihan. Renyah di luar, juicy di dalam. Teras Fried Chicken, cita rasa autentik Nusantara.",
  keywords: [
    "fried chicken",
    "ayam goreng",
    "Indonesian food",
    "makanan Indonesia",
    "Teras Fried Chicken",
    "ayam goreng rempah",
    "authentic Indonesian taste",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo_bg.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Teras FC",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "production"
                ? `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js');
                    });
                  }
                `
                : `
                  // Dev mode: unregister any existing SW and clear its caches
                  // so stale chunks don't get served on normal refresh (F5).
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      regs.forEach(function(r) { r.unregister(); });
                    });
                  }
                  if (typeof caches !== 'undefined') {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(k) { caches.delete(k); });
                    });
                  }
                `,
          }}
        />
      </body>
    </html>
  );
}
