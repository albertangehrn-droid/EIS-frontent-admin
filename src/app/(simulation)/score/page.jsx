"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
import axiosInstance from '@/utils/axiosInstance';

/* ─── Session Report Row ─────────────────────────────────────────────────── */
function ReportSection({ title, dayLabel, rows, adopters }) {
  return (
    <section id="score-report-section" className="bg-white">
      <div id="score-report-section-header" className="px-2 py-1 border-b border-black/30 bg-[#f0f0f0]">
        <div id="score-report-section-title" className="text-[11px] font-bold text-black uppercase">
          {title}{' '}
          {dayLabel ? (
            <span id="score-report-section-day" className="font-normal text-black/70">{dayLabel}</span>
          ) : null}
        </div>
      </div>
      <div id="score-report-section-content" className="px-2 py-1.5 text-[11px] leading-[1.4] text-black">
        {rows.map((row) => (
          <div key={row.label} id="score-report-row" className="mb-1.5">
            <span id="score-report-row-label" className="font-bold">{row.label}:</span>{' '}
            <span id="score-report-row-value" className="font-normal whitespace-pre-line">{row.value || ''}</span>
          </div>
        ))}
        <div id="score-report-adopters" className="mt-1">
          <span id="score-report-adopters-label" className="font-bold">ADOPTERS:</span> {adopters}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ScorePage() {
  const router = useRouter();
  const exportRef = useRef(null);
  const fetchedSessionIdRef = useRef(null);
  const [mobileTab, setMobileTab] = useState('score');
  const { gameState, sessionId, MAX_DEMO_DECISIONS } = usePlayDemoGame();
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const playClick = () => { };

  useEffect(() => {
    if (!sessionId || fetchedSessionIdRef.current === sessionId) return;

    const fetchHistory = async () => {
      fetchedSessionIdRef.current = sessionId;
      setHistoryLoading(true);
      try {
        const response = await axiosInstance.get(`/game/history/${sessionId}`);
        if (response.data && response.data.success) {
          setHistoryData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching game history:", err);
        fetchedSessionIdRef.current = null;
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const sessionReport = useMemo(() => {
    const list = historyData?.timeline || historyData?.history || gameState?.history || [];
    if (!list || !Array.isArray(list) || list.length === 0) {
      return [];
    }

    return list.map((decision, idx) => {
      const tacticName = decision.initiativeName || decision.initiativeId || 'Unknown Initiative';
      const targetNames = (decision.targetManagers || decision.managers || [])
        .filter(Boolean)
        .map((manager) => manager?.name)
        .filter(Boolean)
        .join(', ');
      const adopters = decision.stageChanges?.adopted ?? decision.adopters ?? decision.adoptedCount ?? 0;
      const outcome = decision.feedbackMessage ?? decision.feedback ?? decision.outcome ?? '—';

      return {
        type: `DECISION ${decision.decisionNumber ?? idx + 1}`,
        dayLabel: decision.dayEnd !== undefined ? `(day ${decision.dayEnd})` : `(day ${decision.decisionNumber ?? idx + 1})`,
        rows: [
          {
            label: 'TACTIC',
            value: targetNames ? `${tacticName} (${targetNames})` : tacticName,
          },
          {
            label: 'RATIONALE',
            value: decision.rationale || '—',
          },
          {
            label: 'OUTCOME',
            value: outcome,
          },
        ],
        adopters,
      };
    });
  }, [historyData, gameState]);

  const handleSaveSessionReport = async () => {
    try {
      if (!exportRef.current) return;
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `boost-ai-session-report-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      window?.print?.();
    }
  };

  /* Chart points */
  const maxWeeks = 22;
  const chartHeight = 232;

  /* Convert week/decision to X coordinate */
  const toX = (week) => 42 + ((week - 1) / (maxWeeks - 1)) * 738;

  /* Convert value to SVG Y coordinate */
  const scaleY = (value, maxValue) => {
    return 252 - (value / maxValue) * chartHeight;
  };

  /* ── PAPs LINE (BLUE) ─── */
  const papPoints = useMemo(() => {
    if (historyData?.weeklyData && Array.isArray(historyData.weeklyData) && historyData.weeklyData.length > 0) {
      const sortedWeeks = [...historyData.weeklyData].sort((a, b) => a.weekNumber - b.weekNumber);
      const points = [];
      sortedWeeks.forEach((w) => {
        points.push([
          w.weekNumber + 1,
          scaleY(w.papsBefore ?? 0, 243)
        ]);
        points.push([
          w.weekNumber + 2,
          scaleY(w.papsAfter ?? 0, 243)
        ]);
      });
      return points;
    }

    const history = gameState?.history || [];
    let runningPaps = 121;
    return history.map((decision, index) => {
      runningPaps += decision.scoreImpact || 0;
      return [
        index + 1,
        scaleY(runningPaps, 243),
      ];
    });
  }, [historyData, gameState]);

  /* ─── ADOPTERS LINE (RED) ─── */
  const adopterPoints = useMemo(() => {
    if (historyData?.weeklyData && Array.isArray(historyData.weeklyData) && historyData.weeklyData.length > 0) {
      const sortedWeeks = [...historyData.weeklyData].sort((a, b) => a.weekNumber - b.weekNumber);
      const points = [];
      sortedWeeks.forEach((w) => {
        points.push([
          w.weekNumber + 1,
          scaleY(w.adoptedCountBefore ?? 0, 22)
        ]);
        points.push([
          w.weekNumber + 2,
          scaleY(w.adoptedCountAfter ?? 0, 22)
        ]);
      });
      return points;
    }

    const history = gameState?.history || [];
    let runningAdopters = 0;
    return history.map((decision, index) => {
      runningAdopters += decision.stageChanges?.adopted || 0;
      return [
        index + 1,
        scaleY(runningAdopters, 22),
      ];
    });
  }, [historyData, gameState]);

  /* SVG polyline points */
  const papToPoints = papPoints.map(([w, y]) => `${toX(w)},${y}`).join(' ');
  const adopterToPoints = adopterPoints.map(([w, y]) => `${toX(w)},${y}`).join(' ');

  /* ── Shared sub-components ─────────────────────────────────────────────── */

  const ScoreCircle = ({ size = 160, fontSize = 52 }) => (
    <div
      className="rounded-full flex flex-col items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 40% 35%, #e8f0f8 0%, #c8daea 60%, #b0ccdf 100%)',
        border: '1px solid #a0b8cc',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
      }}
    >
      <div style={{ fontSize, lineHeight: 1, color: '#b52020', fontWeight: 'bold' }}>
        {historyData ? (historyData.summary?.score ?? 0) : (gameState?.score ?? 0)}
      </div>
      <div style={{ fontSize: Math.max(8, fontSize * 0.2), fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '0.04em', textAlign: 'center', marginTop: 3 }}>
        OVERALL SCORE
      </div>
      <div style={{ fontSize: Math.max(7, fontSize * 0.18), color: '#444', marginTop: 2, textAlign: 'center' }}>
        (Days per Adopter)
      </div>
    </div>
  );

  const statsData = [
    { val: `${historyData ? (historyData.currentDay ?? 0) : (gameState?.time ?? 0)}`, label: 'DAYS', sub: 'TIME ELAPSED' },
    { val: `${historyData ? (historyData.summary?.adoptedCount ?? 0) : (gameState?.adoptedCount ?? gameState?.managers?.filter((m) => m?.adopted > 0).length ?? 0)}`, label: '# OF ADOPTERS', sub: '' },
    { val: `${historyData ? (historyData.currentDecisionNumber ?? 0) : (gameState?.decisionNumber ?? 0)}`, label: '# OF DECISIONS', sub: '' },
    { val: `${historyData ? (historyData.summary?.paps ?? 0) : (gameState?.paps ?? 0)}`, label: '# OF PAPs', sub: '' },
  ];

  const StatCard = ({ val, label, sub, bigNum = 26, labelSize = 9, subSize = 8 }) => (
    <div
      className="flex flex-col items-center justify-center py-2 px-1"
      style={{
        background: 'radial-gradient(circle at 40% 35%, #e8f0f8 0%, #c8daea 100%)',
        border: '1px solid #a0b8cc',
      }}
    >
      <div style={{ fontSize: bigNum, lineHeight: 1, color: '#b52020', fontWeight: 'bold' }}>{val}</div>
      <div style={{ fontSize: labelSize, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginTop: 2, letterSpacing: '0.04em' }}>{label}</div>
      {sub && <div style={{ fontSize: subSize, color: '#555', textAlign: 'center' }}>{sub}</div>}
    </div>
  );

  const ChartSVG = () => (
    <svg viewBox="0 0 820 280" className="w-full h-full" preserveAspectRatio="none" style={{ display: 'block' }}>
      <rect x="0" y="0" width="820" height="280" fill="#ffffff" />
      {Array.from({ length: 23 }).map((_, i) => {
        const val = 22 - i;
        const y = 20 + i * (232 / 22);
        return (
          <g key={`h-${i}`}>
            <line x1="42" y1={y} x2="780" y2={y} stroke="#888" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
            <text x="36" y={y + 3.5} fontSize="9" fill="#b52020" textAnchor="end" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{val}</text>
          </g>
        );
      })}
      {[243, 231, 220, 209, 198, 187, 176, 165, 154, 143, 132, 121, 110, 99, 88, 77, 66, 55, 44, 33, 22, 11, 0].map((v, i) => {
        const y = 20 + i * (232 / 22);
        return (
          <text key={`r-${i}`} x="786" y={y + 3.5} fontSize="9" fill="#1d4ed8" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{v}</text>
        );
      })}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 42 + (i / 21) * 738;
        return <line key={`v-${i}`} x1={x} y1="20" x2={x} y2="252" stroke="#888" strokeWidth="0.5" opacity="0.3" />;
      })}
      <polyline fill="none" stroke="#1d4ed8" strokeWidth="2.2" points={papToPoints} />
      <polyline fill="none" stroke="#b52020" strokeWidth="2.5" points={adopterToPoints} />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 42 + (i / 21) * 738;
        return <text key={`x-${i}`} x={x} y="265" fontSize="9" fill="#1a1a1a" textAnchor="middle" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{i + 1}</text>;
      })}
      <text x="410" y="278" fontSize="9" fill="#555" textAnchor="middle" fontFamily="Tahoma,Arial,Helvetica,sans-serif">Weeks</text>
    </svg>
  );

  const SessionReportList = () => (
    <>
      {sessionReport.map((item, idx) => (
        <div key={`${item.type}-${idx}`} style={{ borderBottom: '1px solid #ccc' }}>
          <ReportSection title={item.type} dayLabel={item.dayLabel} rows={item.rows} adopters={item.adopters} />
        </div>
      ))}
    </>
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div
      id="score-page-root"
      className="h-screen bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: 'Tahoma, Arial, Helvetica, sans-serif' }}
    >

      {/* ══ HEADER ══ */}
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton id="shared-btn-eis-simulation"
              label="EIS Simulation"
              onClick={() => {
                playClick();
                router.push('/aboutDetail');
              }}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
          </div>
        )}
        rightContent={(
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="score-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* SAVE PROGRESS */}
                <div style={{ gridColumnStart: 3 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-save-progress"
                    label="SAVE PROGRESS"
                    onClick={handleSaveSessionReport}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
                {/* BACK TO ACTION */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-back-to-action"
                    label="BACK TO ACTION"
                    onClick={() => router.push('/playDemo')}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => {
                  playClick();
                  window.print();
                }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      {/* ══ MOBILE/TABLET TAB BAR (hidden on lg+) ══ */}
      <div id="score-mobile-tabbar" className="flex lg:hidden flex-shrink-0 border-b border-[#bbb]" style={{ background: '#e8e8e8' }}>
        {[
          { key: 'score', label: 'Score & Chart' },
          { key: 'report', label: 'Session Report' },
        ].map((tab) => (
          <button
            key={tab.key}
            id={`score-tab-btn-${tab.key}`}
            onClick={() => setMobileTab(tab.key)}
            className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
            style={{
              background: mobileTab === tab.key ? '#ffffff' : '#e0e0e0',
              color: mobileTab === tab.key ? '#b52020' : '#666',
              borderBottom: mobileTab === tab.key ? '2px solid #b52020' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ MAIN ══ */}
      <main id="score-main" ref={exportRef} className="flex-1 overflow-hidden flex min-h-0">

        {/* ── DESKTOP (lg+): original side-by-side layout, totally unchanged ── */}
        <div id="score-desktop-layout" className="hidden lg:flex flex-1 overflow-hidden">

          {/* Score column */}
          <div
            id="score-score-column"
            className="flex flex-col items-center justify-start py-6 px-4 flex-shrink-0"
            style={{ width: 230, background: '#ffffff', borderRight: '1px solid #ccc' }}
          >
            <ScoreCircle size={160} fontSize={52} />
            <div id="score-stat-cards-grid" className="grid grid-cols-2 gap-1.5 mt-5 w-full">
              {statsData.map((s, i) => <StatCard key={i} {...s} bigNum={26} labelSize={9.5} subSize={8.5} />)}
            </div>
          </div>

          {/* Chart column */}
          <div id="score-chart-column" className="flex-1 flex flex-col overflow-hidden bg-white p-3">
            <div id="score-chart-legend" className="flex items-center justify-between mb-1 px-1">
              <span id="score-chart-adopters-label" style={{ fontSize: 12, fontWeight: 'bold', color: '#b52020', letterSpacing: '0.04em' }}>
                ADOPTERS (22 max)
              </span>
              <span id="score-chart-paps-label" style={{ fontSize: 12, fontWeight: 'bold', color: '#1d4ed8', letterSpacing: '0.04em' }}>
                POSITIVE ATTITUDE POINTS – PAPs (243 max)
              </span>
            </div>
            <div id="score-chart-wrapper" className="flex-1 border border-[#555] bg-white overflow-hidden" style={{ minHeight: 0 }}>
              <ChartSVG />
            </div>
          </div>

          {/* Session report column */}
          <div
            id="score-report-column"
            className="flex flex-col overflow-hidden bg-white flex-shrink-0"
            style={{ width: 320, borderLeft: '1px solid #999' }}
          >
            <div id="score-report-column-header" className="px-3 py-1.5 border-b border-[#999] flex-shrink-0" style={{ background: '#f5f5f5' }}>
              <div id="score-report-column-title" style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '0.08em' }}>
                SESSION REPORT
              </div>
            </div>
            <div id="score-report-column-body" className="flex-1 overflow-y-auto bg-white">
              <SessionReportList />
            </div>
          </div>
        </div>

        {/* ── MOBILE / TABLET (<lg): tab-based ── */}
        <div id="score-mobile-layout" className="flex lg:hidden flex-1 flex-col overflow-hidden bg-white">

          {/* TAB: Score & Chart */}
          {mobileTab === 'score' && (
            <div id="score-mobile-score-tab" className="flex-1 overflow-y-auto flex flex-col">

              {/* Score row: circle + stats side by side */}
              <div id="score-mobile-score-row" className="flex items-center gap-3 p-3 border-b border-[#ddd]">
                {/* Smaller circle on mobile */}
                <ScoreCircle size={100} fontSize={34} />

                {/* Stats 2×2 grid fills remaining space */}
                <div id="score-mobile-stat-grid" className="grid grid-cols-2 gap-1.5 flex-1">
                  {statsData.map((s, i) => (
                    <StatCard key={i} {...s} bigNum={20} labelSize={8.5} subSize={7.5} />
                  ))}
                </div>
              </div>

              {/* Chart labels */}
              <div id="score-mobile-chart-legend" className="flex items-center justify-between px-3 pt-2 pb-1 flex-shrink-0">
                <span id="score-mobile-adopters-label" style={{ fontSize: 10, fontWeight: 'bold', color: '#b52020' }}>
                  ADOPTERS (22 max)
                </span>
                <span id="score-mobile-paps-label" style={{ fontSize: 10, fontWeight: 'bold', color: '#1d4ed8' }}>
                  PAPs (243 max)
                </span>
              </div>

              {/* Chart — fixed height so it doesn't stretch weird */}
              <div
                id="score-mobile-chart-wrapper"
                className="mx-3 mb-3 border border-[#555] bg-white flex-shrink-0"
                style={{ height: 200 }}
              >
                <ChartSVG />
              </div>
            </div>
          )}

          {/* TAB: Session Report */}
          {mobileTab === 'report' && (
            <div id="score-mobile-report-tab" className="flex-1 overflow-y-auto bg-white">
              <div
                id="score-mobile-report-header"
                className="px-3 py-1.5 border-b border-[#999] sticky top-0 z-10 flex-shrink-0"
                style={{ background: '#f5f5f5' }}
              >
                <div id="score-mobile-report-title" style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '0.08em' }}>
                  SESSION REPORT
                </div>
                <div id="score-mobile-report-subtitle" style={{ fontSize: 10, color: '#666', marginTop: 1 }}>
                  Scroll to view events &amp; decisions
                </div>
              </div>
              <SessionReportList />
            </div>
          )}
        </div>

      </main>

      {/* ══ FOOTER ══ */}
      <SimulationFooter
        timeLabel={`TIME (${historyData ? (historyData.currentDay ?? 0) : (gameState?.time || 0)})`}
        usedDays={historyData ? (historyData.currentDay ?? 0) : (gameState?.time || 0)}
        decisionInfo={`DECISION ${historyData ? (historyData.currentDecisionNumber ?? 0) : (gameState?.decisionNumber || 0)} / ${MAX_DEMO_DECISIONS}`}
      />
    </div>
  );
}