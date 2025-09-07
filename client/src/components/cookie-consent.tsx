import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Cookie, Settings, Shield, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onReject: () => void;
}

export function CookieConsent({ onAccept, onReject }: CookieConsentProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const handleAcceptAll = () => {
    onAccept({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleAcceptSelected = () => {
    onAccept(preferences);
  };

  const handleRejectAll = () => {
    onAccept({
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200 shadow-lg"
      >
        <Card className="max-w-4xl mx-auto border-purple-200 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Cookie className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">
                    Cookie Preferences
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    We use cookies to enhance your experience on EchoGarden
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!showDetails ? (
              // Simple view
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  EchoGarden uses cookies to provide essential functionality, analyze usage patterns, 
                  and improve your experience. Some cookies are necessary for the site to function, 
                  while others help us understand how you use our platform.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Accept All Cookies
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRejectAll}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Reject Non-Essential
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(true)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Customize
                  </Button>
                </div>
              </div>
            ) : (
              // Detailed view
              <div className="space-y-6">
                <div className="grid gap-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900">Necessary Cookies</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Essential for the website to function properly. These include authentication, 
                          security, and basic functionality cookies.
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Always Active
                    </Badge>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Analytics Cookies</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Help us understand how visitors interact with our website by collecting 
                          and reporting information anonymously.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={preferences.analytics ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreference('analytics')}
                      className={preferences.analytics 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                      }
                    >
                      {preferences.analytics ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-start justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-900">Preference Cookies</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Remember your settings and preferences to provide a personalized experience.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={preferences.preferences ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreference('preferences')}
                      className={preferences.preferences 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }
                    >
                      {preferences.preferences ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <Cookie className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900">Marketing Cookies</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Used to track visitors across websites to display relevant and engaging ads.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={preferences.marketing ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreference('marketing')}
                      className={preferences.marketing 
                        ? "bg-orange-600 hover:bg-orange-700" 
                        : "border-orange-300 text-orange-700 hover:bg-orange-50"
                      }
                    >
                      {preferences.marketing ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handleAcceptSelected}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Save Preferences
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRejectAll}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Reject Non-Essential
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(false)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Back to Simple View
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              By using EchoGarden, you agree to our{' '}
              <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                Terms of Service
              </a>
              . You can change your cookie preferences at any time.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
