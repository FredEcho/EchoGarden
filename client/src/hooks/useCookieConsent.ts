import { useState, useEffect } from 'react';
import { 
  getCookieConsent, 
  setCookieConsent, 
  hasCookieConsent, 
  shouldShowCookieBanner,
  type CookiePreferences 
} from '@/lib/cookieUtils';

export function useCookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [consent, setConsent] = useState(getCookieConsent());

  useEffect(() => {
    // Check if we should show the cookie banner
    const shouldShow = shouldShowCookieBanner();
    setShowBanner(shouldShow);
    setIsLoading(false);
  }, []);

  const acceptCookies = (preferences: CookiePreferences) => {
    setCookieConsent(preferences);
    setConsent(getCookieConsent());
    setShowBanner(false);
  };

  const rejectNonEssential = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    acceptCookies(minimalPreferences);
  };

  const acceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    acceptCookies(allPreferences);
  };

  const canUseAnalytics = () => {
    return consent?.preferences.analytics === true;
  };

  const canUseMarketing = () => {
    return consent?.preferences.marketing === true;
  };

  const canUsePreferences = () => {
    return consent?.preferences.preferences === true;
  };

  return {
    showBanner,
    isLoading,
    consent,
    hasConsent: hasCookieConsent(),
    acceptCookies,
    rejectNonEssential,
    acceptAll,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
  };
}
