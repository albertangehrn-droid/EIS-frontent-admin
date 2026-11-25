"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function ReportModal({ sessionId, teamName, onClose }) {
  const [reportText, setReportText] = useState("Generating report...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const [sessionRes, historyRes] = await Promise.all([
          axiosInstance.get(`/admin/sessions/${sessionId}`),
          axiosInstance.get(`/game/history/${sessionId}`).catch(() => ({ data: { data: null } }))
        ]);

        if (sessionRes.data?.success) {
          const sessionData = sessionRes.data.data;
          const historyData = historyRes.data?.success ? historyRes.data.data : null;
          
          const text = generateReportText(sessionData, historyData, sessionId);
          setReportText(text);
        } else {
          setReportText("Failed to retrieve session data.");
        }
      } catch (err) {
        console.error("Failed to load session report", err);
        setReportText("Error generating session report.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const generateReportText = (sessionData, historyData, sId) => {
    if (!sessionData) return "No Session Data Available";
    const license = sessionData.license || "180661";
    const sessionNum = sessionData.sessionCode || sId || "LOCAL VERSION";
    
    const date = sessionData.createdAt ? new Date(sessionData.createdAt) : new Date();
    const timestamp = date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric"
    }) + "   " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const simTime = sessionData.gameState?.time || 0;
    const historyList = sessionData.gameState?.history || historyData?.history || [];
    const numInitiatives = historyList.length;  
    const score = sessionData.gameState?.score ?? 0; 
    
    const managers = sessionData.gameState?.managers || [];
    const adopters = managers.filter(m => m.adopted > 0).length;

    const formatRealTime = (seconds) => {
      if (!seconds || typeof seconds !== "number" || seconds <= 0) return "0s";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    const teamNameStr = sessionData.teamName ? `Team ${sessionData.teamName}` : "Team Info";
    const strategyText = sessionData.strategyText ? `>${sessionData.strategyText}` : ">>";

    let report = `(1) KEY SESSION DATA
============================================================
EIS Simulation License:        ${license} / Session Number: ${sessionNum}
Timestamp:                 ${timestamp}
Real Time Elapsed:         ${formatRealTime(sessionData.realTimeElapsed)}
Simulation Time Elapsed:   ${simTime} days
Number of Initiatives:     ${numInitiatives}
Number of Attitude Points: ${score} (out of max. 243)
Number of Adopters:        ${adopters} (out of max. 22)
Score:                     ${score}


(2) TEAM / STRATEGY & REFLECTION POINTS
============================================================
${teamNameStr}
---- o ---- o ---- o ---- o ----
${strategyText}
---- o ---- o ---- o ---- o ----
>>>> DOs



>>>> DONTs





KEN RETAINS THAT:
================
120    is the total number of DAYS available
${simTime}     is the total number of DAYS you used in your intervention
${score}     is the total number of Positive Attitude Points (PAPs) you were finally able to secure
${adopters}      is the total number of Managers you succeeded in persuading

Consider that this Simulation is parametrized at the highest difficulty degree.
Only a few Teams succeed well the first time(s) they try to accomplish the Mission. 
Therefore:

CONGRATULATIONS for a still incomplete, probably a bit frustrating, but surely Very Interesting run!!

(3) ADOPTION STAGES
============================================================
INFO IGNORED     AWARE       INTERESTED  TRYING/APPR. ADOPTED
`;

    managers.forEach(m => {
      let stageStr = "";
      const name = m.name || `Manager ${m.managerId}`;
      if (m.adopted > 0) stageStr = "                                                  " + name;
      else if (m.experimentation > 0) stageStr = "                                      " + name;
      else if (m.interest > 0) stageStr = "                          " + name;
      else if (m.aware > 0) stageStr = "             " + name;
      else stageStr = "Y                " + name;
      report += stageStr + "\n";
    });

    report += `\n\n(4) HISTORY SUMMARY\n============================================================\n`;
    historyList.forEach((d, i) => {
      const initName = d.initiativeName || d.initiativeId || "Initiative";
      report += `# ${i + 1} (Day ${d.decisionNumber}) ${initName}\n`;
    });

    report += `\n\n(5) DETAILED HISTORY\n============================================================\n`;
    historyList.forEach((d, i) => {
      const initName = d.initiativeName || d.initiativeId || "Initiative";
      report += `\nDECISION ${i + 1}  (Day ${d.decisionNumber})\n`;
      report += `___________________________________________________________________\n`;
      report += `TACTIC  :${initName}\n`;
      report += `RATIONALE: ${d.rationale || ""}\n`;
      report += `OUTCOME: ${d.feedbackMessage || ""}\n\n`;
      report += `ADOPTERS: ${d.adoptedCountAfter ?? 0}\n`;
    });

    return report;
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `BAIReport_${teamName || "session"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* BODY */}
      <div className="flex-1 overflow-auto overflow-x-hidden bg-white p-8 text-black font-mono text-[14px] leading-[1.5] whitespace-pre-wrap select-text no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-sans">
            Generating report...
          </div>
        ) : (
          reportText
        )}
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="flex w-full shrink-0" style={{ height: "55px" }}>
        <button
          onClick={handleDownload}
          className="flex-1 bg-black text-[#efb860] hover:text-yellow-400 font-bold font-mono text-[14px] uppercase tracking-widest flex items-center justify-center transition-colors border-r border-[#efb860]/20"
        >
          Download Report
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-black text-[#efb860] hover:text-yellow-400 font-bold font-mono text-[14px] uppercase tracking-widest flex items-center justify-center transition-colors"
        >
          Close the Report
        </button>
      </div>
    </div>
  );
}
