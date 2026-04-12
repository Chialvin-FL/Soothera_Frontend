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
import { useMemo } from 'react';
import type { StaffAvailability } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

// Backend day strings → display label (for Recurring items)
const BACKEND_DAY_TO_LABEL: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

// Displayed labels → backend DayOfWeekEnum values (Recurring only)
const DAY_LABEL_TO_ENUM: Record<string, DayOfWeekEnum> = {
    Mon: DayOfWeekEnum.Monday,
    Tue: DayOfWeekEnum.Tuesday,
    Wed: DayOfWeekEnum.Wednesday,
    Thu: DayOfWeekEnum.Thursday,
    Fri: DayOfWeekEnum.Friday,
    Sat: DayOfWeekEnum.Saturday,
    Sun: DayOfWeekEnum.Sunday,
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIMES = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Convert "9:00 AM" → "09:00:00" (backend format)
function displayTimeToApi(display: string): string {
    const [timePart, period] = display.split(' ');
    const [hourStr, minStr] = timePart.split(':');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minStr}:00`;
}

/** Convert "09:00:00" → "9:00 AM" */
function apiTimeToDisplay(apiTime: string): string {
    if (!apiTime) return '';
    const [hourStr, minStr] = apiTime.split(':');
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minStr} ${period}`;
}

