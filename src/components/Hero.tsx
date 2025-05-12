
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import OrbCanvas from './OrbCanvas';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const opacity = 1 - Math.min(1, scrollY / 500);
        
        heroRef.current.style.opacity = opacity.toString();
        heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden pt-20 md:pt-0">
      {/* Orbital animations */}
      <div className="absolute inset-0 -z-10">
        <div className="orbit-container h-full w-full">
          <div className="orbit w-[500px] h-[500px] animation-delay-0" style={{animationDuration: '20s'}}>
            <div className="planet"></div>
          </div>
          <div className="orbit w-[700px] h-[700px] animation-delay-200" style={{animationDuration: '25s'}}>
            <div className="planet"></div>
          </div>
          <div className="orbit w-[900px] h-[900px] animation-delay-400" style={{animationDuration: '30s'}}>
            <div className="planet"></div>
          </div>
        </div>
      </div>
      
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-hero-glow -z-10"></div>
      
      {/* Content */}
      <div 
        ref={heroRef}
        className="container flex flex-col items-center justify-center h-full px-4 md:px-6 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4 md:mb-6 glow-effect">
          Welcome to <span className="text-gradient">Aurora</span>
        </h1>
        <p className="text-xl md:text-2xl text-center max-w-3xl mb-8 text-gray-300">
          Where cutting-edge automation meets heavenly design.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button className="bg-primary hover:bg-primary/80 text-white px-8 py-6 text-lg rounded-full transition-all duration-500 group relative overflow-hidden">
            Get Started
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white opacity-50 rounded-full group-hover:w-32 group-hover:h-32 start-full top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" className="bg-transparent border border-primary/50 text-white hover:border-primary hover:bg-primary/20 px-8 py-6 text-lg rounded-full">
            Watch Demo
          </Button>
        </div>
        
        <div className="w-full max-w-2xl mx-auto h-40 md:h-60 relative">
          <OrbCanvas />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <p className="text-gray-400 mb-2 text-sm">Scroll to explore</p>
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
