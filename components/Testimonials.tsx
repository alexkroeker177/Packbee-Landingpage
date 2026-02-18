"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Seit wir PackBee nutzen, ist unsere Fehlversandquote auf nahezu null gesunken. Der Scan-Verifikations-Flow ist so intuitiv, dass neue Packer innerhalb von Minuten produktiv sind.",
    name: "Laura M.",
    role: "Leiterin Fulfillment",
  },
  {
    quote:
      "Die Regel 'Kein Scan, kein Label' hat alles verändert. Früher haben wir Versandfehler erst im Nachhinein entdeckt — jetzt können sie gar nicht mehr passieren. Sicherheit auf ganzer Linie.",
    name: "Marcus T.",
    role: "Operations Manager",
  },
  {
    quote:
      "Wir arbeiten mit acht Packern in zwei Schichten. Das Live-Dashboard von PackBee zeigt mir genau, wer woran arbeitet — ohne einmal durch die Halle zu laufen.",
    name: "Sophie K.",
    role: "Warehouse-Leiterin",
  },
  {
    quote:
      "BillBee verwaltet unsere Bestellungen, PackBee sorgt für die Wahrheit. Jeder Scan wird protokolliert, jede Sendung verifiziert. Unsere Kundenbeschwerden sind im ersten Monat um 80 % gesunken.",
    name: "Jonas R.",
    role: "E-Commerce-Leiter",
  },
];

export const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const pillRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);
      const totalCards = cards.length;

      // Pill fade in
      gsap.fromTo(
        pillRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 60%",
            scrub: 1,
          },
        }
      );

      // Initial states: first card centered & visible, all others far below & hidden
      gsap.set(cards[0], { y: 0, opacity: 1, zIndex: totalCards });
      for (let i = 1; i < totalCards; i++) {
        gsap.set(cards[i], {
          y: "120vh",
          opacity: 0,
          zIndex: totalCards - i,
        });
      }

      // Main pinned timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=400%`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        const label = `t${i}`;

        // Hold current card briefly
        tl.to(current, { y: 0, duration: 0.4 }, label);

        // PEEK: next card appears at bottom edge, partially visible
        tl.to(
          next,
          {
            y: "40vh",
            opacity: 0.5,
            duration: 0.4,
            ease: "power1.out",
          },
          label
        );

        // TRANSITION: current exits up, next slides to center
        const transLabel = `${label}-move`;
        tl.to(
          current,
          {
            y: "-50vh",
            opacity: 0,
            scale: 0.9,
            duration: 1,
            ease: "power2.inOut",
          },
          transLabel
        );
        tl.to(
          next,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          transLabel
        );
      }

      // Hold last card
      tl.to(cards[totalCards - 1], { y: 0, duration: 0.5 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* === Background landscape === */}

      {/* Base warm gray */}
      <div className="absolute inset-0 bg-[var(--color-testimonial-base)]" />

      {/* Honeycomb pattern */}
      <div className="absolute inset-0 bg-honeycomb opacity-[0.06] pointer-events-none" />

      {/* Amber radial glow — behind the card area */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 50% 45% at 50% 50%, var(--color-testimonial-glow-a) 0%, var(--color-testimonial-glow-b) 35%, transparent 70%)`,
        }}
      />

      {/* Amber hills — back layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[55%]"
        viewBox="0 0 1440 500"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hill-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-hill-back-top)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-hill-back-bottom)" }} />
          </linearGradient>
        </defs>
        <path
          d="M0,200 C200,80 400,300 720,180 C1040,60 1240,280 1440,160 L1440,500 L0,500Z"
          fill="url(#hill-back)"
        />
      </svg>

      {/* Amber hills — front layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[45%]"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hill-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-hill-front-left)" }} />
            <stop offset="50%" style={{ stopColor: "var(--color-hill-front-mid)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-hill-front-right)" }} />
          </linearGradient>
        </defs>
        <path
          d="M0,250 C180,120 360,320 600,200 C840,80 1080,300 1440,180 L1440,400 L0,400Z"
          fill="url(#hill-front)"
        />
      </svg>

      {/* Noise texture overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="testimonial-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#testimonial-noise)"
        />
      </svg>

      {/* === Content layer === */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Testimonials pill */}
        <div className="text-center pt-12 sm:pt-16">
          <span
            ref={pillRef}
            className="inline-block text-[var(--color-pill-text)] text-xs font-semibold tracking-widest uppercase bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-[var(--color-pill-border)]"
          >
            Kundenstimmen
          </span>
        </div>

        {/* Cards container */}
        <div
          ref={containerRef}
          className="flex-1 relative flex items-center justify-center px-6 overflow-hidden"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="absolute w-full max-w-xl will-change-transform"
              style={{
                opacity: i === 0 ? 1 : 0,
                transform: i === 0 ? "none" : "translateY(120vh)",
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl px-8 sm:px-12 py-10 sm:py-14 text-center">
                <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-text-primary)] leading-relaxed font-medium mb-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                {/* Hexagon divider instead of plain bar */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <svg width="10" height="12" viewBox="0 0 10 12" className="text-[var(--color-primary-400)]">
                    <path d="M5 0L10 3L10 9L5 12L0 9L0 3Z" fill="currentColor"/>
                  </svg>
                  <svg width="10" height="12" viewBox="0 0 10 12" className="text-[var(--color-primary-500)]">
                    <path d="M5 0L10 3L10 9L5 12L0 9L0 3Z" fill="currentColor"/>
                  </svg>
                  <svg width="10" height="12" viewBox="0 0 10 12" className="text-[var(--color-primary-400)]">
                    <path d="M5 0L10 3L10 9L5 12L0 9L0 3Z" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
                  {testimonial.name}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
