import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStats } from "@/hooks/useUserStats";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileProps {
  userId?: string;
  showDetails?: boolean;
}

export function UserProfile({ userId, showDetails = true }: UserProfileProps) {
  const { stats, levelInfo, isLoading } = useUserStats(userId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || !levelInfo) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          Unable to load user profile
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={levelInfo.color}>{levelInfo.emoji}</span>
          {levelInfo.title}
          <Badge variant="secondary" className={levelInfo.color}>
            Level {levelInfo.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Experience Points</span>
            <span className="font-medium">{stats.xp} XP</span>
          </div>
          <Progress value={levelInfo.progress} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {levelInfo.progress < 100 
              ? `${levelInfo.xpForNextLevel - stats.xp} XP to next level`
              : "Maximum level reached!"
            }
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalHelpProvided}
              </div>
              <div className="text-xs text-muted-foreground">
                Help Provided
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalHelpReceived}
              </div>
              <div className="text-xs text-muted-foreground">
                Help Received
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
