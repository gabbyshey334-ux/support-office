import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { AboutUs } from "@/components/landing/AboutUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MissionBand } from "@/components/landing/MissionBand";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <AboutUs />
        <HowItWorks />
        <MissionBand />
      </main>
      <Footer />
    </>
  );
}
