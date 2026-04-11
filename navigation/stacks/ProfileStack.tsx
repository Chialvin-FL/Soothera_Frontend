import React from 'react';
import Animated from 'react-native-reanimated';
import ProfileEditScreen from '../../screens/native/Profile/components/ProfileEditScreen.native';
import PasswordChangeScreen from '../../screens/native/Profile/components/PasswordChangeScreen.native';
import NotificationPreferencesScreen from '../../screens/native/Profile/components/NotificationPreferencesScreen.native';
import HelpScreen from '../../screens/native/Profile/components/HelpScreen.native';
import FAQsScreen from '../../screens/native/Profile/components/FAQsScreen.native';
import FavoritesScreen from '../../screens/native/Profile/components/FavoritesScreen.native';
import TermsOfServiceScreen from '../../screens/native/Profile/components/TermsOfServiceScreen.native';
import PrivacyPolicyScreen from '../../screens/native/Profile/components/PrivacyPolicyScreen.native';
import StaffManagementScreen from '../../screens/native/Profile/components/StaffManagementScreen.native';
import BusinessSettingsScreen from '../../screens/native/Profile/components/BusinessSettingsScreen.native';
import SubscriptionScreen from '../../screens/native/Profile/components/SubscriptionScreen.native';
import SalonRatingsScreen from '../../screens/native/Profile/components/SalonRatingsScreen.native';
import AccessLogsScreen from '../../screens/native/Profile/components/AccessLogsScreen.native';
import type { ProfileStackState } from '../hooks/useProfileStack';
import type { SessionState } from '../hooks/useSessionLoader';
import type { Conversation } from '../../screens/native/Messaging/InboxScreen.native';
import { SUPPORT_CHATBOT_CONVERSATION } from '../configs/constants';

const OVERLAY_BASE = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

interface ProfileStackProps {
    profile: ProfileStackState;
    session: SessionState;
    /** Called when the Help screen FAB opens the support chatbot */
    onOpenChat: (conversation: Conversation) => void;
    onSalonPress: (salonId: string) => void;
}

export function ProfileStack({ profile, session, onOpenChat, onSalonPress }: ProfileStackProps) {
    const {
        profileOverlay,
        selectedFaq,
        helpLegalScreen,
        profileFavoritesVisible,
        profileOverlayStyle,
        faqDetailStyle,
        helpLegalStyle,
        profileFavoritesStyle,
        closeProfileOverlay,
        closeFaqDetail,
        closeHelpLegal,
        closeProfileFavorites,
        openFaqDetail,
        openTermsOfService,
        openPrivacyPolicy,
    } = profile;

    return (
        <>
            {profileOverlay && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 16 }, profileOverlayStyle]}>
                    {profileOverlay === 'edit' && <ProfileEditScreen onBack={closeProfileOverlay} session={session} />}
                    {profileOverlay === 'password' && <PasswordChangeScreen onBack={closeProfileOverlay} />}
                    {profileOverlay === 'notifications' && (
                        <NotificationPreferencesScreen onBack={closeProfileOverlay} />
                    )}
                    {profileOverlay === 'help' && (
                        <HelpScreen
                            onBack={closeProfileOverlay}
                            onOpenChatbot={() => onOpenChat(SUPPORT_CHATBOT_CONVERSATION)}
                            onFaqPress={openFaqDetail}
                            onTermsPress={openTermsOfService}
                            onPrivacyPress={openPrivacyPolicy}
                        />
                    )}
                    {profileOverlay === 'staff' && <StaffManagementScreen onBack={closeProfileOverlay} />}
                    {profileOverlay === 'business' && <BusinessSettingsScreen onBack={closeProfileOverlay} />}
                    {profileOverlay === 'subscription' && <SubscriptionScreen onBack={closeProfileOverlay} />}
                    {profileOverlay === 'ratings' && <SalonRatingsScreen onBack={closeProfileOverlay} />}
                    {profileOverlay === 'logs' && <AccessLogsScreen onBack={closeProfileOverlay} />}
                </Animated.View>
            )}

            {profileOverlay === 'help' && selectedFaq && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 16 }, faqDetailStyle]}>
                    <FAQsScreen faq={selectedFaq} onBack={closeFaqDetail} />
                </Animated.View>
            )}

            {profileFavoritesVisible && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 16 }, profileFavoritesStyle]}>
                    <FavoritesScreen onBack={closeProfileFavorites} onSalonPress={onSalonPress} />
                </Animated.View>
            )}

            {profileOverlay === 'help' && helpLegalScreen && (
                <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 16 }, helpLegalStyle]}>
                    {helpLegalScreen === 'terms' && <TermsOfServiceScreen onBack={closeHelpLegal} />}
                    {helpLegalScreen === 'privacy' && <PrivacyPolicyScreen onBack={closeHelpLegal} />}
                </Animated.View>
            )}
        </>
    );
}
