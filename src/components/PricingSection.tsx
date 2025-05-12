
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }, index * 150);
        }
      });
    }, { threshold: 0.1 });
    
    cardsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });
    
    return () => {
      cardsRef.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);
  
  const plans = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for personal accounts and beginners",
      features: [
        "Monitor up to 2 accounts",
        "20 keyword triggers",
        "Basic response templates",
        "Simple analytics dashboard",
        "Email support"
      ],
      highlighted: false,
      color: "from-blue-500/20 to-indigo-700/20"
    },
    {
      name: "Professional",
      price: 49,
      description: "For growing creators and small businesses",
      features: [
        "Monitor up to 5 accounts",
        "Unlimited keyword triggers",
        "Advanced response templates",
        "Full analytics dashboard",
        "Priority email and chat support",
        "A/B testing for messages"
      ],
      highlighted: true,
      color: "from-violet-500/20 to-purple-700/20"
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For agencies and large-scale influencers",
      features: [
        "Unlimited account monitoring",
        "Custom AI response workflows",
        "Full API access",
        "Advanced analytics and reporting",
        "Dedicated account manager",
        "White-label option",
        "Custom integrations"
      ],
      highlighted: false,
      color: "from-fuchsia-500/20 to-pink-700/20"
    }
  ];

  return (
    <div ref={sectionRef} className="relative py-20 w-full overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 glow-effect">
          Choose Your <span className="text-gradient">Plan</span>
        </h2>
        <p className="text-lg text-center max-w-3xl mx-auto mb-16 text-gray-300">
          Find the perfect Aurora Nexus package that fits your automation needs.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              ref={el => cardsRef.current[idx] = el}
              className={cn(
                "glass-panel rounded-2xl p-6 border-2 w-full max-w-sm opacity-0 translate-y-10 transition-all duration-700 ease-out",
                plan.highlighted 
                  ? "border-primary/30 glow-border" 
                  : "border-white/5",
                selectedPlan === plan.name 
                  ? "border-primary glow-border" 
                  : ""
              )}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50", plan.color)}></div>
              
              <div className="relative z-10">
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-sm font-semibold py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                
                <p className="text-gray-300 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => setSelectedPlan(plan.name)}
                  className={cn(
                    "w-full transition-all duration-300 group relative overflow-hidden",
                    plan.highlighted || selectedPlan === plan.name
                      ? "bg-primary hover:bg-primary/80 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  <span className="relative z-10">
                    {selectedPlan === plan.name ? "Selected" : "Choose Plan"}
                  </span>
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white opacity-20 rounded-full group-hover:w-32 group-hover:h-32 start-full top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Need a custom solution?</p>
          <Button variant="outline" className="bg-transparent border border-primary/50 text-white hover:border-primary hover:bg-primary/20">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
