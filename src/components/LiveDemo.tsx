
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LiveDemo = () => {
  const [hasTriggeredDemo, setHasTriggeredDemo] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [dmSent, setDmSent] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const triggerDemo = () => {
    if (hasTriggeredDemo) return;
    
    setHasTriggeredDemo(true);
    setCommentSubmitted(true);
    
    toast("New comment detected", {
      description: "Processing comment from @user_123",
      duration: 3000,
    });
    
    setTimeout(() => {
      setDmSent(true);
      toast("DM sent to @user_123", {
        description: "Message delivered successfully",
        duration: 3000,
      });
    }, 2000);
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative py-20 w-full overflow-hidden opacity-0 translate-y-10 transition-all duration-700 ease-out"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 glow-effect">
          See It In <span className="text-gradient">Action</span>
        </h2>
        <p className="text-lg text-center max-w-3xl mx-auto mb-16 text-gray-300">
          Click 'Test Now' to simulate a new comment and watch the DM appear in your inbox.
        </p>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 border-2 border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Comment Section */}
              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-xl">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-300">Instagram Comment</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-semibold">U</div>
                    <div className="flex-1">
                      <p className="font-medium">user_123</p>
                      <p className={`text-gray-300 ${commentSubmitted ? 'opacity-100' : 'opacity-60'}`}>
                        {commentSubmitted ? 
                          "I'm interested in your automation tool! Can you send me pricing info?" : 
                          "Type your comment here..."}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-400 gap-3">
                        <span>{commentSubmitted ? "Just now" : "Waiting for comment..."}</span>
                        {commentSubmitted && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-panel p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                  <h4 className="text-lg font-semibold mb-2 text-indigo-300">Aurora Detection System</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Keyword Detected:</span>
                      <span className={`font-mono ${commentSubmitted ? 'text-green-400' : 'text-gray-500'}`}>
                        {commentSubmitted ? '"pricing"' : 'Waiting...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Rule Matched:</span>
                      <span className={`font-mono ${commentSubmitted ? 'text-green-400' : 'text-gray-500'}`}>
                        {commentSubmitted ? 'PRICING_INFO' : 'Waiting...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Action:</span>
                      <span className={`font-mono ${commentSubmitted ? 'text-green-400' : 'text-gray-500'}`}>
                        {commentSubmitted ? 'SEND_PRICING_DM' : 'Waiting...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DM Section */}
              <div className="glass-panel p-4 rounded-xl">
                <h4 className="text-lg font-semibold mb-3 text-indigo-300">Direct Message</h4>
                <div className="flex flex-col gap-3">
                  <div className="w-full text-center text-sm text-gray-400">{dmSent ? 'Today at 12:01 PM' : 'Waiting for trigger...'}</div>
                  
                  {dmSent && (
                    <div className="ml-auto max-w-[80%] bg-primary/30 p-3 rounded-lg rounded-tr-none">
                      <p className="text-white">
                        Hi @user_123! Thanks for your interest in Aurora Nexus. Our pricing starts at $29/month for the basic plan, with premium features at $49/month. Would you like me to send you our full pricing breakdown?
                      </p>
                    </div>
                  )}
                  
                  <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${dmSent ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Message sent automatically
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button
                disabled={hasTriggeredDemo}
                onClick={triggerDemo}
                className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full transition-all duration-300"
              >
                {hasTriggeredDemo ? 'Demo Completed' : 'Test Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDemo;
