import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { CommunityStats } from "@/components/community-stats";
import { Logo, SproutIcon } from "@/components/ui/logo";
import { Link } from "wouter";

export default function Landing() {
  const { categories } = useCategories();

  const handleJoinGarden = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-purple-orange px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity duration-200">
            <Logo size="md" />
          </Link>
          <Button 
            onClick={handleJoinGarden}
            className="btn-primary button-pop button-ripple bg-white text-primary"
            data-testid="button-join-garden"
          >
            Join Garden
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large centered logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="hover:opacity-90 transition-opacity duration-200">
              <Logo size="lg" showText={false} />
            </Link>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center">
            Plant Seeds of Kindness
            <SproutIcon color="orange" className="ml-2" />
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
        <div className="max-w-4xl mx-auto">
          <Card className="card-shadow">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 gradient-purple-orange rounded-full flex items-center justify-center mx-auto mb-8 pulse-grow">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 18v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 10c0-1 1-2 2-2s2 1 2 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M9 11c1-1 2-1 3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M15 11c-1-1-2-1-3 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Logo size="md" />
          </div>
          
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            © 2025 EchoGarden. All rights reserved. Made with ❤️ for growing communities.
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
