import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, TextInput, BackHandler, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransparentHeader } from '@/components/native/TransparentHeader';
import { SuccessModal } from '@/components/native/SuccessModal';
import { BookingDetails } from './types/BookingDetails';
import { getCustomerRatings, createRating } from '@/api/endpoints/apiRating';
import { loadStoredSession } from '@/screens/native/Login/loginService';

interface RatingCustomerScreenProps {
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

export default function RatingCustomerScreen({ 
  bookingDetails, 
  onBack,
  onSubmit,
}: RatingCustomerScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUid, setCurrentUid] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('1');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Fetch session and existing ratings
  useEffect(() => {
    const fetchExistingRating = async () => {
      try {
        const session = await loadStoredSession();
        if (session?.uid) {
          setCurrentUid(session.uid);
          setCurrentUserRole(String(session.role));
        }

        if (bookingDetails.customerId && session?.uid) {
          const response = await getCustomerRatings(bookingDetails.customerId);
          if (response?.ratings) {
            const existing = response.ratings.find(
              (r) => r.bookingId === bookingDetails.bookingId && r.reviewerId === session.uid
            );
            if (existing) {
              setRating(existing.score);
              setReview(existing.comment || '');
              setIsReadOnly(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching existing rating:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingRating();
  }, [bookingDetails.customerId, bookingDetails.bookingId]);

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
        if (!isReadOnly) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 300);
        }
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
  }, [isReadOnly]);

  // Handle submit
  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    console.log('[RatingCustomerScreen] handleSubmit called');
    console.log('[RatingCustomerScreen] bookingDetails.bookingId =', bookingDetails.bookingId);
    console.log('[RatingCustomerScreen] bookingDetails.customerId =', bookingDetails.customerId);
    console.log('[RatingCustomerScreen] currentUserRole =', currentUserRole, '| rating =', rating);

    if (!bookingDetails.customerId) {
      console.error('[RatingCustomerScreen] Cannot submit: customerId is undefined/null');
      Alert.alert('Error', 'Unable to submit rating: customer information is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[RatingCustomerScreen] Calling createRating POST...');
      await createRating({
        bookingId: bookingDetails.bookingId,
        targetId: bookingDetails.customerId,
        reviewerRole: currentUserRole === 'admin' ? 'Salon' : 'Therapist',
        targetRole: 'Customer',
        score: rating,
        comment: review
      });
      console.log('[RatingCustomerScreen] createRating succeeded');
      await onSubmit?.(rating, review);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('[RatingCustomerScreen] Error submitting rating:', error);
      Alert.alert('Submission Failed', error?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate footer height (approximate)
  const footerHeight = 80 + Math.max(insets.bottom, 16);

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ 
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + footerHeight : footerHeight
            }}
          >
            {/* Customer Image with Overlay Header */}
            <View className="w-full relative bg-gray-100" style={{ height: 350 }}>
              <Image
                source={bookingDetails.customerImage || require('../../../assets/user.jpg')}
                className="w-full h-full"
                resizeMode="cover"
              />
              
              {/* Gradient Overlay for better text readability */}
              <View 
                className="absolute inset-0 bg-black/20"
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }} 
              />
              
              {/* Transparent Header Overlay */}
              <TransparentHeader onBack={onBack} />
              
              {/* Info Overlay at Bottom of Image */}
              <View className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                <View className="flex-row items-end justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-3xl font-bold text-white mb-1 drop-shadow-md">
                      {bookingDetails.customerName || 'Customer'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="px-5 py-6">
              {/* "How was your experience..." Text */}
              <Text 
                className="text-base text-center mb-6" 
                style={{ color: colors.text }}
              >
                {isReadOnly ? "Your rating for this customer" : "How was your experience with this customer?"}
              </Text>

              {/* 5 Star Rating Input */}
              <View className="mb-8" pointerEvents={isReadOnly ? 'none' : 'auto'}>
                {isReadOnly ? (
                  <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={32}
                        color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                      />
                    ))}
                  </View>
                ) : (
                  <InteractiveStarRating 
                    rating={rating} 
                    onRatingChange={setRating}
                  />
                )}
              </View>

              {/* Detailed Review Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  {isReadOnly ? "Your review" : "Add detailed review"}
                </Text>
                <TextInput
                  ref={textInputRef}
                  value={review}
                  onChangeText={setReview}
                  placeholder={isReadOnly ? "No review provided." : "Enter here"}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  editable={!isReadOnly}
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                  style={{ 
                    color: colors.text,
                    backgroundColor: isReadOnly ? colors.background : 'white',
                    minHeight: 120,
                  }}
                  onFocus={() => {
                    // Scroll to input when focused
                    if (!isReadOnly) {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }
                  }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Submit Button Footer - Positioned on top of keyboard */}
          {!isReadOnly && (
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
                  backgroundColor: isSubmitting || rating === 0 ? '#9CA3AF' : primaryColor,
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
          )}
        </>
      )}

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
