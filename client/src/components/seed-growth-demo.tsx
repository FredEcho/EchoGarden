import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SeedGrowthDemo() {
  const seedTypes = [
    { type: 'healing-seed', name: 'Healing Seed', category: 'Mental Health Support' },
    { type: 'knowledge-seed', name: 'Knowledge Seed', category: 'Study Help' },
    { type: 'success-seed', name: 'Success Seed', category: 'Career Advice' },
    { type: 'wisdom-seed', name: 'Wisdom Seed', category: 'Life Skills' },
    { type: 'inspiration-seed', name: 'Inspiration Seed', category: 'Creative Feedback' },
    { type: 'innovation-seed', name: 'Innovation Seed', category: 'Tech Support' },
  ];

  const getPlantEmoji = (type: string, growth: number) => {
    // Fully grown states (100% growth)
    if (growth >= 100) {
      switch (type) {
        case 'healing-seed':
          return '🌺'; // Healing flower
        case 'knowledge-seed':
          return '🌻'; // Knowledge sunflower
        case 'success-seed':
          return '🌹'; // Success rose
        case 'wisdom-seed':
          return '🌳'; // Wisdom tree
        case 'inspiration-seed':
          return '🌼'; // Inspiration daisy
        case 'innovation-seed':
          return '🌷'; // Innovation tulip
        default:
          return '🌸'; // Basic flower
      }
    }
    
    // Growing states (75-99% growth)
    if (growth >= 75) {
      switch (type) {
        case 'healing-seed':
          return '🌷'; // Healing bud
        case 'knowledge-seed':
          return '🌼'; // Knowledge daisy
        case 'success-seed':
          return '🌸'; // Success blossom
        case 'wisdom-seed':
          return '🌿'; // Wisdom plant
        case 'inspiration-seed':
          return '🌸'; // Inspiration blossom
        case 'innovation-seed':
          return '🌼'; // Innovation daisy
        default:
          return '🌿'; // Basic plant
      }
    }
    
    // Sprout states (25-74% growth)
    if (growth >= 25) {
      switch (type) {
        case 'healing-seed':
          return '🌱'; // Healing sprout
        case 'knowledge-seed':
          return '📖'; // Knowledge sprout
        case 'success-seed':
          return '🌟'; // Success sprout
        case 'wisdom-seed':
          return '🌱'; // Wisdom sprout
        case 'inspiration-seed':
          return '✨'; // Inspiration sprout
        case 'innovation-seed':
          return '💡'; // Innovation sprout
        default:
          return '🌱'; // Basic sprout
      }
    }
    
    // Seed states (0-24% growth)
    switch (type) {
      case 'healing-seed':
        return '💚'; // Healing seed
      case 'knowledge-seed':
        return '📚'; // Knowledge seed
      case 'success-seed':
        return '⭐'; // Success seed
      case 'wisdom-seed':
        return '🧠'; // Wisdom seed
      case 'inspiration-seed':
        return '✨'; // Inspiration seed
      case 'innovation-seed':
        return '💡'; // Innovation seed
      default:
        return '🌰'; // Basic seed
    }
  };

  const getSeedTypeName = (type: string, growth: number = 0) => {
    // Fully grown names
    if (growth >= 100) {
      switch (type) {
        case 'healing-seed':
          return 'Healing Flower';
        case 'knowledge-seed':
          return 'Knowledge Library';
        case 'success-seed':
          return 'Success Trophy';
        case 'wisdom-seed':
          return 'Wisdom Tree';
        case 'inspiration-seed':
          return 'Inspiration Masterpiece';
        case 'innovation-seed':
          return 'Innovation Lightning';
        default:
          return 'Beautiful Flower';
      }
    }
    
    // Growing names
    if (growth >= 75) {
      switch (type) {
        case 'healing-seed':
          return 'Healing Bud';
        case 'knowledge-seed':
          return 'Knowledge Collection';
        case 'success-seed':
          return 'Success Star';
        case 'wisdom-seed':
          return 'Wisdom Plant';
        case 'inspiration-seed':
          return 'Inspiration Sparkles';
        case 'innovation-seed':
          return 'Innovation Bulb';
        default:
          return 'Growing Plant';
      }
    }
    
    // Sprout names
    if (growth >= 25) {
      switch (type) {
        case 'healing-seed':
          return 'Healing Sprout';
        case 'knowledge-seed':
          return 'Knowledge Sprout';
        case 'success-seed':
          return 'Success Sprout';
        case 'wisdom-seed':
          return 'Wisdom Sprout';
        case 'inspiration-seed':
          return 'Inspiration Sprout';
        case 'innovation-seed':
          return 'Innovation Sprout';
        default:
          return 'Growing Sprout';
      }
    }
    
    // Seed names
    switch (type) {
      case 'healing-seed':
        return 'Healing Seed';
      case 'knowledge-seed':
        return 'Knowledge Seed';
      case 'success-seed':
        return 'Success Seed';
      case 'wisdom-seed':
        return 'Wisdom Seed';
      case 'inspiration-seed':
        return 'Inspiration Seed';
      case 'innovation-seed':
        return 'Innovation Seed';
      default:
        return 'Basic Seed';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">🌱 Seed Growth Journey 🌸</CardTitle>
        <p className="text-center text-muted-foreground">
          See how your seeds transform when you help others!
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seedTypes.map((seed) => (
            <Card key={seed.type} className="border-2 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">{seed.name}</CardTitle>
                <p className="text-sm text-center text-muted-foreground">{seed.category}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Seed Stage */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlantEmoji(seed.type, 0)}</span>
                      <div>
                        <p className="font-medium">{getSeedTypeName(seed.type, 0)}</p>
                        <p className="text-sm text-muted-foreground">0% grown</p>
                      </div>
                    </div>
                  </div>

                  {/* Sprout Stage */}
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlantEmoji(seed.type, 50)}</span>
                      <div>
                        <p className="font-medium">{getSeedTypeName(seed.type, 50)}</p>
                        <p className="text-sm text-muted-foreground">50% grown</p>
                      </div>
                    </div>
                  </div>

                  {/* Growing Stage */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlantEmoji(seed.type, 85)}</span>
                      <div>
                        <p className="font-medium">{getSeedTypeName(seed.type, 85)}</p>
                        <p className="text-sm text-muted-foreground">85% grown</p>
                      </div>
                    </div>
                  </div>

                  {/* Fully Grown Stage */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-300">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlantEmoji(seed.type, 100)}</span>
                      <div>
                        <p className="font-medium text-green-700">{getSeedTypeName(seed.type, 100)}</p>
                        <p className="text-sm text-green-600 font-medium">100% grown! 🌟</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🎯 How to Grow Your Seeds:</h3>
          <ul className="space-y-2 text-sm">
            <li>🌱 <strong>Plant Seeds:</strong> Help others by responding to their requests</li>
            <li>⏰ <strong>Time Growth:</strong> Seeds automatically grow to sprouts after 24 hours</li>
            <li>❤️ <strong>Helpful Growth:</strong> When your response is marked as helpful, your seed grows significantly!</li>
            <li>🌸 <strong>Fully Grown:</strong> Reach 100% growth to see your beautiful final form</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
