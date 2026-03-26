import Link from "next/link";
import Image from "next/image";
import {
  Drumstick,
  Heart,
  Flame,
  Users,
  Award,
} from "lucide-react";

const stats = [
  { value: "10+", label: "Varian Menu" },
  { value: "100%", label: "Rempah Asli" },
  { value: "\u221E", label: "Porsi Kepuasan" },
];

const cards = [
  {
    num: "01",
    tag: "Nilai Pertama",
    icon: Flame,
    title: "Rempah Asli",
    body: (
      <>
        Kami menggunakan rempah-rempah asli Indonesia yang dipilih langsung dari
        petani lokal.{" "}
        <em className="text-tfc-orange/80">
          Setiap gigitan menyimpan kekayaan rasa Nusantara
        </em>{" "}
        &mdash; dari kunyit, lengkuas, hingga daun jeruk yang harum.
      </>
    ),
    quote: "Rempah yang jujur menghasilkan rasa yang tak terlupakan.",
  },
  {
    num: "02",
    tag: "Nilai Kedua",
    icon: Heart,
    title: "Dimasak dengan Hati",
    body: (
      <>
        Setiap potong ayam dimarinasi dengan penuh perhatian, digoreng dengan
        teknik yang tepat.{" "}
        <em className="text-tfc-orange/80">
          Bukan sekadar menggoreng, tapi merayakan proses
        </em>
        . Karena rasa terbaik lahir dari kesabaran.
      </>
    ),
    quote: "Renyah yang sempurna butuh waktu — dan kami tidak pernah terburu-buru.",
  },
  {
    num: "03",
    tag: "Nilai Ketiga",
    icon: Users,
    title: "Untuk Semua",
    body: (
      <>
        Teras Fried Chicken hadir untuk semua kalangan. Dari anak-anak hingga
        orang tua,{" "}
        <em className="text-tfc-orange/80">
          setiap orang berhak menikmati ayam goreng berkualitas
        </em>{" "}
        dengan harga yang terjangkau.
      </>
    ),
    quote: "Makanan enak tidak harus mahal — itulah janji kami.",
  },
  {
    num: "04",
    tag: "Nilai Keempat",
    icon: Award,
    title: "Kualitas Terjaga",
    body: (
      <>
        Dari bahan baku hingga penyajian, kami menjaga standar kualitas di setiap
        tahap.{" "}
        <em className="text-tfc-orange/80">
          Ayam segar pilihan, minyak berkualitas, dan kebersihan yang terjamin
        </em>
        . Itulah komitmen Teras.
      </>
    ),
    quote: "Kualitas bukan pilihan, tapi keharusan.",
  },
];

export function AboutSection() {
  return (
    <section className="relative bg-tfc-brown overflow-hidden">
      {/* Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Radial Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-tfc-orange/[0.07] blur-[150px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-tfc-orange/[0.07] blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* TOP SECTION */}
      <div className="relative max-w-[1440px] mx-auto px-8 md:px-[72px] pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left - Heading */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-tfc-orange" />
              <p className="font-body font-bold text-[10px] text-tfc-orange uppercase tracking-[3.6px]">
                TENTANG KAMI
              </p>
            </div>
            <h2 className="font-display text-[36px] sm:text-[44px] md:text-[50px] font-normal text-white leading-[1.2]">
              Bukan sekadar ayam goreng,
              <br />
              tapi cara kami
              <br />
              <em className="text-tfc-orange">merayakan rasa.</em>
            </h2>
          </div>

          {/* Right - Manifesto + Stats */}
          <div className="flex flex-col gap-10 justify-center">
            <p className="font-body font-light text-[15px] text-white/[0.65] leading-[1.8] border-l border-tfc-orange/[0.22] pl-7">
              Teras Fried Chicken hadir untuk membuktikan bahwa ayam goreng
              Indonesia bisa tampil dengan kualitas terbaik tanpa kehilangan
              cita rasa autentiknya. Dari bumbu rempah warisan hingga teknik
              menggoreng yang sempurna, kami menghadirkan pengalaman kuliner
              yang membanggakan.
            </p>
            <div className="flex flex-wrap gap-10">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-display text-[32px] text-tfc-orange">
                    {s.value}
                  </span>
                  <span className="font-body text-[11px] text-white/[0.52] uppercase tracking-[2px]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="relative max-w-[1440px] mx-auto px-8 md:px-[72px]">
        <div className="relative flex items-center justify-center">
          <div className="w-full h-[1px] bg-tfc-orange/[0.22]" />
          <div className="absolute bg-tfc-brown px-4">
            <Drumstick className="w-5 h-5 text-tfc-orange/50" />
          </div>
        </div>
      </div>

      {/* LABEL */}
      <div className="relative max-w-[1440px] mx-auto px-8 md:px-[72px] pt-12 pb-8">
        <p className="font-display italic text-[14px] text-white/40">
          Empat nilai yang menghidupkan Teras Fried Chicken
        </p>
      </div>

      {/* 2x2 GRID CARDS */}
      <div className="relative max-w-[1440px] mx-auto px-8 md:px-[72px] pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.num}
              className="relative bg-white/[0.04] border border-tfc-orange/[0.12] rounded-[20px] overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-tfc-orange/[0.25] group"
            >
              <div className="relative p-8 sm:p-10 flex flex-col justify-center">
                {/* Watermark Number */}
                <span className="absolute top-4 right-6 font-display text-[72px] text-white/[0.07] leading-none select-none pointer-events-none">
                  {card.num}
                </span>

                {/* Accent Line */}
                <div className="w-9 h-[2px] bg-tfc-orange mb-5 transition-all duration-300 group-hover:w-14" />

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-tfc-orange/10 flex items-center justify-center mb-4">
                  <card.icon
                    className="w-5 h-5 text-tfc-orange"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Tag */}
                <p className="font-body text-[10px] text-tfc-orange uppercase tracking-[2.5px] mb-2">
                  {card.tag}
                </p>

                {/* Title */}
                <h3 className="font-display text-[30px] text-white mb-3">
                  {card.title}
                </h3>

                {/* Body */}
                <p className="font-body font-light text-[17px] text-white/[0.58] leading-[1.82] mb-5">
                  {card.body}
                </p>

                {/* Quote */}
                <div className="border-t border-tfc-orange/10 pt-4">
                  <p className="font-display italic text-[16px] text-tfc-orange/[0.55] leading-[1.6]">
                    &ldquo;{card.quote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="relative flex flex-col items-center gap-5 pb-24">
        <p className="font-body font-light text-[14px] text-white/40">
          Ingin tahu lebih banyak soal perjalanan kami?
        </p>
        <Link
          href="/about"
          className="bg-tfc-orange text-white font-body font-semibold text-[15px] px-8 py-[14px] rounded-[6px] hover:bg-tfc-orange/90 transition-colors duration-300"
        >
          Baca Cerita Kami
        </Link>
      </div>
    </section>
  );
}
