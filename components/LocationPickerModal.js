import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const GOOGLE_MAPS_APIKEY = 'AIzaSyA-Psh9ZzR9Qp7tiJcH5RTqhFrr9nYZRdQ'; // Use your own key

export default function ManualLocationPicker({ visible, onClose, onPick }) {
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user current location
  useEffect(() => {
    if (!visible) return;

    (async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMarker(coords);

      await reverseGeocode(coords);
      setLoading(false);
    })();
  }, [visible]);

  const reverseGeocode = async (coords) => {
    try {
      const [addr] = await Location.reverseGeocodeAsync(coords);
      if (addr) {
        const label = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`;
        setAddress(label);
      } else {
        setAddress('No address found');
      }
    } catch (e) {
      setAddress('Error getting address');
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (input) => {
    if (!input) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const json = await res.json();
      if (json.predictions) {
        setSuggestions(json.predictions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // When user selects a suggestion
  const handleSelectSuggestion = async (placeId) => {
    setSuggestions([]);
    setLoading(true);

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_APIKEY}`
    );
    const json = await res.json();

    const loc = json.result.geometry.location;
    const coords = { latitude: loc.lat, longitude: loc.lng };

    setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    setMarker(coords);
    setAddress(json.result.formatted_address);
    setQuery(json.result.name);

    setLoading(false);
  };

  // Handle tap on map
  const handleMapPress = async (event) => {
    const coords = event.nativeEvent.coordinate;
    setMarker(coords);
    setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    await reverseGeocode(coords);
  };

  // When user drags marker
  const handleMarkerDragEnd = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    await reverseGeocode(coords);
  };

  const handlePick = () => {
    if (marker && onPick) {
      onPick({ coords: marker, address });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 , padding: 10 , marginHorizontal: 5 }}>
        {/* Search input with suggestions */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search location..."
            style={styles.input}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              fetchSuggestions(text);
            }}
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item.place_id)}
                  >
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {loading || !region ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              )}
            </MapView>

            <View style={styles.bottomPanel}>
              <Text style={{ fontWeight: 'bold' }}>Address:</Text>
              <Text numberOfLines={2}>{address}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancel} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pick} onPress={handlePick}>
                  <Text style={styles.buttonText}>Use This Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1,
    padding: 10,
    borderRadius: 10,
    margin: 10,
   },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cancel: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  pick: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  input: {
    padding: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    zIndex: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
