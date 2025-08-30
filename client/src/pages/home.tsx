import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpRequestCard } from "@/components/help-request-card";
import { CategoryFilter } from "@/components/category-filter";
import { PostHelpForm } from "@/components/post-help-form";
import { GardenVisualization } from "@/components/garden-visualization";
import { CommunityStats } from "@/components/community-stats";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: helpRequests = [], refetch: refetchHelpRequests } = useQuery({
    queryKey: ["/api/help-requests", selectedCategory],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-4 floating-animation">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 18v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 10c0-1 1-2 2-2s2 1 2 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M9 11c1-1 2-1 3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M15 11c-1-1-2-1-3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-muted-foreground">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-purple-orange px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 18v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 10c0-1 1-2 2-2s2 1 2 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M9 11c1-1 2-1 3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M15 11c-1-1-2-1-3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="app-title">EchoGarden</h1>
              <p className="text-white/80 text-sm">Welcome back, {user?.firstName || 'Gardener'}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="link-profile">
                🌿 My Garden
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/10"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-purple-orange text-white" data-testid="button-post-help">
                    📢 Ask for Help
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <PostHelpForm onSuccess={() => refetchHelpRequests()} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Category Filter */}
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Help Requests Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text-purple-orange" data-testid="text-help-requests-title">
                  Recent Help Requests
                </h2>
                <span className="text-sm text-muted-foreground" data-testid="text-requests-count">
                  {helpRequests.length} requests
                </span>
              </div>

              {helpRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No help requests found</h3>
                  <p className="text-muted-foreground">Be the first to ask for help or try changing the filter!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((request: any) => (
                    <HelpRequestCard 
                      key={request.id} 
                      request={request}
                      onResponse={() => refetchHelpRequests()}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User's Garden Preview */}
            <GardenVisualization userId={user?.id} compact />

            {/* Community Stats */}
            <CommunityStats compact />
          </div>
        </div>
      </div>
    </div>
  );
}
