import { Platform } from "react-native";

export type Artist = {
  id: number;
  name: string;
};

export type Album = {
  id: number;
  title: string;
  cover_medium: string;
  cover_big?: string;
};

export type Track = {
  id: number;
  title: string;
  preview: string; // trecho de 30s (mp3)
  link: string;
  duration: number;
  artist: Artist;
  album: Album;
};

const BASE = "https://api.deezer.com";

/**
 * No web a Deezer não envia cabeçalhos CORS, então passamos por um proxy
 * público. No Android/iOS (Expo Go / build) o fetch direto funciona normal.
 */
function endpoint(path: string): string {
  const url = `${BASE}${path}`;
  if (typeof window !== "undefined" && Platform.OS === "web") {
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
  return url;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(endpoint(path));
  if (!res.ok) {
    throw new Error(`Deezer respondeu ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Busca músicas pelo título ou artista. */
export async function searchTracks(query: string): Promise<Track[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return [];
  const data = await getJSON<{ data: Track[] }>(`/search?q=${q}`);
  return (data.data ?? []).filter((t) => t.preview);
}

/** Detalhes de uma música (usado para descobrir o artista). */
export async function getTrack(id: number): Promise<Track> {
  return getJSON<Track>(`/track/${id}`);
}

/** Top músicas de um artista. */
export async function getArtistTop(artistId: number, limit = 8): Promise<Track[]> {
  const data = await getJSON<{ data: Track[] }>(
    `/artist/${artistId}/top?limit=${limit}`
  );
  return (data.data ?? []).filter((t) => t.preview);
}

/** Artistas parecidos com o informado. */
export async function getRelatedArtists(artistId: number, limit = 4): Promise<Artist[]> {
  const data = await getJSON<{ data: Artist[] }>(`/artist/${artistId}/related`);
  return (data.data ?? []).slice(0, limit);
}

/** Faixas da mesma álbum. */
export async function getAlbumTracks(albumId: number, limit = 10): Promise<Track[]> {
  const data = await getJSON<{ data: Track[] }>(
    `/album/${albumId}/tracks?limit=${limit}`
  );
  return (data.data ?? []).filter((t) => t.preview);
}

/**
 * Monta a lista de músicas combinando várias fontes, porque a Deezer não
 * tem endpoint de "relacionados" por música:
 *
 * 1. top do próprio artista (músicas de artistas reais)
 * 2. top dos artistas parecidos
 * 3. outras faixas do mesmo álbum
 * 4. fallback: busca pelo título — pega covers e versões da mesma música
 *    (essencial pra faixas nichadas que são upload de usuário e não têm
 *    related de artista)
 *
 * Remove a música original e duplicatas.
 */
export async function getRelatedTracks(track: Track): Promise<Track[]> {
  const [ownTop, relatedArtists, albumTracks, covers] = await Promise.all([
    getArtistTop(track.artist.id, 8).catch(() => [] as Track[]),
    getRelatedArtists(track.artist.id, 4).catch(() => [] as Artist[]),
    getAlbumTracks(track.album.id, 10).catch(() => [] as Track[]),
    searchTracks(track.title).catch(() => [] as Track[]),
  ]);

  const relatedTops = await Promise.all(
    relatedArtists.map((a) => getArtistTop(a.id, 5).catch(() => [] as Track[]))
  );

  const seen = new Set<number>([track.id]);
  const result: Track[] = [];

  const push = (list: Track[]) => {
    for (const t of list) {
      if (t.id !== track.id && !seen.has(t.id)) {
        seen.add(t.id);
        result.push(t);
      }
    }
  };

  // artistas reais: top + relacionados primeiro
  push(ownTop);
  for (const list of relatedTops) push(list);
  push(albumTracks);
  // covers / versões da mesma música (cobre faixas nichadas)
  push(covers);

  return result;
}
