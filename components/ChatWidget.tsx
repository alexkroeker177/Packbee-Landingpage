"use client";

import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50">
              <MessageCircle size={28} />
          </button>
      );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 animate-fade-in-up">
        {/* Chat Bubble Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-80 relative">
            
            {/* Header / Avatar */}
            <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <p className="text-gray-800 font-medium text-[15px] leading-snug">
                        Hi there, 👋 do you have any questions about our pricing?
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Fin • 2m</p>
                </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
                <button className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2.5 px-4 rounded-full transition-all text-left shadow-sm">
                    Yes, I have a question about pricing.
                </button>
                <button className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2.5 px-4 rounded-full transition-all text-left shadow-sm">
                    No, I have a question about something else.
                </button>
            </div>
            
        </div>
        
        {/* Close Button specific style */}
         <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors"
            title="Close chat"
        >
              <X size={16} />
        </button>
    </div>
  );
};