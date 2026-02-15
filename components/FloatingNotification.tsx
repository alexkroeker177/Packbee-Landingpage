import React from 'react';
import { ChevronRight, X } from 'lucide-react';

export const FloatingNotification: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-100 animate-bounce-slow">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
                <span className="text-lg">🍭</span>
                <span className="font-bold text-gray-800">Applet</span>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">New</span>
            </div>
            <button className="text-gray-300 hover:text-gray-500">
                <X size={14} />
            </button>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">
            The whiteboard for prototyping. Turn your ideas into functional apps.
        </p>
        <button className="text-sm font-semibold text-gray-900 flex items-center hover:gap-2 transition-all group">
            Check it out 
            <ChevronRight size={14} className="ml-1 group-hover:ml-0" />
        </button>
    </div>
  );
};