"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, ArrowRight, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on scroll
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-[1160px] bg-white/60 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 px-2 md:px-3 transition-all duration-300 hover:bg-white/80">
        {/* Main bar */}
        <div className="h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2">

            {/* Logo Section */}
            <a href="#" className="flex items-center gap-2 group mr-1">
               {/* Custom Logo Icon - Overlapping Diamonds */}
               <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute w-[16px] h-[16px] bg-[#A855F7] rounded-[2px] transform rotate-45 -translate-x-[3px] translate-y-[0px]"></div>
                  <div className="absolute w-[16px] h-[16px] bg-[#E9D5FF] rounded-[2px] transform rotate-45 translate-x-[3px] translate-y-[0px] mix-blend-multiply"></div>
               </div>

              <div className="flex items-center gap-1">
                  <span className="text-[18px] font-bold tracking-tight text-[#1A1A1A]">
                  Whimsical
                  </span>
                  <ChevronDown size={14} strokeWidth={3} className="text-gray-500/70 mt-[2px]" />
              </div>
            </a>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-gray-400/20 mx-1"></div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-0.5 text-[15px] font-medium text-[#404040]">
              <button className="flex items-center gap-1 hover:text-black hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">
                Product <ChevronDown size={14} strokeWidth={2} className="text-gray-400" />
              </button>
              <button className="flex items-center gap-1 hover:text-black hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">
                Resources <ChevronDown size={14} strokeWidth={2} className="text-gray-400" />
              </button>
              <a href="#" className="hover:text-black hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">Pricing</a>
            </div>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2 pr-1">
            <a href="#" className="text-[15px] font-medium text-[#1A1A1A] hover:text-purple-600 px-4 transition-colors">
                Contact sales
            </a>
            <a href="#" className="text-[15px] font-medium text-white bg-[#2E1D38] px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-black transition-colors group shadow-sm">
              To App
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800 p-2 hover:bg-black/5 rounded-md mr-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Slide-Down Menu */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="border-t border-gray-200/50 px-2 pt-3 pb-4 flex flex-col gap-1">
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[#404040] hover:text-black hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Product
            </a>
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[#404040] hover:text-black hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Resources
            </a>
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[#404040] hover:text-black hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Pricing
            </a>
            <div className="h-px bg-gray-200/50 my-1" />
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[#1A1A1A] hover:text-purple-600 px-3 py-2.5 rounded-lg transition-colors"
            >
              Contact sales
            </a>
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-white bg-[#2E1D38] px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              To App
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};
