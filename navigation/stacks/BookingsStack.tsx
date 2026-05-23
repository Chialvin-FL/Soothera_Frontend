import React from 'react';
import Animated from 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import BookingDetailsScreen from '../../screens/native/Bookings/BookingDetailsScreen.native';
import BookingDetailsAdminScreen from '../../screens/native/Bookings/BookingDetailsAdminScreen.native';
import RatingSpaScreen from '../../screens/native/Bookings/RatingSpaScreen.native';
import RatingTherapistScreen from '../../screens/native/Bookings/RatingTherapistScreen.native';
import InvoiceScreen from '../../screens/native/Bookings/components/InvoiceScreen.native';
import GetDirectionsScreen from '../../screens/native/Bookings/GetDirectionsScreen.native';
import BookAppointmentScreen from '../../screens/native/Home/BookAppointmentScreen.native';
import { getBookingDetails } from '../../screens/native/Bookings/configs/mockBookingDetailsData';
import { getBookingById } from '../../api/endpoints/apiBooking';
import { getSalonServices } from '../../api/endpoints/apiService';
import { mapApiBookingToDetails } from '../../screens/native/Bookings/utils/apiBookingMappers';
import { topRatedSalons, getSalonDetails } from '../../screens/native/Home/configs/mockData';
import type { BookingsStackState } from '../hooks/useBookingsStack';
import type { UIRole } from '../hooks/useSessionLoader';
import type { BookingDetails } from '../../screens/native/Bookings/types/BookingDetails';

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
    const [apiBookingDetails, setApiBookingDetails] = React.useState<BookingDetails | null>(null);
    const [isLoadingBookingDetails, setIsLoadingBookingDetails] = React.useState(false);
    const [bookingDetailsError, setBookingDetailsError] = React.useState<string | null>(null);
    const {
        bookingSelectedId,
        bookingRatingSpaId,
        bookingRatingTherapistId,
        invoiceOverlay,
        getDirectionsDestination,
        walkInBookingVisible,
        bookingsDetailsStyle,
        bookingsRatingSpaStyle,
        bookingsRatingTherapistStyle,
        bookingsInvoiceStyle,
        getDirectionsStyle,
        walkInBookingStyle,
        closeBookingDetails,
        closeBookingRatingSpa,
        closeBookingRatingTherapist,
        closeBookingInvoice,
        closeGetDirections,
        closeWalkInBooking,
        openBookingInvoice,
        openGetDirections,
        openBookingRatingSpa,
        openBookingRatingTherapist,
    } = bookings;

    const formatDisplayDate = React.useCallback((date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    }, []);

    const formatDisplayTime = React.useCallback((date: Date, time: Date, previousTime?: string): string => {
        const startTime = new Date(date);
        startTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

        const previousTimes = previousTime?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi) ?? [];
        const parseDisplayTime = (value: string): Date | null => {
            const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!match) return null;
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            const parsed = new Date(startTime);
            parsed.setHours(hours, minutes, 0, 0);
            return parsed;
        };

        const previousStart = previousTimes[0] ? parseDisplayTime(previousTimes[0]) : null;
        const previousEnd = previousTimes[1] ? parseDisplayTime(previousTimes[1]) : null;
        const durationMs = previousStart && previousEnd
            ? Math.max(previousEnd.getTime() - previousStart.getTime(), 0)
            : 60 * 60 * 1000;
        const endTime = new Date(startTime.getTime() + durationMs);
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
        };

        return `${startTime.toLocaleTimeString('en-US', options)} - ${endTime.toLocaleTimeString('en-US', options)}`;
    }, []);

    React.useEffect(() => {
        let mounted = true;

        const fetchSelectedBookingDetails = async () => {
            if (!bookingSelectedId || userRole !== 'customer') {
                setApiBookingDetails(null);
                setBookingDetailsError(null);
                setIsLoadingBookingDetails(false);
                return;
            }

            setIsLoadingBookingDetails(true);
            setBookingDetailsError(null);

            try {
                const response = await getBookingById(bookingSelectedId);
                const responseData = response.data as any;
                const apiBooking = Array.isArray(responseData?.items)
                    ? responseData.items[0]
                    : responseData;
                const salonServiceId = apiBooking?.salonServiceId ?? apiBooking?.SalonServiceId;
                let salonService = null;
                if (salonServiceId) {
                    try {
                        const serviceResponse = await getSalonServices({ salonServiceId });
                        const serviceData = serviceResponse?.data as any;
                        salonService = Array.isArray(serviceData?.items)
                            ? serviceData.items[0]
                            : serviceData;
                    } catch (serviceError) {
                        console.warn('[BookingsStack] Failed to load salon service details:', serviceError);
                    }
                }
                if (mounted) {
                    setApiBookingDetails(apiBooking ? mapApiBookingToDetails(apiBooking, salonService) : null);
                    setBookingDetailsError(apiBooking ? null : 'Booking details not found.');
                }
            } catch (error: any) {
                console.warn('[BookingsStack] Failed to load booking details:', error);
                if (mounted) {
                    setApiBookingDetails(null);
                    setBookingDetailsError(error?.message ?? 'Failed to load booking details.');
                }
            } finally {
                if (mounted) {
                    setIsLoadingBookingDetails(false);
                }
            }
        };

        fetchSelectedBookingDetails();

        return () => {
            mounted = false;
        };
    }, [bookingSelectedId, userRole]);

    return (
        <>
            {bookingSelectedId && (() => {
                const details = userRole === 'customer' ? apiBookingDetails : getBookingDetails(bookingSelectedId);
                if (userRole === 'customer' && isLoadingBookingDetails) {
                    return (
                        <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 12 }, bookingsDetailsStyle]}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                                <ActivityIndicator size="large" />
                                <Text className="text-sm mt-4 text-slate-500">Loading booking details...</Text>
                            </View>
                        </Animated.View>
                    );
                }
                if (userRole === 'customer' && bookingDetailsError) {
                    return (
                        <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 12 }, bookingsDetailsStyle]}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 24 }}>
                                <Ionicons name="alert-circle-outline" size={64} color="#94A3B8" />
                                <Text className="text-lg font-semibold mt-4 text-slate-900">Unable to load booking</Text>
                                <Text className="text-sm mt-2 text-center text-slate-500">{bookingDetailsError}</Text>
                            </View>
                        </Animated.View>
                    );
                }
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
                                        // We no longer require synchronous salon details here — pass id through
                                        onRebook(matchingSalon.id);
                                    }
                                }}
                                onReschedule={(date, time) => {
                                    setApiBookingDetails((current) => current
                                        ? {
                                            ...current,
                                            date: formatDisplayDate(date),
                                            time: formatDisplayTime(date, time, current.time),
                                        }
                                        : current);
                                }}
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

            {walkInBookingVisible && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 16 }, walkInBookingStyle]}>
                    <WalkInBookLoader onBack={closeWalkInBooking} isAdmin={userRole === 'admin'} onComplete={() => { console.log('Walk-in booking completed'); closeWalkInBooking(); }} />
                </Animated.View>
            )}
        </>
    );
}

// Loader component for walk-in booking (fetches salon id '1')
function WalkInBookLoader({ onBack, isAdmin, onComplete }: { onBack: () => void; isAdmin: boolean; onComplete: () => void }) {
    const [loading, setLoading] = React.useState(true);
    const [details, setDetails] = React.useState<any | null>(null);
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const d = await getSalonDetails('1');
                if (mounted) setDetails(d);
            } catch (err) {
                console.warn('[WalkInBookLoader] failed to load details', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    if (loading) return <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></Animated.View>;
    if (!details) return null;
    return (
        <BookAppointmentScreen
            salonDetails={details}
            onBack={onBack}
            onComplete={onComplete}
            isAdmin={isAdmin}
        />
    );
}
