import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Cookie, 
  Settings, 
  Shield, 
  BarChart3, 
  Save, 
  RotateCcw,
  Info
} from 'lucide-react';
import { 
  getCookieConsent, 
  updateCookieConsent, 
  revokeCookieConsent,
  type CookiePreferences 
} from '@/lib/cookieUtils';
import { useToast } from '@/hooks/use-toast';

export function CookieSettings() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setPreferences(consent.preferences);
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateCookieConsent(preferences);
    setHasChanges(false);
    toast({
      title: "Cookie preferences saved",
      description: "Your cookie preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    revokeCookieConsent();
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
    setHasChanges(false);
    toast({
      title: "Cookie preferences reset",
      description: "All non-essential cookies have been cleared.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Cookie className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cookie Settings</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage your cookie preferences for EchoGarden. You can enable or disable 
          different types of cookies based on your privacy preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cookie Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Necessary Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <Label htmlFor="necessary" className="text-base font-semibold">
                    Necessary Cookies
                  </Label>
                  <p className="text-sm text-gray-600">
                    Essential for the website to function properly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Always Active
                </Badge>
                <Switch
                  id="necessary"
                  checked={preferences.necessary}
                  disabled={true}
                />
              </div>
            </div>
            <div className="pl-8 text-sm text-gray-600">
              These cookies are required for basic website functionality including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User authentication and session management</li>
                <li>Security features and CSRF protection</li>
                <li>Basic form functionality</li>
                <li>Essential website features</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="analytics" className="text-base font-semibold">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-gray-600">
                    Help us understand how you use our website
                  </p>
                </div>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
              />
            </div>
            <div className="pl-8 text-sm text-gray-600">
              These cookies collect anonymous information about website usage:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Page views and navigation patterns</li>
                <li>Time spent on pages</li>
                <li>Error tracking and performance monitoring</li>
                <li>User behavior analytics (anonymized)</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Preferences Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <Label htmlFor="preferences" className="text-base font-semibold">
                    Preference Cookies
                  </Label>
                  <p className="text-sm text-gray-600">
                    Remember your settings and preferences
                  </p>
                </div>
              </div>
              <Switch
                id="preferences"
                checked={preferences.preferences}
                onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
              />
            </div>
            <div className="pl-8 text-sm text-gray-600">
              These cookies store your personal preferences:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Theme and display preferences</li>
                <li>Language settings</li>
                <li>Notification preferences</li>
                <li>Custom user interface settings</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-5 w-5 text-orange-600" />
                <div>
                  <Label htmlFor="marketing" className="text-base font-semibold">
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-gray-600">
                    Used for targeted advertising and marketing
                  </p>
                </div>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
              />
            </div>
            <div className="pl-8 text-sm text-gray-600">
              These cookies are used for marketing purposes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ad targeting and personalization</li>
                <li>Social media integration</li>
                <li>Marketing campaign tracking</li>
                <li>Cross-site advertising</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All Cookies
        </Button>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">About Cookie Management</h3>
              <p className="text-sm text-blue-800">
                Your cookie preferences are stored locally in your browser and will be remembered 
                for future visits. You can change these settings at any time. Some features of 
                EchoGarden may not work properly if you disable certain types of cookies.
              </p>
              <p className="text-sm text-blue-800">
                For more information about how we use cookies, please read our{' '}
                <a href="/privacy" className="underline hover:text-blue-900">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


