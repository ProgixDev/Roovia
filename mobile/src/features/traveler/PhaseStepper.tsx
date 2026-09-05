import { StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

const PHASES = ["Qui", "Où", "Style", "Bilan"];
const CIRCLE = 32;

interface PhaseStepperProps {
  /** 0-indexed — which of the 4 phases is current. */
  step: 0 | 1 | 2 | 3;
}

/**
 * The traveler wizard's 4-phase header stepper — numbered circles with
 * labels and a connecting line, replacing the plain dot row `WizardShell`
 * uses elsewhere. A node is filled `contour` (a warm brown, not `ink`'s
 * near-black) once passed, filled `blaze` while current, outlined in that
 * same `contour` while upcoming; the line segment leading into a node
 * follows the same rule, so it visually "leads into" whichever node is
 * next rather than just marking what's already done.
 *
 * The line is one absolutely-positioned track behind the circles (inset by
 * `CIRCLE / 2` on each side so it runs center-to-center, not edge-to-edge),
 * not four self-contained node columns — a `flex: 1` line living inside
 * each node's own column hugs that node's near edge instead of bridging to
 * the next one, since the circle's fixed width sits left of it in the row.
 * Labels reuse the identical `space-between` + fixed-slot-width structure
 * as the circles row (rather than four equal `flex: 1` text columns) so
 * each label's slot midpoint lands exactly on its circle's center too.
 */
export function PhaseStepper({ step }: PhaseStepperProps) {
  const { theme } = useTheme();

  const segmentColor = (i: number) =>
    i < step ? theme.colors.contour : i === step ? theme.colors.blaze : theme.colors.line;

  return (
    <View>
      <View style={styles.circlesRow}>
        <View style={styles.lineTrack}>
          {PHASES.slice(1).map((_, i) => (
            <View key={i} style={[styles.lineSegment, { backgroundColor: segmentColor(i) }]} />
          ))}
        </View>
        {PHASES.map((_, i) => (
          <View
            key={i}
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
        ))}
      </View>
      <View style={styles.labelsRow}>
        {PHASES.map((label, i) => (
          <View key={label} style={styles.labelSlot}>
            <Text
              numberOfLines={1}
              style={[
                typography.caption,
                { color: i === step ? theme.colors.blaze : theme.colors.ink, textTransform: "none" },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circlesRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineTrack: {
    position: "absolute",
    left: CIRCLE / 2,
    right: CIRCLE / 2,
    top: CIRCLE / 2 - 1,
    height: 2,
    flexDirection: "row",
  },
  lineSegment: { flex: 1 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  labelsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  labelSlot: { width: CIRCLE, alignItems: "center" },
});
