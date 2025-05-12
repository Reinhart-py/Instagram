
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, RefreshCw, Send, Settings, MessageSquare, Clock, List, User, Search, Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define interfaces for our data types
interface Comment {
  id: string;
  comment_id: string;
  user: string;
  text: string;
  sent: boolean;
  created_at: string;
  post_id: string;
}

interface Log {
  id: string;
  event: string;
  username: string;
  details: string;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

const Dashboard: React.FC = () => {
  // State variables
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [botStatus, setBotStatus] = useState('running');
  const [stats, setStats] = useState({
    totalComments: 0,
    totalDMs: 0,
    lastActivity: '--',
    keyword: '--'
  });
  
  // Handle sending test DM
  const handleSendTestDM = async () => {
    try {
      setIsLoading(true);
      
      // Call the manual send endpoint
      const response = await fetch('/api/send-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test_user',
          message: activeTemplate?.content || 'Test message'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test DM');
      }
      
      toast.success("Test DM sent successfully!");
      fetchLogs(); // Refresh logs to show the new activity
      
    } catch (error) {
      console.error("Error sending test DM:", error);
      toast.error("Failed to send test DM");
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving a new message template
  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error("Template name and content are required");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Save the template to Supabase
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          name: newTemplate.name,
          content: newTemplate.content,
          is_active: templates.length === 0 // Set as active if it's the first template
        }]);
        
      if (error) throw error;
      
      toast.success("Message template saved");
      setNewTemplate({ name: '', content: '' });
      fetchTemplates(); // Refresh templates list
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle setting a template as active
  const handleSetActiveTemplate = async (template: Template) => {
    try {
      setIsLoading(true);
      
      // Update all templates to inactive
      await supabase
        .from('templates')
        .update({ is_active: false })
        .neq('id', template.id);
        
      // Set the selected template to active
      const { error } = await supabase
        .from('templates')
        .update({ is_active: true })
        .eq('id', template.id);
        
      if (error) throw error;
      
      fetchTemplates(); // Refresh the templates list
      toast.success(`"${template.name}" set as active template`);
      
    } catch (error) {
      console.error("Error setting active template:", error);
      toast.error("Failed to update template");
      
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments from Supabase
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      setComments(data || []);
      setStats(prevStats => ({
        ...prevStats,
        totalComments: data?.length || 0
      }));
      
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  // Fetch logs from Supabase
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      setLogs(data || []);
      
      // Calculate stats from logs
      if (data && data.length > 0) {
        const dmSentLogs = data.filter(log => log.event === 'dm_sent');
        const lastActivity = new Date(data[0].created_at).toLocaleString();
        
        setStats(prevStats => ({
          ...prevStats,
          totalDMs: dmSentLogs.length,
          lastActivity
        }));
      }
      
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load activity logs");
    }
  };

  // Fetch message templates from Supabase
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTemplates(data || []);
      
