// Removed Community Plan Button - Saved for easy access
// This button was removed from client/src/pages/home.tsx on [current date]
// Location: Action Bar section, lines 145-152

export const CommunityPlanButton = () => {
  return (
    <Button 
      variant="outline" 
      className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
      onClick={() => window.open('/api/community-plan', '_blank')}
      data-testid="button-view-plan"
    >
      📋 View Community Plan
    </Button>
  );
};

// Usage in the Action Bar section:
// <CommunityPlanButton />

// Original location in home.tsx was between the "Share Your Echo" button and the description text
// in the Action Bar section around lines 145-152
