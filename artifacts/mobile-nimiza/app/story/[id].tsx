import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetStory, useSaveProgress } from "@workspace/api-client-react";
import NIMIZA from "@/constants/nimiza-colors";

const CHAR_META: Record<string, { grad: [string, string]; icon: "search" | "heart" | "flash" }> = {
  Nino: { grad: NIMIZA.ninoGrad, icon: "search" },
  Miko: { grad: NIMIZA.mikoGrad, icon: "heart" },
  Zara: { grad: NIMIZA.zaraGrad, icon: "flash" },
};

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
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confetti = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();
  };
  const fadeOut = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 200, useNativeDriver: true }),
    ]).start(() => { cb(); fadeIn(); });
  };

  useEffect(() => {
    if (phase === "complete") {
      Animated.spring(confetti, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [phase]);

  if (isLoading || !story) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: topPad }]}>
        <Ionicons name="book-outline" size={60} color={NIMIZA.purple} />
        <Text style={styles.loadingText}>Opening your story...</Text>
      </View>
    );
  }

  const scenes = story.scenes ?? [];
  const quiz = story.quiz ?? [];
  const scene = scenes[sceneIndex];
  const question = quiz[quizIndex];
  const charMeta = CHAR_META[scene?.character ?? story.characterName] ?? Object.values(CHAR_META)[0];

  const nextScene = () => {
    if (sceneIndex < scenes.length - 1) {
      fadeOut(() => setSceneIndex(i => i + 1));
    } else {
      if (quiz.length > 0) { fadeOut(() => setPhase("quiz")); }
      else {
        setPhase("complete");
        saveProgress.mutate({ data: { userId: "guest", storyId: id!, quizScore: 0 } });
      }
    }
  };

  const prevScene = () => {
    if (sceneIndex > 0) fadeOut(() => setSceneIndex(i => i - 1));
  };

  const handleAnswer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === question.correctIndex) setCorrectCount(c => c + 1);
  };

  const nextQuestion = () => {
    const newCorrect = correctCount + (selected === question.correctIndex ? 1 : 0);
    if (quizIndex < quiz.length - 1) {
      fadeOut(() => { setQuizIndex(q => q + 1); setSelected(null); setAnswered(false); });
    } else {
      const score = Math.round((newCorrect / quiz.length) * 3);
      setPhase("complete");
      saveProgress.mutate({ data: { userId: "guest", storyId: id!, quizScore: score } });
    }
  };

  /* ── COMPLETE ── */
  if (phase === "complete") {
    const completeScale = confetti.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
    return (
      <LinearGradient colors={[NIMIZA.yellow, "#FFC107", NIMIZA.coral]} style={styles.completeBg}>
        <Animated.View style={[styles.completeCard, { transform: [{ scale: completeScale }], opacity: confetti }]}>
          <Text style={styles.completeEmoji}>🏆</Text>
          <Text style={styles.completeHeadline}>Amazing Work!</Text>
          <Text style={styles.completeTitle}>{story.title}</Text>

          <View style={styles.badgeReveal}>
            <LinearGradient colors={[NIMIZA.purple, NIMIZA.purpleDark]} style={styles.badgeRevealGrad}>
              <Ionicons name="ribbon" size={32} color="#FFF" />
              <Text style={styles.badgeRevealLabel}>You earned</Text>
              <Text style={styles.badgeRevealName}>{story.badgeName} Badge!</Text>
            </LinearGradient>
          </View>

          {quiz.length > 0 && (
            <View style={styles.scoreRow}>
              <Ionicons name="checkmark-circle" size={18} color={NIMIZA.green} />
              <Text style={styles.scoreText}>{correctCount}/{quiz.length} quiz answers correct</Text>
            </View>
          )}

          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <LinearGradient colors={[NIMIZA.text, "#4A4870"]} style={styles.doneBtnGrad}>
              <Ionicons name="arrow-back" size={18} color="#FFF" />
              <Text style={styles.doneBtnText}>Back to Adventures</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  /* ── QUIZ ── */
  if (phase === "quiz" && question) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={NIMIZA.text} />
          </Pressable>
          <View style={styles.quizTitleRow}>
            <Ionicons name="help-circle" size={18} color={NIMIZA.purple} />
            <Text style={styles.topBarTitle}>Quick Quiz</Text>
          </View>
          <View style={styles.progressChip}>
            <Text style={styles.progressChipText}>{quizIndex + 1}/{quiz.length}</Text>
          </View>
        </View>

        <Animated.View style={[styles.quizContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.questionIcon, { backgroundColor: NIMIZA.purpleSoft }]}>
              <Ionicons name="help" size={44} color={NIMIZA.purple} />
            </View>
            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.options}>
              {question.options.map((opt: string, i: number) => {
                let bg = NIMIZA.white;
                let border = "#E8E4F0";
                let textColor = NIMIZA.text;
                let icon = null as JSX.Element | null;

                if (answered) {
                  if (i === question.correctIndex) {
                    bg = "#DEFFF2"; border = NIMIZA.green; textColor = "#059669";
                    icon = <Ionicons name="checkmark-circle" size={20} color={NIMIZA.green} />;
                  } else if (i === selected) {
                    bg = "#FFECEC"; border = NIMIZA.coral; textColor = "#DC2626";
                    icon = <Ionicons name="close-circle" size={20} color={NIMIZA.coral} />;
                  }
                } else if (i === selected) {
                  bg = NIMIZA.purpleSoft; border = NIMIZA.purple; textColor = NIMIZA.purpleDark;
                }

                return (
                  <Pressable
                    key={i}
                    onPress={() => handleAnswer(i)}
                    disabled={answered}
                    style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                  >
                    <View style={[styles.optionLetter, { backgroundColor: border + "33" }]}>
                      <Text style={[styles.optionLetterText, { color: border }]}>{String.fromCharCode(65 + i)}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                    {icon}
                  </Pressable>
                );
              })}
            </View>

            {answered && (
              <Pressable onPress={nextQuestion} style={styles.nextBtn}>
                <LinearGradient colors={[NIMIZA.purple, NIMIZA.purpleDark]} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>
                    {quizIndex < quiz.length - 1 ? "Next Question" : "See My Results"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </LinearGradient>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  /* ── STORY ── */
  const progressFraction = (sceneIndex + 1) / Math.max(scenes.length, 1);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={NIMIZA.text} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>{story.title}</Text>
        <View style={styles.progressChip}>
          <Text style={styles.progressChipText}>{sceneIndex + 1}/{scenes.length || 1}</Text>
        </View>
      </View>

      {/* Segmented progress bar */}
      <View style={styles.segBar}>
        {(scenes.length > 0 ? scenes : [null]).map((_, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              { backgroundColor: i <= sceneIndex ? NIMIZA.purple : "#E8E4F0" }
            ]}
          />
        ))}
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.sceneScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Character avatar */}
        <View style={styles.sceneAvatarWrap}>
          <LinearGradient colors={charMeta.grad} style={styles.sceneAvatar}>
            <Ionicons name={charMeta.icon} size={52} color="#FFF" />
          </LinearGradient>
        </View>

        {scene ? (
          <>
            <View style={styles.charSpeaker}>
              <Ionicons name="chatbubble-ellipses" size={14} color={charMeta.grad[0]} />
              <Text style={[styles.charSpeakerText, { color: charMeta.grad[0] }]}>{scene.character}</Text>
            </View>
            <Text style={styles.sceneTitleText}>{scene.title}</Text>
            <Text style={styles.sceneBodyText}>{scene.text}</Text>
          </>
        ) : (
          <>
            <Text style={styles.sceneTitleText}>{story.title}</Text>
            <Text style={styles.sceneBodyText}>{story.description}</Text>
          </>
        )}
      </Animated.ScrollView>

      {/* Navigation */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.navBack, { opacity: sceneIndex === 0 ? 0.3 : 1 }]}
          onPress={prevScene}
          disabled={sceneIndex === 0}
        >
          <Ionicons name="chevron-back" size={22} color={NIMIZA.purple} />
          <Text style={styles.navBackText}>Back</Text>
        </Pressable>

        <View style={styles.navDots}>
          {scenes.slice(0, 7).map((_, i) => (
            <View
              key={i}
              style={[
                styles.navDot,
                i === sceneIndex && styles.navDotActive
              ]}
            />
          ))}
        </View>

        <Pressable onPress={nextScene} style={styles.navNextBtn}>
          <LinearGradient colors={[NIMIZA.purple, NIMIZA.purpleDark]} style={styles.navNextGrad}>
            <Text style={styles.navNextText}>
              {sceneIndex < scenes.length - 1 ? "Next" : quiz.length > 0 ? "Quiz" : "Finish"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NIMIZA.bg },

  loadingScreen: { flex: 1, backgroundColor: NIMIZA.bg, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontFamily: "Nunito_700Bold", fontSize: 16, color: NIMIZA.textLight },

  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  backBtn: { padding: 4 },
  topBarTitle: { flex: 1, fontFamily: "FredokaOne_400Regular", fontSize: 17, color: NIMIZA.text },
  quizTitleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  progressChip: { backgroundColor: NIMIZA.purpleSoft, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 50 },
  progressChipText: { fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: NIMIZA.purpleDark },

  segBar: { flexDirection: "row", paddingHorizontal: 16, gap: 4, marginBottom: 4 },
  seg: { flex: 1, height: 5, borderRadius: 3 },

  sceneScroll: { padding: 24, alignItems: "center", paddingBottom: 16 },
  sceneAvatarWrap: { marginBottom: 16 },
  sceneAvatar: {
    width: 120,
    height: 130,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  charSpeaker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: NIMIZA.white,
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  charSpeakerText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  sceneTitleText: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: NIMIZA.text, textAlign: "center", marginBottom: 14, lineHeight: 28 },
  sceneBodyText: { fontFamily: "Nunito_600SemiBold", fontSize: 16, color: NIMIZA.text, lineHeight: 27, textAlign: "center" },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: NIMIZA.white,
    borderTopWidth: 1.5,
    borderTopColor: "#F0EBF8",
  },
  navBack: { flexDirection: "row", alignItems: "center", gap: 4 },
  navBackText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: NIMIZA.purple },
  navDots: { flexDirection: "row", gap: 6 },
  navDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E8E4F0" },
  navDotActive: { width: 20, backgroundColor: NIMIZA.purple },
  navNextBtn: { borderRadius: 50, overflow: "hidden" },
  navNextGrad: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 22, gap: 4 },
  navNextText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#FFF" },

  /* QUIZ */
  quizContent: { flex: 1 },
  quizScroll: { padding: 24, alignItems: "center", paddingBottom: 40 },
  questionIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  questionText: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: NIMIZA.text, textAlign: "center", lineHeight: 30, marginBottom: 28 },
  options: { width: "100%", gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  optionLetter: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  optionLetterText: { fontFamily: "Nunito_900Black", fontSize: 14 },
  optionText: { flex: 1, fontFamily: "Nunito_700Bold", fontSize: 14, lineHeight: 20 },
  nextBtn: { borderRadius: 50, overflow: "hidden", marginTop: 28, width: "100%" },
  nextBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
  nextBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#FFF" },

  /* COMPLETE */
  completeBg: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  completeCard: {
    backgroundColor: NIMIZA.white,
    borderRadius: 40,
    padding: 32,
    alignItems: "center",
    gap: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
  completeEmoji: { fontSize: 64, marginBottom: 4 },
  completeHeadline: { fontFamily: "FredokaOne_400Regular", fontSize: 32, color: NIMIZA.text },
  completeTitle: { fontFamily: "Nunito_700Bold", fontSize: 15, color: NIMIZA.textLight, textAlign: "center" },
  badgeReveal: { borderRadius: 24, overflow: "hidden", width: "100%", marginVertical: 8 },
  badgeRevealGrad: { padding: 20, alignItems: "center", gap: 6 },
  badgeRevealLabel: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  badgeRevealName: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: "#FFF" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: NIMIZA.textLight },
  doneBtn: { borderRadius: 50, overflow: "hidden", width: "100%", marginTop: 6 },
  doneBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
  doneBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#FFF" },
});
