import Image from "next/image";

export function AboutHero() {
  return (
    <section className="relative bg-tfc-brown overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-tfc-orange/[0.07] blur-[150px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-[72px] pt-36 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-tfc-orange" />
              <p className="font-body font-bold text-[10px] text-tfc-orange uppercase tracking-[3.6px]">
                TENTANG KAMI
              </p>
            </div>
            <h1 className="font-display text-[40px] sm:text-[50px] md:text-[58px] font-normal text-white leading-[1.15]">
              Bukan sekadar
              <br />
              ayam goreng, tapi
              <br />
              <em className="text-tfc-orange">kebanggaan rasa.</em>
            </h1>
            <p className="font-body font-light text-[16px] text-white/[0.6] leading-[1.8] max-w-[500px]">
              Teras Fried Chicken hadir dari kecintaan terhadap kuliner
              Indonesia. Kami percaya bahwa ayam goreng dengan bumbu rempah
              autentik bisa disajikan dengan kualitas terbaik untuk semua orang.
            </p>
          </div>

          {/* Right - Logo */}
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo_bg.svg"
              alt="Tentang Teras Fried Chicken"
              width={500}
              height={500}
              className="object-contain w-full max-w-[380px] h-auto rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
