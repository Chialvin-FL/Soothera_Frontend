import React from 'react';
import Animated from 'react-native-reanimated';
import BookingDetailsScreen from '../../screens/native/Bookings/BookingDetailsScreen.native';
import BookingDetailsAdminScreen from '../../screens/native/Bookings/BookingDetailsAdminScreen.native';
import RatingSpaScreen from '../../screens/native/Bookings/RatingSpaScreen.native';
import RatingTherapistScreen from '../../screens/native/Bookings/RatingTherapistScreen.native';
import InvoiceScreen from '../../screens/native/Bookings/components/InvoiceScreen.native';
import GetDirectionsScreen from '../../screens/native/Bookings/GetDirectionsScreen.native';
import { getBookingDetails } from '../../screens/native/Bookings/configs/mockBookingDetailsData';
import { topRatedSalons, getSalonDetails } from '../../screens/native/Home/configs/mockData';
import type { BookingsStackState } from '../hooks/useBookingsStack';
import type { UIRole } from '../hooks/useSessionLoader';

const OVERLAY_BASE = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

interface BookingsStackProps {
    bookings: BookingsStackState;
    userRole: UIRole | null;
    onRebook: (salonId: string) => void;
}

export function BookingsStack({ bookings, userRole, onRebook }: BookingsStackProps) {
    const {
        bookingSelectedId,
        bookingRatingSpaId,
        bookingRatingTherapistId,
        invoiceOverlay,
        getDirectionsDestination,
        bookingsDetailsStyle,
        bookingsRatingSpaStyle,
        bookingsRatingTherapistStyle,
        bookingsInvoiceStyle,
        getDirectionsStyle,
        closeBookingDetails,
        closeBookingRatingSpa,
        closeBookingRatingTherapist,
        closeBookingInvoice,
        closeGetDirections,
        openBookingInvoice,
        openGetDirections,
        openBookingRatingSpa,
        openBookingRatingTherapist,
    } = bookings;

    return (
        <>
            {bookingSelectedId && (() => {
                const details = getBookingDetails(bookingSelectedId);
                if (!details) return null;
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 12 }, bookingsDetailsStyle]}>
                        {userRole === 'admin' ? (
                            <BookingDetailsAdminScreen
                                bookingDetails={details}
                                onBack={closeBookingDetails}
                                onNavigateToInvoice={openBookingInvoice}
                                onAccept={() => console.log('Accept booking:', bookingSelectedId)}
                                onDecline={() => console.log('Decline booking:', bookingSelectedId)}
                                onRefund={() => console.log('Refund booking:', bookingSelectedId)}
                            />
                        ) : (
                            <BookingDetailsScreen
                                bookingDetails={details}
                                onBack={closeBookingDetails}
                                onRateSpa={() => openBookingRatingSpa(bookingSelectedId, false)}
                                onRateTherapist={() => openBookingRatingTherapist(bookingSelectedId, false)}
                                onNavigateToInvoice={openBookingInvoice}
                                onGetDirections={(destination) => openGetDirections(destination, details.spaName)}
                                onRebook={() => {
                                    const matchingSalon = topRatedSalons.find((s) => s.name === details.spaName);
                                    if (matchingSalon) {
                                        const salonDetails = getSalonDetails(matchingSalon.id);
                                        if (salonDetails) onRebook(matchingSalon.id);
                                    }
                                }}
                                onReschedule={() => { }}
                                onCancel={async () => {
                                    console.log('Cancel booking:', bookingSelectedId);
                                }}
                            />
                        )}
                    </Animated.View>
                );
            })()}

            {bookingRatingSpaId && (() => {
                const details = getBookingDetails(bookingRatingSpaId);
                if (!details) return null;
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 13 }, bookingsRatingSpaStyle]}>
                        <RatingSpaScreen
                            bookingDetails={details}
                            onBack={closeBookingRatingSpa}
                            onSubmit={async () => { }}
                        />
                    </Animated.View>
                );
            })()}

            {bookingRatingTherapistId && (() => {
                const details = getBookingDetails(bookingRatingTherapistId);
                if (!details) return null;
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 14 }, bookingsRatingTherapistStyle]}>
                        <RatingTherapistScreen
                            bookingDetails={details}
                            onBack={closeBookingRatingTherapist}
                            onSubmit={async () => { }}
                        />
                    </Animated.View>
                );
            })()}

            {invoiceOverlay && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 15 }, bookingsInvoiceStyle]}>
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
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 15 }, getDirectionsStyle]}>
                    <GetDirectionsScreen
                        destination={getDirectionsDestination}
                        destinationName={getDirectionsDestination.name}
                        onBack={closeGetDirections}
                    />
                </Animated.View>
            )}
        </>
    );
}
