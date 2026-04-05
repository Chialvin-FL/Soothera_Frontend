import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { useStaffRegisterSlice } from './staffRegisterSlice';
import { SuccessModal } from '@/components/native/SuccessModal';

// Mock staff data
const mockStaffList = [
    { id: '1', name: 'Jane Doe', role: 'Senior Therapist', status: 'Active' },
    { id: '2', name: 'John Smith', role: 'Massage Therapist', status: 'Inactive' },
    { id: '3', name: 'Emily Clark', role: 'Receptionist', status: 'Active' },
];

interface StaffManagementScreenProps {
    onBack: () => void;
}

export default function StaffManagementScreen({ onBack }: StaffManagementScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const {
        email,
        isLoading,
        error,
        setEmail,
        clearError,
        handleRegister,
        resetForm
    } = useStaffRegisterSlice();

    const [isAddStaffModalVisible, setIsAddStaffModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    return (
        <View className="flex-1 bg-white dark:bg-[#151718]">
            <View
                className="absolute left-0 right-0 flex-row items-center px-5 py-4 z-10"
                style={{
                    backgroundColor: colors.background,
                    top: 0,
                    paddingTop: insets.top,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    className="w-10 h-10 items-center justify-center rounded-full mr-3"
                    style={{ backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6' }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1" style={{ color: colors.text }} numberOfLines={1}>
                    Staff Management
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 56 + 20,
                    paddingBottom: insets.bottom + 80, // Extra padding for FAB
                    paddingHorizontal: 20,
                }}
            >
                {mockStaffList.map((staff, index) => (
                    <RisingItem key={staff.id} delay={index * 100}>
                        <View
                            className="p-4 mb-4 rounded-2xl bg-white dark:bg-[#1F1F1F] flex-row items-center shadow-sm"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                        >
                            <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.primary + '20' }}>
                                <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                                    {staff.name.charAt(0)}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold mb-1" style={{ color: colors.text }}>
                                    {staff.name}
                                </Text>
                                <Text className="text-sm" style={{ color: colors.icon }}>
                                    {staff.role}
                                </Text>
                            </View>
                            <View className="mr-3">
                                <View className={`px-2 py-1 rounded-full ${staff.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Text className={`text-xs ${staff.status === 'Active' ? 'text-green-700' : 'text-gray-500'}`}>{staff.status}</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="p-2" onPress={() => console.log('Edit', staff.id)}>
                                <Ionicons name="pencil-outline" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2" onPress={() => console.log('Delete', staff.id)}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </RisingItem>
                ))}
            </ScrollView>

            {/* FAB for adding staff */}
            <TouchableOpacity
                className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{
                    backgroundColor: primaryColor,
                    bottom: insets.bottom + 20,
                    right: 20,
                    elevation: 5,
                }}
                onPress={() => setIsAddStaffModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Add Staff Modal */}
            <Modal
                visible={isAddStaffModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsAddStaffModalVisible(false);
                    resetForm();
                }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-end bg-black/50">
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                            <View
                                className="bg-white dark:bg-[#151718] rounded-t-3xl p-6"
                                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                            >
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold" style={{ color: colors.text }}>
                                        Add New Staff
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setIsAddStaffModalVisible(false);
                                        resetForm();
                                    }}>
                                        <Ionicons name="close" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                {error ? (
                                    <View className="bg-red-100 p-3 rounded-lg mb-4">
                                        <Text className="text-red-600 text-sm">{error}</Text>
                                    </View>
                                ) : null}

                                <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                                    Email
                                </Text>
                                <TextInput
                                    className="w-full p-4 rounded-xl mb-6 bg-gray-100 dark:bg-[#2a2a2a]"
                                    style={{ color: colors.text }}
                                    placeholder="Enter staff email"
                                    placeholderTextColor={colors.icon}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => { setEmail(text); clearError(); }}
                                />

                                <TouchableOpacity
                                    className="w-full p-4 rounded-xl items-center flex-row justify-center"
                                    style={{ backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }}
                                    disabled={isLoading}
                                    onPress={() => handleRegister((msg) => {
                                        setIsAddStaffModalVisible(false);
                                        setIsSuccessModalVisible(true);
                                    })}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                                    ) : null}
                                    <Text className="text-white font-bold text-lg">
                                        {isLoading ? 'Adding...' : 'Add Staff'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <SuccessModal
                visible={isSuccessModalVisible}
                title="Staff Added"
                message="Staff member added successfully! Please check email for verification."
                onClose={() => setIsSuccessModalVisible(false)}
            />
        </View>
    );
}
