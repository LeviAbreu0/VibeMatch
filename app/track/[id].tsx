import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { TrackCard } from "../../components/TrackCard";
import {
  getRelatedTracks,
  getTrack,
  type Track,
} from "../../lib/deezer";
import { colors, radius, spacing } from "../../lib/theme";

type Status = "loading" | "ready" | "error";

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [track, setTrack] = useState<Track | null>(null);
  const [related, setRelated] = useState<Track[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const [playing, setPlaying] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const trackId = Number(id);
      if (!trackId) {
        setStatus("error");
        return;
      }
      try {
        const main = await getTrack(trackId);
        if (cancelled) return;
        setTrack(main);

        const rel = await getRelatedTracks(main);
        if (cancelled) return;
        setRelated(rel);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, [id]);

  const togglePreview = async () => {
    if (!track) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      if (soundRef.current && playing) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlaying(false);
        return;
      }
      setPreviewLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.preview },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlaying(true);
      setPreviewLoading(false);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch {
      setPreviewLoading(false);
      setPlaying(false);
    }
  };

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Buscando músicas com a mesma vibe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "error" || !track) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header onBack={() => router.back()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.danger} />
          <Text style={styles.errorText}>Não consegui carregar essa música.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header onBack={() => router.back()} />

      <FlatList
        data={related}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Música escolhida */}
            <View style={styles.hero}>
              <Image source={{ uri: track.album.cover_big ?? track.album.cover_medium }} style={styles.heroCover} />
              <Text style={styles.heroTitle} numberOfLines={2}>
                {track.title}
              </Text>
              <Text style={styles.heroArtist} numberOfLines={1}>
                {track.artist.name}
              </Text>
              <Text style={styles.heroAlbum} numberOfLines={1}>
                {track.album.title}
              </Text>

              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={[styles.previewBtn, playing && styles.previewBtnActive]}
                  onPress={togglePreview}
                >
                  {previewLoading ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Ionicons
                      name={playing ? "pause" : "play"}
                      size={18}
                      color={colors.text}
                    />
                  )}
                  <Text style={styles.previewText}>
                    {playing ? "Tocando..." : "Ouvir prévia"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.externalBtn}
                  onPress={() => Linking.openURL(track.link).catch(() => {})}
                >
                  <Ionicons name="open-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Você pode curtir também</Text>
            {related.length === 0 && (
              <Text style={styles.emptyRelated}>
                Não achei relacionadas pra essa música.
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => <TrackCard track={item} index={index} />}
      />
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>VibeMatch</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  heroCover: {
    width: 180,
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.lg,
  },
  heroArtist: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  heroAlbum: {
    color: colors.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  previewBtnActive: {
    backgroundColor: "#9333ea",
  },
  previewText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  externalBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDim,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyRelated: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryText: {
    color: colors.text,
    fontWeight: "600",
  },
});
