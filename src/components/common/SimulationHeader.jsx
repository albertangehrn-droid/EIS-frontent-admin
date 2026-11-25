"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import IMAGES from "@/utils/imagePaths";
import SoundControlHeader from "./SoundControlHeader";
import axiosInstance from "@/utils/axiosInstance";

export default function SimulationHeader({
  imageStripSources = [
    IMAGES.ALL.ROLL[1],
    IMAGES.ALL.ROLL[2],
    IMAGES.ALL.ROLL[3],
    IMAGES.ALL.ROLL[4],
    IMAGES.ALL.ROLL[5],
    IMAGES.ALL.ROLL[6],
    IMAGES.ALL.ROLL[7],
    IMAGES.ALL.ROLL[8],
    IMAGES.ALL.ROLL[9],
    IMAGES.ALL.ROLL[10],
    IMAGES.ALL.ROLL[11],
  ],
  imageStripTileCount = 28,
  className = "",
  leftContent,
  leftButton,
  leftSubtext,
  centerContent,
  rightContent,
}) {
  const [pageConfig, setPageConfig] = useState(null);

  useEffect(() => {
    /* Commented out per user request */
  }, []);

  const getStyle = (key, defaultStyle = '') => {
    const styleString = pageConfig?.styles?.[key] ?? defaultStyle;
    const styleObj = {};
    if (!styleString) return styleObj;
    styleString.split(';').forEach((rule) => {
      const parts = rule.split(':');
      if (parts.length >= 2) {
        const prop = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        if (prop && val) {
          const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          styleObj[camelProp] = val;
        }
      }
    });
    return styleObj;
  };

  // Determine strip sources dynamically
  let activeStripSources = imageStripSources;
  if (pageConfig?.assets) {
    const backendSources = [];
    for (let i = 1; i <= 11; i++) {
      const assetVal = pageConfig.assets[`imageStripSource${i}`];
      if (assetVal) {
        backendSources.push(assetVal);
      }
    }
    if (backendSources.length > 0) {
      activeStripSources = backendSources;
    }
  }

  const stripSources = Array.from({ length: imageStripTileCount }, (_, index) => {
    return activeStripSources[index % activeStripSources.length];
  });

  const parsedHeaderStyle = getStyle('headerStyle');
  const imageStripStyle = getStyle('imageStripStyle');

  const formatCssWithImportant = (cssStr) => {
    if (!cssStr) return '';
    return cssStr.split(';').map(rule => {
      const trimmed = rule.trim();
      if (!trimmed) return '';
      if (trimmed.includes('!important')) return trimmed + ';';
      return trimmed + ' !important;';
    }).join(' ');
  };

  const headerButtonStyleStr = formatCssWithImportant(pageConfig?.styles?.headerButtonStyle);
  const headerButtonHoverStyleStr = formatCssWithImportant(pageConfig?.styles?.headerButtonHoverStyle);

  return (
    <header
      id="shared-header-root"
      className={`relative z-20 w-full h-[95px] md:h-[100px] ${className}`}
      style={{ ...parsedHeaderStyle, border: 'none', borderBottom: 'none' }}
    >
      {/* Button styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          #shared-header-root {
            border: none !important;
            border-bottom: none !important;
            box-shadow: none !important;
          }
          header button, header a {
            ${headerButtonStyleStr}
          }
          header button *, header a * {
            color: inherit !important;
          }
        `
      }} />
      {headerButtonHoverStyleStr && (
        <style dangerouslySetInnerHTML={{
          __html: `
            header button:hover, header a:hover {
              ${headerButtonHoverStyleStr}
            }
            header button:hover *, header a:hover * {
              color: inherit !important;
            }
          `
        }} />
      )}

      {/* Background image strip */}
      <div id="shared-header-strip-container" className="absolute inset-0 flex bg-[#7e848d] overflow-hidden">
        {stripSources.map((src, index) => (
          <div key={index} className="relative h-full w-[180px] shrink-0">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              style={{
                ...imageStripStyle,
                opacity: 0.32,
                filter: 'grayscale(100%) brightness(1.1) contrast(0.6)',
              }}
            />
          </div>
        ))}
        <div id="shared-header-overlay" className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content row — stable wrappers, no remounting, no blink */}
      <div
        id="shared-header-content-wrapper"
        className="relative z-10 flex h-full items-start justify-between gap-2 sm:gap-3 px-2 sm:px-4 lg:px-6 pt-3.5 md:pt-[18px]"
      >
        {/* LEFT — always rendered so layout stays stable */}
        <div id="shared-header-left-content" className="shrink-0 flex flex-col items-start mt-0">
          {leftButton ? (
            <>
              <div className="flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-3">
                {leftButton}
                <SoundControlHeader />
              </div>
              {leftSubtext && (
                <div className="pl-1 mt-0.5 leading-none">
                  {leftSubtext}
                </div>
              )}
            </>
          ) : leftContent ? (
            <div className="shrink-0 flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-3">
              {leftContent}
              <SoundControlHeader />
            </div>
          ) : (
            <SoundControlHeader />
          )}
        </div>

        {/* CENTER */}
        {centerContent && (
          <div id="shared-header-center-content" className="flex-1 flex justify-center items-center text-center">
            {centerContent}
          </div>
        )}

        {/* RIGHT — always rendered so layout stays stable */}
        <div
          id="shared-header-right-content"
          className={`${centerContent ? 'shrink-0' : 'flex-1'} flex justify-end items-start h-full`}
        >
          {rightContent}
        </div>
      </div>
    </header>
  );
}
