// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import BottomTabs from './BottomTabs';
import LoginScreen from '../screens/LoginScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EventScanScreen from '../screens/EventScanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyCalendarScreen from '../screens/MyCalendarScreen';
import EventMapScreen from '../screens/EventMapScreen';
import RequestUserScreen from '../screens/RequestUserScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Main tabbed app layout */}
          <Stack.Screen name="MainTabs" component={BottomTabs} />

          {/* Screens opened on top of tabs */}
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="Event Scan" component={EventScanScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="MyCalendar" component={MyCalendarScreen} />
          <Stack.Screen name="Map" component={EventMapScreen} />
        </>
      ) : (
        <>
         <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RequestUser" component={RequestUserScreen} />
        </>
       
      )}
    </Stack.Navigator>
  );
}
