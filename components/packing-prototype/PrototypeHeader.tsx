"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Pause,
  SkipForward,
  X,
  ExternalLink,
} from "lucide-react";

interface PrototypeHeaderProps {
  orderNumber: string;
  position: number;
  totalOrders: number;
}

export const PrototypeHeader: React.FC<PrototypeHeaderProps> = ({
  orderNumber,
  position,
  totalOrders,
}) => {
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-3 lg:px-5 bg-white shrink-0">
      {/* Left: Order Number */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-900 text-sm lg:text-base">
          {orderNumber}
        </span>
        <ExternalLink size={14} className="text-gray-400" />
      </div>

      {/* Right: Timer + Position + Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <Clock size={13} />
          <span className="font-mono">{formattedTime}</span>
        </div>
        <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
          {position}/{totalOrders}
        </div>
        <div className="hidden sm:block h-4 w-px bg-gray-200" />
        <button className="hidden sm:flex items-center gap-1.5 text-gray-500 text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-gray-100 cursor-default">
          <Pause size={13} />
          <span className="hidden lg:inline">Pausieren</span>
        </button>
        <button className="hidden sm:flex items-center gap-1.5 text-gray-500 text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-gray-100 cursor-default">
          <SkipForward size={13} />
          <span className="hidden lg:inline">Überspringen</span>
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 cursor-default">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
