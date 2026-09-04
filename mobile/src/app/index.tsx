import { useRouter } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "../components/ui/SplashScreen";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { useProfileStore } from "../store/profileStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTravelerProfileStore } from "../store/travelerProfileStore";
import { useVehiclesStore } from "../store/vehiclesStore";

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
  const hydrateTravelerProfile = useTravelerProfileStore((s) => s.hydrate);
  const hydrateVehicles = useVehiclesStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrateOnboarding();
    hydrateAuth();
    hydrateVehicles();
    hydrateSettings();
    // Sequenced, not fired in parallel: `hydrateTravelerProfile` reads
    // `profileStore`'s state to seed itself on a first run (see that
    // store's own doc), so it has to wait for that read to actually land
    // instead of racing it and seeding from still-default values.
    (async () => {
      await hydrateProfile();
      await hydrateTravelerProfile();
    })();
  }, [hydrateOnboarding, hydrateAuth, hydrateProfile, hydrateTravelerProfile, hydrateVehicles, hydrateSettings]);

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
