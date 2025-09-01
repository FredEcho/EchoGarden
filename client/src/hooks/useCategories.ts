import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      return response.json();
    },
  });

  return {
    categories: categories || [],
    isLoading,
    error,
  };
}
