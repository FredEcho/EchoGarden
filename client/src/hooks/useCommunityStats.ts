import { useQuery } from "@tanstack/react-query";

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
      const response = await fetch("/api/community-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch community stats");
      }
      return response.json();
    },
  });

  return {
    stats: stats || {
      activeGardeners: 0,
      seedsPlanted: 0,
      gardensBloomin: 0,
      totalResponses: 0,
    },
    isLoading,
    error,
  };
}
