import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { SuccessModal } from '@/components/native/SuccessModal';
import { useScheduleSlice } from '../scheduleSlice';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import { AvailabilityType, DayOfWeekEnum } from '@/api/types';
import type { StaffAvailability } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Displayed labels → backend DayOfWeekEnum values
const DAY_LABEL_TO_ENUM: Record<string, DayOfWeekEnum> = {
    Mon: DayOfWeekEnum.Monday,
    Tue: DayOfWeekEnum.Tuesday,
    Wed: DayOfWeekEnum.Wednesday,
    Thu: DayOfWeekEnum.Thursday,
    Fri: DayOfWeekEnum.Friday,
    Sat: DayOfWeekEnum.Saturday,
    Sun: DayOfWeekEnum.Sunday,
};

// Backend day strings → display label
const BACKEND_DAY_TO_LABEL: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const TIMES = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
];

// Convert "9:00 AM" → "09:00:00" (backend format)
function displayTimeToApi(display: string): string {
    const [timePart, period] = display.split(' ');
    const [hourStr, minStr] = timePart.split(':');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minStr}:00`;
}

// Convert "09:00:00" → "9:00 AM"
function apiTimeToDisplay(apiTime: string): string {
    const [hourStr, minStr] = apiTime.split(':');
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minStr} ${period}`;
}

// ─────────────────────────────────────────────────────────────
// Local shift type (used before saving)
// ─────────────────────────────────────────────────────────────

