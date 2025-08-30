import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { fetchUsers } from "../../api/userApi";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsers();
      // Remove self from list
      const filteredUsers = usersData.filter((u) => u._id !== user.id);
      setUsers(filteredUsers);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const startChat = (chatUser) => {
    // To initiate conversation, we need to create/find conversation between logged user and chatUser
    // For simplicity, we assume backend creates conversation automatically when sending first message
    // So here we just navigate to Chat and pass user info. ChatScreen will handle conversation creation/loading
    navigation.navigate("Chat", { user: chatUser });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No users found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => startChat(item)}
          >
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  username: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    margin: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
