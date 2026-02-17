"use client";

import React from "react";

const AVATARS = [
  { initial: "M", bg: "bg-purple-400" },
  { initial: "S", bg: "bg-blue-400" },
  { initial: "A", bg: "bg-teal-400" },
  { initial: "L", bg: "bg-indigo-400" },
];

export const MultiPackerVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Overlapping avatar circles — top-left */}
      <div className="absolute top-6 left-4 flex -space-x-2">
        {AVATARS.map((avatar, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-white/20 shadow-md`}
            style={{ zIndex: AVATARS.length - i }}
          >
            {avatar.initial}
          </div>
        ))}
      </div>

      {/* Order claim card 1 — rotated */}
      <div className="absolute top-16 right-3 rotate-[4deg] bg-white/15 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 shadow-lg">
        <div className="text-[9px] text-white/50 font-medium mb-0.5">
          #20458
        </div>
        <div className="text-[11px] text-white/90 font-semibold">
          Claimed by M
        </div>
      </div>

      {/* Order claim card 2 — different angle */}
      <div className="absolute top-28 right-8 rotate-[-2deg] bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/15 shadow-md">
        <div className="text-[9px] text-white/50 font-medium mb-0.5">
          #20459
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] text-white/80 font-medium">
            Packing...
          </span>
        </div>
      </div>

      {/* Pulsing green dot — activity indicator */}
      <div className="absolute bottom-12 left-6">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-glow-pulse" />
        </div>
      </div>

      {/* "4 packers online" counter pill — bottom */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-center">
        <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 shadow-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-white/80 text-[11px] font-medium">
            4 packers online
          </span>
        </div>
      </div>
    </div>
  );
};
