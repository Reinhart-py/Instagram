
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="flex flex-col items-center max-w-md mx-auto text-center">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        
        <div className="mt-4 mb-8">
          <div className="h-1 w-16 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
