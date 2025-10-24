import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SAMPLE_EVENTS = [
  { id: '1', title: 'Community Meetup', date: '2025-10-19', venue: 'Hall A' },
  { id: '2', title: 'Tech Talk', date: '2025-10-20', venue: 'Auditorium' },
  { id: '3', title: 'Workshop: React Native', date: '2025-10-21', venue: 'Lab 3' },
];

export default function SampleListScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.date} • {item.venue}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#4c669f" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sample Events</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={SAMPLE_EVENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#4c669f', fontWeight: '600', marginLeft: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});