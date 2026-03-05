import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BottomTabs } from '../components/native/BottomTabs';
import { RisingPage } from '../components/native/RisingPage';
import HomeScreen from '../screens/native/Home/HomeScreen.native';
import ServicesScreen from '../screens/native/Home/ServicesScreen.native';
import TopRatedSalonsScreen from '../screens/native/Home/TopRatedSalonsScreen.native';
import SalonDetailsScreen from '../screens/native/Home/SalonDetailsScreen.native';
import BookAppointmentScreen from '../screens/native/Home/BookAppointmentScreen.native';
import PaymentSuccessfulScreen from '../screens/native/Home/PaymentSuccessfulScreen.native';
import PaymentFailedScreen from '../screens/native/Home/PaymentFailedScreen.native';
import NotificationsScreen from '../screens/native/Notifications/NotificationsScreen.native';
import { getSalonDetails, topRatedSalons } from '../screens/native/Home/configs/mockData';
import type { Booking } from '../screens/native/Bookings/types/Booking';
import BookingsScreen from '../screens/native/Bookings/BookingsScreen.native';
import BookingDetailsScreen from '../screens/native/Bookings/BookingDetailsScreen.native';
import RatingSpaScreen from '../screens/native/Bookings/RatingSpaScreen.native';
import RatingTherapistScreen from '../screens/native/Bookings/RatingTherapistScreen.native';
import InvoiceScreen from '../screens/native/Bookings/components/InvoiceScreen.native';
import GetDirectionsScreen from '../screens/native/Bookings/GetDirectionsScreen.native';
import { getBookingDetails } from '../screens/native/Bookings/configs/mockBookingDetailsData';
import type { InvoiceData } from '../screens/native/Bookings/types/Invoice';
import InboxScreen from '../screens/native/Messaging/InboxScreen.native';
import ChatRoomScreen from '../screens/native/Messaging/ChatRoomScreen.native';
import ProfileScreen from '../screens/native/Profile/ProfileScreen.native';
import FavoritesScreen from '../screens/native/Profile/FavoritesScreen.native';
import ProfileEditScreen from '../screens/native/Profile/ProfileEditScreen.native';
import PasswordChangeScreen from '../screens/native/Profile/PasswordChangeScreen.native';
import NotificationPreferencesScreen from '../screens/native/Profile/NotificationPreferencesScreen.native';
import HelpScreen from '../screens/native/Profile/HelpScreen.native';
import FAQsScreen from '../screens/native/Profile/FAQsScreen.native';
import TermsOfServiceScreen from '../screens/native/Profile/TermsOfServiceScreen.native';
import PrivacyPolicyScreen from '../screens/native/Profile/PrivacyPolicyScreen.native';
import type { FaqItem } from '../screens/native/Profile/configs/faqData';
import type { Service } from '../screens/native/Home/types/Home';
import type { SalonDetails, Therapist } from '../screens/native/Home/types/SalonDetails';
import type { Conversation } from '../screens/native/Messaging/InboxScreen.native';
import LoginScreen from '../screens/native/Login/LoginScreen.native';
import RegisterScreen from '../screens/native/Register/RegisterScreen.native';
import { STORAGE_KEYS, UserData, UserRole } from '@/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Support / AI chatbot conversation for Help screen FAB */
const SUPPORT_CHATBOT_CONVERSATION: Conversation = {
  id: '5',
  name: 'Soothera Assistant',
  lastMessage: 'I can help you find the perfect salon or book an appointment. What would you like to do?',
  timestamp: '08:40 AM',
  type: 'chatbot',
  chatbotId: '1',
  avatar: undefined,
  isOnline: true,
};

type TabId = 'home' | 'bookings' | 'messaging' | 'profile';
type ProfileOverlayId = 'edit' | 'password' | 'notifications' | 'help';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSITION_DURATION = 500; // Entry duration (longer)
const EXIT_TRANSITION_DURATION = 300; // Exit duration (unchanged)

