import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, Divider, HelperText, Avatar, Chip, IconButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UseMethod } from '../composable/useMethod';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkspaceScreen({ route, navigation }) {
  const { event } = route.params || {};
  const eventId = event?.id;

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Overview & Pie state
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [locationStats, setLocationStats] = useState([]); // [{ location, registered, attended }]
  const [chartUrlReg, setChartUrlReg] = useState('');
  const [chartUrlAttend, setChartUrlAttend] = useState('');

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
    // Load overview stats
    loadStats();
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

  // Helper to fetch all registered users across pagination
  const fetchAllRegisteredUsers = async () => {
    const aggregated = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await UseMethod('post', `get-event-registered/${eventId}?page=${page}`, { search: '' });
      const paginated = res?.data?.registered_users;
      const data = Array.isArray(paginated?.data) ? paginated.data : [];
      lastPage = Number(paginated?.last_page || 1);
      aggregated.push(...data);
      page += 1;
    } while (page <= lastPage);
    return aggregated;
  };

  const buildQuickChartUrl = (config) => {
    const base = 'https://quickchart.io/chart?c=';
    return `${base}${encodeURIComponent(JSON.stringify(config))}`;
  };

  const generateCharts = (stats) => {
    const labels = stats.map((s) => s.location);
    const regData = stats.map((s) => s.registered);
    const attData = stats.map((s) => s.attended);
    const colors = ['#667eea','#764ba2','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f43f5e','#22c55e'];

    const regConfig = {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: regData, backgroundColor: colors.slice(0, labels.length) }],
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
      },
    };

    const attConfig = {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: attData, backgroundColor: colors.slice(0, labels.length) }],
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
      },
    };

    setChartUrlReg(buildQuickChartUrl(regConfig));
    setChartUrlAttend(buildQuickChartUrl(attConfig));
  };

  const loadStats = async () => {
    if (!eventId) return;
    setStatsLoading(true);
    setStatsError('');
    try {
      const regs = await fetchAllRegisteredUsers();
      // Group by church location name
      const byLoc = new Map();
      regs.forEach((r) => {
        const loc = r?.details?.churchLocation?.name || 'Unknown';
        const isAttend = !!r?.is_attend;
        const entry = byLoc.get(loc) || { location: loc, registered: 0, attended: 0 };
        entry.registered += 1;
        if (isAttend) entry.attended += 1;
        byLoc.set(loc, entry);
      });
      const stats = Array.from(byLoc.values()).sort((a, b) => b.registered - a.registered);
      setLocationStats(stats);
      generateCharts(stats);
    } catch (e) {
      setStatsError(e?.message || 'Failed to load overview');
    } finally {
      setStatsLoading(false);
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
      {/* Modern Gradient Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>
              {event?.title || 'Event Registration'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedUsers.length} selected
            </Text>
            {hasEventEnded ? (
              <Text style={styles.headerStatus}>Event ended — registration is closed.</Text>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, styles.headerButtonSecondary]} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={16} color="#1f2937" />
              <Text style={styles.headerButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.headerButtonPrimary]}
              onPress={registerSelected}
              disabled={selectedUsers.length === 0 || registering || isRegistrationClosed}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.headerButtonText}>{registering ? 'Registering...' : 'Register'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

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
                <Image source={require('../assets/no_mydata.png')} style={styles.emptyImage} />
                <Text style={styles.emptyTitle}>{search ? 'No users found' : 'Search to find users'}</Text>
                <Text style={styles.emptySubtitle}>Try a different name, email, or phone</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Overview & Pie by Church Location */}
      <Card style={styles.overviewCard}>
        <Card.Content>
          <View style={styles.overviewHeaderRow}>
            <Text style={styles.overviewTitle}>Overview by Church Location</Text>
            {statsLoading ? <ActivityIndicator size={16} /> : null}
          </View>
          {statsError ? (
            <HelperText type="error" visible={!!statsError}>{statsError}</HelperText>
          ) : (
            <>
              {locationStats.map((s, idx) => (
                <View key={`${s.location}-${idx}`} style={styles.statRow}>
                  <Text style={styles.statLocation} numberOfLines={1}>{s.location}</Text>
                  <View style={styles.statCounts}>
                    <Chip style={[styles.statChip, { backgroundColor: '#e0e7ff' }]} textStyle={styles.statChipText} icon="account">
                      {s.registered} registered
                    </Chip>
                    <Chip style={[styles.statChip, { backgroundColor: '#dcfce7' }]} textStyle={styles.statChipText} icon="check">
                      {s.attended} attended
                    </Chip>
                  </View>
                </View>
              ))}

              <View style={styles.pieRow}>
                {chartUrlReg ? (
                  <View style={styles.pieItem}>
                    <Text style={styles.pieTitle}>Registrations</Text>
                    <Image source={{ uri: chartUrlReg }} style={styles.pieImage} resizeMode="contain" />
                  </View>
                ) : null}
                {chartUrlAttend ? (
                  <View style={styles.pieItem}>
                    <Text style={styles.pieTitle}>Attendance</Text>
                    <Image source={{ uri: chartUrlAttend }} style={styles.pieImage} resizeMode="contain" />
                  </View>
                ) : null}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 14,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
  headerTitle: {
    fontWeight: '800',
    color: '#fff',
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  headerStatus: {
    marginTop: 4,
    fontSize: 12,
    color: '#ffe4e6',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  headerButtonPrimary: {
    backgroundColor: '#22c55e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  headerButtonTextSecondary: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
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
  overviewCard: {
    marginHorizontal: 6,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLocation: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    marginRight: 8,
  },
  statCounts: {
    flexDirection: 'row',
    gap: 6,
  },
  statChip: {
    height: 28,
  },
  statChipText: {
    fontSize: 12,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  pieItem: {
    flex: 1,
    alignItems: 'center',
  },
  pieTitle: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  pieImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
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
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#e0e0e0',
  },
});