import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GardenVisualization } from "@/components/garden-visualization";
import { MatureSeedsButton } from "@/components/mature-seeds-button";
import { UserProfile } from "@/components/user-profile";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";

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
        window.location.href = "/auth";
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

  const getUserDisplayName = (user: any) => {
    // Use first letter of first name and last name
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    // Fallback to first letter of email if no name
    return user.email?.[0]?.toUpperCase() || 'A';
  };

  const userInitials = (user: any) => {
    return getUserDisplayName(user);
  };

  return (
    <div className="min-h-screen animated-bg particles-bg">
      {/* Header */}
      <header className="gradient-purple-orange px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="app-title">EchoGarden</h1>
              <p className="text-white/80 text-sm">Your Digital Garden</p>
            </div>
          </Link>
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
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-shadow">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-2xl gradient-purple-orange text-white">
                    {userInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl" data-testid="text-username">
                  {getUserDisplayName(user)}
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
                <div className="text-center">
                  <MatureSeedsButton />
                </div>
              </CardContent>
            </Card>

            {/* User Level and XP */}
            <UserProfile />
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
