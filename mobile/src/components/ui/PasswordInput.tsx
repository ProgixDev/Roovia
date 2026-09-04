import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";

// `secureTextEntry` is owned by the reveal toggle, so callers cannot set it.
export type PasswordInputProps = Omit<TextInputProps, "secureTextEntry">;

/**
 * A password field with an eye toggle that unmasks the typed value.
 *
 * Renders as a row meant to sit inside a pill-shaped input container: the
 * field takes the remaining width and the toggle pins to the right edge.
 * Reveal state is local to each instance, so a form with a confirm field
 * gets two independent toggles.
 */
export function PasswordInput({ style, ...props }: PasswordInputProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={s.row}>
      <TextInput
        {...props}
        style={[s.input, style]}
        secureTextEntry={!isVisible}
        // Passwords are case-sensitive; the default "sentences" would capitalize
        // the first character the moment the value is unmasked.
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        onPress={() => setIsVisible((visible) => !visible)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={isVisible ? "Hide password" : "Show password"}
        style={s.toggle}
      >
        <MaterialCommunityIcons
          name={isVisible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={theme.foreground.gray}
        />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  toggle: {
    paddingLeft: 12,
    marginRight: -4,
  },
});
