import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState, type ReactNode } from "react";
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
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "../../constants/fonts";
import { useTheme } from "../../contexts/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";

/**
 * Onboarding — a full-bleed colour photo per slide with the copy living in
 * the flat colour below the subject, a heavy headline, a small body line, a
 * bare "Skip" in the header, and a white squircle arrow button in the
 * bottom-right corner — swiped horizontally, or advanced by that button,
 * which opens the next slide as a circle growing out of itself.
 *
 * ## Two transitions, on purpose
 *
 * A swipe cross-dissolves. The button does NOT — it plays a circular reveal
 * centred on the button, the next slide expanding from under your thumb
 * until it covers the screen. A swipe is a continuous drag whose progress
 * you control frame by frame, so it needs a transition that can sit
 * half-finished at any point; a tap is discrete and can afford a
 * directional flourish anchored to the thing you touched.
 *
 * The reveal is a circle whose `left`/`top`/`width`/`height`/`borderRadius`
 * all animate off one radius value, NOT a `scale` transform — a scaled
 * circle would scale the slide inside it too, so the headline would swell
 * from unreadably small to full size instead of holding still while the
 * colour sweeps past it. The content wrapper inside counter-offsets against
 * the same radius so it stays pinned to real screen coordinates throughout.
 *
 * On the last slide the button leaves for the app rather than revealing
 * anything — there is no next slide to grow into.
 *
 * ## Slide content and chrome are separate layers
 *
 * `SlideContent` (photo + headline + body) is everything that differs
 * between slides; the header and the arrow button are identical on all
 * three and live in a separate column drawn above it. That split is what
 * makes the reveal possible at all: the circle holds a complete
 * `SlideContent` for the incoming slide, so the outgoing headline is
 * covered by it rather than floating above the new page.
 *
 * Both layers lay out against the same `HEADER_HEIGHT` / `TEXT_BLOCK_HEIGHT`
 * / `BUTTON_BLOCK_HEIGHT` constants rather than each eyeballing its own
 * spacing, so the headline lands on exactly the same pixel row in the
 * circle as it does on the page underneath — otherwise the reveal would
 * visibly nudge the text as it passed.
 *
 * ## The photo IS the background
 *
 * The art is a full-bleed photograph with its colour baked in, so there is
 * no separate background to theme: the slide's `bg` hex exists only to
 * blend the edges (see `SlideConfig.bg`) and letterbox a phone whose aspect
 * ratio is wider than the photo. That also bounds where the copy can go:
 * the photos put their subject in the top third, so the headline lives in
 * the flat colour underneath it, sitting low near the button row via a pair
 * of spacers whose flex values differ sharply — not a single spacer, which
 * would either centre the block or glue it flush to the button with no gap.
 *
 * ## Fixed palette, no theme accent
 *
 * The three photos are Roovia-orange, lake-blue and moss-green — no single
 * accent sits on all three, and two of the three are dark enough that ink
 * text on them is hard to read. So everything drawn directly on a photo
 * (headline, body, skip label, the logo mark) is light instead — a warm
 * paper-cream, softened for the body copy — fixed regardless of the
 * device's light/dark setting, since onboarding is a brand moment, not a
 * themed screen. The one exception is the arrow button: it keeps a white
 * fill with a dark icon, since that circle is never sitting on the photo
 * itself.
 *
 * ## Progress lives on the button, not a row of dots
 *
 * The progress indicator is an arc running around the INSIDE of the
 * button — one slide's worth filled per slide, clockwise from top-centre,
 * complete on the last — so the control you press and the thing telling
 * you how far you've come are one object rather than two.
 *
 * The arc is the one thing on screen that is neither ink nor white: it
 * takes the current page's own `bg`, interpolated between two mid-swipe.
 * The button is the only white object on a saturated page, so tinting the
 * arc is what ties it back to the slide it belongs to.
 *
 * `ProgressRing` follows the live scroll position, not the settled index,
 * so a half-finished swipe leaves the arc half-way between two stops and a
 * cancelled one carries it back.
 *
 * ## Swipe safety
 *
 * Every fading layer is `pointerEvents="none"`, so nothing in the stack can
 * intercept the drag meant for the `ScrollView` underneath; the two real
 * controls live outside it so they need no per-slide gating to stay
 * tappable.
 */

