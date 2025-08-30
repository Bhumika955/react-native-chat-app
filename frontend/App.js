import React from "react";
import { SafeAreaView, Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import RegisterScreen from "./src/components/Auth/RegisterScreen";
import LoginScreen from "./src/components/Auth/LoginScreen";
import HomeScreen from "./src/components/Home/HomeScreen";
import ChatScreen from "./src/components/Chat/ChatScreen";

import { AuthProvider } from "./src/context/AuthContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          backgroundColor: "#fff",
        }}
      >
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Login" }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Users" }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                title: route.params.user?.username || "Chat",
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}
