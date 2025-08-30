import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { fetchMessages } from "../../api/messageApi";
import { createSocket, disconnectSocket } from "../../utils/socket";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatScreen({ route }) {
  const { user: authUser } = useAuth();
  const chatUser = route.params.user;
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const setupConversationAndSocket = async () => {
      // Find or create conversation between authUser and chatUser
      // Since backend does not provide conversation creation endpoint,
      // we simulate by fetching messages for known conversation if exists.
      // We'll create conversation on first message send if no conversationId yet.

      setLoading(true);
      try {
        // We try to find conversationId by querying messages or users
        // We'll try to find conversation by fetching messages for each conversation (not implemented)
        // For now, we assume conversationId is a stable id string between user ids sorted lexicographically
        // So we create a deterministic conversationId for demo purposes
        // In production, should have API to create/fetch conversation

        const conversationIdCandidate = [authUser.id, chatUser._id]
          .sort()
          .join("_");

        // We'll try to fetch messages with this id - if fail, no messages yet
        // But our backend expects Mongo ObjectId so this won't work...
        // So we need to create conversation on first message send and store conversationId in state

        // So initial messages empty, conversationId null

        setConversationId(null);
        setMessages([]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    setupConversationAndSocket();

    return () => {
      if (socketRef.current) {
        disconnectSocket(socketRef.current);
      }
    };
  }, [chatUser, authUser]);

  useEffect(() => {
    if (!authUser || !chatUser) return;
    // Setup socket connection
    socketRef.current = createSocket();

    socketRef.current.on("connect_error", (err) => {
      // eslint-disable-next-line no-console
      console.error("Socket connection error", err);
    });

    socketRef.current.on("message:new", (message) => {
      if (
        message.conversationId === conversationId ||
        conversationId === null
      ) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some((m) => m._id === message._id);
          if (exists) return prevMessages;
          return [...prevMessages, message].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        if (conversationId === null) {
          setConversationId(message.conversationId);
        }
        // Emit read receipt for incoming message
        socketRef.current.emit("message:read", {
          conversationId: message.conversationId,
          messageId: message._id,
        });
      }
    });

    socketRef.current.on("typing:start", ({ userId }) => {
      if (userId !== authUser.id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    });

    socketRef.current.on("typing:stop", ({ userId }) => {
      if (userId !== authUser.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    });

    socketRef.current.on("message:read", ({ messageId, userId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId && !msg.readBy.includes(userId)
            ? { ...msg, readBy: [...msg.readBy, userId] }
            : msg
        )
      );
    });

    return () => {
      if (socketRef.current) {
        disconnectSocket(socketRef.current);
      }
    };
  }, [conversationId, authUser]);

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await fetchMessages(conversationId);
        setMessages(msgs);
        // Emit read receipt for all messages on load
        msgs.forEach((msg) => {
          if (!msg.readBy.includes(authUser.id)) {
            socketRef.current?.emit("message:read", {
              conversationId,
              messageId: msg._id,
            });
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, authUser]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    // If no conversationId, create conversation by sending message
    if (!conversationId) {
      // Create conversation via backend - not implemented in backend routes
      // So send message with temporary conversationId? No, backend expects valid ObjectId
      // We will create conversation in backend socketHandler on first message send
      // So here we simulate by sending message with conversationId null - backend will reject
      // So we need a REST API to create conversation first - not implemented
      // For now, we just show alert and prevent sending
      alert(
        "Conversation not yet established. Please try again after starting conversation from user list."
      );
      return;
    }

    socketRef.current.emit(
      "message:send",
      { conversationId, text: inputText.trim() },
      (response) => {
        if (response.status === "ok") {
          setInputText("");
        } else {
          alert(response.message || "Failed to send message");
        }
      }
    );
  };

  const onInputChange = (text) => {
    setInputText(text);
    if (!socketRef.current) return;

    socketRef.current.emit("typing:start", { conversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing:stop", { conversationId });
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={100}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <>
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            inverted
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwnMessage={item.senderId === authUser.id}
                authUserId={authUser.id}
              />
            )}
          />
          <TypingIndicator visible={typingUsers.has(chatUser._id)} username={chatUser.username} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={inputText}
              onChangeText={onInputChange}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
