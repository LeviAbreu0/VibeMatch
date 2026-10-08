import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, type TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../lib/theme";

/** remove o outline padrão do navegador no focus (web only, inofensivo no native) */
const noOutline = { outlineStyle: "none" } as unknown as TextStyle;

type Props = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export function SearchBar({ onSearch, placeholder }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const trimmed = value.trim();
    if (!trimmed) {
      onSearch("");
      return;
    }
    timer.current = setTimeout(() => onSearch(trimmed), 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, onSearch]);

  return (
    <View style={[styles.wrap, focused && styles.wrapFocused]}>
      <Ionicons name="search" size={20} color={focused ? colors.primary : colors.textFaint} />
      <TextInput
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? "Buscar música ou artista..."}
        placeholderTextColor={colors.textFaint}
        style={[styles.input, noOutline]}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => setValue("")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={colors.textFaint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg + 2,
    height: 56,
    gap: spacing.md,
  },
  wrapFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    letterSpacing: 0.3,
    height: "100%",
  },
});
