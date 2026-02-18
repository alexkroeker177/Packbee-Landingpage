"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScanVerifyVisual } from "./features/ScanVerifyVisual";
import { NoScanNoLabelVisual } from "./features/NoScanNoLabelVisual";
import { MultiPackerVisual } from "./features/MultiPackerVisual";

gsap.registerPlugin(ScrollTrigger);

interface FeatureCard {
  title: string;
  description: string;
  visual: React.ReactNode;
  blobColors: [string, string, string];
  blobAnimClass: string;
}

const CARDS: FeatureCard[] = [
  {
    title: "Scan-Verifikation",
    description:
      "Jeder Artikel wird gescannt. Jede Bestellung wird geprüft. Falsche Sendungen werden unmöglich.",
    visual: <ScanVerifyVisual />,
    blobColors: ["var(--color-blob-1-a)", "var(--color-blob-1-b)", "var(--color-blob-1-c)"],
    blobAnimClass: "animate-[blob-morph-1_8s_ease-in-out_infinite]",
  },
  {
    title: "Kein Scan, kein Label",
    description:
      "Labels bleiben gesperrt, bis jeder Artikel verifiziert ist. Unvollständige Bestellungen können nicht versendet werden.",
    visual: <NoScanNoLabelVisual />,
    blobColors: ["var(--color-blob-2-a)", "var(--color-blob-2-b)", "var(--color-blob-2-c)"],
    blobAnimClass: "animate-[blob-morph-2_10s_ease-in-out_infinite]",
  },
  {
    title: "Im Team packen",
    description:
      "Echtzeit-Überblick: Wer packt was? Bestellungen beanspruchen, Fortschritt verfolgen und das Fulfillment-Team skalieren.",
    visual: <MultiPackerVisual />,
    blobColors: ["var(--color-blob-3-a)", "var(--color-blob-3-b)", "var(--color-blob-3-c)"],
    blobAnimClass: "animate-[blob-morph-3_12s_ease-in-out_infinite]",
  },
];

export const FeaturesCreative: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const floatingRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header fade up
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        }
      );

      // Cards staggered fade up + scale
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );
      });

      // Floating elements subtle parallax
      floatingRefs.current.forEach((el, i) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { y: 20 + i * 8 },
          {
            y: -(10 + i * 6),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="funktionen" ref={sectionRef} className="relative bg-white py-24 sm:py-32 px-6 md:px-12">
      <div className="absolute inset-0 bg-honeycomb opacity-[0.04] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16 sm:mb-20">
          <span className="inline-block text-[var(--color-pill-text)] text-xs font-semibold tracking-widest uppercase bg-[var(--color-pill-bg)] backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 border border-[var(--color-pill-border)]">
            Funktionen
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
            Scannen. Prüfen. Versenden.
          </h2>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="flex flex-col"
            >
              {/* Visual zone with blob background */}
              <div className="relative h-[280px] sm:h-[300px] rounded-3xl overflow-hidden mb-6">
                {/* Blob 1 — primary */}
                <div
                  className={`absolute w-[70%] h-[70%] top-[10%] left-[15%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-80 ${card.blobAnimClass}`}
                  style={{
                    background: `radial-gradient(ellipse at 30% 40%, ${card.blobColors[0]}, ${card.blobColors[1]})`,
                    filter: "blur(40px)",
                  }}
                />
                {/* Blob 2 — secondary with blend */}
                <div
                  className={`absolute w-[60%] h-[60%] top-[25%] left-[30%] rounded-[60%_40%_30%_70%/50%_60%_40%_50%] opacity-60 mix-blend-multiply ${card.blobAnimClass}`}
                  style={{
                    background: `radial-gradient(ellipse at 70% 60%, ${card.blobColors[2]}, ${card.blobColors[1]})`,
                    filter: "blur(50px)",
                    animationDelay: "-3s",
                    animationDirection: "reverse",
                  }}
                />
                {/* Blob 3 — accent */}
                <div
                  className={`absolute w-[40%] h-[45%] top-[35%] left-[5%] rounded-[50%_50%_40%_60%/60%_40%_50%_50%] opacity-50 ${card.blobAnimClass}`}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${card.blobColors[0]}, transparent)`,
                    filter: "blur(35px)",
                    animationDelay: "-6s",
                  }}
                />

                {/* SVG noise overlay for organic texture */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <filter id={`noise-${i}`}>
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.65"
                      numOctaves="3"
                      stitchTiles="stitch"
                    />
                  </filter>
                  <rect
                    width="100%"
                    height="100%"
                    filter={`url(#noise-${i})`}
                  />
                </svg>

                {/* Floating UI elements layer */}
                <div
                  ref={(el) => {
                    if (el) floatingRefs.current[i] = el;
                  }}
                  className="absolute inset-0 z-10"
                >
                  {card.visual}
                </div>
              </div>

              {/* Text content */}
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                {card.title}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
