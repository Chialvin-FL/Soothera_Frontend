import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export default function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('User Profile');
  const [email, setEmail] = useState('profile@soothera.com');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    // TODO: persist and call API
    onBack();
  };

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
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          Edit Profile
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
      >
        <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          Full Name
        </Text>
        <TextInput
          className="p-4 rounded-xl border text-base mb-4"
          style={{
            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
            color: colors.text,
          }}
          placeholder="Enter your name"
          placeholderTextColor={colors.icon}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          Email
        </Text>
        <TextInput
          className="p-4 rounded-xl border text-base mb-4"
          style={{
            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
            color: colors.text,
          }}
          placeholder="Enter your email"
          placeholderTextColor={colors.icon}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          Phone (optional)
        </Text>
        <TextInput
          className="p-4 rounded-xl border text-base"
          style={{
            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
            color: colors.text,
          }}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.icon}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t"
        style={{
          borderTopColor: isDark ? '#2a2a2a' : '#E5E7EB',
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="w-full py-4 rounded-xl items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Text className="text-base font-semibold" style={{ color: '#fff' }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
