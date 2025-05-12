
import React, { useRef, useEffect } from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }, index * 100);
        }
      });
    }, { threshold: 0.1 });
    
    featuresRef.current.forEach(el => {
      if (el) observer.observe(el);
    });
    
    return () => {
      featuresRef.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const features = [
    {
      title: "Keyword-Watch",
      description: "Set up triggers for specific words or phrases in comments",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      bgClass: "bg-gradient-to-br from-purple-900/30 to-purple-700/10",
      details: "Our advanced AI monitors your Instagram comments 24/7 and identifies keywords you've specified. Set up complex conditions with multiple trigger words and exclusions."
    },
    {
      title: "Preset DM Library",
      description: "Create a collection of ready-to-send messages for different scenarios",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      bgClass: "bg-gradient-to-br from-indigo-900/30 to-indigo-700/10",
      details: "Build a versatile library of message templates with personalization variables. Aurora automatically inserts the user's name and other context-specific information in each outgoing DM."
    },
    {
      title: "Scheduled Follow-Ups",
      description: "Automatically send timed follow-up messages to maintain engagement",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgClass: "bg-gradient-to-br from-blue-900/30 to-blue-700/10",
      details: "Set up automated follow-up sequences that trigger based on user responses or time delays. Keep the conversation flowing even when you're not available to respond manually."
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance metrics and engagement statistics",
      icon: (
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgClass: "bg-gradient-to-br from-violet-900/30 to-violet-700/10",
      details: "Monitor all your automated interactions with detailed charts and reports. See open rates, response times, conversion metrics, and identify your most effective message sequences."
    }
  ];

  return (
    <div ref={sectionRef} className="relative py-20 w-full overflow-hidden bg-gradient-to-b from-background to-gray-900/30">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 glow-effect">
          Feature-Rich <span className="text-gradient">Experience</span>
        </h2>
        <p className="text-lg text-center max-w-3xl mx-auto mb-16 text-gray-300">
          Our 3D-rotatable feature cards showcase the power of Aurora Nexus. Click each card to see more details.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              ref={el => featuresRef.current[idx] = el}
              className="opacity-0 translate-y-10 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
