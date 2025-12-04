import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Menu, Divider, List, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNotifications } from '../context/NotificationContext';
import { API_URL } from '@env';

import HomeScreen from '../screens/HomeScreen';
import EventScannerScreen from '../screens/EventScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyEventScreen from '../screens/MyEventScreen';
import { useAuth } from '../context/AuthContext';
import EventMapScreen from '../screens/EventMapScreen';
import MyCalendarScreen from '../screens/MyCalendarScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Tab = createBottomTabNavigator();

// Import shared mobile sidebar config
import { sidebarConfig } from '../composable/sidebarConfig';

const renderIcon = ({ type, name, color, size = 22 }) => {
  const IconComp = type === 'MaterialIcons' ? MaterialIcons : Ionicons;
  return <IconComp name={name} size={size} color={color} />;
};

// Notification Icon with Badge
const NotificationIcon = ({ color, size }) => {
  const { unreadCount } = useNotifications();

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute',
          right: -6,
          top: -3,
          backgroundColor: '#ff4444',
          borderRadius: 10,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// Notification Tab Screen Component
const NotificationTabScreen = ({ navigation }) => {
  return <NotificationScreen navigation={navigation} />;
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

  // Build absolute image URL if user.image is relative
  const apiBase = (API_URL || 'https://uccp.uccpevents.com').trim().replace(/\/+$/, '');
  const imagePath = user?.image;
  const imageUrl = imagePath ? (String(imagePath).startsWith('http') ? imagePath : `${apiBase}/storage/${String(imagePath).replace(/^\/+/, '')}`) : null;

  // Ensure first + last name are displayed when no profile image
  const hasImage = !!imageUrl;
  const firstName = user?.first_name || user?.firstName || (user?.name ? String(user.name).trim().split(/\s+/)[0] : '');
  const lastName = user?.last_name || user?.lastName || (user?.name ? String(user.name).trim().split(/\s+/).slice(-1)[0] : '');
  const nameFallback = [firstName, lastName].filter(Boolean).join(' ').trim();
  const initialsFL = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || initials;

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
      {/* Hero header with logo and profile */}
      <View style={styles.heroContainer}>
        <View style={styles.heroBackground} />
        <Image
          source={require('../assets/uccp_logo.png')}
          style={styles.heroLogo}
          resizeMode="contain"
        />
   
        <View style={styles.heroProfileRow}>
          <TouchableOpacity onPress={() => onPressItem({ route: 'Profile' })}>
            {hasImage ? (
              <Avatar.Image size={64} source={{ uri: imageUrl }} />
            ) : (
              <Avatar.Text size={64} label={initialsFL} />
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.heroName}>{hasImage ? displayName : (nameFallback || displayName)}</Text>
            {user?.email ? (
              <Text style={styles.heroEmail}>{user.email}</Text>
            ) : null}
            <TouchableOpacity onPress={() => onPressItem({ route: 'Profile' })}>
              <Text style={styles.heroLink}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menu items */}
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

      {/* Footer actions */}
      {/* <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => onPressItem({ action: 'logout' })}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    paddingBottom: 24,
    backgroundColor: '#f8fafc',
  },
  heroContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroLogo: {
    width: 140,
    height: 44,
    alignSelf: 'center',
    marginBottom: 16,
  },
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroEmail: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  heroLink: {
    fontSize: 13,
    color: '#1e3a8a',
    marginTop: 6,
    fontWeight: '600',
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
    minHeight: 56,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  itemTitle: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
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




        {/* Notifications tab */}
        <Tab.Screen
          name="Notifications"
          component={() => <NotificationTabScreen navigation={navigation} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <NotificationIcon color={color} size={size} />
            ),
            tabBarLabel: 'Notifications',
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
