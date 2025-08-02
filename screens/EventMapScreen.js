import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Linking,
    Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyA-Psh9ZzR9Qp7tiJcH5RTqhFrr9nYZRdQ';

const events = [
    {
        id: 1,
        title: 'Cebu Tech Summit',
        description: 'Annual gathering of developers and tech leaders in Cebu.',
        address: 'Cebu IT Park, Lahug, Cebu City',
        latitude: 10.3157,
        longitude: 123.8854,
        jeepneyRoutes: ['04L', '17B', '12L']
    },
    {
        id: 2,
        title: 'Sinulog Festival',
        description: 'Cultural and religious festival held every January.',
        address: 'Osmeña Blvd, Cebu City',
        latitude: 10.3064,
        longitude: 123.8885,

    },
    {
        id: 3,
        title: 'IT Expo Manila',
        description: 'The largest IT exposition in the Philippines.',
        address: 'SMX Convention Center, Pasay City, Manila',
        latitude: 14.5495,
        longitude: 120.9817,
        jeepneyRoutes: ['Pasay Rotonda', 'Mall of Asia Loop']
    },
    {
        id: 4,
        title: 'Davao DevCon',
        description: 'A developer conference in the heart of Davao.',
        address: 'Abreeza Mall, Davao City',
        latitude: 7.0907,
        longitude: 125.6131,

    },
    {
        id: 5,
        title: 'TEST2555',
        description: 'A developer conference in the heart of Cebu.',
        address: 'Osmeña Blvd, Cebu City, 6000 Cebu, Philippines',
        latitude: 10.3144559,
        longitude: 123.8920288,

    },
];
export default function EventMapScreen({route, navigation}) {
    const { event } = route.params || {};
    // const [events, setEvents] = useState(event ? [event] : []);
    const [location, setLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const mapRef = useRef();
    const [selectedMode, setSelectedMode] = useState('driving');
    const [routeDistance, setRouteDistance] = useState(null);
    const [routeDuration, setRouteDuration] = useState(null);

    const travelModes = ['driving' ,'walking','transit', 'motorcycle' ];
    const modeIcons = {
        walking: 'walk',
        motorcycle: 'bicycle-outline', // or 'motorcycle' if you're using a different icon set
        driving: 'car-outline',
        transit: 'bus' // substitute if not supported
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
    }, []);
    useEffect(() => {
        if (event) {
            const parsedEvent = {
                ...event,
                latitude: parseFloat(event.latitude),
                longitude: parseFloat(event.longitude)
            };
            setSelectedEvent(parsedEvent);
            mapRef.current?.animateToRegion({
                latitude: parsedEvent.latitude,
                longitude: parsedEvent.longitude,   
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
            setFilteredEvents([parsedEvent]);
            setSearchQuery('');
           
        }
    }, [event]);

    useEffect(() => {
        const filtered = events.filter(e =>
            e.title.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            e.address.toLowerCase().includes(searchQuery?.toLowerCase())

        );
        setFilteredEvents(filtered);
    }, [searchQuery]);

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        mapRef.current?.animateToRegion({
            latitude: event.latitude,
            longitude: event.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
        setSearchQuery('');
    };
    const handleViewDetials = () => {
        if (!selectedEvent) return;
        navigation.navigate('EventDetails', { event: selectedEvent });
    }
    const openInGoogleMaps = () => {
        if (!selectedEvent) return;
        const { latitude, longitude } = selectedEvent;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        Linking.openURL(url);
    };

    const estimateTravelTime = () => {
        if (!routeDuration) return 'N/A';
        const duration = parseFloat(routeDuration);
        if (duration < 1) return '< 1 min';
        return `${Math.round(duration)} min`;
    };

    const getDistanceToEvent = () => {
        if (!location || !selectedEvent) return null;
        const distance = getDistance(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: parseFloat(selectedEvent.latitude), longitude: parseFloat(selectedEvent.longitude) }
        );
        return (distance / 1000).toFixed(2); // Convert to km
    };


    return (
        <View style={styles.container}>


            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location?.latitude || 10.3157,
                    longitude: location?.longitude || 123.8854,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude
                        }}
                        title="Your Location"
                        pinColor="blue"
                    />
                )}


                {events.map(event => (
                    <Marker
                        key={event.id}
                        coordinate={{ latitude: parseFloat(event.latitude), longitude: parseFloat(event.longitude) }}
                        title={event.title}
                        onPress={() => setSelectedEvent(event)}
                    />
                ))}

                {location && selectedEvent && (
                    <MapViewDirections
                        origin={location}
                        destination={{
                            latitude: parseFloat(selectedEvent.latitude),
                            longitude: parseFloat(selectedEvent.longitude)
                        }}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={4}
                        strokeColor="blue"
                        mode={selectedMode}
                        onReady={result => {
                            setRouteDistance(result.distance);
                            setRouteDuration(result.duration);
                            mapRef.current?.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                    top: 50, bottom: 50, left: 50, right: 50
                                },
                                animated: true,
                            });
                        }}
                    />

                )}
            </MapView>


            <View style={styles.searchBox}>
                <TextInput
                    placeholder="Search by event, location"
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {searchQuery.length > 0 && (
                    <FlatList
                        data={filteredEvents}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.resultItem}
                                onPress={() => handleEventSelect(item)}
                            >
                                <Text>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
            {location && (
                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={() => {
                        mapRef.current?.animateToRegion({
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 1000);
                    }}
                >
                    <Ionicons name="locate" size={24} color="#333" />
                </TouchableOpacity>
            )}
            {selectedEvent && (
                <View style={styles.infoBox}>

                    {/* Close icon in top-right */}
                    <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                    <View horizontal showsHorizontalScrollIndicator={false} style={styles.modeSelector}>
                        {travelModes.map(mode => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => setSelectedMode(mode)}
                                style={[
                                    styles.modeButton,
                                    selectedMode === mode && styles.activeModeButton
                                ]}
                            >
                                <Ionicons
  name={modeIcons[mode]}
  size={20}
  color={selectedMode === mode ? 'white' : '#333'}
/>

                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.eventName}>{selectedEvent.title} </Text>

                    <Text style={styles.eventDescription}> ({event?.start_date} - {event?.end_date})</Text>
                    <Text style={styles.eventDescription}>
                        {selectedEvent.description.length > 50
                            ? selectedEvent.description.slice(0, 50) + '...'
                            : selectedEvent.description}
                    </Text>

                    <Text style={styles.eventLocation}>📍 {selectedEvent.address}</Text>

                    {location && (
                        <View style={styles.infoBox}>
                            
                            <Text style={styles.infoText}> ({estimateTravelTime()}) {getDistanceToEvent()} km</Text>
   
                        </View>
                    )}


                    <TouchableOpacity style={styles.directionButton} onPress={openInGoogleMaps}>
                        <Text style={styles.buttonText}>View Directions in Google Maps</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.directionButton} onPress={handleViewDetials}>
                        <Text style={styles.buttonText}>View Event Details</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    searchBox: {
        position: 'absolute',
        top: 40,
        left: 10,
        right: 10,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        elevation: 3,
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1,
        backgroundColor: '#ddd',
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',

    },

    input: {
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    resultItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    modeSelector: {
        marginBottom: 10,
        marginTop: 10,
        justifyContent:'space-evenly',
        flexDirection: 'row',
        zIndex: 999,
        paddingHorizontal: 5,
    },
    modeButton: {
        backgroundColor: '#eee',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    activeModeButton: {
        backgroundColor: '#4285F4',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 20,
        color: '#333',
        marginLeft: 8,
        fontWeight: '800',
    },
    myLocationButton: {
        position: 'absolute',
        top: 150,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    infoBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,

        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    }
    ,
    eventName: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    eventLocation: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    jeepLabel: {
        fontWeight: '600',
        marginTop: 6,
        marginBottom: 2,
        color: '#444'
    },
    jeepRoutes: {
        fontSize: 13,
        color: '#555',
        marginBottom: 6
    },
    directionButton: {
        marginBottom: 10,
        backgroundColor: '#4285F4',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontWeight: 'bold' }
});
