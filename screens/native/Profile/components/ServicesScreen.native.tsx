import React, { useEffect, useState } from 'react';
import {
    View, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Modal, StyleSheet, Switch, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import * as ImagePicker from 'expo-image-picker';
import { useServiceSlice } from '../serviceSlice';
import { MASSAGE_CATEGORIES, categoryLabel } from '../serviceService';
import { fetchMyEstablishment } from '../businessSettingsService';
import { API_CONFIG } from '@/api/config';
import type { SalonServiceResponse } from '@/api/types';

interface Props {
    onBack: () => void;
}

export default function ServicesScreen({ onBack }: Props) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';
    const ic = colors.icon;
    const tx = colors.text;
    const bg = colors.background;

    const slice = useServiceSlice();
    const {
        services, isLoading, modalMode, form, setForm,
        isSaving, isDeleting, error, successMessage, clearMessages,
        loadServices, openCreate, openEdit, closeModal, handleSave, handleDelete,
    } = slice;

    const [deleteTarget, setDeleteTarget] = useState<SalonServiceResponse | null>(null);
    const [showCatPicker, setShowCatPicker] = useState(false);
    const [establishmentId, setEstablishmentId] = useState('');
    const [loadingEstablishment, setLoadingEstablishment] = useState(true);

    // Resolve establishment ID on mount (same approach as BusinessSettingsScreen)
    useEffect(() => {
        fetchMyEstablishment().then((res) => {
            if (res.data?.id) {
                setEstablishmentId(res.data.id);
            }
            setLoadingEstablishment(false);
        });
    }, []);

    useEffect(() => {
        if (establishmentId) loadServices(establishmentId);
    }, [establishmentId]);

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 0.8,
        });
        if (!res.canceled && res.assets[0]) {
            const a = res.assets[0];
            setForm({ imageFile: { uri: a.uri, name: a.fileName ?? 'service.jpg', type: a.mimeType ?? 'image/jpeg' } });
        }
    };

    const addTier = () => setForm({ tiers: [...form.tiers, { price: '', duration: '' }] });
    const removeTier = (i: number) => setForm({ tiers: form.tiers.filter((_, idx) => idx !== i) });
    const updateTier = (i: number, field: 'price' | 'duration', val: string) => {
        const t = [...form.tiers];
        t[i] = { ...t[i], [field]: val.replace(/[^0-9]/g, '') };
        setForm({ tiers: t });
    };

    const addAddOn = () => setForm({ addOns: [...form.addOns, { name: '', price: '' }] });
    const removeAddOn = (i: number) => setForm({ addOns: form.addOns.filter((_, idx) => idx !== i) });
    const updateAddOn = (i: number, field: 'name' | 'price', val: string) => {
        const a = [...form.addOns];
        a[i] = { ...a[i], [field]: field === 'price' ? val.replace(/[^0-9]/g, '') : val };
        setForm({ addOns: a });
    };

    const onSave = () => handleSave(establishmentId);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const id = deleteTarget.salonServiceId;
        setDeleteTarget(null);
        handleDelete(id, establishmentId);
    };

    const inputBg = isDark ? '#1F1F1F' : '#F3F4F6';
    const borderCol = isDark ? '#2a2a2a' : '#E5E7EB';

    const fieldStyle = {
        backgroundColor: inputBg, borderRadius: 12,
        borderWidth: 1, borderColor: borderCol,
        paddingHorizontal: 14, paddingVertical: 12,
        color: tx, fontSize: 15,
    } as const;

    if (loadingEstablishment) {
        return (
            <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ color: ic, marginTop: 12 }}>Loading…</Text>
            </View>
        );
    }

    if (!establishmentId) {
        return (
            <View style={{ flex: 1, backgroundColor: bg }}>
                <View style={[s.header, { paddingTop: insets.top, backgroundColor: bg, borderBottomColor: borderCol }]}>
                    <TouchableOpacity onPress={onBack} style={[s.iconBtn, { backgroundColor: inputBg }]}>
                        <Ionicons name="arrow-back" size={22} color={tx} />
                    </TouchableOpacity>
                    <Text style={{ color: tx, fontSize: 18, fontWeight: 'bold', flex: 1 }}>Services &amp; Prices</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                    <Ionicons name="business-outline" size={56} color={ic} />
                    <Text style={{ color: tx, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>No Establishment Found</Text>
                    <Text style={{ color: ic, fontSize: 13, marginTop: 8, textAlign: 'center' }}>Create your establishment in Business Settings before adding services.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Header */}
            <View style={[s.header, { paddingTop: insets.top, backgroundColor: bg, borderBottomColor: borderCol }]}>
                <TouchableOpacity onPress={onBack} style={[s.iconBtn, { backgroundColor: inputBg }]}>
                    <Ionicons name="arrow-back" size={22} color={tx} />
                </TouchableOpacity>
                <Text style={{ color: tx, fontSize: 18, fontWeight: 'bold', flex: 1 }}>Services &amp; Prices</Text>
                <TouchableOpacity onPress={openCreate} style={[s.iconBtn, { backgroundColor: primaryColor }]}>
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Status Banner */}
            {(error || successMessage) && (
                <View style={[s.banner, {
                    backgroundColor: error ? (isDark ? '#2d1515' : '#FEF2F2') : (isDark ? '#0f2d1f' : '#F0FDF4'),
                    borderColor: error ? '#FCA5A5' : '#86EFAC',
                    marginHorizontal: 20, marginTop: insets.top + 60 + 8,
                }]}>
                    <Ionicons name={error ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={18} color={error ? '#EF4444' : '#22C55E'} />
                    <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: error ? '#EF4444' : '#16A34A' }}>{error ?? successMessage}</Text>
                    <TouchableOpacity onPress={clearMessages}><Ionicons name="close" size={16} color={error ? '#EF4444' : '#16A34A'} /></TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={{ color: ic, marginTop: 12 }}>Loading services…</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: insets.top + 60 + 16, paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
                >
                    {services.length === 0 ? (
                        <RisingItem delay={100}>
                            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                                <Ionicons name="cut-outline" size={64} color={ic} />
                                <Text style={{ color: ic, marginTop: 16, fontSize: 16, fontWeight: '600' }}>No services yet</Text>
                                <Text style={{ color: ic, marginTop: 6, fontSize: 13 }}>Tap + to add your first service</Text>
                            </View>
                        </RisingItem>
                    ) : (
                        services.map((svc, idx) => (
                            <RisingItem delay={idx * 60} key={svc.salonServiceId}>
                                <View style={[s.card, { backgroundColor: inputBg, borderColor: borderCol }]}>
                                    {svc.imageUrl ? (
                                        <Image
                                            source={{ uri: svc.imageUrl.startsWith('http') ? svc.imageUrl : `${API_CONFIG.BASE_URL}${svc.imageUrl}` }}
                                            style={{ width: '100%', height: 140, borderRadius: 10, marginBottom: 12 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={{ width: '100%', height: 100, borderRadius: 10, backgroundColor: isDark ? '#2a2a2a' : '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                            <Ionicons name="cut-outline" size={36} color={ic} />
                                        </View>
                                    )}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: tx, fontSize: 16, fontWeight: 'bold' }}>{svc.serviceName}</Text>
                                            <Text style={{ color: primaryColor, fontSize: 12, marginTop: 2 }}>{categoryLabel(svc.category)}</Text>
                                            {svc.description ? <Text style={{ color: ic, fontSize: 13, marginTop: 4 }} numberOfLines={2}>{svc.description}</Text> : null}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                                            <TouchableOpacity onPress={() => openEdit(svc)} style={[s.smallBtn, { backgroundColor: isDark ? '#1a2a3a' : '#EFF6FF' }]}>
                                                <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setDeleteTarget(svc)} style={[s.smallBtn, { backgroundColor: isDark ? '#2d1515' : '#FEF2F2' }]}>
                                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Tiers */}
                                    {svc.price.map((p, i) => (
                                        <View key={i} style={[s.tierRow, { borderColor: borderCol }]}>
                                            <Ionicons name="time-outline" size={14} color={ic} />
                                            <Text style={{ color: ic, fontSize: 13, marginLeft: 4 }}>{svc.durationMinutes[i]} min</Text>
                                            <Text style={{ color: primaryColor, fontWeight: '700', fontSize: 14, marginLeft: 'auto' }}>₱{p}</Text>
                                        </View>
                                    ))}

                                    {/* Add-ons */}
                                    {svc.addOns.length > 0 && (
                                        <View style={{ marginTop: 8 }}>
                                            <Text style={{ color: ic, fontSize: 11, marginBottom: 4 }}>ADD-ONS</Text>
                                            {svc.addOns.map((ao, i) => (
                                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: tx, fontSize: 13 }}>{ao}</Text>
                                                    <Text style={{ color: primaryColor, fontSize: 13 }}>+₱{svc.addOnPrices[i] ?? 0}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                        <View style={[s.badge, { backgroundColor: svc.isActive ? '#D1FAE5' : '#FEE2E2' }]}>
                                            <Text style={{ fontSize: 11, color: svc.isActive ? '#065F46' : '#991B1B', fontWeight: '600' }}>
                                                {svc.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </RisingItem>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Create / Edit Modal */}
            <Modal visible={!!modalMode} transparent animationType="slide" onRequestClose={closeModal}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' }}>
                        {/* Modal Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: borderCol }}>
                            <Text style={{ color: tx, fontSize: 18, fontWeight: 'bold', flex: 1 }}>
                                {modalMode === 'edit' ? 'Edit Service' : 'Add Service'}
                            </Text>
                            <TouchableOpacity onPress={closeModal} style={[s.iconBtn, { backgroundColor: inputBg }]}>
                                <Ionicons name="close" size={20} color={tx} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>

                            {/* Service Image */}
                            <Text style={{ color: tx, fontWeight: '600', marginBottom: 8 }}>Service Image</Text>
                            <TouchableOpacity onPress={pickImage} style={{ height: 120, borderRadius: 12, marginBottom: 16, overflow: 'hidden', backgroundColor: inputBg, borderWidth: 2, borderStyle: 'dashed', borderColor: borderCol, alignItems: 'center', justifyContent: 'center' }}>
                                {form.imageFile?.uri ? (
                                    <Image source={{ uri: form.imageFile.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="camera-outline" size={32} color={ic} />
                                        <Text style={{ color: ic, marginTop: 6, fontSize: 12 }}>Tap to pick an image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Name */}
                            <Text style={{ color: tx, fontWeight: '600', marginBottom: 6 }}>Service Name *</Text>
                            <TextInput
                                value={form.serviceName}
                                onChangeText={(v) => setForm({ serviceName: v })}
                                placeholder="e.g. Swedish Massage"
                                placeholderTextColor={ic}
                                style={[fieldStyle, { marginBottom: 16 }]}
                            />

                            {/* Description */}
                            <Text style={{ color: tx, fontWeight: '600', marginBottom: 6 }}>Description</Text>
                            <TextInput
                                value={form.description}
                                onChangeText={(v) => setForm({ description: v })}
                                placeholder="Brief description…"
                                placeholderTextColor={ic}
                                multiline
                                style={[fieldStyle, { minHeight: 80, textAlignVertical: 'top', marginBottom: 16 }]}
                            />

                            {/* Category */}
                            <Text style={{ color: tx, fontWeight: '600', marginBottom: 6 }}>Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowCatPicker(true)}
                                style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }]}
                            >
                                <Text style={{ flex: 1, color: tx, fontSize: 15 }}>
                                    {MASSAGE_CATEGORIES.find(c => c.value === form.category)?.label ?? 'Select category'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color={ic} />
                            </TouchableOpacity>

                            {/* Pricing Tiers */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ color: tx, fontWeight: '600' }}>Pricing Tiers *</Text>
                                <TouchableOpacity onPress={addTier} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
                                    <Text style={{ color: primaryColor, fontSize: 13 }}>Add Tier</Text>
                                </TouchableOpacity>
                            </View>
                            {form.tiers.map((tier, i) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <TextInput
                                        value={tier.duration}
                                        onChangeText={(v) => updateTier(i, 'duration', v)}
                                        placeholder="Min"
                                        placeholderTextColor={ic}
                                        keyboardType="numeric"
                                        style={[fieldStyle, { flex: 1 }]}
                                    />
                                    <TextInput
                                        value={tier.price}
                                        onChangeText={(v) => updateTier(i, 'price', v)}
                                        placeholder="₱ Price"
                                        placeholderTextColor={ic}
                                        keyboardType="numeric"
                                        style={[fieldStyle, { flex: 1 }]}
                                    />
                                    {form.tiers.length > 1 && (
                                        <TouchableOpacity onPress={() => removeTier(i)} style={[s.smallBtn, { backgroundColor: isDark ? '#2d1515' : '#FEF2F2' }]}>
                                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {/* Add-ons */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
                                <Text style={{ color: tx, fontWeight: '600' }}>Add-ons</Text>
                                <TouchableOpacity onPress={addAddOn} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
                                    <Text style={{ color: primaryColor, fontSize: 13 }}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            {form.addOns.map((ao, i) => (
                                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <TextInput
                                        value={ao.name}
                                        onChangeText={(v) => updateAddOn(i, 'name', v)}
                                        placeholder="Add-on name"
                                        placeholderTextColor={ic}
                                        style={[fieldStyle, { flex: 2 }]}
                                    />
                                    <TextInput
                                        value={ao.price}
                                        onChangeText={(v) => updateAddOn(i, 'price', v)}
                                        placeholder="₱"
                                        placeholderTextColor={ic}
                                        keyboardType="numeric"
                                        style={[fieldStyle, { flex: 1 }]}
                                    />
                                    <TouchableOpacity onPress={() => removeAddOn(i)} style={[s.smallBtn, { backgroundColor: isDark ? '#2d1515' : '#FEF2F2' }]}>
                                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Active Toggle */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 16 }}>
                                <Text style={{ color: tx, fontWeight: '600' }}>Active</Text>
                                <Switch value={form.isActive} onValueChange={(v) => setForm({ isActive: v })} trackColor={{ true: primaryColor, false: borderCol }} />
                            </View>

                            {/* Error in modal */}
                            {error && (
                                <View style={[s.banner, { backgroundColor: isDark ? '#2d1515' : '#FEF2F2', borderColor: '#FCA5A5', marginBottom: 12 }]}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                                    <Text style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#EF4444' }}>{error}</Text>
                                </View>
                            )}

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={onSave}
                                disabled={isSaving}
                                style={{ backgroundColor: isSaving ? '#aaa' : primaryColor, borderRadius: 100, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                            >
                                {isSaving ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name={modalMode === 'edit' ? 'save-outline' : 'add-circle-outline'} size={20} color="#fff" />
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                            {modalMode === 'edit' ? 'Save Changes' : 'Create Service'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Picker Modal */}
            <Modal visible={showCatPicker} transparent animationType="slide" onRequestClose={() => setShowCatPicker(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' }}>
                        <Text style={{ color: tx, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Category</Text>
                        <ScrollView>
                            {MASSAGE_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    onPress={() => { setForm({ category: cat.value }); setShowCatPicker(false); }}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: borderCol }}
                                >
                                    <Text style={{ color: tx, fontSize: 15 }}>{cat.label}</Text>
                                    {form.category === cat.value && <Ionicons name="checkmark" size={20} color={primaryColor} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
                <View style={s.modalOverlay}>
                    <View style={[s.modalCard, { backgroundColor: isDark ? '#1F1F1F' : '#fff' }]}>
                        <View style={s.modalIconWrap}>
                            <Ionicons name="warning-outline" size={32} color="#EF4444" />
                        </View>
                        <Text style={[s.modalTitle, { color: tx }]}>Delete Service?</Text>
                        <Text style={[s.modalBody, { color: ic }]}>
                            "{deleteTarget?.serviceName}" will be permanently deleted. This cannot be undone.
                        </Text>
                        <View style={s.modalActions}>
                            <TouchableOpacity style={[s.modalBtn, { backgroundColor: inputBg }]} onPress={() => setDeleteTarget(null)}>
                                <Text style={{ color: tx, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#EF4444' }]} onPress={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    header: { position: 'absolute', left: 0, right: 0, top: 0, borderBottomWidth: 1, zIndex: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
    tierRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, marginTop: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    smallBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    banner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modalCard: { borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
    modalIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    modalBody: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
