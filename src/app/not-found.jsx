"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-black/10 rounded-sm p-8 max-w-md w-full text-center shadow-md flex flex-col items-center">
        
        {/* WARNING/NOT-FOUND ICON */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-200">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* TITLE */}
        <h2 className="text-[18px] font-bold text-black uppercase tracking-wider mb-3">
          Page Not Found
        </h2>

        {/* DESCRIPTION */}
        <p className="text-[13px] text-neutral-600 leading-[1.6] mb-8">
          The requested page does not exist or you do not have permission to view it. 
          Please click below to go to the dashboard.
        </p>

        {/* ACTION BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-black text-[#efb860] hover:text-yellow-400 font-bold font-mono text-[13px] py-3.5 uppercase tracking-widest transition-colors shadow-sm rounded-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
