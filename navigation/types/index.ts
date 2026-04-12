import type { Service } from '../../screens/native/Home/types/Home';
import type { SalonDetails, Therapist } from '../../screens/native/Home/types/SalonDetails';

export type TabId = 'home' | 'bookings' | 'messaging' | 'profile';

export type ProfileOverlayId =
    | 'edit'
    | 'password'
    | 'schedule'
    | 'notifications'
    | 'help'
    | 'staff'
    | 'business'
    | 'subscription'
    | 'ratings'
    | 'logs';

export interface BookingData {
    service: Service | null;
    duration: string;
    addOns: Array<{ id: string; name: string; price: number }>;
    therapist: Therapist | null;
    date: Date;
    time: Date;
    instructions: string;
    promoCode: string;
    salonDetails: SalonDetails;
    totalPrice: number;
}
