import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
// Not reanimated's `runOnJS`, which is deprecated as of 4.x — this is its
// replacement for hopping off the UI thread when the animation lands.
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
  useFonts,
} from "@expo-google-fonts/outfit";

import { useTheme } from "../../../contexts/ThemeContext";
import { useOnboardingStore } from "../../../store/onboardingStore";

/**
 * A run of text in one weight. The headline alternates light and bold
 * mid-sentence ("Next-level **fitness** tracking"), which a single string
 * can't express — so both the headline and the body are lists of these
 * rather than plain strings, and a slide chooses where the emphasis falls.
 *
 * No `italic` flag, though the reference italicises one word on one slide:
 * Outfit ships no italic cut, and faux-slanting a custom font is applied
 * inconsistently across iOS and Android. The weight contrast is what
 * actually carries the emphasis here.
 */
export interface Span {
  text: string;
  bold?: boolean;
}

// Deliberately redeclared per design rather than shared: each OnboardingDesign*
// file stands alone, so deleting the ones a project doesn't use leaves nothing
// dangling behind them.
export interface SlideConfig {
  /** Full-bleed photo. Grayscale by design — see the class doc's palette note. */
  photo: ImageSourcePropType;
  /** Optional kicker above the headline ("Welcome to"). Omit on slides that don't want one. */
  eyebrow?: string;
  title: Span[];
  body: Span[];
}

/**
 * Onboarding — design 6: a full-bleed grayscale photo behind a dark scrim,
 * a two-weight headline over a short body line, frosted-glass chrome (a logo
 * chip, segmented progress bars and a "Skip" pill in the header; a round
 * Back button and a labelled arrow pill at the foot) — swiped horizontally
 * or advanced by that pill.
 *
 * ## Weight, not colour, carries the emphasis
 *
 * The headline mixes `Outfit_300Light` and `Outfit_700Bold` inside one
 * sentence, which is why `title` is a list of `Span`s rather than a string.
 * Four weights of one family do the whole screen — no second font, and no
 * accent colour, because there is nothing here for an accent to be: see the
 * palette note below.
 *
 * ## Fixed palette, but for the opposite reason to designs 2–5
 *
 * Those designs fix their palette because their art has a specific colour
 * baked in that a theme accent would clash with. Here the photos are
 * grayscale, so the opposite is true — ANY accent would sit fine on them.
 * The screen is neutral because the reference is: white type, white glass,
 * a near-black CTA. A project that wants its brand colour on this screen can
 * put it on `cta`/`ctaIcon` and nothing else needs to change, which is not
 * true of the other designs. `theme.logo` is used as-is, untinted, since the
 * glass chip it sits in is neutral enough to host any mark.
 *
 * ## Every control is glass
 *
 * The logo chip, Skip, Back and the CTA pill all go through `Glass` rather
 * than each painting its own background, so there is one place to change
 * what "a control on this screen" looks like. See that component for what
 * the three stacked layers are for — and note the Android caveat: without
 * `experimentalBlurMethod`, `expo-blur` silently does nothing there, which
 * turns every one of these into a flat translucent rectangle.
 *
 * The one thing deliberately NOT glass is the dark circle inside the CTA
 * pill. It is the only solid, opaque object on the screen, which is what
 * makes it read as the primary action among four frosted controls that
 * would otherwise all carry the same weight.
 *
 * ## The scrim is not optional
 *
 * These photos fade toward black at the bottom, but not consistently —
 * slide 3's is fogged pale grey exactly where the body text lands. The
 * gradient in `SlideContent` guarantees the contrast the photos only
 * happen to provide, so swapping in a brighter photo can't quietly make the
 * copy unreadable.
 *
 * ## Two transitions, on purpose
 *
 * A swipe cross-dissolves. The CTA does not — it plays a circular reveal
 * centred on the arrow disc inside the pill, the next slide expanding from
 * under your thumb until it covers the screen. Same split, and the same
 * reasoning, as design 5: a swipe is a continuous drag whose progress you
 * control frame by frame, so it needs a transition that can sit
 * half-finished at any point, while a tap is discrete and can afford a
 * directional flourish anchored to the thing you touched.
 *
 * The circle animates its own box and corner radius off one radius value,
 * NOT a `scale` transform — scaling would scale the slide inside it, so the
 * headline would swell from unreadably small rather than holding still while
 * the photo sweeps in. The wrapper within counter-offsets against the same
 * radius to stay pinned to real screen coordinates.
 *
 * Back does the same thing from its own circle on the left, so the sweep
 * always travels out of whichever control you actually pressed — forward
 * from the bottom-right toward the top-left, backward from the bottom-left
 * toward the top-right. The direction of the wipe is the feedback.
 *
 * Only the last slide's CTA skips it: there is no next page to grow into,
 * so it leaves for the app instead.
 *
 * ## Slide content and chrome are separate layers
 *
 * Same mechanism and same rule as designs 3–5 — see design 3's class doc for
 * the full reasoning. A `ScrollView` owns real paging/swipe physics with
 * invisible spacer pages; `SlideContent` (photo, scrim and copy) cross-
 * dissolves off that scroll position. The glass chrome is identical on every
 * slide and stays static above it, which also means it never double-draws
 * mid-swipe the way a duplicated control would.
 *
 * That split is what makes the reveal possible at all: the circle holds a
 * complete `SlideContent` for the incoming slide, so the outgoing headline
 * is covered by it rather than floating above the new page. Both layers lay
 * out against the same `HEADER_HEIGHT` / `TEXT_BLOCK_HEIGHT` /
 * `FOOTER_BLOCK_HEIGHT` constants rather than each eyeballing its own
 * spacing, so the headline lands on exactly the same pixel row inside the
 * circle as on the page underneath — otherwise the reveal would visibly
 * nudge the copy as it passed.
 *
 * Every fading layer is `pointerEvents="none"`, so nothing in the stack can
 * intercept the drag meant for the `ScrollView` underneath, and the real
 * controls live outside it so they need no per-slide gating to stay tappable.
 */

