import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '../components/native/BottomTabs';
import { RisingPage } from '../components/native/RisingPage';

// Screens — tab bases
import HomeScreen from '../screens/native/Home/HomeScreen.native';
import HomeScreenAdmin from '../screens/native/Home/HomeAdminScreen.native';
import HomeTherapistScreen from '../screens/native/Home/HomeTherapistScreen.native';
import BookingsScreen from '../screens/native/Bookings/BookingsScreen.native';
import BookingsAdminScreen from '../screens/native/Bookings/BookingsAdminScreen.native';
import BookingsTherapistScreen from '../screens/native/Bookings/BookingsTherapistScreen.native';
import InboxScreen from '../screens/native/Messaging/InboxScreen.native';
import ProfileScreen from '../screens/native/Profile/ProfileScreen.native';

// Stacks
import { AuthStack } from './stacks/AuthStack';
import { HomeStack } from './stacks/HomeStack';
import { BookingsStack } from './stacks/BookingsStack';
import { ProfileStack } from './stacks/ProfileStack';
import { MessagingStack } from './stacks/MessagingStack';

// Hooks
import { useSessionLoader } from './hooks/useSessionLoader';
import { useHomeStack } from './hooks/useHomeStack';
import { useBookingsStack } from './hooks/useBookingsStack';
import { useProfileStack } from './hooks/useProfileStack';
import { useMessagingStack } from './hooks/useMessagingStack';
import { useOverlayActive } from './hooks/useOverlayActive';
import { useBackHandler } from './hooks/useBackHandler';

// Types
import type { TabId } from './types';
import { useState } from 'react';
import { topRatedSalons } from '../screens/native/Home/configs/mockData';
import type { Booking } from '../screens/native/Bookings/types/Booking';

export default function NativeNavigator() {
  const session = useSessionLoader();
  const { isLoggedIn, isLoadingSession, userRole, userName, userEmail, logout } = session;

  const [activeTab, setActiveTab] = useState<TabId>('home');

  const home = useHomeStack();
  const bookings = useBookingsStack();
  const profile = useProfileStack();
  const messaging = useMessagingStack();

  const isOverlayActive = useOverlayActive({ home, bookings, profile, messaging });

  useBackHandler({ home, bookings, profile, messaging });

  // Re-book handler — navigates to BookAppointmentScreen for a previous booking's salon
  const handleRebook = (booking: Booking) => {
    const matchingSalon = topRatedSalons.find((s) => s.name === booking.spaName);
    if (!matchingSalon) {
      console.warn('No matching salon found for spa name:', booking.spaName);
      return;
    }
    home.setHomeSelectedSalonId(matchingSalon.id);
    home.setHomeBookVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {isLoadingSession ? (
        <View style={{ flex: 1, backgroundColor: 'white' }} />
      ) : (
        <View style={{ flex: 1, position: 'relative' }}>
          {!isLoggedIn ? (
            <AuthStack session={session} />
          ) : (
            <>
              {/* Tab bases */}
              <RisingPage visible={activeTab === 'home'} fadeIn={false} fadeOut={false}>
                {userRole === 'admin' ? (
                  <HomeScreenAdmin
                    useNavigatorOverlays
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateNotifications={home.openHomeNotifications}
                  />
                ) : userRole === 'therapist' ? (
                  <HomeTherapistScreen
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateNotifications={home.openHomeNotifications}
                  />
                ) : (
                  <HomeScreen
                    useNavigatorOverlays
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateServices={home.openHomeServices}
                    onNavigateTopRated={(options) => home.openHomeTopRated(options)}
                    onNavigateSalonDetails={home.openHomeSalon}
                    onNavigateBookAppointment={home.openHomeBook}
                    onNavigateNotifications={home.openHomeNotifications}
                  />
                )}
              </RisingPage>

              <RisingPage visible={activeTab === 'bookings'} fadeIn={false} fadeOut={false}>
                {userRole === 'admin' ? (
                  <BookingsAdminScreen
                    useNavigatorOverlays
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateBookingDetails={bookings.openBookingDetails}
                    onNavigateNotifications={home.openHomeNotifications}
                  />
                ) : userRole === 'therapist' ? (
                  <BookingsTherapistScreen
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateBookingDetails={bookings.openBookingDetails}
                    onNavigateNotifications={home.openHomeNotifications}
                  />
                ) : (
                  <BookingsScreen
                    useNavigatorOverlays
                    onNavigateToProfile={() => setActiveTab('profile')}
                    onNavigateBookingDetails={bookings.openBookingDetails}
                    onNavigateRatingSpa={bookings.openBookingRatingSpa}
                    onNavigateRatingTherapist={bookings.openBookingRatingTherapist}
                    onNavigateNotifications={home.openHomeNotifications}
                    onNavigateRebook={handleRebook}
                  />
                )}
              </RisingPage>

              <RisingPage visible={activeTab === 'messaging'}>
                <InboxScreen
                  useNavigatorOverlays
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateChatRoom={messaging.openChat}
                  onNavigateNotifications={home.openHomeNotifications}
                  userRole={userRole}
                />
              </RisingPage>

              <RisingPage visible={activeTab === 'profile'} fadeIn={false} fadeOut={false}>
                <ProfileScreen
                  isActive={activeTab === 'profile'}
                  onNavigateToProfileEdit={() => profile.openProfileOverlay('edit')}
                  onNavigateToPasswordChange={() => profile.openProfileOverlay('password')}
                  onNavigateToNotifications={() => profile.openProfileOverlay('notifications')}
                  onNavigateToHelp={() => profile.openProfileOverlay('help')}
                  onNavigateToFavorites={() => profile.setProfileFavoritesVisible(true)}
                  onNavigateToTopRated={() => home.openHomeTopRated()}
                  onNavigateSalonDetails={home.openHomeSalon}
                  onNavigateToStaffManagement={() => profile.openProfileOverlay('staff')}
                  onNavigateToBusinessSettings={() => profile.openProfileOverlay('business')}
                  onNavigateToSubscription={() => profile.openProfileOverlay('subscription')}
                  onNavigateToSalonRatings={() => profile.openProfileOverlay('ratings')}
                  onNavigateToAccessLogs={() => profile.openProfileOverlay('logs')}
                  userName={userName}
                  userEmail={userEmail}
                  userRole={userRole}
                  onLogout={async () => {
                    await logout();
                    setActiveTab('home');
                  }}
                />
              </RisingPage>
            </>
          )}

          {/* Overlay stacks */}
          <HomeStack home={home} />
          <BookingsStack
            bookings={bookings}
            userRole={userRole}
            onRebook={(salonId) => {
              home.setHomeSelectedSalonId(salonId);
              home.setHomeBookVisible(true);
            }}
          />
          <ProfileStack
            profile={profile}
            onOpenChat={messaging.openChat}
            onSalonPress={home.openHomeSalon}
          />
          <MessagingStack messaging={messaging} />

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
