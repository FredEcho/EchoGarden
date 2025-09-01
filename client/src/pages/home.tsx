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
import { useSearchHelpRequests } from "@/hooks/useSearchHelpRequests";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { helpRequests, refetch: refetchHelpRequests } = useSearchHelpRequests(selectedCategory, searchTerm);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Logout error:", error);
      }
      window.location.href = "/";
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (search: string, category: string) => {
    setSearchTerm(search);
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
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
        <div className="max-w-7xl mx-auto">
          {/* Top row with logo and navigation */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-2xl font-bold text-white" data-testid="app-title">EchoGarden</h1>
                <p className="text-white/80 text-sm">Welcome back, Gardener!</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <SearchBar 
                onSearch={handleSearch}
                selectedCategory={selectedCategory}
                className=""
              />
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-purple-orange text-white" data-testid="button-post-help">
                    🌱 Share Your Echo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
                  <PostHelpForm onSuccess={() => {
                    refetchHelpRequests();
                    setIsDialogOpen(false);
                  }} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Category Filter */}
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Echoes Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text-purple-orange" data-testid="text-help-requests-title">
                  Recent Echoes
                </h2>
                <span className="text-sm text-muted-foreground" data-testid="text-requests-count">
                  {helpRequests.length} echoes
                </span>
              </div>

              {helpRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No echoes found</h3>
                  <p className="text-muted-foreground">Be the first to share your echo or try changing the filter!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((request: any) => (
                    <HelpRequestCard 
                      key={request.id} 
                      request={request}
                      onResponse={() => refetchHelpRequests()}
                      onDelete={() => refetchHelpRequests()}
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
