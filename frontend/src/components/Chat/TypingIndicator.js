import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TypingIndicator({ visible, username }) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{username} is typing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontStyle: "italic",
    color: "#666",
  },
});
