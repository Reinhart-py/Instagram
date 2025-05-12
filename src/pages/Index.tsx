
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import LiveDemo from '@/components/LiveDemo';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import CommandOrb from '@/components/CommandOrb';

const Index = () => {
  // Update the document title
  useEffect(() => {
    document.title = "Aurora Nexus | Instagram Automation";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <AboutSection />
      <LiveDemo />
      <FeaturesSection />
      <PricingSection />
      <Footer />
      <CommandOrb />
    </div>
  );
};

export default Index;
