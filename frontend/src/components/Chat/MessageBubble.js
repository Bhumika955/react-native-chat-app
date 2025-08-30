import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatDate } from "../../utils/formatDate";

export default function MessageBubble({ message, isOwnMessage, authUserId }) {
  const isRead = message.readBy?.length > 1; // read by other user
  const isSent = message.senderId === authUserId;

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.containerRight : styles.containerLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <Text style={styles.text}>{message.text}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.time}>{formatDate(message.createdAt)}</Text>
          {isSent && (
            <Text style={[styles.readReceipt, isRead ? styles.read : styles.sent]}>
              {isRead ? "✓✓" : "✓"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
    flexDirection: "row",
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  containerRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleLeft: {
    backgroundColor: "#e5e5ea",
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: "#007bff",
    borderTopRightRadius: 0,
  },
  text: {
    color: "#000",
    fontSize: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: "#555",
    marginRight: 6,
  },
  readReceipt: {
    fontSize: 12,
  },
  sent: {
    color: "#ccc",
  },
  read: {
    color: "#4fc3f7",
  },
});
