# Floating 3D Card Carousel Effect

A 3D rotating carousel of cards arranged in a circle using CSS `perspective` and `preserve-3d`, driven by Framer Motion spring physics. Cards float in 3D space and can be dragged, auto-rotate, and snap to positions. Below the carousel, the active card's text content animates in/out with a z-depth transition.

## Visual Description

- Cards are arranged in a **3D circle** (like a merry-go-round viewed from the front)
- The entire ring rotates around the Y axis
- On desktop, cards are spaced further apart; on mobile, they're tighter
- Dragging left/right spins the carousel with spring physics (inertia + snap)
- Auto-rotation advances one card every 4 seconds (pauses on hover)
- Below the carousel, the current card's name, subtitle, and quote animate in with a z-depth effect
- Navigation arrows (prev/next) sit below the text

## Dependencies

Install these packages:

```bash
pnpm add framer-motion clsx tailwind-merge
# next and react should already be in your Next.js project
```

**Required versions:**
- `framer-motion` >= 11.0 (uses `useMotionValue`, `useSpring`, `useTransform`, `useTime`, `useMotionValueEvent`)
- `next` >= 14 (App Router, `next/image`)
- `react` >= 18

## File Structure

Create these files in your project:

```
src/
  lib/
    utils.ts                          # cn() utility
  hooks/
    useMediaQuery.tsx                  # Responsive breakpoint hook
    useInterval.tsx                    # setInterval hook
  components/
    floating-3d-carousel/
      types.ts                        # CarouselPerson type
      CardCarousel.tsx                 # Main carousel component (client component)
      FloatingCardCarouselSection.tsx  # Section wrapper with heading
```

## Step 1: Utility — `src/lib/utils.ts`

If you don't already have a `cn()` utility:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

## Step 2: Hook — `src/hooks/useMediaQuery.tsx`

```tsx
import { useEffect, useState } from 'react';

export type ScreenSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizes: Record<ScreenSize, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

export const useMediaQuery = (screen: ScreenSize) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const query = `(min-width: ${sizes[screen]})`;
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, screen]);

    return matches;
};
```

## Step 3: Hook — `src/hooks/useInterval.tsx`

```tsx
import { useRef, useEffect } from 'react';

export function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        function tick() {
            savedCallback.current!();
        }
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}
```

## Step 4: Types — `src/components/floating-3d-carousel/types.ts`

```ts
import { StaticImageData } from 'next/image';

export type CarouselPerson = {
    src: StaticImageData | string;
    alt?: string;
    name: string;
    subtitle: string;
    quote: string;
};
```

## Step 5: Main Component — `src/components/floating-3d-carousel/CardCarousel.tsx`

This is the core of the effect. It's a **client component**.