const { width, height } = Dimensions.get("window");

const INK = "#FFFFFF";
const BODY_INK = "rgba(233,236,240,0.82)";
const EYEBROW_INK = "rgba(233,236,240,0.72)";
/** Bright rim. Does most of the work — see `Glass` on why the fill can't. */
const GLASS_BORDER = "rgba(255,255,255,0.32)";
const GLASS_FILL = "rgba(255,255,255,0.07)";
/** Top-edge highlight — what sells the surface as curved glass rather than a flat translucent panel. */
const GLASS_SHEEN = "rgba(255,255,255,0.13)";
const TRACK_DIM = "rgba(255,255,255,0.28)";
const CTA_BG = "#171A1D";
const PAGE_BG = "#101315";

const GUTTER = 24;
const HEADER_TOP_PAD = 8;
const HEADER_HEIGHT = 44;
const CHIP_SIZE = 44;
const SEGMENT_HEIGHT = 3;
const SEGMENT_WIDTH = 34;
/**
 * Fixed, because the per-slide copy layers are absolutely stacked and so
 * contribute no height of their own. Sized for the longest case the copy
 * realistically reaches (an eyebrow, a three-line headline and a three-line
 * body at the sizes below); a shared fixed height also means the headline
 * sits at exactly the same y on every slide, so nothing shifts as they
 * cross-fade.
 */
const TEXT_BLOCK_HEIGHT = 312;
const BACK_SIZE = 52;
const CTA_HEIGHT = 60;
const CTA_ICON_SIZE = 44;
const BOTTOM_PAD = 16;
const FOOTER_MARGIN_TOP = 28;
/** Between the Back button and the CTA pill. Also feeds the reveal's origin, so it can't just live in the stylesheet. */
const FOOTER_ICON_GAP = 12;
/**
 * The footer row's full contribution to the column. `CTA_HEIGHT` because the
 * pill is the tallest thing in that row — see the class doc on why both
 * layers have to lay out against the same numbers.
 */
const FOOTER_BLOCK_HEIGHT = FOOTER_MARGIN_TOP + CTA_HEIGHT;

const REVEAL_DURATION = 620;

/** Renders a `Span[]` as one wrapped paragraph, each run in its own weight. */
function SpanText({ spans, style, boldStyle }: { spans: Span[]; style: object; boldStyle: object }) {
  return (
    <Text style={style}>
      {spans.map((span, i) => (
        <Text key={i} style={span.bold ? boldStyle : undefined}>
          {span.text}
        </Text>
      ))}
    </Text>
  );
}

/** One header segment — widens and brightens when its slide becomes the active one. */
function Segment({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, progress]);

  const animated = useAnimatedStyle(() => ({
    width: SEGMENT_WIDTH + progress.value * 14,
    backgroundColor: progress.value > 0.5 ? INK : TRACK_DIM,
  }));

  return <Animated.View style={[styles.segment, animated]} />;
}

