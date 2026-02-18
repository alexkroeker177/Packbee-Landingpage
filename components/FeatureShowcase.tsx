"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { getCSSVar } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  linkText: string;
  reversed?: boolean;
}

const features: Feature[] = [
  {
    title: "Dashboard",
    description:
      "Echtzeit-Überblick über alle Packvorgänge. Bestellungen, Fehlerquoten und Team-Performance — alles auf einen Blick.",
    image: "/images/dashboard.png",
    imageAlt: "PackBee Dashboard mit Echtzeit-Packmetriken",
    linkText: "Mehr erfahren",
  },
  {
    title: "Packverlauf",
    description:
      "Jede Bestellung, jeder Scan, jedes Detail. Nach Packer, Datum oder Status filtern — alles lückenlos dokumentiert.",
    image: "/images/verlauf.png",
    imageAlt: "PackBee Packverlauf mit Filteroptionen",
    linkText: "Mehr erfahren",
    reversed: true,
  },
];

function FeatureCard({ title, description, image, imageAlt, linkText, reversed }: Feature) {
  const cardRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useLayoutEffect(() => {
    const mutedColor = getCSSVar("--color-heading-muted");
    const activeColor = getCSSVar("--color-heading-active");

    const ctx = gsap.context(() => {
      // Animate heading letters
      gsap.fromTo(
        charsRef.current,
        { color: mutedColor },
        {
          color: activeColor,
          stagger: 0.04,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 75%",
            end: "top 35%",
            scrub: 1,
          },
        }
      );

      // Fade in the whole card
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            end: "top 55%",
            scrub: 1,
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const words = title.split(" ");
  let charIndex = 0;

  return (
    <div
      ref={cardRef}
      className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-16 bg-white rounded-[2rem] p-6 sm:p-8 lg:p-12 shadow-sm`}
    >
      {/* Screenshot */}
      <div className="flex-1 w-full min-w-0">
        <div className="rounded-2xl overflow-hidden bg-[var(--color-surface-50)] border border-[var(--color-border)]">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 w-full min-w-0 lg:max-w-md">
        <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
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
                    style={{ color: "var(--color-heading-muted)" }}
                  >
                    {char}
                  </span>
                );
              })}
              {wordIdx < words.length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h3>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
          {description}
        </p>
        <a
          href="#"
          className="inline-flex items-center text-lg font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] transition-colors"
        >
          {linkText} <ChevronRight className="ml-1" size={20} />
        </a>
      </div>
    </div>
  );
}

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="relative bg-[var(--color-section-d)] pt-24 pb-32 px-6 md:px-12">
      <div className="absolute inset-0 bg-honeycomb opacity-[0.08] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto flex flex-col gap-16 lg:gap-24">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} {...feature} />
        ))}
      </div>
    </section>
  );
};
