import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Menu, Divider, List, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import EventScannerScreen from '../screens/EventScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyEventScreen from '../screens/MyEventScreen';
import { useAuth } from '../context/AuthContext';
import EventMapScreen from '../screens/EventMapScreen';
import MyCalendarScreen from '../screens/MyCalendarScreen';

const Tab = createBottomTabNavigator();

// Import shared mobile sidebar config
import { sidebarConfig } from '../composable/sidebarConfig';

const renderIcon = ({ type, name, color, size = 22 }) => {
  const IconComp = type === 'MaterialIcons' ? MaterialIcons : Ionicons;
  return <IconComp name={name} size={size} color={color} />;
};

// Add a full-screen Menu page that renders from menuConfig
// Menu Screen (full-page)
const MenuScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const displayName =
    (user && (user.name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email)) ||
    'User';

  const getInitials = (text) => {
    if (!text) return 'U';
    const parts = String(text).trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p) => p[0]).join('');
    return initials ? initials.toUpperCase() : 'U';
  };
  const initials = getInitials(displayName);

  const onPressItem = (item) => {
    const parentNav = typeof navigation.getParent === 'function' ? navigation.getParent() : null;
    const nav = parentNav || navigation;

    if (item.action === 'logout') {
      logout();
      return;
    }
    if (item.route) {
      try {
        nav.navigate(item.route);
      } catch (e) {
        // Fallback: attempt push if navigate fails
        if (typeof nav.push === 'function') {
          nav.push(item.route);
        }
      }
    }
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    const { type, name, color } = icon;
    if (type === 'Ionicons') {
      return <Ionicons name={name} size={24} color={color || '#4c669f'} />;
    }
    if (type === 'MaterialIcons') {
      return <MaterialIcons name={name} size={24} color={color || '#4c669f'} />;
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.menuContainer}>
      {/* Messenger-style header with avatar and name */}
      <List.Section style={styles.headerSection}>
        <List.Item
          title={displayName}
          description="View profile"
          left={() => <Avatar.Text size={44} label={initials} />}
          right={() => <Ionicons name="chevron-forward" size={20} color="#999" />}
          onPress={() => onPressItem({ route: 'Profile' })}
          titleStyle={styles.headerName}
          descriptionStyle={styles.headerSubtitle}
        />
      </List.Section>
      <Divider />

      {sidebarConfig.map((item, sectionIdx) => (
        item.children && Array.isArray(item.children) ? (
          <List.Section key={`section-${sectionIdx}`}>
            <List.Subheader style={styles.sectionHeader}>{item.label}</List.Subheader>
            {item.children
              .filter((child) => child.rule === null)
              .map((child, idx) => (
                <List.Item
                  key={`item-${sectionIdx}-${idx}`}
                  title={child.label}
                  left={() => renderIcon(child.icon)}
                  right={() => <Ionicons name="chevron-forward" size={20} color="#999" />}
                  onPress={() => onPressItem(child)}
                  disabled={!child.route && !child.action}
                  style={styles.itemRow}
                  titleStyle={styles.itemTitle}
                />
              ))}
            <Divider />
          </List.Section>
        ) : (
          item.rule === null && (
            <List.Item
              key={`item-${sectionIdx}`}
              title={item.label}
              left={() => renderIcon(item.icon)}
              right={() => <Ionicons name="chevron-forward" size={20} color="#999" />}
              onPress={() => onPressItem(item)}
              disabled={!item.route && !item.action}
              style={styles.itemRow}
              titleStyle={styles.itemTitle}
            />
          )
        )
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerSection: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  itemRow: {
    minHeight: 52,
  },
  itemTitle: {
    fontSize: 16,
  },
});

export default function BottomTabs({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, permissions, logout } = useAuth();
  const can = (perm) => Array.isArray(permissions) && permissions.includes(perm);

  return (
    <>
      {/* Bottom menu overlay anchored near the tab bar */}
      {/* Overlay menu removed; use full-screen Menu tab via MenuScreen */}

      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: 'left',
          tabBarActiveTintColor: '#4c669f',
        }}
      >
        {/* Always include Home to avoid empty navigator error */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Make Event Scanner public (like web Scan) */}
        <Tab.Screen
          name="Event Scanner"
          component={EventScannerScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="scan-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Make My Event public */}
        <Tab.Screen
          name="My Event"
          component={MyEventScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />


        {/* Menu tab opens the full-screen Menu page */}
        <Tab.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal" size={size} color={color} />
            ),
            tabBarLabel: 'Menu',
          }}
        />
      </Tab.Navigator>
    </>
  );
}
