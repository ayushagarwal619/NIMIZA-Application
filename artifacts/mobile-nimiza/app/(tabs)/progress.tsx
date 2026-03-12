import React, { useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useListProgress } from "@workspace/api-client-react";
import NIMIZA from "@/constants/nimiza-colors";

const LEVEL_LABELS = ["Seedling", "Explorer", "Adventurer", "Hero", "Champion", "Legend"];
const LEVEL_COLORS: [string, string][] = [
  [NIMIZA.green, "#22C55E"],
  [NIMIZA.blue, NIMIZA.blueDark],
  [NIMIZA.yellow, NIMIZA.yellowDark],
  [NIMIZA.purple, NIMIZA.purpleDark],
  [NIMIZA.coral, "#E11D48"],
  ["#F59E0B", "#D97706"],
];

function AnimatedXPBar({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={styles.xpBarBg}>
      <Animated.View style={[styles.xpBarFill, { width: width as any }]}>
        <LinearGradient colors={[NIMIZA.yellow, NIMIZA.coral]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

function StatCard({ icon, value, label, grad }: { icon: keyof typeof Ionicons.glyphMap; value: string | number; label: string; grad: [string, string] }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale }] }]}>
      <LinearGradient colors={grad} style={styles.statGrad}>
        <Ionicons name={icon} size={22} color="#FFF" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { data: progress, isLoading } = useListProgress({ userId: "guest" });

  const level = progress?.level ?? 1;
  const xp = progress?.xp ?? 0;
  const xpThisLevel = xp - (level - 1) * 200;
  const xpProgress = Math.min(xpThisLevel / 200, 1);
  const levelLabel = LEVEL_LABELS[Math.min(level - 1, LEVEL_LABELS.length - 1)];
  const levelGrad = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero header */}
      <LinearGradient
        colors={[...NIMIZA.zaraGrad, "#6D28D9"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={44} color="rgba(255,255,255,0.9)" />
          <View style={[styles.levelBadge, { backgroundColor: NIMIZA.yellow }]}>
            <Text style={styles.levelBadgeText}>Lv {level}</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>My Progress</Text>
        <Text style={styles.heroSub}>{levelLabel} • {xp} XP total</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Ionicons name="hourglass-outline" size={40} color={NIMIZA.purple} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      ) : (
        <>
          {/* XP CARD */}
          <View style={styles.section}>
            <View style={styles.xpCard}>
              <View style={styles.xpTop}>
                <View>
                  <Text style={styles.xpLevelName}>{levelLabel}</Text>
                  <Text style={styles.xpNextInfo}>
                    {200 - xpThisLevel} XP to next level
                  </Text>
                </View>
                <LinearGradient colors={levelGrad} style={styles.xpChip}>
                  <Ionicons name="flash" size={12} color="#FFF" />
                  <Text style={styles.xpChipText}>{xp} XP</Text>
                </LinearGradient>
              </View>
              <AnimatedXPBar progress={xpProgress} />
              <View style={styles.xpLabels}>
                <Text style={styles.xpLabelText}>Level {level}</Text>
                <Text style={styles.xpLabelText}>Level {level + 1}</Text>
              </View>
            </View>
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <StatCard icon="medal" value={progress?.badges?.length ?? 0} label="Badges" grad={[NIMIZA.yellow, NIMIZA.yellowDark]} />
            <StatCard icon="book" value={progress?.completedStories?.length ?? 0} label="Stories" grad={NIMIZA.mikoGrad} />
            <StatCard icon="flame" value={progress?.streak ?? 0} label="Streak" grad={[NIMIZA.coral, "#DC2626"]} />
          </View>

          {/* BADGES */}
          {(progress?.badges?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Badges Earned</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
                {progress!.badges.map((badge, i) => (
                  <View key={i} style={styles.badgeCard}>
                    <LinearGradient colors={[NIMIZA.yellowSoft, NIMIZA.yellow + "44"]} style={styles.badgeIconWrap}>
                      <Ionicons name="ribbon" size={30} color={NIMIZA.yellowDark} />
                    </LinearGradient>
                    <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* RECENTLY LEARNED */}
          {(progress?.recentlyLearned?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Learned</Text>
              <View style={styles.recentList}>
                {[...progress!.recentlyLearned].reverse().map((title, i) => (
                  <View key={i} style={styles.recentRow}>
                    <LinearGradient colors={NIMIZA.ninoGrad} style={styles.recentCheck}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.recentTitle}>{title}</Text>
                    <Ionicons name="chevron-forward" size={14} color={NIMIZA.textMuted} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* EMPTY STATE */}
          {(progress?.completedStories?.length ?? 0) === 0 && (
            <View style={styles.emptySection}>
              <LinearGradient colors={[NIMIZA.purpleSoft, NIMIZA.yellowSoft]} style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyTitle}>Your Adventure Starts Here!</Text>
                <Text style={styles.emptySub}>Complete your first story to start earning XP, badges, and streaks</Text>
              </LinearGradient>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NIMIZA.bg },

  header: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 32 },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    position: "relative",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: NIMIZA.white,
  },
  levelBadgeText: { fontFamily: "Nunito_900Black", fontSize: 11, color: NIMIZA.text },
  heroTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 28, color: "#FFF", marginBottom: 6 },
  heroSub: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "rgba(255,255,255,0.8)" },

  loadingBox: { height: 220, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontFamily: "Nunito_700Bold", fontSize: 16, color: NIMIZA.textLight },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: NIMIZA.text, marginBottom: 14 },

  /* XP CARD */
  xpCard: {
    backgroundColor: NIMIZA.white,
    borderRadius: 28,
    padding: 22,
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  xpTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  xpLevelName: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: NIMIZA.text },
  xpNextInfo: { fontFamily: "Nunito_600SemiBold", fontSize: 12, color: NIMIZA.textLight, marginTop: 2 },
  xpChip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 50, paddingVertical: 6, paddingHorizontal: 14 },
  xpChipText: { fontFamily: "Nunito_900Black", fontSize: 14, color: "#FFF" },
  xpBarBg: { height: 12, backgroundColor: "#F0EBF8", borderRadius: 8, overflow: "hidden", marginBottom: 8 },
  xpBarFill: { height: "100%", borderRadius: 8 },
  xpLabels: { flexDirection: "row", justifyContent: "space-between" },
  xpLabelText: { fontFamily: "Nunito_600SemiBold", fontSize: 11, color: NIMIZA.textMuted },

  /* STATS */
  statsRow: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  statCard: { flex: 1, borderRadius: 24, overflow: "hidden" },
  statGrad: { padding: 16, alignItems: "center", gap: 5 },
  statValue: { fontFamily: "FredokaOne_400Regular", fontSize: 28, color: "#FFF" },
  statLabel: { fontFamily: "Nunito_700Bold", fontSize: 11, color: "rgba(255,255,255,0.85)" },

  /* BADGES */
  badgesScroll: { gap: 12, paddingBottom: 4 },
  badgeCard: {
    alignItems: "center",
    gap: 8,
    width: 88,
  },
  badgeIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: NIMIZA.textLight,
    textAlign: "center",
    lineHeight: 15,
  },

  /* RECENT */
  recentList: {
    backgroundColor: NIMIZA.white,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0FA",
  },
  recentCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: { flex: 1, fontFamily: "Nunito_700Bold", fontSize: 14, color: NIMIZA.text },

  /* EMPTY */
  emptySection: { padding: 20 },
  emptyCard: { borderRadius: 32, padding: 36, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 22, color: NIMIZA.text },
  emptySub: { fontFamily: "Nunito_600SemiBold", fontSize: 14, color: NIMIZA.textLight, textAlign: "center", lineHeight: 21 },
});