interface SlideConfig {
  /**
   * Full-bleed photo. The background colour is baked into the image —
   * these are shot with the subject in the top third and flat colour
   * below, which is the empty room the headline sits in.
   */
  photo: ImageSourcePropType;
  /**
   * The photo's own background colour, as a hex, sampled from the image
   * itself. Painted behind the image so that a phone whose aspect ratio is
   * wider than the photo blends into it instead of showing a letterboxed
   * edge — and so the cross-fade between two slides passes through their
   * colours rather than through black.
   */
  bg: string;
  title: string;
  body: string;
}

const SLIDES: SlideConfig[] = [
  {
    photo: require("../../../assets/images/onboarding/onboarding-plan.png"),
    bg: "#E54A01",
    title: "Plan your road\ntrip",
    body: "Tell us where you're headed and what you drive — the route, the stops and the budget come back already planned.",
  },
  {
    photo: require("../../../assets/images/onboarding/onboarding-drive.png"),
    bg: "#145A76",
    title: "The road\nadapts to you",
    body: "Fuel, water, dump stations, wherever the road turns next — recalculated the moment your plans change.",
  },
  {
    photo: require("../../../assets/images/onboarding/onboarding-share.png"),
    bg: "#495026",
    title: "Share the\njourney",
    body: "Log the road as you go, then share the whole story with everyone who wasn't there for it.",
  },
];

const { width, height } = Dimensions.get("window");

// Headline, body and the header logo all sit directly on a saturated photo
// background (orange/blue/green) with nothing behind them — dark ink read
// poorly there, especially on the blue and green slides, so this text is
// light instead: a warm paper-cream, softened for the body copy.
const TEXT = "#EDEADA";
const TEXT_MUTED = "rgba(237,234,218,0.82)";
// The chevron sits INSIDE the white circular button, not on the photo, so it
// keeps the original dark ink regardless of the text color above.
const INK = "#1B241C";
const BUTTON_BG = "#FFFFFF";

const GUTTER = 26;
const HEADER_TOP_PAD = 10;
const HEADER_HEIGHT = 46;
/**
 * Fixed, because the per-slide headline layers are absolutely stacked and so
 * contribute no height of their own. Sized for the longest case the copy
 * realistically reaches (a two-line headline plus a three-line body at the
 * sizes below); a shared fixed height also means the headline sits at
 * exactly the same y on every slide, so nothing shifts as they cross-fade.
 */
const TEXT_BLOCK_HEIGHT = 302;
const BUTTON_SIZE = 66;
const BUTTON_RADIUS = 22;
const BUTTON_ROW_GAP = 34;
const BOTTOM_PAD = 20;

const RING_STROKE = 3;
/** Gap between the button's own edge and the ring's outer edge — the ring sits INSIDE the button. */
const RING_INSET = 6;
/** Top-left of the stroke's centreline, half a stroke in from the inset so the stroke's outer edge lands on it. */
const RING_ORIGIN = RING_INSET + RING_STROKE / 2;
const RING_SIDE = BUTTON_SIZE - 2 * RING_ORIGIN;
/** Concentric with the button's own corner, stepped in by the same amount the ring is. */
const RING_RADIUS = BUTTON_RADIUS - RING_ORIGIN;
/**
 * The path's own length — the four straight runs plus the four quarter-circles
 * that join them, which together make one full circle. The dash pattern is set
 * to this so that dashing off a fraction of it draws exactly that fraction of
 * the way around.
 */
const RING_PERIMETER = 4 * (RING_SIDE - 2 * RING_RADIUS) + 2 * Math.PI * RING_RADIUS;

/**
 * Hand-built rather than a `<Rect>`, for two reasons a rect can't give:
 * it starts at TOP-CENTRE (a rect's path starts at its top-left corner), and
 * its direction is explicit. Every arc here uses sweep-flag 1, which in SVG's
 * y-down coordinate system is clockwise — an earlier version leaned on
 * `<Rect>`'s implicit path direction and filled the wrong way round.
 *
 * `Z` closes the loop by running from the last corner back to top-centre, so
 * the top edge is split into the first segment drawn and the last.
 */
