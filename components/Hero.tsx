import React, { useRef, useLayoutEffect } from 'react';
import { ArrowRight, ChevronRight, BarChart2, Triangle, Box, Smile, Activity, Globe } from 'lucide-react';
import { AppWindow } from './AppWindow';
import { FloatingNotification } from './FloatingNotification';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const appWindowWrapperRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          start: "top top",
          end: "+=200%", // Scroll distance
          scrub: 1, 
          pin: true,
          anticipatePin: 1,
        }
      });

      // --- Animation Steps ---

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

      // 3. Hero Text (Title & CTA) - Vanish
      tl.to(heroTextRef.current, {
        opacity: 0,
        y: -150,
        scale: 0.9,
        duration: 0.4,
        ease: "power1.in"
      }, 0);

      // 4. App Window - Move from Bottom-Center to Right-Center
      // Initial: Centered horizontally (by flex parent), pushed down by yPercent
      // Final: Centered vertically (yPercent: 0), Moved right by 25vw (xPercent: 25 of w-full parent)
      tl.fromTo(appWindowWrapperRef.current, 
        { 
          yPercent: 45, // Starts lower on screen (approx below text)
          xPercent: 0,  // Starts centered horizontally
          scale: 0.95
        },
        { 
          yPercent: 0, // Moves to vertical center
          xPercent: 25, // Moves 25% of viewport width to the right (Center is now at 75vw)
          scale: 0.65, // Scale down to fit the half-screen split
          duration: 1,
          ease: "power2.inOut" 
        }, 
        0
      );

      // 5. Left Content - Appear
      // It is CSS positioned at left: 25%, top: 50%. We just fade it in.
      tl.fromTo(leftContentRef.current, 
        { opacity: 0, x: -30, pointerEvents: "none" },
        { opacity: 1, x: 0, pointerEvents: "auto", duration: 0.6, ease: "power2.out" },
        0.4
      );

      // 6. Logos - Appear at bottom
      tl.fromTo(logosRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.6
      );

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
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
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
                {/* Centered at top initially */}
                <div ref={heroTextRef} className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center text-center text-white pt-44 px-4">
                    <div className="hidden lg:block absolute top-0 right-[15%] xl:right-[20%] -translate-y-4">
                        <FloatingNotification />
                    </div>

                    <div className="inline-block mb-6">
                        <span className="text-purple-50 font-semibold tracking-widest uppercase text-xs bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/30 shadow-sm">
                          Boards
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.05] drop-shadow-md">
                      Where great ideas <br/> take shape
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-50 mb-8 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm opacity-95">
                      Whimsical Boards is a purpose-built whiteboard <br className="hidden md:block"/> for thinking and planning.
                    </p>
                    
                    <button className="bg-[#2e1d38] text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-black hover:scale-105 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 duration-200 group border border-white/10">
                      Get started free
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- 2. New Left Content (Split View) --- */}
                {/* PRECISE POSITIONING: Center point is at 25% VW and 50% VH */}
                <div 
                    ref={leftContentRef} 
                    className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-lg px-8 text-white opacity-0"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                        A versatile space <br/> where ideas take shape
                    </h2>
                    <p className="text-lg text-purple-50 mb-8 leading-relaxed drop-shadow-md">
                        Get your team on the same page. Document, communicate, and make decisions—together or apart, in real-time or async.
                    </p>
                    <a href="#" className="inline-flex items-center text-lg font-semibold hover:gap-2 transition-all drop-shadow-md">
                        Get started free <ChevronRight className="ml-1" />
                    </a>
                </div>

                {/* --- 3. App Mockup --- */}
                {/* wrapper is full screen flex center to establish 50vw/50vh origin */}
                <div 
                    ref={appWindowWrapperRef} 
                    className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 pointer-events-none"
                >
                    {/* Inner container with max-width but pointer-events enabled */}
                    <div className="w-full max-w-[1240px] pointer-events-auto">
                        <div className="w-full transform shadow-[0_50px_100px_-20px_rgba(50,50,93,0.4)] rounded-xl bg-white">
                            <AppWindow />
                        </div>
                    </div>
                </div>

                {/* --- 4. Logo Strip (Bottom) --- */}
                <div ref={logosRef} className="absolute bottom-0 left-0 right-0 z-20 opacity-0 pb-10 px-4">
                    <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 max-w-6xl mx-auto text-white/80 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 font-bold text-xl"><Box size={24} strokeWidth={2.5}/> Retool</div>
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight"><Activity size={24}/> RIPPLING</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Triangle fill="currentColor" size={20} className="mb-1"/> Vercel</div>
                        <div className="flex items-center gap-1 font-bold text-xl relative">
                           amazon
                           <Smile className="absolute -bottom-1 left-1 text-white w-full h-4 rotate-6" strokeWidth={2.5}/>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-xl tracking-wide"><BarChart2 size={24} className="rotate-90"/> INTERCOM</div>
                        <div className="flex items-center gap-2 font-light text-xl tracking-widest border border-white/40 rounded-full px-3 py-0.5 text-sm">INVISIBLE</div>
                        <div className="flex items-center gap-2 font-bold text-xl italic font-serif">klaviyo</div>
                        <div className="flex items-center gap-2 font-bold text-lg"><Globe size={24}/> mercado libre</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};