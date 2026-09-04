import { useRouter } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "../components/ui/SplashScreen";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { useProfileStore } from "../store/profileStore";

const SETUP_ROUTES = ["/setup/traveler", "/setup/vehicle", "/setup/trip"] as const;

export default function Index() {
  const router = useRouter();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const setupStatus = useProfileStore((s) => s.status);
  const setupStep = useProfileStore((s) => s.step);
  const hydrateProfile = useProfileStore((s) => s.hydrate);

  useEffect(() => {
    hydrateOnboarding();
    hydrateAuth();
    hydrateProfile();
  }, [hydrateOnboarding, hydrateAuth, hydrateProfile]);

  const handleSplashComplete = () => {
    // `hasSeenOnboarding`/`isAuthenticated` can still be at their initial
    // values here if hydration is slower than the splash animation — each
    // branch below falls to the more conservative side of that race (show
    // onboarding again, ask to log in again) rather than the alternative,
    // since re-showing recoverable UI beats skipping something that isn't.
    if (!hasSeenOnboarding) {
      router.replace("/onboarding" as any);
      return;
    }
    if (!isAuthenticated) {
      router.replace("/auth" as any);
      return;
    }
    if (setupStatus === "in_progress") {
      router.replace(SETUP_ROUTES[setupStep] as any);
      return;
    }
    router.replace("/(tabs)" as any);
  };

  return <SplashScreen onAnimationComplete={handleSplashComplete} />;
}
