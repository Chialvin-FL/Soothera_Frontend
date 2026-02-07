import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, TouchableOpacity, Linking, Platform, Animated, PanResponder, Dimensions } from 'react-native';
import { Text } from '@/components/Text';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  destination: { latitude: number; longitude: number };
  destinationName?: string;
  onBack?: () => void;
}

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const GetDirectionsScreen: React.FC<Props> = ({ destination, destinationName, onBack }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  // Use refs to track heading and map readiness to avoid re-rendering the WebView on every compass change
  const headingRef = useRef<number>(0);
  const mapReadyRef = useRef(false);
  const webviewRef = useRef<any>(null);
  const pendingHeadingRef = useRef<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  
  // Drawer Animation State
  // Drawer will 'peek' at this offset (px) when closed so it's always draggable
  const DRAWER_PEEK = 140;
  // Start opened by default (translateY = 0)
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);


  // Pullable Drawer Logic
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newValue = lastOffset.current + gesture.dy;
        if (newValue >= 0 && newValue <= DRAWER_PEEK) translateY.setValue(newValue);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 50) {
          Animated.spring(translateY, { toValue: DRAWER_PEEK, useNativeDriver: true }).start();
          lastOffset.current = DRAWER_PEEK;
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
          lastOffset.current = 0;
        }
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Watch device heading (compass) — send heading updates directly to the WebView to avoid re-rendering the screen
      Location.watchHeadingAsync((data) => {
        const angle = data.trueHeading ?? 0;
        headingRef.current = angle;
        if (mapReadyRef.current && webviewRef.current) {
          try {
            webviewRef.current.injectJavaScript(`(function(){ if(window.updateHeading) { window.updateHeading(${angle}); } else { var cone = document.querySelector('.heading-cone'); if(cone) cone.style.transform = 'translateX(-50%) rotate('+(${angle})+'deg)'; } })(); true;`);
          } catch (e) { /* ignore injection errors until webview is ready */ }
        } else {
          pendingHeadingRef.current = angle;
        }
      });

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      fetchDirections(location.coords);
    })();
  }, []);

  const fetchDirections = async (origin: any) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes?.[0]) {
        setRouteInfo({ distance: data.routes[0].distance, duration: data.routes[0].duration });
      }
    } catch (e) { console.error(e); }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; background: #e5e7eb; }
        .user-wrapper { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .user-dot { width: 14px; height: 14px; background: #4285F4; border: 2px solid white; border-radius: 50%; position: relative; box-shadow: 0 0 5px rgba(0,0,0,0.2); pointer-events: none; }
        .heading-cone {
          position: absolute; left: 50%; bottom: 4px; /* closer to the dot */
          width: 100px; height: 60px; /* fixed visual size */
          transform-origin: 50% 100%;
          transform: translateX(-50%) rotate(0deg);
          transition: transform 160ms linear;
          pointer-events: none;
          display: flex; align-items: flex-end; justify-content: center; overflow: visible;
        }
        /* Destination marker styling (match BookingDetailsScreen) */
        .custom-marker {
          background-color: ${primaryColor};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
          border: 2px solid white; /* white border for better contrast */
          box-sizing: border-box;
        }
        .custom-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map', { zoomControl: false });
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}', {
            tileSize: 512, zoomOffset: -1
        }).addTo(map);
        
        const userIcon = L.divIcon({ className: '', html: '<div class="user-wrapper"><div class="user-dot"><div class="heading-cone">' +
              '<svg width="100" height="60" viewBox="0 0 100 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
              '<defs>' +
              '<linearGradient id="coneGrad" x1="0.5" y1="1" x2="0.5" y2="0">' +
              '<stop offset="0%" stop-color="rgba(66,133,244,0.3)"/>' +
              '<stop offset="70%" stop-color="rgba(66,133,244,0.08)"/>' +
              '<stop offset="100%" stop-color="rgba(66,133,244,0)"/>' +
              '</linearGradient>' +
              '</defs>' +
              '<polygon points="50,60 0,0 100,0" fill="url(#coneGrad)"/>' +
              '</svg>' +
              '</div></div></div>', iconSize: [40, 40], iconAnchor: [20, 20] });
        L.marker([${currentLocation?.coords.latitude || 0}, ${currentLocation?.coords.longitude || 0}], {icon: userIcon}).addTo(map);
        const destIcon = L.divIcon({ className: '', html: '<div class="custom-marker"></div>', iconSize: [34, 46], iconAnchor: [17, 46] });
        L.marker([${destination.latitude}, ${destination.longitude}], {icon: destIcon}).addTo(map);

        // Variables to keep heading value; cone will remain fixed size on screen (no scale applied)
        let currentAngle = 0;

        fetch('https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation?.coords.longitude},${currentLocation?.coords.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}')
          .then(res => res.json())
          .then(data => {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            // Polyline casing (thicker border)
            L.polyline(coords, {color: '#2F5E52', weight: 8, opacity: 0.95, lineCap: 'round'}).addTo(map);
            // Main Polyline (thinner)
            const mainLine = L.polyline(coords, {color: '${primaryColor}', weight: 3, opacity: 1, lineCap: 'round'}).addTo(map);

            // Fit bounds to exactly include both origin and destination markers with dynamic padding
            const origin = L.latLng(${currentLocation?.coords.latitude || 0}, ${currentLocation?.coords.longitude || 0});
            const dest = L.latLng(${destination.latitude}, ${destination.longitude});
            const bounds = L.latLngBounds([origin, dest]);
            const paddingX = Math.round(window.innerWidth * 0.07);
            const paddingY = Math.round(window.innerHeight * 0.07);
            map.fitBounds(bounds, { padding: [paddingX, paddingY] });
          });

        // Expose a function to update the heading without reloading the page
        // Use device heading directly so the cone points toward the direction the device is facing
        window.updateHeading = function(angle) {
          try {
            currentAngle = angle;
            var cone = document.querySelector('.heading-cone');
            if (cone) cone.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
          } catch (e) { }
        };

        // Let React Native know the map is ready to receive heading updates
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage('map-ready');
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-gray-100">
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        onMessage={(event) => {
          if (event.nativeEvent?.data === 'map-ready') {
            mapReadyRef.current = true;
            if (pendingHeadingRef.current != null && webviewRef.current) {
              const angle = pendingHeadingRef.current;
              pendingHeadingRef.current = null;
              try { webviewRef.current.injectJavaScript(`(function(){ if(window.updateHeading) window.updateHeading(${angle}); })(); true;`); } catch(e) { }
            }
          }
        }}
      />

      {/* FLOATING HEADER */}
      <View className="absolute top-12 left-3 right-3 bg-white rounded-2xl shadow-lg p-5 flex-row items-center border border-gray-100">
        <TouchableOpacity onPress={onBack} className="pr-2">
          <Ionicons name="arrow-back" size={24} color="#5F6368" />
        </TouchableOpacity>
        
        {/* Connection visuals: Dot, Dotted Line, Pin */}
        <View className="items-center mr-3">
            <Ionicons name="radio-button-on" size={14} color="#4285F4" />
            <View className="w-0.5 h-6 border-l border-dotted border-gray-400 my-2" />
            <Ionicons name="location-outline" size={24} color={colors.primary}/>
        </View>

        <View className="flex-1">
          <Text className="text-lg mb-4" style={{ color: '#4285F4' }}>Your location</Text>
          <View className="h-[1px] bg-gray-200 w-full mb-2" />
          <Text className="text-lg font-bold text-gray-800 mt-2" numberOfLines={1}>{destinationName || 'Destination'}</Text>
        </View>

        <TouchableOpacity className="pl-2">
          <MaterialCommunityIcons name="swap-vertical" size={30} color="#5F6368" />
        </TouchableOpacity>
      </View>

      {/* PULLABLE BOTTOM DRAWER */}
      <Animated.View 
        {...panResponder.panHandlers}
        style={{ transform: [{ translateY }] }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] shadow-2xl pb-10"
      >
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1.5 bg-gray-200 rounded-full" />
        </View>

        <View className="px-6">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-green-700">{Math.round((routeInfo?.duration || 0) / 60)} min </Text>
              <Text className="text-lg text-gray-500 font-medium">({((routeInfo?.distance || 0) / 1000).toFixed(1)} km)</Text>
            </View>
            <TouchableOpacity onPress={() => Animated.spring(translateY, {toValue: DRAWER_PEEK, useNativeDriver: true}).start()}>
               <MaterialIcons name="close" size={24} color="#5F6368" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-gray-600 mb-6">Fastest route now due to traffic conditions</Text>

          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => {
                const lat = destination.latitude; const lng = destination.longitude;
                const url = Platform.OS === 'ios'
                  ? `maps://maps.apple.com/?daddr=${lat},${lng}&directionsmode=driving`
                  : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(destinationName || 'Destination')})`;
                Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open navigation app'));
              }}
              className="bg-[#007064] flex-row items-center px-6 py-3.5 rounded-full mr-3 shadow-sm"
            >
              <Ionicons name="navigate-outline" size={22} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-lg font-bold">Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default GetDirectionsScreen;