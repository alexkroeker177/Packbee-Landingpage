"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

const productLinks = [
  { label: "Scan-Verifikation", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Team-Verwaltung", href: "#" },
  { label: "BillBee-Integration", href: "#" },
  { label: "Preise", href: "#" },
];

const companyLinks = [
  { label: "Über uns", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Kontakt", href: "#" },
  { label: "Karriere", href: "#" },
];

const legalLinks = [
  { label: "Impressum", href: "#" },
  { label: "Datenschutz", href: "#" },
  { label: "AGB", href: "#" },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[var(--color-cta-dark)] text-white overflow-hidden">
      {/* Honeycomb divider strip */}
      <div className="h-2 bg-honeycomb opacity-[0.08]" />

      {/* Full honeycomb background */}
      <div className="absolute inset-0 bg-honeycomb opacity-[0.04] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <img
              src="/images/Packbee-Logo-Full-White.svg"
              alt="PackBee"
              className="h-7 w-auto mb-4"
            />
            <p className="text-sm text-white/60 leading-relaxed">
              Barcode-basierte Packverifikation für fehlerfreien E-Commerce-Versand.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Produkt
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Unternehmen
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Rechtliches
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-white/60 mb-3">
              Updates zu neuen Funktionen und Tipps für fehlerfreien Versand.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="E-Mail-Adresse"
                className="flex-1 min-w-0 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
              <button
                type="submit"
                className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-lg px-3 py-2 transition-colors shrink-0"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; 2026 PackBee. Alle Rechte vorbehalten.
          </p>

          <div className="flex items-center gap-4">
            {/* Social icons */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="X (Twitter)"
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Language indicator */}
            <span className="text-xs text-white/40 border border-white/15 rounded px-2 py-0.5 font-medium">
              DE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
