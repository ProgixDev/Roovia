import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";
import { formatEurAs } from "../../lib/format";
import type { Expense } from "../../lib/settle";
import { CATEGORY_ICON, CATEGORY_LABEL } from "./expenseCategory";

interface ExpenseRowProps {
  expense: Expense;
  payerName: string;
  currency: string;
  onRemove: () => void;
}

export function ExpenseRow({ expense, payerName, currency, onRemove }: ExpenseRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceSunken }]}>
        <Ionicons name={CATEGORY_ICON[expense.category]} size={16} color={theme.colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.button, { color: theme.colors.ink }]}>{CATEGORY_LABEL[expense.category]}</Text>
        <Text style={[typography.body, { color: theme.colors.inkMuted, fontSize: 12, marginTop: 2 }]}>
          Payé par {payerName}
          {!expense.synced ? " · en attente" : ""}
        </Text>
      </View>
      <Text style={[typography.mono, { color: theme.colors.ink }]}>{formatEurAs(expense.amountEur, currency)}</Text>
      <Pressable onPress={onRemove} hitSlop={10} style={{ marginLeft: 10 }}>
        <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, height: 56 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
