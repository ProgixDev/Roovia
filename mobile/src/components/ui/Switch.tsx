import { Switch as RNSwitch } from "react-native";

import { useTheme } from "../../contexts/ThemeContext";

interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/** Themed wrapper over RN's own Switch — a platform-native toggle earns its keep here, not a custom rebuild. */
export function Switch({ value, onChange, disabled }: SwitchProps) {
  const { theme } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: theme.colors.line, true: theme.colors.blaze }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={theme.colors.line}
    />
  );
}
