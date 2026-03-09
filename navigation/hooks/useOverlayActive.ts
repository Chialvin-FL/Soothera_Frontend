import { useMemo } from 'react';
import type { HomeStackState } from './useHomeStack';
import type { BookingsStackState } from './useBookingsStack';
import type { ProfileStackState } from './useProfileStack';
import type { MessagingStackState } from './useMessagingStack';

interface OverlayActiveOptions {
    home: Pick<
        HomeStackState,
        | 'homeServicesVisible'
        | 'homeTopRatedVisible'
        | 'homeSelectedSalonId'
        | 'homeBookVisible'
        | 'homePaymentSuccess'
        | 'homePaymentFailed'
        | 'homeNotificationsVisible'
    >;
    bookings: Pick<
        BookingsStackState,
        | 'bookingSelectedId'
        | 'bookingRatingSpaId'
        | 'bookingRatingTherapistId'
        | 'invoiceOverlay'
        | 'getDirectionsDestination'
    >;
    profile: Pick<
        ProfileStackState,
        'profileOverlay' | 'selectedFaq' | 'helpLegalScreen' | 'profileFavoritesVisible'
    >;
    messaging: Pick<MessagingStackState, 'chatConversation'>;
}

export function useOverlayActive({
    home,
    bookings,
    profile,
    messaging,
}: OverlayActiveOptions): boolean {
    return useMemo(
        () =>
            home.homeServicesVisible ||
            home.homeTopRatedVisible ||
            !!home.homeSelectedSalonId ||
            home.homeBookVisible ||
            !!home.homePaymentSuccess ||
            !!home.homePaymentFailed ||
            home.homeNotificationsVisible ||
            !!bookings.bookingSelectedId ||
            !!bookings.bookingRatingSpaId ||
            !!bookings.bookingRatingTherapistId ||
            !!bookings.invoiceOverlay ||
            !!bookings.getDirectionsDestination ||
            !!profile.profileOverlay ||
            !!profile.selectedFaq ||
            !!profile.helpLegalScreen ||
            profile.profileFavoritesVisible ||
            !!messaging.chatConversation,
        [
            home.homeServicesVisible,
            home.homeTopRatedVisible,
            home.homeSelectedSalonId,
            home.homeBookVisible,
            home.homePaymentSuccess,
            home.homePaymentFailed,
            home.homeNotificationsVisible,
            bookings.bookingSelectedId,
            bookings.bookingRatingSpaId,
            bookings.bookingRatingTherapistId,
            bookings.invoiceOverlay,
            bookings.getDirectionsDestination,
            profile.profileOverlay,
            profile.selectedFaq,
            profile.helpLegalScreen,
            profile.profileFavoritesVisible,
            messaging.chatConversation,
        ]
    );
}
