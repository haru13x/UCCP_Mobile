import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { API_URL } from '@env';
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { UseMethod } from "../composable/useMethod";

const { width } = Dimensions.get("window");

const EventScanScreen = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const mode = route.params?.mode;

  useEffect(() => {
    if (permission?.granted && isFocused) {
      const timeout = setTimeout(() => setIsCameraReady(true), 300);
      return () => clearTimeout(timeout);
    } else {
      setIsCameraReady(false);
    }
  }, [permission, isFocused]);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  const handleScan = async ({ data }) => {
  if (!scanned) {
    setScanned(true);
    setLoading(true);

    try {
      const response = await UseMethod('post', 'scan-event', {
        barcode: data,
      });

      const result = response?.data;

      if (result && Object.keys(result).length > 0 && result?.type != 2) {
        navigation.navigate("EventDetails", { event: result, mode });
       
      } else {
        Alert.alert(response?.data?.message || "No event found for this barcode.");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        Alert.alert(
          "Access Denied",
          error.response.data.message || "This event is not intended for your account type."
        );
      } else if (error.response && error.response.status === 404) {
        Alert.alert("Not Found", "No event found for this barcode.");
      } else {
        Alert.alert("Error", "Failed to connect to the server."+error.response.status );
       
      }
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 2500);
    }
  }
};


  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need permission to access your camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isCameraReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={{ color: "#888", marginTop: 10 }}>Initializing Camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      {isFocused && (
        <View style={styles.cameraWrapper}>


          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8"],
            }}
            onBarcodeScanned={handleScan}
          >
          


        
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>

         
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={toggleCameraFacing}>
                <LinearGradient
                  colors={["#0f0c29", "#302b63", "#24243e"]}
                  style={styles.flipButton}
                >
                  <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
                  <Text style={styles.buttonText}> Flip </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraWrapper: {
    width: width * 0.9,
    height: width * 1.5,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1e3a8a",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#333",
  },
  permissionBtn: {
    backgroundColor: "#1e40af",
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    padding: 10,
    zIndex: 10,
  },
  scanArea: {
    width: 180,
    height: 180,
    borderWidth: 3,
    borderColor: "#00ffc8",
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  loadingOverlay: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
  },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default EventScanScreen;
