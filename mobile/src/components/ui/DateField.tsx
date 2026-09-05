import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "./Button";

interface DateFieldProps {
  label: string;
  date: Date | null;
  onChange: (date: Date) => void;
  formatDisplay: (date: Date) => string;
  placeholder: string;
}

/**
 * Native calendar date field, styled like `TextField`'s box. Android's
 * picker is a self-dismissing system dialog (fires once, closes itself);
 * iOS's `inline` calendar has no dismiss gesture of its own, so it needs an
 * explicit sheet + "Valider" button — hence the platform split below rather
 * than one shared render path.
 */
export function DateField({ label, date, onChange, formatDisplay, placeholder }: DateFieldProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(date ?? new Date());

  const openPicker = () => {
    setDraft(date ?? new Date());
    setOpen(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === "set" && selected) onChange(selected);
  };

  const confirmIOS = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[typography.caption, { color: theme.colors.inkMuted }]}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={[styles.box, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.colors.inkMuted} />
        <Text style={[typography.body, { color: date ? theme.colors.ink : theme.colors.inkMuted, flex: 1 }]}>
          {date ? formatDisplay(date) : placeholder}
        </Text>
      </Pressable>

      {open && Platform.OS === "android" ? (
        <DateTimePicker value={draft} mode="date" display="default" onChange={handleAndroidChange} />
      ) : null}

      {open && Platform.OS === "ios" ? (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                onChange={(_event, selected) => selected && setDraft(selected)}
              />
              <Button label="Valider" onPress={confirmIOS} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { padding: 16, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, gap: 12 },
});
