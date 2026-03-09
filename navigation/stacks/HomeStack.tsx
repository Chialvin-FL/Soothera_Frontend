import React from 'react';
import { View } from 'react-native';
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
                const salonDetails = getSalonDetails(homeSelectedSalonId);
                if (!salonDetails) return null;
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 7 }, homeSalonStyle]}>
                        <SalonDetailsScreen
                            salonDetails={salonDetails}
                            onBack={closeHomeSalon}
                            onBookAppointment={() => setHomeBookVisible(true)}
                        />
                    </Animated.View>
                );
            })()}

            {homeBookVisible && homeSelectedSalonId && (() => {
                const salonDetails = getSalonDetails(homeSelectedSalonId);
                if (!salonDetails) return null;
                return (
                    <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 8 }, homeBookStyle]}>
                        <BookAppointmentScreen
                            salonDetails={salonDetails}
                            onBack={closeHomeBook}
                            onComplete={closeHomeBook}
                            onPaymentSuccess={handleHomePaymentSuccess}
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
                    />
                </View>
            )}
        </>
    );
}
