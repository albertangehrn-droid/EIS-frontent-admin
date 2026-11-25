"use client";

import Image from "next/image";
import IMAGES from "@/utils/imagePaths";

const HeroOverlay = () => {
  return (
    <div className="relative w-full flex justify-center mt-4 md:mt-25">

      {/* Wrapper for alignment */}
      <div className="w-full md:flex md:items-center">

        {/* LEFT IMAGE */}
       <div className="relative hidden sm:block md:w-55 lg:md:w-65 md:h-50 z-10">
          <Image
            src={IMAGES.ALL.UZZI[1]}
            alt="left"
            fill
            className="object-cover"
          />
        </div>

        {/* CENTER BOX */}
        <div className="bg-[#8EA9D6] px-6 py-8 md:px-2 md:py-5 lg:px-3 lg:py-10 text-center shadow-xl z-20">
          <h1 className="text-4xl font-semibold text-black tracking-wide">
            EIS Simulation
          </h1>

          <p className="text-3xl md:text-2xl text-white lg:text-right mt-3 leading-snug">
            The IT Innovation and <br />
            Change Management Challenge
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-full md:w-65 lg:w-75 h-full sm:h-[140px] md:h-50 z-10">
          <Image
            src={IMAGES.ALL.UZZI[3]}
            alt="right"
            fill
            className="object-cover"
          />
        </div>

      </div>
    </div>
  );
};

export default HeroOverlay;