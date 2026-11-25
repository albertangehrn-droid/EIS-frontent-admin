import React, { useRef, useEffect } from "react";
import { useSoundContext } from '@/contexts/SoundContext';

const GameButton = ({ 
  label, 
  children,
  onClick, 
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  sound = true,
  type = "button",
  style = {},
  id = ""
}) => {
  const { playClickSound } = useSoundContext();

  const handleClick = (e) => {
    if (sound) {
      playClickSound();
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Responsive Variant styles
  // ✅ Responsive Variant styles
  const variantStyles = {
    default: `
      bg-black text-yellow-400 border border-gray-600 hover:bg-gray-800
      font-semibold min-h-[40px] sm:min-h-[44px]
      w-full sm:w-auto sm:min-w-[170px]
    `,
    nav: `
      bg-black text-yellow-500 border border-gray-700 hover:bg-gray-800
      tracking-wide font-bold min-h-[36px] sm:min-h-[42px]
      w-full sm:w-auto sm:min-w-[150px]
    `,
    action: `
      bg-blue-600 text-white border border-blue-700 hover:bg-blue-700
      shadow-md hover:shadow-lg font-bold
      w-full sm:w-auto
    `,
    small: `
      bg-black text-yellow-500 border border-gray-700 hover:bg-gray-800
      font-bold min-h-[32px] sm:min-h-[34px]
      w-full sm:w-auto
    `,
    compact: `
      bg-black text-yellow-400 border border-gray-600 hover:bg-gray-800
      font-semibold min-h-[18px] sm:min-h-[44px]
      w-full sm:w-auto sm:min-w-[280px]
    `,
    footer: `
      bg-transparent text-yellow-500 hover:text-yellow-400
      border-none font-bold uppercase tracking-wider
      w-full sm:w-auto
    `,
  };

  // ✅ Responsive Sizes
  const sizeStyles = {
    sm: "px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs",
    md: "px-3 sm:px-5 py-1.5 sm:py-2 text-[22px] sm:text-[13px]",
    lg: "px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-[22px] font-bold sm:font-black",
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      disabled={disabled}
      style={style}
      className={`
        flex items-center justify-center
        text-center
        transition-all duration-300
        whitespace-nowrap sm:whitespace-normal
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children || label}
    </button>
  );
};

export default GameButton;