import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListStories } from "@workspace/api-client-react";
import NIMIZA_COLORS from "@/constants/nimiza-colors";

const SKILLS = ["All", "Empathy", "Courage", "Hygiene", "Sharing", "Safety", "Nature"];

const SKILL_COLORS: Record<string, string> = {
  Empathy: NIMIZA_COLORS.miko,
  Courage: "#F59E0B",
  Hygiene: NIMIZA_COLORS.green,
  Sharing: NIMIZA_COLORS.secondary,
  Safety: NIMIZA_COLORS.blue,
  Nature: "#22C55E",
};

const SKILL_ICONS: Record<string, "heart" | "shield-checkmark" | "water" | "people" | "warning" | "leaf"> = {
  Empathy: "heart",
  Courage: "shield-checkmark",
  Hygiene: "water",
  Sharing: "people",
  Safety: "warning",
  Nature: "leaf",
};

interface Story {
  id: string;
  title: string;
  emoji: string;
  description: string;
  characterName: string;
  characterEmoji: string;
  skill: string;
  ageGroup: string;
  duration: number;
  badgeEmoji: string;
  badgeName: string;
}

function StoryCard({ story }: { story: Story }) {
  const skillColor = SKILL_COLORS[story.skill] || NIMIZA_COLORS.primary;
  const skillIcon = SKILL_ICONS[story.skill] || "star";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/story/[id]", params: { id: story.id } })}
      activeOpacity={0.85}
    >
      <View style={[styles.cardEmojiBg, { backgroundColor: skillColor + "22" }]}>
        <Ionicons name={skillIcon} size={36} color={skillColor} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.skillChip, { backgroundColor: skillColor + "22" }]}>
            <Text style={[styles.skillText, { color: skillColor }]}>{story.skill}</Text>
          </View>
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={11} color={NIMIZA_COLORS.textMuted} />
            <Text style={styles.duration}>{story.duration} min</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{story.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{story.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.character}>
            {story.characterName || "Unknown"}
          </Text>
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>Ages {story.ageGroup}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={16} color={NIMIZA_COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdventuresScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selectedSkill, setSelectedSkill] = useState("All");

  const { data: allStories, isLoading } = useListStories();
  const stories = (allStories ?? []).filter(s =>
    selectedSkill === "All" || s.skill === selectedSkill
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[NIMIZA_COLORS.secondary, "#319795"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Text style={styles.headerTitle}>Adventures</Text>
        <Text style={styles.headerSub}>Pick a story to begin your journey</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {SKILLS.map(skill => (
          <TouchableOpacity
            key={skill}
            style={[styles.filterChip, selectedSkill === skill && styles.filterChipActive]}
            onPress={() => setSelectedSkill(skill)}
          >
            <Text style={[styles.filterText, selectedSkill === skill && styles.filterTextActive]}>
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Ionicons name="book-outline" size={36} color={NIMIZA_COLORS.textMuted} />
          <Text style={styles.loadingText}>Loading adventures...</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
          scrollEnabled={!!(stories.length > 0)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <StoryCard story={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="book-outline" size={48} color={NIMIZA_COLORS.textMuted} />
              <Text style={styles.emptyText}>No adventures found for this skill.</Text>
              <TouchableOpacity onPress={() => setSelectedSkill("All")} style={styles.resetBtn}>
                <Text style={styles.resetText}>Show all adventures</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NIMIZA_COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: NIMIZA_COLORS.surface,
    borderWidth: 1.5,
    borderColor: NIMIZA_COLORS.tabBarBorder,
  },
  filterChipActive: {
    backgroundColor: NIMIZA_COLORS.primary,
    borderColor: NIMIZA_COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: NIMIZA_COLORS.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: NIMIZA_COLORS.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: NIMIZA_COLORS.surface,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEmojiBg: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  skillChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  duration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textMuted,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 4,
    lineHeight: 19,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  character: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.textSecondary,
  },
  ageBadge: {
    backgroundColor: NIMIZA_COLORS.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  ageText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.textMuted,
  },
  cardArrow: {
    paddingRight: 12,
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: NIMIZA_COLORS.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  resetBtn: {
    backgroundColor: NIMIZA_COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 4,
  },
  resetText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
