import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (username.trim().length < 3) {
      Alert.alert("Validation Error", "Username must be at least 3 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Validation Error", "Email is not valid");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      Alert.alert("Success", "Registration successful. Please log in.");
      navigation.navigate("Login");
    } catch (err) {
      if (err.response?.data?.message) {
        Alert.alert("Registration Error", err.response.data.message);
      } else {
        Alert.alert("Registration Error", "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login here.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 16,
    color: "#007bff",
    textAlign: "center",
  },
});
