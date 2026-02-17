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

  const bgImageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      ScrollTrigger.matchMedia({

        // Desktop: >=1280px — split layout (text left, prototype right)
        // Values adapt dynamically to viewport width
        "(min-width: 1280px)": function() {
          const vw = window.innerWidth;
          // Smoothly interpolate between 1280px (tight) and 1920px (spacious)
          const t = Math.max(0, Math.min(1, (vw - 1280) / (1920 - 1280)));
          const endScale = 0.75 + t * 0.12;    // 0.75 at 1280 → 0.87 at 1920
          const endXPercent = 22 - t * 10;      // 22 at 1280 → 12 at 1920

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

          // 2. Background Image Parallax
          tl.fromTo(bgImageRef.current,
            { scale: 1.1, y: "5%" },
            { scale: 1, y: "0%", duration: 1, ease: "none" },
            0
          );

          // 3. Hero Text - Vanish
          tl.to(heroTextRef.current, {
            opacity: 0,
            y: -150,
            scale: 0.9,
            duration: 0.4,
            ease: "power1.in"
          }, 0);

          // 4. App Window - Move from Center to Right (adaptive)
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

          // 5. Left Content - Slide in from left
          tl.fromTo(leftContentRef.current,
            { opacity: 0, x: -30, pointerEvents: "none" },
            { opacity: 1, x: 0, pointerEvents: "auto", duration: 0.6, ease: "power2.out" },
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

          // 2. Background Image Parallax
          tl.fromTo(bgImageRef.current,
            { scale: 1.1, y: "5%" },
            { scale: 1, y: "0%", duration: 1, ease: "none" },
            0
          );

          // 3. Hero Text - Vanish
          tl.to(heroTextRef.current, {
            opacity: 0,
            y: -100,
            scale: 0.9,
            duration: 0.4,
            ease: "power1.in"
          }, 0);

          // 4. App Window - Stay centered, scale to nearly full width
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

          // 5. Left Content - Appear above prototype (centered)
          tl.fromTo(leftContentRef.current,
            { opacity: 0, x: 0, y: 20, pointerEvents: "none" },
            { opacity: 1, x: 0, y: 0, pointerEvents: "auto", duration: 0.6, ease: "power2.out" },
            0.4
          );

        }

      });

    }, componentRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={componentRef} className="relative h-screen w-full bg-white overflow-hidden">

        {/* Background Mask Container */}
        <div ref={maskRef} className="absolute inset-0 z-0 w-full h-full bg-[#E0CCF7] overflow-hidden" style={{ clipPath: "ellipse(50% 90% at 50% 100%)" }}>

             {/* 3D Landscape Background Image */}
             <img
                ref={bgImageRef}
                src="/images/herobackground.webp"
                alt="3D Abstract Landscape"
                className="absolute inset-0 w-full h-full object-cover object-center"
             />

             {/* Gradients */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
        </div>

        {/* Main Content Container */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">

            {/* Inner Wrapper */}
            <div className="w-full h-full relative pointer-events-auto">

                {/* --- 1. Initial Hero Text --- */}
                <div ref={heroTextRef} className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center text-center text-white pt-32 lg:pt-44 px-4">
                    <div className="inline-block mb-6">
                        <span className="text-purple-50 font-semibold tracking-widest uppercase text-xs bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/30 shadow-sm">
                          Boards
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] drop-shadow-md">
                      Where great ideas <br/> take shape
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-purple-50 mb-8 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm opacity-95">
                      Whimsical Boards is a purpose-built whiteboard <br className="hidden md:block"/> for thinking and planning.
                    </p>

                    <button className="bg-[#2e1d38] text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-black hover:scale-105 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 duration-200 group border border-white/10">
                      Get started free
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- 2. New Left Content (Split View) --- */}
                {/* Mobile/tablet: centered horizontally at top via auto margins */}
                {/* Desktop xl+: left-aligned at 6% with vertical centering */}
                <div
                    ref={leftContentRef}
                    className="absolute z-20 max-w-md px-6 xl:px-0 text-white opacity-0
                      top-[8%] left-0 right-0 mx-auto
                      xl:top-1/2 xl:left-[6%] xl:right-auto xl:mx-0 xl:-translate-y-1/2"
                >
                    <div className="xl:bg-white/10 xl:backdrop-blur-md xl:rounded-2xl xl:p-8 xl:border xl:border-white/20">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                            A versatile space <br/> where ideas take shape
                        </h2>
                        <p className="text-base xl:text-lg text-purple-50 mb-8 leading-relaxed drop-shadow-md">
                            Get your team on the same page. Document, communicate, and make decisions—together or apart, in real-time or async.
                        </p>
                        <a href="#" className="inline-flex items-center text-lg font-semibold hover:gap-2 transition-all drop-shadow-md">
                            Get started free <ChevronRight className="ml-1" />
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
