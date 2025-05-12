
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CommandOrb = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/80 shadow-lg transition-all duration-300 group relative overflow-hidden"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Command Menu</span>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <div className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-primary"></div>
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white opacity-20 rounded-full group-hover:w-32 group-hover:h-32 start-full top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 glass-panel border border-white/10">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gradient">Quick Actions</h4>
            <div className="space-y-2">
              {[
                { label: "Setup New Automation", icon: "🚀" },
                { label: "View Active Triggers", icon: "⚡" },
                { label: "Manage DM Templates", icon: "✉️" },
                { label: "View Analytics", icon: "📊" },
              ].map((item, idx) => (
                <Button 
                  key={idx}
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10 text-left"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="pt-2 border-t border-white/10">
              <Button variant="outline" className="w-full bg-transparent border-white/20" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommandOrb;
