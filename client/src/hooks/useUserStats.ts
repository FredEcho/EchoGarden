import { useQuery } from '@tanstack/react-query';
import { calculateLevelInfo, getLevelTitle, getLevelColor, getLevelEmoji } from '@shared/leveling';

interface UserStats {
  xp: number;
  level: number;
  totalHelpProvided: number;
  totalHelpReceived: number;
}

interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNextLevel: number;
  progress: number;
  title: string;
  color: string;
  emoji: string;
}

export function useUserStats(userId?: string) {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: async (): Promise<UserStats> => {
      const endpoint = userId ? `/api/user/${userId}/stats` : '/api/user/stats';
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return response.json();
    },
    enabled: !!userId || userId === undefined, // Allow undefined for current user
  });

  const levelInfo: LevelInfo | null = stats ? {
    ...calculateLevelInfo(stats.xp),
    title: getLevelTitle(stats.level),
    color: getLevelColor(stats.level),
    emoji: getLevelEmoji(stats.level),
  } : null;

  return {
    stats,
    levelInfo,
    isLoading,
    error,
    refetch,
  };
}
