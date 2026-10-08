import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "../components/SearchBar";
import { TrackCard } from "../components/TrackCard";
import { searchTracks, type Track } from "../lib/deezer";
import { colors, spacing } from "../lib/theme";

export default function Index() {
  const router = useRouter();
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const reqId = useRef(0);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const tracks = await searchTracks(q);
      if (id !== reqId.current) return; // resposta antiga, descarta
      setResults(tracks);
    } catch {
      if (id !== reqId.current) return;
      setError("Não consegui buscar agora. Tente de novo.");
      setResults([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  const openTrack = (track: Track) => {
    Keyboard.dismiss();
    router.push(`/track/${track.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Vibe<span style={styles.logoAccent}>Match</span>
        </Text>
        <Text style={styles.subtitle}>
          Escolha uma música e descubra outras com a mesma vibe
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar onSearch={handleSearch} />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={colors.textFaint} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.center}>
          <View style={styles.iconBubble}>
            <Ionicons
              name={query ? "musical-notes-outline" : "sparkles-outline"}
              size={40}
              color={colors.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {query ? "Nada encontrado" : "Comece a buscar"}
          </Text>
          <Text style={styles.emptyText}>
            {query
              ? `Nenhuma música para “${query}”. Tente outro nome.`
              : "Digite o nome de uma música ou artista e veja as relacionadas."}
          </Text>
        </View>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TrackCard track={item} onPress={() => openTrack(item)} playable={false} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {results.length} resultado{results.length === 1 ? "" : "s"} — toque pra ver as
              relacionadas
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  logo: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  resultCount: {
    color: colors.textFaint,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconBubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
