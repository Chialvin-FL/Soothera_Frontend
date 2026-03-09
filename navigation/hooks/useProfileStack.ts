import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { SCREEN_WIDTH, TRANSITION_DURATION, EXIT_TRANSITION_DURATION } from '../configs/constants';
import type { ProfileOverlayId } from '../types';
import type { FaqItem } from '../../screens/native/Profile/configs/faqData';

export interface ProfileStackState {
    profileOverlay: ProfileOverlayId | null;
    selectedFaq: FaqItem | null;
    helpLegalScreen: 'terms' | 'privacy' | null;
    profileFavoritesVisible: boolean;

    profileOverlayStyle: ReturnType<typeof useAnimatedStyle>;
    faqDetailStyle: ReturnType<typeof useAnimatedStyle>;
    helpLegalStyle: ReturnType<typeof useAnimatedStyle>;
    profileFavoritesStyle: ReturnType<typeof useAnimatedStyle>;

    openProfileOverlay: (id: ProfileOverlayId) => void;
    closeProfileOverlay: () => void;
    openFaqDetail: (faq: FaqItem) => void;
    closeFaqDetail: () => void;
    openTermsOfService: () => void;
    openPrivacyPolicy: () => void;
    closeHelpLegal: () => void;
    setProfileFavoritesVisible: (visible: boolean) => void;
    closeProfileFavorites: () => void;
}

export function useProfileStack(): ProfileStackState {
    const [profileOverlay, setProfileOverlay] = useState<ProfileOverlayId | null>(null);
    const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
    const [helpLegalScreen, setHelpLegalScreen] = useState<'terms' | 'privacy' | null>(null);
    const [profileFavoritesVisible, setProfileFavoritesVisible] = useState(false);

    const profileOverlayTx = useSharedValue(SCREEN_WIDTH);
    const faqDetailTx = useSharedValue(SCREEN_WIDTH);
    const helpLegalTx = useSharedValue(SCREEN_WIDTH);
    const profileFavoritesTx = useSharedValue(SCREEN_WIDTH);

    useEffect(() => {
        profileOverlayTx.value = withTiming(profileOverlay ? 0 : SCREEN_WIDTH, {
            duration: TRANSITION_DURATION,
        });
    }, [profileOverlay, profileOverlayTx]);

    useEffect(() => {
        faqDetailTx.value = selectedFaq
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [selectedFaq, faqDetailTx]);

    useEffect(() => {
        helpLegalTx.value = helpLegalScreen
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [helpLegalScreen, helpLegalTx]);

    useEffect(() => {
        profileFavoritesTx.value = profileFavoritesVisible
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION });
    }, [profileFavoritesVisible, profileFavoritesTx]);

    const profileOverlayStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: profileOverlayTx.value }],
    }));
    const faqDetailStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: faqDetailTx.value }],
    }));
    const helpLegalStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: helpLegalTx.value }],
    }));
    const profileFavoritesStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: profileFavoritesTx.value }],
    }));

    const openProfileOverlay = (id: ProfileOverlayId) => setProfileOverlay(id);
    const closeProfileOverlay = () => {
        profileOverlayTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setProfileOverlay)(null)
        );
    };

    const openFaqDetail = (faq: FaqItem) => setSelectedFaq(faq);
    const closeFaqDetail = () => {
        faqDetailTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setSelectedFaq)(null)
        );
    };

    const openTermsOfService = () => setHelpLegalScreen('terms');
    const openPrivacyPolicy = () => setHelpLegalScreen('privacy');
    const closeHelpLegal = () => {
        helpLegalTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setHelpLegalScreen)(null)
        );
    };

    const closeProfileFavorites = () => {
        profileFavoritesTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setProfileFavoritesVisible)(false)
        );
    };

    return {
        profileOverlay,
        selectedFaq,
        helpLegalScreen,
        profileFavoritesVisible,
        profileOverlayStyle,
        faqDetailStyle,
        helpLegalStyle,
        profileFavoritesStyle,
        openProfileOverlay,
        closeProfileOverlay,
        openFaqDetail,
        closeFaqDetail,
        openTermsOfService,
        openPrivacyPolicy,
        closeHelpLegal,
        setProfileFavoritesVisible,
        closeProfileFavorites,
    };
}
