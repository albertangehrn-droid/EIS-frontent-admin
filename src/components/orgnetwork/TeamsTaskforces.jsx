"use client";

import Image from "next/image";
import { IMAGES } from "@/utils/imagePaths";

export default function TeamsTaskforces({ activeNet, imgError, setImgError }) {
  console.log("TeamsTaskforces component loaded with props:", {
    activeNet,
    imgError,
  });
  return (
    <>
      {/* Title */}
      <div className="ml-12 mt-[18px] w-fit px-6 py-3 relative z-[5]">
        <h1 className="text-[44px] font-bold text-[#111] m-0 tracking-[-0.02em] leading-none">
          Teams / Taskforces
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-row flex-1 min-h-0 pl-5 pr-5 pb-0 gap-6 overflow-visible items-start">
        {/* Teams Info */}
        <div
          className="shrink-0 flex flex-col gap-2 pt-1 pr-4 ml-7"
          style={{ width: "330px", minWidth: "330px" }}
        >
          <div
            style={{
              background: "#F59787",
              borderRadius: "2px",
              padding: "7px 12px",
            }}
          >
            <div className="text-[11px] text-black mt-1">
              John Peters (Internet Products) <br />
              Daniel Wang (Mobile Products) <br />
              Luis Fernandez (Fixed Products) <br />
              Thomas Kupik (Consumer Sales) <br />
              Laszlo Por (Corporate Sales) <br />
              Ivan Tarowski (Intl. Roaming)
            </div>
          </div>

          <div
            style={{
              background: "#CAD8EC",
              borderRadius: "2px",
              padding: "3px 12px",
            }}
          >
            <div className="text-[11px] text-black mt-1">
              Bert Heinze (Ext. Fin. Controller) <br />
              Martin Buerli (CFO)
              <br />
              Per Joos (CTO) <br />
              Samuel Stein (Treasury) <br />
              Adrian Muster (Legal Office) <br />
              Wilma Grollmyer (Procurement)
            </div>
          </div>

          <div
            style={{
              background: "#FFFF00",
              borderRadius: "2px",
              padding: "7px 12px",
            }}
          >
            <div className="text-[11px] text-black mt-1">
              Emma Stuart (CEO) <br />
              Martin Buerli (CFO) <br />
              Per Joos (CTO) <br />
              Randy Longhorn (CCO) <br />
              Frank Raponi (CHRO)
            </div>
          </div>
        </div>

        {/* Org Chart */}
        <div
          className="flex-1 flex justify-start items-start overflow-visible pl-5 relative"
          style={{
            marginTop: "-70px",
          }}
        >
          <div className="w-[620px] flex justify-center items-start">
            <Image
              src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
              alt="Teams/Taskforces network"
              width={560}
              height={350}
              priority
              onError={() => setImgError(true)}
              className="w-[560px] h-auto object-contain block"
            />
          </div>
        </div>
      </div>

      {/* Bottom Description */}
      <div className="shrink-0 px-5 pt-2 bg-white relative z-10">
        <p
          style={{
            fontSize: "12px",
            color: "#222",
            margin: 0,
            lineHeight: 1.75,
          }}
        >
          Formal <strong>task forces</strong> have been established to drive
          strategic initiatives.
          <br />
          These teams bring together <strong>
            cross-functional expertise
          </strong>{" "}
          and <strong>leadership</strong>.<br />
          Understanding these formal networks is key to navigating{" "}
          <strong>organizational structure</strong>.
        </p>
      </div>
    </>
  );
}