const RING_PATH = [
  `M ${RING_ORIGIN + RING_SIDE / 2} ${RING_ORIGIN}`,
  `H ${RING_ORIGIN + RING_SIDE - RING_RADIUS}`,
  `A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${RING_ORIGIN + RING_SIDE} ${RING_ORIGIN + RING_RADIUS}`,
  `V ${RING_ORIGIN + RING_SIDE - RING_RADIUS}`,
  `A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${RING_ORIGIN + RING_SIDE - RING_RADIUS} ${RING_ORIGIN + RING_SIDE}`,
  `H ${RING_ORIGIN + RING_RADIUS}`,
  `A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${RING_ORIGIN} ${RING_ORIGIN + RING_SIDE - RING_RADIUS}`,
  `V ${RING_ORIGIN + RING_RADIUS}`,
  `A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${RING_ORIGIN + RING_RADIUS} ${RING_ORIGIN}`,
  "Z",
].join(" ");

/** The button row's full contribution to the column — see the file doc on why both layers share these numbers. */
const BUTTON_BLOCK_HEIGHT = BUTTON_ROW_GAP + BUTTON_SIZE;

const REVEAL_DURATION = 620;

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ProgressRingProps {
  /** Continuous slide position — `0` on the first slide, `slideCount - 1` on the last. */
  pageProgress: SharedValue<number>;
  /** Each slide's `bg`, in order. The arc takes the colour of the page it is sitting on. */
  colors: string[];
}

/**
 * The arc tracing the inside of the button: one slide's worth of it filled
 * per slide, so it reads full by the last one. The dash pattern is set to
 * the path's own perimeter, which turns "how far around" into a single
 * `strokeDashoffset` number.
 *
 * The arc is drawn in the CURRENT PAGE'S colour, interpolated between the
 * two it is between mid-swipe — the button is the only white object on a
 * saturated page, so tinting the arc is what ties it back to the slide it
 * belongs to. The unfilled track stays a neutral gray, which reads on white
 * regardless of which page is behind it.
 *
 * It follows `pageProgress` continuously rather than snapping per slide, so
 * a half-finished swipe leaves the arc half-way between two stops — the same
 * reason the slides themselves cross-fade off the live scroll position
 * rather than the settled index.
 */
function ProgressRing({ pageProgress, colors }: ProgressRingProps) {
  // `interpolateColor` needs at least two stops; a one-slide list would
  // otherwise throw rather than simply never moving.
  const stops = colors.length > 1 ? colors : [colors[0] ?? INK, colors[0] ?? INK];
  const inputRange = stops.map((_, i) => i);

  const animatedProps = useAnimatedProps(() => {
    const fraction = Math.min(1, Math.max(0, (pageProgress.value + 1) / colors.length));
    return {
      strokeDashoffset: RING_PERIMETER * (1 - fraction),
      stroke: interpolateColor(pageProgress.value, inputRange, stops),
    };
  });

  return (
    <Svg
      width={BUTTON_SIZE}
      height={BUTTON_SIZE}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {/* The unfilled remainder. */}
      <Path
        d={RING_PATH}
        fill="none"
        stroke="rgba(0,0,0,0.10)"
        strokeWidth={RING_STROKE}
      />
      <AnimatedPath
        d={RING_PATH}
        fill="none"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={[RING_PERIMETER, RING_PERIMETER]}
        animatedProps={animatedProps}
      />
    </Svg>
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
 * file doc's swipe-safety note.
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

interface SlideContentProps {
  slide: SlideConfig;
  insetTop: number;
  insetBottom: number;
}

/**
 * Everything that differs between slides: the full-bleed photo and the copy
 * sitting in the flat colour below its subject. Drawn both in the per-slide
 * fade layers and inside the reveal circle, which is why its spacing comes
 * from the shared constants above rather than from numbers of its own — see
 * the file doc.
 */
function SlideContent({ slide, insetTop, insetBottom }: SlideContentProps) {
  return (
    <View style={{ width, height, backgroundColor: slide.bg }}>
      <ImageBackground
        source={slide.photo}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.column, { paddingTop: insetTop + HEADER_TOP_PAD }]}>
        {/* Stands in for the header the chrome column draws on top. */}
        <View style={{ height: HEADER_HEIGHT }} />

        <View style={styles.spacer} />

        <View style={styles.textBlock}>
          <View style={styles.textInner}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        </View>

        {/* Partner to the spacer above the copy: the two split the leftover
            room between them, and this one taking almost none of it is what
            settles the block low, just above the button row. The chrome
            column has the identical pair. */}
        <View style={styles.spacerBelow} />

        {/* Stands in for the arrow button, same. */}
        <View style={{ height: BUTTON_BLOCK_HEIGHT }} />
        <View style={{ height: insetBottom + BOTTOM_PAD }} />
      </View>
    </View>
  );
}

