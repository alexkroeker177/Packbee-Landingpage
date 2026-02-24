"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CardCarousel } from "./CardCarousel";
import { CarouselFeature } from "./types";
import { getCSSVar } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const HEADING_TEXT = "PackBee in Aktion";

const features: CarouselFeature[] = [
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=960&h=600&fit=crop",
    alt: "PackBee Dashboard mit Echtzeit-Packmetriken",
    title: "Dashboard",
    subtitle: "Echtzeit-Überblick",
    description:
      "Live-Ansicht aller Packvorgänge. Bestellungen, Fehlerquoten und Team-Performance auf einen Blick.",
  },
  {
    src: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=960&h=600&fit=crop",
    alt: "PackBee Packverlauf mit Filteroptionen",
    title: "Packverlauf",
    subtitle: "Lückenlose Dokumentation",
    description:
      "Jede Bestellung, jeder Scan, jedes Detail. Nach Packer, Datum oder Status filtern.",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=960&h=600&fit=crop",
    alt: "Analyse-Dashboard mit Diagrammen und Berichten",
    title: "Analysen & Berichte",
    subtitle: "Datenbasierte Einblicke",
    description:
      "Fulfillment-Performance verstehen mit detaillierten Diagrammen, Trends und exportierbaren Berichten.",
  },
  {
    src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=960&h=600&fit=crop",
    alt: "Team-Verwaltung mit Packer-Zuweisungen",
    title: "Team-Verwaltung",
    subtitle: "Team organisieren",
    description:
      "Rollen zuweisen, individuelle Packer-Statistiken überwachen und das Warehouse-Team effizient steuern.",
  },
  {
    src: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=960&h=600&fit=crop",
    alt: "Multi-Channel-Fulfillment mit einheitlicher Bestellübersicht",
    title: "Multi-Channel",
    subtitle: "Einheitliches Fulfillment",
    description:
      "Bestellungen aus allen Verkaufskanälen in einem Packworkflow zusammenführen. Kein Plattformwechsel mehr.",
  },
];

export const FeatureCarouselSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const pillRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    // Dark section: muted warm gray → bright amber gold
    const mutedColor = "rgba(255, 255, 255, 0.25)";
    const activeColor = getCSSVar("--color-primary-400") || "#FBBF24";

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

      // Animate heading letters: ghostly white → glowing amber
      gsap.fromTo(
        charsRef.current,
        { color: mutedColor },
        {
          color: activeColor,
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
      className="relative bg-[#1C1510] pt-24 pb-20 px-6 md:px-12 overflow-hidden"
    >
      {/* Amber honeycomb on dark — the signature look */}
      <div className="absolute inset-0 bg-honeycomb opacity-[0.08] pointer-events-none" />

      {/* Subtle amber radial glow behind the carousel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(245, 158, 11, 0.08), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Features pill — amber accent on dark */}
        <span
          ref={pillRef}
          className="inline-block text-[var(--color-primary-400)] text-xs font-semibold tracking-widest uppercase bg-[var(--color-primary-400)]/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-[var(--color-primary-400)]/20 mb-6"
        >
          Funktionen
        </span>

        {/* Animated heading — ghost white reveals to amber gold */}
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
                    style={{ color: "rgba(255, 255, 255, 0.25)" }}
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
