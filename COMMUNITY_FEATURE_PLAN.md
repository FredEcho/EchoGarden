# 🌱 EchoGarden Community Feature Implementation Plan

## Overview
This document outlines the implementation plan for adding creator communities to EchoGarden, allowing creators to build their own spaces for more personal discussions.

## 🏗️ Database Schema

### New Tables

```sql
-- Creator communities
CREATE TABLE creator_communities (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Community memberships
CREATE TABLE community_memberships (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'creator', 'moderator', 'member'
  joined_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (community_id) REFERENCES creator_communities(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(community_id, user_id)
);

-- Community-specific help requests (more personal)
CREATE TABLE community_help_requests (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (community_id) REFERENCES creator_communities(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔌 API Endpoints

### New Routes to Add

```typescript
// Community Discovery
GET /api/communities
- List all public communities
- Returns: { communities: Community[] }

GET /api/communities/:slug
- Get specific community details
- Returns: { community: Community, members: User[], helpRequests: HelpRequest[] }

// Community Management
POST /api/communities
- Create new community (creators only)
- Body: { name, description, isPrivate, maxMembers }
- Returns: { community: Community }

POST /api/communities/:id/join
- Join a community
- Returns: { success: boolean, membership: Membership }

DELETE /api/communities/:id/leave
- Leave a community
- Returns: { success: boolean }

// Community Content
GET /api/communities/:id/help-requests
- Get community-specific help requests
- Returns: { helpRequests: HelpRequest[] }

POST /api/communities/:id/help-requests
- Post to community (more personal)
- Body: { title, content, isAnonymous }
- Returns: { helpRequest: HelpRequest }

