import React, { useRef, useEffect } from "react";
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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import NIMIZA from "@/constants/nimiza-colors";

const CHARS = [
  {
    name: "Nino",
    role: "Curious Explorer",
    icon: "search" as const,
    grad: NIMIZA.ninoGrad,
    floatDelay: 0,
    teaches: "Curiosity & Wonder",
  },
  {
    name: "Miko",
    role: "Kind Friend",
    icon: "heart" as const,
    grad: NIMIZA.mikoGrad,
    floatDelay: 400,
    teaches: "Empathy & Kindness",
  },
  {
    name: "Zara",
    role: "Brave Solver",
    icon: "flash" as const,
    grad: NIMIZA.zaraGrad,
    floatDelay: 200,
    teaches: "Courage & Leadership",
  },
];

const SKILLS = [
  { icon: "heart-outline" as const, title: "Emotional Intelligence", desc: "Understand feelings and care for others", color: NIMIZA.coral },
  { icon: "bulb-outline" as const, title: "Problem Solving", desc: "Think through challenges with confidence", color: NIMIZA.yellow },
  { icon: "people-outline" as const, title: "Social Skills", desc: "Make friends and work as a team", color: NIMIZA.blue },
  { icon: "shield-checkmark-outline" as const, title: "Bravery & Resilience", desc: "Face fears and bounce back stronger", color: NIMIZA.purple },
  { icon: "leaf-outline" as const, title: "Mindfulness", desc: "Breathe, be calm and present", color: NIMIZA.green },
  { icon: "star-outline" as const, title: "Curiosity", desc: "Ask questions and love learning", color: NIMIZA.yellowDark },
];

