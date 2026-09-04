import {
  OnboardingDesign6 as OnboardingDesign,
  type SlideConfig,
} from "../../components/screens/onboarding/OnboardingDesign6";

// The slide list. The screen's look lives in the OnboardingDesign* component
// — swap the single import above (OnboardingDesign1 … 6) to reskin without
// touching this, same as the tab bar's TabDesign* files.
//
// `title` and `body` are lists of runs rather than strings so the emphasis
// can fall mid-sentence: `bold: true` switches that run to the heavy weight.
// Mind the spaces at the run boundaries — they are not inserted for you.
const SLIDES: SlideConfig[] = [
  {
    photo: require("../../../assets/images/onboarding/onboarding-photo-sprint.png"),
    eyebrow: "Welcome to",
    title: [{ text: "Next-level\n" }, { text: "fitness", bold: true }, { text: " tracking" }],
    body: [
      { text: "Track your runs, rides and workouts with " },
      { text: "real-time GPS precision", bold: true },
      { text: " and progress insights." },
    ],
  },
  {
    photo: require("../../../assets/images/onboarding/onboarding-photo-training.png"),
    title: [{ text: "Visualize Your\n" }, { text: "Fitness Progress", bold: true }],
    body: [
      { text: "Charts and insights that help you understand your performance and stay motivated." },
    ],
  },
  {
    photo: require("../../../assets/images/onboarding/onboarding-photo-community.png"),
    title: [{ text: "You're in " }, { text: "Good\nCompany!", bold: true }],
    body: [
      { text: "Connect with millions of other people training for something worth showing up for." },
    ],
  },
];

export default function OnboardingRoute() {
  return <OnboardingDesign slides={SLIDES} ctaLabel="Start Tracking" />;
}
