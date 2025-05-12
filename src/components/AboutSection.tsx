
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });
    
    elementsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });
    
    return () => {
      elementsRef.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative py-20 w-full overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div 
          ref={el => elementsRef.current[0] = el}
          className="opacity-0 translate-y-10 transition-all duration-700 ease-out delay-200"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 glow-effect">
            Automate Instagram DMs <span className="text-gradient">Like Never Before</span>
          </h2>
          <p className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-16 text-gray-300">
            Aurora Nexus syncs with your IG account and delivers a floating mod-menu–style dashboard right on our site. Set keywords once, and let the cosmos handle the rest.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div 
            ref={el => elementsRef.current[1] = el}
            className="opacity-0 translate-y-10 transition-all duration-700 ease-out delay-300"
          >
            <div className="glass-panel p-6 rounded-2xl relative border-2 border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"></div>
              <h3 className="text-2xl font-semibold mb-4 relative z-10">Smart Keyword Detection</h3>
              <p className="text-gray-300 mb-6 relative z-10">
                Our AI instantly recognizes comments containing your specified keywords and triggers automated responses to turn commenters into direct conversations.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-400">Active monitoring</p>
              </div>
            </div>
          </div>
          
          <div
            ref={el => elementsRef.current[2] = el}
            className="opacity-0 translate-y-10 transition-all duration-700 ease-out delay-400"
          >
            <div className="relative h-72 glass-panel rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col p-6">
                <h3 className="text-xl font-semibold mb-2">Live Comment Feed</h3>
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none">
                  {[
                    { user: "stellar_fan", comment: "This looks amazing! Can I get more info?", time: "2m" },
                    { user: "digital_nomad", comment: "Do you offer custom automation?", time: "5m" },
                    { user: "tech_maven", comment: "What's the pricing like?", time: "8m" },
                    { user: "curious_mind", comment: "Love the design! When does it launch?", time: "12m" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-white/5 p-2 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-semibold">
                        {item.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-semibold">{item.user}</p>
                        <p className="text-gray-300">{item.comment}</p>
                      </div>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          ref={el => elementsRef.current[3] = el}
          className="mt-16 flex justify-center opacity-0 translate-y-10 transition-all duration-700 ease-out delay-500"
        >
          <Button className="bg-primary hover:bg-primary/80 text-white px-8 py-6 text-lg rounded-full transition-all duration-500">
            Discover All Features
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
