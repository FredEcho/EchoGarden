import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GardenVisualization } from "@/components/garden-visualization";
import { Link } from "wouter";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-4 floating-animation">
            <span className="text-white text-2xl">🌱</span>
          </div>
          <p className="text-muted-foreground">Loading your garden...</p>
        </div>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-purple-orange px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z" />
                <path d="M8 18C8 18 6 16 6 12" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M16 18C16 18 18 16 18 12" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="app-title">EchoGarden</h1>
              <p className="text-white/80 text-sm">Your Digital Garden</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="link-home">
              🏠 Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="card-shadow">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="text-2xl gradient-purple-orange text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl" data-testid="text-username">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'Gardener'
                  }
                </CardTitle>
                <p className="text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Garden Visualization */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🌿</span>
                  <span data-testid="text-garden-title">My Garden</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Your garden grows with every act of kindness and help you provide to others.
                </p>
              </CardHeader>
              <CardContent>
                <GardenVisualization userId={user?.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
