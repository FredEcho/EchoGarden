import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { staticCategories, isStaticMode } from "@/lib/staticData";

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      // Use static data if in static mode
      if (isStaticMode()) {
        return staticCategories as Category[];
      }
      
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
    categories: categories || staticCategories as Category[],
    isLoading: isStaticMode() ? false : isLoading,
    error: isStaticMode() ? null : error,
  };
}
