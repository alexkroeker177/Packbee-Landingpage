import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ScrollHeading } from "@/components/ScrollHeading";
import { FeatureCarouselSection } from "@/components/floating-3d-carousel/FeatureCarouselSection";
import { FeaturesCreative } from "@/components/FeaturesCreative";
import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
        <ScrollHeading />
        <FeatureCarouselSection />
        <FeaturesCreative />
        <Testimonials />
      </main>
    </div>
  );
}
