import type { Service } from '../../screens/native/Home/types/Home';
import type { SalonDetails, Therapist } from '../../screens/native/Home/types/SalonDetails';
import type { PaymentMutationResponse, UpdatePaymentRequest } from '../../api/types';

export type TabId = 'home' | 'bookings' | 'messaging' | 'profile';

export type ProfileOverlayId =
    | 'edit'
    | 'password'
    | 'schedule'
    | 'notifications'
    | 'help'
    | 'staff'
    | 'business'
    | 'services'
    | 'subscription'
    | 'ratings'
    | 'logs';

export interface BookingData {
    bookingId?: string | null;
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
    paymentId?: string | null;
    paymentMessage?: string;
    paymentRequest?: UpdatePaymentRequest;
    paymentResponse?: PaymentMutationResponse;
}
