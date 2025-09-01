import { useQuery } from "@tanstack/react-query";
import type { GardenItem } from "@shared/schema";

export function useGardenItems(userId?: string) {
  const { data: gardenItems, isLoading, error } = useQuery<GardenItem[]>({
    queryKey: ["/api/garden", userId],
    queryFn: async () => {
      const url = userId 
        ? `/api/garden/${userId}`
        : "/api/garden";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch garden items");
      }
      return response.json();
    },
    enabled: true,
  });

  return {
    gardenItems: gardenItems || [],
    isLoading,
    error,
  };
}
