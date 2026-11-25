"use client";

import Image from "next/image";
import { IMAGES } from "@/utils/imagePaths";

export default function CoffeeGroups({ activeNet, imgError, setImgError }) {
  console.log("CoffeeGroups component loaded with props:", {
    activeNet,
    imgError,
  });
  return (
    <>
      {/* Title */}
      <div className="flex h-full bg-white overflow-hidden">
        {/* LEFT GROUPS */}
        <div className="w-[230px] min-w-[230px] pt-1 pl-2 pr-2 flex flex-col gap-[3px]">
          <div className="bg-[#b7bd6d] border border-red-400 px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Emma Stuart (CEO)
              <br />
              Bert Heinze (Ext. Fin. Controller)
              <br />
              Randy Longhorn (CCO)
              <br />
              John Peters (Internet Products)
            </p>
          </div>

          <div className="bg-[#ffff00] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Stefanie Durand (Pers. Assistant)
              <br />
              Frank Raponi (CHRO)
              <br />
              Linda Pastorakis (Business Excellence)
              <br />
              Adrian Muster (Legal Office)
              <br />
              Anna Belloni (Marketing & Comm)
            </p>
          </div>

          <div className="bg-[#cad8ec] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Per Joos (CTO)
              <br />
              Wilma Grollmyer (Procurement)
            </p>
          </div>

          <div className="bg-[#e0bf5f] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Martin Buerli (CFO)
              <br />
              Jill Atherson (Personnel & Training)
              <br />
              Adam deGroote (Facilities)
              <br />
              Samuel Stein (Treasury)
              <br />
              Pradeep Gupta (IT)
              <br />
              Thomas Kupik (Consumer Sales)
            </p>
          </div>

          <div className="bg-[#6d8fd6] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Daniel Wang (Mobile Products)
              <br />
              Laszlo Por (Corporate Sales)
              <br />
              Ivan Tarowski (Intl. Roaming)
            </p>
          </div>

          <div className="bg-[#f59787] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Jill Atherson (Personnel & Training)
              <br />
              Linda Pastorakis (Business Excellence)
              <br />
              Anna Belloni (Marketing & Comm)
            </p>
          </div>

          <div className="bg-[#ff0000] border border-[#8f8f8f] px-2 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold text-white">
              Samuel Stein (Treasury)
              <br />
              Laszlo Por (Corporate Sales)
            </p>
          </div>

          <div className="bg-[#a8cb8c] border border-[#8f8f8f] px-1 py-1">
            <p className="text-[11px] leading-[1.25] font-semibold">
              Martin Buerli (CFO)
              <br />
              Pradeep Gupta (IT)
              <br />
              Wilma Grollmyer (Procurement)
              <br />
              Jean Bardotte (Operations)
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col relative">
          {/* TITLE */}
          <div className="pt-6 pl-5">
            <h1 className="text-5xl font-semibold text-black">
              Coffee
              <br />
              Groups
            </h1>
          </div>

          {/* IMAGE */}
          <div className="absolute top-[20px] left-[200px]">
            <Image
              src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
              alt="Coffee Groups network"
              width={620}
              height={440}
              priority
              onError={() => setImgError(true)}
              className="w-[600px] h-auto object-contain"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="absolute bottom-[22px] left-[25px] z-10">
            <p className="text-[13px] leading-[1.3] text-black">
              You have observed over the last few days that there are{" "}
              <strong>8 groups of managers</strong>
              <br />
              who get together regularly for coffee, lunch, or informal meetings
              online.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
