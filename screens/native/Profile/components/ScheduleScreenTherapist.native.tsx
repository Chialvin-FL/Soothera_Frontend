import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { SuccessModal } from '@/components/native/SuccessModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

interface Shift {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
}

interface ScheduleScreenTherapistProps {
    onBack: () => void;
}

export default function ScheduleScreenTherapist({ onBack }: ScheduleScreenTherapistProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const [scheduleType, setScheduleType] = useState<'recurring' | 'shifting'>('recurring');

    // --- Recurring State ---
    const [recurringDays, setRecurringDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [recurringStartTime, setRecurringStartTime] = useState<string>('9:00 AM');
    const [recurringEndTime, setRecurringEndTime] = useState<string>('5:00 PM');

    // --- Shifting State ---
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [tempShiftDay, setTempShiftDay] = useState<string>('Mon');
    const [tempShiftStartTime, setTempShiftStartTime] = useState<string>('9:00 AM');
    const [tempShiftEndTime, setTempShiftEndTime] = useState<string>('5:00 PM');

    const recStartScrollRef = useRef<ScrollView>(null);
    const recEndScrollRef = useRef<ScrollView>(null);
    const shiftStartScrollRef = useRef<ScrollView>(null);
    const shiftEndScrollRef = useRef<ScrollView>(null);

    // Effect for Recurring pre-slide
    useEffect(() => {
        if (scheduleType === 'recurring') {
            setTimeout(() => {
                const sIndex = TIMES.indexOf(recurringStartTime);
                if (sIndex !== -1) recStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter(t => t !== recurringStartTime);
                const eIndex = validEndTimes.indexOf(recurringEndTime);
                if (eIndex !== -1) recEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [scheduleType]);

    // Effect for Shifting Modal pre-slide
    useEffect(() => {
        if (showShiftModal) {
            setTimeout(() => {
                const sIndex = TIMES.indexOf(tempShiftStartTime);
                if (sIndex !== -1) shiftStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter(t => t !== tempShiftStartTime);
                const eIndex = validEndTimes.indexOf(tempShiftEndTime);
                if (eIndex !== -1) shiftEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [showShiftModal]);

    const [feedbackModal, setFeedbackModal] = useState<{
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

    const showFeedback = (variant: 'success' | 'error', title: string, message: string) => {
        setFeedbackModal({ visible: true, variant, title, message });
    };

    const hideFeedback = () => setFeedbackModal((prev) => ({ ...prev, visible: false }));

    const handleAddShift = () => {
        const newShift: Shift = {
            id: Date.now().toString(),
            day: tempShiftDay,
            startTime: tempShiftStartTime,
            endTime: tempShiftEndTime,
        };
        setShifts(prev => [...prev, newShift]);
        setShowShiftModal(false);
    };

    const handleRemoveShift = (id: string) => {
        setShifts(prev => prev.filter(s => s.id !== id));
    };

    const handleSave = () => {
        // Here you would typically dispatch an API call
        if (scheduleType === 'recurring' && recurringDays.length === 0) {
            showFeedback('error', 'Missing Data', 'Please select at least one day for your recurring schedule.');
            return;
        }
        if (scheduleType === 'shifting' && shifts.length === 0) {
            showFeedback('error', 'Missing Data', 'Please add at least one shift to your schedule.');
            return;
        }

        showFeedback('success', 'Schedule Saved', 'Your schedule has been successfully updated.');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* ── Header ── */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                    zIndex: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingBottom: 14,
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>
                    Schedule
                </Text>
            </View>

            {/* ── Scrollable Content ── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 60 + 20,
                    paddingBottom: insets.bottom + 120,
                    paddingHorizontal: 20,
                }}
            >
                <RisingItem delay={100}>
                    {/* Schedule Type Selection */}
                    <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6', borderRadius: 12, padding: 4 }}>
                        <TouchableOpacity
                            onPress={() => setScheduleType('recurring')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor: scheduleType === 'recurring' ? (isDark ? '#2a2a2a' : '#fff') : 'transparent',
                                shadowColor: scheduleType === 'recurring' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: scheduleType === 'recurring' ? 2 : 0,
                            }}
                        >
                            <Text style={{ fontWeight: '600', color: scheduleType === 'recurring' ? primaryColor : colors.icon }}>Recurring</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setScheduleType('shifting')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor: scheduleType === 'shifting' ? (isDark ? '#2a2a2a' : '#fff') : 'transparent',
                                shadowColor: scheduleType === 'shifting' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: scheduleType === 'shifting' ? 2 : 0,
                            }}
                        >
                            <Text style={{ fontWeight: '600', color: scheduleType === 'shifting' ? primaryColor : colors.icon }}>Shifting</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: colors.icon, fontSize: 14, lineHeight: 20 }}>
                            {scheduleType === 'recurring' 
                                ? 'Set a consistent schedule that repeats on the specific days you select below.' 
                                : 'Configure unique time slots for different days of the week manually.'}
                        </Text>
                    </View>

                    {scheduleType === 'recurring' ? (
                        /* --- Recurring Form --- */
                        <View>
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12, fontSize: 16 }}>Selected Days</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                                {DAYS.map(day => {
                                    const isSelected = recurringDays.includes(day);
                                    return (
                                        <TouchableOpacity
                                            key={`rec-day-${day}`}
                                            onPress={() => {
                                                setRecurringDays(prev => 
                                                    isSelected
                                                        ? prev.filter(d => d !== day)
                                                        : [...prev, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
                                                )
                                            }}
                                            style={{
                                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                                                backgroundColor: isSelected ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'),
                                                flexDirection: 'row', alignItems: 'center'
                                            }}>
                                            <Text style={{ color: isSelected ? '#fff' : colors.text }}>{day}</Text>
                                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" style={{ marginLeft: 6 }} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12, fontSize: 16 }}>Available Time</Text>
                            
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8, fontSize: 14 }}>Start Time</Text>
                            <ScrollView ref={recStartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {TIMES.map(time => (
                                    <TouchableOpacity 
                                        key={`rec-start-${time}`} 
                                        onPress={() => {
                                            const nextEnd = recurringEndTime === time ? (TIMES.find(t => t !== time) || '5:00 PM') : recurringEndTime;
                                            setRecurringStartTime(time);
                                            setRecurringEndTime(nextEnd);
                                        }} 
                                        style={{ 
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                            backgroundColor: recurringStartTime === time ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'), 
                                            marginRight: 8 
                                        }}>
                                        <Text style={{ color: recurringStartTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8, fontSize: 14 }}>End Time</Text>
                            <ScrollView ref={recEndScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                                {TIMES.filter(t => t !== recurringStartTime).map(time => (
                                    <TouchableOpacity 
                                        key={`rec-end-${time}`} 
                                        onPress={() => setRecurringEndTime(time)} 
                                        style={{ 
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                            backgroundColor: recurringEndTime === time ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'), 
                                            marginRight: 8 
                                        }}>
                                        <Text style={{ color: recurringEndTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        /* --- Shifting Form --- */
                        <View>
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 16, fontSize: 16 }}>Your Shifts</Text>
                            
                            {shifts.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: isDark ? '#2a2a2a' : '#E5E7EB', marginBottom: 20 }}>
                                    <Ionicons name="calendar-outline" size={48} color={colors.icon} style={{ marginBottom: 12, opacity: 0.5 }} />
                                    <Text style={{ color: colors.icon, fontSize: 14, textAlign: 'center' }}>No shifts added yet.{'\n'}Add your first shift below.</Text>
                                </View>
                            ) : (
                                <View style={{ gap: 12, marginBottom: 20 }}>
                                    {shifts.map(shift => (
                                        <View key={shift.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1F1F1F' : '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#E5E7EB' }}>
                                            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#2a2a2a' : '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                                <Text style={{ fontWeight: 'bold', color: primaryColor }}>{shift.day.substring(0, 3)}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{shift.day}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name="time-outline" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                                                    <Text style={{ fontSize: 13, color: colors.icon }}>{shift.startTime} - {shift.endTime}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveShift(shift.id)} style={{ padding: 8 }}>
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            
                            <TouchableOpacity
                                onPress={() => setShowShiftModal(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    borderColor: primaryColor,
                                    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF',
                                }}
                            >
                                <Ionicons name="add" size={18} color={primaryColor} style={{ marginRight: 6 }} />
                                <Text style={{ color: primaryColor, fontWeight: '600' }}>Add New Day / Shift</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </RisingItem>
            </ScrollView>

            {/* ── Save Button ── */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom + 12, 24),
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#2a2a2a' : '#E5E7EB',
                }}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    style={{
                        backgroundColor: primaryColor,
                        borderRadius: 100,
                        paddingVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                    }}
                >
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                        Save Schedule
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Add Shift Modal ── */}
            <Modal visible={showShiftModal} transparent animationType="slide" onRequestClose={() => setShowShiftModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Add Shift</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Select Day</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {DAYS.map(day => (
                                    <TouchableOpacity 
                                        key={`shift-day-${day}`} 
                                        onPress={() => setTempShiftDay(day)} 
                                        style={{ 
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                            backgroundColor: tempShiftDay === day ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'), 
                                            marginRight: 8 
                                        }}>
                                        <Text style={{ color: tempShiftDay === day ? '#fff' : colors.text }}>{day}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Start Time</Text>
                            <ScrollView ref={shiftStartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {TIMES.map(time => (
                                    <TouchableOpacity 
                                        key={`shift-start-${time}`} 
                                        onPress={() => {
                                            const nextEnd = tempShiftEndTime === time ? (TIMES.find(t => t !== time) || '5:00 PM') : tempShiftEndTime;
                                            setTempShiftStartTime(time);
                                            setTempShiftEndTime(nextEnd);
                                        }} 
                                        style={{ 
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                            backgroundColor: tempShiftStartTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'), 
                                            marginRight: 8 
                                        }}>
                                        <Text style={{ color: tempShiftStartTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>End Time</Text>
                            <ScrollView ref={shiftEndScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                                {TIMES.filter(t => t !== tempShiftStartTime).map(time => (
                                    <TouchableOpacity 
                                        key={`shift-end-${time}`} 
                                        onPress={() => setTempShiftEndTime(time)} 
                                        style={{ 
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                            backgroundColor: tempShiftEndTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'), 
                                            marginRight: 8 
                                        }}>
                                        <Text style={{ color: tempShiftEndTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={handleAddShift}
                                style={{ backgroundColor: primaryColor, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add to Schedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowShiftModal(false)} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
                                <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Feedback Modal (Success / Error) ── */}
            <SuccessModal
                visible={feedbackModal.visible}
                variant={feedbackModal.variant}
                title={feedbackModal.title}
                message={feedbackModal.message}
                onClose={hideFeedback}
            />
        </View>
    );
}

const styles = StyleSheet.create({});
