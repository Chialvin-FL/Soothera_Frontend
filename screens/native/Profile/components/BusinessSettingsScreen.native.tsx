import React, { useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessSettingsSlice } from '../businessSettingsSlice';

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
                    borderColor: isDark ? '#2a2a2a' : '#E5E7EB',
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
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={iconColor}
                    multiline={multiline}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    style={{
                        flex: 1,
                        color: textColor,
                        textAlignVertical: multiline ? 'top' : 'center',
                        fontSize: 15,
                        paddingVertical: multiline ? 0 : 12,
                    }}
                />
            </View>
        </View>
    );
}

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

    // ── Image Picker ──
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setForm({
                pictureFile: {
                    uri: asset.uri,
                    name: asset.fileName ?? 'salon_image.jpg',
                    type: asset.mimeType ?? 'image/jpeg',
                },
            });
        }
    };

    // ── Save handler ──
    const onSave = () => {
        clearMessages();
        // Salon image is required when creating a new establishment
        if (!existingId && !form.pictureFile?.uri) {
            Alert.alert('Image Required', 'Please select a salon image before creating your establishment.');
            return;
        }
        handleSave(() => {
            Alert.alert('Success', 'Business settings saved successfully!');
        });
    };

    // ── Delete handler ──
    const onDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        handleDelete(() => {
            Alert.alert('Deleted', 'Your establishment has been removed.');
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
                                ? 'Editing your salon establishment'
                                : 'No establishment yet — fill in the form to create one'}
                        </Text>
                    </View>

                    {/* ── Salon Banner Image ── */}
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Salon Image
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
                        {form.pictureFile?.uri ? (
                            <Image
                                source={{ uri: form.pictureFile.uri }}
                                style={{ width: '100%', height: '100%', borderRadius: 14 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="camera-outline" size={36} color={colors.icon} />
                                <Text
                                    style={{ color: colors.icon, marginTop: 8, fontSize: 13 }}
                                >
                                    Tap to select a salon image
                                </Text>
                                <Text style={{ color: colors.icon, fontSize: 11, marginTop: 2 }}>
                                    JPG / PNG (16:9 recommended)
                                </Text>
                            </View>
                        )}
                        {/* Edit overlay if image exists */}
                        {form.pictureFile?.uri && (
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
                        )}
                    </TouchableOpacity>

                    {/* ── Basic Info ── */}
                    <InputField
                        label="Salon Name *"
                        placeholder="Enter salon name"
                        value={form.name}
                        onChangeText={(t) => setForm({ name: t })}
                        icon="storefront-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />
                    <InputField
                        label="Description"
                        placeholder="Tell customers about your salon…"
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
                        placeholder="e.g. +63 912 345 6789"
                        value={form.contactNumber}
                        onChangeText={(t) => setForm({ contactNumber: t })}
                        keyboardType="phone-pad"
                        icon="call-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />
                    <InputField
                        label="Business Hours"
                        placeholder="e.g. Mon–Fri 9AM–8PM"
                        value={form.businessHours}
                        onChangeText={(t) => setForm({ businessHours: t })}
                        icon="time-outline"
                        isDark={isDark}
                        textColor={colors.text}
                        iconColor={colors.icon}
                    />

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
                        label="Facebook Page URL"
                        placeholder="https://facebook.com/your-salon"
                        value={form.facebookLink}
                        onChangeText={(t) => setForm({ facebookLink: t })}
                        keyboardType="url"
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
                            This will permanently delete your salon establishment and all its
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
