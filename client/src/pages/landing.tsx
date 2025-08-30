import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CommunityStats } from "@/components/community-stats";

export default function Landing() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleJoinGarden = () => {
    window.location.href = "/api/login";
  };

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
              <p className="text-white/80 text-sm">Grow kindness together</p>
            </div>
          </div>
          <Button 
            onClick={handleJoinGarden}
            className="bg-white text-primary hover:bg-white/90"
            data-testid="button-join-garden"
          >
            Join Garden
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-cyan-blue px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-8 floating-animation">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z" />
              <path d="M8 18C8 18 6 16 6 12" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M16 18C16 18 18 16 18 12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Plant Seeds of Kindness
            <span className="block">🌿</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the social platform where helping others grows your digital garden through community impact
          </p>
          
          <Button 
            onClick={handleJoinGarden}
            className="gradient-purple-orange text-white hover:scale-105 transition-transform shadow-lg text-lg px-8 py-4"
            data-testid="button-start-growing"
          >
            Start Growing Today
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <CommunityStats />

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold gradient-text-purple-orange mb-12">Ways to Help & Grow</h3>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category: any) => (
              <span 
                key={category.id}
                className={`bg-${category.color}-500 text-white px-6 py-3 rounded-full font-medium hover:bg-${category.color}-600 transition-colors cursor-pointer`}
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold gradient-text-cyan-blue text-center mb-16">How EchoGarden Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center card-shadow hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-4">Share Your Echoes</h4>
                <p className="text-muted-foreground">
                  Post requests for help, advice, or support. Tag your needs so the right helpers can find you.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-shadow hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl">🌱</span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-4">Plant Seeds by Helping</h4>
                <p className="text-muted-foreground">
                  Offer help to others and plant seeds in your garden. Each helpful act creates a growing seed.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-shadow hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl">🍃</span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-4">Watch Your Garden Bloom</h4>
                <p className="text-muted-foreground">
                  Seeds grow as your impact spreads through the community. Build a beautiful garden of kindness.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 gradient-cyan-blue rounded-full flex items-center justify-center mx-auto mb-8 pulse-grow">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z" />
              <path d="M8 18C8 18 6 16 6 12" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M16 18C16 18 18 16 18 12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          <h3 className="text-4xl font-bold gradient-text-purple-orange mb-6">
            Ready to Start Your Garden?
            <span className="block text-2xl mt-2">🌈</span>
          </h3>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a community where helping others helps you grow. Every act of kindness makes the world a little brighter.
          </p>
          
          <Button 
            onClick={handleJoinGarden}
            className="gradient-purple-orange text-white hover:scale-105 transition-transform shadow-lg text-lg px-8 py-4 flex items-center space-x-2 mx-auto"
            data-testid="button-join-community"
          >
            <span>👥</span>
            <span>Join EchoGarden Today</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z" />
                <path d="M8 18C8 18 6 16 6 12" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M16 18C16 18 18 16 18 12" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white">EchoGarden</h4>
          </div>
          
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            © 2024 EchoGarden. All rights reserved. Made with ❤️ for growing communities.
          </p>
          
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Support</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Community</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
