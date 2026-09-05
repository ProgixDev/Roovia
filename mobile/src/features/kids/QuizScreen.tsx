import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "../../constants/fonts";
import { kidsTheme, KIDS_MIN_TARGET } from "../../constants/kidsTheme";
import { quizFor } from "../../mocks/kidsFacts";
import { useKidsStore } from "../../store/kidsStore";

export default function QuizScreen() {
  const { region } = useLocalSearchParams<{ region: string }>();
  const router = useRouter();
  const recordQuiz = useKidsStore((s) => s.recordQuiz);
  const quiz = quizFor(region);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <View style={[styles.container, { paddingTop: 16 }]}>
        <Text style={styles.title}>{"Pas de quiz pour cette région pour l'instant !"}</Text>
      </View>
    );
  }

  const question = quiz.questions[index];

  const choose = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const correct = optionIndex === question.correctIndex;
    const nextScore = correct ? score + 1 : score;
    setTimeout(() => {
      if (index + 1 < quiz.questions.length) {
        setIndex(index + 1);
        setSelected(null);
        setScore(nextScore);
      } else {
        setScore(nextScore);
        setFinished(true);
        recordQuiz(region, nextScore, nextScore === quiz.questions.length ? "Expert de la région" : "Explorateur curieux");
      }
    }, 700);
  };

  if (finished) {
    return (
      <View style={[styles.container, { paddingTop: 24, alignItems: "center" }]}>
        <Text style={styles.bigEmoji}>🏆</Text>
        <Text style={styles.title}>Bravo !</Text>
        <Text style={styles.subtitle}>
          {score} bonne(s) réponse(s) sur {quiz.questions.length}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    // Not `insets.top` — the root layout's own SafeAreaView already reserves it here too.
    <View style={[styles.container, { paddingTop: 24 }]}>
      <Text style={styles.progress}>
        Question {index + 1} / {quiz.questions.length}
      </Text>
      <Text style={styles.question}>{question.question}</Text>

      <View style={{ gap: 14, marginTop: 24 }}>
        {question.options.map((option, i) => {
          const isCorrect = selected !== null && i === question.correctIndex;
          const isWrong = selected === i && i !== question.correctIndex;
          return (
            <Pressable
              key={option}
              onPress={() => choose(i)}
              style={[
                styles.option,
                isCorrect && { backgroundColor: kidsTheme.leaf },
                isWrong && { backgroundColor: kidsTheme.berry },
              ]}
            >
              <Text style={[styles.optionText, (isCorrect || isWrong) && { color: "#FFFFFF" }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: kidsTheme.background, paddingHorizontal: 24 },
  title: { fontFamily: fonts.displayBlack, fontSize: 28, color: kidsTheme.ink, textAlign: "center" },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 16, color: kidsTheme.inkMuted, marginTop: 8, textAlign: "center" },
  bigEmoji: { fontSize: 64, marginBottom: 8 },
  progress: { fontFamily: fonts.bodyMedium, fontSize: 14, color: kidsTheme.inkMuted },
  question: { fontFamily: fonts.displayBlack, fontSize: 24, color: kidsTheme.ink, marginTop: 12 },
  option: {
    minHeight: KIDS_MIN_TARGET,
    borderRadius: 20,
    backgroundColor: kidsTheme.surface,
    borderWidth: 2,
    borderColor: kidsTheme.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  optionText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: kidsTheme.ink, textAlign: "center" },
  primaryButton: {
    marginTop: 24,
    height: KIDS_MIN_TARGET,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: kidsTheme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: kidsTheme.primaryInk },
});
