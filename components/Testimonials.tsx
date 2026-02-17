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
      "Since switching to PackBee, our mispick rate dropped to nearly zero. The scan-to-verify flow is so intuitive that new packers are productive within minutes.",
    name: "Laura M.",
    role: "Head of Fulfillment",
  },
  {
    quote:
      "The 'no scan, no label' rule changed everything for us. We used to catch shipping errors after the fact — now they simply can't happen. It's peace of mind at scale.",
    name: "Marcus T.",
    role: "Operations Manager",
  },
  {
    quote:
      "We run a team of eight packers across two shifts. PackBee's live dashboard lets me see exactly who's working on what, without walking the floor.",
    name: "Sophie K.",
    role: "Warehouse Lead",
  },
  {
    quote:
      "BillBee handles our orders, PackBee handles the truth. Every scan is logged, every shipment verified. Our customer complaints dropped by 80% in the first month.",
    name: "Jonas R.",
    role: "E-Commerce Director",
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
      // Each card gets: 0.4 hold + 1.0 transition = 1.4 units, last card gets 0.5 hold
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

      {/* Base gray */}
      <div className="absolute inset-0 bg-[#E8E4EC]" />

      {/* Pink-orange radial glow — behind the card area */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(251,113,133,0.45) 0%, rgba(251,146,60,0.25) 35%, transparent 70%)",
        }}
      />

      {/* Purple hills — back layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[55%]"
        viewBox="0 0 1440 500"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hill-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 C200,80 400,300 720,180 C1040,60 1240,280 1440,160 L1440,500 L0,500Z"
          fill="url(#hill-back)"
        />
      </svg>

      {/* Purple hills — front layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[45%]"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hill-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#5B21B6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.8" />
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
            className="inline-block text-purple-600 text-xs font-semibold tracking-widest uppercase bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-200/50"
          >
            Testimonials
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
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 leading-relaxed font-medium mb-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="w-12 h-[2px] bg-purple-300 mx-auto mb-4 rounded-full" />
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
