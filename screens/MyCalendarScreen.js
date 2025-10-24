import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { UseMethod } from '../composable/useMethod';
import { API_URL } from '@env';
const MyCalendarScreen = () => {
  const navigation = useNavigation();
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);

  const fetchEvents = async (date) => {
    setLoading(true);
    try {
      const res = await UseMethod('post', 'myCalendarList', { date });
      setEvents(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const getDateType = (eventDate) => {
    const event = new Date(eventDate);
    const now = new Date();

    if (event.toDateString() < now.toDateString()) return 'past';
    if (event.toDateString() === now.toDateString()) return 'today';
    return 'upcoming';
  };

  const truncate = (text, length = 30) =>
    text.length > length ? text.slice(0, length) + '...' : text;

  return (
    <ScrollView style={styles.container}>
      {/* Toggle Calendar */}
      {/* <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)} style={styles.toggleBtn}>
        <Text style={styles.toggleText}>
          {showCalendar ? 'Hide Calendar ▲' : 'Show Calendar ▼'}
        </Text>
      </TouchableOpacity> */}

      {/* Calendar */}
      {showCalendar && (
        <View style={styles.card}>
          <Calendar
            current={selectedDate}
            style={styles.calendar}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#4c669f',
                selectedTextColor: '#fff',
              },
            }}
            theme={{
              selectedDayBackgroundColor: '#4c669f',
              todayTextColor: '#4c669f',
              arrowColor: '#4c669f',
              textMonthFontWeight: 'bold',
              textDayFontSize: 12,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>
      )}

      {/* Events Section */}
      <Text style={styles.sectionTitle}>📅 Events on {selectedDate}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4c669f" />
      ) : events.length > 0 ? (
        events.map((event) => {
          const type = getDateType(event.start_date);
          return (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, { backgroundColor: type === 'past' ? '#f3f4f6' : '#e0f2fe' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('EventDetails', { event, mode: 'register' })}
            >
              <Image
                source={{ uri: `${API_URL}/storage/${event.image}` }}
                style={styles.eventImage}
                resizeMode="cover"
              />

              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {event.start_date} → {event.end_date}
                </Text>
                <Text style={styles.eventDesc}>
                  {truncate(event.description || 'No description')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.nodatacontainer}>
          <Image
            source={require('../assets/Calendar-bro.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.noEventText}>No events found on this day.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MyCalendarScreen;

const styles = StyleSheet.create({
  container: {
    padding:10,
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  toggleBtn: {
    alignItems: 'left',
    marginVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    color: '#4c669f',
    fontWeight: '600',
  },
  calendar: {
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.8 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#e0e7ff',
  },

  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventDate: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  nodatacontainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 170,
    borderRadius: 8,
  },
  noEventText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
    fontSize: 14,
  },
});
