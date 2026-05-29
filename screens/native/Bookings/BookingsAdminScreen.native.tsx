import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_CONFIG } from '@/api/config';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { getBookings, updateBooking } from '@/api/endpoints/apiBooking';
import { getUsers } from '@/api/endpoints/apiUser';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import { fetchMyEstablishment } from '@/screens/native/Profile/businessSettingsService';
import type { BookingResponse, UserDto } from '@/api/types';
import type { Booking } from './types/Booking';
import {
  getUpcomingBookings,
  getCompletedBookings,
  getCancelledBookings,
} from './configs/mockBookingsData';
import AdminBookingCard from './components/AdminBookingCard';
import TabNavigation from './components/TabNavigation';
import BookingDetailsAdminScreen from './BookingDetailsAdminScreen.native';
import { mapApiBookingToCard, mapApiBookingToDetails } from './utils/apiBookingMappers';
import { BOOKING_STATUS } from './types/Booking';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PopUpNotification, type PopUpNotificationRef } from '@/components/native/PopUpNotification';

type AdminBookingApiStatus = 'Confirmed' | 'Cancelled';

const ADMIN_BOOKING_API_STATUS_VALUE: Record<AdminBookingApiStatus, number> = {
  Confirmed: 1,
  Cancelled: 4,
};

const BOOKINGS_REFRESH_INTERVAL_MS = 3000;

interface BookingsAdminScreenProps {
  onDetailsScreenChange?: (isActive: boolean) => void;
  onNavigateToProfile?: () => void;
  isActive?: boolean;
  useNavigatorOverlays?: boolean;
  onNavigateBookingDetails?: (bookingId: string) => void;
  onNavigateNotifications?: () => void;
  onNavigateWalkInBooking?: () => void;
  userProfilePic?: string | null;
  latestBookingStatusUpdate?: {
    bookingId: string;
    status: AdminBookingApiStatus;
    sequence: number;
  } | null;
}

