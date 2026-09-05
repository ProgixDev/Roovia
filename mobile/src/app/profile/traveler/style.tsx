import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { Slider } from "../../../components/ui/Slider";
import { radius } from "../../../constants/themes";
import { typography } from "../../../constants/typography";
import { useTheme } from "../../../contexts/ThemeContext";
import { PreferenceSlider } from "../../../features/traveler/PreferenceSlider";
import { TravelerWizardShell } from "../../../features/traveler/TravelerWizardShell";
import { useTravelerProfileStore } from "../../../store/travelerProfileStore";

const PACE_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Tranquille" },
  { value: 0.5, label: "Équilibré" },
  { value: 1, label: "Intense" },
];

/** Phase 3/4 — budget + nights folded in with pace, driving, ambiance, and sleep type. */
export default function TravelerStyleStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const profile = useTravelerProfileStore((s) => s.profile);
  const update = useTravelerProfileStore((s) => s.update);

  const [budgetEur, setBudgetEur] = useState(profile.budgetEur);
  const [nights, setNights] = useState(profile.nights);
  const [pace, setPace] = useState(profile.pace);
  const [maxDrivingHoursPerDay, setMaxDrivingHoursPerDay] = useState(profile.maxDrivingHoursPerDay);
  const [natureVsCity, setNatureVsCity] = useState(profile.natureVsCity);
  const [freeSpots, setFreeSpots] = useState(profile.freeSpots);
  const [campsites, setCampsites] = useState(profile.campsites);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/profile/traveler/where" as any);
  };

  const next = async () => {
    await update({ budgetEur, nights, pace, maxDrivingHoursPerDay, natureVsCity, freeSpots, campsites });
    router.push("/profile/traveler/review" as any);
  };

  return (
    <TravelerWizardShell
      step={2}
      title="Voyagez à votre façon"
      subtitle="Dites-nous à quoi ressemble une bonne journée."
      onBack={goBack}
      footer={<Button label="Vérifier mon profil" icon="map-outline" onPress={next} />}
    >
      <BudgetRow budgetEur={budgetEur} nights={nights} onChangeBudget={setBudgetEur} onChangeNights={setNights} />

      <StyleRow icon={<Ionicons name="speedometer-outline" size={20} color={theme.colors.moss} />}>
        <Text style={[rowLabel, { color: theme.colors.inkMuted }]}>Votre rythme</Text>
        <PaceControl value={pace} onChange={setPace} />
      </StyleRow>

      <StyleRow icon={<MaterialCommunityIcons name="rv-truck" size={20} color={theme.colors.moss} />}>
        <Text style={[rowLabel, { color: theme.colors.inkMuted }]}>Conduite max par jour</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <Slider value={maxDrivingHoursPerDay} min={1} max={10} step={0.5} onChange={setMaxDrivingHoursPerDay} />
          </View>
          <DrivingLabel hours={maxDrivingHoursPerDay} />
        </View>
      </StyleRow>

      <StyleRow icon={<MaterialCommunityIcons name="pine-tree" size={20} color={theme.colors.moss} />}>
        <PreferenceSlider label="Nature ↔ Ville" leftHint="Nature" rightHint="Ville" value={natureVsCity} onChange={setNatureVsCity} />
      </StyleRow>

      <StyleRow icon={<MaterialCommunityIcons name="tent" size={20} color={theme.colors.moss} />}>
        <Text style={[rowLabel, { color: theme.colors.inkMuted }]}>Où dormez-vous ?</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <SleepToggle
            icon={<MaterialIcons name="local-parking" size={16} color={freeSpots ? theme.colors.blazeInk : theme.colors.ink} />}
            label="Spots gratuits"
            selected={freeSpots}
            onPress={() => setFreeSpots((v) => !v)}
          />
          <SleepToggle
            icon={<MaterialCommunityIcons name="tent" size={16} color={campsites ? theme.colors.blazeInk : theme.colors.ink} />}
            label="Campings"
            selected={campsites}
            onPress={() => setCampsites((v) => !v)}
          />
        </View>
      </StyleRow>
    </TravelerWizardShell>
  );
}

function StyleRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={[styles.iconBadge, { backgroundColor: `${theme.colors.moss}2E` }]}>{icon}</View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function BudgetRow({
  budgetEur,
  nights,
  onChangeBudget,
  onChangeNights,
}: {
  budgetEur: number;
  nights: number;
  onChangeBudget: (v: number) => void;
  onChangeNights: (v: number) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.budgetCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.line }]}>
      <View style={styles.budgetHeader}>
        <View style={[styles.iconBadge, { backgroundColor: `${theme.colors.moss}2E` }]}>
          <Ionicons name="wallet-outline" size={20} color={theme.colors.moss} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[rowLabel, { color: theme.colors.inkMuted }]}>Budget du voyage</Text>
          <Text style={[typography.heroStat, { color: theme.colors.ink, fontSize: 28, lineHeight: 30, marginTop: 2 }]}>
            {budgetEur} €
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 16, gap: 20 }}>
        <Slider value={budgetEur} min={200} max={10000} step={50} onChange={onChangeBudget} />
        <NightsStepper value={nights} onChange={onChangeNights} />
      </View>
    </View>
  );
}

function NightsStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.line }]}>
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        hitSlop={10}
        style={[styles.stepBtn, { backgroundColor: theme.colors.surface, opacity: value <= 1 ? 0.4 : 1 }]}
      >
        <Ionicons name="remove" size={18} color={theme.colors.ink} />
      </Pressable>
      <Text style={[typography.button, { color: theme.colors.ink }]}>{value} nuits</Text>
      <Pressable
        onPress={() => onChange(Math.min(90, value + 1))}
        disabled={value >= 90}
        hitSlop={10}
        style={[styles.stepBtn, { backgroundColor: theme.colors.surface, opacity: value >= 90 ? 0.4 : 1 }]}
      >
        <Ionicons name="add" size={18} color={theme.colors.ink} />
      </Pressable>
    </View>
  );
}

function PaceControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.segmented, { borderColor: theme.colors.line }]}>
      {PACE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && { backgroundColor: theme.colors.blaze }]}
          >
            <Text style={[typography.button, { fontSize: 13, color: selected ? theme.colors.blazeInk : theme.colors.ink }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DrivingLabel({ hours }: { hours: number }) {
  const { theme } = useTheme();
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return (
    <Text style={[typography.button, { color: theme.colors.ink, minWidth: 58, textAlign: "right" }]}>
      {h} h {m > 0 ? m : "00"}
    </Text>
  );
}

function SleepToggle({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sleepToggle,
        {
          backgroundColor: selected ? theme.colors.moss : theme.colors.surfaceSunken,
          borderColor: selected ? theme.colors.moss : theme.colors.line,
        },
      ]}
    >
      {icon}
      <Text style={[typography.button, { fontSize: 13, color: selected ? theme.colors.blazeInk : theme.colors.ink }]}>
        {label}
      </Text>
      {selected ? <Ionicons name="checkmark" size={14} color={theme.colors.blazeInk} /> : null}
    </Pressable>
  );
}

const rowLabel = [typography.caption, { textTransform: "uppercase" as const }];

const styles = StyleSheet.create({
  row: { borderRadius: radius.lg, borderWidth: 1, padding: 16, flexDirection: "row", gap: 14, alignItems: "flex-start" },
  budgetCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  budgetHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 54,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  segmented: { flexDirection: "row", borderRadius: radius.pill, borderWidth: 1, overflow: "hidden", marginTop: 10 },
  segment: { flex: 1, height: 40, alignItems: "center", justifyContent: "center" },
  sleepToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