```tsx
'use client';

import { cn } from '@/lib/utils';
import {
    AnimatePresence,
    motion,
    MotionValue,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useTime,
    useTransform,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CarouselPerson } from './types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInterval } from '@/hooks/useInterval';

// ─── Constants ────────────────────────────────────────────
const LOOP_DURATION = 30;
const CAROUSEL_AUTO_TURN_DELAY = 4000; // ms before auto-advance starts after interaction
const CAROUSEL_AUTO_TURN_RATE = 4000;  // ms between each auto-advance

// ─── Helper ───────────────────────────────────────────────
// Modulo that works with negative numbers (always returns positive)
function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

// ─── Card Text (animates below the carousel) ─────────────
function CarouselCardText({ card: { name, subtitle, quote } }: { card: CarouselPerson }) {
    return (
        <motion.div
            variants={{
                hide: { z: -500, opacity: 0 },
                show: { z: 0, y: 0, opacity: 1 },
                exit: { z: -1000, opacity: 0 },
            }}
            transition={{ ease: 'easeInOut', duration: 0.5 }}
            initial="hide"
            animate="show"
            exit="exit"
            className="absolute top-0 space-y-2"
        >
            <div className="space-y-2 font-bold">
                <div className="text-lg md:text-xl">{name}</div>
                <div className="text-xs md:text-sm">{subtitle}</div>
            </div>
            <div className="italic">&ldquo;{quote}&rdquo;</div>
        </motion.div>
    );
}

// ─── Navigation Controls ──────────────────────────────────
function CarouselControls({ onChange }: { onChange: (direction: number) => void }) {
    return (
        <div className="relative z-10 flex w-full justify-center gap-3">
            <button
                aria-label="Previous"
                onClick={() => onChange(1)}
                className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-stone-100 to-orange-200 text-sm font-bold"
            >
                &#8249;
            </button>
            <button
                aria-label="Next"
                onClick={() => onChange(-1)}
                className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-stone-100 to-orange-200 text-sm font-bold"
            >
                &#8250;
            </button>
        </div>
    );
}

// ─── Main Carousel ────────────────────────────────────────
export function CardCarousel({ cards }: { cards: CarouselPerson[] }) {
    const [isPaused, setIsPaused] = useState(false);
    const count = cards.length;

    // scroll: the raw target value (in "turns" — 1.0 = full rotation)
    // spring: smoothed version of scroll with physics
    const scroll = useMotionValue(0);
    const spring = useSpring(scroll, {
        damping: 20,
        stiffness: 80,
        mass: 1,
        restSpeed: 0.001,
        restDelta: 0.001,
    });
    const current = useTransform(spring, (v) => v);
    // Convert scroll position to degrees
    const rotation = useTransform(current, (v) => 360 * v);

    const [mouseDown, setMouseDown] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    let lastCardChange = 0;

    const time = useTime();

    useEffect(() => {
        lastCardChange = time.get();
    }, [isPaused, mouseDown]);

    // Auto-advance: every CAROUSEL_AUTO_TURN_RATE ms, if not paused/dragging
    // and enough time has passed since last interaction
    useInterval(() => {
        if (
            !isPaused &&
            !mouseDown &&
            time.get() - lastCardChange > CAROUSEL_AUTO_TURN_DELAY
        )
            changeCard(-1);
    }, CAROUSEL_AUTO_TURN_RATE);

    // Track which card is "current" based on scroll position
    useMotionValueEvent(current, 'change', (v) => {
        const newIndex = mod(count - Math.round(v * count), count);
        setCurrentCardIndex(newIndex);
    });

    const desktop = useMediaQuery('md');
    // How far the carousel ring is pushed "into" the screen
    // Desktop: closer (less extreme perspective), Mobile: further back
    const carouselZ = desktop ? -500 : -1500;
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
                className="relative mb-2 h-96 min-h-96 w-full grow cursor-grab touch-none md:mb-16 md:mt-20 md:h-[50vh]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                    // perspective: how "deep" the 3D effect is.
                    // Higher = less extreme perspective distortion.
                    perspective: 3000,
                    WebkitBackfaceVisibility: 'visible',
                }}
                onPan={(event, info) => {
                    // Dragging rotates the carousel
                    scroll.set(scroll.get() + (info.delta.x * dragSpeed) / 1000);
                    setMouseDown(true);
                }}
                onPanEnd={(_, info) => {
                    // Snap to nearest card when drag ends
                    const dir =
                        info.delta.x > 0
                            ? Math.ceil(spring.get() * count)
                            : Math.floor(spring.get() * count);
                    scroll.set(dir / count);
                    setMouseDown(false);
                }}
            >
                {/* Rotating ring that holds all cards */}
                <motion.div
                    className={cn(
                        'absolute flex h-full w-full flex-wrap items-center justify-center',
                        mouseDown && 'cursor-grabbing'
                    )}
                    style={{
                        // CRITICAL: preserve-3d lets children exist in 3D space
                        transformStyle: 'preserve-3d',
                        // Push the ring back so the circle is visible
                        translateZ: carouselZ,
                        // Rotate the entire ring
                        rotateY: rotation,
                    }}
                    transition={{
                        repeat: Infinity,
                        ease: 'easeOut',
                        duration: LOOP_DURATION,
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
                    className="relative z-0 flex h-64 flex-col items-center justify-center md:h-56"
                    style={{ perspective: 100, perspectiveOrigin: '50% 0%' }}
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
                        lastCardChange = time.get();
                    }}
                />
            </div>
        </div>
    );
}

// ─── Individual Card ──────────────────────────────────────
export function CarouselCard({
    className,
    i,
    time,
    length,
    card: { src, alt, name },
}: {
    className?: string;
    i: number;
    time: MotionValue;
    length: number;
    card: CarouselPerson;
}) {
    const progress = i / length;
    // Each card gets its own fixed rotation around the Y axis
    const rotation = 360 * progress;
    const desktop = useMediaQuery('md');

    // Gap between cards in the ring
    const cardDistance = desktop ? 75 : 25;

    // ─── THE KEY MATH ──────────────────────────────────────
    // This calculates how far each card should be pushed OUT from the center
    // (along the Z axis) to form a circle.
    //
    // Formula: tz = (cardWidth + gap) / 2 / tan(PI / numberOfSides)
    //
    // - 384 is the approximate card width in px (aspect-[371/446] → ~371px)
    // - cardDistance adds spacing between cards
    // - We divide by 2 because we measure from center to edge
    // - tan(PI/9) because 9 ≈ half the polygon sides for 8 cards
    //   (using 9 instead of count/2 gives slightly more spacing)
    //
    // For 8 cards with 75px gap: tz ≈ 658px
    // For 8 cards with 25px gap: tz ≈ 586px
    const tz = Math.round((384 + cardDistance) / 2 / Math.tan(Math.PI / 9));

    return (
        <motion.div
            className={cn(
                'absolute flex aspect-[371/446] w-[371px] select-none items-center justify-center overflow-hidden rounded-lg text-lg',
                className
            )}
            transition={{
                duration: LOOP_DURATION,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            style={{
                // Push this card OUT from center by tz pixels
                z: tz,
                // Set the transform origin to the center of the ring
                // so when the parent rotates, this card orbits correctly
                originZ: -tz,
                originY: 0,
                // Each card is pre-rotated to its position in the circle
                rotateY: rotation,
                transformStyle: 'preserve-3d',
            }}
        >
            <Image
                src={src}
                alt={alt ?? name}
                fill
                className="select-none object-cover"
                draggable={false}
                loading="eager"
                priority
                sizes="(max-width: 768px) 70vw, (max-width: 1024px) 50vw, 33vw"
            />
        </motion.div>
    );
}
```

