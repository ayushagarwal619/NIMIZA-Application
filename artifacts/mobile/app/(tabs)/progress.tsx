import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListProgress } from "@workspace/api-client-react";
import NIMIZA_COLORS from "@/constants/nimiza-colors";

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForNextLevel = level * 200;
  const xpThisLevel = xp - ((level - 1) * 200);
  const progress = Math.min(xpThisLevel / 200, 1);

  return (
    <View style={styles.xpBox}>
      <View style={styles.xpRow}>
        <View>
          <Text style={styles.xpLabel}>Level {level}</Text>
          <Text style={styles.xpSub}>Explorer</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{xp} XP</Text>
        </View>
      </View>
      <View style={styles.xpBarBg}>
        <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.xpNext}>{xpForNextLevel - xp} XP to Level {level + 1}</Text>
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: progress, isLoading } = useListProgress({ userId: "guest" });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[NIMIZA_COLORS.purple, "#7C3AED"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>⭐</Text>
        </View>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSub}>Keep learning every day!</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      ) : (
        <>
          {progress && (
            <View style={styles.section}>
              <XPBar xp={progress.xp} level={progress.level} />
            </View>
          )}

          <View style={styles.statsRow}>
            <StatCard icon="🏅" value={progress?.badges?.length ?? 0} label="Badges" />
            <StatCard icon="📖" value={progress?.completedStories?.length ?? 0} label="Stories" />
            <StatCard icon="🔥" value={progress?.streak ?? 0} label="Day Streak" />
          </View>

          {(progress?.badges?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
                {progress!.badges.map((badge, i) => (
                  <View key={i} style={styles.badgeCard}>
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {(progress?.recentlyLearned?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Learned</Text>
              {progress!.recentlyLearned.slice().reverse().map((title, i) => (
                <View key={i} style={styles.learnedRow}>
                  <Text style={styles.learnedDot}>✓</Text>
                  <Text style={styles.learnedTitle}>{title}</Text>
                </View>
              ))}
            </View>
          )}

          {(progress?.completedStories?.length ?? 0) === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Start Your Journey!</Text>
              <Text style={styles.emptyText}>Complete your first adventure to earn XP and badges</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NIMIZA_COLORS.background,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  loadingBox: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: NIMIZA_COLORS.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 14,
  },
  xpBox: {
    backgroundColor: NIMIZA_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  xpLabel: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
  },
  xpSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
  },
  xpBadge: {
    backgroundColor: NIMIZA_COLORS.purple + "22",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  xpBadgeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.purple,
  },
  xpBarBg: {
    height: 10,
    backgroundColor: NIMIZA_COLORS.surfaceAlt,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: NIMIZA_COLORS.purple,
    borderRadius: 6,
  },
  xpNext: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: NIMIZA_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
  },
  badgesRow: {
    gap: 12,
    paddingBottom: 4,
  },
  badgeCard: {
    alignItems: "center",
    backgroundColor: NIMIZA_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
  },
  learnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NIMIZA_COLORS.tabBarBorder,
  },
  learnedDot: {
    fontSize: 16,
    color: NIMIZA_COLORS.green,
    fontFamily: "Inter_700Bold",
  },
  learnedTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.text,
  },
  emptyBox: {
    alignItems: "center",
    padding: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
