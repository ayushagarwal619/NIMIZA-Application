import React, { useRef } from "react";
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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import NIMIZA_COLORS from "@/constants/nimiza-colors";

const CHARACTERS = [
  { id: "nino", name: "Nino", role: "Curious Explorer", icon: "search" as const, color: NIMIZA_COLORS.nino, teaches: "Questions & Science" },
  { id: "miko", name: "Miko", role: "Kind Friend", icon: "heart" as const, color: NIMIZA_COLORS.miko, teaches: "Empathy & Kindness" },
  { id: "zara", name: "Zara", role: "Brave Problem Solver", icon: "star" as const, color: NIMIZA_COLORS.zara, teaches: "Courage & Leadership" },
];

const VALUES = [
  { icon: "search" as const, title: "Learn by Exploring", desc: "Discover the world through curiosity and wonder" },
  { icon: "people" as const, title: "Grow with Friends", desc: "Build empathy by walking in others' shoes" },
  { icon: "shield-checkmark" as const, title: "Be Brave Every Day", desc: "Make decisions with confidence and courage" },
];

function CharacterBubble({ character }: { character: typeof CHARACTERS[0] }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => router.push("/(tabs)/characters"));
  };

  return (
    <Animated.View style={[styles.characterBubbleWrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.characterBubble, { backgroundColor: character.color + "22", borderColor: character.color + "55" }]}
        activeOpacity={0.8}
      >
        <View style={[styles.characterIconCircle, { backgroundColor: character.color }]}>
          <Ionicons name={character.icon} size={24} color="#FFF" />
        </View>
        <Text style={[styles.characterName, { color: character.color }]}>{character.name}</Text>
        <Text style={styles.characterRole}>{character.role}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[NIMIZA_COLORS.primary, "#FF8C42"]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoRow}>
            <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.logoText}>NIMIZA</Text>
            <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.heroTagline}>Adventures in Learning</Text>
          <Text style={styles.heroSubtitle}>Stories that build curious, kind, and brave kids</Text>

          <View style={styles.heroBtns}>
            <TouchableOpacity
              style={styles.heroBtnPrimary}
              onPress={() => router.push("/(tabs)/adventures")}
              activeOpacity={0.85}
            >
              <Ionicons name="rocket" size={16} color={NIMIZA_COLORS.primary} />
              <Text style={styles.heroBtnPrimaryText}>Start Adventure</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroBtnSecondary}
              onPress={() => router.push("/(tabs)/characters")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnSecondaryText}>Meet the Gang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Characters</Text>
        <View style={styles.charactersRow}>
          {CHARACTERS.map((c) => (
            <CharacterBubble key={c.id} character={c} />
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: NIMIZA_COLORS.surfaceAlt }]}>
        <Text style={styles.sectionTitle}>What We Teach</Text>
        <View style={styles.valuesContainer}>
          {VALUES.map((v, i) => (
            <View key={i} style={styles.valueCard}>
              <View style={[styles.valueIconCircle, { backgroundColor: [NIMIZA_COLORS.primary, NIMIZA_COLORS.miko, NIMIZA_COLORS.secondary][i] }]}>
                <Ionicons name={v.icon} size={20} color="#FFF" />
              </View>
              <View style={styles.valueText}>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueDesc}>{v.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ready to Learn?</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/(tabs)/adventures")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[NIMIZA_COLORS.secondary, "#319795"]}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Explore All Adventures</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NIMIZA_COLORS.background,
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  heroTagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  heroBtns: {
    flexDirection: "row",
    gap: 12,
  },
  heroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  heroBtnPrimaryText: {
    color: NIMIZA_COLORS.primary,
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  heroBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  heroBtnSecondaryText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 16,
  },
  charactersRow: {
    flexDirection: "row",
    gap: 10,
  },
  characterBubbleWrap: {
    flex: 1,
  },
  characterBubble: {
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  characterIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  characterName: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  characterRole: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
  },
  valuesContainer: {
    gap: 12,
  },
  valueCard: {
    backgroundColor: NIMIZA_COLORS.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  valueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 3,
  },
  valueDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    lineHeight: 17,
  },
  ctaButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  ctaText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
