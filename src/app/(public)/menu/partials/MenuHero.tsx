export function MenuHero() {
  return (
    <section className="relative bg-tfc-brown overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-tfc-orange/[0.07] blur-[150px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-[72px] pt-36 pb-20">
        <div className="flex flex-col gap-6 max-w-[600px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-tfc-orange" />
            <p className="font-body font-bold text-[10px] text-tfc-orange uppercase tracking-[3.6px]">
              MENU KAMI
            </p>
          </div>
          <h1 className="font-display text-[40px] sm:text-[50px] md:text-[58px] font-normal text-white leading-[1.15]">
            Pilihan menu
            <br />
            <em className="text-tfc-orange">untuk semua selera.</em>
          </h1>
          <p className="font-body font-light text-[16px] text-white/[0.6] leading-[1.8] max-w-[500px]">
            Dari ayam goreng original hingga geprek yang pedas menggigit, setiap
            menu kami dibuat dengan bumbu rempah pilihan dan bahan berkualitas.
          </p>
        </div>
      </div>
    </section>
  );
}
