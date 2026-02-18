"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCSSVar } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const HEADING_TEXT = "Jede Sendung korrekt. Jeder Scan protokolliert. Null Fehler.";

export const ScrollHeading: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useLayoutEffect(() => {
    const mutedColor = getCSSVar("--color-heading-muted");
    const activeColor = getCSSVar("--color-heading-active");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        charsRef.current,
        { color: mutedColor },
        {
          color: activeColor,
          stagger: 0.03,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Split text into words, then characters, preserving spaces
  const words = HEADING_TEXT.split(" ");
  let charIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--color-section-a)] py-32 md:py-44 px-6 md:px-12"
    >
      <div className="absolute inset-0 bg-honeycomb opacity-[0.07] pointer-events-none" />
      <h2 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold max-w-5xl mx-auto leading-[1.1] tracking-tight">
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
            {wordIdx < words.length - 1 && (
              <span>&nbsp;</span>
            )}
          </span>
        ))}
      </h2>
    </section>
  );
};
