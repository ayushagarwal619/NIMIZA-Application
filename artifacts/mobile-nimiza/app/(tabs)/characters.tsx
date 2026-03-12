import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useListCharacters } from "@workspace/api-client-react";
import NIMIZA_COLORS from "@/constants/nimiza-colors";

const CHARACTER_COLORS: Record<string, string> = {
  Nino: NIMIZA_COLORS.nino,
  Miko: NIMIZA_COLORS.miko,
  Zara: NIMIZA_COLORS.zara,
};

interface Character {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  traits: string[];
  description: string;
  teaches: string;
}

const ICON_MAP: Record<string, "search" | "heart" | "star" | "leaf"> = {
  Nino: "search",
  Miko: "heart",
  Zara: "star",
};

function CharacterModal({ character, onClose }: { character: Character; onClose: () => void }) {
  const iconName = ICON_MAP[character.name] ?? "leaf";

  return (
    <Modal transparent visible animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[character.color, character.color + "88"]}
            style={styles.modalHeader}
          >
            <View style={styles.modalIconCircle}>
              <Ionicons name={iconName} size={40} color="#FFF" />
            </View>
            <Text style={styles.modalName}>{character.name}</Text>
            <Text style={styles.modalRole}>{character.role}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.teachesBox}>
              <Text style={styles.teachesLabel}>TEACHES</Text>
              <Text style={[styles.teachesValue, { color: character.color }]}>{character.teaches}</Text>
            </View>

            <Text style={styles.descText}>{character.description}</Text>

            <Text style={styles.traitsLabel}>Traits</Text>
            <View style={styles.traitsRow}>
              {character.traits.map((t, i) => (
                <View key={i} style={[styles.traitChip, { backgroundColor: character.color + "22" }]}>
                  <Text style={[styles.traitText, { color: character.color }]}>{t}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CharacterCard({ character, onPress }: { character: Character; onPress: () => void }) {
  const color = CHARACTER_COLORS[character.name] || character.color || NIMIZA_COLORS.primary;
  const iconName = ICON_MAP[character.name] ?? "leaf";

  return (
    <TouchableOpacity style={[styles.card, { borderColor: color + "44" }]} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={[color + "22", color + "08"]} style={styles.cardGradient}>
        <View style={[styles.cardIconCircle, { backgroundColor: color }]}>
          <Ionicons name={iconName} size={28} color="#FFF" />
        </View>
        <Text style={[styles.cardName, { color }]}>{character.name}</Text>
        <Text style={styles.cardRole}>{character.role}</Text>
        <Text style={styles.cardTeaches} numberOfLines={2}>{character.teaches}</Text>
        <View style={[styles.cardBtn, { borderColor: color + "55" }]}>
          <Text style={[styles.cardBtnText, { color }]}>Learn more</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function CharactersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selected, setSelected] = useState<Character | null>(null);

  const { data: characters, isLoading } = useListCharacters();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[NIMIZA_COLORS.miko, "#E879F9"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Text style={styles.headerTitle}>Meet the Gang</Text>
        <Text style={styles.headerSub}>Your learning companions</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <Ionicons name="hourglass" size={32} color={NIMIZA_COLORS.textMuted} />
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      ) : (
        <FlatList
          data={characters || []}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
          scrollEnabled={!!((characters?.length ?? 0) > 0)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const color = CHARACTER_COLORS[item.name] || item.color || NIMIZA_COLORS.primary;
            return (
              <CharacterCard
                character={{ ...item, color }}
                onPress={() => setSelected({ ...item, color })}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={48} color={NIMIZA_COLORS.textMuted} />
              <Text style={styles.emptyText}>No characters yet. Check back soon!</Text>
            </View>
          }
        />
      )}

      {selected && (
        <CharacterModal character={selected} onClose={() => setSelected(null)} />
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
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  cardIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  cardRole: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
  },
  cardTeaches: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 15,
  },
  cardBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  cardBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: NIMIZA_COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    padding: 28,
    paddingTop: 32,
  },
  modalIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modalRole: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 8,
  },
  modalBody: {
    padding: 24,
  },
  teachesBox: {
    backgroundColor: NIMIZA_COLORS.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  teachesLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  teachesValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  descText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: NIMIZA_COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  traitsLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: NIMIZA_COLORS.text,
    marginBottom: 10,
  },
  traitsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 32,
  },
  traitChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  traitText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
