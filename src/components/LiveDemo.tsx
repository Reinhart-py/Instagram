
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Send, UserCheck, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LiveDemo = () => {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const isLoggedIn = false; // Replace with actual auth check when implemented
  
  const simulateComment = async () => {
    if (!comment.trim() || !username.trim()) {
      toast.error("Please enter both a username and comment");
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if user is logged in for admin access
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session) {
        // If logged in, simulate through backend
        // This would normally call your backend function
        toast.success(`Comment simulation: @${username} said "${comment}"`);
        setTimeout(() => {
          if (comment.toLowerCase().includes('help')) {
            toast.success(`DM sent to @${username}!`);
          }
        }, 1500);
        
      } else {
        // If not logged in, just show UI simulation
        toast.info("Sign in for full functionality");
        toast.success(`Demo mode: @${username} said "${comment}"`);
        
        if (comment.toLowerCase().includes('help')) {
          setTimeout(() => {
            toast.success(`Demo: DM would be sent to @${username}`);
          }, 1500);
        } else {
          setTimeout(() => {
            toast.info(`Demo: No keyword match found in comment`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section id="demo" className="py-16 relative">
      <div className="absolute inset-0 bg-hero-glow opacity-40 pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Try our Instagram comment-to-DM automation with this interactive demo. When someone comments with the keyword "help", they'll instantly receive your preset DM.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="demo" className="w-full">
            <div className="flex justify-center mb-4">
              <TabsList>
                <TabsTrigger value="demo" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comment Demo
                </TabsTrigger>
                <TabsTrigger value="flow" className="gap-2">
                  <Send className="h-4 w-4" />
                  How It Works
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Comment Simulation Tab */}
            <TabsContent value="demo">
              <Card className="border border-border/50 shadow-lg bg-background/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1.5">
                        <label htmlFor="username" className="text-sm font-medium">
                          Instagram Username
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-50">
                            @
                          </span>
                          <Input
                            id="username"
                            className="pl-6"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label htmlFor="comment" className="text-sm font-medium">
                          Comment (try including "help")
                        </label>
                        <Input
                          id="comment"
                          placeholder="I need help with this!"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <Button
                        onClick={simulateComment}
                        disabled={loading}
                        className="w-full md:w-auto"
                      >
                        {loading ? "Processing..." : "Simulate Comment"}
                      </Button>
                      
                      <p className="text-sm text-muted-foreground">
                        This demo shows how comments with the keyword "help" trigger automatic DMs.
                      </p>
                    </div>
                    
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleGetStarted}
                        size="lg"
                        className="gap-2"
                      >
                        <UserCheck className="h-5 w-5" />
                        Access Full Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Flow Animation Tab */}
            <TabsContent value="flow" className="relative overflow-hidden">
              <Card className="border border-border/50 shadow-lg bg-background/60 backdrop-blur-sm">
                <CardContent className="pt-6 pb-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Step 1 */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <span className="font-bold text-primary">1</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Comment Detection</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Our system monitors your chosen Instagram post for new comments every 5 minutes.
                      </p>
                      <div className="glass-panel p-4 rounded-lg w-full">
                        <MessageSquare className="h-6 w-6 text-primary mb-2 mx-auto" />
                        <p className="text-xs">
                          "I really need help with this product!"
                        </p>
                      </div>
                    </div>
                    
                    {/* Arrow 1 */}
                    <div className="hidden lg:flex items-center justify-center">
                      <svg width="40" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <span className="font-bold text-primary">2</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Keyword Matching</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        System checks if comment contains your specified keyword trigger (e.g., "help").
                      </p>
                      <div className="glass-panel p-4 rounded-lg w-full">
                        <div className="text-xs">
                          <span className="text-xs opacity-60">Matching for: </span>
                          <span className="font-mono bg-primary/20 p-1 rounded text-primary">help</span>
                          <div className="mt-2 font-mono text-green-400">✓ Match found!</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow 2 */}
                    <div className="hidden lg:flex items-center justify-center">
                      <svg width="40" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <span className="font-bold text-primary">3</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Instant DM</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your preset message is automatically sent as a DM to the commenter.
                      </p>
                      <div className="glass-panel p-4 rounded-lg w-full">
                        <Send className="h-6 w-6 text-primary mb-2 mx-auto" />
                        <p className="text-xs">
                          "Thanks for your comment! Here's how I can help you..."
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="flex justify-center mt-10">
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      variant="default"
                      className="gap-2"
                    >
                      <UserCheck className="h-5 w-5" />
                      Get Started Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
