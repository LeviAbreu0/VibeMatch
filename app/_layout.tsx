import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AudioProvider } from "../context/AudioContext";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <AudioProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="track/[id]" />
      </Stack>
    </AudioProvider>
  );
}
