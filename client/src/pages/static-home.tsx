import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { Link } from "wouter";
import { staticHelpRequests, staticCategories } from "@/lib/staticData";
import { CommunityStats } from "@/components/community-stats";
import { GardenVisualization } from "@/components/garden-visualization";

export default function StaticHome() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredRequests = selectedCategory 
    ? staticHelpRequests.filter(req => req.category === selectedCategory)
    : staticHelpRequests;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-purple-orange px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity duration-200">
            <Logo size="md" />
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Demo Mode
            </Badge>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="btn-primary button-pop button-ripple bg-white text-primary"
            >
              Try Full Version
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text-purple-orange mb-4">
            Welcome to EchoGarden Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is a static demo version. See how the community platform works with sample data.
          </p>
        </div>

        {/* Community Stats */}
        <div className="mb-12">
          <CommunityStats />
        </div>

        {/* Garden Visualization */}
        <div className="mb-12">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text-cyan-blue">Sample Garden</CardTitle>
              <CardDescription>
                This is how your garden would look with community interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GardenVisualization />
            </CardContent>
          </Card>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              className="gradient-purple-orange"
            >
              All
            </Button>
            {staticCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={selectedCategory === category.name ? "gradient-purple-orange" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Help Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Sample Help Requests</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="card-shadow hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge variant="secondary">{request.category}</Badge>
                  </div>
                  <CardDescription>by {request.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{request.responses} responses</span>
                    <span>{request.createdAt.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="card-shadow text-center">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold gradient-text-purple-orange mb-4">
              Want to Try the Full Experience?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              This demo shows the interface, but the full version includes user accounts, 
              real-time interactions, and a growing garden system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = "/auth"}
                className="gradient-purple-orange text-white hover:scale-105 transition-transform shadow-lg text-lg px-8 py-4"
              >
                Try Full Version
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="text-lg px-8 py-4"
              >
                Back to Landing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
