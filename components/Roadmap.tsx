"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type QuarterStatus = "done" | "in-progress" | "planned";

interface Quarter {
  label: string;
  status: QuarterStatus;
  features: string[];
}

const QUARTERS: Quarter[] = [
  {
    label: "Q1 2026",
    status: "done",
    features: [
      "BillBee Integration",
      "Barcode Scan-Verifikation",
      "Multi-Packer Unterstützung",
      "Echtzeit Dashboard",
    ],
  },
  {
    label: "Q2 2026",
    status: "in-progress",
    features: [
      "Erweiterte Berichte & Analytics",
      "Foto-Verifikation",
      "API für Integrationen",
    ],
  },
  {
    label: "Q3 2026",
    status: "planned",
    features: [
      "Mobile App (iOS & Android)",
      "Multi-Carrier Versandlabel",
      "Gewichts-Verifikation",
    ],
  },
  {
    label: "Q4 2026",
    status: "planned",
    features: [
      "Retouren-Management",
      "Lagerplatz-Verwaltung",
      "KI-gestützte Fehlervorhersage",
    ],
  },
];

const STATUS_CONFIG: Record<
  QuarterStatus,
  {
    label: string;
    dotClass: string;
    badgeClass: string;
    lineClass: string;
    Icon: typeof CheckCircle2;
  }
> = {
  done: {
    label: "Abgeschlossen",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    lineClass: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  "in-progress": {
    label: "In Arbeit",
    dotClass: "bg-amber-500 animate-pulse",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200",
    lineClass:
      "bg-gradient-to-b from-amber-500 to-gray-200",
    Icon: Loader2,
  },
  planned: {
    label: "Geplant",
    dotClass: "bg-gray-300",
    badgeClass:
      "bg-gray-50 text-gray-500 border-gray-200",
    lineClass: "bg-gray-200",
    Icon: Circle,
  },
};

const QuarterCard: React.FC<{ quarter: Quarter }> = ({ quarter }) => {
  const config = STATUS_CONFIG[quarter.status];
  const StatusIcon = config.Icon;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm px-6 py-5 hover:shadow-md hover:border-[var(--color-primary-200)] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--color-text-primary)] font-extrabold text-lg">
          {quarter.label}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeClass}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
      <ul className="space-y-2">
        {quarter.features.map((feature) => (
          <li
            key={feature}
            className="text-[var(--color-text-secondary)] text-sm flex items-start gap-2"
          >
            <span className="text-[var(--color-primary-500)] mt-0.5 text-xs">
              &#x25CF;
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Roadmap: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<HTMLDivElement[]>([]);

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

      // Rows animate from alternating sides
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const fromX = i % 2 === 0 ? -40 : 40;
        gsap.fromTo(
          row,
          { opacity: 0, x: fromX },
          {
            opacity: 1,
            x: 0,
            scrollTrigger: {
              trigger: row,
              start: "top 88%",
              end: "top 65%",
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--color-section-a)] py-24 sm:py-32 px-6 md:px-12 overflow-hidden"
    >
      {/* Honeycomb pattern */}
      <div className="absolute inset-0 bg-honeycomb opacity-[0.07] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Pill */}
        <span
          ref={pillRef}
          className="inline-block text-[var(--color-pill-text)] text-xs font-semibold tracking-widest uppercase bg-[var(--color-pill-bg)] backdrop-blur-sm px-4 py-1.5 rounded-full border border-[var(--color-pill-border)] mb-6"
        >
          Roadmap
        </span>

        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.1] mb-4">
            Was als Nächstes kommt
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            Unsere Produkt-Roadmap für 2026 &mdash; von geplant bis
            ausgeliefert.
          </p>
        </div>

        {/* Timeline */}
        <div className="w-full max-w-3xl mx-auto">
          {QUARTERS.map((quarter, i) => {
            const config = STATUS_CONFIG[quarter.status];
            const isLast = i === QUARTERS.length - 1;

            return (
              <div
                key={quarter.label}
                ref={(el) => {
                  if (el) rowRefs.current[i] = el;
                }}
                className="relative grid grid-cols-[1fr] lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-8 mb-8 lg:mb-0"
              >
                {/* Desktop: Left card (even rows) or empty */}
                <div className="hidden lg:flex items-start justify-end">
                  {i % 2 === 0 ? <QuarterCard quarter={quarter} /> : null}
                </div>

                {/* Center timeline */}
                <div className="hidden lg:flex flex-col items-center">
                  {/* Dot */}
                  <div
                    className={`w-4 h-4 rounded-full ${config.dotClass} ring-4 ring-white shadow-sm flex-shrink-0 mt-6`}
                  />
                  {/* Line segment */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[60px] ${config.lineClass}`}
                    />
                  )}
                </div>

                {/* Desktop: Right card (odd rows) or empty */}
                <div className="hidden lg:flex items-start">
                  {i % 2 !== 0 ? <QuarterCard quarter={quarter} /> : null}
                </div>

                {/* Mobile: dot + card */}
                <div className="flex lg:hidden gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${config.dotClass} ring-4 ring-[var(--color-section-a)] flex-shrink-0 mt-6`}
                    />
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-[40px] ${config.lineClass}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <QuarterCard quarter={quarter} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
