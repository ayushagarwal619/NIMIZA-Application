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
import { Ionicons } from "@expo/vector-icons";
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
          <Text style={styles.xpLevelLabel}>Level {level}</Text>
          <Text style={styles.xpSub}>Explorer</Text>
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="flash" size={14} color={NIMIZA_COLORS.purple} />
          <Text style={styles.xpBadgeText}>{xp} XP</Text>
        </View>
      </View>
      <View style={styles.xpBarBg}>
        <View style={[styles.xpBarFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={styles.xpNext}>{xpForNextLevel - xp} XP to Level {level + 1}</Text>
    </View>
  );
}

interface StatCardProps {
  iconName: "medal" | "book" | "flame";
  value: string | number;
  label: string;
  color: string;
}

function StatCard({ iconName, value, label, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: color + "22" }]}>
        <Ionicons name={iconName} size={22} color={color} />
      </View>
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
          <Ionicons name="person" size={36} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSub}>Keep learning every day!</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Ionicons name="hourglass-outline" size={32} color={NIMIZA_COLORS.textMuted} />
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
            <StatCard iconName="medal" value={progress?.badges?.length ?? 0} label="Badges" color={NIMIZA_COLORS.accent} />
            <StatCard iconName="book" value={progress?.completedStories?.length ?? 0} label="Stories" color={NIMIZA_COLORS.secondary} />
            <StatCard iconName="flame" value={progress?.streak ?? 0} label="Streak" color={NIMIZA_COLORS.primary} />
          </View>

          {(progress?.badges?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
                {progress!.badges.map((badge, i) => (
                  <View key={i} style={styles.badgeCard}>
                    <View style={styles.badgeIconCircle}>
                      <Ionicons name="ribbon" size={28} color={NIMIZA_COLORS.accent} />
                    </View>
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
                  <View style={styles.learnedCheck}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                  <Text style={styles.learnedTitle}>{title}</Text>
                </View>
              ))}
            </View>
          )}

          {(progress?.completedStories?.length ?? 0) === 0 && (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="leaf" size={36} color={NIMIZA_COLORS.green} />
              </View>
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
    gap: 12,
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
  xpLevelLabel: {
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
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
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: NIMIZA_COLORS.accent + "33",
    alignItems: "center",
    justifyContent: "center",
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
  learnedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NIMIZA_COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  learnedTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.text,
    flex: 1,
  },
  emptyBox: {
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NIMIZA_COLORS.green + "22",
    alignItems: "center",
    justifyContent: "center",
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
