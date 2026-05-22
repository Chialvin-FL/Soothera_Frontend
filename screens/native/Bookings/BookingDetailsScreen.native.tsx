import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Dimensions, BackHandler, Platform, Linking } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransparentHeader } from '@/components/native/TransparentHeader';
import { BookingDetails } from './types/BookingDetails';
import { BOOKING_STATUS } from './types/Booking';
import RescheduleModal from './components/RescheduleModal';
import { useConfirmation } from '@/components/native/ConfirmationModalContext';
import InvoiceScreen from './components/InvoiceScreen.native';
import { generateInvoiceFromBooking } from './utils/invoiceDataGenerator';
import type { InvoiceData } from './types/Invoice';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWppd25sIiwiYSI6ImNtMzhsaHFzNTB0dmsyaXE1enV5aXNrbjcifQ.MKG4wR3aMbdde0oisZLH7g';

// Try to load WebView at runtime for mobile (Leaflet in WebView with Mapbox tiles)
let RNWebView: any = null;
try {
  RNWebView = require('react-native-webview');
} catch (e) {
  RNWebView = null;
}

interface BookingDetailsScreenProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  onRateSpa?: () => void;
  onRateTherapist?: () => void;
  onNavigateToInvoice?: (invoiceData: InvoiceData, options?: { isVAT?: boolean; vatRate?: number; discounts?: number }) => void;
  onGetDirections?: (destination: { latitude: number; longitude: number }, destinationName?: string) => void;
  onRebook?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

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

