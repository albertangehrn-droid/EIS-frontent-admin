import { useSoundContext } from '@/contexts/SoundContext';
import { helpDialogData } from '@/data/helpDialogData';

export default function GameHelpDialogPlayDemo({ show, onClose }) {
  const { playClickSound } = useSoundContext();
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="w-[min(1060px,96vw)] max-h-[90vh] overflow-y-auto bg-[#f5f5f5] border-2 border-[#333] shadow-[0_16px_36px_rgba(0,0,0,0.45)] font-sans"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#111] text-[#d4a017] px-3.5 py-2.5 font-bold tracking-[0.08em]">
          {helpDialogData.title}
        </div>

        <div className="p-3.5">
          <div className="bg-[#f8f8f8] border border-[#b9b9b9] p-3.5">
            <div className="grid grid-cols-[100px_1fr_210px] gap-3 items-stretch">
              <div
                className="writing-mode-vertical-rl rotate-180 text-[58px] font-bold text-[#111] text-center tracking-[0.03em]"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {helpDialogData.verticalText}
              </div>

              <div className="border border-[#c8c8c8] bg-white p-2">
                <div className="h-9 bg-[#1a1a1a] flex items-center justify-between px-2.5">
                  <span className="text-[#d4a017] text-base font-bold">EIS Simulation</span>
                  <div className="flex gap-2 text-[#d4a017] text-[11px]">
                    {helpDialogData.headerButtons.map(btn => (
                      <span key={btn}>{btn}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[180px_1fr_180px] gap-2 mt-2">
                  <div className="border border-[#bbb] bg-[#ececec] min-h-[220px] p-1.5">
                    <div className="text-xs font-bold mb-1.5">Control Panel</div>
                    {helpDialogData.controlPanelItems.map((_, index) => (
                      <div key={index} className="h-4 bg-[#dbe2ff] mb-1 border border-[#c9c9c9]" style={{ backgroundColor: index % 2 === 0 ? '#dbe2ff' : '#efefef' }} />
                    ))}
                  </div>

                  <div className="border border-[#bbb] bg-[#f3f3f3] min-h-[220px] p-2">
                    <div className="text-xs font-bold mb-1.5">Initiatives Window</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {helpDialogData.initiativeItems.map((item) => (
                        <div key={item} className="border-b border-[#ccc] pb-0.5">{item}</div>
                      ))}
                    </div>
                    <div className="mt-2.5 border border-[#c9c9c9] bg-white h-28 p-1.5 text-[11px] leading-[1.3]">
                      {helpDialogData.initiativeDescription}
                    </div>
                  </div>

                  <div className="border border-[#bbb] bg-[#ececec] min-h-[220px] p-2 text-[11px] leading-[1.35]">
                    <div className="text-xs font-bold mb-1.5">Mission Notes</div>
                    {helpDialogData.missionNotes}
                  </div>
                </div>

                <div className="h-7 mt-2 bg-[#111] flex items-center justify-between px-2">
                  <div className="flex gap-2 text-[#d4a017] text-[11px]">
                    {helpDialogData.footerButtons.map((btn, idx) => (
                      <span key={btn} className={idx === 3 ? 'text-white' : ''}>{btn}</span>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {helpDialogData.footerProgressBars.map((_, index) => (
                      <div key={index} className="w-3 h-2.25" style={{ backgroundColor: index < 4 ? '#c7262d' : '#2c2c2c' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                {helpDialogData.guideItems.map((text) => (
                  <div key={text} className="border border-[#bdbdbd] bg-white p-2 text-sm leading-[1.25]">
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-[#333]">
                Guide: {helpDialogData.guideText}
              </span>
              <button
                onClick={() => { playClickSound(); onClose(); }}
                className="bg-[#111] text-[#d4a017] border border-[#555] px-3.5 py-2 font-bold cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
