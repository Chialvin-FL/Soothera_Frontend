import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, TextInput, BackHandler, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransparentHeader } from '@/components/native/TransparentHeader';
import { SuccessModal } from '@/components/native/SuccessModal';
import { BookingDetails } from './types/BookingDetails';

interface RatingTherapistScreenProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  onSubmit?: (rating: number, review: string) => void;
}

// Interactive Star Rating Component
const InteractiveStarRating = ({ 
  rating, 
  onRatingChange 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
}) => {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={32}
            color={star <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Star Rating Display Component (for overall rating)
const StarRatingDisplay = ({ rating }: { rating: number }) => {
  return (
    <View className="flex-row items-center">
      <Ionicons name="star" size={16} color="#F59E0B" />
      <Text className="text-sm ml-2 font-semibold" style={{ color: '#F59E0B' }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

export default function RatingTherapistScreen({ 
  bookingDetails, 
  onBack,
  onSubmit,
}: RatingTherapistScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Mock therapist rating (in real app, this would come from API)
  const therapistRating = 4.8;

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [onBack]);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to text input when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    if (rating === 0) {
      // TODO: Show error message - rating is required
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit rating
      await onSubmit?.(rating, review);
      // After successful submission, show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate footer height (approximate)
  const footerHeight = 80 + Math.max(insets.bottom, 16);

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ 
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + footerHeight : footerHeight
        }}
      >
        {/* Therapist Image with Overlay Header */}
        <View className="w-full relative" style={{ height: 250 }}>
          <Image
            source={require('../../../assets/salon.jpg')}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {/* Transparent Header Overlay */}
          <TransparentHeader onBack={onBack} />

          {/* Floating Therapist Avatar - Overlaps between image and details */}
          <View 
            className="absolute bottom-0 items-center justify-center"
            style={{ 
              width: '100%',
              marginBottom: -60, // Half overlaps into details section
            }}
          >
            <View
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Image
                source={require('../../../assets/pfp.jpg')}
                className="rounded-full"
                style={{ 
                  width: 160,
                  height: 160,
                  borderWidth: 4,
                  borderColor: 'white',
                }}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <View className="px-5 py-4">
          {/* Therapist Name, Title, and Overall Rating - Centered */}
          <View className="items-center mb-6" style={{ marginTop: 55 }}>
            {/* Therapist Name */}
            <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              {bookingDetails.therapistName}
            </Text>
            
            {/* Therapist Title */}
            <Text className="text-sm mb-3" style={{ color: colors.icon }}>
              {bookingDetails.therapistTitle}
            </Text>
            
            {/* Overall Rating */}
            <View>
              <StarRatingDisplay rating={therapistRating} />
            </View>
          </View>

          {/* "How was your experience..." Text */}
          <Text 
            className="text-base text-center mb-6" 
            style={{ color: colors.text }}
          >
            How was your experience with this therapist?
          </Text>

          {/* 5 Star Rating Input */}
          <View className="mb-6">
            <InteractiveStarRating 
              rating={rating} 
              onRatingChange={setRating}
            />
          </View>

          {/* Detailed Review Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Add detailed review
            </Text>
            <TextInput
              ref={textInputRef}
              value={review}
              onChangeText={setReview}
              placeholder="Enter here"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              style={{ 
                color: colors.text,
                backgroundColor: 'white',
                minHeight: 120,
              }}
              onFocus={() => {
                // Scroll to input when focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button Footer - Positioned on top of keyboard */}
      <View 
        className="px-5 py-4 border-t absolute left-0 right-0"
        style={{ 
          backgroundColor: 'white',
          borderTopColor: '#E5E7EB',
          paddingBottom: Math.max(insets.bottom, 16),
          bottom: keyboardHeight > 0 ? keyboardHeight : 0,
        }}
      >
        <TouchableOpacity
          className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
          style={{ 
            backgroundColor: isSubmitting ? '#9CA3AF' : primaryColor,
          }}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0}
          activeOpacity={0.8}
        >
          <Text className="text-base text-white font-semibold">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        title="Rating Submitted!"
        message="Thank you for your feedback. Your rating has been successfully submitted."
        onClose={() => {
          setShowSuccessModal(false);
          onBack();
        }}
        actionLabel="OK"
        onAction={() => {
          setShowSuccessModal(false);
          onBack();
        }}
      />
    </View>
  );
}
