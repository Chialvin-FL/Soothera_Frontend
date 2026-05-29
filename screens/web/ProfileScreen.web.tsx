import React, { useState } from 'react';
import { View, ScrollView, Pressable, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSessionLoader } from '../../navigation/hooks/useSessionLoader';
import { useProfileSlice } from '../../screens/native/Profile/profileSlice';
import { updateStoredUserData } from '../../screens/native/Login/loginService';

export default function ProfileScreenWeb() {
    const session = useSessionLoader();
    const { userName, userEmail, uid, userRole, userProfilePic, updateSessionData } = session;
    const { handleUpdateProfile, isLoading, error, clearMessages } = useProfileSlice();

    // Modal & Form State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || '?';
    };

    const openEditModal = () => {
        const [first, ...rest] = userName.split(' ');
        setFname(first || '');
        setLname(rest.join(' ') || '');
        setSelectedImage(null);
        clearMessages();
        setIsEditModalVisible(true);
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleSaveProfile = async () => {
        // Find UID from storage or session (usually in userData)
        // For simplicity we assume it's available or we can pass an empty string if the backend identifies by token
        // But better to be explicit if possible. In this app, the uid is in the payload for some endpoints.
        // Actually performUpdateProfile in profileService.ts takes uid as argument.
        
        // We'll try to get UID from session if we add it there, or fetch from storage once.
        // For now, let's assume we can get it from storage.
        const success = await handleUpdateProfile(uid, {
            fname: fname,
            lname: lname,
            profilePic: selectedImage ? {
                uri: selectedImage.uri,
                name: selectedImage.fileName || 'profile.jpg',
                type: selectedImage.mimeType || 'image/jpeg'
            } : undefined
        }, async () => {
            // onSuccess callback
            // 1. Sync global context
            updateSessionData(fname, lname, selectedImage?.uri || userProfilePic);
            
            // 2. Persist to storage
            await updateStoredUserData({
                firstName: fname,
                lastName: lname,
                profilePicture: selectedImage?.uri || userProfilePic
            });

            setIsEditModalVisible(false);
        });
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white border-b border-slate-200 px-8 py-10">
                <Text className="text-3xl text-slate-900">Account Profile</Text>
                <Text className="text-slate-500 mt-1">Manage your administrator account details.</Text>
            </View>

            {/* Main Content */}
            <View className="p-10 max-w-4xl">
                <View className="flex-row gap-8">
                    {/* Profile Overview Card */}
                    <View className="w-80">
                        <View className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200 items-center">
                            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6 overflow-hidden">
                                {userProfilePic ? (
                                    <Image source={{ uri: userProfilePic }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Text className="text-primary text-3xl">{getInitials(userName)}</Text>
                                )}
                            </View>
                            <Text className="text-2xl text-slate-900 text-center">{userName}</Text>
                            <Text className="text-slate-500 mt-1 text-center">{userEmail}</Text>
                            
                            <View className="bg-primary/5 rounded-full px-4 py-1.5 mt-6 border border-primary/10">
                                <Text className="text-primary text-xs uppercase tracking-widest">{userRole || 'Admin'}</Text>
                            </View>

                            <Pressable 
                                onPress={openEditModal}
                                className="mt-8 flex-row items-center border border-slate-200 px-6 py-2.5 rounded-xl active:bg-slate-50"
                            >
                                <Ionicons name="create-outline" size={18} color="#64748b" />
                                <Text className="text-slate-600 ml-2">Edit Details</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Account Details Section */}
                    <View className="flex-1">
                        <View className="bg-white rounded-3xl shadow-sm p-10 border border-slate-200">
                            <Text className="text-xl text-slate-900 mb-8">Account Information</Text>
                            
                            <View className="space-y-6">
                                <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
                                    <View>
                                        <Text className="text-slate-400 text-xs uppercase tracking-tighter mb-1">Full Identity</Text>
                                        <Text className="text-slate-700 text-lg">{userName}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
                                    <View>
                                        <Text className="text-slate-400 text-xs uppercase tracking-tighter mb-1">Email Address</Text>
                                        <Text className="text-slate-700 text-lg">{userEmail}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
                                    <View>
                                        <Text className="text-slate-400 text-xs uppercase tracking-tighter mb-1">Portal Access</Text>
                                        <Text className="text-slate-700 text-lg capitalize">{userRole || 'Administrator'}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center py-4">
                                    <View>
                                        <Text className="text-slate-400 text-xs uppercase tracking-tighter mb-1">Account Status</Text>
                                        <div className="flex flex-row items-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                            <Text className="text-green-600">Verified & Active</Text>
                                        </div>
                                    </View>
                                </View>
                            </View>
                        </View>
                        
                        <View className="mt-8 px-4">
                            <Text className="text-slate-400 text-xs">
                                Administrative access is managed by the system security policy. 
                                Contact dev support for any credentials changes.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
                        <View className="p-8 border-b border-slate-100 flex-row justify-between items-center">
                            <View>
                                <Text className="text-2xl text-slate-900">Edit Profile</Text>
                                <Text className="text-slate-500 mt-1">Update your account credentials.</Text>
                            </View>
                            <Pressable onPress={() => setIsEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </Pressable>
                        </View>

                        <ScrollView className="p-8">
                            {/* Profile Picture Upload */}
                            <View className="items-center mb-8">
                                <Pressable onPress={handlePickImage} className="relative">
                                    <View className="w-32 h-32 rounded-full bg-slate-100 items-center justify-center overflow-hidden border-2 border-slate-200">
                                        {selectedImage ? (
                                            <Image source={{ uri: selectedImage.uri }} style={{ width: '100%', height: '100%' }} />
                                        ) : userProfilePic ? (
                                            <Image source={{ uri: userProfilePic }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <Ionicons name="camera-outline" size={40} color="#94a3b8" />
                                        )}
                                    </View>
                                    <View className="absolute bottom-1 right-1 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-white">
                                        <Ionicons name="camera" size={18} color="white" />
                                    </View>
                                </Pressable>
                                <Text className="text-slate-400 text-xs mt-3">Click to change photo</Text>
                            </View>

                            <View className="gap-5">
                                <View>
                                    <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">First Name</Text>
                                    <TextInput 
                                        className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                        placeholder="Enter first name"
                                        value={fname}
                                        onChangeText={setFname}
                                    />
                                </View>
                                <View>
                                    <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Last Name</Text>
                                    <TextInput 
                                        className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900"
                                        placeholder="Enter last name"
                                        value={lname}
                                        onChangeText={setLname}
                                    />
                                </View>
                            </View>

                            {error && (
                                <View className="mt-6 bg-red-50 p-4 rounded-xl flex-row items-center">
                                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                    <Text className="text-red-600 ml-2 flex-1">{error}</Text>
                                </View>
                            )}
                        </ScrollView>

                        <View className="p-8 bg-slate-50 border-t border-slate-100 flex-row justify-end gap-3">
                            <Pressable 
                                onPress={() => setIsEditModalVisible(false)}
                                className="px-6 py-3 rounded-xl border border-slate-200 bg-white"
                            >
                                <Text className="text-slate-600">Cancel</Text>
                            </Pressable>
                            <Pressable 
                                onPress={handleSaveProfile}
                                disabled={isLoading}
                                className={`px-10 py-3 rounded-xl bg-primary items-center justify-center min-w-[120px] ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white">Save Changes</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

