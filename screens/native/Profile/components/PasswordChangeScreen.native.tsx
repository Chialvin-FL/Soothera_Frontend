import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfileSlice } from '../profileSlice';
import { SuccessModal } from '@/components/native/SuccessModal';

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
  
  const [modal, setModal] = useState<{
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

  const { isLoading, error, successMessage, handleChangePassword, clearMessages } = useProfileSlice();
  
  // Watch for API errors to show in the modal
  useEffect(() => {
    if (error) {
        setModal({
            visible: true,
            variant: 'error',
            title: 'Update Failed',
            message: error,
        });
    }
  }, [error]);

  const handleSave = async () => {
    if (isLoading) return;
    console.log('[PasswordChange] Update password button pressed.');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        setModal({
            visible: true,
            variant: 'error',
            title: 'Missing Information',
            message: 'Please fill in all fields to change your password.',
        });
        return;
    }

    if (newPassword !== confirmPassword) {
        setModal({
            visible: true,
            variant: 'error',
            title: 'Passwords Mismatch',
            message: 'The new password and confirmation password do not match.',
        });
        return;
    }

    console.log('[PasswordChange] Calling handleChangePassword API...');
    await handleChangePassword(currentPassword, newPassword, confirmPassword, () => {
      console.log('[PasswordChange] Password update SUCCESS.');
      setModal({
        visible: true,
        variant: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully changed.',
      });
    });
  };

  const handleModalClose = () => {
    const wasSuccess = modal.variant === 'success';
    setModal(prev => ({ ...prev, visible: false }));
    
    if (wasSuccess) {
        onBack();
    } else {
        // Clear slice error state so it can be triggered again if needed
        clearMessages();
    }
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
          disabled={isLoading}
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
        {/* Removed inline messages in favor of SuccessModal */}

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
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowCurrent((s) => !s)} disabled={isLoading}>
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
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowNew((s) => !s)} disabled={isLoading}>
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
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowConfirm((s) => !s)} disabled={isLoading}>
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
          className="w-full py-4 rounded-xl flex-row items-center justify-center opacity-100"
          style={{ backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
          <Text className="text-base font-semibold" style={{ color: '#fff' }}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
      <SuccessModal 
        visible={modal.visible}
        variant={modal.variant}
        title={modal.title}
        message={modal.message}
        onClose={handleModalClose}
      />
    </View>
  );
}
