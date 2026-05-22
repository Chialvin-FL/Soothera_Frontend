import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions, BackHandler, Platform, Linking, Animated, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransparentHeader } from '@/components/native/TransparentHeader';
import { SalonDetails } from './types/SalonDetails';
import { getSalonServices } from '@/api/endpoints/apiService';
import type { SalonServiceResponse } from '@/api/types';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWppd25sIiwiYSI6ImNtMzhsaHFzNTB0dmsyaXE1enV5aXNrbjcifQ.MKG4wR3aMbdde0oisZLH7g';

// Try to load WebView at runtime for mobile (Leaflet in WebView with Mapbox tiles)
let RNWebView: any = null;
try {
  RNWebView = require('react-native-webview');
} catch (e) {
  RNWebView = null;
}

interface MassageSpaDetailsScreenProps {
  salonDetails: SalonDetails;
  onBack: () => void;
  onBookAppointment?: () => void;
}

type TabId = 'services' | 'therapists' | 'location' | 'ratings' | 'about';

// Map component for mobile (display-only with pin marker using Leaflet in WebView)
const MapView = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Default coordinates fallback
  const DEFAULT_LAT = 10.643284;
  const DEFAULT_LNG = 124.477158;

  const validLat = isNaN(latitude) ? DEFAULT_LAT : latitude;
  const validLng = isNaN(longitude) ? DEFAULT_LNG : longitude;

  // Mobile map rendering: use WebView with Leaflet and Mapbox tiles (display-only)
  if (Platform.OS !== 'web' && RNWebView) {
    const WebViewComp = RNWebView.default || RNWebView.WebView;

    // Render a Leaflet HTML inside WebView with Mapbox tiles (display-only)
    if (WebViewComp) {
      // Convert primary color to hex format for use in HTML/CSS
      const primaryColorHex = colors.primary || '#0d9488';

      const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-container { height: 100%; width: 100%; }
    .custom-marker {
      background-color: ${primaryColorHex};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
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
    // Mapbox access token
    var mapboxToken = '${MAPBOX_TOKEN}';
    
    const map = L.map('map', { zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false }).setView([${validLat}, ${validLng}], 14);
    
    // Use Mapbox tiles with custom styling
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=' + mapboxToken, {
      attribution: '© Mapbox © OpenStreetMap',
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1
    }).addTo(map);
    
    // Add marker with custom primary color icon
    var customIcon = L.divIcon({
      className: 'custom-marker-container',
      html: '<div class="custom-marker"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
    
    L.marker([${validLat}, ${validLng}], { icon: customIcon }).addTo(map);
  </script>
</body>
</html>`;

      return (
        <View
          className="w-full rounded-xl overflow-hidden"
          style={{
            height: 200,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}
        >
          <WebViewComp
            originWhitelist={["*"]}
            source={{ html }}
            style={{ flex: 1 }}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }
  }

  // Fallback: placeholder if maps are not available
  return (
    <View
      className="w-full rounded-xl overflow-hidden"
      style={{
        height: 200,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Ionicons name="map-outline" size={48} color={colors.icon} />
        <Text className="text-sm mt-2" style={{ color: colors.icon }}>
          Map View (Lat: {validLat.toFixed(4)}, Lng: {validLng.toFixed(4)})
        </Text>
      </View>
    </View>
  );
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className="flex-row items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={16} color="#F59E0B" />
      ))}
      {hasHalfStar && (
        <Ionicons name="star-half" size={16} color="#F59E0B" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#F59E0B" />
      ))}
      <Text className="text-sm ml-2 font-semibold" style={{ color: '#F59E0B' }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

// Format date as "X months ago" or similar relative time
const formatRelativeDate = (date: Date | string | undefined): string => {
  if (!date) return '';

  const reviewDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return 'today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

const formatPrice = (price: number): string => {
  return `₱${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return 'N/A';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
};

export default function MassageSpaDetailsScreen({
  salonDetails,
  onBack,
  onBookAppointment,
}: MassageSpaDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>('services');
  const [isFavorited, setIsFavorited] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTabHeight, setActiveTabHeight] = useState(1);
  const [services, setServices] = useState<SalonServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const tabScrollViewRef = useRef<ScrollView>(null);
  const contentScrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
  const screenWidth = Dimensions.get('window').width;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const isScrolledRef = useRef(false);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'services', label: 'Services' },
    { id: 'therapists', label: 'Therapists' },
    { id: 'location', label: 'Location' },
    { id: 'ratings', label: 'Ratings' },
    { id: 'about', label: 'About Us' },
  ];

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await getSalonServices({
          establishmentId: salonDetails.id,
          isActive: true,
          pageSize: 100,
        });

        if (!mounted) return;

        if (response.success && response.data) {
          setServices(response.data.items ?? []);
        } else {
          setServices([]);
          setServicesError(response.message ?? 'Failed to load services.');
        }
      } catch (error: any) {
        if (!mounted) return;
        setServices([]);
        setServicesError(error?.message ?? 'Failed to load services.');
      } finally {
        if (mounted) setServicesLoading(false);
      }
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, [salonDetails.id]);

  // Get tab index
  const getTabIndex = (tabId: TabId): number => {
    return tabs.findIndex(tab => tab.id === tabId);
  };

  // Handle tab change with auto-scroll
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const tabIndex = getTabIndex(tabId);

    // Scroll content to the selected tab
    if (contentScrollViewRef.current) {
      contentScrollViewRef.current.scrollTo({
        x: tabIndex * screenWidth,
        animated: true,
      });
    }

    // Auto-scroll tab bar to show active tab
    scrollTabToActive(tabId);
  };

  // Scroll tab bar to show active tab
  const scrollTabToActive = (tabId: TabId) => {
    const layout = tabLayouts.current[tabId];
    if (layout && tabScrollViewRef.current) {
      const tabIndex = getTabIndex(tabId);
      const tabWidth = layout.width;
      const tabX = layout.x;
      const scrollViewWidth = screenWidth;
      const scrollPosition = tabX - (scrollViewWidth / 2) + (tabWidth / 2);

      tabScrollViewRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  };

  // Handle content scroll (swipe gesture)
  const handleContentScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const tabIndex = Math.round(offsetX / screenWidth);

    if (tabIndex >= 0 && tabIndex < tabs.length) {
      const newTab = tabs[tabIndex];
      if (newTab.id !== activeTab) {
        setActiveTab(newTab.id);
        scrollTabToActive(newTab.id);
      }
    }
  };



  // Handle Facebook
  const handleFacebook = () => {
    const facebookUrl = salonDetails.facebookUrl || `https://www.facebook.com/${salonDetails.name.replace(/\s+/g, '')}`;
    Linking.openURL(facebookUrl).catch(err => console.error('Error opening Facebook:', err));
  };

  // Handle Message
  const handleMessage = () => {
    const phoneNumber = salonDetails.phoneNumber || '';
    if (Platform.OS === 'ios') {
      Linking.openURL(`sms:${phoneNumber}`).catch(err => console.error('Error opening Messages:', err));
    } else {
      Linking.openURL(`sms:${phoneNumber}`).catch(err => console.error('Error opening Messages:', err));
    }
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Prevent default behavior (quitting the app)
    });

    return () => backHandler.remove();
  }, [onBack]);

  // Auto-scroll tab bar when activeTab changes (initial load and tab changes)
  useEffect(() => {
    // Small delay to ensure layouts are measured
    const timer = setTimeout(() => {
      scrollTabToActive(activeTab);
      // Also scroll content to active tab
      const tabIndex = getTabIndex(activeTab);
      if (contentScrollViewRef.current) {
        contentScrollViewRef.current.scrollTo({
          x: tabIndex * screenWidth,
          animated: false, // No animation on initial load
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Animate heart button opacity - fade immediately upon scroll
  useEffect(() => {
    const isScrolled = scrollY > 0;

    // Only animate when transitioning between scrolled and not-scrolled states
    if (isScrolled !== isScrolledRef.current) {
      isScrolledRef.current = isScrolled;

      if (isScrolled) {
        // Fade out immediately when scrolling starts
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      } else {
        // Fade in when back at top
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [scrollY, heartOpacity]);

  // Render tab content
  const renderTabContent = (tabId?: TabId) => {
    const currentTab = tabId || activeTab;
    switch (currentTab) {
      case 'services':
        return (
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Services ({services.length})
            </Text>

            {servicesLoading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="small" color={primaryColor} />
                <Text className="text-sm mt-3" style={{ color: colors.icon }}>
                  Loading services...
                </Text>
              </View>
            ) : servicesError ? (
              <View className="items-center justify-center py-12">
                <Ionicons name="alert-circle-outline" size={44} color={colors.icon} />
                <Text className="text-sm text-center mt-3" style={{ color: colors.icon }}>
                  {servicesError}
                </Text>
              </View>
            ) : services.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Ionicons name="cut-outline" size={48} color={colors.icon} />
                <Text className="text-base font-semibold mt-3 mb-1" style={{ color: colors.text }}>
                  N/A
                </Text>
                <Text className="text-sm text-center" style={{ color: colors.icon }}>
                  No services are available for this salon yet.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {services.map((service) => {
                  const lowestPrice = service.price.length ? Math.min(...service.price) : 0;
                  const durationLabels = service.durationMinutes.map(formatDuration).join(', ');

                  return (
                    <View
                      key={service.salonServiceId}
                      className="rounded-xl bg-white p-4"
                      style={{
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                      }}
                    >
                      <View className="flex-row items-start justify-between mb-2" style={{ gap: 12 }}>
                        <View className="flex-1">
                          <Text className="text-base font-semibold" style={{ color: colors.text }}>
                            {service.serviceName || 'N/A'}
                          </Text>
                          <Text className="text-xs mt-1" style={{ color: colors.icon }}>
                            {durationLabels || 'N/A'}
                          </Text>
                        </View>
                        <Text className="text-sm font-bold" style={{ color: primaryColor }}>
                          {lowestPrice ? `From ${formatPrice(lowestPrice)}` : 'N/A'}
                        </Text>
                      </View>

                      <Text className="text-sm leading-5" style={{ color: colors.icon }} numberOfLines={3}>
                        {service.description || 'N/A'}
                      </Text>

                      {service.addOns.length > 0 && (
                        <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
                          {service.addOns.map((addOn, index) => (
                            <View
                              key={`${service.salonServiceId}-${addOn}-${index}`}
                              className="px-2 py-1 rounded-full"
                              style={{ backgroundColor: colors.primary + '14' }}
                            >
                              <Text className="text-xs" style={{ color: colors.primary }}>
                                {addOn}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );


      case 'therapists':
        return (
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Therapists ({salonDetails.therapists.length})
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {salonDetails.therapists.map((therapist) => (
                <View key={therapist.id} className="w-[48%]">
                  <View className="relative mb-2">
                    <Image
                      source={therapist.image}
                      className="w-full h-40 rounded-xl"
                      resizeMode="cover"
                    />
                    <View
                      className="absolute bottom-2 right-2 flex-row items-center px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text className="text-white text-xs font-semibold ml-1">
                        {therapist.rating}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                    {therapist.name}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.icon }}>
                    {therapist.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'location':
        return (
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Location
            </Text>
            <View className="mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="location-outline" size={20} color={colors.primary} style={{ marginTop: 2 }} />
                <Text className="text-base ml-2 flex-1" style={{ color: colors.text }}>
                  {salonDetails.address}
                </Text>
              </View>
              <View className="flex-row items-center mb-4">
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text className="text-sm ml-2" style={{ color: colors.icon }}>
                  {salonDetails.operatingHours}
                </Text>
              </View>
            </View>
            <MapView
              latitude={salonDetails.latitude}
              longitude={salonDetails.longitude}
            />
          </View>
        );

      case 'ratings':
        return (
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="star" size={24} color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text className="text-3xl font-bold mr-2" style={{ color: colors.text }}>
                    {salonDetails.rating}
                  </Text>
                </View>
                <Text className="text-sm" style={{ color: colors.icon }}>
                  {salonDetails.reviewCount} reviews
                </Text>
              </View>
            </View>
            <View>
              {salonDetails.reviews.map((review, index) => (
                <View
                  key={index}
                  className="mb-4 rounded-xl overflow-hidden bg-white"
                  style={{
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-2">
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                          {review.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-base font-semibold" style={{ color: colors.text }}>
                            {review.userName}
                          </Text>
                          {review.date && (
                            <Text className="text-xs" style={{ color: colors.icon }}>
                              {formatRelativeDate(review.date)}
                            </Text>
                          )}
                        </View>
                        <StarRating rating={review.rating} />
                      </View>
                    </View>
                    <Text className="text-sm mt-2" style={{ color: colors.icon }}>
                      {review.comment}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'about':
        return (
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              About Us
            </Text>
            <Text className="text-sm leading-6" style={{ color: colors.icon }}>
              {salonDetails.description}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Massage Spa Image with Overlay Header */}
      <View className="w-full relative" style={{ height: 250 }}>
        <Image
          source={salonDetails.image}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Transparent Header Overlay */}
        <TransparentHeader onBack={onBack} />

        {/* Floating Heart Button - Fade out when scrolled down */}
        <Animated.View
          className="absolute bottom-0 right-5"
          style={{
            opacity: heartOpacity,
            pointerEvents: scrollY === 0 ? 'auto' : 'none',
          }}
        >
          <TouchableOpacity
            className="items-center justify-center rounded-full"
            style={{
              backgroundColor: 'white',
              width: 50,
              height: 50,
              marginBottom: -25, // Half overlaps into details section
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={() => {
              setIsFavorited(!isFavorited);
              // TODO: Implement add to favorites functionality
              console.log('Toggle favorite:', salonDetails.id, !isFavorited);
            }}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={24}
              color={primaryColor}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        ref={mainScrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setScrollY(offsetY);
        }}
        scrollEventThrottle={16}
      >
        <View className="px-5 pt-4">
          {/* Massage Spa Name */}
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            {salonDetails.name}
          </Text>

          {/* Massage Spa Rating */}
          <View className="mb-4">
            <StarRating rating={salonDetails.rating} />
          </View>

          {/* Address */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color={colors.icon} />
            <Text className="text-sm ml-1" style={{ color: colors.icon }}>
              {salonDetails.address}
            </Text>
          </View>

          {/* Operating Hours */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="time-outline" size={16} color={colors.icon} />
            <Text className="text-sm ml-1" style={{ color: colors.icon }}>
              {salonDetails.operatingHours}
            </Text>
          </View>

          {/* Action Buttons: Facebook, Message */}
          <View className="flex-row justify-around mb-6" style={{ gap: 12 }}>
            <TouchableOpacity
              className="items-center"
              onPress={handleFacebook}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Ionicons name="logo-facebook" size={24} color={primaryColor} />
              </View>
              <Text className="text-xs" style={{ color: colors.icon }}>
                Facebook
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center"
              onPress={handleMessage}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Ionicons name="chatbubble-outline" size={24} color={primaryColor} />
              </View>
              <Text className="text-xs" style={{ color: colors.icon }}>
                Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <ScrollView
            ref={tabScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 0 }}
          >
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabChange(tab.id)}
                className={index < tabs.length - 1 ? "mr-4" : ""}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  tabLayouts.current[tab.id] = { x, width };
                }}
              >
                <View className="pb-2 items-center">
                  <Text
                    className="text-base font-medium text-center"
                    style={{
                      color: activeTab === tab.id ? primaryColor : colors.icon,
                    }}
                  >
                    {tab.label}
                  </Text>
                  {activeTab === tab.id && (
                    <View
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: 2,
                        backgroundColor: primaryColor,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Horizontal Divider */}
          <View
            className="w-full"
            style={{
              height: 1,
              backgroundColor: '#E5E7EB',
              marginTop: 4,
              marginBottom: 0,
            }}
          />
        </View>

        {/* Active Tab Height Measurement (off-screen) */}
        <View
          key={`measure-${activeTab}-${servicesLoading}-${services.length}-${servicesError ?? ''}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: screenWidth,
            opacity: 0,
            zIndex: -1,
          }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0 && height !== activeTabHeight) {
              setActiveTabHeight(height);
            }
          }}
        >
          {renderTabContent(activeTab)}
        </View>

        {/* Tab Content with Swipe Gesture */}
        <View style={{ height: activeTabHeight, overflow: 'hidden' }}>
          <ScrollView
            ref={contentScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleContentScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="start"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 0 }}
          >
            {tabs.map((tab, index) => {
              const activeIndex = getTabIndex(activeTab);
              // Only render content for active tab and adjacent tabs (for smooth swiping)
              const shouldRenderContent = Math.abs(index - activeIndex) <= 1;

              return (
                <View key={tab.id} style={{ width: screenWidth }}>
                  {shouldRenderContent ? renderTabContent(tab.id) : <View style={{ height: 1 }} />}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Book Appointment Button */}
      <View
        className="px-5 py-4 border-t"
        style={{
          borderTopColor: '#E5E7EB',
          paddingBottom: insets.bottom || 16,
        }}
      >
        <TouchableOpacity
          className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onPress={() => onBookAppointment?.()}
        >
          <Text className="text-base text-white font-semibold">Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
