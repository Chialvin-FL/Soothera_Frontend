import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, TextInput, BackHandler, Platform, Keyboard } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SalonDetails } from './types/SalonDetails';
import { Service } from './types/Home';
import { Therapist } from './types/SalonDetails';
import { services } from './configs/mockData';

interface BookingData {
  service: Service | null;
  duration: string;
  addOns: AddOn[];
  therapist: Therapist | null;
  date: Date;
  time: Date;
  instructions: string;
  promoCode: string;
  salonDetails: SalonDetails;
  totalPrice: number;
  customerDetails?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

interface BookAppointmentScreenProps {
  salonDetails: SalonDetails;
  onBack: () => void;
  onComplete?: () => void;
  onPaymentSuccess?: (bookingData: BookingData) => void;
  isAdmin?: boolean;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}



// Mock add-ons data
const addOns: AddOn[] = [
  { id: '1', name: 'Aromatherapy Oil', price: 50 },
  { id: '2', name: 'Hot Towel', price: 30 },
  { id: '3', name: 'Foot Scrub', price: 100 },
  { id: '4', name: 'Face Mask', price: 150 },
];

export default function BookAppointmentScreen({
  salonDetails,
  onBack,
  onComplete,
  onPaymentSuccess,
  isAdmin = false,
}: BookAppointmentScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const TOTAL_STEPS = isAdmin ? 6 : 5;

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  // Step 1: Service selection
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Step 2: Duration, Add-ons, Instructions
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  // Step 3: Therapist preference
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null); // null means "Any Therapist"

  // Step 4: Date & Time & Promo Code
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [promoCode, setPromoCode] = useState('');

