import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { isStaticMode } from "@/lib/staticData";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // In static mode, always return null (not authenticated)
      if (isStaticMode()) {
        return null;
      }
      
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
    retry: false,
  });

  return {
    user: user || null,
    isLoading: isStaticMode() ? false : isLoading,
    isAuthenticated: isStaticMode() ? false : !!user,
  };
}