/**
 * A frosted pill or circle — every control on this screen sits in one.
 *
 * ## Dark tint, not light
 *
 * `tint="light"` lays a white haze over whatever it blurs, so on photos this
 * dark it returns flat grey no matter how the intensity is set — an earlier
 * version of this file used it, then tried to rescue the result with a
 * heavier white fill and sheen, which only greyed it further. The wash WAS
 * the problem. `tint="dark"` keeps the photo's own darkness and blurs it,
 * which is the same call `TabDesign4` makes for the same reason.
 *
 * What actually reads as glass on a dark backdrop is the EDGE, not the
 * surface: a bright hairline border plus a top-down sheen suggests a lit
 * rim, and the fill stays low enough that the photo still moves visibly
 * behind it. Push `GLASS_FILL` much past 0.1 and these go back to looking
 * like grey chips.
 *
 * `experimentalBlurMethod` is required for Android to blur at all — without
 * it `expo-blur` no-ops there and the fill is all you get.
 */
function Glass({ style, children }: { style?: object; children: ReactNode }) {
  return (
    <View style={[styles.glass, style]}>
      <BlurView
        intensity={45}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: GLASS_FILL }]} />
      <LinearGradient
        colors={[GLASS_SHEEN, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.75 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

interface SlideContentProps {
  slide: SlideConfig;
  insetTop: number;
  insetBottom: number;
}

/**
 * Everything that differs between slides: the photo, its scrim, and the
 * copy. Drawn both in the per-slide fade layers and inside the reveal
 * circle, which is why its spacing comes from the shared constants above
 * rather than numbers of its own — see the class doc's reveal note.
 */
function SlideContent({ slide, insetTop, insetBottom }: SlideContentProps) {
  return (
    <View style={{ width, height, backgroundColor: PAGE_BG }}>
      <ImageBackground
        source={slide.photo}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      >
        {/* See the class doc: the photos only happen to go dark at the
            bottom, this guarantees it. */}
        <LinearGradient
          colors={["rgba(16,19,21,0.35)", "rgba(16,19,21,0.55)", "rgba(16,19,21,0.94)"]}
          locations={[0, 0.45, 0.85]}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <View style={[styles.column, { paddingTop: insetTop + HEADER_TOP_PAD }]}>
        {/* Stands in for the header the chrome column draws on top. */}
        <View style={{ height: HEADER_HEIGHT }} />

        <View style={styles.spacer} />

        <View style={styles.textBlock}>
          <View style={styles.textInner}>
            {slide.eyebrow ? <Text style={styles.eyebrow}>{slide.eyebrow}</Text> : null}
            <SpanText spans={slide.title} style={styles.title} boldStyle={styles.titleBold} />
            <SpanText spans={slide.body} style={styles.body} boldStyle={styles.bodyBold} />
          </View>
        </View>

        {/* Stands in for the Back button and CTA pill, same. */}
        <View style={{ height: FOOTER_BLOCK_HEIGHT }} />
        <View style={{ height: insetBottom + BOTTOM_PAD }} />
      </View>
    </View>
  );
}

interface FadeLayerProps {
  slideIndex: number;
  scrollX: SharedValue<number>;
  children: ReactNode;
}

/**
 * One slide's copy of whatever it wraps, opacity-driven by `scrollX` — full
 * at its own page, faded out one page-width away. Always inert: see the
 * class doc's last note.
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

export function OnboardingDesign6({
  slides,
  ctaLabel = "Get Started",
}: {
  slides: SlideConfig[];
  /** The pill's label. Constant across slides in the reference, so it lives here rather than in `SlideConfig`. */
  ctaLabel?: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  // The slide currently growing out of the CTA, or `null` when idle. Held in
  // React state (not just a shared value) because the circle has to actually
  // mount a second `SlideContent` while it plays.
  const [revealing, setRevealing] = useState<number | null>(null);
  const revealRadius = useSharedValue(0);
  // Where the circle grows FROM. Shared values rather than constants because
  // the two buttons are at opposite ends of the footer, and each reveal
  // starts at whichever one was pressed.
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  const finish = () => {
    markSeen();
    router.replace("/(tabs)" as any);
  };

  // Both buttons sit on the footer's centre line. Forward grows from the
  // CTA's arrow disc — the actual affordance you press, not the centre of
  // the pill it sits in, which would start the circle somewhere your thumb
  // never touched. Back grows from its own circle over on the left, so each
  // direction visibly comes from the control that caused it.
  const footerCentreY = height - (insets.bottom + BOTTOM_PAD) - CTA_HEIGHT / 2;
  const ctaIconX =
    GUTTER + BACK_SIZE + FOOTER_ICON_GAP + (CTA_HEIGHT - CTA_ICON_SIZE) / 2 + CTA_ICON_SIZE / 2;
  const backX = GUTTER + BACK_SIZE / 2;

  /** Far enough to swallow the whole screen: the distance to whichever corner is furthest from the origin. */
  const radiusToCover = (x: number, y: number) =>
    Math.max(
      Math.hypot(x, y),
      Math.hypot(width - x, y),
      Math.hypot(x, height - y),
      Math.hypot(width - x, height - y),
    );

  /**
   * Lands the page the circle just revealed. Jumping the pager without
   * animation is the point: the reveal already WAS the transition, so a
   * second animated scroll would replay it sideways underneath. `scrollX` is
   * set by hand first so the fade layers are showing the new slide on the
   * same frame the circle disappears, rather than one frame later.
   */
  const commitReveal = (target: number) => {
    scrollX.value = target * width;
    scrollRef.current?.scrollTo({ x: target * width, animated: false });
    setIndex(target);
    setRevealing(null);
    revealRadius.value = 0;
  };

  /** Opens `target` as a circle growing out of (`x`, `y`). Used by both footer buttons. */
  const startReveal = (target: number, x: number, y: number) => {
    setRevealing(target);
    originX.value = x;
    originY.value = y;
    revealRadius.value = 0;
    revealRadius.value = withTiming(
      radiusToCover(x, y),
      { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) },
      (done) => {
        if (done) scheduleOnRN(commitReveal, target);
      },
    );
  };

  const next = () => {
    // Already mid-reveal — ignore, or two circles would race and the second
    // would commit an index the first was still animating toward.
    if (revealing !== null) return;

    if (index >= slides.length - 1) {
      finish();
      return;
    }
    startReveal(index + 1, ctaIconX, footerCentreY);
  };

  const back = () => {
    if (revealing !== null) return;
    if (index === 0) return;
    startReveal(index - 1, backX, footerCentreY);
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

  // Grows the circle itself. Animating the box and its corner radius rather
  // than scaling it is what keeps the slide inside at its true size — a
  // scaled circle would scale its contents too, so the headline would swell
  // from unreadably small instead of holding still while the photo sweeps in.
  const circleStyle = useAnimatedStyle(() => ({
    left: originX.value - revealRadius.value,
    top: originY.value - revealRadius.value,
    width: revealRadius.value * 2,
    height: revealRadius.value * 2,
    borderRadius: revealRadius.value,
  }));

  // Counter-offsets the content against the circle's own moving origin, so
  // the incoming slide stays pinned to real screen coordinates throughout.
  const circleContentStyle = useAnimatedStyle(() => ({
    left: revealRadius.value - originX.value,
    top: revealRadius.value - originY.value,
  }));

  // Holding this screen's own near-black rather than returning `null` avoids
  // a flash of the system font before the real typeface is ready, and is
  // already the colour the first photo's scrim settles to.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: PAGE_BG }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      {/* Light content: every slide is a dark photo under a dark scrim. */}
      <StatusBar style="light" />

      {slides.map((slide, i) => (
        <FadeLayer key={i} slideIndex={i} scrollX={scrollX}>
          <SlideContent slide={slide} insetTop={insets.top} insetBottom={insets.bottom} />
        </FadeLayer>
      ))}

      {/* Owns paging/swipe physics only — nothing here is ever visible. See
          the class doc. */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        // Frozen mid-reveal so a stray drag can't move the pager out from
        // under a circle that is about to commit an index.
        scrollEnabled={revealing === null}
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

      {revealing !== null && (
        <Animated.View style={[styles.revealCircle, circleStyle]} pointerEvents="none">
          <Animated.View style={[styles.revealContent, circleContentStyle]}>
            <SlideContent
              slide={slides[revealing]}
              insetTop={insets.top}
              insetBottom={insets.bottom}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* `box-none` on this column and `none` on every child except the three
          real controls: the drag has to reach the ScrollView above, and a
          child left at the default `auto` would win the hit-test for its own
          bounds — which, for the text block, is most of the lower screen. */}
      <View style={[styles.column, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          {/* Untinted, unlike designs 3–5: the glass chip behind it is
              neutral, so the mark can keep its own colours here. */}
          <Glass style={styles.logoChip}>
            <Image source={theme.logo} style={styles.logo} resizeMode="contain" />
          </Glass>

          {/* `revealing ?? index`, so the segment advances the moment you
              tap rather than 600ms later when the circle lands — it should
              be describing where you are going, not lagging behind it. */}
          <View style={styles.segments} pointerEvents="none">
            {slides.map((_, i) => (
              <Segment key={i} active={i === (revealing ?? index)} />
            ))}
          </View>

          <Pressable onPress={finish} hitSlop={10}>
            {({ pressed }) => (
              <Glass style={[styles.skipChip, { opacity: pressed ? 0.6 : 1 }]}>
                <Text style={styles.skipLabel}>Skip</Text>
              </Glass>
            )}
          </Pressable>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        {/* Stands in for the copy each slide layer draws underneath. */}
        <View style={{ height: TEXT_BLOCK_HEIGHT }} pointerEvents="none" />

        <View style={styles.footer} pointerEvents="box-none">
          <Pressable onPress={back} disabled={index === 0} hitSlop={8}>
            {({ pressed }) => (
              <Glass
                style={[
                  styles.backButton,
                  // Reserves its slot on slide 1 rather than unmounting, so
                  // the pill beside it never shifts between slides.
                  { opacity: index === 0 ? 0.35 : pressed ? 0.6 : 1 },
                ]}
              >
                <Ionicons name="arrow-back" size={20} color={INK} />
              </Glass>
            )}
          </Pressable>

          <Pressable onPress={next} style={styles.ctaPressable}>
            {({ pressed }) => (
              <Glass style={[styles.cta, { opacity: pressed ? 0.85 : 1 }]}>
                <View style={styles.ctaIcon}>
                  <Ionicons name="arrow-forward" size={19} color={INK} />
                </View>
                <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                {/* Decorative motion cue, matching the reference's trailing
                    chevrons — fading outward so it reads as a direction
                    rather than three separate glyphs. */}
                <View style={styles.chevrons}>
                  {[0.75, 0.45, 0.22].map((opacity, i) => (
                    <Ionicons
                      key={i}
                      name="chevron-forward"
                      size={13}
                      color={INK}
                      style={{ opacity, marginLeft: i === 0 ? 0 : -4 }}
                    />
                  ))}
                </View>
              </Glass>
            )}
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + BOTTOM_PAD }} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { ...StyleSheet.absoluteFillObject },

  glass: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_HEIGHT,
    paddingHorizontal: GUTTER,
  },
  logoChip: { width: CHIP_SIZE, height: CHIP_SIZE, borderRadius: CHIP_SIZE / 2 },
  logo: { width: CHIP_SIZE * 0.56, height: CHIP_SIZE * 0.56 },
  segments: { flexDirection: "row", alignItems: "center", gap: 6 },
  segment: { height: SEGMENT_HEIGHT, borderRadius: SEGMENT_HEIGHT / 2 },
  skipChip: { paddingHorizontal: 18, height: 36, borderRadius: 18 },
  skipLabel: { fontFamily: "Outfit_500Medium", fontSize: 14, color: INK },

  spacer: { flex: 1 },

  textBlock: { height: TEXT_BLOCK_HEIGHT },
  textInner: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "flex-end" },
  eyebrow: {
    fontFamily: "Outfit_400Regular",
    fontSize: 17,
    color: EYEBROW_INK,
    marginBottom: 6,
  },
  // At this size no two-word pairing in the copy fits on one line any more,
  // so the route file breaks every headline into three explicit lines. Raise
  // this further and those breaks need revisiting again — the constraint is
  // the longest single WORD plus its neighbour, not the font size alone.
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 52,
    lineHeight: 60,
    color: INK,
  },
  titleBold: { fontFamily: "Outfit_700Bold" },
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 18,
    lineHeight: 26,
    color: BODY_INK,
    marginTop: 16,
    maxWidth: 340,
  },
  bodyBold: { fontFamily: "Outfit_700Bold", color: INK },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: FOOTER_ICON_GAP,
    paddingHorizontal: GUTTER,
    marginTop: FOOTER_MARGIN_TOP,
    height: CTA_HEIGHT,
  },
  backButton: { width: BACK_SIZE, height: BACK_SIZE, borderRadius: BACK_SIZE / 2 },
  // `flex: 1` so the pill takes whatever the Back button leaves, rather than
  // being sized to its label — the reference's runs to the screen edge.
  ctaPressable: { flex: 1 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    height: CTA_HEIGHT,
    borderRadius: CTA_HEIGHT / 2,
    paddingLeft: (CTA_HEIGHT - CTA_ICON_SIZE) / 2,
    paddingRight: 18,
    justifyContent: "flex-start",
  },
  ctaIcon: {
    width: CTA_ICON_SIZE,
    height: CTA_ICON_SIZE,
    borderRadius: CTA_ICON_SIZE / 2,
    backgroundColor: CTA_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    fontFamily: "Outfit_500Medium",
    fontSize: 15,
    color: INK,
    marginLeft: 14,
    flex: 1,
  },
  chevrons: { flexDirection: "row", alignItems: "center" },

  revealCircle: { position: "absolute", overflow: "hidden" },
  revealContent: { position: "absolute", width, height },
});

export default OnboardingDesign6;
