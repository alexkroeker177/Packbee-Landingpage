"use client";

import React, { useState, useEffect } from 'react';
import { Menu, ArrowRight, X } from 'lucide-react';

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

            {/* PackBee Logo */}
            <a href="#" className="flex items-center group mr-1">
              <img
                src="/images/Packbee-Logo-Full-Black.svg"
                alt="PackBee"
                className="h-7 w-auto"
              />
            </a>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-gray-400/20 mx-1"></div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-0.5 text-[15px] font-medium text-[var(--color-text-secondary)]">
              <a href="#funktionen" className="hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">
                Produkt
              </a>
              <a href="#" className="hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">
                Ressourcen
              </a>
              <a href="#preise" className="hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors">Preise</a>
            </div>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2 pr-1">
            <a href="#" className="text-[15px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary-700)] px-4 transition-colors">
                Kontakt
            </a>
            <a href="#" className="text-[15px] font-medium text-white bg-[var(--color-cta-dark)] px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-black transition-colors group shadow-sm">
              Zur App
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
              href="#funktionen"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Produkt
            </a>
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Ressourcen
            </a>
            <a
              href="#preise"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 px-3 py-2.5 rounded-lg transition-colors"
            >
              Preise
            </a>
            <div className="h-px bg-gray-200/50 my-1" />
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary-700)] px-3 py-2.5 rounded-lg transition-colors"
            >
              Kontakt
            </a>
            <a
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-[15px] font-medium text-white bg-[var(--color-cta-dark)] px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              Zur App
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};
