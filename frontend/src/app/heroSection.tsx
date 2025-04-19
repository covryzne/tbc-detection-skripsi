import Image from "next/image";
import React from "react";
import Link from "next/link";

type Props = {};

export default function HeroSection({}: Props) {
  const content = {
    description:
      "Tuberkulosis masih menjadi ancaman kesehatan global. TB Detection hadir untuk membantu mendeteksi tuberkulosis dalam hitungan detik dengan didukung dengan teknologi Deep Learning",
    cta_button: "Coba Deteksi",
    images: {
      a: "/doctor.png",
    },
  };
  return (
    <section className="w-full">
      <div className="mx-auto grid max-w-7xl pt-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="flex flex-col space-y-3 py-12">
          <h1 className="flex flex-col space-y-2 text-6xl font-bold text-primaryBlack">
            <span> DETEKSI TUBERKULOSIS </span>
            <span> MENGGUNAKAN TEKNOLOGI </span>
            <span>
              <span className="text-primary"> DEEP LEARNING </span>{" "}
            </span>
          </h1>
          <p className="text-lg text-primaryBlack-300">
            {content?.description}{" "}
          </p>

          {/* Buttons */}
          <div className="flex flex-row space-x-8 pt-10">
            <Link href="try-now">
              <button className="rounded-md bg-primary px-10 py-3 font-semibold text-white transition hover:bg-sky-900/90 focus:outline-none">
                {content?.cta_button}
              </button>
            </Link>
            <button className="font-semibold text-primary transition hover:text-slate-500 focus:outline-none">
              See more
            </button>
          </div>
        </div>
        {/* Images */}
        <div className="relative">
          <div className="absolute -right-8 -bottom-20 z-0 h-[650px] w-[500px]">
            <Image
              className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              src={content?.images?.a}
              fill
              priority
              alt="Doctor Dashboard"
            />
          </div>
          <div></div>
        </div>
      </div>
    </section>
  );
}
