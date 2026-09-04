import { useRouter } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "../components/ui/SplashScreen";
import { useOnboardingStore } from "../store/onboardingStore";

export default function Index() {
  const router = useRouter();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSplashComplete = () => {
    // `hasSeenOnboarding` can still be `null` here if hydration is slower
    // than the splash animation — falls through to onboarding rather than
    // the main app in that race, since showing the intro slides an extra
    // time is recoverable and skipping them for a first-run user isn't.
    router.replace((hasSeenOnboarding ? "/(tabs)" : "/onboarding") as any);
  };

  return <SplashScreen onAnimationComplete={handleSplashComplete} />;
}
