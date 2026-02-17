"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTime,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CarouselFeature } from "./types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useInterval } from "@/hooks/useInterval";

// ─── Constants ────────────────────────────────────────────
const CAROUSEL_AUTO_TURN_DELAY = 4000;
const CAROUSEL_AUTO_TURN_RATE = 4000;

// ─── Helper ───────────────────────────────────────────────
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

// ─── Card Text (animates below the carousel) ─────────────
function CarouselCardText({
  card: { title, subtitle, description },
}: {
  card: CarouselFeature;
}) {
  return (
    <motion.div
      variants={{
        hide: { z: -500, opacity: 0 },
        show: { z: 0, y: 0, opacity: 1 },
        exit: { z: -1000, opacity: 0 },
      }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
      initial="hide"
      animate="show"
      exit="exit"
      className="absolute top-0 space-y-2"
    >
      <div className="space-y-1">
        <div className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
          {title}
        </div>
        <div className="text-sm md:text-base font-semibold text-purple-500">
          {subtitle}
        </div>
      </div>
      <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
        {description}
      </p>
    </motion.div>
  );
}

// ─── Navigation Controls ──────────────────────────────────
function CarouselControls({
  onChange,
}: {
  onChange: (direction: number) => void;
}) {
  return (
    <div className="relative z-10 flex w-full justify-center gap-3">
      <button
        aria-label="Previous"
        onClick={() => onChange(1)}
        className="flex size-10 items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white text-lg font-bold transition-colors shadow-md"
      >
        &#8249;
      </button>
      <button
        aria-label="Next"
        onClick={() => onChange(-1)}
        className="flex size-10 items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white text-lg font-bold transition-colors shadow-md"
      >
        &#8250;
      </button>
    </div>
  );
}

// ─── Main Carousel ────────────────────────────────────────
export function CardCarousel({ cards }: { cards: CarouselFeature[] }) {
  const [isPaused, setIsPaused] = useState(false);
  const count = cards.length;

  const scroll = useMotionValue(0);
  const spring = useSpring(scroll, {
    damping: 20,
    stiffness: 80,
    mass: 1,
    restSpeed: 0.001,
    restDelta: 0.001,
  });
  const current = useTransform(spring, (v) => v);
  const rotation = useTransform(current, (v) => 360 * v);

  const [mouseDown, setMouseDown] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const lastCardChangeRef = useRef<number>(0);

  const time = useTime();

  useEffect(() => {
    lastCardChangeRef.current = time.get();
  }, [isPaused, mouseDown, time]);

  useInterval(() => {
    if (
      !isPaused &&
      !mouseDown &&
      time.get() - lastCardChangeRef.current > CAROUSEL_AUTO_TURN_DELAY
    )
      changeCard(-1);
  }, CAROUSEL_AUTO_TURN_RATE);

  useMotionValueEvent(current, "change", (v) => {
    const newIndex = mod(count - Math.round(v * count), count);
    setCurrentCardIndex(newIndex);
  });

  const desktop = useMediaQuery("md");
  const carouselZ = desktop ? -350 : -800;
  const dragSpeed = desktop ? 1 : 0.7;

  const changeCard = (direction: number) => {
    const currentIndex = Math.round(scroll.get() * count);
    const targetIndex = currentIndex + direction;
    const scrollDifference = (targetIndex - currentIndex) / count;
    scroll.set(scroll.get() + scrollDifference);
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      {/* 3D Carousel Area */}
      <motion.div
        className="relative mb-2 h-72 min-h-72 w-full grow cursor-grab touch-none md:mb-16 md:mt-16 md:h-[45vh]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          perspective: 2500,
          WebkitBackfaceVisibility: "visible",
        }}
        onPan={(_, info) => {
          scroll.set(scroll.get() + (info.delta.x * dragSpeed) / 1000);
          setMouseDown(true);
        }}
        onPanEnd={(_, info) => {
          const dir =
            info.delta.x > 0
              ? Math.ceil(spring.get() * count)
              : Math.floor(spring.get() * count);
          scroll.set(dir / count);
          setMouseDown(false);
        }}
      >
        {/* Rotating ring */}
        <motion.div
          className={cn(
            "absolute flex h-full w-full flex-wrap items-center justify-center",
            mouseDown && "cursor-grabbing"
          )}
          style={{
            transformStyle: "preserve-3d",
            translateZ: carouselZ,
            rotateY: rotation,
          }}
        >
          {cards.map((c, i) => (
            <CarouselCard
              key={`carousel-card-${i}`}
              i={i}
              time={current}
              length={count}
              card={c}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Text + Controls below carousel */}
      <div className="w-full max-w-[28rem] px-3 text-center md:space-y-4">
        <div
          className="relative z-0 flex h-40 flex-col items-center justify-center md:h-36"
          style={{ perspective: 100, perspectiveOrigin: "50% 0%" }}
        >
          <AnimatePresence mode="sync">
            <CarouselCardText
              card={cards[currentCardIndex]}
              key={currentCardIndex}
            />
          </AnimatePresence>
        </div>
        <CarouselControls
          onChange={(d) => {
            changeCard(d);
            lastCardChangeRef.current = time.get();
          }}
        />
      </div>
    </div>
  );
}

// ─── Individual Card ──────────────────────────────────────
function CarouselCard({
  className,
  i,
  length,
  card: { src, alt },
}: {
  className?: string;
  i: number;
  time: MotionValue;
  length: number;
  card: CarouselFeature;
}) {
  const progress = i / length;
  const rotation = 360 * progress;
  const desktop = useMediaQuery("md");

  const cardGap = desktop ? 80 : 30;
  const cardWidth = desktop ? 480 : 320;

  // Apothem formula for regular polygon: radius = (side + gap) / 2 / tan(PI / sides)
  // Using count as polygon sides (5 cards = pentagon)
  const tz = Math.round((cardWidth + cardGap) / 2 / Math.tan(Math.PI / length));

  return (
    <motion.div
      className={cn(
        "absolute select-none overflow-hidden rounded-2xl border border-white/20 shadow-xl",
        desktop ? "w-[480px] aspect-[8/5]" : "w-[320px] aspect-[8/5]",
        className
      )}
      style={{
        z: tz,
        originZ: -tz,
        originY: 0,
        rotateY: rotation,
        transformStyle: "preserve-3d",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="select-none object-cover"
        draggable={false}
        loading="eager"
        priority
        sizes="(max-width: 768px) 320px, 480px"
      />
    </motion.div>
  );
}