## Step 6: Section Wrapper — `src/components/floating-3d-carousel/FloatingCardCarouselSection.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { CardCarousel } from './CardCarousel';
import { CarouselPerson } from './types';

// ─── DUMMY DATA ───────────────────────────────────────────
// Replace these with your actual data. Using picsum for placeholder images.
const dummyCards: CarouselPerson[] = [
    {
        src: 'https://picsum.photos/seed/person1/371/446',
        alt: 'Sarah Mitchell',
        name: 'Sarah Mitchell',
        subtitle: 'Performance Coach',
        quote:
            'This product has completely transformed my daily routine. The results speak for themselves — I feel more energised and focused than ever.',
    },
    {
        src: 'https://picsum.photos/seed/person2/371/446',
        alt: 'James Cooper',
        name: 'James Cooper',
        subtitle: 'Professional Athlete',
        quote:
            'Recovery has always been a challenge for me. Since incorporating this into my regimen, I have noticed a significant improvement in how quickly I bounce back.',
    },
    {
        src: 'https://picsum.photos/seed/person3/371/446',
        alt: 'Dr. Emma Chen',
        name: 'Dr. Emma Chen',
        subtitle: 'Sports Nutritionist',
        quote:
            'From a nutritional standpoint, the formulation is excellent. High-quality ingredients with proper bioavailability — exactly what I recommend to my clients.',
    },
    {
        src: 'https://picsum.photos/seed/person4/371/446',
        alt: 'Marcus Williams',
        name: 'Marcus Williams',
        subtitle: 'Fitness Instructor',
        quote:
            'My clients have been asking what changed in my routine. The answer is simple — better supplementation leads to better performance.',
    },
    {
        src: 'https://picsum.photos/seed/person5/371/446',
        alt: 'Olivia Grant',
        name: 'Olivia Grant',
        subtitle: 'Yoga & Wellness Expert',
        quote:
            'I am very particular about what I put in my body. The transparency in ingredients and the noticeable difference in my energy levels won me over.',
    },
    {
        src: 'https://picsum.photos/seed/person6/371/446',
        alt: 'Tom Richardson',
        name: 'Tom Richardson',
        subtitle: 'Endurance Runner',
        quote:
            'Long-distance running demands a lot from the body. Having the right support makes all the difference — and I have genuinely felt that difference.',
    },
    {
        src: 'https://picsum.photos/seed/person7/371/446',
        alt: 'Nina Petrova',
        name: 'Nina Petrova',
        subtitle: 'Dance Choreographer',
        quote:
            'Staying sharp mentally and physically is non-negotiable in my profession. This has become an essential part of my daily preparation.',
    },
    {
        src: 'https://picsum.photos/seed/person8/371/446',
        alt: 'David Okafor',
        name: 'David Okafor',
        subtitle: 'Strength & Conditioning Coach',
        quote:
            'I have tried countless supplements over the years. Very few deliver on their promises — this one genuinely does.',
    },
];

