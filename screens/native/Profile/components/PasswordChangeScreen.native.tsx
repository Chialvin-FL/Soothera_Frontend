import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PasswordChangeScreenProps {
  onBack: () => void;
}

export default function PasswordChangeScreen({ onBack }: PasswordChangeScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    // TODO: validate and call API
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
          Change Password
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
          Current Password
        </Text>
        <View className="flex-row items-center rounded-xl border pr-2 mb-4" style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB', backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB' }}>
          <TextInput
            className="flex-1 p-4 text-base"
            style={{ color: colors.text }}
            placeholder="Enter current password"
            placeholderTextColor={colors.icon}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
          />
          <TouchableOpacity onPress={() => setShowCurrent((s) => !s)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          New Password
        </Text>
        <View className="flex-row items-center rounded-xl border pr-2 mb-4" style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB', backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB' }}>
          <TextInput
            className="flex-1 p-4 text-base"
            style={{ color: colors.text }}
            placeholder="Enter new password"
            placeholderTextColor={colors.icon}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew((s) => !s)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          Confirm New Password
        </Text>
        <View className="flex-row items-center rounded-xl border pr-2" style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB', backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB' }}>
          <TextInput
            className="flex-1 p-4 text-base"
            style={{ color: colors.text }}
            placeholder="Confirm new password"
            placeholderTextColor={colors.icon}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
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
            Update Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
