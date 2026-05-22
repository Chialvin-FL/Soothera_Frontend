import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import ServicesScreen from '../../screens/native/Home/ServicesScreen.native';
import TopRatedSalonsScreen from '../../screens/native/Home/TopRatedSalonsScreen.native';
import SalonDetailsScreen from '../../screens/native/Home/SalonDetailsScreen.native';
import BookAppointmentScreen from '../../screens/native/Home/BookAppointmentScreen.native';
import NotificationsScreen from '../../screens/native/Notifications/NotificationsScreen.native';
import PaymentSuccessfulScreen from '../../screens/native/Home/PaymentSuccessfulScreen.native';
import PaymentFailedScreen from '../../screens/native/Home/PaymentFailedScreen.native';
import { getSalonDetails } from '../../screens/native/Home/configs/mockData';
import type { HomeStackState } from '../hooks/useHomeStack';

const OVERLAY_BASE = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

// Loader component: fetches salon details asynchronously and renders SalonDetailsScreen
function SalonDetailsLoader({ salonId, onBack, onBook }: { salonId: string; onBack: () => void; onBook: () => void }) {
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setDetails(null);
        (async () => {
            try {
                const d = await getSalonDetails(salonId);
                if (mounted) setDetails(d);
            } catch (err) {
                console.warn('[SalonDetailsLoader] failed to load details', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [salonId]);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!details) {
        // If not found, show nothing (parent overlay can handle closing)
        return null;
    }

    return (
        <SalonDetailsScreen
            salonDetails={details}
            onBack={onBack}
            onBookAppointment={onBook}
        />
    );
}

// Loader for BookAppointmentScreen
function BookAppointmentLoader({
    salonId,
    onBack,
    onComplete,
    onPaymentSuccess,
    onPaymentFailed,
}: {
    salonId: string;
    onBack: () => void;
    onComplete: () => void;
    onPaymentSuccess: (data: any) => void;
    onPaymentFailed: (data: any) => void;
}) {
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setDetails(null);
        (async () => {
            try {
                const d = await getSalonDetails(salonId);
                if (mounted) setDetails(d);
            } catch (err) {
                console.warn('[BookAppointmentLoader] failed to load details', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [salonId]);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!details) return null;

    return (
        <BookAppointmentScreen
            salonDetails={details}
            onBack={onBack}
            onComplete={onComplete}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentFailed={onPaymentFailed}
        />
    );
}

interface HomeStackProps {
    home: HomeStackState;
}

export function HomeStack({ home }: HomeStackProps) {
    const {
        homeServicesVisible,
        homeTopRatedVisible,
        homeSelectedSalonId,
        homeBookVisible,
        homeNotificationsVisible,
        homePaymentSuccess,
        homePaymentFailed,
        homeTopRatedAutoFilter,
        homeTopRatedAutoFocus,
        homeServicesStyle,
        homeTopRatedStyle,
        homeSalonStyle,
        homeBookStyle,
        homeNotificationsStyle,
        openHomeSalon,
        closeHomeServices,
        closeHomeTopRated,
        closeHomeSalon,
        closeHomeBook,
        closeHomeNotifications,
        setHomeTopRatedVisible,
        setHomeTopRatedAutoFilter,
        setHomeTopRatedAutoFocus,
        setHomeBookVisible,
        handleHomePaymentSuccess,
        handleHomePaymentFailed,
        handleHomePaymentSuccessBack,
        handleHomePaymentSuccessHome,
        handleHomePaymentFailedBack,
        handleHomePaymentFailedTryAgain,
    } = home;

    return (
        <>
            {homeServicesVisible && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 5 }, homeServicesStyle]}>
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
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 6 }, homeTopRatedStyle]}>
                    <TopRatedSalonsScreen
                        onBack={closeHomeTopRated}
                        onSalonPress={openHomeSalon}
                        autoOpenFilter={homeTopRatedAutoFilter}
                        autoFocusSearch={homeTopRatedAutoFocus}
                    />
                </Animated.View>
            )}

            {homeSelectedSalonId && (() => {
                // Render async loader which fetches salon details from API
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 7 }, homeSalonStyle]}>
                        <SalonDetailsLoader
                            salonId={homeSelectedSalonId}
                            onBack={closeHomeSalon}
                            onBook={() => setHomeBookVisible(true)}
                        />
                    </Animated.View>
                );
            })()}

            {homeBookVisible && homeSelectedSalonId && (() => {
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 8 }, homeBookStyle]}>
                        <BookAppointmentLoader
                            salonId={homeSelectedSalonId}
                            onBack={closeHomeBook}
                            onComplete={closeHomeBook}
                            onPaymentSuccess={handleHomePaymentSuccess}
                            onPaymentFailed={handleHomePaymentFailed}
                        />
                    </Animated.View>
                );
            })()}

            {homeNotificationsVisible && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 9 }, homeNotificationsStyle]}>
                    <NotificationsScreen onBack={closeHomeNotifications} />
                </Animated.View>
            )}

            {homePaymentSuccess && (
                <View style={{ ...OVERLAY_BASE, zIndex: 10 }}>
                    <PaymentSuccessfulScreen
                        bookingData={homePaymentSuccess}
                        onBack={handleHomePaymentSuccessBack}
                        onHome={handleHomePaymentSuccessHome}
                    />
                </View>
            )}

            {homePaymentFailed && (
                <View style={{ ...OVERLAY_BASE, zIndex: 11 }}>
                    <PaymentFailedScreen
                        bookingData={homePaymentFailed}
                        onBack={handleHomePaymentFailedBack}
                        onTryAgain={handleHomePaymentFailedTryAgain}
                        onRetrySuccess={handleHomePaymentSuccess}
                    />
                </View>
            )}
        </>
    );
}
