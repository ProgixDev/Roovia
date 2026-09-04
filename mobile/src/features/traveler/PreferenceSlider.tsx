import { StyleSheet, Text, View } from "react-native";

import { Slider } from "../../components/ui/Slider";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface PreferenceSliderProps {
  label: string;
  leftHint: string;
  rightHint: string;
  value: number;
  onChange: (value: number) => void;
}

/** A 0..1 slider framed as a choice between two poles (tranquille↔intensif, nature↔ville, gratuit↔payant) rather than a bare number. */
export function PreferenceSlider({ label, leftHint, rightHint, value, onChange }: PreferenceSliderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      <Slider value={value} min={0} max={1} step={0.01} onChange={onChange} />
      <View style={styles.hints}>
        <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{leftHint}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted }]}>{rightHint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hints: { flexDirection: "row", justifyContent: "space-between" },
});
