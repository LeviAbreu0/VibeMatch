import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Audio } from "expo-av";
import type { Track } from "../lib/deezer";

type AudioContextValue = {
  /** id da música tocando agora (ou null) */
  playingId: number | null;
  /** id da música que está carregando o preview */
  loadingId: number | null;
  /** toca o preview; se já estiver tocando a mesma, pausa */
  toggle: (track: Track) => Promise<void>;
  /** para tudo */
  stop: () => Promise<void>;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

/**
 * Player global: garante que só UMA prévia toque por vez.
 * Quando você toca uma nova, a anterior é descarregada automaticamente.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const stop = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    setPlayingId(null);
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {
        // ignore — som já descarregado
      }
    }
  }, []);

  const toggle = useCallback(
    async (track: Track) => {
      // mesma música tocando → pausa
      if (playingId === track.id && soundRef.current) {
        await stop();
        return;
      }

      // para a anterior (se houver) e toca a nova
      await stop();
      setLoadingId(track.id);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.preview },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setPlayingId(track.id);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
            sound.unloadAsync().catch(() => {});
            if (soundRef.current === sound) soundRef.current = null;
          }
        });
      } catch {
        setPlayingId(null);
      } finally {
        setLoadingId(null);
      }
    },
    [playingId, stop]
  );

  return (
    <AudioCtx.Provider value={{ playingId, loadingId, toggle, stop }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio precisa estar dentro de AudioProvider");
  return ctx;
}
