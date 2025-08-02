// navigation/MapStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventMapScreen from '../screens/EventMapScreen';
import EventScanScreen from '../screens/EventScanScreen';

const Stack = createNativeStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={EventMapScreen} />
      <Stack.Screen name="EventScan" component={EventScanScreen} />
    </Stack.Navigator>
  );
}
