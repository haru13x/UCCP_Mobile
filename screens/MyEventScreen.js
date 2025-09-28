import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { UseMethod } from '../composable/useMethod';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const formatRange = (startDate, startTime, endDate, endTime) => {
  const sd = new Date(`${startDate}T${startTime}`);
  const ed = new Date(`${endDate}T${endTime}`);
  const opts = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  const startStr = sd.toLocaleString('en-US', opts);
  const endStr = ed.toLocaleTimeString('en-US', opts);
  return `${startStr} – ${endStr}`;
};

export default function MyEventScreen({ navigation }) {
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
    console.log('Fetching events with filter:', filter, 'and search:', searchQuery);
    setLoading(true);
    try {
      const res = await UseMethod(
        'get',
        `my-events-list/${filter}`,
        null,
        searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      );
      console.log('API Response:', res);
      if (res && res.data) {
        setEvents(res.data);
        console.log('Events set:', res.data.length, 'events');
      } else {
        setEvents([]);
        console.log('No events data received');
      }
    } catch (e) {
      console.error('Error fetching events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Use only useFocusEffect to handle both filter and search changes
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
    <View style={styles.container}>
    

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {[
            { label: 'Upcoming', value: 'upcoming', icon: 'calendar-outline' },
            { label: 'Today', value: 'today', icon: 'today-outline' },
            { label: 'Past', value: 'past', icon: 'time-outline' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.filterTab, filter === item.value && styles.filterTabActive]}
              onPress={() => {
                console.log('Filter button pressed:', item.value);
                setFilter(item.value);
              }}
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
            placeholder="Search your events..."
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

      {/* Search Bar */}
      

      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        } 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >



        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading your events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#f8fafc', '#e2e8f0']}
              style={styles.emptyCard}
            >
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'upcoming' ? 'No upcoming events at the moment' :
                 filter === 'today' ? 'No events scheduled for today' :
                 'No past events to display'}
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.cardList}>
            {events.map((event, index) => {
              const img = event.image
                ? `${API_URL}/storage/${event.image}`
                : null;
              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.card, { marginTop: index === 0 ? 0 : 16 }]}
                  activeOpacity={0.95}
                  onPress={() => navigation.navigate('EventDetails', { event, mode: 'register' })}
                >
                  <View style={styles.cardShadow}>
                    {img ? (
                      <ImageBackground source={{ uri: img }} style={styles.cardImage} resizeMode="cover">
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.8)']}
                          style={styles.cardGradientOverlay}
                        >
                          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
                        </LinearGradient>
                      </ImageBackground>
                    ) : (
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.cardImagePlaceholder}
                      >
                        <Ionicons name="calendar" size={32} color="#fff" />
                        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
                      </LinearGradient>
                    )}
                    
                    <View style={styles.cardContent}>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardInfoRow}>
                          <Ionicons name="time-outline" size={16} color="#667eea" />
                          <Text style={styles.cardDate}>
                            {formatRange(event.start_date, event.start_time, event.end_date, event.end_time)}
                          </Text>
                        </View>
                        
                        <View style={styles.cardInfoRow}>
                          <Ionicons name="location-outline" size={16} color="#667eea" />
                          <Text style={styles.cardVenue} numberOfLines={1}>
                            {event.location_data && event.location_data.length > 0
                              ? event.location_data.map(loc => loc.church_location?.name).filter(Boolean).join(', ') || event.venue || 'N/A'
                              : event.venue || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.cardAction}>
                        <Ionicons name="chevron-forward" size={20} color="#667eea" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  gradientHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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
  
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius:2,
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
  
  scrollContainer: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  cardList: {
    padding: 16,
  },
  
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  cardShadow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  
  cardImage: {
    height: 100,
    justifyContent: 'flex-end',
  },
  
  cardImagePlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardGradientOverlay: {
    padding: 10,
    justifyContent: 'flex-end',
    minHeight: 50,
  },
  
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  cardContent: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  cardInfo: {
    flex: 1,
  },
  
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  cardDate: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 5,
    flex: 1,
    lineHeight: 14,
  },
  
  cardVenue: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 5,
    flex: 1,
    lineHeight: 14,
  },
  
  cardAction: {
    padding: 8,
  },
});

