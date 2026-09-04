import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
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
import { Fredoka_700Bold, useFonts as useFredoka } from "@expo-google-fonts/fredoka";
import { Outfit_400Regular, Outfit_600SemiBold, useFonts as useOutfit } from "@expo-google-fonts/outfit";

import { useTheme } from "../../../contexts/ThemeContext";
import { useOnboardingStore } from "../../../store/onboardingStore";

// Deliberately redeclared per design rather than shared: each OnboardingDesign*
// file stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them. Same reasoning and shape as design 1's `SlideConfig`
// — a distinct type, not the same one reused, since a project could delete
// either design independently.
export interface SlideConfig {
  /** Full-bleed background — a pre-rendered blob/glow illustration, not a photo. */
  background: ImageSourcePropType;
  /** The centered 3D illustration. Transparent PNG, no background baked in. */
  hero: ImageSourcePropType;
  title: string;
  body: string;
}

/**
 * Onboarding — design 2: a fixed near-black canvas with a soft purple glow
 * illustration behind a centered 3D hero per slide, a bold rounded headline,
 * and a muted body line — swiped horizontally, with page dots, "Skip", and a
 * "Back" link once past the first slide.
 *
 * ## Cross-fade, not a slide
 *
 * Each slide's background/hero/text is its own unrelated composition — one
 * blob shape and hero don't line up with the next the way, say, frames of one
 * continuous scene would. Sliding them past each other geometrically (a plain
 * paging `ScrollView` with each slide as a page) put two unrelated pieces of
 * art moving across each other mid-swipe, which read as a collision rather
 * than a transition.
 *
 * The swipe gesture itself still works exactly like a normal pager — this
 * isn't a different INTERACTION, just a different render of the same
 * scroll position. A `ScrollView` still exists and still owns paging: its
 * pages are empty spacers, invisible, present only so the OS gives this the
 * real inertial paging physics a fully custom PanResponder would have to
 * reimplement by hand. The pixels you actually see are a SEPARATE absolute
 * stack of all three slides, each opacity-interpolated from that same scroll
 * position — full at its own page, fading to 0 by one page-width away. Two
 * slides are ever partially visible at once, cross-dissolving, never
 * translating.
 *
 * Only the SETTLED slide (`index`, not the live scroll position) accepts
 * touches — `pointerEvents` on each layer — so a still-fading-out slide
 * underneath can't steal a tap meant for the buttons on top of it.
 *
 * ## Why this palette is fixed, unlike design 1's CTA
 *
 * Design 1's button pulls from `theme.primary.*` because its background is a
 * PHOTO — photos read fine next to any accent colour a project's theme picks.
 * This design's background and hero art are pre-rendered illustrations with a
 * SPECIFIC purple baked into every pixel (the glow, the calendar, the
 * portraits' clothing). Swapping the button and dots to an arbitrary theme
 * accent — this template's default is a yellow-green — would sit visibly
 * wrong against art that was never designed to pair with it. So the whole
 * palette here stays fixed, matching the source design, the same way design
 * 4's glass bar stays a fixed dark regardless of theme because blur needs
 * something dark to blur.
 *
 * ## Fonts
 *
 * `Fredoka` (bold, heavily rounded) for the headline, `Outfit` for
 * everything else — reusing the family design 1 already pays to load rather
 * than introducing a third. Both load locally to this component via
 * `useFonts`, not globally in the root layout, for the same reason design 1's
 * fonts do: this is the only caller, and a project may delete this screen
 * entirely.
 */

const { width, height } = Dimensions.get("window");

const INK = "#ffffff";
const MUTED = "rgba(230,225,240,0.65)";
const ACCENT = "#c9b6f5";
const ACCENT_DIM = "rgba(201,182,245,0.35)";
const BUTTON_BG = "#c9b6f5";
const BUTTON_INK = "#171022";

