import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <StatsSection />
      <Footer />
    </main>
  );
}
