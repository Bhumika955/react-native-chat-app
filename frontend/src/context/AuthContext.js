import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/authApi";

const AuthContext = createContext();

let _token = null;

export const getToken = () => _token;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const storeTokenAndUser = async (tokenValue, userValue) => {
    try {
      await AsyncStorage.setItem("token", tokenValue);
      await AsyncStorage.setItem("user", JSON.stringify(userValue));
      _token = tokenValue;
      setToken(tokenValue);
      setUser(userValue);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to store token and user", e);
    }
  };

  const loadTokenAndUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (storedToken && storedUser) {
        _token = storedToken;
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load token and user", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokenAndUser();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    await storeTokenAndUser(data.token, data.user);
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    await storeTokenAndUser(data.token, data.user);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      _token = null;
      setToken(null);
      setUser(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to logout", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
