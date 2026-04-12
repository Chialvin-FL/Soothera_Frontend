import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { TopRatedMassageSpas } from '../Home/components/Home/TopRatedSalons';
import { topRatedSalons } from '../Home/configs/mockData';
import type { UIRole } from '@/navigation/hooks/useSessionLoader';
import { useProfileSlice } from './profileSlice';
import { API_CONFIG } from '@/api/config';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  colors: typeof Colors.light;
  textColor?: string;
  iconColor?: string;
}

function SettingItem({ icon, label, onPress, colors, textColor, iconColor }: SettingItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4"
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={iconColor || colors.icon} />
      <Text className="text-base ml-4 flex-1" style={{ color: textColor || colors.text }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={iconColor || colors.icon} />
    </TouchableOpacity>
  );
}

interface ProfileScreenProps {
  isActive?: boolean;
  onNavigateToProfileEdit?: () => void;
  onNavigateToPasswordChange?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToTopRated?: () => void;
  onNavigateSalonDetails?: (salonId: string) => void;
  onNavigateToStaffManagement?: () => void;
  onNavigateToBusinessSettings?: () => void;
  onNavigateToSubscription?: () => void;
  onNavigateToSalonRatings?: () => void;
  onNavigateToAccessLogs?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  userProfilePic?: string | null;
  userRole?: UIRole | null;
}

export default function ProfileScreen({
  isActive,
  onNavigateToProfileEdit,
  onNavigateToPasswordChange,
  onNavigateToSchedule,
  onNavigateToNotifications,
  onNavigateToHelp,
  onNavigateToFavorites,
  onNavigateToTopRated,
  onNavigateSalonDetails,
  onNavigateToStaffManagement,
  onNavigateToBusinessSettings,
  onNavigateToSubscription,
  onNavigateToSalonRatings,
  onNavigateToAccessLogs,
  onLogout,
  userName: propUserName,
  userEmail: propUserEmail,
  userProfilePic,
  userRole,
}: ProfileScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isVisible = isActive ?? true;
  const [imageError, setImageError] = useState(false);

  const { handleLogout, isLoading: isLoadingProfile } = useProfileSlice();

  // User data
  const userName = propUserName || '';
  const userEmail = propUserEmail || '';
  const profileImage = userProfilePic 
    ? { uri: userProfilePic.startsWith('http') ? userProfilePic : (userProfilePic.startsWith('file') ? userProfilePic : `${API_CONFIG.BASE_URL}${userProfilePic}`) }
    : require('../../../assets/user.jpg');

  // Source of truth: mockData. Favorites = first 3, You May Also Like = next 4.
  const favoriteSalons = topRatedSalons.slice(0, 3);
  const recommendedSalons = topRatedSalons.slice(3, 7);

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
      >
        {/* Profile Header */}
        <RisingItem delay={0} visible={isVisible}>
          <View className="items-center py-6">
            <View
              className="w-[100px] h-[100px] rounded-full justify-center items-center mb-4 overflow-hidden"
              style={{ backgroundColor: colors.primary }}
            >
              {!imageError && (userProfilePic || profileImage) ? (
                <Image
                  source={profileImage}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text className="text-[40px] font-bold text-white">
                  {userName ? userName.charAt(0).toUpperCase() : ''}
                </Text>
              )}
            </View>
            <Text className="text-[28px] font-bold mb-1 dark:text-[#ECEDEE]" style={{ color: colors.text }}>
              {userName}
            </Text>
            <Text className="text-base dark:text-[#9BA1A6]" style={{ color: colors.icon }}>
              {userEmail}
            </Text>
          </View>
        </RisingItem>

        {/* Admin Card */}
        {userRole === 'admin' && (
          <View className="mx-5 mb-5 rounded-2xl bg-white dark:bg-[#1F1F1F] shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
            <RisingItem delay={40} offset={10} visible={isVisible}>
              <View>
                <View className="px-4 pt-4 pb-2">
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    Admin Controls
                  </Text>
                </View>
                <View className="border-t border-gray-200 dark:border-[#2a2a2a]">
                  <SettingItem icon="people-outline" label="Staff Management" colors={colors} onPress={onNavigateToStaffManagement} />
                  <SettingItem icon="business-outline" label="Business Settings" colors={colors} onPress={onNavigateToBusinessSettings} />
                  <SettingItem icon="card-outline" label="Subscription" colors={colors} onPress={onNavigateToSubscription} />
                  <SettingItem icon="star-outline" label="Massage Spa Ratings" colors={colors} onPress={onNavigateToSalonRatings} />
                  <SettingItem icon="document-text-outline" label="Access Logs" colors={colors} onPress={onNavigateToAccessLogs} />
                </View>
              </View>
            </RisingItem>
          </View>
        )}

        {/* Settings Card */}
        <View className="mx-5 mb-5 rounded-2xl bg-white dark:bg-[#1F1F1F] shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <RisingItem delay={80} offset={10} visible={isVisible}>
            <View>
              <View className="px-4 pt-4 pb-2">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Settings
                </Text>
              </View>
              <View className="border-t border-gray-200 dark:border-[#2a2a2a]">
                <SettingItem icon="person-outline" label="Profile" colors={colors} onPress={onNavigateToProfileEdit} />
                <SettingItem icon="lock-closed-outline" label="Password" colors={colors} onPress={onNavigateToPasswordChange} />
                {userRole === 'therapist' && (
                  <SettingItem icon="calendar-outline" label="Schedule" colors={colors} onPress={onNavigateToSchedule} />
                )}
                <SettingItem icon="notifications-outline" label="Notifications" colors={colors} onPress={onNavigateToNotifications} />
              </View>
            </View>
          </RisingItem>
        </View>

        {/* More Card */}
        <View className="mx-5 mb-5 rounded-2xl bg-white dark:bg-[#1F1F1F] shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <RisingItem delay={140} offset={10} visible={isVisible}>
            <View>
              <View className="px-4 pt-4 pb-2">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  More
                </Text>
              </View>
              <View className="border-t border-gray-200 dark:border-[#2a2a2a]">
                <SettingItem icon="help-circle-outline" label="Help" colors={colors} onPress={onNavigateToHelp} />
                <SettingItem 
                  icon="log-out-outline" 
                  label={isLoadingProfile ? "Logging out..." : "Logout"} 
                  colors={colors} 
                  textColor="#EF4444" 
                  iconColor="#EF4444" 
                  onPress={async () => {
                    if (isLoadingProfile) return;
                    await handleLogout(async () => {
                      if (onLogout) {
                        await onLogout();
                      }
                    });
                  }} 
                />
              </View>
            </View>
          </RisingItem>
        </View>

        {/* Your Favorites Section */}
        {userRole !== 'admin' && userRole !== 'therapist' && (
          <RisingItem delay={200} visible={isVisible}>
            <TopRatedMassageSpas
              title="Your Favorites"
              salons={topRatedSalons.slice(0, 3)}
              showSeeAllInHeader
              onSeeAll={onNavigateToFavorites}
              onSalonPress={onNavigateSalonDetails}
            />
          </RisingItem>
        )}

        {/* You May Also Like Section */}
        {userRole !== 'admin' && userRole !== 'therapist' && (
          <RisingItem delay={260} visible={isVisible}>
            <TopRatedMassageSpas
              title="You May Also Like"
              salons={topRatedSalons.slice(3, 7)}
              showSeeAllInHeader
              onSeeAll={onNavigateToTopRated}
              onSalonPress={onNavigateSalonDetails}
            />
          </RisingItem>
        )}

      </ScrollView>
    </View>
  );
}
