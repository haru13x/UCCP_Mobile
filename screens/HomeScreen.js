import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ImageBackground,
  TouchableOpacity, ActivityIndicator, TextInput, Image,
  Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';

import { UseMethod } from '../composable/useMethod';
const formatRange = (startDate, startTime, endDate, endTime) => {
  const sd = new Date(`${startDate}T${startTime}`);
  const ed = new Date(`${endDate}T${endTime}`);
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  const startStr = sd.toLocaleString('en-US', opts);
  const endStr = ed.toLocaleTimeString('en-US', opts);
  return `${startStr} – ${endStr}`;
};

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();  // your same fetch function
    setRefreshing(false);
  };


  const fetchEvents = async () => {
    setLoading(true);
    try {

      const res = await UseMethod(
        'post',
        `events-list/${filter}`,
        null,
        searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      );
      const data = res?.data;
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [filter, searchQuery])
  );
  const handleSearch = () => {
    fetchEvents();
  };

  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      key={value}
      style={[styles.tab, filter === value && styles.tabActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.tabText, filter === value && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    } style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {[
            { label: 'Upcoming', value: 'upcoming', icon: 'calendar-outline' },
            { label: 'Today', value: 'today', icon: 'today-outline' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.filterTab, filter === item.value && styles.filterTabActive]}
              onPress={() => setFilter(item.value)}
            >
              <Ionicons 
                name={item.icon} 
                size={16} 
                color={filter === item.value ? '#fff' : '#667eea'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#667eea" style={styles.searchIcon} />
          <TextInput
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
            returnKeyType="search"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>



      {/* Body */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#1e40af" />
      ) : events?.length === 0 ? (
        <View style={styles.nodatacontainer}>
          <Image
            source={require('../assets/Calendar-bro.png')} // 🔁 replace with your actual image path
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.noData}>No {filter} events founds</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.cardList}>
          {(events || []).map(event => {
            const img = event.image
              ? `${API_URL}/storage/${event.image}`
              : null;
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('EventDetails', { event, mode: 'register' })}
              >
                {img && (
                  <ImageBackground source={{ uri: img }} style={styles.cardImage} resizeMode="cover">
                    <View style={styles.cardOverlay}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
                    </View>
                  </ImageBackground>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardDate}>{formatRange(event.start_date, event.start_time, event.end_date, event.end_time)}</Text>
                  <Text style={styles.cardVenue}>📍 {event.venue || 'N/A'}</Text>

                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  nodatacontainer: {
    alignItems: 'center',

  },


  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  filterTabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 32,
  },
  
  filterTabActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  
  filterIcon: {
    marginRight: 6,
  },
  
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 5,
    lineHeight: 14,
  },
  
  filterTextActive: {
    color: '#fff',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    marginVertical: 8,
    borderColor: '#e2e8f0',
    height: 36,
  },
  
  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    height: 24,
    paddingVertical: 0,
  },




  image: {
    marginTop: 50,
    width: '100%',       // full width of the container
    height: 300,         // or adjust as needed
    borderRadius: 8,     // optional for rounded corners
  },



  tabs: {
    flexDirection: 'row',
    justifyContent: 'right',
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 6,
  },

  tabActive: {
    backgroundColor: '#1e40af',
  },

  tabText: {
    color: '#1e40af',
    fontWeight: '600',
    fontSize: 13,
  },

  tabTextActive: {
    color: '#fff',
  },

  cardList: {
    padding: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },

  cardImage: {
    height: 120,
    justifyContent: 'flex-end',
  },

  cardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardContent: {
    padding: 10,
  },

  cardDate: {
    color: '#374151',
    fontSize: 13,
    marginBottom: 3,
  },

  cardVenue: {
    color: '#4b5563',
    fontSize: 12,
  },

  cardOrganizer: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
  },

  noData: {

    fontSize: 20,
    color: '#777',
  },
});

