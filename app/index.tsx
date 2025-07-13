import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Musica = {
  id: string;
  titulo: string;
  artista: string;
  capa: string;
};

const musicas: Musica[] = [
  { id: '1', titulo: 'ロキ', artista: 'みきとP', capa: 'https://i1.sndcdn.com/artworks-nB3GFFPQmS8rUH5d-ErCB4Q-t500x500.jpg' },
  { id: '2', titulo: 'ギミチョコー！！', artista: 'ベビーメタル', capa: 'https://i.scdn.co/image/ab67616d0000b273a2e65e6a12911e93583f529d' },
  { id: '3', titulo: 'ライアーダンサー', artista: '重音テト', capa: 'https://i.scdn.co/image/ab67616d0000b273a0973e85ad2e83d847fa4fe6' },
  { id: '4', titulo: '"青のすみか', artista: 'キタニタツヤ', capa: 'https://m.media-amazon.com/images/I/51X+IWqR+mL._UXNaN_FMjpg_QL85_.jpg' },
  { id: '5', titulo: 'メズマライザー', artista: 'サツキ', capa: 'https://m.media-amazon.com/images/I/517oVPJFFOL._UXNaN_FMjpg_QL85_.jpg' },
  { id: '6', titulo: 'テトリス', artista: '柊マグネタイト', capa: 'https://m.media-amazon.com/images/I/41sp6WGUPlL._UXNaN_FMjpg_QL85_.jpg' },
  { id: '7', titulo: 'Billie Jean - SynthV cover by Kasane Teto', artista: '重音テト & Michael Jackson', capa: 'https://i.ytimg.com/vi/RdUccsrVjh8/sddefault.jpg' },
  { id: '10', titulo: '廻廻奇譚', artista: 'Eve', capa: 'https://m.media-amazon.com/images/I/51NE6DvJ2VL._UXNaN_FMjpg_QL85_.jpg' },
];

export default function Index() {
  const exibirMusica = ({ item }: { item: Musica }) => (
    <TouchableOpacity
      onPress={() => console.log(`Tocando ${item.titulo}`)}
      style={styles.item}
    >
      <Image source={{ uri: item.capa }} style={styles.capa} />
      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.artista}>{item.artista}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixo no topo */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>VibeMatch</Text>
        <Image
          source={{ uri: 'https://i.pinimg.com/736x/68/9a/a6/689aa60e1e7b72796a373c965d7f9fa6.jpg' }}
          style={styles.avatar}
        />
      </View>

      {/* Lista de músicas */}
      <FlatList
        data={musicas}
        keyExtractor={(item) => item.id}
        renderItem={exibirMusica}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    padding: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#444',
    paddingBottom: 12,
    alignItems: 'center',
  },
  capa: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titulo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  artista: {
    color: '#ccc',
    fontSize: 14,
  },
});
