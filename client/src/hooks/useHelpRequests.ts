import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HelpRequest } from "@shared/schema";

export function useHelpRequests(categoryId?: string, searchQuery?: string) {
  const queryClient = useQueryClient();
  const { data: helpRequests, isLoading, error } = useQuery<HelpRequest[]>({
    queryKey: ["/api/help-requests", categoryId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (searchQuery) params.append('search', searchQuery);
      
      const url = `/api/help-requests${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch help requests");
      }
      return response.json();
    },
  });

  return {
    helpRequests: helpRequests || [],
    isLoading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["/api/help-requests", categoryId, searchQuery] }),
  };
}
