export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsent {
  accepted: boolean;
  timestamp: number;
  preferences: CookiePreferences;
  version: string;
}

const COOKIE_CONSENT_KEY = 'echogarden_cookie_consent';
const COOKIE_VERSION = '1.0.0';

// Cookie utility functions
export function setCookie(name: string, value: string, days: number = 365): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Cookie consent management
export function getCookieConsent(): CookieConsent | null {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return null;
    
    const parsed = JSON.parse(consent) as CookieConsent;
    
    // Check if consent is outdated (older than 1 year)
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    if (parsed.timestamp < oneYearAgo) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

export function setCookieConsent(preferences: CookiePreferences): void {
  const consent: CookieConsent = {
    accepted: true,
    timestamp: Date.now(),
    preferences,
    version: COOKIE_VERSION,
  };
  
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    
    // Set individual preference cookies for server-side access
    setCookie('cookie_consent_analytics', preferences.analytics ? 'true' : 'false', 365);
    setCookie('cookie_consent_marketing', preferences.marketing ? 'true' : 'false', 365);
    setCookie('cookie_consent_preferences', preferences.preferences ? 'true' : 'false', 365);
    
    // Analytics tracking (if enabled)
    if (preferences.analytics) {
      initializeAnalytics();
    }
    
    // Marketing tracking (if enabled)
    if (preferences.marketing) {
      initializeMarketing();
    }
    
    console.log('Cookie preferences saved:', preferences);
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

export function hasCookieConsent(): boolean {
  const consent = getCookieConsent();
  return consent !== null && consent.accepted;
}

export function canUseAnalytics(): boolean {
  const consent = getCookieConsent();
  return consent?.preferences.analytics === true;
}

export function canUseMarketing(): boolean {
  const consent = getCookieConsent();
  return consent?.preferences.marketing === true;
}

export function canUsePreferences(): boolean {
  const consent = getCookieConsent();
  return consent?.preferences.preferences === true;
}

// Analytics initialization (placeholder for future implementation)
function initializeAnalytics(): void {
  // This would integrate with Google Analytics, Mixpanel, etc.
  console.log('Analytics tracking initialized');
  
  // Example: Google Analytics
  // if (typeof gtag !== 'undefined') {
  //   gtag('consent', 'update', {
  //     'analytics_storage': 'granted'
  //   });
  // }
}

// Marketing initialization (placeholder for future implementation)
function initializeMarketing(): void {
  // This would integrate with marketing tools, ad networks, etc.
  console.log('Marketing tracking initialized');
  
  // Example: Facebook Pixel
  // if (typeof fbq !== 'undefined') {
  //   fbq('consent', 'grant');
  // }
}

// Utility to clear all non-necessary cookies
export function clearNonEssentialCookies(): void {
  const consent = getCookieConsent();
  if (!consent) return;
  
  const { preferences } = consent;
  
  if (!preferences.analytics) {
    // Clear analytics cookies
    deleteCookie('_ga');
    deleteCookie('_gid');
    deleteCookie('_gat');
  }
  
  if (!preferences.marketing) {
    // Clear marketing cookies
    deleteCookie('_fbp');
    deleteCookie('_fbc');
  }
  
  if (!preferences.preferences) {
    // Clear preference cookies (except consent itself)
    const preferenceCookies = ['theme', 'language', 'user_preferences'];
    preferenceCookies.forEach(cookie => deleteCookie(cookie));
  }
}

// Utility to update existing consent
export function updateCookieConsent(newPreferences: CookiePreferences): void {
  setCookieConsent(newPreferences);
  clearNonEssentialCookies();
}

// Utility to revoke all consent
export function revokeCookieConsent(): void {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  clearNonEssentialCookies();
  
  // Clear all non-necessary cookies
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName && !cookieName.startsWith('echogarden_') && cookieName !== 'session') {
      deleteCookie(cookieName);
    }
  });
  
  console.log('Cookie consent revoked');
}

// Utility to get cookie banner visibility
export function shouldShowCookieBanner(): boolean {
  return !hasCookieConsent();
}

// Utility to log cookie usage (for debugging)
export function logCookieUsage(): void {
  const consent = getCookieConsent();
  console.log('Current cookie consent:', consent);
  console.log('All cookies:', document.cookie);
  console.log('Analytics enabled:', canUseAnalytics());
  console.log('Marketing enabled:', canUseMarketing());
  console.log('Preferences enabled:', canUsePreferences());
}
