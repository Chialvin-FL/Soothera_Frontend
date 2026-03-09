import React from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
} from 'react-native';
import { Text } from '@/components/Text';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserRole } from '@/env';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RisingItem } from '@/components/native/RisingItem';

interface RoleSelectionScreenProps {
    onSelectRole: (role: UserRole) => void;
}

export default function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const [selectedRoleId, setSelectedRoleId] = useState<UserRole | null>(null);

    const roles = [
        {
            id: 'customer' as UserRole,
            title: 'Customer',
            image: require('../../../assets/illustrations/customer_role.png'),
        },
        {
            id: 'admin' as UserRole,
            title: 'Salon Owner',
            image: require('../../../assets/illustrations/salon_owner_role.png'),
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#151718]">
            <View className="flex-1 px-6 pt-10">
                <RisingItem delay={200}>
                    <Text className="text-3xl font-bold text-center mb-2" style={{ color: colors.text }}>
                        Choose your role
                    </Text>
                    <Text className="text-center text-gray-500 dark:text-gray-400">
                        Tell us how you would like to use Soothera
                    </Text>
                </RisingItem>

                <View className="mt-10 space-y-6 px-4">
                    {roles.map((role, index) => {
                        const isSelected = selectedRoleId === role.id;
                        return (
                            <RisingItem
                                key={role.id}
                                delay={400 + index * 200}
                                fadeIn={false}
                                className="w-full mb-8"
                            >
                                <TouchableOpacity
                                    onPress={() => setSelectedRoleId(role.id)}
                                    activeOpacity={0.8}
                                    className="w-full bg-white dark:bg-gray-800 rounded-[20px] items-center justify-center border-2 py-6"
                                    style={{
                                        borderColor: isSelected ? primaryColor : (isDark ? '#3a3a3a' : '#F3F4F6'),
                                        backgroundColor: isSelected ? (isDark ? '#1a1d1e' : '#FFFFFF') : (isDark ? '#1f1f1f' : '#FFFFFF'),
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 10 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 20,
                                        elevation: 5,
                                    }}
                                >
                                    <RisingItem delay={500 + index * 200} offset={10}>
                                        <View className="items-center justify-center">
                                            <Image
                                                source={role.image}
                                                className="mb-4"
                                                resizeMode="contain"
                                                style={{ width: 150, height: 150 }}
                                            />
                                            <Text className="text-2xl font-bold" style={{ color: isSelected ? primaryColor : colors.text }}>
                                                {role.title}
                                            </Text>
                                        </View>
                                    </RisingItem>

                                    {isSelected && (
                                        <Animated.View
                                            entering={FadeInUp.duration(300)}
                                            className="absolute -bottom-3 bg-white dark:bg-gray-800 rounded-full"
                                        >
                                            <Ionicons name="checkmark-circle" size={36} color={primaryColor} />
                                        </Animated.View>
                                    )}
                                </TouchableOpacity>
                            </RisingItem>
                        );
                    })}
                </View>

                <View className="flex-1" />

                <RisingItem delay={1000} className="mb-10">
                    <TouchableOpacity
                        onPress={() => selectedRoleId && onSelectRole(selectedRoleId)}
                        disabled={!selectedRoleId}
                        className="w-full py-4 rounded-3xl items-center justify-center flex-row"
                        style={{
                            backgroundColor: selectedRoleId ? primaryColor : '#E5E7EB',
                            opacity: selectedRoleId ? 1 : 0.6
                        }}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-lg font-bold mr-2">Continue</Text>
                    </TouchableOpacity>
                </RisingItem>


            </View>
        </SafeAreaView>
    );
}
