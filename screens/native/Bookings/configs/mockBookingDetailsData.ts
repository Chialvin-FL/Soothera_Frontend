import { BookingDetails } from '../types/BookingDetails';
import { BOOKING_STATUS } from '../types/Booking';

// Mock booking details data
// This extends the basic booking data with additional details needed for the details screen
export const bookingDetailsMap: Record<string, BookingDetails> = {
  '1': {
    id: '1',
    serviceName: 'Aromatherapy Massage',
    spaName: 'Tranquil Touch',
    status: BOOKING_STATUS.CONFIRMED,
    date: '01/20/2026',
    time: '10:00 AM - 11:00 AM',
    price: 150.00,
    spaImage: require('../../../../assets/salon.jpg'),
    spaRating: 4.8,
    spaDetails: 'Tranquil Touch specializes in traditional Filipino healing therapies. Our expert practitioners offer authentic Hilot, Dagdagay, and Bentosa treatments passed down through generations. Experience the healing power of traditional medicine in a modern, comfortable setting at SM City, Cebu.',
    address: '987 SM City Cebu, North Reclamation Area, Cebu City 6000',
    latitude: 10.3150,
    longitude: 123.8850,
    therapistName: 'Maria Santos',
    therapistTitle: 'Certified Massage Therapist',
    bookingId: '00000000-0000-0000-0000-000000000001',
    establishmentId: 'e1111111-1111-1111-1111-111111111111',
    staffId: 's1111111-1111-1111-1111-111111111111',
    customerId: 'c1111111-1111-1111-1111-111111111111',
    paidAmount: 75.00, // 50% of 150.00
  },
  '2': {
    id: '2',
    serviceName: 'Deep Tissue Therapy',
    spaName: 'Style Studio',
    status: BOOKING_STATUS.PENDING,
    date: '01/25/2026',
    time: '02:00 PM - 03:30 PM',
    price: 180.00,
    spaImage: require('../../../../assets/salon.jpg'),
    spaRating: 4.7,
    spaDetails: 'Style Studio brings contemporary spa experiences to Mandaue City. We blend traditional Dagdagay foot therapy with modern combination massages, creating unique treatment protocols tailored to your needs. Our innovative approach has made us a favorite among wellness enthusiasts.',
    address: '456 Mandaue Avenue, Mandaue City 6014',
    latitude: 10.3333,
    longitude: 123.9333,
    therapistName: 'John Dela Cruz',
    therapistTitle: 'Certified Massage Therapist',
    bookingId: '00000000-0000-0000-0000-000000000002',
    establishmentId: 'e2222222-2222-2222-2222-222222222222',
    staffId: 's2222222-2222-2222-2222-222222222222',
    customerId: 'c2222222-2222-2222-2222-222222222222',
    paidAmount: 90.00, // 50% of 180.00
  },
  '3': {
    id: '3',
    serviceName: 'Hot Stone Massage',
    spaName: 'Serenity Spa',
    status: BOOKING_STATUS.COMPLETED,
    date: '04/21/2024',
    time: '03:00 PM - 04:00 PM',
    price: 120.00,
    spaImage: require('../../../../assets/salon.jpg'),
    spaRating: 4.9,
    spaDetails: 'Serenity Spa at IT Park offers a peaceful escape from the urban hustle. Our signature hot stone massages and aromatherapy sessions are designed to melt away stress and tension. With convenient location and flexible hours, we make wellness accessible to busy professionals.',
    address: '321 IT Park Boulevard, Cebu City 6000',
    latitude: 10.3200,
    longitude: 123.9100,
    therapistName: 'Anna Garcia',
    therapistTitle: 'Certified Massage Therapist',
    bookingId: '00000000-0000-0000-0000-000000000003',
    establishmentId: 'e3333333-3333-3333-3333-333333333333',
    staffId: 's3333333-3333-3333-3333-333333333333',
    customerId: 'c3333333-3333-3333-3333-333333333333',
    paidAmount: 60.00, // 50% of 120.00
  },
  '4': {
    id: '4',
    serviceName: 'Swedish Massage',
    spaName: 'Salon Elite',
    status: BOOKING_STATUS.CANCELLED,
    date: '03/12/2024',
    time: '11:30 AM - 12:30 PM',
    price: 95.00,
    spaImage: require('../../../../assets/salon.jpg'),
    spaRating: 4.8,
    spaDetails: 'Salon Elite is a luxury wellness destination specializing in premium massage therapies. Our award-winning therapists combine traditional techniques with modern innovations to deliver unparalleled relaxation experiences. With over a decade of excellence, we\'ve perfected the art of therapeutic massage in Talamban, Cebu.',
    address: '8502 Preston Rd. Inglewood, Maine 98380',
    latitude: 10.3500,
    longitude: 123.9167,
    therapistName: 'Robert Tan',
    therapistTitle: 'Certified Massage Therapist',
    bookingId: '00000000-0000-0000-0000-000000000004',
    establishmentId: 'e4444444-4444-4444-4444-444444444444',
    staffId: 's4444444-4444-4444-4444-444444444444',
    customerId: 'c4444444-4444-4444-4444-444444444444',
    paidAmount: 47.50, // 50% of 95.00
  },
};

// Helper function to get booking details by ID
export function getBookingDetails(bookingId: string): BookingDetails | undefined {
  return bookingDetailsMap[bookingId];
}