export default function BookingsAdminScreen({
  onDetailsScreenChange,
  onNavigateToProfile,
  isActive,
  useNavigatorOverlays = false,
  onNavigateBookingDetails,
  onNavigateNotifications,
  onNavigateWalkInBooking,
  userProfilePic,
  latestBookingStatusUpdate,
}: BookingsAdminScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isVisible = isActive ?? true;
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apiBookingsById, setApiBookingsById] = useState<Record<string, BookingResponse>>({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const isFetchingBookingsRef = useRef(false);
  const notificationRef = useRef<PopUpNotificationRef>(null);
  const prevBookingsStatusesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (Object.keys(prevBookingsStatusesRef.current).length === 0) {
      if (bookings.length > 0) {
        const initial: Record<string, number> = {};
        bookings.forEach((b) => {
          initial[b.id] = b.status;
        });
        prevBookingsStatusesRef.current = initial;
      }
      return;
    }

    bookings.forEach((b) => {
      const prevStatus = prevBookingsStatusesRef.current[b.id];
      
      // Case 1: Brand new booking with status PENDING (0)
      if (prevStatus === undefined && b.status === BOOKING_STATUS.PENDING) {
        notificationRef.current?.show({
          title: 'New Pending Booking',
          message: `New booking request from ${b.customerName || 'Customer'} for ${b.serviceName}`,
          type: 'pending',
        });
      }
      
      // Case 2: Status changed
      if (prevStatus !== undefined && prevStatus !== b.status) {
        if (b.status === BOOKING_STATUS.PENDING) {
          notificationRef.current?.show({
            title: 'Booking Pending',
            message: `Booking with ${b.customerName || 'Customer'} is now pending.`,
            type: 'pending',
          });
        } else if (b.status === BOOKING_STATUS.ONGOING) {
          notificationRef.current?.show({
            title: 'Booking Ongoing',
            message: `Booking with ${b.customerName || 'Customer'} is now ongoing.`,
            type: 'ongoing',
          });
        } else if (b.status === BOOKING_STATUS.COMPLETED) {
          notificationRef.current?.show({
            title: 'Booking Completed',
            message: `Booking with ${b.customerName || 'Customer'} has been completed.`,
            type: 'completed',
          });
        } else if (b.status === BOOKING_STATUS.CANCELLED) {
          notificationRef.current?.show({
            title: 'Booking Cancelled',
            message: `Booking with ${b.customerName || 'Customer'} has been cancelled.`,
            type: 'cancelled',
          });
        }
      }
      prevBookingsStatusesRef.current[b.id] = b.status;
    });
  }, [bookings]);
  const latestBookingStatusUpdateSequence = latestBookingStatusUpdate?.sequence;
  const latestBookingStatusUpdateId = latestBookingStatusUpdate?.bookingId;
  const latestBookingStatusUpdateStatus = latestBookingStatusUpdate?.status;

  const screenWidth = Dimensions.get('window').width;

  // Shared values for horizontal slide transitions
  const bookingDetailsTranslateX = useSharedValue(screenWidth);

  // Tab order for paging (All is first)
  const tabs: Array<'all' | 'upcoming' | 'completed' | 'cancelled'> = [
    'all',
    'upcoming',
    'completed',
    'cancelled',
  ];
  const pageScrollViewRef = useRef<ScrollView>(null);
  const maxAnimatedItems = 6;
  const baseItemDelay = 140;
  const perItemDelay = 140;

  const getCustomerImageSource = useCallback((profilePicture?: string | null) => {
    if (!profilePicture || profilePicture === 'null') return undefined;
    const trimmed = profilePicture.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http') || trimmed.startsWith('file')) {
      return { uri: trimmed };
    }
    return { uri: `${API_CONFIG.BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` };
  }, []);

  const extractUserFromResponse = useCallback((data: unknown): UserDto | undefined => {
    const value = data as any;
    if (Array.isArray(value?.items)) return value.items[0];
    if (Array.isArray(value)) return value[0];
    if (value?.uid || value?.fullName || value?.profilePicture) return value as UserDto;
    return undefined;
  }, []);

  const loadCustomersById = useCallback(
    async (customerIds: string[]): Promise<Record<string, UserDto>> => {
      const uniqueCustomerIds = Array.from(new Set(customerIds.filter(Boolean)));
      const customers = await Promise.all(
        uniqueCustomerIds.map(async (uid) => {
          try {
            const response = await getUsers({ uid, page: 1, pageSize: 1 });
            const user = extractUserFromResponse(response.data);
            return user ? ([uid, user] as const) : null;
          } catch (error) {
            console.warn('[BookingsAdminScreen] Failed to load customer data:', uid, error);
            return null;
          }
        })
      );

      return customers.reduce<Record<string, UserDto>>((acc, entry) => {
        if (entry) acc[entry[0]] = entry[1];
        return acc;
      }, {});
    },
    [extractUserFromResponse]
  );

  const fetchEstablishmentBookings = useCallback(
    async (options?: { showLoading?: boolean }) => {
      if (isFetchingBookingsRef.current) return;

      const shouldShowLoading = options?.showLoading ?? false;
      isFetchingBookingsRef.current = true;
      if (shouldShowLoading) {
        setIsLoadingBookings(true);
      }
      setBookingsError(null);

      try {
        const session = await loadStoredSession();
        if (!session?.uid) {
          setBookings([]);
          setApiBookingsById({});
          setBookingsError('Not authenticated.');
          return;
        }

        let establishmentId = session.establishmentId;
        if (!establishmentId) {
          const establishmentResponse = await fetchMyEstablishment();
          if (!establishmentResponse.success) {
            throw new Error(establishmentResponse.message || 'Failed to load establishment.');
          }
          establishmentId = establishmentResponse.data?.id ?? null;
        }

        if (!establishmentId) {
          setBookings([]);
          setApiBookingsById({});
          setBookingsError('No establishment found for this account.');
          return;
        }

        const response = await getBookings({
          establishmentId,
          page: 1,
          pageSize: 100,
        });

        const items = response.data?.items ?? [];
        const customersById = await loadCustomersById(items.map((item) => item.customerId));
        setBookings(
          items.map((item) => {
            const customer = customersById[item.customerId];
            return {
              ...mapApiBookingToCard(item),
              customerName: customer?.fullName,
              customerImage: getCustomerImageSource(customer?.profilePicture),
            };
          })
        );
        setApiBookingsById(
          items.reduce<Record<string, BookingResponse>>((acc, item) => {
            if (item.bookingId) acc[item.bookingId] = item;
            return acc;
          }, {})
        );
      } catch (error: any) {
        console.warn('[BookingsAdminScreen] Failed to load establishment bookings:', error);
        if (shouldShowLoading || bookings.length === 0) {
          setBookings([]);
          setApiBookingsById({});
        }
        setBookingsError(error?.message ?? 'Failed to load establishment bookings.');
      } finally {
        setIsLoadingBookings(false);
        isFetchingBookingsRef.current = false;
      }
    },
    [bookings.length, getCustomerImageSource, loadCustomersById]
  );

  useEffect(() => {
    if (!isVisible) return;

    fetchEstablishmentBookings({ showLoading: bookings.length === 0 });
    const refreshInterval = setInterval(() => {
      fetchEstablishmentBookings();
    }, BOOKINGS_REFRESH_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchEstablishmentBookings();
      }
    });

    return () => {
      clearInterval(refreshInterval);
      appStateSubscription.remove();
    };
  }, [bookings.length, fetchEstablishmentBookings, isVisible]);

  // Handle page scroll to sync active tab
  const handlePageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    if (pageIndex >= 0 && pageIndex < tabs.length) {
      setActiveTab(tabs[pageIndex]);
    }
  };

  // Handle tab press to scroll to corresponding page
  const handleTabPress = (tab: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
    const tabIndex = tabs.indexOf(tab);
    if (tabIndex >= 0 && pageScrollViewRef.current) {
      pageScrollViewRef.current.scrollTo({
        x: tabIndex * screenWidth,
        animated: true,
      });
    }
    setActiveTab(tab);
  };

  // Helper function to sort bookings by date (most recent first)
  const sortBookingsByDate = (bookings: Booking[]): Booking[] => {
    return [...bookings].sort((a, b) => {
      const parseDate = (dateStr: string): Date => {
        const [month, day, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);

      return dateB.getTime() - dateA.getTime();
    });
  };

  const updateLocalBookingStatus = (bookingId: string, apiStatus: AdminBookingApiStatus) => {
    const localStatus =
      apiStatus === 'Confirmed' ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.CANCELLED;

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: localStatus } : booking
      )
    );
    setApiBookingsById((currentBookingsById) => {
      const existingBooking = currentBookingsById[bookingId];
      if (!existingBooking) return currentBookingsById;
      return {
        ...currentBookingsById,
        [bookingId]: {
          ...existingBooking,
          status: apiStatus,
        },
      };
    });
  };

  useEffect(() => {
    if (!latestBookingStatusUpdateId || !latestBookingStatusUpdateStatus) return;
    updateLocalBookingStatus(latestBookingStatusUpdateId, latestBookingStatusUpdateStatus);
  }, [
    latestBookingStatusUpdateId,
    latestBookingStatusUpdateSequence,
    latestBookingStatusUpdateStatus,
  ]);

  const handleBookingStatusUpdate = async (bookingId: string, status: AdminBookingApiStatus) => {
    if (updatingBookingId) return;

    setUpdatingBookingId(bookingId);
    try {
      const response = await updateBooking(bookingId, {
        status: ADMIN_BOOKING_API_STATUS_VALUE[status],
      });
      if (!response.success) {
        throw new Error(
          response.message || `Failed to ${status === 'Confirmed' ? 'accept' : 'decline'} booking.`
        );
      }
      updateLocalBookingStatus(bookingId, status);
    } catch (error: any) {
      console.warn('[BookingsAdminScreen] Failed to update booking status:', error);
      Alert.alert('Unable to update booking', error?.message ?? 'Please try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Handle booking card press
  const handleBookingPress = (bookingId: string) => {
    if (useNavigatorOverlays) {
      onNavigateBookingDetails?.(bookingId);
      return;
    }
    setSelectedBookingId(bookingId);
  };

  // Handle back from details screen
  const closeBookingDetails = () => {
    if (useNavigatorOverlays) return;
    bookingDetailsTranslateX.value = withTiming(screenWidth, { duration: 300 }, () => {
      runOnJS(setSelectedBookingId)(null);
    });
  };

  // If booking details not found, reset selection
  useEffect(() => {
    if (selectedBookingId) {
      const apiBooking = apiBookingsById[selectedBookingId];
      const bookingDetails = apiBooking ? mapApiBookingToDetails(apiBooking) : null;
      if (!bookingDetails) {
        setSelectedBookingId(null);
      }
    }
  }, [selectedBookingId, apiBookingsById]);

  // Notify parent when details screen is shown/hidden
  useEffect(() => {
    if (useNavigatorOverlays) return;
    onDetailsScreenChange?.(selectedBookingId !== null);
  }, [selectedBookingId, onDetailsScreenChange, useNavigatorOverlays]);

  // Animate overlays when state changes (enter)
  useEffect(() => {
    if (selectedBookingId) {
      bookingDetailsTranslateX.value = withTiming(0, { duration: 300 });
    } else {
      bookingDetailsTranslateX.value = screenWidth;
    }
  }, [selectedBookingId, bookingDetailsTranslateX, screenWidth]);

  // Animated styles
  const bookingDetailsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookingDetailsTranslateX.value }],
  }));

  // Handle ScrollView layout to set initial position immediately
  const handleScrollViewLayout = () => {
    if (pageScrollViewRef.current) {
      const tabIndex = tabs.indexOf(activeTab);
      if (tabIndex >= 0) {
        pageScrollViewRef.current.scrollTo({
          x: tabIndex * screenWidth,
          animated: false,
        });
      }
    }
  };

  // Restore scroll position when returning from details screen
  useLayoutEffect(() => {
    if (selectedBookingId === null && pageScrollViewRef.current) {
      const tabIndex = tabs.indexOf(activeTab);
      if (tabIndex >= 0) {
        pageScrollViewRef.current.scrollTo({
          x: tabIndex * screenWidth,
          animated: false,
        });
      }
    }
  }, [selectedBookingId, activeTab, screenWidth]);

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <RisingItem delay={0}>
        <Header
          onProfilePress={onNavigateToProfile}
          onNotificationPress={onNavigateNotifications}
          profilePic={userProfilePic}
        />
      </RisingItem>

      {/* Tab Navigation */}
      <RisingItem delay={80}>
        <TabNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </RisingItem>

      {/* Bookings List - Horizontal Pager */}
      <ScrollView
        ref={pageScrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePageScroll}
        onLayout={handleScrollViewLayout}
        className="flex-1"
        decelerationRate="fast">
        {tabs.map((tab) => {
          const filteredBookings =
            tab === 'upcoming'
              ? getUpcomingBookings(bookings)
              : tab === 'completed'
                ? getCompletedBookings(bookings)
                : tab === 'cancelled'
                  ? getCancelledBookings(bookings)
                  : bookings;

          const tabBookings = sortBookingsByDate(filteredBookings);

          return (
            <ScrollView
              key={tab}
              className="flex-1 px-5"
              style={{ width: screenWidth }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 70, paddingTop: 12 }}>
              {isLoadingBookings && tab === activeTab ? (
                <View className="items-center justify-center py-20">
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text className="mt-4 text-sm" style={{ color: colors.icon }}>
                    Loading bookings...
                  </Text>
                </View>
              ) : bookingsError && tab === activeTab ? (
                <View className="items-center justify-center px-6 py-20">
                  <Ionicons name="alert-circle-outline" size={64} color={colors.icon} />
                  <Text
                    className="mt-4 text-center text-lg font-semibold"
                    style={{ color: colors.text }}>
                    Unable to load bookings
                  </Text>
                  <Text className="mt-2 text-center text-sm" style={{ color: colors.icon }}>
                    {bookingsError}
                  </Text>
                </View>
              ) : tabBookings.length > 0 ? (
                tabBookings.map((booking, index) => {
                  const shouldAnimate = tab === activeTab && index < maxAnimatedItems;
                  const delay = baseItemDelay + Math.min(index, maxAnimatedItems) * perItemDelay;
                  return (
                    <AdminBookingCard
                      key={booking.id}
                      booking={booking}
                      tabType={tab}
                      onPress={() => handleBookingPress(booking.id)}
                      onAccept={(id) => handleBookingStatusUpdate(id, 'Confirmed')}
                      onDecline={(id) => handleBookingStatusUpdate(id, 'Cancelled')}
                      onViewBooking={(id) => handleBookingPress(id)}
                      onRateCustomer={(id) => console.log('Rate customer:', id)}
                      onRefund={(id) => console.log('Refund booking:', id)}
                      animateContent={shouldAnimate}
                      animationDelay={shouldAnimate ? delay : 0}
                      contentVisible={isVisible && tab === activeTab}
                    />
                  );
                })
              ) : tab === activeTab ? (
                <RisingItem delay={baseItemDelay} visible={isVisible}>
                  <View className="items-center justify-center py-20">
                    <Ionicons name="calendar-outline" size={64} color={colors.icon} />
                    <Text className="mt-4 text-lg font-semibold" style={{ color: colors.text }}>
                      {tab === 'all' ? 'No bookings' : `No ${tab} bookings`}
                    </Text>
                    <Text className="mt-2 text-sm" style={{ color: colors.icon }}>
                      {tab === 'all'
                        ? 'Your bookings will appear here'
                        : `Your ${tab} bookings will appear here`}
                    </Text>
                  </View>
                </RisingItem>
              ) : (
                <View className="items-center justify-center py-20">
                  <Ionicons name="calendar-outline" size={64} color={colors.icon} />
                  <Text className="mt-4 text-lg font-semibold" style={{ color: colors.text }}>
                    {tab === 'all' ? 'No bookings' : `No ${tab} bookings`}
                  </Text>
                  <Text className="mt-2 text-sm" style={{ color: colors.icon }}>
                    {tab === 'all'
                      ? 'Your bookings will appear here'
                      : `Your ${tab} bookings will appear here`}
                  </Text>
                </View>
              )}
            </ScrollView>
          );
        })}
      </ScrollView>

      {/* Floating Action Button for Walk-in */}
      <TouchableOpacity
        className="elevation-5 absolute h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: colors.primary,
          right: 20,
          bottom: insets.bottom + 80, // Position above the bottom tab bar
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={() => {
          if (useNavigatorOverlays) {
            onNavigateWalkInBooking?.();
          } else {
            console.log('Navigate to Walk-in Booking Screen fallback');
          }
        }}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Booking Details Screen Overlay */}
      {!useNavigatorOverlays && selectedBookingId && (
        <Animated.View
          className="absolute bottom-0 left-0 right-0 top-0 bg-white"
          style={[
            {
              zIndex: 5,
            },
            bookingDetailsAnimatedStyle,
          ]}>
          {apiBookingsById[selectedBookingId] && (
            <BookingDetailsAdminScreen
              bookingDetails={{
                ...mapApiBookingToDetails(apiBookingsById[selectedBookingId]),
                customerName: bookings.find((booking) => booking.id === selectedBookingId)
                  ?.customerName,
                customerImage: bookings.find((booking) => booking.id === selectedBookingId)
                  ?.customerImage,
              }}
              onBack={closeBookingDetails}
              onAccept={() => handleBookingStatusUpdate(selectedBookingId, 'Confirmed')}
              onDecline={() => handleBookingStatusUpdate(selectedBookingId, 'Cancelled')}
              onRefund={() => console.log('Refund via details')}
            />
          )}
        </Animated.View>
      )}
      <PopUpNotification ref={notificationRef} />
    </View>
  );
}
