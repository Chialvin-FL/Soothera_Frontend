import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { SearchBar } from './components/Home/SearchBar';
import { SpecialDeals } from './components/Home/SpecialDeals';
import { Services } from './components/Home/Services';
import { TopRatedMassageSpas } from './components/Home/TopRatedSalons';
import ServicesScreen from './ServicesScreen.native';
import TopRatedMassageSpasScreen from './TopRatedSalonsScreen.native';
import MassageSpaDetailsScreen from './SalonDetailsScreen.native';
import BookAppointmentScreen from './BookAppointmentScreen.native';
import PaymentSuccessfulScreen from './PaymentSuccessfulScreen.native';
import PaymentFailedScreen from './PaymentFailedScreen.native';
import NotificationsScreen from '../Notifications/NotificationsScreen.native';
import { getSalonDetails } from './configs/mockData';
import { Service } from './types/Home';
import { SalonDetails, Therapist } from './types/SalonDetails';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface BookingData {
  service: Service | null;
  duration: string;
  addOns: Array<{ id: string; name: string; price: number }>;
  therapist: Therapist | null;
  date: Date;
  time: Date;
  instructions: string;
  promoCode: string;
  salonDetails: SalonDetails;
  totalPrice: number;
}

interface HomeScreenProps {
  // Legacy change notifications (for backward compatibility)
  onServicesScreenChange?: (isActive: boolean) => void;
  onTopRatedSalonsScreenChange?: (isActive: boolean) => void;
  onMassageSpaDetailsScreenChange?: (isActive: boolean) => void;
  onBookAppointmentScreenChange?: (isActive: boolean) => void;
  onNotificationsScreenChange?: (isActive: boolean) => void;
  onNavigateToProfile?: () => void;

  // Navigator-managed overlay mode
  useNavigatorOverlays?: boolean;
  onNavigateServices?: () => void;
  onNavigateTopRated?: (options?: { autoOpenFilter?: boolean; autoFocusSearch?: boolean }) => void;
  onNavigateMassageSpaDetails?: (salonId: string) => void;
  onNavigateBookAppointment?: (salonId: string) => void;
  onNavigateNotifications?: () => void;
  userProfilePic?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSITION_DURATION = 300;

export default function HomeScreen({
  onServicesScreenChange,
  onTopRatedSalonsScreenChange,
  onMassageSpaDetailsScreenChange,
  onBookAppointmentScreenChange,
  onNotificationsScreenChange,
  onNavigateToProfile,
  useNavigatorOverlays = false,
  onNavigateServices,
  onNavigateTopRated,
  onNavigateMassageSpaDetails,
  onNavigateBookAppointment,
  onNavigateNotifications,
  userProfilePic,
}: HomeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const [showServicesScreen, setShowServicesScreen] = useState(false);
  const [showTopRatedSalonsScreen, setShowTopRatedSalonsScreen] = useState(false);
  const [topRatedReturnToServices, setTopRatedReturnToServices] = useState(false);
  const [autoOpenFilterModal, setAutoOpenFilterModal] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [showBookAppointmentScreen, setShowBookAppointmentScreen] = useState(false);
  const [showPaymentSuccessfulScreen, setShowPaymentSuccessfulScreen] = useState(false);
  const [showPaymentFailedScreen, setShowPaymentFailedScreen] = useState(false);
  const [showNotificationsScreen, setShowNotificationsScreen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // Shared values for horizontal slide transitions
  const servicesTranslateX = useSharedValue(SCREEN_WIDTH);
  const topRatedTranslateX = useSharedValue(SCREEN_WIDTH);
  const salonDetailsTranslateX = useSharedValue(SCREEN_WIDTH);
  const bookAppointmentTranslateX = useSharedValue(SCREEN_WIDTH);

  // Notify parent when services screen state changes
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onServicesScreenChange?.(showServicesScreen);
  }, [showServicesScreen, onServicesScreenChange, useNavigatorOverlays]);

