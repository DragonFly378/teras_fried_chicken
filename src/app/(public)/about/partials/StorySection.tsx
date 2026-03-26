import { Flame, Heart, Users, Award } from "lucide-react";

const values = [
  {
    icon: Flame,
    title: "Rempah Asli",
    description:
      "Kami menggunakan rempah-rempah asli Indonesia yang dipilih langsung dari petani lokal. Kunyit, lengkuas, bawang putih, dan daun jeruk — setiap bumbu memberikan karakter rasa yang khas dan tak tergantikan.",
    quote: "Rempah yang jujur menghasilkan rasa yang tak terlupakan.",
  },
  {
    icon: Heart,
    title: "Dimasak dengan Hati",
    description:
      "Setiap potong ayam dimarinasi minimal 4 jam dengan bumbu rempah pilihan, lalu digoreng dengan teknik yang tepat hingga renyah keemasan. Proses ini tidak bisa disingkat karena rasa terbaik butuh kesabaran.",
    quote: "Renyah yang sempurna butuh waktu — dan kami tidak pernah terburu-buru.",
  },
  {
    icon: Users,
    title: "Untuk Semua",
    description:
      "Teras Fried Chicken hadir untuk semua kalangan. Dari anak-anak hingga orang tua, setiap orang berhak menikmati ayam goreng berkualitas dengan harga yang terjangkau dan rasa yang membanggakan.",
    quote: "Makanan enak tidak harus mahal — itulah janji kami.",
  },
  {
    icon: Award,
    title: "Kualitas Terjaga",
    description:
      "Dari bahan baku hingga penyajian, kami menjaga standar kualitas di setiap tahap. Ayam segar pilihan, minyak goreng berkualitas, dan kebersihan yang terjamin adalah fondasi dari setiap produk kami.",
    quote: "Kualitas bukan pilihan, tapi keharusan.",
  },
];

export function StorySection() {
  return (
    <section className="py-24 px-8 bg-tfc-surface">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
          <div className="flex flex-col gap-4">
            <p className="font-body font-bold text-[12px] text-tfc-brown uppercase tracking-[3.6px]">
              CERITA KAMI
            </p>
            <h2 className="font-display text-[34px] sm:text-[40px] md:text-[46px] text-tfc-brown leading-[1.2]">
              Bermula dari
              <br />
              <span className="italic text-tfc-orange">
                seporsi ayam goreng.
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-6 justify-center">
            <p className="font-body font-normal text-[15px] text-tfc-muted leading-[1.8]">
              Teras Fried Chicken dimulai dari keyakinan sederhana bahwa ayam
              goreng Indonesia punya potensi besar yang belum banyak
              dieksplorasi. Kami memadukan resep tradisional warisan nenek moyang
              dengan standar kualitas modern untuk menghadirkan ayam goreng yang
              membanggakan.
            </p>
            <p className="font-body font-normal text-[15px] text-tfc-muted leading-[1.8]">
              Nama &ldquo;Teras&rdquo; diambil dari ruang terbuka di depan rumah
              — tempat di mana keluarga berkumpul, berbagi cerita, dan menikmati
              makanan bersama. Itulah semangat yang kami bawa dalam setiap porsi.
            </p>
          </div>
        </div>

        {/* Values - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-white rounded-[20px] border border-tfc-brown/5 overflow-hidden group transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="w-10 h-10 rounded-xl bg-tfc-orange/10 flex items-center justify-center mb-4">
                  <value.icon
                    className="w-5 h-5 text-tfc-orange"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-display font-semibold text-[30px] text-tfc-brown mb-3">
                  {value.title}
                </h3>
                <p className="font-body font-normal text-[17px] text-tfc-muted leading-[1.8] mb-5">
                  {value.description}
                </p>
                <div className="border-t border-tfc-orange/10 pt-4">
                  <p className="font-display italic text-[16px] font-semibold text-tfc-orange/70 leading-[1.6]">
                    &ldquo;{value.quote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
