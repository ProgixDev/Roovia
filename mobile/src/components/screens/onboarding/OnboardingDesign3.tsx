import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState, type ReactNode } from "react";
import {
  Dimensions,
  Image,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_800ExtraBold, useFonts } from "@expo-google-fonts/outfit";

import { useTheme } from "../../../contexts/ThemeContext";
import { useOnboardingStore } from "../../../store/onboardingStore";

// Deliberately redeclared per design rather than shared: each OnboardingDesign*
// file stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them. Same shape as design 2's `SlideConfig` — one hero
// image, title, body — since this is that same simple architecture with a
// different skin, not a different structure.
export interface SlideConfig {
  /** The centered illustration. Reuses design 2's own hero assets — see the class doc. */
  hero: ImageSourcePropType;
  title: string;
  body: string;
}

/**
 * Onboarding — design 3: a light, near-white canvas, `theme.logo` at the
 * top, a centered hero, a bold black headline, a muted gray body line,
 * small page dots (the active one an elongated dark pill), and a single
 * purple CTA — swiped horizontally.
 *
 * ## No floating info chip, unlike the first draft of this file
 *
 * The reference's "Open Bid Now" pill is baked into ITS photo — not a
 * separate UI element layered on top, which is what the first version of
 * this component drew instead. This project's actual hero assets (reused
 * from design 2) have no such thing baked in, so faking one as a floating
 * overlay was inventing UI the source design doesn't actually have. Dropped.
 *
 * ## Reuses design 2's assets, not new ones
 *
 * The reference this replicates shows auction photos / seller avatars / a
 * category cluster — none of which exist as assets in this project. Rather
 * than fabricating new illustrations or photos of people who don't exist,
 * this reuses the three hero PNGs design 2 already has (the calendar, the
 * clapper/TV/tickets, the four-portrait cluster), same as design 2's own
 * copy — same content, different chrome around it.
 *
 * ## Colors are literal, not theme tokens for most of the screen…
 *
 * …but `theme.logo` at the top is the one deliberate exception. The
 * reference's mark is ITS OWN product's wordmark ("m – obilanc"), not
 * something to carry into a template with no fixed brand — same call design
 * 3's very first draft made, still true after everything else was rebuilt.
 * Background and text stay a literal hex match to the reference. The CTA
 * button doesn't — the reference's is blue, but this screen's hero art is
 * design 2's own purple-toned illustrations (the calendar's glow, the
 * clapper/TV/tickets scene, the portrait cluster's clothing), so the button
 * follows THOSE assets' purple instead of the reference's blue, same
 * "match what's actually on screen" reasoning design 2's own fixed palette
 * doc note makes.
 *
 * ## Cross-fade, and ONLY over what differs per slide
 *
 * Same mechanism as designs 1 and 2 — a `ScrollView` owns real paging/swipe
 * physics with invisible spacer pages, and what's on screen cross-dissolves
 * off that scroll position rather than translating. See either design's
 * class doc for the fuller reasoning.
 *
 * What's different here: only the hero and the title/body actually change
 * between slides, so only THOSE cross-fade. The logo, the dots, and the CTA
 * are identical on every slide and stay static, outside the fading layers
 * entirely. An earlier version of this file put the dots and CTA inside each
 * per-slide layer, which meant a swipe cross-faded two identical buttons
 * over each other — visible as the button and dots ghosting mid-swipe. A
 * control that doesn't change between slides has no business animating
 * between them.
 *
 * Keeping the footer out of the fading layers is also what keeps the swipe
 * working. Every fading layer is `pointerEvents="none"`, so nothing in the
 * stack can intercept the drag meant for the `ScrollView` underneath — the
 * same property design 1 relies on. The single CTA lives outside that stack,
 * so it needs no `pointerEvents` juggling to stay tappable, and no
 * per-slide `isActive` gating to stop a fading-out copy of itself from
 * stealing the tap (there is no second copy).
 *
 * ## Symmetric footer spacing
 *
 * The gap above the page dots and the gap below them (down to the CTA) are
 * the SAME two `flex: 1` spacer views inside one column, not two
 * independently-sized numbers. Two equal-flex siblings in the same container
 * always split whatever space is left over evenly, so the two gaps stay
 * equal automatically — on any device, whatever the content above them
 * measures — rather than needing to be hand-tuned to match. `minHeight:
 * FOOTER_GAP` on both is only a floor, stopping a short device from
 * squeezing either gap to nothing.
 *
 * This is why the footer is part of one flowing column rather than pinned
 * to the bottom as its own overlay: a bottom-pinned footer's gap above it
 * is always "whatever space is left", which can't be made equal to a fixed
 * gap below the dots.
 */

const { width, height } = Dimensions.get("window");

const PAGE_BG = "#f6f7fb";
const INK = "#141416";
const MUTED = "#8a8f98";
const DOT_INACTIVE = "#dfe2e8";
// Purple, not the reference's blue — see the class doc's "Colors are
// literal…" note: this screen's hero art is design 2's own purple-toned
// illustrations, so the button follows them instead of the source photo.
const BUTTON_TOP = "#b9a3ef";
const BUTTON_BOTTOM = "#8a68d4";

