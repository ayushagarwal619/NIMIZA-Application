import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListStories } from "@workspace/api-client-react";
import NIMIZA from "@/constants/nimiza-colors";

const SKILL_META: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Empathy:    { color: NIMIZA.coral,      bg: "#FFECEC", icon: "heart-outline" },
  Courage:    { color: NIMIZA.yellowDark, bg: NIMIZA.yellowSoft, icon: "shield-checkmark-outline" },
  Sharing:    { color: NIMIZA.blueDark,   bg: NIMIZA.blueSoft,   icon: "people-outline" },
  Hygiene:    { color: NIMIZA.green,      bg: "#DEFFF2", icon: "water-outline" },
  Safety:     { color: NIMIZA.blue,       bg: NIMIZA.blueSoft,   icon: "warning-outline" },
  Nature:     { color: "#22C55E",         bg: "#DCFCE7", icon: "leaf-outline" },
  default:    { color: NIMIZA.purpleDark, bg: NIMIZA.purpleSoft, icon: "book-outline" },
};

const CHAR_COLORS: Record<string, string> = { Nino: NIMIZA.yellow, Miko: NIMIZA.blue, Zara: NIMIZA.purple };
const CHAR_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = { Nino: "search", Miko: "heart", Zara: "flash" };

const FILTERS = ["All", "Empathy", "Courage", "Sharing", "Hygiene", "Safety", "Nature"];

interface StoryItem {
  id: string;
  title: string;
  description: string;
  characterName: string;
  skill: string;
  ageGroup: string;
  duration: number;
  badgeName: string;
}

function StoryCard({ story }: { story: StoryItem }) {
  const skill = SKILL_META[story.skill] ?? SKILL_META.default;
  const charColor = CHAR_COLORS[story.characterName] || NIMIZA.purple;
  const charIcon = CHAR_ICONS[story.characterName] || "star";
  const scale = React.useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
      onPress={() => router.push({ pathname: "/story/[id]", params: { id: story.id } })}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={[styles.cardThumb, { backgroundColor: skill.bg }]}>
          <Ionicons name={skill.icon} size={44} color={skill.color} />
          <View style={[styles.charBadge, { backgroundColor: charColor }]}>
            <Ionicons name={charIcon} size={12} color="#FFF" />
            <Text style={styles.charBadgeText}>{story.characterName}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={[styles.skillPill, { backgroundColor: skill.bg }]}>
              <Text style={[styles.skillPillText, { color: skill.color }]}>{story.skill}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={11} color={NIMIZA.textMuted} />
              <Text style={styles.metaText}>{story.duration} min</Text>
              <View style={styles.dot} />
              <Text style={styles.metaText}>Ages {story.ageGroup}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{story.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{story.description}</Text>

          <View style={styles.cardFooter}>
            <View style={[styles.badgePill, { backgroundColor: NIMIZA.yellow + "33" }]}>
              <Ionicons name="ribbon-outline" size={12} color={NIMIZA.yellowDark} />
              <Text style={[styles.badgeText, { color: NIMIZA.yellowDark }]}>{story.badgeName}</Text>
            </View>
            <View style={[styles.playBtn, { backgroundColor: skill.color }]}>
              <Ionicons name="play" size={14} color="#FFF" />
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function AdventuresScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [filter, setFilter] = useState("All");
  const { data: stories, isLoading } = useListStories();

  const filtered = (stories ?? []).filter(s => filter === "All" || s.skill === filter);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[NIMIZA.blueSoft, NIMIZA.purpleSoft, NIMIZA.bg]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerLabelWrap}>
          <Text style={styles.headerLabel}>STORYBOOKS</Text>
        </View>
        <Text style={styles.headerTitle}>
          Pick an <Text style={styles.headerTitleBlue}>Adventure</Text>
        </Text>
        <Text style={styles.headerSub}>{stories?.length ?? 0} stories ready to explore</Text>
      </LinearGradient>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Ionicons name="book-outline" size={48} color={NIMIZA.purple} />
          <Text style={styles.loadingText}>Loading adventures...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom, gap: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <StoryCard story={item} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="book-outline" size={56} color={NIMIZA.textMuted} />
              <Text style={styles.emptyTitle}>No stories for this skill</Text>
              <Pressable style={styles.resetBtn} onPress={() => setFilter("All")}>
                <Text style={styles.resetText}>Show all adventures</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NIMIZA.bg },

  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerLabelWrap: { alignSelf: "flex-start", backgroundColor: NIMIZA.blue + "33", borderRadius: 50, paddingVertical: 5, paddingHorizontal: 16, marginBottom: 12 },
  headerLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: NIMIZA.blueDark, letterSpacing: 1 },
  headerTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 30, color: NIMIZA.text },
  headerTitleBlue: { color: NIMIZA.blue },
  headerSub: { fontFamily: "Nunito_600SemiBold", fontSize: 13, color: NIMIZA.textLight, marginTop: 6 },

  filterRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 50, backgroundColor: NIMIZA.white, borderWidth: 2, borderColor: "#E8E4F0" },
  filterChipActive: { backgroundColor: NIMIZA.purple, borderColor: NIMIZA.purple },
  filterText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: NIMIZA.textLight },
  filterTextActive: { color: "#FFF" },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontFamily: "Nunito_700Bold", fontSize: 16, color: NIMIZA.textLight },

  card: {
    backgroundColor: NIMIZA.white,
    borderRadius: 28,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 5,
  },
  cardThumb: {
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 8,
  },
  charBadge: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  charBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 9, color: "#FFF" },

  cardContent: { flex: 1, padding: 14 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  skillPill: { borderRadius: 50, paddingVertical: 3, paddingHorizontal: 10 },
  skillPillText: { fontFamily: "Nunito_800ExtraBold", fontSize: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Nunito_600SemiBold", fontSize: 10, color: NIMIZA.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: NIMIZA.textMuted },

  cardTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 16, color: NIMIZA.text, marginBottom: 5, lineHeight: 21 },
  cardDesc: { fontFamily: "Nunito_600SemiBold", fontSize: 12, color: NIMIZA.textLight, lineHeight: 17, marginBottom: 10 },

  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badgePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 50, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontFamily: "Nunito_700Bold", fontSize: 10 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 20, color: NIMIZA.textLight },
  resetBtn: { backgroundColor: NIMIZA.purple, borderRadius: 50, paddingVertical: 10, paddingHorizontal: 24, marginTop: 4 },
  resetText: { fontFamily: "Nunito_800ExtraBold", fontSize: 14, color: "#FFF" },
});
