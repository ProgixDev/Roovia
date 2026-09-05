import { StyleSheet, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 6 }: ProgressBarProps) {
  const { theme } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: theme.colors.surfaceSunken }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, borderRadius: height / 2, backgroundColor: color ?? theme.colors.blaze }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: "hidden" },
  fill: { height: "100%" },
});
