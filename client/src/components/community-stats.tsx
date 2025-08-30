import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityStatsProps {
  compact?: boolean;
}

export function CommunityStats({ compact = false }: CommunityStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${compact ? 'py-8' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {!compact && (
            <h3 className="text-3xl font-bold text-center mb-12">Community Stats</h3>
          )}
          <div className={`grid ${compact ? 'md:grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6'}`}>
            {[...Array(compact ? 1 : 3)].map((_, i) => (
              <Card key={i} className="text-center card-shadow">
                <CardContent className="p-8">
                  <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (compact) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Community Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Gardeners</span>
            <span className="font-semibold" data-testid="text-active-gardeners">
              {stats?.activeGardeners?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Seeds Planted</span>
            <span className="font-semibold" data-testid="text-seeds-planted">
              {stats?.seedsPlanted?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gardens Blooming</span>
            <span className="font-semibold" data-testid="text-gardens-blooming">
              {stats?.gardensBloomin?.toLocaleString() || '0'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center card-shadow hover-lift">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600" data-testid="text-seeds-count">
                  {stats?.seedsPlanted?.toLocaleString() || '0'}+
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Seeds Planted</h3>
              <p className="text-sm text-muted-foreground">Community impact</p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-shadow hover-lift">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600" data-testid="text-plants-count">
                  {stats?.gardensBloomin?.toLocaleString() || '0'}+
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Plants Grown</h3>
              <p className="text-sm text-muted-foreground">Community growth</p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-shadow hover-lift">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600" data-testid="text-gardeners-count">
                  {stats?.activeGardeners?.toLocaleString() || '0'}+
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Gardeners</h3>
              <p className="text-sm text-muted-foreground">Active helpers</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