export function FloatingCardCarouselSection() {
    return (
        <section className="relative flex w-full flex-col items-center justify-center pt-[45px] max-sm:gap-12 lg:pt-[90px]">
            <header className="flex flex-col items-center justify-center gap-1 text-center md:gap-4">
                <h2>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            ease: 'easeOut',
                            duration: 0.8,
                            delay: 0.2,
                        }}
                        viewport={{ once: true }}
                    >
                        Trusted <b>by Experts</b>
                    </motion.div>
                </h2>
                <p className="text-base md:text-lg">
                    Proven results by industry professionals
                </p>
            </header>
            <CardCarousel cards={dummyCards} />
        </section>
    );
}
```

## Step 7: Usage

In any page (e.g. `src/app/page.tsx`):

```tsx
import { FloatingCardCarouselSection } from '@/components/floating-3d-carousel/FloatingCardCarouselSection';

export default function HomePage() {
    return (
        <main>
            {/* ... other sections ... */}
            <FloatingCardCarouselSection />
            {/* ... other sections ... */}
        </main>
    );
}
```

## How the 3D Effect Works (Technical Explanation)

### The Core Concept

The carousel uses **CSS 3D transforms** (via Framer Motion's `style` prop) to arrange cards in a circle in 3D space. Here's the mental model:

1. **Perspective container** (`perspective: 3000`): Creates the 3D viewing context. The value controls how "deep" the 3D effect looks. Lower = more extreme foreshortening. `3000` gives a subtle, elegant depth.

2. **Rotating ring** (`transformStyle: 'preserve-3d'`, `rotateY`): A container that holds all cards and rotates around the Y-axis. It's pushed back into the screen with `translateZ: -500` (desktop) or `translateZ: -1500` (mobile) so the circular arrangement is visible.

3. **Individual cards** (each with `rotateY` and `z`): Each card is:
   - Pre-rotated to its position in the circle: `rotateY: (i / count) * 360`
   - Pushed outward from center: `z: tz` (the radius of the circle)
   - Given a transform origin at the ring center: `originZ: -tz`

### The Circle Radius Formula

```
tz = (cardWidth + gap) / 2 / tan(PI / polygonSides)
```

This is the **apothem formula** for a regular polygon. It calculates the distance from center to the middle of each side, which is exactly how far each card needs to be pushed outward to form a circle.

- `cardWidth` = 371px (from `w-[371px]`)
- `gap` = 75px (desktop) or 25px (mobile)
- `polygonSides` = 9 (used instead of `count/2` for aesthetic spacing)

### Spring Physics

The scroll position uses `useSpring` with:
- `damping: 20` — moderate resistance (not too bouncy, not too stiff)
- `stiffness: 80` — moderate spring force
- `mass: 1` — standard weight

This gives the carousel a satisfying "flick and settle" feel when dragged.

### Drag Interaction

- `onPan`: Translates horizontal drag distance into scroll rotation (`delta.x / 1000`)
- `onPanEnd`: Snaps to the nearest card by rounding to the nearest `1/count` increment
- `dragSpeed`: Reduced on mobile (0.7x) to compensate for the tighter card arrangement

### Auto-Rotation

- Advances one card every 4 seconds (`CAROUSEL_AUTO_TURN_RATE`)
- Pauses on mouse hover (`onMouseEnter/Leave`)
- Pauses during drag
- Resumes after a 4-second delay (`CAROUSEL_AUTO_TURN_DELAY`) after last interaction

### Text Animation

The text below the carousel uses Framer Motion's `AnimatePresence` with z-axis transforms:
- **Enter**: slides from `z: -500` to `z: 0` (approaches the viewer)
- **Exit**: slides to `z: -1000` (recedes away)
- This creates a subtle depth effect matching the 3D carousel theme

## Customization Guide

### Change number of cards

Just add or remove items from the `dummyCards` array. The carousel adjusts automatically — the radius formula and rotation angles adapt to any count.

### Change card size

Modify the `w-[371px]` and `aspect-[371/446]` classes on the card element in `CarouselCard`. Then update the `384` value in the radius formula to match your new width.

### Change perspective intensity

- `perspective: 3000` on the outer container — lower = more dramatic 3D, higher = flatter
- `translateZ: -500/-1500` on the ring — controls how far back the ring sits

### Change spring feel

Adjust the `useSpring` config:
- Higher `damping` = settles faster, less bounce
- Higher `stiffness` = snappier response
- Higher `mass` = heavier feel, more momentum

### Change auto-rotation speed

- `CAROUSEL_AUTO_TURN_RATE` — ms between advances
- `CAROUSEL_AUTO_TURN_DELAY` — ms of inactivity before auto-rotation resumes

### Using static images instead of URLs

Import images and use them as `src`:

```tsx
import person1 from '@/assets/people/person1.jpg';