function FloatingChar({ char, index }: { char: typeof CHARS[0]; index: number }) {
  const floatY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -14, duration: 1800 + index * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1800 + index * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const timeout = setTimeout(() => anim.start(), char.floatDelay);
    return () => { clearTimeout(timeout); anim.stop(); };
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  const isCenter = index === 1;
  const size = isCenter ? 84 : 74;

  return (
    <Animated.View
      style={[
        styles.charWrap,
        { transform: [{ translateY: floatY }, { scale }] },
        isCenter && styles.charWrapCenter,
      ]}
    >
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push("/(tabs)/characters")}
      >
        <LinearGradient colors={char.grad} style={[styles.charBubble, { width: size + 20, height: size + 28, borderRadius: (size + 20) / 2 }]}>
          <Ionicons name={char.icon} size={size * 0.42} color="#FFF" />
          {/* Twinkle stars */}
          <TwinkleStar style={{ top: 6, right: 8 }} delay={0} />
          <TwinkleStar style={{ bottom: 10, left: 6 }} delay={600} />
        </LinearGradient>
        <View style={[styles.nameTag, { shadowColor: char.grad[0] }]}>
          <Text style={styles.nameTagText}>{char.name}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function TwinkleStar({ style, delay }: { style: object; delay: number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View style={[{ position: "absolute", opacity }, style]}>
      <Ionicons name="sparkles" size={10} color="rgba(255,255,255,0.9)" />
    </Animated.View>
  );
}

function SkillCard({ skill }: { skill: typeof SKILLS[0] }) {
  return (
    <View style={[styles.skillCard, { borderColor: skill.color + "44" }]}>
      <View style={[styles.skillIcon, { backgroundColor: skill.color + "22" }]}>
        <Ionicons name={skill.icon} size={22} color={skill.color} />
      </View>
      <Text style={styles.skillTitle}>{skill.title}</Text>
      <Text style={styles.skillDesc}>{skill.desc}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(heroY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 110 + insets.bottom }} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <View style={[styles.hero, { paddingTop: topPad + 24 }]}>
        {/* Gradient blobs */}
        <View style={[styles.blob, styles.blobYellow]} />
        <View style={[styles.blob, styles.blobBlue]} />
        <View style={[styles.blob, styles.blobPurple]} />

        <Animated.View style={[styles.heroContent, { opacity: heroFade, transform: [{ translateY: heroY }] }]}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color={NIMIZA.text} />
            <Text style={styles.heroBadgeText}>For Ages 3–8</Text>
          </View>

          <Text style={styles.heroTitle}>
            Learning Life Skills{"\n"}
            Through <Text style={styles.heroTitlePurple}>Fun Adventures</Text>
          </Text>

          <Text style={styles.heroSub}>
            Stories, games & characters that build curious, kind, and brave little humans.
          </Text>

          <View style={styles.heroBtns}>
            <Pressable
              style={({ pressed }) => [styles.btnPrimary, pressed && { transform: [{ translateY: 2 }] }]}
              onPress={() => router.push("/(tabs)/adventures")}
            >
              <LinearGradient colors={[NIMIZA.purple, "#8A4FE8"]} style={styles.btnPrimaryGrad}>
                <Ionicons name="rocket" size={16} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Start Adventure</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && { backgroundColor: NIMIZA.purpleSoft }]}
              onPress={() => router.push("/(tabs)/characters")}
            >
              <Text style={styles.btnSecondaryText}>Meet the Gang</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Floating characters */}
        <View style={styles.charsRow}>
          {CHARS.map((c, i) => (
            <FloatingChar key={c.name} char={c} index={i} />
          ))}
        </View>
      </View>

      {/* HOW KIDS LEARN */}
      <View style={styles.section}>
        <View style={styles.sectionLabelWrap}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        </View>
        <Text style={styles.sectionTitle}>
          Learning that <Text style={styles.titlePurple}>feels like play</Text>
        </Text>
        <View style={styles.stepsRow}>
          {[
            { num: 1, icon: "book-outline" as const, title: "Pick a Story", desc: "Choose from adventures featuring Nino, Miko, or Zara", bg: NIMIZA.yellowSoft, color: NIMIZA.yellowDark },
            { num: 2, icon: "ear-outline" as const, title: "Listen & Explore", desc: "Follow along, answer questions, discover new ideas", bg: NIMIZA.blueSoft, color: NIMIZA.blueDark },
            { num: 3, icon: "ribbon-outline" as const, title: "Earn Badges", desc: "Celebrate what you learned and unlock new adventures", bg: NIMIZA.purpleSoft, color: NIMIZA.purpleDark },
          ].map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <View style={[styles.stepIcon, { backgroundColor: step.bg }]}>
                <Ionicons name={step.icon} size={26} color={step.color} />
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* SKILLS */}
      <View style={[styles.skillsSection]}>
        <View style={styles.sectionLabelWrapDark}>
          <Text style={styles.sectionLabelDark}>LIFE SKILLS</Text>
        </View>
        <Text style={styles.sectionTitleDark}>
          What kids <Text style={styles.titleYellow}>discover</Text>
        </Text>
        <Text style={styles.sectionSubDark}>Six core skills woven through every story and game</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map((s) => (
            <SkillCard key={s.title} skill={s} />
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={[NIMIZA.purpleSoft, NIMIZA.blueSoft]}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaBig}>🌟</Text>
          <Text style={styles.ctaTitle}>Ready to begin?</Text>
          <Text style={styles.ctaSub}>Join thousands of kids already learning through play</Text>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/(tabs)/adventures")}
          >
            <LinearGradient colors={[NIMIZA.purple, "#8A4FE8"]} style={styles.ctaBtnGrad}>
              <Text style={styles.ctaBtnText}>Explore Adventures</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NIMIZA.bg },

  /* HERO */
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: "hidden",
    position: "relative",
  },
  blob: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.45,
  },
  blobYellow: {
    width: 280, height: 280,
    backgroundColor: NIMIZA.yellow,
    top: -80, right: "25%",
    transform: [{ scale: 1.1 }],
  },
  blobBlue: {
    width: 180, height: 180,
    backgroundColor: NIMIZA.blue,
    bottom: 80, left: -40,
  },
  blobPurple: {
    width: 140, height: 140,
    backgroundColor: NIMIZA.purple,
    top: 60, right: -30,
  },
  heroContent: { zIndex: 2 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: NIMIZA.yellow,
    borderRadius: 50,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  heroBadgeText: { fontFamily: "Nunito_800ExtraBold", fontSize: 12, color: NIMIZA.text },
  heroTitle: {
    fontFamily: "FredokaOne_400Regular",
    fontSize: 32,
    lineHeight: 40,
    color: NIMIZA.text,
    marginBottom: 14,
  },
  heroTitlePurple: { color: NIMIZA.purple },
  heroSub: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: NIMIZA.textLight,
    lineHeight: 23,
    marginBottom: 28,
  },
  heroBtns: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  btnPrimary: { borderRadius: 50, overflow: "hidden" },
  btnPrimaryGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  btnPrimaryText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#FFF" },
  btnSecondary: {
    borderWidth: 2.5,
    borderColor: NIMIZA.text,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  btnSecondaryText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: NIMIZA.text },

  /* CHARS */
  charsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 28,
    gap: 8,
  },
  charWrap: { alignItems: "center" },
  charWrapCenter: { zIndex: 2, marginBottom: -8 },
  charBubble: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  nameTag: {
    marginTop: 10,
    backgroundColor: NIMIZA.white,
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: "center",
  },
  nameTagText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13, color: NIMIZA.text },

  /* SECTION */
  section: { paddingHorizontal: 24, paddingVertical: 32 },
  sectionLabelWrap: {
    alignSelf: "flex-start",
    backgroundColor: NIMIZA.yellowSoft,
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: NIMIZA.text, letterSpacing: 1 },
  sectionTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 26, color: NIMIZA.text, marginBottom: 24, lineHeight: 32 },
  titlePurple: { color: NIMIZA.purple },

  /* STEPS */
  stepsRow: { flexDirection: "row", gap: 12 },
  stepCard: {
    flex: 1,
    backgroundColor: NIMIZA.white,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    position: "relative",
  },
  stepNum: {
    position: "absolute",
    top: -12,
    left: "50%",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NIMIZA.text,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -12 }],
  },
  stepNumText: { fontFamily: "Nunito_900Black", fontSize: 11, color: "#FFF" },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  stepTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 14, color: NIMIZA.text, textAlign: "center", marginBottom: 4 },
  stepDesc: { fontFamily: "Nunito_600SemiBold", fontSize: 10, color: NIMIZA.textLight, textAlign: "center", lineHeight: 14 },

  /* SKILLS DARK */
  skillsSection: {
    backgroundColor: NIMIZA.text,
    borderRadius: 40,
    marginHorizontal: 16,
    padding: 28,
    marginBottom: 8,
  },
  sectionLabelWrapDark: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabelDark: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#FFF", letterSpacing: 1 },
  sectionTitleDark: { fontFamily: "FredokaOne_400Regular", fontSize: 26, color: "#FFF", marginBottom: 8 },
  titleYellow: { color: NIMIZA.yellow },
  sectionSubDark: { fontFamily: "Nunito_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 19 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  skillTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 13, color: "#FFF" },
  skillDesc: { fontFamily: "Nunito_600SemiBold", fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 14 },

  /* CTA */
  ctaSection: { padding: 24, paddingTop: 16 },
  ctaCard: {
    borderRadius: 36,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  ctaBig: { fontSize: 48 },
  ctaTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 26, color: NIMIZA.text },
  ctaSub: { fontFamily: "Nunito_600SemiBold", fontSize: 14, color: NIMIZA.textLight, textAlign: "center", lineHeight: 20 },
  ctaBtn: { borderRadius: 50, overflow: "hidden", marginTop: 8 },
  ctaBtnGrad: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 28 },
  ctaBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 15, color: "#FFF" },
});
