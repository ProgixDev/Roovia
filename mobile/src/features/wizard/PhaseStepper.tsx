import { StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

const CIRCLE = 32;
const NODE_WIDTH = 71;

interface PhaseStepperProps {
  /** 0-indexed — which phase is current. */
  step: number;
  /** One label per phase — length determines the node count. Shared by the
   * traveler wizard (Qui/Où/Style/Bilan) and the vehicle wizard
   * (Basique/Équipement/Autonomie/Prêt), not hardcoded to either. */
  labels: string[];
}

/**
 * A wizard header stepper — numbered circles with labels and a connecting
 * line, replacing the plain dot row `WizardShell` uses. A node is filled
 * `contour` (a warm brown, not `ink`'s near-black) once passed, filled
 * `blaze` while current, outlined in that same `contour` while upcoming;
 * the line segment leading into a node follows the same rule, so it
 * visually "leads into" whichever node is next rather than just marking
 * what's already done.
 *
 * Circle and label live in one `NODE_WIDTH`-wide column per phase (not two
 * independently `space-between`'d rows) — two separate rows only stay
 * aligned if both use the exact same per-item width in their own
 * space-between math, and the label needs to be wider than the circle to
 * fit a word like "Équipement". Sharing one column per node makes that
 * alignment automatic instead of a width to keep in sync by hand. The line
 * is one absolutely-positioned track behind the circles, inset by
 * `NODE_WIDTH / 2` on each side so it runs center-to-center between nodes.
 */
export function PhaseStepper({ step, labels }: PhaseStepperProps) {
  const { theme } = useTheme();

  const segmentColor = (i: number) =>
    i < step ? theme.colors.contour : i === step ? theme.colors.blaze : theme.colors.line;

  return (
    <View style={styles.row}>
      <View style={styles.lineTrack}>
        {labels.slice(1).map((_, i) => (
          <View key={i} style={[styles.lineSegment, { backgroundColor: segmentColor(i) }]} />
        ))}
      </View>
      {labels.map((label, i) => (
        <View key={label} style={styles.node}>
          <View
            style={[
              styles.circle,
              i < step
                ? { backgroundColor: theme.colors.contour, borderColor: theme.colors.contour }
                : i === step
                  ? { backgroundColor: theme.colors.blaze, borderColor: theme.colors.blaze }
                  : { backgroundColor: theme.colors.ground, borderColor: theme.colors.contour },
            ]}
          >
            <Text style={[typography.button, { color: i <= step ? theme.colors.blazeInk : theme.colors.ink, fontSize: 14 }]}>
              {i + 1}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[
              typography.caption,
              styles.label,
              { color: i === step ? theme.colors.blaze : theme.colors.ink, textTransform: "none" },
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  lineTrack: {
    position: "absolute",
    left: NODE_WIDTH / 2,
    right: NODE_WIDTH / 2,
    top: CIRCLE / 2 - 1,
    height: 2,
    flexDirection: "row",
  },
  lineSegment: { flex: 1 },
  node: { width: NODE_WIDTH, alignItems: "center" },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { marginTop: 6 },
});
