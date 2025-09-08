// Static data for GitHub Pages deployment
// This file provides mock data when the backend is not available

export const staticCategories = [
  { id: 1, name: "Technology", color: "blue" },
  { id: 2, name: "Health & Wellness", color: "green" },
  { id: 3, name: "Education", color: "purple" },
  { id: 4, name: "Career", color: "orange" },
  { id: 5, name: "Relationships", color: "pink" },
  { id: 6, name: "Finance", color: "yellow" },
  { id: 7, name: "Creative", color: "indigo" },
  { id: 8, name: "Lifestyle", color: "teal" }
];

export const staticCommunityStats = {
  totalUsers: 1250,
  helpRequests: 3400,
  responses: 8900,
  seedsPlanted: 15600
};

export const staticHelpRequests = [
  {
    id: 1,
    title: "Need help with React hooks",
    description: "I'm struggling with useState and useEffect. Can someone explain the difference?",
    category: "Technology",
    author: "Sarah M.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    responses: 3,
    isHelpful: false
  },
  {
    id: 2,
    title: "Looking for workout buddy",
    description: "Anyone in the downtown area want to start a morning jogging routine?",
    category: "Health & Wellness",
    author: "Mike T.",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    responses: 1,
    isHelpful: false
  },
  {
    id: 3,
    title: "Budget planning advice",
    description: "First time creating a budget. What categories should I include?",
    category: "Finance",
    author: "Emma L.",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    responses: 5,
    isHelpful: false
  }
];

export const isStaticMode = () => {
  // Check if we're running in static mode (no backend available)
  return typeof window !== 'undefined' && 
         (window.location.hostname === 'github.io' || 
          window.location.hostname.includes('github.io') ||
          window.location.hostname.includes('github.com') ||
          process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL);
};
