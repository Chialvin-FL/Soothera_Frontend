import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SuccessModal from '../../../../components/native/SuccessModal';

export interface RescheduleModalProps {
  visible: boolean;
  initialDate?: Date;
  initialTime?: Date;
  onConfirm: (date: Date, time: Date) => void | Promise<boolean | void>;
  onCancel: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  initialDate,
  initialTime,
  onConfirm,
  onCancel,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // State for success/failure modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalVariant, setSuccessModalVariant] = useState<'success' | 'error'>('success');
  const [successModalTitle, setSuccessModalTitle] = useState('Booking Rescheduled!');
  const [successModalMessage, setSuccessModalMessage] = useState(
    "Your booking has been successfully rescheduled. Please wait for the confirmation email."
  );
  const [successModalActionLabel, setSuccessModalActionLabel] = useState<string | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize with current date/time or provided values
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<Date>(
    initialTime || new Date()
  );

  // Refs for ScrollViews to enable auto-scroll
  const timeScrollViewRef = useRef<ScrollView>(null);
  const dateScrollViewRef = useRef<ScrollView>(null);

  // Update state when initial values change or modal visibility changes
  useEffect(() => {
    if (visible) {
      if (initialDate) {
        setSelectedDate(new Date(initialDate));
      } else {
        setSelectedDate(new Date());
      }
      if (initialTime) {
        setSelectedTime(new Date(initialTime));
      } else {
        setSelectedTime(new Date());
      }
      
      // Round initial time to nearest 15-minute interval
      if (initialTime) {
        const roundedTime = roundToNearest15Minutes(new Date(initialTime));
        setSelectedTime(roundedTime);
      } else {
        setSelectedTime(roundToNearest15Minutes(new Date()));
      }
    }
  }, [initialDate, initialTime, visible]);

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

  // Generate time slots with 15-minute intervals (8:00 AM to 8:00 PM)
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const startHour = 8; // 8:00 AM
    const endHour = 20; // 8:00 PM (20:00)
    
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip if it's past the end time
        if (hour === endHour && minute > 0) break;
        
