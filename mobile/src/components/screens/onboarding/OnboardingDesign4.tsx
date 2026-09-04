import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Outfit_400Regular, Outfit_600SemiBold, useFonts as useOutfit } from "@expo-google-fonts/outfit";
import {
  PlayfairDisplay_800ExtraBold_Italic,
  useFonts as usePlayfair,
} from "@expo-google-fonts/playfair-display";

import { useTheme } from "../../../contexts/ThemeContext";
import { useOnboardingStore } from "../../../store/onboardingStore";

// Deliberately redeclared per design rather than shared: each OnboardingDesign*
// file stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them.
export interface SlideConfig {
  /** The floating 3D render. Transparent PNG, no background baked in. */
  hero: ImageSourcePropType;
  /**
   * The headline. One string, not a title/highlight pair: the reference sets
   * the whole headline in a single colour, so splitting it would add a field
   * every slide has to fill for no visible effect.
   */
  title: string;
  body: string;
}

/**
 * Onboarding — design 4: a near-white canvas, a slowly floating 3D render
 * with sparse sparkles around it, a large left-aligned serif-italic
 * headline, a gray body paragraph, and a full-width purple gradient CTA —
 * swiped horizontally, with a "Skip" chip in the header.
 *
 * ## What was ported, and what was left behind
 *
 * Adapted from another project's onboarding screen, which leaned on five of
 * ITS components (`AuroraBackground`, `FloatingAsset`, `Star`,
 * `NeonButton`, `StarTransition`), its own `design` constants module, and
 * its i18n `useT()` hook — none of which exist here. Rather than dragging
 * that dependency tree in for one screen, the ideas worth keeping are
 * reimplemented inline and self-contained below: the floating hero and the
 * animated pill pagination.
 *
 * The source's `Star` sparkles were built here and then removed on request
 * — the canvas is plain white with nothing scattered on it. Restoring them
 * means a small four-point SVG path on a delayed opacity/scale loop, placed
 * absolutely inside `heroBox`.
 *
 * `StarTransition` (a full-screen wipe that played between every slide) was
 * dropped, not ported. It gated `next()` behind a transition callback, so
 * the button couldn't advance until an animation finished — on top of a
 * cross-fade that already IS the transition here, it would be two competing
 * animations for one gesture. The source's `FlatList` + `scrollToIndex`
 * paging and its `useT()` copy were dropped for the same reason the other
 * designs' were: the slide list belongs to the route file, not the skin.
 *
 * The source's `AuroraBackground` was dropped too, after a first version of
 * this file built one: the design it belongs to is a LIGHT screen, and the
 * dark glowing canvas that name implies was this file guessing wrong before
 * seeing the reference. What's here now is a flat white background — no
 * gradient, no glow, no tint.
 *
 * ## Fixed palette, like designs 2 and 3
 *
 * The hero renders are 3D art with a specific purple-and-gold baked into
 * every pixel. Same call as design 2's: a theme accent (this template's
 * default is a yellow-green) next to art that was never designed to pair
 * with it reads as a mistake, so the palette here is fixed. `theme.logo` in
 * the header is the one exception — the mark should still be the project's
 * own.
 *
 * ## Fonts
 *
 * `PlayfairDisplay_800ExtraBold_Italic` for the headline — the reference's
 * is a high-contrast serif italic, which none of the three families already
 * in this repo (Cormorant Garamond, Fredoka, Outfit) provide at that
 * weight. Same call design 2 made when it added Fredoka for its rounded
 * headline. `Outfit` covers everything else rather than introducing a
 * second new family. Both load locally to this component via `useFonts`,
 * not globally in the root layout: this is the only caller, and a project
 * may delete this screen entirely.
 *
 * ## Cross-fade, and ONLY over what differs per slide
 *
 * Same mechanism and same rule as design 3 — see its class doc for the full
 * reasoning. A `ScrollView` owns real paging/swipe physics with invisible
 * spacer pages; the hero and the headline/body cross-dissolve off that
 * scroll position. Everything identical on every slide — the sparkles, the
 * logo, Skip, the pagination, the CTA — stays static, outside the fading
 * layers.
 *
 * That split is also what keeps the swipe working: every fading layer is
 * `pointerEvents="none"`, so nothing in the stack can intercept the drag
 * meant for the `ScrollView` underneath, and the two real controls live
 * outside it so they need no per-slide gating to stay tappable.
 */

const { width, height } = Dimensions.get("window");

const PAGE_BG = "#FFFFFF";
const INK = "#171320";
const MUTED = "#6E6A7A";
const CHIP_BG = "#F2F0F7";
const DOT_INACTIVE = "#D9D5E4";
const BUTTON_TOP = "#8B5CF6";
const BUTTON_BOTTOM = "#6D28D9";

const HERO_SIZE = Math.min(width * 0.62, 260);
const HERO_BOX_HEIGHT = HERO_SIZE + 70;
/**
 * Fixed, because the per-slide headline layers are absolutely stacked and so
 * contribute no height of their own. Sized for the longest case the copy
 * realistically reaches (a two-line headline plus a three-line body at the
 * sizes below); a shared fixed height also means the headline sits at
 * exactly the same y on every slide, so nothing shifts as they cross-fade.
 */