export default function BookingDetailsScreen({
  bookingDetails,
  onBack,
  onRateSpa,
  onRateTherapist,
  onNavigateToInvoice,
  onGetDirections,
  onRebook,
  onReschedule,
  onCancel,
}: BookingDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isCompleted = bookingDetails.status === BOOKING_STATUS.COMPLETED;
  const isConfirmed = bookingDetails.status === BOOKING_STATUS.CONFIRMED;
  const isPending = bookingDetails.status === BOOKING_STATUS.PENDING;
  const isCancelled = bookingDetails.status === BOOKING_STATUS.CANCELLED;
  const insets = useSafeAreaInsets();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { showConfirmation } = useConfirmation();

  // Handle Get Directions
  const handleGetDirections = () => {
    const { latitude, longitude } = bookingDetails;
    const validLat = isNaN(latitude) ? 10.643284 : latitude;
    const validLng = isNaN(longitude) ? 124.477158 : longitude;

    onGetDirections?.({ latitude: validLat, longitude: validLng }, bookingDetails.spaName);
  };

  // Parse booking date and time for initial values
  const getInitialDate = (): Date | undefined => {
    // Parse date from MM/DD/YYYY format
    const [month, day, year] = bookingDetails.date.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const getInitialTime = (): Date | undefined => {
    // Parse time from "10:00 AM - 11:00 AM" format (take the start time)
    const timeMatch = bookingDetails.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return undefined;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const date = getInitialDate() || new Date();
    const time = new Date(date);
    time.setHours(hours, minutes, 0, 0);
    return time;
  };

  // Handle reschedule
  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  // Handle reschedule confirm
  const handleRescheduleConfirm = (date: Date, time: Date) => {
    // TODO: Implement reschedule API call
    console.log('Reschedule booking:', bookingDetails.id, 'to', date, time);
    setShowRescheduleModal(false);
    // Call the parent callback if provided
    onReschedule?.();
  };

  // Handle reschedule cancel
  const handleRescheduleCancel = () => {
    setShowRescheduleModal(false);
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Prevent default behavior (quitting the app)
    });

    return () => backHandler.remove();
  }, [onBack]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Spa Image with Overlay Header */}
        <View className="w-full relative" style={{ height: 250 }}>
          <Image
            source={bookingDetails.spaImage}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Transparent Header Overlay */}
          <TransparentHeader onBack={onBack} title="Booking Details" />

          {/* Floating Heart Button */}
          <TouchableOpacity
            className="absolute bottom-0 right-5 items-center justify-center rounded-full"
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
              console.log('Toggle favorite:', bookingDetails.id, !isFavorited);
            }}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={24}
              color={primaryColor}
            />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-4">
          {/* Spa Name */}
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            {bookingDetails.spaName}
          </Text>

          {/* Address */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={16} color={colors.icon} />
            <Text className="text-sm ml-1" style={{ color: colors.icon }}>
              {bookingDetails.address}
            </Text>
          </View>

          {/* Spa Rating */}
          <View className="mb-4">
            <StarRating rating={bookingDetails.spaRating} />
          </View>

          {/* Map */}
          <View className="mb-4">
            <MapView
              latitude={bookingDetails.latitude}
              longitude={bookingDetails.longitude}
            />
          </View>

          {/* Get Directions Button (only for pending bookings - status 1) */}
          {isPending && (
            <View className="mb-6">
              <TouchableOpacity
                className="w-full flex-row items-center justify-center px-4 py-3 rounded-xl border"
                style={{ borderColor: primaryColor, backgroundColor: 'white' }}
                onPress={handleGetDirections}
              >
                <Ionicons name="navigate-outline" size={18} color={primaryColor} />
                <Text className="text-sm font-semibold ml-2" style={{ color: primaryColor }}>
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Spa Details */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              Spa Details
            </Text>
            <Text className="text-sm leading-5" style={{ color: colors.icon }}>
              {bookingDetails.spaDetails}
            </Text>
          </View>

          {/* Service Information Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Service Information
            </Text>

            {/* Service Name */}
            <View className="mb-3 flex-row items-center">
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                {bookingDetails.serviceName}
              </Text>
            </View>

            {/* Therapist Name */}
            <View className="mb-3 flex-row items-start">
              <Ionicons name="person-outline" size={18} color={colors.primary} style={{ marginTop: 2 }} />
              <View className="ml-2 flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {bookingDetails.therapistName}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.icon }}>
                  {bookingDetails.therapistTitle}
                </Text>
              </View>
            </View>

            {/* Date and Time */}
            <View className="mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                  {bookingDetails.date}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                  {bookingDetails.time}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold ml-2" style={{ color: primaryColor }}>
                {bookingDetails.priceDisplay ?? `₱${bookingDetails.price.toFixed(2)}`}
              </Text>
            </View>
          </View>

          {/* Rate Buttons (only for completed bookings - status 2) */}
          {isCompleted ? (
            <View className="mb-6">
              <View className="flex-row mb-2">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center px-4 py-3 rounded-xl mr-2 border"
                  style={{ borderColor: primaryColor, backgroundColor: 'white' }}
                  onPress={onRateSpa}
                >
                  <Ionicons name="star-outline" size={18} color={primaryColor} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: primaryColor }}>
                    Rate Spa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center px-4 py-3 rounded-xl border"
                  style={{ borderColor: primaryColor, backgroundColor: 'white' }}
                  onPress={onRateTherapist}
                >
                  <Ionicons name="person-outline" size={18} color={primaryColor} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: primaryColor }}>
                    Rate Therapist
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Booking Information Section */}
          <View className="mb-6 pt-4 border-t" style={{ borderTopColor: '#E5E7EB' }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Booking Information
            </Text>

            {/* Booking ID */}
            <View className="mb-3 flex-row items-center">
              <Ionicons name="receipt-outline" size={18} color={colors.text} />
              <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                {bookingDetails.bookingId}
              </Text>
            </View>

            {/* Paid Downpayment */}
            <View className="mb-3 flex-row items-center">
              <Ionicons name="wallet-outline" size={18} color={colors.text} />
              <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                Paid Downpayment: {bookingDetails.paidAmountDisplay ?? `₱${bookingDetails.paidAmount.toFixed(2)}`}
              </Text>
            </View>

            {/* Paid at Cashier and Fully Paid Indicator (only for completed bookings) */}
            {isCompleted && (
              <>
                <View className="mb-3 flex-row items-center">
                  <Ionicons name="cash-outline" size={18} color={colors.text} />
                  <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                    Paid at Cashier: {bookingDetails.priceDisplay || bookingDetails.paidAmountDisplay ? 'N/A' : `₱${(bookingDetails.price - bookingDetails.paidAmount).toFixed(2)}`}
                  </Text>
                </View>
                <View className="mb-4 flex-row items-center">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="white" />
                      <Text className="text-sm font-semibold ml-1" style={{ color: 'white' }}>
                        Fully Paid
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Non-refundable Badge (only for cancelled bookings) */}
            {isCancelled && (
              <View className="mb-4 flex-row items-center">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={16} color="white" />
                    <Text className="text-sm font-semibold ml-1" style={{ color: 'white' }}>
                      Non-refundable
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Download Invoice Button */}
            <TouchableOpacity
              className="w-full flex-row items-center justify-center px-4 py-3 rounded-xl border"
              style={{ borderColor: primaryColor, backgroundColor: 'white' }}
              onPress={() => {
                const invoiceData = generateInvoiceFromBooking(bookingDetails, {
                  isVAT: false,
                  vatRate: 0.12,
                  discounts: 0,
                  customerName: 'Customer Name',
                  customerAddress: bookingDetails.address,
                  businessName: 'Soothera',
                  businessAddress: 'Cebu, Philippines',
                  businessPhone: '+63 32 123 4567',
                  businessEmail: 'info@soothera.com',
                  businessTIN: '123-456-789-000',
                  notes: 'Thank you for your booking!',
                });
                if (onNavigateToInvoice) {
                  onNavigateToInvoice(invoiceData, { isVAT: false, vatRate: 0.12, discounts: 0 });
                } else {
                  setShowInvoice(true);
                }
              }}
            >
              <Ionicons name="download-outline" size={18} color={primaryColor} />
              <Text className="text-sm font-semibold ml-2" style={{ color: primaryColor }}>
                Download Invoice
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons: Get Directions (for confirmed), Re-schedule/Cancel (for pending), or Rebook (for completed) */}
      <View className="px-5 py-4 border-t" style={{ borderTopColor: '#E5E7EB' }}>
        {isConfirmed ? (
          <TouchableOpacity
            className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate-outline" size={20} color="white" />
            <Text className="text-base text-white font-semibold ml-2">Get Directions</Text>
          </TouchableOpacity>
        ) : isPending ? (
          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl mr-2 border"
              style={{ borderColor: primaryColor, backgroundColor: 'white' }}
              onPress={handleReschedule}
            >
              <Ionicons name="calendar-outline" size={20} color={primaryColor} />
              <Text className="text-base font-semibold ml-2" style={{ color: primaryColor }}>
                Re-schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl border"
              style={{ borderColor: '#EF4444', backgroundColor: 'white' }}
              onPress={async () => {
                const confirmed = await showConfirmation({
                  title: 'Cancel Booking',
                  message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
                  confirmText: 'Cancel Booking',
                  cancelText: 'Keep Booking',
                  icon: 'warning-outline',
                  iconColor: '#EF4444',
                  confirmButtonColor: '#EF4444',
                });
                if (confirmed) {
                  onCancel?.();
                }
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text className="text-base font-semibold ml-2" style={{ color: '#EF4444' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={onRebook}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-base text-white font-semibold ml-2">Rebook</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reschedule Modal */}
      <RescheduleModal
        visible={showRescheduleModal}
        initialDate={getInitialDate()}
        initialTime={getInitialTime()}
        onConfirm={handleRescheduleConfirm}
        onCancel={handleRescheduleCancel}
      />

      {/* Invoice Screen (local overlay when not using navigator stack) */}
      {showInvoice && !onNavigateToInvoice && (() => {
        const invoiceData = generateInvoiceFromBooking(bookingDetails, {
          isVAT: false,
          vatRate: 0.12,
          discounts: 0,
          customerName: 'Customer Name',
          customerAddress: bookingDetails.address,
          businessName: 'Soothera',
          businessAddress: 'Cebu, Philippines',
          businessPhone: '+63 32 123 4567',
          businessEmail: 'info@soothera.com',
          businessTIN: '123-456-789-000',
          notes: 'Thank you for your booking!',
        });

        return (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
            <InvoiceScreen
              invoiceData={invoiceData}
              onBack={() => setShowInvoice(false)}
              isVAT={false}
              vatRate={0.12}
              discounts={0}
            />
          </View>
        );
      })()}
    </View>
  );
}
