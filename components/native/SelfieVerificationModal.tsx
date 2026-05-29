import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationModal } from './ConfirmationModal';
import { SuccessModal } from './SuccessModal';
import { IdentityVerification } from '../../api/types';
import { API_CONFIG } from '../../api/config';

interface SelfieVerificationModalProps {
    visible: boolean;
    isUploading: boolean;
    isVerifying: boolean;
    error: string | null;
    successMessage: string | null;
    onUpload: (idPhoto: any, selfiePhoto: any) => void;
    onSuccessAcknowledge?: () => void;
    existingVerification?: IdentityVerification | null;
}

export const SelfieVerificationModal: React.FC<SelfieVerificationModalProps> = ({
    visible,
    isUploading,
    isVerifying,
    error,
    successMessage,
    onUpload,
    onSuccessAcknowledge,
    existingVerification,
}) => {
    const [idPhoto, setIdPhoto] = useState<any>(null);
    const [selfiePhoto, setSelfiePhoto] = useState<any>(null);
    const [choiceModalVisible, setChoiceModalVisible] = useState(false);
    const [activeSetter, setActiveSetter] = useState<'id' | 'selfie' | null>(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        if (visible && existingVerification) {
            if (existingVerification.idUrl) {
                setIdPhoto({
                    uri: existingVerification.idUrl.startsWith('http')
                        ? existingVerification.idUrl
                        : `${API_CONFIG.BASE_URL}${existingVerification.idUrl}`,
                    isExisting: true,
                });
            }
            if (existingVerification.selfieUrl) {
                setSelfiePhoto({
                    uri: existingVerification.selfieUrl.startsWith('http')
                        ? existingVerification.selfieUrl
                        : `${API_CONFIG.BASE_URL}${existingVerification.selfieUrl}`,
                    isExisting: true,
                });
            }
        } else if (!visible) {
            setIdPhoto(null);
            setSelfiePhoto(null);
        }
    }, [existingVerification, visible]);

    const pickImage = async (setImage: (image: any) => void, useCamera: boolean = false) => {
        try {
            let result;

            if (useCamera) {
                const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                if (permissionResult.granted === false) {
                    setErrorModalMessage("You need to allow camera access to take a photo.");
                    setErrorModalVisible(true);
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                });
            } else {
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (permissionResult.granted === false) {
                    setErrorModalMessage("You need to allow gallery access to select a photo.");
                    setErrorModalVisible(true);
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                
                // Construct file object for FormData
                const localUri = asset.uri;
                const filename = localUri.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                setImage({
                    uri: localUri,
                    name: filename,
                    type: type,
                    isExisting: false,
                });
            }
        } catch (err) {
            console.error('Error picking image:', err);
        }
    };

    const handleUpload = () => {
        if (!idPhoto || !selfiePhoto || idPhoto.isExisting || selfiePhoto.isExisting) return;
        onUpload(idPhoto, selfiePhoto);
    };

    const promptPhotoChoice = (type: 'id' | 'selfie') => {
        setActiveSetter(type);
        setChoiceModalVisible(true);
    };

    const isProcessing = isUploading || isVerifying;
    const isFailed = existingVerification && (Number(existingVerification.verifyStatus) === 0 || existingVerification.statusName === 'Failed');
    const isPending = existingVerification && !isFailed && (Number(existingVerification.verifyStatus) !== 1 && existingVerification.statusName !== 'Passed');

    const canSubmit = idPhoto && selfiePhoto && !idPhoto.isExisting && !selfiePhoto.isExisting && !isProcessing;

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => {}}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Upload ID & Selfie</Text>
                    <Text style={styles.subtitle}>
                        You must upload a valid ID and a selfie for identity verification.
                    </Text>
                </View>

                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {existingVerification && (
                        <View style={[
                            styles.statusBanner,
                            isFailed ? styles.statusBannerFailed : styles.statusBannerPending
                        ]}>
                            <View style={styles.statusHeader}>
                                <Ionicons 
                                    name={isFailed ? "close-circle-outline" : "hourglass-outline"} 
                                    size={24} 
                                    color={isFailed ? "#EF4444" : "#D97706"} 
                                />
                                <Text style={[
                                    styles.statusTitle,
                                    { color: isFailed ? "#991B1B" : "#92400E" }
                                ]}>
                                    Verification {existingVerification.statusName || (isFailed ? "Failed" : "Pending")}
                                </Text>
                            </View>
                            <Text style={[
                                styles.statusText,
                                { color: isFailed ? "#7F1D1D" : "#78350F" }
                            ]}>
                                {isFailed 
                                    ? `Face match failed with a confidence level of ${Math.round(existingVerification.confidenceLevel)}%. Please upload a clearer ID and selfie where your face is fully visible and matches the ID.`
                                    : 'Your identity documents are uploaded. Please wait for automatic verification to complete.'
                                }
                            </Text>
                            {existingVerification.uploadedAt && (
                                <Text style={[
                                    styles.statusTime,
                                    { color: isFailed ? "#B91C1C" : "#B45309" }
                                ]}>
                                    Submitted on: {new Date(existingVerification.uploadedAt.replace(/-/g, '/')).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* ID Upload Section */}
                    {idPhoto ? (
                        <View style={styles.imageContainer}>
                            <Text style={styles.sectionTitle}>Valid ID</Text>
                            <Image source={{ uri: idPhoto.uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => setIdPhoto(null)}>
                                <Ionicons name="close-circle" size={30} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadSection}>
                            <Text style={styles.sectionTitle}>Upload Valid ID</Text>
                            <TouchableOpacity style={styles.uploadArea} onPress={() => promptPhotoChoice('id')}>
                                <Ionicons name="id-card-outline" size={48} color="#6B7280" />
                                <Text style={styles.uploadTextBold}>Tap to upload your ID</Text>
                                <Text style={styles.uploadTextSub}>PNG, JPG or JPEG</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Selfie Upload Section */}
                    {selfiePhoto ? (
                        <View style={styles.imageContainer}>
                            <Text style={styles.sectionTitle}>Selfie</Text>
                            <Image source={{ uri: selfiePhoto.uri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => setSelfiePhoto(null)}>
                                <Ionicons name="close-circle" size={30} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadSection}>
                            <Text style={styles.sectionTitle}>Upload Selfie</Text>
                            <TouchableOpacity style={styles.uploadArea} onPress={() => promptPhotoChoice('selfie')}>
                                <Ionicons name="person-outline" size={48} color="#6B7280" />
                                <Text style={styles.uploadTextBold}>Tap to upload your Selfie</Text>
                                <Text style={styles.uploadTextSub}>Ensure your face is clearly visible</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Messages */}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    {isFailed && (idPhoto?.isExisting || selfiePhoto?.isExisting) && (
                        <Text style={styles.retryHelperText}>
                            Please tap the "X" button on the photos and select new, clear images to retry verification.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            !canSubmit && styles.submitBtnDisabled
                        ]}
                        disabled={!canSubmit}
                        onPress={handleUpload}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                Submit for Verification
                            </Text>
                        )}
                    </TouchableOpacity>
                    {isProcessing && (
                        <Text style={styles.processingText}>
                            {isUploading ? 'Uploading photos...' : 'Verifying face match...'}
                        </Text>
                    )}
                </View>
            </View>

            <ConfirmationModal
                visible={choiceModalVisible}
                title="Select Option"
                message="Choose how you want to upload the photo"
                confirmText="Take Photo"
                cancelText="Choose from Gallery"
                icon="camera-outline"
                onConfirm={() => {
                    setChoiceModalVisible(false);
                    if (activeSetter === 'id') pickImage(setIdPhoto, true);
                    else if (activeSetter === 'selfie') pickImage(setSelfiePhoto, true);
                }}
                onCancel={() => {
                    setChoiceModalVisible(false);
                    if (activeSetter === 'id') pickImage(setIdPhoto, false);
                    else if (activeSetter === 'selfie') pickImage(setSelfiePhoto, false);
                }}
            />

            <SuccessModal
                visible={errorModalVisible}
                title="Permission Required"
                message={errorModalMessage}
                variant="error"
                actionLabel="OK"
                onClose={() => setErrorModalVisible(false)}
            />

            <SuccessModal
                visible={!!successMessage}
                title="Success"
                message={successMessage || ""}
                variant="success"
                actionLabel="OK"
                onClose={() => {
                    if (onSuccessAcknowledge) onSuccessAcknowledge();
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 10,
    },
    statusBanner: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        marginTop: 10,
    },
    statusBannerFailed: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
    },
    statusBannerPending: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    statusText: {
        fontSize: 14,
        lineHeight: 20,
    },
    statusTime: {
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
    },
    uploadSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 16,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    uploadTextBold: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
        marginBottom: 4,
    },
    uploadTextSub: {
        fontSize: 12,
        color: '#6B7280',
    },
    imageContainer: {
        marginBottom: 24,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        resizeMode: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: 36,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 2,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 10,
    },
    successText: {
        color: '#10B981',
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 10,
        fontSize: 16,
    },
    retryHelperText: {
        color: '#DC2626',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    submitBtn: {
        backgroundColor: '#2c8068',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    processingText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 8,
        fontSize: 14,
    },
});

