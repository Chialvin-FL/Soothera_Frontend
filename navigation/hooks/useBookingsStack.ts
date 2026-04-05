import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { SCREEN_WIDTH, TRANSITION_DURATION, EXIT_TRANSITION_DURATION } from '../configs/constants';
import type { InvoiceData } from '../../screens/native/Bookings/types/Invoice';

export interface BookingsStackState {
    bookingSelectedId: string | null;
    bookingRatingSpaId: string | null;
    bookingRatingTherapistId: string | null;
    bookingRatingFromReview: boolean;
    invoiceOverlay: {
        data: InvoiceData;
        isVAT: boolean;
        vatRate: number;
        discounts: number;
    } | null;
    getDirectionsDestination: { latitude: number; longitude: number; name?: string } | null;
    walkInBookingVisible: boolean;

    bookingsDetailsStyle: ReturnType<typeof useAnimatedStyle>;
    bookingsRatingSpaStyle: ReturnType<typeof useAnimatedStyle>;
    bookingsRatingTherapistStyle: ReturnType<typeof useAnimatedStyle>;
    bookingsInvoiceStyle: ReturnType<typeof useAnimatedStyle>;
    getDirectionsStyle: ReturnType<typeof useAnimatedStyle>;
    walkInBookingStyle: ReturnType<typeof useAnimatedStyle>;

    openBookingDetails: (id: string) => void;
    openBookingRatingSpa: (id: string, fromReview?: boolean) => void;
    openBookingRatingTherapist: (id: string, fromReview?: boolean) => void;
    openBookingInvoice: (
        data: InvoiceData,
        options?: { isVAT?: boolean; vatRate?: number; discounts?: number }
    ) => void;
    openGetDirections: (
        destination: { latitude: number; longitude: number },
        destinationName?: string
    ) => void;
    openWalkInBooking: () => void;

    closeBookingDetails: () => void;
    closeBookingRatingSpa: () => void;
    closeBookingRatingTherapist: () => void;
    closeBookingInvoice: () => void;
    closeGetDirections: () => void;
    closeWalkInBooking: () => void;
}

export function useBookingsStack(): BookingsStackState {
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
    const [getDirectionsDestination, setGetDirectionsDestination] = useState<{
        latitude: number;
        longitude: number;
        name?: string;
    } | null>(null);
    const [walkInBookingVisible, setWalkInBookingVisible] = useState(false);

    const bookingsDetailsTx = useSharedValue(SCREEN_WIDTH);
    const bookingsRatingSpaTx = useSharedValue(SCREEN_WIDTH);
    const bookingsRatingTherapistTx = useSharedValue(SCREEN_WIDTH);
    const bookingsInvoiceTx = useSharedValue(SCREEN_WIDTH);
    const getDirectionsTx = useSharedValue(SCREEN_WIDTH);
    const walkInBookingTx = useSharedValue(SCREEN_WIDTH);

    useEffect(() => {
        bookingsDetailsTx.value = withTiming(bookingSelectedId ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [bookingSelectedId, bookingsDetailsTx]);

    useEffect(() => {
        bookingsRatingSpaTx.value = withTiming(bookingRatingSpaId ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [bookingRatingSpaId, bookingsRatingSpaTx]);

    useEffect(() => {
        bookingsRatingTherapistTx.value = withTiming(
            bookingRatingTherapistId ? 0 : SCREEN_WIDTH,
            { duration: TRANSITION_DURATION }
        );
    }, [bookingRatingTherapistId, bookingsRatingTherapistTx]);

    useEffect(() => {
        bookingsInvoiceTx.value = withTiming(invoiceOverlay ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [invoiceOverlay, bookingsInvoiceTx]);

    useEffect(() => {
        getDirectionsTx.value = withTiming(getDirectionsDestination ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [getDirectionsDestination, getDirectionsTx]);

    useEffect(() => {
        walkInBookingTx.value = withTiming(walkInBookingVisible ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [walkInBookingVisible, walkInBookingTx]);

    const bookingsDetailsStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bookingsDetailsTx.value }],
    }));
    const bookingsRatingSpaStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bookingsRatingSpaTx.value }],
    }));
    const bookingsRatingTherapistStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bookingsRatingTherapistTx.value }],
    }));
    const bookingsInvoiceStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bookingsInvoiceTx.value }],
    }));
    const getDirectionsStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: getDirectionsTx.value }],
    }));
    const walkInBookingStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: walkInBookingTx.value }],
    }));

    const openBookingDetails = (id: string) => setBookingSelectedId(id);
    const openBookingRatingSpa = (id: string, fromReview = false) => {
        setBookingRatingSpaId(id);
        setBookingRatingFromReview(fromReview);
    };
    const openBookingRatingTherapist = (id: string, fromReview = false) => {
        setBookingRatingTherapistId(id);
        setBookingRatingFromReview(fromReview);
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
    const openGetDirections = (
        destination: { latitude: number; longitude: number },
        destinationName?: string
    ) => {
        setGetDirectionsDestination({ ...destination, name: destinationName });
    };
    const openWalkInBooking = () => setWalkInBookingVisible(true);

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
    const closeBookingInvoice = () => {
        bookingsInvoiceTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setInvoiceOverlay)(null)
        );
    };
    const closeGetDirections = () => {
        getDirectionsTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setGetDirectionsDestination)(null)
        );
    };
    const closeWalkInBooking = () => {
        walkInBookingTx.value = withTiming(SCREEN_WIDTH, { duration: TRANSITION_DURATION }, () =>
            runOnJS(setWalkInBookingVisible)(false)
        );
    };

    return {
        bookingSelectedId,
        bookingRatingSpaId,
        bookingRatingTherapistId,
        bookingRatingFromReview,
        invoiceOverlay,
        getDirectionsDestination,
        walkInBookingVisible,
        bookingsDetailsStyle,
        bookingsRatingSpaStyle,
        bookingsRatingTherapistStyle,
        bookingsInvoiceStyle,
        getDirectionsStyle,
        walkInBookingStyle,
        openBookingDetails,
        openBookingRatingSpa,
        openBookingRatingTherapist,
        openBookingInvoice,
        openGetDirections,
        openWalkInBooking,
        closeBookingDetails,
        closeBookingRatingSpa,
        closeBookingRatingTherapist,
        closeBookingInvoice,
        closeGetDirections,
        closeWalkInBooking,
    };
}
