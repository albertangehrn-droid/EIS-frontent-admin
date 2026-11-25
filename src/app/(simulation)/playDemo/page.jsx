"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDevice } from '@/hooks/useDevice';
import { useSoundContext } from '@/contexts/SoundContext';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
import DesktopGameViewPlayDemo from '@/components/playdemo/DesktopGameViewPlayDemo';
import axiosInstance from '@/utils/axiosInstance';

// Default config fallbacks
const DEFAULT_CONFIG = {
  content: {
    headerVersionText: 'Sim Version 2.2, 2026',
    demoBadgeText: 'DEMO',
    introText: 'In this GAME SESSION you will be',
    subText: 'taking over as a Change Agent at',
    subText2: 'FrontMedia, where you will first of all',
    subText3: 'review the MISSION (please do it',
    subText4: 'before starting).',
    middleText: 'To succeed in your role, you will need to ...',
    achievement1: '... develop a STRATEGY to address the challenging project at FrontMedia',
    achievement2: '... manage your available TIME wisely',
    achievement3: '... collect information and insights about the managers of FrontMedia',
    achievement4: '... succeed in changing the attitude of the managers towards the proposed change.',
    conclusion: 'By launching appropriate INITIATIVES, you can make a real difference at FrontMedia.',
    scoreNote: 'Your SCORE and ACTIVITY LOG will help you track your progress and understand the impact of your decisions.',
    dismissText: 'Click HERE to never display this message again',
    quitConfirmText: 'Are you sure you want to quit? This will end your demo session.',
    quitBackText: 'Are you sure you want to leave? This will end your demo session.',
  },
  styles: {
    pageStyle: 'background-color: #ffffff; color: #111;',
    headerStyle: 'background-color: #000000; color: #d4a017;',
    demoBadgeStyle: 'background-color: #d4a017; color: #000000; font-weight: bold;',
    sessionPanelStyle: 'background-color: #ececec; color: #111111;',
    introTextStyle: 'font-size: 1rem; color: #c62828; line-height: 1.4;',
    bodyTextStyle: 'font-size: 0.875rem; color: #222222;',
    footerStyle: 'background-color: #111111; color: #d4a017;',
    quitPopupStyle: 'background-color: #9FB4CC; color: #000000;',
  },
  assets: {
    kenImage: '/Images/KEN.jpg',
    headerBgImage: '/Images/Agray.jpg',
  },
};

export default function PlayDemoPage() {
  const device = useDevice();
  const router = useRouter();
  const pathname = usePathname();
  const { playClickSound } = useSoundContext();
  const { quitDemo } = usePlayDemoGame();
  const [showQuitPopup, setShowQuitPopup] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [pageConfig, setPageConfig] = useState(DEFAULT_CONFIG);

  // Fetch page config from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axiosInstance.get('/page-config/playDemo');
        if (res.data?.success && res.data.data) {
          const cfg = res.data.data;
          setPageConfig({
            content: { ...DEFAULT_CONFIG.content, ...cfg.content },
            styles: { ...DEFAULT_CONFIG.styles, ...cfg.styles },
            assets: { ...DEFAULT_CONFIG.assets, ...cfg.assets },
          });
        }
      } catch (error) {
        console.error('Failed to fetch playDemo config, using defaults:', error);
      }
    };
    fetchConfig();
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Only show quit popup if we're on the playDemo page
      if (pathname === '/playDemo') {
        setIsNavigatingBack(true);
        setShowQuitPopup(true);

        // Push the current state back to prevent actual navigation
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state to prevent back navigation
    window.history.pushState(null, null, window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  const handleQuitConfirm = () => {
    setShowQuitPopup(false);
    setIsNavigatingBack(false);

    // Reset speech flag so speech plays again when user returns to demo
    localStorage.setItem('demoSpeechPlayed', 'false');

    // Call quitDemo to cleanup session
    quitDemo();

    // Navigate to / page
    router.push('/');
  };

  const handleQuitCancel = () => {
    setShowQuitPopup(false);
    setIsNavigatingBack(false);

    // Note: Don't push history state here to prevent unnecessary rerenders
  };

  // Render the unified view for all devices (handles its own responsiveness)
  const GameViewComponent = DesktopGameViewPlayDemo;

  return (
    <>
      <GameViewComponent />

      {/* Quit Popup */}
      {showQuitPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[500px] rounded-md overflow-hidden shadow-lg">
            <div className="bg-white h-[40px]"></div>
            <div className="py-6 px-8 text-center" style={{ backgroundColor: pageConfig.styles.quitPopupStyle?.match(/background-color:\s*([^;]+)/)?.[1] || '#9FB4CC' }}>
              <p className="text-lg text-black mb-6">
                {isNavigatingBack
                  ? 'Are you sure you want to leave? This will end your demo session.'
                  : 'Are you sure you want to quit? This will end your demo session.'
                }
              </p>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => { playClickSound(); handleQuitConfirm(); }}
                  className="px-10 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => { playClickSound(); handleQuitCancel(); }}
                  className="px-10 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}