      // Find the active template
      const active = data?.find(t => t.is_active) || null;
      setActiveTemplate(active);
      
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load message templates");
    }
  };

  // Fetch environment variables like keyword
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setStats(prevStats => ({
          ...prevStats,
          keyword: data.keyword || '--'
        }));
      }
      
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchComments(),
        fetchLogs(),
        fetchTemplates(),
        fetchConfig()
      ]);
      
      setIsLoading(false);
    };
    
    loadData();
    
    // Set up real-time listeners for comments and logs
    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
        setComments(prev => [payload.new as Comment, ...prev]);
        toast.info(`New comment detected from @${(payload.new as Comment).user}`);
      })
      .subscribe();
      
    const logsSubscription = supabase
      .channel('logs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, payload => {
        setLogs(prev => [payload.new as Log, ...prev]);
        
        const log = payload.new as Log;
        if (log.event === 'dm_sent') {
          toast.success(`DM sent to @${log.username}`);
        } else if (log.event.includes('error')) {
          toast.error(`Error: ${log.details}`);
        }
      })
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      commentsSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, []);

  // Function to manually refresh data
  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchComments(), fetchLogs(), fetchTemplates()]);
    setIsLoading(false);
    toast.success("Data refreshed");
  };

  // Function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day ago`;
  };

  return (
    <div className="flex flex-col w-full max-w-screen-xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Aurora Control Panel</h1>
          <p className="text-muted-foreground">Monitor and manage your Instagram automation</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={botStatus === 'running' ? 'default' : 'destructive'} 
            className="px-3 py-1 text-sm"
          >
            {botStatus === 'running' ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Bot Active</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Bot Inactive</>
            )}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Comments Tracked</p>
                <p className="text-2xl font-bold">{stats.totalComments}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">DMs Sent</p>
                <p className="text-2xl font-bold">{stats.totalDMs}</p>
              </div>
              <Send className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Trigger Keyword</p>
                <p className="text-xl font-bold truncate max-w-[150px]">
                  {stats.keyword}
                </p>
              </div>
              <Search className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="text-xl font-bold truncate max-w-[150px]">
                  {stats.lastActivity !== '--' 
                    ? formatRelativeTime(stats.lastActivity) 
                    : '--'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Area */}
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="comments" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> Comments
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <List className="w-4 h-4" /> Activity Log
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1">
            <Send className="w-4 h-4" /> Message Templates
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Tracked Comments
              </CardTitle>
              <CardDescription>
                Recent comments from your monitored Instagram post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-4 rounded-lg border ${
                          comment.sent 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${comment.user}`} />
                              <AvatarFallback>{comment.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">@{comment.user}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatRelativeTime(comment.created_at)}
                              </div>
                            </div>
                          </div>
                          {comment.sent && (
                            <Badge variant="outline" className="border-primary text-primary">
                              <CheckCircle className="w-3 h-3 mr-1" /> DM Sent
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 pl-11">
                          {comment.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments tracked yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {comments.length} recent comments
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchComments()} 
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> Activity Log
              </CardTitle>
              <CardDescription>
                Track all system activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {logs.length > 0 ? (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-lg border ${
                          log.event === 'dm_sent' 
                            ? 'bg-primary/5 border-primary/20' 
                            : log.event.includes('error') 
                              ? 'bg-destructive/5 border-destructive/20' 
                              : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {log.event === 'dm_sent' && <CheckCircle className="w-4 h-4 text-primary" />}
                          {log.event.includes('error') && <AlertCircle className="w-4 h-4 text-destructive" />}
                          {!log.event.includes('error') && log.event !== 'dm_sent' && (
                            <Activity className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div className="font-medium">
                            {log.event.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground ml-auto">
                            {formatRelativeTime(log.created_at)}
                          </div>
                        </div>
                        
                        <div className="pl-6 text-sm">
                          {log.username !== 'system' && <span className="font-medium">@{log.username}:</span>} {log.details}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity logs yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {logs.length} recent activities
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchLogs()} 
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Template Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Active Template
                </CardTitle>
                <CardDescription>
                  This is the message currently being sent to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTemplate ? (
                  <div className="space-y-4">
                    <div className="font-medium">{activeTemplate.name}</div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                      {activeTemplate.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active template set
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleSendTestDM}
                  disabled={!activeTemplate || isLoading}
                  className="gap-1"
                >
                  <Send className="w-4 h-4" />
                  Send Test DM
                </Button>
              </CardFooter>
            </Card>
            
            {/* New Template Card */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
                <CardDescription>
                  Design a new message template for your DMs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="template-name" className="text-sm font-medium">
                      Template Name
                    </label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Welcome Message"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="template-content" className="text-sm font-medium">
                      Message Content
                    </label>
                    <Textarea
                      id="template-content"
                      placeholder="Write your message here..."
                      rows={4}
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Keep messages concise and personalized for better engagement
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveTemplate}
                  disabled={!newTemplate.name || !newTemplate.content || isLoading}
                >
                  Save Template
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* All Templates List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
              <CardDescription>
                All your saved message templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length > 0 ? (
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={`p-3 rounded-lg border ${
                          template.is_active 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{template.name}</div>
                          {template.is_active ? (
                            <Badge variant="outline" className="border-primary text-primary">
                              Active
                            </Badge>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSetActiveTemplate(template)}
                            >
                              Set Active
                            </Button>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {template.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No templates saved yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Bot Configuration
              </CardTitle>
              <CardDescription>
                Adjust how your Instagram bot operates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  These settings are configured via environment variables. To change them, update your environment configuration.
                </p>
                
                {/* Read-only settings display */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instagram Username</label>
                    <Input value="••••••••••" readOnly disabled />
                    <p className="text-xs text-muted-foreground">
                      Instagram account used for automation
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Post ID</label>
                    <Input value="••••••••••" readOnly disabled />
                    <p className="text-xs text-muted-foreground">
                      The Instagram post being monitored for comments
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trigger Keyword</label>
                    <Input value={stats.keyword} readOnly disabled />
                    <p className="text-xs text-muted-foreground">
                      Comments containing this keyword will trigger a DM
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poll Frequency</label>
                    <Input value="Every 5 minutes" readOnly disabled />
                    <p className="text-xs text-muted-foreground">
                      How often the system checks for new comments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Full configuration details in <span className="font-mono text-xs">.env</span> file
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