  // Refs for ScrollViews
  const timeScrollViewRef = useRef<ScrollView>(null);
  const dateScrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const instructionsInputRef = useRef<TextInput>(null);
  const promoCodeInputRef = useRef<TextInput>(null);
  
  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        return true;
      }
      onBack();
      return true;
    });

    return () => backHandler.remove();
  }, [currentStep, onBack]);

  // Calculate price based on duration
  const calculatePrice = (): number => {
    if (!selectedService || !selectedDuration) return 0;
    
    const basePrice = selectedService.price;
    const durationMinutes = parseInt(selectedDuration.replace(' mins', ''));
    const baseDurationMinutes = 60; // Assume base price is for 60 mins
    
    // Calculate price based on duration (proportional)
    let price = (basePrice / baseDurationMinutes) * durationMinutes;
    
    // Add add-ons
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) {
        price += addOn.price;
      }
    });
    
    return Math.round(price);
  };

  // Round time to nearest 15-minute interval
  const roundToNearest15Minutes = (date: Date): Date => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    rounded.setMinutes(roundedMinutes);
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
    return rounded;
  };

  // Generate time slots (8:00 AM to 8:00 PM, 15-minute intervals)
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const startHour = 8;
    const endHour = 20;
    
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === endHour && minute > 0) break;
        
        const slot = new Date(baseDate);
        slot.setHours(hour, minute, 0, 0);
        slots.push(slot);
      }
    }
    
    return slots;
  }, [selectedDate]);

  // Generate dates (from today to end of month + 7 days of next month if needed)
  const monthDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = today.getDate();
    const daysRemainingInMonth = lastDayOfMonth - currentDay + 1;
    const shouldIncludeNextMonth = daysRemainingInMonth <= 7;
    
    for (let day = currentDay; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(date);
    }
    
    if (shouldIncludeNextMonth) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= 7; day++) {
        const date = new Date(nextYear, nextMonth, day);
        dates.push(date);
      }
    }
    
    return dates;
  }, []);

  // Initialize time to nearest 15 minutes
  useEffect(() => {
    setSelectedTime(roundToNearest15Minutes(new Date()));
  }, []);

  // Reset duration when service changes
  useEffect(() => {
    if (selectedService && !selectedService.duration.includes(selectedDuration)) {
      setSelectedDuration('');
    }
  }, [selectedService, selectedDuration]);

  // Handle keyboard show/hide for steps 2 and 4
  useEffect(() => {
    if (currentStep !== 2 && currentStep !== 4) {
      setKeyboardHeight(0);
      return;
    }

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to input when keyboard appears
        setTimeout(() => {
          mainScrollViewRef.current?.scrollToEnd({ animated: true });
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
  }, [currentStep]);

  // Auto-scroll to selected date when step 4 is shown
  useEffect(() => {
    if (currentStep === 4) {
      const selectedDateIndex = monthDates.findIndex(date => isSameDay(date, selectedDate));
      if (selectedDateIndex >= 0 && dateScrollViewRef.current) {
        setTimeout(() => {
          const buttonWidth = 70;
          const scrollPosition = Math.max(0, (selectedDateIndex * buttonWidth) - 20);
          dateScrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
        }, 100);
      }
    }
  }, [currentStep, selectedDate, monthDates]);

  // Auto-scroll to selected time when step 4 is shown
  useEffect(() => {
    if (currentStep === 4) {
      const selectedTimeIndex = timeSlots.findIndex(slot => 
        selectedTime.getHours() === slot.getHours() &&
        selectedTime.getMinutes() === slot.getMinutes()
      );
      if (selectedTimeIndex >= 0 && timeScrollViewRef.current) {
        setTimeout(() => {
          const buttonWidth = 70;
          const scrollPosition = Math.max(0, (selectedTimeIndex * buttonWidth) - 20);
          timeScrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
        }, 100);
      }
    }
  }, [currentStep, selectedTime, timeSlots]);

  // Format time for display
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Format day name
  const getDayName = (date: Date): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // Check if same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Check if time slot is selected
  const isTimeSlotSelected = (slot: Date): boolean => {
    return (
      selectedTime.getHours() === slot.getHours() &&
      selectedTime.getMinutes() === slot.getMinutes()
    );
  };

  // Handle continue/next step
  const handleContinue = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Prepare booking data
      const selectedTherapistData = selectedTherapist
        ? salonDetails.therapists.find(t => t.id === selectedTherapist)
        : null;
      
      const selectedAddOnsData = selectedAddOns
        .map(addOnId => addOns.find(a => a.id === addOnId))
        .filter((addOn): addOn is AddOn => addOn !== undefined);

      const bookingData: BookingData = {
        service: selectedService,
        duration: selectedDuration,
        addOns: selectedAddOnsData,
        therapist: selectedTherapistData || null,
        date: selectedDate,
        time: selectedTime,
        instructions: instructions,
        promoCode: promoCode,
        salonDetails: salonDetails,
        totalPrice: calculatePrice(),
        ...(isAdmin ? { customerDetails } : {}),
      };

      // Navigate to payment success screen
      if (onPaymentSuccess) {
        onPaymentSuccess(bookingData);
      } else {
        // Fallback to onComplete if onPaymentSuccess is not provided
        onComplete?.();
      }
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  // Toggle add-on
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Format price
  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Render Step 1: Choose Service
  const renderStep1 = () => {
    return (
      <View className="px-5 py-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Choose Service
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="w-[48%]"
              onPress={() => setSelectedService(service)}
              activeOpacity={0.7}
            >
              <View
                className="rounded-xl overflow-hidden bg-white"
                style={{
                  elevation: selectedService?.id === service.id ? 5 : 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedService?.id === service.id ? 0.2 : 0.1,
                  shadowRadius: 4,
                  borderWidth: selectedService?.id === service.id ? 2 : 0,
                  borderColor: primaryColor,
                }}
              >
                <Image
                  source={service.image}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{ color: colors.text }}
                    numberOfLines={2}
                  >
                    {service.name}
                  </Text>
                  <Text
                    className="text-xs mb-2"
                    style={{ color: colors.icon }}
                    numberOfLines={2}
                  >
                    {service.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render Step 2: Session Duration, Add-ons, Instructions
  const renderStep2 = () => {
    if (!selectedService) return null;

    return (
      <View className="px-5 py-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Session Duration
        </Text>
        
        {/* Duration Selection */}
        <View className="flex-row flex-wrap mb-6" style={{ gap: 8 }}>
          {selectedService.duration.map((duration, index) => (
            <TouchableOpacity
              key={index}
              className="px-4 py-3 rounded-full border"
              style={{
                borderColor: selectedDuration === duration ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                backgroundColor: selectedDuration === duration ? primaryColor : 'transparent',
              }}
              onPress={() => setSelectedDuration(duration)}
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selectedDuration === duration ? 'white' : colors.text,
                }}
              >
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add-ons */}
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Add-ons (Extras)
        </Text>
        <View className="mb-6" style={{ gap: 12 }}>
          {addOns.map((addOn) => (
            <TouchableOpacity
              key={addOn.id}
              className="flex-row items-center justify-between p-4 rounded-xl border"
              style={{
                borderColor: selectedAddOns.includes(addOn.id) ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                backgroundColor: selectedAddOns.includes(addOn.id) ? primaryColor + '20' : 'transparent',
              }}
              onPress={() => toggleAddOn(addOn.id)}
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  {addOn.name}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.icon }}>
                  {formatPrice(addOn.price)}
                </Text>
              </View>
              <View
                className="w-6 h-6 rounded-full border-2 items-center justify-center"
                style={{
                  borderColor: selectedAddOns.includes(addOn.id) ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                  backgroundColor: selectedAddOns.includes(addOn.id) ? primaryColor : 'transparent',
                }}
              >
                {selectedAddOns.includes(addOn.id) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Instructions (Specific Instructions for the therapist)
        </Text>
        <TextInput
          ref={instructionsInputRef}
          className="p-4 rounded-xl border text-base"
          style={{
            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
            color: colors.text,
            minHeight: 100,
            textAlignVertical: 'top',
          }}
          placeholder="Enter any specific instructions..."
          placeholderTextColor={colors.icon}
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
          onFocus={() => {
            // Scroll to input when focused
            setTimeout(() => {
              mainScrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
        />
      </View>
    );
  };

  // Render Step 3: Therapist Preference
  const renderStep3 = () => {
    return (
      <View className="px-5 py-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Therapist Preference
        </Text>
        
        {/* Any Therapist Option */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-4 rounded-xl border mb-4"
          style={{
            borderColor: selectedTherapist === null ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
            backgroundColor: selectedTherapist === null ? primaryColor + '20' : 'transparent',
          }}
          onPress={() => setSelectedTherapist(null)}
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium" style={{ color: colors.text }}>
            Any Therapist
          </Text>
          <View
            className="w-6 h-6 rounded-full border-2 items-center justify-center"
            style={{
              borderColor: selectedTherapist === null ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
              backgroundColor: selectedTherapist === null ? primaryColor : 'transparent',
            }}
          >
            {selectedTherapist === null && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </TouchableOpacity>

        {/* Therapist List */}
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {salonDetails.therapists.map((therapist) => (
            <TouchableOpacity
              key={therapist.id}
              className="w-[48%]"
              onPress={() => setSelectedTherapist(therapist.id)}
              activeOpacity={0.7}
            >
              <View
                className="rounded-xl overflow-hidden bg-white"
                style={{
                  elevation: selectedTherapist === therapist.id ? 5 : 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedTherapist === therapist.id ? 0.2 : 0.1,
                  shadowRadius: 4,
                  borderWidth: selectedTherapist === therapist.id ? 2 : 0,
                  borderColor: primaryColor,
                }}
              >
                <View className="relative">
                  <Image
                    source={therapist.image}
                    className="w-full h-40 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View 
                    className="absolute bottom-2 right-2 flex-row items-center px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  >
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text className="text-white text-xs font-semibold ml-1">
                      {therapist.rating}
                    </Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{ color: colors.text }}
                  >
                    {therapist.name}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.icon }}>
                    {therapist.title}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render Step 4: Date & Time & Promo Code
  const renderStep4 = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    return (
      <View className="px-5 py-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Date & Time
        </Text>

        {/* Date Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Date
          </Text>
          
          {/* Month Display */}
          <View className="flex-row items-center justify-center mb-3">
            <Text className="text-base font-medium" style={{ color: colors.text }}>
              {monthNames[visibleMonth.getMonth()]}, {visibleMonth.getFullYear()}
            </Text>
          </View>

          {/* Date ScrollView */}
          <ScrollView
            ref={dateScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            nestedScrollEnabled
          >
            {monthDates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);

              return (
                <TouchableOpacity
                  key={index}
                  className="px-4 py-3 rounded-full border mr-2 items-center justify-center"
                  style={{
                    borderColor: isSelected ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                    backgroundColor: isSelected ? primaryColor : 'transparent',
                    minWidth: 60,
                  }}
                  onPress={() => setSelectedDate(new Date(date))}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-xs font-medium mb-0.5"
                    style={{
                      color: isSelected ? 'white' : colors.text,
                    }}
                  >
                    {getDayName(date)}
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: isSelected ? 'white' : colors.text,
                    }}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Section */}
        <View>
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Time
          </Text>
          <ScrollView
            ref={timeScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            nestedScrollEnabled
          >
            {timeSlots.map((slot, index) => {
              const isSelected = isTimeSlotSelected(slot);
              return (
                <TouchableOpacity
                  key={index}
                  className="px-3 py-2 rounded-full border mr-2"
                  style={{
                    borderColor: isSelected ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                    backgroundColor: isSelected ? primaryColor : 'transparent',
                  }}
                  onPress={() => setSelectedTime(new Date(slot))}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: isSelected ? 'white' : colors.text,
                    }}
                  >
                    {formatTime(slot)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Promo Code Section */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Promo Code (Optional)
          </Text>
          <TextInput
            ref={promoCodeInputRef}
            className="p-4 rounded-xl border text-base"
            style={{
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              color: colors.text,
            }}
            placeholder="Enter promo code"
            placeholderTextColor={colors.icon}
            value={promoCode}
            onChangeText={setPromoCode}
            onFocus={() => {
              // Scroll to input when focused
              setTimeout(() => {
                mainScrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
        </View>
      </View>
    );
  };

  // Render Step 5: Booking Summary
  const renderStep5 = () => {
    const totalPrice = calculatePrice();
    const selectedTherapistData = selectedTherapist
      ? salonDetails.therapists.find(t => t.id === selectedTherapist)
      : null;

    return (
      <View className="px-5 py-4 pb-8">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Booking Summary
          </Text>

          <View className="mb-4">
          {/* Service Card */}
          {selectedService && (
            <View
                className="flex-row items-center rounded-xl overflow-hidden bg-white mb-4"
                style={{
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  height: 96,
                }}
              >
                {/* Image on Left */}
                <Image
                  source={selectedService.image}
                  className="w-24 rounded-l-xl"
                  style={{ height: '100%' }}
                  resizeMode="cover"
                />
                {/* Details on Right */}
                <View className="flex-1 p-3 justify-between" style={{ minWidth: 0 }}>
                  <View>
                    <Text
                      className="text-base font-bold mb-1"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {selectedService.name}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.icon }}
                      numberOfLines={1}
                    >
                      {selectedService.description}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-sm" style={{ color: colors.text }}>
                      {selectedDuration || 'N/A'}
                    </Text>
                    <Text className="text-base font-bold" style={{ color: colors.primary }}>
                      {(() => {
                        if (!selectedService || !selectedDuration) return formatPrice(0);
                        const basePrice = selectedService.price;
                        const durationMinutes = parseInt(selectedDuration.replace(' mins', ''));
                        const baseDurationMinutes = 60;
                        const servicePrice = Math.round((basePrice / baseDurationMinutes) * durationMinutes);
                        return formatPrice(servicePrice);
                      })()}
                    </Text>
                  </View>
                </View>
              </View>
          )}

          {/* Duration (if service not selected, show as text) */}
          {!selectedService && (
            <>
              <Text className="text-sm font-medium mb-2" style={{ color: colors.icon }}>
                Duration
              </Text>
              <Text className="text-base font-semibold mb-4" style={{ color: colors.text }}>
                {selectedDuration || 'N/A'}
              </Text>
            </>
          )}

          {selectedAddOns.length > 0 && (
            <>
              {selectedAddOns.map(addOnId => {
                const addOn = addOns.find(a => a.id === addOnId);
                if (!addOn) return null;
                
                return (
                  <View
                    key={addOnId}
                    className="flex-row items-center rounded-xl overflow-hidden bg-white mb-3"
                    style={{
                      elevation: 3,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      height: 60,
                    }}
                  >
                    {/* Check Icon on Left */}
                    <View className="w-12 items-center justify-center">
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    </View>
                    {/* Details in Middle */}
                    <View className="flex-1 px-3" style={{ minWidth: 0 }}>
                      <Text
                        className="text-base font-semibold"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                      >
                        {addOn.name}
                      </Text>
                    </View>
                    {/* Price on Right */}
                    <View className="px-4">
                      <Text className="text-base font-bold" style={{ color: colors.primary }}>
                        {formatPrice(addOn.price)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* Total Price */}
          <View className="mt-4 pt-4 border-t mb-6" style={{ borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB' }}>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Total Price
              </Text>
              <Text className="text-xl font-bold" style={{ color: primaryColor }}>
                {formatPrice(totalPrice)}
              </Text>
            </View>
          </View>

          {/* Therapist Card */}
          {selectedTherapistData ? (
            <View
              className="flex-row items-start rounded-xl overflow-hidden bg-white mb-4 mt-2"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                height: 96,
              }}
            >
              {/* Image on Left */}
              <View className="relative w-24" style={{ height: 96 }}>
                <Image
                  source={selectedTherapistData.image}
                  className="w-full rounded-l-xl"
                  style={{ height: 96 }}
                  resizeMode="cover"
                />
                <View 
                  className="absolute bottom-1 right-1 flex-row items-center px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                  <Ionicons name="star" size={10} color="#FFD700" />
                  <Text className="text-white text-xs font-semibold ml-0.5">
                    {selectedTherapistData.rating}
                  </Text>
                </View>
              </View>
              {/* Details on Right */}
              <View className="flex-1 p-3" style={{ minWidth: 0 }}>
                <Text
                  className="text-base font-bold mb-1"
                  style={{ color: colors.text }}
                  numberOfLines={1}
                >
                  {selectedTherapistData.name}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.icon }}
                  numberOfLines={1}
                >
                  {selectedTherapistData.title}
                </Text>
              </View>
            </View>
          ) : (
            <View
              className="flex-row items-center justify-between p-4 rounded-xl border mb-4"
              style={{
                borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              }}
            >
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                Any Therapist
              </Text>
            </View>
          )}

          {/* Date & Time Card */}
          <View
            className="flex-row items-center rounded-xl overflow-hidden bg-white mb-4"
            style={{
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              height: 60,
            }}
          >
            {/* Icon on Left */}
            <View className="w-12 items-center justify-center">
              <Ionicons name="calendar-outline" size={24} color={primaryColor} />
            </View>
            {/* Details in Middle */}
            <View className="flex-1 px-3" style={{ minWidth: 0 }}>
              <Text
                className="text-base font-semibold"
                style={{ color: colors.text }}
                numberOfLines={1}
              >
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text
                className="text-sm mt-0.5"
                style={{ color: colors.icon }}
                numberOfLines={1}
              >
                {formatTime(selectedTime)}
              </Text>
            </View>
          </View>

          {instructions && (
            <>
              <Text className="text-sm font-medium mb-2 mt-4" style={{ color: colors.icon }}>
                Instructions
              </Text>
              <Text className="text-base mb-4" style={{ color: colors.text }}>
                {instructions}
              </Text>
            </>
          )}

          {promoCode && (
            <>
              <Text className="text-sm font-medium mb-2" style={{ color: colors.icon }}>
                Promo Code
              </Text>
              <Text className="text-base font-semibold mb-4" style={{ color: colors.text }}>
                {promoCode}
              </Text>
            </>
          )}

          {isAdmin && (
            <>
              <Text className="text-sm font-medium mt-4 mb-2" style={{ color: colors.icon }}>
                Customer Details
              </Text>
              <View className="p-4 rounded-xl border" style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB', backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB' }}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {customerDetails.firstName} {customerDetails.lastName}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.icon }}>
                  {customerDetails.phone}
                </Text>
                {customerDetails.email ? (
                  <Text className="text-sm mt-1" style={{ color: colors.icon }}>
                    {customerDetails.email}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  // Render Customer Details for Admin
  const renderAdminCustomerDetails = () => {
    return (
      <View className="px-5 py-4">
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Customer Details
        </Text>
        
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>First Name</Text>
          <TextInput
            className="p-4 rounded-xl border text-base"
            style={{
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              color: colors.text,
            }}
            placeholder="Juan"
            placeholderTextColor={colors.icon}
            value={customerDetails.firstName}
            onChangeText={(text) => setCustomerDetails({...customerDetails, firstName: text})}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Last Name</Text>
          <TextInput
            className="p-4 rounded-xl border text-base"
            style={{
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              color: colors.text,
            }}
            placeholder="Dela Cruz"
            placeholderTextColor={colors.icon}
            value={customerDetails.lastName}
            onChangeText={(text) => setCustomerDetails({...customerDetails, lastName: text})}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Phone Number</Text>
          <TextInput
            className="p-4 rounded-xl border text-base"
            style={{
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              color: colors.text,
            }}
            placeholder="0912 345 6789"
            placeholderTextColor={colors.icon}
            keyboardType="phone-pad"
            value={customerDetails.phone}
            onChangeText={(text) => setCustomerDetails({...customerDetails, phone: text})}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Email (Optional)</Text>
          <TextInput
            className="p-4 rounded-xl border text-base"
            style={{
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              color: colors.text,
            }}
            placeholder="juan@example.com"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
            value={customerDetails.email}
            onChangeText={(text) => setCustomerDetails({...customerDetails, email: text})}
          />
        </View>
      </View>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    if (isAdmin && currentStep === 1) {
      return renderAdminCustomerDetails();
    }

    const actualStep = isAdmin ? currentStep - 1 : currentStep;

    switch (actualStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // Check if can proceed to next step
  const canProceed = () => {
    if (isAdmin && currentStep === 1) {
      return customerDetails.firstName.trim() !== '' && 
             customerDetails.lastName.trim() !== '' && 
             customerDetails.phone.trim() !== '';
    }

    const actualStep = isAdmin ? currentStep - 1 : currentStep;

    switch (actualStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedDuration !== '';
      case 3:
        return true; // Therapist selection is optional (can be "Any Therapist")
      case 4:
        return true; // Date and time are always selected, promo code is optional
      case 5:
        return true; // Summary step
      default:
        return false;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
        }}
      >
        {/* Header Row: Back Button, Title, Step Indicator */}
        <View
          className="flex-row items-center justify-between px-5 py-4"
        >
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Book Appointment
          </Text>
          {/* Step Indicator */}
          <View className="flex-row items-center">
            <Text className="text-sm font-medium" style={{ color: primaryColor }}>
              {currentStep}
            </Text>
            <Text className="text-sm font-medium" style={{ color: colors.icon }}>
              /{TOTAL_STEPS}
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="px-5 pb-3">
          <View
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: isDark ? '#3a3a3a' : '#E5E7EB' }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                backgroundColor: primaryColor,
              }}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        ref={mainScrollViewRef}
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ 
          paddingBottom: (currentStep === 2 || currentStep === 4) && keyboardHeight > 0 
            ? keyboardHeight + (80 + Math.max(insets.bottom, 16))
            : undefined
        }}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Footer */}
      <View
        className={`px-5 py-4 border-t ${(currentStep === 2 || currentStep === 4) && keyboardHeight > 0 ? 'absolute left-0 right-0' : ''}`}
        style={{
          borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB',
          paddingBottom: insets.bottom || 16,
          backgroundColor: 'white',
          ...((currentStep === 2 || currentStep === 4) && keyboardHeight > 0 ? {
            bottom: keyboardHeight,
          } : {}),
        }}
      >
        <TouchableOpacity
          className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
          style={{
            backgroundColor: canProceed() ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
          }}
          onPress={handleContinue}
          disabled={!canProceed()}
          activeOpacity={0.7}
        >
          <Text
            className="text-base font-semibold"
            style={{
              color: canProceed() ? 'white' : (isDark ? '#666' : '#999'),
            }}
          >
            {currentStep === TOTAL_STEPS ? 'Proceed to Payment' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
