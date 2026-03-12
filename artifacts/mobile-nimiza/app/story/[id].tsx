import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetStory, useSaveProgress } from "@workspace/api-client-react";
import NIMIZA_COLORS from "@/constants/nimiza-colors";

type Phase = "story" | "quiz" | "complete";

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: story, isLoading } = useGetStory(id!);
  const saveProgress = useSaveProgress();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("story");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);

  if (isLoading || !story) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: topPad }]}>
        <Ionicons name="book-outline" size={52} color={NIMIZA_COLORS.textMuted} />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  const scenes = story.scenes ?? [];
  const quiz = story.quiz ?? [];
  const currentScene = scenes[sceneIndex];
  const currentQuestion = quiz[quizIndex];

  const handleNextScene = () => {
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(s => s + 1);
    } else {
      if (quiz.length > 0) {
        setPhase("quiz");
      } else {
        setPhase("complete");
        saveProgress.mutate({ data: { userId: "guest", storyId: id!, quizScore: 0 } });
      }
    }
  };

  const handlePrevScene = () => {
    if (sceneIndex > 0) setSceneIndex(s => s - 1);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === currentQuestion.correctIndex) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNextQuestion = () => {
    const newCorrect = correctCount + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0);
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(q => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const score = Math.round((newCorrect / quiz.length) * 3);
      setPhase("complete");
      saveProgress.mutate({ data: { userId: "guest", storyId: id!, quizScore: score } });
    }
  };

  if (phase === "complete") {
    return (
      <View style={styles.completeContainer}>
        <LinearGradient colors={[NIMIZA_COLORS.accent, "#F59E0B"]} style={styles.completeBg}>
          <View style={[styles.completeIconCircle, { paddingTop: topPad + 20 }]}>
            <Ionicons name="trophy" size={64} color="#1A1A2E" />
          </View>
          <Text style={styles.completeTitle}>Amazing Work!</Text>
          <Text style={styles.completeStory}>{story.title}</Text>
          <View style={styles.badgeBox}>
            <Ionicons name="ribbon" size={28} color={NIMIZA_COLORS.primary} />
            <Text style={styles.badgeLabel}>You earned</Text>
            <Text style={styles.badgeName}>{story.badgeName} Badge!</Text>
          </View>
          <View style={styles.scoreBox}>
            <Ionicons name="checkmark-circle" size={18} color="#1A1A2E" />
            <Text style={styles.scoreText}>Quiz Score: {correctCount}/{quiz.length}</Text>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to Adventures</Text>
            <Ionicons name="arrow-back" size={18} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (phase === "quiz" && currentQuestion) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={NIMIZA_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.quizTitle}>Quick Quiz</Text>
          <View style={styles.quizProgressChip}>
            <Text style={styles.quizProgress}>{quizIndex + 1}/{quiz.length}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.quizBody} showsVerticalScrollIndicator={false}>
          <View style={styles.questionIconCircle}>
            <Ionicons name="help" size={40} color={NIMIZA_COLORS.primary} />
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, i) => {
              let bgColor = NIMIZA_COLORS.surface;
              let borderColor = NIMIZA_COLORS.tabBarBorder;
              let textColor = NIMIZA_COLORS.text;
              if (answered) {
                if (i === currentQuestion.correctIndex) {
                  bgColor = NIMIZA_COLORS.green + "22";
                  borderColor = NIMIZA_COLORS.green;
                  textColor = NIMIZA_COLORS.green;
                } else if (i === selectedAnswer && i !== currentQuestion.correctIndex) {
                  bgColor = "#FEE2E2";
                  borderColor = "#EF4444";
                  textColor = "#EF4444";
                }
              } else if (i === selectedAnswer) {
                bgColor = NIMIZA_COLORS.primary + "22";
                borderColor = NIMIZA_COLORS.primary;
                textColor = NIMIZA_COLORS.primary;
              }

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => handleAnswer(i)}
                  disabled={answered}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionLetterCircle, { backgroundColor: borderColor + "33" }]}>
                    <Text style={[styles.optionLetter, { color: borderColor }]}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {answered && i === currentQuestion.correctIndex && (
                    <Ionicons name="checkmark-circle" size={20} color={NIMIZA_COLORS.green} />
                  )}
                  {answered && i === selectedAnswer && i !== currentQuestion.correctIndex && (
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {answered && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {quizIndex < quiz.length - 1 ? "Next Question" : "See Results"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.storyHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={NIMIZA_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.storyHeaderTitle} numberOfLines={1}>{story.title}</Text>
        <Text style={styles.sceneCount}>{sceneIndex + 1}/{scenes.length}</Text>
      </View>

      <View style={styles.sceneProgressBar}>
        {scenes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.sceneSegment,
              { backgroundColor: i <= sceneIndex ? NIMIZA_COLORS.primary : NIMIZA_COLORS.tabBarBorder }
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.sceneBody} showsVerticalScrollIndicator={false}>
        {currentScene ? (
          <>
            <LinearGradient
              colors={[NIMIZA_COLORS.primary + "22", NIMIZA_COLORS.primary + "08"]}
              style={styles.sceneEmojiBg}
            >
              <Ionicons name="book" size={64} color={NIMIZA_COLORS.primary} />
            </LinearGradient>
            <Text style={styles.sceneTitle}>{currentScene.title}</Text>
            <View style={styles.characterBubble}>
              <Ionicons name="chatbubble" size={14} color={NIMIZA_COLORS.primary} />
              <Text style={styles.characterLabel}>{currentScene.character}</Text>
            </View>
            <Text style={styles.sceneText}>{currentScene.text}</Text>
          </>
        ) : (
          <View style={styles.emptyScene}>
            <Ionicons name="book-outline" size={64} color={NIMIZA_COLORS.primary} />
            <Text style={styles.storyDesc}>{story.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.navButtons, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.navBtn, { opacity: sceneIndex === 0 ? 0.35 : 1 }]}
          onPress={handlePrevScene}
          disabled={sceneIndex === 0}
        >
          <Ionicons name="chevron-back" size={22} color={NIMIZA_COLORS.primary} />
          <Text style={styles.navBtnText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.navDots}>
          {scenes.slice(0, 6).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === sceneIndex ? NIMIZA_COLORS.primary : NIMIZA_COLORS.tabBarBorder }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.navBtnPrimary} onPress={handleNextScene} activeOpacity={0.85}>
          <Text style={styles.navBtnPrimaryText}>
            {sceneIndex < scenes.length - 1 ? "Next" : quiz.length > 0 ? "Quiz" : "Finish"}
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NIMIZA_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: NIMIZA_COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  storyHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
  },
  sceneCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textMuted,
  },
  sceneProgressBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 8,
  },
  sceneSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  sceneBody: {
    padding: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  sceneEmojiBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  sceneTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  characterBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: NIMIZA_COLORS.primary + "22",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  characterLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: NIMIZA_COLORS.primary,
  },
  sceneText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.text,
    lineHeight: 26,
    textAlign: "center",
  },
  emptyScene: {
    alignItems: "center",
    gap: 16,
  },
  storyDesc: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  navButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: NIMIZA_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: NIMIZA_COLORS.tabBarBorder,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  navBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: NIMIZA_COLORS.primary,
  },
  navBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: NIMIZA_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  navBtnPrimaryText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  navDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quizTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
  },
  quizProgressChip: {
    backgroundColor: NIMIZA_COLORS.primary + "22",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  quizProgress: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: NIMIZA_COLORS.primary,
  },
  quizBody: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  questionIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: NIMIZA_COLORS.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 28,
  },
  optionsContainer: {
    width: "100%",
    gap: 10,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  optionLetterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetter: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: NIMIZA_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    marginTop: 28,
  },
  nextBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  completeContainer: {
    flex: 1,
  },
  completeBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  completeIconCircle: {
    alignItems: "center",
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  completeStory: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
    opacity: 0.7,
    marginBottom: 28,
    textAlign: "center",
  },
  badgeBox: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    width: "100%",
  },
  badgeLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
    opacity: 0.7,
  },
  badgeName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  scoreText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#1A1A2E",
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A2E",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  doneBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
