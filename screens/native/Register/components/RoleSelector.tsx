import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { UserRole } from '@/env';
import { ColorValue } from 'react-native';

interface RoleSelectorProps {
    selectedRole: UserRole;
    onSelectRole: (role: UserRole) => void;
    primaryColor: ColorValue;
}

export const RoleSelector = ({ selectedRole, onSelectRole, primaryColor }: RoleSelectorProps) => {
    return (
        <View className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-6 flex-row">
            <TouchableOpacity
                className="flex-1 py-3 rounded-full items-center"
                style={{ backgroundColor: selectedRole === 'customer' ? primaryColor : 'transparent' }}
                onPress={() => onSelectRole('customer')}
            >
                <Text
                    className={`font-semibold ${selectedRole === 'customer' ? 'text-white' : 'text-gray-500'}`}
                >
                    Customer
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 py-3 rounded-full items-center"
                style={{ backgroundColor: selectedRole === 'admin' ? primaryColor : 'transparent' }}
                onPress={() => onSelectRole('admin')}
            >
                <Text
                    className={`font-semibold ${selectedRole === 'admin' ? 'text-white' : 'text-gray-500'}`}
                >
                    Salon Owner
                </Text>
            </TouchableOpacity>
        </View>
    );
};