const TEXT_BLOCK_HEIGHT = 210;
const FOOTER_GAP = 22;
const BUTTON_HEIGHT = 58;

/** The hero's slow vertical drift. Purely decorative, and never re-triggered per slide — see the class doc. */
function FloatingAsset({ source }: { source: ImageSourcePropType }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [drift]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: -12 * drift.value }],
  }));

  return (
    <Animated.View style={[styles.heroCenter, animated]}>
      <Image source={source} style={styles.hero} resizeMode="contain" />
    </Animated.View>
  );
}

/** One pagination pill — widens and takes the accent colour when it becomes the active slide. */
function PageBar({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, progress]);

  const animated = useAnimatedStyle(() => ({
    width: 6 + progress.value * 20,
    // Interpolating the colour rather than the opacity keeps the inactive
    // pills a solid light gray — fading them out on a near-white background
    // would make them disappear entirely rather than read as "not current".
    backgroundColor: progress.value > 0.5 ? BUTTON_BOTTOM : DOT_INACTIVE,
  }));

  return <Animated.View style={[styles.bar, animated]} />;
}

interface FadeLayerProps {
  slideIndex: number;
  scrollX: SharedValue<number>;
  children: ReactNode;
}

/**
 * One slide's copy of whatever it wraps, opacity-driven by `scrollX` — full
 * at its own page, faded out one page-width away. Always inert: see the
 * class doc on why nothing in a fading layer may accept touches.
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

export function OnboardingDesign4({ slides }: { slides: SlideConfig[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_800ExtraBold_Italic });
  const [outfitLoaded] = useOutfit({ Outfit_400Regular, Outfit_600SemiBold });
  const fontsLoaded = playfairLoaded && outfitLoaded;

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

  // Holding this screen's own background rather than returning `null` avoids
  // a flash of the system font before the real typefaces are ready — and
  // `PAGE_BG`, not `theme.background.dark`, because this canvas is light: the
  // app's dark cold-start chrome would flash brighter-to-darker-to-brighter.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: PAGE_BG }} />;
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

      {/* `box-none` on this column and `none` on every child except Skip and
          the CTA: the drag has to reach the ScrollView above, and a child
          left at the default `auto` would win the hit-test for its own
          bounds — which, between the hero and the text block, is most of the
          screen. */}
      <View style={[styles.column, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          {/* `tintColor`, not the logo's own colors: this design's fixed
              palette reads as black-on-white chrome (see the class doc), so
              the mark should be flat black here regardless of what color it
              renders as elsewhere in the theme-driven app. */}
          <Image
            source={theme.logo}
            style={[styles.logo, { tintColor: INK }]}
            resizeMode="contain"
          />

          <Pressable
            onPress={finish}
            hitSlop={12}
            style={({ pressed }) => [styles.skipChip, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.heroBox} pointerEvents="none">
          {slides.map((slide, i) => (
            <FadeLayer key={i} slideIndex={i} scrollX={scrollX}>
              <FloatingAsset source={slide.hero} />
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

        <View style={styles.spacer} pointerEvents="none" />

        <View style={styles.pagination} pointerEvents="none">
          {slides.map((_, i) => (
            <PageBar key={i} active={i === index} />
          ))}
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={[BUTTON_TOP, BUTTON_BOTTOM]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaFill}
            >
              <Text style={styles.ctaLabel}>
                {index === slides.length - 1 ? "Get Started" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + 16 }} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { ...StyleSheet.absoluteFillObject },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  logo: { width: 84, height: 44 },
  skipChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
  },
  skipLabel: { fontFamily: "Outfit_400Regular", fontSize: 13, color: MUTED },

  // Explicit height, not sized to content: the per-slide layers inside are
  // absolutely positioned, so they contribute no height of their own.
  heroBox: { height: HERO_BOX_HEIGHT, marginTop: 20 },
  heroCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { width: HERO_SIZE, height: HERO_SIZE },

  textBlock: { height: TEXT_BLOCK_HEIGHT, marginTop: 24 },
  // Left-aligned, matching the reference — the other designs centre their
  // copy, this one does not.
  textInner: { flex: 1, paddingHorizontal: 26 },
  title: {
    fontFamily: "PlayfairDisplay_800ExtraBold_Italic",
    fontSize: 34,
    lineHeight: 44,
    color: INK,
  },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 24,
    color: MUTED,
    marginTop: 18,
  },

  spacer: { flex: 1, minHeight: FOOTER_GAP },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: FOOTER_GAP,
  },
  bar: { height: 6, borderRadius: 3 },

  ctaRow: { paddingHorizontal: 24 },
  cta: {
    width: "100%",
    height: BUTTON_HEIGHT,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: BUTTON_BOTTOM,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaFill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaLabel: { fontFamily: "Outfit_600SemiBold", fontSize: 16, color: "#ffffff" },
});

export default OnboardingDesign4;
