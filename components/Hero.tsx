"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { AppWindow } from './AppWindow';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const appWindowWrapperRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      ScrollTrigger.matchMedia({

        // Desktop: >=1280px — split layout (text left, prototype right)
        "(min-width: 1280px)": function() {
          const vw = window.innerWidth;
          const t = Math.max(0, Math.min(1, (vw - 1280) / (1920 - 1280)));
          const endScale = 0.75 + t * 0.12;
          const endXPercent = 22 - t * 10;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: componentRef.current,
              start: "top top",
              end: "+=200%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            }
          });

          // 1. Background Expansion
          tl.fromTo(maskRef.current,
            { clipPath: "ellipse(50% 90% at 50% 100%)" },
            { clipPath: "ellipse(150% 150% at 50% 100%)", duration: 1, ease: "power2.inOut" },
            0
          );

          // 2. Hero Text - Vanish
          tl.to(heroTextRef.current, {
            opacity: 0,
            y: -150,
            scale: 0.9,
            pointerEvents: "none",
            duration: 0.4,
            ease: "power1.in"
          }, 0);

          // 3. App Window - Move from Center to Right (adaptive)
          tl.fromTo(appWindowWrapperRef.current,
            {
              yPercent: 45,
              xPercent: 0,
              scale: 0.95
            },
            {
              yPercent: 0,
              xPercent: endXPercent,
              scale: endScale,
              duration: 1,
              ease: "power2.inOut"
            },
            0
          );

          // 4. Left Content - Slide in from left
          tl.fromTo(leftContentRef.current,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
            0.4
          );

        },

        // Mobile/Tablet: <1280px — centered, stacked
        "(max-width: 1279px)": function() {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: componentRef.current,
              start: "top top",
              end: "+=200%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            }
          });

          // 1. Background Expansion
          tl.fromTo(maskRef.current,
            { clipPath: "ellipse(50% 90% at 50% 100%)" },
            { clipPath: "ellipse(150% 150% at 50% 100%)", duration: 1, ease: "power2.inOut" },
            0
          );

          // 2. Hero Text - Vanish
          tl.to(heroTextRef.current, {
            opacity: 0,
            y: -100,
            scale: 0.9,
            pointerEvents: "none",
            duration: 0.4,
            ease: "power1.in"
          }, 0);

          // 3. App Window - Stay centered, scale to nearly full width
          tl.fromTo(appWindowWrapperRef.current,
            {
              yPercent: 45,
              xPercent: 0,
              scale: 0.95
            },
            {
              yPercent: 5,
              xPercent: 0,
              scale: 0.95,
              duration: 1,
              ease: "power2.inOut"
            },
            0
          );

          // 4. Left Content - Appear above prototype (centered)
          tl.fromTo(leftContentRef.current,
            { opacity: 0, x: 0, y: 20 },
            { opacity: 1, x: 0, y: 0, duration: 0.6, ease: "power2.out" },
            0.4
          );

        }

      });

    }, componentRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={componentRef} className="relative h-screen w-full bg-white overflow-hidden">

        {/* Background Mask Container — rich amber background */}
        <div ref={maskRef} className="absolute inset-0 z-0 w-full h-full overflow-hidden" style={{ clipPath: "ellipse(50% 90% at 50% 100%)" }}>

             {/* Saturated amber gradient base */}
             <div
               className="absolute inset-0"
               style={{
                 background: "linear-gradient(135deg, #FDE68A 0%, #FBBF24 25%, #F59E0B 50%, #D97706 75%, #B45309 100%)",
               }}
             />

             {/* Hexagonal SVG pattern overlay */}
             <svg
               className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none"
               xmlns="http://www.w3.org/2000/svg"
             >
               <defs>
                 <pattern id="hero-hex" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                   <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66ZM28 100L0 84L0 50L28 34L56 50L56 84L28 100Z" fill="none" stroke="white" strokeWidth="1"/>
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#hero-hex)"/>
             </svg>

             {/* Radial accent glow — brighter center */}
             <div
               className="absolute inset-0"
               style={{
                 background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255, 255, 255, 0.2), transparent 70%)",
               }}
             />

             {/* Dark overlay for text contrast */}
             <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(120, 53, 15, 0.6), rgba(146, 64, 14, 0.25) 50%, transparent)" }}></div>
        </div>

        {/* Main Content Container */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">

            {/* Inner Wrapper */}
            <div className="w-full h-full relative pointer-events-auto">

                {/* --- 1. Initial Hero Text --- */}
                <div ref={heroTextRef} className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center text-center pt-32 lg:pt-44 px-4">
                    <div className="inline-block mb-6">
                        <span className="text-white font-semibold tracking-widest uppercase text-xs bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/30 shadow-sm">
                          Packverifikation
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] text-white drop-shadow-lg">
                      Scannen. Packen. <br/> Fertig.
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                      Barcode-basierte Packverifikation <br className="hidden md:block"/> für fehlerfreien Versand.
                    </p>

                    <button className="bg-white text-[var(--color-primary-800)] px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/90 hover:scale-105 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 duration-200 group">
                      Jetzt starten
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- 2. New Left Content (Split View) --- */}
                <div
                    ref={leftContentRef}
                    className="absolute z-20 max-w-md px-6 xl:px-0 opacity-0 pointer-events-none
                      top-[8%] left-0 right-0 mx-auto
                      xl:top-1/2 xl:left-[6%] xl:right-auto xl:mx-0 xl:-translate-y-1/2"
                >
                    <div className="xl:bg-white/10 xl:backdrop-blur-md xl:rounded-2xl xl:p-8 xl:border xl:border-white/20 pointer-events-auto">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                            Volle Kontrolle <br/> beim Packen
                        </h2>
                        <p className="text-base xl:text-lg text-white/90 mb-8 leading-relaxed drop-shadow-md">
                            Jede Bestellung wird gescannt, jeder Artikel verifiziert. Fehlerhafte Sendungen gehören der Vergangenheit an.
                        </p>
                        <a href="#" className="inline-flex items-center text-lg font-semibold text-white hover:gap-2 transition-all drop-shadow-md">
                            Jetzt starten <ChevronRight className="ml-1" />
                        </a>
                    </div>
                </div>

                {/* --- 3. App Mockup --- */}
                <div
                    ref={appWindowWrapperRef}
                    className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 pointer-events-none"
                >
                    <div className="w-full max-w-[1240px] px-4 lg:px-0 pointer-events-auto">
                        <div className="w-full transform shadow-[0_50px_100px_-20px_rgba(50,50,93,0.4)] rounded-xl bg-white">
                            <AppWindow />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
  );
};
