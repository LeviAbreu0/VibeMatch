# 🎧 VibeMatch

App mobile pra descobrir músicas. **Escolha uma música e veja outras com a mesma vibe.**

Feito com **Expo + React Native + TypeScript** e a [Deezer API](https://developers.deezer.com/api) (gratuita, sem API key).

## ✨ Funcionalidades

- 🔍 **Busca em tempo real** — digite o nome da música ou artista (com debounce)
- 🎵 **Músicas relacionadas** — combina várias fontes pra achar a vibe certa:
  - top do próprio artista
  - artistas parecidos
  - outras faixas do mesmo álbum
  - covers e versões da mesma música (pra faixas nichadas)
- ▶️ **Prévia de 30s** — ouça um trecho direto no app
- 🌐 **Abre no Deezer** — link direto pra ouvir a faixa completa
- 🎨 **Tema escuro** com destaque roxo
- 📱 **Haptics** nos toques

## 🛠️ Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | React Native 0.79 + Expo SDK 53 |
| Roteamento | expo-router |
| Áudio | expo-av |
| Linguagem | TypeScript |
| API | Deezer (pública) |

## 🚀 Rodando

```bash
npm install
npx expo start
```

Escaneie o QR code com o **Expo Go** (Android/iOS) ou pressione `a`/`i` pra abrir no emulador.

> **Nota (web):** a Deezer não envia cabeçalhos CORS, então no navegador as requisições passam por um proxy público. No Android/iOS o fetch é direto.

## 📁 Estrutura

```
app/
  _layout.tsx      # tema escuro + setup de áudio
  index.tsx        # tela de busca
  track/[id].tsx   # música escolhida + relacionadas
components/
  SearchBar.tsx    # input com debounce
  TrackCard.tsx    # card de música (com botão de prévia)
lib/
  deezer.ts        # client da API + lógica de relacionados
  theme.ts         # cores e espaçamento
```

## 🔑 Ideia por trás

A Deezer **não tem endpoint de "relacionados" por música**, então o `getRelatedTracks` em `lib/deezer.ts` combina top de artistas, artistas parecidos, álbum e busca por título — e depois remove duplicatas. Assim funciona tanto pra hits famosos quanto pra faixas nichadas (uploads de usuário), que são justamente as que mais aparecem em playlists de J-rock/Vocaloid.

---

Feito por [Levi Abreu](https://github.com/LeviAbreu0)
