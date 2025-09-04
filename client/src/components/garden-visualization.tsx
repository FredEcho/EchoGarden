import { useGardenItems } from "@/hooks/useGardenItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GardenVisualizationProps {
  userId?: string;
  compact?: boolean;
}

export function GardenVisualization({ userId, compact = false }: GardenVisualizationProps) {
  const { gardenItems, isLoading } = useGardenItems(userId);
  const { toast } = useToast();

  const resetGardenToSeeds = async () => {
    try {
      console.log('🌱 Attempting to reset garden...');
      console.log('User ID:', userId);
      
      const response = await fetch('/api/garden/reset-to-seeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Reset successful:', result);
        
        toast({
          title: "Garden Reset! 🌱",
          description: "All flowers have been turned back into seeds!",
        });
        // Refresh the page to show the updated garden
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Reset failed:', errorText);
        throw new Error(`Failed to reset garden: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Error",
        description: `Failed to reset garden: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getPlantDesign = (type: string, growth: number) => {
    const designs = {
      'healing-seed': {
        seed: { emoji: '🌱', color: 'bg-green-100 border-green-300', textColor: 'text-green-700' },
        sprout: { emoji: '🌿', color: 'bg-green-200 border-green-400', textColor: 'text-green-800' },
        growing: { emoji: '🌷', color: 'bg-pink-200 border-pink-400', textColor: 'text-pink-800' },
        grown: { emoji: '🌺', color: 'bg-pink-300 border-pink-500', textColor: 'text-pink-900' }
      },
      'knowledge-seed': {
        seed: { emoji: '🌱', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-700' },
        sprout: { emoji: '🌿', color: 'bg-blue-200 border-blue-400', textColor: 'text-blue-800' },
        growing: { emoji: '🌼', color: 'bg-indigo-200 border-indigo-400', textColor: 'text-indigo-800' },
        grown: { emoji: '🌻', color: 'bg-indigo-300 border-indigo-500', textColor: 'text-indigo-900' }
      },
      'success-seed': {
        seed: { emoji: '🌱', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-700' },
        sprout: { emoji: '🌿', color: 'bg-yellow-200 border-yellow-400', textColor: 'text-yellow-800' },
        growing: { emoji: '🌼', color: 'bg-amber-200 border-amber-400', textColor: 'text-amber-800' },
        grown: { emoji: '🌹', color: 'bg-amber-300 border-amber-500', textColor: 'text-amber-900' }
      },
      'wisdom-seed': {
        seed: { emoji: '🌱', color: 'bg-purple-100 border-purple-300', textColor: 'text-purple-700' },
        sprout: { emoji: '🌿', color: 'bg-purple-200 border-purple-400', textColor: 'text-purple-800' },
        growing: { emoji: '🌸', color: 'bg-violet-200 border-violet-400', textColor: 'text-violet-800' },
        grown: { emoji: '🌳', color: 'bg-violet-300 border-violet-500', textColor: 'text-violet-900' }
      },
      'inspiration-seed': {
        seed: { emoji: '🌱', color: 'bg-pink-100 border-pink-300', textColor: 'text-pink-700' },
        sprout: { emoji: '🌿', color: 'bg-pink-200 border-pink-400', textColor: 'text-pink-800' },
        growing: { emoji: '🌸', color: 'bg-rose-200 border-rose-400', textColor: 'text-rose-800' },
        grown: { emoji: '🌼', color: 'bg-rose-300 border-rose-500', textColor: 'text-rose-900' }
      },
      'innovation-seed': {
        seed: { emoji: '🌱', color: 'bg-cyan-100 border-cyan-300', textColor: 'text-cyan-700' },
        sprout: { emoji: '🌿', color: 'bg-cyan-200 border-cyan-400', textColor: 'text-cyan-800' },
        growing: { emoji: '🌼', color: 'bg-teal-200 border-teal-400', textColor: 'text-teal-800' },
        grown: { emoji: '🌷', color: 'bg-teal-300 border-teal-500', textColor: 'text-teal-900' }
      }
    };

    const design = designs[type] || designs['healing-seed'];
    
    if (growth >= 100) return design.grown;
    if (growth >= 75) return design.growing;
    if (growth >= 25) return design.sprout;
    return design.seed;
  };

  const getGrowthBarColor = (type: string, growth: number) => {
    // Define specific color mappings for each seed type and growth stage
    const colorMappings = {
      'healing-seed': {
        seed: 'bg-green-500',
        sprout: 'bg-green-600',
        growing: 'bg-pink-500',
        grown: 'bg-pink-600'
      },
      'knowledge-seed': {
        seed: 'bg-blue-500',
        sprout: 'bg-blue-600',
        growing: 'bg-indigo-500',
        grown: 'bg-indigo-600'
      },
      'success-seed': {
        seed: 'bg-yellow-500',
        sprout: 'bg-yellow-600',
        growing: 'bg-amber-500',
        grown: 'bg-amber-600'
      },
      'wisdom-seed': {
        seed: 'bg-purple-500',
        sprout: 'bg-purple-600',
        growing: 'bg-violet-500',
        grown: 'bg-violet-600'
      },
      'inspiration-seed': {
        seed: 'bg-pink-500',
        sprout: 'bg-pink-600',
        growing: 'bg-rose-500',
        grown: 'bg-rose-600'
      },
      'innovation-seed': {
        seed: 'bg-cyan-500',
        sprout: 'bg-cyan-600',
        growing: 'bg-teal-500',
        grown: 'bg-teal-600'
      }
    };

    const mapping = colorMappings[type] || colorMappings['healing-seed'];
    
    if (growth >= 100) return mapping.grown;
    if (growth >= 75) return mapping.growing;
    if (growth >= 25) return mapping.sprout;
    return mapping.seed;
  };

  const getSeedTypeName = (type: string, growth: number = 0) => {
    const names = {
      'healing-seed': {
        seed: 'Healing Seed',
        sprout: 'Compassion Sprout',
        growing: 'Wellness Bud',
        grown: 'Peaceful Lotus'
      },
      'knowledge-seed': {
        seed: 'Knowledge Seed',
        sprout: 'Learning Sprout',
        growing: 'Wisdom Bloom',
        grown: 'Golden Sunflower'
      },
      'success-seed': {
        seed: 'Success Seed',
        sprout: 'Achievement Sprout',
        growing: 'Victory Bloom',
        grown: 'Trophy Flower'
      },
      'wisdom-seed': {
        seed: 'Wisdom Seed',
        sprout: 'Insight Sprout',
        growing: 'Sage Bloom',
        grown: 'Ancient Oak Tree'
      },
      'inspiration-seed': {
        seed: 'Inspiration Seed',
        sprout: 'Creativity Sprout',
        growing: 'Artistic Bloom',
        grown: 'Daisy Flower'
      },
      'innovation-seed': {
        seed: 'Innovation Seed',
        sprout: 'Discovery Sprout',
        growing: 'Innovation Bloom',
        grown: 'Blue Tulip'
      }
    };

    const nameSet = names[type] || names['healing-seed'];
    
    if (growth >= 100) return nameSet.grown;
    if (growth >= 75) return nameSet.growing;
    if (growth >= 25) return nameSet.sprout;
    return nameSet.seed;
  };

  if (isLoading) {
    return (
      <Card className={compact ? "h-64" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌿</span>
            <span>Garden</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gardenItems.length === 0) {
    return (
      <Card className={compact ? "h-64" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌿</span>
            <span>Garden</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-muted-foreground">
              Your garden is waiting to grow! Help others to plant your first seeds.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    seeds: gardenItems.filter(item => item.type === 'seed').length,
    growing: gardenItems.filter(item => (item.growth || 0) > 0 && (item.growth || 0) < 100).length,
    mature: gardenItems.filter(item => item.isGrown).length,
  };

  return (
    <Card className={compact ? "h-64 overflow-hidden" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>🌿</span>
            <span data-testid="text-garden-title">Garden</span>
          </CardTitle>
          {!compact && gardenItems.length > 0 && (
            <Button
              onClick={() => {
                console.log('Reset button clicked!');
                console.log('Garden items count:', gardenItems.length);
                resetGardenToSeeds();
              }}
              variant="outline"
              size="sm"
              className="text-xs"
              data-testid="reset-garden-button"
            >
              🌱 Reset to Seeds ({gardenItems.length})
            </Button>
          )}
          {!compact && (
            <Button
              onClick={() => {
                console.log('Test button clicked!');
                toast({
                  title: "Test",
                  description: "Button is working!",
                });
              }}
              variant="secondary"
              size="sm"
              className="text-xs ml-2"
            >
              🧪 Test
            </Button>
          )}
        </div>
        {!compact && (
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span>🌰</span>
              <span data-testid="text-seeds-count">{stats.seeds} seeds</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🌱</span>
              <span data-testid="text-growing-count">{stats.growing} growing</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🌸</span>
              <span data-testid="text-mature-count">{stats.mature} mature</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🌿</span>
              <span data-testid="text-total-count">{gardenItems.length} total</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className={compact ? "px-6 py-3" : "px-8 py-4"}>
        <div className={`grid ${compact ? 'grid-cols-4 gap-x-6 gap-y-2' : 'grid-cols-6 gap-x-8 gap-y-3'} items-start`}>
          {gardenItems.slice(0, compact ? 8 : 24).map((item, index) => {
            const design = getPlantDesign(item.type, item.growth || 0);
            const name = getSeedTypeName(item.type, item.growth || 0);
            
            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center justify-center w-full"
                style={{ minHeight: compact ? '4rem' : '5rem' }}
                data-testid={`garden-item-${item.id}`}
              >
                <div 
                  className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg border-2 ${design.color} flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md`}
                  style={{ 
                    width: compact ? '3rem' : '4rem', 
                    height: compact ? '3rem' : '4rem',
                    minWidth: compact ? '3rem' : '4rem',
                    minHeight: compact ? '3rem' : '4rem', 
                    maxWidth: compact ? '3rem' : '4rem',
                    maxHeight: compact ? '3rem' : '4rem' 
                  }}
                  title={`${name} - ${item.growth || 0}% grown`}
                >
                  <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} flex items-center justify-center`} style={{ height: '1.5em', maxHeight: '1.5em', minHeight: '1.5em' }}>
                    <span className={`${compact ? 'text-xl' : 'text-3xl'} ${design.textColor}`} style={{ fontSize: '1.5em', lineHeight: '1.5em', height: '1.5em', maxHeight: '1.5em', minHeight: '1.5em', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {design.emoji}
                    </span>
                  </div>
                </div>
                {!compact && (
                  <div className="mt-2 text-center w-full">
                    <p className={`text-xs font-medium ${design.textColor} mb-1`}>
                      {name}
                    </p>
                    <div className="w-full max-w-12 mx-auto bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-700 ease-out ${getGrowthBarColor(item.type, item.growth || 0)}`}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, item.growth || 0))}%`,
                          minWidth: '0.25rem'
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
          
          {/* Fill empty spots with potential growth */}
          {gardenItems.length < (compact ? 8 : 24) && (
            <>
              {[...Array((compact ? 8 : 24) - gardenItems.length)].map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex flex-col items-center justify-center w-full"
                  style={{ minHeight: compact ? '4rem' : '5rem' }}
                >
                  <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center opacity-50 hover:opacity-70 transition-opacity`} style={{ 
                    width: compact ? '3rem' : '4rem', 
                    height: compact ? '3rem' : '4rem',
                    minWidth: compact ? '3rem' : '4rem',
                    minHeight: compact ? '3rem' : '4rem', 
                    maxWidth: compact ? '3rem' : '4rem',
                    maxHeight: compact ? '3rem' : '4rem' 
                  }}>
                    <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} flex items-center justify-center`} style={{ height: '1.5em', maxHeight: '1.5em', minHeight: '1.5em' }}>
                      <span className={`text-gray-400 ${compact ? 'text-xl' : 'text-3xl'}`} style={{ fontSize: '1.5em', lineHeight: '1.5em', height: '1.5em', maxHeight: '1.5em', minHeight: '1.5em', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        🌱
                      </span>
                    </div>
                  </div>
                  {!compact && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-400 font-medium">
                        Empty Plot
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        
        {compact && gardenItems.length > 8 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              +{gardenItems.length - 8} more items in your garden
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
