import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>📖</Text>
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
        handleSaveProgress(0);
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
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(q => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const score = correctCount + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0);
      setPhase("complete");
      handleSaveProgress(Math.round((score / quiz.length) * 3));
    }
  };

  const handleSaveProgress = (score: number) => {
    saveProgress.mutate({
      saveProgress: { userId: "guest", storyId: id!, quizScore: score },
    });
  };

  if (phase === "complete") {
    return (
      <View style={[styles.completeContainer, { paddingTop: topPad }]}>
        <LinearGradient colors={[NIMIZA_COLORS.accent, "#F59E0B"]} style={styles.completeBg}>
          <Text style={styles.completeStar}>{story.badgeEmoji}</Text>
          <Text style={styles.completeTitle}>Amazing Work!</Text>
          <Text style={styles.completeStory}>{story.title}</Text>
          <View style={styles.badgeBox}>
            <Text style={styles.badgeLabel}>You earned</Text>
            <Text style={styles.badgeName}>{story.badgeName} Badge!</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>Quiz Score: {correctCount}/{quiz.length}</Text>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Back to Adventures</Text>
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
          <Text style={styles.quizTitle}>Quick Quiz!</Text>
          <Text style={styles.quizProgress}>{quizIndex + 1}/{quiz.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizBody}>
          <Text style={styles.questionEmoji}>🤔</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, i) => {
              let bgColor = NIMIZA_COLORS.surface;
              let borderColor = NIMIZA_COLORS.tabBarBorder;
              if (answered) {
                if (i === currentQuestion.correctIndex) {
                  bgColor = NIMIZA_COLORS.green + "22";
                  borderColor = NIMIZA_COLORS.green;
                } else if (i === selectedAnswer && i !== currentQuestion.correctIndex) {
                  bgColor = "#FEE2E2";
                  borderColor = "#EF4444";
                }
              } else if (i === selectedAnswer) {
                bgColor = NIMIZA_COLORS.primary + "22";
                borderColor = NIMIZA_COLORS.primary;
              }

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => handleAnswer(i)}
                  disabled={answered}
                >
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                  <Text style={styles.optionText}>{option}</Text>
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
            <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
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
        {currentScene && (
          <>
            <View style={styles.sceneEmojiBg}>
              <Text style={styles.sceneEmoji}>{currentScene.emoji}</Text>
            </View>
            <Text style={styles.sceneTitle}>{currentScene.title}</Text>
            <View style={styles.characterBubble}>
              <Text style={styles.characterLabel}>{currentScene.character}</Text>
            </View>
            <Text style={styles.sceneText}>{currentScene.text}</Text>
          </>
        )}

        {scenes.length === 0 && (
          <View style={styles.emptyScene}>
            <Text style={styles.sceneEmoji}>{story.emoji}</Text>
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

        <TouchableOpacity style={styles.navBtnPrimary} onPress={handleNextScene}>
          <Text style={styles.navBtnPrimaryText}>
            {sceneIndex < scenes.length - 1 ? "Next" : quiz.length > 0 ? "Take Quiz" : "Finish"}
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
  loadingEmoji: {
    fontSize: 52,
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
    backgroundColor: NIMIZA_COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  sceneEmoji: {
    fontSize: 72,
  },
  sceneTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  characterBubble: {
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
  quizProgress: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.textMuted,
  },
  quizBody: {
    padding: 24,
    alignItems: "center",
  },
  questionEmoji: {
    fontSize: 52,
    marginBottom: 16,
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
  optionLetter: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.textSecondary,
    width: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.text,
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
  completeStar: {
    fontSize: 80,
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
    marginBottom: 16,
    width: "100%",
  },
  badgeLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
    opacity: 0.7,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  scoreBox: {
    marginBottom: 28,
  },
  scoreText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#1A1A2E",
  },
  doneBtn: {
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