interface LocalShift {
    /** Temp local ID (not a Firestore ID) */
    localId: string;
    day: string;      // display label like "Mon"
    startTime: string; // display like "9:00 AM"
    endTime: string;
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ScheduleScreenTherapistProps {
    onBack: () => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function ScheduleScreenTherapist({ onBack }: ScheduleScreenTherapistProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    // ── Establishment (read from session — set at login for therapists) ───
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [estLoading, setEstLoading] = useState(true);

    useEffect(() => {
        (async () => {
            console.log('[ScheduleScreen] loading establishmentId from stored session...');
            setEstLoading(true);
            const session = await loadStoredSession();
            const estId = session?.establishmentId ?? null;
            console.log('[ScheduleScreen] establishmentId from session =', estId);
            setEstablishmentId(estId);
            setEstLoading(false);
        })();
    }, []);

    // ── Slice ────────────────────────────────────────────────
    const {
        scheduleItems,
        isLoading: sliceLoading,
        isPosting,
        isDeleting,
        modal,
        closeModal,
        handlePost,
        handleDelete,
    } = useScheduleSlice(establishmentId);

    const isLoading = estLoading || sliceLoading;

    // ── Tab state ────────────────────────────────────────────
    const [scheduleType, setScheduleType] = useState<'recurring' | 'shifting'>('recurring');

    // ── Derived: split loaded records by type ────────────────
    const recurringItems = scheduleItems.filter(
        (s) => s.availabilityType === 'Recurring',
    );
    const shiftingItems = scheduleItems.filter(
        (s) => s.availabilityType === 'OneTime',
    );

    const hasExistingRecurring = recurringItems.length > 0;
    const hasExistingShifting = shiftingItems.length > 0;

    // ── Recurring UI state ───────────────────────────────────
    // Prefill from server data when it arrives
    const [recurringDays, setRecurringDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const [recurringStartTime, setRecurringStartTime] = useState('9:00 AM');
    const [recurringEndTime, setRecurringEndTime] = useState('5:00 PM');

    useEffect(() => {
        if (hasExistingRecurring) {
            const first = recurringItems[0];
            const days = recurringItems
                .map((r) => BACKEND_DAY_TO_LABEL[r.dayOfWeek ?? ''])
                .filter(Boolean);
            setRecurringDays(days.length > 0 ? days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
            setRecurringStartTime(apiTimeToDisplay(first.startTime));
            setRecurringEndTime(apiTimeToDisplay(first.endTime));
            console.log('[ScheduleScreen] prefilled recurring from server. days =', days);
        }
    // Only run when data first arrives (length change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recurringItems.length]);

    const recStartScrollRef = useRef<ScrollView>(null);
    const recEndScrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (scheduleType === 'recurring') {
            setTimeout(() => {
                const sIndex = TIMES.indexOf(recurringStartTime);
                if (sIndex !== -1) recStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter((t) => t !== recurringStartTime);
                const eIndex = validEndTimes.indexOf(recurringEndTime);
                if (eIndex !== -1) recEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [scheduleType, recurringStartTime, recurringEndTime]);

    // ── Shifting UI state ────────────────────────────────────
    // Local-only shifts (before first save / when no existing record)
    const [localShifts, setLocalShifts] = useState<LocalShift[]>([]);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [tempShiftDay, setTempShiftDay] = useState('Mon');
    const [tempShiftStartTime, setTempShiftStartTime] = useState('9:00 AM');
    const [tempShiftEndTime, setTempShiftEndTime] = useState('5:00 PM');
    const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null);

    const shiftStartScrollRef = useRef<ScrollView>(null);
    const shiftEndScrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (showShiftModal) {
            setTimeout(() => {
                const sIndex = TIMES.indexOf(tempShiftStartTime);
                if (sIndex !== -1) shiftStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter((t) => t !== tempShiftStartTime);
                const eIndex = validEndTimes.indexOf(tempShiftEndTime);
                if (eIndex !== -1) shiftEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [showShiftModal]);

    // ── Handlers ─────────────────────────────────────────────

    /** Add a shift locally (when no existing server record yet) */
    const handleAddLocalShift = () => {
        const newShift: LocalShift = {
            localId: Date.now().toString(),
            day: tempShiftDay,
            startTime: tempShiftStartTime,
            endTime: tempShiftEndTime,
        };
        console.log('[ScheduleScreen] handleAddLocalShift:', JSON.stringify(newShift));
        setLocalShifts((prev) => [...prev, newShift]);
        setShowShiftModal(false);
    };

    /** Remove a shift locally (when no existing server record yet) */
    const handleRemoveLocalShift = (localId: string) => {
        console.log('[ScheduleScreen] handleRemoveLocalShift: localId =', localId);
        setLocalShifts((prev) => prev.filter((s) => s.localId !== localId));
    };

    /** Delete an existing server-side shifting record */
    const handleDeleteServerShift = async (item: StaffAvailability) => {
        console.log('[ScheduleScreen] handleDeleteServerShift: id =', item.id);
        setDeletingShiftId(item.id);
        await handleDelete(item.id);
        setDeletingShiftId(null);
    };

    /** Save local shifts to the server */
    const handleSaveLocalShifts = async () => {
        if (!establishmentId) {
            console.warn('[ScheduleScreen] handleSaveLocalShifts: no establishmentId.');
            return;
        }
        if (localShifts.length === 0) {
            console.warn('[ScheduleScreen] handleSaveLocalShifts: no local shifts to save.');
            return;
        }
        console.log('[ScheduleScreen] handleSaveLocalShifts: saving', localShifts.length, 'shifts...');

        // Post shifts one by one (or batch by collapsing shared times)
        // Using OneTime type with a synthetic date is not supported by backend for "shifting recurring"
        // → We post each shift as Recurring with its specific DayOfWeekEnum
        for (const shift of localShifts) {
            const dayEnum = DAY_LABEL_TO_ENUM[shift.day];
            if (dayEnum === undefined) continue;
            await handlePost({
                establishmentId,
                availabilityType: AvailabilityType.Recurring,
                daysOfWeek: [dayEnum],
                startTime: displayTimeToApi(shift.startTime),
                endTime: displayTimeToApi(shift.endTime),
                isAvailable: true,
            });
        }
        setLocalShifts([]);
    };

    /** Save recurring schedule */
    const handleSaveRecurring = async () => {
        if (!establishmentId) {
            console.warn('[ScheduleScreen] handleSaveRecurring: no establishmentId.');
            return;
        }
        if (recurringDays.length === 0) {
            console.warn('[ScheduleScreen] handleSaveRecurring: no days selected.');
            return;
        }
        console.log('[ScheduleScreen] handleSaveRecurring: days =', recurringDays, '| start =', recurringStartTime, '| end =', recurringEndTime);
        await handlePost({
            establishmentId,
            availabilityType: AvailabilityType.Recurring,
            daysOfWeek: recurringDays.map((d) => DAY_LABEL_TO_ENUM[d]).filter((e) => e !== undefined),
            startTime: displayTimeToApi(recurringStartTime),
            endTime: displayTimeToApi(recurringEndTime),
            isAvailable: true,
        });
    };

    // ── No-Establishment Banner ──────────────────────────────

    if (!estLoading && !establishmentId) {
        return (
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <View
                    style={{
                        position: 'absolute', left: 0, right: 0, top: 0,
                        paddingTop: insets.top,
                        backgroundColor: colors.background,
                        borderBottomWidth: 1,
                        borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                        zIndex: 10,
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 20, paddingBottom: 14,
                    }}
                >
                    <TouchableOpacity
                        onPress={onBack}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>Schedule</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                    <View
                        style={{
                            padding: 20, borderRadius: 16, borderWidth: 1,
                            backgroundColor: isDark ? '#1a2233' : '#EFF6FF',
                            borderColor: isDark ? '#2a3a55' : '#BFDBFE',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name="business-outline" size={40} color={primaryColor} style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
                            No Establishment Found
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.icon, textAlign: 'center', lineHeight: 20 }}>
                            You need to be linked to a massage spa establishment before managing your schedule. Please contact your admin or set up your establishment first.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // ── Loading state ────────────────────────────────────────

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text className="mt-3 text-sm" style={{ color: colors.icon }}>Loading your schedule…</Text>
            </View>
        );
    }

    // ── Render ───────────────────────────────────────────────

    // Decide which shifting list to display
    const showServerShifts = hasExistingShifting;

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>

            {/* ── Header ── */}
            <View
                style={{
                    position: 'absolute', left: 0, right: 0, top: 0,
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                    borderBottomWidth: 1, borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                    zIndex: 10, flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 20, paddingBottom: 14,
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>Schedule</Text>
            </View>

            {/* ── Scrollable Content ── */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 60 + 20,
                    paddingBottom: insets.bottom + 140,
                    paddingHorizontal: 20,
                }}
            >
                <RisingItem delay={100}>

                    {/* ── Mode Banner ── */}
                    <View
                        style={{
                            marginBottom: 20, padding: 12, borderRadius: 12,
                            backgroundColor: isDark ? '#1a2233' : '#EFF6FF',
                            borderWidth: 1, borderColor: isDark ? '#2a3a55' : '#BFDBFE',
                            flexDirection: 'row', alignItems: 'center', gap: 8,
                        }}
                    >
                        <Ionicons
                            name={scheduleItems.length > 0 ? 'calendar-outline' : 'add-circle-outline'}
                            size={18}
                            color={primaryColor}
                        />
                        <Text style={{ fontSize: 13, color: primaryColor, flex: 1, fontWeight: '500' }}>
                            {scheduleItems.length > 0
                                ? 'Editing your existing schedule'
                                : 'No schedule yet — configure your availability below'}
                        </Text>
                    </View>

                    {/* ── Tab Switcher ── */}
                    <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6', borderRadius: 12, padding: 4 }}>
                        {(['recurring', 'shifting'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setScheduleType(tab)}
                                style={{
                                    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                                    backgroundColor: scheduleType === tab ? (isDark ? '#2a2a2a' : '#fff') : 'transparent',
                                    shadowColor: scheduleType === tab ? '#000' : 'transparent',
                                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
                                    elevation: scheduleType === tab ? 2 : 0,
                                }}
                            >
                                <Text style={{ fontWeight: '600', color: scheduleType === tab ? primaryColor : colors.icon }}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Description ── */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: colors.icon, fontSize: 14, lineHeight: 20 }}>
                            {scheduleType === 'recurring'
                                ? 'Set a consistent schedule that repeats on the specific days you select below.'
                                : 'Configure unique time slots for different days of the week manually.'}
                        </Text>
                    </View>

                    {/* ══════════════════════════════════════════════════════
                        RECURRING TAB
                    ══════════════════════════════════════════════════════ */}

                    {scheduleType === 'recurring' && (
                        <View>
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12, fontSize: 16 }}>
                                Selected Days
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                                {DAYS.map((day) => {
                                    const isSelected = recurringDays.includes(day);
                                    return (
                                        <TouchableOpacity
                                            key={`rec-day-${day}`}
                                            onPress={() => setRecurringDays((prev) =>
                                                isSelected
                                                    ? prev.filter((d) => d !== day)
                                                    : [...prev, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
                                            )}
                                            style={{
                                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                                                backgroundColor: isSelected ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'),
                                                flexDirection: 'row', alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: isSelected ? '#fff' : colors.text }}>{day}</Text>
                                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" style={{ marginLeft: 6 }} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12, fontSize: 16 }}>
                                Available Time
                            </Text>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8, fontSize: 14 }}>Start Time</Text>
                            <ScrollView ref={recStartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {TIMES.map((time) => (
                                    <TouchableOpacity
                                        key={`rec-start-${time}`}
                                        onPress={() => {
                                            const nextEnd = recurringEndTime === time ? (TIMES.find((t) => t !== time) || '5:00 PM') : recurringEndTime;
                                            setRecurringStartTime(time);
                                            setRecurringEndTime(nextEnd);
                                        }}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                            backgroundColor: recurringStartTime === time ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'),
                                        }}
                                    >
                                        <Text style={{ color: recurringStartTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8, fontSize: 14 }}>End Time</Text>
                            <ScrollView ref={recEndScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                                {TIMES.filter((t) => t !== recurringStartTime).map((time) => (
                                    <TouchableOpacity
                                        key={`rec-end-${time}`}
                                        onPress={() => setRecurringEndTime(time)}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                            backgroundColor: recurringEndTime === time ? primaryColor : (isDark ? '#1F1F1F' : '#F3F4F6'),
                                        }}
                                    >
                                        <Text style={{ color: recurringEndTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        SHIFTING TAB
                    ══════════════════════════════════════════════════════ */}

                    {scheduleType === 'shifting' && (
                        <View>
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 16, fontSize: 16 }}>
                                Your Shifts
                            </Text>

                            {/* Server-side shifts (existing records) */}
                            {showServerShifts ? (
                                <View style={{ gap: 12, marginBottom: 20 }}>
                                    {shiftingItems.map((shift) => (
                                        <View
                                            key={shift.id}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center',
                                                backgroundColor: isDark ? '#1F1F1F' : '#fff',
                                                padding: 16, borderRadius: 12,
                                                borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#E5E7EB',
                                            }}
                                        >
                                            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#2a2a2a' : '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                                <Text style={{ fontWeight: 'bold', color: primaryColor, fontSize: 11 }}>
                                                    {(BACKEND_DAY_TO_LABEL[shift.dayOfWeek ?? ''] ?? shift.dayOfWeek ?? '?').substring(0, 3)}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                                                    {BACKEND_DAY_TO_LABEL[shift.dayOfWeek ?? ''] ?? shift.dayOfWeek}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name="time-outline" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                                                    <Text style={{ fontSize: 13, color: colors.icon }}>
                                                        {apiTimeToDisplay(shift.startTime)} – {apiTimeToDisplay(shift.endTime)}
                                                    </Text>
                                                </View>
                                            </View>
                                            {/* DELETE → calls API immediately */}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteServerShift(shift)}
                                                disabled={isDeleting}
                                                style={{ padding: 8 }}
                                            >
                                                {deletingShiftId === shift.id ? (
                                                    <ActivityIndicator size="small" color="#EF4444" />
                                                ) : (
                                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                /* Local-only shifts (no server record yet) */
                                localShifts.length === 0 ? (
                                    <View style={{
                                        alignItems: 'center', paddingVertical: 40,
                                        backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
                                        borderRadius: 16, borderWidth: 1, borderStyle: 'dashed',
                                        borderColor: isDark ? '#2a2a2a' : '#E5E7EB', marginBottom: 20,
                                    }}>
                                        <Ionicons name="calendar-outline" size={48} color={colors.icon} style={{ marginBottom: 12, opacity: 0.5 }} />
                                        <Text style={{ color: colors.icon, fontSize: 14, textAlign: 'center' }}>
                                            No shifts added yet.{'\n'}Add your first shift below.
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ gap: 12, marginBottom: 20 }}>
                                        {localShifts.map((shift) => (
                                            <View
                                                key={shift.localId}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center',
                                                    backgroundColor: isDark ? '#1F1F1F' : '#fff',
                                                    padding: 16, borderRadius: 12,
                                                    borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#E5E7EB',
                                                }}
                                            >
                                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#2a2a2a' : '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                                    <Text style={{ fontWeight: 'bold', color: primaryColor }}>{shift.day}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{shift.day}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name="time-outline" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                                                        <Text style={{ fontSize: 13, color: colors.icon }}>{shift.startTime} – {shift.endTime}</Text>
                                                    </View>
                                                </View>
                                                {/* Local remove — no API call */}
                                                <TouchableOpacity onPress={() => handleRemoveLocalShift(shift.localId)} style={{ padding: 8 }}>
                                                    <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )
                            )}

                            {/* Add shift button */}
                            <TouchableOpacity
                                onPress={() => setShowShiftModal(true)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    paddingVertical: 14, borderRadius: 12,
                                    borderWidth: 1, borderStyle: 'dashed', borderColor: primaryColor,
                                    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF',
                                    marginBottom: 4,
                                }}
                            >
                                <Ionicons name="add" size={18} color={primaryColor} style={{ marginRight: 6 }} />
                                <Text style={{ color: primaryColor, fontWeight: '600' }}>Add New Day / Shift</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </RisingItem>
            </ScrollView>

            {/* ══════════════════════════════════════════════════════
                BOTTOM BUTTON BAR
                - Recurring:   always show Save/Update button
                - Shifting:    show "Save Shifts" only when there are
                               unsaved local shifts; hide if all server-side
            ══════════════════════════════════════════════════════ */}

            {(scheduleType === 'recurring' ||
                (scheduleType === 'shifting' && !showServerShifts && localShifts.length > 0)
            ) && (
                <View
                    style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0,
                        paddingHorizontal: 20, paddingTop: 16,
                        paddingBottom: Math.max(insets.bottom + 12, 24),
                        backgroundColor: colors.background,
                        borderTopWidth: 1, borderTopColor: isDark ? '#2a2a2a' : '#E5E7EB',
                    }}
                >
                    <TouchableOpacity
                        onPress={scheduleType === 'recurring' ? handleSaveRecurring : handleSaveLocalShifts}
                        disabled={isPosting}
                        style={{
                            backgroundColor: isPosting ? '#aaa' : primaryColor,
                            borderRadius: 100, paddingVertical: 16,
                            alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'row', gap: 8,
                        }}
                    >
                        {isPosting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons
                                    name={hasExistingRecurring && scheduleType === 'recurring' ? 'refresh-outline' : 'save-outline'}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                    {scheduleType === 'recurring'
                                        ? (hasExistingRecurring ? 'Update Schedule' : 'Save Schedule')
                                        : 'Save Shifts'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Add Shift Modal ── */}
            <Modal visible={showShiftModal} transparent animationType="slide" onRequestClose={() => setShowShiftModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Add Shift</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Select Day</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {DAYS.map((day) => (
                                    <TouchableOpacity
                                        key={`shift-day-${day}`}
                                        onPress={() => setTempShiftDay(day)}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                                            backgroundColor: tempShiftDay === day ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'),
                                            marginRight: 8,
                                        }}
                                    >
                                        <Text style={{ color: tempShiftDay === day ? '#fff' : colors.text }}>{day}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>Start Time</Text>
                            <ScrollView ref={shiftStartScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {TIMES.map((time) => (
                                    <TouchableOpacity
                                        key={`shift-start-${time}`}
                                        onPress={() => {
                                            const nextEnd = tempShiftEndTime === time ? (TIMES.find((t) => t !== time) || '5:00 PM') : tempShiftEndTime;
                                            setTempShiftStartTime(time);
                                            setTempShiftEndTime(nextEnd);
                                        }}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                            backgroundColor: tempShiftStartTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'),
                                        }}
                                    >
                                        <Text style={{ color: tempShiftStartTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 12 }}>End Time</Text>
                            <ScrollView ref={shiftEndScrollRef} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                                {TIMES.filter((t) => t !== tempShiftStartTime).map((time) => (
                                    <TouchableOpacity
                                        key={`shift-end-${time}`}
                                        onPress={() => setTempShiftEndTime(time)}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                            backgroundColor: tempShiftEndTime === time ? primaryColor : (isDark ? '#2a2a2a' : '#F3F4F6'),
                                        }}
                                    >
                                        <Text style={{ color: tempShiftEndTime === time ? '#fff' : colors.text }}>{time}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={async () => {
                                    if (showServerShifts) {
                                        // Has existing server shifts → POST directly to API
                                        if (!establishmentId) return;
                                        const dayEnum = DAY_LABEL_TO_ENUM[tempShiftDay];
                                        if (dayEnum === undefined) return;
                                        setShowShiftModal(false);
                                        await handlePost({
                                            establishmentId,
                                            availabilityType: AvailabilityType.Recurring,
                                            daysOfWeek: [dayEnum],
                                            startTime: displayTimeToApi(tempShiftStartTime),
                                            endTime: displayTimeToApi(tempShiftEndTime),
                                            isAvailable: true,
                                        });
                                    } else {
                                        // No server record yet → add to local list
                                        handleAddLocalShift();
                                    }
                                }}
                                disabled={isPosting}
                                style={{ backgroundColor: isPosting ? '#aaa' : primaryColor, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                            >
                                {isPosting
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Add to Schedule</Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowShiftModal(false)} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
                                <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Feedback Modal (SuccessModal) ── */}
            <SuccessModal
                visible={modal.visible}
                variant={modal.variant}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
            />
        </View>
    );
}
