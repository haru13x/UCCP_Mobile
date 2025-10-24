import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UseMethod } from '../composable/useMethod';
import { TextInput as PaperInput, List, Button, IconButton } from 'react-native-paper';

// Minimal modern Google Map style for a clean look
const GOOGLE_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#fcfcff' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#777' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fcfcff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#eef9ee' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f7f7ff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#eaf3ff' }] },
];

const GOOGLE_MAPS_APIKEY = 'AIzaSyBIa8_O28LKACZThESLc7OeY9S1I4tXjkk';

export default function EventMapScreen({ route, navigation }) {
  const { event, picker = false, onPick, latitude: initLat, longitude: initLon, address: initAddress } = route.params || {};

  const [events, setEvents] = useState(event ? [event] : []);
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const mapRef = useRef();
  const [selectedMode, setSelectedMode] = useState('driving');
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);

  // Picker mode state
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [pickedLat, setPickedLat] = useState(Number.isFinite(initLat) ? Number(initLat) : null);
  const [pickedLon, setPickedLon] = useState(Number.isFinite(initLon) ? Number(initLon) : null);
  const [pickedAddress, setPickedAddress] = useState(initAddress || '');

  const travelModes = ['driving', 'walking', 'transit', 'bicycling'];
  const modeIcons = { walking: 'walk', bicycling: 'bike', driving: 'car-outline', transit: 'bus' };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Fetch events when not in picker mode and no specific event
  useEffect(() => {
    const load = async () => {
      try {
        const res = await UseMethod('post', 'get-events');
        const raw = res?.data?.events ?? res?.data ?? [];
        const normalized = Array.isArray(raw) ? raw.map(ev => {
          const lat = Number(ev?.latitude ?? ev?.location_data?.[0]?.latitude ?? ev?.conference_locations?.[0]?.latitude);
          const lon = Number(ev?.longitude ?? ev?.location_data?.[0]?.longitude ?? ev?.conference_locations?.[0]?.longitude);
          return { ...ev, latitude: lat, longitude: lon, address: ev?.address ?? ev?.venue ?? ev?.location_data?.[0]?.address ?? '' };
        }).filter(e => Number.isFinite(e.latitude) && Number.isFinite(e.longitude)) : [];
        setEvents(normalized);
        setFilteredEvents(normalized);
      } catch (e) { console.error('Failed to load events for map:', e); Alert.alert('Events', 'Unable to load events from server.'); }
    };
    if (!picker && !event) load();
  }, [picker]);

  useEffect(() => {
    if (event) {
      const parsedEvent = { ...event, latitude: parseFloat(event.latitude), longitude: parseFloat(event.longitude) };
      setSelectedEvent(parsedEvent);
      mapRef.current?.animateToRegion({ latitude: parsedEvent.latitude, longitude: parsedEvent.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
      setFilteredEvents([parsedEvent]);
      setSearchQuery('');
    }
  }, [event]);

  useEffect(() => {
    const query = (searchQuery || '').toLowerCase();
    const filtered = events.filter(e => {
      const title = (e.title || '').toLowerCase();
      const address = (e.address || '').toLowerCase();
      return title.includes(query) || address.includes(query);
    });
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const handleEventSelect = (ev) => {
    setSelectedEvent(ev);
    mapRef.current?.animateToRegion({ latitude: ev.latitude, longitude: ev.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    setSearchQuery('');
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const formatted = data?.results?.[0]?.formatted_address || '';
      setPickedAddress(formatted);
    } catch {}
  };

  const handleMapPress = (e) => {
    if (!picker) return;
    const { latitude: lat, longitude: lon } = e?.nativeEvent?.coordinate || {};
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setPickedLat(lat);
      setPickedLon(lon);
      reverseGeocode(lat, lon);
    }
  };

  const searchPlaces = async () => {
    if (!placeQuery?.trim()) { setPlaceResults([]); return; }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(placeQuery)}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setPlaceResults(Array.isArray(data?.predictions) ? data.predictions : []);
    } catch {}
  };
  useEffect(() => { const t = setTimeout(searchPlaces, 350); return () => clearTimeout(t); }, [placeQuery]);

  const onSelectPlace = async (prediction) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_APIKEY}&fields=geometry,formatted_address,name`;
      const res = await fetch(detailsUrl);
      const data = await res.json();
      const loc = data?.result?.geometry?.location;
      if (loc && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))) {
        const lat = Number(loc.lat);
        const lon = Number(loc.lng);
        setPickedLat(lat);
        setPickedLon(lon);
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 700);
        setPickedAddress(data?.result?.formatted_address || prediction.description || '');
        setPlaceQuery('');
        setPlaceResults([]);
      }
    } catch {}
  };

  const handleUseLocation = () => {
    if (picker && typeof onPick === 'function') {
      onPick({ latitude: pickedLat, longitude: pickedLon, address: pickedAddress });
      navigation.goBack();
    }
  };

  const estimateTravelTime = () => { if (!routeDuration) return 'N/A'; const duration = parseFloat(routeDuration); return duration < 1 ? '< 1 min' : `${Math.round(duration)} min`; };
  const getDistanceToEvent = () => { if (!location || !selectedEvent) return null; const distance = getDistance({ latitude: location.latitude, longitude: location.longitude }, { latitude: parseFloat(selectedEvent.latitude), longitude: parseFloat(selectedEvent.longitude) }); return (distance / 1000).toFixed(2); };

  const recenterToUser = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    }
  };

  const recenterToPicked = () => {
    const lat = pickedLat ?? location?.latitude;
    const lon = pickedLon ?? location?.longitude;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
    }
  };

  // Added: distance to picked point and recenter to selected event
  const getDistanceToPicked = () => {
    if (!location || !Number.isFinite(pickedLat) || !Number.isFinite(pickedLon)) return null;
    const distance = getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: pickedLat, longitude: pickedLon }
    );
    return (distance / 1000).toFixed(2);
  };

  const recenterToSelected = () => {
    if (selectedEvent) {
      const lat = Number(selectedEvent.latitude);
      const lon = Number(selectedEvent.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
      }
    }
  };

  // Display event date/time using common field names
  const getEventStartEnd = () => {
    if (!selectedEvent) return { start: null, end: null };
    const sDate = selectedEvent.start_date || selectedEvent.event_start_date || selectedEvent.date || selectedEvent.event_date;
    const sTime = selectedEvent.start_time || selectedEvent.event_start_time || selectedEvent.time || selectedEvent.event_time;
    const eDate = selectedEvent.end_date || selectedEvent.event_end_date;
    const eTime = selectedEvent.end_time || selectedEvent.event_end_time;

    const start = sDate && sTime ? `${sDate} ${sTime}` : (sDate || sTime || null);
    const end = eDate && eTime ? `${eDate} ${eTime}` : (eDate || eTime || null);

    // ISO fallbacks
    const sIso = selectedEvent.start_at || selectedEvent.starts_at;
    const eIso = selectedEvent.end_at || selectedEvent.ends_at;
    const fmt = (iso) => {
      try {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } catch { return null; }
    };

    return {
      start: start || (sIso ? fmt(sIso) : null),
      end: end || (eIso ? fmt(eIso) : null),
    };
  };

  const renderHighlighted = (text, query) => {
    if (!text) return null;
    const q = (query || '').trim();
    if (!q) return <Text>{text}</Text>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <Text>{text}</Text>;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <Text>
        <Text>{before}</Text>
        <Text style={{ fontWeight: '700' }}>{match}</Text>
        <Text>{after}</Text>
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* full-screen map with overlays */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: pickedLat ?? location?.latitude ?? 10.3157,
            longitude: pickedLon ?? location?.longitude ?? 123.8854,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
          provider={'google'}
          showsUserLocation
          showsCompass
          mapType="standard"
          toolbarEnabled
          // customMapStyle={GOOGLE_MAP_STYLE} // removed to use default Google style
        >
          {picker && Number.isFinite(pickedLat) && Number.isFinite(pickedLon) && (
            <Marker coordinate={{ latitude: pickedLat, longitude: pickedLon }} />
          )}
          {!picker && location && (
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="Your Location" pinColor="blue" />
          )}
          {!picker && filteredEvents.map(ev => (
            <Marker key={ev.id ?? `event-${ev.latitude}-${ev.longitude}`} coordinate={{ latitude: parseFloat(ev.latitude), longitude: parseFloat(ev.longitude) }} title={ev.title} onPress={() => setSelectedEvent(ev)} />
          ))}
          {!picker && location && selectedEvent && (
            <MapViewDirections
              origin={location}
              destination={{ latitude: parseFloat(selectedEvent.latitude), longitude: parseFloat(selectedEvent.longitude) }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="blue"
              mode={selectedMode}
              onReady={result => { setRouteDistance(result.distance); setRouteDuration(result.duration); mapRef.current?.fitToCoordinates(result.coordinates, { edgePadding: { top: 50, bottom: 50, left: 50, right: 50 }, animated: true }); }}
            />
          )}
        </MapView>

        {picker ? (
          <>
            <View style={styles.overlaySearch}>
              <PaperInput
                placeholder="Search for a place"
                value={placeQuery}
                onChangeText={setPlaceQuery}
                mode="outlined"
                left={<PaperInput.Icon icon="magnify" />}
                right={<PaperInput.Icon icon="close" onPress={() => setPlaceQuery('')} />}
                style={styles.searchInput}
              />
            </View>
            {placeResults.length > 0 && (
              <View style={styles.overlaySuggestions}>
                <ScrollView>
                  <List.Section>
                    {placeResults.map((p) => (
                      <List.Item
                        key={p.place_id || p.description}
                        title={renderHighlighted(p?.structured_formatting?.main_text || p?.description || 'Place', placeQuery)}
                        description={renderHighlighted(p?.structured_formatting?.secondary_text || p?.description || '', placeQuery)}
                        left={(props) => <List.Icon {...props} icon="map-marker" />}
                        onPress={() => onSelectPlace(p)}
                      />
                    ))}
                  </List.Section>
                </ScrollView>
              </View>
            )}

            {Number.isFinite(pickedLat) && Number.isFinite(pickedLon) && (
              <View style={styles.pickedInfoCard}>
                <Text style={styles.pickedTitle}>Selected Location</Text>
                <Text style={styles.pickedAddress}>{pickedAddress || 'No address found'}</Text>
                <Text style={styles.pickedCoords}>{pickedLat?.toFixed(6)}, {pickedLon?.toFixed(6)}</Text>
                <View style={styles.infoTextRow}>
                  <Text style={styles.infoText}>Distance from you: {getDistanceToPicked() ? `${getDistanceToPicked()} km` : 'N/A'}</Text>
                </View>
                <View style={styles.pickedActions}>
                  <Button mode="contained" onPress={handleUseLocation}>Use This Location</Button>
                  <IconButton icon="crosshairs-gps" onPress={recenterToPicked} style={{ marginLeft: 8 }} />
                </View>
                <View style={[styles.infoActions, { marginTop: 8 }]}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => { const url = `https://www.google.com/maps/dir/?api=1&destination=${pickedLat},${pickedLon}&travelmode=driving`; Linking.openURL(url); }}>
                    <Text style={styles.actionText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {location && (
              <TouchableOpacity style={styles.myLocationButton} onPress={recenterToUser}>
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#333" />
              </TouchableOpacity>
            )}
            {(picker && Number.isFinite(pickedLat) && Number.isFinite(pickedLon)) && (
              <TouchableOpacity style={styles.centerMarkerButton} onPress={recenterToPicked}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <View style={styles.searchBox}>
              <PaperInput
                placeholder="Search places or events"
                value={searchQuery}
                onChangeText={setSearchQuery}
                mode="outlined"
                left={<PaperInput.Icon icon="magnify" />}
                right={<PaperInput.Icon icon="close" onPress={() => setSearchQuery('')} />}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <FlatList data={filteredEvents} keyExtractor={(item, idx) => (item.id ? item.id.toString() : `event-${idx}`)} renderItem={({ item }) => (
                  <TouchableOpacity style={styles.resultItem} onPress={() => handleEventSelect(item)}>
                    <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                    {item.address ? <Text style={{ color: '#666' }}>{item.address}</Text> : null}
                  </TouchableOpacity>
                )} />
              )}
            </View>
            {location && (
              <TouchableOpacity style={styles.myLocationButton} onPress={recenterToUser}>
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#333" />
              </TouchableOpacity>
            )}
            {(!picker && selectedEvent) && (
              <TouchableOpacity style={styles.centerMarkerButton} onPress={recenterToSelected}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </>
        )}

        {!picker && selectedEvent && (
          <View style={styles.infoBox}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: '700', marginBottom: 4 }}>{selectedEvent.title || 'Event'}</Text>
            {selectedEvent.address ? <Text style={{ color: '#333', marginBottom: 6 }}>{selectedEvent.address}</Text> : null}
            {(() => { const { start, end } = getEventStartEnd(); return (
              <>
                {start ? <Text style={{ color: '#333', marginBottom: 4 }}>Start: {start}</Text> : null}
                {end ? <Text style={{ color: '#333', marginBottom: 6 }}>End: {end}</Text> : null}
              </>
            ); })()}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeSelector}>
              {travelModes.map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, selectedMode === mode && styles.activeMode]}
                  onPress={() => setSelectedMode(mode)}
                  accessibilityLabel={`Travel mode: ${mode}`}
                >
                  <MaterialCommunityIcons name={modeIcons[mode]} size={26} color="#333" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.infoTextRow}>
              <Text style={styles.infoText}>Distance: {getDistanceToEvent() ? `${getDistanceToEvent()} km` : 'N/A'}</Text>
              <Text style={styles.infoText}>ETA: {estimateTravelTime()}</Text>
            </View>
            <View style={styles.infoActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EventDetails', { event: selectedEvent })}>
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => { const { latitude, longitude } = selectedEvent; const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${selectedMode}`; Linking.openURL(url); }}>
                <Text style={styles.actionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  overlaySearch: { position: 'absolute', top: 12, left: 12, right: 12 },
  overlaySuggestions: { position: 'absolute', top: 68, left: 12, right: 12, borderRadius: 12, backgroundColor: '#fff', maxHeight: 220, elevation: 4 },
  floatingActions: { position: 'absolute', right: 12, bottom: 24 },
  searchBox: { position: 'absolute', top: 12, left: 12, right: 12 },
  searchInput: { backgroundColor: '#fff', borderRadius: 24 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  resultItem: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  myLocationButton: { position: 'absolute', right: 12, bottom: 24, backgroundColor: '#fff', padding: 12, borderRadius: 24, elevation: 3 },
  centerMarkerButton: { position: 'absolute', right: 12, bottom: 84, backgroundColor: '#fff', padding: 12, borderRadius: 24, elevation: 3 },
  pickedInfoCard: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 3 },
  pickedTitle: { fontWeight: '700', marginBottom: 4 },
  pickedAddress: { color: '#333', marginBottom: 4 },
  pickedCoords: { color: '#666', marginBottom: 8 },
  pickedActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoBox: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 3 },
  closeButton: { position: 'absolute', top: 6, right: 8, zIndex: 10 },
  closeButtonText: { fontSize: 24 },
  modeSelector: { flexDirection: 'row', marginTop: 8 },
  modeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderRadius: 10, backgroundColor: '#f2f2f2' },
  activeMode: { backgroundColor: '#d8e8ff' },
  // modeText removed (icon-only)
  modeText: { marginLeft: 6 },
  infoTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  infoText: { fontSize: 14 },
  infoActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { padding: 10, backgroundColor: '#f2f2f2', borderRadius: 8 },
  actionText: { fontWeight: '600' },
});
