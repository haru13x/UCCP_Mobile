import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import EventScannerScreen from '../screens/EventScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyEventScreen from '../screens/MyEventScreen';
import { useAuth } from '../context/AuthContext';
import EventMapScreen from '../screens/EventMapScreen';
import MyCalendarScreen from '../screens/MyCalendarScreen'; // Import your new screen
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, logout } = useAuth(); // Get user object and logout function

  // Get user initial (e.g., 'J' from John)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'left',
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: '#4c669f',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {userInitial}
                    </Text>
                  </View>
                </TouchableOpacity>
              }
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 8,
                elevation: 4,
                paddingRight: 5,
                marginVertical: 10,
              }}
            >

              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Profile');
                }}
                title="Profile"
                leadingIcon={() => (
                  <Ionicons name="person-circle-outline" size={22} color="#4c669f" />
                )}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Map'); // 👈 navigate to new screen
                }}
                title="Event Map"
                leadingIcon={() => (
                  <Ionicons name="map-outline" size={22} color="#4c669f" />
                )}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  logout();
                }}
                title="Logout"
                leadingIcon={() => (
                  <MaterialIcons name="logout" size={22} color="#dc3545" />
                )}
                titleStyle={{ color: '#dc3545' }}
              />
            </Menu>
          </View>
        ),
        tabBarActiveTintColor: '#4c669f',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Event Scanner"
        component={EventScannerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Event"
        component={MyEventScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
        <Tab.Screen
        name="Calendar"
        component={MyCalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