GET /api/communities/:id/members
- Get community members
- Returns: { members: User[] }
```

## 🎨 Frontend Components

### New Pages

#### 1. Communities Discovery Page (`/communities`)
```typescript
// client/src/pages/communities.tsx
export function CommunitiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Creator Communities</h1>
      
      {/* Featured Communities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Communities</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredCommunities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>

      {/* All Communities */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">All Communities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

#### 2. Individual Community Page (`/communities/:slug`)
```typescript
// client/src/pages/community.tsx
export function CommunityPage() {
  const { slug } = useParams();
  const { community, helpRequests, members } = useCommunity(slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{community.name}</h1>
            <p className="text-muted-foreground mt-2">{community.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-sm text-muted-foreground">
                👥 {members.length} members
              </span>
              <span className="text-sm text-muted-foreground">
                🌱 {helpRequests.length} discussions
              </span>
            </div>
          </div>
          <JoinCommunityButton community={community} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <CommunityHelpRequests 
            communityId={community.id}
            requests={helpRequests}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CommunityMembers members={members} />
          <CommunityRules community={community} />
        </div>
      </div>
    </div>
  );
}
```

#### 3. Creator Dashboard (`/creator-dashboard`)
```typescript
// client/src/pages/creator-dashboard.tsx
export function CreatorDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Creator Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Community */}
        <Card>
          <CardHeader>
            <CardTitle>Create Community</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCommunityForm />
          </CardContent>
        </Card>

        {/* My Communities */}
        <Card>
          <CardHeader>
            <CardTitle>My Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <MyCommunitiesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### New Components

#### Community Card
```typescript
// client/src/components/community-card.tsx
export function CommunityCard({ community }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={community.creator.profileImageUrl} />
            <AvatarFallback>{community.creator.firstName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{community.name}</h3>
            <p className="text-sm text-muted-foreground">
              by {community.creator.firstName} {community.creator.lastName}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {community.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>👥 {community.memberCount}</span>
            <span>🌱 {community.discussionCount}</span>
          </div>
          <Button size="sm" variant="outline">
            {community.isPrivate ? 'Request Join' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Community Help Requests
```typescript
// client/src/components/community-help-requests.tsx
export function CommunityHelpRequests({ communityId, requests }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Discussions</h2>
        <Button className="gradient-purple-orange">
          🌱 Start Discussion
        </Button>
      </div>

      {requests.map(request => (
        <CommunityHelpRequestCard 
          key={request.id} 
          request={request}
          isPersonal={true} // More personal than public echoes
        />
      ))}
    </div>
  );
}
```

## 🔗 New Hooks

```typescript
// client/src/hooks/useCommunities.ts
export function useCommunities() {
  return useQuery({
    queryKey: ['/api/communities'],
    queryFn: () => fetch('/api/communities').then(res => res.json())
  });
}

// client/src/hooks/useCommunity.ts
export function useCommunity(slug: string) {
  return useQuery({
    queryKey: ['/api/communities', slug],
    queryFn: () => fetch(`/api/communities/${slug}`).then(res => res.json())
  });
}

// client/src/hooks/useCommunityMemberships.ts
export function useCommunityMemberships(userId: string) {
  return useQuery({
    queryKey: ['/api/user/communities', userId],
    queryFn: () => fetch(`/api/user/communities`).then(res => res.json())
  });
}
```

## 🧭 Navigation Updatesaccountrun 

### App.tsx Routes
```typescript
// client/src/App.tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/communities" element={<CommunitiesPage />} />
  <Route path="/communities/:slug" element={<CommunityPage />} />
  <Route path="/creator-dashboard" element={<CreatorDashboard />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/auth" element={<Auth />} />
</Routes>
```

### Navigation Component
```typescript
// client/src/components/navigation.tsx
<nav className="flex items-center space-x-6">
  <Link to="/" className="hover:text-primary">Home</Link>
  <Link to="/communities" className="hover:text-primary">Communities</Link>
  <Link to="/creator-dashboard" className="hover:text-primary">Creator Tools</Link>
  <Link to="/profile" className="hover:text-primary">Profile</Link>
</nav>
```

## 🎯 Key Features

### For Creators:
- ✅ Create branded community spaces
- ✅ Set community rules and guidelines
- ✅ Moderate discussions
- ✅ Build a following around their expertise
- ✅ Monetization potential (premium communities)
- ✅ Analytics dashboard for community growth

### For Members:
- ✅ Join communities based on interests
- ✅ More personal, intimate discussions
- ✅ Direct access to creators
- ✅ Smaller, focused groups
- ✅ Anonymous posting options for sensitive topics
- ✅ Community-specific garden items

### Community Types:
- **Public**: Anyone can join and see discussions
- **Private**: Invite-only or approval required
- **Premium**: Paid access to creator's expertise

## 🔄 Integration with Existing System

### XP System
- Community participation earns XP
- Creating communities gives bonus XP
- Helping in communities provides XP multipliers

### Garden System
- Community help creates special community-themed plants
- Different plant types for different community activities
- Community-specific garden layouts

### Categories
- Communities can have their own categories
- Cross-community category discovery
- Community-specific help request categorization

### User Profiles
- Show community memberships
- Display creator status and communities
- Community contribution history

## 📱 Mobile Considerations

- Responsive community cards
- Touch-friendly community navigation
- Mobile-optimized community discussions
- Swipe gestures for community discovery

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure
1. Database schema implementation
2. Basic API endpoints
3. Community creation and joining
4. Basic community pages

### Phase 2: Content & Interaction
1. Community-specific help requests
2. Member management
3. Community discussions
4. Basic moderation tools

### Phase 3: Advanced Features
1. Creator dashboard
2. Community analytics
3. Premium communities
4. Advanced moderation
5. Community discovery algorithms

### Phase 4: Polish & Optimization
1. Performance optimization
2. Advanced UI/UX
3. Mobile app integration
4. Community growth tools

## 🎨 Design Consistency

- Maintain EchoGarden's glass-morphism design
- Use existing color scheme (purple-orange gradients)
- Consistent with current component library
- Responsive design patterns
- Accessibility considerations

## 🔒 Security Considerations

- Community privacy controls
- Content moderation tools
- User role management
- Data protection for private communities
- Spam prevention
- Community reporting system

---

*This implementation plan maintains EchoGarden's core philosophy while extending it to support creator communities and more intimate discussions.*