const FOOTER_BASE_PAD = 16;
const FOOTER_DOTS_HEIGHT = 6;
/** Also the two symmetric spacers' `minHeight` floor — see the class doc's "Symmetric footer spacing" note. */
const FOOTER_GAP = 18;
const FOOTER_BUTTON_HEIGHT = 54;

const HERO_HEIGHT = width * 0.85;
/**
 * Fixed, because the per-slide title/body layers are absolutely stacked and
 * so contribute no height of their own. Sized for the longest case the
 * copy realistically reaches (a two-line title plus a three-line body at
 * the sizes below) — a shared fixed height also means the headline sits at
 * exactly the same y on every slide, so nothing shifts as they cross-fade.
 */
const TEXT_BLOCK_HEIGHT = 180;

interface FadeLayerProps {
  slideIndex: number;
  scrollX: SharedValue<number>;
  children: ReactNode;
}

/**
 * One slide's copy of whatever it wraps, opacity-driven by `scrollX` — full
 * at its own page, faded out one page-width away. Always inert: see the
 * class doc's note on why nothing in a fading layer may accept touches.
 */
function FadeLayer({ slideIndex, scrollX, children }: FadeLayerProps) {
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
      {children}
    </Animated.View>
  );
}

export function OnboardingDesign3({ slides }: { slides: SlideConfig[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_600SemiBold, Outfit_800ExtraBold });

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
  // typeface is ready. `theme.background.dark`, not `PAGE_BG`, on purpose:
  // this is the one moment before the fixed palette below has ever painted
  // anything, so it should match the rest of the app's cold-start chrome.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.background.dark }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <StatusBar style="dark" />

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

      {/* `box-none` on this column and `none` on every child except the CTA:
          the drag has to reach the ScrollView above, and a child left at the
          default `auto` would win the hit-test for its own bounds — which,
          between the hero and the text block, is most of the screen. */}
      <View
        style={[styles.column, { paddingTop: insets.top + 20 }]}
        pointerEvents="box-none"
      >
        {/* Static, not per-slide: `theme.logo` is the same image on every
            slide. `tintColor` because this design's fixed palette is
            black/white/purple (see the class doc), so the mark reads as
            pure black chrome regardless of its color elsewhere in the app. */}
        <View pointerEvents="none">
          <Image
            source={theme.logo}
            style={[styles.logo, { tintColor: INK }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.heroWrap} pointerEvents="none">
          {slides.map((slide, i) => (
            <FadeLayer key={i} slideIndex={i} scrollX={scrollX}>
              <View style={styles.heroInner}>
                <Image source={slide.hero} style={styles.hero} resizeMode="contain" />
              </View>
            </FadeLayer>
          ))}
        </View>

        <View style={styles.textBlock} pointerEvents="none">
          {slides.map((slide, i) => (
            <FadeLayer key={i} slideIndex={i} scrollX={scrollX}>
              <View style={styles.textInner}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.body}>{slide.body}</Text>
              </View>
            </FadeLayer>
          ))}
        </View>

        {/* This spacer and its twin below the dots are what make the two
            gaps equal — see the class doc's "Symmetric footer spacing". */}
        <View style={styles.spacer} pointerEvents="none" />

        <View style={styles.dots} pointerEvents="none">
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        <View style={styles.ctaRow}>
          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[BUTTON_TOP, BUTTON_BOTTOM]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.ctaFill}
            >
              <Text style={styles.ctaLabel}>
                {index === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + FOOTER_BASE_PAD }} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { ...StyleSheet.absoluteFillObject },
  logo: { width: 72, height: 72, alignSelf: "center" },

  // Explicit height, not sized to content: the per-slide layers inside are
  // absolutely positioned, so they contribute no height of their own.
  heroWrap: { height: HERO_HEIGHT, marginTop: 40 },
  heroInner: { flex: 1, paddingHorizontal: 56 },
  // `0.85`, not the `0.55` this briefly shrank to: that number was a
  // percentage of an older `flex: 1` wrap's OWN available height (several
  // hundred px on a typical phone), so switching to a fixed height without
  // raising the multiplier silently shrank the asset — same pixel formula,
  // a much smaller result.
  hero: { width: "100%", height: "100%" },

  textBlock: { height: TEXT_BLOCK_HEIGHT, marginTop: 20 },
  textInner: { flex: 1, paddingHorizontal: 32 },
  title: {
    fontFamily: "Outfit_800ExtraBold",
    fontSize: 36,
    color: INK,
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 14,
  },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 17,
    lineHeight: 25,
    color: MUTED,
    textAlign: "center",
    maxWidth: 320,
    alignSelf: "center",
  },

  spacer: { flex: 1, minHeight: FOOTER_GAP },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: FOOTER_DOTS_HEIGHT,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DOT_INACTIVE },
  dotActive: { width: 22, backgroundColor: INK },
  ctaRow: { paddingHorizontal: 24 },
  cta: { width: "100%", height: FOOTER_BUTTON_HEIGHT, borderRadius: 30, overflow: "hidden" },
  ctaFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  ctaLabel: { fontFamily: "Outfit_600SemiBold", fontSize: 16, color: "#ffffff" },
});

export default OnboardingDesign3;
