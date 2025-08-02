import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const details = user?.details || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/icon.png')} // Replace with your avatar or user's avatar if available
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {details.first_name} {details.middle_name || ''} {details.last_name}
        </Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <View style={styles.card}>
        <ProfileItem icon="mail" label="Email" value={user?.email} />
        <ProfileItem icon="call" label="Phone" value={details.phone_number || 'N/A'} />
        <ProfileItem icon="calendar" label="Birthdate" value={details.birthdate || 'N/A'} />
        <ProfileItem
          icon="person"
          label="Gender"
          value={
            details.sex_id === 1
              ? 'Male'
              : details.sex_id === 2
              ? 'Female'
              : 'Other'
          }
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <View style={styles.item}>
      <Ionicons name={icon} size={20} color="#666" style={{ marginRight: 10 }} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1877f2',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});
