import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { Provider as PaperProvider } from 'react-native-paper'; // ✅ Add this

export default function App() {
  return (
    <PaperProvider> {/* ✅ Wrap with react-native-paper Provider */}
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
