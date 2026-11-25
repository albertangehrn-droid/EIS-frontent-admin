"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import IMAGES from "@/utils/imagePaths";

export default function StrategyModal({ sessionId, onClose }) {
  const [strategyText, setStrategyText] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const response = await axiosInstance.get(`/game/state/${sessionId}`);
        if (response.data?.success && response.data?.data) {
          setStrategyText(response.data.data.strategyText || "No strategy written yet.");
          setTeamName(response.data.data.teamName || "Unknown Team");
        }
      } catch (err) {
        console.error("Failed to load team strategy", err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchStrategy();
    }
  }, [sessionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded shadow-xl w-[950px] max-w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-neutral-100 border-b border-black/10 px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-lg text-neutral-800">
              Session Strategy {teamName ? `- ${teamName}` : ''}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black font-bold text-xl px-2"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#d9d9d9] flex-1 relative min-h-[450px]">
          {/* Watermark Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.22] grayscale">
            <Image
              src={IMAGES.ALL.KEN}
              alt="Background watermark"
              fill
              className="object-cover"
              priority
            />
          </div>

          {loading ? (
            <div className="py-40 text-center text-neutral-500 w-full font-sans relative z-10">
              Loading strategy...
            </div>
          ) : (
            <div className="max-w-4xl mx-auto relative z-10 flex flex-col h-full">
              {/* Strategy Header */}
              <div className="mb-2 text-[16px] sm:text-[19px] leading-tight font-sans text-[#1a1a1a]">
                <span>These are the Key Points of </span>
                <strong>your Strategy:</strong>
                <span className="text-[13px] text-[#2e2e2e] italic ml-1">Click here to see more about</span>
              </div>

              {/* Lined Notepad Editor Area */}
              <div className="relative border border-[#bcbcbc] bg-[#ececec] p-4 min-h-[280px] rounded shadow-sm">
                <div 
                  className="strategy-editor-content w-full h-full min-h-[240px] text-[18px] sm:text-[22px] leading-[1.35] text-[#222] font-sans whitespace-pre-wrap outline-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.35em - 2px), #757575 calc(1.35em - 2px), #757575 1.35em)',
                    backgroundAttachment: 'local',
                    backgroundOrigin: 'content-box',
                    backgroundPositionY: '1px',
                  }}
                >
                  {strategyText}
                </div>
              </div>

              {/* Footer Section: Team Name & Note */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start">
                <div>
                  <div className="text-[18px] sm:text-[20px] text-[#1f1f1f] mb-1">
                    <span>Our </span>
                    <strong>Change Agents Team Name:</strong>
                  </div>
                  <div className="w-full border-b border-[#9a9a9a] pb-1 bg-transparent text-[22px] sm:text-[26px] font-bold leading-[1.08] text-black min-h-[35px]">
                    {teamName || "DEMO"}
                  </div>
                </div>

                <div className="text-[11px] sm:text-[12px] leading-snug font-sans text-[#4e4e4e] md:text-right select-none md:mt-6">
                  Feel free to come back anytime to revise your Strategy on the basis of the new insights gained.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
