"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  "Unbegrenzte Nutzer",
  "BillBee Integration",
  "Echtzeit-Scan-Verifikation",
  "Dashboard & Berichte",
  "E-Mail Support",
  "Keine Mindestlaufzeit",
];

const VOLUME_EXAMPLES = [
  { orders: 100, cost: "6" },
  { orders: 500, cost: "30" },
  { orders: 1000, cost: "60" },
  { orders: 2000, cost: "120" },
];

export const Pricing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLLIElement[]>([]);
  const volumeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Pill fade in
      if (pillRef.current) {
        gsap.fromTo(
          pillRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      }

      // Heading fade in
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 55%",
              scrub: 1,
            },
          }
        );
      }

      // Card fade in + scale
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 85%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      }

      // Staggered feature items
      if (featuresRef.current.length > 0) {
        gsap.fromTo(
          featuresRef.current,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.06,
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 70%",
              end: "top 45%",
              scrub: 1,
            },
          }
        );
      }

      // Volume table fade in
      if (volumeRef.current) {
        gsap.fromTo(
          volumeRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: volumeRef.current,
              start: "top 90%",
              end: "top 70%",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="preise"
      ref={sectionRef}
      className="relative bg-[#1C1510] py-24 sm:py-32 px-6 md:px-12 overflow-hidden"
    >
      {/* Honeycomb pattern */}
      <div className="absolute inset-0 bg-honeycomb opacity-[0.08] pointer-events-none" />

      {/* Amber radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(245, 158, 11, 0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Pill */}
        <span
          ref={pillRef}
          className="inline-block text-[var(--color-primary-400)] text-xs font-semibold tracking-widest uppercase bg-[var(--color-primary-400)]/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 mb-6"
        >
          Preise
        </span>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-center mb-4"
        >
          Einfach. Fair. Transparent.
        </h2>
        <p className="text-white/50 text-lg text-center mb-12 max-w-xl">
          Ein Preis. Keine versteckten Kosten. Zahle nur, was du nutzt.
        </p>

        {/* Pricing Card */}
        <div
          ref={cardRef}
          className="w-full max-w-lg bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm p-8 sm:p-10 shadow-[0_0_80px_rgba(245,158,11,0.08)]"
        >
          {/* Price display */}
          <div className="text-center mb-8">
            <div className="flex items-start justify-center gap-1">
              <span className="text-white/60 text-2xl font-medium mt-3">
                0,
              </span>
              <span className="text-[var(--color-primary-400)] text-[6rem] sm:text-[7rem] font-extrabold leading-none">
                06
              </span>
              <span className="text-[var(--color-primary-400)] text-3xl font-bold mt-3">
                &euro;
              </span>
            </div>
            <p className="text-white/50 text-sm font-medium tracking-wide uppercase mt-1">
              pro Bestellung
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-8" />

          {/* Feature checklist */}
          <ul className="space-y-4 mb-8">
            {FEATURES.map((feature, i) => (
              <li
                key={feature}
                ref={(el) => {
                  if (el) featuresRef.current[i] = el;
                }}
                className="flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary-500)]/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary-400)]" />
                </span>
                <span className="text-white text-sm sm:text-base">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <a
            href="#"
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold text-base py-3.5 rounded-xl transition-colors group"
          >
            Jetzt starten
            <ArrowRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>

          {/* Trust note */}
          <p className="text-white/40 text-xs text-center mt-4">
            Keine Kreditkarte erforderlich &mdash; Kostenlos starten
          </p>
        </div>

        {/* Volume examples */}
        <div ref={volumeRef} className="mt-16 w-full max-w-3xl">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase text-center mb-6">
            Monatliche Kosten nach Bestellvolumen
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VOLUME_EXAMPLES.map((vol) => (
              <div
                key={vol.orders}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-center"
              >
                <p className="text-white/60 text-sm mb-1">
                  {vol.orders.toLocaleString("de-DE")} Bestellungen
                </p>
                <p className="text-white text-2xl font-bold">
                  {vol.cost}&nbsp;&euro;
                </p>
                <p className="text-white/40 text-xs mt-0.5">/ Monat</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
