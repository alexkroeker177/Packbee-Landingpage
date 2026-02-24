import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ScrollHeading } from "@/components/ScrollHeading";
import { FeatureCarouselSection } from "@/components/floating-3d-carousel/FeatureCarouselSection";
import { FeaturesCreative } from "@/components/FeaturesCreative";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Pricing } from "@/components/Pricing";
import { Roadmap } from "@/components/Roadmap";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
        <ScrollHeading />
        <FeatureCarouselSection />
        <FeaturesCreative />
        <FeatureShowcase />
        <Pricing />
        <Roadmap />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
