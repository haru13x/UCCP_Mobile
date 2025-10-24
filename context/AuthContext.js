// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [apiToken, setApiToken] = useState(null);

  // Load user, token, and permissions on startup
  useEffect(() => {
    const loadAuth = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      const storedPerms = await AsyncStorage.getItem('permissions');
      const storedToken = await AsyncStorage.getItem('api_token');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedPerms) {
        try {
          setPermissions(JSON.parse(storedPerms));
        } catch (_) {
          setPermissions([]);
        }
      }
      if (storedToken) {
        setApiToken(storedToken);
      }
    };
    loadAuth();
  }, []);

  const login = async (userData, api_token, perms = []) => {
    setUser(userData);
    setPermissions(perms);
    setApiToken(api_token);

    await AsyncStorage.setItem('api_token', api_token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('permissions', JSON.stringify(perms));
  };

  const logout = async () => {
    setUser(null);
    setPermissions([]);
    setApiToken(null);

    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('api_token');
    await AsyncStorage.removeItem('permissions');
  };

  const updateUser = async (updatedUserData) => {
    setUser(updatedUserData);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider value={{ user, apiToken, permissions, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