export default function NativeNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (storedData) {
          const userData: UserData = JSON.parse(storedData);
          setUserName(userData.name);
          setUserEmail(userData.email);
          setUserRole(userData.role);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    loadSession();
  }, []);

  // Home overlays
  const [homeServicesVisible, setHomeServicesVisible] = useState(false);
  const [homeTopRatedVisible, setHomeTopRatedVisible] = useState(false);
  const [homeTopRatedAutoFilter, setHomeTopRatedAutoFilter] = useState(false);
  const [homeTopRatedAutoFocus, setHomeTopRatedAutoFocus] = useState(false);
  const [homeSelectedSalonId, setHomeSelectedSalonId] = useState<string | null>(null);
  const [homeBookVisible, setHomeBookVisible] = useState(false);
  const [homePaymentSuccess, setHomePaymentSuccess] = useState<BookingData | null>(null);
  const [homePaymentFailed, setHomePaymentFailed] = useState<BookingData | null>(null);
  const [homeNotificationsVisible, setHomeNotificationsVisible] = useState(false);

  const homeServicesTx = useSharedValue(SCREEN_WIDTH);
  const homeTopRatedTx = useSharedValue(SCREEN_WIDTH);
  const homeSalonTx = useSharedValue(SCREEN_WIDTH);
  const homeBookTx = useSharedValue(SCREEN_WIDTH);
  const homeNotificationsTx = useSharedValue(SCREEN_WIDTH);

  // Bookings overlays
  const [bookingSelectedId, setBookingSelectedId] = useState<string | null>(null);
  const [bookingRatingSpaId, setBookingRatingSpaId] = useState<string | null>(null);
  const [bookingRatingTherapistId, setBookingRatingTherapistId] = useState<string | null>(null);
  const [bookingRatingFromReview, setBookingRatingFromReview] = useState(false);
  const [invoiceOverlay, setInvoiceOverlay] = useState<{
    data: InvoiceData;
    isVAT: boolean;
    vatRate: number;
    discounts: number;
  } | null>(null);
  const [getDirectionsDestination, setGetDirectionsDestination] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const bookingsDetailsTx = useSharedValue(SCREEN_WIDTH);
  const bookingsRatingSpaTx = useSharedValue(SCREEN_WIDTH);
  const bookingsRatingTherapistTx = useSharedValue(SCREEN_WIDTH);
  const bookingsInvoiceTx = useSharedValue(SCREEN_WIDTH);
  const getDirectionsTx = useSharedValue(SCREEN_WIDTH);

  // Profile overlays
  const [profileOverlay, setProfileOverlay] = useState<ProfileOverlayId | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [helpLegalScreen, setHelpLegalScreen] = useState<'terms' | 'privacy' | null>(null);
  const [profileFavoritesVisible, setProfileFavoritesVisible] = useState(false);
  const profileOverlayTx = useSharedValue(SCREEN_WIDTH);
  const faqDetailTx = useSharedValue(SCREEN_WIDTH);
  const helpLegalTx = useSharedValue(SCREEN_WIDTH);
  const profileFavoritesTx = useSharedValue(SCREEN_WIDTH);

  // Messaging overlay
  const [chatConversation, setChatConversation] = useState<Conversation | null>(null);
  const chatTx = useSharedValue(SCREEN_WIDTH);

  // Bottom tabs visibility: hide if any overlay is active
  const isOverlayActive = useMemo(
    () =>
      homeServicesVisible ||
      homeTopRatedVisible ||
      !!homeSelectedSalonId ||
      homeBookVisible ||
      !!homePaymentSuccess ||
      !!homePaymentFailed ||
      homeNotificationsVisible ||
      !!bookingSelectedId ||
      !!bookingRatingSpaId ||
      !!bookingRatingTherapistId ||
      !!invoiceOverlay ||
      !!getDirectionsDestination ||
      !!profileOverlay ||
      !!selectedFaq ||
      !!helpLegalScreen ||
      profileFavoritesVisible ||
      !!chatConversation,
    [
      homeServicesVisible,
      homeTopRatedVisible,
      homeSelectedSalonId,
      homeBookVisible,
      homePaymentSuccess,
      homePaymentFailed,
      homeNotificationsVisible,
      bookingSelectedId,
      bookingRatingSpaId,
      bookingRatingTherapistId,
      invoiceOverlay,
      getDirectionsDestination,
      profileOverlay,
      selectedFaq,
      helpLegalScreen,
      profileFavoritesVisible,
      chatConversation,
    ]
  );

  // Home animations
  useEffect(() => {
    if (homeServicesVisible) {
      // Entry: slide in from right (longer duration)
      homeServicesTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      homeServicesTx.value = SCREEN_WIDTH;
    }
  }, [homeServicesVisible, homeServicesTx]);

  useEffect(() => {
    if (homeTopRatedVisible) {
      // Entry: slide in from right (longer duration)
      homeTopRatedTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      homeTopRatedTx.value = SCREEN_WIDTH;
    }
  }, [homeTopRatedVisible, homeTopRatedTx]);

  useEffect(() => {
    if (homeSelectedSalonId) {
      // Entry: slide in from right (longer duration)
      homeSalonTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      homeSalonTx.value = SCREEN_WIDTH;
    }
  }, [homeSelectedSalonId, homeSalonTx]);

  useEffect(() => {
    if (homeBookVisible) {
      // Entry: slide in from right (longer duration)
      homeBookTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      homeBookTx.value = SCREEN_WIDTH;
    }
  }, [homeBookVisible, homeBookTx]);

  useEffect(() => {
    if (homeNotificationsVisible) {
      // Entry: slide in from right (longer duration)
      homeNotificationsTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      homeNotificationsTx.value = SCREEN_WIDTH;
    }
  }, [homeNotificationsVisible, homeNotificationsTx]);

  const homeServicesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeServicesTx.value }],
  }));
  const homeTopRatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeTopRatedTx.value }],
  }));
  const homeSalonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeSalonTx.value }],
  }));
  const homeBookStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeBookTx.value }],
  }));
  const homeNotificationsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: homeNotificationsTx.value }],
  }));

  // Bookings animations
  useEffect(() => {
    bookingsDetailsTx.value = withTiming(bookingSelectedId ? 0 : SCREEN_WIDTH, { duration: TRANSITION_DURATION });
  }, [bookingSelectedId, bookingsDetailsTx]);
  useEffect(() => {
    bookingsRatingSpaTx.value = withTiming(bookingRatingSpaId ? 0 : SCREEN_WIDTH, { duration: TRANSITION_DURATION });
  }, [bookingRatingSpaId, bookingsRatingSpaTx]);
  useEffect(() => {
    bookingsRatingTherapistTx.value = withTiming(
      bookingRatingTherapistId ? 0 : SCREEN_WIDTH,
      { duration: TRANSITION_DURATION }
    );
  }, [bookingRatingTherapistId, bookingsRatingTherapistTx]);

  const bookingsDetailsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookingsDetailsTx.value }],
  }));
  const bookingsRatingSpaStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookingsRatingSpaTx.value }],
  }));
  const bookingsRatingTherapistStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookingsRatingTherapistTx.value }],
  }));
  useEffect(() => {
    bookingsInvoiceTx.value = withTiming(
      invoiceOverlay ? 0 : SCREEN_WIDTH,
      { duration: TRANSITION_DURATION }
    );
  }, [invoiceOverlay, bookingsInvoiceTx]);
  const bookingsInvoiceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bookingsInvoiceTx.value }],
  }));
  useEffect(() => {
    getDirectionsTx.value = withTiming(
      getDirectionsDestination ? 0 : SCREEN_WIDTH,
      { duration: TRANSITION_DURATION }
    );
  }, [getDirectionsDestination, getDirectionsTx]);
  const getDirectionsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: getDirectionsTx.value }],
  }));

  // Profile overlay animation
  useEffect(() => {
    profileOverlayTx.value = withTiming(
      profileOverlay ? 0 : SCREEN_WIDTH,
      { duration: TRANSITION_DURATION }
    );
  }, [profileOverlay, profileOverlayTx]);
  const profileOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileOverlayTx.value }],
  }));

  // Profile favorites animation
  useEffect(() => {
    if (profileFavoritesVisible) {
      profileFavoritesTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      profileFavoritesTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION });
    }
  }, [profileFavoritesVisible, profileFavoritesTx]);
  const profileFavoritesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileFavoritesTx.value }],
  }));

  // FAQ detail animation (slides in from right when opened from Help)
  useEffect(() => {
    if (selectedFaq) {
      faqDetailTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      faqDetailTx.value = SCREEN_WIDTH;
    }
  }, [selectedFaq, faqDetailTx]);
  const faqDetailStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: faqDetailTx.value }],
  }));

  // Help legal screen animation (Terms / Privacy slides in from right when opened from Help)
  useEffect(() => {
    if (helpLegalScreen) {
      helpLegalTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      helpLegalTx.value = SCREEN_WIDTH;
    }
  }, [helpLegalScreen, helpLegalTx]);
  const helpLegalStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: helpLegalTx.value }],
  }));

  // Chat animation
  useEffect(() => {
    if (chatConversation) {
      // Entry: slide in from right (longer duration)
      chatTx.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      // Exit: slide out to right (shorter duration)
      chatTx.value = SCREEN_WIDTH;
    }
  }, [chatConversation, chatTx]);
  const chatStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chatTx.value }],
  }));

  // Home navigation handlers
  const openHomeServices = () => setHomeServicesVisible(true);
  const openHomeTopRated = (options?: { autoOpenFilter?: boolean; autoFocusSearch?: boolean }) => {
    setHomeTopRatedAutoFilter(!!options?.autoOpenFilter);
    setHomeTopRatedAutoFocus(!!options?.autoFocusSearch);
    setHomeTopRatedVisible(true);
  };
  const openHomeSalon = (salonId: string) => setHomeSelectedSalonId(salonId);
  const openHomeBook = (salonId: string) => {
    setHomeSelectedSalonId(salonId);
    setHomeBookVisible(true);
  };
  const openHomeNotifications = () => setHomeNotificationsVisible(true);

  const closeHomeNotifications = () => {
    homeNotificationsTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setHomeNotificationsVisible)(false)
    );
  };

  const closeHomeServices = () => {
    homeServicesTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setHomeServicesVisible)(false)
    );
  };
  const closeHomeTopRated = () => {
    homeTopRatedTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () => {
      runOnJS(setHomeTopRatedVisible)(false);
      runOnJS(setHomeTopRatedAutoFocus)(false);
    });
  };
  const closeHomeSalon = () => {
    homeSalonTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setHomeSelectedSalonId)(null)
    );
  };
  const closeHomeBook = () => {
    homeBookTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setHomeBookVisible)(false)
    );
  };

  const handleHomePaymentSuccess = (data: BookingData) => {
    setHomePaymentSuccess(data);
    setHomeBookVisible(false);
  };
  const handleHomePaymentSuccessBack = () => {
    setHomePaymentSuccess(null);
  };
  const handleHomePaymentSuccessHome = () => {
    // Mirror previous behavior: move to failed screen optionally
    if (homePaymentSuccess) {
      setHomePaymentFailed(homePaymentSuccess);
    }
    setHomePaymentSuccess(null);
  };
  const handleHomePaymentFailedBack = () => {
    setHomePaymentFailed(null);
  };
  const handleHomePaymentFailedTryAgain = () => {
    setHomePaymentFailed(null);
    if (homeSelectedSalonId) {
      setHomeBookVisible(true);
    }
  };

  // Bookings navigation handlers
  const openBookingDetails = (id: string) => setBookingSelectedId(id);
  const openBookingRatingSpa = (id: string, fromReview = false) => {
    setBookingRatingSpaId(id);
    setBookingRatingFromReview(fromReview);
  };
  const openBookingRatingTherapist = (id: string, fromReview = false) => {
    setBookingRatingTherapistId(id);
    setBookingRatingFromReview(fromReview);
  };
  const closeBookingDetails = () => {
    bookingsDetailsTx.value = withTiming(SCREEN_WIDTH, { duration: TRANSITION_DURATION }, () =>
      runOnJS(setBookingSelectedId)(null)
    );
  };
  const closeBookingRatingSpa = () => {
    bookingsRatingSpaTx.value = withTiming(SCREEN_WIDTH, { duration: TRANSITION_DURATION }, () => {
      runOnJS(setBookingRatingSpaId)(null);
      runOnJS(setBookingRatingFromReview)(false);
    });
  };
  const closeBookingRatingTherapist = () => {
    bookingsRatingTherapistTx.value = withTiming(
      SCREEN_WIDTH,
      { duration: TRANSITION_DURATION },
      () => {
        runOnJS(setBookingRatingTherapistId)(null);
        runOnJS(setBookingRatingFromReview)(false);
      }
    );
  };

  const openBookingInvoice = (
    data: InvoiceData,
    options?: { isVAT?: boolean; vatRate?: number; discounts?: number }
  ) => {
    setInvoiceOverlay({
      data,
      isVAT: options?.isVAT ?? false,
      vatRate: options?.vatRate ?? 0.12,
      discounts: options?.discounts ?? 0,
    });
  };
  const closeBookingInvoice = () => {
    bookingsInvoiceTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setInvoiceOverlay)(null)
    );
  };

  const openGetDirections = (destination: { latitude: number; longitude: number }, destinationName?: string) => {
    setGetDirectionsDestination({ ...destination, name: destinationName });
  };
  const closeGetDirections = () => {
    getDirectionsTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setGetDirectionsDestination)(null)
    );
  };

  const openProfileOverlay = (id: ProfileOverlayId) => setProfileOverlay(id);
  const closeProfileOverlay = () => {
    profileOverlayTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setProfileOverlay)(null)
    );
  };

  const closeProfileFavorites = () => {
    profileFavoritesTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setProfileFavoritesVisible)(false)
    );
  };

  const openFaqDetail = (faq: FaqItem) => {
    setSelectedFaq(faq);
  };
  const closeFaqDetail = () => {
    faqDetailTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setSelectedFaq)(null)
    );
  };

  const openTermsOfService = () => setHelpLegalScreen('terms');
  const openPrivacyPolicy = () => setHelpLegalScreen('privacy');
  const closeHelpLegal = () => {
    helpLegalTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setHelpLegalScreen)(null)
    );
  };

  // Messaging handlers
  const openChat = (conversation: Conversation) => setChatConversation(conversation);
  const closeChat = () => {
    chatTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
      runOnJS(setChatConversation)(null)
    );
  };

  // Re-book handler - navigate to BookAppointmentScreen with booking details
  const handleRebook = (booking: Booking) => {
    // Find matching salon by name from top rated salons
    const matchingSalon = topRatedSalons.find((salon) => salon.name === booking.spaName);
    if (!matchingSalon) {
      console.warn('No matching salon found for spa name:', booking.spaName);
      return;
    }

    const salonDetails = getSalonDetails(matchingSalon.id);
    if (!salonDetails) {
      console.warn('No salon details found for salon id:', matchingSalon.id);
      return;
    }

    // Navigate to BookAppointmentScreen with the salon details
    setHomeSelectedSalonId(matchingSalon.id);
    setHomeBookVisible(true);
  };

  // Centralized hardware back handling
  useEffect(() => {
    const onBackPress = () => {
      if (homePaymentFailed) {
        handleHomePaymentFailedBack();
        return true;
      }
      if (homePaymentSuccess) {
        handleHomePaymentSuccessBack();
        return true;
      }
      if (homeNotificationsVisible) {
        closeHomeNotifications();
        return true;
      }
      if (homeBookVisible) {
        closeHomeBook();
        return true;
      }
      if (homeSelectedSalonId) {
        closeHomeSalon();
        return true;
      }
      if (homeTopRatedVisible) {
        closeHomeTopRated();
        return true;
      }
      if (homeServicesVisible) {
        closeHomeServices();
        return true;
      }
      if (bookingRatingTherapistId) {
        closeBookingRatingTherapist();
        return true;
      }
      if (bookingRatingSpaId) {
        closeBookingRatingSpa();
        return true;
      }
      if (invoiceOverlay) {
        closeBookingInvoice();
        return true;
      }
      if (getDirectionsDestination) {
        closeGetDirections();
        return true;
      }
      if (bookingSelectedId) {
        closeBookingDetails();
        return true;
      }
      if (chatConversation) {
        closeChat();
        return true;
      }
      if (selectedFaq) {
        closeFaqDetail();
        return true;
      }
      if (helpLegalScreen) {
        closeHelpLegal();
        return true;
      }
      if (profileOverlay) {
        closeProfileOverlay();
        return true;
      }
      if (profileFavoritesVisible) {
        closeProfileFavorites();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [
    chatConversation,
    homeBookVisible,
    homePaymentFailed,
    homePaymentSuccess,
    homeNotificationsVisible,
    homeSelectedSalonId,
    homeServicesVisible,
    homeTopRatedVisible,
    invoiceOverlay,
    getDirectionsDestination,
    profileOverlay,
    profileFavoritesVisible,
    selectedFaq,
    helpLegalScreen,
    bookingSelectedId,
    bookingRatingSpaId,
    bookingRatingTherapistId,
    closeChat,
    closeFaqDetail,
    closeHelpLegal,
    closeBookingInvoice,
    closeGetDirections,
    closeProfileOverlay,
    closeProfileFavorites,
    closeHomeBook,
    closeHomeNotifications,
    closeHomeSalon,
    closeHomeServices,
    closeHomeTopRated,
    closeBookingDetails,
    closeBookingRatingSpa,
    closeBookingRatingTherapist,
    handleHomePaymentFailedBack,
    handleHomePaymentSuccessBack,
  ]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {isLoadingSession ? (
        <View style={{ flex: 1, backgroundColor: 'white' }} />
      ) : (
        <View style={{ flex: 1, position: 'relative' }}>
          {!isLoggedIn ? (
            <>
              {authScreen === 'login' ? (
                <LoginScreen
                  onLogin={async (role, name, email) => {
                    const userData: UserData = { role, name, email };
                    try {
                      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                    } catch (e) {
                      console.error('Save session error:', e);
                    }
                    setUserRole(role);
                    setUserName(name);
                    setUserEmail(email);
                    setIsLoggedIn(true);
                  }}
                  onNavigateToRegister={() => setAuthScreen('register')}
                  onForgotPassword={() => console.log('Forgot password')}
                />
              ) : (
                <RegisterScreen
                  onRegister={async (name, email) => {
                    const userData: UserData = { role: 'customer', name, email };
                    try {
                      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                    } catch (e) {
                      console.error('Save session error:', e);
                    }
                    setUserRole('customer');
                    setUserName(name);
                    setUserEmail(email);
                    setIsLoggedIn(true);
                  }}
                  onNavigateToLogin={() => setAuthScreen('login')}
                />
              )}
            </>
          ) : (
            <>
              {/* Tab bases */}
              <RisingPage visible={activeTab === 'home'}>
                <HomeScreen
                  useNavigatorOverlays
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateServices={openHomeServices}
                  onNavigateTopRated={(options) => openHomeTopRated(options)}
                  onNavigateSalonDetails={openHomeSalon}
                  onNavigateBookAppointment={openHomeBook}
                  onNavigateNotifications={openHomeNotifications}
                />
              </RisingPage>

              <RisingPage visible={activeTab === 'bookings'} fadeIn={false} fadeOut={false}>
                <BookingsScreen
                  useNavigatorOverlays
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateBookingDetails={openBookingDetails}
                  onNavigateRatingSpa={openBookingRatingSpa}
                  onNavigateRatingTherapist={openBookingRatingTherapist}
                  onNavigateNotifications={openHomeNotifications}
                  onNavigateRebook={handleRebook}
                />
              </RisingPage>

              <RisingPage visible={activeTab === 'messaging'}>
                <InboxScreen
                  useNavigatorOverlays
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateChatRoom={openChat}
                  onNavigateNotifications={openHomeNotifications}
                />
              </RisingPage>

              <RisingPage visible={activeTab === 'profile'} fadeIn={false} fadeOut={false}>
                <ProfileScreen
                  isActive={activeTab === 'profile'}
                  onNavigateToProfileEdit={() => openProfileOverlay('edit')}
                  onNavigateToPasswordChange={() => openProfileOverlay('password')}
                  onNavigateToNotifications={() => openProfileOverlay('notifications')}
                  onNavigateToHelp={() => openProfileOverlay('help')}
                  onNavigateToFavorites={() => setProfileFavoritesVisible(true)}
                  onNavigateToTopRated={() => openHomeTopRated()}
                  onNavigateSalonDetails={openHomeSalon}
                  userName={userName}
                  userEmail={userEmail}
                  userRole={userRole}
                  onLogout={async () => {
                    try {
                      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
                    } catch (e) {
                      console.error('Clear session error:', e);
                    }
                    setIsLoggedIn(false);
                    setUserRole(null);
                    setUserName('');
                    setUserEmail('');
                    setAuthScreen('login');
                    setActiveTab('home');
                  }}
                />
              </RisingPage>
            </>
          )}

          {/* Overlays - Home */}
          {homeServicesVisible && (
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
                homeServicesStyle,
              ]}
            >
              <ServicesScreen
                onBack={closeHomeServices}
                onServicePress={() => {
                  setHomeTopRatedVisible(true);
                  setHomeTopRatedAutoFilter(false);
                  setHomeTopRatedAutoFocus(false);
                }}
              />
            </Animated.View>
          )}

          {homeTopRatedVisible && (
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
                homeTopRatedStyle,
              ]}
            >
              <TopRatedSalonsScreen
                onBack={closeHomeTopRated}
                onSalonPress={openHomeSalon}
                autoOpenFilter={homeTopRatedAutoFilter}
                autoFocusSearch={homeTopRatedAutoFocus}
              />
            </Animated.View>
          )}

          {homeSelectedSalonId && (
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
                homeSalonStyle,
              ]}
            >
              {(() => {
                const salonDetails = getSalonDetails(homeSelectedSalonId);
                if (!salonDetails) return null;
                return (
                  <SalonDetailsScreen
                    salonDetails={salonDetails}
                    onBack={closeHomeSalon}
                    onBookAppointment={() => setHomeBookVisible(true)}
                  />
                );
              })()}
            </Animated.View>
          )}

          {homeBookVisible && homeSelectedSalonId && (
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
                homeBookStyle,
              ]}
            >
              {(() => {
                const salonDetails = getSalonDetails(homeSelectedSalonId);
                if (!salonDetails) return null;
                return (
                  <BookAppointmentScreen
                    salonDetails={salonDetails}
                    onBack={closeHomeBook}
                    onComplete={closeHomeBook}
                    onPaymentSuccess={handleHomePaymentSuccess}
                  />
                );
              })()}
            </Animated.View>
          )}

          {homeNotificationsVisible && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9,
                },
                homeNotificationsStyle,
              ]}
            >
              <NotificationsScreen onBack={closeHomeNotifications} />
            </Animated.View>
          )}

          {homePaymentSuccess && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
              }}
            >
              <PaymentSuccessfulScreen
                bookingData={homePaymentSuccess}
                onBack={handleHomePaymentSuccessBack}
                onHome={handleHomePaymentSuccessHome}
              />
            </View>
          )}

          {homePaymentFailed && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 11,
              }}
            >
              <PaymentFailedScreen
                bookingData={homePaymentFailed}
                onBack={handleHomePaymentFailedBack}
                onTryAgain={handleHomePaymentFailedTryAgain}
              />
            </View>
          )}

          {/* Overlays - Bookings */}
          {bookingSelectedId && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 12,
                },
                bookingsDetailsStyle,
              ]}
            >
              {(() => {
                const details = getBookingDetails(bookingSelectedId);
                if (!details) return null;
                return (
                  <BookingDetailsScreen
                    bookingDetails={details}
                    onBack={closeBookingDetails}
                    onRateSpa={() => openBookingRatingSpa(bookingSelectedId)}
                    onRateTherapist={() => openBookingRatingTherapist(bookingSelectedId)}
                    onNavigateToInvoice={openBookingInvoice}
                    onGetDirections={(destination) => openGetDirections(destination, details.spaName)}
                    onRebook={() => {
                      const bookingDetails = getBookingDetails(bookingSelectedId);
                      if (bookingDetails) {
                        // Find matching salon by name
                        const matchingSalon = topRatedSalons.find((salon) => salon.name === bookingDetails.spaName);
                        if (matchingSalon) {
                          const salonDetails = getSalonDetails(matchingSalon.id);
                          if (salonDetails) {
                            setHomeSelectedSalonId(matchingSalon.id);
                            setHomeBookVisible(true);
                          }
                        }
                      }
                    }}
                    onReschedule={() => { }}
                    onCancel={async () => {
                      // Cancel booking logic - this will be handled by the confirmation modal in BookingDetailsScreen
                      console.log('Cancel booking:', bookingSelectedId);
                    }}
                  />
                );
              })()}
            </Animated.View>
          )}

          {bookingRatingSpaId && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 13,
                },
                bookingsRatingSpaStyle,
              ]}
            >
              {(() => {
                const details = getBookingDetails(bookingRatingSpaId);
                if (!details) return null;
                return (
                  <RatingSpaScreen
                    bookingDetails={details}
                    onBack={closeBookingRatingSpa}
                    onSubmit={async () => { /* API submission handled by screen; navigation on modal OK via onBack */ }}
                  />
                );
              })()}
            </Animated.View>
          )}

          {bookingRatingTherapistId && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 14,
                },
                bookingsRatingTherapistStyle,
              ]}
            >
              {(() => {
                const details = getBookingDetails(bookingRatingTherapistId);
                if (!details) return null;
                return (
                  <RatingTherapistScreen
                    bookingDetails={details}
                    onBack={closeBookingRatingTherapist}
                    onSubmit={async () => { /* API submission handled by screen; navigation on modal OK via onBack */ }}
                  />
                );
              })()}
            </Animated.View>
          )}

          {invoiceOverlay && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 15,
                },
                bookingsInvoiceStyle,
              ]}
            >
              <InvoiceScreen
                invoiceData={invoiceOverlay.data}
                onBack={closeBookingInvoice}
                isVAT={invoiceOverlay.isVAT}
                vatRate={invoiceOverlay.vatRate}
                discounts={invoiceOverlay.discounts}
              />
            </Animated.View>
          )}

          {getDirectionsDestination && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 15,
                },
                getDirectionsStyle,
              ]}
            >
              <GetDirectionsScreen
                destination={getDirectionsDestination}
                destinationName={getDirectionsDestination.name}
                onBack={closeGetDirections}
              />
            </Animated.View>
          )}

          {/* Overlays - Profile */}
          {profileOverlay && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 16,
                },
                profileOverlayStyle,
              ]}
            >
              {profileOverlay === 'edit' && (
                <ProfileEditScreen onBack={closeProfileOverlay} />
              )}
              {profileOverlay === 'password' && (
                <PasswordChangeScreen onBack={closeProfileOverlay} />
              )}
              {profileOverlay === 'notifications' && (
                <NotificationPreferencesScreen onBack={closeProfileOverlay} />
              )}
              {profileOverlay === 'help' && (
                <HelpScreen
                  onBack={closeProfileOverlay}
                  onOpenChatbot={() => openChat(SUPPORT_CHATBOT_CONVERSATION)}
                  onFaqPress={openFaqDetail}
                  onTermsPress={openTermsOfService}
                  onPrivacyPress={openPrivacyPolicy}
                />
              )}
            </Animated.View>
          )}

          {/* Overlays - FAQ Detail (slides in from right on top of Help) */}
          {profileOverlay === 'help' && selectedFaq && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 16,
                },
                faqDetailStyle,
              ]}
            >
              <FAQsScreen faq={selectedFaq} onBack={closeFaqDetail} />
            </Animated.View>
          )}

          {/* Overlays - Profile Favorites */}
          {profileFavoritesVisible && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 16,
                },
                profileFavoritesStyle,
              ]}
            >
              <FavoritesScreen onBack={closeProfileFavorites} onSalonPress={openHomeSalon} />
            </Animated.View>
          )}

          {/* Overlays - Help Legal (Terms / Privacy slides in from right on top of Help) */}
          {profileOverlay === 'help' && helpLegalScreen && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 16,
                },
                helpLegalStyle,
              ]}
            >
              {helpLegalScreen === 'terms' && (
                <TermsOfServiceScreen onBack={closeHelpLegal} />
              )}
              {helpLegalScreen === 'privacy' && (
                <PrivacyPolicyScreen onBack={closeHelpLegal} />
              )}
            </Animated.View>
          )}

          {/* Overlays - Messaging (above profile so chat opens on top of Help, etc.) */}
          {chatConversation && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 17,
                },
                chatStyle,
              ]}
            >
              <ChatRoomScreen conversation={chatConversation as any} onBack={closeChat} />
            </Animated.View>
          )}

          {/* Bottom Tabs */}
          <RisingPage
            visible={isLoggedIn && !isOverlayActive}
            fillContainer={false}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
            exitDuration={isLoggedIn ? 260 : 0}
            fadeOut={isLoggedIn}
          >
            <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
          </RisingPage>
        </View>
      )}
    </SafeAreaView>
  );
}
