import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { MAPBOX_TOKEN } from '../../../env';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Destination {
  latitude: number;
  longitude: number;
}

interface Props {
  destination: Destination;
  destinationName?: string;
  onBack?: () => void;
}

const GetDirectionsScreen: React.FC<Props> = ({ destination, destinationName, onBack }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    destinationName?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show directions from your current location.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      await fetchDirections(location.coords, destination);
      setLoading(false);
    })();
  }, [destination]);

  const fetchDirections = async (origin: Location.LocationObjectCoords, dest: Destination) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
          destinationName: destinationName || 'Destination',
        });
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      Alert.alert('Error', 'Failed to fetch directions.');
    }
  };

  const handleStartNavigation = async () => {
    if (!currentLocation) return;

    const { latitude, longitude } = destination;
    let url = '';

    if (Platform.OS === 'ios') {
      // Open in Apple Maps using native URL scheme
      url = `maps://maps.apple.com/?daddr=${latitude},${longitude}&directionsmode=driving`;
    } else if (Platform.OS === 'android') {
      // Use geo: URI which is platform-neutral and does not reference external web APIs
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(destinationName || 'Destination')})`;
    } else {
      // Fall back to Mapbox directions web (no Google references)
      url = `https://www.mapbox.com/directions/?destination=${latitude},${longitude}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open navigation app');
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert('Error', 'Unable to start navigation');
    }
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  if (loading || !currentLocation) {
    return (
      <View className="flex-1">
        <View className="flex-1 justify-center items-center" />
      </View>
    );
  }

  const htmlContent = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-container { height: 100%; width: 100%; }
    .custom-marker {
      background-color: ${primaryColor};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var mapboxToken = '${MAPBOX_TOKEN}';
    const map = L.map('map', { zoomControl: false }).setView([${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}], 13);
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map);

    var originIcon = L.divIcon({
      className: 'custom-marker-container',
      html: '<div class="custom-marker"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    var origin = L.marker([${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}], { icon: originIcon }).addTo(map);
    var destinationMarker = L.marker([${destination.latitude}, ${destination.longitude}]).addTo(map);

    fetch('https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.coords.longitude},${currentLocation.coords.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&steps=true&access_token=' + mapboxToken)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          var route = data.routes[0];
          var coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          L.polyline(coordinates, {color: '${primaryColor}', weight: 5, opacity: 0.8}).addTo(map);
          map.fitBounds(L.polyline(coordinates).getBounds(), { padding: [50, 50] });
        }
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
      });
  </script>
</body>
</html>`;

  return (
    <View className="flex-1">
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

<View className="absolute top-12 left-4 right-4 rounded-xl flex-row items-center p-3" style={{ backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 }}>
        <TouchableOpacity onPress={onBack} className="p-1.5">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-2.5">
          <View className="py-0.5">
            <Text className="text-xs font-medium" style={{ color: colors.icon }}>From</Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>Your Location</Text>
          </View>
          <View className="h-px my-1.5" style={{ backgroundColor: colors.tint }} />
          <View className="py-0.5">
            <Text className="text-xs font-medium" style={{ color: colors.icon }}>To</Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>{routeInfo?.destinationName || 'Destination'}</Text>
          </View>
        </View>
      </View>

      {drawerVisible && routeInfo && (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 pt-4" style={{ backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 15 }}>
          <TouchableOpacity onPress={toggleDrawer} className="absolute right-4 top-4">
            <Ionicons name="close-circle" size={24} color={colors.icon} />
          </TouchableOpacity>
          <View className="flex-row items-baseline self-start mb-2">
            <Text className="text-2xl font-bold" style={{ color: primaryColor }}>
              {Math.round(routeInfo.duration / 60)} min
            </Text>
            <Text className="text-base ml-2.5" style={{ color: colors.icon }}>
              ({(routeInfo.distance / 1000).toFixed(1)} km)
            </Text>
          </View>
          <Text className="text-sm self-start mb-4" style={{ color: colors.text }}>
            Fastest route, despite the usual traffic.
          </Text>
          <TouchableOpacity className="flex-row rounded-full py-3 px-6 items-center justify-center self-start" style={{ backgroundColor: primaryColor }} onPress={handleStartNavigation}>
            <Ionicons name="navigate-outline" size={22} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-lg font-bold">Start</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};



export default GetDirectionsScreen;