export default function OnboardingRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  // The slide currently growing out of the button, or `null` when idle. Held
  // in React state (not just a shared value) because the circle has to
  // actually mount a second `SlideContent` while it plays.
  const [revealing, setRevealing] = useState<number | null>(null);
  const revealRadius = useSharedValue(0);

  // Drives the ring. Not just `scrollX / width`: the pager is frozen during
  // a button reveal, so during those ~600ms the scroll position says nothing
  // and this is animated by hand instead. Both paths converge on the same
  // number, so the ring never jumps at the handover.
  const pageProgress = useSharedValue(0);

  // No local `useFonts` here: the root layout loads every design-system
  // font once, globally, and holds the whole app at the splash screen until
  // that's done — so by the time this screen ever mounts, `fonts.*` is
  // already safe to use.

  // The button's centre in screen coordinates, derived from the same
  // constants that lay it out rather than measured — `onLayout` would leave
  // the first tap with nothing to animate from.
  const buttonX = width - GUTTER - BUTTON_SIZE / 2;
  const buttonY = height - (insets.bottom + BOTTOM_PAD) - BUTTON_SIZE / 2;

  const ringColors = SLIDES.map((s) => s.bg);
  // Far enough to swallow the whole screen: the distance to whichever corner
  // is furthest from the button.
  const revealTarget = Math.max(
    Math.hypot(buttonX, buttonY),
    Math.hypot(width - buttonX, buttonY),
    Math.hypot(buttonX, height - buttonY),
    Math.hypot(width - buttonX, height - buttonY),
  );

  const finish = () => {
    markSeen();
    router.replace("/(tabs)" as any);
  };

  /**
   * Lands the page the circle just revealed. Jumping the pager without
   * animation is the point: the reveal already WAS the transition, so a
   * second animated scroll would replay it sideways underneath. `scrollX` is
   * set by hand first so the fade layers are showing the new slide on the
   * same frame the circle disappears, rather than one frame later.
   */
  const commitReveal = (target: number) => {
    scrollX.value = target * width;
    pageProgress.value = target;
    scrollRef.current?.scrollTo({ x: target * width, animated: false });
    setIndex(target);
    setRevealing(null);
    revealRadius.value = 0;
  };

  const next = () => {
    // Already mid-reveal — ignore, or two circles would race and the second
    // would commit an index the first was still animating toward.
    if (revealing !== null) return;

    if (index >= SLIDES.length - 1) {
      finish();
      return;
    }

    const target = index + 1;
    setRevealing(target);
    // The ring fills over the same span the circle grows, so the two read as
    // one gesture rather than the ring snapping when the circle lands.
    pageProgress.value = withTiming(target, {
      duration: REVEAL_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    revealRadius.value = 0;
    revealRadius.value = withTiming(
      revealTarget,
      { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) },
      (done) => {
        if (done) runOnJS(commitReveal)(target);
      },
    );
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      pageProgress.value = e.contentOffset.x / width;
    },
  });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  // Grows the circle itself. Animating the box and its corner radius rather
  // than scaling it is what keeps the slide inside at its true size — see
  // the file doc's "Two transitions" note.
  const circleStyle = useAnimatedStyle(() => ({
    left: buttonX - revealRadius.value,
    top: buttonY - revealRadius.value,
    width: revealRadius.value * 2,
    height: revealRadius.value * 2,
    borderRadius: revealRadius.value,
  }));

  // Counter-offsets the content against the circle's own moving origin, so
  // the incoming slide stays pinned to real screen coordinates while the
  // circle sweeps across it.
  const circleContentStyle = useAnimatedStyle(() => ({
    left: revealRadius.value - buttonX,
    top: revealRadius.value - buttonY,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: SLIDES[index]?.bg ?? "#FFFFFF" }}>
      {/* The photos are light on all three slides, so the clock and battery
          need to be dark on all three — no per-slide switching. */}
      <StatusBar style="dark" />

      {SLIDES.map((slide, i) => (
        <FadeLayer key={i} slideIndex={i} scrollX={scrollX}>
          <SlideContent slide={slide} insetTop={insets.top} insetBottom={insets.bottom} />
        </FadeLayer>
      ))}

      {/* Owns paging/swipe physics only — nothing here is ever visible. See
          the file doc. Frozen mid-reveal so a stray drag can't move the
          pager out from under a circle that is about to commit an index. */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={revealing === null}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={StyleSheet.absoluteFillObject}
      >
        {SLIDES.map((_, i) => (
          <View key={i} style={{ width, height }} />
        ))}
      </Animated.ScrollView>

      {revealing !== null && (
        <Animated.View style={[styles.revealCircle, circleStyle]} pointerEvents="none">
          <Animated.View style={[styles.revealContent, circleContentStyle]}>
            <SlideContent
              slide={SLIDES[revealing]}
              insetTop={insets.top}
              insetBottom={insets.bottom}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Chrome only — identical on every slide, and drawn above the circle
          so it stays put while the reveal passes beneath it. `box-none` here
          and on the header: the drag has to reach the ScrollView above. */}
      <View style={[styles.column, { paddingTop: insets.top + HEADER_TOP_PAD }]} pointerEvents="box-none">
        <View style={[styles.header, { height: HEADER_HEIGHT }]} pointerEvents="box-none">
          {/* No `tintColor`: the mark is a full-colour illustrated badge
              (pin, van, mountains, road), not a flat icon — tinting it
              collapses the whole thing to a single-colour silhouette. Its
              own dark outline gives it contrast against any of the three
              backgrounds on its own. */}
          <Image source={theme.logo} style={styles.logo} resizeMode="contain" />

          <Pressable
            onPress={finish}
            hitSlop={14}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        {/* Stands in for the copy each slide layer draws underneath. */}
        <View style={{ height: TEXT_BLOCK_HEIGHT }} pointerEvents="none" />

        {/* Partner to the spacer above — see `SlideContent`'s matching pair. */}
        <View style={styles.spacerBelow} pointerEvents="none" />

        <View style={styles.buttonRow} pointerEvents="box-none">
          <Pressable
            onPress={next}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <ProgressRing pageProgress={pageProgress} colors={ringColors} />
            <Ionicons name="chevron-forward" size={24} color={INK} />
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + BOTTOM_PAD }} pointerEvents="none" />
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
    paddingHorizontal: GUTTER,
  },
  logo: { width: HEADER_HEIGHT, height: HEADER_HEIGHT },
  skip: { fontFamily: fonts.bodyMedium, fontSize: 18, color: TEXT },

  spacer: { flex: 1 },
  /** Far less flex than `spacer`, so almost all leftover room lands above the
   * copy and the text block sits low, just off the button row — see either
   * column's comment. */
  spacerBelow: { flex: 0.12 },

  textBlock: { height: TEXT_BLOCK_HEIGHT },
  // Left-aligned and hugging the same gutter as the header above it.
  textInner: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "flex-end" },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 58,
    lineHeight: 62,
    color: TEXT,
    // Wide enough that the deliberate `\n` in each slide's title is the only
    // thing that breaks the line — `textInner`'s own GUTTER padding is what
    // actually bounds it against the screen edge, so this only needs to
    // clear the longest single line ("Plan your road"), not cap it early.
    maxWidth: 400,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 21,
    lineHeight: 30,
    color: TEXT_MUTED,
    marginTop: 20,
    maxWidth: 310,
  },

  // The arrow sits alone in the corner — `flex-end` rather than a row with a
  // second child, so there's no reserved slot for anything else.
  buttonRow: { paddingHorizontal: GUTTER, marginTop: BUTTON_ROW_GAP, alignItems: "flex-end" },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: BUTTON_BG,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  revealCircle: { position: "absolute", overflow: "hidden" },
  revealContent: { position: "absolute", width, height },
});
