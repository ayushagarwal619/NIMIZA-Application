import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useListCharacters } from "@workspace/api-client-react";
import NIMIZA from "@/constants/nimiza-colors";

const CHAR_META: Record<string, {
  grad: [string, string];
  traitBg: string;
  traitColor: string;
  icon: "search" | "heart" | "flash";
  accent: string;
}> = {
  Nino: { grad: NIMIZA.ninoGrad, traitBg: NIMIZA.yellowSoft, traitColor: NIMIZA.yellowDark, icon: "search", accent: NIMIZA.yellow },
  Miko: { grad: NIMIZA.mikoGrad, traitBg: NIMIZA.blueSoft, traitColor: NIMIZA.blueDark, icon: "heart", accent: NIMIZA.blue },
  Zara: { grad: NIMIZA.zaraGrad, traitBg: NIMIZA.purpleSoft, traitColor: NIMIZA.purpleDark, icon: "flash", accent: NIMIZA.purple },
};

function FloatingAvatar({ grad, icon }: { grad: [string, string]; icon: "search" | "heart" | "flash" }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -12, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <LinearGradient colors={grad} style={styles.modalAvatar}>
        <Ionicons name={icon} size={52} color="#FFF" />
      </LinearGradient>
    </Animated.View>
  );
}

function CharDetailModal({ character, meta, onClose }: {
  character: { name: string; role: string; description: string; teaches: string; traits: string[] };
  meta: typeof CHAR_META[string];
  onClose: () => void;
}) {
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <LinearGradient colors={meta.grad} style={styles.modalHeader}>
            <FloatingAvatar grad={meta.grad} icon={meta.icon} />
            <Text style={styles.modalName}>{character.name}</Text>
            <Text style={styles.modalRole}>{character.role}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
            <View style={[styles.teachesChip, { backgroundColor: meta.traitBg }]}>
              <Ionicons name="star" size={13} color={meta.traitColor} />
              <Text style={[styles.teachesLabel, { color: meta.traitColor }]}>Teaches: </Text>
              <Text style={[styles.teachesValue, { color: meta.traitColor }]}>{character.teaches}</Text>
            </View>

            <Text style={styles.descText}>{character.description}</Text>

            <Text style={styles.traitsHeading}>Character Traits</Text>
            <View style={styles.traitsRow}>
              {(character.traits || []).map((t: string, i: number) => (
                <View key={i} style={[styles.traitChip, { backgroundColor: meta.traitBg }]}>
                  <Text style={[styles.traitText, { color: meta.traitColor }]}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.friendBox, { backgroundColor: meta.accent + "18", borderColor: meta.accent + "44" }]}>
              <Ionicons name={meta.icon} size={20} color={meta.accent} />
              <Text style={[styles.friendText, { color: meta.accent }]}>
                {character.name} appears in many of our adventures — start reading to meet them!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CharCard({ item, meta, onPress }: {
  item: { name: string; role: string; description: string; teaches: string; traits: string[] };
  meta: typeof CHAR_META[string];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <LinearGradient colors={meta.grad} style={styles.cardTop}>
          <LinearGradient colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0)"]} style={styles.cardAvatarBg}>
            <Ionicons name={meta.icon} size={48} color="#FFF" />
          </LinearGradient>
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={[styles.cardRole, { color: meta.traitColor }]}>{item.role}</Text>
          <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
          <View style={styles.traitsMini}>
            {(item.traits || []).slice(0, 3).map((t: string, i: number) => (
              <View key={i} style={[styles.traitMiniChip, { backgroundColor: meta.traitBg }]}>
                <Text style={[styles.traitMiniText, { color: meta.traitColor }]}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.learnMore, { borderColor: meta.traitColor + "55" }]}>
            <Text style={[styles.learnMoreText, { color: meta.traitColor }]}>Tap to learn more</Text>
            <Ionicons name="chevron-forward" size={14} color={meta.traitColor} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function CharactersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selected, setSelected] = useState<null | { name: string; role: string; description: string; teaches: string; traits: string[] }>(null);
  const { data: characters, isLoading } = useListCharacters();

  const selectedMeta = selected ? (CHAR_META[selected.name] ?? Object.values(CHAR_META)[0]) : null;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[NIMIZA.purpleSoft, NIMIZA.blueSoft, NIMIZA.bg]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerLabelWrap}>
          <Text style={styles.headerLabel}>OUR CHARACTERS</Text>
        </View>
        <Text style={styles.headerTitle}>Meet Your{"\n"}<Text style={styles.headerTitlePurple}>Learning Friends</Text></Text>
        <Text style={styles.headerSub}>Tap a character to discover their story</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Animated.View>
            <Ionicons name="people-outline" size={48} color={NIMIZA.purple} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      ) : (
        <FlatList
          data={characters ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom, gap: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = CHAR_META[item.name] ?? Object.values(CHAR_META)[0];
            return (
              <CharCard
                item={item}
                meta={meta}
                onPress={() => setSelected(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={56} color={NIMIZA.textMuted} />
              <Text style={styles.emptyText}>No characters found yet</Text>
            </View>
          }
        />
      )}

      {selected && selectedMeta && (
        <CharDetailModal character={selected} meta={selectedMeta} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NIMIZA.bg },

  header: { paddingHorizontal: 24, paddingBottom: 28 },
  headerLabelWrap: {
    alignSelf: "flex-start",
    backgroundColor: NIMIZA.yellow,
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLabel: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: NIMIZA.text, letterSpacing: 1 },
  headerTitle: { fontFamily: "FredokaOne_400Regular", fontSize: 30, color: NIMIZA.text, lineHeight: 38 },
  headerTitlePurple: { color: NIMIZA.purple },
  headerSub: { fontFamily: "Nunito_600SemiBold", fontSize: 14, color: NIMIZA.textLight, marginTop: 8 },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontFamily: "Nunito_700Bold", fontSize: 16, color: NIMIZA.textLight },

  card: {
    backgroundColor: NIMIZA.white,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: NIMIZA.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTop: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAvatarBg: {
    width: 100,
    height: 110,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { padding: 20 },
  cardName: { fontFamily: "FredokaOne_400Regular", fontSize: 24, color: NIMIZA.text, marginBottom: 2 },
  cardRole: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  cardDesc: { fontFamily: "Nunito_600SemiBold", fontSize: 13, color: NIMIZA.textLight, lineHeight: 20, marginBottom: 12 },
  traitsMini: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  traitMiniChip: { borderRadius: 50, paddingVertical: 4, paddingHorizontal: 12 },
  traitMiniText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11 },
  learnMore: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderWidth: 1.5, borderRadius: 50, paddingVertical: 6, paddingHorizontal: 14 },
  learnMoreText: { fontFamily: "Nunito_700Bold", fontSize: 12 },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontFamily: "Nunito_700Bold", fontSize: 16, color: NIMIZA.textLight },

  /* MODAL */
  modalOverlay: { flex: 1, backgroundColor: "rgba(45,42,74,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: NIMIZA.white, borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: "hidden", maxHeight: "85%" },
  modalHeader: { alignItems: "center", paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24 },
  modalAvatar: {
    width: 100,
    height: 110,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalName: { fontFamily: "FredokaOne_400Regular", fontSize: 30, color: "#FFF", marginBottom: 4 },
  modalRole: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "rgba(255,255,255,0.85)" },
  closeBtn: { position: "absolute", top: 16, right: 16 },

  modalBody: { padding: 24, paddingBottom: 40, gap: 16 },
  teachesChip: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 50, paddingVertical: 7, paddingHorizontal: 16 },
  teachesLabel: { fontFamily: "Nunito_700Bold", fontSize: 13 },
  teachesValue: { fontFamily: "Nunito_900Black", fontSize: 13 },
  descText: { fontFamily: "Nunito_600SemiBold", fontSize: 15, color: NIMIZA.textLight, lineHeight: 23 },
  traitsHeading: { fontFamily: "FredokaOne_400Regular", fontSize: 18, color: NIMIZA.text },
  traitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  traitChip: { borderRadius: 50, paddingVertical: 6, paddingHorizontal: 16 },
  traitText: { fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  friendBox: { borderRadius: 20, borderWidth: 1.5, padding: 16, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  friendText: { fontFamily: "Nunito_600SemiBold", fontSize: 13, lineHeight: 19, flex: 1 },
});
