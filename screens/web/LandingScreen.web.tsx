import React from 'react';
import { View, ScrollView, Pressable, ImageBackground, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface LandingScreenProps {
    onAdminLogin: () => void;
}

export default function LandingScreen({ onAdminLogin }: LandingScreenProps) {
    return (
        <View className="flex-1 bg-white">
            {/* Navbar */}
            <View className="flex-row items-center justify-between px-8 py-6 border-b border-gray-100">
                <View className="flex-row items-center">
                    <Image
                        source={require("../../assets/soothera-logo.png")}
                        style={{ width: 200, height: 60 }}
                        resizeMode="contain"
                    />
                </View>

                <Pressable
                    onPress={onAdminLogin}
                    className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-200 active:bg-gray-100"
                >
                    <Ionicons name="person-circle-outline" size={20} color="#374151" />
                    <Text className="ml-2 text-gray-700 font-medium">Admin Login</Text>
                </Pressable>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                {/* Hero Section */}
                <View className="flex-1 items-center justify-center px-6 py-20 bg-slate-50">
                    <View className="max-w-4xl items-center">
                        <View className="bg-primary-50 px-4 py-1 rounded-full mb-6">
                            <Text className="text-primary font-semibold text-sm uppercase tracking-wider">Now Available for Android</Text>
                        </View>

                        <Text className="text-6xl font-extrabold text-gray-900 text-center mb-6 leading-tight">
                            Your Personal Wellness <Text className="text-primary">Companion</Text>
                        </Text>

                        <Text className="text-xl text-gray-600 text-center mb-10 max-w-2xl">
                            Experience the ultimate relaxation and self-care journey. Book treatments, track your progress, and find peace of mind with Soothera.
                        </Text>

                        <View className="flex-row gap-4">
                            <Pressable
                                className="bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary-200 flex-row items-center active:scale-95 transition-transform"
                                onPress={() => {
                                    // Link to APK download
                                    alert('APK Download started!');
                                }}
                            >
                                <Ionicons name="logo-android" size={24} color="white" />
                                <Text className="text-white text-lg ml-3">Download APK</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Feature highlights */}
                    <View className="flex-row flex-wrap justify-center gap-8 mt-24 px-4 w-full max-w-6xl">
                        <FeatureCard
                            icon="calendar"
                            title="Easy Booking"
                            description="Schedule your wellness sessions with just a few taps."
                        />
                        <FeatureCard
                            icon="sparkles"
                            title="Premium Services"
                            description="Access top-tier massage spas and certified practitioners."
                        />
                        <FeatureCard
                            icon="shield-checkmark"
                            title="Secure Platform"
                            description="Your data and privacy are always our top priority."
                        />
                    </View>
                </View>

                {/* Footer */}
                <View className="bg-gray-900 py-12 px-8">
                    <View className="max-w-6xl mx-auto flex-row justify-between items-center">
                        <View>
                            <Text className="text-white text-2xl font-bold mb-2">Soothera</Text>
                            <Text className="text-gray-400">Making wellness accessible to everyone.</Text>
                        </View>
                    </View>
                    <View className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800">
                        <Text className="text-gray-500 text-center">© 2026 Soothera. All rights reserved.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function FeatureCard({ icon, title, description }: { icon: any; title: string; description: string }) {
    return (
        <View className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex-1 min-w-[280px] items-start">
            <View className="bg-primary-50 w-12 h-12 rounded-xl items-center justify-center mb-6">
                <Ionicons name={icon} size={24} color="#4C7A6C" />
            </View>
            <Text className="text-xl text-gray-900 mb-3">{title}</Text>
            <Text className="text-gray-600 leading-relaxed">{description}</Text>
        </View>
    );
}
