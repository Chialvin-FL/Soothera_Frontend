import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessSettingsSlice } from '../businessSettingsSlice';
import { SuccessModal } from '@/components/native/SuccessModal';
import { API_CONFIG } from '@/api/config';

// ── Input Field Component (defined outside to keep a stable reference) ──
interface InputFieldProps {
    label: string;
    placeholder: string;
    multiline?: boolean;
    value: string;
    onChangeText: (t: string) => void;
    icon?: keyof typeof Ionicons.glyphMap;
    keyboardType?: 'default' | 'phone-pad' | 'url';
    isDark: boolean;
    textColor: string;
    iconColor: string;
    prefix?: string;
    error?: string;
    maxLength?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

function InputField({
    label,
    placeholder,
    multiline = false,
    value,
    onChangeText,
    icon,
    keyboardType = 'default',
    isDark,
    textColor,
    iconColor,
    prefix,
    error,
    maxLength,
    autoCapitalize,
}: InputFieldProps) {
    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: textColor }}>
                {label}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: multiline ? 'flex-start' : 'center',
                    backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: multiline ? 12 : 0,
                    minHeight: multiline ? 96 : 48,
                    borderWidth: 1,
                    borderColor: error ? '#EF4444' : (isDark ? '#2a2a2a' : '#E5E7EB'),
                }}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={iconColor}
                        style={{ marginRight: 8, marginTop: multiline ? 2 : 0 }}
                    />
                )}
                {prefix && (
                    <Text style={{ color: textColor, fontSize: 15, marginRight: 2 }}>{prefix}</Text>
                )}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={iconColor}
                    multiline={multiline}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    autoCapitalize={autoCapitalize}
                    style={{
                        flex: 1,
                        color: textColor,
                        textAlignVertical: multiline ? 'top' : 'center',
                        fontSize: 15,
                        paddingVertical: multiline ? 0 : 12,
                    }}
                />
            </View>
            {error ? (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

interface BusinessSettingsScreenProps {
    onBack: () => void;
}

export default function BusinessSettingsScreen({ onBack }: BusinessSettingsScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const {
        form,
        setForm,
        existingId,
        establishment,
        isLoading,
        isSaving,
        isDeleting,
        error,
        successMessage,
        clearMessages,
        handleSave,
        handleDelete,
    } = useBusinessSettingsSlice();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState<{
        visible: boolean;
        variant: 'success' | 'error';
        title: string;
        message: string;
    }>({
        visible: false,
        variant: 'success',
        title: '',
        message: '',
    });

    const [showHoursModal, setShowHoursModal] = useState(false);
    const [tempHours, setTempHours] = useState<{
        selectedDays: string[];
        is24Hours: boolean;
        startTime: string;
        endTime: string;
    }>({
        selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        is24Hours: false,
        startTime: '9:00 AM',
        endTime: '5:00 PM'
    });

    const startScrollRef = useRef<ScrollView>(null);
    const endScrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (showHoursModal && !tempHours.is24Hours) {
            setTimeout(() => {
                const sIndex = TIMES.indexOf(tempHours.startTime);
                if (sIndex !== -1) startScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter(t => t !== tempHours.startTime);
                const eIndex = validEndTimes.indexOf(tempHours.endTime);
                if (eIndex !== -1) endScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [showHoursModal, tempHours.is24Hours]);

    const handleOpenHours = () => {
        if (form.businessHours) {
            try {
                const parts = form.businessHours.split(', ').map(p => p.trim());
                if (parts.length > 0) {
                    const timePart = parts.pop() || '';
                    const dayPart = parts.join(', ') || '';

                    let is24Hours = false;
                    let startTime = '9:00 AM';
                    let endTime = '5:00 PM';

                    if (timePart.toLowerCase() === '24 hours') {
                        is24Hours = true;
                    } else if (timePart.includes(' - ')) {
                        const [s, e] = timePart.split(' - ');
                        if (s && e) {
                            startTime = s;
                            endTime = e;
                        }
                    }

                    let selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    if (dayPart.toLowerCase() === 'daily') {
                        selectedDays = [...DAYS];
                    } else if (dayPart.toLowerCase() === 'mon - fri') {
                        selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    } else if (dayPart) {
                        const parsedDays = dayPart.split(',').map(d => d.trim()).filter(d => DAYS.includes(d));
                        if (parsedDays.length > 0) selectedDays = parsedDays;
                    }

                    setTempHours({
                        selectedDays,
                        is24Hours,
                        startTime,
                        endTime
                    });
                    setShowHoursModal(true);
                    return;
                }
            } catch (err) {
                console.log('[BusinessSettingsScreen] parse hours error:', err);
            }
        }
        setShowHoursModal(true);
    };

    const handleSaveHours = () => {
        let dayStr = tempHours.selectedDays.join(', ');
        if (tempHours.selectedDays.length === 7) {
            dayStr = 'Daily';
        } else if (tempHours.selectedDays.join(', ') === 'Mon, Tue, Wed, Thu, Fri') {
            dayStr = 'Mon - Fri';
        }

        const timeStr = tempHours.is24Hours ? '24 Hours' : `${tempHours.startTime} - ${tempHours.endTime}`;
        setForm({ businessHours: `${dayStr}, ${timeStr}` });
        setShowHoursModal(false);
    };

    const showFeedback = (variant: 'success' | 'error', title: string, message: string) => {
        console.log(`[BusinessSettingsScreen] showFeedback: variant=${variant}, title=${title}`);
        setFeedbackModal({ visible: true, variant, title, message });
    };

    const hideFeedback = () => setFeedbackModal((prev) => ({ ...prev, visible: false }));

    // ── Image Picker ──
    const pickImage = async () => {
        console.log('[BusinessSettingsScreen] pickImage: requesting permission...');
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showFeedback('error', 'Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 10], // Updated to 16:10 as requested
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            console.log('[BusinessSettingsScreen] pickImage: image selected =', asset.uri);
            setForm({
                pictureFile: {
                    uri: asset.uri,
                    name: asset.fileName ?? 'massage_spa_image.jpg',
                    type: asset.mimeType ?? 'image/jpeg',
                },
            });
        } else {
            console.log('[BusinessSettingsScreen] pickImage: cancelled or no asset.');
        }
    };

    // ── Save handler ──
    const onSave = () => {
        console.log('[BusinessSettingsScreen] onSave pressed. existingId =', existingId ?? 'none (CREATE)');
        clearMessages();

        const hasExistingImage = Boolean(establishment?.salonPicture && establishment.salonPicture !== 'null' && establishment.salonPicture.trim() !== '');

        // Massage spa image is required when creating a new establishment
        if (!existingId && !form.pictureFile?.uri && !hasExistingImage) {
            console.warn('[BusinessSettingsScreen] onSave: missing image for CREATE.');
            showFeedback('error', 'Image Required', 'Please select a massage spa image before creating your establishment.');
            return;
        }

        // Contact number validation if entered
        if (form.contactNumber && (!form.contactNumber.startsWith('09') || form.contactNumber.length !== 11)) {
            showFeedback('error', 'Invalid Contact Number', 'Contact number must start with 09 and be exactly 11 digits long.');
            return;
        }
        // Capture mode before async — closure would read stale existingId after reload
        const isCreate = !existingId;
        handleSave(() => {
            console.log('[BusinessSettingsScreen] onSave: handleSave success callback fired. isCreate =', isCreate);
            showFeedback(
                'success',
                isCreate ? 'Establishment Created!' : 'Changes Saved!',
                isCreate
                    ? 'Your massage spa establishment has been created successfully.'
                    : 'Your business settings have been updated successfully.',
            );
        });
    };

    // ── Delete handler ──
    const onDelete = () => {
        console.log('[BusinessSettingsScreen] onDelete pressed.');
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        console.log('[BusinessSettingsScreen] confirmDelete: user confirmed deletion.');
        setShowDeleteConfirm(false);
        handleDelete(() => {
            console.log('[BusinessSettingsScreen] confirmDelete: handleDelete success callback fired.');
            showFeedback('success', 'Establishment Deleted', 'Your massage spa establishment has been removed.');
        });
    };

    if (isLoading) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: colors.background }}
            >
                <ActivityIndicator size="large" color={primaryColor} />
                <Text className="mt-3 text-sm" style={{ color: colors.icon }}>
                    Loading business settings…
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* ── Header ── */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                    zIndex: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingBottom: 14,
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>
                    Business Settings
                </Text>
                {/* Delete button — only visible if there's an existing establishment */}
                {existingId && (
                    <TouchableOpacity
                        onPress={onDelete}
                        disabled={isDeleting}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: isDark ? '#2a1a1a' : '#FEF2F2',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Scrollable Content ── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingTop: insets.top + 60 + 20,
                    paddingBottom: insets.bottom + 120,
                    paddingHorizontal: 20,
                }}
            >
                <RisingItem delay={100}>

                    {/* ── Mode Label ── */}
                    <View
                        style={{
                            marginBottom: 20,
                            padding: 12,
                            borderRadius: 12,
                            backgroundColor: isDark ? '#1a2a1f' : '#F0FDF4',
                            borderWidth: 1,
                            borderColor: isDark ? '#2a4a2f' : '#BBF7D0',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <Ionicons
                            name={existingId ? 'business-outline' : 'add-circle-outline'}
                            size={18}
                            color={primaryColor}
                        />
                        <Text style={{ fontSize: 13, color: primaryColor, flex: 1, fontWeight: '500' }}>
                            {existingId
                                ? 'Editing your massage spa establishment'
                                : 'No establishment yet — fill in the form to create one'}
                        </Text>
                    </View>

                    {/* ── Massage Spa Banner Image ── */}
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Massage Spa Image
                    </Text>
                    <TouchableOpacity
                        onPress={pickImage}
                        style={{
                            height: 160,
                            borderRadius: 16,
                            marginBottom: 20,
                            overflow: 'hidden',
                            backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: isDark ? '#3a3a3a' : '#D1D5DB',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {(() => {
                            const hasExistingImage = Boolean(establishment?.salonPicture && establishment.salonPicture !== 'null' && establishment.salonPicture.trim() !== '');
                            const bgImageUrl = form.pictureFile?.uri || (hasExistingImage ? (establishment!.salonPicture.startsWith('http') ? establishment!.salonPicture : `${API_CONFIG.BASE_URL}${establishment!.salonPicture}`) : null);

                            if (bgImageUrl) {
                                return (
                                    <Image
                                        source={{ uri: bgImageUrl }}
                                        style={{ width: '100%', height: '100%', borderRadius: 14 }}
                                        resizeMode="cover"
                                    />
                                );
                            }

                            return (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="camera-outline" size={36} color={colors.icon} />
                                    <Text
                                        style={{ color: colors.icon, marginTop: 8, fontSize: 13 }}
                                    >
                                        Tap to select a massage spa image
                                    </Text>
                                    <Text style={{ color: colors.icon, fontSize: 11, marginTop: 2 }}>
                                        JPG / PNG (16:10 recommended)
                                    </Text>
                                </View>
                            );
                        })()}
                        {/* Edit overlay if image exists */}
                        {(form.pictureFile?.uri || (establishment?.salonPicture && establishment.salonPicture !== 'null' && establishment.salonPicture.trim() !== '')) ? (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 20,
                                    padding: 6,
                                }}
                            >
                                <Ionicons name="camera-outline" size={16} color="#fff" />
                            </View>
                        ) : null}
                    </TouchableOpacity>

                    {/* ── Basic Info ── */}
                    <InputField
                        label="Massage Spa Name *"
                        placeholder="Enter massage spa name"
                        value={form.name}
                        onChangeText={(t) => setForm({ name: t })}
                        icon="storefront-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />
                    <InputField
                        label="Description"
                        placeholder="Tell customers about your massage spa…"
                        multiline
                        value={form.description}
                        onChangeText={(t) => setForm({ description: t })}
                        icon="document-text-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />
                    <InputField
                        label="Location / Address *"
                        placeholder="Enter full address"
                        value={form.address}
                        onChangeText={(t) => setForm({ address: t })}
                        icon="location-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />
                    <InputField
                        label="Contact Number"
                        placeholder="e.g. 09123456789"
                        value={form.contactNumber}
                        onChangeText={(t) => {
                            const numeric = t.replace(/[^0-9]/g, '');
                            if (numeric.length <= 11) {
                                setForm({ contactNumber: numeric });
                            }
                        }}
                        keyboardType="phone-pad"
                        icon="call-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                        maxLength={11}
                        error={form.contactNumber.length > 0 && (!form.contactNumber.startsWith('09') || form.contactNumber.length !== 11) ? 'Must start with 09 and be 11 digits' : undefined}
                    />

                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Business Hours
                    </Text>
                    <TouchableOpacity
                        onPress={handleOpenHours}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                            borderRadius: 12,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            borderWidth: 1,
                            borderColor: isDark ? '#2a2a2a' : '#E5E7EB',
                            marginBottom: 16,
                        }}
                    >
                        <Ionicons name="time-outline" size={18} color={colors.icon} style={{ marginRight: 8 }} />
                        <Text style={{ flex: 1, color: form.businessHours ? colors.text : colors.icon, fontSize: 15 }}>
                            {form.businessHours || 'Select business hours'}
                        </Text>
                    </TouchableOpacity>

                    {/* ── Socials ── */}
                    <View
                        style={{
                            height: 1,
                            backgroundColor: isDark ? '#2a2a2a' : '#E5E7EB',
                            marginBottom: 16,
                            marginTop: 4,
                        }}
                    />
                    <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                        Social Links
                    </Text>
                    <InputField
                        label="Facebook Page Handle"
                        placeholder="your-massage-spa"
                        value={form.facebookLink.replace(/^(https?:\/\/(www\.)?facebook\.com\/)?/i, '')}
                        onChangeText={(t) => {
                            const handle = t.replace(/^(https?:\/\/(www\.)?facebook\.com\/)?/i, '').replace(/\//g, '');
                            setForm({ facebookLink: handle ? `https://www.facebook.com/${handle}` : '' });
                        }}
                        prefix="https://www.facebook.com/"
                        keyboardType="default"
                        autoCapitalize="none"
                        icon="logo-facebook"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />

                    {/* ── Navigation Items ── */}
                    <View
                        style={{
                            height: 1,
                            backgroundColor: isDark ? '#2a2a2a' : '#E5E7EB',
                            marginBottom: 8,
                            marginTop: 4,
                        }}
                    />
                    {[
                        { label: 'Services & Prices' },
                        { label: 'Vouchers & Promos' },
                        { label: 'Refund Rules' },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 14,
                                borderBottomWidth: 1,
                                borderBottomColor: isDark ? '#2a2a2a' : '#F3F4F6',
                            }}
                        >
                            <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                {item.label}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    ))}

                    {/* ── Status Banner ── */}
                    {(error || successMessage) && (
                        <View
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                borderRadius: 12,
                                backgroundColor: error
                                    ? isDark ? '#2d1515' : '#FEF2F2'
                                    : isDark ? '#0f2d1f' : '#F0FDF4',
                                borderWidth: 1,
                                borderColor: error ? '#FCA5A5' : '#86EFAC',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Ionicons
                                name={error ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                                size={18}
                                color={error ? '#EF4444' : '#22C55E'}
                            />
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 13,
                                    color: error ? '#EF4444' : '#16A34A',
                                    fontWeight: '500',
                                }}
                            >
                                {error ?? successMessage}
                            </Text>
                            <TouchableOpacity onPress={clearMessages}>
                                <Ionicons
                                    name="close"
                                    size={16}
                                    color={error ? '#EF4444' : '#16A34A'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </RisingItem>
            </ScrollView>

            {/* ── Save Button ── */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom + 12, 24),
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#2a2a2a' : '#E5E7EB',
                }}
            >
                <TouchableOpacity
                    onPress={onSave}
                    disabled={isSaving}
                    style={{
                        backgroundColor: isSaving ? '#aaa' : primaryColor,
                        borderRadius: 100,
                        paddingVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                    }}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name={existingId ? 'save-outline' : 'add-circle-outline'}
                                size={20}
                                color="#fff"
                            />
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                {existingId ? 'Save Changes' : 'Create Establishment'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Delete Confirmation Modal ── */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalCard,
                            { backgroundColor: isDark ? '#1F1F1F' : '#fff' },
                        ]}
                    >
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="warning-outline" size={32} color="#EF4444" />
                        </View>
                        <Text
                            style={[styles.modalTitle, { color: colors.text }]}
                        >
                            Delete Establishment?
                        </Text>
                        <Text
                            style={[styles.modalBody, { color: colors.icon }]}
                        >
                            This will permanently delete your massage spa establishment and all its
                            settings. This action cannot be undone.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6' }]}
                                onPress={() => setShowDeleteConfirm(false)}
                            >
                                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#EF4444' }]}
                                onPress={confirmDelete}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Business Hours Modal ── */}
            <Modal visible={showHoursModal} transparent animationType="slide" onRequestClose={() => setShowHoursModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Select Business Hours</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Available Days</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {DAYS.map(day => {
                                    const isSelected = tempHours.selectedDays.includes(day);
                                    return (
                                        <TouchableOpacity
                                            key={`day-${day}`}
                                            onPress={() => {
                                                setTempHours(prev => ({
                                                    ...prev,
                                                    selectedDays: isSelected
                                                        ? prev.selectedDays.filter(d => d !== day)
                                                        : [...prev.selectedDays, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
                                                }))
                                            }}
                                            style={{
                                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                                                backgroundColor: isSelected ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'),
                                                flexDirection: 'row', alignItems: 'center'
                                            }}>
                                            <Text style={{ color: isSelected ? '#fff' : colors.text }}>{day}</Text>
                                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" style={{ marginLeft: 6 }} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingVertical: 8, borderBottomWidth: 1, borderTopWidth: 1, borderColor: isDark ? '#2a2a2a' : '#E5E7EB' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="time" size={20} color={primaryColor} style={{ marginRight: 8 }} />
                                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>24 Hours Open</Text>
                                </View>
                                <Switch
                                    value={tempHours.is24Hours}
                                    onValueChange={(val) => setTempHours(prev => ({ ...prev, is24Hours: val }))}
                                    trackColor={{ false: isDark ? '#3a3a3a' : '#D1D5DB', true: primaryColor }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {!tempHours.is24Hours && (
                                <>
                                    <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Start Time</Text>
                                    <ScrollView ref={startScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                        {TIMES.map(time => (
                                            <TouchableOpacity key={`start-time-${time}`} onPress={() => {
                                                const nextEnd = tempHours.endTime === time ? (TIMES.find(t => t !== time) || '5:00 PM') : tempHours.endTime;
                                                setTempHours({ ...tempHours, startTime: time, endTime: nextEnd });
                                            }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: tempHours.startTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'), marginRight: 8 }}>
                                                <Text style={{ color: tempHours.startTime === time ? '#fff' : colors.text }}>{time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>End Time</Text>
                                    <ScrollView ref={endScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                                        {TIMES.filter(t => t !== tempHours.startTime).map(time => (
                                            <TouchableOpacity key={`end-time-${time}`} onPress={() => setTempHours({ ...tempHours, endTime: time })} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: tempHours.endTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'), marginRight: 8 }}>
                                                <Text style={{ color: tempHours.endTime === time ? '#fff' : colors.text }}>{time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </>
                            )}

                            <TouchableOpacity
                                onPress={handleSaveHours}
                                disabled={tempHours.selectedDays.length === 0}
                                style={{ backgroundColor: tempHours.selectedDays.length === 0 ? (isDark ? '#3a3a3a' : '#D1D5DB') : primaryColor, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save Hours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowHoursModal(false)} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
                                <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Feedback Modal (Success / Error) ── */}
            <SuccessModal
                visible={feedbackModal.visible}
                variant={feedbackModal.variant}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onClose={hideFeedback}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    modalIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalBody: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
});
