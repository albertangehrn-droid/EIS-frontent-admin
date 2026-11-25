"use client";

import Image from "next/image";
import { IMAGES } from "@/utils/imagePaths";

// Color-coded group legend — shown only in External Links view
const GROUP_LEGENDS = [
  {
    bgColor: "#f5d020",
    textColor: "#4a3500",
    people: [
      "Emma Stuart (CEO)",
      "Per Joos (CTO)",
      "Adam deGroote (Facilities)",
      "Anna Belloni (Marketing & Comm)",
    ],
  },
  {
    bgColor: "#4a7fc1",
    textColor: "#ffffff",
    people: [
      "Frank Raponi (CHRO)",
      "Luis Fernandez (Fixed Products)",
      "Fred Smithson (Regulatory Office)",
      "Ivan Tarowski (Intl. Roaming)",
    ],
  },
  {
    bgColor: "#5cb85c",
    textColor: "#ffffff",
    people: [
      "Adam deGroote (Facilities)",
      "Adrian Muster (Legal Office)",
      "Daniel Wang (Mobile Products)",
      "Thomas Kupik (Consumer Sales)",
    ],
  },
  {
    bgColor: "#e8706a",
    textColor: "#ffffff",
    people: ["Martin Buerli (CFO)", "Wilma Grollmyer (Procurement)"],
  },
];

export default function ExternalLinks({ activeNet, imgError, setImgError }) {
  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Title */}
        <div
          style={{
            marginLeft: "48px",
            marginTop: "18px",
            marginBottom: "10px",
            width: "fit-content",
            padding: "18px 28px",
            position: "relative",
            zIndex: 5,
          }}
        >
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            External Links
          </h1>
        </div>

        {/* Main Content */}
        <div
          className="flex flex-row flex-1"
          style={{
            paddingLeft: "48px",
            paddingRight: "24px",
            gap: "36px",
            overflow: "visible",
          }}
        >
          {/* LEFT BOXES */}
          <div
            style={{
              width: "330px",
              minWidth: "330px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {GROUP_LEGENDS.map((g, i) => (
              <div
                key={i}
                style={{
                  background: g.bgColor,
                  border: "1px solid rgba(0,0,0,0.15)",
                  padding: "2px 10px",
                }}
              >
                {g.people.map((person, pi) => (
                  <div
                    key={pi}
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: g.textColor,
                      lineHeight: 1.5,
                    }}
                  >
                    {person}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* IMAGE */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              overflow: "visible",
              paddingTop: "0px",
              paddingLeft: "20px",
              marginTop: "-90px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "620px",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Image
                src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
                alt="External Links network"
                width={560}
                height={350}
                priority
                onError={() => setImgError(true)}
                style={{
                  objectFit: "contain",
                  width: "560px",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="pl-[52px] pr-[40px] pt-0 pb-[18px] bg-white relative z-[5] -mt-[20px]">
          <p className=" text-[12px] w-[55%] text-[#222] leading-[1.7] m-0">
            You have observed over the past days that certain individuals belong
            to the same social groups
            <br />
            as they tend to share <strong>Political Views</strong> (yellow and
            blue), meet regularly at the <strong>Tennis Club</strong> (green),
            <br />
            or are actively involved in the same <strong>Charity</strong>{" "}
            (orange)
          </p>
        </div>
      </div>
    </>
  );
}
