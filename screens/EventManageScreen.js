import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, TextInput, Button, SegmentedButtons, ActivityIndicator, Dialog, Portal, HelperText, Divider, Searchbar, Chip, List, IconButton, FAB } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UseMethod } from '../composable/useMethod';
 import { useAuth } from '../context/AuthContext';
 import { useIsFocused } from '@react-navigation/native';
 import { Picker } from '@react-native-picker/picker';

const DateOptions = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Today', value: 'today' },
  { label: 'Past', value: 'past' },
];

const StatusOptions = [
  { label: 'Active', value: '1' },
  { label: 'Cancelled', value: '2' },
];

export default function EventManageScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;
  const isFocused = useIsFocused();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [statusId, setStatusId] = useState('1');

  const [category, setCategory] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [eventToCancel, setEventToCancel] = useState(null);

  const fetchGroups = async () => {
    try {
      const res = await UseMethod('get', 'account-groups');
      if (res?.data) setGroups(res.data);
    } catch (e) {}
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        search,
        date_filter: dateFilter,
        status_id: statusId,
      };
      if (isAdmin && category) filters.category = category;
      const res = await UseMethod('post', 'get-events', filters);
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to fetch events');
      }
      const list = Array.isArray(res?.data) ? res.data : [];
      setEvents(list);
    } catch (e) {
      setError(e?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchEvents();
  }, [isFocused]);

  useEffect(() => {
    if (isAdmin) fetchGroups();
  }, [isAdmin]);

  // Auto refetch when filters change
  useEffect(() => {
    if (isFocused) fetchEvents();
  }, [dateFilter, statusId, isFocused]);

  // Auto refetch when admin category changes
  useEffect(() => {
    if (isAdmin && isFocused) fetchEvents();
  }, [category, isAdmin, isFocused]);

  // Debounced search refetch
  useEffect(() => {
    if (!isFocused) return;
    const t = setTimeout(() => {
      fetchEvents();
    }, 350);
    return () => clearTimeout(t);
  }, [search, isFocused]);

  const openCancelDialog = (event) => {
    setEventToCancel(event);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const cancelEvent = async () => {
    if (!eventToCancel) return;
    try {
      const res = await UseMethod('put', `cancel-event/${eventToCancel.id}`, { reason: cancelReason });
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to cancel event');
      }
      setCancelDialogOpen(false);
      setCancelReason('');
      setEventToCancel(null);
      await fetchEvents();
    } catch (e) {
      setError(e?.message || 'Failed to cancel event');
    }
  };

  const renderItem = ({ item }) => {
    const statusText = item?.status_id === 1 ? 'Active' : 'Cancelled';
    const locationName = Array.isArray(item?.location_data) && item.location_data.length > 0
      ? item.location_data.map(loc => loc?.name || loc?.church_location?.name).filter(Boolean).join(', ')
      : (item?.venue || 'N/A');

    return (
      <Card style={styles.card}>
        <Card.Title title={item.title || 'Untitled Event'} subtitle={`${item.start_date || ''} ${item.start_time || ''} • ${locationName}`} />
        <Card.Content>
          <Text style={styles.statusLabel}>Status: {statusText}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('EventDetails', { event: item, mode: 'view' })}>
            View
          </Button>
          {item?.status_id === 1 && (
            <>
              <Button mode="contained" onPress={() => navigation.navigate('EventForm', { event: item, mode: 'edit' })} style={styles.editBtn}>
                Edit
              </Button>
              <Button mode="contained" onPress={() => navigation.navigate('EventOverview', { event: item })}>
                Overview
              </Button>
            </>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Compact top bar with search + refresh */}
      <View style={styles.topBar}>
        <Searchbar
          placeholder="Search events"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchEvents}
          style={styles.searchbar}
        />
        <IconButton icon="refresh" onPress={fetchEvents} />
      </View>

      {/* Compact select filters */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.chipsGroupTitle}>Date</Text>
          <Picker selectedValue={dateFilter} onValueChange={setDateFilter} style={styles.picker}>
            {DateOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.chipsGroupTitle}>Status</Text>
          <Picker selectedValue={statusId} onValueChange={setStatusId} style={styles.picker}>
            {StatusOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* {isAdmin && (
        <View style={styles.row}>
          <TextInput
            label="Category (Account Group)"
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />
          <Button compact onPress={() => setGroupDialogOpen(true)} style={{ marginLeft: 6 }}>Select</Button>
        </View>
      )} */}

      {error ? <HelperText type="error" visible>{error}</HelperText> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 8 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={fetchEvents}
          renderItem={({ item }) => {
            const locationName = Array.isArray(item?.location_data) && item.location_data.length > 0
              ? item.location_data.map(loc => loc?.name || loc?.church_location?.name).filter(Boolean).join(', ')
              : (item?.venue || 'N/A');
            return (
              <>
                <List.Item
                  title={item.title || 'Untitled Event'}
                  description={`${item.start_date || ''} ${item.start_time || ''} • ${locationName}`}
                  left={props => <List.Icon {...props} icon="calendar" />}
                  right={props => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton icon="eye-outline" onPress={() => navigation.navigate('EventDetails', { event: item, mode: 'view' })} />
                      {item?.status_id === 1 && (
                        <IconButton icon="pencil-outline" onPress={() => navigation.navigate('EventForm', { event: item, mode: 'edit' })} />
                      )}
                      <IconButton icon="chart-bar" onPress={() => navigation.navigate('EventOverview', { event: item })} />
                    </View>
                  )}
                />
                <Divider />
              </>
            );
          }}
          contentContainerStyle={{ paddingBottom: 64 }}
          ListEmptyComponent={<Text style={styles.empty}>No events found.</Text>}
        />
      )}

      {/* <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('EventForm', { event: null, mode: 'create' })} /> */}

      <Portal>
        <Dialog visible={groupDialogOpen} onDismiss={() => setGroupDialogOpen(false)}>
          <Dialog.Title>Select Account Group</Dialog.Title>
          <Dialog.Content>
            {Array.isArray(groups) && groups.length > 0 ? (
              groups.map((g) => (
                <Button compact key={g.id} onPress={() => { setCategory(String(g.id)); setGroupDialogOpen(false); }} style={{ marginBottom: 4 }}>
                  {g.description || g.code || `Group ${g.id}`}
                </Button>
              ))
            ) : (
              <Text>No groups available.</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button compact onPress={() => setGroupDialogOpen(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={cancelDialogOpen} onDismiss={() => setCancelDialogOpen(false)}>
          <Dialog.Title>Cancel Event</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <HelperText type="error" visible={!cancelReason}>Please provide a reason for cancellation</HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button compact onPress={() => setCancelDialogOpen(false)}>Close</Button>
            <Button compact onPress={cancelEvent} disabled={!cancelReason}>
              Confirm Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  searchbar: {
    flex: 1,
    marginRight: 4,
    height: 50,
  },
  chipsGroup: {
    marginBottom: 6,
  },
  chipsGroupTitle: {
    color: '#555',
    marginBottom: 4,
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  input: {
    marginBottom: 6,
  },
  empty: {
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});