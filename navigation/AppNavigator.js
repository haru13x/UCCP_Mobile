import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import LoginScreen from '../screens/LoginScreen';
import RequestUserScreen from '../screens/RequestUserScreen';
import EventMapScreen from '../screens/EventMapScreen';
import EventScannerScreen from '../screens/EventScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyEventScreen from '../screens/MyEventScreen';
import MyCalendarScreen from '../screens/MyCalendarScreen';
import { useAuth } from '../context/AuthContext';
import SampleListScreen from '../screens/SampleListScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EventScanScreen from '../screens/EventScanScreen';
import RequestRegistrationScreen from '../screens/RequestRegistrationScreen';
import EventManageScreen from '../screens/EventManageScreen';
import EventFormScreen from '../screens/EventFormScreen';
import EventOverviewScreen from '../screens/EventOverviewScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, apiToken } = useAuth();
  const isAuthenticated = !!user && !!apiToken;

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Map" component={EventMapScreen} />
          <Stack.Screen name="Event Scanner" component={EventScannerScreen} />
          <Stack.Screen name="My Event" component={MyEventScreen} />
          <Stack.Screen name="MyCalendar" component={MyCalendarScreen} />
          <Stack.Screen name="RequestUser" component={RequestUserScreen} />
          <Stack.Screen name="RequestRegistration" component={RequestRegistrationScreen} options={{ title: 'User Requests' }} />
          <Stack.Screen name="SampleList" component={SampleListScreen} options={{ title: 'Sample Events' }} />
          <Stack.Screen name="EventScan" component={EventScanScreen} options={{ title: 'Scan QR' }} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
          <Stack.Screen name="EventManage" component={EventManageScreen} options={{ title: 'Event Management' }} />
          <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: 'Event Form' }} />
          <Stack.Screen name="EventOverview" component={EventOverviewScreen} options={{ title: 'Event Overview' }} />
          <Stack.Screen name="Workspace" component={WorkspaceScreen} options={{ title: 'Workspace' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RequestUser" component={RequestUserScreen} options={{ title: 'Request Account' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
