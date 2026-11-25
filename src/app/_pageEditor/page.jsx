"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { controller } from '@/services/apiServices';
import { showToast } from '@/components/_ui/toast-utils';
import { Loader2, Save, Type, Palette, RefreshCcw, ImageIcon, Database, Upload, Plus, X, Code } from 'lucide-react';
import SimulationHeader from '@/components/common/SimulationHeader';
import GameButton from '@/components/Buttons/GameButton';
import IMAGES from '@/utils/imagePaths';



const CssLineEditor = ({ styleKey, cssString, onChange }) => {
  const safeCssString = cssString || '';
  const lines = safeCssString.split(';').filter(l => l.trim() !== '').map(l => {
    const colonIdx = l.indexOf(':');
    if (colonIdx === -1) {
      return { prop: l.trim(), val: '' };
    }
    const prop = l.slice(0, colonIdx).trim();
    const val = l.slice(colonIdx + 1).replace(/^\s+/, '');
    return { prop, val };
  });

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    onChange('styles', styleKey, newLines.map(l => `${l.prop}: ${l.val}`).join('; ') + ';');
  };

  const addLine = () => {
    onChange('styles', styleKey, safeCssString + (safeCssString.trim().endsWith(';') || !safeCssString.trim() ? '' : ';') + ' property: value;');
  };

  const removeLine = (index) => {
    const newLines = lines.filter((_, i) => i !== index);
    onChange('styles', styleKey, newLines.map(l => `${l.prop}: ${l.val}`).join('; ') + (newLines.length > 0 ? ';' : ''));
  };

  return (
    <div className="bg-[#1e1e1e] rounded-sm border border-black/20 overflow-hidden font-mono text-[13px] shadow-inner">
      <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-black/10">
        <span className="text-[#858585] text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
          <Code className="w-3 h-3" /> {styleKey}.css
        </span>
        <button onClick={addLine} className="text-[#efb860] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold">
          <Plus className="w-3 h-3" /> ADD PROPERTY
        </button>
      </div>
      <div className="p-4 space-y-2">
        {lines.map((line, idx) => (
          <div key={`${styleKey}-line-${idx}`} className="flex items-center gap-2 group">
            <span className="text-[#5a5a5a] w-6 text-right select-none">{idx + 1}</span>
            <input type="text" value={line.prop} onChange={(e) => updateLine(idx, 'prop', e.target.value)}
              className="bg-transparent text-[#9cdcfe] outline-none border-b border-transparent focus:border-[#efb860]/30 w-1/3 py-0.5" placeholder="property" />
            <span className="text-[#d4d4d4]">:</span>
            <input type="text" value={line.val} onChange={(e) => updateLine(idx, 'val', e.target.value)}
              className="bg-transparent text-[#ce9178] outline-none border-b border-transparent focus:border-[#efb860]/30 flex-1 py-0.5" placeholder="value" />
            <span className="text-[#d4d4d4]">;</span>
            <button onClick={() => removeLine(idx)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all p-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {lines.length === 0 && <div className="text-[#5a5a5a] italic text-[11px] py-2">No properties defined.</div>}
      </div>
    </div>
  );
};



// ── Main PageEditor ───────────────────────────────────────────────────────────
const PageEditor = () => {
  const router = useRouter();
  const [configs, setConfigs] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [formData, setFormData] = useState({ content: {}, styles: {}, assets: {}, pageName: '' });
  const [activeStyleTab, setActiveStyleTab] = useState('simulation');
  const [activeTextTab, setActiveTextTab] = useState('simulation');

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    try {
      const res = await controller.pageConfig.getAllPageConfigs();
      if (res.data?.success) setConfigs(res.data.data);
    } catch { showToast("error", "Failed to load configurations"); }
    finally { setLoading(false); }
  };

  const handlePageSelect = (config) => {
    setSelectedPage(config);
    const styles = { ...config.styles };
    
    if (config.pageId === 'mission') {
      setActiveStyleTab('missionContent');
      setActiveTextTab('context');
      
      if (styles.pageStyle === undefined) {
        styles.pageStyle = 'background-color: #d9d9d9;';
      }
      if (styles.contentBoxStyle === undefined) {
        styles.contentBoxStyle = 'background-color: #e5e5e5; border: 1px solid #bfbfbf; color: #1b1b1b;';
      }
      if (styles.headingStyle === undefined) {
        styles.headingStyle = 'color: #242424; font-family: font-serif; font-weight: bold; font-size: 1.875rem;';
      }
      if (styles.bodyTextStyle === undefined) {
        styles.bodyTextStyle = 'font-family: Arial, sans-serif; font-size: 1.125rem; line-height: 1.3;';
      }
      if (styles.strongTextStyle === undefined) {
        styles.strongTextStyle = 'color: #b1232b; font-weight: 800;';
      }
      if (styles.asideContainerStyle === undefined) {
        styles.asideContainerStyle = '';
      }
      if (styles.sidebarButtonStyle === undefined) {
        styles.sidebarButtonStyle = 'background-color: #000000; color: #e6bb61; border: 1px solid rgba(255,255,255,0.7);';
      }
      if (styles.sidebarActiveButtonStyle === undefined) {
        styles.sidebarActiveButtonStyle = 'background-color: #070707; color: #e6bb61; border: 1px solid rgba(255,255,255,0.7);';
      }
      if (styles.footerTipStyle === undefined) {
        styles.footerTipStyle = 'color: #141414; font-size: 0.875rem;';
      }
    } else {
      if (config.pageId === 'orgChart') {
        setActiveStyleTab('orgChart');
        setActiveTextTab('demoOrgChart');
      } else if (config.pageId === 'startingScreen') {
        setActiveStyleTab('overlayStyle');
        setActiveTextTab('overlayText');
      } else if (config.pageId === 'orgnetworks' || config.pageId === 'gameorgnetwork') {
        setActiveStyleTab('networkSelector');
        setActiveTextTab('generalNetworkTexts');
      } else if (config.pageId === 'yourstrategy' || config.pageId === 'gamestrategy') {
        setActiveStyleTab('strategyStyles');
        setActiveTextTab('strategyTexts');
      } else if (config.pageId === 'simulationHeader') {
        setActiveStyleTab('headerStyles');
        setActiveTextTab('headerTextTab');
      } else if (config.pageId === 'globalCss') {
        setActiveStyleTab('globalCss');
        setActiveTextTab('globalCss');
      } else {
        setActiveStyleTab('simulation');
        if (config.pageId === 'playDemo') {
          setActiveTextTab('demoSimulation');
        } else {
          setActiveTextTab('simulation');
        }
      }
      
      if (config.pageId === 'startingScreen') {
        if (styles.topLeftButtonStyle === undefined) styles.topLeftButtonStyle = 'background-color: #000000; color: #efb860;';
        if (styles.heroBlueBoxStyle === undefined) styles.heroBlueBoxStyle = 'background-color: #7A9CC4; color: #000000;';
        if (styles.heroTitleStyle === undefined) styles.heroTitleStyle = 'font-size: 1.875rem; font-weight: 500; color: #000000;';
        if (styles.heroSubTitleStyle === undefined) styles.heroSubTitleStyle = 'color: #ffffff; font-size: 1.5rem;';
        if (styles.heroButtonStyle === undefined) styles.heroButtonStyle = 'background-color: #7A9CC4;';
        if (styles.heroButtonTextStyle === undefined) styles.heroButtonTextStyle = 'color: #000000; font-size: 1rem;';
        if (styles.heroButtonBoldStyle === undefined) styles.heroButtonBoldStyle = 'color: #ffffff; font-weight: 600;';
        if (styles.bottomNavButtonStyle === undefined) styles.bottomNavButtonStyle = 'background-color: #000000; color: #e6bb61;';
        if (styles.bottomQuitButtonStyle === undefined) styles.bottomQuitButtonStyle = 'background-color: #1a0505; color: #e6bb61;';
        if (styles.popupStyle === undefined) styles.popupStyle = 'background-color: #9FB4CC; color: #000000;';
      }
      
      if (config.pageId === 'playDemo' || config.pageId === 'orgChart') {
        if (styles.orgChartPageStyle === undefined) {
          styles.orgChartPageStyle = 'background-color: #f4f4f2;';
        }
        if (styles.orgChartHeaderStyle === undefined) {
          styles.orgChartHeaderStyle = 'color: #1f2937;';
        }
        if (styles.orgChartOuterBoxStyle === undefined) {
          styles.orgChartOuterBoxStyle = 'background-color: #efefef; border: 1px solid #d1d5db;';
        }
        if (styles.orgChartInnerBgStyle === undefined) {
          styles.orgChartInnerBgStyle = 'background-color: #f7f7f7; border: 1px solid #d1d5db;';
        }
        if (styles.orgChartDepartmentBoxStyle === undefined) {
          styles.orgChartDepartmentBoxStyle = 'background-color: #ffffff; border: 1px solid #d1d5db;';
        }
      }
      
      if (config.pageId === 'playDemo') {
        if (styles.managerPanelStyle === undefined) {
          styles.managerPanelStyle = 'background-color: #ffffff;';
        }
        if (styles.managerRowStyle === undefined) {
          styles.managerRowStyle = 'border-bottom: 1px solid #f3f4f6;';
        }
        if (styles.managerNameStyle === undefined) {
          styles.managerNameStyle = 'font-family: inherit;';
        }
        if (styles.managerStatusAwareStyle === undefined) {
          styles.managerStatusAwareStyle = 'background-color: #D5DAF0; color: #3155D8;';
        }
        if (styles.managerStatusInterestStyle === undefined) {
          styles.managerStatusInterestStyle = 'background-color: #9CA8DB; color: #ffffff;';
        }
        if (styles.managerStatusExperimentStyle === undefined) {
          styles.managerStatusExperimentStyle = 'background-color: #3559CB; color: #ffffff;';
        }
        if (styles.managerStatusAdoptStyle === undefined) {
          styles.managerStatusAdoptStyle = 'background-color: #C52331; color: #ffffff;';
        }
        if (styles.managerBgAwareStyle === undefined) {
          styles.managerBgAwareStyle = 'background-color: #D5DAF0;';
        }
        if (styles.managerBgInterestStyle === undefined) {
          styles.managerBgInterestStyle = 'background-color: #9CA8DB;';
        }
        if (styles.managerBgExperimentStyle === undefined) {
          styles.managerBgExperimentStyle = 'background-color: #3559CB;';
        }
        if (styles.managerBgAdoptStyle === undefined) {
          styles.managerBgAdoptStyle = 'background-color: #C52331;';
        }
        if (styles.managerProgressBarStyle === undefined) {
          styles.managerProgressBarStyle = 'background-color: #F8F8FB; border: 2px solid #1F4FFF;';
        }
        if (styles.managerProgressDividerStyle === undefined) {
          styles.managerProgressDividerStyle = 'background-color: #F4F6FF;';
        }
        if (styles.managerProgressFillStyle === undefined) {
          styles.managerProgressFillStyle = 'background-color: #C52331;';
        }
      }

      if (config.pageId === 'simulationHeader') {
        if (styles.headerStyle === undefined) {
          styles.headerStyle = 'background-color: #000000; border-bottom: 2px solid #efb860;';
        }
        if (styles.imageStripStyle === undefined) {
          styles.imageStripStyle = 'opacity: 0.7; filter: grayscale(100%);';
        }
      }

      if (config.pageId === 'yourstrategy' || config.pageId === 'gamestrategy') {
        if (styles.pageStyle === undefined) styles.pageStyle = 'background-color: #d9d9d9;';
        if (styles.headerPrefixStyle === undefined) styles.headerPrefixStyle = 'color: #1a1a1a;';
        if (styles.headerBoldStyle === undefined) styles.headerBoldStyle = 'font-weight: bold;';
        if (styles.headerSuffixStyle === undefined) styles.headerSuffixStyle = 'color: #2e2e2e; font-style: italic;';
        if (styles.editorBoxStyle === undefined) styles.editorBoxStyle = 'border: 1px solid #bcbcbc; background-color: #ececec;';
        if (styles.editorTextStyle === undefined) styles.editorTextStyle = 'color: #222;';
        if (styles.teamLabelStyle === undefined) styles.teamLabelStyle = 'color: #1f1f1f;';
        if (styles.revisionNoteStyle === undefined) styles.revisionNoteStyle = 'color: #222;';
      }
    }
    setFormData({ pageName: config.pageName, content: { ...config.content }, styles, assets: { ...config.assets } });
  };

  const handleFieldChange = useCallback((category, key, value) => {
    setFormData(prev => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
  }, []);

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(key);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await controller.auth.uploadImage(data);
      if (res.data?.success) { handleFieldChange('assets', key, res.data.url); showToast("success", "Image uploaded!"); }
    } catch { showToast("error", "Upload failed"); }
    finally { setUploading(null); }
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const res = await controller.pageConfig.updatePageConfig(selectedPage.pageId, formData);
      if (res.data?.success) { showToast("success", "Saved!"); fetchConfigs(); }
    } catch { showToast("error", "Save failed"); }
    finally { setSaving(false); }
  };

  const formatKeyName = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  const isInitiativesPage = selectedPage?.pageId === 'initiatives';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f6f4ef]">
      <Loader2 className="w-10 h-10 animate-spin text-[#d4a017]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#111] overflow-x-hidden">
      <SimulationHeader
        leftContent={
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              id="shared-btn-boost-ai-simulation"
              onClick={() => router.push('/')}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            >
              <span className="sm:hidden">Expert Editor</span>
              <span className="hidden sm:inline">EXPERT EDITOR</span>
            </GameButton>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="editor-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* REFRESH */}
                <div style={{ gridColumnStart: 3 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-refresh"
                    onClick={fetchConfigs}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full flex items-center justify-center"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" /> REFRESH
                  </GameButton>
                </div>
                {/* BACK TO DASHBOARD */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-back-to-dashboard"
                    label="BACK TO ADMIN"
                    onClick={() => router.push("/")}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      />

      <main className="mx-auto max-w-8xl px-4 pb-8 pt-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                  <Database className="w-4 h-4" /> Select Page
                </h2>
              </div>
              <div className="divide-y divide-black/5">
                {configs
                  .filter((config) => config.pageId !== 'globalCss')
                  .map((config) => (
                    <button key={config.pageId} onClick={() => handlePageSelect(config)}
                    className={`w-full text-left px-4 py-4 transition-all duration-200 flex flex-col gap-1 ${selectedPage?.pageId === config.pageId ? 'bg-[#efd191] text-black border-l-4 border-[#1b1b1b]' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-bold text-[13px] uppercase tracking-wide">
                      {config.pageId === 'playDemo' ? 'Play Demo / Game Page' : config.pageName}
                    </span>
                    <span className={`text-[10px] font-medium ${selectedPage?.pageId === config.pageId ? 'text-black/60' : 'text-gray-400'}`}>
                      ID: {config.pageId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Editor */}
          <section className="lg:col-span-9 space-y-6">
            {selectedPage ? (
              <>
                {/* Toolbar */}
                <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-black/10 shadow-[0_2px_0_rgba(0,0,0,0.04)]">
                  <span className="rounded-sm bg-[#efd191] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black">
                    Editing: {selectedPage.pageId === 'playDemo' ? 'Play Demo / Game Page' : selectedPage.pageName}
                  </span>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[#1b1b1b] text-[#efb860] px-6 py-2.5 rounded-sm font-bold uppercase tracking-[0.1em] text-xs hover:bg-black transition-all disabled:opacity-50 shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Changes
                  </button>
                </div>

                 {/* GLOBAL CSS PAGE — special UI */}
                 {selectedPage?.pageId === 'globalCss' ? (
                   <>
                     {/* 
                     <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
                     <div className="flex items-center gap-2 border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                       <Palette className="w-4 h-4" />
                       <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Global CSS Stylesheet</span>
                     </div>
                     <div className="p-6 space-y-4">
                       <p className="text-xs text-gray-500 font-medium">
                         Write standard raw CSS code below to apply custom styles across the entire application.
                         Target elements by copying their unique ID (e.g. <code>#about-detail-line1</code>) or class name.
                       </p>
                       <textarea
                         value={formData.styles?.cssText || ''}
                         onChange={(e) => handleFieldChange('styles', 'cssText', e.target.value)}
                         className="w-full h-[500px] p-4 bg-gray-900 text-green-400 font-mono text-sm border border-black/20 rounded focus:border-blue-500 outline-none resize-y"
                         placeholder="// Custom CSS here &#10;#about-detail-line1 {&#10;  color: #ff0000 !important;&#10;}"
                         spellCheck={false}
                       />
                     </div>
                     */}
                     <div className="p-10 text-center text-gray-500">CSS editing is temporarily disabled.</div>
                   </>
                 ) : isInitiativesPage ? (
                  <>
                    {/* Style Engine for initiatives */}
                    {/* 
                    <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                        <Palette className="w-4 h-4" />
                        <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Visual Style Engine</span>
                      </div>
                      <div className="p-6 space-y-8">
                        {Object.entries(formData.styles).map(([key, value]) => (
                          <div key={key} className="space-y-3">
                            <label className="text-[11px] font-black text-[#888] uppercase tracking-[0.15em] block">{formatKeyName(key)}</label>
                            <CssLineEditor styleKey={key} cssString={value} onChange={handleFieldChange} />
                          </div>
                        ))}
                      </div>
                    </div>
                    */}
                    <div className="p-10 text-center text-gray-500">CSS editing is temporarily disabled.</div>
                  </>
                ) : (
                  <>
                    {/* CSS ENGINE */}
                    {/*
                    <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                        <Palette className="w-4 h-4" />
                        <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Visual Style Engine</span>
                      </div>

                      {selectedPage?.pageId === 'playDemo' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('simulation')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeStyleTab === 'simulation'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💻 Simulation Styles
                          </button>
                          <button
                            onClick={() => setActiveStyleTab('managerList')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'managerList'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            👥 Manager List Styles
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'mission' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('missionContent')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeStyleTab === 'missionContent'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            📄 Content Styles
                          </button>
                          <button
                            onClick={() => setActiveStyleTab('missionSidebar')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'missionSidebar'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            🗂️ Sidebar Styles
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'startingScreen' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('overlayStyle')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeStyleTab === 'overlayStyle'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💡 Hero Overlay Styles
                          </button>
                          <button
                            onClick={() => setActiveStyleTab('popupStyle')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'popupStyle'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💬 Popups & Nav Styles
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'simulationHeader' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('headerStyles')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'headerStyles'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💻 Header & Navbar Styles
                          </button>
                        </div>
                      )}

                      {['yourstrategy', 'gamestrategy'].includes(selectedPage?.pageId) && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('strategyStyles')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'strategyStyles'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            📈 Strategy Page Styles
                          </button>
                        </div>
                      )}

                      {['orgnetworks', 'gameorgnetwork'].includes(selectedPage?.pageId) && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveStyleTab('networkSelector')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeStyleTab === 'networkSelector'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            🗂️ Selector & Header Styles
                          </button>
                          <button
                            onClick={() => setActiveStyleTab('networkDetails')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeStyleTab === 'networkDetails'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            📄 Detail Panel Styles
                          </button>
                        </div>
                      )}

                      <div className="p-6 space-y-8">
                        {Object.entries(formData.styles)
                          .filter(([key]) => {
                             if (selectedPage?.pageId === 'playDemo') {
                               if (key.startsWith('orgChart')) return false;
                               if (activeStyleTab === 'managerList') return key.startsWith('manager');
                               return !key.startsWith('manager');
                             }
                             if (selectedPage?.pageId === 'orgChart') {
                               return key.startsWith('orgChart');
                             }
                             if (selectedPage?.pageId === 'startingScreen') {
                               if (activeStyleTab === 'overlayStyle') {
                                 return ['heroBlueBoxStyle', 'heroTitleStyle', 'heroSubTitleStyle', 'heroButtonStyle', 'heroButtonTextStyle', 'heroButtonBoldStyle', 'topLeftButtonStyle'].includes(key);
                               }
                               return ['popupStyle', 'bottomNavButtonStyle', 'bottomQuitButtonStyle'].includes(key);
                             }
                             if (selectedPage?.pageId === 'mission') {
                              if (activeStyleTab === 'missionSidebar') {
                                return ['asideContainerStyle', 'sidebarButtonStyle', 'sidebarActiveButtonStyle'].includes(key);
                              }
                              return ['pageStyle', 'contentBoxStyle', 'headingStyle', 'bodyTextStyle', 'strongTextStyle', 'footerTipStyle'].includes(key);
                            }
                            if (['orgnetworks', 'gameorgnetwork'].includes(selectedPage?.pageId)) {
                              if (activeStyleTab === 'networkSelector') {
                                return ['pageHeaderStyle', 'networkSelectorBgStyle', 'networkLabelStyle', 'activeNetworkColorStyle'].includes(key);
                              }
                              return ['lockedOverlayStyle', 'coffeeTitleStyle', 'coffeeDescriptionStyle', 'externalTitleStyle', 'externalDescriptionStyle', 'teamsTitleStyle', 'teamsDescriptionStyle'].includes(key);
                            }
                            if (selectedPage?.pageId === 'simulationHeader') {
                              return ['headerStyle', 'imageStripStyle', 'headerButtonStyle', 'headerButtonHoverStyle'].includes(key);
                            }
                            if (['yourstrategy', 'gamestrategy'].includes(selectedPage?.pageId)) {
                              return ['pageStyle', 'headerPrefixStyle', 'headerBoldStyle', 'headerSuffixStyle', 'editorBoxStyle', 'editorTextStyle', 'teamLabelStyle', 'revisionNoteStyle'].includes(key);
                            }
                            return true;
                          })
                          .map(([key, value]) => (
                            <div key={key} className="space-y-3">
                              <label className="text-[11px] font-black text-[#888] uppercase tracking-[0.15em] block">{formatKeyName(key)}</label>
                              <CssLineEditor styleKey={key} cssString={value} onChange={handleFieldChange} />
                            </div>
                          ))}
                      </div>
                    </div>
                    */}

                    {/* TEXT CONTENT */}
                    <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                        <Type className="w-4 h-4" />
                        <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Text Content</span>
                      </div>

                      {selectedPage?.pageId === 'playDemo' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveTextTab('demoSimulation')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeTextTab === 'demoSimulation'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💻 Demo Simulation Texts
                          </button>
                          <button
                            onClick={() => setActiveTextTab('gameSimulation')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeTextTab === 'gameSimulation'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            🎮 Game Simulation Texts
                          </button>
                          <button
                            onClick={() => setActiveTextTab('managerList')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeTextTab === 'managerList'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            👥 Manager List Texts
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'orgChart' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveTextTab('demoOrgChart')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeTextTab === 'demoOrgChart'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💻 Demo Org Chart Texts
                          </button>
                          <button
                            onClick={() => setActiveTextTab('gameOrgChart')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeTextTab === 'gameOrgChart'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            🎮 Game Org Chart Texts
                          </button>
                          <button
                            onClick={() => setActiveTextTab('statusLabels')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeTextTab === 'statusLabels'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            👥 Status Labels
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'mission' && (
                        <div className="flex flex-wrap border-b border-black/10 bg-gray-50">
                          {[
                            { id: 'context', label: '📜 Context' },
                            { id: 'project', label: '🔬 Project' },
                            { id: 'challenge', label: '🎯 Challenge' },
                            { id: 'approach', label: '💡 Approach' },
                            { id: 'tips', label: 'ℹ️ Tips' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setActiveTextTab(t.id)}
                              className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                                activeTextTab === t.id
                                  ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                  : 'text-gray-500 hover:text-black hover:bg-gray-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedPage?.pageId === 'startingScreen' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveTextTab('overlayText')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                              activeTextTab === 'overlayText'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💡 Hero Overlay Texts
                          </button>
                          <button
                            onClick={() => setActiveTextTab('popupText')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeTextTab === 'popupText'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            💬 Popups & Nav Texts
                          </button>
                        </div>
                      )}

                      {['yourstrategy', 'gamestrategy'].includes(selectedPage?.pageId) && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveTextTab('strategyTexts')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeTextTab === 'strategyTexts'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            ✍️ Strategy Texts
                          </button>
                        </div>
                      )}

                      {selectedPage?.pageId === 'simulationHeader' && (
                        <div className="flex border-b border-black/10 bg-gray-50">
                          <button
                            onClick={() => setActiveTextTab('headerTextTab')}
                            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                              activeTextTab === 'headerTextTab'
                                ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                            }`}
                          >
                            ✍️ Header Text
                          </button>
                        </div>
                      )}

                      {['orgnetworks', 'gameorgnetwork'].includes(selectedPage?.pageId) && (
                        <div className="flex flex-wrap border-b border-black/10 bg-gray-50">
                          {[
                            { id: 'generalNetworkTexts', label: '⚙️ General' },
                            { id: 'coffeeNetworkTexts', label: '☕ Coffee Groups' },
                            { id: 'externalNetworkTexts', label: '🔗 External Links' },
                            { id: 'teamsNetworkTexts', label: '👥 Teams / Taskforces' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setActiveTextTab(t.id)}
                              className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold uppercase tracking-[0.1em] border-r border-black/5 transition-all ${
                                activeTextTab === t.id
                                  ? 'bg-white text-black border-b-2 border-b-[#efb860]'
                                  : 'text-gray-500 hover:text-black hover:bg-gray-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="p-6 space-y-6">
                        {Object.entries(formData.content)
                          .filter(([key]) => {
                            if (selectedPage?.pageId === 'playDemo') {
                              if (key.startsWith('orgChart') || key.startsWith('status') || key.startsWith('demoOrgChart') || key.startsWith('gameOrgChart')) return false;
                              if (activeTextTab === 'demoSimulation') return key.startsWith('demo') && !key.includes('OrgChart');
                              if (activeTextTab === 'gameSimulation') return key.startsWith('game') && !key.includes('OrgChart');
                              if (activeTextTab === 'managerList') return key.startsWith('manager');
                              return false;
                            }
                            if (selectedPage?.pageId === 'orgChart') {
                              if (activeTextTab === 'demoOrgChart') return key.startsWith('demoOrgChart');
                              if (activeTextTab === 'gameOrgChart') return key.startsWith('gameOrgChart');
                              if (activeTextTab === 'statusLabels') return key.startsWith('status');
                              return false;
                            }
                            if (selectedPage?.pageId === 'startingScreen') {
                              if (activeTextTab === 'overlayText') {
                                return ['topLeftButtonText', 'heroBoxTitleText', 'heroBoxSubtitle1Text', 'heroBoxSubtitle2Text', 'heroBtn1Label', 'heroBtn1Bold', 'heroBtn2Label', 'heroBtn2Bold', 'heroBtn3Label', 'heroBtn3Bold'].includes(key);
                              }
                              return ['navBtnDemoText', 'navBtnTestText', 'navBtnQuitText', 'sessionPopupTitle', 'sessionPopupTeamLabel', 'sessionPopupPassLabel', 'sessionPopupStartBtn', 'sessionPopupCancelBtn', 'quitPopupText', 'resumePopupTitle', 'resumePopupBody'].includes(key);
                            }
                            if (selectedPage?.pageId === 'mission') {
                              if (activeTextTab === 'context') return key.startsWith('context');
                              if (activeTextTab === 'project') return key.startsWith('project');
                              if (activeTextTab === 'challenge') return key.startsWith('challenge');
                              if (activeTextTab === 'approach') return key.startsWith('approach');
                              if (activeTextTab === 'tips') return key.startsWith('generalReadAloud');
                              return false;
                            }
                            if (['orgnetworks', 'gameorgnetwork'].includes(selectedPage?.pageId)) {
                              if (activeTextTab === 'generalNetworkTexts') {
                                return ['headerText', 'network1Label', 'network2Label', 'network3Label', 'lockedOverlayDescription', 'sidebarFooterText'].includes(key);
                              }
                              if (activeTextTab === 'coffeeNetworkTexts') {
                                return ['coffeeGroupsTitle', 'coffeeGroupsDescription'].includes(key);
                              }
                              if (activeTextTab === 'externalNetworkTexts') {
                                return ['externalLinksTitle', 'externalLinksDescription'].includes(key);
                              }
                              if (activeTextTab === 'teamsNetworkTexts') {
                                return ['teamsTaskforcesTitle', 'teamsTaskforcesDescription'].includes(key);
                              }
                              return false;
                            }
                            if (selectedPage?.pageId === 'simulationHeader') {
                              return true;
                            }
                            if (['yourstrategy', 'gamestrategy'].includes(selectedPage?.pageId)) {
                              return ['strategyHeaderPrefix', 'strategyHeaderBold', 'strategyHeaderSuffix', 'teamLabelPrefix', 'teamLabelBold', 'revisionNoteText'].includes(key);
                            }
                            return true;
                          })
                          .map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <label className="text-[11px] font-black text-[#888] uppercase tracking-[0.15em] block">{formatKeyName(key)}</label>
                              <textarea value={value} onChange={(e) => handleFieldChange('content', key, e.target.value)}
                                className="w-full p-4 bg-[#faf8f4] border border-black/10 rounded-sm focus:bg-white focus:border-blue-500 outline-none min-h-[100px] text-[13px]" />
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* ASSETS */}
                    {/* Object.keys(formData.assets).length > 0 && (
                      <div className="rounded-sm border border-black/10 bg-white shadow-[0_2px_0_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-black/10 bg-[#1b1b1b] px-4 py-3 text-[#efb860]">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Images & Assets</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {Object.entries(formData.assets).map(([key, value]) => (
                            <div key={key} className="space-y-3 p-4 bg-[#faf8f4] rounded-sm border border-black/5">
                              <label className="text-[11px] font-black text-[#888] uppercase tracking-[0.15em] block">{formatKeyName(key)}</label>
                              <div className="flex flex-col gap-3">
                                <div className="relative group overflow-hidden bg-white border border-black/10 rounded-sm h-48 flex items-center justify-center">
                                  {value ? (
                                    <img src={value} alt={key} className="max-h-full max-w-full object-contain p-2"
                                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Invalid+Path'; }} />
                                  ) : (
                                    <div className="text-gray-300 flex flex-col items-center">
                                      <ImageIcon className="w-12 h-12 mb-2" />
                                      <span className="text-[10px] font-bold uppercase">No Image</span>
                                    </div>
                                  )}
                                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    {uploading === key ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : (
                                      <><Upload className="w-8 h-8 text-white mb-2" /><span className="text-white text-[10px] font-bold uppercase">Change Image</span></>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, key)} />
                                  </label>
                                </div>
                                <input type="text" value={value} onChange={(e) => handleFieldChange('assets', key, e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-sm focus:border-blue-500 outline-none font-mono text-[10px]" placeholder="Image URL" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) */}
                  </>
                )}
              </>
            ) : (
              <div className="bg-white p-20 text-center rounded-sm border border-black/10 shadow-[0_2px_0_rgba(0,0,0,0.04)]">
                <Database className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Select a page to start customizing</h3>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PageEditor;
