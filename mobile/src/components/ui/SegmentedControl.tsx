import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface SegmentedControlProps<T extends string> {
  segments: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Scrolls horizontally instead of stretching to fit — trip detail's 6 segments don't fit one screen width. */
  scrollable?: boolean;
}

export function SegmentedControl<T extends string>({ segments, value, onChange, scrollable = false }: SegmentedControlProps<T>) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceSunken }, scrollable && styles.trackScrollable]}>
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            style={[
              styles.segment,
              scrollable && styles.segmentScrollable,
              active && { backgroundColor: theme.colors.surface, shadowColor: theme.shadow.color, shadowOpacity: theme.shadow.opacity * 0.5, shadowOffset: theme.shadow.offset, shadowRadius: theme.shadow.radius, elevation: active ? 2 : 0 },
            ]}
          >
            <Text style={[typography.button, { color: active ? theme.colors.ink : theme.colors.inkMuted, fontSize: 13 }]}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (!scrollable) return content;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderRadius: radius.pill, padding: 4 },
  trackScrollable: { paddingRight: 4 },
  segment: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  segmentScrollable: { flex: 0, paddingHorizontal: 16 },
});
