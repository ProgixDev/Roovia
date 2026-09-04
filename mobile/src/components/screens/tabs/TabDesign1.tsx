import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "../../../constants/themes";
import { useTheme } from "../../../contexts/ThemeContext";

/**
 * Bottom tab bar — design 1. Reference screenshot:
 * `assets/screens/tabs/TabDesign1.png`.
 *
 * The look lives here rather than in the route layout so a project can swap
 * the whole bar by pointing `app/(tabs)/_layout.tsx` at a different
 * `TabDesign*` component, leaving the route list untouched.
 */

// bottom-tabs v7 sets paddingBottom: insets.bottom by default with no extra
// breathing room, so tab icons sit flush against the system nav bar on
// gesture-nav devices. This composes with the native library's own
// height/padding math rather than consuming an inset inside a screen.
//
// Enough for a 24pt icon and an 11pt label at the system default font size.
const TAB_BAR_CONTENT_HEIGHT = 52;

/**
 * Past this the bar would eat the screen rather than help.
 *
 * The bar is a fixed-height container around text that scales with the system
 * font, so the height has to follow the label or the label clips against the
 * icon — but only so far: at the accessibility sizes (fontScale > 2) a
 * proportional bar would take a third of a phone, and bottom-tabs truncates
 * the label there anyway.
 */
const MAX_TAB_BAR_FONT_SCALE = 1.4;

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface TabConfig {
  /** Route file name inside `app/(tabs)`, without the extension. */
  name: string;
  /** Label under the icon. */
  title: string;
  icon: IconName;
  iconFocused: IconName;
}

export function TabDesign1({ tabs }: { tabs: TabConfig[] }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  // `useWindowDimensions`, not PixelRatio.getFontScale(): this one re-renders
  // when the user changes the system font size while the app is open, which is
  // exactly when a fixed-height bar starts clipping its labels.
  const { fontScale } = useWindowDimensions();
  const contentHeight = Math.round(
    TAB_BAR_CONTENT_HEIGHT *
      Math.min(Math.max(fontScale, 1), MAX_TAB_BAR_FONT_SCALE),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.darker,
          borderTopColor: theme.background.accent,
          borderTopWidth: 1,
          height: contentHeight + insets.bottom + spacing.sm,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom + spacing.sm,
        },
        tabBarActiveTintColor: theme.primary.main,
        tabBarInactiveTintColor: theme.foreground.gray,
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 2,
        },
      }}
    >
      {tabs.map(({ name, title, icon, iconFocused }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={focused ? iconFocused : icon}
                color={color}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default TabDesign1;
