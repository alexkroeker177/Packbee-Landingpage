"use client";

import React from "react";

export const ScanVerifyVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* CSS Barcode — rotated, top-right */}
      <div className="absolute top-6 right-4 rotate-[8deg] flex gap-[2px] items-end opacity-90">
        {[4, 2, 3, 1, 4, 2, 1, 3, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 3, 1, 2, 4, 1, 3].map(
          (w, i) => (
            <div
              key={i}
              className="bg-white/90 rounded-[0.5px]"
              style={{ width: `${w}px`, height: `${28 + (i % 3) * 4}px` }}
            />
          )
        )}
      </div>

      {/* Scan line — sweeps across barcode area */}
      <div className="absolute top-4 right-2 w-28 h-16 overflow-hidden rotate-[8deg]">
        <div className="absolute inset-x-0 h-[2px] bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)] animate-[scan-line-sweep_2s_ease-in-out_infinite]" />
      </div>

      {/* "Verified" frosted badge — bottom-left */}
      <div className="absolute bottom-8 left-4 bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 border border-white/30 shadow-lg">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-green-400"
        >
          <circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.2" />
          <path
            d="M4 7l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white/90 text-xs font-semibold tracking-wide">
          Verified
        </span>
      </div>

      {/* "3/3 scanned" chip — bottom-right */}
      <div className="absolute bottom-8 right-4 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 shadow-md">
        <span className="text-white/80 text-[11px] font-medium">
          3/3 scanned
        </span>
      </div>
    </div>
  );
};
