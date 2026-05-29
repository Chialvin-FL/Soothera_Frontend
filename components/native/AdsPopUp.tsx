import React, { useState, useEffect } from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';

const { width, height } = Dimensions.get('window');

const AD_IMAGES = [
    require('../../assets/ads/shopee.png'),
    require('../../assets/ads/casino.png'),
    require('../../assets/ads/bingo.png'),
];

export const AdsPopUp: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Schedule the ad to show after 3 minutes of ad-free time
        const timer = setTimeout(() => {
            setVisible(true);
        }, 3 * 60 * 1000); // 3 minutes

        return () => clearTimeout(timer);
    }, [currentAdIndex]);

    const handleClose = () => {
        setVisible(false);
        // Cycle to the next ad index, which will trigger the useEffect to start the next 5-minute timer
        setCurrentAdIndex((prev) => (prev + 1) % AD_IMAGES.length);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                {/* Ad Container */}
                <View style={styles.adContainer}>
                    <Image
                        source={AD_IMAGES[currentAdIndex]}
                        style={styles.adImage}
                        resizeMode="contain"
                    />

                    {/* Discreet Ad / Sponsored Tag at the top-left */}
                    <View style={styles.adTagContainer}>
                        <Text style={styles.adTagText}>Sponsored</Text>
                    </View>

                    {/* Close Button at the top-right of the ad container */}
                    <TouchableOpacity
                        style={[styles.closeButton, { top: 12 + insets.top, right: 16 }]}
                        onPress={handleClose}
                        activeOpacity={0.6}
                        accessibilityLabel="Close Advertisement"
                        accessibilityRole="button"
                    >
                        <Ionicons name="close" size={24} color="#ffffff" style={styles.closeIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    adImage: {
        width: width * 0.9,
        height: height * 0.8,
        borderRadius: 12,
    },
    adTagContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    adTagText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    closeButton: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    closeIcon: {
        opacity: 0.9,
    },
});

export default AdsPopUp;