/** Convert a JS Date → "M-dd-yyyy" backend format */
function dateToApiFormat(date: Date): string {
    const m = date.getMonth() + 1;        // 1-indexed, no zero-pad
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}-${d}-${y}`;
}

/** Parse an "M-dd-yyyy" backend string → JS Date */
function parseApiDateString(dateStr: string): Date {
    const [m, d, y] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Map JS Date.getDay() (0 = Sun … 6 = Sat) → DayOfWeekEnum.
 * Used to populate daysOfWeek even for OneTime shifts.
 */
function dateToDayEnum(date: Date): DayOfWeekEnum {
    // JS: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    // Backend enum: Sunday=0,Monday=1 … Saturday=6 — same values ✓
    return date.getDay() as DayOfWeekEnum;
}

/** Format a Date for display: "Mon, Apr 15" */
function dateToDisplayLabel(date: Date): string {
    return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// ─────────────────────────────────────────────────────────────
// Local shift type (used before saving)
// ─────────────────────────────────────────────────────────────

interface LocalShift {
    /** Temp local ID (not a Firestore ID) */
    localId: string;
    /** The chosen date (JS Date) — used to derive specificDate for the API */
    date: Date;
    startTime: string; // display format like "9:00 AM"
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
        handleUpdate,
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
    ).sort((a, b) => {
        // Sort from soonest to latest date, then start time
        if (!a.specificDate || !b.specificDate) return 0;
        const aDate = parseApiDateString(a.specificDate);
        const bDate = parseApiDateString(b.specificDate);
        if (aDate.getTime() !== bDate.getTime()) {
            return aDate.getTime() - bDate.getTime();
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    const hasExistingRecurring = recurringItems.length > 0;
    const hasExistingShifting = shiftingItems.length > 0;

    // Load initial tab context
    useEffect(() => {
        if (!sliceLoading && scheduleItems.length > 0) {
            if (hasExistingShifting && !hasExistingRecurring && scheduleType !== 'shifting') {
                setScheduleType('shifting');
            }
        }
        // We only want to run this when loading is finished and data is loaded.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleItems.length, sliceLoading]);

    // ── Recurring UI state ───────────────────────────────────
    // Start empty — prefilled from server data if records exist
    const [recurringDays, setRecurringDays] = useState<string[]>([]);
    const [recurringStartTime, setRecurringStartTime] = useState('');
    const [recurringEndTime, setRecurringEndTime] = useState('');

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
    const [tempShiftStartTime, setTempShiftStartTime] = useState('9:00 AM');
    const [tempShiftEndTime, setTempShiftEndTime] = useState('5:00 PM');
    const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null);
    const [editShiftId, setEditShiftId] = useState<string | null>(null);

    // Date-picker state (mirrors RescheduleModal pattern)
    const todayDate = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);
    const [tempShiftDate, setTempShiftDate] = useState<Date>(todayDate);
    const [visibleMonth, setVisibleMonth] = useState<Date>(todayDate);

    // Dates from today to end-of-month (+ next 7 if near end)
    const shiftDateOptions = useMemo(() => {
        const dates: Date[] = [];
        const year = todayDate.getFullYear();
        const month = todayDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const remaining = lastDay - todayDate.getDate() + 1;
        for (let d = todayDate.getDate(); d <= lastDay; d++) dates.push(new Date(year, month, d));
        if (remaining <= 7) {
            const nm = month === 11 ? 0 : month + 1;
            const ny = month === 11 ? year + 1 : year;
            for (let d = 1; d <= 7; d++) dates.push(new Date(ny, nm, d));
        }
        return dates;
    }, [todayDate]);

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const dateScrollRef = useRef<ScrollView>(null);
    const shiftStartScrollRef = useRef<ScrollView>(null);
    const shiftEndScrollRef = useRef<ScrollView>(null);

    // Auto-scroll to today when modal opens
    useEffect(() => {
        if (showShiftModal) {
            // Reset date to today each time the modal opens
            setTempShiftDate(todayDate);
            setVisibleMonth(todayDate);
            setTimeout(() => {
                dateScrollRef.current?.scrollTo({ x: 0, animated: false });
                const sIndex = TIMES.indexOf(tempShiftStartTime);
                if (sIndex !== -1) shiftStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                const validEndTimes = TIMES.filter((t) => t !== tempShiftStartTime);
                const eIndex = validEndTimes.indexOf(tempShiftEndTime);
                if (eIndex !== -1) shiftEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
            }, 300);
        }
    }, [showShiftModal]);

    // ── Handlers ─────────────────────────────────────────────

    const handleCloseShiftModal = () => {
        setShowShiftModal(false);
        setEditShiftId(null);
    };

    /** Add a shift locally (when no existing server record yet) */
    const handleAddLocalShift = () => {
        const newShift: LocalShift = {
            localId: Date.now().toString(),
            date: new Date(tempShiftDate),
            startTime: tempShiftStartTime,
            endTime: tempShiftEndTime,
        };
        console.log('[ScheduleScreen] handleAddLocalShift:', JSON.stringify({
            ...newShift,
            specificDate: dateToApiFormat(newShift.date),
        }));
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
        if (!establishmentId) return;
        console.log('[ScheduleScreen] handleDeleteServerShift: id =', item.id);
        setDeletingShiftId(item.id);
        await handleDelete(item.id, establishmentId);
        setDeletingShiftId(null);
    };

    /** Open the modal pre-filled for an existing server shift */
    const handleEditServerShift = (item: StaffAvailability) => {
        setEditShiftId(item.id);
        if (item.specificDate) {
            const dateObj = parseApiDateString(item.specificDate);
            setTempShiftDate(dateObj);
            setVisibleMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
        }
        setTempShiftStartTime(apiTimeToDisplay(item.startTime));
        setTempShiftEndTime(apiTimeToDisplay(item.endTime));
        setShowShiftModal(true);
    };

    /** Save local shifts to the server as OneTime availability */
    const handleSaveLocalShifts = async () => {
        if (!establishmentId) {
            console.warn('[ScheduleScreen] handleSaveLocalShifts: no establishmentId.');
            return;
        }
        if (localShifts.length === 0) {
            console.warn('[ScheduleScreen] handleSaveLocalShifts: no local shifts to save.');
            return;
        }
        console.log('[ScheduleScreen] handleSaveLocalShifts: saving', localShifts.length, 'OneTime shifts...');

        for (const shift of localShifts) {
            await handlePost({
                establishmentId,
                availabilityType: AvailabilityType.OneTime,
                daysOfWeek: [dateToDayEnum(shift.date)],
                specificDate: dateToApiFormat(shift.date),
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
                                    {shiftingItems.map((shift) => {
                                        const isDeletingThis = isDeleting && deletingShiftId === shift.id;
                                        const shiftDate = shift.specificDate ? parseApiDateString(shift.specificDate) : todayDate;
                                        return (
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
                                                        {DAY_NAMES[shiftDate.getDay()]}
                                                    </Text>
                                                    <Text style={{ fontWeight: 'bold', color: primaryColor, fontSize: 11 }}>
                                                        {shiftDate.getDate()}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                                                        {dateToDisplayLabel(shiftDate)}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name="time-outline" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                                                        <Text style={{ fontSize: 13, color: colors.icon }}>
                                                            {apiTimeToDisplay(shift.startTime)} – {apiTimeToDisplay(shift.endTime)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                
                                                {/* Edit Server Shift Action */}
                                                <TouchableOpacity onPress={() => handleEditServerShift(shift)} style={{ padding: 8, marginRight: 8 }}>
                                                    <Ionicons name="create-outline" size={22} color={colors.icon} />
                                                </TouchableOpacity>
                                                
                                                {/* Delete Server Shift */}
                                                <TouchableOpacity
                                                    onPress={() => handleDeleteServerShift(shift)}
                                                    disabled={isDeletingThis}
                                                    style={{ padding: 8 }}
                                                >
                                                    {isDeletingThis ? (
                                                        <ActivityIndicator size="small" color="#EF4444" />
                                                    ) : (
                                                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
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
                                                    <Text style={{ fontWeight: 'bold', color: primaryColor, fontSize: 11 }}>
                                                        {DAY_NAMES[shift.date.getDay()]}
                                                    </Text>
                                                    <Text style={{ fontWeight: 'bold', color: primaryColor, fontSize: 11 }}>
                                                        {shift.date.getDate()}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                                                        {dateToDisplayLabel(shift.date)}
                                                    </Text>
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
                                onPress={() => {
                                    setTempShiftDate(todayDate);
                                    setVisibleMonth(todayDate);
                                    setTempShiftStartTime('9:00 AM');
                                    setTempShiftEndTime('5:00 PM');
                                    setEditShiftId(null);
                                    setShowShiftModal(true);
                                }}
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
            <Modal
                visible={showShiftModal}
                transparent 
                animationType="slide" 
                onRequestClose={handleCloseShiftModal}
                onShow={() => {
                    setTimeout(() => {
                        dateScrollRef.current?.scrollTo({ x: 0, animated: false });
                        const sIndex = TIMES.indexOf(tempShiftStartTime);
                        if (sIndex !== -1) shiftStartScrollRef.current?.scrollTo({ x: sIndex * 90, animated: true });
                        const validEndTimes = TIMES.filter((t) => t !== tempShiftStartTime);
                        const eIndex = validEndTimes.indexOf(tempShiftEndTime);
                        if (eIndex !== -1) shiftEndScrollRef.current?.scrollTo({ x: eIndex * 90, animated: true });
                    }, 300);
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: isDark ? '#1F1F1F' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
                            {editShiftId ? 'Edit Shift' : 'Add Shift'}
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>

                            {/* ── Date Section (RescheduleModal style) ── */}
                            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 10 }}>Select Date</Text>

                            {/* Month label — updates as user scrolls */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <Text style={{ color: colors.text, fontWeight: '500', fontSize: 14 }}>
                                    {MONTH_NAMES[visibleMonth.getMonth()]}, {visibleMonth.getFullYear()}
                                </Text>
                            </View>

                            {/* Horizontal date picker */}
                            <ScrollView
                                ref={dateScrollRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 4 }}
                                style={{ marginBottom: 20, flexGrow: 0 }}
                                onScroll={(e) => {
                                    const idx = Math.floor(e.nativeEvent.contentOffset.x / 70);
                                    if (idx >= 0 && idx < shiftDateOptions.length) {
                                        const d = shiftDateOptions[idx];
                                        if (d && d.getMonth() !== visibleMonth.getMonth()) {
                                            setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                                        }
                                    }
                                }}
                                scrollEventThrottle={16}
                            >
                                {shiftDateOptions.map((date, idx) => {
                                    const selected = isSameDay(date, tempShiftDate);
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => {
                                                setTempShiftDate(new Date(date));
                                                setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                                            }}
                                            style={{
                                                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                                                marginRight: 8, alignItems: 'center', justifyContent: 'center',
                                                minWidth: 58,
                                                borderWidth: 1,
                                                borderColor: selected ? primaryColor : (isDark ? '#3a3a3a' : '#E5E7EB'),
                                                backgroundColor: selected ? primaryColor : 'transparent',
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={{ fontSize: 11, fontWeight: '500', color: selected ? '#fff' : colors.text, marginBottom: 2 }}>
                                                {DAY_NAMES[date.getDay()]}
                                            </Text>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? '#fff' : colors.text }}>
                                                {date.getDate()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
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
                                    if (editShiftId) {
                                        if (!establishmentId) return;
                                        handleCloseShiftModal();
                                        await handleUpdate(editShiftId, establishmentId, {
                                            availabilityType: AvailabilityType.OneTime,
                                            dayOfWeek: dateToDayEnum(tempShiftDate),
                                            specificDate: dateToApiFormat(tempShiftDate),
                                            startTime: displayTimeToApi(tempShiftStartTime),
                                            endTime: displayTimeToApi(tempShiftEndTime),
                                            isAvailable: true,
                                        });
                                    } else if (showServerShifts) {
                                        // Has existing server shifts → POST directly to API as OneTime
                                        if (!establishmentId) return;
                                        handleCloseShiftModal();
                                        await handlePost({
                                            establishmentId,
                                            availabilityType: AvailabilityType.OneTime,
                                            daysOfWeek: [dateToDayEnum(tempShiftDate)],
                                            specificDate: dateToApiFormat(tempShiftDate),
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
                                    : <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                        {editShiftId ? 'Save Changes' : 'Add to Schedule'}
                                    </Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCloseShiftModal} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
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
