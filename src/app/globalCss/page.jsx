"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { controller } from "@/services/apiServices";
import { showToast } from "@/components/_ui/toast-utils";
import { Loader2, Save, ArrowLeft, Code, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";
import SimulationHeader from "@/components/common/SimulationHeader";
import GameButton from "@/components/Buttons/GameButton";
// import { playClickSound } from "@/utils/soundEffects";

export default function GlobalCssEditorPage() {
  const router = useRouter();
  const [cssText, setCssText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // const { playClickSound } = useSoundContext();
  

  useEffect(() => {
    const fetchGlobalCss = async () => {
      try {
        const res = await controller.pageConfig.getPageConfig("globalCss");
        if (res.data?.success && res.data.data) {
          const config = res.data.data;
          setCssText(config.styles?.cssText || "");
        } else {
          showToast("error", "Failed to fetch global CSS configuration");
        }
      } catch (error) {
        console.error("Error fetching global CSS:", error);
        showToast("error", "Failed to load global CSS settings");
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalCss();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await controller.pageConfig.updatePageConfig("globalCss", {
        pageName: "Global CSS",
        content: {},
        styles: { cssText },
        assets: {},
      });
      if (res.data?.success) {
        showToast("success", "Global CSS updated and applied successfully!");
      } else {
        showToast("error", res.data?.message || "Failed to update Global CSS");
      }
    } catch (error) {
      console.error("Error saving global CSS:", error);
      showToast("error", "Failed to save Global CSS modifications");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1b1b1b]" />
        <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Global Stylesheet...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#faf8f4] flex flex-col pb-8">
        <SimulationHeader
              leftContent={
                <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
                  <GameButton
                    label="EIS Simulation"
                    onClick={() => {
                      // playClickSound();
                      router.push("/playDemo");
                    }}
                    variant="compact"
                    size="lg"
                    className="!font-semibold !py-1"
                  />
                </div>
              }
              rightContent={
                <div className="flex items-center gap-1 mt-2 sm:mt-3">
                  <div className="flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
                    <div
                      id="globalcss-desktop-nav-buttons"
                      className="flex items-center justify-end w-full"
                    >
                      <GameButton
                        id="shared-btn-back-to-action"
                        label="BACK TO ACTION"
                        onClick={() => {
                          // playClickSound();
                          router.push("/");
                        }}
                        variant="nav"
                        size="md"
                        className="px-4 sm:px-6 py-0 !text-[0.9rem] sm:!text-[1.2rem] !font-semibold !whitespace-nowrap w-[120px] sm:w-[180px]"
                      />
                    </div>
                    <GameButton id="shared-btn-print"
                      label="PRINT"
                      onClick={() => { window.print(); }}
                      variant="nav"
                      size="sm"
                      className="text-[10px] sm:text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] w-[120px] sm:w-[180px] mt-[2px]"
                    />
                  </div>
                </div>
              }
            />

      <main className="mx-auto max-w-6xl w-full px-4 pt-6 flex-1 flex flex-col">
        <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden flex-1 flex flex-col">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-[#1b1b1b] px-4 sm:px-6 py-4 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 text-white rounded transition-colors"
                title="Back to Admin Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-[#efb860]">
                <Code className="w-5 h-5" />
                <h1 className="text-sm font-black uppercase tracking-[0.15em]">
                  Global CSS Stylesheet
                </h1>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#efb860] hover:bg-[#dfc181] text-black px-6 py-2.5 rounded-sm font-bold uppercase tracking-[0.1em] text-xs transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save & Apply CSS
            </button>
          </div>

          {/* Editor Body */}
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="bg-[#faf8f4] p-4 rounded-sm border border-black/5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#efb860] shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 space-y-1">
                <span className="font-bold text-gray-800 uppercase tracking-wide block">
                  How to use Global CSS:
                </span>
                <p>
                  Any CSS rules written here will be fetched and dynamically
                  injected client-side into the document head, overriding
                  default styling across all simulation and game screens.
                </p>
                <p className="mt-1">
                  Use browser devtools to inspect elements and find their unique
                  IDs (e.g. <code>#about-detail-line1</code>,{" "}
                  <code>#about-detail-back-btn</code>) and target them directly.
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[450px]">
              <div className="bg-[#252526] px-4 py-2 border-b border-black/10 flex items-center justify-between text-[#858585] text-[11px] font-bold uppercase tracking-wider font-mono">
                <span>global.override.css</span>
                <span>CSS STYLESHEET</span>
              </div>
              <div className="w-full relative h-[500px]">
                <Editor
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  value={cssText}
                  onChange={(value) => setCssText(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    formatOnPaste: true,
                    formatOnType: true,
                    colorDecorators: true, // Enables color pickers for CSS colors
                    suggestOnTriggerCharacters: true, // Enables IntelliSense suggestions
                  }}
                  loading={
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Loading Editor...
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