  // Notify parent when top rated salons screen state changes
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onTopRatedSalonsScreenChange?.(showTopRatedSalonsScreen);
  }, [showTopRatedSalonsScreen, onTopRatedSalonsScreenChange, useNavigatorOverlays]);

  // Notify parent when salon details screen state changes
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onMassageSpaDetailsScreenChange?.(selectedSalonId !== null);
  }, [selectedSalonId, onMassageSpaDetailsScreenChange, useNavigatorOverlays]);

  // Notify parent when book appointment screen state changes
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onBookAppointmentScreenChange?.(showBookAppointmentScreen);
  }, [showBookAppointmentScreen, onBookAppointmentScreenChange, useNavigatorOverlays]);

  // Notify parent when notifications screen state changes
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onNotificationsScreenChange?.(showNotificationsScreen);
  }, [showNotificationsScreen, onNotificationsScreenChange, useNavigatorOverlays]);

  // Animate overlay screens when state changes (enter)
  useEffect(() => {
    if (showServicesScreen) {
      servicesTranslateX.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      servicesTranslateX.value = SCREEN_WIDTH;
    }
  }, [showServicesScreen, servicesTranslateX]);

  useEffect(() => {
    if (showTopRatedSalonsScreen) {
      topRatedTranslateX.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      topRatedTranslateX.value = SCREEN_WIDTH;
    }
  }, [showTopRatedSalonsScreen, topRatedTranslateX]);

  useEffect(() => {
    if (selectedSalonId) {
      salonDetailsTranslateX.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      salonDetailsTranslateX.value = SCREEN_WIDTH;
    }
  }, [selectedSalonId, salonDetailsTranslateX]);

  useEffect(() => {
    if (showBookAppointmentScreen) {
      bookAppointmentTranslateX.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      bookAppointmentTranslateX.value = SCREEN_WIDTH;
    }
  }, [showBookAppointmentScreen, bookAppointmentTranslateX]);

  // Animated styles for overlays
  const servicesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: servicesTranslateX.value }],
  }));

  const topRatedAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: topRatedTranslateX.value }],
  }));

  const salonDetailsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: salonDetailsTranslateX.value }],
  }));

  const bookAppointmentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookAppointmentTranslateX.value }],
  }));

  // Handle salon press
  const handleSalonPress = (salonId: string) => {
    if (useNavigatorOverlays) {
      onNavigateMassageSpaDetails?.(salonId);
      return;
    }
    setSelectedSalonId(salonId);
  };

  // Handle back from salon details
  const handleBackFromSalonDetails = () => {
    if (useNavigatorOverlays) return;
    salonDetailsTranslateX.value = withTiming(
      SCREEN_WIDTH,
      { duration: TRANSITION_DURATION },
      () => {
        runOnJS(setSelectedSalonId)(null);
      }
    );
  };

  // Handle back from book appointment
  const handleBackFromBookAppointment = () => {
    if (useNavigatorOverlays) return;
    bookAppointmentTranslateX.value = withTiming(
      SCREEN_WIDTH,
      { duration: TRANSITION_DURATION },
      () => {
        runOnJS(setShowBookAppointmentScreen)(false);
      }
    );
  };

  // Handle book appointment completion
  const handleBookAppointmentComplete = () => {
    if (useNavigatorOverlays) return;
    bookAppointmentTranslateX.value = withTiming(
      SCREEN_WIDTH,
      { duration: TRANSITION_DURATION },
      () => {
        runOnJS(setShowBookAppointmentScreen)(false);
      }
    );
    // TODO: Navigate to bookings screen or show success message
    console.log('Booking completed');
  };

  // Handle payment success
  const handlePaymentSuccess = (data: BookingData) => {
    setBookingData(data);
    setShowBookAppointmentScreen(false);
    setShowPaymentSuccessfulScreen(true);
  };

  // Handle back from payment successful screen
  const handleBackFromPaymentSuccessful = () => {
    setShowPaymentSuccessfulScreen(false);
    setBookingData(null);
  };

  // Handle home from payment successful screen - temporarily navigate to payment failed screen
  const handleHomeFromPaymentSuccessful = () => {
    setShowPaymentSuccessfulScreen(false);
    setShowPaymentFailedScreen(true);
    // Keep bookingData for the failed screen
  };

  // Handle back from payment failed screen
  const handleBackFromPaymentFailed = () => {
    setShowPaymentFailedScreen(false);
    setBookingData(null);
  };

  // Handle try again from payment failed screen
  const handleTryAgainFromPaymentFailed = () => {
    setShowPaymentFailedScreen(false);
    // Navigate back to booking screen
    if (selectedSalonId) {
      setShowBookAppointmentScreen(true);
    }
  };

  // Handle back from notifications screen
  const handleBackFromNotifications = () => {
    setShowNotificationsScreen(false);
  };

  // If payment failed screen is active, show payment failed screen (only when not navigator-managed)
  if (!useNavigatorOverlays && showPaymentFailedScreen && bookingData) {
    return (
      <PaymentFailedScreen
        bookingData={bookingData}
        onBack={handleBackFromPaymentFailed}
        onTryAgain={handleTryAgainFromPaymentFailed}
      />
    );
  }

  // If payment successful screen is active, show payment successful screen (only when not navigator-managed)
  if (!useNavigatorOverlays && showPaymentSuccessfulScreen && bookingData) {
    return (
      <PaymentSuccessfulScreen
        bookingData={bookingData}
        onBack={handleBackFromPaymentSuccessful}
        onHome={handleHomeFromPaymentSuccessful}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
      >
        {/* Header Section */}
        <RisingItem delay={0}>
          <Header
            profilePic={userProfilePic}
            onProfilePress={onNavigateToProfile}
            onNotificationPress={() => {
              if (useNavigatorOverlays) {
                onNavigateNotifications?.();
              } else {
                setShowNotificationsScreen(true);
              }
            }}
          />
        </RisingItem>

        {/* Search Bar and Filter */}
        <RisingItem delay={160}>
          <SearchBar
            onPress={() => {
              if (useNavigatorOverlays) {
                onNavigateTopRated?.({ autoOpenFilter: false, autoFocusSearch: true });
              } else {
                setShowTopRatedSalonsScreen(true);
              }
            }}
            onFilterPress={() => {
              if (useNavigatorOverlays) {
                onNavigateTopRated?.({ autoOpenFilter: true, autoFocusSearch: true });
              } else {
                setAutoOpenFilterModal(true);
                setShowTopRatedSalonsScreen(true);
              }
            }}
          />
        </RisingItem>

        {/* Special Deals Section */}
        <RisingItem delay={280}>
          <SpecialDeals />
        </RisingItem>

        {/* Services Section */}
        <RisingItem delay={400}>
          <Services
            onSeeAll={() => {
              if (useNavigatorOverlays) {
                onNavigateServices?.();
              } else {
                setShowServicesScreen(true);
              }
            }}
            onServicePress={() => {
              if (useNavigatorOverlays) {
                onNavigateTopRated?.({ autoOpenFilter: false });
              } else {
                setAutoOpenFilterModal(false);
                setShowTopRatedSalonsScreen(true);
              }
            }}
          />
        </RisingItem>

        {/* Top Rated Massage Spas Section */}
        <RisingItem delay={520}>
          <TopRatedMassageSpas
            showSeeAllInHeader
            onSeeAll={() => {
              if (useNavigatorOverlays) {
                onNavigateTopRated?.({ autoOpenFilter: false });
              } else {
                setShowTopRatedSalonsScreen(true);
              }
            }}
            onSalonPress={handleSalonPress}
          />
        </RisingItem>
      </ScrollView>

      {/* Overlay stack with horizontal "next page" transitions (disabled when navigator manages overlays) */}
      {!useNavigatorOverlays && (
        <>
          {/* Services Screen */}
          {showServicesScreen && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 5,
                },
                servicesAnimatedStyle,
              ]}
            >
              <ServicesScreen
                onBack={() => {
                  servicesTranslateX.value = withTiming(
                    SCREEN_WIDTH,
                    { duration: TRANSITION_DURATION },
                    () => {
                      runOnJS(setShowServicesScreen)(false);
                    }
                  );
                }}
                onServicePress={() => {
                  // IMPORTANT: don't close Services first, otherwise Home flashes.
                  // Instead: keep Services mounted underneath and slide TopRated in on top.
                  setTopRatedReturnToServices(true);
                  setAutoOpenFilterModal(false);
                  setShowTopRatedSalonsScreen(true);
                }}
              />
            </Animated.View>
          )}

          {/* Top Rated Salons Screen */}
          {showTopRatedSalonsScreen && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 6,
                },
                topRatedAnimatedStyle,
              ]}
            >
              <TopRatedMassageSpasScreen
                onBack={() => {
                  topRatedTranslateX.value = withTiming(
                    SCREEN_WIDTH,
                    { duration: TRANSITION_DURATION },
                    () => {
                      runOnJS(setShowTopRatedSalonsScreen)(false);
                      runOnJS(setAutoOpenFilterModal)(false);
                      runOnJS(setTopRatedReturnToServices)(false);
                    }
                  );
                }}
                onSalonPress={handleSalonPress}
                autoOpenFilter={autoOpenFilterModal}
              />
            </Animated.View>
          )}

          {/* Salon Details Screen */}
          {selectedSalonId && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 7,
                },
                salonDetailsAnimatedStyle,
              ]}
            >
              {(() => {
                const salonDetails = getSalonDetails(selectedSalonId);
                if (!salonDetails) return null;
                return (
                  <MassageSpaDetailsScreen
                    salonDetails={salonDetails}
                    onBack={handleBackFromSalonDetails}
                    onBookAppointment={() => {
                      setShowBookAppointmentScreen(true);
                    }}
                  />
                );
              })()}
            </Animated.View>
          )}

          {/* Book Appointment Screen */}
          {showBookAppointmentScreen && selectedSalonId && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 8,
                },
                bookAppointmentAnimatedStyle,
              ]}
            >
              {(() => {
                const salonDetails = getSalonDetails(selectedSalonId);
                if (!salonDetails) return null;
                return (
                  <BookAppointmentScreen
                    salonDetails={salonDetails}
                    onBack={handleBackFromBookAppointment}
                    onComplete={handleBookAppointmentComplete}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                );
              })()}
            </Animated.View>
          )}

          {/* Notifications Screen (no horizontal animation required) */}
          {showNotificationsScreen && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9,
              }}
            >
              <NotificationsScreen onBack={handleBackFromNotifications} />
            </View>
          )}
        </>
      )}
    </View>
  );
}
