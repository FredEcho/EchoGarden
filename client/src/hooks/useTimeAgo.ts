import { useState, useEffect } from 'react';

export function useTimeAgo(date: string) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const posted = new Date(date);
      const diffInMs = now.getTime() - posted.getTime();
      
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      if (diffInSeconds < 60) {
        setTimeAgo(diffInSeconds <= 1 ? "Just now" : `${diffInSeconds} seconds ago`);
      } else if (diffInMinutes < 60) {
        setTimeAgo(diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`);
      } else if (diffInHours < 24) {
        setTimeAgo(diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`);
      } else if (diffInDays < 7) {
        setTimeAgo(diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`);
      } else if (diffInWeeks < 4) {
        setTimeAgo(diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`);
      } else if (diffInMonths < 12) {
        setTimeAgo(diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`);
      } else {
        setTimeAgo(diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`);
      }
    };

    // Update immediately
    updateTimeAgo();

    // Set up interval to update every minute
    const interval = setInterval(updateTimeAgo, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}