        const slot = new Date(baseDate);
        slot.setHours(hour, minute, 0, 0);
        slots.push(slot);
      }
    }
    
    return slots;
  }, [selectedDate]);

  // Calculate the index of the selected time slot
  const selectedTimeIndex = useMemo(() => {
    return timeSlots.findIndex(slot => 
      selectedTime.getHours() === slot.getHours() &&
      selectedTime.getMinutes() === slot.getMinutes()
    );
  }, [timeSlots, selectedTime]);

  // Auto-scroll to selected time when modal opens or selected time changes
  useEffect(() => {
    if (visible && selectedTimeIndex >= 0 && timeScrollViewRef.current) {
      // Wait for layout to complete before scrolling
      setTimeout(() => {
        // Calculate approximate position (each button is ~70px wide with margins)
        const buttonWidth = 70; // Approximate width of time button
        const scrollPosition = Math.max(0, (selectedTimeIndex * buttonWidth) - 20); // 20px offset from start
        timeScrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 100);
    }
  }, [visible, selectedTimeIndex]);

  // Format day name abbreviation
  const getDayName = (date: Date): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Check if a time slot is selected
  const isTimeSlotSelected = (slot: Date): boolean => {
    return (
      selectedTime.getHours() === slot.getHours() &&
      selectedTime.getMinutes() === slot.getMinutes()
    );
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: Date) => {
    setSelectedTime(new Date(slot));
  };

  // Calendar helper functions
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };


  // Get today's date
  const todayDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  // State for tracking the visible month based on scroll position
  const [visibleMonth, setVisibleMonth] = useState<Date>(todayDate);

  // Generate dates starting from today until the end of the current month
  // If within last 7 days, also include first 7 days of next month
  const monthDates = useMemo(() => {
    const dates: Date[] = [];
    const start = new Date(todayDate);
    const year = start.getFullYear();
    const month = start.getMonth();
    
    // Calculate the last day of the current month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = start.getDate();
    
    // Check if we're within the last 7 days of the month
    const daysRemainingInMonth = lastDayOfMonth - currentDay + 1;
    const shouldIncludeNextMonth = daysRemainingInMonth <= 7;
    
    // Generate dates from today until the end of the month
    for (let day = currentDay; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(date);
    }
    
    // If within last 7 days, add first 7 days of next month
    if (shouldIncludeNextMonth) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= 7; day++) {
        const date = new Date(nextYear, nextMonth, day);
        dates.push(date);
      }
    }
    
    return dates;
  }, [todayDate]);

  // Calculate the index of the selected date in monthDates
  const selectedDateIndex = useMemo(() => {
    return monthDates.findIndex(date => isSameDay(date, selectedDate));
  }, [monthDates, selectedDate]);

  // Auto-scroll to selected date when modal opens or selected date changes
  useEffect(() => {
    if (visible && selectedDateIndex >= 0 && dateScrollViewRef.current) {
      // Wait for layout to complete before scrolling
      setTimeout(() => {
        // Calculate approximate position (each button is ~70px wide with margins)
        const buttonWidth = 70; // Approximate width of date button
        const scrollPosition = Math.max(0, (selectedDateIndex * buttonWidth) - 20); // 20px offset from start
        dateScrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 100);
    }
  }, [visible, selectedDateIndex]);

  // Handle scroll to update visible month
  const handleDateScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const buttonWidth = 70; // Approximate width of date button
    const visibleIndex = Math.floor(scrollX / buttonWidth);
    
    if (visibleIndex >= 0 && visibleIndex < monthDates.length) {
      const visibleDate = monthDates[visibleIndex];
      if (visibleDate && visibleDate.getMonth() !== visibleMonth.getMonth()) {
        setVisibleMonth(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
      }
    }
  };

  // Update visibleMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  // Handle confirm
  const handleConfirm = async () => {
    if (isConfirming) return;

    setIsConfirming(true);
    let success: boolean | void;
    try {
      success = await onConfirm(selectedDate, selectedTime);
    } finally {
      setIsConfirming(false);
    }
    if (success === false) return;

    setSuccessModalVariant('success');
    setSuccessModalTitle('Booking Rescheduled!');
    setSuccessModalMessage("Your booking has been successfully rescheduled. Please wait for the confirmation email.");
    setSuccessModalActionLabel('Continue');
    setShowSuccessModal(true);
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessModalActionLabel(undefined);
  };

  // Handle success modal action
  const handleSuccessModalAction = () => {
    handleSuccessModalClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View className="flex-1 bg-black/50 justify-center items-center p-5">
            <TouchableWithoutFeedback>
              <View
                className={`rounded-2xl p-6 w-full max-w-sm ${
                  isDark ? 'bg-[#1f1f1f]' : 'bg-white'
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
              {/* Icon */}
              <View className="items-center mb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Ionicons name="calendar-outline" size={32} color={primaryColor} />
                </View>
              </View>

              {/* Title */}
              <Text
                className="text-xl font-semibold mb-6 text-center"
                style={{ color: colors.text }}
              >
                Re-schedule Booking
              </Text>

              {/* Date Section */}
              <View className="mb-6">
                <Text
                  className="text-sm font-semibold mb-3"
                  style={{ color: colors.text }}
                >
                  Date
                </Text>
                
                {/* Month Display */}
                <View className="flex-row items-center justify-center mb-3">
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.text }}
                  >
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
                  style={{ flexGrow: 0 }}
                  onScroll={handleDateScroll}
                  scrollEventThrottle={16}
                >
                  {monthDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);

                    return (
                      <TouchableOpacity
                        key={index}
                        className="px-4 py-3 rounded-full border mr-2 items-center justify-center"
                        style={{
                          borderColor: isSelected ? colors.primary : (isDark ? '#3a3a3a' : '#E5E7EB'),
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                          minWidth: 60,
                        }}
                        onPress={() => {
                          setSelectedDate(new Date(date));
                        }}
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
              <View className="mb-6">
                <Text
                  className="text-sm font-semibold mb-3"
                  style={{ color: colors.text }}
                >
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
                          borderColor: isSelected ? colors.primary : (isDark ? '#3a3a3a' : '#E5E7EB'),
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        }}
                        onPress={() => handleTimeSlotSelect(slot)}
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

              {/* Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 border rounded-xl py-3.5 ${
                    isDark ? 'border-[#3a3a3a]' : 'border-gray-300'
                  }`}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text
                    className="font-semibold text-center"
                    style={{ color: colors.text }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-xl py-3.5"
                  style={{ backgroundColor: primaryColor }}
                  onPress={handleConfirm}
                  disabled={isConfirming}
                  activeOpacity={0.7}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-center">
                      Confirm
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Success Modal */}
    <SuccessModal
      visible={showSuccessModal}
      title={successModalTitle}
      message={successModalMessage}
      variant={successModalVariant}
      actionLabel={successModalActionLabel}
      onClose={handleSuccessModalClose}
      onAction={handleSuccessModalAction}
    />
    </>
  );
};

export default RescheduleModal;