interface SlideLayerProps {
  slide: SlideConfig;
  slideIndex: number;
  slideCount: number;
  activeIndex: number;
  scrollX: SharedValue<number>;
  insetTop: number;
  insetBottom: number;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * One slide's full composition, opacity-driven by `scrollX` — see the class
 * doc's "Cross-fade, not a slide" section for why this exists instead of a
 * plain paged `ImageBackground`.
 */
function SlideLayer({
  slide,
  slideIndex,
  slideCount,
  activeIndex,
  scrollX,
  insetTop,
  insetBottom,
  onSkip,
  onBack,
  onNext,
}: SlideLayerProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const isActive = slideIndex === activeIndex;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, style]}
      // Only the settled slide is interactive — a layer still fading out
      // underneath the incoming one would otherwise intercept taps meant
      // for whatever's drawn on top of it at the same screen position.
      pointerEvents={isActive ? "auto" : "none"}
    >
      <ImageBackground source={slide.background} resizeMode="cover" style={{ width, height }}>
        <Pressable
          onPress={onSkip}
          hitSlop={8}
          style={({ pressed }) => ({
            position: "absolute",
            top: insetTop + 16,
            right: 24,
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Text style={styles.skip}>Skip</Text>
        </Pressable>

        <View style={styles.heroWrap}>
          <Image source={slide.hero} style={styles.hero} resizeMode="contain" />
        </View>

        <View style={[styles.content, { paddingBottom: insetBottom + 24 }]}>
          <View style={styles.dots}>
            {Array.from({ length: slideCount }, (_, d) => (
              <View key={d} style={[styles.dot, d === slideIndex && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>

          {/* Reserves its row even on slide 1 so the button below never
              shifts height between slides — `opacity`/`disabled` hide it
              instead of conditionally rendering it. */}
          <Pressable
            onPress={onBack}
            hitSlop={8}
            disabled={slideIndex === 0}
            style={({ pressed }) => ({
              // `slideIndex === 0` hides it (see the comment above); pressed
              // is checked separately so the two never fight over one value.
              opacity: slideIndex === 0 ? 0 : pressed ? 0.5 : 1,
              marginBottom: 14,
            })}
          >
            <Text style={styles.back}>Back</Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.ctaLabel}>
              {slideIndex === slideCount - 1 ? "Get started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

export function OnboardingDesign2({ slides }: { slides: SlideConfig[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const [fredokaLoaded] = useFredoka({ Fredoka_700Bold });
  const [outfitLoaded] = useOutfit({ Outfit_400Regular, Outfit_600SemiBold });
  const fontsLoaded = fredokaLoaded && outfitLoaded;

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

  const back = () => {
    if (index === 0) return;
    scrollRef.current?.scrollTo({ x: (index - 1) * width, animated: true });
    setIndex(index - 1);
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
    <View style={{ flex: 1, backgroundColor: "#0b0710" }}>
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

      {/* `box-none`: lets the invisible ScrollView above receive the drag
          that starts this whole cross-fade, while each slide's own
          Pressables (Skip/Back/Next) still claim their own taps normally. */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {slides.map((slide, i) => (
          <SlideLayer
            key={i}
            slide={slide}
            slideIndex={i}
            slideCount={slides.length}
            activeIndex={index}
            scrollX={scrollX}
            insetTop={insets.top}
            insetBottom={insets.bottom}
            onSkip={finish}
            onBack={back}
            onNext={next}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skip: { fontFamily: "Outfit_600SemiBold", fontSize: 15, color: ACCENT },
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  hero: { width: "100%", height: "60%" },
  content: { paddingHorizontal: 32, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT_DIM },
  dotActive: { width: 22, backgroundColor: ACCENT },
  title: {
    fontFamily: "Fredoka_700Bold",
    fontSize: 26,
    color: INK,
    textAlign: "center",
    marginBottom: 10,
  },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 300,
  },
  back: { fontFamily: "Outfit_400Regular", fontSize: 14, color: MUTED },
  cta: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: BUTTON_BG,
  },
  ctaLabel: { fontFamily: "Outfit_600SemiBold", fontSize: 16, color: BUTTON_INK },
});

export default OnboardingDesign2;
