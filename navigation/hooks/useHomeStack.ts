import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { SCREEN_WIDTH, TRANSITION_DURATION, EXIT_TRANSITION_DURATION } from '../configs/constants';
import type { BookingData } from '../types';

export interface HomeStackState {
    homeServicesVisible: boolean;
    homeTopRatedVisible: boolean;
    homeTopRatedAutoFilter: boolean;
    homeTopRatedAutoFocus: boolean;
    homeSelectedSalonId: string | null;
    homeBookVisible: boolean;
    homePaymentSuccess: BookingData | null;
    homePaymentFailed: BookingData | null;
    homeNotificationsVisible: boolean;

    homeServicesStyle: ReturnType<typeof useAnimatedStyle>;
    homeTopRatedStyle: ReturnType<typeof useAnimatedStyle>;
    homeSalonStyle: ReturnType<typeof useAnimatedStyle>;
    homeBookStyle: ReturnType<typeof useAnimatedStyle>;
    homeNotificationsStyle: ReturnType<typeof useAnimatedStyle>;

    openHomeServices: () => void;
    openHomeTopRated: (options?: { autoOpenFilter?: boolean; autoFocusSearch?: boolean }) => void;
    openHomeSalon: (salonId: string) => void;
    openHomeBook: (salonId: string) => void;
    openHomeNotifications: () => void;

    closeHomeServices: () => void;
    closeHomeTopRated: () => void;
    closeHomeSalon: () => void;
    closeHomeBook: () => void;
    closeHomeNotifications: () => void;

    setHomeSelectedSalonId: (id: string | null) => void;
    setHomeTopRatedVisible: (visible: boolean) => void;
    setHomeTopRatedAutoFilter: (val: boolean) => void;
    setHomeTopRatedAutoFocus: (val: boolean) => void;
    setHomeBookVisible: (visible: boolean) => void;

    handleHomePaymentSuccess: (data: BookingData) => void;
    handleHomePaymentSuccessBack: () => void;
    handleHomePaymentSuccessHome: () => void;
    handleHomePaymentFailedBack: () => void;
    handleHomePaymentFailedTryAgain: () => void;
}

export function useHomeStack(): HomeStackState {
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

    useEffect(() => {
        homeServicesTx.value = homeServicesVisible
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [homeServicesVisible, homeServicesTx]);

    useEffect(() => {
        homeTopRatedTx.value = homeTopRatedVisible
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [homeTopRatedVisible, homeTopRatedTx]);

    useEffect(() => {
        homeSalonTx.value = homeSelectedSalonId
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [homeSelectedSalonId, homeSalonTx]);

    useEffect(() => {
        homeBookTx.value = homeBookVisible
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [homeBookVisible, homeBookTx]);

    useEffect(() => {
        homeNotificationsTx.value = homeNotificationsVisible
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
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
    const handleHomePaymentSuccessBack = () => setHomePaymentSuccess(null);
    const handleHomePaymentSuccessHome = () => {
        if (homePaymentSuccess) setHomePaymentFailed(homePaymentSuccess);
        setHomePaymentSuccess(null);
    };
    const handleHomePaymentFailedBack = () => setHomePaymentFailed(null);
    const handleHomePaymentFailedTryAgain = () => {
        setHomePaymentFailed(null);
        if (homeSelectedSalonId) setHomeBookVisible(true);
    };

    return {
        homeServicesVisible,
        homeTopRatedVisible,
        homeTopRatedAutoFilter,
        homeTopRatedAutoFocus,
        homeSelectedSalonId,
        homeBookVisible,
        homePaymentSuccess,
        homePaymentFailed,
        homeNotificationsVisible,
        homeServicesStyle,
        homeTopRatedStyle,
        homeSalonStyle,
        homeBookStyle,
        homeNotificationsStyle,
        openHomeServices,
        openHomeTopRated,
        openHomeSalon,
        openHomeBook,
        openHomeNotifications,
        closeHomeServices,
        closeHomeTopRated,
        closeHomeSalon,
        closeHomeBook,
        closeHomeNotifications,
        setHomeSelectedSalonId,
        setHomeBookVisible,
        setHomeTopRatedVisible,
        setHomeTopRatedAutoFilter,
        setHomeTopRatedAutoFocus,
        handleHomePaymentSuccess,
        handleHomePaymentSuccessBack,
        handleHomePaymentSuccessHome,
        handleHomePaymentFailedBack,
        handleHomePaymentFailedTryAgain,
    };
}
