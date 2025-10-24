import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, Divider, HelperText, Avatar, Chip, IconButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UseMethod } from '../composable/useMethod';

export default function WorkspaceScreen({ route, navigation }) {
  const { event } = route.params || {};
  const eventId = event?.id;

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Event time helpers
  const getEventStartEnd = (ev) => {
    try {
      // Prefer explicit date+time fields
      const sd = ev?.start_date && ev?.start_time ? new Date(`${ev.start_date}T${ev.start_time}`) : (ev?.start ? new Date(ev.start) : null);
      const ed = ev?.end_date && ev?.end_time ? new Date(`${ev.end_date}T${ev.end_time}`) : (ev?.end ? new Date(ev.end) : null);
      return { start: sd, end: ed };
    } catch (e) {
      return { start: null, end: null };
    }
  };
  const { start: eventStart, end: eventEnd } = getEventStartEnd(event || {});
  const now = new Date();
  
  const hasEventEnded = !!eventEnd && now > eventEnd;
  const isRegistrationClosed =   hasEventEnded;

  const fetchUsers = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const payload = { search: query.trim(), event_id: eventId };
      const res = await UseMethod('post', 'search-users', payload);
      const list = Array.isArray(res?.data) ? res.data : [];
      setUsers(list);
    } catch (e) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers('');
  }, [eventId]);

  const onSearch = async () => {
    await fetchUsers(search);
  };

  const toggleSelect = (user) => {
    // Prevent selecting users when registration is closed
    if (isRegistrationClosed) return;
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const isRegistered = (user) => Boolean(user?.is_registered);

  const registerSelected = async () => {
    // Guard: prevent registration if event already started or ended
    if (hasEventEnded) {
      Alert.alert('Registration Closed', 'Event has ended. You cannot register now.');
      return;
    }
  

    const userIds = selectedUsers.map((u) => u.id);
    if (userIds.length === 0) return;
    try {
      setRegistering(true);
      const res = await UseMethod('post', 'event-registration-multiple', {
        users: userIds,
        event_id: eventId,
      });
      if (res && (res.status >= 200 && res.status < 300)) {
        Alert.alert('Success', 'Users registered successfully!');
        setSelectedUsers([]);
        await fetchUsers(search);
        // Go back to Overview to reflect changes
        navigation.goBack();
      } else {
        Alert.alert('Error', res?.data?.message || 'Failed to register users');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Error registering users');
    } finally {
      setRegistering(false);
    }
  };

  const renderUserItem = ({ item }) => {
    const name = item?.details
      ? `${item.details?.first_name || ''} ${item.details?.last_name || ''}`.trim()
      : (item?.name || item?.username || item?.email || 'Unknown');
    const phone = item?.details?.phone_number || 'No phone';
    const sex = item?.details?.sex?.name || 'N/A';
    const isSelected = selectedUsers.some((u) => u.id === item.id);
    const registered = isRegistered(item);

    return (
      <TouchableOpacity
        style={[styles.userRow, (registered || isRegistrationClosed) && styles.userRowDisabled]}
        activeOpacity={0.7}
        onPress={() => (registered || isRegistrationClosed ? null : toggleSelect(item))}
      >
        <Avatar.Text 
          size={36} 
          label={(name?.[0] || 'U').toUpperCase()} 
          style={styles.avatar}
          labelStyle={{ fontSize: 14, fontWeight: '600' }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{name}</Text>
          <Text style={styles.userMeta} numberOfLines={1}>
            {phone} • {sex}
          </Text>
        </View>
        {registered ? (
          <Chip 
            icon="check-circle" 
            
            style={styles.registeredChip}
            textStyle={{ fontSize: 10 }}
            
          >
            Registered
          </Chip>
        ) : (
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={20}
            color={isSelected ? '#1976d2' : '#999'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Compact Header with Actions */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text variant="titleMedium" style={styles.title}>
                {event?.title || 'Event Registration'}
              </Text>
              <Text style={styles.subtitle}>
                {selectedUsers.length} selected
              </Text>
              {/* Registration status messages */}
              {hasEventEnded ? (
                <Text style={styles.statusText}>Event ended — registration is closed.</Text>
              ) :  null}
            </View>
            <View style={styles.actionButtons}>
              <Button 
                
                onPress={() => navigation.goBack()}
                
                style={styles.cancelBtn}
              >
                Cancel
              </Button>
              <Chip
                onPress={registerSelected}
                disabled={selectedUsers.length === 0 || registering || isRegistrationClosed}
                mode='outlined'
                style={styles.registeredChip}
              >
                {registering ? 'Registering...' : 'Register'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Compact Search Bar */}
      <Card style={styles.searchCard}>
        <Card.Content style={styles.searchContent}>
          <TextInput
            mode="outlined"
            value={search}
            onChangeText={setSearch}
            placeholder="Search users..."
            dense
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={onSearch}
            left={<TextInput.Icon icon="magnify" size={18} />}
            right={search ? <TextInput.Icon icon="close" size={16} onPress={() => setSearch('')} /> : null}
            style={styles.searchInput}
          />
          {error ? <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText> : null}
        </Card.Content>
      </Card>

      {/* Scrollable User List */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUserItem}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.empty}>
                  {search ? 'No users found' : 'Enter search term to find users'}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header styles
  headerCard: {
    margin: 6,
    marginBottom: 4,
    elevation: 1,
    borderRadius: 8,
  },
  headerContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    color: '#b00020',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  cancelBtn: {
    
    minWidth: 70,
    height: 35,
  },
  registerBtn: {
    minWidth: 80,
    height: 40,
    fontSize: 11,
  },
  // Search styles
  searchCard: {
    margin: 6,
    marginVertical: 4,
    elevation: 1,
    borderRadius: 8,
  },
  searchContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    fontSize: 14,
    height: 40,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
  },
  // List styles
  listContainer: {
    flex: 1,
    marginHorizontal: 6,
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginVertical: 1,
    borderRadius: 6,
    elevation: 1,
  },
  userRowDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#1976d2',
    width: 36,
    height: 36,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 18,
  },
  userMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    lineHeight: 14,
  },
  registeredChip: {
    borderColor: '#28a745',
    height: 34,
  },
  // Loading and empty states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    marginVertical: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e0e0e0',
  },
});