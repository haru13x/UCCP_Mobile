import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import EventScanScreen from '../screens/EventScanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventScannerScreen from '../screens/EventScannerScreen';
import { useAuth } from '../context/AuthContext'; // Make sure you have this

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { logout } = useAuth(); // use your logout function from context or props

  return (
    <Drawer.Navigator initialRouteName="/">
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen name="Event Scanner" component={EventScannerScreen} />
      
      {/* <Drawer.Screen name="Profile" component={ProfileScreen} /> */}
    </Drawer.Navigator>
  );
}