const cards: CarouselPerson[] = [
    {
        src: person1,
        name: 'Sarah Mitchell',
        // ...
    },
];
```

The `CarouselPerson` type accepts both `StaticImageData` (from imports) and `string` (URLs).

## Next.js Image Configuration

If using external image URLs (like picsum), add the domain to `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
        ],
    },
};

module.exports = nextConfig;
```

## Tailwind CSS Notes

The component uses standard Tailwind classes. No custom Tailwind configuration is needed beyond the defaults. The gradient on the navigation buttons (`bg-gradient-to-br from-amber-200 via-stone-100 to-orange-200`) can be changed to match your brand colors.

If your project uses a custom `h2` style, the heading will inherit it. Otherwise, style the `<h2>` element as needed.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Cards render flat (no 3D) | Missing `preserve-3d` | Ensure `transformStyle: 'preserve-3d'` is on both the ring container AND individual cards |
| Cards all stacked in center | `z` / `translateZ` not working | Framer Motion requires `z` (not `translateZ`) on individual cards. The ring container uses `translateZ`. |
| Carousel invisible | Ring pushed too far back | Reduce the absolute value of `carouselZ` (e.g., -300 instead of -500) |
| Dragging feels wrong | Wrong drag speed | Adjust `dragSpeed` multiplier or the `/1000` divisor |
| Auto-rotation too fast/slow | Timer constants | Adjust `CAROUSEL_AUTO_TURN_RATE` |
| Images not loading | External URL not configured | Add domain to `next.config.js` `images.remotePatterns` |
| Hydration mismatch | `useMediaQuery` returns false on server | This is expected — the hook initializes to `false` and updates on mount. The brief flash is normal with SSR. |
