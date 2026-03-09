import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import type { HomeStackState } from './useHomeStack';
import type { BookingsStackState } from './useBookingsStack';
import type { ProfileStackState } from './useProfileStack';
import type { MessagingStackState } from './useMessagingStack';

interface BackHandlerDeps {
    home: Pick<
        HomeStackState,
        | 'homePaymentFailed'
        | 'homePaymentSuccess'
        | 'homeNotificationsVisible'
        | 'homeBookVisible'
        | 'homeSelectedSalonId'
        | 'homeTopRatedVisible'
        | 'homeServicesVisible'
        | 'handleHomePaymentFailedBack'
        | 'handleHomePaymentSuccessBack'
        | 'closeHomeNotifications'
        | 'closeHomeBook'
        | 'closeHomeSalon'
        | 'closeHomeTopRated'
        | 'closeHomeServices'
    >;
    bookings: Pick<
        BookingsStackState,
        | 'bookingRatingTherapistId'
        | 'bookingRatingSpaId'
        | 'invoiceOverlay'
        | 'getDirectionsDestination'
        | 'bookingSelectedId'
        | 'closeBookingRatingTherapist'
        | 'closeBookingRatingSpa'
        | 'closeBookingInvoice'
        | 'closeGetDirections'
        | 'closeBookingDetails'
    >;
    profile: Pick<
        ProfileStackState,
        | 'selectedFaq'
        | 'helpLegalScreen'
        | 'profileOverlay'
        | 'profileFavoritesVisible'
        | 'closeFaqDetail'
        | 'closeHelpLegal'
        | 'closeProfileOverlay'
        | 'closeProfileFavorites'
    >;
    messaging: Pick<MessagingStackState, 'chatConversation' | 'closeChat'>;
}

export function useBackHandler({ home, bookings, profile, messaging }: BackHandlerDeps) {
    useEffect(() => {
        const onBackPress = () => {
            if (home.homePaymentFailed) {
                home.handleHomePaymentFailedBack();
                return true;
            }
            if (home.homePaymentSuccess) {
                home.handleHomePaymentSuccessBack();
                return true;
            }
            if (home.homeNotificationsVisible) {
                home.closeHomeNotifications();
                return true;
            }
            if (home.homeBookVisible) {
                home.closeHomeBook();
                return true;
            }
            if (home.homeSelectedSalonId) {
                home.closeHomeSalon();
                return true;
            }
            if (home.homeTopRatedVisible) {
                home.closeHomeTopRated();
                return true;
            }
            if (home.homeServicesVisible) {
                home.closeHomeServices();
                return true;
            }
            if (bookings.bookingRatingTherapistId) {
                bookings.closeBookingRatingTherapist();
                return true;
            }
            if (bookings.bookingRatingSpaId) {
                bookings.closeBookingRatingSpa();
                return true;
            }
            if (bookings.invoiceOverlay) {
                bookings.closeBookingInvoice();
                return true;
            }
            if (bookings.getDirectionsDestination) {
                bookings.closeGetDirections();
                return true;
            }
            if (bookings.bookingSelectedId) {
                bookings.closeBookingDetails();
                return true;
            }
            if (messaging.chatConversation) {
                messaging.closeChat();
                return true;
            }
            if (profile.selectedFaq) {
                profile.closeFaqDetail();
                return true;
            }
            if (profile.helpLegalScreen) {
                profile.closeHelpLegal();
                return true;
            }
            if (profile.profileOverlay) {
                profile.closeProfileOverlay();
                return true;
            }
            if (profile.profileFavoritesVisible) {
                profile.closeProfileFavorites();
                return true;
            }
            return false;
        };

        const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => sub.remove();
    }, [
        home.homePaymentFailed,
        home.homePaymentSuccess,
        home.homeNotificationsVisible,
        home.homeBookVisible,
        home.homeSelectedSalonId,
        home.homeTopRatedVisible,
        home.homeServicesVisible,
        home.handleHomePaymentFailedBack,
        home.handleHomePaymentSuccessBack,
        home.closeHomeNotifications,
        home.closeHomeBook,
        home.closeHomeSalon,
        home.closeHomeTopRated,
        home.closeHomeServices,
        bookings.bookingRatingTherapistId,
        bookings.bookingRatingSpaId,
        bookings.invoiceOverlay,
        bookings.getDirectionsDestination,
        bookings.bookingSelectedId,
        bookings.closeBookingRatingTherapist,
        bookings.closeBookingRatingSpa,
        bookings.closeBookingInvoice,
        bookings.closeGetDirections,
        bookings.closeBookingDetails,
        messaging.chatConversation,
        messaging.closeChat,
        profile.selectedFaq,
        profile.helpLegalScreen,
        profile.profileOverlay,
        profile.profileFavoritesVisible,
        profile.closeFaqDetail,
        profile.closeHelpLegal,
        profile.closeProfileOverlay,
        profile.closeProfileFavorites,
    ]);
}
