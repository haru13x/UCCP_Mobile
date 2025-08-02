import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ImageBackground,
  TouchableOpacity, ActivityIndicator, TextInput, Image,
  Alert, RefreshControl
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { UseMethod } from '../composable/useMethod';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
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

    setLoading(true);
    try {

      const res = await UseMethod(
        'get',
        `my-events-list/${filter}`,
        { search: searchQuery });
      setEvents(res.data);

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
  

  useEffect(() => {
    fetchEvents();
  }, [filter]);

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.rowContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#888" style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Search events..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              onValueChange={(value) => setFilter(value)}
              value={filter}
              placeholder={{ label: 'Filter...', value: null }}
              items={[
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Today', value: 'today' },
                { label: 'Past', value: 'past' },
              ]}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
          </View>
        </View>
      </View>



      {/* Body */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#1e40af" />
      ) : events.length === 0 ? (
        <View style={styles.nodatacontainer}>
          <Image
            source={require('../assets/no_mydata.png')} // 🔁 replace with your actual image path
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.noData}>No events founds</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.cardList}>
          {events.map(event => {
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
    marginTop: 50,
    marginBottom: 50,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // for spacing between search and filter (if supported)
  },

  searchContainer: {
    flex: 4, // 80% width
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 2,

  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  dropdownContainer: {
    flex: 2, // 20% width
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 1,
    justifyContent: 'center',
  },


  image: {
   
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
    textAlign: 'center',

    fontSize: 20,
    color: '#777',
  },
});
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
};

