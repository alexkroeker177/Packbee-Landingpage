"use client";

import React from "react";

export const NoScanNoLabelVisual: React.FC = () => {
  // SVG progress ring values: 5/8 scanned
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = 5 / 8;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Shipping label — center-right */}
      <div className="absolute top-8 right-4 w-32 bg-white/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/25 shadow-lg rotate-[-3deg]">
        {/* FROM block */}
        <div className="mb-2">
          <div className="text-[7px] font-bold text-white/50 uppercase tracking-wider mb-0.5">
            From
          </div>
          <div className="h-[3px] w-16 bg-white/30 rounded-full mb-[3px]" />
          <div className="h-[3px] w-12 bg-white/20 rounded-full" />
        </div>
        {/* TO block */}
        <div className="mb-2">
          <div className="text-[7px] font-bold text-white/50 uppercase tracking-wider mb-0.5">
            To
          </div>
          <div className="h-[3px] w-14 bg-white/30 rounded-full mb-[3px]" />
          <div className="h-[3px] w-18 bg-white/20 rounded-full mb-[3px]" />
          <div className="h-[3px] w-10 bg-white/20 rounded-full" />
        </div>
        {/* Mini barcode */}
        <div className="flex gap-[1px] mt-1">
          {[2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1].map((w, i) => (
            <div
              key={i}
              className="bg-white/40 rounded-[0.5px]"
              style={{ width: `${w}px`, height: "10px" }}
            />
          ))}
        </div>

        {/* Red lock overlay */}
        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-red-300 drop-shadow-md"
          >
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
              fill="currentColor"
              opacity="0.3"
            />
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 11V7a4 4 0 018 0v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* SVG Progress ring — bottom-left */}
      <div className="absolute bottom-6 left-5">
        <svg width="52" height="52" viewBox="0 0 52 52" className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="rgba(251,191,36,0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/80">
          5/8
        </span>
      </div>

      {/* Faded green unlocked hint — top-left */}
      <div className="absolute top-8 left-5 opacity-25">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-green-300"
        >
          <rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M16 11V7a4 4 0 00-8 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
