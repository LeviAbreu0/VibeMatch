import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Track } from "../lib/deezer";
import { colors, radius, spacing } from "../lib/theme";

type Props = {
  track: Track;
  onPress?: () => void;
  /** mostra o botão de tocar prévia */
  playable?: boolean;
  index?: number;
};

export function TrackCard({ track, onPress, playable = true, index }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const togglePreview = async () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      if (soundRef.current && playing) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlaying(false);
        return;
      }

      setLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.preview },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlaying(true);
      setLoading(false);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch {
      setLoading(false);
      setPlaying(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {typeof index === "number" && <Text style={styles.rank}>{index + 1}</Text>}

      <Image source={{ uri: track.album.cover_medium }} style={styles.cover} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist.name}
        </Text>
      </View>

      {playable && (
        <TouchableOpacity
          onPress={togglePreview}
          style={[styles.playBtn, playing && styles.playBtnActive]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={playing ? "pause" : "play"}
              size={18}
              color={playing ? colors.text : colors.primary}
            />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm + 2,
    gap: spacing.md,
  },
  rank: {
    width: 22,
    textAlign: "center",
    color: colors.textFaint,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  cover: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDim,
  },
  playBtnActive: {
    backgroundColor: colors.primary,
  },
});
