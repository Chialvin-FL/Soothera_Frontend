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
import { getEstablishmentRatings, createRating } from '@/api/endpoints/apiRating';
import { loadStoredSession } from '@/screens/native/Login/loginService';

interface RatingSpaScreenProps {
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

export default function RatingSpaScreen({ 
  bookingDetails, 
  onBack,
  onSubmit,
}: RatingSpaScreenProps) {
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
  
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Fetch session and existing ratings
  useEffect(() => {
    const fetchExistingRating = async () => {
      try {
        const session = await loadStoredSession();
        if (session?.uid) {
          setCurrentUid(session.uid);
        }

        if (bookingDetails.establishmentId && session?.uid) {
          const response = await getEstablishmentRatings(bookingDetails.establishmentId);
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
  }, [bookingDetails.establishmentId, bookingDetails.bookingId]);

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

    console.log('[RatingSpaScreen] handleSubmit called');
    console.log('[RatingSpaScreen] bookingDetails.bookingId =', bookingDetails.bookingId);
    console.log('[RatingSpaScreen] bookingDetails.establishmentId =', bookingDetails.establishmentId);
    console.log('[RatingSpaScreen] rating =', rating, '| review =', review);

    if (!bookingDetails.establishmentId) {
      console.error('[RatingSpaScreen] Cannot submit: establishmentId is undefined/null');
      Alert.alert('Error', 'Unable to submit rating: spa information is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[RatingSpaScreen] Calling createRating POST...');
      await createRating({
        bookingId: bookingDetails.bookingId,
        targetId: bookingDetails.establishmentId,
        reviewerRole: 'Customer',
        targetRole: 'Salon',
        score: rating,
        comment: review
      });
      console.log('[RatingSpaScreen] createRating succeeded');
      await onSubmit?.(rating, review);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('[RatingSpaScreen] Error submitting rating:', error);
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
            {/* Spa Image with Overlay Header */}
            <View className="w-full relative" style={{ height: 250 }}>
              <Image
                source={require('../../../assets/salon.jpg')}
                className="w-full h-full"
                resizeMode="cover"
              />
              
              {/* Transparent Header Overlay */}
              <TransparentHeader onBack={onBack} />
            </View>

            <View className="px-5 py-4">
              {/* Spa Name with Overall Rating */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-bold flex-1" style={{ color: colors.text }}>
                  {bookingDetails.spaName}
                </Text>
                <View className="ml-3">
                  <StarRatingDisplay rating={bookingDetails.spaRating} />
                </View>
              </View>

              {/* Address */}
              <View className="flex-row items-center mb-8">
                <Ionicons name="location-outline" size={16} color={colors.icon} />
                <Text className="text-sm ml-1 flex-1" style={{ color: colors.icon }}>
                  {bookingDetails.address}
                </Text>
              </View>

              {/* "How was your experience..." Text */}
              <Text 
                className="text-base text-center mb-6" 
                style={{ color: colors.text }}
              >
                {isReadOnly ? "Your rating for this spa" : "How was your experience with this spa?"}
              </Text>

              {/* 5 Star Rating Input */}
              <View className="mb-6" pointerEvents={isReadOnly ? 'none' : 'auto'}>
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
