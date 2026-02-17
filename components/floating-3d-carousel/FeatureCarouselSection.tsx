"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CardCarousel } from "./CardCarousel";
import { CarouselFeature } from "./types";

gsap.registerPlugin(ScrollTrigger);

const COLOR_MUTED = "#D4CCE0";
const COLOR_ACTIVE = "#A855F7";

const HEADING_TEXT = "See PackBee in Action";

const features: CarouselFeature[] = [
  {
    src: "/images/dashboard.png",
    alt: "PackBee Dashboard showing real-time packing metrics",
    title: "Dashboard",
    subtitle: "Real-Time Overview",
    description:
      "Get a live view of your packing operations. Track orders, error rates, and team performance — all in one glance.",
  },
  {
    src: "/images/verlauf.png",
    alt: "PackBee detailed packing history with filtering",
    title: "Packing History",
    subtitle: "Full Audit Trail",
    description:
      "Every order, every scan, every detail. Filter by packer, date, or status to find exactly what you need.",
  },
  {
    src: "https://picsum.photos/seed/packbee-analytics/960/600",
    alt: "Analytics dashboard with charts and reports",
    title: "Analytics & Reports",
    subtitle: "Data-Driven Insights",
    description:
      "Understand your fulfillment performance with detailed charts, trends, and exportable reports.",
  },
  {
    src: "https://picsum.photos/seed/packbee-team/960/600",
    alt: "Team management interface showing packer assignments",
    title: "Team Management",
    subtitle: "Organize Your Crew",
    description:
      "Assign roles, monitor individual packer stats, and keep your warehouse team running smoothly.",
  },
  {
    src: "https://picsum.photos/seed/packbee-channels/960/600",
    alt: "Multi-channel fulfillment view with unified orders",
    title: "Multi-Channel",
    subtitle: "Unified Fulfillment",
    description:
      "Consolidate orders from every sales channel into one packing workflow. No more switching between platforms.",
  },
];

export const FeatureCarouselSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const pillRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate pill badge
      if (pillRef.current) {
        gsap.fromTo(
          pillRef.current,
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Animate heading letters
      gsap.fromTo(
        charsRef.current,
        { color: COLOR_MUTED },
        {
          color: COLOR_ACTIVE,
          stagger: 0.04,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 35%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = HEADING_TEXT.split(" ");
  let charIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="bg-[#F3F1F5] pt-24 pb-20 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Features pill */}
        <span
          ref={pillRef}
          className="inline-block text-purple-600 text-xs font-semibold tracking-widest uppercase bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-200/50 mb-6"
        >
          Features
        </span>

        {/* Animated heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-center mb-8">
          {words.map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char) => {
                const idx = charIndex++;
                return (
                  <span
                    key={idx}
                    ref={(el) => {
                      if (el) charsRef.current[idx] = el;
                    }}
                    style={{ color: COLOR_MUTED }}
                  >
                    {char}
                  </span>
                );
              })}
              {wordIdx < words.length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h2>

        {/* 3D Carousel */}
        <CardCarousel cards={features} />
      </div>
    </section>
  );
};
