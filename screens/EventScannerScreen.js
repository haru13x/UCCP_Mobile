import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EventScannerScreen({ navigation }) {
  const startScan = (mode) => {
    navigation.navigate('EventScan', { mode });
  };

  return (
    <View style={styles.container}>
      {/* ✅ Display GIF */}
      <Image
        source={require('../assets/scanner.png')} // Ensure the path is correct
        style={styles.gifImage}
        resizeMode="cover" // or "contain" if you want padding
      />

      <Text style={styles.title}>Event Scanner</Text>
      <Text style={styles.subtitle}>Quickly Scan QR to  attend your event</Text>

      {/* <TouchableOpacity onPress={() => startScan('register')} style={styles.buttonWrapper}>
        <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.button}>
          <Ionicons name="person-add-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Register to Event</Text>
        </LinearGradient>
      </TouchableOpacity> */}

      <TouchableOpacity onPress={() => startScan('attend')} style={styles.buttonWrapper}>
        <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.button}>
          <Ionicons name="qr-code-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Scan QR Event</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gifImage: {
     marginTop: 10,
    width: '100%',       // full width of the container
    height: 300,         // or adjust as needed
    borderRadius: 8,     // optional for rounded corners
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1e3c72',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    marginBottom: 30,
  },
  buttonWrapper: {
    marginVertical: 10,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
});
