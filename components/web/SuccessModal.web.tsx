import React from 'react';
import { View, Pressable, Modal, Animated } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalWebProps {
    visible: boolean;
    title: string;
    message: string;
    variant?: 'success' | 'error';
    onClose: () => void;
}

export default function SuccessModalWeb({ visible, title, message, variant = 'success', onClose }: SuccessModalWebProps) {
    if (!visible) return null;

    const isError = variant === 'error';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/40 items-center justify-center p-4">
                <View className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 items-center">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isError ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Ionicons 
                            name={isError ? "alert-circle" : "checkmark-circle"} 
                            size={48} 
                            color={isError ? "#dc2626" : "#4C7A6C"} 
                        />
                    </View>
                    
                    <Text className="text-2xl font-bold text-slate-900 text-center mb-2">{title}</Text>
                    <Text className="text-slate-500 text-center mb-8">{message}</Text>
                    
                    <Pressable 
                        onPress={onClose}
                        className={`w-full py-4 rounded-2xl items-center active:scale-[0.98] transition-all ${isError ? 'bg-red-600' : 'bg-primary'}`}
                    >
                        <Text className="text-white font-bold text-lg">Dismiss</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
