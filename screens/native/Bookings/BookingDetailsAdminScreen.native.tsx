import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_CONFIG } from '@/api/config';
import { TransparentHeader } from '@/components/native/TransparentHeader';
import { BookingDetails } from './types/BookingDetails';
import { BOOKING_STATUS } from './types/Booking';
import InvoiceScreen from './components/InvoiceScreen.native';
import { generateInvoiceFromBooking } from './utils/invoiceDataGenerator';
import type { InvoiceData } from './types/Invoice';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWppd25sIiwiYSI6ImNtMzhsaHFzNTB0dmsyaXE1enV5aXNrbjcifQ.MKG4wR3aMbdde0oisZLH7g';

const resolveCustomerImageSource = (image: any) => {
    if (!image || image === 'null') return require('../../../assets/user.jpg');
    if (typeof image !== 'string') return image;
    const trimmed = image.trim();
    if (!trimmed) return require('../../../assets/user.jpg');
    if (trimmed.startsWith('http') || trimmed.startsWith('file')) return { uri: trimmed };
    return { uri: `${API_CONFIG.BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` };
};

// Try to load WebView at runtime for mobile (Leaflet in WebView with Mapbox tiles)
let RNWebView: any = null;
try {
    RNWebView = require('react-native-webview');
} catch (e) {
    RNWebView = null;
}

