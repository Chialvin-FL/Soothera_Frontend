import React, { useState, useMemo, useCallback } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/Text';
import { primaryColor } from '@/constants/theme';
import { SearchBarWithBack } from './components/SearchBarWithBack';
import { MassageSpaCardsList } from './components/SalonCardsList';
import { useEstablishments } from './hooks/useEstablishments';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface TopRatedMassageSpasScreenProps {
  onBack?: () => void;
  onSalonPress?: (salonId: string) => void;
  autoOpenFilter?: boolean;
  autoFocusSearch?: boolean;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const PROXIMITY_THRESHOLD_KM = 20; // 20 km

export default function TopRatedMassageSpasScreen({
  onBack,
  onSalonPress,
  autoOpenFilter = false,
  autoFocusSearch = false,
}: TopRatedMassageSpasScreenProps = {}) {
  const { salons, loading, error } = useEstablishments();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleSearchNearby = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find salons near you.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to get your current location.');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const handleClearNearby = useCallback(() => {
    setUserLocation(null);
  }, []);

  // Compute processed salons: sort and filter by proximity if userLocation is active
  const processedSalons = useMemo(() => {
    if (!userLocation) return salons;

    return salons
      .map((salon) => {
        const lat = salon.latitude ?? 0;
        const lng = salon.longitude ?? 0;
        const hasCoords = lat !== 0 || lng !== 0;
        const distance = hasCoords
          ? getDistance(userLocation.latitude, userLocation.longitude, lat, lng)
          : Infinity;
        return {
          ...salon,
          distance,
        };
      })
      .filter((salon) => salon.distance <= PROXIMITY_THRESHOLD_KM)
      .sort((a, b) => (a.distance as number) - (b.distance as number));
  }, [salons, userLocation]);

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar with Back Button */}
      <SearchBarWithBack
        onBack={onBack}
        autoFocus={autoFocusSearch}
        autoOpenFilter={autoOpenFilter}
      />

      {/* Search Nearby Action Button or Active Filter Chip */}
      {!loading && !error && (
        <View className="px-5 mb-4">
          {locationLoading ? (
            <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-2 self-start border border-gray-100">
              <ActivityIndicator size="small" color={primaryColor} className="mr-2" />
              <Text className="text-sm font-medium" style={{ color: primaryColor }}>
                Getting location...
              </Text>
            </View>
          ) : userLocation ? (
            <View className="flex-row items-center bg-teal-50 rounded-full px-4 py-2 self-start border border-teal-100">
              <Ionicons name="navigate" size={16} color={primaryColor} className="mr-1.5" />
              <Text className="text-sm font-medium mr-2" style={{ color: primaryColor }}>
                Salons near me
              </Text>
              <TouchableOpacity onPress={handleClearNearby} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={primaryColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSearchNearby}
              activeOpacity={0.7}
              className="flex-row items-center bg-gray-50 rounded-full px-4 py-2 self-start border border-gray-200"
            >
              <Ionicons name="location-outline" size={16} color={primaryColor} className="mr-1.5" />
              <Text className="text-sm font-semibold" style={{ color: '#4B5563' }}>
                Search Nearby
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-sm mt-3" style={{ color: '#9CA3AF' }}>
            Loading salons...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-sm text-center" style={{ color: '#9CA3AF' }}>
            {error}
          </Text>
        </View>
      ) : (
        <MassageSpaCardsList
          salons={processedSalons}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          onSalonPress={onSalonPress}
        />
      )}
    </View>
  );
}
