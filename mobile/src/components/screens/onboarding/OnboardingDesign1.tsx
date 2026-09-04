import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular_Italic,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { Outfit_400Regular } from "@expo-google-fonts/outfit";

import { useTheme } from "../../../contexts/ThemeContext";
import { useOnboardingStore } from "../../../store/onboardingStore";

// Deliberately redeclared per design rather than shared: each OnboardingDesign*
// file stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them. Same reasoning and shape as the TabDesign* files.
export interface SlideConfig {
  image: ImageSourcePropType;
  title: string;
  /** Rendered in italic on its own line under `title`. */
  titleItalic: string;
  body: string;
}

/**
 * Onboarding — design 1: full-bleed photo per slide, a dark gradient for
 * text legibility, a serif headline (light weight, its second line in
 * italic for emphasis), and an Outfit body line — swiped horizontally,
 * "Skip" and "Next"/"Get Started" in a fixed footer with page dots.
 *
 * Fonts load locally to this component via `useFonts`, not globally in the
 * root layout: this is the only screen in the app that uses Cormorant
 * Garamond or Outfit, and a project may delete this screen entirely, so
 * paying for two font families app-wide for one caller would outlive it.
 * Render is gated on `fontsLoaded` — the alternative is the system-font
 * flash-then-swap every custom-font screen risks otherwise.
 *
 * The CTA button is `theme.primary.main` → `theme.primary.dark`, not a
 * fixed brand gradient — this repo's whole point is that a project reskins
 * via its own theme, so a hardcoded palette here would be the one piece of
 * this screen that couldn't. The photos, their gradient overlay, and the
 * white slide text stay fixed regardless of theme: they're photographic
 * content sitting on top of the chrome, not the chrome itself.
 *
 * This screen floats over nothing and docks nowhere — it's a full-screen
 * route, not a bar — so unlike the TabDesign* files there's no
 * `TAB_BAR_CLEARANCE`-style export for another screen to reserve space for.
 *
 * ## Cross-fade, not a slide
 *
 * Three unrelated photos sliding past each other mid-swipe (a plain paging
 * `ScrollView`, each slide its own page) read as a collision — same problem
 * design 2's onboarding had with its blob art, same fix: a `ScrollView`
 * still owns the actual swipe/paging physics, but its pages are empty,
 * invisible spacers. What's actually on screen is a separate absolute stack
 * of all three photo+gradient+text blocks, each opacity-interpolated off
 * that same scroll position — full at its own page, fading to 0 a page-width
 * away. Two are ever partially visible at once, dissolving, never
 * translating. See design 2's identical note for the fuller version of this
 * reasoning.
 *
 * Unlike design 2, no `pointerEvents` juggling is needed here: Skip/Next/the
 * dots live in `footer` below, entirely OUTSIDE this per-slide stack, so
 * there is nothing tappable inside a fading layer to accidentally steal a
 * touch in the first place.
 */

const { width, height } = Dimensions.get("window");

interface SlideLayerProps {
  slide: SlideConfig;
  slideIndex: number;
  scrollX: SharedValue<number>;
  insetTop: number;
}

/** One slide's photo/gradient/text, opacity-driven by `scrollX` — see the class doc's "Cross-fade, not a slide" section. */
function SlideLayer({ slide, slideIndex, scrollX, insetTop }: SlideLayerProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, style]} pointerEvents="none">
      <ImageBackground
        source={slide.image}
        resizeMode="cover"
        style={[styles.slide, { width, height }]}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.content, { paddingTop: insetTop + 60 }]}>
          <Text style={styles.title}>
            {slide.title}
            {"\n"}
            <Text style={styles.italic}>{slide.titleItalic}</Text>
          </Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

export function OnboardingDesign1({ slides }: { slides: SlideConfig[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular_Italic,
    Outfit_400Regular,
  });

  const finish = () => {
    markSeen();
    router.replace("/(tabs)" as any);
  };

  const next = () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  // Keeping the splash's own dark background up rather than returning `null`
  // avoids a flash of the system font mid-swipe-gesture-area before the real
  // typeface is ready.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.background.dark }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.dark }}>
      <StatusBar style="light" />

      {/* Owns paging/swipe physics only — nothing here is ever visible. See
          the class doc. */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={StyleSheet.absoluteFillObject}
      >
        {slides.map((_, i) => (
          <View key={i} style={{ width, height }} />
        ))}
      </Animated.ScrollView>

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {slides.map((slide, i) => (
          <SlideLayer key={i} slide={slide} slideIndex={i} scrollX={scrollX} insetTop={insets.top} />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.footerRow}>
          <Pressable
            onPress={finish}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>

          <Pressable onPress={next} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
            <LinearGradient
              colors={[theme.primary.main, theme.primary.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={[styles.ctaLabel, { color: theme.background.dark }]}>
                {index === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { overflow: "hidden" },
  content: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 32, paddingBottom: 150 },
  title: {
    fontFamily: "CormorantGaramond_300Light",
    fontSize: 44,
    color: "#ffffff",
    lineHeight: 46,
    marginBottom: 14,
    maxWidth: 300,
  },
  italic: { fontFamily: "CormorantGaramond_400Regular_Italic" },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: "#ffffff",
    lineHeight: 23,
    opacity: 0.92,
    maxWidth: 320,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
    gap: 20,
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive: { width: 24, backgroundColor: "#ffffff" },
  footerRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skip: { fontFamily: "Outfit_400Regular", fontSize: 14, color: "#ffffff", padding: 8 },
  cta: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
  },
  ctaLabel: { fontFamily: "Outfit_400Regular", fontSize: 15, fontWeight: "600" },
});

export default OnboardingDesign1;
