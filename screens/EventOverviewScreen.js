import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, ActivityIndicator, ProgressBar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UseMethod } from '../composable/useMethod';

function Stars({ value = 0, size = 18 }) {
  const floor = Math.floor(value);
  const hasHalf = value - floor >= 0.5;
  const icons = [];
  for (let i = 1; i <= 5; i++) {
    let name = 'star-outline';
    if (i <= floor) name = 'star';
    else if (i === floor + 1 && hasHalf) name = 'star-half';
    icons.push(
      <Ionicons key={i} name={name} size={size} color="#f5a623" style={{ marginRight: 2 }} />
    );
  }
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{icons}</View>;
}

function StackedAttendanceBar({ present = 0, absent = 0 }) {
  const total = Math.max(present + absent, 1);
  const presentRatio = present / total;
  const absentRatio = absent / total;
  return (
    <View style={styles.stackedBarContainer}>
      <View style={[styles.stackedBarSegmentPresent, { flex: presentRatio }]} />
      <View style={[styles.stackedBarSegmentAbsent, { flex: absentRatio }]} />
    </View>
  );
}

export default function EventOverviewScreen({ route, navigation }) {
  const { event } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  // Navigate to Workspace instead of direct register
  
  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await UseMethod('get', `events/${event.id}/overview`);
      if (!res || res.status !== 200) {
        throw new Error(res?.data?.message || 'Failed to load overview');
      }
      setData(res.data);
      navigation.setOptions({ title: res.data?.event?.title ? `${res.data.event.title} Overview` : 'Event Overview' });
    } catch (e) {
      setError(e?.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [event?.id]);

  const presentCount = data?.attendance?.present || 0;
  const absentCount = data?.attendance?.absent || 0;
  const presentRatio = data && data.registrations.total > 0
    ? (presentCount / data.registrations.total)
    : 0;

  // Direct registration removed; use Workspace screen for user selection.
const openWorkspace = () => {
  navigation.navigate('Workspace', { event });
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : data ? (
        <>
          <Card style={styles.card}>
            <Card.Title title="Registrations" subtitle={`${data.event.start_date || ''} ${data.event.start_time || ''}`} />
            <Card.Content>
              <View style={styles.rowBetween}>
                <Text>Total</Text>
                <Text>{data.registrations.total}</Text>
              </View>
              {/* <View style={styles.rowBetween}>
                <Text>Active</Text>
                <Text>{data.registrations.active}</Text>
              </View> */}
              {/* <View style={styles.rowBetween}>
                <Text>Cancelled</Text>
                <Text>{data.registrations.cancelled}</Text>
              </View> */}
              <TouchableOpacity
                style={styles.addBtnCompact}
                onPress={openWorkspace}
              >
                <Ionicons name="add-circle-outline" size={16} color="#1976d2" />
                <Text style={styles.addBtnText}>Add Registration</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Attendance" />
            <Card.Content>
              <View style={styles.rowBetween}>
                <Text>Attended</Text>
                <Text>{presentCount}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text>Unattended</Text>
                <Text>{absentCount}</Text>
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <Text style={styles.muted}>Present ratio</Text>
              <ProgressBar progress={presentRatio} style={{ height: 8, borderRadius: 4 }} />
              <Divider style={{ marginVertical: 8 }} />
              <Text style={styles.muted}>Attendance graph</Text>
              <StackedAttendanceBar present={presentCount} absent={absentCount} />
              <View style={[styles.rowBetween, { marginTop: 6 }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.legendDot, { backgroundColor: '#28a745' }]} />
                  <Text style={styles.legendText}>Attended</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
                  <Text style={styles.legendText}>Unattended</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Reviews" />
            <Card.Content>
              <View style={styles.rowBetween}>
                <Text>Comments</Text>
                <Text>{data.reviews.count}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text>Average Rating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Stars value={data.reviews.avg_rating} size={16} />
                  <Text style={styles.avgValue}>{Number(data.reviews.avg_rating).toFixed(1)}</Text>
                </View>
              </View>
              {data.reviews.category_averages && (
                <>
                  <Divider style={{ marginVertical: 6 }} />
                  <Text style={styles.muted}>Category ratings</Text>
                  {!reviewsExpanded && (
                    <Text style={styles.reviewSummary} numberOfLines={2}>
                      {['venue','speaker','events','foods','accommodation']
                        .filter(k => data.reviews.category_averages[k] != null)
                        .map(k => {
                          const labels = { venue: 'Venue', speaker: 'Speaker', events: 'Events', foods: 'Food', accommodation: 'Accommodation' };
                          const val = Number(data.reviews.category_averages[k]).toFixed(1);
                          return `${labels[k]} ${val}`;
                        }).join(' • ')}
                    </Text>
                  )}
                  <TouchableOpacity style={styles.toggleButton} onPress={() => setReviewsExpanded(!reviewsExpanded)}>
                    <Text style={styles.toggleText}>{reviewsExpanded ? 'Hide details' : 'Show details'}</Text>
                    <Ionicons name={reviewsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#1976d2" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>

                  {reviewsExpanded && (
                    <View style={styles.categoryGrid}>
                      {[
                        { key: 'venue', label: 'Venue', icon: 'business' },
                        { key: 'speaker', label: 'Speaker', icon: 'mic' },
                        { key: 'events', label: 'Events', icon: 'calendar' },
                        { key: 'foods', label: 'Food', icon: 'restaurant' },
                        { key: 'accommodation', label: 'Accommodation', icon: 'bed' },
                      ].map(item => (
                        <View key={item.key} style={styles.categoryItem}>
                          <View style={styles.categoryIcon}>
                            <Ionicons name={item.icon} size={18} color="#1976d2" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.categoryLabel}>{item.label}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                              <Stars value={data.reviews.category_averages[item.key]} size={14} />
                              <Text style={styles.categoryValue}>{Number(data.reviews.category_averages[item.key]).toFixed(1)}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  muted: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
  },
  error: {
    color: '#b00020',
    marginBottom: 6,
  },
  stackedBarContainer: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
  },
  stackedBarSegmentPresent: {
    backgroundColor: '#28a745',
  },
  stackedBarSegmentAbsent: {
    backgroundColor: '#dc3545',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  categoryGrid: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  avgValue: {
    marginLeft: 6,
    fontSize: 12,
    color: '#374151',
  },
  reviewSummary: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  toggleText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryValue: {
    marginLeft: 6,
    fontSize: 12,
    color: '#374151',
  },
  addBtnCompact: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#eaf2ff',
  },
  addBtnText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
});