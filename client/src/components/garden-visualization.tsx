import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GardenVisualizationProps {
  userId?: string;
  compact?: boolean;
}

export function GardenVisualization({ userId, compact = false }: GardenVisualizationProps) {
  const { data: gardenItems = [], isLoading } = useQuery({
    queryKey: userId ? ["/api/garden", userId] : ["/api/garden"],
    enabled: !!userId,
  });

  const getPlantEmoji = (type: string, growth: number) => {
    switch (type) {
      case 'seed':
        return '🌰';
      case 'sprout':
        return '🌱';
      case 'plant':
        return growth >= 75 ? '🌿' : '🌿';
      case 'tree':
        return '🌳';
      case 'flower':
        return '🌸';
      default:
        return '🌱';
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 75) return 'text-green-600';
    if (growth >= 50) return 'text-yellow-600';
    if (growth >= 25) return 'text-orange-600';
    return 'text-gray-500';
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
    growing: gardenItems.filter(item => item.growth > 0 && item.growth < 100).length,
    mature: gardenItems.filter(item => item.isGrown).length,
  };

  return (
    <Card className={compact ? "h-64 overflow-hidden" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🌿</span>
          <span data-testid="text-garden-title">Garden</span>
        </CardTitle>
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
              <span>🌳</span>
              <span data-testid="text-mature-count">{stats.mature} mature</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-6 gap-4'}`}>
          {gardenItems.slice(0, compact ? 8 : 24).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center justify-center"
              data-testid={`garden-item-${item.id}`}
            >
              <div 
                className={`text-2xl ${compact ? 'text-lg' : 'text-3xl'} ${getGrowthColor(item.growth)} hover:scale-110 transition-transform cursor-pointer`}
                title={`${item.type} - ${item.growth}% grown`}
              >
                {getPlantEmoji(item.type, item.growth)}
              </div>
              {!compact && (
                <div className="w-8 bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${item.growth}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Fill empty spots with potential growth */}
          {gardenItems.length < (compact ? 8 : 24) && (
            <>
              {[...Array((compact ? 8 : 24) - gardenItems.length)].map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex flex-col items-center justify-center opacity-30"
                >
                  <div className={`text-gray-400 ${compact ? 'text-lg' : 'text-3xl'}`}>
                    ⭕
                  </div>
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
