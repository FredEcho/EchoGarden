import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return {
    categories: categories || [],
    isLoading,
    error,
  };
}
