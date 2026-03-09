import { Booking, BOOKING_STATUS } from '../types/Booking';

// Re-export types for convenience
export type { Booking, BookingStatus } from '../types/Booking';
export { getStatusText } from '../types/Booking';

// All bookings merged into one array
export const allBookings: Booking[] = [
  {
    id: '1',
    serviceName: 'Aromatherapy Massage',
    spaName: 'Tranquil Touch',
    customerName: 'Sarah Jenkins',
    customerImage: require('../../../../assets/user.jpg'),
    status: BOOKING_STATUS.CONFIRMED, // 0
    date: '01/20/2026',
    time: '10:00 AM - 11:00 AM',
    price: 150.00,
  },
  {
    id: '2',
    serviceName: 'Deep Tissue Therapy',
    spaName: 'Style Studio',
    customerName: 'Michael Chen',
    customerImage: require('../../../../assets/user.jpg'),
    status: BOOKING_STATUS.PENDING, // 1
    date: '01/25/2026',
    time: '02:00 PM - 03:30 PM',
    price: 180.00,
  },
  {
    id: '3',
    serviceName: 'Hot Stone Massage',
    spaName: 'Serenity Spa',
    customerName: 'Emma Watson',
    customerImage: require('../../../../assets/user.jpg'),
    status: BOOKING_STATUS.COMPLETED, // 2
    date: '04/21/2024',
    time: '03:00 PM - 04:00 PM',
    price: 120.00,
  },
  {
    id: '4',
    serviceName: 'Swedish Massage',
    spaName: 'Salon Elite',
    customerName: 'James Wilson',
    customerImage: require('../../../../assets/user.jpg'),
    status: BOOKING_STATUS.CANCELLED, // 3
    date: '03/12/2024',
    time: '11:30 AM - 12:30 PM',
    price: 95.00,
  },
];

// Helper functions to filter bookings by status
export const getUpcomingBookings = (bookings: Booking[]): Booking[] => {
  return bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING);
};

export const getCompletedBookings = (bookings: Booking[]): Booking[] => {
  return bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED);
};

export const getCancelledBookings = (bookings: Booking[]): Booking[] => {
  return bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);
};
