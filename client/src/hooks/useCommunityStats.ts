import { useQuery } from "@tanstack/react-query";
import { staticCommunityStats, isStaticMode } from "@/lib/staticData";

interface CommunityStats {
  activeGardeners: number;
  seedsPlanted: number;
  gardensBloomin: number;
  totalResponses: number;
}

export function useCommunityStats() {
  const { data: stats, isLoading, error } = useQuery<CommunityStats>({
    queryKey: ["/api/community-stats"],
    queryFn: async () => {
      // Use static data if in static mode
      if (isStaticMode()) {
        return {
          activeGardeners: staticCommunityStats.totalUsers,
          seedsPlanted: staticCommunityStats.seedsPlanted,
          gardensBloomin: Math.floor(staticCommunityStats.totalUsers * 0.7),
          totalResponses: staticCommunityStats.responses,
        };
      }
      
      const response = await fetch("/api/community-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch community stats");
      }
      return response.json();
    },
  });

  const defaultStats = {
    activeGardeners: staticCommunityStats.totalUsers,
    seedsPlanted: staticCommunityStats.seedsPlanted,
    gardensBloomin: Math.floor(staticCommunityStats.totalUsers * 0.7),
    totalResponses: staticCommunityStats.responses,
  };

  return {
    stats: stats || defaultStats,
    isLoading: isStaticMode() ? false : isLoading,
    error: isStaticMode() ? null : error,
  };
}
