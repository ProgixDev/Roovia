import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { radius } from "../../constants/themes";
import { typography } from "../../constants/typography";
import { useTheme } from "../../contexts/ThemeContext";

interface ParentalGateProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
}

function randomChallenge() {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 6);
  return { a, b, answer: a + b };
}

/** A simple arithmetic gate — easy for an adult, deliberately not for a young child — used on both the way into and out of kids mode. */
export function ParentalGate({ visible, onClose, onSuccess, title }: ParentalGateProps) {
  const { theme } = useTheme();
  const [challenge, setChallenge] = useState(randomChallenge);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const digit = (d: string) => setInput((prev) => (prev.length < 2 ? prev + d : prev));
  const clear = () => setInput("");

  const submit = () => {
    if (parseInt(input, 10) === challenge.answer) {
      setInput("");
      setError(false);
      setChallenge(randomChallenge());
      onSuccess();
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceRaised }]}>
          <Text style={[typography.sectionHead, { color: theme.colors.ink, fontSize: 20, textAlign: "center" }]}>{title}</Text>
          <Text style={[typography.body, { color: theme.colors.inkMuted, textAlign: "center", marginTop: 8 }]}>
            Un parent doit résoudre ce calcul
          </Text>

          <Text style={[typography.heroStat, { color: theme.colors.ink, textAlign: "center", marginTop: 20 }]}>
            {challenge.a} + {challenge.b} = {input || "?"}
          </Text>
          {error ? (
            <Text style={[typography.caption, { color: theme.colors.danger, textAlign: "center", marginTop: 8 }]}>{"Ce n'est pas ça, réessayez"}</Text>
          ) : null}

          <View style={styles.keypad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].map((key) => (
              <Pressable
                key={key}
                onPress={() => {
                  if (key === "⌫") clear();
                  else if (key === "OK") submit();
                  else digit(key);
                }}
                style={[styles.key, { backgroundColor: key === "OK" ? theme.colors.blaze : theme.colors.surfaceSunken }]}
              >
                <Text style={[typography.button, { color: key === "OK" ? theme.colors.blazeInk : theme.colors.ink }]}>{key}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={[typography.button, { color: theme.colors.inkMuted }]}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 340, borderRadius: radius.xl, padding: 24 },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  key: { width: "30%", height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cancel: { height: 44, alignItems: "center", justifyContent: "center", marginTop: 8 },
});
