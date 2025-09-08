import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieConsent } from "@/components/cookie-consent";
import { CookieSettings } from "@/components/cookie-settings";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import StaticHome from "@/pages/static-home";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import { isStaticMode } from "@/lib/staticData";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // In static mode, show different routes
  if (isStaticMode()) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/cookies" component={CookieSettings} />
        <Route path="/demo" component={StaticHome} />
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/cookies" component={CookieSettings} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { showBanner, acceptCookies, rejectNonEssential } = useCookieConsent();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        {showBanner && (
          <CookieConsent
            onAccept={acceptCookies}
            onReject={rejectNonEssential}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
