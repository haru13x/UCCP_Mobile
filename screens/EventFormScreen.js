import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Text, TextInput, Button, Switch, HelperText, ActivityIndicator, Chip, Dialog, Portal, Modal, Appbar, List } from 'react-native-paper';
import { UseMethod } from '../composable/useMethod';
import { useAuth } from '../context/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function EventFormScreen({ route, navigation }) {
  const { event = null, mode = 'create' } = route.params || {};
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1;
  const isWeb = Platform.OS === 'web';

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [venue, setVenue] = useState(event?.venue || '');
  const [organizer, setOrganizer] = useState(event?.organizer || '');
  const [contact, setContact] = useState(event?.contact || '');
  const [startDate, setStartDate] = useState(event?.start_date || '');
  const [startTime, setStartTime] = useState(event?.start_time || '');
  const [endDate, setEndDate] = useState(event?.end_date || '');
  const [endTime, setEndTime] = useState(event?.end_time || '');
  const [isConferenceNum, setIsConferenceNum] = useState(mode === 'create' ? 1 : (event?.isconference ? 1 : 0));
  const isConference = isConferenceNum === 1;

  // Location via map/search
  const [address, setAddress] = useState(event?.address || '');
  const [latitude, setLatitude] = useState(typeof event?.latitude === 'number' ? event.latitude : (event?.latitude ? Number(event.latitude) : null));
  const [longitude, setLongitude] = useState(typeof event?.longitude === 'number' ? event.longitude : (event?.longitude ? Number(event.longitude) : null));
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const mapRef = useRef(null);

  // Date/time picker visibility flags
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Replace Nominatim search with Google Places Autocomplete
  const searchPlaces = async () => {
    if (!placeQuery?.trim()) { setPlaceResults([]); return; }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(placeQuery)}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setPlaceResults(Array.isArray(data?.predictions) ? data.predictions : []);
    } catch (e) {}
  };
  
  // Debounce search for live suggestions
  useEffect(() => {
    const t = setTimeout(() => { searchPlaces(); }, 350);
    return () => clearTimeout(t);
  }, [placeQuery]);
  
  // Update selection to fetch Place Details and animate map
  const onSelectPlace = async (prediction) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_APIKEY}&fields=geometry,formatted_address,name`;
      const res = await fetch(detailsUrl);
      const data = await res.json();
      const loc = data?.result?.geometry?.location;
      if (loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))) {
        const lat = Number(loc.lat);
        const lon = Number(loc.lng);
        setLatitude(lat);
        setLongitude(lon);
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 700);
        setAddress(data?.result?.formatted_address || prediction.description || '');
        if (!venue) setVenue(data?.result?.name || prediction?.structured_formatting?.main_text || '');
      }
    } catch (e) {}
  };

  const handleMapPress = (e) => {
    const { latitude: lat, longitude: lon } = e?.nativeEvent?.coordinate || {};
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setLatitude(lat);
      setLongitude(lon);
      reverseGeocode(lat, lon);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const formatted = data?.results?.[0]?.formatted_address || '';
      setAddress(formatted);
      if (!venue && formatted) setVenue(formatted);
    } catch (err) {}
  };

  // Legacy onSelectPlace removed; using Google Places version defined above.

  const handleUseLocation = async () => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      await reverseGeocode(latitude, longitude);
    }
    setMapDialogOpen(false);
  };

  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState(event?.location_id ? String(event.location_id) : '');

  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState(Array.isArray(event?.accountGroupIds) ? event.accountGroupIds.map(String) : []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await UseMethod('get', 'get-church-locations');
      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setLocations(list);
      }
    } catch (e) {}
  };

  const fetchGroups = async () => {
    try {
      const res = await UseMethod('get', 'account-groups');
      if (res?.data) setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  useEffect(() => {
    if (!isConference) fetchLocations();
  }, [isConferenceNum]);

  useEffect(() => {
    if (isAdmin) fetchGroups();
  }, [isAdmin]);

  const toggleCategory = (id) => {
    setCategories((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return Array.from(s);
    });
  };

  const validate = () => {
    if (!title) return 'Title is required';
    if (!startDate) return 'Start date is required';
    if (!startTime) return 'Start time is required';
    if (!endDate) return 'End date is required';
    if (!endTime) return 'End time is required';
    return '';
  };

  const buildPayload = () => {
    const payload = {
      title,
      description,
      venue,
      organizer,
      contact,
      address,
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      isconference: isConferenceNum,
    };
    if (!isConference && locationId) payload.location_id = Number(locationId);
    if (isAdmin && categories.length > 0) payload.categories = categories.map((c) => Number(c));
    return payload;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildPayload();
      let res;
      if (mode === 'edit' && event?.id) {
        const body = { ...payload, id: event.id };
        res = await UseMethod('post', 'update-events', body);
      } else {
        res = await UseMethod('post', 'store-events', payload);
      }
      if (!res || res.status < 200 || res.status >= 300) {
        throw new Error(res?.data?.message || 'Failed to save event');
      }
      setSuccess('Event saved successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (e) {
      setError(e?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    try {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const formatTime = (d) => {
    try {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch {
      return '';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.header}>{mode === 'edit' ? 'Edit Event' : 'Create Event'}</Text>

      <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput label="Venue" value={venue} onChangeText={setVenue} mode="outlined" style={styles.input} />
      <TextInput label="Organizer" value={organizer} onChangeText={setOrganizer} mode="outlined" style={styles.input} />
      <TextInput label="Contact" value={contact} onChangeText={setContact} mode="outlined" style={styles.input} />

      <View style={styles.row}>
        <TextInput
          label="Start Date"
          value={startDate}
          mode="outlined"
          style={{ flex: 1, marginRight: 6 }}
          editable={isWeb}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowStartDatePicker(true)} />}
          onPressIn={!isWeb ? () => setShowStartDatePicker(true) : undefined}
        />
        <TextInput
          label="Start Time"
          value={startTime}
          mode="outlined"
          style={{ flex: 1 }}
          editable={isWeb}
          right={<TextInput.Icon icon="clock" onPress={() => setShowStartTimePicker(true)} />}
          onPressIn={!isWeb ? () => setShowStartTimePicker(true) : undefined}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="End Date"
          value={endDate}
          mode="outlined"
          style={{ flex: 1, marginRight: 6 }}
          editable={isWeb}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowEndDatePicker(true)} />}
          onPressIn={!isWeb ? () => setShowEndDatePicker(true) : undefined}
        />
        <TextInput
          label="End Time"
          value={endTime}
          mode="outlined"
          style={{ flex: 1 }}
          editable={isWeb}
          right={<TextInput.Icon icon="clock" onPress={() => setShowEndTimePicker(true)} />}
          onPressIn={!isWeb ? () => setShowEndTimePicker(true) : undefined}
        />
      </View>

      {!isWeb && (
        <HelperText type="info" visible>
          Tap the calendar/clock icons to pick date/time on mobile.
        </HelperText>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(`${startDate}T${startTime || '00:00'}`) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => { if (d) setStartDate(formatDate(d)); setShowStartDatePicker(false); }}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime ? new Date(`${startDate || formatDate(new Date())}T${startTime}`) : new Date()}
          mode="time"
          display="default"
          onChange={(e, d) => { if (d) setStartTime(formatTime(d)); setShowStartTimePicker(false); }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate ? new Date(`${endDate}T${endTime || '00:00'}`) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => { if (d) setEndDate(formatDate(d)); setShowEndDatePicker(false); }}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime ? new Date(`${endDate || formatDate(new Date())}T${endTime}`) : new Date()}
          mode="time"
          display="default"
          onChange={(e, d) => { if (d) setEndTime(formatTime(d)); setShowEndTimePicker(false); }}
        />
      )}

      <View style={styles.row}>
        <Text style={{ marginRight: 6 }}>Conference {isConference }</Text>
        <Switch value={isConference} onValueChange={(v) => setIsConferenceNum(v ? 1 : 0)} />
      </View>
      <Text style={{ marginTop: 8, marginBottom: 6, fontWeight: '600' }}>Map & Coordinates</Text>
      <View style={styles.row}>
        <TextInput size="small" label="Latitude" value={latitude != null ? String(latitude) : ''} onChangeText={(v) => setLatitude(v ? Number(v) : null)} mode="outlined" style={{ flex: 1, marginRight: 6 }} keyboardType="numeric" />
        <TextInput size="small" label="Longitude" value={longitude != null ? String(longitude) : ''} onChangeText={(v) => setLongitude(v ? Number(v) : null)} mode="outlined" style={{ flex: 1 }} keyboardType="numeric" />
      </View>
      <View style={styles.row}>
        <TextInput size="small" label="Address" value={address} onChangeText={setAddress} mode="outlined" style={{ flex: 1 }} />
      </View>
      <Button mode="outlined" onPress={() => navigation.navigate('Map', {
        picker: true,
        latitude,
        longitude,
        address,
        onPick: ({ latitude: lat, longitude: lon, address: addr, name }) => {
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            setLatitude(lat);
            setLongitude(lon);
          }
          if (addr) setAddress(addr);
          if (!venue && name) setVenue(name);
        }
      })} style={{ marginBottom: 8 }}>
        Open Map
      </Button>

      {!isConference && (
        <View>
          <Text style={{ marginBottom: 4 }}>Location</Text>
          <View style={styles.chipsRow}>
            {locations.map((loc) => (
              <Chip
                key={loc.id}
                selected={String(loc.id) === locationId}
                onPress={() => setLocationId(String(loc.id))}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                {loc.name || loc.church_location?.name || `Loc ${loc.id}`}
              </Chip>
            ))}
          </View>
          <Button compact onPress={() => setLocationDialogOpen(true)} style={{ marginBottom: 6 }}>Choose Location</Button>
        </View>
      )}

      {isAdmin && (
        <View>
          <Text style={{ marginBottom: 4 }}>Categories (Account Groups)</Text>
          <View style={styles.chipsRow}>
            {groups.map((g) => (
              <Chip
                key={g.id}
                selected={categories.includes(String(g.id))}
                onPress={() => toggleCategory(String(g.id))}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                {g.description || g.code || `Group ${g.id}`}
              </Chip>
            ))}
          </View>
          <Button compact onPress={() => setGroupDialogOpen(true)} style={{ marginBottom: 6 }}>Select Groups</Button>
        </View>
      )}

      <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" style={styles.input} multiline />

      {error ? <HelperText type="error" visible>{error}</HelperText> : null}
      {success ? <HelperText type="info" visible>{success}</HelperText> : null}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.actionsRow}>
          <Button compact mode="contained" onPress={submit}>
            {mode === 'edit' ? 'Save Changes' : 'Create Event'}
          </Button>
          <Button compact onPress={() => navigation.goBack()} style={{ marginLeft: 6 }}>Cancel</Button>
        </View>
      )}

      <Portal>
        <Dialog visible={locationDialogOpen} onDismiss={() => setLocationDialogOpen(false)}>
          <Dialog.Title>Select Location</Dialog.Title>
          <Dialog.Content>
            {locations.map((loc) => (
              <Button key={loc.id} onPress={() => { setLocationId(String(loc.id)); setLocationDialogOpen(false); }} style={{ marginBottom: 6 }}>
                {loc.name || loc.church_location?.name || `Loc ${loc.id}`}
              </Button>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLocationDialogOpen(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={groupDialogOpen} onDismiss={() => setGroupDialogOpen(false)}>
          <Dialog.Title>Select Account Groups</Dialog.Title>
          <Dialog.Content>
            {groups.map((g) => (
              <Chip
                key={g.id}
                selected={categories.includes(String(g.id))}
                onPress={() => toggleCategory(String(g.id))}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                {g.description || g.code || `Group ${g.id}`}
              </Chip>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGroupDialogOpen(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>

        <Modal visible={mapDialogOpen} onDismiss={() => setMapDialogOpen(false)} contentContainerStyle={styles.fullscreenModalContainer}>
          <View style={{ flex: 1 }}>
            <Appbar.Header>
              <Appbar.Content title="Pick Location on Map" />
              <Appbar.Action icon="close" onPress={() => setMapDialogOpen(false)} />
            </Appbar.Header>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: Number.isFinite(latitude) ? latitude : 10.3157,
                  longitude: Number.isFinite(longitude) ? longitude : 123.8854,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={handleMapPress}
                provider={Platform.OS === 'android' ? 'google' : undefined}
                customMapStyle={GOOGLE_MAP_STYLE}
                showsUserLocation
                showsCompass
                toolbarEnabled
              >
                {Number.isFinite(latitude) && Number.isFinite(longitude) && (
                  <Marker coordinate={{ latitude, longitude }} />
                )}
              </MapView>
              <View style={styles.overlaySearch}>
                <TextInput
                  label="Search place"
                  value={placeQuery}
                  onChangeText={setPlaceQuery}
                  mode="outlined"
                  left={<TextInput.Icon icon="magnify" />}
                />
              </View>
              {placeResults.length > 0 && (
                <View style={styles.overlaySuggestions}>
                  <ScrollView>
                    <List.Section>
                      {placeResults.map((p) => (
                        <List.Item
                          key={p.place_id || p.description}
                          title={p?.structured_formatting?.main_text || p?.description || 'Place'}
                          description={p?.structured_formatting?.secondary_text || p?.description || ''}
                          left={(props) => <List.Icon {...props} icon="map-marker" />}
                          onPress={() => onSelectPlace(p)}
                        />
                      ))}
                    </List.Section>
                  </ScrollView>
                </View>
              )}
              <View style={styles.floatingActions}>
                <Button mode="contained" onPress={handleUseLocation}>Use This Location</Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const GOOGLE_MAPS_APIKEY = 'AIzaSyBIa8_O28LKACZThESLc7OeY9S1I4tXjkk';


const formatDate = (d) => {
  try {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const formatTime = (d) => {
  try {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
};

const GOOGLE_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
];