interface BookingDetailsAdminScreenProps {
    bookingDetails: BookingDetails;
    onBack: () => void;
    onNavigateToInvoice?: (invoiceData: InvoiceData, options?: { isVAT?: boolean; vatRate?: number; discounts?: number }) => void;
    onAccept?: () => void;
    onDecline?: () => void;
    onRefund?: () => void;
    onRateCustomer?: () => void;
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

export default function BookingDetailsAdminScreen({
    bookingDetails,
    onBack,
    onNavigateToInvoice,
    onAccept,
    onDecline,
    onRefund,
    onRateCustomer
}: BookingDetailsAdminScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isCompleted = bookingDetails.status === BOOKING_STATUS.COMPLETED;
    const isConfirmed = bookingDetails.status === BOOKING_STATUS.CONFIRMED;
    const isPending = bookingDetails.status === BOOKING_STATUS.PENDING;
    const isCancelled = bookingDetails.status === BOOKING_STATUS.CANCELLED;
    const documentActionLabel = isCompleted || isCancelled ? 'Download Invoice' : 'Download Acknowledgement Receipt';
    const selectedAddOns = bookingDetails.selectedAddOns ?? [];
    const selectedAddOnPrices = bookingDetails.selectedAddOnPrices ?? [];
    const transactionTotal = bookingDetails.price + selectedAddOnPrices.reduce((sum, price) => sum + price, 0);

    const [showInvoice, setShowInvoice] = useState(false);

    const customerImageSource = resolveCustomerImageSource(bookingDetails.customerImage);
    const customerName = bookingDetails.customerName || 'Customer';

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
                {/* Customer Image with Overlay Header */}
                <View className="w-full relative items-center justify-end" style={{ height: 250, backgroundColor: primaryColor }}>
                    <Image
                        source={customerImageSource}
                        className="w-32 h-32 rounded-full mb-8 border-4 border-white"
                        resizeMode="cover"
                    />

                    {/* Transparent Header Overlay */}
                    <TransparentHeader onBack={onBack} title="Booking Details" />
                </View>

                <View className="px-5 py-4">
                    {/* Customer Name */}
                    <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
                        {customerName}
                    </Text>

                    {/* Customer Rating (Mocked as Spa Rating for now, could be its own field later) */}
                    <View className="mb-4 justify-center items-center">
                        <Text className="text-sm mb-1" style={{ color: colors.icon }}>Customer Rating</Text>
                        <StarRating rating={bookingDetails.spaRating} />
                    </View>

                    <View className="mb-4 pt-4 border-t border-gray-100" />

                    {/* Location / Address - Where therapy takes place */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                            Therapy Location
                        </Text>
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="location-outline" size={16} color={colors.icon} />
                            <Text className="text-sm ml-1" style={{ color: colors.icon }}>
                                {bookingDetails.address}
                            </Text>
                        </View>
                        <MapView
                            latitude={bookingDetails.latitude}
                            longitude={bookingDetails.longitude}
                        />
                    </View>

                    <View className="mb-4 pt-4 border-t border-gray-100" />

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

                        {/* Service Total */}
                        <View className="flex-row items-center">
                            <Text className="text-sm font-medium ml-2" style={{ color: colors.icon }}>
                                Service Total: ₱{bookingDetails.price.toFixed(2)}
                            </Text>
                        </View>

                        {selectedAddOns.length > 0 && (
                            <View className="mt-4">
                                <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                                    Selected Add-ons
                                </Text>
                                {selectedAddOns.map((addOn, index) => (
                                    <View key={`${addOn}-${index}`} className="flex-row justify-between py-1">
                                        <Text className="text-sm" style={{ color: colors.icon }}>
                                            {addOn}
                                        </Text>
                                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                                            ₱{(selectedAddOnPrices[index] ?? 0).toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                                <View className="flex-row justify-between items-center pt-3 mt-3 border-t" style={{ borderTopColor: '#E5E7EB' }}>
                                    <Text className="text-base font-bold" style={{ color: colors.text }}>
                                        Transaction Total
                                    </Text>
                                    <Text className="text-2xl font-bold" style={{ color: primaryColor }}>
                                        ₱{transactionTotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {selectedAddOns.length === 0 && (
                            <View className="flex-row justify-between items-center pt-3 mt-3 border-t" style={{ borderTopColor: '#E5E7EB' }}>
                                <Text className="text-base font-bold" style={{ color: colors.text }}>
                                    Transaction Total
                                </Text>
                                <Text className="text-2xl font-bold" style={{ color: primaryColor }}>
                                    ₱{transactionTotal.toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>

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

                        {/* Paid Amount */}
                        <View className="mb-3 flex-row items-center">
                            <Ionicons name="wallet-outline" size={18} color={colors.text} />
                            <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                                {isCompleted ? 'Paid Amount' : 'Paid Downpayment'}: ₱{(isCompleted ? transactionTotal : bookingDetails.paidAmount).toFixed(2)}
                            </Text>
                        </View>

                        {/* Paid at Cashier and Fully Paid Indicator (only for completed bookings) */}
                        {isCompleted && (
                            <>
                                <View className="mb-3 flex-row items-center">
                                    <Ionicons name="cash-outline" size={18} color={colors.text} />
                                    <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                                        Paid at Cashier: ₱{(transactionTotal - bookingDetails.paidAmount).toFixed(2)}
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

                        {/* Download Document Button */}
                        <TouchableOpacity
                            className="w-full flex-row items-center justify-center px-4 py-3 rounded-xl border"
                            style={{ borderColor: primaryColor, backgroundColor: 'white' }}
                            onPress={() => {
                                const invoiceData = generateInvoiceFromBooking(bookingDetails, {
                                    isVAT: false,
                                    vatRate: 0.12,
                                    discounts: 0,
                                    customerName,
                                    customerAddress: bookingDetails.address,
                                    businessName: 'Soothera',
                                    businessAddress: 'Cebu, Philippines',
                                    businessPhone: '+63 32 123 4567',
                                    businessEmail: 'info@soothera.com',
                                    businessTIN: '123-456-789-000',
                                    notes: isCompleted ? 'Full payment received. Thank you for your booking!' : 'This acknowledgement receipt confirms the paid booking amount.',
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
                                {documentActionLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons: Decline/Accept (Pending), Refund (Cancelled) */}
            {(isPending || isCancelled || isCompleted) && (
                <View className="px-5 py-4 border-t" style={{ borderTopColor: '#E5E7EB' }}>
                    {isPending && (
                        <View className="flex-row">
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl mr-2 border"
                                style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                                onPress={onDecline}
                            >
                                <Ionicons name="close" size={20} color={colors.text} />
                                <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                                    Decline
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl"
                                style={{ backgroundColor: primaryColor }}
                                onPress={onAccept}
                            >
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text className="text-base font-semibold ml-2" style={{ color: 'white' }}>
                                    Accept
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {(isCancelled || isCompleted) && (
                        <View className="flex-row">
                            {isCancelled && (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl mr-2"
                                    style={{ backgroundColor: '#EF4444' }}
                                    onPress={onRefund}
                                >
                                    <Ionicons name="cash-outline" size={18} color="white" />
                                    <Text className="text-base text-white font-semibold ml-2">Refund</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center px-4 py-4 rounded-xl"
                                style={{ backgroundColor: primaryColor }}
                                onPress={onRateCustomer}
                            >
                                <Ionicons name="star-outline" size={20} color="white" />
                                <Text className="text-base text-white font-semibold ml-2">Rate Customer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Invoice Screen (local overlay when not using navigator stack) */}
            {showInvoice && !onNavigateToInvoice && (() => {
                const invoiceData = generateInvoiceFromBooking(bookingDetails, {
                    isVAT: false,
                    vatRate: 0.12,
                    discounts: 0,
                    customerName,
                    customerAddress: bookingDetails.address,
                    businessName: 'Soothera',
                    businessAddress: 'Cebu, Philippines',
                    businessPhone: '+63 32 123 4567',
                    businessEmail: 'info@soothera.com',
                    businessTIN: '123-456-789-000',
                    notes: isCompleted ? 'Full payment received. Thank you for your booking!' : 'This acknowledgement receipt confirms the paid booking amount.',
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



